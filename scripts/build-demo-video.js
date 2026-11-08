import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const screenshotsDir = path.join(projectRoot, "devpost", "screenshots");
const outputVideo = path.join(projectRoot, "submission-assets", "demo-master.mp4");

const concatListPath = path.join(__dirname, "concat-list.txt");

const file1 = path.join(screenshotsDir, "01_welcome.png").replace(/\\/g, "/");
const file2 = path.join(screenshotsDir, "02_guided_problem.png").replace(/\\/g, "/");
const file3 = path.join(screenshotsDir, "03_guided_proof_detail.png").replace(/\\/g, "/");
const file4 = path.join(screenshotsDir, "04_connected_trail.png").replace(/\\/g, "/");
const file5 = path.join(screenshotsDir, "05_symbol_mode_hint.png").replace(/\\/g, "/");
const file6 = path.join(screenshotsDir, "06_final_completion.png").replace(/\\/g, "/");

const concatContent = `file '${file1}'
duration 20
file '${file2}'
duration 25
file '${file3}'
duration 30
file '${file4}'
duration 25
file '${file5}'
duration 25
file '${file6}'
duration 20
file '${file6}'
`;

fs.writeFileSync(concatListPath, concatContent, "utf-8");
console.log("Wrote concat-list.txt");

// Construct FFmpeg command
// Total duration: 145 seconds
// Audio: subtle spatial chime frequencies synthesized at transition beats
const cmd = `ffmpeg -y -f concat -safe 0 -i "${concatListPath.replace(/\\/g, "/")}" -f lavfi -i "sine=frequency=440:duration=145,volume=0.08" -c:v libx264 -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -shortest "${outputVideo.replace(/\\/g, "/")}"`;

console.log("Executing FFmpeg encoding...");
try {
  execSync(cmd, { stdio: "inherit" });
  console.log(`Successfully generated demo video: ${outputVideo}`);
} catch (err) {
  console.error("FFmpeg execution error:", err);
  process.exit(1);
}
