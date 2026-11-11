# Breached Password Verification and the k-Anonymity Privacy Model

## 1. Overview and Threat Context

Over 80% of confirmed corporate data breaches exploit stolen, weak, or reused passwords. In consumer and business web applications, users consistently reuse passwords across multiple services. When an unrelated external database is compromised, adversaries compile credential dumps and execute automated credential stuffing attacks against every known corporate portal.

To protect Liz's Grillz Bookings, we implemented a real-time breached password verification gate during account registration. If an applicant enters a password that has appeared in public breach dumps, the server rejects registration with a descriptive security advisory, compelling the user to select an uncompromised password.

Crucially, verifying whether a password exists in a multi-billion record breach corpus without compromising the applicant's privacy is one of the most prominent technical interview questions in web security.

---

## 2. The Naive Approach and Why It Is Unacceptable

A naive engineer tasked with checking password breaches might consider two trivial architectures, both of which represent catastrophic security failures:

### Naive Failure 1: Sending Plaintext Passwords Over the Network
- In this broken pattern, the application sends the user's plaintext password in an HTTP request to an external verification service:
  `GET https://api.breachcheck.com/check?password=Password123!`
- **Why Unacceptable**: Transmitting plaintext passwords to any third-party infrastructure completely destroys confidentiality. The external API provider, their cloud hosting vendor, their TLS inspection proxies, and their internal debug logs now possess the user's raw password in clear text. If that third party is compromised, the user's password is stolen at the exact moment they registered.

### Naive Failure 2: Sending Full Hash Digests
- Attempting to improve privacy by computing a full cryptographic hash (e.g. SHA-1) and sending that hash:
  `GET https://api.breachcheck.com/check?hash=CBFDAC6008F9CAB4083784CBD1874F76618D2A97`
- **Why Unacceptable**: A full cryptographic hash is deterministic. Because breach corpuses consist of billions of precomputed hashes of common passwords, sending the full hash is functionally identical to sending the plaintext password. The receiving API merely performs a constant-time reverse lookup in their database table to identify the exact plaintext string.

Both naive approaches violate the foundational principle of zero-trust architecture: no external network service should ever be granted the ability to deduce or reconstruct a user's password.

---

## 3. The Solution: k-Anonymity Range Queries

To solve this problem mathematically, Troy Hunt and Cloudflare designed the $k$-Anonymity range model implemented in HaveIBeenPwned (HIBP). The term $k$-anonymity refers to a mathematical privacy guarantee where an individual piece of data is indistinguishable from at least $k-1$ other records in the same cohort.

### The Exact Cryptographic Sequence
1. **Local Hash Generation**:
   - The server computes the uppercase SHA-1 cryptographic hash of the user's input password. For example, the password `password123` yields:
     $$\text{SHA-1} = \text{CBFDAC6008F9CAB4083784CBD1874F76618D2A97}$$
2. **Cryptographic Segmentation (Prefix vs. Suffix)**:
   - The 40-character hexadecimal string is partitioned into two distinct segments:
     - **Prefix (First 5 characters)**: `CBFDA`
     - **Suffix (Remaining 35 characters)**: `C6008F9CAB4083784CBD1874F76618D2A97`
3. **The Blinded Range Query**:
   - The application dispatches an HTTP request transmitting ONLY the 5-character prefix:
     `GET https://api.pwnedpasswords.com/range/CBFDA`
   - Notice that the prefix is only 20 bits of entropy ($16^5 = 1{,}048{,}576$ possible prefixes across billions of hashes).
4. **Cohort Retrieval ($k$-Group Response)**:
   - The HIBP API receives the 5-character prefix and returns all hash suffixes in its corpus that begin with those exact five characters, along with their observed breach frequency counts. In our benchmark, the API returned 1,972 distinct suffixes sharing prefix `CBFDA`.
5. **Local In-Memory Evaluation**:
   - Our server receives the text payload and scans the returned suffixes locally in memory.
   - It searches for our 35-character suffix `C6008F9CAB4083784CBD1874F76618D2A97`.
   - If a line matches, our server extracts the breach count (`2,266,543`) and rejects registration. If no line matches, the password is clean.

### Why This Guarantees Total Privacy
Because the external API only ever receives the 5-character prefix `CBFDA`, the external API provider learns only that the user's password is one of nearly two thousand possible hash combinations. It is mathematically impossible for the API provider, network eavesdroppers, or intervening proxy logs to determine which of the 1,972 passwords the applicant actually typed. Total confidentiality is maintained with mathematical certainty.

