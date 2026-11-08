# GlanceTrail — Devpost Submission Package

**Project Name:** GlanceTrail  
**Tagline:** Rehearse with your eyes up.  
**Track:** Learn AR with SPECS (Devpost & Snap)  
**Primary Repository URL:** `https://github.com/abhijeetnardele24-hash/glancetrail` (to be pushed after preview sign-off)  
**Video Demo URL:** `PLACEHOLDER_YOUTUBE_URL` (to be recorded from real Lens Studio preview)  

---

## Inspiration

When speakers rehearse a presentation, traditional notes and teleprompters preserve the script but break connection with the audience. Looking down at a phone or laptop pulls your gaze out of the room, stiffens your posture, and encourages reading sentences instead of communicating ideas.

We wanted to use AR glasses for something a flat computer screen cannot do: make physical location itself part of remembering. By anchoring ideas to stable places across your rehearsal space, memory gains a physical shape.

---

## What It Does

GlanceTrail is a spatial rehearsal coach for SPECS that helps speakers practice a pitch without notes:

1. **Spatial Anchors:** Places three luminous beacons across a 26° arc in your room (about 1.1 meters away, slightly below eye level): **Problem** (front-left), **Proof** (center), and **Ask** (front-right).
2. **Guided First Run:** Only the active beacon expands into a concise cue ribbon with optional detail on demand. Advancing with a large pinch folds the idea into a warm beacon and awakens the next beat. Upon completion, a luminous memory path connects all three points.
3. **Symbol-Only Transformation:** On the second rehearsal, persistent sentences disappear. Only spatial symbols (`[ ⌖ ]`, `[ ✦ ─ ✦ ─ ✦ ]`, `[ ☼ ]`) remain on the beacons. The speaker learns to rely on physical space and argument flow rather than reading text.
4. **Failsafe Guidance:** If the speaker gets stuck, a secondary "Rescue hint" temporarily reveals the short cue for two seconds before self-hiding. If head movement drifts away from the active cue, a soft directional edge arrow and single gentle chime point the way back.
5. **Clean Reset:** Completing the rehearsal displays *"Path remembered. Now say it without reading it,"* and a Start over button cleanly wipes all state back to Welcome.

---

## How We Built It

- **Design Phase:** Planned through Devpost’s official `plan-lens` skill, formalizing an approved design brief (`devpost/design-brief.md`) calibrated to SPECS’ 32° FOV and additive display optics.
- **Scene Architecture:** Authored a complete declarative Lens Studio scene graph (`Assets/GlanceTrail/GlanceTrailScene.json`) with root camera tracking, SIK InteractionManager, 12 cm milk-glass beacons, 44×18 cm cue ribbon, cobalt Continue button, 8 cm circular hint, and mint memory trail.
- **Lens Studio Script Component:** Implemented `Assets/GlanceTrail/Scripts/GlanceTrailSceneComponent.ts` integrating SIK `Interactable` pinches, 3D text meshes, and a custom `LensStudioTimerService` using Lens Studio's `DelayedCallbackEvent`.
- **State Controller:** Engineered a deterministic state controller (`GlanceTrailController.ts`) enforcing strict state transitions, ±180° yaw normalization, and input locking (`TRANSITION_LOCK_MS = 250`) to prevent rapid pinches from skipping beats.
- **Additive-Safe Visuals:** Crafted with translucent milk-glass panels, porcelain typography (`#FFF7E8`), champagne halos, soft coral for Problem (`#FF7A6B`), and completion mint (`#5CD68D`). No black fills that become transparent holes on optical see-through displays.
- **Automated Verification:** Built a comprehensive Node unit test suite (`tests/controller-unit-tests.ts`) verifying all 6 done criteria with 100% pass rate (`UNIT_LOGIC_PROVEN`), alongside a complete LEAF integration scenario suite (`Assets/GlanceTrail/Tests/GlanceTrailLeafScenarios.ts`).

---

## Challenges We Overcame

1. **Resisting the "Floating Teleprompter" Trap:** The initial temptation was to display a scrolling script in AR. However, floating text attached to the face is just a bad laptop screen. The real breakthrough came from aggressive subtraction: showing only one cue at a time, folding completed beats into quiet beacons, and stripping all text away in the final symbol-only rehearsal.
2. **Additive Display Contrast:** On transparent optical displays like SPECS, black pixels render as transparent. We engineered a custom luminous visual hierarchy where light, borders, and halos provide depth and contrast against arbitrary room backgrounds without relying on dark cards.
3. **Pinch Input Idempotency:** Rapid double-clicking on hand interactables can corrupt state or skip beats. We implemented transition locking (`TRANSITION_LOCK_MS = 250`) to ensure every advance is deliberate and atomic.

---

## Accomplishments We're Proud Of

- **100% Passing Controller Unit Test Suite:** All 6 done criteria are covered and proven passing in automated tests.
- **The Signature Transformation:** Watching the detailed sentences vanish into quiet symbols as the user transitions from reading to speaking freely with their eyes up.
- **Comfortable Ergonomics:** Designing the entire three-stop arc within 26° so all beacons sit comfortably within the user's field of view without exhausting head movements.

---

## What We Learned

The most impactful AR design principle is **subtraction**. In spatial computing, every virtual object in your visual field must earn its presence. Giving the speaker one clear action per state and receding UI elements the moment they are no longer needed makes the technology feel like a natural extension of human memory.

---

## Truthful Limitations & Hardware Disclosures

- **Controller Logic Proven:** GlanceTrail's state machine, transition guards, yaw calculations, and reset flows are fully proven via unit tests (`UNIT_LOGIC_PROVEN`).
- **LEAF & Preview Prerequisite:** Real Lens Studio Interactive Preview observation and automated LEAF test execution require opening `glancetrail.esproj` in Lens Studio 5.23+ on a host machine with Lens Studio installed.
- **Feel Unproven (`FEEL_UNPROVEN`):** Long-term physical comfort, arm fatigue over extended standing sessions, real-world outdoor lighting noise on hand tracking, and spatial acoustics in noisy auditoriums remain unmeasured without physical SPECS glasses.
- **No Unmeasured Claims:** GlanceTrail makes zero claims of scientifically measured memory score improvements; it is an ergonomic, spatial rehearsal tool.

---

## Technologies Used

- Snap Lens Studio 5.23+
- Spectacles Interaction Kit (SIK)
- Spectacles UI Kit (UIKit)
- Lens Execution & Automation Framework (LEAF)
- TypeScript / Node.js
