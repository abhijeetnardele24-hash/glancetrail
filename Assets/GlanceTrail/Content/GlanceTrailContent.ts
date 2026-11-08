/**
 * GlanceTrail - Content Data Model
 * 
 * Provides deterministic, realistic pitch content for the 3-beat rehearsal:
 * Beat 1: Problem (front-left)
 * Beat 2: Proof (center)
 * Beat 3: Ask (front-right)
 */

export interface PitchBeat {
  id: string;
  name: string;
  symbol: string;
  shortCue: string;
  detailText: string;
  angleDegrees: number; // Angular offset in the 26° arc (-13° to +13°)
  positionCm: { x: number; y: number; z: number };
  accentColorHex: string;
  accentColorRgba: [number, number, number, number];
}

export interface GlanceTrailContentConfig {
  title: string;
  tagline: string;
  welcomeButtonLabel: string;
  continueButtonLabel: string;
  rehearseAgainButtonLabel: string;
  startOverButtonLabel: string;
  rescueHintButtonLabel: string;
  completionMessage: string;
  rehearsalPrompt: string;
  beats: PitchBeat[];
}

export const GLANCE_TRAIL_CONTENT: GlanceTrailContentConfig = {
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
      symbol: "▼ ⌖ 👁", // Downward glance / broken eye-line icon
      shortCue: "Screens pull your eyes away.",
      detailText: "Notes help you remember words, but they break connection with the room.",
      angleDegrees: -13.0,
      positionCm: { x: -24.75, y: -15.0, z: -110.0 },
      accentColorHex: "#FF7A6B", // Soft coral
      accentColorRgba: [1.0, 0.478, 0.420, 1.0]
    },
    {
      id: "beat_proof",
      name: "Proof",
      symbol: "✦ ── ✦ ── ✦", // Three linked markers
      shortCue: "Place gives memory a shape.",
      detailText: "Three ideas in three positions are easier to recall than one scrolling page.",
      angleDegrees: 0.0,
      positionCm: { x: 0.0, y: -15.0, z: -110.0 },
      accentColorHex: "#65E6E0", // Proof cyan
      accentColorRgba: [0.396, 0.902, 0.878, 1.0]
    },
    {
      id: "beat_ask",
      name: "Ask",
      symbol: "▲ ─── ☀", // Eyes-up horizon
      shortCue: "Rehearse the path, not the paragraph.",
      detailText: "Try one final run with symbols only and keep your eyes up.",
      angleDegrees: 13.0,
      positionCm: { x: 24.75, y: -15.0, z: -110.0 },
      accentColorHex: "#FFD27A", // Champagne light
      accentColorRgba: [1.0, 0.824, 0.478, 1.0]
    }
  ]
};

export const COLOR_PALETTE = {
  warmLight: "#FFD27A",
  activeCoral: "#FF7A6B",
  proofCyan: "#65E6E0",
  completionMint: "#9FF0C1",
  mainTextPorcelain: "#FFF7E8",
  cobaltPrimaryAction: "#2A5CAA",
  milkGlassBackground: "rgba(255, 247, 232, 0.12)",
  beaconDimAlpha: 0.35,
  beaconActiveAlpha: 1.0
};
