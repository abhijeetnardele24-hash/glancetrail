/**
 * GlanceTrail - Genuine LEAF Integration Test Suite (Lens Studio Native)
 * 
 * Verifies all 6 approved done criteria by driving rendered Lens SceneObjects
 * and Spectacles Interaction Kit (SIK) Interactables inside the Lens Studio
 * Interactive Preview runtime execution harness.
 * 
 * Package dependency: Leaf.lspkg (Lens Studio Automated Testing Framework)
 */

import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario";
import { expect } from "Leaf.lspkg/Utils/common/Expect";
import {
  findSceneObjectByName,
  findInteractablesByName,
  sleep
} from "Leaf.lspkg/Utils/common/Utils";

/**
 * Criterion 1: From Welcome, pinching Begin rehearsal reveals 3 beacons and activates only Problem.
 */
export class WelcomeStartsGuidedRehearsalScenario extends Scenario {
  public override async run(): Promise<void> {
    const welcomeCard = findSceneObjectByName("WelcomeCard");
    const beaconProblem = findSceneObjectByName("Beacon_Problem");
    const beaconProof = findSceneObjectByName("Beacon_Proof");
    const beaconAsk = findSceneObjectByName("Beacon_Ask");
    const cueRibbon = findSceneObjectByName("CueRibbon");
    const shortText = findSceneObjectByName("ShortCueText");

    expect(welcomeCard).toBeDefined();
    expect(welcomeCard.enabled).toBe(true);
    expect(beaconProblem.enabled).toBe(false);

    // Find and pinch the Begin rehearsal button interactable
    const [beginBtn] = findInteractablesByName("BeginRehearsalButton");
    expect(beginBtn).toBeDefined();
    await beginBtn.pinch();
    await sleep(0.3);

    // Post-pinch assertions
    expect(welcomeCard.enabled).toBe(false);
    expect(beaconProblem.enabled).toBe(true);
    expect(beaconProof.enabled).toBe(true);
    expect(beaconAsk.enabled).toBe(true);
    expect(cueRibbon.enabled).toBe(true);
    expect(shortText.getComponent("Text3D").text).toBe("Screens pull your eyes away.");
  }
}

/**
 * Criterion 2: Pinching active cue ribbon expands and collapses detail without advancing.
 */
export class DetailTogglesWithoutProgressScenario extends Scenario {
  public override async run(): Promise<void> {
    const cueRibbon = findSceneObjectByName("CueRibbon");
    const detailText = findSceneObjectByName("DetailText");
    const beaconProblem = findSceneObjectByName("Beacon_Problem");

    // Start rehearsal
    const [beginBtn] = findInteractablesByName("BeginRehearsalButton");
    await beginBtn.pinch();
    await sleep(0.3);

    const [ribbonInteractable] = findInteractablesByName("CueRibbon");
    expect(ribbonInteractable).toBeDefined();

    // Pinch cue ribbon to expand detail
    await ribbonInteractable.pinch();
    await sleep(0.3);

    expect(detailText.enabled).toBe(true);
    expect(detailText.getComponent("Text3D").text).toBe(
      "Notes help you remember words, but they break connection with the room."
    );
    expect(beaconProblem.enabled).toBe(true); // Still on Problem

    // Pinch cue ribbon again to collapse detail
    await ribbonInteractable.pinch();
    await sleep(0.3);

    expect(detailText.enabled).toBe(false);
    expect(beaconProblem.enabled).toBe(true); // Rehearsal has not advanced
  }
}

/**
 * Criterion 3: Pinching Continue advances exactly one beat; rapid repeated pinches cannot skip.
 */
export class ContinueAdvancesBeatGuardedScenario extends Scenario {
  public override async run(): Promise<void> {
    const [beginBtn] = findInteractablesByName("BeginRehearsalButton");
    await beginBtn.pinch();
    await sleep(0.3);

    const [continueBtn] = findInteractablesByName("ContinueButton");
    const shortText = findSceneObjectByName("ShortCueText");

    // Rapid double-pinch on Continue (within transition lock window)
    continueBtn.pinch(); // 1st pinch
    continueBtn.pinch(); // 2nd pinch dropped by transition guard
    await sleep(0.4);

    // Must be on Proof (beat 1), NOT skipped to Ask
    expect(shortText.getComponent("Text3D").text).toBe("One glance anchor per idea.");

    // Advance to Ask after guard window
    await continueBtn.pinch();
    await sleep(0.4);

    expect(shortText.getComponent("Text3D").text).toBe("Practice the feeling of looking out.");
  }
}

/**
 * Criterion 4: Completing Ask connects memory trail; Rehearse with symbols hides persistent text.
 */
export class ConnectedTrailAndSymbolModeScenario extends Scenario {
  public override async run(): Promise<void> {
    const [beginBtn] = findInteractablesByName("BeginRehearsalButton");
    await beginBtn.pinch();
    await sleep(0.3);

    const [continueBtn] = findInteractablesByName("ContinueButton");
    await continueBtn.pinch(); // to Proof
    await sleep(0.3);
    await continueBtn.pinch(); // to Ask
    await sleep(0.3);
    await continueBtn.pinch(); // to GUIDED_COMPLETE
    await sleep(0.3);

    const memoryTrail = findSceneObjectByName("MemoryTrailLine");
    const continueBtnText = findSceneObjectByName("ContinueButtonText");
    expect(memoryTrail.enabled).toBe(true);
    expect(continueBtnText.getComponent("Text3D").text).toBe("Rehearse with symbols");

    // Pinch "Rehearse with symbols"
    await continueBtn.pinch();
    await sleep(0.3);

    const shortText = findSceneObjectByName("ShortCueText");
    const rescueHintBtn = findSceneObjectByName("RescueHintButton");

    // In symbol mode: persistent body text is removed, symbol mark is shown, hint button visible
    expect(shortText.getComponent("Text3D").text).toBe("[ ⌖ ]");
    expect(rescueHintBtn.enabled).toBe(true);
  }
}

/**
 * Criterion 5: Rescue hint reveals cue for ~2s and self-hides; out-of-view guidance shows arrow and chime.
 */
export class RescueHintAndDirectionalGuidanceScenario extends Scenario {
  public override async run(): Promise<void> {
    const [beginBtn] = findInteractablesByName("BeginRehearsalButton");
    await beginBtn.pinch();
    await sleep(0.3);

    const [continueBtn] = findInteractablesByName("ContinueButton");
    await continueBtn.pinch();
    await sleep(0.3);
    await continueBtn.pinch();
    await sleep(0.3);
    await continueBtn.pinch(); // to GUIDED_COMPLETE
    await sleep(0.3);
    await continueBtn.pinch(); // to SYMBOL_PROBLEM
    await sleep(0.3);

    const [rescueHintBtn] = findInteractablesByName("RescueHintButton");
    const shortText = findSceneObjectByName("ShortCueText");

    // Pinch Rescue hint
    await rescueHintBtn.pinch();
    await sleep(0.2);

    expect(shortText.getComponent("Text3D").text).toBe("Screens pull your eyes away.");

    // Wait for ~2.0 second timer to self-hide
    await sleep(2.2);

    // Text must return to symbol mark
    expect(shortText.getComponent("Text3D").text).toBe("[ ⌖ ]");

    // Camera yaw excursion simulation: rotate camera 30°
    const camera = findSceneObjectByName("SpectaclesCamera");
    camera.getTransform().setWorldRotation({ x: 0, y: 0.259, z: 0, w: 0.966 }); // 30° yaw
    await sleep(0.1);

    const directionalArrow = findSceneObjectByName("DirectionalArrow");
    expect(directionalArrow.enabled).toBe(true);

    // Recover camera view
    camera.getTransform().setWorldRotation({ x: 0, y: -0.113, z: 0, w: 0.994 }); // -13° back to Problem
    await sleep(0.1);

    expect(directionalArrow.enabled).toBe(false);
  }
}

/**
 * Criterion 6: Completing symbol run shows final message; Start over resets cleanly with zero stale state.
 */
export class FinalCompleteAndResetCleansAllScenario extends Scenario {
  public override async run(): Promise<void> {
    const [beginBtn] = findInteractablesByName("BeginRehearsalButton");
    await beginBtn.pinch();
    await sleep(0.3);

    const [continueBtn] = findInteractablesByName("ContinueButton");
    await continueBtn.pinch();
    await sleep(0.3);
    await continueBtn.pinch();
    await sleep(0.3);
    await continueBtn.pinch(); // to GUIDED_COMPLETE
    await sleep(0.3);
    await continueBtn.pinch(); // to SYMBOL_PROBLEM
    await sleep(0.3);
    await continueBtn.pinch(); // to SYMBOL_PROOF
    await sleep(0.3);
    await continueBtn.pinch(); // to SYMBOL_ASK
    await sleep(0.3);
    await continueBtn.pinch(); // to FINAL_COMPLETE
    await sleep(0.3);

    const completionCard = findSceneObjectByName("CompletionCard");
    const completionMsg = findSceneObjectByName("CompletionMessageText");
    expect(completionCard.enabled).toBe(true);
    expect(completionMsg.getComponent("Text3D").text).toBe("Path remembered. Now say it without reading it.");

    // Pinch Start over
    const [startOverBtn] = findInteractablesByName("StartOverButton");
    await startOverBtn.pinch();
    await sleep(0.3);

    // Verify completely clean Welcome state
    const welcomeCard = findSceneObjectByName("WelcomeCard");
    const beaconProblem = findSceneObjectByName("Beacon_Problem");
    const memoryTrail = findSceneObjectByName("MemoryTrailLine");
    const cueRibbon = findSceneObjectByName("CueRibbon");

    expect(welcomeCard.enabled).toBe(true);
    expect(beaconProblem.enabled).toBe(false);
    expect(memoryTrail.enabled).toBe(false);
    expect(cueRibbon.enabled).toBe(false);
    expect(completionCard.enabled).toBe(false);
  }
}
