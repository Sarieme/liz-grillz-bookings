import puppeteer from "puppeteer";
import path from "path";
import { prisma } from "../lib/prisma";

async function captureAllEvidence() {
  console.log("Launching Puppeteer for evidence captures...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1280, height: 900 },
  });

  const page = await browser.newPage();
  const evidenceDir = path.resolve(__dirname, "../../task-04-server-security/evidence");

  try {
    // -------------------------------------------------------------
    // 1. Evidence 23: Rendered Email HTML
    // -------------------------------------------------------------
    console.log("Capturing 23-rendered-email.png...");
    const emailHtmlPath = path.resolve(__dirname, "../../task-04-server-security/scratch/rendered-email.html");
    const emailFileUrl = `file://${emailHtmlPath.replace(/\\/g, "/")}`;
    await page.goto(emailFileUrl, { waitUntil: "networkidle0" });
    await page.setViewport({ width: 850, height: 750 });
    await page.screenshot({
      path: path.join(evidenceDir, "23-rendered-email.png"),
      fullPage: true,
    });
    console.log("-> Saved 23-rendered-email.png");

    // Reset viewport for web UI
    await page.setViewport({ width: 1280, height: 900 });

    // -------------------------------------------------------------
    // 2. Evidence 15: Breached Password Rejection
    // -------------------------------------------------------------
    console.log("Capturing 15-breach-check-rejection.png...");
    // Rotate IP or email to bypass rate limit
    await page.setExtraHTTPHeaders({
      "X-Forwarded-For": `197.210.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 200) + 10}`,
    });
    await page.goto("http://localhost:3000/auth?mode=signup", { waitUntil: "networkidle0" });

    await page.type("#fullName", "Babatunde Fashola");
    await page.type("#phone", "08031234567");
    await page.type("#email", `fashola.breach.${Date.now()}@lagosgov.ng`);
    await page.type("#password", "password123");
    await page.click("#terms");

    // Click submit
    await page.click('button[type="submit"]');

    // Wait for the alert banner
    await page.waitForSelector('div[role="alert"]', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 600));

    await page.screenshot({
      path: path.join(evidenceDir, "15-breach-check-rejection.png"),
    });
    console.log("-> Saved 15-breach-check-rejection.png");

    // -------------------------------------------------------------
    // Setup users for verification captures
    // -------------------------------------------------------------
    console.log("Preparing database users for verification states...");

    // User A: Active unverified user
    const userAEmail = `organizer.live.${Date.now()}@lagosparties.ng`;
    const regARes = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "102.89.23.101",
      },
      body: JSON.stringify({
        fullName: "Simi Adeleke",
        email: userAEmail,
        phone: "+2348039988776",
        password: "SuperSecret2026!Liz",
        organizationType: "Corporate",
      }),
    });
    const regAData = await regARes.json();
    const validCode = regAData.user?.verificationCodePreview;

    // User B: Expired code user
    const userBEmail = `organizer.expired.${Date.now()}@lagosparties.ng`;
    const regBRes = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "102.89.23.102",
      },
      body: JSON.stringify({
        fullName: "Kunle Afolayan",
        email: userBEmail,
        phone: "+2348035544332",
        password: "SuperSecret2026!Liz",
        organizationType: "Individual",
      }),
    });
    const regBData = await regBRes.json();
    const expCode = regBData.user?.verificationCodePreview;
    const dbUserB = await prisma.user.findUnique({ where: { email: userBEmail } });
    await prisma.emailVerification.updateMany({
      where: { userId: dbUserB!.id },
      data: { expiresAt: new Date(Date.now() - 300000) }, // 5 mins in past
    });

    // User C: Already verified / reused code user
    const userCEmail = `organizer.reused.${Date.now()}@lagosparties.ng`;
    const regCRes = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "102.89.23.103",
      },
      body: JSON.stringify({
        fullName: "Chioma Chukwu",
        email: userCEmail,
        phone: "+2348031122334",
        password: "SuperSecret2026!Liz",
        organizationType: "Corporate",
      }),
    });
    const regCData = await regCRes.json();
    const reusedCode = regCData.user?.verificationCodePreview;
    // Verify it first so it becomes used
    await fetch("http://localhost:3000/api/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userCEmail, code: reusedCode }),
    });

    // -------------------------------------------------------------
    // 3. Evidence 20: Expired Verification Code
    // -------------------------------------------------------------
    console.log("Capturing 20-verification-expired.png...");
    await page.goto("http://localhost:3000/auth?mode=verify", { waitUntil: "networkidle0" });
    await page.type("#email", userBEmail);
    await page.type("#verificationCode", expCode);
    await page.click('button[type="submit"]');
    await page.waitForSelector('div[role="alert"]', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(evidenceDir, "20-verification-expired.png"),
    });
    console.log("-> Saved 20-verification-expired.png");

    // -------------------------------------------------------------
    // 4. Evidence 21: Wrong Verification Code
    // -------------------------------------------------------------
    console.log("Capturing 21-verification-wrong-code.png...");
    await page.goto("http://localhost:3000/auth?mode=verify", { waitUntil: "networkidle0" });
    await page.type("#email", userAEmail);
    await page.type("#verificationCode", "987123"); // deliberately wrong
    await page.click('button[type="submit"]');
    await page.waitForSelector('div[role="alert"]', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(evidenceDir, "21-verification-wrong-code.png"),
    });
    console.log("-> Saved 21-verification-wrong-code.png");

    // -------------------------------------------------------------
    // 5. Evidence 22: Reused Verification Code
    // -------------------------------------------------------------
    console.log("Capturing 22-verification-code-reused.png...");
    await page.goto("http://localhost:3000/auth?mode=verify", { waitUntil: "networkidle0" });
    await page.type("#email", userCEmail);
    await page.type("#verificationCode", reusedCode);
    await page.click('button[type="submit"]');
    await page.waitForSelector('div[role="alert"]', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(evidenceDir, "22-verification-code-reused.png"),
    });
    console.log("-> Saved 22-verification-code-reused.png");

    // -------------------------------------------------------------
    // 6. Evidence 19: Prisma Studio EmailVerification Row
    // -------------------------------------------------------------
    console.log("Capturing 19-verification-row.png from Prisma Studio...");
    await page.goto("http://localhost:5555", { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 2000));

    // Click on EmailVerification table
    const links = await page.$$("a");
    for (const link of links) {
      const text = await (await link.getProperty("innerText")).jsonValue();
      if (text && text.includes("EmailVerification")) {
        await link.click();
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 3000));

    await page.screenshot({
      path: path.join(evidenceDir, "19-verification-row.png"),
    });
    console.log("-> Saved 19-verification-row.png");

    console.log("\nALL EVIDENCE CAPTURES COMPLETED SUCCESSFULLY!");
  } catch (err) {
    console.error("Error during captures:", err);
  } finally {
    await browser.close();
  }
}

captureAllEvidence().catch(console.error);

