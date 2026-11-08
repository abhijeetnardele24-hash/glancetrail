/**
 * GlanceTrail - LEAF Automated Integration Test Scenarios
 * 
 * Verifies all 6 official done criteria in Lens Studio preview:
 * - Scenario 1: WelcomeStartsGuidedRehearsal
 * - Scenario 2: DetailTogglesWithoutProgress
 * - Scenario 3: ContinueAdvancesBeatGuarded
 * - Scenario 4: ConnectedTrailAndSymbolMode
 * - Scenario 5: RescueHintAndDirectionalGuidance
 * - Scenario 6: FinalCompleteAndResetCleansAll
 */

import { GlanceTrailController } from "../Scripts/GlanceTrailController.ts";
import { GlanceTrailUI } from "../Scripts/GlanceTrailUI.ts";
import { RehearsalMode, RehearsalState } from "../Scripts/GlanceTrailTypes.ts";

// Mock helper simulating LEAF assertions and sleep for portability
export function assertLeaf(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[LEAF Assertion Failed] ${message}`);
  }
}

export function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class GlanceTrailLeafScenarios {
  /**
   * Criterion 1: From Welcome, pinching Begin rehearsal reveals 3 beacons and activates only Problem.
   */
  public static async testWelcomeStartsGuidedRehearsal(): Promise<boolean> {
    const controller = new GlanceTrailController();
    const ui = new GlanceTrailUI(controller);

    let snapshot = ui.getSnapshot();
    assertLeaf(snapshot.state === RehearsalState.WELCOME, "Initial state must be WELCOME");
    assertLeaf(snapshot.welcomeVisible === true, "Welcome card must be visible initially");
    assertLeaf(snapshot.beaconsVisible === false, "Beacons must not be visible on Welcome");

    // Action: Pinch Begin rehearsal
    const success = ui.onBeginRehearsalClicked();
    assertLeaf(success === true, "Begin rehearsal click must succeed");

    snapshot = ui.getSnapshot();
    assertLeaf(snapshot.state === RehearsalState.GUIDED_PROBLEM, "State must transition to GUIDED_PROBLEM");
    assertLeaf(snapshot.welcomeVisible === false, "Welcome card must hide");
    assertLeaf(snapshot.beaconsVisible === true, "All three beacons must become visible");
    assertLeaf(snapshot.activeBeatIndex === 0, "Only Problem (beat 0) must be active");
    assertLeaf(snapshot.cueRibbonVisible === true, "Active cue ribbon must be visible");
    assertLeaf(snapshot.cueRibbonText?.shortCue === "Screens pull your eyes away.", "Problem short cue must match");
    assertLeaf(snapshot.cueRibbonText?.showDetail === false, "Detail must be collapsed initially");

    return true;
  }

  /**
   * Criterion 2: Pinching active cue ribbon expands and collapses detail without advancing.
   */
  public static async testDetailTogglesWithoutProgress(): Promise<boolean> {
    const controller = new GlanceTrailController();
    const ui = new GlanceTrailUI(controller);
    ui.onBeginRehearsalClicked();
    await sleepMs(300);

    // Expand detail
    ui.onActiveCueClicked();
    let snapshot = ui.getSnapshot();
    assertLeaf(snapshot.state === RehearsalState.GUIDED_PROBLEM, "State must remain GUIDED_PROBLEM");
    assertLeaf(snapshot.activeBeatIndex === 0, "Active beat must still be Problem");
    assertLeaf(snapshot.cueRibbonText?.showDetail === true, "Detail must be expanded");
    assertLeaf(
      snapshot.cueRibbonText?.detailText === "Notes help you remember words, but they break connection with the room.",
      "Detail text must be visible"
    );

    // Collapse detail
    ui.onActiveCueClicked();
    snapshot = ui.getSnapshot();
    assertLeaf(snapshot.state === RehearsalState.GUIDED_PROBLEM, "State must remain GUIDED_PROBLEM");
    assertLeaf(snapshot.activeBeatIndex === 0, "Active beat must still be Problem");
    assertLeaf(snapshot.cueRibbonText?.showDetail === false, "Detail must be collapsed");
    assertLeaf(snapshot.cueRibbonText?.detailText === "", "Detail text must be empty when collapsed");

    return true;
  }

  /**
   * Criterion 3: Pinching Continue advances exactly one beat; rapid repeated pinches cannot skip.
   */
  public static async testContinueAdvancesBeatGuarded(): Promise<boolean> {
    const controller = new GlanceTrailController();
    const ui = new GlanceTrailUI(controller);
    ui.onBeginRehearsalClicked();
    await sleepMs(300);

    // Rapid double-click on Continue
    const firstPinch = ui.onContinueClicked();
    const immediateSecondPinch = ui.onContinueClicked(); // Guarded: dropped by transition lock

    assertLeaf(firstPinch === true, "First pinch must succeed");
    assertLeaf(immediateSecondPinch === false, "Rapid second pinch must be dropped by transition lock");

    let snapshot = ui.getSnapshot();
    assertLeaf(snapshot.state === RehearsalState.GUIDED_PROOF, "State must be GUIDED_PROOF");
    assertLeaf(snapshot.activeBeatIndex === 1, "Active beat must be Proof (beat 1)");
    assertLeaf(snapshot.cueRibbonText?.shortCue === "Place gives memory a shape.", "Proof cue must match");

    // Wait for transition lock to release
    await sleepMs(300);

    // Advance to Ask
    const thirdPinch = ui.onContinueClicked();
    assertLeaf(thirdPinch === true, "Advance to Ask must succeed");
    snapshot = ui.getSnapshot();
    assertLeaf(snapshot.state === RehearsalState.GUIDED_ASK, "State must be GUIDED_ASK");
    assertLeaf(snapshot.activeBeatIndex === 2, "Active beat must be Ask (beat 2)");
    assertLeaf(snapshot.cueRibbonText?.shortCue === "Rehearse the path, not the paragraph.", "Ask cue must match");

    return true;
  }

  /**
   * Criterion 4: Completing Ask connects memory trail; Rehearse with symbols hides persistent text.
   */
  public static async testConnectedTrailAndSymbolMode(): Promise<boolean> {
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
    assertLeaf(snapshot.state === RehearsalState.GUIDED_COMPLETE, "State must be GUIDED_COMPLETE");
    assertLeaf(snapshot.trailConnectedVisible === true, "Memory trail line must connect all 3 beacons");
    assertLeaf(snapshot.continueButtonLabel === "Rehearse with symbols", "Button label must prompt symbol rehearsal");

    await sleepMs(300);

    // Pinch "Rehearse with symbols"
    ui.onContinueClicked();
    snapshot = ui.getSnapshot();
    assertLeaf(snapshot.state === RehearsalState.SYMBOL_PROBLEM, "State must transition to SYMBOL_PROBLEM");
    assertLeaf(snapshot.mode === RehearsalMode.SYMBOL_ONLY, "Mode must be SYMBOL_ONLY");
    assertLeaf(snapshot.activeBeatIndex === 0, "Problem must be active in symbol mode");
    assertLeaf(snapshot.cueRibbonText?.symbol === "▼ ⌖ 👁", "Symbol must be visible");
    assertLeaf(snapshot.cueRibbonText?.shortCue === "", "Persistent cue text must be hidden in symbol mode");
    assertLeaf(snapshot.cueRibbonText?.detailText === "", "Persistent detail text must be hidden in symbol mode");
    assertLeaf(snapshot.rescueHintVisible === true, "Rescue hint target must be available in symbol mode");

    return true;
  }

  /**
   * Criterion 5: Rescue hint reveals cue for ~2s and self-hides; out-of-view guidance shows arrow and chime.
   */
  public static async testRescueHintAndDirectionalGuidance(): Promise<boolean> {
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
    assertLeaf(hintTriggered === true, "Rescue hint click must succeed");

    let snapshot = ui.getSnapshot();
    assertLeaf(snapshot.cueRibbonText?.showRescueHint === true, "Rescue hint must be active");
    assertLeaf(snapshot.cueRibbonText?.shortCue === "Screens pull your eyes away.", "Short cue must appear during hint");
    assertLeaf(snapshot.state === RehearsalState.SYMBOL_PROBLEM, "Rescue hint must not advance state");

    // Wait for timer to self-hide
    await sleepMs(GlanceTrailController.RESCUE_HINT_DURATION_MS + 100);

    snapshot = ui.getSnapshot();
    assertLeaf(snapshot.cueRibbonText?.showRescueHint === false, "Rescue hint must self-hide");
    assertLeaf(snapshot.cueRibbonText?.shortCue === "", "Short cue must hide again after hint timeout");
    assertLeaf(snapshot.state === RehearsalState.SYMBOL_PROBLEM, "State must still be SYMBOL_PROBLEM");

    // Test Directional Guidance: Camera turns 30° right (active Problem beacon is at -13°, diff = -43° > 16°)
    const chimePlayed = controller.updateCameraYaw(30.0);
    assertLeaf(chimePlayed === true, "Excursion chime must trigger on first out-of-view excursion");

    snapshot = ui.getSnapshot();
    assertLeaf(snapshot.directionalArrowVisible === true, "Directional arrow must appear");
    assertLeaf(snapshot.directionalArrowSide === "left", "Arrow must point left back toward Problem beacon");

    // Ensure chime does not repeat while still in excursion
    const secondChime = controller.updateCameraYaw(35.0);
    assertLeaf(secondChime === false, "Excursion chime must NOT repeat continuously while already out of view");

    // User recovers view: camera yaw back to -13°
    controller.updateCameraYaw(-13.0);
    snapshot = ui.getSnapshot();
    assertLeaf(snapshot.directionalArrowVisible === false, "Directional arrow must hide upon recovery");

    return true;
  }

  /**
   * Criterion 6: Completing symbol run shows final message; Start over resets cleanly with zero stale state.
   */
  public static async testFinalCompleteAndResetCleansAll(): Promise<boolean> {
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
    assertLeaf(snapshot.state === RehearsalState.FINAL_COMPLETE, "State must be FINAL_COMPLETE");
    assertLeaf(snapshot.completionVisible === true, "Completion card must be visible");
    assertLeaf(snapshot.continueButtonLabel === "Start over", "Button label must be Start over");

    await sleepMs(300);

    // Pinch Start over
    const resetSuccess = ui.onStartOverClicked();
    assertLeaf(resetSuccess === true, "Start over must succeed");

    snapshot = ui.getSnapshot();
    assertLeaf(snapshot.state === RehearsalState.WELCOME, "State must return to WELCOME");
    assertLeaf(snapshot.welcomeVisible === true, "Welcome card must be visible");
    assertLeaf(snapshot.beaconsVisible === false, "Beacons must be hidden");
    assertLeaf(snapshot.activeBeatIndex === -1, "No beat must be active");
    assertLeaf(snapshot.cueRibbonVisible === false, "Cue ribbon must be hidden");
    assertLeaf(snapshot.trailConnectedVisible === false, "Connected trail must be cleared");
    assertLeaf(snapshot.rescueHintVisible === false, "Rescue hint must be hidden");
    assertLeaf(snapshot.directionalArrowVisible === false, "Directional arrow must be hidden");

    return true;
  }
}
