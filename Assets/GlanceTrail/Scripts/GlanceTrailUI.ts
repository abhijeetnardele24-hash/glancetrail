/**
 * GlanceTrail - Spatial UI Manager (Lens Studio Native)
 * 
 * Manages the visual presentation, beacon layout, cue ribbon,
 * and button bindings for the Spectacles additive display.
 */

import { COLOR_PALETTE, GLANCE_TRAIL_CONTENT, type PitchBeat } from "../Content/GlanceTrailContent.ts";
import { GlanceTrailAudio } from "../Audio/GlanceTrailAudio.ts";
import { GlanceTrailController } from "./GlanceTrailController.ts";
import { RehearsalMode, RehearsalState, type StateChangePayload } from "./GlanceTrailTypes.ts";

export { GLANCE_TRAIL_CONTENT, COLOR_PALETTE } from "../Content/GlanceTrailContent.ts";
export { GlanceTrailController } from "./GlanceTrailController.ts";

export interface UIRenderSnapshot {
  state: RehearsalState;
  mode: RehearsalMode;
  welcomeVisible: boolean;
  beaconsVisible: boolean;
  activeBeatIndex: number;
  cueRibbonVisible: boolean;
  cueRibbonText: {
    symbolMark: string;
    shortCue: string;
    detailText: string;
    showDetail: boolean;
    showRescueHint: boolean;
  } | null;
  continueButtonVisible: boolean;
  continueButtonLabel: string;
  rescueHintVisible: boolean;
  trailConnectedVisible: boolean;
  completionVisible: boolean;
  directionalArrowVisible: boolean;
  directionalArrowSide: "left" | "right" | "none";
}

export class GlanceTrailUI {
  private controller: GlanceTrailController;
  private audio: GlanceTrailAudio;
  private lastSnapshot: UIRenderSnapshot | null = null;

  constructor(controller: GlanceTrailController, audio?: GlanceTrailAudio) {
    this.controller = controller;
    this.audio = audio || new GlanceTrailAudio();
    this.controller.addListener((payload) => this.onStateChange(payload));
    this.updateSnapshot();
  }

  public getSnapshot(): UIRenderSnapshot {
    if (!this.lastSnapshot) {
      this.updateSnapshot();
    }
    return this.lastSnapshot!;
  }

  private onStateChange(payload: StateChangePayload): void {
    if (payload.currentState !== payload.previousState) {
      if (payload.currentState === RehearsalState.GUIDED_PROOF || payload.currentState === RehearsalState.SYMBOL_PROOF) {
        this.audio.playBeatAdvance(1);
      } else if (payload.currentState === RehearsalState.GUIDED_ASK || payload.currentState === RehearsalState.SYMBOL_ASK) {
        this.audio.playBeatAdvance(2);
      } else if (payload.currentState === RehearsalState.GUIDED_COMPLETE || payload.currentState === RehearsalState.FINAL_COMPLETE) {
        this.audio.playTrailConnected();
      } else if (payload.currentState === RehearsalState.WELCOME) {
        this.audio.playResetChime();
      }
    }

    if (payload.isRescueHintActive && !this.lastSnapshot?.cueRibbonText?.showRescueHint) {
      this.audio.playRescueHintChime();
    }

    this.updateSnapshot();
  }

  public updateSnapshot(): UIRenderSnapshot {
    const state = this.controller.getState();
    const mode = this.controller.getMode();
    const beatIdx = this.controller.getCurrentBeatIndex();
    const beat = this.controller.getCurrentBeat();
    const isDetail = this.controller.getDetailExpanded();
    const isHint = this.controller.getRescueHintActive();
    const isOutOfView = this.controller.getOutOfView();
    const outOfViewDir = this.controller.getOutOfViewDirection();

    const welcomeVisible = state === RehearsalState.WELCOME;
    const beaconsVisible = state !== RehearsalState.WELCOME && state !== RehearsalState.FINAL_COMPLETE;
    const cueRibbonVisible = beatIdx !== -1 && (mode === RehearsalMode.GUIDED || mode === RehearsalMode.SYMBOL_ONLY);
    let continueButtonVisible = beatIdx !== -1;
    const rescueHintVisible = mode === RehearsalMode.SYMBOL_ONLY && beatIdx !== -1;
    const trailConnectedVisible = this.controller.isTrailConnected() && state !== RehearsalState.WELCOME;
    const completionVisible = state === RehearsalState.GUIDED_COMPLETE || state === RehearsalState.FINAL_COMPLETE;

    let continueLabel = GLANCE_TRAIL_CONTENT.continueButtonLabel;
    if (state === RehearsalState.GUIDED_COMPLETE) {
      continueLabel = GLANCE_TRAIL_CONTENT.rehearseAgainButtonLabel;
      continueButtonVisible = true;
    } else if (state === RehearsalState.FINAL_COMPLETE) {
      continueLabel = GLANCE_TRAIL_CONTENT.startOverButtonLabel;
      continueButtonVisible = true;
    }

    let cueText = null;
    if (beat && cueRibbonVisible) {
      // In symbol-only mode, persistent text is strictly suppressed; only rescue hint temporarily displays short cue
      const shortCueText = mode === RehearsalMode.SYMBOL_ONLY
        ? (isHint ? beat.shortCue : "")
        : beat.shortCue;

      const detailString = mode === RehearsalMode.GUIDED && isDetail ? beat.detailText : "";

      cueText = {
        symbolMark: beat.symbolMark,
        shortCue: shortCueText,
        detailText: detailString,
        showDetail: isDetail,
        showRescueHint: isHint
      };
    }

    this.lastSnapshot = {
      state,
      mode,
      welcomeVisible,
      beaconsVisible,
      activeBeatIndex: beatIdx,
      cueRibbonVisible,
      cueRibbonText: cueText,
      continueButtonVisible,
      continueButtonLabel: continueLabel,
      rescueHintVisible,
      trailConnectedVisible,
      completionVisible,
      directionalArrowVisible: isOutOfView && beatIdx !== -1,
      directionalArrowSide: isOutOfView ? outOfViewDir : "none"
    };

    return this.lastSnapshot;
  }

  public onBeginRehearsalClicked(): boolean {
    return this.controller.beginRehearsal();
  }

  public onActiveCueClicked(): boolean {
    return this.controller.toggleDetail();
  }

  public onContinueClicked(): boolean {
    const state = this.controller.getState();
    if (state === RehearsalState.GUIDED_COMPLETE) {
      return this.controller.startSymbolMode();
    } else if (state === RehearsalState.FINAL_COMPLETE) {
      this.controller.reset();
      return true;
    }
    return this.controller.advanceBeat();
  }

  public onRescueHintClicked(): boolean {
    return this.controller.triggerRescueHint();
  }

  public onStartOverClicked(): boolean {
    this.controller.reset();
    return true;
  }

  public onCameraYawChanged(yawDegrees: number): void {
    const shouldPlayChime = this.controller.updateCameraYaw(yawDegrees);
    if (shouldPlayChime) {
      this.audio.playExcursionChime();
    }
  }
}
