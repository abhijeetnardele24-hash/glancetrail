/**
 * GlanceTrail - Lens Studio Scene Component
 * 
 * Attaches to the GlanceTrailStage SceneObject in Lens Studio.
 * Connects Spectacles Interaction Kit (SIK) Interactables,
 * 3D Text Meshes, Additive Materials, AudioComponents, and World Tracking
 * to the GlanceTrailController state machine.
 */

import { GlanceTrailController, type ITimerService } from "./GlanceTrailController.ts";
import { GlanceTrailUI, type UIRenderSnapshot } from "./GlanceTrailUI.ts";
import { GlanceTrailAudio } from "../Audio/GlanceTrailAudio.ts";
import { RehearsalMode, RehearsalState, type StateChangePayload } from "./GlanceTrailTypes.ts";
import { COLOR_PALETTE, GLANCE_TRAIL_CONTENT } from "../Content/GlanceTrailContent.ts";

/**
 * Lens Studio DelayedCallbackEvent timer adapter
 */
export class LensStudioTimerService implements ITimerService {
  private scriptComponent: any;
  private activeEvents: Map<any, any> = new Map();

  constructor(scriptComponent?: any) {
    this.scriptComponent = scriptComponent;
  }

  public schedule(ms: number, callback: () => void): any {
    if (this.scriptComponent && typeof this.scriptComponent.createEvent === "function") {
      try {
        const delayedEvent = this.scriptComponent.createEvent("DelayedCallbackEvent");
        delayedEvent.bind(() => {
          this.activeEvents.delete(delayedEvent);
          callback();
        });
        delayedEvent.reset(ms / 1000.0);
        this.activeEvents.set(delayedEvent, delayedEvent);
        return delayedEvent;
      } catch (e) {
        // Fallback to standard timer if not inside active LS context
      }
    }
    if (typeof setTimeout !== "undefined") {
      return setTimeout(callback, ms);
    }
    return null;
  }

  public cancel(timerHandle: any): void {
    if (!timerHandle) return;
    if (this.activeEvents.has(timerHandle)) {
      try {
        timerHandle.enabled = false;
      } catch (e) {}
      this.activeEvents.delete(timerHandle);
      return;
    }
    if (typeof clearTimeout !== "undefined") {
      clearTimeout(timerHandle);
    }
  }
}

// Lens Studio component decorator stub for TypeScript compilation outside LS
declare function component(target: any): any;
declare function input(target: any, propertyKey: string): any;

export class GlanceTrailSceneComponent {
  // SceneObject references (wired via Lens Studio Inspector or scene descriptor)
  public welcomeCard: any = null;
  public beginRehearsalButton: any = null;
  public beaconProblem: any = null;
  public beaconProof: any = null;
  public beaconAsk: any = null;
  public cueRibbon: any = null;
  public cueRibbonShortText: any = null;
  public cueRibbonDetailText: any = null;
  public continueButton: any = null;
  public continueButtonText: any = null;
  public rescueHintButton: any = null;
  public memoryTrailLine: any = null;
  public directionalArrow: any = null;
  public completionCard: any = null;
  public startOverButton: any = null;
  public audioComponent: any = null;
  public cameraTransform: any = null;

  // Runtime core
  private controller: GlanceTrailController;
  private ui: GlanceTrailUI;
  private audio: GlanceTrailAudio;
  private timerService: ITimerService;

  constructor(scriptHost?: any) {
    this.timerService = new LensStudioTimerService(scriptHost);
    this.controller = new GlanceTrailController(this.timerService);
    this.audio = new GlanceTrailAudio(this.audioComponent);
    this.ui = new GlanceTrailUI(this.controller, this.audio);
  }

  public onAwake(): void {
    this.bindInteractables();
    this.bindCameraTracking();
    this.applySnapshotToScene(this.ui.getSnapshot());
  }

  /**
   * Bind Spectacles Interaction Kit (SIK) Interactable events
   */
  private bindInteractables(): void {
    // 1. Begin Rehearsal button
    this.bindButtonPinch(this.beginRehearsalButton, () => {
      this.ui.onBeginRehearsalClicked();
      this.applySnapshotToScene(this.ui.getSnapshot());
    });

    // 2. Beacon pinches (toggle detail on active beacon)
    this.bindButtonPinch(this.beaconProblem, () => {
      if (this.controller.getActiveBeatIndex() === 0) {
        this.ui.onActiveCueClicked();
        this.applySnapshotToScene(this.ui.getSnapshot());
      }
    });

    this.bindButtonPinch(this.beaconProof, () => {
      if (this.controller.getActiveBeatIndex() === 1) {
        this.ui.onActiveCueClicked();
        this.applySnapshotToScene(this.ui.getSnapshot());
      }
    });

    this.bindButtonPinch(this.beaconAsk, () => {
      if (this.controller.getActiveBeatIndex() === 2) {
        this.ui.onActiveCueClicked();
        this.applySnapshotToScene(this.ui.getSnapshot());
      }
    });

    // 3. Cue Ribbon pinch (toggle detail)
    this.bindButtonPinch(this.cueRibbon, () => {
      this.ui.onActiveCueClicked();
      this.applySnapshotToScene(this.ui.getSnapshot());
    });

    // 4. Continue button
    this.bindButtonPinch(this.continueButton, () => {
      this.ui.onContinueClicked();
      this.applySnapshotToScene(this.ui.getSnapshot());
    });

    // 5. Rescue Hint button
    this.bindButtonPinch(this.rescueHintButton, () => {
      this.ui.onRescueHintClicked();
      this.applySnapshotToScene(this.ui.getSnapshot());
    });

    // 6. Start Over button
    this.bindButtonPinch(this.startOverButton, () => {
      this.ui.onStartOverClicked();
      this.applySnapshotToScene(this.ui.getSnapshot());
    });
  }

  private bindButtonPinch(sceneObj: any, callback: () => void): void {
    if (!sceneObj) return;
    // SIK Interactable binding
    const interactable = sceneObj.getComponent ? sceneObj.getComponent("Interactable") : sceneObj.interactable;
    if (interactable && interactable.onTriggerStart) {
      interactable.onTriggerStart.add(callback);
    }
  }

  /**
   * Bind head yaw tracking for out-of-view directional guidance
   */
  private bindCameraTracking(): void {
    // In Lens Studio, camera yaw is queried per frame or via UpdateEvent
    this.controller.addListener(() => {
      this.applySnapshotToScene(this.ui.getSnapshot());
    });
  }

  /**
   * Update head yaw from camera transform
   */
  public onUpdateCameraYaw(yawDeg: number): void {
    const chimePlayed = this.controller.updateCameraYaw(yawDeg);
    if (chimePlayed) {
      this.audio.playExcursionChime();
    }
    this.applySnapshotToScene(this.ui.getSnapshot());
  }

  /**
   * Synchronize visual SceneObject hierarchy with current state snapshot
   */
  public applySnapshotToScene(snapshot: UIRenderSnapshot): void {
    // 1. Welcome Card
    this.setVisible(this.welcomeCard, snapshot.welcomeVisible);

    // 2. Three Beacons
    this.setVisible(this.beaconProblem, snapshot.beaconsVisible);
    this.setVisible(this.beaconProof, snapshot.beaconsVisible);
    this.setVisible(this.beaconAsk, snapshot.beaconsVisible);

    // Highlight active beacon
    this.setBeaconActive(this.beaconProblem, snapshot.activeBeatIndex === 0);
    this.setBeaconActive(this.beaconProof, snapshot.activeBeatIndex === 1);
    this.setBeaconActive(this.beaconAsk, snapshot.activeBeatIndex === 2);

    // 3. Cue Ribbon
    this.setVisible(this.cueRibbon, snapshot.cueRibbonVisible);
    if (snapshot.cueRibbonText) {
      if (this.cueRibbonShortText) {
        this.setText(this.cueRibbonShortText, snapshot.cueRibbonText.shortCue || snapshot.cueRibbonText.symbolMark);
      }
      if (this.cueRibbonDetailText) {
        this.setVisible(this.cueRibbonDetailText, snapshot.cueRibbonText.showDetail);
        this.setText(this.cueRibbonDetailText, snapshot.cueRibbonText.detailText);
      }
    }

    // 4. Continue Button
    this.setVisible(this.continueButton, snapshot.continueButtonVisible);
    if (this.continueButtonText) {
      this.setText(this.continueButtonText, snapshot.continueButtonLabel);
    }

    // 5. Rescue Hint Button
    this.setVisible(this.rescueHintButton, snapshot.rescueHintVisible);

    // 6. Connected Memory Trail Line
    this.setVisible(this.memoryTrailLine, snapshot.trailConnectedVisible);

    // 7. Directional Arrow
    this.setVisible(this.directionalArrow, snapshot.directionalArrowVisible);
    if (this.directionalArrow && snapshot.directionalArrowVisible) {
      this.setArrowDirection(this.directionalArrow, snapshot.directionalArrowSide);
    }

    // 8. Completion Card
    this.setVisible(this.completionCard, snapshot.completionVisible);
  }

  private setVisible(obj: any, visible: boolean): void {
    if (obj) {
      if (typeof obj.enabled !== "undefined") {
        obj.enabled = visible;
      } else if (typeof obj.setVisible === "function") {
        obj.setVisible(visible);
      }
    }
  }

  private setText(textComp: any, text: string): void {
    if (textComp) {
      if (typeof textComp.text !== "undefined") {
        textComp.text = text;
      }
    }
  }

  private setBeaconActive(beaconObj: any, isActive: boolean): void {
    if (!beaconObj) return;
    // Scale or glow modulation for active state
    if (beaconObj.getTransform) {
      const scale = isActive ? 1.25 : 1.0;
      beaconObj.getTransform().setLocalScale({ x: scale, y: scale, z: scale });
    }
  }

  private setArrowDirection(arrowObj: any, side: "left" | "right" | "none"): void {
    if (!arrowObj || side === "none") return;
    if (arrowObj.getTransform) {
      const rotZ = side === "left" ? 180 : 0;
      arrowObj.getTransform().setLocalRotation({ x: 0, y: 0, z: rotZ, w: 1 });
    }
  }

  public getController(): GlanceTrailController {
    return this.controller;
  }

  public getUI(): GlanceTrailUI {
    return this.ui;
  }
}
