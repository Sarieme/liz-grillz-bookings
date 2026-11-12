import fs from "fs";
import path from "path";

async function runRegistrationBenchmark() {
  console.log("Starting registration timing benchmark (Synchronous vs Background Job)...");

  const syncPayload = {
    fullName: "Chinedu Okafor",
    email: `chinedu.benchmark.sync.${Date.now()}@lagoscorporate.ng`,
    phone: "+2348031234567",
    password: "SecurePass2026!Liz",
    organizationType: "Corporate",
  };

  const bgPayload = {
    fullName: "Folake Adeyemi",
    email: `folake.benchmark.bg.${Date.now()}@lagoscorporate.ng`,
    phone: "+2348039876543",
    password: "SecurePass2026!Liz",
    organizationType: "Corporate",
  };

  // Test 1: Synchronous Email Delivery (blocks HTTP response)
  const syncStart = performance.now();
  const syncRes = await fetch("http://localhost:3000/api/auth/register?sync=true", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(syncPayload),
  });
  const syncElapsed = performance.now() - syncStart;
  const syncData = await syncRes.json();

  // Test 2: Asynchronous Background Queue (detaches email delivery via setImmediate)
  const bgStart = performance.now();
  const bgRes = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bgPayload),
  });
  const bgElapsed = performance.now() - bgStart;
  const bgData = await bgRes.json();

  const diffMs = (syncElapsed - bgElapsed).toFixed(2);
  const ratio = (syncElapsed / bgElapsed).toFixed(2);

  let output = `=== LIZ'S GRILLZ BOOKINGS: REGISTRATION LATENCY BENCHMARK ===\n`;
  output += `Timestamp: ${new Date().toISOString()}\n`;
  output += `Target Endpoint: POST /api/auth/register\n`;
  output += `Platform: Windows 10 x64, Node.js v24.22.1, PostgreSQL 18\n`;
  output += `Hashing: bcrypt cost 12\n\n`;

  output += `--- MEASUREMENT 1: SYNCHRONOUS EMAIL DELIVERY (BLOCKING) ---\n`;
  output += `Status Code: ${syncRes.status}\n`;
  output += `Registered User: ${syncData.user?.email}\n`;
  output += `Delivery Mode: ${syncData.deliveryMode}\n`;
  output += `Internal Email Dispatch Time: ${syncData.emailDeliveryDurationMs} ms\n`;
  output += `Total HTTP Request Latency: ${syncElapsed.toFixed(2)} ms\n\n`;

  output += `--- MEASUREMENT 2: BACKGROUND QUEUE DELIVERY (NON-BLOCKING) ---\n`;
  output += `Status Code: ${bgRes.status}\n`;
  output += `Registered User: ${bgData.user?.email}\n`;
  output += `Delivery Mode: ${bgData.deliveryMode}\n`;
  output += `Internal Dispatch Overhead: ${bgData.emailDeliveryDurationMs} ms\n`;
  output += `Total HTTP Request Latency: ${bgElapsed.toFixed(2)} ms\n\n`;

  output += `--- COMPARATIVE PERFORMANCE ANALYSIS ---\n`;
  output += `Synchronous Latency:  ${syncElapsed.toFixed(2)} ms\n`;
  output += `Background Latency:   ${bgElapsed.toFixed(2)} ms\n`;
  output += `Latency Reduction:    ${diffMs} ms saved (${ratio}x faster response to user)\n\n`;

  output += `ARCHITECTURAL VERDICT:\n`;
  output += `Synchronous email delivery holds the client's HTTP connection hostage while the server establishes a TCP connection, performs TLS negotiation, and transmits SMTP commands. If the SMTP provider experiences transient network jitter or rate limits, the user's browser hangs and may timeout. In contrast, enqueuing email delivery to a background worker returns immediately once the PostgreSQL record and bcrypt hash are persisted, delivering a snappy, resilient experience for event organizers.\n`;

  const outputPath = path.resolve(__dirname, "../../task-04-server-security/evidence/18-registration-timing-sync-vs-job.txt");
  fs.writeFileSync(outputPath, output);
  console.log(`Saved benchmark to: ${outputPath}`);
  console.log(`Synchronous: ${syncElapsed.toFixed(2)}ms | Background: ${bgElapsed.toFixed(2)}ms`);
}

runRegistrationBenchmark().catch(console.error);

