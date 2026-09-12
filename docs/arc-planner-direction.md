# Arc Planner — product model and gold UX

Kelly: Arc is not a SaaS site. Judge every screen as a **bound teaching planbook** with edge furniture. If the calendar disappeared and a dashboard remained, it is no longer Arc.

This pass locks the model, ranks why the current UI fails it, and gives implementable gold for the main surfaces. No product-model fork is required to start. Open design questions (exact Fridge pull-tab anatomy, always-on vs collapsible Task Bar, class isolation, After School lane, final Note artifact) stay paused.

**Nested IA (Kelly, locked — forthcoming Arc idea renders are authority; do not invent a competing tree):**

- **Settings options nest within themselves.** Calendar contains week + confirmed days; a course contains its sections; View options contain contrast/motion. Not a flat SaaS settings list of peer `<h2>` blocks.
- **Lessons nest in Units.** The Unit is the parent span; the Lesson is one day’s teaching piece *inside* that span. Domain already has `lesson.unitId`. The spread must show that parent/child, not a unit bar with a sibling chip row that ignores it.

---

## 1. Product model

A teacher is keeping hold of a year of teaching under ordinary disruption. They capture unscheduled work, sort it, place it on instructional days, teach from Day, adjust when school interrupts, recover the rest of the sequence, and reuse what worked. The shortest test is **Arc holds your place**: within about five seconds the teacher should see where they are, what changed, and what happens next.

**Home is the open planner spread**, not a project list, feed, or settings shell. Day / Week / Month are lenses over one canonical teaching state. Furniture (Settings, Fridge, Task Bar) attaches to the wall around that spread. It never overlays the pages, never squeezes them, never becomes a left rail.

**Primary canvas:** a sketchbook field — dark bound edge, warm paper, a quiet gutter, shared rules. Calendar content is an *editable projection on that field*. Material realism belongs to edge, stock, grain, and tabs — not a photograph of a blank notebook with a web app pasted in the middle.

**Primary objects (stable IDs, never silently destroyed):**

| Object | What it is | How it reads on the spread |
| --- | --- | --- |
| Course / Section | What is taught, and to whom (period) | Row labels on Week/Day. Not a “Classes” tab. |
| Unit | Parent span of instructional time for a Course | A continuous colored bar across days. Contains its Lessons. |
| Lesson | One day’s teaching piece *inside* a Unit (shared or Section-specific) | A paper slip nested under that Unit’s bar, never a peer of the Unit. |
| Note | Lightweight capture | A distinct scrap. Task Bar may hold Notes only. |
| Magnet | Parked idea/resource/reminder | Lives on the Fridge door; calendar representation is quieter. |
| Placement | Where an object sits | Location metadata, not a duplicate record. |
| Delivery | not-started / in-progress / completed / skipped | Teaching truth, distinct from crossing out a task. |

**Core loop:** capture → sort → place → teach → adjust → recover → reuse.

**Gold for this type of planner** (craft references, not competitors to copy):

- Analog teacher planbooks (Whaley, Squidmore, printable weekly spreads): **period rows × weekday columns**, one week on a spread, room to write, unit as a band across days.
- Fantastical / Cron: the calendar *is* the product; chrome is editorial and scarce.
- Linear timeline / Gantt: ranges are first-class visible objects, not a badge on the start date.
- Things 3: spatial columns, tactile density, no dashboard widgets.
- Muse / paper grain: analog memory through line, margin, and stock — not a desk diorama.
- Canonical Figma week (`Arc — Canonical UI Rebuild`, especially Week / class-row frames): “Plans that change are still plans”; class rows; spanning units; red Important circle; Must/Should/Could as a tray under the book; Fridge as edge furniture; **freeform objects live in white space — calendar representations are distinct**.

**Gold density:** a working spread you scan, not a card grid you browse. 80% structure / 20% expression. Forms (Settings, create, import) are allowed to be boring.

---

## 2. Why the current UI fails (ranked)

Evidence from `waxandwing/icarus` running locally and from source. Mix of **SaaS leftovers** and **missing planner craft**.

1. **Furniture overlays the spread (SaaS leftover, automatic FAIL).** Settings/Fridge/Task Bar are `position: fixed` slide-overs with a dimming scrim (`AppFrame.module.css`). Governing rule: furniture does not overlay or squeeze the calendar. This is Linear/Stripe drawer grammar, not a folder on a desk.
2. **Week is a card grid of days, not a planbook matrix (craft missing).** Isolated rounded `DayCell`s with gaps (`WeekView` + `DayCell.module.css`). Gold is Section rows × Mon–Fri columns with shared rules. A teacher cannot see a class across the week.
3. **Units are not spans (craft missing).** A Unit is a pill on its start date plus a “continuing from before” caption. Spec and Figma require a continuous Gantt-style bar across the days it occupies.
4. **Objects are SaaS chips (SaaS leftover).** `PlacementChip` is a 13px pill/badge kit (full-radius Units, pill Magnets, clip-path Lessons). Planbook gold: Unit = bar; Lesson = written slip; Note = scrap. Color-alone left borders plus emoji 📌 for fixed dates.
5. **Day is a chip list with “Start class” CTAs (SaaS leftover + craft missing).** Day is supposed to be the class/period reality surface (carryover first, then today’s plan per Section). Current Day is a vertical list of chips and primary buttons — a task inbox, not a teaching day.
6. **The notebook is costume (SaaS leftover).** `calendar-open-planner.webp` is stretched as a CSS background; HTML calendar is pasted onto blank pages. Brand rule: analog memory, not skeuomorphism-as-costume. Figma rebuild brief: material realism belongs to field edges, not fake desk chrome.
7. **Chrome is template SaaS (SaaS leftover).** Segmented Day/Week/Month control; circular icon nav; mustard onboarding banner; dark bottom action bar (Linear/Figma); Fridge as a 3×3 dashed card grid plus faded clip-art; Task Bar as a kanban with checkbox cards; Settings as a utility dump with a “danger zone.”
8. **Selection toolbar is a global dark capsule, not a mark on the object (craft missing).** Blueprint: compact popup near the selected piece. Current: fixed bottom-center ink bar wrapping “Move to [date input]”.
9. **Empty/error/motion are generic.** Italic “Nothing placed…”; overlay fade-in scrim; hover brightness on chips. Gold: a ruled open page; motion that slides/tucks/pins; errors that name the consequence (collision, fixed date, missing course).
10. **Live Classroom is a full-bleed modal takeover.** Acceptable as a focused teaching surface, but it currently looks like a marketing splash (centered serif, mustard eyebrow) rather than the lesson paper already in Arc. Lower priority than 1–6.

---

## 3. Gold UX direction (implementable)

### Structure (all main surfaces)

- **Wall / environment:** warm wood/paper wall. Generous negative space around the book. No left rail.
- **Wall header (outside the book):** Arc mark (returns to Week, closes furniture) · editorial title (“Teaching week” / day name / month) · prev / Today / next · `Day  Week  Month` as text, not a segmented pill.
- **Sketchbook:** CSS-bound field (dark edge ~8–10px, radius ~8–10px, paper fill `#FBF8F1`, cream grain overlay, 1px gutter at 50%). Content is the projection. Do not use the blank-notebook photo as a 100%×100% backdrop.
- **Furniture:** attached to the *planner* outer edges, occupying wall space.
  - Settings = left folder/tray. Tab peeks on the left bound. Open panel sits entirely to the left of the book.
  - Fridge = right tray. Same rule, mirrored.
  - Task Bar = tray under the book. Open grows *below* the book (page may scroll). Calendar geometry unchanged.
  - **No scrim. No overlay on the pages. No reflow of the grid.**
- **Sample honesty:** one quiet line on the wall or paper edge, not a mustard SaaS banner.

### Week (primary working spread)

```
[ Section label ]  MON 8   TUE 9   WED 10  THU 11  FRI 12
  Course name      [======== Unit 1 (parent span) ========]
  Period · time      Lesson   Lesson  Lesson  (nested slips)
                   [======== Unit 2 (next span) ==========]
                     Lesson   Lesson
```

- Default Mon–Fri. Shared horizontal rules between Sections; shared vertical day rules; **no per-cell radius, no 8px gaps**.
- Each **Section is a row** (course name + section name as the stub). Each intersecting **Unit is a nested band** in that row: bar with `grid-column` spanning the overlapping days, then that unit’s Lessons in the day columns underneath. Two units in one week are two stacked nests, not one bar track plus one mixed lesson track.
- Lessons without a `unitId` sit in a loose band under the units — a holding place, not the default grammar.
- Lessons are **plain titles** in the day column, 14–16px, paper-slip silhouette at most (square-ish, 3px radius, no pills). Important = red hand-drawn circle, not a badge.
- Calendar Notes/Magnets for the week sit in a thin **Notes** row under the last Section — not a second planner.
- Empty: ruled rows still exist. Copy: “Add a course in Settings, then place a lesson on a day.” No illustration, no “Create your first project.”
- Drop target: the day column under a Section (and the Notes row). Keyboard: arrows move between day columns and Section rows.
- Density: 2–3 Sections should fill the page without scrolling on a 900px-tall laptop; more Sections scroll inside the book.

### Month

- One paper month: shared 1px rules, cells flush, no card radii.
- Unit = a thin color bar along the top of every day it occupies so adjacent days **read as one span**. Title on the start day (and on the first visible day of each week if the unit continues).
- Lessons = slips stacked in the cell. Overflow: “+N more” is acceptable; do not clip without a way to open the day.
- Today = terracotta date numeral (and optional underline). Never style weekend/no-school as today. No-school = hatch or kraft tint **plus** a text label.

### Day (class reality)

- **Continuing from before** first when Arc is holding a place (in-progress / unscheduled carryover / spanning Unit).
- Then **one block per Section**, in teaching order: section name, then each **Unit nest** (bar as parent, today’s Lesson slips as children, delivery state). **Start class / Resume class** is a period action on the lesson (ink text button, not a filled CTA cluster). Shift lives here as “Shift this section from today.”
- Notes for the day underneath.
- “Add to this day” is a dashed write-in line, not a big empty-state card.
- Non-instructional day: one sentence at the top (“No school: Labor Day”) then the same structure, disabled launch.

### Fridge

- A **finite door** (capacity stays 9). Magnets/notes sit on a blue paper field with slight rotation and real slots — empty slot is unused paper, not a dashed app tile.
- Kill the faded `fridge-notes-blue.webp` decoration-as-content.
- Overflow copy: “The door is full — that went to the Drawer.” Drawer is a list, not a second fridge.
- Quick capture: one line + Pin. No type-tab chrome unless needed.

### Task Bar

- Horizontal Must / Should / Could on kraft/lined paper, attached under the book.
- Items are Notes: title + optional Important circle + cross-out. Not checkbox-kanban cards (a checkbox is acceptable as the *control*; the row should look like a written line).
- Empty column: a ruled blank, placeholder “Add to must…” at 16px.

### Settings

- Boring on purpose (brand rule 15). Still a **folder of nested options**, not an account/billing page and not a flat list of peer sections.
- Tree (children indent under the parent; forthcoming idea renders refine sculpture, not this IA):
  - **Calendar** → Week (weekends) → Confirmed school days (named exceptions, then add)
  - **Courses** → a Course → its Sections → add section; add course at the Courses level
  - **View options** → High contrast, Reduce motion (Blueprint: Settings → View Options)
  - **Workspace** → Reset (quiet last action, no “Danger zone” heading)
- Do not restyle this into a SaaS settings app while waiting on Kelly’s renders.

### Selection / create / shift

- Toolbar: paper chip near the selection (fallback: attached just below the sketchbook, still paper/ink — never a dark global capsule). Actions stay distinct: Edit, Important, Cross out, Move, Copy, Unplace, Delete. Date move can be a compact field.
- Create: calendar-contained. Type tabs may stay; the dialog is a paper slip, 16px fields, concrete errors (“Give it a title first.” / “Create a course in Settings first.”). Creating a Lesson nests **Course → Unit (parent) → Section**. Prefer the unit that covers the day. Do not create a lesson as a peer of a unit.
- Shift: preview list of date → date, then Apply. Not a toast-only action.

### Interaction, empty, error, motion

- Drag is enhancement; click/keyboard/touch must place, move, unplace.
- Empty = open ruled paper + one next action. Error = named consequence + stay put. Undo remains a colleague line, not a snackbar celebration.
- Motion: 220–360ms `cubic-bezier(0.2, 0.7, 0.2, 1)` — slide, tuck, pin. Honor reduced-motion (already tokenized). No bounce, sparkle, or overlay dim.

### Type and color

- Nunito Sans 400/600/700 for UI; Fraunces/Georgia for the view title only; Caveat only for Important/asides.
- Body 16px. 14px only for secondary meta with strong contrast.
- Paper `#F3EBDD` / page `#FBF8F1` / ink `#2C2E2E`. Course color orients Units; do not rainbow every control. Radius 4/8; no pillification of the view switcher, day cells, or Units-on-calendar.

---

## 4. Fix first (this PR, no product-model decision)

Do these before any rewrite of domain, Live Classroom, import, or Year Map.

1. **Kill overlay furniture.** Remove the scrim. Attach Settings / Fridge / Task Bar to the planner edges so the book never dimms, moves, or resizes.
2. **Build the sketchbook field.** Bound edge + paper + gutter + wall header. Stop stretching the blank-notebook photo behind a web calendar.
3. **Week = Section rows × days, Units as parent spans, Lessons nested inside them.** This is the identity of Arc. One Section in sample data is enough to prove the grammar.
4. **Month = shared ruled grid + connecting Unit bars.** Same object grammar, denser.
5. **Day = per-Section blocks, continuity first, quiet teach/shift actions.**
6. **Restyle chrome to planner:** text view switcher, paper selection toolbar, Fridge as a magnet field, Task Bar as a lined tray, quiet sample line.

**Pause (need Kelly) only if:** someone wants a Classes tab, a dashboard home, overlay drawers “because mobile,” collapsing Move/Unplace/Delete into Remove, treating Fridge as a project list, flattening Settings back into a SaaS list, or showing Lessons as siblings of Units.

**Still later:** exact Fridge tab sculpture, always-visible Task Bar, class isolation, After School lane, Quarter/Semester/Year Map, pixel-anchored toolbar. Live Classroom stays the teaching face of the same paper Day/Lesson (not a dark second product). Drag of a placed lesson is domain `move()` only — do not add copy-on-drag. Kelly’s Arc idea renders, when they land, win over any sculpture invented here.
