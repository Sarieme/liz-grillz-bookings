# Task Three: The Form, Attacked from Both Sides

## 1. Executive Summary: What This Task Was

Task Three examines the boundary between client-side form usability and server-side application security. In AI-assisted web development, engineering teams frequently ship registration flows that look visually polished for cooperative, sighted users with mice, yet fail catastrophically when encountering screen readers, network drops, bot crawlers, or direct API attacks.

This task proved two fundamental principles for Liz's Grillz Bookings:
1. Client-side validation is an ergonomic convenience designed to reduce user frustration and network round-trips; it is never a security control.
2. Form accessibility requires proactive structural engineering across semantic HTML, ARIA attributes, color independence, and focus management, rather than reactive visual tweaks.

---

## 2. What We Built

### Single-Page Authentication Hub
- Consolidated 3 separate authentication routes (`/signup`, `/login`, `/forgot-password`) into a single-page hub at `/auth` powered by URL query parameters (`?mode=signup`, `?mode=login`, `?mode=reset`).
- Retained client state during transitions, eliminated redundant HTTP round-trips, and reduced application route count from 5 distinct pages to 3 pages.

### Client-Side Validation Across Four Categories
- **Empty Fields**: Immediate inline feedback on blur with high-contrast text and a non-color caution icon (`⚠️`).
- **Length and Structure**: Derived Nigerian catering validation rules (full name requires at least two words and 5 characters; phone requires 11-digit Nigerian prefix `0` or `+234`).
- **Format and Timing**: Enforced aggressive real-time format validation on registration (opening an account requires rigorous friction), while deferring email checks to submit-time on login to avoid irritating returning users.
- **Input Type Ergonomics**: Replaced `<input type="number">` with `<input type="text" inputMode="numeric">` for guest counts and phone numbers, eliminating leading zero erasure and unwanted spinner clicks.

### Anti-Enumeration Protections
- Removed length and structural placeholders that leak internal sensitive identifier shapes.
- Unified login failure error messages to "Invalid email or password combination." to prevent timing and enumeration attacks.
- Implemented neutral confirmation messaging on password recovery regardless of email existence in the database.

### Screen Reader and Accessibility Remediations
- Audited the form against 5 WCAG criteria (Color Independence, Keyboard Reachability, Focus Visibility, Screen Reader Announcement, Error Association).
- Remediated 4 real defects: programmatic error linkage via `aria-describedby`, field invalidity signals with `aria-invalid`, explicit checkbox requirement flags, and live region feedback banners.

### The Attack Demonstration
- Attacked the form through the browser UI, documenting edge cases that bypassed client checks.
- Bypassed the browser entirely using a direct `curl` POST request to `/api/bookings` with corrupt payloads (`clientName: "X"`, negative guest count, past date), which returned `HTTP 201 Created` because backend schema enforcement has not yet been built.
- Executed a deterministic version control rollback using an exact commit hash (`git revert 78428d3 --no-edit`) without hallucinated prompt edits.

---

## 3. Key Decisions and Architectural Trade-Offs

| Decision | Chosen Architecture | Alternative Considered | Engineering Trade-Off |
| :--- | :--- | :--- | :--- |
| **Authentication Flow** | Single-Page Hub (`/auth?mode=...`) | Separate `/login` and `/signup` routes | Faster transitions and preserved state, but increases bundle size and requires `<Suspense>` wrapper for query params. |
| **Email Validation Timing** | Real-time on registration, submit-time on login | Real-time validation everywhere | Prevents bad data during account creation without annoying returning users typing valid credentials on mobile devices. |
| **Numeric Fields** | Text input with `inputMode="numeric"` | Native `<input type="number">` | Eliminates browser spinner bugs and leading-zero stripping on Nigerian phone numbers, but requires manual regex filtering. |
| **Submission Action** | Button visible by default, disabled with explanation | Hidden button until valid | Setting expectations immediately reduces user anxiety; an inline live banner explains missing requirements without silent failures. |

---

## 4. What We Got Wrong: Known Defects and Production Risks

1. **Unprotected Backend Endpoint (`app/api/bookings/route.ts#L12-L29`)**:
   - The backend route handler performs bare boolean existence checks and writes directly to PostgreSQL. Corrupt payloads sent via command-line bypass frontend validation completely, corrupting calendar availability. This will be remediated in Task Four with Zod schemas.
2. **Whitespace Password Exploit (`app/auth/AuthForm.tsx#L114`)**:
   - Password validation evaluates `password.length >= 8` without checking for space-only strings. An eight-space input passes client checks.
3. **Truncated Top-Level Domain Acceptance (`app/auth/AuthForm.tsx#L84`)**:
   - Email regex accepts single-letter TLDs (e.g. `user@domain.c`), allowing customer typos to pass client validation and causing bounced confirmation emails.
4. **Disabled Button Focus Sequence (`app/auth/AuthForm.tsx#L605`)**:
   - Using native HTML `disabled` removes the submit button from the sequential keyboard tab sequence, skipping announcement for screen reader keyboard users.

---

## 5. Deliverables Directory Map

```text
task-03-client-validation/
  README.md                              # 4-minute technical interview briefing (this file)
  docs/
    spa-rationale.md                     # Single-page architecture justification and trade-offs
    field-justification.md               # 3-question evaluation for every collected form field
    validation-rules.md                  # Derived validation rules and user exclusion costs
    terms-note.md                        # Provenance and legal derivation of catering terms
    enumeration.md                       # Anti-enumeration analysis and unified messaging
    accessibility-audit.md               # 5-criterion audit with screen reader transcripts
    client-side-is-not-security.md       # Landmark essay on direct endpoint bypassing
    rollback.md                          # Deterministic commit hash revert analysis
    defects.md                           # Comprehensive defect register with production costs
    interview-answers.md                 # All 14 technical interview questions answered
  evidence/
    01-page-count-before.txt             # 5 routes detected in baseline application
    02-page-count-after.txt              # Route count collapsed to 3 pages
    04-form-switch-logs.txt              # Zero-reload in-memory form state switching logs
    15-form-attack-results.txt           # Edge-case input attack results through browser UI
    16-direct-request-command-and-response.txt # Raw curl command and HTTP 201 backend response
    17-commit-list-and-rollback.txt      # Git log, chosen commit ID, and revert execution
```
