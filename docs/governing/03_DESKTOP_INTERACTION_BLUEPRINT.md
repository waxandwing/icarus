ARC — DESKTOP INTERACTION BLUEPRINT
CANONICAL HANDOFF
Status: Founder-locked implementation direction
Date: September 4, 2026


PURPOSE
This document translates the current Arc operating rules into a buildable desktop interaction blueprint. It is not a replacement for the Master Operating Document, Canonical Product Spec, or Canonical Brand System. It is the implementation-facing description of how the approved Arc planner shell should behave.


FOUNDER AUTHORITY RULE
The explicit product rules recorded here are binding until Kelly explicitly changes them. If a requested change later conflicts with one of these rules, stop and flag the conflict before implementing it. Do not silently override a founder rule with an older prototype, archived branch, generic UI convention, or developer preference.


1. DESKTOP SHELL — LOCKED
• Arc is calendar-first. The planner/calendar is the visual and functional center.
• There is NO LEFT RAIL.
• There is no permanent full-height navigation sidebar on either side.
• Utility systems enter as tabs/drawers attached to the outer edge of the planner/wall space.
• Furniture should feel physically attached to the workspace: drawer tabs, pull-tabs, attached trays, or related edge furniture.
• Furniture slides inward from the OUTER EDGE.
• Furniture does NOT overlay the calendar.
• Furniture does NOT squeeze, scale, compress, or reflow the canonical calendar.
• The calendar remains geometrically true while furniture is open.
• The visual north star is the open-planner / refined stationery direction: warm paper, quiet editorial hierarchy, generous negative space, restrained tactile details, red Important circles, minimal utility iconography.
• No dashboard-card composition. No generic SaaS navigation. No app-store productivity shell.


2. CALENDAR VIEW RULES
Week
• Default teacher Week is Monday–Friday.
• Weekends are optional.
• When weekends are toggled ON, Week may render Sunday–Saturday with Sunday first.
• Sunday-first behavior is allowed only in the weekend-enabled Week presentation.


Year Map
• Year Map is school-year / attendance-oriented.
• Year Map uses instructional weekdays and always starts each row on Monday.
• Year Map does not include weekend columns for attendance planning.
• There must never be stray or orphaned Monday cells on the right.
• Monday alignment is structural, not decorative.


Other views
• Day, Week, Month, Quarter, Semester, and Year Map are projections of the same canonical planning state.
• The teacher may choose the landing view.
• Arc returns to the teacher’s saved/last preferred calendar context.


3. NO “CLASSES” TAB
• Classes is not a permanent navigation tab.
• Day View is the natural class/period surface.
• Class isolation is a valid feature direction, but it must work as a filter/focus mode over the same canonical plan rather than creating a separate class-planning silo.
• Class isolation should be implemented after the core shell and object lifecycle are stable.


4. LEFT-EDGE SETTINGS DRAWER
A settings/utilities tab may live on the left OUTER EDGE of the planner/wall area. It is not a rail.


This drawer owns secondary system utilities such as:
• Settings and appearance
• Toggle visibility of optional surfaces
• Help / keyboard help / tutorial access
• Class rosters
• Setup and account connections
• Calendar preferences
• Accessibility preferences
• Other low-frequency utilities


Rules:
• These tools do not become permanent icons stacked down the page.
• Opening the drawer must not alter calendar geometry.
• The drawer returns focus to the exact prior planner context when closed.


5. FRIDGE — CANONICAL NAME + METAPHOR
The canonical product name is FRIDGE / FRIDGE DOOR.


Meaning:
The Fridge is where teachers put things they are proud of, want to hold onto, want to reuse later, or are not ready to schedule yet. The magnet metaphor is functional, not decorative.


Fridge behavior:
• Opens as edge furniture from the outer side.
• Does not overlay or shrink the calendar.
• Is persistent and finite enough to feel spatial.
• Holds reusable, unscheduled, or parked planning objects.
• Moving something into the Fridge never silently destroys its richer data.
• The object may present a simpler visible form in the Fridge, but its full canonical data remains attached.
• The teacher may explicitly override the simplified Fridge presentation to inspect/edit richer fields.


6. TASK BAR — MUST / SHOULD / COULD
There is NO “Plan Strip.”


The only persistent task surface is the Task Bar:
• Must Do
• Should Do
• Could Do


Rules:
• Horizontal relationship is preferred.
• Important items retain the red hand-drawn circle language.
• Task completion and Lesson completion are different concepts.
• Cross-out may be used for lightweight tasks but must never fabricate instructional completion.
• Tasks can move between Must / Should / Could.
• The Task Bar is supportive and secondary to the calendar.


7. PROGRESSIVE OBJECT DEPTH — CORE ARCHITECTURAL RULE
Arc uses one stable object identity as planning context deepens.


Canonical lifecycle:
IDEA / FRIDGE → TASK BAR → CALENDAR


The object is not recreated at each stage.


Fridge / Idea state
• Minimal information is required.
• Fast capture is the priority.
• Title / short thought / lightweight source or attachment may be enough.


Task Bar state
When the same object enters Must / Should / Could, Arc may expose additional planning fields such as:
• Notes
• Time / duration
• Deadline / target date
• Priority metadata


Calendar state
When the object is placed on the calendar, Arc may expose full planning customization such as:
• Course / Section context
• Date / time
• Unit relationship
• Lesson details
• Resources
• Standards
• notes
• fixed/movable status
• presentation/teaching context where relevant


Reverse movement
• Dragging or moving an object OFF the calendar does NOT erase calendar-level information.
• Returning it to Task Bar or Fridge changes the visible interaction layer, not the canonical data record.
• Richer data remains recoverable.
• The default simplified surface may hide advanced fields.
• The teacher can explicitly override the simplification and expose/edit the retained full record.


Engineering implication
• Location/state is metadata on a stable-ID object.
• Do not maintain separate copied Idea, Task, and Calendar records for the same object.
• Location changes cannot silently drop fields.


8. OBJECT FAMILIES — VISUAL / PHYSICAL GRAMMAR
Arc should use distinct tactile object families so teachers can recognize planning meaning before reading labels.


Unit
• Visual metaphor: magnet / larger planning piece.
• More structural visual weight than a Lesson.
• Can contain/refer to Lessons.
• Must not be confused with a task card.


Lesson
• Visual metaphor: sticky note / paper planning slip.
• Lighter than a Unit.
• Can exist loose or within a Unit.
• When nested, hierarchy remains obvious without excessive boxes.


Idea / Note
• Requires a third lightweight object language distinct from Unit magnets and Lesson sticky notes.
• It should feel fast, low-commitment, and easy to move.
• Candidate metaphors may include a clipped scrap, memo slip, index tab, small note card, or other restrained stationery artifact.
• Final artifact style must be tested against the brand system before implementation.


Accessibility
• Object type cannot be communicated by shape/color alone.
• Semantic labels and keyboard-readable object roles are required.


9. CONTEXTUAL OBJECT TOOLBAR
Selecting a Unit, Lesson, Task, Note, or Idea opens a compact contextual toolbar near the object.


Common actions may include:
• Move
• Shift
• Copy
• Put in Fridge / Drawer
• Delete


Object-specific actions appear only when relevant.


Rules:
• Toolbar is contextual and temporary.
• It is not permanent navigation.
• It should not cover the object’s essential information when avoidable.
• Keyboard focus enters predictably and returns to the selected object when dismissed.
• Escape closes the toolbar.
• Destructive actions require appropriate consequence confirmation.
• Move / Shift / Copy preserve stable identity rules correctly.


Semantic distinctions
MOVE
Changes placement. Preserves stable identity and history.


UNPLACE / PUT IN FRIDGE
Removes active calendar placement. Preserves the object and its richer data.


COPY
Creates a new stable object with explicit provenance/relationship as appropriate.


DELETE
Destroys the object. Requires dependency awareness and confirmation when attached work exists.


These actions must never be collapsed into an ambiguous generic “Remove.”


10. SEEDED / IMPORTED EVENTS
Arc must not fabricate school events as system truth.


However, imported, teacher-created, or source-backed events such as faculty meetings, PD days, after-school obligations, or school events may be placed into:
• Notes
• an optional After School section/lane
• other explicit non-instructional teacher-owned contexts


Rules:
• Optional After School is a user-enabled surface.
• It must remain visually subordinate to teaching plans.
• Imported provenance remains inspectable.
• A sample/mockup may use illustrative events only if clearly marked as sample data and never seeded into a real user workspace.


11. DAY VIEW
Day View is the class/period reality surface.


It should eventually show:
• Sections / periods in teaching order
• carryover where Arc is holding the teacher’s place
• today’s active Lesson / Unit context
• relevant Notes
• optional personal/after-school context
• exact origin for Live Classroom


Live Classroom rule
Calendar → Day → exact Section → eligible Lesson → Live Classroom.
Live Classroom is not a global tab.


12. CLASS ISOLATION — DESIGN DIRECTION, NOT YET LOCKED UI
Goal:
Allow the teacher to temporarily focus the calendar on one Course/Section without creating a second planning system.


Constraints:
• Filter only; underlying plan is unchanged.
• Clear, reversible, and non-destructive.
• Must work across supported views where useful.
• Must not introduce a Classes tab.
• Needs a dedicated interaction prototype after Week object movement is working.


13. FURNITURE STATES TO SPECIFY VISUALLY
The implementation blueprint must eventually include the following annotated states:
A. Calendar resting state — all furniture closed.
B. Fridge drawer open from outer edge.
C. Settings drawer open from outer edge.
D. Task Bar open / collapsed if collapsibility is approved.
E. Week — weekends OFF.
F. Week — weekends ON, Sunday-first.
G. Object selected — contextual toolbar open.
H. Fridge object dragged/moved to Task Bar.
I. Task object moved to Calendar and expanded to full planning capability.
J. Calendar object returned to Fridge with rich data retained.


14. FIRST IMPLEMENTATION SPINE — DO THIS BEFORE BREADTH
Build and verify one complete lifecycle before expanding the product surface:


1. Create lightweight Idea in Fridge.
2. Reload: Idea still exists.
3. Move Idea to Must / Should / Could.
4. Add notes and time.
5. Reload: all data persists.
6. Move same stable object to Calendar.
7. Add Course/Section, date, Unit/Lesson metadata, resources, and other full fields.
8. Reload: full record persists.
9. Move object back to Fridge.
10. Confirm simple Fridge presentation does not show unnecessary complexity by default.
11. Override simplification and confirm richer data is still present.
12. Move it back to Calendar and confirm prior data returns intact.
13. Undo/Redo movement where supported.
14. Repeat with keyboard-only movement path.
15. Repeat on narrower desktop width.


No PASS unless the exact stable object survives this circuit without silent field loss.


15. BUILD ORDER
P0 — Interaction grammar
• Stable object model + progressive-depth state
• Fridge furniture
• Task Bar
• Week calendar placement
• Contextual toolbar
• Move / Unplace / Copy / Delete semantics
• persistence + hard reload


P1 — Day + class reality
• Day View
• Section/period projection
• carryover
• Live Classroom launch dependency
• optional After School / Notes lane


P1 — View projection
• Month
• Quarter
• Semester
• Year Map Monday-first Mon–Fri attendance logic
• Week weekend-toggle Sunday-first behavior


P2 — Focus and utility systems
• Class isolation interaction
• Settings drawer
• roster utilities
• help/accessibility surfaces
• lower-frequency integrations


16. RUTHLESS AUDIT GATE
The following are automatic FAIL conditions:
• Any permanent left rail appears.
• Furniture overlays the calendar.
• Furniture changes calendar geometry.
• A Fridge → Task → Calendar move creates disconnected duplicate records.
• Moving an object backward loses richer data.
• Delete / Unplace / Move semantics blur together.
• Week weekend logic breaks the Year Map Monday rule.
• An imported/sample event is presented as verified school truth without provenance.
• A visible control is nonfunctional.
• Keyboard/touch fallback does not exist for meaningful drag movement.
• Reload changes or loses the canonical object state.
• A developer or agent resurrects a superseded shell rule without explicit founder approval.


17. CURRENT OPEN DESIGN QUESTIONS — DO NOT GUESS
These are legitimate unresolved design questions and must be prototyped rather than silently decided:
• Exact visual artifact for Idea / Note object type.
• Exact closed/open geometry for left-edge Settings drawer.
• Exact Fridge drawer dimensions and pull-tab anatomy.
• Whether Task Bar is always visible or optionally collapsible.
• Exact UI for class isolation.
• Exact structure of optional After School lane.
• Which full-detail fields appear automatically when an object becomes calendar-scheduled versus staying behind Add more info.


18. CURRENT VISUAL NORTH STAR
Use the approved open-planner image direction as the compositional reference:
• open bound planner
• warm paper surface
• restrained editorial typography
• sparse physical furniture
• tactile edge tabs/drawers
• calendar centered
• generous wall/negative space around the planner
• quiet hierarchy
• red Important circles retained


Do NOT copy incorrect literal details from the concept image where they conflict with this blueprint. Specifically: no full left rail; Week weekend behavior follows the rules above; Classes is not a tab; Plan strip does not exist; furniture behavior follows the outer-edge drawer rule.


END STATE FOR THIS BLUEPRINT
A new designer, engineer, or AI agent should be able to use this file with the Master Operating Document, Canonical Product Spec, and Canonical Brand System and reproduce the same interaction model without needing to infer the product from archived builds.


19. FIGMA + GIT RECONCILIATION — SEPTEMBER 4, 2026


FIGMA AUDIT
Current Figma baseline reviewed: file dyh1zoTd4mJ7JzuWcIU3CX, including Direction I (35:2), Year View (35:218), and later desktop directions.


KEEP / PORT FORWARD
• Calendar-centered planner composition.
• Warm paper/editorial/tactile visual direction.
• Fridge Door metaphor and magnet language.
• Red Important circles.
• Optional After School row/lane as a teacher-enabled non-instructional surface.
• Calendar-contained quick add patterns.
• Unit/Lesson hierarchy work and restrained physical object language.


REJECT / REBUILD BEFORE IMPLEMENTATION
• Every fixed/full left sidebar or rail.
• Any Classes navigation tab.
• Any Plan navigation tab or separate Plan strip.
• Fridge docking choices that allow Bottom or Float.
• Any Fridge/Ideas panel that overlays or permanently squeezes the calendar.
• Priorities nested inside Fridge; Must/Should/Could belongs to the Task Bar.
• Generic Ideas as the primary user-facing name; Fridge is canonical.
• Always-visible per-object action rows; object actions are contextual on selection.


FIGMA STATUS
Existing frames remain useful visual evidence, but frames that contain a left rail, overlay/squeeze furniture, Plan/Classes destinations, or nested Fridge priorities are NOT implementation authority. The next canonical Figma desktop frame must be rebuilt from the approved planner composition plus this blueprint rather than incrementally cleaning a rail-based frame.


GIT AUDIT
Repository reviewed: waxandwing/arc-greenfield.


PRESERVE
• Stable Plan IDs and rich fields (notes/resources/details).
• Existing movePlanTreeToIdeas behavior retains the object record and its richer data instead of erasing it.
• Existing movePlanToCalendarDate moves the same object back to calendar context.
• Undo/Redo, clipboard, Unit tree, persistence, and schedule-domain work are valuable foundations.
• SchoolCalendar already owns weekendsVisible; this should drive Week presentation rather than a disconnected UI-only toggle.


CURRENT CODE CONFLICTS
• Current shell still renders Ideas + priorities together as a right-side workbench, which permanently reduces calendar width.
• Current visible name is Ideas instead of Fridge.
• Current PriorityWorkbench is inside that side workbench instead of acting as the horizontal Task Bar.
• Week currently hard-codes Monday–Friday and does not consume SchoolCalendar.weekendsVisible.
• Per-object actions were hover/inline controls rather than a selected-object contextual toolbar.
• Current Week class rows are implementation evidence, not a reason to invent a Classes tab. Class isolation remains unresolved.


RECONCILIATION BRANCH
A dedicated branch was opened: codex/reconcile-founder-laws.


First protection work added there:
• docs/ARC_FOUNDER_LAWS.md — repository-local authority rules.
• lib/calendar-display.ts — executable Week and Year display rules: Mon–Fri by default; Sun–Sat Sunday-first when Week weekends are enabled; Year attendance remains Mon–Fri Monday-first.
• tests/founder-laws.test.ts — regression tests for weekend law and stable-object rich-data retention through Fridge → Calendar movement.
• app/week-planner.tsx — selected objects now use contextual action-toolbar behavior and user-facing Put in Fridge language.
• app/arc-interactions.css — contextual toolbar styling; removed obsolete version-lineage language that must not return.


NEXT CODE PASS — REQUIRED BEFORE MERGE
1. Replace the Ideas/right-workbench shell with true Fridge outer-edge drawer furniture that does not overlay or reflow calendar geometry.
2. Move PriorityWorkbench out of Fridge/workbench and render it as the horizontal Task Bar.
3. Wire Arc Week rendering to SchoolCalendar.weekendsVisible through the shared calendar-display rules.
4. Add the left outer-edge Settings drawer; do not create a rail.
5. Add user-facing progressive-depth editing: Fridge minimal → Task Bar notes/time → Calendar full detail, with retained-data override.
6. Reconcile Day view and class/period projection before any Classes navigation concept is introduced.
7. Ruthlessly test persistence, keyboard paths, drag fallbacks, Undo/Redo, and no-data-loss lifecycle before main/production merge.


MERGE RULE
Do not merge rail-based or workbench-squeeze UI into the canonical build simply because it already exists. Preserve useful domain logic while replacing shell-level violations. Founder laws are the gate.


20. CURRENT RECONCILIATION STATUS — ACTIVE BRANCH


DEPLOYMENT LAW
• Do not deploy Arc to Vercel.
• This includes production, preview, branch, automated, and accidental Vercel deployments.
• Draft pull requests and Git branches are review/build spaces only and are not deployment permission.
• Deployment remains blocked until Kelly explicitly reverses this rule.


IMPLEMENTED ON codex/reconcile-founder-laws
• The prior permanent Ideas/Priority right workbench has been removed from ArcShell.
• Fridge now exists as right outer-edge drawer furniture outside the canonical calendar geometry.
• Settings now exists as left outer-edge drawer furniture; it is not a rail.
• Must Do / Should Do / Could Do now exists as a horizontal Task Bar separate from Fridge.
• Task metadata now belongs to the same stable planning object rather than requiring a disconnected Priority object.
• Legacy Priority records are migrated into stable Task Bar objects so older user data does not silently disappear.
• Week rendering now consumes SchoolCalendar.weekendsVisible: Mon–Fri by default; Sun–Sat with Sunday first when weekends are intentionally enabled.
• Year attendance display logic remains Mon–Fri and Monday-first.
• Calendar objects use selected-object contextual controls rather than permanent hover action rows.
• Fridge supports both drag-in placement and explicit non-drag movement into Must / Should / Could.
• Unit, Lesson, and Idea/Note use distinct physical object language without relying only on color.
• Regression coverage now includes stable identity and rich-data retention through Fridge → Task Bar → Calendar movement.
• A lightweight Zustand interaction store exists for the upcoming controlled state-ownership migration.


CURRENT RELEASE GATE
• Draft PR #48 remains intentionally unmerged.
• GitHub verification must pass typecheck, tests, and build on the current branch head before any merge decision.
• No successful CI result authorizes Vercel deployment.


NEXT REQUIRED PASS AFTER GREEN CI
1. Add explicit non-drag Fridge → Calendar scheduling chooser.
2. Add explicit non-drag Task Bar → Calendar scheduling path.
3. Migrate ArcShell workspace ownership from component-local history into the prepared canonical client store without changing domain truth.
4. Add progressive Calendar full-detail editing while Fridge and Task Bar retain simplified presentation.
5. Ruthlessly audit focus return, Escape behavior, keyboard movement, drag fallback, reload persistence, Undo/Redo, reduced motion, and object identity.
6. Reconcile the resulting implemented shell back into the canonical Figma desktop frame.


21. VERIFIED IMPLEMENTATION STATE — SEPTEMBER 4, 2026


VERIFIED GREEN HEAD
• Draft PR #48 remains open, mergeable, DRAFT, and unmerged.
• Verified branch head at this checkpoint: 06485a00d7c5bd78d5fe1339aed47fd8467c192a.
• GitHub Verify Arc Greenfield completed successfully on that exact head.
• Successful verification does NOT authorize Vercel or any other deployment.


IMPLEMENTATION NOW BEYOND SECTION 20 PLAN
• ArcShell workspace/history/selection ownership is now routed through the Zustand Arc store; component-local duplicate workspace ownership has been removed.
• Fridge and Task Bar both provide explicit non-drag Schedule paths into Calendar.
• Scheduling preserves the same stable object identity and retained richer data.
• Calendar progressive depth is now intentional: selecting an object exposes contextual actions; choosing More… opens the full planning-detail editor.
• Full Calendar detail currently includes title, date, class/course, notes, standards/alignment, fixed-date status, and resources.
• Fridge and Task Bar intentionally remain simpler representations of the same canonical object.
• Task Bar metadata remains attached when the object is calendar-scheduled and is visible as retained context.
• Long-form Calendar text uses local drafting with deliberate commit boundaries instead of creating a persistence/history transaction on every keystroke. This preserves responsiveness while keeping Undo meaningful.
• Delete is now dependency-aware and asks for explicit consequence confirmation; Delete remains distinct from Put in Fridge / movement.
• Closing Fridge or Settings returns keyboard focus to the exact edge pull-tab that opened the drawer.
• Escape closes open edge furniture before clearing general object selection.
• Resource links entered through Calendar details are restricted to valid http/https URLs.


CURRENT TRUST/AUDIT WORK
The next work is not another shell invention. It is interaction verification and cleanup:
• Task Bar text/time editing must use the same deliberate-commit philosophy as Calendar details so typing does not create noisy persistence/history transactions.
• Escape and focus-return behavior must be checked for Task Bar and Fridge scheduling/detail popovers.
• Contextual toolbar focus must return predictably to the selected object when dismissed.
• Keyboard/non-drag paths must remain available for every meaningful drag movement.
• Reload, Undo/Redo, reduced-motion, narrow-desktop, object identity, and richer-data retention must be reverified as one complete lifecycle.
• Day / class-period projection and class isolation remain unresolved and must not be guessed into existence.
• After this interaction audit, the implemented shell should be reconciled back into the canonical Figma desktop frame.


DEPLOYMENT GATE — STILL ABSOLUTE
No Vercel production, preview, branch, automated, or accidental deployment is authorized. Green CI, a mergeable PR, or a completed Figma frame does not change this rule.


22. INTERACTION HARDENING CHECKPOINT — VERIFIED


CURRENT GREEN HEAD
• Branch head at this checkpoint: baa4eeb478e0271d8e091968ef60a4d82012767b.
• GitHub verification on this exact head passed install, TypeScript typecheck, automated tests, production build, and canonical-build-contract verification.
• PR #48 remains DRAFT and unmerged.
• No deployment occurred and no deployment is authorized.


AUDIT FIXES COMPLETED SINCE SECTION 21
• Task Bar Notes / Time / Duration now use local drafting and deliberate commit boundaries instead of persisting every keystroke.
• Task Bar detail popovers close with Escape and return focus to the task control that opened them.
• Task Bar scheduling popovers close with Escape and restore focus to the originating task control.
• Fridge scheduling popovers close with Escape and return focus to the originating Fridge object.
• The scheduling chooser autofocuses its date control and remains a non-drag path into Calendar.
• Regression tests now explicitly protect fixedDate, resources, standards/details, advanced fields, and Task metadata across a full Calendar → Fridge → Task Bar → Calendar → Fridge circuit.
• The last surviving repository source reference to the explicitly rejected old version lineage was found on main and surgically removed. This was a comment-only cleanup and changed no product behavior.


CURRENT INTERACTION SPINE STATUS
Core non-drag equivalents now exist for the meaningful movement paths currently implemented:
• Fridge → Must / Should / Could via explicit controls.
• Fridge → Calendar via Schedule chooser.
• Task Bar tier → another Task Bar tier via explicit selector and drag/drop.
• Task Bar → Fridge via explicit control.
• Task Bar → Calendar via Schedule chooser.
• Calendar → Fridge via contextual control.
• Calendar → nearby Week date via contextual Move controls.
• Calendar → arbitrary date/class via intentional full-detail controls.


REMAINING BEFORE THIS INTERACTION AUDIT IS CLOSED
• Verify Calendar More… focus return to the originating calendar object after dismissal.
• Continue checking keyboard-only navigation order across selected-object contextual toolbars.
• Reverify hard reload and Undo/Redo through the full object lifecycle after the latest interaction changes.
• Keep reduced-motion and narrow-desktop behavior in the ruthless audit gate.
• Do not invent Day/class isolation UI while those design decisions remain open.
• After these checks are clean, reconcile the implemented shell into the canonical Figma desktop direction.


23. DAY / CLASS ISOLATION / LIVE CLASSROOM — IMPLEMENTED + VERIFIED — SEPTEMBER 5, 2026


This section supersedes earlier statements in Sections 21–22 that Day/class isolation and Figma reconciliation remained unresolved.


IMPLEMENTED ON codex/reconcile-founder-laws
• Day is now a first-class planner view and valid saved home/Last used target.
• Class/period structure lives inside Day. No Classes tab exists.
• Class isolation is implemented as a reversible Day filter/focus projection; it does not create a second planning state.
• Carryover appears before Today’s Plan for unfinished Section-specific work.
• Optional After School / Notes exists as a subordinate teacher-entered lane.
• Live Classroom launches only from Day → exact Section → eligible Lesson on a confirmed instructional date.
• Live Classroom is not global navigation and does not expose Fridge/Task/recovery planner furniture.
• Complete writes Section-specific completion + actual taught date.
• Stop here requires a resume note and writes Section-specific in-progress state.
• Skip writes Section-specific skipped state; completed/skipped Lessons cannot relaunch.
• Leave without outcome writes nothing.
• Before any Live outcome write, Arc revalidates the exact canonical Lesson + Section + date; stale context fails closed and returns the teacher to Day.
• Shared curriculum Lesson truth remains shared; sparse SectionDelivery state owns divergence.


CURRENT SECTION MODEL
• Explicit Section is now a domain object distinct from Course.
• Plan may hold Section-specific placement and sparse Section delivery state.
• Older workspaces without explicit Sections are temporarily projected as one derived Section per Course to avoid destroying legacy data.
• That derived projection is compatibility only, not final architecture.
• BUG 010 in the canonical Bug Fix Log tracks the remaining requirement to persist explicit stable Sections through progressive setup/migration and prove one Course → multiple Sections across reload and divergent teaching outcomes.


FIGMA RECONCILIATION
File: dyh1zoTd4mJ7JzuWcIU3CX
Canonical page: ARC — CANONICAL 2026-09-05
Page node: 62:2
Canonical state frames:
• 62:3 — Week / furniture closed
• 62:42 — Week / weekends enabled
• 62:87 — Day / class lens
• 62:124 — Outer-edge drawers
• 62:179 — Live Classroom
• 62:198 — Canonical authority note
Older rail-based frames on Page 1 are historical evidence only and are not implementation authority.


VISUAL AUDIT
• Day frame: PASS after correction. The initial pass omitted the persistent Task Bar; audit caught it and Task Bar + red Important mark were restored before acceptance.
• Outer-edge drawer frame: PASS for canonical composition. Settings and Fridge occupy wall space outside the planner and do not overlay/reflow calendar geometry.
• Live Classroom frame: PASS for hierarchy. It is focused, sparse, exact-context, and has no global planner/nav furniture beyond the exit back to Day.


CODE AUDIT
• The old pre-Day ArcShell became a second navigation owner once Day was promoted. Typecheck correctly failed; the obsolete shell was deleted rather than patched. This removed duplicate architectural truth.
• Latest protected head: 16f36b1b9bc8a43ad7be2a30c3f29066955ef928.
• GitHub Actions 33971189472: PASS — dependency advisory gate, no-Vercel law gate, typecheck, tests, production build, canonical build contract.
• Draft PR #48 remains open, draft, mergeable, and unmerged.
• No Vercel deployment occurred or is authorized.


CURRENT RELEASE GATE
This Day/Live slice is clean at source/CI/Figma level, but PR #48 is NOT Green as a whole. BUG 010 explicit Section setup/persistence migration remains an integration blocker, followed by final rendered RGAV after that last material change


24. CURRENT AUTHORITY RECONCILIATION — SEPTEMBER 7, 2026
This section governs current implementation interpretation where earlier status, branch, or generic-object wording in this Blueprint conflicts with the ARC Master Operating Document or later verified checkpoints.


• The Master Operating Document remains the working control center and current task-state authority. Historical PR #48 / codex/reconcile-founder-laws status sections above are retained as evidence only; they are not the active branch or release gate.
• Current implementation authority before B05/B06 completion is develop @ cdf5ba43c403a6695258a8f1c23ab5a22240af4d, with B01, B02, and B03/B04 Green and frozen except for integration regressions.
• Task Bar means Must / Should / Could and accepts canonical Notes only. Earlier generic IDEA / FRIDGE → TASK BAR → CALENDAR lifecycle wording must not be read as permission to place Units or Lessons into Task Bar or to create a parallel generic Task record.
• Fridge remains the unscheduled/staging surface for supported planning objects. Movement must preserve canonical identity and richer data where the object model supports it.
• Settings remains left-edge furniture. View/display/accessibility preferences are consolidated under Settings → View Options; mandatory keyboard, touch, zoom/reflow, and contrast support are capabilities, not optional toggles.
• Live Classroom is the current user-facing teaching-surface name. Easel is retired terminology and may appear only in historical/internal artifact names until a dedicated Live Classroom migration safely removes that debt.
• Canonical Live Classroom handoff remains Calendar → Day → exact Section → eligible Lesson → Live Classroom. It is not global navigation and no empty placeholder UI should be shown before the feature is active.
• Current B05/B06 work may preserve a dormant architecture-only Live Classroom extension seam, but must not fabricate teaching behavior, Drawer/Magnet/Voice systems, or broaden into later batches.
• Current furniture verification must use the canonical Task Bar label. Older B01 audit expectations for a button named “Tasks” are superseded.
• The current narrow-layout accessibility gate measures rendered interactive targets only; hidden descendants of collapsed native controls are not user touch targets. Visible controls still require the 44 px minimum.
• No Vercel or other live deployment is authorized by this reconciliation or by Green CI.
.
