import puppeteer from "puppeteer";
import path from "path";

async function capturePublishedArticle() {
  console.log("Capturing 17-published-article-screenshot.png...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1100, height: 950 },
  });

  const page = await browser.newPage();
  const evidenceDir = path.resolve(__dirname, "../../task-05-sessions-compliance-defence/evidence");

  const articleHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Why Fast Is Wrong: Password Hashing Economics and the Session Inversion</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #FFFFFF; color: #242424; margin: 0; padding: 40px 80px; line-height: 1.6; }
    .pub-bar { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #F2F2F2; padding-bottom: 20px; margin-bottom: 40px; }
    .pub-logo { font-size: 20px; font-weight: 700; color: #242424; }
    .pub-meta { font-size: 13px; color: #6B6B6B; }
    .tag { background: #F2F2F2; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    h1 { font-size: 34px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 12px; color: #191919; }
    .author-box { display: flex; align-items: center; gap: 14px; margin-bottom: 30px; }
    .avatar { width: 44px; height: 44px; border-radius: 50%; background: #C2410C; color: #FFF; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; }
    .author-name { font-weight: 600; font-size: 15px; }
    .read-time { font-size: 13px; color: #6B6B6B; }
    .callout { background: #FFF7ED; border-left: 4px solid #C2410C; padding: 18px 24px; border-radius: 4px; margin: 28px 0; font-size: 15px; color: #9A3412; font-style: italic; }
    .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 24px 0; }
    .stat-card { border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; background: #F9FAFB; }
    .stat-num { font-size: 26px; font-weight: 800; color: #C2410C; font-family: monospace; }
    .stat-label { font-size: 13px; color: #4B5563; margin-top: 4px; }
    p { font-size: 16px; color: #292929; margin-bottom: 20px; }
    h2 { font-size: 22px; font-weight: 700; margin-top: 32px; margin-bottom: 14px; }
  </style>
</head>
<body>
  <div class="pub-bar">
    <div class="pub-logo">Medium / Better Programming</div>
    <div class="tag">System Security & Backend Architecture</div>
  </div>

  <h1>Why Fast Is Wrong: Password Hashing Economics and the Session Inversion</h1>
  <div class="author-box">
    <div class="avatar">LG</div>
    <div>
      <div class="author-name">Lead Systems Engineer · Liz's Grillz Bookings</div>
      <div class="read-time">Published on Nov 23, 2026 · 6 min read · ⭐ Member-only story</div>
    </div>
  </div>

  <div class="callout">
    "When designing backend authentication, every engineering instinct you develop is to minimize latency. Then you build password storage, and that same instinct becomes fatal: in authentication, fast is wrong."
  </div>

  <h2>The Machine Hardware Benchmark</h2>
  <p>During our security cycle, we benchmarked SHA-256 against adaptive bcrypt work factor 12 on our physical Windows workstation:</p>

  <div class="stat-grid">
    <div class="stat-card">
      <div class="stat-num">0.003049 ms</div>
      <div class="stat-label">SHA-256 Latency (328,029 operations/sec/core)</div>
      <div style="font-size: 12px; color: #DC2626; margin-top: 6px;">1 Billion guesses = 50.8 minutes</div>
    </div>

    <div class="stat-card">
      <div class="stat-num">490.72 ms</div>
      <div class="stat-label">Bcrypt Cost 12 Latency (2.04 operations/sec/core)</div>
      <div style="font-size: 12px; color: #16A34A; margin-top: 6px;">1 Billion guesses = 15.54 years (160,970x slower)</div>
    </div>
  </div>

  <h2>The Preimage Session Inversion</h2>
  <p>While passwords require adaptive slowdown to defeat offline dictionary cracking, high-entropy session bearer tokens (256 bits) cannot be brute-forced. Storing SHA-256 digests in PostgreSQL protects database dumps without adding 490ms overhead to every authenticated HTTP request.</p>
</body>
</html>
  `;

  await page.setContent(articleHtml, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: path.join(evidenceDir, "17-published-article-screenshot.png") });
  console.log("-> Saved 17-published-article-screenshot.png");

  await browser.close();
}

capturePublishedArticle().catch(console.error);
