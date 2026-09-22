# Arc v23 Continuity Reconciliation

Status: ACTIVE WORKING BRANCH GUARDRAIL
Branch: `chatgpt/arc-v23-continuity-reconcile`
Base: current `main`
Founder direction: recover the immediacy/readability of the v23.3/v23.4 planner experience while preserving the stronger current Arc domain brain and the larger Arc / Pal / Table product relationship.

## Product test

**Arc holds your place.**

The teacher should encounter a straightforward paper-like planner first. The deeper teaching model should appear only when the work requires it.

## What this branch is

This is a reconciliation branch, not a rollback and not a wholesale port of an old build.

- Current governing documents remain authority.
- Current canonical domain state remains the brain.
- v23-era work is donor evidence for planner immediacy, calendar readability, obvious actions, and low cognitive load.
- Later experimental branches are donor evidence only.
- No Vercel deployment.
- No direct work on `main`.

## Surface hierarchy

1. Calendar is visually dominant.
2. Week is the immediate working planner surface.
3. Day is the bridge from planning into teaching.
4. Month is Unit placement and pacing.
5. Year Map is school-year orientation.
6. Fridge is unscheduled/reusable holding space.
7. Task Bar is Must / Should / Could.
8. Settings is low-frequency outer-edge furniture.
9. Deeper Section, recovery, and teaching state appear contextually, not as permanent dashboard chrome.

## v23 qualities to recover

- A planner that reads immediately as a planner.
- Large, legible paper/calendar geometry.
- Obvious add and Shift actions.
- Fast blank-space capture.
- Low permanent-control density.
- Contextual controls instead of toolbars everywhere.
- Course/class context that is easy to scan.
- Time information that is available but visually secondary.
- Furniture that supports the planner rather than competing with it.
- Fridge and Must / Should / Could as simple, spatial teacher concepts.

## Current Arc brain to preserve

- One canonical state across views.
- Stable object identity.
- Course -> Section -> Unit -> Lesson relationships.
- Sparse Section-specific teaching divergence.
- Planned date vs actual taught state.
- In-progress / completed / skipped teaching states.
- Stop here + resume note.
- Fixed anchors.
- Preview-first recovery/Shift.
- Undo and history.
- Persistence and migration safety.
- Non-drag keyboard/touch equivalents.
- Provenance for imported school truth.
- No silent loss, duplication, or invented data.

## Progressive certainty

Do not force distant plans to pretend to be finished lessons.

Arc should support increasing specificity as teaching approaches:
- Year / Month: orientation, Units, rough pacing, fixed anchors.
- Week: concrete teaching plan.
- Day: exact Section reality, carryover, what happens next.

This must use existing canonical objects and optional fields where possible. Do not create a second planning model.

## Capture law

Teacher shorthand is valid data.

Do not require formal lesson-plan fields for fast capture. A teacher may enter a terse thought and deepen it later. Moving an object from Fridge -> Task Bar -> Calendar changes its interaction depth, not its identity.

## Continuity law

Arc is not primarily a rescheduling machine. It must preserve the chain of teaching:

intent -> placement -> teaching -> divergence -> recovery -> reuse.

An unfinished Lesson is not automatically equivalent to a missed Lesson. Preserve the distinction between not started, in progress, completed, and skipped.

## Arc / Pal / Table relationship

### Arc
The planning and continuity authority. Arc owns canonical planning truth, placement, teaching state, recovery, and history.

### Pal
Companion surface. Pal may capture, surface, or remotely act on Arc state, but must not create a competing planner or independent canonical schedule. Pal should feel like carrying Arc with you, not a smaller duplicate of Arc.

### Table
Classroom presentation/teaching surface. Table consumes intentional teaching context from Arc and returns bounded teaching outcomes. Table must not become the planning authority, duplicate Arc's calendar, or silently mutate curriculum structure.

Rule: **Arc remembers; Pal accompanies; Table presents.**

Data should cross product boundaries by stable IDs and explicit outcomes, not by copied records.

## Include now

- Reconcile the calendar shell toward v23 readability without weakening current domain guarantees.
- Protect simultaneous furniture behavior and stable calendar geometry.
- Restore/verify Year Map if absent from the active surface.
- Make Week fast to read and act on.
- Keep add/capture and Shift obvious.
- Reduce permanent chrome where it obscures the planner.
- Preserve current persistence, object lifecycle, recovery, and accessibility laws.
- Audit every change at desktop, narrow desktop, keyboard-only, 200% zoom, and furniture-open states.

## Do not include now

- AI lesson generation.
- Voice-first planning.
- Standards/curriculum feature race.
- Attendance or gradebook.
- Generic collaboration suite.
- A Classes tab.
- A permanent left rail.
- A separate Plan strip.
- Reflection homework.
- Teaching Trace UI.
- New Pal or Table feature work inside this branch.
- New onboarding breadth unless required to expose the planner safely.
- Any automatic destructive recovery.
- Any feature whose primary effect is adding another place for the teacher to manage.

## Park for later research

- Teaching Trace derived from normal use.
- Useful prior-year teaching memory without required reflection.
- Resource handoffs to existing tools.
- Minimal Stop-here/resume capture refinements.
- Cross-product Pal/Table continuity once Arc's core planner is Green.

## Acceptance rule

A change belongs only if it makes the planner easier to understand/use **without weakening continuity, teacher authority, accessibility, or data integrity**.

When those goals conflict, continuity and trust win over visual nostalgia.

No Green claim without direct runtime evidence.
