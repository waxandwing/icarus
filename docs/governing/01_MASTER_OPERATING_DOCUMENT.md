ARC — MASTER OPERATING DOCUMENT
CURRENT TRUTH + BUILD PLAN
Last reconciled: September 7, 2026


PURPOSE
This is Arc’s working control center. It is intentionally different from the historical product/build logs. It contains only the current truth required to design, build, test, and release Arc, plus a quarantine list for superseded directions and a sequenced task queue.


Operating rule: when another Arc document, old prototype, screenshot, branch, chat instruction, or build log conflicts with this document, stop and reconcile the conflict before implementation. Do not silently choose the newest-looking artifact.


SHORTEST PRODUCT TEST
Arc holds your place.


Arc is a calendar-centered teaching workspace that helps a teacher know where they are, what changed, and what happens next. It connects planning, live teaching, disruption, recovery, and later reuse without pretending to be the teaching expert.


1. SOURCE OF TRUTH HIERARCHY
Tier 1 — Current operating authority
• This document: current cross-functional operating truth and task order.
• ARC — Canonical Product Spec — Greenfield Rebuild: deep behavioral/domain history and implementation evidence.
• ARC — Canonical Brand System & Construction Rules: deep visual/interaction guardrails, except where this document records an explicit newer correction.
• Wax & Wing — Obsessive Audit, Beta Testing & Debugging Prompt Arsenal: canonical RGAV audit methodology.


Tier 2 — Evidence and reference
• Approved Wax & Wing brand assets and explicitly approved Arc visual assets.
• Current Git implementation and its tests.
• Current chat decision trail.
• Research, simulated teacher councils, competitor notes, and usability hypotheses.


Tier 3 — Historical/reference only
• Archived brand guides.
• Historical working files.
• Arc Easel rebuild logs.
• Old branches, screenshots, previews, Figma/Canva explorations, and prototypes.


Authority rule
A prototype is never canonical because it is newer. A historical note is never current merely because it still exists. Simulated councils are pressure tests, not human research. Code claims are not behavioral proof until directly verified.


2. NON-NEGOTIABLE PRODUCT PRINCIPLES
1. The calendar is the center.
Day, Week, Month, Quarter, Semester, and Year Map are lenses over one teaching truth. The calendar remains visually and functionally dominant.


2. Arc holds continuity, not just plans.
Core loop: capture → sort → place → teach → adjust → recover → reuse.


3. Nothing important disappears silently.
Move, shift, unplace, import, collision handling, deletion, and recovery must preserve identity/history or clearly explain consequences. Fixed dates stay fixed unless the teacher explicitly changes them.


4. The teacher remains the authority.
Arc can suggest. The teacher decides. AI/automation must be optional, contextual, inspectable, and reversible.


5. Recovery matters as much as planning.
Assemblies, testing, absences, weather, pacing differences, early release, partial lessons, and class-specific interruptions are normal states.


6. One source of truth across scales.
Views are projections of canonical state, never independent schedule stores.


7. Arc supports existing tools instead of rebuilding them.
Drive, Canva, LMS links, calendars, presentations, and resources attach to the right teaching context. Arc does not need to replace them.


8. Direct manipulation should feel physical, not toy-like.
Place, drag, stretch, tuck, pin, shift, carry forward. Dragging is an enhancement; every meaningful drag needs an equally capable click/keyboard/touch path.


9. The product must work when tired.
A teacher should understand the next relevant action within about five seconds.


10. Releases are judged by trust, not feature count.
No fake success, silent data loss, invented school truth, inaccessible core path, or visually convincing-but-broken control can pass.


3. CURRENT PRODUCT SURFACE
Home
• Calendar is Home and the visual center.
• One responsive app, not separate desktop/mobile products.
• Arc mark returns to the teacher’s primary/last-used calendar context.
• Default teacher week is Monday–Friday; weekends can be enabled.
• Week view defaults to Monday–Friday. If weekends are toggled on, Week may render Sunday–Saturday with Sunday as the first visible day. Year Map is an attendance/school-year view with no weekends; every Year Map week begins Monday and must never create stray or anomalous Mondays.
• Current day can be highlighted, but weekends/no-school styling may never masquerade as “today.”
• Teacher can choose default landing view.


Canonical views
• Day
• Week
• Month
• Quarter
• Semester
• Year Map


Current priority
The primary loop takes precedence over filling every horizon with equal depth. Day, Week, and Month already carry core planning projections. Quarter/Semester/Year Map projection depth should resume only after the primary workflow and interface shell are Green.


Day
• Day is the bridge between planning and teaching.
• Per Section, show carryover first when Arc is “holding your place,” then Today’s Plan.
• Distinguish effective planned date from actual taught date.
• Unscheduled carryover remains visible until reconciled.
• Day is the only launch point for Live Classroom.


Live Classroom
• Live Classroom is inside Arc. “Easel” is retired current-product terminology.
• Launch only from the current Day, on a confirmed instructional date, for an exact Section + Lesson.
• If multiple eligible lessons exist, show a candidate chooser.
• Completed/skipped lessons are not launchable.
• Live Classroom is focused on one Section + Lesson. It is not the whole planner, Fridge, or recovery workspace.
• Outcomes: Complete; Stop here (resume note required); Skip (not-started only); Leave/Back without outcome.
• Before writeback, revalidate canonical context. Stale structural context blocks the write and returns the teacher to Day/reopen.
• Successful outcomes return to the exact originating Day/Section.
• Future Daily Board is the student/sub-facing projection of explicitly visible day content. It is not a separate product.


Progressive setup
• Get the teacher into Arc before configuring all of Arc.
• Setup lives inside the real calendar desktop and is resumable, dismissible, and contextual.
• Safe actions—basic exploration and Fridge capture—can happen before every setup field is complete.
• Order: school identity → official-source search/prefill → miniature visual calendar review → early-release confirmation → defer bell schedule until needed → courses/sections.
• Official district/school sources first; PDF/CSV upload second; manual entry last.
• Prefill aggressively, commit conservatively.
• Imported school truth must be reviewed before consequential commit.
• The primary import proof is a miniature Arc calendar, not a giant list/report.
• Early release is an alternate instructional schedule, not a no-school day.
• Multiple bell schedule patterns are valid: regular, early release, A/B, testing, assembly, campus-specific, etc.
• Re-import produces a diff. Never silently move existing work.


4. CANONICAL DOMAIN + DATA RULES
Canonical planning objects
• Unit
• Lesson
• Magnet
• Note


Course and Section
• Course = shared curriculum identity.
• Section = a specific teaching instance.
• Unit belongs to Course + calendar, not a Section.
• Lesson is shared under Course/Unit.
• Sparse Section-specific delivery state stores divergence without cloning curriculum.


Teaching states
• not-started
• in-progress
• completed
• skipped


Object action semantics
• Move: changes placement, preserves stable ID/history.
• Unplace: removes placement but preserves object/history.
• Delete: destroys object and must be dependency-checked.
• Never use ambiguous “Remove” for destructive or structurally different actions.
• Unit unplace is blocked if scheduled children remain.
• Lesson unplace clears shared planned date + Section overrides, preserves history, and converts fixed-with-no-date to flexible.


Architecture
• One canonical domain model.
• One canonical SchoolCalendar service for date truth.
• One persistence layer.
• One navigation owner.
• One visual token owner.
• UI is a projection of canonical state.
• AppFrame remains composition-only; it does not become a god component.
• Workspace transitions belong in the workspace/state boundary, not scattered component-local copies.
• Stable IDs and recovery history are structural requirements.


SchoolCalendar
• Normalizes instructional/non-instructional date truth.
• Structural movement requires confirmed calendar truth.
• Confidence states: Confirmed / Mixed / Inferred.
• Never invent dates, events, bell schedules, closures, or school data.
• Search/import evidence must retain provenance.


Shift/recovery
• Preview first.
• Section-specific.
• Fixed anchors are immutable unless explicitly changed.
• Same-day collisions fail closed unless exact same-day approval exists.
• Apply/Undo must remain reload-safe.
• Any change to movement must retest Section isolation, collision handling, persistence, undo, and cross-view truth.


5. FRIDGE + CAPTURE SYSTEM
Fridge Door
• Active, finite, persistent spatial staging surface.
• Opens as outer-edge furniture from the left or right boundary of the planner/wall space. It must not overlay the calendar and must not change the calendar’s geometry; the furniture occupies/reveals space outside the calendar surface like an actual drawer.
• Overflow moves to Drawer.
• No automatic oldest-item eviction.
• Fridge is not a second planner or dashboard.


Drawer
• “Keep for later” overflow/storage companion to the finite Door.
• Must preserve findability and object identity.


Magnet types
• Idea
• Voice
• Resource
• Reminder


Rules
• Unit and Lesson are canonical kinds, not Magnet subtypes.
• Stack is a temporary spatial relationship, never silent curriculum reparenting/date/priority.
• Universal visible magnet-type labels are not required. Identity must remain understandable without a permanent legend.
• Color never carries essential meaning by itself.
• Every drag route has a non-drag Move/Schedule equivalent.
• Lightweight Magnet → calendar asks only for minimum required commitment; optional fields stay optional.
• Full Edit remains available even when a surface exposes only lightweight controls.


Capability depth
1. Fridge Door / Drawer — capture and arrange
2. Priority/task depth — notes, Must/Should/Could, red-circle emphasis, completion treatment
3. Calendar depth — date/course/placement + richer planning
4. Day — today projection
5. Live Classroom — focused teaching
6. Daily Board — later student/sub-facing projection


Clean Up
• Closes/collapses workspace surfaces and returns focus to calendar.
• Never deletes, archives, schedules, reprioritizes, reparents, or changes saved positions.


Take a Look Around
• Short first-use spatial discovery, not a required tutorial course.
• Skippable, restartable, reduced-motion aware.
• Ongoing How-to can surface genuinely unused helpful affordances based on use history.
• No question-mark badges on everything.


6. VOICE MAGNET RULES
• Explicit push-to-record only.
• No passive listening or background recording.
• Local-first audio.
• No automatic Drive/cloud upload or transcription.
• One Voice Magnet references one stable local audio artifact; moving it never duplicates audio.
• Teacher-private by default.
• No student/person profiles or diarization.
• Optional transcription requires explicit action and transparent destination/provider if cloud transfer occurs.
• Missing audio keeps the Magnet/backstory and clearly reports recording unavailable.
• Beta gate must test local save truth, storage failure, sign-out/reset, export/backup, restore/relink, missing-file state, account isolation, and destructive-clear warnings.
• Cross-device cloud sync is not required for first beta if local export/restore is trustworthy.


7. PERSONAL + PLANNER MARKS
Personal planning lane
• Teacher-controlled, collapsible parallel Day/Week/Month lane.
• Not a Course or Section.
• Personal Magnet/Note can move into Personal without becoming curriculum.
• Lightweight fields: notes, time, duration, recurrence.
• Recurrence uses stable occurrence IDs + series parent.
• Default recurring edit = this one only; optional this-and-future/all.
• Personal content is never student-facing.


Red Circle
• Canonical cannot-forget emphasis.
• Must remain a visible Arc/Wax & Wing signature mark.
• Never rely on red alone for accessibility.


Cross Out
• Teacher-authored paper-planner mark.
• For lightweight items it may mean done.
• On Unit/Lesson it never fabricates canonical teaching completion.


Keyboard accelerators
• Shift+1 / Shift+2 may accelerate planner marks when not editing.
• Accessible visible/non-shortcut paths remain required.


8. PRESENTATION + PRIVACY
• Teacher-private is the default.
• Live Classroom, Daily Board, and Sub Plans show only content explicitly marked/presented for that surface.
• Visibility is metadata on canonical objects, not duplicated content.
• Universal Locate/Find is required across Fridge, Drawer, priority, calendar, Unit/history, and related recovery contexts. Locate takes the teacher to the object’s real canonical context.


8A. FOUNDER LOCK — INTERFACE + OBJECT DEPTH RULES (September 4, 2026)
These rules override conflicting prototype, mockup, historical-build, or prior-document directions until Kelly explicitly changes them.
• NO LEFT RAIL. There is no persistent full-height navigation rail.
• Side utilities are furniture tabs/drawers that originate from the outer edge of the planner/wall space. A left-side Settings drawer may contain toggles, Help, class rosters, setup, and secondary utilities, but it is not a persistent rail.
• Classes is not a tab or separate destination. Day is the class/Section-centric working view. Class isolation, when added, should behave as a filter/lens over canonical state rather than a duplicate planning space.
• Selecting a Unit, Lesson, Magnet, Note, task item, or other movable object opens a contextual pop-up toolbar. Core actions may include Delete, Copy, Shift, Move, and Put in Drawer, subject to object-specific guards and dependency checks.
• Fridge remains the canonical name. It is the staging/holding space for movable material, consistent with the magnet metaphor: things to hold onto, be proud of, revisit, or use later.
• There is no Plan strip. The only persistent planning/task strip is Must / Should / Could, referred to as the Task Bar. Only canonical Notes may enter the Task Bar; Unit, Lesson, Magnet, or other object kinds must not silently become Task Bar items.
• Capability depth follows the object through surfaces without data loss: Ideas/Fridge = limited capture information; Task Bar = adds task-relevant fields such as notes and time; Calendar = offers full planning customization. Dragging an item back to a shallower surface never deletes its deeper data. The shallower surface exposes only the fields/actions appropriate to that surface by default, with an explicit Full Edit/override path to reach retained data.
• Visual object language should differentiate kinds: Units as magnets, Lessons as sticky-note/paper-note forms, and Note/Idea as a distinct lightweight paper object. Exact art direction remains subject to brand review.
• Source-backed or teacher-entered school events that are not instructional-plan objects may live in Notes or an optional After School lane/section. Arc must never fabricate school events.
• The calendar remains true while furniture opens. Furniture slides outward/inward at the planner’s exterior edge; no overlay behavior over the calendar and no calendar reflow/squeeze.


9. VISUAL SYSTEM — CURRENT AUTHORITY
Design target
High-end grown-up stationery and editorial utility for experienced teachers. Contemporary, calm, tactile, slightly imperfect. Not corporate edtech, not elementary-cute, not a literal desk, not generic AI software.


Balance
• Approximately 80% structure / 20% expression.
• Calendar and teacher work dominate.
• Generous white space is functional, not leftover.
• Avoid dashboard/card-kit composition and equal-weight tiled modules.
• Use asymmetry, hierarchy, quiet areas, rules, labels, tabs, and spatial composition before adding containers.


Paper + environment
• Environmental desk/background is distinct from the planner.
• Calendar/planner remains Arc paper white.
• Restrained page edge, subtle paper depth, and restrained shadow can make the planner feel physical.
• Never glossy 3D, glassmorphism, neumorphism, thick stacked paper, photoreal desk clutter, or craft-store skeuomorphism.


Analog memory
• Thin matte paper.
• Restrained torn/clipped edges.
• Dry oil-pastel/wax-crayon marks.
• Credible handwriting accents.
• Slight imperfection.
• Nostalgia is emotional memory, not costume.


Approved color direction
• Paper #F3EBDD
• Ink #2C2E2E
• Mustard #E4B33D
• Terracotta #C96845
• Dusty Blue #7C9CAD
• Sage #9AAA89
• Dusty Pink #C99A9E
• Lavender #AAA0B8
• Kraft #C6A77D
• Soft Charcoal #4A4945
Color orients before it decorates.


Typography
• Primary UI direction: Nunito Sans / Avenir-family rounded humanist sans; adult, restrained, not bubbly.
• Editorial serif: Georgia / Source Serif 4 / Newsreader for selective statements or headings, never core nav.
• Handwriting only for brief accents, annotations, underlines, or asides.
• No handwriting for essential navigation, forms, long copy, or accessibility-critical information.
• Visual review decides kerning and line breaks; do not trust defaults blindly.


Geometry
• 4 px base spacing.
• Scale: 4/8/12/16/24/32/48/64.
• Default utility radius around 8 px; small 4 px; large 12 px.
• Avoid pillification and all-rounded-everything.
• One expressive shape family per local composition.
• Functional icons read cleanly around 20–24 px; texture becomes safer at larger display sizes.


Motion
• Explains cause/effect: slide, shift, tuck, fold, pin, draw.
• No bounce, sparkle, celebration loops, or game-like reward motion.
• Respect reduced motion.
• Temporary interaction locks are acceptable only when they prevent conflicting actions during consequential transitions and remain understandable.


Language
• Sounds like a capable colleague.
• Concrete verbs: move, continue, shift, fix, hold, place, teach, review, return.
• Avoid corporate edtech language, productivity clichés, motivational coaching, “teacher cute,” and AI-coded filler.


Visual review gate
Never show an actionable Arc UI/prototype as approved without checking:
• calendar remains visual center;
• generous white space;
• Monday-first logic;
• hierarchy and edge furniture behavior;
• red Important circles;
• restrained familiar utility symbols;
• no template/card-kit drift;
• no invented brand tokens;
• accessibility semantics are not being replaced by decoration.


10. ACCESSIBILITY + TRUST GATES
Release requirements, not cleanup:
• Body UI target 16 px minimum; 14 px only for secondary metadata with strong contrast.
• WCAG AA for essential controls/copy.
• Keyboard-only completion of same meaningful core work.
• 200–400% zoom/reflow.
• Small laptop viewport.
• Touch where relevant.
• Clear focus, labels, reading order, errors, and recovery.
• No essential meaning via color, texture, handwriting, hover, or drag only.
• Reduced motion.
• Save → reload persistence.
• Two-account isolation where applicable.
• No console/page errors or hidden runtime breakage in release candidate.
• Direct interaction evidence beats source-code inspection.


11. AUDIT SYSTEM — RGAV
Method
Risk-Gated Adversarial Validation (RGAV): treat every artifact as unproven until evidence demonstrates reliability.


Color ladder
GREEN = best/highest state. Green cannot be averaged into existence. One release-blocking critical failure prevents Green.


Core loop
1. Establish canonical truth.
2. Identify highest-risk failure first.
3. Structural audit before polish.
4. Independent persona passes.
5. Verify through direct evidence.
6. Log each failure with reproduction, severity, expected vs actual, likely cause.
7. Fix the smallest defensible root cause.
8. Retest original + neighboring + historical failures.
9. Run accessibility/stress/persistence/resize/save-reload/cross-view/malformed-input checks as relevant.
10. Assign status only after evidence.


Standing release rule
Two independent consecutive GREEN-equivalent clean audits can trigger GO for a milestone. Any material change resets the count. This does not override legal, release, human-beta, or main-branch gates.


Open audit debt
PHASE 1 RGAV STATUS: GREEN. The final material shell candidate passed two meaningfully independent browser audits on the same head plus exact rendered visual review:
• [x] unrelated CalendarViewRail automatic scrolling removed;
• [x] generic div aria-label semantics repaired and regression-covered;
• [x] stable rendered shell hierarchy regression coverage added;
• [x] direct browser accessibility/touch/reflow evidence passed in protected CI and an independent second teacher-path audit.


12. EXPLICITLY RETIRED / QUARANTINED DIRECTIONS
Do not resurrect without an explicit new decision:
• Easel as a separate product, repo, navigation silo, or current name.
• “Easel is the teaching surface of Arc” wording. Replace with Live Classroom inside Arc.
• Old Master Working File as current authority.
• Ideas Workbench as the current capture model.
• Standalone dashboard as Home.
• Generic card-dashboard UI.
• Permanent workbench that squeezes the calendar.
• Blocking onboarding wizard.
• Fake/demo classes, school events, source cards, or data in a real workspace.
• Global permanent sticker tray.
• Forced Week home.
• Lesson page as Home.
• Mandatory lesson-template setup.
• Duplicate “Calendar” label beneath Arc wordmark.
• Separate desktop/mobile products.
• Versioned CSS recovery layers.
• Parallel state stores.
• Same-day approval persistence/UI as immediate priority.
• Quarter/Semester/Year projection depth as immediate priority before primary loop is Green.
• Universal visible magnet type tags/permanent legends.
• Question-mark-on-everything tutorial chrome.
• Linear mandatory tutorials.
• Automatic Fridge oldest-item eviction.
• Color-only semantics.
• Automatic Voice → Lesson/Unit conversion.
• Clean Up as delete/archive/tidy/reflow.
• Early release treated as no-school.
• Manual school calendar entry as primary setup path.
• Glossy, plastic, clay-like, glass, neumorphic, photoreal desk, or template-heavy aesthetics.
• Any claim that a simulated Teacher Council equals human beta evidence.


13. KNOWN DOCUMENTATION CONFLICTS TO CLEAN UP
• [RESOLVED September 7, 2026] Brand System Rule 7 now uses Live Classroom as the current teaching-surface terminology.
• [RESOLVED September 7, 2026] Brand System current teaching/cross-view language uses Live Classroom; Easel remains historical/legacy only.
• Product Spec contains duplicated/misaligned section numbers and repeated later addenda.
• Product Spec interleaves historical “next gate” statements with later superseding decisions.
• Old setup/onboarding instructions remain readable even though the September 4 progressive setup checkpoint supersedes them.
• The product spec is useful as deep history/evidence but should no longer be used as the day-to-day task queue.
• Historical visual guides contain directions now explicitly archived.


Documentation policy from now on
• This master holds current cross-functional truth + work queue.
• Deep behavioral evidence remains in Product Spec.
• Deep visual rules remain in Brand System.
• Bug/issues go to the structural bug/audit log.
• Git records implementation.
• Chat records live decisions and must be reconciled into Drive when material.
• Do not create a new canonical document unless it has a distinct enduring purpose.


14. MISSING / INCOMPLETE ELEMENTS
P0 — Must resolve for the primary loop
• Direct browser/a11y verification for the current interface shell and Day hierarchy.
• Finish current ORANGE audit debt.
• [x] Confirmed current implementation authority: waxandwing/arc-greenfield · develop @ 88eb20b961647aa92d5ef9a98e65504e9ca8134d. B01 Week shell/spatial ownership and B02 Week planning object hierarchy are integrated Green. Phase 1/2 planning truth and the already-merged Phase 3 school-truth foundations remain frozen neighboring dependencies unless integration exposes a regression. No Vercel/main/production deployment is authorized by this checkpoint.




• Establish rendered regression tests for canonical hierarchy and Monday-first calendar layout.
• Verify full save/reload and Undo continuity on current build.
• Verify school calendar source search/import → review → commit → re-import diff end-to-end in browser.
• Verify progressive setup does not block safe calendar/Fridge use.
• Verify Day → Live Classroom → outcome → exact Day/Section return in browser.
• Verify cross-view truth Day ↔ Week ↔ Month after movement/recovery.
• Verify non-drag alternatives for every current drag path.
• Confirm “unresolved structural bug → audit document” logging is active and consistent.


P1 — Needed after core loop is Green
• Universal Locate/Find.
• Minimum-required lightweight Magnet → calendar scheduling flow.
• Presentation visibility metadata.
• Daily Board/student-sub-facing one-source-of-truth projection.
• Catch-Up Review after meaningful inactivity.
• Personal lane Day/Week/Month.
• Voice Magnet beta storage/export/restore/privacy implementation.
• Must/Should/Could final interaction treatment with canonical red circles.
• Quarter/Semester/Year Map planning projection depth.
• Dark mode/contrast treatment that preserves brand and semantics.
• School calendar/bell schedule exception editing beyond initial import.


P2 — Later / research-dependent
• Cross-device Voice sync.
• Richer AI suggestions.
• Additional optional visual skins/setup vibe preference after core system is stable.
• Deeper reuse/curriculum library workflows.
• Admin/import conveniences that do not compromise teacher-first design.


Research debt
• Human beta evidence is still required; simulated personas/councils do not satisfy it.
• Competitive research should inform constraints, not drive feature mimicry.
• Any novel teacher-workflow hypothesis must be labeled hypothesis until direct teacher evidence supports it.


15. THE SCAFFOLDED BUILD ORDER
Rule: finish one vertical slice to Green before opening the next. No parallel UI wandering. No polishing a downstream feature while a structural dependency is Orange.


PHASE 0 — RESET THE CONTROL PLANE
[x] Treat this master as the day-to-day authority.
[x] Update Brand System Easel references → Live Classroom.
[x] Mark conflicting old docs clearly archived/reference-only.
[x] Confirm active repo/branch and current runtime against master.
[x] Consolidate structural bugs into one audit log (ARC — Bug Fix Log). BUG 001–004 are resolved and merged; newly discovered structural defects must continue to be logged immediately.
EXIT: no ambiguity about authority, branch, current runtime, or open structural defects.


PHASE 1 — CALENDAR SHELL + CANONICAL LAYOUT
[x] Lock AppFrame/composition boundaries; AppFrame remains composition-only and workspace/navigation state stays in the workspace boundary.
[x] Lock Monday-first calendar math across every rendered grid.
[x] Lock calendar-as-center layout and shell edge-furniture behavior; calendar is the dominant paper object, view tabs act as restrained planner furniture, utilities recede into the margin, and responsive mobile behavior preserves the hierarchy.
[x] Lock responsive/small-laptop/zoom behavior; protected browser gate passes 1280×720, 320/390px reflow, touch target, and 200%/400% zoom stress.
[x] Remove unrelated CalendarViewRail scrolling behavior.
[x] Repair semantic hierarchy/ARIA defects; generic labelled divs replaced with explicit semantic groups/regions/sections/articles and regression-covered.
[x] Add rendered hierarchy regression coverage; Monday-first, one-h1 shell hierarchy, named navigation/group/region semantics, and generic-labelled-div regression are active.
[x] UI brand gate PASS on exact tested 1280px artifact: calendar dominance, paper/environment separation, restrained planner tabs, utility hierarchy, editorial typography, white space, palette, and no card-kit/glass/fake-desk drift.
[x] RGAV pass 1 — primary browser/a11y suite PASS on final material head.
[x] Fix — focused shell art direction completed; misleading unavailable-view strike-through removed. Two later failures were audit-harness expectation errors, not Arc product failures, and were corrected without product-code changes.
[x] RGAV pass 2 — independent 1366×768 teacher-path audit PASS on same final head.
EXIT: two clean Green-equivalent audits on shell/layout with direct keyboard + zoom evidence.


PHASE 2 — CORE PLANNING TRUTH
[x] Unit/Lesson create/edit/move/unplace/delete baseline is directly rendered and reload-verified; Magnet/Note action depth remains later capture scope.
[x] Unit/Lesson identity/history baseline: Unplace preserves the object across reload, destructive Delete stays deleted, and protected actions refuse to orphan Lesson/teaching state.
[x] Course/Section divergence baseline: Period 2 delivery state can diverge from Period 5 on one shared Lesson and survives reload without cloning curriculum.
[x] Day/Week/Month Lesson projection baseline — rendered browser proof shows the same saved Lessons across Month, Week, and Day.
[x] Lesson move cross-view mutation baseline — moving one Lesson updates canonical placement without disturbing its same-day neighbor; broader object mutations remain in later Phase 2 gates.
[x] Multiple Lessons/day + multi-day Unit behavior — rendered Unit span crosses a no-school date/weekend; a non-instructional-only Unit placement fails closed.
[x] No-school/weekend behavior — Lesson placement on no-school truth fails closed; an explicitly confirmed instructional Saturday is valid; Week hide/show preserves weekend planning data.
[x] Save/reload baseline for Course, Sections, Units, same-day Lessons, moved placement, Section-specific delivery divergence, Lesson/Unit Unplace/Delete, calendar exceptions, a multi-day Unit, an instructional-Saturday Lesson, applied Section Shift, persisted Undo token, consumed Undo, and restored Section schedule.
[x] Undo/recovery regression — rendered preview → explicit Section Shift → reload → Section isolation → Undo → restored schedule → reload all pass.
[x] Non-drag/keyboard parity — current Phase 2 planner has no drag-required mutation route; keyboard-focused controls directly prove Lesson move, Unplace, Delete, Recovery Apply, Undo, and reload persistence.
[x] UI/brand gate — Lesson editing and Recovery were art-directed away from nested SaaS/admin-card treatment into Arc’s editorial planner hierarchy; exact 1366px Lesson/Recovery artifacts passed visual review.
[x] RGAV ×2 — final merged-head full circuit PASS + independent alternate teacher-path RGAV PASS after the last material visual change..
EXIT: a teacher can create, place, move, recover, reload, and understand the same truth in Day/Week/Month.


PHASE 3 — SCHOOL TRUTH + PROGRESSIVE SETUP
[ ] Enter Arc before setup completion.
[x] School search against official sources — teacher-facing NCES search, explicit no-guess candidate selection, honest none/error states, live browser retrieval, source labeling, keyboard selection, and zero calendar mutation merged in PR #63.
[x] Provenance/confidence — canonical proposal/persistence path + source-backed edit/reload proof merged in PR #58/#60.
[x] Mini-calendar review — Monday-first, provenance-aware rendered review surface merged in PR #60.
[ ] Early-release and bell-pattern review.
[ ] PDF/CSV fallback.
[x] Commit only after explicit review — first-time source-backed acquisition → Read dates → unreviewed proposal → explicit review → separate commit is rendered, persistence-tested, and merged in PR #69.
[ ] Re-import diff.
[ ] Courses/Sections after calendar entry.
[ ] Accessibility + malformed input + interrupted setup.
[ ] UI polish/brand pass.
[ ] RGAV ×2.
EXIT: setup is trustworthy, non-blocking, source-backed, and reload-safe.


PHASE 4 — FRIDGE + CAPTURE
[ ] Finite Door.
[ ] Drawer overflow.
[ ] Idea/Resource/Reminder baseline.
[ ] Stack without semantic mutation.
[ ] Schedule/Move parity for drag and non-drag.
[ ] Clean Up semantics.
[ ] Take a Look Around first-use behavior.
[ ] Universal Locate/Find foundation.
[ ] Red-circle/task depth integration.
[ ] UI polish/brand pass.
[ ] RGAV ×2.
EXIT: capture → arrange → schedule is fast, recoverable, and never creates a second planner.


PHASE 5 — RECOVERY + DAY CONTINUITY
[ ] Shift preview/apply/undo.
[ ] Fixed anchors.
[ ] Section isolation.
[ ] Same-day collision fail-closed behavior.
[ ] Carryover.
[ ] Partial/missed/completed/skipped truth.
[ ] Actual taught vs planned date.
[ ] Catch-Up Review using existing movement engines.
[ ] Persistence/reload torture test.
[ ] UI polish.
[ ] RGAV ×2.
EXIT: Arc reliably “holds your place” after a disrupted day/week.


PHASE 6 — LIVE CLASSROOM
[ ] Eligibility from current Day.
[ ] Candidate chooser.
[ ] Exact Section + Lesson context.
[ ] Focused stage mode.
[ ] Complete / Stop here / Skip / Leave.
[ ] Required resume note for Stop here.
[ ] Revalidation before writeback.
[ ] Stale-context blocking/recovery.
[ ] Exact return to origin.
[ ] Explicit presentation visibility.
[ ] UI/timing/motion/a11y polish.
[ ] RGAV ×2.
EXIT: planning → teaching → writeback is one reliable loop.


PHASE 7 — DAILY BOARD + PERSONAL
[ ] Student/sub-facing Daily Board from explicitly visible day content.
[ ] One-board/multiple-period clarity.
[ ] Personal Day/Week/Month lane.
[ ] Personal recurrence semantics.
[ ] Privacy boundaries.
[ ] Locate/Find across these contexts.
[ ] RGAV ×2.
EXIT: teacher can manage personal + instructional day without leaking private content or duplicating truth.


PHASE 8 — VOICE MAGNET
[ ] Push-to-record.
[ ] Local storage truth.
[ ] Stable artifact reference.
[ ] Failure states.
[ ] Export/backup.
[ ] Restore/relink.
[ ] Sign-out/reset/destructive clear.
[ ] Account isolation.
[ ] Optional transcription consent/transfer truth.
[ ] RGAV privacy + storage + accessibility passes.
EXIT: Voice is useful without creating a surveillance/privacy/storage trap.


PHASE 9 — HORIZON DEPTH + FINISHING
[ ] Quarter projection.
[ ] Semester projection.
[ ] Year Map projection.
[ ] Dark mode.
[ ] Additional visual skins only if they preserve all structural rules.
[ ] Performance/stress.
[ ] Full regression.
[ ] Human beta.
[ ] Two final independent Green audits.
EXIT: beta/release candidate.


16. CURRENT NEXT ACTION
Phase 0 and Phase 1 are complete and Green. Do not reopen shell art direction unless a later structural change creates a regression.


Phase 1/2 planning truth remains GREEN. The September 6 COO controlled-reopen order still governs the UI sequence. B01, B02, combined B03/B04, combined B05/B06, and B07 are now GREEN and frozen except for demonstrated downstream integration regressions. B07 final tested feature head 347a40d3f809da1df27ed44f7ce918a27b322503 was merged through PR #97 to protected develop as 224e66a6a93447ea1930c5806c47b70e4c866ac1 using the expected-head safeguard. Exact-head primary + independent B07 audits, the full frozen regression matrix, and post-merge protected develop verification all passed. Next authorized action = B08 — PERSISTENCE + AUTHENTICATED STATE INTEGRITY. Do not broaden into B09 progressive setup, B10 capture, B11 teaching continuity, B12 release finishing, or deployment.


The immediate sequence is:
1. Treat protected develop @ 4f9a00ab53e60f0ba9732662e27fde2c93afe106 as the frozen B01–B06 implementation authority while B07 is active; B01–B06 remain frozen except for demonstrated downstream regressions.




2. Execute B07 only: reconcile every currently visible Week create/edit/move/unplace/delete/range/Shift/Undo/recovery transition against canonical domain state, preserve Section divergence/fixed-anchor/history truth, and remove or constrain any UI-local behavior that contradicts the domain. Do not broaden into B08 authenticated persistence, B09 progressive setup, B10 capture workflow, B11 Live Classroom behavior, B12 release finishing, or deployment.
3. Log every newly discovered structural planning defect immediately in ARC — Bug Fix Log before fixing it.
4. Work B07 as one coherent interaction-engine slice: inventory current UI actions and domain transitions → identify mismatches/duplicate adapters → fix the smallest defensible root cause → prove original + neighboring + historical regressions → verify cross-view mutation truth → RGAV ×2 after the final material change.
5. Keep B01 shell/spatial ownership, B02 object grammar, combined B03/B04 interaction/quick-add, combined B05/B06 furniture/accessibility, and proven Phase 1/2 planning truth frozen while B07 is built; only demonstrated integration regressions may reopen them.
6. Phase 2 is GREEN after five rendered behavioral baselines, exact Lesson/Recovery visual review, a clean merged-head full RGAV circuit, and a meaningfully independent alternate teacher-path RGAV. Do not reopen Phase 2 except for a regression exposed by later integration.


This prevents design from outrunning behavior and prevents testing from becoming an end-stage cleanup exercise.


17. DEFINITION OF DONE FOR ANY SLICE
A slice is not done because it looks right or its code compiles.


Done means:
• expected behavior is explicitly defined;
• canonical state model is respected;
• happy/bad/interrupted/recovery paths work;
• save/reload works where state exists;
• historical failures are regression-tested;
• keyboard/non-drag equivalent exists;
• zoom/small-laptop behavior is usable;
• brand gate passes;
• no silent loss or invented truth;
• direct runtime evidence exists;
• two consecutive independent Green-equivalent audits pass after the final material change.


18. OPEN DECISION LOG
Record only unresolved decisions that block work. Do not use this as a brainstorm list.


Current unresolved decisions:
• Final implementation choice within the approved UI-sans family should be resolved visually in the shell, not by abstract font debate.
• Exact Daily Board visual form is intentionally deferred until the Day/Live Classroom loop is Green.
• Optional visual skins are product-future scope, not a current shell dependency.
• Same-day explicit approval UI is deferred until real collision pressure demonstrates the need.
• Voice cloud sync is deferred; local export/restore is the first beta trust target.


19. WORKING DISCIPLINE
• One active feature branch at a time.
• One current vertical slice at a time.
• Structure before polish.
• UI after behavior is coherent, but before the slice’s final audits.
• Every discovered structural bug is logged immediately.
• Fix the smallest defensible cause, not the visible symptom.
• Re-test historical failures after every relevant fix.
• Never use a screenshot as proof of persistence, semantics, accessibility, or data integrity.
• Never broaden scope to avoid finishing the current slice.
• When a new idea appears, place it in P1/P2 or the decision log unless it blocks the current slice.
• Green means best. We do not average our way into it.


20. IMPLEMENTATION CHECKPOINT — SEPTEMBER 4, 2026


Repository authority confirmed: waxandwing/arc-greenfield.
Working implementation branch confirmed: develop @ 881b477bd355e6c0c43400978bc45803e2da01e1 after BUG 001–004 resolution and Phase 1 Green shell merge. Main is not the active implementation line; develop remains the current greenfield implementation authority.
Completed Phase 1 fix branch: fix/calendar-monday-alignment (merged).
Merged PR: #43 — Fix Monday-first calendar alignment across range views.


BUG 001 verification state:
• Root cause confirmed: generic Year/Quarter/Semester range rendering flowed from the first date rather than reserving fixed Monday-first weekday columns.
• Fix centralizes Monday-first weekday indexing, reuses it for week boundaries, inserts leading blank cells for partial weeks, and renders compact Year Map as a true seven-column weekly grid.
• Regression contract added for Monday, Wednesday, and Sunday weekday-column mapping.
• GitHub typecheck: PASS.
• GitHub production bundle build: PASS.
• Domain contracts: PASS.
• Browser/accessibility smoke gate: PASS, including rendered Year Map weekday-column proof.
• Rendered verification: PASS — Wednesday start → column 3; Sunday → column 7; following Monday → column 1.


BUG 001 status: RESOLVED and merged to develop.
BUG 002 status: RESOLVED and merged via PR #45; fixed-home/Last used behavior is persisted and the Arc wordmark honors the resolved home target with safe fallback.
BUG 003 status: RESOLVED and merged via PR #45; Week remains Monday–Friday by default with a persisted optional weekend display that does not mutate hidden weekend data.
CalendarViewRail automatic scrolling debt: RESOLVED in PR #45.
PR #45 protected gates: contracts PASS; typecheck PASS; production build PASS; browser/accessibility PASS.
Current RGAV status: GREEN for Phase 1 shell/layout. PR #47 final head e56fe0c03e0555673cec88bfce4bcb9d9cc4efb6 passed protected contracts/typecheck/build, primary browser/a11y RGAV A, independent teacher-path RGAV B, and exact 1280px rendered visual review before squash merge to develop @ 881b477bd355e6c0c43400978bc45803e2da01e1.








21. IMPLEMENTATION CHECKPOINT — PHASE 1 SHELL SEMANTICS + VISUAL GATE
Current develop: 3ab7768581a46b3072477019d14c5a46abc01642
Merged PR: #46 — Repair Phase 1 shell semantics and calendar context
Final tested PR head: c4ac43f62c60534fa29cb8f2eca941c9196ca43f


Structural evidence passed
• Domain contracts PASS.
• Typecheck PASS.
• Production build PASS.
• Browser/accessibility PASS.
• One level-one Month workspace heading verified.
• Named Calendar views navigation, date-navigation group, and Month calendar region verified.
• Generic div aria-label regression verified clean after an intermediate adversarial failure exposed remaining Calendar primitives.
• Monday-first Year Map historical regression still passes.
• BUG 004 regression passes: Week → next Week → Edit dates → save preserves both Week and the anchored range.
• 1280×720 small-laptop shell, 200%/400% zoom stress, 320/390px reflow, 44px touch target, reduced motion, validation focus, and runtime-error checks pass.


Rendered visual gate
An exact screenshot from the final passing PR #47 browser run was reviewed. PASS: calendar remains the visual center; paper/environment separation is clear without becoming a literal desk; selected view reads as restrained planner/index furniture; utility actions recede appropriately; paper/ink/mustard/terracotta direction is coherent; typography and white space are controlled; unavailable Semester/Quarter no longer mimic teacher cross-out; no glossy/glass/card-dashboard/template drift. Visual gate PASS.


Current next action
Phase 1 earned GREEN and PR #47 is merged. Move to Phase 2 core planning truth; keep the shell frozen except for defects exposed by planning integration.








22. PHASE 1 GREEN CHECKPOINT — SHELL + CANONICAL LAYOUT
Final visual/audit branch: design/phase1-shell-art-direction
Merged PR: #47 — Art-direct the Phase 1 Arc shell
Final tested head: e56fe0c03e0555673cec88bfce4bcb9d9cc4efb6
Develop merge commit: 881b477bd355e6c0c43400978bc45803e2da01e1
Final workflow run: 33939103744


RGAV A — PASS
• Protected domain contracts PASS.
• Typecheck PASS.
• Production build PASS.
• Browser/accessibility PASS.
• Monday-first regression PASS.
• BUG 004 calendar-edit continuity regression PASS.
• Shell hierarchy/semantic regression PASS.
• 1280×720 small-laptop, 200%/400% zoom, 320/390px reflow, 44px touch, reduced motion, focus/validation, and runtime-error checks PASS.
• Exact 1280px shell artifact captured from this same run and visually reviewed PASS.


RGAV B — PASS
Independent Chromium path at 1366×768 used a different interaction sequence: setup → Last used preference → weekends enabled → Week → next Week → Arc Home → reload → fresh page in same persisted context → keyboard skip. Verified Last-used persistence, weekend visibility/persistence, Home behavior, fresh-page keyboard order, overflow, and runtime-error cleanliness.


Audit-harness discipline
Two intermediate RGAV-B failures were correctly classified as test defects, not product defects: first the test expected full Saturday/Sunday labels while Arc intentionally rendered Sat/Sun; second it expected a mid-session blurred document to restart sequential focus at the first element. The harness was corrected; product code was not changed in response to either false failure.


Visual result
The final shell reads as Arc rathe
23. PHASE 2 CHECKPOINT — BASELINE PLANNING TRUTH + BUG 005
Merged PR: #49 — Add rendered Phase 2 planning truth gate
Final tested head: 2513e767c6e167af0340629e7e74276cf0de74e2
Develop merge commit: 6ee25a33fc769ab858e5c213723a536df844f95d
Verification run: GitHub Actions 33942406495


Directly proven in the rendered teacher workflow:
• configure calendar → create Course/Section → create/place Unit;
• create two distinct Lessons on the same instructional day;
• save succeeds and both appear from the same canonical state in Month, Week, and Day;
• Course/Section/Unit/Lessons survive reload;
• moving one Lesson to the next instructional day does not move/delete the neighboring same-day Lesson;
• the moved placement survives reload;
• browser runtime remains clean.


BUG 005 was discovered by this gate: shared same-day Lessons were incorrectly treated as Section-specific schedule collisions. Root fix now distinguishes shared curriculum placement from explicit Section overrides. Shared same-day Lessons are legal; genuine Section-override collisions remain fail-closed and still require exact same-day approval. Historical Shift/same-day approval/Section schedule/persistence contracts all remain Green.


Verification on the final head: contracts PASS; typecheck PASS; production build PASS; browser/accessibility PASS; independent shell RGAV PASS; Phase 2 rendered planning truth gate PASS.


PHASE 2 STATUS: IN PROGRESS, NOT GREEN. Proven baseline is intentionally narrower than the full phase. Still open: rendered Unit/Lesson Unplace/Delete guards, stable identity/history evidence through those actions, Course/Section divergence, multi-day objects, no-school/weekend planning behavior, Undo/recovery, non-drag parity across all current drag paths, UI polish after behavioral closure, and two final independent Phase 2 RGAV passes.


NEXT SLICE: rendered object-action protections + Section divergence. Keep the Phase 1 shell frozen.


r than generic SaaS: calendar as the dominant paper object, restrained environmental separation, quiet planner-index view furniture, tucked View options, subordinate date/setup utilities, adult editorial typography, generous white space, restrained tactile depth, and no card-kit/glass/fake-desk drift. Unavailable views use subdued state without teacher-like cross-out semantics.


PHASE 1 STATUS: GREEN.
Phase 2 is now the only active implementation slice.


24. PHASE 2 CHECKPOINT — OBJECT ACTIONS + SECTION DIVERGENCE
Merged PR: #50 — Prove Phase 2 object actions and Section divergence
Final tested head: 909d566b27efdefbe215c20b9f1a34e5f0ba33cd
Develop merge commit: c5a20d67417856fd50d4b64e0f67648b17c9e651
Verification run: GitHub Actions 33967396031


Directly proven in the rendered teacher workflow:
• Unit Unplace and Delete fail closed while a scheduled child Lesson still depends on the Unit.
• Period 2 can hold in-progress status, actual taught date, and a resume note while Period 5 remains not-started on the same shared Lesson.
• That Section-specific divergence survives reload without cloning the Lesson or leaking state between Sections.
• Lesson Unplace removes calendar placement while preserving the Lesson across reload.
• A safe Lesson Delete remains deleted after reload and does not disturb an unrelated Lesson.
• Once dependent Lessons are gone, Unit Unplace preserves the Unit unscheduled across reload.
• Explicit Unit Delete then destroys only that Unit and remains deleted after reload.
• Browser runtime remains clean throughout the sequence.


Verification on the final head: contracts PASS; typecheck PASS; production build PASS; browser/accessibility PASS; independent shell RGAV PASS; baseline Phase 2 planning-truth PASS; Phase 2 object-action + Section-divergence gate PASS.


Audit-harness discipline: intermediate failures were test defects, not Arc defects. One locator searched row text even though Unit names live in input values; another diagnostic used an unsupported Playwright method. The harness was corrected without changing product code. No BUG 006 was opened.


PHASE 2 STATUS: IN PROGRESS, NOT GREEN. Object-action and Section-divergence baselines are now directly proven. Still open: multi-day behavior, no-school/weekend planning boundaries, recovery/Undo regression, non-drag parity, UI polish after behavioral closure, and two final independent Phase 2 RGAV passes.


NEXT SLICE: focused Phase 2 planning UI/brand gate on exact merged develop. Keep the Phase 1 shell frozen.


25. PHASE 2 CHECKPOINT — CALENDAR-EDGE PLANNING TRUTH
Merged PR: #51 — Prove Phase 2 calendar-edge planning truth
Final tested head: 80ee864094762feb1fd27dba6823d184ad516160
Develop merge commit: 5c38ec60ebc9157932ddd6ec9f05d9c1c75d2557
Verification run: GitHub Actions 33967723293


Directly proven in the rendered teacher workflow:
• A multi-day Unit from September 14–21 can span a confirmed no-school date and weekend while retaining one canonical placement.
• A Sunday-only Unit placement with no confirmed instructional day fails closed and does not leak rejected draft state.
• A Lesson cannot be placed on a teacher-declared no-school exception inside that Unit span.
• A teacher-declared instructional Saturday can legitimately hold a Lesson.
• Month projects the Unit span, the no-school exception, and the valid Saturday Lesson from the same canonical state.
• Week remains Monday–Friday by default; enabling weekends reveals seven days and the Saturday Lesson. Turning weekends off/on does not mutate or delete that planning data.
• Reload preserves the calendar exceptions, multi-day Unit, and Saturday Lesson; the rejected no-school Lesson remains absent.
• Browser runtime remains clean.


Verification on the final head: contracts PASS; typecheck PASS; production build PASS; browser/accessibility PASS; independent shell RGAV PASS; baseline Phase 2 planning-truth PASS; object-action + Section-divergence gate PASS; calendar-edge planning-truth gate PASS.


Audit-harness discipline: the only intermediate failure used a nonexistent `.planning-week-day` selector. The rendered Week uses `.planning-date-heading`; the harness was corrected without changing product code. No BUG 006 was opened.


PHASE 2 STATUS: IN PROGRESS, NOT GREEN. Calendar-edge planning truth is directly proven. Still open: rendered recovery/Undo continuity, non-drag parity, focused UI polish after behavior closes, and two final independent Phase 2 RGAV passes.


NEXT SLICE: focused Phase 2 planning UI/brand gate on exact merged develop. Keep the Phase 1 shell frozen.


26. PHASE 2 CHECKPOINT — RECOVERY / UNDO CONTINUITY
Merged PR: #53 — Prove Phase 2 recovery and Undo continuity
Final tested head: 14e5cc8439f7d5be5cac1a827fcf1d93205dc281
Develop merge commit: 2af8acbcd26f20169ff55c0eee99fef255460f01
Verification run: GitHub Actions 33968011904


Directly proven in the rendered teacher workflow:
• One in-progress Period 2 Lesson surfaces exactly one Recovery review while Period 5 remains on shared curriculum truth.
• Recovery preview preserves the exact stop note, chooses the next confirmed instructional resume day, identifies affected flexible work, and explicitly protects the later fixed anchor.
• Teacher explicitly chooses the follow-up destination before Apply; the Shift is Section-specific.
• After Apply, Period 2 alone moves to the recovery dates while Period 5 remains on the shared Wednesday/Thursday plan.
• Reload preserves both Section-specific schedule overrides and the Undo token.
• Undo from the teacher-facing header restores Period 2 to shared placement without disturbing Period 5.
• Reload after Undo preserves the restored schedule and does not resurrect the consumed Undo token.
• Browser runtime remains clean.


Verification on the final head: contracts PASS; typecheck PASS; production build PASS; browser/accessibility PASS; independent shell RGAV PASS; baseline Phase 2 planning-truth PASS; object-action + Section-divergence PASS; calendar-edge planning-truth PASS; recovery/Undo continuity PASS.


No structural product defect was discovered in this slice. No BUG 006 was opened.


PHASE 2 STATUS: IN PROGRESS, NOT GREEN. Core planning mutation, Section divergence, calendar-edge truth, and recovery/Undo continuity now have direct rendered evidence. Still open: non-drag/keyboard parity for current actions, focused UI/brand polish after behavior closure, and two final independent Phase 2 RGAV passes.


NEXT SLICE: focused Phase 2 planning UI/brand gate on exact merged develop. Keep the Phase 1 shell frozen.


27. PHASE 2 CHECKPOINT — NON-DRAG / KEYBOARD PARITY
Merged PR: #54 — Prove Phase 2 non-drag keyboard parity
Final tested head: f59d5e5f5b18c6d0293001f8e6742ed416561bb8
Develop merge commit: f3914bff6b0ff03432d98e80d99735f3cf6d7877
Verification run: GitHub Actions 33968258396


Canonical interpretation:
The current active Phase 2 src/ planner does not expose drag as a required mutation route. Calendar views are read projections; planning mutations use labelled inputs, selects, and buttons. The correct parity requirement is therefore that the same meaningful work is fully operable without pointer/drag, not that Arc invents a drag gesture just to have an alternative to it.


Directly proven in the rendered teacher workflow:
• The current planning surface exposes no draggable=true planning control as a required mutation path.
• Edit Lessons is keyboard-focusable and activates with Enter.
• A Lesson can be selected through keyboard activation.
• Planned date can be changed through a focused control; keyboard Save persists the move across reload.
• Lesson Unplace is keyboard-accessible and preserves the Lesson unscheduled across reload.
• Lesson Delete is keyboard-accessible after dependency-safe Unplace; deletion persists across reload.
• Recovery review opens by keyboard, the destination remains a keyboard-operable select, Apply Shift is keyboard-accessible, and Undo is keyboard-accessible.
• Consumed Undo remains consumed after reload.
• Browser runtime remains clean.


Verification on the final head: contracts PASS; typecheck PASS; production build PASS; browser/accessibility PASS; independent shell RGAV PASS; baseline Phase 2 planning-truth PASS; object-action + Section-divergence PASS; calendar-edge planning-truth PASS; recovery/Undo continuity PASS; non-drag/keyboard parity PASS.


No product code change was required to satisfy this slice. No structural product defect was discovered and BUG 006 was not opened.


PHASE 2 STATUS: IN PROGRESS, NOT GREEN. Current behavioral scope has direct rendered evidence for planning truth, protected object actions, Section divergence, school-calendar edges, recovery/Undo, persistence, and keyboard/non-drag operation. Still open: focused planning UI/brand polish and two independent final Phase 2 RGAV passes after the last material change.


NEXT SLICE: focused Phase 2 planning UI/brand gate on exact merged develop @ f3914bff6b0ff03432d98e80d99735f3cf6d7877. Keep the Phase 1 shell frozen.


28. PHASE 2 GREEN CHECKPOINT — CORE PLANNING TRUTH
Final material UI branch: design/phase2-behavior-ui-brand-gate
Merged PR: #56 — Art-direct Phase 2 behavior surfaces
Final material tested head: 724089f6c0df1361951a1328f5e7be0d868d719c
Material product merge commit: 68f0e848e70eab6c2a1048dd1d78209bdbd02d10
Final material verification run: GitHub Actions 33968842253 — all ten jobs PASS.
Exact behavior artifacts: Lesson editor + Recovery review at 1366px — visual brand gate PASS. Lesson editing reads as quiet planner index + editorial work surface; Recovery reads as one continuous paper narrative with explicit Section impact and fixed-anchor context. No card-kit, fake-desk, glossy, clipping, or dashboard drift.


RGAV A — PASS
Merged-head full Phase 2 circuit on exact material product head 68f0e848e70eab6c2a1048dd1d78209bdbd02d10.
GitHub Actions run 33968981175.
PASS: contracts, typecheck, production build, browser/a11y, historical shell RGAV, baseline planning truth, object actions + Section divergence, calendar-edge truth, recovery/Undo continuity, non-drag keyboard parity, runtime cleanliness, and exact behavior screenshots.


RGAV B — PASS
Independent audit PR #57 used a different 1280×800 teacher story, Course/Sections, Lesson sequence, mutation order, cross-view path, keyboard move, Section divergence, Recovery/fixed-anchor review, Apply/Undo, reload, no-drag assertion, overflow check, and runtime gate.
Initial run 33969038449 failed because the audit checked a Week without first navigating to the target September 14–18 interval. That was an audit-navigation defect, not an Arc product defect. Product code did not change and no BUG 006 was opened from that failure.
Corrected independent run 33969143061: PASS.
Neighbor full-suite run 33969143069: PASS.
PR #57 merged audit-only coverage to develop @ 63cc31abb13a4d23f1751b3d6bb595ab9b966fc9. Post-merge develop verification run 33969207994: PASS.


Parallel-branch reconciliation
Draft PR #48 / codex/reconcile-founder-laws was inspected before Green was assigned. It targets main, is explicitly not ready to merge, is deeply diverged from develop, and implements an older Next/Zustand app/ + lib/ architecture. BUG 006 and BUG 007 in the Bug Fix Log are valid unresolved defects scoped to that parallel reconciliation branch: BUG 006 concerns its fixed-tree/Cut/Fridge interaction layer; BUG 007 concerns its recoveryAvailable quarantine subsystem. Those systems are not present in the active Vite src/ Phase 2 runtime and therefore do not invalidate this Phase 2 milestone. They remain unresolved and must be addressed before that branch or equivalent functionality is ever integrated.


PHASE 2 STATUS: GREEN.
EXIT EVIDENCE SATISFIED: a teacher can create, place, move, unplace/delete safely, diverge Sections without cloning curriculum, plan across school-calendar edges, recover and Undo across reload, operate the current mutation surface without drag dependence, and understand the same canonical truth in Day/Week/Month.


NEXT: PHASE 3 — SCHOOL TRUTH + PROGRESSIVE SETUP. Start with structural inventory and one highest-risk vertical slice; keep Phase 1 and Phase 2 Green surfaces frozen except for integration regressions.


29. PHASE 3 CHECKPOINT — SOURCE-BACKED CALENDAR REVIEW FOUNDATION + BUG 009
Merged PR: #58 — Add Phase 3 source-backed calendar review foundation
Final tested head: f389370273b60ea09613b798555d9e7e1e631ace
Develop merge commit: 149bb820b550a7d709673159770a79b47e869ef2
Verification: Arc verify 33969776471 PASS; independent RGAV 33969776448 PASS.
Foundation now established:
• district/import proposals use the existing CalendarHydrationInput → SchoolCalendar → persistence path; no second calendar store;
• proposal evidence retains source provenance and Confirmed/Mixed/Inferred confidence;
• source-backed proposals fail closed until explicit review;
• review/commit preserves uncertainty rather than silently promoting it;
• provenance survives save/reload;
• source/evidence mismatch and missing provenance fail closed;
• BUG 009 fixed: ordinary edits of source-backed calendars preserve source/confidence/provenance, while teacher-edited exception dates may become manual/confirmed individually.
PHASE 3 STATUS: IN PROGRESS, NOT GREEN. This is a domain/persistence foundation, not the completed teacher-facing setup flow.
NEXT SLICE completed by PR #60. Continue to actual proposal acquisition / official-source search plumbing without fake teacher-facing school data.






30. PHASE 3 CHECKPOINT — SOURCE-BACKED CALENDAR REVIEW UI
Merged PR: #60 — Prove Phase 3 source-backed calendar review UI
Final tested head: 642c4cb6eda4420ae462f7b172c1bc236805ae8a
Develop merge commit: 07acc511265ae1bb123ea6d1271373f5f031673c
Verification: Phase 3 source review run 33976966320 PASS; full Arc verify run 33976966287 PASS; independent Phase 2 RGAV run 33976966290 PASS.
Exact visual evidence: 1280px source-calendar review artifact from the same final head — PASS.
Directly proven:
• an existing source-backed calendar exposes District/Import source, Confirmed/Mixed/Inferred pattern confidence, retained provenance label/locator, and a miniature Monday-first Arc calendar before ordinary date editing;
• uncertainty is not color-only: overall pattern confidence is stated explicitly, while individually uncertain exception dates carry a visible ? plus accessible confidence text;
• the review surface uses continuous editorial paper hierarchy rather than a dashboard/card report;
• a teacher correction to an imported exception becomes manual/confirmed while underlying source/confidence/provenance remain intact;
• source provenance survives save → reload and the review surface returns on the reloaded source-backed calendar;
• browser runtime and horizontal-overflow checks pass;
• all frozen Phase 1/2 regressions remain Green.
Audit correction: an intermediate visual artifact showed question marks on every generated date because Mixed pattern confidence propagated through hydration. That was truthful but visually useless. Final UI distinguishes overall pattern uncertainty from individually uncertain exceptions; material UI changed, so all final gates were rerun on 642c4cb6… before merge.
PHASE 3 STATUS: IN PROGRESS, NOT GREEN. The proposal/review domain and source-backed edit/review surface now exist, but Arc still lacks actual official-source proposal acquisition, first-time source-search → proposal → review → commit wiring, early-release/bell-pattern review, PDF/CSV fallback, re-import diff, and progressive non-blocking entry.
NEXT SLICE completed by PR #61. Continue to a real provider implementation / first-time school identity search handoff; School search remains unchecked until actual official-source retrieval is proven.


31. PHASE 3 CHECKPOINT — OFFICIAL-SOURCE ACQUISITION BOUNDARY
Merged PR: #61 — Add Phase 3 official-source acquisition boundary
Final tested head: 974b41586d8e98d73888157cf27a6ddd907a2a76
Develop merge commit: 818c3e469db35b23d285eb13c0847e86c6c79755
Verification: Arc verify run 33977401026 PASS after one exact browser/a11y job rerun; Phase 2 independent RGAV run 33977401017 PASS; Phase 3 source-review run 33977401013 PASS.
Domain boundary now established:
• school identity queries normalize school/district/city/state/year and require enough locality context to avoid ambiguous school-name guesses;
• provider responses preserve explicit none / candidates / invalid states;
• malformed candidates and duplicate candidate IDs fail closed;
• multiple matches remain multiple for explicit teacher selection instead of Arc guessing;
• a selected candidate can create only an unreviewed CalendarProposal; it does not write SchoolCalendar or browser persistence;
• official payload must match the selected candidate, remain district-source truth, retain provenance evidence, and include the selected official source locator;
• provider/network state stays outside canonical calendar state until the existing explicit review/commit boundary is crossed;
• contract fixtures use fixture:// locators only and are never wired into a teacher workspace.
Audit discipline:
• Intermediate red #1 was a new-slice compile integration error: the adapter used id instead of the established CalendarProposalDraft proposalId. Fixed by conforming to the existing API; no product bug opened.
• Intermediate red #2 was the contract runner correctly rejecting an unregistered new contract. The manifest was updated; no product bug opened.
• Final-head browser/a11y initially hit the known validation-focus timing assertion while this slice changed no UI. All neighboring browser/shell gates passed. The exact failed browser job was rerun without code changes and passed, confirming timing flake rather than product regression.
PHASE 3 STATUS: IN PROGRESS, NOT GREEN. School search against official sources remains UNPROVEN/unchecked: Arc now has a safe acquisition boundary, not a live official-source provider.
NEXT SLICE: implement a real official-source provider/search handoff that returns trustworthy school candidates or an honest no-result/error state, then feed selected source data into CalendarProposal review without direct commit or fabricated fallback.


32. PHASE 3 CHECKPOINT — LIVE NCES SCHOOL IDENTITY PROVIDER
Merged PR: #62 — Add live NCES school identity provider
Final tested head: e60a19e808ab50c7820f0d288b1efca8c9bf2d88
Develop merge commit: 196d3ce94ca1dc514a90976032221daab9a24bb3
Verification: live NCES identity run 33978586024 PASS; full Arc verify 33978585976 PASS; Phase 3 source-review 33978585983 PASS; independent Phase 2 RGAV 33978585961 PASS.


Live provider truth now established:
• Arc can query the official NCES Common Core of Data / EDGE public-school service and receive real school candidates with stable NCES school and agency identifiers.
• NCES identity is identity evidence only. It does not supply or authorize school-calendar dates, closures, early-release truth, or bell schedules.
• Search failures remain explicit none/invalid/network states and do not mutate canonical calendar state.
• Candidate text is normalized at the provider boundary; provider padding cannot leak into teacher-facing identity or matching behavior.
• The live proof used Oak Ridge High in Orlando: NCES school ID 120144001406, agency ID 1201440, NCES agency label Orange.
• BUG 011 was an audit-fixture false positive. Production provider behavior already trimmed returned text; the smoke matcher did not. No product-provider code changed to resolve it.
• Frozen Phase 1/2 and existing Phase 3 review regressions remain Green.


PHASE 3 STATUS: IN PROGRESS, NOT GREEN. The live official identity provider is proven, but School search against official sources remains unchecked until the teacher-facing progressive setup UI can submit a search, handle loading/none/error/multiple results, and explicitly select a candidate without writing calendar truth.


NEXT SLICE: teacher-facing school identity search + candidate selection handoff using the live NCES provider. Prove keyboard/a11y/reflow, honest zero/error/multiple states, explicit source labeling, and zero canonical calendar mutation after selection. Do not add district calendar dates in the same slice.


33. GIT RECONCILIATION CHECKPOINT — SEPTEMBER 5, 2026
Repository: waxandwing/arc-greenfield
Current implementation authority: develop @ 7ccca045be169aba765dafb35833f117b6120fef.
Open pull requests after cleanup: 0.


Closed as superseded/quarantined merge paths during this reconciliation:
• PR #48 — obsolete Next/Zustand app/ + lib/ founder-reconciliation architecture; 455 commits behind current develop. Preserve only as historical evidence/mining source.
• PR #59 — later-phase Vite founder-law/Day/Live shell reconciliation; useful ideas preserved for future phase-specific mining, but wholesale merge would violate current scaffold and frozen Phase 1/2 surfaces.
• PR #55 — superseded by merged PR #56 and final Phase 2 Green evidence.
• PR #44 — superseded by merged PR #45/#46/#47 navigation and shell fixes.
• PR #38 — obsolete audit-trigger PR with no intended merge path.
• PR #34 — deferred long-range/Fridge architecture; mine only when Phase 9/related scope opens.
• PR #40 — deferred Day Notes/Magnet placement work; mine only when capture/Day continuity scope opens.
• PR #41 — duplicate Git governance/status-ledger authority; current Drive Master + RGAV documents remain canonical.
• PR #32 — historical Shift/Undo pure-command refactor pattern; preserve as a future refactor mining source, not a stale merge candidate.


Cleanup rule established: closed/quarantined branches may be mined for individual proven ideas, contracts, or interaction rules only when their canonical phase arrives. Reimplementation must target current develop, use current domain/p34. PHASE 3 CHECKPOINT — TEACHER-FACING NCES SCHOOL IDENTITY SEARCH
Merged PR: #63 — Add teacher-facing NCES school identity search
Final tested head: f8c54826f1822abd83d9eef5689a72d3e866130e
Develop merge commit: 7ccca045be169aba765dafb35833f117b6120fef
Verification: teacher-facing school identity run 33982018444 PASS; live Chromium → NCES run 33982018491 PASS; Phase 3 source-review run 33982018423 PASS; independent Phase 2 RGAV run 33982018509 PASS; full Arc verify run 33982018498 PASS.
Exact visual evidence: 1280px teacher-facing school identity artifact from the same final head — PASS.


Teacher-facing official identity search now established:
• First-time calendar setup offers NCES school identity search before manual date entry.
• Search requires enough locality context to avoid ambiguous name-only guesses and preserves explicit invalid / none / candidates states.
• Multiple official matches remain multiple; the teacher explicitly chooses the school and Arc states that it will not guess.
• Candidate rows expose the NCES Common Core of Data / EDGE source label.
• Keyboard-only candidate selection is directly proven.
• Selecting a school identity writes no canonical calendar state and does not persist arc.calendar.v1.
• Provider rejection and zero-result states remain honest and non-mutating.
• Live Chromium successfully queried the real NCES endpoint and returned Oak Ridge High; the client-side provider architecture therefore has direct browser-origin evidence, not only Node/network evidence.
• 390px reflow, browser runtime cleanliness, full accessibility regression, frozen Phase 1/2 behavior, and source-backed calendar review all remain Green.
• Visual gate PASS: continuous editorial setup sheet, restrained ruled candidate rows, clear official-source hierarchy, generous whitespace, no dashboard/card-kit drift. The visible blue outline in the audited screenshot is the keyboard focus ring from the tested selection path.


Audit discipline:
• Intermediate PR #63 reds were harness defects: route interception, mocked CORS semantics, async test timing, a stale generic .primary-button locator, case-sensitive live NCES name matching, and a synthetic HTTP 503 that correctly produced a browser console network error. Harnesses were corrected; no product code was changed in response to those false failures and no structural product BUG was opened.


PHASE 3 STATUS: IN PROGRESS, NOT GREEN. Official school identity search is now teacher-facing and proven. Still open: school/district calendar-date acquisition feeding an unreviewed proposal, progressive non-blocking entry, early-release/bell-pattern review, PDF/CSV fallback, re-import diff, interrupted/malformed setup, final UI polish, and Phase 3 RGAV ×2.


NEXT SLICE: selected school identity → trustworthy official school/district calendar-date acquisition → existing CalendarProposal review boundary. Do not write SchoolCalendar directly, do not fabricate missing dates, and do not broaden this slice into progressive entry.


ersistence truth, and rerun current contracts/rendered RGAV. Closed historical branches are never silently revived or merged wholesale beca35. PHASE 3 CHECKPOINT — SCHOOL IDENTITY / CALENDAR-SOURCE SEPARATION
Merged PR: #65 — Separate official school identity from calendar-date sources
Final tested head: d9752acf35b55ad32b6393b37a56a2750364e790
Develop merge commit: 7ccca045be169aba765dafb35833f117b6120fef
Verification: full Arc verify 33982438004 PASS; Phase 2 independent RGAV 33982438027 PASS; Phase 3 source review 33982438270 PASS; teacher-facing school identity 33982438010 PASS; Node live NCES identity 33982438000 PASS; live Chromium NCES 33982438309 PASS.


Boundary now established:
• Official school identity candidate answers only “which school.”
• Official calendar-source candidate separately answers “which official page/document is authorized to tell Arc dates.”
• Calendar-source candidates require explicit school-candidate ownership, publisher, source kind, confidence, and a teacher-usable HTTP(S) locator.
• Missing trustworthy calendar source remains an explicit no-result state; Arc states that no dates were created.
• Multiple calendar sources remain multiple rather than being guessed/auto-selected.
• Calendar proposal construction fails closed unless selected school candidate, selected calendar source, payload school id, payload source id, district-source truth, and provenance locator all agree.
• NCES school-detail URL cannot masquerade as calendar-date provenance. Date provenance must point to the actual selected district/school calendar page or document.
• No SchoolCalendar write, browser persistence, fabricated dates, progressive-entry change, or UI behavior change occurred in this slice.


Research constraint confirmed from current NCES public layers: NCES supplies stable school/district identity but does not expose a trustworthy current district calendar URL. Arc therefore may not synthesize a district website/calendar locator from NCES identity alone.


PHASE 3 STATUS: IN PROGRESS, NOT GREEN. Next open problem is trustworthy official calendar-source discovery/acquisition. If a general live discovery provider cannot prove publisher/source ownership without search-engine guessing, Arc must return an honest source-not-found/import-needed state and use PDF/CSV/manual fallback rather than fabricate date truth.


NEXT SLICE: selected school identity → trustworthy official calendar-source candidate(s) or explicit no-source/import-needed state → provider-specific date acquisition → existing unreviewed CalendarProposal review boundary. Keep progressive entry separate.


use they look more complete.


36. PHASE 3 CHECKPOINT — TEACHER-CONFIRMED OFFICIAL CALENDAR SOURCE HANDOFF
Merged PR: #66 — Add teacher-confirmed official calendar source handoff
Final tested head: 61ac652f2d3c1b5a7222d1aa7719f8ef15d2afb7
Develop merge commit: ca35808afbf0a8fd14a9474ee370fba63d4e4625
Verification: Arc verify 33988557409 PASS; live Chromium NCES 33988557450 PASS; official calendar source handoff 33988557426 PASS; school identity search 33988557414 PASS; source calendar review 33988557415 PASS; Phase 2 independent RGAV 33988557401 PASS; NCES live identity smoke 33988557404 PASS.
Exact visual evidence: 1280px official-calendar-source handoff artifact from the same final head — PASS.
Teacher-facing source handoff now established:
• After explicit NCES school selection, the teacher may provide an official school/district calendar page or document URL, publisher, human-readable label, and source type.
• Arc requires explicit teacher confirmation that the source is published by the selected school or its district before it will hold the source candidate.
• Only public HTTP(S) locators are accepted; fragments are normalized away and malformed/non-web schemes fail closed.
• The held source remains tied to the selected school identity and is not treated as school-calendar truth by itself.
• Holding the source does not fetch the source, parse dates, persist arc.calendar.v1, write SchoolCalendar, create an OfficialCalendarPayload, or fabricate any date.
• Editing source details invalidates the previously held source candidate rather than silently retaining stale provenance.
• Keyboard operation, 390px reflow, zero horizontal overflow, no source fetch, zero calendar persistence, and browser runtime cleanliness are directly proven.
• Visual gate PASS: the source handoff continues the same editorial setup sheet, preserves generous whitespace and source hierarchy, and avoids dashboard/card-kit drift.
Audit discipline:
• Two intermediate PR #66 reds were harness locator defects only: a loose Published by label matched the confirmation checkbox, then an over-strict Source type label lookup missed the select’s actual accessible name. Product code was not changed for either false failure and no structural product BUG was opened.
PHASE 3 STATUS: IN PROGRESS, NOT GREEN. School identity → teacher-confirmed official calendar source is now proven. Date extraction from that source remains unbuilt, as do progressive non-blocking entry, early-release/bell-pattern review, PDF/CSV fallback, re-import diff, interrupted/malformed setup, final UI polish, and Phase 3 RGAV ×2.
NEXT SLICE: teacher-confirmed official calendar source → supported source fetch/parser → OfficialCalendarPayload with retained source provenance → existing unreviewed CalendarProposal review boundary. No direct SchoolCalendar commit and no fabricated fallback dates.


37. PHASE 3 CHECKPOINT — STRICT OFFICIAL CALENDAR DATE ACQUISITION BOUNDARY
Merged PR: #67 — Add strict official calendar date acquisition boundary
Final tested head: 08af08daede9b116afdbef7274bff9e97b9182c6
Develop merge commit: e50b6856aab2cab5d457ad6d03cefc75cb118b94
Verification: Arc verify 33989252342 PASS; Phase 2 independent RGAV 33989252351 PASS; Phase 3 source calendar review 33989252335 PASS; Phase 3 school identity search 33989252336 PASS; Phase 3 official calendar source handoff 33989252347 PASS; live Chromium NCES 33989252333 PASS.
Domain/acquisition boundary now established:
• A teacher-confirmed official calendar source may be passed only to a source-supporting extraction adapter; mismatched school/source ownership blocks extraction before the adapter runs.
• Unsupported source types return an explicit unsupported/no-dates-created state and the adapter is not called.
• Extractor/network failure returns an explicit invalid/no-dates-created state; malformed extracted data fails closed after extraction.
• Structured extraction must match the teacher-confirmed source locator and publisher and retain that actual calendar source as provenance.
• Explicit First Day of School and Last Day of School are required. Invalid dates, reversed ranges, duplicate/missing bounds, and overlapping non-instructional evidence fail closed.
• The regular Monday–Friday pattern is retained as district-source but Mixed confidence because that weekday pattern is inferred from the source structure rather than explicitly stated day-by-day.
• Explicit source statements for breaks, holidays, school closures, and teacher/professional workdays become Confirmed exceptions only within the student school-year bounds.
• Complete marking-period evidence may produce four quarter boundaries; incomplete term evidence produces no partial/fabricated terms. Semester boundaries require complete quarter truth plus an explicit second-semester start.
• The OCPS-style 2026–27 table contract directly proves Aug 11 first day, May 26 last day, Thanksgiving/Winter/Spring break handling, workday/holiday exceptions, quarter/semester boundaries, provenance, and Mixed pattern confidence.
• Valid acquisition produces OfficialCalendarPayload only. It then reaches the existing unreviewed CalendarProposal boundary; no proposal review, SchoolCalendar write, browser persistence, or direct commit occurs in this slice.
• No UI changed, so no new visual gate was required.
Audit discipline:
• Intermediate PR #67 reds were contract-harness compile errors only: top-level await unsupported by the contract compiler, closure narrowing in the test, and a Node-specific process reference unavailable in the contract TS environment. Production acquisition logic was not changed for these harness defects and no structural product BUG was opened.
PHASE 3 STATUS: IN PROGRESS, NOT GREEN. Trustworthy date semantics and the extraction adapter boundary exist, but Arc still does not have a proven production extractor/fetch route for arbitrary teacher-confirmed official calendar documents/pages. Progressive entry, early-release/bell-pattern review, PDF/CSV fallback, re-import diff, interrupted/malformed setup, final UI polish, and Phase 3 RGAV ×2 remain open.
NEXT SLICE completed by PR #68. Continue with teacher-facing Read dates → server extraction → OfficialCalendarPayload → unreviewed CalendarProposal → explicit review. No direct SchoolCalendar commit, no fabricated dates, and no arbitrary-source proxy.


38. PHASE 3 CHECKPOINT — SERVER-SIDE OFFICIAL CALENDAR EXTRACTION
Merged PR: #68 — Add server-side official calendar extraction boundary
Final tested head: 572e00d43ac3502699a653f18cdf67944856bd56
Develop merge commit: 59b0f8e437ce0a1be5f31e1c3961fa092604bd1e
Verification: full Arc verify PASS; Phase 2 independent RGAV PASS; Phase 3 source handoff PASS; school identity PASS; source review PASS; live Chromium NCES PASS; live OCPS PDF text extraction PASS; live Supabase Edge Function extraction smoke PASS.
Architecture evidence:
• The current official OCPS 2026–27 calendar is https://www.ocps.net/110680_3.
• Server-side retrieval returns a 90,944-byte PDF beginning %PDF-; direct Arc-origin Chromium retrieval is blocked by explicit CORS policy. Direct browser PDF parsing is therefore not a trustworthy production path.
• Arc now uses a narrow server-side extraction boundary rather than reviving the retired Next/Supabase application architecture.
• Supabase Edge Function official-calendar-source-text is active with JWT verification and can fetch only the confirmed OCPS 2026–27 calendar source; arbitrary external URLs are rejected before fetch.
• The function enforces POST-only retrieval, timeout, PDF size/magic/page/text limits, returns extracted text only, performs no DB write, and never returns the raw PDF.
• Arc’s canonical OCPS parser, not the server, owns calendar semantics. It reads explicit authoritative school-calendar statements only and deliberately excludes the severe-weather make-up priority table from current calendar truth.
• The plain-fetch client adapter feeds the existing OfficialCalendarExtractionAdapter → OfficialCalendarPayload boundary. No Supabase frontend SDK or parallel calendar store was introduced.
• No SchoolCalendar write, browser persistence, review commit, or UI behavior change occurs in this slice.
PHASE 3 STATUS: IN PROGRESS, NOT GREEN. Arc can now read one proven official district calendar end-to-end through a safe server boundary, but the teacher-facing setup UI still does not invoke extraction or present the resulting unreviewed proposal/review path. Progressive entry, early-release/bell patterns, PDF/CSV fallback, re-import diff, interrupted/malformed setup, final UI polish, and Phase 3 RGAV ×2 remain open.
NEXT SLICE: selected school + held official OCPS source → teacher-facing Read dates → server extraction → OfficialCalendarPayload → unreviewed CalendarProposal → miniature review → explicit review/commit only. No direct calendar persistence before review.


No Vercel deployment occurred or is authorized.


39. PHASE 3 CHECKPOINT — TEACHER-FACING READ DATES → PROPOSAL REVIEW/COMMIT
Merged PR: #69 — Connect official calendar dates to proposal review
Final tested head: 9d437641fa4d1b3018c105ab34c8d9e357fdba8c
Develop merge commit: c72976ca3a0919cedbdeb4d4dc7896ac30678614
Verification on the exact final head: push-triggered Arc verify 34004511127 PASS; live Chromium NCES 34004511112 PASS; official calendar source handoff 34004511117 PASS; source calendar review 34004511134 PASS; school identity search 34004511121 PASS; Read dates proposal review 34004511139 PASS. PR-triggered same-head matrix also PASS: Arc verify 34032146508; source review 34032146511; source handoff 34032146516; Read dates proposal review 34032146514; live Chromium NCES 34032146519; Phase 2 independent RGAV 34032146528; school identity search 34032146506.
Exact visual evidence: 1280px Read dates proposal-review artifact from the same final head — PASS.
Teacher-facing first-time source-backed acquisition now established:
• Selected NCES school + teacher-confirmed official OCPS source can invoke Read dates through the narrow server extraction adapter.
• Unsupported sources fail closed before extraction; supported source extraction retains school/source ownership, publisher, locator provenance, and Mixed confidence.
• Reading dates creates only an unreviewed CalendarProposal in local component state. It does not write SchoolCalendar or arc.calendar.v1.
• Proposal review presents the miniature Monday-first Arc calendar and source evidence before consequential commit.
• Use this calendar remains disabled until the teacher explicitly confirms “I reviewed these dates.” Review itself still does not persist; the separate commit action writes canonical calendar truth.
• The committed source-backed first/last dates, district-source pattern, Mixed confidence, and provenance survive reload.
• Editing the held source invalidates stale held/proposal state; interrupted/stale reads are discarded rather than silently applied.
• Holding a source alone still performs zero extraction and zero calendar persistence.
• No arbitrary-source proxy, fabricated fallback dates, or parallel calendar store was introduced.
Visual gate PASS: one continuous editorial setup sheet; clear school → source → Read dates → proposal → miniature calendar → review → commit hierarchy; provenance legible; calendar review subordinate; no dashboard/card-kit/glass/fake-desk drift.
Audit discipline:
• Intermediate reds were harness/config-boundary defects only: Vite runtime env was moved out of the canonical calendar domain into the app boundary; stale Hold-source copy expectation was corrected to the invariant; fake cross-origin/CORS route assumptions were corrected; and the persistence assertion was aligned to the canonical storage envelope. No structural product BUG was opened from these failures.
PHASE 3 STATUS: IN PROGRESS, NOT GREEN. First-time official school identity → official source → safe server extraction → unreviewed proposal → miniature review → explicit review/commit is now proven. Still open: progressive non-blocking/resumable entry, early-release/bell-pattern review, PDF/CSV fallback, re-import diff, Courses/Sections after calendar entry, broader malformed/interrupted setup coverage, final UI polish, and Phase 3 RGAV ×2.
NEXT SLICE: progressive non-blocking/resumable setup. Prove the teacher can enter the real Arc calendar before setup completion, dismiss/resume contextual setup without losing progress, and safely explore non-consequential calendar UI. Keep Fridge, early-release/bell schedules, and Courses/Sections out of this slice.
No Vercel deployment occurred or is authorized.


40. COO CONTROL CHECKPOINT — SEPTEMBER 6, 2026


Founder direction changes the immediate execution order because current UI review exposed material hierarchy/layering regressions in the Week reference surface. This is a controlled regression response, not a wholesale reopening of prior Green work.


CURRENT OPERATING DECISION
• Temporarily freeze Phase 3 feature expansion after the already-merged PR #69 foundation.
• Reopen only the affected Week/reference-implementation surface needed to reconcile current UI + UX + frontend structure against canonical laws.
• Do not reopen Phase 1/2 domain semantics that remain proven unless the Week reconciliation exposes an actual integration regression.
• No Vercel deployment.


COO GREEN-GATE SEQUENCE
G1 — Canonical Desktop Week reference implementation.
G2 — Interaction truth wired to that reference implementation.
G3 — Persistence/schema reconciliation.
G4 — Supabase/auth save → reload → sign-back-in + two-account isolation.
G5 — Resume Phase 3 backend/setup services through guarded proposal/review boundaries.
G6 — Expand/reference other calendar views from shared object rules.


G1 PASS CONDITIONS
• Calendar remains structural and visual center.
• No persistent left rail.
• Class → Unit → Lesson hierarchy is visually and structurally unambiguous.
• Multi-day Units render as continuous spanning objects/bars rather than repeated disconnected day objects.
• Lessons remain subordinate to Unit relationships.
• Notes remain lightweight square/post-it-like teacher objects and preserve freeform/column-capable note use.
• Furniture never accidentally owns, covers, clips, or nests calendar content.
• Closed furniture produces no phantom/dead structural whitespace.
• z-index/layer ownership passes direct rendered audit: no behind-content defects, clipping, duplicates, baked-looking layers, or asset collisions.
• UI and UX are reviewed together: visual hierarchy must communicate the same interaction/domain hierarchy implemented in code.
• Any discrepancy is logged before further work in the affected area.
• Two independent Green-equivalent audits are required after the final material G1 change.


CROSS-FUNCTIONAL CONTROL RULE
UI, UX, frontend, domain, backend, and persistence may not independently reinterpret an object or surface. Every material change is checked for interaction consequence, structural/component consequence, data-model consequence, accessibility consequence, and cross-view consequence. A visually attractive change is Red if it misstates product truth. A functionally correct change is Red if the interface teaches the wrong hierarchy.


GIT CONTROL
• Governance branch opened: ops/coo-green-gate-program.
• GitHub Issue #70 is the G1 Canonical Desktop Week gate.
• GitHub Issue #71 is the UI/UX discrepancy register and merge gate.
• Main remains protected from scratch work; implementation authority must be explicitly reconciled before any merge from this COO branch.


EXIT FROM CONTROLLED REOPEN
Return to Phase 3 progressive setup only when the Week reference implementation is Green and the UI/UX/front-end hierarchy is again safe to reuse.


40. COO BATCH EXECUTION SPINE — SEPTEMBER 6, 2026


Operating rule: implementation proceeds in numbered coherent batches, not isolated one-off tasks, except during audits, urgent Red regressions, safety/data-integrity fixes, or narrowly isolated defects where batching reduces reliability. A batch is closed only after its acceptance criteria, neighboring regressions, and visual/runtime evidence are complete.


B01 — WEEK SHELL + SPATIAL OWNERSHIP
Outcome: one indisputable canonical desktop Week composition.
Includes: calendar dimensions/dominance; no permanent left rail; planner/environment separation; view tabs; outer-edge furniture boundaries; open/closed furniture geometry; no phantom whitespace; no accidental overlay; z-index/layer ownership; no clipped/hidden/duplicate/baked-looking layers; small-laptop baseline.
Green exit: exact rendered Week artifact passes UI + UX + structural hierarchy review twice.


B02 — WEEK PLANNING OBJECT HIERARCHY
Outcome: canonical visual/object grammar inside Week.
Includes: Class/Section context; Unit span treatment across multiple days; Lesson subordination/nesting; multiple Lessons/day; Note/Idea paper-object behavior; source-backed non-plan events/optional After School placement; red Important mark semantics; no generic card/form drift.
Green exit: every visible object communicates its actual canonical relationship and no object type is visually mistaken for another.


B03 — OBJECT SELECTION + CONTEXTUAL ACTIONS
Outcome: object manipulation feels direct, physical, and predictable.
Includes: select/focus states; contextual pop-up toolbar; Move; Shift; Copy; Delete; Unplace/Put in Drawer where valid; range edits/resize; object-specific guards; dependency-safe destructive actions; stable identity/history; no ambiguous Remove semantics.
Green exit: teacher can understand and execute all primary object actions without hidden state or semantic contradiction.


B04 — CREATION + QUICK-ADD FLOWS
Outcome: adding work from the calendar is fast and low-friction.
Includes: click-in-calendar creation; Unit/Lesson/Note creation; minimum-required commitment; Full Edit path; multi-day range creation; same-day multiple Lesson support; class/course targeting; no unnecessary text-field/admin-form treatment.
Green exit: core creation can be completed quickly from the real planner surface with no duplicate truth store.


B05 — FURNITURE + TASK BAR COMPOSITION
Outcome: supporting surfaces behave like Arc furniture, not dashboards.
Includes: Fridge Door geometry; Drawer relationship; Task Bar Must/Should/Could; open/closed states; no calendar squeeze/reflow; no dead whitespace; Clean Up semantics; settings/help utility drawer boundaries; copyright/brand utility placement where specified; red-circle task emphasis.
Green exit: furniture supports work while the calendar remains visually and structurally dominant in every state.


B06 — ACCESSIBILITY + RESPONSIVE INTERFACE HARDENING
Outcome: the canonical interface remains usable when tired, zoomed, keyboard-only, touch-operated, or on a small laptop.
Includes: keyboard/non-drag parity; focus order; labels/regions; WCAG AA essential copy/controls; 200–400% zoom/reflow; 1280×720 and narrow-width stress; 44px touch targets where relevant; reduced motion; no color-only meaning; overflow/clipping audit.
Green exit: interface batch passes direct accessibility/browser evidence without changing canonical visual hierarchy.


B07 — INTERACTION ENGINE RECONCILIATION
Outcome: visible Week behavior and underlying model mean the same thing.
Includes: create/edit/move/unplace/delete contracts; Unit/Lesson range truth; Section divergence; fixed anchors; Undo; recovery hooks; state transitions; neighboring object protection; cross-view mutation truth; regression coverage for all current Week actions.
Green exit: no UI-local behavior contradicts canonical domain state; original + neighboring + historical regressions pass.


B08 — PERSISTENCE + AUTHENTICATED STATE INTEGRITY
Outcome: Arc reliably holds the teacher’s place.
Includes: one persistence layer for teacher/account, school/calendar, Course/Section, Unit, Lesson, Note/Magnet, ranges, furniture state, settings, history/Undo; save/reload; sign-out/sign-in continuity; two-account isolation; destructive-path safety; Supabase/auth boundary as appropriate.
Green exit: create → save → reload → sign back in returns exact canonical state; account isolation passes.


B09 — PROGRESSIVE SETUP + SCHOOL TRUTH
Outcome: setup helps without blocking Arc or fabricating truth.
Includes: enter Arc before setup completion; dismiss/resume exact context; NCES school identity; official source handoff; Read dates; server extraction; unreviewed proposal; miniature Monday-first review; explicit commit; early-release/bell-pattern review; PDF/CSV fallback; malformed/interrupted states; re-import diff; Courses/Sections sequencing.
Green exit: setup is source-backed, non-blocking, resumable, accessible, reload-safe, and passes RGAV ×2.


B10 — FRIDGE + CAPTURE WORKFLOW
Outcome: capture → arrange → schedule works as one coherent physical system.
Includes: finite Fridge Door; Drawer overflow; Idea/Resource/Reminder; Voice placeholder boundaries where applicable; stacking without semantic mutation; lightweight scheduling; Move/Schedule parity; Clean Up; Take a Look Around; Locate/Find foundation; deeper data retained when objects move to shallower surfaces.
Green exit: capture never becomes a second planner and no movement loses object identity/deeper data.


B11 — DAY + RECOVERY + LIVE TEACHING CONTINUITY
Outcome: Arc holds continuity from planning through disruption and teaching.
Includes: Day Section hierarchy; carryover; planned vs actual taught date; partial/missed/completed/skipped states; Recovery preview/apply/undo; fixed anchors; Section isolation; same-day collision behavior; Catch-Up Review; Day → Live Classroom eligibility; candidate chooser; exact Section + Lesson; Complete/Stop here/Skip/Leave; exact return to origin.
Green exit: planning → disruption/recovery → teaching → writeback remains one reliable, reload-safe loop.


B12 — CROSS-VIEW EXPANSION + RELEASE FINISHING
Outcome: all horizons project one truth without reinventing Arc.
Includes: Month; Quarter; Semester; Year Map; Day/Week/Month consistency; Unit span continuity; Monday-first Year Map rules; Personal lane; Daily Board visibility projection; dark mode; performance/stress; final brand polish; human beta preparation; two independent final Green audits.
Green exit: beta/release candidate; no Red discrepancy, no view-specific truth store, no unresolved structural regression.


Batch dependency rule: B01 → B02 → B03/B04 → B05/B06 → B07 → B08 → B09 → B10 → B11 → B12. B03 and B04 may be executed as one combined interaction batch when they touch the same objects; B05 and B06 may be hardened together after composition stabilizes. Audits run continuously but do not count as implementation batches.


Current active batch: B08 — PERSISTENCE + AUTHENTICATED STATE INTEGRITY. B01 — WEEK SHELL + SPATIAL OWNERSHIP is GREEN and frozen. B02 — WEEK PLANNING OBJECT HIERARCHY is GREEN and frozen. Combined B03/B04 — OBJECT SELECTION + CONTEXTUAL ACTIONS + CURRENT-OBJECT QUICK-ADD is GREEN and frozen. Combined B05/B06 — FURNITURE + TASK BAR COMPOSITION + ACCESSIBILITY/RESPONSIVE HARDENING is GREEN and frozen. B07 — INTERACTION ENGINE RECONCILIATION is GREEN and frozen at final tested feature head 347a40d3f809da1df27ed44f7ce918a27b322503, merged through PR #97 to protected develop as 224e66a6a93447ea1930c5806c47b70e4c866ac1. Exact-head primary + independent B07 browser audits, the full frozen regression matrix, and post-merge protected develop verification all passed. Per the dependency rule, B08 now owns persistence + authenticated state integrity. Keep B01–B07 frozen; do not broaden into B09 progressive setup, B10 capture, B11 teaching continuity, B12 release finishing, or deployment.


41. B02 GREEN CHECKPOINT — SEPTEMBER 7, 2026


Merged PR: #82 — B02 canonical Week planning object grammar.
Final material tested head: df10c927b57535b1ed33e48771aaaab7a96ab328.
Develop merge commit: 88eb20b961647aa92d5ef9a98e65504e9ca8134d.


B02 exit evidence satisfied:
• Course/Section → Unit → Lesson hierarchy is explicit in Week.
• Multi-day Unit remains one continuous span; Lessons retain subordinate parent-Unit identity.
• Multiple same-day Lessons remain distinct stable objects.
• Note/Idea uses an independent lightweight paper-object language; primary copy is 16px and secondary provenance metadata is 14px.
• After School/non-plan content is spatially and semantically separate from curriculum placement.
• Important is an explicit semantic state with the canonical hand-drawn terracotta/red circle and non-color accessibility meaning; edge containment is regression-gated.
• Rendered B02 evidence covers two Sections, 1440 desktop, and 1280×720 small-laptop.
• Primary and independent B02 Green-equivalent rendered audits passed after the final material change.
• Arc verify, frozen B01 furniture, Phase 2 independent RGAV, and all neighboring Phase 3 source/school gates passed on the exact final PR head.
• Post-merge develop verification completed all six push workflows successfully with zero failures and zero cancellations.
• No Vercel, main, or production deployment occurred.
42. B03/B04 GREEN CHECKPOINT — SEPTEMBER 7, 2026
Merged PR: #92 — complete Week object interaction + quick-add actions.
Final exact tested head: 62b3dd0082b039a4818d6a75523c3dac55a787a1.
Develop merge commit: cdf5ba43c403a6695258a8f1c23ab5a22240af4d.
Green evidence: B03/B04 primary interaction PASS; independent adversarial PASS; stress PASS; B01 furniture PASS; B02 object grammar PASS; Arc verify PASS; Phase 2 independent RGAV PASS; neighboring Phase 3 source/search/date gates PASS. Direct 1440, 1280×720, stress, and independent rendered artifacts were visually reviewed. Contextual controls no longer cover neighboring Week objects, the multi-day Unit remains continuous, focus returns to persistent origin controls on dismissal/mutation lifecycle, and save/reload/Shift/Undo/quick-add truth remains intact.
Repeat audit: after first Green, the exact same B03/B04 content was rerun. Primary, independent, and stress all passed again with no intervening material product change.
Deployment discipline: GitHub CI only for the repeat audit; vercel.json retains git.deploymentEnabled=false and no manual Vercel deployment was used.
B03/B04 STATUS: GREEN / MERGED / FROZEN. NEXT: combined B05/B06.






B02 STATUS: GREEN. Freeze B02 except for regressions exposed by downstream integration.
NEXT: combined B05/B06 — FURNITURE + TASK BAR COMPOSITION + ACCESSIBILITY/RESPONSIVE HARDENING. Preserve B01–B04 Green ownership. During B05/B06, Settings remains edge furniture; view/display/accessibility preferences consolidate under Settings → View Options, while keyboard/touch/zoom compliance remain built-in capabilities rather than opt-out toggles. Preserve only a dormant workspace-tool extension slot architecturally; do not surface retired Easel terminology or empty “Coming Soon” furniture. Do not broaden into B07/B08/B09 or deployment.


43. TOTAL TRUTH RECONCILIATION — SEPTEMBER 7, 2026


Authority/checklist interpretation
• The September 6 COO B01–B12 batch execution spine and later explicit Green checkpoints are the current implementation-status authority. Earlier macro PHASE 3/4/5 checklist blocks remain roadmap/history and must not be interpreted as current Red when a later batch/checkpoint directly proves the same capability Green. Unchecked legacy lines remain future scope only where the newer batch spine or current next-action text still leaves them open.
• B01, B02, and combined B03/B04 remain Green/frozen except for demonstrated integration regressions. Combined B05/B06 remains the active slice until its final exact-head evidence and merge/post-merge verification are complete.
• Current B05/B06 branch authority is design/b05-b06-furniture-taskbar-hardening. Exact candidate SHA must be re-read from Git before any Green/merge decision because every material change resets RGAV evidence.


Architecture reconciliation
• Task Bar uses canonical PlanningWorkspace Notes. It does not own a parallel task store. Must/Should/Could is priority state on canonical Notes; Unit/Lesson/Magnet kinds do not silently become Task Bar records.
• Settings remains left-edge furniture. Current implemented View Options are intentionally lean; mandatory keyboard/touch/zoom/reflow/contrast support are product capabilities, not optional settings toggles.
• A dormant Live Classroom architecture seam is permitted from Day only. The handoff carries exact date + Course + Section + Lesson identity. No current provider activates it, so no empty Live Classroom/Easel button, tab, furniture, or fake teaching surface appears. Eligibility, candidate choice, teaching outcomes, and writeback remain B11 scope.
• Live Classroom is the canonical current user-facing teaching-surface name. “Easel” is legacy/historical terminology only. Legacy internal filenames/contracts may remain until the dedicated Live Classroom migration batch if renaming them would broaden an unrelated Green slice.
• One visual token owner remains a structural requirement. B05 furniture surface colors are now semantic tokens owned in tokens.css; their visual values were preserved rather than re-art-directed during reconciliation.


Truth-document reconciliation completed in this audit
• ARC — Canonical Brand System & Construction Rules: corrected the contradictory Rule 7 heading from “Easel” to “Live Classroom.”
• ARC — Desktop Interaction Blueprint — Canonical Handoff: appended a current-authority reconciliation covering Task Bar Notes-only semantics, current branch/status authority, Settings → View Options, Live Classroom naming/handoff, rendered-target accessibility interpretation, and no-deployment discipline. Historical branch/status prose remains evidence only.
• docs/CLASSROOM_NAMING.md: aligned to Live Classroom as the current UI term, Classroom as descriptive family shorthand only, and Easel as legacy migration language.
• Product Spec remains deep behavioral/domain evidence rather than the day-to-day queue, per Section 13. Historical section numbering, old “next gate” statements, and archived setup language do not override this Master or later explicit Green checkpoints.


Audit discrepancies resolved without relaxing product law
• B01 audit harnesses still searched for the retired furniture label “Tasks.” They now use the canonical “Task Bar” label; geometry, non-overlap, focus, Escape, 44 px, and reduced-motion assertions remain intact.
• B06 narrow-layout audit counted a hidden native select descendant with a 0 px box as a touch target. The audit now measures rendered interactive targets only; every visible relevant target still must meet the 44 px floor.
• Settings select controls and the full clickable weekend-option label have an explicit 44 px minimum target. The checkbox glyph itself is not artificially enlarged.
• Task text normalization is canonical at creation and rename, preserving Note identity and one Task Bar domain behavior.


Final Green gate for B05/B06
• Do not mark B05/B06 Green from documentation reconciliation alone.
• Required on one final unchanged exact head: contracts + typecheck + production bundle; B01; B02; B03/B04; Arc verify; Phase 2 independent RGAV; neighboring Phase 3 gates; B05/B06 primary rendered audit; B05/B06 independent rendered audit; 1440/1280×720/narrow/200–400% evidence; runtime cleanliness; canonical persistence; Clean Up; focus; touch targets; geometry invariance; no frozen-slice regression.
• The primary and independent B05/B06 audits must both pass after the final material change. Any new material change resets the count.
• No Vercel, main, or production deployment is authorized by Green CI or this reconciliation.


44. B05/B06 GREEN CHECKPOINT — SEPTEMBER 7, 2026


Final audited candidate: af941d54a34027bef024addeb3e3dd8cfb2cd835.
Merged PR: #95 — B05/B06: compose furniture + Task Bar and harden interface.
Protected develop merge commit: 4f9a00ab53e60f0ba9732662e27fde2c93afe106.
Audited candidate and merge commit resolve to identical source tree d3ff565fc41397045775fcf1c761fd7524c100e8.


Green evidence satisfied:
• Exact final candidate passed B01 canonical furniture, B02 Week object grammar, B03/B04 Week interaction, B05/B06, Arc verify, Phase 2 independent RGAV, and all neighboring Phase 3 school/source/date gates on the same unchanged head.
• Dedicated B05/B06 run 34149998174 passed both primary and independent rendered audits, then both jobs passed again unchanged after the last material source change.
• Primary rendered artifact 10029041978 digest sha256:0662beb187464f5a384747a5c57a34da86dcc32ffcd9bfbc178422c635c7e35e; independent artifact 10029041303 digest sha256:b6d87f3fce9d11a42a4bb80cb0cd28badfdeb2dd6122ec7be0cb53d79c1c402e.
• Direct visual review covered populated/all-open 1440, all-open 1280×720, alternate 1366, and 390×844 narrow furniture reflow. Calendar geometry remained invariant and furniture remained exterior to the calendar.
• Arc verify browser accessibility evidence explicitly passed 200%/400% zoom stress, 320/390 reflow, 44 px touch targets, reduced motion, overflow, keyboard/focus behavior, and runtime-error checks.
• Post-merge protected develop push verification run 34150472165 completed successfully on 4f9a00ab53e60f0ba9732662e27fde2c93afe106.
• Issue #94 is closed completed. BUG 013, BUG 014, and BUG 015 are resolved and frozen unless a downstream integration regression reproduces them.


Final reconciled architecture:
• Task Bar is Must/Should/Could priority state on canonical PlanningWorkspace Notes and owns no parallel task persistence store.
• Clean Up collapses furniture and restores calendar focus without mutating canonical planning truth.
• Settings remains left-edge furniture with current View Options intentionally lean; accessibility support remains built-in capability rather than opt-out preferences.
• Furniture colors are owned by canonical semantic tokens in tokens.css; the reconciliation preserved the already-approved visual values.
• Day preserves only a dormant optional Live Classroom extension seam carrying exact date + Course + Section + Lesson identity. No provider activates it in B05/B06, therefore there is no empty button, tab, furniture, or fake teaching surface.
• Live Classroom is the current user-facing teaching-surface term. Easel is legacy/historical terminology only.


Truth-document reconciliation completed:
• Master current-next-action and active-batch language now point to B07 rather than stale B05/B06 work.
• Brand System Rule 7 uses Live Classroom.
• Desktop Interaction Blueprint has a current-authority reconciliation layer.
• docs/CLASSROOM_NAMING.md uses Live Classroom for current UI language and marks Easel legacy.
• Product Spec remains deep behavioral/domain evidence; historical delivery-order statements do not override later Master checkpoints.
• Historical macro Phase 3/4/5 checklists remain roadmap/evidence; the September 6 B01–B12 execution spine plus later explicit Green checkpoints govern current implementation status.


Deployment discipline:
• Active repository source retains vercel.json git.deploymentEnabled=false.
• The Vercel preview project remains live=false and no B05/B06 reconciliation or merge commit produced a new deployment.
• No Vercel, main, or production deployment occurred or is authorized by this checkpoint.


B05/B06 STATUS: GREEN / MERGED / FROZEN.
CURRENT IMPLEMENTATION AUTHORITY: protected develop @ 4f9a00ab53e60f0ba9732662e27fde2c93afe106.
NEXT AUTHORIZED BATCH: B07 — INTERACTION ENGINE RECONCILIATION. Keep B01–B06 frozen except for demonstrated integration regressions. Do not broaden into B08+ or deployment.


45. GOVERNANCE + REPOSITORY CLEANUP CHECKPOINT — SEPTEMBER 7, 2026


Repository authority cleanup completed before B07 material implementation work.


• Stale open production PR #86 was closed as superseded. It targeted an older release/main lineage and is not promotion authority. No merge, Vercel deployment, main change, or production publication occurred.
• Repository README authority drift was corrected on active B07 branch reconcile/b07-interaction-engine in commit 14441616850bb10fdc262feac5edf30d723575ea. README now places this Master first, records B01–B06 Green/frozen, identifies B07/#96 as active, treats Live Classroom as the future teaching surface, and preserves the no-deployment rule.
• Stale open Easel issues #3/#4/#5/#6/#9/#10/#11/#12 were closed not-planned and explicitly marked superseded by the current Live Classroom architecture. Their durable ideas may be mined only when B11 opens; old Easel implementation/deployment assumptions are not current authority.
• Conflicting pre-B01/B05 UI authorities were retired: #20, #23, #25, #26, #33, and #42 are closed historical/superseded. In particular, old calendar reflow/compress furniture rules and the separate Priority-object model may not override frozen B01 geometry or canonical Note-backed Task Bar truth.
• Completed/superseded Green-gate issues were reconciled: #70 closed completed; #72 and #15 closed as superseded/moved into active B07 issue #96; old branch-cleanup issue #8 consolidated into historical-mining #37 plus approved-prune #78.
• Remaining open issue roles are now explicit: #96 active B07; #71 discrepancy register; #37 historical mining ledger; #78 approved branch-prune list pending physical ref deletion; #73 B08 input; #27 B09 input; #74 future-batch input; #30 legacy hardening backlog only.
• Issue #73 no longer depends on retired #72 and is explicitly future B08 input after B07 Green. Issue #74 no longer represents the old G5/G6 execution order; future batches are controlled by this Master. Issue #27 and #30 are not current implementation authority.
• Live branch inventory confirmed many #78-approved prune refs still physically exist. Checked boxes in #78 mean approved for deletion, not deletion completed. Current available repository tooling in this steward session does not expose Git ref deletion; no branch was falsely reported removed. Physical prune remains pending until a supported delete-ref path is available and each target is rechecked for newer commits.
• Keep main, develop, reconcile/b07-interaction-engine, and any branch not explicitly re-audited as safe. design/b01-canonical-week-asset-match retains its prior preserve status until a dedicated prune audit supersedes it.


Cleanup result: current implementation authority is unambiguous; historical issues no longer compete with the B01–B12 spine; branch-deletion debt is isolated and truthfully labeled; B07 remains the only active implementation batch.




45. B07 GREEN CHECKPOINT — SEPTEMBER 7, 2026
B07 — INTERACTION ENGINE RECONCILIATION is GREEN and frozen. Final tested feature head: 347a40d3f809da1df27ed44f7ce918a27b322503. PR #97 merged to protected develop with the expected-head safeguard; integrated merge commit: 224e66a6a93447ea1930c5806c47b70e4c866ac1. On the unchanged final feature head, Arc verify, B01, B02, B03/B04, B05/B06, Phase 2, all neighboring Phase 3 gates, the primary B07 rendered interaction-truth audit, and the independent 1280×720 adversarial B07 audit all passed. Post-merge verification on protected develop also passed all six triggered integration workflows. B07 resolves false success-adjacent messaging after rejected canonical mutations, false Fridge Undo ownership after rejected Lesson transactions, and rejected Week Quick Add dismissal/draft loss without weakening Section, Unit, Lesson, Shift, history, or persistence guards. Issue #96 is closed completed. B01–B07 remain frozen except for demonstrated downstream integration regressions. No Vercel, main, or production deployment occurred.
NEXT AUTHORIZED BATCH: B08 — PERSISTENCE + AUTHENTICATED STATE INTEGRITY. Preserve B01–B07 Green ownership. Do not broaden into B09 progressive setup, B10 capture, B11 teaching continuity, B12 release finishing, or deployment.


END OF CURRENT MASTER
