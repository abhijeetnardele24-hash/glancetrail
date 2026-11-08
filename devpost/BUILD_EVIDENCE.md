# GlanceTrail — Build Evidence & Verification Log

**Project:** GlanceTrail (*Rehearse with your eyes up.*)  
**Hackathon:** Learn AR with SPECS (Devpost & Snap)  
**Competition URL:** [https://learn-specs.devpost.com/](https://learn-specs.devpost.com/)  
**Rules URL:** [https://learn-specs.devpost.com/rules](https://learn-specs.devpost.com/rules)  
**Resources URL:** [https://learn-specs.devpost.com/resources](https://learn-specs.devpost.com/resources)  
**Official Submission Deadline:** November 9, 2026 at 5:00 PM EST (November 10, 2026 at 3:30 AM IST)  
**Verification Date/Time:** November 8, 2026  
**Audited Status:** `INTERNAL_ENGINEERING_COMPLETE_AWAITING_LENS_STUDIO_HOST`

---

## 1. Environment & Tooling Verification

| Component | Verified Version / State | Notes & Provenance |
| :--- | :--- | :--- |
| **Operating System** | Windows 11 Home (x64) | PowerShell 7 (pwsh) runtime |
| **Node.js** | `v24.11.1` | Native CLI verified |
| **npm** | `11.6.2` | Native CLI verified |
| **Git** | `2.53.0.windows.2` | Native CLI verified |
| **FFmpeg** | `9.0.2-full_build-www.gyan.dev` | Media pipeline verified |
| **Lens Studio MCP** | Configured in `.mcp.json` (`http://127.0.0.1:49152/mcp`) | Port 49152 closed; requires Lens Studio running |
| **Lens Studio Binary** | **Not Installed on Host** | Requires user installation of Lens Studio 5.23+ to launch Interactive Preview |
| **Design Brief** | Approved (`devpost/design-brief.md`) | Planning complete via `plan-lens` |
| **Controller Unit Tests** | `tests/controller-unit-tests.ts` | **6 / 6 PASS (100%)** via `npm test` (`UNIT_LOGIC_PROVEN`) |
| **LEAF Scenarios** | `Assets/GlanceTrail/Tests/GlanceTrailLeafScenarios.ts` | Fully authored using `Leaf.lspkg` contracts; `LEAF_UNEXECUTABLE_WITHOUT_LENS_STUDIO` |
| **Lens Studio Scene Graph** | `Assets/GlanceTrail/GlanceTrailScene.json` | Declarative scene hierarchy with SIK interactables, 1.1m depth, 26° arc |
| **Lens Studio Scene Component** | `Assets/GlanceTrail/Scripts/GlanceTrailSceneComponent.ts` | Native TypeScript component with `DelayedCallbackEvent` timer support |

---

## 2. Done Criteria Verification Matrix

| Criterion # | Description | Tested Component | Automated Result | Evidence Classification |
|:---:|---|---|:---:|:---:|
| **1** | Pinching Begin rehearsal reveals 3 beacons & activates Problem | `WelcomeStartsGuidedRehearsal` | **PASS (100%)** | `UNIT_LOGIC_PROVEN`<br>*LEAF & Preview blocked without Lens Studio* |
| **2** | Pinching active beacon/ribbon toggles detail without advancing | `DetailTogglesWithoutProgress` | **PASS (100%)** | `UNIT_LOGIC_PROVEN`<br>*LEAF & Preview blocked without Lens Studio* |
| **3** | Continue advances exactly one beat with rapid-pinch guard | `ContinueAdvancesBeatGuarded` | **PASS (100%)** | `UNIT_LOGIC_PROVEN`<br>*LEAF & Preview blocked without Lens Studio* |
| **4** | Completing Ask connects trail; Rehearse with symbols hides body text | `ConnectedTrailAndSymbolMode` | **PASS (100%)** | `UNIT_LOGIC_PROVEN`<br>*LEAF & Preview blocked without Lens Studio* |
| **5** | Rescue hint reveals short cue for ~2s; head turn shows edge arrow | `RescueHintAndDirectionalGuidance` | **PASS (100%)** | `UNIT_LOGIC_PROVEN`<br>*LEAF & Preview blocked without Lens Studio* |
| **6** | Final completion displays message; Start over resets cleanly | `FinalCompleteAndResetCleansAll` | **PASS (100%)** | `UNIT_LOGIC_PROVEN`<br>*LEAF & Preview blocked without Lens Studio* |

---

## 3. Strict Truth Hierarchy Disclosures

1. **Browser Prototype Disclosure:**
   - Files under `prototype/browser-mock/` are 2D web prototypes used during early concept exploration.
   - They are explicitly **not** Lens Studio Interactive Preview captures and are retained strictly as non-submission reference material.
2. **LEAF Scenarios Disclosure:**
   - Real LEAF scenarios are fully authored in `Assets/GlanceTrail/Tests/GlanceTrailLeafScenarios.ts` and registered in `Assets/GlanceTrail/Tests/LeafIndex.ts`.
   - Because Snap Lens Studio 5.23+ is not installed on this local Windows machine, LEAF tests cannot be executed locally. They must be executed inside the Lens Studio Preview test runner once the project is opened in Lens Studio.
3. **Interactive Preview Disclosure:**
   - No screenshots or video are claimed as "Preview Proven" until freshly captured from the running Lens Studio 5.23+ Interactive Preview window.
   - Chrome-captured images were removed from `devpost/screenshots/` and relocated to `prototype/browser-mock/screenshots/`.
4. **Hardware Limitations (`FEEL_UNPROVEN`):**
   - **Head & Neck Comfort:** Fatigue over 10+ minute rehearsals cannot be measured without physical SPECS hardware.
   - **Real-World Hand Tracking:** Noise, dropouts, or finger occlusions under bright sunlight cannot be evaluated in software.
   - **Additive Display Luminance:** Real optical contrast against bright physical walls requires testing on the physical wave-guide display.
   - **Zero Unmeasured Claims:** GlanceTrail makes no unmeasured claims regarding memory retention statistics or cognitive enhancements.
