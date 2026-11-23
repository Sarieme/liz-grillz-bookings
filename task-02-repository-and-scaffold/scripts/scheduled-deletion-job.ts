import { prisma } from "../lib/prisma";

export interface ScheduledJobResult {
  jobName: string;
  startedAt: string;
  completedAt: string;
  eligibleAccountsFound: number;
  anonymizedAccountsCount: number;
  sessionsPurgedCount: number;
  verificationsPurgedCount: number;
  financialBookingsPreservedCount: number;
  errorsCount: number;
}

/**
 * Idempotent Scheduled Hard-Deletion Background Job
 * Scans PostgreSQL for accounts where status = 'LOCKED_DELETION_PENDING' and scheduledHardDeleteAt <= NOW().
 * Executes in a single atomic transaction.
 * Retains financial booking records for LIRS/FIRS audit while purging volatile sessions and anonymizing PII.
 */
export async function runScheduledHardDeletionJob(): Promise<ScheduledJobResult> {
  const startedAt = new Date().toISOString();
  console.log(`[SCHEDULED DELETION JOB START] Timestamp: ${startedAt}`);

  const now = new Date();

  // Find eligible accounts whose grace period has lapsed
  const eligibleUsers = await prisma.user.findMany({
    where: {
      status: "LOCKED_DELETION_PENDING",
      scheduledHardDeleteAt: {
        lte: now,
      },
    },
    include: {
      bookings: true,
      sessions: true,
      verifications: true,
    },
  });

  const eligibleCount = eligibleUsers.length;
  console.log(`[SCHEDULED DELETION JOB TELEMETRY] Found ${eligibleCount} expired accounts eligible for hard deletion.`);

  let anonymizedCount = 0;
  let sessionsPurged = 0;
  let verificationsPurged = 0;
  let bookingsPreserved = 0;
  let errorsCount = 0;

  for (const user of eligibleUsers) {
    try {
      // Execute each account's hard deletion / anonymization in a single atomic transaction
      await prisma.$transaction(async (tx) => {
        // 1. Purge all volatile sessions
        const sessRes = await tx.session.deleteMany({ where: { userId: user.id } });
        sessionsPurged += sessRes.count;

        // 2. Purge all email verification tokens
        const verifRes = await tx.emailVerification.deleteMany({ where: { userId: user.id } });
        verificationsPurged += verifRes.count;

        // 3. Count financial booking records preserved for tax compliance
        bookingsPreserved += user.bookings.length;

        // 4. Anonymize user profile (Right to Erasure compliance under NDPA)
        // Replaces personal identity while keeping the foreign key relationship valid
        await tx.user.update({
          where: { id: user.id },
          data: {
            fullName: `Anonymized Customer [NDPA-REQ-${user.id.substring(user.id.length - 6)}]`,
            email: `anonymized.${user.id}@deleted.lizsgrillz.ng`,
            phone: "+2340000000000",
            passwordHash: "DELETED_ACCOUNT_CREDENTIAL_VOID",
            organizationType: "Anonymized",
            status: "DELETED",
          },
        });

        anonymizedCount++;
      });
      console.log(`[SCHEDULED DELETION JOB PROCESSED] User ${user.id} anonymized. Financial bookings preserved: ${user.bookings.length}`);
    } catch (err: any) {
      console.error(`[SCHEDULED DELETION JOB ERROR] Failed to process user ${user.id}:`, err.message);
      errorsCount++;
    }
  }

  const completedAt = new Date().toISOString();
  console.log(
    `[SCHEDULED DELETION JOB FINISH] Timestamp: ${completedAt} | Eligible: ${eligibleCount} | Processed: ${anonymizedCount} | Sessions Purged: ${sessionsPurged} | Bookings Preserved: ${bookingsPreserved} | Errors: ${errorsCount}`
  );

  return {
    jobName: "NDPA_SCHEDULED_HARD_DELETION",
    startedAt,
    completedAt,
    eligibleAccountsFound: eligibleCount,
    anonymizedAccountsCount: anonymizedCount,
    sessionsPurgedCount: sessionsPurged,
    verificationsPurgedCount: verificationsPurged,
    financialBookingsPreservedCount: bookingsPreserved,
    errorsCount,
  };
}

// Allow direct CLI execution
if (require.main === module) {
  runScheduledHardDeletionJob()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

