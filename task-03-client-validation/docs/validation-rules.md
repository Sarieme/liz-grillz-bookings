# Client-Side Validation Rules Derivation & Exclusion Cost Analysis

Every validation rule in Liz's Grillz Bookings was derived from operational catering needs in Lagos. Crucially, every rule introduces friction and inevitably blocks certain legitimate users. Rather than pretending these costs do not exist, this document records the exact trade-offs accepted.

---

## 1. Rule Derivations & Legitimate User Exclusions

### Rule 1: Two-Word Minimum Full Name (Each 2+ Characters)
- **What the rule is:** The full name input requires at least two separate words divided by a space, with each word having a minimum length of two characters (regex: `^[A-Za-z'-]{2,}\s+[A-Za-z'-]{2,}`).
- **What goes wrong without it:** Automated bots and agents fill registration forms with single-character tokens (e.g. "a" or "test"). Additionally, event gate passes and formal corporate accounting receipts cannot be issued to anonymous single-word names.
- **What legitimate user it wrongly blocks:** This rule blocks mononymous individuals who legally possess only a single name (common in parts of Indonesia, India, and West Africa), as well as individuals whose cultural names have single-letter surnames (e.g. "U" or "O").
- **Design trade-off accepted:** We knowingly accept this friction on the primary web form because corporate invoicing and Lagos venue security require first and last names. Users with non-standard names can complete bookings directly via Liz's WhatsApp concierge override.

### Rule 2: 11-Digit Nigerian Phone Number (or +234 International)
- **What the rule is:** Phone numbers must match Nigerian telecommunications patterns: either 11 digits starting with a zero (e.g. `080...`, `081...`, `090...`, `070...`) or 13 digits starting with `+234`. Digits only; letters and special symbols are stripped.
- **What goes wrong without it:** Organizers enter landlines, incomplete 8-digit numbers, or international numbers without country codes. Liz's dispatch team cannot reach them on WhatsApp on event morning to coordinate delivery timings.
- **What legitimate user it wrongly blocks:** It wrongly blocks diaspora Nigerians residing abroad (e.g. in the UK, US, or Canada) who are funding weddings or funeral celebrations in Lagos using their foreign mobile numbers (e.g. +44 or +1).
- **Design trade-off accepted:** The vast majority of on-the-ground day-of event coordination occurs via local Lagos SIMs. International diaspora clients booking remotely are instructed to provide their local Lagos event coordinator's number.

### Rule 3: Minimum 8-Character Password
- **What the rule is:** The password field requires a minimum length of eight characters, without arbitrary character complexity requirements.
- **What goes wrong without it:** Short passwords (such as 4-digit PINs or common words like "grillz") are easily guessed or brute-forced, exposing the client's booking records and payment history.
- **What legitimate user it wrongly blocks:** Older event organizers (aged 50 to 60) with lower tech confidence who prefer short, memorable 4-to-6-digit PINs may struggle to remember an 8-character string and abandon the booking.
- **Design trade-off accepted:** Length provides mathematical entropy against automated attacks far more effectively than complex character symbols. To assist older users, a clean visibility toggle allows them to verify what they typed before submitting.

---

## 2. Real-Time vs. On-Submit Validation: The Strategic Division

### Real-Time Validation on Registration
On the **Create Account** screen, validation rules (including email syntax and name structure) fire in real time as the user leaves each field (`onBlur`) and as they type (`onChange`).
- **Why this belongs here:** Registration represents the initial intake of new customer data. Catching mistakes immediately (such as missing `@` or typing an invalid domain) prevents users from filling an entire form only to have it rejected at the end. High friction is appropriate here, just as a commercial bank is strict when opening a corporate account.

### Submit-Time Validation on Login
On the **Sign In** screen, email syntax is **never** checked in real time while typing. It is evaluated strictly when the user clicks "Sign In".
- **Why this belongs here:** Aggressive real-time validation on login is user-hostile. Showing a red error saying "Invalid email format" while a returning user has only typed the first three letters of their email creates unnecessary anxiety. On login, the user already has an account, so validation must wait until the submit intent is confirmed.

---

## 3. Why Checking Email "Existence" is Pointless
Applications cannot and should not attempt to verify whether an email address actually exists during form completion.

First, modern mail servers deliberately disable SMTP VRFY and RCPT commands to protect users from malicious spam address harvesting, meaning mail servers will either refuse to answer or falsely report that every queried address exists. Second, even if a server confirmed an address existed, it cannot prove who owns it; an attacker can easily enter a genuine email belonging to someone else. Genuine verification is only possible by dispatching a cryptographic one-time token or verification link that requires out-of-band mailbox access to confirm.

