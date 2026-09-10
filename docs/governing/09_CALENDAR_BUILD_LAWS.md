# Arc Calendar Build Laws

Status: Founder-directed implementation contract for the ICARUS calendar rebuild.

These rules govern the calendar build until explicitly superseded by a later founder instruction.

## Product priority

Arc is teacher-first infrastructure. Teacher effort is the scarce resource. A calendar decision should save time, reduce mental clutter, preserve work, or make disruption easier to recover from.

Keep what teachers love about paper planning. Remove what makes paper planning exhausting.

## Canonical-state law

Day, Week, Month, and Year are projections of one canonical planning state. They are not independent calendars and must not create duplicate instructional truth.

Semester is removed. Quarter is not a standalone interface. Quarter boundaries, colors, and grading-period structure remain metadata that may appear inside Month and Year.

## Arc and Table

Planning happens in Arc. Delivery happens in Table.

Table never owns a parallel lesson plan. It projects the teacher-selected delivery fields, resources, materials, timing, and status from the canonical Arc lesson for the active section and date.

## Calendar furniture

The planner remains the fixed central object. Settings occupies exterior-left territory, Fridge exterior-right, and Task Bar exterior-bottom. Opening furniture must not move, resize, or squeeze the calendar.

## Interaction grammar

Clicking empty usable calendar space selects or activates the date. Selection reveals relevant contextual actions. The default calendar should remain visually quiet when nothing is selected.

Right-click may expose expert shortcuts but is never the only path to an action.

Object type never changes merely because an item was dragged somewhere. Explicit conversion is required when a teacher wants a Task, Note, Lesson, or other object to become another type.

## Day planning lanes

Each visible date in Week has its own planning lane beneath the date heading. The lane supports typed quick Notes, Note placement, Task date association, selection, and emphasis.

Weekend and no-school lanes remain usable but visually subdued. Early-release dates remain instructional and are visibly marked.

## Week projection

Week is a teaching-sequence view: class or section rows by visible dates. Unit ranges provide continuity across the row and Lessons occupy section/date intersections.

Units are informative and selectable in ordinary Week but are not directly rescheduled by dragging there.

## Month projection

Month is the primary Unit placement and pacing surface.

Dropping a new or imported Unit establishes its start date, then Arc asks for its instructional-day duration. Weekends and no-school dates are skipped by default. Arc previews the resulting date range before the placement is committed.

A known imported Unit length is a suggestion, not an irreversible placement.

## Import law

Prior-year and CSV curriculum import creates organized, unplaced instructional material in Fridge or Drawer first. Arc does not dump imported material directly into the calendar without explicit teacher approval.

## Course and section synchronization

Sections of the same course inherit a shared instructional sequence. A section may diverge by storing only section-specific overrides and disruptions. Arc must not clone the entire course plan for every section.

When a section catches up, Converge with course ends the future override from that point.

## Calendar states

Whole-day state and section-specific disruption are separate data concepts.

Whole-day states include instructional, weekend, no-school, early-release, testing, and special schedule.

Section disruptions may include fire drill, assembly, testing, technology loss, behavior/reset, or another teacher-entered reason. A section disruption must not incorrectly mark the entire school day as disrupted.

## Context actions

Available actions are derived from selection, current view, and object state. Examples include Edit, Move, Shift, Copy, Extend, Circle, Disrupt, Diverge, and Converge.

The environment reacts to selection instead of permanently displaying every command.

## Task completion

Checking a Task completes it and visibly crosses it out before it can disappear from the active surface.

Minus minimizes or archives it from the active Task Bar. X clears it from the current workflow. Completion remains reversible through the control or Undo.

## Red-circle emphasis

Red-circle emphasis is metadata, not a separate object type.

Most teacher-facing targets may be circled when useful, including Tasks, Notes, Lesson titles, Units, dates, early-release labels, disruptions, and materials reminders.

Red means the teacher deliberately marked this as worth noticing. It must also have a non-color accessible state.

## Year view

Year is an instructional-year map, not a dashboard. It shows compact months, quarter metadata, major non-instructional states, current position, and appropriate Unit or pacing information.

Teachers may cross out elapsed days one at a time. Crosses use subtly varied hand-drawn marks to preserve the physical planner behavior. The crossed-out layer can be hidden without changing calendar data.

## Green gate

A slice is Green only when all six gates pass:

1. Behavior: the intended workflow works.
2. State: the correct canonical data changes and object identity is preserved.
3. Persistence: close/reload does not lose the change.
4. Cross-view: the same underlying truth appears correctly in other projections.
5. Accessibility: keyboard, focus, zoom, and non-color meaning are viable.
6. Visual: a rendered state has been compared against the approved Arc visual reference.

Historical labels, a successful build, or a Figma frame alone do not make a slice Green.
