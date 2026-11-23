# Task 05 Interview Defence: Technical Answers

---

### Question 1: What should a secure browser session look like? Name every property and what each one prevents.
**Answer:** A secure browser session must be an opaque, high-entropy cryptographic token generated via CSPRNG (e.g. 32 bytes from `crypto.randomBytes`) and stored in an HTTP cookie with strict defensive attributes:
- `HttpOnly`: Completely hides the cookie from the client DOM (`document.cookie`), preventing Cross-Site Scripting (XSS) credential exfiltration.
- `Secure`: Instructs the browser to transmit the cookie strictly over TLS/HTTPS encrypted connections, preventing network eavesdropping on untrusted venue Wi-Fi in Lagos.
- `SameSite=Lax`: Withholds the cookie on cross-origin requests, defending against Cross-Site Request Forgery (CSRF).
- `Path=/`: Restricts token availability to the application domain origin.
- `Max-Age / Expires`: Limits token lifespan to a finite window (7 days in our application), preventing stolen tokens from lingering indefinitely.
- Server-side: Stored in PostgreSQL strictly as a SHA-256 hash so leaked database snapshots do not yield valid bearer tokens.

---

### Question 2: What is session fixation, and what prevents it?
**Answer:** Session fixation is an attack where an adversary establishes a valid session identifier on the target application and tricks a victim into authenticating using that pre-existing token (e.g. via a malicious link or subdomain cookie injection). If the server retains the same session identifier after authentication, the attacker uses their known copy to impersonate the victim.

It is prevented by strictly rotating session identifiers: upon every successful login, the server must destroy any pre-existing session token, generate a brand-new cryptographic token, persist the new session to PostgreSQL, and issue a fresh `Set-Cookie` header to the browser.

---

### Question 3: Are tokens better than server-side sessions? Answer for your own application, not in general.
**Answer:** For Liz's Grillz Bookings, server-side sessions are superior to stateless tokens (like raw JWTs). Liz's Grillz manages high-value catering contracts and must enforce immediate, enforceable account controls. When an organizer reports a compromised phone, resets their password, or requests account deletion under the Nigerian Data Protection Act (NDPA), our server must execute an immediate, zero-latency revocation of all active sessions across all devices. Stateless JWTs cannot be revoked instantly without maintaining a centralized distributed blocklist, which re-introduces the exact statefulness JWTs attempted to avoid while adding 400+ bytes of base64 header overhead to every mobile request.

---

### Question 4: How would you implement log out of all devices?
**Answer:** In Liz's Grillz Bookings, logging out of all devices executes an atomic database operation:
```typescript
await prisma.session.deleteMany({ where: { userId } });
```
Because session authorization checks validate the incoming cookie against the PostgreSQL `Session` table on protected routes, deleting all session rows for that `userId` immediately invalidates bearer tokens across every browser, phone, and tablet. The current active device then receives a `Set-Cookie` response clearing the local cookie (`Max-Age=0`). Any subsequent request from any other device fails with `HTTP 401 Unauthorized`.

---

### Question 5: How do you invalidate existing sessions on a password change?
**Answer:** When an organizer successfully updates their password, the password update route wraps two operations in a single atomic database transaction:
1. Update `User.passwordHash` with the new bcrypt work factor 12 hash.
2. Invoke `prisma.session.deleteMany({ where: { userId: user.id } })` to purge every existing session row.
The server then issues a single fresh session token specifically for the current authenticated browser session. This ensures that any attacker or stale device holding an old session token is severed instantly at the moment credentials change.

---

### Question 6: What do the HttpOnly, Secure and SameSite cookie flags protect against, and what does each one fail to protect against?
**Answer:**
- `HttpOnly`: Protects against client-side script access via `document.cookie` during XSS attacks. It fails to protect against Cross-Site Request Forgery (CSRF) or network packet sniffing over plain HTTP.
- `Secure`: Protects against unencrypted transmission and Man-in-the-Middle network eavesdropping. It fails to protect against malicious client-side JavaScript reading the cookie if `HttpOnly` is omitted, and does not stop physical access to the device disk.
- `SameSite`: Protects against CSRF attacks by suppressing cookie dispatch on cross-origin requests. It fails to protect against Cross-Site Scripting (XSS) on the same origin or malicious subdomains.

---

### Question 7: What is the difference between a 401 and a 403, and how should the interface treat them differently?
**Answer:** 
`HTTP 401 Unauthorized` means unauthenticated: the client has not provided valid credentials, or their session token has expired. The interface must redirect the user to the login screen (`/auth?mode=login`), optionally preserving the return URL.

`HTTP 403 Forbidden` means unauthorized: the client's identity is authenticated and confirmed, but their account role lacks clearance to view or mutate the resource (e.g. an ordinary client attempting to access the kitchen capacity management dashboard at `/admin/kitchen`). The interface must keep the user logged in, display an explicit access denied notification, and provide a route back to their authorized client portal without redirecting to login.

---

### Question 8: Why must logout be handled on the server rather than the front end, and what exactly stays alive if it is not?
**Answer:** If logout is handled exclusively on the frontend (e.g. clearing `document.cookie` or deleting local storage state), the server receives no notification of the event. The session record in the PostgreSQL `Session` table remains completely active and valid until its nominal 7-day expiration timestamp. If an adversary intercepted the session token prior to logout (via local network sniffing, compromised proxy logs, or browser cache extraction), that stolen bearer token stays completely alive on the server, permitting full unauthorized access. Server-side logout executes an atomic database delete, permanently terminating the token.

---

### Question 9: What is the difference between authentication and authorisation, and which one does a protected route need?
**Answer:** Authentication verifies *who you are* (verifying credentials and establishing identity). Authorisation verifies *what you are allowed to do* (checking whether that verified identity possesses permission to access a specific resource or execute an action).

A protected route requires both: it must first authenticate the caller by validating their session cookie, and then authorize the caller by checking their assigned role (e.g. verifying `user.role === "ADMIN"` before permitting access to `/admin/kitchen`). Checking only authentication leaves the route vulnerable to the copied-link attack.

---

### Question 10: A user asks you to delete their account. Walk me through what happens, from the request to the data being gone.
**Answer:** Under our NDPA compliance architecture, deletion follows a 4-stage lifecycle:
1. **Request & Immediate Lockout**: The user calls `POST /api/account/delete-request`. The server immediately executes `revokeAllUserSessions(user.id)`, revoking active sessions across all devices, sets user status to `LOCKED_DELETION_PENDING`, and clears the client cookie.
2. **Grace Period**: The account enters a 7-day statutory grace period. Subsequent login attempts are refused with `HTTP 403`.
3. **Scheduled Background Sweep**: An automated job runs daily, scanning for accounts whose `scheduledHardDeleteAt` is past.
4. **Atomic Purge & Anonymization**: In a single database transaction, volatile tokens are deleted, personal profile data is permanently anonymized (`fullName = "Anonymized Customer"`, phone zeroed, email scrambled), while financial booking records are preserved for 6-year tax audits.

---

### Question 11: Which data would you refuse to delete on a deletion request, and on what basis?
**Answer:** We refuse to delete financial booking records, invoiced contract amounts, deposit receipts, and payment gateway transaction references. 

**Legal Basis**: While Section 34 of the Nigerian Data Protection Act (NDPA) grants the Right to Erasure, Section 34(2)(b) and 34(2)(c) explicitly exempt data processing necessary for *"compliance with a legal obligation to which the controller is subject under Nigerian law"* and *"the establishment, exercise or defense of legal claims."* Section 63 of the Companies Income Tax Act (CITA) and Federal Inland Revenue Service (FIRS) mandates require businesses to preserve financial accounting books for six years. We satisfy the NDPA by anonymizing personal identity attributes while permanently retaining the monetary ledger.

---

### Question 12: What happens to your backups when a user is deleted?
**Answer:** In cloud production (PostgreSQL on AWS RDS), backups consist of rolling daily snapshots and point-in-time recovery WAL archives stored in AWS S3. It is technically impossible and corruptive to alter historical read-only snapshots to delete individual user rows.

Instead, we enforce a 30-day rolling expiration on backup snapshots; deleted records naturally roll off and are destroyed at day 30. Furthermore, our disaster recovery runbook mandates that if a database restore from an older backup occurs, an automated post-restore synchronization script immediately executes:
```sql
DELETE FROM "User" WHERE id IN (SELECT "userId" FROM "DeletionAuditLog");
```
This guarantees that restored historical backups never resurrect previously erased citizens.

---

### Question 13: What is the difference between anonymising and deleting, and when is anonymising sufficient?
**Answer:** Deleting physically removes database rows (`DELETE FROM table`). Anonymizing strips and overwrites personally identifiable information (`fullName`, `email`, `phone`) with generic unroutable placeholders, breaking any link between the record and a living natural person.

Anonymising is sufficient when legal or business obligations mandate retaining the relational structure or statistical metadata (such as retaining catering transaction records for FIRS tax audits, or calculating quarterly catering guest volumes). Under Section 65 of the NDPA, once data cannot be linked directly or indirectly to an identifiable individual, it ceases to be "personal data" and can be retained indefinitely.

---

### Question 14: Why do you want to work as a forward deployed engineer specifically, rather than as a software engineer?
**Answer:** A pure software engineer builds software to specification in isolation. A forward deployed engineer sits at the exact intersection of software architecture, business operations, and customer reality. In high-stakes enterprise deployments, the hardest failures are never purely algorithmic; they are misalignments between technical assumptions and operational field truths. As proved in our primary research with Lagos catering owners, designing without understanding venue smoke drift, cash flows, and human trust produces technically elegant software that fails commercially. I want to build systems on the front lines where operational constraints shape architectural decisions.

---

### Question 15: A customer says they want to use AI to improve their operations. How do you respond?
**Answer:** I respond by asking them to describe their single most expensive operational bottleneck in plain business terms, without using the word "AI". I ask: Where do your staff spend the most repetitive manual hours? What questions do customers repeatedly ask that take hours to answer? What error costs you the most money each month? AI is a capability, not an objective. If their problem is poor database query latency, fragmented Excel files, or missing email verification, a rule-based script or relational schema solves it with 100% determinism at a fraction of the cost. If their problem is synthesizing unstructured event contracts or unstructured menu queries, we scope a bounded RAG pipeline with strict evaluation metrics.

---

### Question 16: What is the difference between a RAG system and a fine-tuned model for an enterprise deployment?
**Answer:** A fine-tuned model adjusts internal neural network weights using domain-specific training data to learn specialized style, vocabulary, or classification formatting. Fine-tuning is static, expensive, suffers from catastrophic forgetting, and does not provide verifiable source citations. 

Retrieval-Augmented Generation (RAG) keeps the base model unchanged and dynamically injects authoritative external documents into the prompt context at inference time via vector similarity search. RAG is dynamic, updates in seconds when catering menus change without retraining, provides exact source provenance, enforces role-based access control on documents, and dramatically reduces hallucinations.

---

### Question 17: How do you evaluate whether an AI agent is working correctly in production?
**Answer:** You evaluate an AI agent across three deterministic layers rather than relying on qualitative impressions:
1. **Retrieval Precision and Recall**: Measuring whether the vector search retrieved the ground-truth catering menu chunks (`Recall@K`, MRR).
2. **Context Faithfulness and Groundedness**: Evaluating whether every claim in the generated output is directly supported by the retrieved context, using automated LLM-as-a-judge harnesses or RAGAS metrics.
3. **Task Completion and Invariant Constraints**: Verifying that the agent's tool calls and parameter bindings strictly obey business schemas (e.g. guest count $\ge 20$, booking dates $> 48$ hours future) and measuring task success rates against human reference baselines.

---

### Question 18: How do you decide between local component state, context, and an external state manager?
**Answer:** I follow a strict hierarchy of simplicity:
1. **Local Component State (`useState`)**: Used by default for UI concerns scoped to a single component or tight parent-child tree (e.g. form inputs, toggle switches, hover states).
2. **React Context**: Used for low-frequency global values that many disparate components read but rarely update (e.g. current authenticated user profile, active UI theme, localization locale).
3. **External State Manager (Zustand/Redux)**: Justified only when high-frequency state updates must be shared across deeply disjointed component trees where Context causes unacceptable render cascades, such as an interactive real-time venue seating designer with 50+ draggable station objects.

---

### Question 19: How do you handle server state, as distinct from client state?
**Answer:** Client state is ephemeral and owned entirely by the browser (e.g. active tab, modal visibility, current input draft). Server state is remote, asynchronous, shared across multiple users, and owned by the backend database (e.g. kitchen capacity on December 12, booking status, deposit payment confirmation). 

Server state must never be duplicated into an ordinary client-side store without synchronization primitives. I handle server state by treating the server as the single source of truth, using Next.js Server Components, server actions, or specialized caching tools (React Query/SWR) with strict cache-invalidation keys and optimistic mutations.

---

### Question 20: Cite three specific numbers from your own tasks one to four: one from your type scale, one timing figure from your hashing comparison, and one from your rate limit configuration. Explain what each number means and why you chose it.
**Answer:**
1. **Type Scale**: `16px` base font size (`1rem`) with a `24px` line-height (`1.5`). Chosen for our primary form inputs and body text in DM Sans to guarantee legibility and meet WCAG touch target standards across mobile screens in Lagos.
2. **Hashing Comparison Timing**: `490.72 ms` for bcrypt work factor 12 (versus `0.003049 ms` for SHA-256). Measured directly on my physical Windows machine; chosen because half a second is imperceptible to a human organizer logging in, but imposes a 160,970x performance penalty on attackers, making a 1-billion-password dictionary attack take 15.54 years instead of 50.8 minutes.
3. **Rate Limit Configuration**: `5 requests per 15-minute rolling window` (`900 seconds`), returning `HTTP 429 Too Many Requests`. Chosen to block automated credential-stuffing botnets while accommodating legitimate human organizers who mistype their password once or twice.

---

### Question 21: Across all five tasks, name the decision you are least confident about. Say what you would need to find out to settle it, and what you would do if the answer went against you.
**Answer:** I am least confident about shipping **Soft Gating** over Hard Gating in Task Five. While soft gating maximizes registration conversion by allowing organizers to immediately configure catering menus before verifying email, it exposes our database to unverified reservation holds. 

To settle this, I need to monitor our production analytics for 30 days post-launch: specifically tracking the percentage of unverified draft reservations that abandon versus verified bookings that convert, and measuring whether automated spam holds exhaust weekend kitchen capacity. 

If the data shows that unverified bots or fraudulent holds tie up more than 10% of weekend grilling slots, the decision went against me. I would immediately switch our registration controller to enforce **Hard Gating**, blocking session creation and requiring 6-digit email OTP verification before granting access to reservation workflows.

---

### Question 22: Wrong-answer analysis. A candidate says: "For GDPR compliance we added a delete account button that removes the user's row from the database immediately, so we are fully compliant with the right to be forgotten. We also keep backups for a year in case anyone needs their data restored." Two sentences, several problems. Identify each, say which is a legal exposure rather than a technical one, and say what the correct design is.
**Answer:**
1. **Immediate Database Wipe Destroys Financial Records**: Deleting the user row immediately removes linked accounting and payment history, violating statutory tax laws (FIRS/CITA in Nigeria, HMRC in UK) that mandate retaining financial transaction records for 6 years.
2. **The Legal Exposure**: Keeping un-synchronized database backups for a year while promising "full right to be forgotten" is an explicit regulatory breach under GDPR Article 17 and NDPA Section 34. If personal data remains readable in long-term backups without automated synchronization upon restoration, the organization is non-compliant. Furthermore, using backups to "restore deleted users" directly violates the citizen's erasure demand.
3. **The Correct Design**: 
   - Soft delete with a structured grace period (e.g. 7 days) and immediate session revocation.
   - Anonymize personal identity attributes (`fullName`, `email`, `phone`) while permanently retaining monetary booking ledgers.
   - Bounded backup lifecycles (30 days rolling) with automated post-restore deletion sync scripts.
