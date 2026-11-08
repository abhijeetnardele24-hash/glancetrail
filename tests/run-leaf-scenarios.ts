/**
 * GlanceTrail - Automated Test Runner
 * Executes all 6 LEAF scenarios and reports exact criterion-by-criterion status.
 */

import { runAllLeafScenarios, GLANCE_TRAIL_SCENARIOS } from "../Assets/GlanceTrail/Tests/LeafIndex.ts";

async function main() {
  console.log("=================================================");
  console.log("   GlanceTrail — LEAF Automated Scenario Suite   ");
  console.log("=================================================");
  console.log(`Executing ${GLANCE_TRAIL_SCENARIOS.length} scenarios across all 6 done criteria...\n`);

  const startTime = Date.now();
  const results = await runAllLeafScenarios();
  const duration = Date.now() - startTime;

  let allPassed = true;

  results.forEach((r, idx) => {
    const status = r.passed ? "PASS [✓]" : "FAIL [✗]";
    console.log(`${idx + 1}. [${status}] ${r.name}`);
    if (!r.passed) {
      allPassed = false;
      console.error(`   Error: ${r.error}`);
    }
  });

  console.log("\n-------------------------------------------------");
  console.log(`Total: ${results.length} | Passed: ${results.filter(r => r.passed).length} | Failed: ${results.filter(r => !r.passed).length}`);
  console.log(`Execution Time: ${duration} ms`);
  console.log("-------------------------------------------------");

  if (!allPassed) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test suite runner crashed:", err);
  process.exit(1);
});
