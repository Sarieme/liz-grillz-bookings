# Statutory Data Retention Matrix & Legal Compliance Architecture

## 1. Statutory Context & Regulatory Framework
This retention matrix governs the data lifecycle of **Liz's Grillz Bookings**, establishing legally enforceable data retention, anonymization, and erasure protocols under the following statutory frameworks:
1. **Nigerian Data Protection Act (NDPA) 2023**: Section 34 (Right to Erasure / Right to be Forgotten) and Section 24 (Principles of Personal Data Processing, including Data Minimisation and Storage Limitation).
2. **Federal Inland Revenue Service (FIRS) Establishment Act & Companies Income Tax Act (CITA)**: Statutory requirement to maintain verifiable commercial and tax accounting books for a minimum of 6 years.
3. **Lagos State Internal Revenue Service (LIRS) Personal Income Tax Law**: Mandatory 6-year retention of event catering receipts and withholding tax documentation.
4. **Money Laundering (Prevention and Prohibition) Act 2022**: Mandatory 5-year retention of high-value commercial monetary transaction records.

---

## 2. Table-by-Table Retention Matrix

| Schema Model | Column / Attribute | Retention Classification | Retention Duration | Regulatory / Business Basis | Technical Action on Expiration / Erasure Request |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`User`** | `id` | Retained (Pseudonymized) | Indefinite | Relational integrity for immutable financial ledgers | Preserved as primary key foreign reference |
| **`User`** | `fullName` | Purged / Anonymized | 7-day grace period | NDPA Section 34 Right to Erasure | Overwritten with `Anonymized Customer [NDPA-REQ-id]` |
| **`User`** | `email` | Purged / Anonymized | 7-day grace period | NDPA Section 34 Right to Erasure | Overwritten with `anonymized.<id>@deleted.lizsgrillz.ng` |
| **`User`** | `phone` | Purged / Anonymized | 7-day grace period | NDPA Section 34 Right to Erasure | Overwritten with `+2340000000000` |
| **`User`** | `passwordHash` | Purged immediately | Immediate on request | Security & Account Termination | Overwritten with `DELETED_ACCOUNT_CREDENTIAL_VOID` |
| **`User`** | `organizationType` | Retained (Categorical) | Indefinite | Aggregate business analytics | Retained as generic demographic category |
| **`User`** | `role`, `status` | Retained | Indefinite | System security audit trail | Set to `DELETED` |
| **`Session`** | `id`, `token`, `ipAddress`, `userAgent` | Purged immediately | 7 days TTL or immediate on deletion | NDPA Storage Limitation | Hard deleted in single database transaction |
| **`Booking`** | `id` | Retained permanently | Minimum 6 years | FIRS / CITA Section 63 Accounting Mandate | Retained in PostgreSQL |
| **`Booking`** | `userId` | Retained (Nullable) | Minimum 6 years | Relational audit reference | Preserved or set null |
| **`Booking`** | `clientName`, `phone` | Anonymized on request | 6 years tax retention | Balance of statutory conflict (see Section 4) | Anonymized after event completion and tax audit |
| **`Booking`** | `eventDate`, `guestCount`, `packageTier` | Retained permanently | Minimum 6 years | Commercial operational analytics and tax verification | Retained in PostgreSQL |
| **`Booking`** | `totalAmount`, `depositPaid`, `depositRequired` | Retained permanently | Minimum 6 years | FIRS / LIRS 14-month & 6-year tax audit rules | Retained down to exact kobo |
| **`Booking`** | `status`, `cancellationReason` | Retained permanently | Minimum 6 years | Audit defense for forfeited deposits | Retained in PostgreSQL |
| **`PaymentAttempt`** | `id`, `bookingId`, `amount`, `reference`, `gateway` | Retained permanently | Minimum 6 years | Central Bank of Nigeria (CBN) / FIRS audit trail | Retained permanently |
| **`EmailVerification`** | `id`, `userId`, `codeHash`, `expiresAt`, `attempts` | Purged | 10 minutes TTL or on user deletion | NDPA Data Minimisation | Hard deleted via scheduled cleanup |
| **`RetrievalChunk`** | `id`, `content`, `embedding`, `metadata` | Retained | Life of menu version | Commercial knowledge retrieval (RAG) | Purged only on menu deprecation |

---

## 3. Database Backups Synchronization & Lifecycle Policy

Retaining deleted personal data indefinitely within database backups violates NDPA Section 34 unless strict lifecycle boundaries are enforced.

### 3.1 Backup Architecture & Storage Location
- **Primary Hosting**: Encrypted Amazon RDS PostgreSQL running in `af-south-1` (Cape Town, South Africa) with low-latency peering to Lagos, Nigeria.
- **Physical Backup Location**: Point-in-time recovery WAL archives and encrypted daily snapshots stored in AWS S3 with KMS envelope encryption (AES-256).

### 3.2 Synchronization Interval & Backup Expiration
- **Backup Retention Window**: Snapshot archives are retained on a rolling 30-day lifecycle rule.
- **Purge Synchronization**: When an account hard-deletion runs, the live PostgreSQL database purges the record immediately. Backup snapshots naturally roll off and are permanently destroyed at day 30.
- **Restoration Protocol**: If a disaster recovery event forces a database restore from an older backup snapshot, an automated post-restore synchronization script immediately executes:
  ```sql
  DELETE FROM "User" WHERE id IN (SELECT "userId" FROM "DeletionAuditLog" WHERE "purgedAt" IS NOT NULL);
  ```
  This guarantees that restored databases never resurrect previously erased citizens.

---

## 4. The Statutory Conflict: Right to Erasure vs Financial Recordkeeping

### 4.1 The Conflict Identified
A direct statutory conflict exists between:
1. **The Citizen's Right**: **NDPA Section 34(1)** grants the event organizer the right to demand the unconditional erasure of all personal data concerning them without undue delay.
2. **The Sovereign Obligation**: **FIRS CITA Section 63** and the **Money Laundering Act 2022** strictly penalize businesses that fail to retain records of all monetary transactions, invoices, customer names, and bank payment references for a minimum of 6 years.

### 4.2 Which Law Wins and on What Legal Basis
**The financial retention obligation under FIRS and CITA wins over the Right to Erasure for financial transaction records.**

**Legal Basis**: NDPA Section 34(2)(b) and Section 34(2)(c) explicitly provide that the right to erasure does not apply where processing is necessary:
- *"For compliance with a legal obligation to which the controller is subject under Nigerian law"* (CITA tax retention).
- *"For the establishment, exercise or defense of legal claims."*

### 4.3 Production Resolution (How Hauwa Should Have Handled Ibrahim)
In our curriculum scenario, Hauwa deleted Ibrahim's entire database row, which wiped out two years of cooperative contribution records, unbalancing the books and triggering auditor concealment charges.

Under our architecture, Liz's Grillz resolves this conflict through **differential data segregation**:
1. **PII and Direct Contact Attributes**: Phone numbers, email addresses, and passwords are wiped and replaced with generic cryptographic placeholders.
2. **Financial Ledger Entries**: The `Booking` row, total contract amounts, deposit receipts, and payment gateway references are permanently preserved.
3. **The Audit Result**: When LIRS or FIRS audits Liz's Grillz, the financial ledger balances to the exact kobo, while Ibrahim's private contact details are erased from active operational marketing.

---

## 5. Anonymisation vs Deletion

### 5.1 Why Anonymised Data Can Be Retained Indefinitely
The Nigerian Data Protection Act defines "personal data" as information relating to an identified or identifiable natural person. Once data has been irreversibly anonymized such that the individual cannot be identified directly or indirectly by any party (even when combined with external datasets), the information ceases to be "personal data" under the law.

### 5.2 Technical Implementation in Liz's Grillz
When the scheduled deletion job purges an organizer:
- Personal identifier strings are irreversibly overwritten (`Anonymized Customer [NDPA-REQ-id]`).
- The user's email is mapped to an unroutable synthetic domain (`anonymized.<id>@deleted.lizsgrillz.ng`).
- Phone numbers are zeroed out (`+2340000000000`).
- Because statistical catering attributes (guest counts, menu package selected, booking dates) are dissociated from human identities, Liz's Grillz retains aggregate seasonal grilling analytics lawfully without violating citizen privacy rights.

