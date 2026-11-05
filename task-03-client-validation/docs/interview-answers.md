# Task 03 Interview Defence: Technical Answers

---

### Question 1: Why is client-side validation not enough?
**Answer:** Client-side validation runs in the browser, an environment entirely under user control. Anyone can bypass it by disabling JavaScript, editing DOM attributes in DevTools, or sending HTTP requests directly via curl, Postman, or automated scripts. Client-side checks are purely a user experience convenience to catch accidental typos early; they provide zero security. All business logic, authorization checks, and data constraints must be enforced on the server.

---

### Question 2: What security checks belong in the frontend, and what must the server enforce regardless?
**Answer:** No security checks belong exclusively in the frontend. The frontend handles immediate usability feedback: guiding formatting, preventing unnecessary network calls for obvious errors, and rendering accessible status indicators. The server must enforce all security controls regardless: payload shape and type validation, string length limits, authorization permissions, rate limiting, and sanitization before database writes.

---

### Question 3: The user interface hides the delete button for non-administrators. Is that enough?
**Answer:** No. Hiding a UI element is cosmetic security by obscurity. Any non-administrator can inspect network traffic to discover the API endpoint (such as `DELETE /api/bookings/:id`) and send the delete request directly. The server must authenticate the session identity, verify that the caller holds administrative permissions in the database, and reject unauthorized requests with `HTTP 403 Forbidden`.

---

### Question 4: What is the difference between validation, encoding and sanitisation?
**Answer:** Validation checks whether data conforms to expected rules (e.g. an email format or integer range) and rejects it if invalid. Sanitization strips or cleans dangerous characters (such as removing executable script tags or trimming whitespace) while retaining the data. Encoding transforms characters into a safe representation for a specific output context (such as HTML entity encoding `<` as `&lt;` to prevent Cross-Site Scripting).

---

### Question 5: Why should you validate route parameters and query strings, not just the body?
**Answer:** Route parameters and query strings are untrusted user inputs that interact directly with database lookups, file systems, and pagination logic. Unvalidated URL parameters invite SQL injection, path traversal (e.g. `../../etc/passwd`), and denial-of-service via huge pagination limits (`?limit=99999999`). Validating every URL parameter guarantees that inputs match expected types (like UUID or integer) before hitting business logic.

---

### Question 6: Explain what a single page application is, and how you make one discoverable by search engines.
**Answer:** A Single-Page Application (SPA) loads a single initial shell and dynamically updates content in response to user actions without requesting full new HTML documents on every navigation. To make an SPA discoverable by search engines, you implement Server-Side Rendering (SSR) or Static Site Generation (SSG) with dynamic `<head>` metadata, canonical URLs, semantic HTML tags, and structured schema markup so web crawlers parse complete HTML rather than an empty client-side container.

---

### Question 7: What are the advantages and disadvantages of a single page application against a multi-page application?
**Answer:** Advantages of an SPA include instantaneous page and tab transitions without white-screen flashes, smooth in-memory state preservation, and reduced server bandwidth after initial load. Disadvantages include larger initial JavaScript bundle downloads, slower first contentful paint on weak mobile networks, complex client memory management, and reliance on client-side JavaScript execution.

---

### Question 8: Can you explain the four principles of the Web Content Accessibility Guidelines, with examples from your own work?
**Answer:** The four POUR principles are:
1. Perceivable: Information must be presentable in multiple ways. In our form, error states include both a red border and a caution symbol (`⚠️`) so color-blind users detect errors.
2. Operable: UI components must be keyboard-accessible. Every input, tab, and button is reachable via Tab and operable via Space and Enter.
3. Understandable: Operations must be predictable. Inline errors explain what is wrong in plain language, and the submit button explains why it is disabled.
4. Robust: Content must be interpretable by assistive technologies. We linked inputs to error messages programmatically via `aria-describedby` and `aria-invalid`.

---

### Question 9: Discuss the importance of semantic HTML in the context of accessibility.
**Answer:** Semantic HTML elements (such as `<button>`, `<label>`, `<main>`, and `<header>`) provide built-in accessibility semantics, native keyboard focusability, and keyboard event listeners without custom JavaScript. A `<div>` styled like a button lacks role, tabIndex, and keyboard activation, requiring fragile manual reimplementation. Real semantic elements ensure screen readers announce controls accurately and let assistive users navigate by landmarks.

---

### Question 10: Tell me about a time when you disagreed with what a customer wanted to build.
**Answer:** A client wanted an automated countdown timer on the booking form that claimed their chosen event date would be given away in ten minutes if they did not pay an immediate deposit. I disagreed because fake artificial urgency damages brand trust and deceives customers. I proposed adhering to Liz's real business brief: an authentic, transparent 48-hour date hold window that genuinely reflects kitchen preparation schedules.

---

### Question 11: How would you explain to a non-technical executive why their AI implementation is not performing as expected?
**Answer:** I explain that AI models are probabilistic completion engines, not deterministic software systems. Without strict system constraints, design token references, and rigorous server-side verification gates, an agent defaults to average patterns: generating generic Tailwind styles, inventing unbuilt feature claims, and omitting backend validation. AI increases velocity, but engineering rigor and systematic verification determine software reliability.

---

### Question 12: One of your validation rules wrongly blocks a category of legitimate user. Name the rule, name the users, and defend the trade-off or say you got it wrong.
**Answer:** Our full name rule requires at least two words separated by a space, with each word having at least two characters. This wrongly blocks mononymous individuals who legally possess only a single name, as well as individuals with single-letter cultural surnames. I defend this trade-off because corporate invoicing and Lagos venue security gate passes require formal first and last names to grant catering vehicles venue access. Mononymous clients can book directly via Liz's WhatsApp concierge override.

---

### Question 13: You sent a request directly to your own endpoint. Say exactly what happened and what it tells you about the eight rules you spent two days writing.
**Answer:** I sent a request containing a single-character name ("X"), a non-numeric phone ("not-a-number"), a negative guest count (-50), and an event date in 1990 directly to `POST /api/bookings`. The server accepted it immediately, returned `HTTP 201 Created`, and wrote the bad record to PostgreSQL. This proves that all eight client-side validation rules are strictly cosmetic conveniences that provide zero actual system security.

---

### Question 14: Wrong-answer analysis. A candidate says: "I use strong client-side validation with regex on every field, disable the submit button until everything is valid, and sanitise all inputs in the browser before sending them. That covers the main injection and bad-data risks."
**Answer:** This candidate is dangerously mistaken. First, client-side regex and disabled buttons are completely useless against attackers because anyone can bypass the browser and send raw JSON directly to the server. Second, sanitizing inputs in the browser is actively misleading; an attacker simply sends unsanitized payloads via curl. The candidate has confused frontend usability helpers with backend security enforcement. Security controls must exist on the server.

