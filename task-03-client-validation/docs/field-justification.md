# Form Field Justification Audit

Before applying any validation rules, every input field on the Liz's Grillz organizer registration form was audited against three mandatory criteria:
1. **Why it is needed**: The operational reason for requesting the data.
2. **What the business does with it**: How Liz's catering workflow consumes the data.
3. **What happens if the user gets it wrong**: The business failure that occurs if the entry is erroneous.

Any field that failed to satisfy all three criteria was ruthlessly eliminated.

---

## 1. Field-by-Field Justification

### Field 1: Full Legal Name (`fullName`)
- **Why it is needed:** Nigerian law and financial regulations require a named legal entity or representative when executing catering service contracts and taking non-refundable deposits.
- **What the business does with it:** Liz prints the organizer's name on kitchen service manifests, event access badges, formal corporate invoices, and delivery gate passes across Lagos event venues.
- **What happens if the user gets it wrong:** If an organizer enters a nickname, fake alias, or single character (e.g. "a"), security guards at Lagos venues (such as Victoria Island event centers or Lekki estates) will deny the catering truck entry. Furthermore, finance departments cannot approve payment reimbursement for unnamed individuals.

### Field 2: Organization Category (`orgType`)
- **Why it is needed:** The business brief dictates fundamentally different commercial terms based on organization type: Individuals pay an 80% deposit, whereas Churches, NGOs, and Corporate Offices pay a 60% deposit due to board or finance committee approval cycles.
- **What the business does with it:** The pricing engine automatically sets the deposit calculation percentage and invoicing payment terms according to the selected tier.
- **What happens if the user gets it wrong:** If an office selects "Individual", they are wrongly asked for an 80% upfront deposit, causing committee delays. If an individual selects "Corporate Office", Liz receives an inadequate 60% deposit that fails to cover bulk ingredient procurement costs 14 days prior to the event.

### Field 3: Phone Number (`phone`)
- **Why it is needed:** WhatsApp and phone calls are the primary real-time communication channels for Lagos event logistics.
- **What the business does with it:** Liz uses this number to send instant WhatsApp confirmations, coordinate delivery timings on the morning of the event, and communicate real-time traffic delays across the Lekki-Epe expressway or Third Mainland Bridge.
- **What happens if the user gets it wrong:** If the phone number is invalid or disconnected, the catering dispatch team cannot reach the organizer on event morning. Food arrives late, gate access is delayed, and hot charcoal dishes spoil.

### Field 4: Email Address (`email`)
- **Why it is needed:** Formal written audit trail for electronic receipts, payment confirmations, and PDF invoice dispatch.
- **What the business does with it:** Automated transactional emails dispatch deposit receipts upon payment gateway confirmation and balance reminder notices 5 days before the event.
- **What happens if the user gets it wrong:** The client never receives payment receipts or balance due reminders. Corporate finance departments refuse to release the remaining balance without a formal PDF invoice.

### Field 5: Account Password (`password`)
- **Why it is needed:** Secures the organizer's booking history, payment records, guest count adjustments, and contact data against unauthorized tampering.
- **What the business does with it:** Hashed using bcrypt/argon2 to authenticate returning organizers who log in to modify guest counts or pay balances.
- **What happens if the user gets it wrong:** If an account is unprotected or hijacked, malicious third parties could cancel genuine date holds or view sensitive corporate event details.

### Field 6: Terms and Conditions Acceptance (`acceptTerms`)
- **Why it is needed:** Mandatory under the Nigerian Data Protection Act (NDPA) and Nigerian contract law for holding personal data and executing deposit refund rules.
- **What the business does with it:** Records the user's explicit consent timestamp to Liz's 48-hour date hold and non-refundable deposit terms.
- **What happens if the user gets it wrong:** Without consent, Liz cannot legally store client personal data or enforce the cancellation policy (deposits non-refundable within 14 days of event).

---

## 2. Fields Deliberately Removed (Pruning Non-Essential Clutter)
- **Title / Salutation (Mr/Mrs/Chief):** Removed because it does not affect catering preparation or invoicing, and adds unnecessary mobile typing friction.
- **Physical Home Address:** Removed from initial registration. Delivery venue address is collected only when booking a specific event date, minimizing initial registration drop-off.
- **Fax Number / Secondary Landline:** Removed as obsolete technology in the Lagos catering industry.

---

## 3. Removal of Non-Functional Decoration
- **Removed Element:** In the baseline template, an ornamental brand logo was rendered inside the form card directly above the heading.
- **Reason for Removal:** The brand logo is already prominently displayed in the top global navigation header. Rendering a duplicate, non-clickable logo inside the form card wasted 80 vertical pixels on mobile screens and confused users who tapped it expecting navigation.

