// Assets/GlanceTrail/Content/GlanceTrailContent.ts
var GLANCE_TRAIL_CONTENT = {
  title: "GlanceTrail",
  tagline: "Rehearse with your eyes up.",
  welcomeButtonLabel: "Begin rehearsal",
  continueButtonLabel: "Continue",
  rehearseAgainButtonLabel: "Rehearse with symbols",
  startOverButtonLabel: "Start over",
  rescueHintButtonLabel: "Rescue hint",
  completionMessage: "Path remembered. Now say it without reading it.",
  rehearsalPrompt: "Pitch: Why spatial notes beat screen notes",
  beats: [
    {
      id: "beat_problem",
      name: "Problem",
      symbol: "\u25BC \u2316 \u{1F441}",
      // Downward glance / broken eye-line icon
      shortCue: "Screens pull your eyes away.",
      detailText: "Notes help you remember words, but they break connection with the room.",
      angleDegrees: -13,
      positionCm: { x: -24.75, y: -15, z: -110 },
      accentColorHex: "#FF7A6B",
      // Soft coral
      accentColorRgba: [1, 0.478, 0.42, 1]
    },
    {
      id: "beat_proof",
      name: "Proof",
      symbol: "\u2726 \u2500\u2500 \u2726 \u2500\u2500 \u2726",
      // Three linked markers
      shortCue: "Place gives memory a shape.",
      detailText: "Three ideas in three positions are easier to recall than one scrolling page.",
      angleDegrees: 0,
      positionCm: { x: 0, y: -15, z: -110 },
      accentColorHex: "#65E6E0",
      // Proof cyan
      accentColorRgba: [0.396, 0.902, 0.878, 1]
    },
    {
      id: "beat_ask",
      name: "Ask",
      symbol: "\u25B2 \u2500\u2500\u2500 \u2600",
      // Eyes-up horizon
      shortCue: "Rehearse the path, not the paragraph.",
      detailText: "Try one final run with symbols only and keep your eyes up.",
      angleDegrees: 13,
      positionCm: { x: 24.75, y: -15, z: -110 },
      accentColorHex: "#FFD27A",
      // Champagne light
      accentColorRgba: [1, 0.824, 0.478, 1]
    }
  ]
};
var COLOR_PALETTE = {
  warmLight: "#FFD27A",
  activeCoral: "#FF7A6B",
  proofCyan: "#65E6E0",
  completionMint: "#9FF0C1",
  mainTextPorcelain: "#FFF7E8",
  cobaltPrimaryAction: "#2A5CAA",
  milkGlassBackground: "rgba(255, 247, 232, 0.12)",
  beaconDimAlpha: 0.35,
  beaconActiveAlpha: 1
};

// Assets/GlanceTrail/Audio/GlanceTrailAudio.ts
var GlanceTrailAudio = class {
  isMuted = false;
  audioComponent = null;
  constructor(audioComponent) {
    this.audioComponent = audioComponent || null;
  }
  setMuted(muted) {
    this.isMuted = muted;
  }
  getMuted() {
    return this.isMuted;
  }
  playBeatAdvance(beatIndex) {
    if (this.isMuted) return;
    this.logOrPlay(`BeatAdvance_${beatIndex}`);
  }
  playTrailConnected() {
    if (this.isMuted) return;
    this.logOrPlay("TrailConnected_Chord");
  }
  playExcursionChime() {
    if (this.isMuted) return;
    this.logOrPlay("DirectionalGuidance_Chime");
  }
  playRescueHintChime() {
    if (this.isMuted) return;
    this.logOrPlay("RescueHint_Tone");
  }
  playResetChime() {
    if (this.isMuted) return;
    this.logOrPlay("Reset_SoftFaint");
  }
  logOrPlay(soundName) {
    if (this.audioComponent && typeof this.audioComponent.play === "function") {
      try {
        this.audioComponent.play(soundName);
      } catch (err) {
      }
    }
  }
};

// Assets/GlanceTrail/Scripts/GlanceTrailTypes.ts
var RehearsalState = {
  WELCOME: "WELCOME",
  GUIDED_PROBLEM: "GUIDED_PROBLEM",
  GUIDED_PROOF: "GUIDED_PROOF",
  GUIDED_ASK: "GUIDED_ASK",
  GUIDED_COMPLETE: "GUIDED_COMPLETE",
  SYMBOL_PROBLEM: "SYMBOL_PROBLEM",
  SYMBOL_PROOF: "SYMBOL_PROOF",
  SYMBOL_ASK: "SYMBOL_ASK",
  FINAL_COMPLETE: "FINAL_COMPLETE"
};
var RehearsalMode = {
  WELCOME: "WELCOME",
  GUIDED: "GUIDED",
  SYMBOL_ONLY: "SYMBOL_ONLY",
  COMPLETE: "COMPLETE"
};

// Assets/GlanceTrail/Scripts/GlanceTrailController.ts
var GlanceTrailController = class _GlanceTrailController {
  currentState = RehearsalState.WELCOME;
  isDetailExpanded = false;
  isRescueHintActive = false;
  rescueHintTimeoutId = null;
  isOutOfView = false;
  outOfViewDirection = "none";
  hasPlayedExcursionChime = false;
  isTransitionLocked = false;
  transitionLockTimeoutId = null;
  listeners = [];
  // Configuration constants
  static FOV_HALF_ANGLE_DEG = 16;
  // 32° FOV total / 2
  static RESCUE_HINT_DURATION_MS = 2e3;
  // 2 seconds
  static TRANSITION_LOCK_MS = 250;
  // Guard against rapid pinches
  constructor() {
    this.reset();
  }
  // --- State queries ---
  getState() {
    return this.currentState;
  }
  getMode() {
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
  getCurrentBeatIndex() {
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
  getCurrentBeat() {
    const idx = this.getCurrentBeatIndex();
    if (idx >= 0 && idx < GLANCE_TRAIL_CONTENT.beats.length) {
      return GLANCE_TRAIL_CONTENT.beats[idx];
    }
    return null;
  }
  getDetailExpanded() {
    return this.isDetailExpanded;
  }
  getRescueHintActive() {
    return this.isRescueHintActive;
  }
  getOutOfView() {
    return this.isOutOfView;
  }
  getOutOfViewDirection() {
    return this.outOfViewDirection;
  }
  isTrailConnected() {
    return this.currentState === RehearsalState.GUIDED_COMPLETE || this.currentState === RehearsalState.SYMBOL_PROBLEM || this.currentState === RehearsalState.SYMBOL_PROOF || this.currentState === RehearsalState.SYMBOL_ASK || this.currentState === RehearsalState.FINAL_COMPLETE;
  }
  isLocked() {
    return this.isTransitionLocked;
  }
  setStateForTesting(state) {
    const prev = this.currentState;
    this.currentState = state;
    this.isDetailExpanded = false;
    this.isRescueHintActive = false;
    this.isTransitionLocked = false;
    this.notify(prev);
  }
  // --- Listener management ---
  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
  notify(previousState) {
    const payload = {
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
          print(`[GlanceTrailController] Listener error: ${err}`);
        }
      }
    }
  }
  lockTransitions() {
    if (this.isTransitionLocked) {
      return false;
    }
    this.isTransitionLocked = true;
    if (this.transitionLockTimeoutId) {
      clearTimeout(this.transitionLockTimeoutId);
    }
    this.transitionLockTimeoutId = setTimeout(() => {
      this.isTransitionLocked = false;
      this.transitionLockTimeoutId = null;
    }, _GlanceTrailController.TRANSITION_LOCK_MS);
    return true;
  }
  // --- Core User Actions ---
  /**
   * Action 1: Pinch "Begin rehearsal" from Welcome
   */
  beginRehearsal() {
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
  toggleDetail() {
    const beatIdx = this.getCurrentBeatIndex();
    if (beatIdx === -1) {
      return false;
    }
    if (this.getMode() === RehearsalMode.SYMBOL_ONLY) {
      return false;
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
  advanceBeat() {
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
  startSymbolMode() {
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
  triggerRescueHint(durationMs = _GlanceTrailController.RESCUE_HINT_DURATION_MS) {
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
  reset() {
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
  updateCameraYaw(cameraYawDegrees) {
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
    const isExcursion = Math.abs(angularDiff) > _GlanceTrailController.FOV_HALF_ANGLE_DEG;
    let shouldPlayChime = false;
    if (isExcursion) {
      const dir = angularDiff < 0 ? "left" : "right";
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
        this.hasPlayedExcursionChime = false;
        this.notify(this.currentState);
      }
    }
    return shouldPlayChime;
  }
};

// Assets/GlanceTrail/Scripts/GlanceTrailUI.ts
var GlanceTrailUI = class {
  controller;
  audio;
  lastSnapshot = null;
  constructor(controller, audio) {
    this.controller = controller;
    this.audio = audio || new GlanceTrailAudio();
    this.controller.addListener((payload) => this.onStateChange(payload));
    this.updateSnapshot();
  }
  getSnapshot() {
    if (!this.lastSnapshot) {
      this.updateSnapshot();
    }
    return this.lastSnapshot;
  }
  onStateChange(payload) {
    if (payload.currentState !== payload.previousState) {
      if (payload.currentState === RehearsalState.GUIDED_PROOF) {
        this.audio.playBeatAdvance(1);
      } else if (payload.currentState === RehearsalState.GUIDED_ASK) {
        this.audio.playBeatAdvance(2);
      } else if (payload.currentState === RehearsalState.GUIDED_COMPLETE) {
        this.audio.playTrailConnected();
      } else if (payload.currentState === RehearsalState.SYMBOL_PROOF) {
        this.audio.playBeatAdvance(1);
      } else if (payload.currentState === RehearsalState.SYMBOL_ASK) {
        this.audio.playBeatAdvance(2);
      } else if (payload.currentState === RehearsalState.FINAL_COMPLETE) {
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
  updateSnapshot() {
    const state = this.controller.getState();
    const mode = this.controller.getMode();
    const beatIdx = this.controller.getCurrentBeatIndex();
    const beat = this.controller.getCurrentBeat();
    const isDetail = this.controller.getDetailExpanded();
    const isHint = this.controller.getRescueHintActive();
    const isOutOfView = this.controller.getOutOfView();
    const outOfViewDir = this.controller.getOutOfViewDirection();
    let welcomeVisible = state === RehearsalState.WELCOME;
    let beaconsVisible = state !== RehearsalState.WELCOME && state !== RehearsalState.FINAL_COMPLETE;
    let cueRibbonVisible = beatIdx !== -1 && (mode === RehearsalMode.GUIDED || mode === RehearsalMode.SYMBOL_ONLY);
    let continueButtonVisible = beatIdx !== -1;
    let rescueHintVisible = mode === RehearsalMode.SYMBOL_ONLY && beatIdx !== -1;
    let trailConnectedVisible = this.controller.isTrailConnected() && state !== RehearsalState.WELCOME;
    let completionVisible = state === RehearsalState.GUIDED_COMPLETE || state === RehearsalState.FINAL_COMPLETE;
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
      cueText = {
        symbol: beat.symbol,
        shortCue: mode === RehearsalMode.SYMBOL_ONLY ? isHint ? beat.shortCue : "" : beat.shortCue,
        detailText: mode === RehearsalMode.GUIDED && isDetail ? beat.detailText : "",
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
  // --- Interaction Triggers (called by SIK interactor or preview click) ---
  onBeginRehearsalClicked() {
    return this.controller.beginRehearsal();
  }
  onActiveCueClicked() {
    return this.controller.toggleDetail();
  }
  onContinueClicked() {
    const state = this.controller.getState();
    if (state === RehearsalState.GUIDED_COMPLETE) {
      return this.controller.startSymbolMode();
    } else if (state === RehearsalState.FINAL_COMPLETE) {
      this.controller.reset();
      return true;
    }
    return this.controller.advanceBeat();
  }
  onRescueHintClicked() {
    return this.controller.triggerRescueHint();
  }
  onStartOverClicked() {
    this.controller.reset();
    return true;
  }
};
export {
  COLOR_PALETTE,
  GLANCE_TRAIL_CONTENT,
  GlanceTrailController,
  GlanceTrailUI
};
