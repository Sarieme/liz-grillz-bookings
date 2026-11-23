# Liz's Grillz Bookings: Privacy & Data Retention Policy (Initial Uncorrected Draft)

## 1. Introduction
Liz's Grillz operates an event catering reservation platform in Victoria Island, Lagos. We respect your privacy and process your data under the Nigerian Data Protection Act (NDPA) 2023.

---

## 2. Information We Collect
- Organizer legal full name and contact phone number.
- Corporate organization or event category.
- Email address for sending invoices, deposit receipts, and verification codes.
- Event booking details: date, guest headcount, package selections, and payment attempt references.

---

## 3. Account Deletion & The 7-Day Grace Period
When you decide to stop using Liz's Grillz Bookings, you may request account deletion at any time.

### 3.1 The 7-Day Grace Period
Your account will immediately enter a 7-day statutory grace period:
- Active login sessions are immediately revoked across all your devices.
- Your account is locked from creating new event bookings.
- If you change your mind within 7 days, you can contact support to cancel the deletion request.
- After 7 days, our automated background job permanently anonymizes your personal information.

---

## 4. What Is Purged vs What Is Retained
- **Purged / Anonymized**: Your full name, personal phone number, password hash, active sessions, and email address are permanently overwritten with anonymous placeholders.
- **Retained**: In accordance with the Federal Inland Revenue Service (FIRS) and Companies Income Tax Act (CITA), all commercial booking records, total contract sums, and deposit payment references are preserved for 6 years to support statutory financial tax audits.

---

## 5. How to Request Deletion (DRAFT WITH UNFULFILLABLE PROMISE)
You can request account deletion through any of the following three channels:
1. Log into your organizer portal and select "Request Account Deletion" under Account Settings.
2. Send a formal email request from your registered address to `privacy@lizsgrillz.ng`.
3. **Tell your event grill master or lead catering server in person at your event venue, and they will immediately cancel your account, process an instant cash deposit refund, and wipe your records on the spot.**

---

## 6. Engineering Retrospective: Why Promise #3 Had to Be Removed
The third clause above is an unfulfillable promise that had to be retracted from our production privacy notice:

**What Went Wrong**: Event grill masters and service crew are culinary contractors on site managing barbecue fires, meat temperatures, and plate service in busy Lagos party halls. They have zero administrative access to our cloud PostgreSQL database, have no capability to authenticate user identity, and are not authorized to disburse cash refunds from company bank accounts. Furthermore, verbal requests made during noisy 200-guest parties are never logged, leaving the account active while the customer assumes their data was erased.

**How Such Promises Get Written**: Non-technical marketing and customer service writers draft policies based on idealized customer service fantasies rather than actual software architecture. They assume front-line human staff can verbally trigger technical database mutations without verifying whether any operational software integration exists between venue staff and backend databases.

