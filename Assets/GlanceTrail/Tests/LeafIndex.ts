/**
 * GlanceTrail - LEAF Scenarios Index
 * 
 * Registers all 6 integration scenarios for automated preview execution in Lens Studio.
 */

import { GlanceTrailLeafScenarios } from "./GlanceTrailLeafScenarios.ts";

export interface ScenarioRegistration {
  id: string;
  name: string;
  criterionNumber: number;
  run: () => Promise<boolean>;
}

export const GLANCE_TRAIL_SCENARIOS: ScenarioRegistration[] = [
  {
    id: "glancetrail_01_welcome_starts_guided",
    name: "Criterion 1: Welcome starts guided rehearsal & activates Problem",
    criterionNumber: 1,
    run: () => GlanceTrailLeafScenarios.testWelcomeStartsGuidedRehearsal()
  },
  {
    id: "glancetrail_02_detail_toggles_without_progress",
    name: "Criterion 2: Active cue detail toggles without advancing progress",
    criterionNumber: 2,
    run: () => GlanceTrailLeafScenarios.testDetailTogglesWithoutProgress()
  },
  {
    id: "glancetrail_03_continue_advances_beat_guarded",
    name: "Criterion 3: Continue advances exactly one beat with rapid-pinch guard",
    criterionNumber: 3,
    run: () => GlanceTrailLeafScenarios.testContinueAdvancesBeatGuarded()
  },
  {
    id: "glancetrail_04_connected_trail_and_symbol_mode",
    name: "Criterion 4: Connected trail draws and symbol-only mode hides detail text",
    criterionNumber: 4,
    run: () => GlanceTrailLeafScenarios.testConnectedTrailAndSymbolMode()
  },
  {
    id: "glancetrail_05_rescue_hint_and_directional_guidance",
    name: "Criterion 5: Rescue hint self-hides after ~2s & directional arrow guides back",
    criterionNumber: 5,
    run: () => GlanceTrailLeafScenarios.testRescueHintAndDirectionalGuidance()
  },
  {
    id: "glancetrail_06_final_complete_and_reset_cleans_all",
    name: "Criterion 6: Final completion displays & Start over clears all stale state",
    criterionNumber: 6,
    run: () => GlanceTrailLeafScenarios.testFinalCompleteAndResetCleansAll()
  }
];

export async function runAllLeafScenarios(): Promise<{ id: string; name: string; passed: boolean; error?: string }[]> {
  const results = [];
  for (const scenario of GLANCE_TRAIL_SCENARIOS) {
    try {
      await scenario.run();
      results.push({ id: scenario.id, name: scenario.name, passed: true });
    } catch (err: any) {
      results.push({ id: scenario.id, name: scenario.name, passed: false, error: err?.message || String(err) });
    }
  }
  return results;
}
