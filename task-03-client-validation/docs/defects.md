# Known Defects and Production Vulnerability Log

## 1. Overview

In accordance with Section 8 of the assessment specifications, this document records real, verified defects in our Task Three codebase. A system with zero identified defects is either trivial or obscured. Below are five concrete defects identified in `task-02-repository-and-scaffold/` and `task-03-client-validation/`, complete with file paths, line references, root causes, and quantified production costs.

---

## 2. Defect Register

### Defect 1: Unprotected Backend Endpoint Accepts Bypassed Corrupt Payloads
- **File**: `task-02-repository-and-scaffold/app/api/bookings/route.ts`
- **Line Numbers**: Lines 12 to 29
- **Root Cause**: The backend API route handler only performs boolean presence checks (`if (!clientName || !phone || !eventDate || !guestCount)`). It completely lacks structural, length, type range, and logical date validation.
- **Observed Behavior**: A direct HTTP POST command bypassing the browser form submitted `clientName: "X"`, `phone: "000"`, `guestCount: -50`, and a past event date of `2020-01-01`. The backend accepted the payload and returned `HTTP 201 Created` with row ID `cmw0v0j0t0000gjr80xz8vc41`.
- **Production Cost**: Malicious actors or automated crawlers can bypass frontend forms to inject arbitrary garbage directly into PostgreSQL. In Liz's Grillz catering operations, this corrupts the reservation calendar, allocates kitchen staff and meat inventories to non-existent events, and risks double-booking real dates while blocking genuine paying customers. This defect will be systematically resolved in Task Four using server-side Zod schema validation.

---

### Defect 2: Client Password Validation Allows Pure Whitespace Strings
- **File**: `task-02-repository-and-scaffold/app/auth/AuthForm.tsx`
- **Line Numbers**: Line 91 and Line 114
- **Root Cause**: Password validation is evaluated with `passVal.length < 8` and `password.length >= 8`. Because strings containing eight spaces (`"        "`) have a string length of 8, the client validation treats pure whitespace as a valid password.
- **Observed Behavior**: A user can type eight space characters and the submit button enables, allowing registration with an empty-looking password. Furthermore, if a user accidentally pastes a legitimate password with leading or trailing whitespace, the client does not strip or warn about it.
- **Production Cost**: Customers who copy and paste passwords from password managers or email invites frequently pick up invisible trailing spaces. When attempting to log in subsequently from a mobile keyboard without the trailing space, authentication fails with a generic error, resulting in customer lockouts, abandoned event planning, and unnecessary support overhead.

---

### Defect 3: Email Regular Expression Accepts Truncated Top-Level Domains
- **File**: `task-02-repository-and-scaffold/app/auth/AuthForm.tsx`
- **Line Numbers**: Line 84 and Line 113
- **Root Cause**: The client-side email format regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` requires an `@` and a period, but does not enforce a minimum length or alphabetic character set on the top-level domain (TLD).
- **Observed Behavior**: Inputs such as `client@domain.c` or `user@domain.12` pass client validation as valid email addresses.
- **Production Cost**: Event organizers entering rapid catering inquiries frequently mistype `.com` as `.c` or `.co`. The form submits successfully, but transactional confirmations, invoice PDF links, and deposit receipts bounce. The organizer assumes Liz's Grillz received their deposit confirmation, leading to unreserved dates and severe reputational damage when catering teams do not arrive.

---

### Defect 4: HTML Disabled Attribute Drops Submit Button from Keyboard Tab Sequence
- **File**: `task-02-repository-and-scaffold/app/auth/AuthForm.tsx`
- **Line Numbers**: Line 605
- **Root Cause**: The submission button utilizes the native HTML attribute `disabled={!isFormValid()}`.
- **Observed Behavior**: When an element possesses the native `disabled` attribute, web browsers remove it entirely from the sequential keyboard focus navigation order (`tabindex`). Although we implemented an inline live explanation banner (`aria-live="polite"`), a blind user navigating solely via `Tab` key jumps straight from the password field to the footer navigation without their virtual cursor encountering the button.
- **Production Cost**: Visually impaired event organizers or users navigating via screen readers or switch controls are left uncertain whether a submission action exists on the page. In WCAG Level AA compliant environments, the industry standard is to use `aria-disabled="true"` with active focusability and an explanatory error trigger rather than removing the control from the DOM tab order.

---

### Defect 5: Strict Nigerian Phone Regex Disallows International Diaspora Clients
- **File**: `task-02-repository-and-scaffold/app/auth/AuthForm.tsx`
- **Line Numbers**: Line 73 and Line 112
- **Root Cause**: The phone input validation strictly matches `^(0\d{10}|\+234\d{10})$`.
- **Observed Behavior**: Any non-Nigerian telephone prefix (such as `+44` for United Kingdom or `+1` for United States) is flagged as an invalid number format: "Enter a valid 11-digit Nigerian phone number (e.g. 08031234567)".
- **Production Cost**: Liz's Grillz frequently caters large weddings, milestone birthdays, and December homecoming ("Detty December") celebrations financed by Nigerian diaspora living abroad. These high-budget clients booking Lagos venues from London, Atlanta, or Toronto are hard-blocked by the client form from completing their organizer registration, forcing high-value sales off-platform into manual WhatsApp chats.

---

## 3. Remediation Roadmap for Task Four

1. **Server-Side Zod Schemas**: Implement strict schema parsing in all Next.js API route handlers to validate string lengths, numeric ranges, date windows, and TLD formats before any database interaction.
2. **Password Trimming Policy**: Enforce server-side trimming of leading and trailing whitespace while retaining user-chosen internal characters.
3. **Dialing Code Normalization**: Expand phone validation to support international E.164 formats while maintaining default Nigerian convenience presets.
4. **Accessible Button State**: Transition submit button implementation from native `disabled` to `aria-disabled="true"` to maintain predictable keyboard tab sequencing.
