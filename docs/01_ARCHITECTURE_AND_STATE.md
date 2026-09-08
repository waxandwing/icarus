# ARC — Architecture and Reactive State

## Recommended implementation

- React + TypeScript.
- One external canonical workspace store with explicit actions and memoized selectors.
- Zustand + Immer is the recommended lightweight choice; Redux Toolkit is acceptable if the agency prefers stricter event tooling.
- XState or an equivalent explicit state machine for setup/import review, recovery/shift review, and Live Classroom outcome workflows.
- IndexedDB for local-first application persistence, with a versioned migration layer.
- Server persistence behind a repository interface so local and remote storage do not change domain behavior.
- Playwright for cross-view, persistence, keyboard, and accessibility workflows.

Framework choices are negotiable; the state invariants are not.

## Data flow

```text
UI intent / import / teaching outcome
              ↓
       validated domain command
              ↓
       canonical domain event
              ↓
      workspace state reducer/store
       ↙          ↓           ↘
SchoolCalendar  history      persistence
       ↘          ↓           ↙
         projection selectors
    Day / Week / Month / later views
```

Views may keep ephemeral presentation state—open menus, hover, temporary draft text—but may not own a second copy of scheduling truth.

## Canonical entities

- SchoolCalendar: confirmed instructional and non-instructional dates, schedules, evidence, and confidence.
- Course: shared curriculum identity.
- Section: a particular teaching instance of a Course.
- Unit: belongs to Course + calendar.
- Lesson: shared under Course/Unit.
- Note: lightweight canonical note; only Notes may enter Must/Should/Could.
- Magnet: Idea, Voice, Resource, or Reminder.
- Placement: canonical date/range/context reference, separate from content identity.
- DeliveryState: sparse per-Section divergence (`not-started`, `in-progress`, `completed`, `skipped`).
- HistoryEntry: immutable record of consequential change.
- Visibility: explicit metadata for teacher-private, Live Classroom, Daily Board, or Sub Plan projection.

## Required commands

- create, edit, copy
- place, move, unplace
- previewShift, applyShift, undoShift
- markImportant, crossOut
- moveToFridge, moveToDrawer, moveToTaskBar (Note only)
- beginLiveClassroom, completeLesson, stopLesson, skipLesson, leaveWithoutOutcome
- importSchoolCalendar, reviewImportDiff, commitImport

Delete is distinct from unplace and must be dependency-checked.

## State invariants

1. A stable ID survives every move and projection.
2. One action updates every calendar scale through shared state.
3. Course curriculum is shared; Section delivery divergence stays sparse.
4. A Unit cannot be unplaced while scheduled children remain.
5. Fixed anchors never move through a shift unless the teacher explicitly changes them.
6. Same-day collisions fail closed until specifically approved.
7. Apply and Undo survive reload.
8. Imported school truth retains source and confidence.
9. Re-import creates a diff and never silently moves existing work.
10. Stale structural context blocks Live Classroom writeback.

## Suggested source structure

```text
src/
├── app/                 composition, providers, routing
├── domain/              entities, commands, events, invariants
├── calendar/            SchoolCalendar and date truth
├── state/               store, reducers, selectors, migrations
├── workflows/           state machines for setup/recovery/live
├── projections/         Day, Week, Month and later selectors
├── persistence/         local and server adapters
├── components/          accessible presentational components
├── surfaces/            Calendar, Fridge, Task Bar, Settings, Live
├── assets/              approved package assets only
├── styles/              tokens, layout, motion, responsive rules
└── tests/               contracts, browser flows, hostile cases
```

AppFrame remains composition-only. It must not own the calendar domain or become a god component.

