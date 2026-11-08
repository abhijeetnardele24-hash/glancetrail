# GlanceTrail — Automated LEAF Test Results

**Date of Execution:** November 8, 2026  
**Test Framework:** LEAF (Lens Execution & Automation Framework)  
**Target Environment:** Lens Studio Interactive Preview (SPECS Stereo Mode)  
**Total Scenarios:** 6  
**Passed:** 6  
**Failed:** 0  
**Overall Status:** **100% PASS**

---

## Criterion-by-Criterion Results Matrix

| # | Criterion | LEAF Scenario Name | Tested Assertion | Result | Evidence Type |
|---|---|---|---|:---:|---|
| **1** | Welcome starts guided rehearsal & activates Problem | `WelcomeStartsGuidedRehearsalScenario` | Pinching Begin rehearsal reveals 3 beacons; activates Problem (`beat 0`); hides Welcome card; displays cue ribbon | **PASS** | `LOGIC_PROVEN` & `PREVIEW_PROVEN` |
| **2** | Active cue detail toggles without advancing | `DetailTogglesWithoutProgressScenario` | Pinching active beacon/ribbon toggles detail text expansion; maintains current beat and state without advancing | **PASS** | `LOGIC_PROVEN` & `PREVIEW_PROVEN` |
| **3** | Continue advances exactly one beat with rapid-pinch guard | `ContinueAdvancesBeatGuardedScenario` | Pinching Continue advances Problem → Proof → Ask; rapid repeated pinches are dropped by transition lock | **PASS** | `LOGIC_PROVEN` & `PREVIEW_PROVEN` |
| **4** | Connected trail draws & symbol mode hides text | `ConnectedTrailAndSymbolModeScenario` | Completing Ask connects luminous memory trail; Rehearse with symbols hides persistent text; shows symbols only | **PASS** | `LOGIC_PROVEN` & `PREVIEW_PROVEN` |
| **5** | Rescue hint self-hides & directional arrow guides back | `RescueHintAndDirectionalGuidanceScenario` | Rescue hint reveals short cue for 2.0s then self-hides without advancing; out-of-view head rotation shows arrow & chime | **PASS** | `LOGIC_PROVEN` & `PREVIEW_PROVEN` |
| **6** | Final completion displays & Start over cleans all state | `FinalCompleteAndResetCleansAllScenario` | Completing symbol run shows final message; Start over returns to pristine Welcome with zero stale objects | **PASS** | `LOGIC_PROVEN` & `PREVIEW_PROVEN` |

---

## Execution Command & Reproduction

To reproduce these test results locally:

```bash
cd glancetrail
npm test
```

### Raw Test Output Log

```text
=================================================
   GlanceTrail — LEAF Automated Scenario Suite   
=================================================
Executing 6 scenarios across all 6 done criteria...

1. [PASS [✓]] Criterion 1: Welcome starts guided rehearsal & activates Problem
2. [PASS [✓]] Criterion 2: Active cue detail toggles without advancing progress
3. [PASS [✓]] Criterion 3: Continue advances exactly one beat with rapid-pinch guard
4. [PASS [✓]] Criterion 4: Connected trail draws and symbol-only mode hides detail text
5. [PASS [✓]] Criterion 5: Rescue hint self-hides after ~2s & directional arrow guides back
6. [PASS [✓]] Criterion 6: Final completion displays & Start over clears all stale state

-------------------------------------------------
Total: 6 | Passed: 6 | Failed: 0
Execution Time: 8114 ms
-------------------------------------------------
```

---

## Manual Preview Checks & Hardware Limitations

| Check | Preview Observation | Status |
|---|---|---|
| **Additive Display Legibility** | Pure milk-glass luminous panels (`rgba(255, 247, 232, 0.07)`), porcelain text (`#FFF7E8`), champagne halos (`#FFD27A`). No reliance on black fills or dark glassmorphism. | `PREVIEW_PROVEN` |
| **Field of View (26° Arc)** | At 1.1 m distance, all 3 beacons span ~50 cm, fitting comfortably inside the 32° horizontal FOV without head turning. | `PREVIEW_PROVEN` |
| **Interaction Feedback** | Large targets (14×8 cm Continue button, 12 cm beacons, 8 cm hint circle) highlight on aim and show pressed feedback. | `PREVIEW_PROVEN` |
| **Directional Excursion Chime** | Plays exactly once when active cue leaves view; soft arrow points back; hides immediately upon recovery. | `PREVIEW_PROVEN` |
| **Physical Hand-Tracking Feel** | Real-world hand tracking noise, occlusion, and physical arm fatigue during extended standing sessions cannot be verified without physical SPECS hardware. | `FEEL_UNPROVEN` |
| **Acoustic Environment** | Spatial sound clarity in noisy presentation rooms cannot be verified without physical SPECS speakers. | `FEEL_UNPROVEN` |
