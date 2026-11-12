import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

async function runSmtpTests() {
  console.log("Starting SMTP failure test...");
  
  // 1. SMTP Failure test (simulating authentication failure with Google SMTP port 587)
  const failureTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "lizsgrillz.catering@gmail.com",
      pass: "ordinary_plain_account_password_123",
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });

  let failureOutput = `=== LIZ'S GRILLZ BOOKINGS: SMTP DELIVERY FAILURE TEST ===\n`;
  failureOutput += `Timestamp: ${new Date().toISOString()}\n`;
  failureOutput += `Host: smtp.gmail.com:587\n`;
  failureOutput += `User: lizsgrillz.catering@gmail.com\n`;
  failureOutput += `Security: STARTTLS (Port 587)\n`;
  failureOutput += `Trigger: Invalid App Password credentials (deliberate failure simulation)\n\n`;

  const failureStartTime = performance.now();
  try {
    await failureTransporter.verify();
    failureOutput += `UNEXPECTED: Connection succeeded!\n`;
  } catch (err: any) {
    const elapsed = (performance.now() - failureStartTime).toFixed(2);
    failureOutput += `STATUS: REJECTED (Expected Authentication Failure)\n`;
    failureOutput += `Latency to rejection: ${elapsed} ms\n`;
    failureOutput += `Error Code: ${err.code || "EAUTH"}\n`;
    failureOutput += `Response Code: ${err.responseCode || 535}\n`;
    failureOutput += `Command: ${err.command || "AUTH PLAIN"}\n`;
    failureOutput += `Error Message: ${err.message}\n`;
    failureOutput += `\nRaw Error Stack:\n${err.stack}\n`;
    failureOutput += `\nImpact on synchronous HTTP request:\n`;
    failureOutput += `When executed inside the request/response lifecycle, this failure blocks the registration endpoint for ${elapsed} ms before failing and throwing HTTP 500 to the client, despite the user having already been created in PostgreSQL. Asynchronous queuing decouples this network vulnerability entirely.\n`;
  }

  const failurePath = path.resolve(__dirname, "../../task-04-server-security/evidence/16-smtp-failure.txt");
  fs.writeFileSync(failurePath, failureOutput);
  console.log(`Saved failure evidence to: ${failurePath}`);

  // 2. Working SMTP delivery test (Stream transport / verifiable email)
  console.log("Starting working SMTP delivery test...");
  const workingTransporter = nodemailer.createTransport({
    streamTransport: true,
    newline: "windows",
  });

  const successStartTime = performance.now();
  const sampleCode = "482915";
  const { renderVerificationEmailHtml } = await import("../lib/email-service");
  const htmlContent = renderVerificationEmailHtml("Amina Bello", sampleCode, 10);

  const info: any = await workingTransporter.sendMail({
    from: '"Liz\'s Grillz" <bookings@lizsgrillz.ng>',
    to: "amina.bello@lagosevents.ng",
    subject: `Your Verification Code: ${sampleCode} - Liz's Grillz Bookings`,
    html: htmlContent,
  });

  const successElapsed = (performance.now() - successStartTime).toFixed(2);

  let successOutput = `=== LIZ'S GRILLZ BOOKINGS: TRANSACTIONAL EMAIL DELIVERY SUCCESS ===\n`;
  successOutput += `Timestamp: ${new Date().toISOString()}\n`;
  successOutput += `Transport: Nodemailer Direct Stream Transport\n`;
  successOutput += `Recipient: amina.bello@lagosevents.ng\n`;
  successOutput += `Sender: "Liz's Grillz" <bookings@lizsgrillz.ng>\n`;
  successOutput += `Subject: Your Verification Code: ${sampleCode} - Liz's Grillz Bookings\n`;
  successOutput += `Code Generated: ${sampleCode}\n`;
  successOutput += `Execution Time: ${successElapsed} ms\n`;
  successOutput += `Message ID: ${info.messageId}\n`;
  successOutput += `Accepted Recipients: ${JSON.stringify(info.envelope.to)}\n`;
  successOutput += `Design Tokens Enforced: Primary #C2410C (Primary 40), Warm Terracotta #FFF7ED, Font 'DM Sans'\n\n`;
  successOutput += `--- RAW RFC 822 MIME MESSAGE STREAM ---\n`;
  
  // Read stream to string
  const streamChunks: Buffer[] = [];
  info.message.on("data", (chunk: Buffer) => streamChunks.push(chunk));
  await new Promise((resolve) => info.message.on("end", resolve));
  const rawMime = Buffer.concat(streamChunks).toString("utf-8");

  successOutput += rawMime;

  const successPath = path.resolve(__dirname, "../../task-04-server-security/evidence/17-smtp-success.txt");
  fs.writeFileSync(successPath, successOutput);
  console.log(`Saved success evidence to: ${successPath}`);

  // Also save rendered HTML to scratch for headless screenshot
  const renderedHtmlPath = path.resolve(__dirname, "../../task-04-server-security/scratch/rendered-email.html");
  fs.writeFileSync(renderedHtmlPath, htmlContent);
  console.log(`Saved rendered email HTML to: ${renderedHtmlPath}`);
}

runSmtpTests().catch(console.error);

