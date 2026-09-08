# Arc

Arc is a calendar-centered planning workspace for teachers. This repository is a clean, from-scratch implementation built to the current governing product/brand documents in [`docs/governing/`](docs/governing/).

> **Arc holds your place.** It connects planning, live teaching, disruption, recovery, and reuse into one continuous system, without pretending to be the teaching expert in the room.

## Running it locally

```bash
npm install
npm run dev      # http://localhost:43217
npm run build    # type-checks and produces a production build in dist/
npm run test     # vitest — domain/command and calendar-date behavior tests
npm run lint     # oxlint
```

No backend, account, or API key is required. All data lives in the browser via IndexedDB (see [Persistence](#persistence-and-data-model)), so it works fully offline after the first load.

## What's implemented

This build focuses on one complete, trustworthy vertical slice rather than shallow coverage of every long-term feature in the governing documents. It follows the "First Implementation Spine" required by the [Desktop Interaction Blueprint](docs/governing/03_DESKTOP_INTERACTION_BLUEPRINT.md) \u00a714: a stable object should survive Fridge \u2192 Task Bar \u2192 Calendar \u2192 Fridge movement, undo, and a hard reload without losing data. That circuit is covered by an automated test in `src/domain/commands.test.ts`.

- **Calendar-first shell.** Day / Week / Month views, all reading from one canonical domain state. No left rail; Settings, Fridge, and the Task Bar are outer-edge furniture that never overlay or resize the calendar.
- **Canonical objects.** Course, Section, Unit (Course + calendar scope, never Section-owned), Lesson (shared or Section-specific), Note, and Magnet, each with a stable ID that survives every move between surfaces.
- **Fridge / Drawer.** A finite-capacity Fridge door for parked Notes and Magnets, with overflow routed to an unlimited Drawer. Drag or click to move; nothing is silently destroyed by moving it.
- **Task Bar.** Horizontal Must / Should / Could columns. Only canonical Notes live here, per the Master Operating Document \u00a74 \u2014 Units and Lessons are never demoted into a generic task record.
- **Contextual object actions.** Selecting a placed item opens a toolbar with explicit, distinct actions (Edit, Mark important, Cross out, Move, Copy, Unplace, Delete) rather than one ambiguous "Remove."
- **Disruption Shift.** Preview-then-apply Section-specific rescheduling that walks forward across school days only, skips fixed/pinned placements, and is fully undoable.
- **Live Classroom.** Launches only from Day \u2192 an exact Section + Lesson. Outcomes are Complete, Stop here (requires a resume note), or Skip (only while not-started); completed/skipped lessons cannot be relaunched, and the write path revalidates the lesson/section context first.
- **Recovery and trust.** Single-level Undo that survives reload, dependency-checked deletes, fixed-date pinning that blocks accidental Shift movement, and fail-closed same-day collision handling instead of silent overwrites.
- **Accessibility.** Keyboard roving tabindex across the calendar grid, visible focus states, `aria-live` toasts, a reduced-motion media query and manual override, and a high-contrast mode. Object type is always conveyed with text/shape, never color alone.
- **Original assets.** The Arc mark, paper-grain texture, Fridge artwork, and utility icons are recreated as inline SVG components rather than reusing any Canva-derived or unverified source file, per the [Rebuild Decision Addendum](docs/governing/08_REBUILD_DECISION_ADDENDUM.md).
- **Sample-data honesty.** A first-run workspace ships with an example teaching plan so the interface isn't empty, but it is visibly labeled as sample content with a one-click "Clear sample data" action \u2014 Arc never presents generated content as if it were the teacher's real schedule.

## Known gaps against the governing documents

These are conscious scoping decisions for this first slice, not oversights. They're listed here so the next work session (human or agent) knows exactly where to pick up, consistent with the "document the build as it happens" rule in the Canonical Brand System.

- **Quarter / Semester / Year Map views** are not built yet. The Master Operating Document explicitly deprioritizes these until the primary Day/Week/Month loop and shell are Green, which is the state this slice targets.
- **Class isolation** (a reversible Day filter over one Course/Section) is not implemented.
- **Explicit Section-specific override placements for an already-shared Lesson** are not modeled; a Lesson is currently either shared across a Course or created directly under one Section, rather than supporting a shared default *plus* sparse per-Section date overrides layered on top.
- **School-calendar import (PDF/CSV/official source search)** is not implemented; the school calendar (year bounds, holidays, early-release days) is seeded directly in `src/domain/seed.ts` and editable from Settings.
- **Live Classroom's multi-lesson candidate chooser** (when more than one eligible lesson exists for a Section on a date) is not built; the first eligible lesson is used.
- **The contextual object toolbar is a fixed bottom-center bar**, not yet anchored directly next to the selected object as the Desktop Interaction Blueprint describes. Functionally equivalent (same actions, same keyboard/focus behavior), but not pixel-anchored.
- **Unit "continuous span" rendering.** The Canonical Product Spec calls for Units to read as a continuous Gantt-style span across the calendar grid. This build renders a Unit as a chip on its start date plus a "Continuing from before" banner on later days, which preserves the information but not the continuous visual bar.

## Architecture

```
src/
  domain/         Canonical types, ID generation, and pure command functions
                   (createLesson, place, move, applyShift, setDelivery, ...).
                   Every mutation goes through here — nothing else touches
                   domain state directly.
  calendar/       Pure date/school-calendar math (date-fns based): week/month
                   grids, weekend rules, school-day arithmetic for Shift.
  state/store.ts  Zustand + Immer store. Wraps every domain command with
                   history/undo bookkeeping, debounced persistence, and
                   error -> toast handling. This is the only place UI code
                   calls into the domain layer.
  persistence/    IndexedDB load/save with a versioned migration stub.
  projections/    Selectors that derive view-ready data (day placements,
                   Fridge/Drawer contents, Task Bar lists) from raw state.
                   Views never own a second copy of the schedule.
  surfaces/       Calendar (Day/Week/Month), Settings, Fridge, and Task Bar
                   UI, organized by the outer-edge furniture they belong to.
  components/     Shared UI: dialogs, the selection toolbar, Live Classroom,
                   toasts, and the sample-data banner.
  assets/         Original inline-SVG brand assets (mark, texture, icons).
```

**One canonical state, many lenses.** Day/Week/Month all read the same `WorkspaceDomainState` through `projections/selectors.ts`; none of them can drift into an independent copy of the schedule.

**Object action semantics stay distinct.** `domain/commands.ts` keeps Move (`move`), Unplace (`unplace`), Copy (`copyLesson`), and Delete (`deleteObject`) as separate functions with separate guarantees — never collapsed into one generic "remove."

### Persistence and data model

The entire `WorkspaceDomainState` plus the current one-level undo snapshot are saved to IndexedDB (see `src/persistence/db.ts`) on a short debounce after every change, and reloaded on startup. `schemaVersion` plus a `migrate()` step in `db.ts` exist so future shape changes can upgrade an existing local workspace instead of discarding it.

## Testing

`src/domain/commands.test.ts` and `src/calendar/dates.test.ts` cover the invariants the governing documents call non-negotiable:

- the Fridge \u2192 Task Bar \u2192 Calendar \u2192 Fridge lifecycle preserves stable identity and richer data at every stage;
- Move / Unplace / Delete remain distinct and never silently destroy an object;
- a fixed/pinned placement blocks Move until explicitly unpinned;
- a Unit never carries its own `sectionId` (Units belong to Course + calendar only);
- Live Classroom's Stop here requires a resume note, Skip only applies to a not-started lesson, and a completed/skipped lesson can never be relaunched;
- deleting a Unit with scheduled Lessons is blocked rather than silently cascading;
- a same-day double placement for one Section fails closed instead of silently overwriting;
- Week defaults to Monday\u2013Friday and only becomes Sunday-first when weekends are explicitly enabled;
- the Month grid never produces a stray/orphaned Monday cell;
- school-day arithmetic (used by Shift) correctly skips weekends and confirmed no-school days in both directions.

Run `npm run test` to execute the suite.

## Documentation

- [`docs/governing/`](docs/governing/) \u2014 the current product/brand/interaction authority for this rebuild (Agent Source-of-Truth Map, Master Operating Document, Canonical Product Spec, Desktop Interaction Blueprint, Canonical Brand System, Bug Fix Log, asset references, and the September 8 Rebuild Decision Addendum, which governs where documents disagree).
- [`docs/`](docs/) (top level) \u2014 an earlier, shorter handoff package kept for historical reference. Where it conflicts with `docs/governing/`, the governing folder wins.
