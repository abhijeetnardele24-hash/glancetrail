---
status: approved
---

# Design brief: GlanceTrail

## The one spatial moment
Standing in an open room as if presenting to an audience, with no phone, laptop, or notes. About 1.1 metres in front of the speaker and slightly below eye level, three compact luminous beacons sit in a shallow arc: Problem on the left, Proof in the centre, and Ask on the right. During a second rehearsal, detailed text disappears and only the three spatial symbols remain, turning the room into a memory path so the speaker moves naturally through the pitch with head and eyes up instead of reading a paragraph from a screen.

## Why it belongs on glasses
- Uses: leaves your body free, draws in the world, shares your view.
- Why it's better than the phone or laptop version: A phone or laptop teleprompter pulls attention down to a flat screen, encourages reading words, and breaks eye contact. GlanceTrail uses stable locations across physical space and progressively reduced cues so memory has a physical shape, keeping the speaker standing, gesturing, and connecting with the room.

## Product or overlay
- Type: product (a self-contained spatial rehearsal coach).
- What the real version would sense: nothing (does not depend on recognizing physical objects, signs, or faces).
- Stand-in for the preview: none needed.

## Where things live
- Where the user is looking during the main task: looking forward and slightly downward (about 15 cm below eye level) toward an audience, scanning across a 26° arc.
- User start position: origin, standing.
- Main cue distance: 1.1 m from the user.
- Three Beacons: 12 cm diameter compact milk-glass beacons arranged in a 26° arc (approx. 50 cm wide at 1.1 m distance) — Problem (front-left), Proof (center), Ask (front-right).
- Active Cue Ribbon: 44 cm wide × 18 cm high, positioned at the active beacon.
- Continue button: 14 cm wide × 8 cm high, centered 6 cm beneath the active cue ribbon.
- Rescue hint target: 8 cm diameter circle, visually secondary.
- Out-of-view guidance: small directional arrow at the nearest screen edge pointing back to the active cue if head rotation moves it outside the field of view.

## Hands and input
- Begin rehearsal: pinch one large button on Welcome.
- Detail on demand: pinch the active beacon or cue ribbon to expand/collapse detail without advancing progress.
- Continue: pinch the large separate Continue button to advance exactly one beat.
- Rescue hint: pinch the 8 cm secondary circle in symbol-only mode to reveal the short cue for 2 seconds.
- Rehearse with symbols: pinch to start the second rehearsal.
- Start over: pinch to reset to a clean Welcome state.
- Targets are big, highlight when aimed at, show pressed feedback, and repeated pinches are idempotent (cannot skip states).
- Voice: none (no voice dependencies; all actions driven by standard SIK pinch interactions).

## When things show
- Welcome: shows GlanceTrail title, tagline "Rehearse with your eyes up," and one large Begin rehearsal button.
- Beacons: all three compact beacons appear upon pinching Begin rehearsal; only Problem activates initially.
- Cue Ribbon: expands only for the currently active beacon; folds into a small warm beacon when Continue is pinched.
- Connected Trail: luminous line connects all three beacons once Ask is completed.
- Symbol Mode: text is hidden; only beacons/symbols and Continue remain, with Rescue hint accessible.
- Final Completion: shows "Path remembered. Now say it without reading it," then beacons recede and Start over appears.
- Out of view guidance: edge arrow appears and one soft spatial chime plays if the active cue leaves the field of view; both disappear as soon as the active cue returns.

## Done criteria
Each one can be checked in Lens Studio's preview.
1. From Welcome, pinching Begin rehearsal reveals all three compact beacons and activates only Problem.
2. Pinching the active beacon or cue ribbon expands and collapses its detail without advancing the rehearsal or activating another cue.
3. Pinching Continue advances exactly one beat—Problem to Proof to Ask—and rapid repeated pinches cannot skip a state.
4. Completing Ask connects all three beacons into one visible memory trail; pinching Rehearse with symbols starts a second run with persistent cue and detail text removed.
5. In symbol-only mode, pinching Rescue hint reveals the current short cue for approximately two seconds, hides it again, and does not advance. If the active cue leaves view, the edge arrow and one chime guide back and disappear after recovery.
6. Completing the symbol-only run shows the final message; pinching Start over returns to Welcome with no stale active cue, connected trail, hint, arrow, or completion state.

## Out of scope
- Camera recognition, face tracking, recording, or computer vision.
- Voice-only actions or speech transcription.
- Multi-user collaboration or cloud accounts.
- Slide deck editor or document importing.
- Biometric analytics or emotion scoring.

## Risks and open questions
- Spatial comfort over long sessions and physical hand-tracking feel remain unproven without physical SPECS hardware (labeled `FEEL_UNPROVEN` in evidence).
- Additive display contrast requires pure light/luminous surfaces (milk-glass styling with porcelain text, champagne halos, cobalt primary action, soft coral for Problem, and mint for completion) with no reliance on black fills or dark glass.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources

