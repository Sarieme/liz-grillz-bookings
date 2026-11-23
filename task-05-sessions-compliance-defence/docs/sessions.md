# Session Security Architecture & Hijacking Defense

## 1. Overview
In Liz's Grillz Bookings, session management maintains persistent, stateful authorization for corporate and celebratory event organizers reserving high-capacity catering dates. Because sessions grant direct access to financial bookings, deposit invoices, and customer personal records, the session token is a bearer credential equivalent to an identity badge. This document details the session hijacking threat model, token lifecycles, and our multi-layered defense architecture.

---

## 2. Threat Modeling: Session Hijacking

### 2.1 What Session Hijacking Is
Session hijacking occurs when an unauthorized adversary obtains a valid session identifier belonging to an authenticated user. Once in possession of this token, the attacker presents it in HTTP request headers (`Cookie: liz_session=<token>`). Because HTTP is stateless and authentication typically happens only at login, backend systems accept the token as proof of identity and process requests as if the legitimate organizer initiated them.

### 2.2 How a Stolen Identifier Is Used
An attacker with a stolen session identifier can:
1. Impersonate the event organizer to inspect private event logistics and invoice histories.
2. Cancel or alter scheduled catering reservations without authorization.
3. Attempt unauthorized booking requests or tamper with guest headcounts.
4. Exfiltrate personal organizer records in violation of the Nigerian Data Protection Act (NDPA).

---

## 3. What Logging Out Does to the Session
In insecure systems, "logout" simply removes the cookie from the client browser via JavaScript or a clear-cookie header, leaving the session record active on the server. If the token was intercepted prior to logout, the attacker can continue using it until it reaches its nominal expiration date.

In Liz's Grillz Bookings, logging out executes an atomic server-side revocation:
1. The client issues a `POST /api/auth/logout` request containing the session cookie.
2. The server extracts the cookie, computes its SHA-256 hash, and immediately deletes the corresponding row from PostgreSQL:
   ```typescript
   await prisma.session.delete({ where: { token: tokenHash } });
   ```
3. The server then transmits a `Set-Cookie` header with `Max-Age=0` and an empty string, forcing the browser to destroy its local copy.
Once the database row is deleted, subsequent requests bearing the intercepted token fail database validation (`HTTP 401 Unauthorized`), instantaneously terminating attacker access.

---

## 4. Multi-Layered Damage Limitation Controls

Even in worst-case scenarios where an identifier is stolen or a database dump is leaked, Liz's Grillz enforces five defense layers:

### 4.1 Token Hashing at Rest (Preimage Resistance)
- **Vulnerability Mitigated**: Database exfiltration, SQL injection, and leaked developer database dumps.
- **Implementation**: The server generates 32 bytes of cryptographic entropy via `crypto.randomBytes(32)` (64 hexadecimal characters). The raw token is sent exclusively to the client cookie. PostgreSQL stores only the SHA-256 one-way cryptographic digest.
- **Security Impact**: An adversary who downloads the entire `Session` table cannot hijack active sessions because reversing SHA-256 to plaintext is mathematically impossible.

### 4.2 Comprehensive Cookie Hardening Flags
As evidenced in `evidence/02-cookie-flags.png`, our session cookie enforces four strict browser security attributes:
- **`HttpOnly: true`**: Completely removes the cookie from the DOM API (`document.cookie`). Client-side XSS vulnerabilities cannot read or exfiltrate the token.
- **`Secure: true`**: Forces browsers to transmit the cookie strictly over TLS encrypted HTTPS connections, preventing Wi-Fi packet sniffing across public venue networks in Lagos.
- **`SameSite: Lax`**: Restricts cookie transmission on cross-origin requests, blocking Cross-Site Request Forgery (CSRF) exploits from third-party malicious sites.
- **`Path: /`**: Scopes the token exclusively to the origin application root.

### 4.3 Bound Telemetry (IP Address & User-Agent Tracking)
Every session row in PostgreSQL records the originating client IP address and user-agent string upon creation. This provides forensic auditability for suspicious geographic jumps or automated scraping tools.

### 4.4 Bounded Session Lifetime (7 Days)
Sessions possess a strict maximum lifetime of 7 days (`SESSION_DURATION_MS = 604,800,000 ms`). Expired tokens are rejected at the server boundary and cleaned up, preventing dormant tokens from lingering indefinitely.

### 4.5 Global Invalidation on Password Reset and Deletion
When an organizer changes their password or requests account deletion under NDPA rules, `revokeAllUserSessions(userId)` executes an atomic bulk purge:
```typescript
await prisma.session.deleteMany({ where: { userId } });
```
This guarantees that any stolen tokens across all devices are immediately invalidated.

