# Teaching Mode — Impossibly High Production Gate v1

Working product relationship: **Arc plans the lesson. Teaching Mode runs the lesson. Arc remembers what happened.**

This document is intentionally unforgiving. “Looks good” is not a pass. A green requires observable behavior, rendered evidence, recovery behavior, and a second clean run after fixes.

## Governing rule

**No reskin until the functional build passes every required gate twice in succession.** A failure on any required gate resets the consecutive-green count for that gate family.

## Severity

- **P0 — Classroom failure:** loses lesson/session state; shows teacher-only content to students; prevents teaching; traps user; corrupts Arc return data; unrecoverable accidental action.
- **P1 — Trust failure:** display/controller drift; unclear active state; inaccessible critical control; refresh loses context; broken navigation; projector overflow; disconnected display misrepresented.
- **P2 — Friction:** extra steps, weak hierarchy, keyboard gaps, ambiguous copy, avoidable modal use, slow recovery.
- **P3 — Finish:** polish, microcopy, visual authorship, animation, texture, decorative consistency. P3 is explicitly deferred until reskin.

## Green definition

A gate is green only when all of the following are true:
1. Behavior is implemented, not mocked by `alert`, `prompt`, fake toast, or static text.
2. The state survives the relevant refresh/re-entry scenario.
3. The rendered interface has no clipping, overlap, accidental scroll, or unreachable control at required viewports.
4. Keyboard access works for the critical path.
5. Failure and recovery states are explicit.
6. Student-facing output never reveals teacher-only controls or notes.
7. A repeat run after fixes passes without code changes.

## G01 — Session spine

Required flow: Arc Day → Start Teaching → active lesson → teach → end → outcome → return.

Green criteria:
- One unmistakable Start Teaching action per eligible class.
- Session stores class, lesson, phase/step, start time, status, display state, visibility state, and notes.
- Reload during a live lesson restores that exact session.
- Re-entry cannot silently create a duplicate session.
- End-session state writes a compact outcome payload suitable for Arc.
- Accidental end has a recovery path before destructive close.

## G02 — Teacher control

Green criteria:
- Teacher always knows class, lesson, current step, next step, and display state.
- Previous and Next are reversible and deterministic.
- Jumping steps does not mutate the authored sequence.
- Quick note is inline, persistent, editable, and never student-visible.
- Critical controls are stable in position and >=44px target size.
- No task requires a browser-native prompt/alert.

## G03 — Classroom display contract

Green criteria:
- Displays released content only.
- No teacher controls, notes, class-management UI, or hidden setup content.
- Updates when session state changes without requiring a manual refresh in the simulated linked-display mode.
- Held state is deliberate and legible.
- Disconnected state is explicit.
- Projector view has no vertical scroll at 1280×720, 1366×768, 1600×900, and 1920×1080 with representative content.

## G04 — Visibility / hold / release

Green criteria:
- Teacher can hold the next/current unreleased content without changing the teaching sequence.
- Release changes the room view, not the authored lesson.
- Teacher controller clearly distinguishes current teaching step from currently released room step.
- Back/Next cannot accidentally leak held content.
- Refresh preserves release state.

## G05 — Continuity / resilience

Green criteria:
- Refresh restores live session.
- Simulated display disconnect does not stop teacher control.
- Reconnect restores the current released state.
- Missing media degrades locally and keeps directions usable.
- Closing session while Arc is “unavailable” preserves an unsent outcome locally.
- Reopening the app exposes a clear recovery/resume path.

## G06 — Accessibility

Green criteria:
- Complete critical path is keyboard-operable.
- Visible `:focus-visible` state on all actionable controls.
- Logical focus order.
- No color-only status.
- Reduced-motion preference respected.
- 200% zoom retains critical-path usability.
- 44×44 minimum hit target for primary live-teaching actions.
- Semantics: headings, buttons, labels, status regions, dialog semantics where needed.

## G07 — Divided-attention classroom usability

Green criteria:
- Start Teaching ≤1 decision after opening the class block.
- Next/Back/Release can be found in <2 seconds from a glance test.
- Ending class takes ≤3 deliberate actions including status selection.
- No required setting is buried during a live session.
- No destructive action is adjacent to a high-frequency action without protection.
- Teacher can operate the live path with one hand and intermittent attention.

## G08 — Arc relationship

Green criteria:
- No second planner, calendar, gradebook, or duplicate lesson authoring.
- Session consumes Arc lesson context rather than asking teacher to recreate it.
- Close outcome is compact: status + optional next-time note + session metadata.
- Teaching Mode vocabulary does not imply a separate product universe.
- The transition back to Arc is explicit and preserves teaching outcome.

## G09 — Privacy boundary

Green criteria:
- Room/student surfaces contain only intentionally released instructional content.
- Future monitoring is session-bound and instructional only.
- No covert device surveillance, webcam monitoring, browser-history collection, or attention scoring.
- Temporary groups are temporary unless explicitly saved later by product design.

## G10 — Render matrix

Required functional audit widths:
- 390×844 mobile controller sanity check
- 768×1024 tablet portrait
- 1024×768 legacy classroom display
- 1280×720 projector
- 1366×768 common school laptop/projector
- 1600×900 desktop
- 1920×1080 full HD classroom display

Green criteria:
- No horizontal page scroll.
- No clipped critical controls.
- No overlap.
- No accidental body scroll in classroom display.
- Content hierarchy remains legible.

## Beta personas

1. **First-period rush:** starts lesson with 45 seconds before bell.
2. **Interrupted teacher:** advances, gets interrupted, uses Back, adds note, resumes.
3. **Projector failure:** display disconnects mid-lesson; teacher continues; reconnects.
4. **Wrong-step teacher:** jumps forward accidentally and recovers.
5. **Keyboard-only teacher:** completes entire live path without pointer.
6. **Small-laptop teacher:** controller at 1366×768 and 200% zoom.
7. **Substitute / unfamiliar user:** can identify what students see without product training.
8. **Privacy skeptic:** verifies private notes and unreleased content never enter room surface.
9. **Network hiccup:** refresh/reopen restores session.
10. **End-of-period scramble:** closes in seconds and leaves a next-time note.

## Consecutive-green policy

- **Run A:** full automated + rendered + manual-logic audit.
- Fix every P0/P1 and any P2 that blocks the critical path.
- **Run B:** repeat the exact matrix with no code changes between start and finish.
- Only when A and B are both all-green do we freeze behavior and begin the Arc reskin.
