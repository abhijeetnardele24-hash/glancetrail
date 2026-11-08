/**
 * GlanceTrail - Native State Controller
 * 
 * Handles state progression, transition locks against rapid pinches,
 * ±180° yaw normalization for gaze tracking, and self-hiding rescue hint timers.
 */

import { GLANCE_TRAIL_CONTENT, type PitchBeat } from "../Content/GlanceTrailContent.ts";
import { RehearsalMode, RehearsalState, type StateChangePayload, type StateListener } from "./GlanceTrailTypes.ts";

export interface ITimerService {
  schedule(ms: number, callback: () => void): any;
  cancel(timerHandle: any): void;
}

export class DefaultTimerService implements ITimerService {
  public schedule(ms: number, callback: () => void): any {
    if (typeof setTimeout !== "undefined") {
      return setTimeout(callback, ms);
    }
    return null;
  }
  public cancel(timerHandle: any): void {
    if (timerHandle && typeof clearTimeout !== "undefined") {
      clearTimeout(timerHandle);
    }
  }
}

export class GlanceTrailController {
  private currentState: RehearsalState = RehearsalState.WELCOME;
  private isDetailExpanded: boolean = false;
  private isRescueHintActive: boolean = false;
  private rescueHintTimerHandle: any = null;
  private isOutOfView: boolean = false;
  private outOfViewDirection: "left" | "right" | "none" = "none";
  private hasPlayedExcursionChime: boolean = false;
  private isTransitionLocked: boolean = false;
  private transitionLockTimerHandle: any = null;
  private timerService: ITimerService;
  private listeners: StateListener[] = [];

  public static readonly FOV_HALF_ANGLE_DEG = 16.0; // 32° horizontal FOV / 2
  public static readonly RESCUE_HINT_DURATION_MS = 2000;
  public static readonly TRANSITION_LOCK_MS = 250;

  constructor(timerService?: ITimerService) {
    this.timerService = timerService || new DefaultTimerService();
    this.reset();
  }

  public getState(): RehearsalState {
    return this.currentState;
  }

  public getMode(): RehearsalMode {
    switch (this.currentState) {
      case RehearsalState.WELCOME:
        return RehearsalMode.WELCOME;
      case RehearsalState.GUIDED_PROBLEM:
      case RehearsalState.GUIDED_PROOF:
      case RehearsalState.GUIDED_ASK:
        return RehearsalMode.GUIDED;
      case RehearsalState.GUIDED_COMPLETE:
      case RehearsalState.FINAL_COMPLETE:
        return RehearsalMode.COMPLETE;
      case RehearsalState.SYMBOL_PROBLEM:
      case RehearsalState.SYMBOL_PROOF:
      case RehearsalState.SYMBOL_ASK:
        return RehearsalMode.SYMBOL_ONLY;
      default:
        return RehearsalMode.WELCOME;
    }
  }

  public getCurrentBeatIndex(): number {
    switch (this.currentState) {
      case RehearsalState.GUIDED_PROBLEM:
      case RehearsalState.SYMBOL_PROBLEM:
        return 0;
      case RehearsalState.GUIDED_PROOF:
      case RehearsalState.SYMBOL_PROOF:
        return 1;
      case RehearsalState.GUIDED_ASK:
      case RehearsalState.SYMBOL_ASK:
        return 2;
      default:
        return -1;
    }
  }

  public getCurrentBeat(): PitchBeat | null {
    const idx = this.getCurrentBeatIndex();
    if (idx >= 0 && idx < GLANCE_TRAIL_CONTENT.beats.length) {
      return GLANCE_TRAIL_CONTENT.beats[idx];
    }
    return null;
  }

  public getDetailExpanded(): boolean {
    return this.isDetailExpanded;
  }

  public getRescueHintActive(): boolean {
    return this.isRescueHintActive;
  }

  public getOutOfView(): boolean {
    return this.isOutOfView;
  }

  public getOutOfViewDirection(): "left" | "right" | "none" {
    return this.outOfViewDirection;
  }

  public isTrailConnected(): boolean {
    return (
      this.currentState === RehearsalState.GUIDED_COMPLETE ||
      this.currentState === RehearsalState.SYMBOL_PROBLEM ||
      this.currentState === RehearsalState.SYMBOL_PROOF ||
      this.currentState === RehearsalState.SYMBOL_ASK ||
      this.currentState === RehearsalState.FINAL_COMPLETE
    );
  }

  public isLocked(): boolean {
    return this.isTransitionLocked;
  }

  public addListener(listener: StateListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(previousState: RehearsalState): void {
    const payload: StateChangePayload = {
      previousState,
      currentState: this.currentState,
      currentBeatIndex: this.getCurrentBeatIndex(),
      isDetailExpanded: this.isDetailExpanded,
      isRescueHintActive: this.isRescueHintActive,
      isOutOfView: this.isOutOfView,
      outOfViewDirection: this.outOfViewDirection,
      isTrailConnected: this.isTrailConnected(),
      transitionLock: this.isTransitionLocked
    };
    for (const listener of this.listeners) {
      try {
        listener(payload);
      } catch (err) {
        if (typeof print === "function") {
          print(`[GlanceTrailController] Error in listener: ${err}`);
        }
      }
    }
  }

  private lockTransitions(): boolean {
    if (this.isTransitionLocked) {
      return false;
    }
    this.isTransitionLocked = true;
    if (this.transitionLockTimerHandle) {
      this.timerService.cancel(this.transitionLockTimerHandle);
    }
    this.transitionLockTimerHandle = this.timerService.schedule(
      GlanceTrailController.TRANSITION_LOCK_MS,
      () => {
        this.isTransitionLocked = false;
        this.transitionLockTimerHandle = null;
      }
    );
    return true;
  }

  public beginRehearsal(): boolean {
    if (this.currentState !== RehearsalState.WELCOME) {
      return false;
    }
    if (!this.lockTransitions()) {
      return false;
    }

    const prev = this.currentState;
    this.currentState = RehearsalState.GUIDED_PROBLEM;
    this.isDetailExpanded = false;
    this.isRescueHintActive = false;
    this.isOutOfView = false;
    this.outOfViewDirection = "none";
    this.hasPlayedExcursionChime = false;
    this.notify(prev);
    return true;
  }

  public toggleDetail(): boolean {
    const beatIdx = this.getCurrentBeatIndex();
    if (beatIdx === -1) {
      return false;
    }
    if (this.getMode() === RehearsalMode.SYMBOL_ONLY) {
      return false; // In symbol mode, persistent detail is disabled
    }

    const prev = this.currentState;
    this.isDetailExpanded = !this.isDetailExpanded;
    this.notify(prev);
    return true;
  }

  public advanceBeat(): boolean {
    if (!this.lockTransitions()) {
      return false;
    }

    const prev = this.currentState;
    let advanced = false;

    switch (this.currentState) {
      case RehearsalState.GUIDED_PROBLEM:
        this.currentState = RehearsalState.GUIDED_PROOF;
        advanced = true;
        break;
      case RehearsalState.GUIDED_PROOF:
        this.currentState = RehearsalState.GUIDED_ASK;
        advanced = true;
        break;
      case RehearsalState.GUIDED_ASK:
        this.currentState = RehearsalState.GUIDED_COMPLETE;
        advanced = true;
        break;
      case RehearsalState.SYMBOL_PROBLEM:
        this.currentState = RehearsalState.SYMBOL_PROOF;
        advanced = true;
        break;
      case RehearsalState.SYMBOL_PROOF:
        this.currentState = RehearsalState.SYMBOL_ASK;
        advanced = true;
        break;
      case RehearsalState.SYMBOL_ASK:
        this.currentState = RehearsalState.FINAL_COMPLETE;
        advanced = true;
        break;
      default:
        advanced = false;
        break;
    }

    if (advanced) {
      this.isDetailExpanded = false;
      this.isRescueHintActive = false;
      this.hasPlayedExcursionChime = false;
      if (this.rescueHintTimerHandle) {
        this.timerService.cancel(this.rescueHintTimerHandle);
        this.rescueHintTimerHandle = null;
      }
      this.notify(prev);
      return true;
    }
    return false;
  }

  public startSymbolMode(): boolean {
    if (this.currentState !== RehearsalState.GUIDED_COMPLETE) {
      return false;
    }
    if (!this.lockTransitions()) {
      return false;
    }

    const prev = this.currentState;
    this.currentState = RehearsalState.SYMBOL_PROBLEM;
    this.isDetailExpanded = false;
    this.isRescueHintActive = false;
    this.isOutOfView = false;
    this.outOfViewDirection = "none";
    this.hasPlayedExcursionChime = false;
    this.notify(prev);
    return true;
  }

  public triggerRescueHint(durationMs: number = GlanceTrailController.RESCUE_HINT_DURATION_MS): boolean {
    if (this.getMode() !== RehearsalMode.SYMBOL_ONLY) {
      return false;
    }

    const prev = this.currentState;
    this.isRescueHintActive = true;
    this.notify(prev);

    if (this.rescueHintTimerHandle) {
      this.timerService.cancel(this.rescueHintTimerHandle);
    }

    this.rescueHintTimerHandle = this.timerService.schedule(durationMs, () => {
      this.isRescueHintActive = false;
      this.rescueHintTimerHandle = null;
      this.notify(this.currentState);
    });

    return true;
  }

  public reset(): void {
    const prev = this.currentState;
    if (this.rescueHintTimerHandle) {
      this.timerService.cancel(this.rescueHintTimerHandle);
      this.rescueHintTimerHandle = null;
    }
    if (this.transitionLockTimerHandle) {
      this.timerService.cancel(this.transitionLockTimerHandle);
      this.transitionLockTimerHandle = null;
    }

    this.currentState = RehearsalState.WELCOME;
    this.isDetailExpanded = false;
    this.isRescueHintActive = false;
    this.isOutOfView = false;
    this.outOfViewDirection = "none";
    this.hasPlayedExcursionChime = false;
    this.isTransitionLocked = false;
    this.notify(prev);
  }

  /**
   * Normalizes an angular delta across the [-180, +180] degree boundary.
   */
  public static normalizeAngleDelta(deltaDegrees: number): number {
    let d = deltaDegrees % 360;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return d;
  }

  /**
   * Evaluates camera yaw angle relative to active beacon, with ±180° normalization.
   * Returns true if guidance chime should play (strictly once per excursion).
   */
  public updateCameraYaw(cameraYawDegrees: number): boolean {
    const activeBeat = this.getCurrentBeat();
    if (!activeBeat) {
      if (this.isOutOfView) {
        this.isOutOfView = false;
        this.outOfViewDirection = "none";
        this.notify(this.currentState);
      }
      return false;
    }

    // Normalize angular difference across the [-180, +180] boundary
    const rawDiff = activeBeat.angleDegrees - cameraYawDegrees;
    const angularDiff = GlanceTrailController.normalizeAngleDelta(rawDiff);
    const isExcursion = Math.abs(angularDiff) > GlanceTrailController.FOV_HALF_ANGLE_DEG;

    let shouldPlayChime = false;

    if (isExcursion) {
      const dir: "left" | "right" = angularDiff < 0 ? "left" : "right";
      const changed = !this.isOutOfView || this.outOfViewDirection !== dir;
      this.isOutOfView = true;
      this.outOfViewDirection = dir;

      if (!this.hasPlayedExcursionChime) {
        this.hasPlayedExcursionChime = true;
        shouldPlayChime = true;
      }

      if (changed) {
        this.notify(this.currentState);
      }
    } else {
      if (this.isOutOfView) {
        this.isOutOfView = false;
        this.outOfViewDirection = "none";
        this.hasPlayedExcursionChime = false; // Reset for next excursion
        this.notify(this.currentState);
      }
    }

    return shouldPlayChime;
  }
}
