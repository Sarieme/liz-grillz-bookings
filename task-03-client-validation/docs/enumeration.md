# Anti-Enumeration & Sensitive Data Shape Analysis

## 1. Which Field and Why Its Shape is Sensitive
In Liz's Grillz Bookings, the length and format of two data elements are inherently sensitive:
1. **The Booking Reservation Reference (`bookingId`):** The unique identifier generated upon date reservation that serves as the access key for reviewing invoices and making balance payments.
2. **The Authentication Error Messaging (Login & Password Recovery):** The feedback returned when credentials fail.

In the initial naive prototype, the lookup field featured a placeholder displaying an explicit character mask (`e.g. LG-2026-XXXXX`), and the login failure explicitly stated: *"Email address not registered in our database"*.

This placeholder and detailed error message were deliberately removed.

---

## 2. What an Attacker Gains from Knowing the Shape
When an interface leaks the length, structure, or failure half of sensitive data, an attacker gains substantial advantages:

1. **Drastic Reduction in Brute-Force Search Space:**  
   If an attacker knows an event booking reference is strictly five digits preceded by a fixed prefix, the entropy collapses from a massive alphanumeric keyspace to merely 100,000 combinations (`00000` to `99999`). An automated script can exhaust this in minutes, discovering upcoming high-profile wedding dates, guest counts, and venue locations across Lagos.
2. **Corporate Account Enumeration:**  
   When a login form reveals *"No account exists for this email"*, an attacker can feed a dictionary list of Lagos corporate executive emails (e.g. bank directors or multinational managers). The system confirms which corporate entities have accounts with Liz's Grillz, allowing attackers to mount targeted phishing or credential-stuffing campaigns against confirmed clients.

---

## 3. The Trade-Off Accepted: Security vs. User Convenience
Removing structural hints and unifying error messages introduces real friction for legitimate users:

- **The Cost to Legitimate Users:**  
  When an event organizer mistypes their password by one character, a generic message stating *"Invalid email or password combination"* does not tell them which half was incorrect. The organizer might waste time re-typing a perfectly correct email address or requesting an unnecessary password reset.
- **Why the Trade-Off is Worth It:**  
  Under the Nigerian Data Protection Act (NDPA), Liz's Grillz is legally obligated to safeguard customer contact lists and event dates against unauthorized disclosure. Revealing valid corporate client lists through user enumeration is a severe compliance violation. Accepting minor typing friction for legitimate users is an essential and necessary price to protect client confidentiality and prevent automated scraping.

