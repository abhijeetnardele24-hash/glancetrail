/**
 * GlanceTrail - Core Types & State Definitions
 */

export const RehearsalState = {
  WELCOME: "WELCOME",
  GUIDED_PROBLEM: "GUIDED_PROBLEM",
  GUIDED_PROOF: "GUIDED_PROOF",
  GUIDED_ASK: "GUIDED_ASK",
  GUIDED_COMPLETE: "GUIDED_COMPLETE",
  SYMBOL_PROBLEM: "SYMBOL_PROBLEM",
  SYMBOL_PROOF: "SYMBOL_PROOF",
  SYMBOL_ASK: "SYMBOL_ASK",
  FINAL_COMPLETE: "FINAL_COMPLETE"
} as const;

export type RehearsalState = typeof RehearsalState[keyof typeof RehearsalState];

export const RehearsalMode = {
  WELCOME: "WELCOME",
  GUIDED: "GUIDED",
  SYMBOL_ONLY: "SYMBOL_ONLY",
  COMPLETE: "COMPLETE"
} as const;

export type RehearsalMode = typeof RehearsalMode[keyof typeof RehearsalMode];

export interface StateChangePayload {
  previousState: RehearsalState;
  currentState: RehearsalState;
  currentBeatIndex: number; // 0 = Problem, 1 = Proof, 2 = Ask, -1 = none
  isDetailExpanded: boolean;
  isRescueHintActive: boolean;
  isOutOfView: boolean;
  outOfViewDirection: "left" | "right" | "none";
  isTrailConnected: boolean;
  transitionLock: boolean;
}

export type StateListener = (state: StateChangePayload) => void;
