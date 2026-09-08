# ARC — Build Plan and Acceptance

## Phase 0 — Reconcile and instrument

- Confirm every requirement against the numbered master documents.
- Establish decision, defect, and change logs.
- Install automated type, unit, contract, accessibility, and browser checks.
- Establish screenshot baselines at desktop, small laptop, tablet, 200% zoom, and reduced motion.

## Phase 1 — Trusted vertical slice

Build one complete path before broad surface expansion:

1. Load a confirmed school calendar.
2. Create one Course, Section, Unit, Lesson, and Note.
3. Project the same objects into Day, Week, and Month.
4. Place, move, and unplace without changing identity.
5. Preview and apply one Section-specific disruption shift.
6. Reload and verify state, history, and Undo.
7. Open and close Settings, Fridge, and Task Bar without changing calendar geometry.

## Phase 2 — Planning depth

- Course/Section setup and sparse divergence.
- Unit and Lesson creation/editing.
- Contextual object toolbar.
- Fridge Door and Drawer round trip.
- Must/Should/Could Note workflow.
- Locate/Find across surfaces.
- Personal planning lane and recurrence semantics.

## Phase 3 — Teaching continuity

- Day carryover.
- Live Classroom candidate chooser and exact Section/Lesson session.
- Complete, Stop Here, Skip, and Leave outcomes.
- Stale-context revalidation and return to exact origin.

## Phase 4 — Calendar import and scale

- Source search/upload/manual fallback.
- Miniature-calendar review proof.
- Early-release and alternate schedule patterns.
- Re-import diff and collision handling.
- Quarter, Semester, and Year Map projection depth.

## Acceptance gates

- Calendar remains the visual and functional center.
- Save → reload preserves all canonical state.
- Move/unplace/shift preserves stable identity and history.
- Fixed anchors remain fixed.
- Same-day collisions fail closed.
- Section-specific changes do not leak to other Sections.
- Apply/Undo remains correct after reload.
- Day, Week, and Month agree after every consequential action.
- Furniture never overlays or changes calendar geometry.
- Keyboard, touch, pointer, 200% zoom, small laptop, reduced motion, and high contrast complete the same core workflows.
- Body UI targets 16 px; 14 px is limited to strong-contrast secondary metadata.
- Every production asset has a manifest status and provenance record.
- No Canva-derived reference ships as a production dependency.
- No actionable UI is accepted from screenshot attractiveness alone; behavior is directly verified.

## Required agency deliverables

- Source repository and documented setup.
- Production and staging deployment configuration.
- Domain model and state-event documentation.
- Persistence schema and migration plan.
- Accessible component library and token system.
- Day/Week/Month vertical slice.
- Calendar import/review workflow.
- Fridge, Drawer, Task Bar, Settings, and Live Classroom workflows.
- Automated tests and human QA checklist.
- Asset provenance ledger and optimized production exports.
- Release runbook, rollback plan, and owner handoff.

