/**
 * GlanceTrail - Controller Unit Tests (Node.js Test Runner)
 * 
 * Verifies the deterministic state machine, transition guards, ±180° yaw normalization,
 * rescue hint self-hiding timers, and full reset lifecycle across all 6 done criteria.
 * 
 * NOTE: These are Node unit tests for controller logic. They are NOT LEAF tests.
 * LEAF tests require the Lens Studio preview execution harness and are located in
 * Assets/GlanceTrail/Tests/GlanceTrailLeafScenarios.ts.
 */

import { GlanceTrailController, DefaultTimerService } from "../Assets/GlanceTrail/Scripts/GlanceTrailController.ts";
import { GlanceTrailUI } from "../Assets/GlanceTrail/Scripts/GlanceTrailUI.ts";
import { RehearsalMode, RehearsalState } from "../Assets/GlanceTrail/Scripts/GlanceTrailTypes.ts";
import { GLANCE_TRAIL_CONTENT } from "../Assets/GlanceTrail/Content/GlanceTrailContent.ts";

function assertTest(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failed] ${message}`);
  }
}

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface TestResult {
  criterionNumber: number;
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const tests = [
  {
    criterionNumber: 1,
    name: "Criterion 1: Welcome starts guided rehearsal & activates only Problem",
    run: async () => {
      const controller = new GlanceTrailController();
      const ui = new GlanceTrailUI(controller);

      let snapshot = ui.getSnapshot();
      assertTest(snapshot.state === RehearsalState.WELCOME, "Initial state must be WELCOME");
      assertTest(snapshot.welcomeVisible === true, "Welcome card must be visible initially");
      assertTest(snapshot.beaconsVisible === false, "Beacons must not be visible on Welcome");

      // Action: Pinch Begin rehearsal
      const success = ui.onBeginRehearsalClicked();
      assertTest(success === true, "Begin rehearsal click must succeed");

      snapshot = ui.getSnapshot();
      assertTest(snapshot.state === RehearsalState.GUIDED_PROBLEM, "State must transition to GUIDED_PROBLEM");
      assertTest(snapshot.welcomeVisible === false, "Welcome card must hide");
      assertTest(snapshot.beaconsVisible === true, "All three beacons must become visible");
      assertTest(snapshot.activeBeatIndex === 0, "Only Problem (beat 0) must be active");
      assertTest(snapshot.cueRibbonVisible === true, "Active cue ribbon must be visible");
      assertTest(snapshot.cueRibbonText?.shortCue === "Screens pull your eyes away.", "Problem short cue must match");
      assertTest(snapshot.cueRibbonText?.showDetail === false, "Detail must be collapsed initially");
    }
  },
  {
    criterionNumber: 2,
    name: "Criterion 2: Active cue detail toggles without advancing progress",
    run: async () => {
      const controller = new GlanceTrailController();
      const ui = new GlanceTrailUI(controller);
      ui.onBeginRehearsalClicked();
      await sleepMs(300);

      // Expand detail
      ui.onActiveCueClicked();
      let snapshot = ui.getSnapshot();
      assertTest(snapshot.state === RehearsalState.GUIDED_PROBLEM, "State must remain GUIDED_PROBLEM");
      assertTest(snapshot.activeBeatIndex === 0, "Active beat must still be Problem");
      assertTest(snapshot.cueRibbonText?.showDetail === true, "Detail must be expanded");
      assertTest(
        snapshot.cueRibbonText?.detailText === "Notes help you remember words, but they break connection with the room.",
        "Detail text must be visible"
      );

      // Collapse detail
      ui.onActiveCueClicked();
      snapshot = ui.getSnapshot();
      assertTest(snapshot.state === RehearsalState.GUIDED_PROBLEM, "State must remain GUIDED_PROBLEM");
      assertTest(snapshot.activeBeatIndex === 0, "Active beat must still be Problem");
      assertTest(snapshot.cueRibbonText?.showDetail === false, "Detail must be collapsed");
      assertTest(snapshot.cueRibbonText?.detailText === "", "Detail text must be empty when collapsed");
    }
  },
  {
    criterionNumber: 3,
    name: "Criterion 3: Continue advances exactly one beat with rapid-pinch guard",
    run: async () => {
      const controller = new GlanceTrailController();
      const ui = new GlanceTrailUI(controller);
      ui.onBeginRehearsalClicked();
      await sleepMs(300);

      // Rapid double-click on Continue
      const firstPinch = ui.onContinueClicked();
      const immediateSecondPinch = ui.onContinueClicked(); // Guarded: dropped by transition lock
      assertTest(firstPinch === true, "First pinch must succeed");
      assertTest(immediateSecondPinch === false, "Immediate second pinch must be dropped by transition lock");

      let snapshot = ui.getSnapshot();
      assertTest(snapshot.state === RehearsalState.GUIDED_PROOF, "State must be GUIDED_PROOF, not skipped");
      assertTest(snapshot.activeBeatIndex === 1, "Active beat must be Proof (index 1)");

      // Wait for transition lock to release
      await sleepMs(GlanceTrailController.TRANSITION_LOCK_MS + 50);

      // Advance to Ask
      const thirdPinch = ui.onContinueClicked();
      assertTest(thirdPinch === true, "Pinch after lock expiry must succeed");
      snapshot = ui.getSnapshot();
      assertTest(snapshot.state === RehearsalState.GUIDED_ASK, "State must advance to GUIDED_ASK");
      assertTest(snapshot.activeBeatIndex === 2, "Active beat must be Ask (index 2)");
    }
  },
  {
    criterionNumber: 4,
    name: "Criterion 4: Connected trail draws and symbol-only mode hides detail text",
    run: async () => {
      const controller = new GlanceTrailController();
      const ui = new GlanceTrailUI(controller);
      ui.onBeginRehearsalClicked();
      await sleepMs(300);
      ui.onContinueClicked(); // to Proof
      await sleepMs(300);
      ui.onContinueClicked(); // to Ask
      await sleepMs(300);

      // Complete Ask
      ui.onContinueClicked(); // to GUIDED_COMPLETE
      let snapshot = ui.getSnapshot();
      assertTest(snapshot.state === RehearsalState.GUIDED_COMPLETE, "State must be GUIDED_COMPLETE");
      assertTest(snapshot.trailConnectedVisible === true, "Memory trail line must connect all 3 beacons");
      assertTest(snapshot.continueButtonLabel === "Rehearse with symbols", "Button label must prompt symbol rehearsal");

      await sleepMs(300);

      // Pinch "Rehearse with symbols"
      ui.onContinueClicked();
      snapshot = ui.getSnapshot();
      assertTest(snapshot.state === RehearsalState.SYMBOL_PROBLEM, "State must transition to SYMBOL_PROBLEM");
      assertTest(snapshot.mode === RehearsalMode.SYMBOL_ONLY, "Mode must be SYMBOL_ONLY");
      assertTest(snapshot.activeBeatIndex === 0, "Problem must be active in symbol mode");
      assertTest(snapshot.cueRibbonText?.symbolMark === "[ ⌖ ]", "Clean geometric symbol mark must be visible");
      assertTest(snapshot.cueRibbonText?.shortCue === "", "Persistent cue text must be hidden in symbol mode");
      assertTest(snapshot.cueRibbonText?.detailText === "", "Persistent detail text must be hidden in symbol mode");
      assertTest(snapshot.rescueHintVisible === true, "Rescue hint target must be available in symbol mode");
    }
  },
  {
    criterionNumber: 5,
    name: "Criterion 5: Rescue hint self-hides after ~2s & directional arrow guides back with single chime",
    run: async () => {
      const controller = new GlanceTrailController();
      const ui = new GlanceTrailUI(controller);
      ui.onBeginRehearsalClicked();
      await sleepMs(300);
      ui.onContinueClicked();
      await sleepMs(300);
      ui.onContinueClicked();
      await sleepMs(300);
      ui.onContinueClicked(); // GUIDED_COMPLETE
      await sleepMs(300);
      ui.onContinueClicked(); // SYMBOL_PROBLEM
      await sleepMs(300);

      // Pinch Rescue hint
      const hintTriggered = ui.onRescueHintClicked();
      assertTest(hintTriggered === true, "Rescue hint click must succeed");

      let snapshot = ui.getSnapshot();
      assertTest(snapshot.cueRibbonText?.showRescueHint === true, "Rescue hint must be active");
      assertTest(snapshot.cueRibbonText?.shortCue === "Screens pull your eyes away.", "Short cue must appear during hint");
      assertTest(snapshot.state === RehearsalState.SYMBOL_PROBLEM, "Rescue hint must not advance state");

      // Wait for timer to self-hide
      await sleepMs(GlanceTrailController.RESCUE_HINT_DURATION_MS + 100);

      snapshot = ui.getSnapshot();
      assertTest(snapshot.cueRibbonText?.showRescueHint === false, "Rescue hint must self-hide");
      assertTest(snapshot.cueRibbonText?.shortCue === "", "Short cue must hide again after hint timeout");
      assertTest(snapshot.state === RehearsalState.SYMBOL_PROBLEM, "State must still be SYMBOL_PROBLEM");

      // Test Directional Guidance: Camera turns 30° right (active Problem beacon is at -13°, diff = -43° > 16°)
      const chimePlayed = controller.updateCameraYaw(30.0);
      assertTest(chimePlayed === true, "Excursion chime must trigger on first out-of-view excursion");

      snapshot = ui.getSnapshot();
      assertTest(snapshot.directionalArrowVisible === true, "Directional arrow must appear");
      assertTest(snapshot.directionalArrowSide === "left", "Arrow must point left back toward Problem beacon");

      // Ensure chime does not repeat while still in excursion
      const secondChime = controller.updateCameraYaw(35.0);
      assertTest(secondChime === false, "Excursion chime must NOT repeat continuously while already out of view");

      // User recovers view: camera yaw back to -13°
      controller.updateCameraYaw(-13.0);
      snapshot = ui.getSnapshot();
      assertTest(snapshot.directionalArrowVisible === false, "Directional arrow must hide upon recovery");

      // Test ±180° yaw boundary normalization
      const norm1 = GlanceTrailController.normalizeAngleDelta(370);
      assertTest(norm1 === 10, "370° delta must normalize to 10°");
      const norm2 = GlanceTrailController.normalizeAngleDelta(-190);
      assertTest(norm2 === 170, "-190° delta must normalize to 170°");
    }
  },
  {
    criterionNumber: 6,
    name: "Criterion 6: Final completion displays & Start over clears all stale state",
    run: async () => {
      const controller = new GlanceTrailController();
      const ui = new GlanceTrailUI(controller);
      ui.onBeginRehearsalClicked();
      await sleepMs(300);
      ui.onContinueClicked();
      await sleepMs(300);
      ui.onContinueClicked();
      await sleepMs(300);
      ui.onContinueClicked(); // GUIDED_COMPLETE
      await sleepMs(300);
      ui.onContinueClicked(); // SYMBOL_PROBLEM
      await sleepMs(300);
      ui.onContinueClicked(); // SYMBOL_PROOF
      await sleepMs(300);
      ui.onContinueClicked(); // SYMBOL_ASK
      await sleepMs(300);

      // Complete Ask in symbol mode -> FINAL_COMPLETE
      ui.onContinueClicked();
      let snapshot = ui.getSnapshot();
      assertTest(snapshot.state === RehearsalState.FINAL_COMPLETE, "State must be FINAL_COMPLETE");
      assertTest(snapshot.completionVisible === true, "Completion card must be visible");
      assertTest(snapshot.continueButtonLabel === "Start over", "Button label must be Start over");

      await sleepMs(300);

      // Pinch Start over
      const resetSuccess = ui.onStartOverClicked();
      assertTest(resetSuccess === true, "Start over must succeed");

      snapshot = ui.getSnapshot();
      assertTest(snapshot.state === RehearsalState.WELCOME, "State must return to WELCOME");
      assertTest(snapshot.welcomeVisible === true, "Welcome card must be visible");
      assertTest(snapshot.beaconsVisible === false, "Beacons must be hidden");
      assertTest(snapshot.activeBeatIndex === -1, "No beat must be active");
      assertTest(snapshot.cueRibbonVisible === false, "Cue ribbon must be hidden");
      assertTest(snapshot.trailConnectedVisible === false, "Connected trail must be cleared");
      assertTest(snapshot.rescueHintVisible === false, "Rescue hint must be hidden");
      assertTest(snapshot.directionalArrowVisible === false, "Directional arrow must be hidden");
    }
  }
];

async function main() {
  console.log("=================================================");
  console.log("   GlanceTrail — Controller Unit Test Suite      ");
  console.log("   Classification: UNIT_LOGIC_PROVEN             ");
  console.log("=================================================");
  console.log(`Executing ${tests.length} unit tests across all 6 done criteria...\n`);

  const startTime = Date.now();
  const results: TestResult[] = [];

  for (const test of tests) {
    const testStart = Date.now();
    try {
      await test.run();
      const durationMs = Date.now() - testStart;
      results.push({ criterionNumber: test.criterionNumber, name: test.name, passed: true, durationMs });
      console.log(`[PASS [✓]] ${test.name} (${durationMs} ms)`);
    } catch (err: any) {
      const durationMs = Date.now() - testStart;
      results.push({
        criterionNumber: test.criterionNumber,
        name: test.name,
        passed: false,
        error: err?.message || String(err),
        durationMs
      });
      console.error(`[FAIL [✗]] ${test.name} (${durationMs} ms)`);
      console.error(`   Error: ${err?.message || err}`);
    }
  }

  const duration = Date.now() - startTime;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log("\n-------------------------------------------------");
  console.log(`Total: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
  console.log(`Execution Time: ${duration} ms`);
  console.log("-------------------------------------------------");

  if (failedCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unit test runner crashed:", err);
  process.exit(1);
});
