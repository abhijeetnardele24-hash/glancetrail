# GlanceTrail — Controller Unit Test Results & LEAF Specification

**Date of Execution:** November 8, 2026  
**Test Runner:** Node.js (`tests/controller-unit-tests.ts`)  
**Scope:** Controller State Machine, Transition Guards, Yaw Normalization, Rescue Hint Timers, Reset Lifecycle  
**Unit Test Results:** **6 / 6 PASS (100%)** (`UNIT_LOGIC_PROVEN`)  
**LEAF Integration Suite:** Authored in `Assets/GlanceTrail/Tests/GlanceTrailLeafScenarios.ts` (`LEAF_UNEXECUTABLE_WITHOUT_LENS_STUDIO`)

---

## 1. Controller Unit Test Results Matrix (`UNIT_LOGIC_PROVEN`)

| # | Criterion | Test Method | Tested Assertion | Result | Evidence Classification |
|---|---|---|---|:---:|---|
| **1** | Welcome starts guided rehearsal & activates Problem | `Criterion 1` | Pinching Begin rehearsal reveals 3 beacons; activates Problem (`beat 0`); hides Welcome card; displays cue ribbon | **PASS** | `UNIT_LOGIC_PROVEN` |
| **2** | Active cue detail toggles without advancing | `Criterion 2` | Pinching active beacon/ribbon toggles detail text expansion; maintains current beat and state without advancing | **PASS** | `UNIT_LOGIC_PROVEN` |
| **3** | Continue advances exactly one beat with rapid-pinch guard | `Criterion 3` | Pinching Continue advances Problem → Proof → Ask; rapid repeated pinches are dropped by 250ms transition lock | **PASS** | `UNIT_LOGIC_PROVEN` |
| **4** | Connected trail draws & symbol mode hides text | `Criterion 4` | Completing Ask connects luminous memory trail; Rehearse with symbols hides persistent text; shows symbols only | **PASS** | `UNIT_LOGIC_PROVEN` |
| **5** | Rescue hint self-hides & directional arrow guides back | `Criterion 5` | Rescue hint reveals short cue for 2.0s then self-hides without advancing; out-of-view head rotation shows arrow & single chime | **PASS** | `UNIT_LOGIC_PROVEN` |
| **6** | Final completion displays & Start over cleans all state | `Criterion 6` | Completing symbol run shows final message; Start over returns to pristine Welcome with zero stale objects | **PASS** | `UNIT_LOGIC_PROVEN` |

---

## 2. Raw Unit Test Output (`npm test`)

```text
> glancetrail@1.0.0 test
> node --experimental-strip-types tests/controller-unit-tests.ts

=================================================
   GlanceTrail — Controller Unit Test Suite      
   Classification: UNIT_LOGIC_PROVEN             
=================================================
Executing 6 unit tests across all 6 done criteria...

[PASS [✓]] Criterion 1: Welcome starts guided rehearsal & activates only Problem (1 ms)
[PASS [✓]] Criterion 2: Active cue detail toggles without advancing progress (301 ms)
[PASS [✓]] Criterion 3: Continue advances exactly one beat with rapid-pinch guard (602 ms)
[PASS [✓]] Criterion 4: Connected trail draws and symbol-only mode hides detail text (1202 ms)
[PASS [✓]] Criterion 5: Rescue hint self-hides after ~2s & directional arrow guides back with single chime (3602 ms)
[PASS [✓]] Criterion 6: Final completion displays & Start over clears all stale state (2407 ms)

-------------------------------------------------
Total: 6 | Passed: 6 | Failed: 0
Execution Time: 8116 ms
-------------------------------------------------
```

---

## 3. Genuine LEAF Integration Scenarios Specification

The genuine LEAF scenarios are authored in [`Assets/GlanceTrail/Tests/GlanceTrailLeafScenarios.ts`](file:///c:/Users/Abhijeet%20Nardele/OneDrive/Desktop/devpost%20project/glancetrail/Assets/GlanceTrail/Tests/GlanceTrailLeafScenarios.ts) and registered in [`Assets/GlanceTrail/Tests/LeafIndex.ts`](file:///c:/Users/Abhijeet%20Nardele/OneDrive/Desktop/devpost%20project/glancetrail/Assets/GlanceTrail/Tests/LeafIndex.ts).

These scenarios interact directly with rendered Lens Studio SceneObjects via `Leaf.lspkg`:

1. `WelcomeStartsGuidedRehearsalScenario`:
   - Interacts with: `BeginRehearsalButton` (pinch).
   - Asserts: `WelcomeCard.enabled === false`, `Beacon_Problem.enabled === true`, `CueRibbon.enabled === true`.
2. `DetailTogglesWithoutProgressScenario`:
   - Interacts with: `CueRibbon` (pinch).
   - Asserts: `DetailText.enabled === true`, `DetailText.text` matches content, rehearsal does not advance.
3. `ContinueAdvancesBeatGuardedScenario`:
   - Interacts with: `ContinueButton` (rapid double pinch).
   - Asserts: `ShortCueText` matches Proof beat; rapid second pinch is guarded and does not skip to Ask.
4. `ConnectedTrailAndSymbolModeScenario`:
   - Interacts with: `ContinueButton` through Ask to `GUIDED_COMPLETE`, then pinches "Rehearse with symbols".
   - Asserts: `MemoryTrailLine.enabled === true`, `ShortCueText.text === "[ ⌖ ]"`, persistent body text is empty.
5. `RescueHintAndDirectionalGuidanceScenario`:
   - Interacts with: `RescueHintButton` (pinch), then alters `SpectaclesCamera` world rotation by 30°.
   - Asserts: `RescueHint` reveals text for 2.0s and self-hides; `DirectionalArrow.enabled === true` during excursion; single chime played; recovers cleanly when gaze recenters.
6. `FinalCompleteAndResetCleansAllScenario`:
   - Interacts with: `ContinueButton` through symbol rehearsal to `FINAL_COMPLETE`, then pinches `StartOverButton`.
   - Asserts: `CompletionCard` visible; reset cleanly hides all beacons, trail, ribbon, and hints with zero lingering objects.

### Honest LEAF Execution Blocker Notice
- **Status:** `LEAF_UNEXECUTABLE_WITHOUT_LENS_STUDIO`
- **Root Cause:** Snap Lens Studio 5.23+ is not installed on this local Windows machine (`reason: lens_studio_missing`).
- **Prerequisite:** The user must open `glancetrail.esproj` in Lens Studio 5.23+ to execute these scenarios inside the Lens Studio Interactive Preview test harness.

---

## 4. Hardware Limitations (`FEEL_UNPROVEN`)

- **Physical Comfort Over Time:** Head weight balance, heat dissipation, and neck fatigue during extended rehearsals cannot be verified in software.
- **Real-World Hand Tracking:** Natural finger occlusion, wrist roll angles, and tracking dropout in harsh ambient sunlight require physical SPECS hardware.
- **Acoustic Environment:** Spatial audio legibility in loud lecture rooms cannot be verified without physical speakers.
