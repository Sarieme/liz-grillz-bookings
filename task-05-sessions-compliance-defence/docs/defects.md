# Task 05 Production Defects & Known Limitations Register

## 1. Overview
In accordance with rigorous software engineering and viva defense standards, this document registers real production defects, operational trade-offs, and architectural edge cases identified in the Task Five session, compliance, and deletion codebase. Each defect is mapped to its exact source file, line numbers, failure condition, and quantitative business or security cost in production.

---

## 2. Defects Log

### 2.1 Dangling Session Row Retention on Network-Dropped Logout
- **Location**: [`task-02-repository-and-scaffold/app/api/auth/logout/route.ts`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/app/api/auth/logout/route.ts#L17-L23)
- **Code Reference**:
  ```typescript
  if (rawToken) {
    await revokeSession(rawToken);
  }
  ```
- **Defect Description**: If an organizer clicks "Sign Out" while experiencing an abrupt mobile cellular network drop (common across 3G/4G networks in Lagos), the browser optimistic handler clears the client cookie and redirects to `/auth`. However, the HTTP request never reaches the backend. The session row remains active in PostgreSQL on the server until its 7-day expiration timestamp (`expiresAt`).
- **Production Failure Condition**: If the raw token was intercepted prior to logout, the attacker can continue making authenticated API calls with the stolen token until the 7-day TTL expires, despite the legitimate user believing they have logged out.
- **Production Cost**: Moderate. Mitigated by our 7-day hard session expiration and global invalidation upon password reset or deletion request (`revokeAllUserSessions`). Fix requires an explicit client beacon retry worker (`navigator.sendBeacon`) with offline queue sync.

---

### 2.2 Lack of Distributed Locking (Mutex) on Scheduled Deletion Cron Execution
- **Location**: [`task-02-repository-and-scaffold/scripts/scheduled-deletion-job.ts`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/scripts/scheduled-deletion-job.ts#L29-L39)
- **Code Reference**:
  ```typescript
  const eligibleUsers = await prisma.user.findMany({
    where: {
      status: "LOCKED_DELETION_PENDING",
      scheduledHardDeleteAt: { lte: now },
    },
  });
  ```
- **Defect Description**: The scheduled hard-deletion job queries eligible accounts without acquiring an advisory lock or distributed Redis mutex lock.
- **Production Failure Condition**: If the application scales to two or more container instances and both instances trigger the deletion cron simultaneously, both containers execute the same query and attempt concurrent updates on the same user records. While PostgreSQL transactions prevent corruption, concurrent execution generates redundant database load and potential lock serialization errors.
- **Production Cost**: Low to Moderate. Fix requires wrapping the job execution in a PostgreSQL advisory lock (`pg_try_advisory_lock`) or Redis Redlock instance before scanning.

---

### 2.3 Unhandled Edge Case for Reactivated Deletion Requests
- **Location**: [`task-02-repository-and-scaffold/app/api/account/delete-request/route.ts`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/app/api/account/delete-request/route.ts#L33-L41)
- **Code Reference**:
  ```typescript
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      status: "LOCKED_DELETION_PENDING",
      deletionRequestedAt: now,
      scheduledHardDeleteAt,
    },
  });
  ```
- **Defect Description**: Once a user initiates an account deletion request and their account status is set to `LOCKED_DELETION_PENDING`, the login endpoint strictly refuses access (`HTTP 403 Forbidden`). However, the self-service web interface currently lacks an automated "Cancel Deletion Request & Reactivate Account" button on the login rejection screen.
- **Production Failure Condition**: An organizer who changes their mind on day 3 of the 7-day grace period cannot unilaterally unlock their account through self-service web actions. They must submit a manual support ticket to `privacy@lizsgrillz.ng`, requiring engineering or administrative intervention to reset their status to `ACTIVE`.
- **Production Cost**: Moderate customer support friction. Fix requires adding an authenticated email-based reactivation link dispatched to the organizer upon login attempt during the active grace period.

---

### 2.4 Lack of Foreign Key Cascade Deletion on Non-Financial Session Storage
- **Location**: [`task-02-repository-and-scaffold/prisma/schema.prisma`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/prisma/schema.prisma#L29)
- **Code Reference**:
  ```prisma
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  ```
- **Defect Description**: While `Session` has `onDelete: Cascade`, our scheduled hard deletion job anonymizes the user record rather than deleting the primary key row (`DELETE FROM "User"`). Consequently, cascading deletes do not fire automatically during anonymization.
- **Production Failure Condition**: The scheduled job must manually execute explicit queries to purge volatile child records (`deleteMany({ where: { userId } })`). If a developer adds a new child model to `User` in future tasks without updating `scheduled-deletion-job.ts`, that new child model will be orphaned rather than cleaned up.
- **Production Cost**: Low. Fix requires a schema audit or migrating to an automated database trigger (`BEFORE UPDATE ON "User"`).
