# Task 04: The Server Is the Source of Truth

## 4-Minute Technical Interview Briefing

### 1. Executive Summary
Task Four establishes the authoritative server boundary for **Liz's Grillz Bookings**, a high-volume event catering reservation system operating in Lagos, Nigeria. In previous tasks, we established design tokens, repository scaffolding, diagnostics, and client-side form controls. In Task Four, we demonstrated that client-side controls provide zero security against direct HTTP bypasses. We migrated from an in-memory data model to a production relational schema in PostgreSQL 18, enforced forward-only schema migrations with zero downtime, proved the economics of adaptive password hashing on our physical hardware, erected strict server boundary validation using Zod, implemented sliding-window rate limiting and revealed proxy IP spoofing risks, integrated k-Anonymity breached credential checking, and deployed a resilient asynchronous email verification engine.

---

### 2. Core Architectural Pillars

#### Pillar 1: Relational Schema & Migration Engineering
- **Domain Focus**: Derived exclusively for Lagos event catering (minimum 20 guests, 70/30 split payments, LIRS/FIRS 14-month tax audit compliance).
- **6-Table Topology**: `User`, `Session`, `Booking`, `PaymentAttempt`, `RetrievalChunk`, and `EmailVerification`.
- **Deliberate Migration Discipline**: Forward-only migrations via Prisma Migrate. Documented safe 3-step zero-downtime column migrations (optional column, data backfill, make required) and resolved intentional schema drift (`P2022`).

#### Pillar 2: Password Hashing Economics (Argon2id / Bcrypt vs SHA-256)
- **Authentic Machine Benchmarking**:
  - SHA-256: `0.003049 ms` (328,029 operations/sec/core).
  - Bcrypt (cost 12): `490.72 ms` (2.04 operations/sec/core).
- **Attacker Economics**: Bcrypt is 160,970x slower on our hardware. Cracking a 1-billion-password dictionary takes 50.8 minutes on SHA-256 versus 15.54 years on bcrypt, neutralizing offline brute-force attacks upon stolen database tables.

#### Pillar 3: Server Boundary Validation & Attack Refusal
- **Boundary Placement**: Pre-database in-memory Zod parsing executes in 3.0 microseconds.
- **Repeat Direct Curl Attack**: The Task Three unvalidated payload that previously succeeded is rejected at the server boundary with `HTTP 400 Bad Request` and descriptive validation errors before touching SQL execution.

#### Pillar 4: Rate Limiting & Proxy IP Defeat
- **Sliding-Window Limiter**: Limits unauthenticated registration and login attempts to 5 requests per 15-minute rolling window, returning `HTTP 429 Too Many Requests` with `Retry-After`.
- **Defeat Demonstration**: Proved that trusting the leftmost `X-Forwarded-For` header allows an attacker to bypass rate limiting via arbitrary IP rotation from a single client.

#### Pillar 5: Breached Password Checking ($k$-Anonymity)
- **Zero-Knowledge Privacy**: Integrated HaveIBeenPwned range API using SHA-1 prefixes (first 5 characters, 20 bits of entropy). Verified with `password123` (identified 2,266,543 sightings and rejected with `HTTP 400`). Plaintext passwords never leave the server boundary.

#### Pillar 6: Transactional Verification & Asynchronous Email
- **Code Security**: 6-digit CSPRNG numeric tokens generated via `crypto.randomInt`, hashed with SHA-256 before storage in `EmailVerification.codeHash`, with 10-minute expiry and attempt tracking.
- **Asynchronous Decoupling**: Benchmarked synchronous SMTP dispatch (`3985.05 ms`) versus asynchronous background job queue (`789.77 ms`), yielding a 5.05x faster response to users while insulating registration from SMTP network timeouts.

---

### 3. Complete Evidence Register (23 Machine Artifacts)

| Evidence File | Type | Description & Machine Metric |
| :--- | :--- | :--- |
| [`evidence/01-schema-drawing.jpg`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/01-schema-drawing.jpg) | Photo | Hand-drawn relational schema drawing captured on camera. |
| [`evidence/02-database-state-before.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/02-database-state-before.png) | UI | Baseline database state prior to migrations in Prisma Studio. |
| [`evidence/03-initial-migration.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/03-initial-migration.txt) | Log | Terminal output of initial 6-table Prisma schema migration. |
| [`evidence/04-required-column-failure.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/04-required-column-failure.txt) | Log | Terminal output of failed required column migration on populated table. |
| [`evidence/05-required-column-three-steps.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/05-required-column-three-steps.txt) | Log | Safe 3-step zero-downtime migration sequence execution log. |
| [`evidence/06-drift-error.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/06-drift-error.txt) | Log | Terminal output of intentional schema drift error (P2022). |
| [`evidence/07-hash-twice-different.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/07-hash-twice-different.txt) | Log | Same password hashed twice generating unique cryptographic salts. |
| [`evidence/08-timing-argon-vs-sha.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/08-timing-argon-vs-sha.txt) | Metric | Timing benchmark: SHA-256 (0.003049 ms) vs bcrypt cost 12 (490.72 ms). |
| [`evidence/09-email-case-normalised.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/09-email-case-normalised.png) | UI | Capitalized registration logged in with lowercase email. |
| [`evidence/10-password-trim-working.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/10-password-trim-working.png) | UI | Password registered with trailing space logged in with trimmed password. |
| [`evidence/11-validation-timing.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/11-validation-timing.txt) | Metric | In-memory Zod schema validation execution timing (3.0 microseconds). |
| [`evidence/12-direct-request-before-and-after.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/12-direct-request-before-and-after.txt) | Log | Side-by-side terminal comparison of curl attack before and after Zod. |
| [`evidence/13-rate-limit-triggered.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/13-rate-limit-triggered.png) | UI | Browser interface showing HTTP 429 rate limit lockout after 5 attempts. |
| [`evidence/14-rate-limit-defeated.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/14-rate-limit-defeated.txt) | Log | Terminal log proving rate limit evasion via X-Forwarded-For IP spoofing. |
| [`evidence/15-breach-check-rejection.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/15-breach-check-rejection.png) | UI | Registration refusal banner for breached password (2,266,543 sightings). |
| [`evidence/16-smtp-failure.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/16-smtp-failure.txt) | Log | Authentic SMTP connection failure log (1603.74 ms blocking time, EAUTH 535). |
| [`evidence/17-smtp-success.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/17-smtp-success.txt) | Log | RFC 822 MIME stream output of branded transactional email delivery. |
| [`evidence/18-registration-timing-sync-vs-job.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/18-registration-timing-sync-vs-job.txt) | Metric | Synchronous (3985.05 ms) vs Background Job (789.77 ms) latency comparison. |
| [`evidence/19-verification-row.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/19-verification-row.png) | UI | Prisma Studio showing EmailVerification row with codeHash and expiresAt. |
| [`evidence/20-verification-expired.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/20-verification-expired.png) | UI | Browser UI showing expired verification code refusal error banner. |
| [`evidence/21-verification-wrong-code.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/21-verification-wrong-code.png) | UI | Browser UI showing incorrect verification code refusal error banner. |
| [`evidence/22-verification-code-reused.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/22-verification-code-reused.png) | UI | Browser UI showing already-used code replay refusal error banner. |
| [`evidence/23-rendered-email.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/evidence/23-rendered-email.png) | UI | Rendered HTML transactional email applying Task One brand tokens. |

---

### 4. Technical Documentation Library

1. [`docs/schema.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/docs/schema.md): 6-table schema design, index write costs, and LIRS/FIRS 14-month tax audit scenario.
2. [`docs/migrations.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/docs/migrations.md): Forward-only migration discipline, the 3-step safe pattern, schema drift handling, and propose-and-stop rules.
3. [`docs/hashing.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/docs/hashing.md): In-depth hardware benchmark analysis proving why fast hashing is fatal for credential security.
4. [`docs/validation-placement.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/docs/validation-placement.md): Validation placement architecture, lifecycle ordering, and in-memory execution efficiency.
5. [`docs/rate-limiting.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/docs/rate-limiting.md): Sliding-window rate limiting mechanics, shared IP multi-tenant challenges, and proxy spoofing analysis.
6. [`docs/breach-check.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/docs/breach-check.md): Mathematical privacy architecture of k-Anonymity range queries against HaveIBeenPwned.
7. [`docs/verification-design.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/docs/verification-design.md): CSPRNG token generation, SHA-256 storage, 10-minute expiry justification, and attack defenses.
8. [`docs/email-copy.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/docs/email-copy.md): Critical analysis contrasting AI marketing copy against human engineering transactional communication.
9. [`docs/not-implemented.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/docs/not-implemented.md): 4 deferred security controls, deferral rationale, and concrete production implementation triggers.
10. [`docs/defects.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/docs/defects.md): Register of 4 real codebase defects with exact file and line references and production costs.
11. [`docs/interview-answers.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-04-server-security/docs/interview-answers.md): Complete technical viva defense answering all 19 interview questions under 200 words each.

