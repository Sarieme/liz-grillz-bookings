# Technical Engineering Handbook: Systems Architecture, Security & Compliance

## Handbook Overview
This handbook is a comprehensive technical curriculum guide written for software engineers one cohort behind us. It explains the core architectural principles, failure modes, implementation mechanics, and real-world production lessons across seven major disciplines in web application engineering. Every section includes a real-world catering scenario from **Liz's Grillz Bookings** in Lagos, Nigeria, and an authentic mistake verified against our actual project commit history.

---

## Section 1: Typography, Elevation Shadows, and the Design System Export

### 1.1 The Concept
Design tokens are the atomic, platform-agnostic key-value pairs that define visual styling (colors, typography metrics, spatial padding, elevation shadows). They are structured in two distinct layers:
1. **The Palette Tier**: Raw primitive color swatches and values (e.g. `primary-40: #C2410C`).
2. **The Role Tier**: Semantic names representing intent (e.g. `color-primary`, `color-on-primary`, `color-surface`).
Components in the user interface reference roles exclusively, never raw palette swatches or hex codes.

### 1.2 Why It Exists: The Failure It Prevents
Without a centralized design token pipeline, developers copy and paste arbitrary hex codes directly into CSS files. When brand colors change, hundreds of files require manual search-and-replace edits. Inevitably, components drift, typography scales become inconsistent, and color contrast collapses below legal accessibility standards.

### 1.3 Real-World Scenario
Folake, an event manager for a Lagos corporate bank, attempts to book a wedding gala on Liz's Grillz using her smartphone under direct sunlight on Victoria Island. Because the button text was hardcoded using an uncalibrated bright orange (`#D75C19`), the contrast ratio against white is only 3.9:1, rendering the "Confirm Catering Deposit" button completely unreadable to her. By enforcing tokens derived from `#C2410C` (5.2:1 contrast), Folake reads the action cleanly and completes the booking.

### 1.4 How It Is Done
1. Design variables are authored in Figma and exported to a standardized tokens JSON file (`design-tokens.tokens (1).json`).
2. A vanilla Node.js build script (`convert-tokens.js`) parses the JSON tree, resolves nested token references, and generates pure CSS custom properties (`tokens.css`).
3. The build process runs automatically via npm scripts (`npm run build:tokens`), ensuring Figma remains the sole source of visual truth.

### 1.5 Where It Goes Wrong
The most dangerous failure in CSS variable tokens is silent fallback failure. If an engineer renames `--color-primary` to `--color-brand-primary` in Figma without updating the compiler, browsers do not throw build errors. Instead, the browser silently ignores the undefined variable and falls back to default black text or invisible buttons.

### 1.6 What I Got Wrong
During Task One, I sampled the original orange color from the Liz's Grillz logo image (`#D75C19`) and initially assumed it was accessible. When I ran contrast calculations against white (`#FFFFFF`), it measured only 3.91:1, failing the WCAG AA requirement of 4.5:1 for normal text. I had to manually adjust the tonal value down to `#C2410C` (5.2:1) and pin it as `primary-40` in the palette. Additionally, I initially hardcoded the old hex into a subtitle in `index.html`, which broke consistency until I refactored it to use the semantic role `var(--color-primary)`.

---

## Section 2: Scaffolding, the Development Server, and Database Diagnostics

### 2.1 The Concept
Scaffolding establishes the core runtime foundation, file directory topology, package dependencies, and build pipeline. Database diagnostics are the systematic procedures used to verify database connectivity, port listening states, process ownership, and transaction persistence before writing application logic.

### 2.2 Why It Exists: The Failure It Prevents
Starting feature development before proving database diagnostics leads to "phantom debugging": diagnosing application code bugs when the underlying problem was actually a dropped socket, a blocked port, or an uncommitted database transaction.

### 2.3 Real-World Scenario
Babajide, an operations engineer deploying Liz's Grillz to a staging server in Lagos, starts the Node.js server. The terminal claims the server is running on port 3000. However, when corporate clients submit catering inquiries, nothing saves. Babajide spends four hours debugging SQL syntax before discovering that a crashed background Node process was occupying port 3000, intercepting incoming HTTP traffic and returning stale cached responses.

### 2.4 How It Is Done
1. Initialize the full-stack App Router via Next.js and TypeScript.
2. Configure PostgreSQL with connection pooling via Prisma ORM (`DATABASE_URL`).
3. Verify database write integrity by issuing HTTP POST requests and checking persisted rows via SQL queries and Prisma Studio.
4. Execute deliberate failure tests: disconnect PostgreSQL and verify that the application returns a structured `HTTP 500` error rather than reporting a false success.

### 2.5 Where It Goes Wrong
The "False Success" anti-pattern: an API controller catches a database connection exception, logs it to `console.error`, but fails to re-throw or return an error status, ultimately sending `HTTP 200 OK` back to the browser. The customer assumes their event date is booked, but no row exists in PostgreSQL.

### 2.6 What I Got Wrong
During Task Two, when starting the Next.js server on Windows, I encountered an `EADDRINUSE: address already in use :::3000` crash. An orphaned Node.js background task from an earlier session was silently holding the socket open. Instead of restarting the computer or blindly changing the port to 3001, I had to use PowerShell (`Get-NetTCPConnection -LocalPort 3000`) to extract the exact Process ID (`PID 18452`) and terminate it cleanly (`Stop-Process -Id 18452 -Force`) to regain control of port 3000.

---

## Section 3: Information Design, the Browser Head, and Responsive Type

### 3.1 The Concept
Information design organizes technical presentation so metadata, document titles, search crawlers, and responsive typography adapt dynamically across diverse client environments. This includes Open Graph social previews, SVG favicons, and CSS `clamp()` fluid type scaling.

### 3.2 Why It Exists: The Failure It Prevents
Without dynamic metadata, sharing a booking link on WhatsApp or Slack displays an unhelpful generic title ("Untitled Document" or "Create Next App") without branding. Without fluid typography, text styled for 27-inch desktop monitors overflows mobile viewports, breaking page layouts.

### 3.3 Real-World Scenario
Chioma, an event planner in Ikeja, shares a link to Liz's Grillz catering rates in an executive WhatsApp group of bank directors. Because Open Graph metadata was properly implemented, WhatsApp displays a rich preview card featuring the official Liz's Grillz logo, a description of Victoria Island corporate catering packages, and a clean domain tag. The directors immediately recognize the brand's legitimacy and approve the 1,500,000 NGN catering budget.

### 3.4 How It Is Done
1. Export dynamic metadata objects in Next.js page components (`export const metadata = { title: "...", openGraph: { ... } }`).
2. Provide a scalable SVG brand favicon at `app/icon.svg`.
3. Implement fluid typography using CSS `clamp(min, preferred, max)`:
   ```css
   font-size: clamp(1.75rem, 1.25rem + 2vw, 2.75rem);
   ```
   This ensures headings scale proportionally from 320px mobile screens to 4K displays without media query breakpoints.

### 3.5 Where It Goes Wrong
Using fixed pixel padding (`padding: 24px`) on buttons inside mobile viewports. On smaller smartphones (e.g. 360px wide), rigid horizontal padding forces the button container to exceed viewport width, causing an unwanted horizontal scrollbar that ruins mobile ergonomics.

### 3.6 What I Got Wrong
In Task Two's information design phase, I initially set fixed pixel padding on our primary buttons (`padding: 12px 32px`). On compact mobile screens, the button text wrapped awkwardly onto two lines. I corrected this by converting button padding to scalable `rem` units with fluid typography scaling, ensuring touch targets remain comfortable across all viewport sizes.

---

## Section 4: The Working Tree, Branching, and Client-Side Validation

### 4.1 The Concept
The working tree and Git branching model isolate experimental feature development from production code. Client-side validation evaluates form inputs directly in the browser DOM before network transmission to provide immediate ergonomic feedback.

### 4.2 Why It Exists: The Failure It Prevents
Client-side validation catches accidental user errors (typos, omitted fields, invalid phone formats) in milliseconds, sparing the user from waiting on server round trips. Branching prevents unstable, experimental code from contaminating the main production deploy.

### 4.3 Real-World Scenario
Osas, a Lagos wedding host, is registering an account to book catering for 200 guests. He accidentally types 10 digits for his phone number instead of 11. Client-side validation immediately highlights the field with an inline warning: *"Enter a valid 11-digit Nigerian phone number (e.g. 08031234567)"*. Osas corrects the typo instantly without submitting the form or losing his typed password.

### 4.4 How It Is Done
1. Create a dedicated feature branch (`git checkout -b feature/task-03-client-validation`).
2. Build validation tracking in React (`touched`, `errors`, `validateField`).
3. Connect inputs to error messages using accessible ARIA semantics (`aria-invalid`, `aria-describedby`, `role="alert"`).
4. Prove version control discipline by executing clean code reverts (`git revert`) when rollbacks are required.

### 4.5 Where It Goes Wrong: The Fatal Assumption
The fatal failure mode is assuming client-side validation provides security. Any user can open Chrome DevTools, delete the `required` and `maxlength` attributes, disable JavaScript, or issue direct HTTP requests via curl, completely bypassing every client constraint.

### 4.6 What I Got Wrong
In Task Three, I authored a feature commit (`78428d3`) that added an unapproved promotional discount banner to the registration card. When this unapproved divergence was identified during code review, I had to execute an authentic Git rollback via `git revert 78428d3` (commit `4145872`). More importantly, I was initially tempted to believe client validation was sufficient until I executed a direct curl attack that injected a negative guest count (`-50`) straight into the backend, proving client validation is strictly an ergonomic layer.

---

## Section 5: Migrations, Relational Schema Design, and Email Delivery

### 5.1 The Concept
Relational schema design establishes normalized data structures linked by foreign key constraints. Forward-only migrations are versioned, incremental SQL scripts that evolve database structures without manual database editing. Asynchronous email delivery decouples network mail transmission from the HTTP request/response cycle.

### 5.2 Why It Exists: The Failure It Prevents
Manual SQL schema edits on production databases cause schema drift, missing columns, and database locks. Synchronous email dispatch inside HTTP controllers ties user request latency to third-party SMTP server response times, leading to gateway timeouts.

### 5.3 Real-World Scenario
Hauwa, operating an event booking platform in Lagos, attempts to add a required cancellation policy column to her database by running a manual `ALTER TABLE ADD COLUMN "cancellationReason" TEXT NOT NULL;` on a table with 5,000 existing bookings. The migration crashes immediately because existing rows cannot contain null in a non-nullable column. By using the safe 3-step migration pattern (optional column &rarr; backfill existing rows &rarr; make required), zero downtime is achieved.

### 5.4 How It Is Done
1. Define declarative models in `schema.prisma`.
2. Generate forward-only migration scripts using `npx prisma migrate dev`.
3. For transactional emails, generate cryptographically secure 6-digit numeric codes using `crypto.randomInt(100000, 1000000)`.
4. Store only the SHA-256 hash in PostgreSQL (`EmailVerification.codeHash`).
5. Dispatch email delivery via Node.js `setImmediate` or a background worker queue, detaching network mail latency from client response times.

### 5.5 Where It Goes Wrong
Schema Drift (Prisma error `P2022`): regenerating the Prisma Client without applying migrations to the database. The TypeScript compiler believes a column exists on the model, but when the query executes, PostgreSQL rejects it with `column does not exist`.

### 5.6 What I Got Wrong
In Task Four, when adding `cancellationReason` to the populated `Booking` table, I initially attempted to make it a required non-nullable column in a single migration. PostgreSQL rejected the migration immediately because existing bookings had null values (recorded in `evidence/04-required-column-failure.txt`). I had to revert the change and implement the disciplined 3-step zero-downtime migration sequence: first creating the column as optional, running an automated data backfill script, and finally issuing a second migration to make the column required.

---

## Section 6: Server-Side Validation, Password Economics, Rate Limiting and Verification

### 6.1 The Concept
Server boundary validation enforces schema invariants on all incoming network bytes prior to database interactions. Password hashing economics proves that fast hashing algorithms are catastrophic for credential security. Sliding-window rate limiting restricts request velocity across continuous rolling timeframes.

### 6.2 Why It Exists: The Failure It Prevents
Client bypasses allow arbitrary malicious payloads to reach persistence layers, causing SQL injection or data corruption. Fast hashing allows adversaries who steal database dumps to crack billions of passwords per second offline.

### 6.3 Real-World Scenario
An automated credential-stuffing botnet targets Liz's Grillz from rotating residential IP proxies in Lagos, attempting 10,000 password guesses per minute. Because our server enforces a 5-request/15-minute sliding-window limit, the attacker receives `HTTP 429 Too Many Requests`. Even if an attacker exfiltrates the database dump, our passwords are protected by bcrypt (work factor 12, taking 490 ms per guess), making offline cracking mathematically unfeasible.

### 6.4 How It Is Done
1. Define strict Zod validation schemas (`bookingSchema`, `registerSchema`, `loginSchema`) and parse all inbound JSON at the route controller entrance.
2. Hash passwords with bcrypt (cost 12) using unique CSPRNG salts per user.
3. Check passwords against HaveIBeenPwned using the $k$-Anonymity range API (sending only the first 5 SHA-1 characters).
4. Enforce sliding-window rate limiting, returning `HTTP 429` with `Retry-After` headers upon threshold violation.

### 6.5 Where It Goes Wrong
The Proxy IP Spoofing hole: relying naively on the `X-Forwarded-For` header without an upstream reverse proxy stripping untrusted client headers. As evidenced in our testing, an attacker can rotate fake IP addresses in curl headers, evading rate limits completely.

### 6.6 What I Got Wrong
During Task Four, I assumed that in-memory Zod schema validation was the culprit behind a classroom observation of 2-second registration delays. When I instrumented high-resolution hardware benchmarks on my machine (`evidence/11-validation-timing.txt`), I discovered that Zod validation took only 3.0 microseconds (0.003 ms). The real latency was caused by bcrypt hashing (490.72 ms) and synchronous blocking SMTP network calls (1,600+ ms).

---

## Section 7: Sessions, Logout, Account Deletion and Statutory Compliance

### 7.1 The Concept
Session management maintains stateful user authorization via bearer tokens. Lawful account deletion is a multi-stage lifecycle process (immediate lockout &rarr; soft delete &rarr; grace period &rarr; anonymization &rarr; hard purge) that balances citizen privacy rights under the NDPA against statutory accounting retention mandates under FIRS and CITA.

### 7.2 Why It Exists: The Failure It Prevents
Deleting a user row directly from a database wipes out linked financial contribution and invoice records, causing accounting ledgers to fail tax audits (Hauwa's mistake in our curriculum scenario). Furthermore, logging out without server-side revocation leaves dangling session tokens active in stolen caches.

### 7.3 Real-World Scenario
Ibrahim, an organizer for a corporate cooperative society, requests account deletion from Liz's Grillz under Section 34 of the NDPA. Instead of deleting his row directly, the application locks his account immediately, revoking his active sessions. His personal contact details (phone, email, name) are permanently anonymized. However, his 450,000 NGN event catering booking and 270,000 NGN deposit payment records are permanently preserved in PostgreSQL. Six months later, when LIRS tax auditors review Liz's Grillz accounts, the books balance to the exact kobo.

### 7.4 How It Is Done
1. On login, generate a 32-byte cryptographic session token. Store only the SHA-256 hash in PostgreSQL; transmit the raw token in an `HttpOnly; Secure; SameSite=Lax` cookie.
2. On logout, execute an atomic server-side delete (`DELETE FROM "Session" WHERE token = SHA256(rawToken)`).
3. On deletion request, set user status to `LOCKED_DELETION_PENDING` with a 7-day grace period, and revoke all active sessions.
4. Execute an idempotent scheduled background job that purges volatile tokens, anonymizes user identity, and preserves financial ledger records.

### 7.5 Where It Goes Wrong
The Copied-Link Authorization Vulnerability: a protected route checks whether a user is logged in (authentication), but fails to verify whether they possess the required role (authorization). An ordinary client copying an administrative URL (`/admin/kitchen`) gains full access to operational controls.

### 7.6 What I Got Wrong
In Task Five, when building our initial session logout handler, I initially only sent a response header clearing the cookie (`Set-Cookie: liz_session=; Max-Age=0`). I did not delete the corresponding row in PostgreSQL. If an attacker had intercepted the token prior to logout, the token remained completely valid on the server until its 7-day expiration date. I had to refactor the logout route to execute atomic database revocation before clearing the cookie.
