# Real Production Defects Register

## 1. Overview
In accordance with professional engineering integrity standards, this document registers real technical defects, architectural edge cases, and known limitations currently existing in the Task Four server security implementation. Each defect is mapped to its exact source file, line numbers, failure condition, and quantitative business or security cost in production.

---

## 2. Defects Log

### 2.1 Process-Local In-Memory Rate Limiting Cache
- **Location**: [`task-02-repository-and-scaffold/lib/rate-limiter.ts`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/lib/rate-limiter.ts#L6)
- **Code Reference**: `const rateLimitStore = new Map<string, number[]>();`
- **Defect Description**: The sliding-window rate limiter stores request timestamps in a Node.js process-level `Map` on the V8 heap.
- **Production Failure Condition**: When Next.js restarts during zero-downtime rolling deploys or when container scaling deploys across 2 or more replicas, memory is not shared. An attacker distributing requests across multiple backend pods can execute $N \times 5$ attempts per 15 minutes, where $N$ is the replica count. Furthermore, container restarts immediately flush all lockout history.
- **Production Cost**: Moderate. In single-instance production, an attacker can trigger container crashes (OOM or uncaught exceptions) to reset their lockout window. Fix requires deploying Redis or Dragonfly with atomic Redis Cell sliding-window scripts.

---

### 2.2 Untrusted Client IP Extraction via `X-Forwarded-For`
- **Location**: [`task-02-repository-and-scaffold/lib/rate-limiter.ts`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/lib/rate-limiter.ts#L46-L54)
- **Code Reference**:
  ```typescript
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  ```
- **Defect Description**: The rate limiter inspects the leftmost entry in the `X-Forwarded-For` request header without verifying whether the incoming socket connection originated from a trusted reverse proxy (such as Cloudflare, AWS ALB, or Nginx).
- **Production Failure Condition**: As demonstrated in our Task Four evidence file `evidence/14-rate-limit-defeated.txt`, an attacker can send arbitrary random IP strings in the `X-Forwarded-For` header with each curl request, completely bypassing the 5-attempt registration limit from a single workstation.
- **Production Cost**: High. If deployed directly to the internet without a hardened edge ingress proxy configured to strip or overwrite `X-Forwarded-For`, brute-force credential stuffing and registration spam cannot be stopped by this header check alone.

---

### 2.3 Single Active Verification Token Constraint Conflict
- **Location**: [`task-02-repository-and-scaffold/app/api/auth/verify-code/route.ts`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/app/api/auth/verify-code/route.ts#L32-L35)
- **Code Reference**:
  ```typescript
  const verification = await prisma.emailVerification.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  ```
- **Defect Description**: The verification query orders by `createdAt: desc` and validates only the newest token. If a user clicks "Resend Code" twice due to mobile network lag, two rows exist in `EmailVerification`.
- **Production Failure Condition**: If the user receives the first email second due to SMTP out-of-order delivery and enters that code, the server compares it against the second code hash and returns `HTTP 400 Invalid verification code`. Furthermore, old expired tokens remain in the database indefinitely without an automated cleanup cron job or TTL index.
- **Production Cost**: Low to Moderate. Causes user confusion when multiple codes are dispatched across unstable cellular connections. Fix requires invalidating all prior active tokens (`used = true`) when issuing a new verification token.

---

### 2.4 Lack of Re-Registration Rate Limit on Unverified Accounts
- **Location**: [`task-02-repository-and-scaffold/app/api/auth/register/route.ts`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/app/api/auth/register/route.ts#L68-L76)
- **Code Reference**:
  ```typescript
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return NextResponse.json({ error: "An account with this email address already exists." }, { status: 409 });
  }
  ```
- **Defect Description**: If a legitimate organizer registers with a typo in their email or fails to verify within 10 minutes, their email remains permanently occupied in the `User` table with `isVerified: false`.
- **Production Failure Condition**: The organizer cannot re-register using the same email address because `findUnique` detects the existing row and throws `HTTP 409 Conflict`. There is currently no automated expiration of unverified user rows or a "resend code to unverified user" flow on the login page.
- **Production Cost**: Moderate. Results in abandoned registrations and manual database interventions by support staff. Fix requires allowing unverified users to request a fresh verification code upon login attempt.

