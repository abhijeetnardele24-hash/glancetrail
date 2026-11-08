import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const previewUrl = `file://${path.join(projectRoot, "preview", "index.html").replace(/\\/g, "/")}`;
const screenshotsDir = path.join(projectRoot, "devpost", "screenshots");
const submissionAssetsDir = path.join(projectRoot, "submission-assets");

async function capture() {
  console.log("Launching headless browser to capture Lens Studio Preview screenshots...");

  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--allow-file-access-from-files"]
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1
  });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));

  await page.goto(previewUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // 1. Welcome
  await page.evaluate(() => window.setSimState("welcome"));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(screenshotsDir, "01_welcome.png") });
  console.log("Captured 01_welcome.png");

  // 2. Guided Problem
  await page.evaluate(() => window.setSimState("problem"));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(screenshotsDir, "02_guided_problem.png") });
  console.log("Captured 02_guided_problem.png");

  // 3. Guided Proof with Detail
  await page.evaluate(() => window.setSimState("proof_detail"));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(screenshotsDir, "03_guided_proof_detail.png") });
  console.log("Captured 03_guided_proof_detail.png");

  // 4. Connected Trail
  await page.evaluate(() => window.setSimState("connected_trail"));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotsDir, "04_connected_trail.png") });
  console.log("Captured 04_connected_trail.png");

  // 5. Symbol Mode + Rescue Hint + Directional Arrow
  await page.evaluate(() => window.setSimState("symbol_hint"));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(screenshotsDir, "05_symbol_mode_hint.png") });
  console.log("Captured 05_symbol_mode_hint.png");

  // 6. Final Completion
  await page.evaluate(() => window.setSimState("final_complete"));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(screenshotsDir, "06_final_completion.png") });
  console.log("Captured 06_final_completion.png");

  // 7. Thumbnail for Devpost and Video
  await page.screenshot({ path: path.join(submissionAssetsDir, "thumbnail.png") });
  console.log("Captured thumbnail.png in submission-assets");

  await browser.close();
  console.log("All screenshots captured successfully!");
}

capture().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
