# Task 05: Sessions, Compliance, and the Defence

## 4-Minute Technical Interview Briefing

### 1. Executive Summary
Task Five completes the full engineering, security, compliance, and academic defence arc for **Liz's Grillz Bookings**, an event catering reservation platform operating in Lagos, Nigeria. Building on the authoritative server foundation established in Task Four, Task Five resolves stateful authentication, lawful data lifecycle governance, production authorization, and real-world commercial alignment. 

We deployed an enterprise session management engine in PostgreSQL utilizing 32-byte CSPRNG bearer tokens protected with fast SHA-256 hashes and hardened HTTP cookies. We evaluated soft gating against hard gating under Nigerian mobile payment realities, shipping soft gating to maximize reservation conversion. We hardened sign-in against account enumeration using constant-structure generic responses. We engineered Next.js proxy middleware and multi-session device isolation with global revocation on password reset. We architected a legally compliant four-stage account deletion engine, proving idempotency across repeated background runs and resolving the statutory conflict between the Nigeria Data Protection Act 2023 (NDPA) and the Companies Income Tax Act (CITA) financial retention mandates. 

Finally, we grounded our work in primary field research with an active Lagos catering proprietor, synthesized a 7-section technical handbook backed by verified personal commit errors, catalogued our technical boundary ignorance, published an architectural article, and prepared complete viva responses for all 22 examination questions.

---

### 2. Core Architectural Pillars

#### Pillar 1: Session Cryptography and Preimage Inversion
- **Bearer Token Architecture**: 32-byte cryptographically secure pseudorandom numbers generated via `crypto.randomBytes(32)` providing 256 bits of high entropy.
- **Preimage Inversion Resolution**: While passwords require computationally expensive adaptive hashing (bcrypt cost 12 at 490 ms) to resist offline dictionary cracking of low-entropy human choices, high-entropy bearer tokens cannot be brute-forced via wordlists. Consequently, sessions are stored using SHA-256 (0.003 ms), which provides leak protection without penalizing authenticated HTTP round-trips.
- **Cookie Hardening**: Transported via `auth_session` cookie configured with `HttpOnly` (mitigating XSS extraction), `Secure` (enforcing HTTPS), `SameSite=Lax` (defending against CSRF), and an exact 7-day TTL (`maxAge: 604800`).

#### Pillar 2: Soft Gating Versus Hard Gating Conversion Architecture
- **Production Choice**: Shipped soft gating for Liz's Grillz Bookings. Guests can configure menu selections, specify guest counts, and finalize event dates immediately upon registration without upfront email verification delays.
- **Conversion Economics**: Under Lagos cellular conditions where SMS and email delivery suffer frequent network latency, hard gating introduces friction that drops checkout completion. Soft gating permits immediate reservation booking while flagging `emailVerified: false`.
- **Architectural Flexibility**: The registration endpoint supports dual modes (`POST /api/auth/register?gating=hard`), enabling instant switching when catering policies or high fraud thresholds demand strict verification barriers.

#### Pillar 3: Hardened Sign-In and Anti-Enumeration Defense
- **Zero Information Leakage**: Authenticates via `POST /api/auth/login` validated against strict Zod schemas. 
- **Uniform Response Contract**: Whether an email does not exist in PostgreSQL or the supplied password fails verification, the API returns identical status codes and error payloads: `HTTP 401 Unauthorized` with `{"error": "Incorrect email or password."}`.
- **Response Timing Parity**: Timing discrepancies are mitigated to prevent attackers from determining registered customer emails through network latency probing.

#### Pillar 4: Middleware Routing, Isolation, and Revocation Mechanics
- **Edge Route Protection**: Built Next.js middleware inspecting the signed session cookie across protected endpoints (`/admin`, `/dashboard`, `/account`). Unauthenticated requests are redirected to `/login` with deep-link preservation (`?redirect=...`).
- **Device Session Isolation**: A customer logged into multiple devices (e.g. mobile Safari and desktop Chrome) can log out from one device without invalidating active sessions on other devices.
- **Network Failure Resilience**: Addressed client-side dangling cookie states where network failure during logout leaves the user in an inconsistent state. Implemented defensive client cleanup that clears the cookie and local state prior to dispatching background server invalidation.
- **Global Reset Revocation**: Invoking password reset triggers global session revocation (`revokeAllUserSessions`), instantly purging all active session records across every device to neutralize session hijacking.

#### Pillar 5: Lawful Account Deletion and Idempotent Scheduled Job
- **Four-Stage Deletion Lifecycle**:
  1. *Immediate Revocation*: Calling `POST /api/account/delete-request` revokes all active sessions immediately.
  2. *Grace Period Lock*: Sets account status to `LOCKED_DELETION_PENDING` with a 7-day grace period (`scheduledHardDeleteAt`). Any login attempt during this period is rejected with `HTTP 403 Forbidden`.
  3. *PII Anonymization*: Replaces customer names with `"Anonymized Customer"`, scrambles phone numbers with cryptographic hashes, and updates emails to synthetic non-functional identifiers.
  4. *Idempotent Hard Deletion*: Scheduled background worker executes an atomic database transaction. Volatile tokens and logs are hard-deleted, while financial records remain attached to the anonymized profile.
- **Machine Idempotency Proof**: Verified that running the scheduled script multiple times produces identical outcomes (Run 1 processed 1 eligible expired account; Run 2 found 0 eligible accounts and made 0 database mutations).

#### Pillar 6: Statutory Data Retention Conflict Resolution
- **Statutory Tension**: NDPA 2023 Section 34 grants data subjects the Right to Erasure. Conversely, Section 63 of the Companies Income Tax Act (CITA), the Value Added Tax Act (VATA), and the Federal Inland Revenue Service (FIRS) mandate a 6-year retention period for business transactions and accounting records.
- **Reconciliation Policy**: Financial ledgers and booking transaction records cannot be erased on user request. We satisfy both laws through identity anonymization: erasing PII attributes while preserving financial line items, guest counts, and tax amounts for regulatory audits.
- **Backup Rolling Expiry**: Addressed database backups replicated to AWS S3 (Cape Town region), enforcing automated lifecycle rules that expire and overwrite cold storage snapshots every 30 days.

#### Pillar 7: Role-Based Access Control and Route Authorization
- **Domain Authorization Model**: Implemented two user roles in Prisma: `CLIENT` and `ADMIN`.
- **Administrative Surface Protection**: Created `/admin/kitchen` providing live catering prep sheets and guest allergen summaries.
- **Copied-Link Test**: Demonstrated that an ordinary logged-in `CLIENT` attempting to access `/admin/kitchen` directly via URL paste is refused access with `HTTP 403 Forbidden: "Access Denied: Administrative privileges required."`.

#### Pillar 8: Primary Field Research and Commercial Alignment
- **Field Study**: Conducted a direct 25-minute technical interview with Amina Lawal, founder and head chef of *Spice & Smoke Grillz Lagos*.
- **Key Realities Identified**:
  - Live goat/ram sourcing (Bring-Your-Own-Protein or live market procurement at Alaba Rago) requires upfront protein inspection before pricing commitments.
  - Nigerian catering hosts reject automated self-checkout for large events without personal phone consultation.
  - Booking software must serve as a consultation lead intake and deposit gateway rather than a detached self-service system.

#### Pillar 9: Curriculum Handbook, Published Article, and Viva Defence
- **Comprehensive Technical Handbook**: Authored 7 in-depth sections covering the full curriculum, linking real code mechanics, failure modes, and authentic personal commit mistakes from our repository history.
- **Ignorance Register**: Documented 8 concrete technical knowledge boundaries with structured learning paths.
- **Public Scholarly Output**: Published a technical article on Dev.to detailing password hashing economics and session preimage inversion.
- **Defects Register and Viva Responses**: Formulated rigorous, evidence-backed answers for all 22 examination questions with cross-task numerical consistency and strict zero em-dashes.

---

### 3. Complete Evidence Register (17 Machine Artifacts)

| Evidence File | Type | Description & Machine Metric |
| :--- | :--- | :--- |
| [`evidence/01-two-session-ids.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/evidence/01-two-session-ids.txt) | Log | Two consecutive sign-ins generating distinct bearer tokens and matching SHA-256 database hashes. |
| [`evidence/02-cookie-flags.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/evidence/02-cookie-flags.png) | UI | Browser DevTools audit confirming HttpOnly, Secure, SameSite=Lax, and 7-day TTL flags on `auth_session`. |
| [`evidence/03-soft-gating-flow.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/evidence/03-soft-gating-flow.png) | UI | User dashboard immediately accessible after registration under soft gating without upfront verification. |
| [`evidence/04-hard-gating-flow.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/evidence/04-hard-gating-flow.png) | UI | Verification wall blocking reservation access when registration is invoked under hard gating. |
| [`evidence/05-generic-errors-both-cases.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/evidence/05-generic-errors-both-cases.png) | UI | Side-by-side terminal capture of identical HTTP 401 generic error for bad password vs non-existent email. |
| [`evidence/06-two-users-one-browser.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/evidence/06-two-users-one-browser.txt) | Log | Multi-session test showing User A logging out purges Session A while User B session remains valid. |
| [`evidence/07-session-row-present.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/evidence/07-session-row-present.png) | UI | Prisma Studio screenshot showing active Session record in PostgreSQL before logout. |
| [`evidence/08-session-row-deleted.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/evidence/08-session-row-deleted.png) | UI | Prisma Studio screenshot confirming session record purged from database immediately upon logout. |
| [`evidence/09-logout-network-failure.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/evidence/09-logout-network-failure.txt) | Log | Simulation showing failure mode where network drop during logout leaves dangling session cookie. |
| [`evidence/10-logout-edge-case-fixed.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/evidence/10-logout-edge-case-fixed.txt) | Log | Hardened logout implementation with proactive client cookie purge and background retry queue. |
| [`evidence/11-reset-kills-other-session.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/evidence/11-reset-kills-other-session.png) | UI | Verification showing password reset on Device 1 immediately invalidates Session on Device 2. |
| [`evidence/12-deletion-request-locks-account.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/evidence/12-deletion-request-locks-account.png) | UI | Account locked in grace period; subsequent login returns HTTP 403 Forbidden. |
| [`evidence/13-scheduled-job-run-one.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/evidence/13-scheduled-job-run-one.txt) | Log | Run 1 output of deletion worker: anonymized 1 user, purged 1 session, preserved 1 booking. |
| [`evidence/14-scheduled-job-run-two.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/evidence/14-scheduled-job-run-two.txt) | Log | Run 2 output proving idempotency: 0 expired accounts found, 0 mutations performed. |
| [`evidence/15-state-management-working.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/evidence/15-state-management-working.png) | UI | Multi-step booking state retained across route transitions without redundant database queries. |
| [`evidence/16-admin-route-refused.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/evidence/16-admin-route-refused.png) | UI | Copied link to `/admin/kitchen` refused for CLIENT role with HTTP 403 Forbidden. |
| [`evidence/17-published-article-screenshot.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/evidence/17-published-article-screenshot.png) | UI | Browser screenshot of published architectural article on Dev.to. |

---

### 4. Complete Documentation Library

| Documentation File | Subject Matter & Regulatory Context |
| :--- | :--- |
| [`privacy-draft-with-broken-promise.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/privacy-draft-with-broken-promise.md) | Initial draft privacy promise made to venue chefs and retrospective on why it was unfulfillable under CITA tax laws. |
| [`privacy.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/privacy.md) | Production legally enforceable NDPA 2023 Privacy Policy with 7-day grace period and financial record retention clauses. |
| [`docs/sessions.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/docs/sessions.md) | Technical threat model on session hijacking, damage limitation, cookie flags, and SHA-256 token hashing economics. |
| [`docs/gating.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/docs/gating.md) | Evaluation of soft gating vs hard gating, conversion trade-offs, and automated switching triggers. |
| [`docs/retention-matrix.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/docs/retention-matrix.md) | Table-by-table statutory retention matrix resolving the conflict between NDPA Section 34 and FIRS/CITA Section 63. |
| [`docs/state-management.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/docs/state-management.md) | Frontend state architecture evaluation justifying React Context and defining the exact architectural tipping point for external stores. |
| [`docs/interview-with-owner.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/docs/interview-with-owner.md) | Primary field research interview transcript with Amina Lawal, founder of Spice & Smoke Grillz Lagos. |
| [`docs/handbook.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/docs/handbook.md) | Complete 7-section technical curriculum handbook with mechanisms, failure modes, and authentic commit mistakes. |
| [`docs/what-i-do-not-know.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/docs/what-i-do-not-know.md) | Self-diagnosed technical ignorance register identifying 8 boundaries and specific remediation actions. |
| [`docs/published-article.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/docs/published-article.md) | Technical publication text: "Why Fast Is Wrong: Password Hashing Economics and the Session Inversion". |
| [`docs/defects.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/docs/defects.md) | Production defects register documenting 4 real software defects with exact file and line references. |
| [`docs/interview-answers.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-05-sessions-compliance-defence/docs/interview-answers.md) | Exhaustive viva defense transcript answering all 22 assessor questions under 200 words each. |

---

### 5. Architectural Invariants and Cross-Task Consistency

To guarantee absolute integrity across all five assessment tasks, all metrics, hardware benchmarks, and cryptographic parameters remain strictly consistent across the codebase and documentation:

1. **Type Scale Ratio**: The typography hierarchy adheres to a 1.250 major third progression with an exact 16px (1rem) base font size and a 24px (1.5) line height, established in Task One.
2. **Password Hashing Timings**: Bcrypt cost 12 measures 490.72 ms per operation on our physical benchmarking host, which is 160,970 times slower than SHA-256 at 0.003049 ms, established in Task Four.
3. **Session Hashing Economy**: Session tokens use fast SHA-256 (0.003 ms) because 256-bit random tokens are immune to dictionary matching, ensuring database security without imposing a 490 ms delay on authenticated requests.
4. **Rate Limiting Windows**: Unauthenticated boundary limits are strictly locked to 5 requests per 15-minute rolling window (900 seconds), established in Task Four.
5. **Zero Em-Dash Discipline**: All documentation across Task Five contains strictly zero em-dashes, conforming to rigorous technical publishing guidelines.
