# GlanceTrail

> **Rehearse with your eyes up.**  
> GlanceTrail turns a room into a three-stop memory path, so speakers can practice with their eyes up instead of reading from a screen.

Built for **Learn AR with SPECS** (Devpost & Snap).

---

## 30-Second Judge Tour

When preparing a pitch or presentation, traditional notes and teleprompters preserve the words but destroy connection: they pull attention down to a laptop, phone, or paper, encourage reading paragraphs, and break eye line with the audience.

GlanceTrail replaces scrolling notes with three quiet, luminous beacons arranged across the room at eye level:
1. **Problem** (front-left, soft coral)
2. **Proof** (center, warm champagne)
3. **Ask** (front-right, cobalt light)

### The Signature Transformation

- **First Run (Guided Rehearsal):** Each beacon opens into a concise cue ribbon with optional detail on demand. Advancing with a large pinch folds the idea into a warm beacon. Upon completing Ask, a luminous memory trail connects all three ideas in space.
- **Second Run (Symbol-Only Rehearsal):** Persistent sentences vanish completely. Only spatial symbols (`[ ⌖ ]`, `[ ✦ ─ ✦ ─ ✦ ]`, `[ ☼ ]`) remain on the beacons. If the speaker hesitates, a secondary **Rescue hint** target temporarily reveals the short cue for 2 seconds before self-hiding.
- **Out-of-View Recovery:** If head movement drifts away from the active idea, a soft edge arrow and gentle spatial chime guide gaze back.

The speaker learns the **path** of their argument rather than reciting a paragraph.

---

## Why It Belongs on Glasses

| Characteristic | On a Laptop / Phone | On SPECS AR Glasses |
|---|---|---|
| **Body Posture** | Hunched over, looking down at a screen | Standing tall, free to gesture and move |
| **Gaze & Presence** | Fixated on flat scrolling text | Eyes up, connecting directly with the audience |
| **Memory Mechanism** | Verbatim reading | Spatial memory anchored to stable room positions |
| **Out-of-View Recovery** | None / lost place in text | Soft directional arrow and gentle chime guide gaze back |

---

## Technical Architecture & State Machine

GlanceTrail is implemented with an explicit, deterministic state controller (`GlanceTrailController`):

```text
WELCOME
  └──> GUIDED_PROBLEM
         └──> GUIDED_PROOF
                └──> GUIDED_ASK
                       └──> GUIDED_COMPLETE (Connected Memory Trail)
                              └──> SYMBOL_PROBLEM
                                     └──> SYMBOL_PROOF
                                            └──> SYMBOL_ASK
                                                   └──> FINAL_COMPLETE
                                                          └──> WELCOME (Clean Reset)
```

### Key Technical Safeguards:
- **SIK Pinch Interactions:** Built for the Spectacles Interaction Kit and UI Kit. Large targets (14×8 cm Continue button, 12 cm beacons, 8 cm hint circle) highlight on aim and provide tactile pressed feedback.
- **Guarded Input Idempotency:** Rapid repeated pinches during state transitions are dropped cleanly (`TRANSITION_LOCK_MS = 250`), preventing skipped beats or corrupted state.
- **Additive Display Optics:** All visuals use translucent milk-glass shaders, porcelain text (`#FFF7E8`), and champagne halos (`#FFD27A`). Zero black fills that would render as transparent holes on optical see-through displays.
- **±180° Yaw Normalization:** Gaze angle calculations normalize across the wrap-around boundary, ensuring directional arrows trigger accurately.

---

## Scene Hierarchy & Components

The Lens Studio scene graph is declaratively specified in [`Assets/GlanceTrail/GlanceTrailScene.json`](file:///c:/Users/Abhijeet%20Nardele/OneDrive/Desktop/devpost%20project/glancetrail/Assets/GlanceTrail/GlanceTrailScene.json):

```text
GlanceTrailScene
├── SpectaclesCamera (World Tracking, 32° HFOV, 37° VFOV)
├── InteractionManager (SIK System)
└── GlanceTrailStage (Position: [0, -15, -110] cm)
    ├── WelcomeCard (Canvas + MilkGlass RoundedQuad)
    │   ├── TitleText ("GlanceTrail")
    │   ├── TaglineText ("Rehearse with your eyes up.")
    │   └── BeginRehearsalButton (Cobalt, SIK Interactable)
    ├── BeaconGroup
    │   ├── Beacon_Problem (x: -24.75 cm, Coral Glow, SIK Interactable)
    │   ├── Beacon_Proof (x: 0.0 cm, Champagne Glow, SIK Interactable)
    │   └── Beacon_Ask (x: +24.75 cm, Cobalt Glow, SIK Interactable)
    ├── CueRibbon (44×18 cm MilkGlass, SIK Interactable)
    │   ├── ShortCueText (Porcelain #FFF7E8, 16pt)
    │   └── DetailText (Warm Beige #F5E6C8, Collapsible)
    ├── ContinueButton (14×8 cm Cobalt, SIK Interactable)
    ├── RescueHintButton (8 cm Circle, SIK Interactable)
    ├── MemoryTrailLine (LineStrip connecting beacons, Mint #5CD68D)
    ├── DirectionalArrow (Screen Edge billboard indicator)
    ├── CompletionCard (Text3D + StartOverButton)
    └── AudioSystem (AudioComponent with 7 procedural spatial cues)
```

---

## Verification & Automated Testing

### 1. Controller Unit Test Suite (`UNIT_LOGIC_PROVEN`)
GlanceTrail includes 7 automated unit tests covering all six done criteria plus the native-tap/SIK duplicate-input seam:

```bash
cd glancetrail
npm test
```

Output:
```text
=================================================
   GlanceTrail — Controller Unit Test Suite      
   Classification: UNIT_LOGIC_PROVEN             
=================================================
Executing 7 unit tests across all 6 done criteria...

[PASS [✓]] Input seam: duplicate native-tap and SIK trigger invoke only once (0 ms)
[PASS [✓]] Criterion 1: Welcome starts guided rehearsal & activates only Problem (1 ms)
[PASS [✓]] Criterion 2: Active cue detail toggles without advancing progress (301 ms)
[PASS [✓]] Criterion 3: Continue advances exactly one beat with rapid-pinch guard (602 ms)
[PASS [✓]] Criterion 4: Connected trail draws and symbol-only mode hides detail text (1202 ms)
[PASS [✓]] Criterion 5: Rescue hint self-hides after ~2s & directional arrow guides back with single chime (3602 ms)
[PASS [✓]] Criterion 6: Final completion displays & Start over clears all stale state (2407 ms)

-------------------------------------------------
Total: 7 | Passed: 7 | Failed: 0
Execution Time: 8122 ms
-------------------------------------------------
```

### 2. Native Lens Studio Verification
The packaged SPECS 27 project compiles successfully in Lens Studio 5.24.1. The native Interactive Preview was manually exercised through Welcome, guided Problem/Proof/Ask, detail expansion, connected trail, symbol-only mode, timed rescue hint, final completion, and reset. Draft LEAF scenarios are preserved in `tests/leaf-deferred/`, but they are not part of the Lens build and have not been executed.

### 3. Non-Submission Prototype Reference
The early 2D web prototype is preserved under [`prototype/browser-mock/`](file:///c:/Users/Abhijeet%20Nardele/OneDrive/Desktop/devpost%20project/glancetrail/prototype/browser-mock/). It is strictly reference material and not a substitute for Lens Studio Interactive Preview.

---

## Lens Studio Prerequisite

To open the project and run Interactive Preview:
1. Install **Snap Lens Studio 5.24.1** on your machine.
2. Open `glancetrail.esproj`.
3. In Lens Studio, select **Interactive Preview** to walk the room (WASD/mouse) and test pinch interactions.
4. Run `npm test` separately for the controller and duplicate-input regression suite.
