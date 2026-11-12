# Task 04 Interview Defence: Technical Answers

---

### Question 1: Why should you hash passwords?
**Answer:** Passwords must never be stored in readable format because database breaches, leaked SQL dumps, insider threats, and logging accidents happen. Hashing applies a one-way mathematical function that converts plaintext into a fixed-length digest. While anyone can verify whether a supplied candidate password hashes to the stored digest, reversing the digest back to plaintext is computationally infeasible. Even if Liz's Grillz database backups or server disks are completely exfiltrated, attackers cannot directly read organizer passwords or reuse them across other internet accounts.

---

### Question 2: Why use bcrypt instead of SHA-256 for passwords?
**Answer:** SHA-256 is an algorithm designed for rapid cryptographic integrity verification, hashing gigabytes per second. On my test machine, SHA-256 computed in 0.003049 milliseconds (328,029 operations per second per CPU core). On commodity GPUs, an attacker computes billions of SHA-256 guesses per second. Bcrypt is deliberately slow and computationally intensive. With a work factor of 12 on my machine, bcrypt takes 490.72 milliseconds per hash. This 160,970x performance penalty neutralizes brute-force dictionaries, forcing attackers to spend over 15 years testing what SHA-256 checks in 50 minutes.

---

### Question 3: What is a salt and why do you need it?
**Answer:** A salt is cryptographically random data generated per user and concatenated with the password before hashing. Without salts, identical passwords produce identical digests, allowing attackers to detect shared passwords across users and perform offline lookups against precomputed rainbow tables. Salting forces the attacker to compute a completely fresh dictionary search for every single account individually, eliminating multi-target economies of scale. Bcrypt automatically generates a unique 128-bit salt and bundles it within the resulting output string.

---

### Question 4: What salt rounds, or what work factor, should you use? Give a number and defend it.
**Answer:** Liz's Grillz uses work factor 12. Bcrypt work factors scale exponentially ($2^{\text{cost}}$ iterations). On our production Node.js host, cost 12 benchmarks at 490.72 milliseconds. This timing represents an optimal operational equilibrium: half a second is imperceptible to a human event organizer submitting a login form, yet it limits a single-core attacker to approximately two offline password guesses per second. Cost 10 (120 ms) is too fast for modern ASIC/GPU clusters, while cost 14 (1.9 seconds) risks CPU starvation and Denial of Service during peak catering reservation rushes.

---

### Question 5: You are storing user passwords in a database. Of plain text, SHA-256, AES-256 encryption and adaptive hashing, which is correct and why are the other three wrong? Note that one of the three wrong answers is wrong for a different reason from the other two.
**Answer:** Adaptive hashing (bcrypt/Argon2id) is correct because it is one-way, salted, and supports tunable computational hardness. Plain text is catastrophic because anyone with read access instantly compromises every credential. SHA-256 is wrong because it lacks computational work factor; attackers test billions of combinations per second offline. AES-256 encryption is wrong for a fundamentally different architectural reason: encryption is reversible by design. It requires a decryption key. If an attacker breaches the application server or environment secrets, they obtain the key, decrypt every password, and recover full plaintext.

---

### Question 6: Why is client-side validation not enough?
**Answer:** Client-side validation executes entirely inside the user's browser, an environment under complete user manipulation. Anyone can disable JavaScript, modify DOM form rules via DevTools, or bypass the browser interface entirely using curl, Postman, or automated scripts. In our Task Three testing, sending raw JSON directly to our booking endpoint bypassed every browser boundary constraint. Client-side validation exists purely for immediate user feedback; the server must treat all inbound network bytes as potentially malicious and enforce every schema constraint independently.

---

### Question 7: What security checks belong in the frontend, and what must the server enforce regardless?
**Answer:** No security check belongs exclusively in the frontend. The frontend manages user experience: checking format masks, confirming password match fields, and preventing accidental submissions before network round trips. The server must enforce all security boundaries regardless: validating payload structures, bounds checking numeric guest counts, trimming whitespace, sanitizing SQL parameters, executing rate limiting, verifying session authorization, and matching one-way hashes against database state.

---

### Question 8: The user interface hides the delete button for non-administrators. Is that enough? If not, what does an attacker do instead?
**Answer:** Hiding a button is cosmetic obscurity, not access control. An attacker inspects client JavaScript bundles, finds the API route (`DELETE /api/bookings/:id`), and issues an HTTP request directly via curl or Fetch. The server must inspect the authenticated session token, query the database to determine whether the user possesses the `ADMIN` role, and reject unauthorized requests with `HTTP 403 Forbidden`. Authorization must be enforced at the server controller boundary, not the presentation layer.

---

### Question 9: What is the difference between validation, encoding and sanitisation?
**Answer:** Validation checks data against strict structural constraints (types, lengths, regex patterns) and rejects invalid inputs with an error. Sanitization cleans or mutates input data to remove hazardous elements (such as stripping leading/trailing whitespace or removing null bytes) while permitting the request to continue. Encoding translates data into a safe structural format for a specific target interpreter (such as converting HTML entities `&` and `<` to prevent Cross-Site Scripting when rendering user names in emails or views).

---

### Question 10: Why would you replace the incoming request body with the parsed and validated data rather than leaving both available?
**Answer:** Leaving the raw request body available creates object mass-assignment vulnerabilities. If downstream database handlers access `request.body` instead of the validated schema object, extra unexpected properties injected by an attacker (such as `isAdmin: true` or `depositPaid: true`) can be written directly to the database. Replacing the body with Zod's parsed output guarantees that only explicitly permitted, stripped, and type-coerced properties reach business logic and persistence layers.

---

### Question 11: Why validate route parameters and query strings, not just the body?
**Answer:** Route parameters and URL query strings feed directly into database queries, file lookups, and pagination algorithms. An unvalidated parameter invites SQL injection, path traversal (e.g. `../../etc/passwd`), or Denial of Service via massive allocations (`?limit=10000000`). Validating route parameters with schemas ensures that IDs are valid UUIDs/CUIDs and integer limits fall within safe boundaries before invoking database queries.

---

### Question 12: How do you rate limit unauthenticated requests, and what is the problem with the header you would reach for first?
**Answer:** Unauthenticated requests are limited using client IP tracking via a sliding-window counter. The most common header developers reach for is `X-Forwarded-For`. The critical vulnerability is that `X-Forwarded-For` is easily forged. Unless an upstream reverse proxy (like Cloudflare or AWS ALB) strips incoming headers and writes the true connecting socket address, an attacker can rotate arbitrary spoofed IP addresses in curl (`-H "X-Forwarded-For: 1.2.3.4"`), completely evading the rate limit as proved in our machine testing.

---

### Question 13: Which rate limiting algorithm would you choose for a production API, and what is the boundary burst problem?
**Answer:** I choose a sliding-window rate limiter. The fixed-window algorithm resets counters at fixed clock intervals (e.g. at 12:00, 12:15). This creates the boundary burst problem: an attacker sends their entire quota (5 requests) at 12:14:59 and another 5 requests at 12:15:01, bursting 10 requests within two seconds without violating the nominal limit. A sliding window evaluates timestamps across a continuous rolling timeframe, guaranteeing that request velocity never exceeds the configured threshold across any arbitrary rolling window.

---

### Question 14: Why use a shared store for your counters rather than in-memory counters on each server?
**Answer:** In-memory counters live on the local process heap. When an application scales across multiple container instances or serverless functions, requests from a single attacker hit different nodes. An attacker facing five container replicas effectively gains $5 \times$ the intended request quota. Furthermore, rolling deployments or container restarts instantly reset in-memory counters to zero. A shared store like Redis provides a single, persistent, atomic counter source across all application instances.

---

### Question 15: What HTTP status code should a rate limiter return, and why is 403 the wrong choice?
**Answer:** A rate limiter must return `HTTP 429 Too Many Requests`. Status `403 Forbidden` indicates that the client lacks permission to access the resource, implying that retrying with the same credentials will never succeed. `429 Too Many Requests` specifically communicates that the client has sent too many requests in a given amount of time, and must be accompanied by a `Retry-After` header indicating how many seconds the client must pause before retrying.

---

### Question 16: What do you do when your rate limit store is unavailable: fail open or fail closed? Answer for your own application specifically.
**Answer:** For Liz's Grillz Bookings, we fail open. If our rate-limiting cache crashes, we allow reservation requests through rather than locking out legitimate Lagos corporate event planners attempting to book catering dates. Liz's Grillz is a commercial business where rejecting valid multi-million naira catering reservations causes immediate financial loss. We log rate-limit store failures as high-priority alerts to engineering, but prioritize business availability over temporary denial-of-service defense.

---

### Question 17: You have two timing numbers for hashing, from your own machine. Walk me through what they mean for an attacker who has stolen your user table.
**Answer:** On my machine, SHA-256 runs in 0.003049 milliseconds while bcrypt cost 12 takes 490.72 milliseconds. For an attacker with an exfiltrated user database attempting an offline brute-force attack against a dictionary of one billion candidate passwords:
With SHA-256, testing 1,000,000,000 guesses takes 3,049 seconds, or 50.8 minutes on a single CPU core. On a GPU cluster, it takes seconds.
With bcrypt cost 12, testing the same 1,000,000,000 guesses takes 490,720,000 seconds, which equals 15.54 years per core. The attacker is economically defeated.

---

### Question 18: How does a breached password check avoid sending the password anywhere? Explain the mechanism in your own words, then say what the naive version would leak.
**Answer:** We implement the HaveIBeenPwned $k$-Anonymity range model. The client or server hashes the candidate password with SHA-1 locally. It sends only the first 5 hexadecimal characters (20 bits of entropy) to the external API. The API returns a list of matching hash suffixes without knowing which one, if any, belongs to the user. Our server matches the remaining 35 characters locally in memory. The naive version would send the plaintext password or full hash over the network, exposing user credentials to third-party interception, logging, or subpoena.

---

### Question 19: Wrong-answer analysis. A candidate says: "I hash passwords with SHA-256 plus a random salt per user, which means even if the database is stolen the passwords cannot be reversed, because hashing is one-way. I also rate limit login attempts by IP, so brute force is not possible." Every sentence contains something true. Say what is wrong, in order of severity, and what the candidate has misunderstood about the threat model.
**Answer:**
1. **Critical Failure**: SHA-256 has zero computational work factor. Even with a per-user salt, an attacker with a stolen database computes hundreds of millions of salted guesses per second per GPU core. Fast hashes are fatal for passwords.
2. **Threat Model Misunderstanding**: The candidate conflates online brute-force attacks with offline cracking. IP rate limiting only protects the live HTTP endpoint. Once the database is stolen, the attacker cracks hashes offline on their own GPU rig where our IP rate limiter does not exist.
3. **Flawed Assumption**: Claiming hashes "cannot be reversed" ignores dictionary matching. While hashes cannot be mathematically inverted, matching hashes against precomputed or generated dictionaries recovers weak passwords in milliseconds.

