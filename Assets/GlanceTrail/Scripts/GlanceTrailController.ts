/**
 * GlanceTrail - State Controller
 * 
 * Manages deterministic rehearsal progression, idempotent guarded transitions,
 * detail expansion, symbol-only mode, self-hiding rescue hint timer,
 * directional guidance tracking, and clean state reset.
 */

import { GLANCE_TRAIL_CONTENT, type PitchBeat } from "../Content/GlanceTrailContent.ts";
import { RehearsalMode, RehearsalState, type StateChangePayload, type StateListener } from "./GlanceTrailTypes.ts";

export class GlanceTrailController {
  private currentState: RehearsalState = RehearsalState.WELCOME;
  private isDetailExpanded: boolean = false;
  private isRescueHintActive: boolean = false;
  private rescueHintTimeoutId: any = null;
  private isOutOfView: boolean = false;
  private outOfViewDirection: "left" | "right" | "none" = "none";
  private hasPlayedExcursionChime: boolean = false;
  private isTransitionLocked: boolean = false;
  private transitionLockTimeoutId: any = null;
  private listeners: StateListener[] = [];

  // Configuration constants
  public static readonly FOV_HALF_ANGLE_DEG = 16.0; // 32° FOV total / 2
  public static readonly RESCUE_HINT_DURATION_MS = 2000; // 2 seconds
  public static readonly TRANSITION_LOCK_MS = 250; // Guard against rapid pinches

  constructor() {
    this.reset();
  }

  // --- State queries ---

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

  // --- Listener management ---

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
        // Prevent listener errors from breaking state machine
        if (typeof print === "function") {
          print(`[GlanceTrailController] Listener error: ${err}`);
        }
      }
    }
  }

  private lockTransitions(): boolean {
    if (this.isTransitionLocked) {
      return false; // Dropped: already transitioning
    }
    this.isTransitionLocked = true;
    if (this.transitionLockTimeoutId) {
      clearTimeout(this.transitionLockTimeoutId);
    }
    this.transitionLockTimeoutId = setTimeout(() => {
      this.isTransitionLocked = false;
      this.transitionLockTimeoutId = null;
    }, GlanceTrailController.TRANSITION_LOCK_MS);
    return true;
  }

  // --- Core User Actions ---

  /**
   * Action 1: Pinch "Begin rehearsal" from Welcome
   */
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

  /**
   * Action 2: Pinch active beacon or cue ribbon to expand/collapse detail
   * (Idempotent, never advances progress)
   */
  public toggleDetail(): boolean {
    const beatIdx = this.getCurrentBeatIndex();
    if (beatIdx === -1) {
      return false; // Can only toggle detail when a beat is active
    }
    if (this.getMode() === RehearsalMode.SYMBOL_ONLY) {
      return false; // Detail toggle disabled in symbol-only mode (use rescue hint)
    }

    const prev = this.currentState;
    this.isDetailExpanded = !this.isDetailExpanded;
    this.notify(prev);
    return true;
  }

  /**
   * Action 3: Pinch "Continue" to advance exactly one beat
   * (Guarded against rapid repeated pinches)
   */
  public advanceBeat(): boolean {
    if (!this.lockTransitions()) {
      return false; // Guarded: drop rapid pinch
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
      if (this.rescueHintTimeoutId) {
        clearTimeout(this.rescueHintTimeoutId);
        this.rescueHintTimeoutId = null;
      }
      this.notify(prev);
      return true;
    }
    return false;
  }

  /**
   * Action 4: Pinch "Rehearse with symbols" from GUIDED_COMPLETE
   */
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

  /**
   * Action 5: Pinch "Rescue hint" in symbol-only mode
   * Reveals short cue for 2 seconds, then self-hides without advancing.
   */
  public triggerRescueHint(durationMs: number = GlanceTrailController.RESCUE_HINT_DURATION_MS): boolean {
    if (this.getMode() !== RehearsalMode.SYMBOL_ONLY) {
      return false;
    }

    const prev = this.currentState;
    this.isRescueHintActive = true;
    this.notify(prev);

    if (this.rescueHintTimeoutId) {
      clearTimeout(this.rescueHintTimeoutId);
    }

    this.rescueHintTimeoutId = setTimeout(() => {
      this.isRescueHintActive = false;
      this.rescueHintTimeoutId = null;
      this.notify(this.currentState);
    }, durationMs);

    return true;
  }

  /**
   * Action 6: Reset / Start Over
   * Returns experience to pristine Welcome state, wiping all stale objects.
   */
  public reset(): void {
    const prev = this.currentState;
    if (this.rescueHintTimeoutId) {
      clearTimeout(this.rescueHintTimeoutId);
      this.rescueHintTimeoutId = null;
    }
    if (this.transitionLockTimeoutId) {
      clearTimeout(this.transitionLockTimeoutId);
      this.transitionLockTimeoutId = null;
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

  // --- Head Orientation & Spatial Direction Tracking ---

  /**
   * Evaluates camera yaw angle relative to active beacon.
   * Returns true if guidance chime should play (once per excursion).
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

    const angularDiff = activeBeat.angleDegrees - cameraYawDegrees;
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
        this.hasPlayedExcursionChime = false; // Reset chime so next excursion can play
        this.notify(this.currentState);
      }
    }

    return shouldPlayChime;
  }
}
