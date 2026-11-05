const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting backfill for populated Booking rows...");
  const beforeCount = await prisma.booking.count({
    where: { cancellationReason: null }
  });
  console.log(`Found ${beforeCount} rows with NULL cancellationReason.`);

  const updateResult = await prisma.booking.updateMany({
    where: { cancellationReason: null },
    data: { cancellationReason: "N/A - Active Legacy Reservation" }
  });

  console.log(`Successfully backfilled ${updateResult.count} rows.`);

  const afterCount = await prisma.booking.count({
    where: { cancellationReason: null }
  });
  console.log(`Remaining NULL rows: ${afterCount}`);
}

main()
  .catch((e) => {
    console.error("Backfill failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
