# Liz's Grillz Bookings: Privacy & Data Protection Policy

## 1. Introduction & Statutory Authority
Liz's Grillz ("we", "our", or "us") operates the event catering reservation platform for corporate and individual hosts in Lagos, Nigeria. This policy sets out how we collect, handle, retain, and erase personal data in compliance with the **Nigerian Data Protection Act (NDPA) 2023** and applicable Nigerian commercial tax legislation.

---

## 2. Information We Collect and Process
We collect only the minimum personal data required to schedule and execute high-capacity catering reservations:
- **Identity & Contact Data**: Organizer full legal name, telephone number, and email address.
- **Organization Profile**: Corporate entity name or individual event classification.
- **Reservation Records**: Event date, delivery venue, guest count, dietary notes, and package selections.
- **Financial Audit Records**: Invoiced catering fees, deposit amounts paid, balance due, and payment gateway transaction references.
- **Security Telemetry**: IP address, user-agent headers, and SHA-256 hashed session bearer tokens.

---

## 3. Account Deletion & The 7-Day Grace Period
You hold the statutory Right to Erasure under Section 34 of the NDPA. When you request account deletion, we process your request through a structured 4-stage process rather than an unsafe direct database wipe.

### 3.1 Immediate Lockout & Session Revocation (Stage 1)
Upon submission of a deletion request, our server immediately revokes all active session tokens across all your mobile and desktop devices. Your account enters status `LOCKED_DELETION_PENDING`, preventing any new event reservations or unauthorized account modifications.

### 3.2 The 7-Day Grace Period (Stage 2)
Your account remains in a locked state for exactly seven (7) calendar days. This grace period protects event hosts against accidental deletion, account takeover sabotage, or hasty decisions prior to scheduled catering dates. You may cancel your deletion request within this 7-day window by contacting verified customer support.

### 3.3 Scheduled Hard Deletion & Anonymization (Stage 3 & 4)
Upon expiration of the 7-day grace period, our automated background maintenance job executes an atomic database transaction:
- **Identity Anonymization**: Your personal name is permanently overwritten with `Anonymized Customer [NDPA-REQ-id]`, your email is converted to an unroutable synthetic domain (`anonymized.<id>@deleted.lizsgrillz.ng`), and your phone number is permanently zeroed out.
- **Volatile Data Purged**: All session records and email verification tokens are permanently deleted.
- **Financial Record Retention**: Commercial booking contracts, total invoice values, and deposit receipts are permanently retained in PostgreSQL for six (6) years in accordance with Section 63 of the Companies Income Tax Act (CITA) and Federal Inland Revenue Service (FIRS) audit rules. Once personal contact details are stripped, these records are non-identifiable commercial ledger entries.

---

## 4. How to Submit a Legally Enforceable Deletion Request
To guarantee data protection and prevent unauthorized account destruction, deletion requests must be initiated through verified, authenticated channels:
1. **Authenticated In-App Portal**: Navigate to **Account Settings &rarr; Data Privacy &rarr; Request Account Deletion** while logged into your organizer account.
2. **Formal Email Notice**: Transmit a written deletion demand from your registered account email address to `privacy@lizsgrillz.ng`.

*Note: In-person verbal requests made to event grilling staff or delivery drivers at party venues cannot be honored, as venue contractors do not possess administrative access to production database systems.*

---

## 5. Contact & Data Protection Officer
For data protection inquiries or to exercise your rights under the NDPA, contact:
- **Data Protection Officer**: DPO Office, Liz's Grillz Bookings
- **Address**: 14B Adeola Odeku Street, Victoria Island, Lagos, Nigeria
- **Email**: `privacy@lizsgrillz.ng`

