const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("[DRIFT TEST] Querying Booking with newly generated client field 'driftTestField'...");
  const records = await prisma.booking.findMany({
    select: {
      id: true,
      clientName: true,
      driftTestField: true
    }
  });
  console.log("Success (unexpected):", records);
}

main()
  .catch((e) => {
    console.error("\n[PRISMA SCHEMA DRIFT ERROR ENCOUNTERED]");
    console.error("Code:", e.code);
    console.error("Message:\n" + e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
