import { prisma } from "../lib/prisma";

async function testVerificationFlows() {
  console.log("=== Testing Verification Scenarios ===");

  const testEmail = `verify.test.${Date.now()}@lagoscatering.ng`;

  // 1. Register user
  console.log("1. Registering user:", testEmail);
  const regRes = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Dapo Alabi",
      email: testEmail,
      phone: "+2348021112233",
      password: "StrongPass2026!Liz",
      organizationType: "Corporate",
    }),
  });
  const regData = await regRes.json();
  const rawCode = regData.user?.verificationCodePreview;
  console.log(`Registered! ID=${regData.user?.id}, Code=${rawCode}`);

  // Scenario A: Wrong code
  console.log("\n2. Scenario A: Testing wrong code (999999)...");
  const wrongRes = await fetch("http://localhost:3000/api/auth/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      code: "999999",
    }),
  });
  console.log(`Wrong Code Response [${wrongRes.status}]:`, await wrongRes.json());

  // Scenario B: Correct code
  console.log("\n3. Scenario B: Testing correct code verification...");
  const correctRes = await fetch("http://localhost:3000/api/auth/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      code: rawCode,
    }),
  });
  console.log(`Correct Code Response [${correctRes.status}]:`, await correctRes.json());

  // Scenario C: Replay / reuse of already verified code
  console.log("\n4. Scenario C: Testing replay / reused code...");
  const reuseRes = await fetch("http://localhost:3000/api/auth/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      code: rawCode,
    }),
  });
  console.log(`Reused Code Response [${reuseRes.status}]:`, await reuseRes.json());

  // Scenario D: Expired code
  console.log("\n5. Scenario D: Testing expired code...");
  const expiredEmail = `expired.user.${Date.now()}@lagoscatering.ng`;
  const regExpRes = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Yemi Solade",
      email: expiredEmail,
      phone: "+2348029998877",
      password: "StrongPass2026!Liz",
      organizationType: "Individual",
    }),
  });
  const regExpData = await regExpRes.json();
  const expUser = await prisma.user.findUnique({ where: { email: expiredEmail } });
  
  // Artificially expire the token in DB
  await prisma.emailVerification.updateMany({
    where: { userId: expUser!.id },
    data: { expiresAt: new Date(Date.now() - 60000) }, // 1 minute in the past
  });

  const expRes = await fetch("http://localhost:3000/api/auth/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: expiredEmail,
      code: regExpData.user?.verificationCodePreview,
    }),
  });
  console.log(`Expired Code Response [${expRes.status}]:`, await expRes.json());
}

testVerificationFlows().catch(console.error);

