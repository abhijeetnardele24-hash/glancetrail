/**
 * GlanceTrail - Browser Mock Screenshot Generator
 * 
 * DISCLAIMER:
 * This script captures screenshots of the 2D prototype located in
 * prototype/browser-mock/index.html.
 * These screenshots are strictly for design reference and MUST NOT
 * be used as Lens Studio Interactive Preview evidence.
 */

import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const mockUrl = `file://${path.join(projectRoot, "prototype", "browser-mock", "index.html").replace(/\\/g, "/")}`;
const mockScreenshotsDir = path.join(projectRoot, "prototype", "browser-mock", "screenshots");

async function capture() {
  console.log("Capturing 2D prototype reference screenshots from prototype/browser-mock/index.html...");

  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--allow-file-access-from-files"]
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1
  });

  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
  page.on("pageerror", (err) => console.log("PAGE ERROR:", err));

  await page.goto(mockUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // 1. Welcome
  await page.evaluate(() => (window as any).setSimState("welcome"));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(mockScreenshotsDir, "01_welcome.png") });
  console.log("Captured prototype/browser-mock/screenshots/01_welcome.png");

  // 2. Guided Problem
  await page.evaluate(() => (window as any).setSimState("problem"));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(mockScreenshotsDir, "02_guided_problem.png") });
  console.log("Captured prototype/browser-mock/screenshots/02_guided_problem.png");

  // 3. Guided Proof with Detail
  await page.evaluate(() => (window as any).setSimState("proof_detail"));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(mockScreenshotsDir, "03_guided_proof_detail.png") });
  console.log("Captured prototype/browser-mock/screenshots/03_guided_proof_detail.png");

  // 4. Connected Trail
  await page.evaluate(() => (window as any).setSimState("connected_trail"));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(mockScreenshotsDir, "04_connected_trail.png") });
  console.log("Captured prototype/browser-mock/screenshots/04_connected_trail.png");

  // 5. Symbol Mode with Hint
  await page.evaluate(() => (window as any).setSimState("symbol_hint"));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(mockScreenshotsDir, "05_symbol_mode_hint.png") });
  console.log("Captured prototype/browser-mock/screenshots/05_symbol_mode_hint.png");

  // 6. Final Completion
  await page.evaluate(() => (window as any).setSimState("final_complete"));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(mockScreenshotsDir, "06_final_completion.png") });
  console.log("Captured prototype/browser-mock/screenshots/06_final_completion.png");

  await browser.close();
  console.log("Prototype screenshot generation complete.");
}

capture().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
