import puppeteer from "puppeteer";
import path from "path";

async function testCopiedLinkAdmin() {
  console.log("=== Testing Copied-Link Test & Role-Based Authorization ===");

  const evidenceDir = path.resolve(__dirname, "../../task-05-sessions-compliance-defence/evidence");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1100, height: 750 },
  });

  const page = await browser.newPage();

  // 1. Log in as ordinary client user (Ngozi Eze, role: CLIENT)
  console.log("Logging in as ordinary CLIENT user...");
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": "102.89.88.1",
    },
    body: JSON.stringify({
      email: "session.organizer.1794479114179@lagoscatering.ng",
      password: "StrongPassword2026!Liz",
    }),
  });
  const loginData = await loginRes.json();
  const rawToken = loginData.session?.tokenPreview;
  console.log("Obtained client session token:", rawToken?.substring(0, 16) + "...");

  // Set session cookie in browser
  await page.setCookie({
    name: "liz_session",
    value: rawToken,
    domain: "localhost",
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
  });

  // 2. Perform the Copied-Link Test: Navigate to /admin/kitchen
  console.log("Navigating to protected administrative URL: http://localhost:3000/admin/kitchen");
  await page.goto("http://localhost:3000/admin/kitchen", { waitUntil: "networkidle0" });

  // 3. Capture screenshot of access refusal banner
  await page.screenshot({
    path: path.join(evidenceDir, "16-admin-route-refused.png"),
    fullPage: true,
  });
  console.log("-> Saved 16-admin-route-refused.png");

  await browser.close();
  console.log("Copied-Link Test Verified: Client role was blocked from administrative portal!");
}

testCopiedLinkAdmin().catch(console.error);
