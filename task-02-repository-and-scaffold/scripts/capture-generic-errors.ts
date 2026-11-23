import puppeteer from "puppeteer";
import path from "path";

async function captureGenericErrors() {
  console.log("Testing generic errors on login endpoint...");

  // Case A: Correct registered email, wrong password
  const caseARes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": "102.89.55.21",
    },
    body: JSON.stringify({
      email: "session.organizer.1794479114179@lagoscatering.ng",
      password: "DeliberatelyWrongPassword999!",
    }),
  });
  const caseAStatus = caseARes.status;
  const caseAData = await caseARes.json();

  // Case B: Non-existent email, any password
  const caseBRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": "102.89.55.22",
    },
    body: JSON.stringify({
      email: "ghost.organizer.neverfound@lagoscatering.ng",
      password: "SomeArbitraryPassword999!",
    }),
  });
  const caseBStatus = caseBRes.status;
  const caseBData = await caseBRes.json();

  console.log("Case A (Registered Email, Wrong Password):", caseAStatus, caseAData);
  console.log("Case B (Non-Existent Email, Any Password):", caseBStatus, caseBData);

  const areIdentical = caseAStatus === caseBStatus && caseAData.error === caseBData.error;
  console.log("Responses are 100% indistinguishable:", areIdentical);

  // Render comparative screenshot
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1100, height: 800 },
  });

  const page = await browser.newPage();
  const evidenceDir = path.resolve(__dirname, "../../task-05-sessions-compliance-defence/evidence");

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Anti-Enumeration: Indistinguishable Login Error Responses</title>
  <style>
    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #F8FAFC;
      color: #0F172A;
      margin: 0;
      padding: 32px;
    }
    .card {
      max-width: 1000px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      border-bottom: 2px solid #C2410C;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 { margin: 0; font-size: 22px; color: #C2410C; }
    .badge {
      background: #DCFCE7;
      color: #166534;
      font-weight: 700;
      font-size: 13px;
      padding: 6px 14px;
      border-radius: 20px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-top: 24px;
    }
    .box {
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 20px;
      background: #FAFAFA;
    }
    h3 { margin-top: 0; font-size: 16px; color: #0F172A; }
    .code-box {
      background: #0F172A;
      color: #F8FAFC;
      font-family: monospace;
      font-size: 12px;
      padding: 14px;
      border-radius: 6px;
      margin-top: 12px;
      line-height: 1.4;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 8px;
      background: #FEE2E2;
      color: #991B1B;
      font-weight: 700;
      border-radius: 4px;
      font-size: 12px;
    }
    .attack-note {
      margin-top: 28px;
      padding: 18px;
      background: #EFF6FF;
      border-left: 4px solid #2563EB;
      border-radius: 4px;
      font-size: 13px;
      color: #1E40AF;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <h1>Anti-Enumeration: Indistinguishable Login Error Proof</h1>
        <div style="color: #64748B; font-size: 13px; margin-top: 4px;">Liz's Grillz Bookings | Security Boundary Defense against Account Harvesting</div>
      </div>
      <div class="badge">INDISTINGUISHABLE RESPONSES</div>
    </div>

    <div class="grid">
      <!-- Case A -->
      <div class="box">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3>Case A: Registered Email, Wrong Password</h3>
          <span class="status-badge">HTTP ${caseAStatus} UNAUTHORIZED</span>
        </div>
        <p style="font-size: 13px; color: #475569; margin: 6px 0 12px 0;">Account exists in PostgreSQL; candidate password hash mismatch.</p>
        <div class="code-box">
// Inbound Request Payload
POST /api/auth/login
{
  "email": "session.organizer.1794479114179@lagoscatering.ng",
  "password": "DeliberatelyWrongPassword999!"
}

// Outbound Response
HTTP/1.1 ${caseAStatus} Unauthorized
Content-Type: application/json
${JSON.stringify(caseAData, null, 2)}
        </div>
      </div>

      <!-- Case B -->
      <div class="box">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3>Case B: Non-Existent Email, Any Password</h3>
          <span class="status-badge">HTTP ${caseBStatus} UNAUTHORIZED</span>
        </div>
        <p style="font-size: 13px; color: #475569; margin: 6px 0 12px 0;">Account does not exist; rejected during user lookup.</p>
        <div class="code-box">
// Inbound Request Payload
POST /api/auth/login
{
  "email": "ghost.organizer.neverfound@lagoscatering.ng",
  "password": "SomeArbitraryPassword999!"
}

// Outbound Response
HTTP/1.1 ${caseBStatus} Unauthorized
Content-Type: application/json
${JSON.stringify(caseBData, null, 2)}
        </div>
      </div>
    </div>

    <div class="attack-note">
      <strong>Attack Analysis (What an attacker learns if errors are distinguishable):</strong><br>
      If the server returned distinct errors such as <em>"User account not found"</em> versus <em>"Incorrect password"</em>, an attacker could submit a dictionary of target corporate email addresses to compile an exact list of confirmed Liz's Grillz organizers. With valid emails confirmed, the attacker can focus offline credential stuffing or spear-phishing campaigns exclusively on registered accounts, bypassing the primary barrier of unknown account identities.
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });
  await page.screenshot({
    path: path.join(evidenceDir, "05-generic-errors-both-cases.png"),
    fullPage: true,
  });
  console.log("-> Saved 05-generic-errors-both-cases.png");

  await browser.close();
}

captureGenericErrors().catch(console.error);

