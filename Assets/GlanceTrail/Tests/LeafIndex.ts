/**
 * GlanceTrail - LEAF Scenarios Registration Index
 * 
 * Registers the 6 integration scenarios with the Lens Studio LEAF runner.
 * 
 * Note: These scenarios run exclusively inside the Lens Studio Interactive Preview
 * execution harness via Leaf.lspkg. When executing on host environments without
 * Lens Studio installed, their status is documented as LEAF_UNEXECUTABLE_WITHOUT_LENS_STUDIO.
 */

import {
  WelcomeStartsGuidedRehearsalScenario,
  DetailTogglesWithoutProgressScenario,
  ContinueAdvancesBeatGuardedScenario,
  ConnectedTrailAndSymbolModeScenario,
  RescueHintAndDirectionalGuidanceScenario,
  FinalCompleteAndResetCleansAllScenario
} from "./GlanceTrailLeafScenarios.ts";

export interface LeafScenarioDescriptor {
  id: string;
  criterionNumber: number;
  name: string;
  scenarioClass: any;
}

export const GLANCE_TRAIL_LEAF_SCENARIOS: LeafScenarioDescriptor[] = [
  {
    id: "glancetrail_leaf_01",
    criterionNumber: 1,
    name: "Criterion 1: Welcome starts guided rehearsal & activates Problem",
    scenarioClass: WelcomeStartsGuidedRehearsalScenario
  },
  {
    id: "glancetrail_leaf_02",
    criterionNumber: 2,
    name: "Criterion 2: Active cue detail toggles without advancing progress",
    scenarioClass: DetailTogglesWithoutProgressScenario
  },
  {
    id: "glancetrail_leaf_03",
    criterionNumber: 3,
    name: "Criterion 3: Continue advances exactly one beat with rapid-pinch guard",
    scenarioClass: ContinueAdvancesBeatGuardedScenario
  },
  {
    id: "glancetrail_leaf_04",
    criterionNumber: 4,
    name: "Criterion 4: Connected trail draws and symbol-only mode hides detail text",
    scenarioClass: ConnectedTrailAndSymbolModeScenario
  },
  {
    id: "glancetrail_leaf_05",
    criterionNumber: 5,
    name: "Criterion 5: Rescue hint self-hides after ~2s & directional arrow guides back",
    scenarioClass: RescueHintAndDirectionalGuidanceScenario
  },
  {
    id: "glancetrail_leaf_06",
    criterionNumber: 6,
    name: "Criterion 6: Final completion displays & Start over clears all stale state",
    scenarioClass: FinalCompleteAndResetCleansAllScenario
  }
];

// Helper to expose scenarios to Lens Studio test runner if present
declare const global: any;
if (typeof global !== "undefined") {
  global.__GLANCE_TRAIL_LEAF_SCENARIOS = GLANCE_TRAIL_LEAF_SCENARIOS;
}
