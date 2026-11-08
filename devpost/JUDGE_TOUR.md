# GlanceTrail — 30-Second Judge Tour

**Project:** GlanceTrail  
**Tagline:** *Rehearse with your eyes up.*  
**Track:** Learn AR with SPECS (Devpost & Snap)

---

## 1. The Core Thesis in 15 Seconds

> **GlanceTrail turns a room into a three-stop memory path, so speakers can practice with their eyes up instead of reading from a screen.**

When people rehearse a pitch, notes and teleprompters preserve the words but destroy connection: they pull attention down to a laptop or phone, encourage reading paragraphs, and break eye line with the audience. 

GlanceTrail replaces scrolling notes with three quiet, luminous beacons arranged across the room:
1. **Problem** (front-left, soft coral)
2. **Proof** (center, warm champagne)
3. **Ask** (front-right, cobalt light)

---

## 2. The Signature Transformation

- **First Rehearsal (Guided):** Each beacon opens into a concise cue ribbon with optional detail on demand. Advancing with a large pinch folds the cue into a warm beacon. Upon completing Ask, a luminous memory trail connects all three ideas.
- **Second Rehearsal (Symbol-Only):** Persistent text recedes completely. Only the spatial symbols (`[ ⌖ ]`, `[ ✦ ─ ✦ ─ ✦ ]`, `[ ☼ ]`) remain. If the speaker hesitates, a secondary **Rescue hint** target temporarily reveals the short cue for 2 seconds before self-hiding.

The speaker learns the **path** of their argument rather than memorizing a paragraph.

---

## 3. Why It Belongs on Glasses

| Characteristic | On a Laptop / Phone | On SPECS AR Glasses |
|---|---|---|
| **Body Posture** | Hunched over, looking down at a screen | Standing tall, free to gesture and move |
| **Gaze & Presence** | Fixated on flat scrolling text | Eyes up, connecting directly with the audience |
| **Memory Mechanism** | Verbatim reading | Spatial memory anchored to stable room positions |
| **Out-of-View Recovery** | None / lost place in text | Soft directional arrow and gentle chime guide gaze back |

---

## 4. Key Architectural & Design Strengths

- **Additive-Safe Visuals:** Designed specifically for optical see-through displays: milk-glass translucent ribbons with luminous borders, porcelain text (`#FFF7E8`), and vibrant accent light. No black fills that become transparent holes.
- **26° Comfortable Arc:** All three beacons sit at 1.1 m distance within a 26° arc (~50 cm span), fitting completely inside the 32° horizontal field of view without aggressive head panning.
- **Guarded Inputs:** SIK pinch interactables with transition locking (`TRANSITION_LOCK_MS = 250`) so rapid clicks cannot skip beats or corrupt state.
- **Controller Unit Tested:** 6 passing automated unit tests covering every done criterion (`npm test`).
- **LEAF Ready:** Native LEAF integration scenarios authored in `Assets/GlanceTrail/Tests/GlanceTrailLeafScenarios.ts`.
