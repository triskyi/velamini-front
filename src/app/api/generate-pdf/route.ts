import { NextRequest } from "next/server";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

// Read logo once and cache as base64 data URL so Puppeteer can render it
// without needing a live HTTP server (relative paths don't resolve in setContent).
function getLogoDataUrl(): string {
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    const data = fs.readFileSync(logoPath);
    return `data:image/png;base64,${data.toString("base64")}`;
  } catch {
    return ""; // watermark optional — don't crash if missing
  }
}

const LOGO_DATA_URL = getLogoDataUrl();

export async function POST(req: NextRequest) {
  let { html } = await req.json();
  if (!html || typeof html !== "string") {
    return new Response(JSON.stringify({ error: "Missing HTML" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Replace any /logo.png references with the inlined base64 so Puppeteer
  // can render the watermark without a running HTTP server.
  if (LOGO_DATA_URL) {
    html = html.replace(/src=['"]\/logo\.png['"]/g, `src="${LOGO_DATA_URL}"`);
  }

  try {
    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();
    return new Response(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=resume.pdf",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "PDF generation failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
