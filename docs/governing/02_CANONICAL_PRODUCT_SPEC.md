38. SHIFT MUTATION-SAFETY AUDIT — 2026-09-03


Audit scope: recovery consequence preview, Section-specific Shift mutation, collision handling, fixed-date protection, stale-preview protection, whole-operation Undo, Section isolation, and cross-layer schedule validity. This audit was intentionally performed before Shift persistence/reload or teacher-facing Apply/Undo controls.


Audit findings fixed:
• Undo was previously snapshotted across all Sections. It is now scoped to the affected Section only. Newer work in Period 2 does not invalidate or get overwritten by Period 5 Undo; newer Period 5 work still blocks stale Undo.
• Section schedule overrides previously had no single authoritative cross-layer validator. A SectionScheduleWorkspace validator now rejects duplicate Section/Lesson overrides, orphan Sections or Lessons, moved fixed Lessons, non-instructional targets, Unit-boundary violations, and unresolved same-day collisions.
• Shift previously allowed no-op changes where fromDate equaled toDate. These are now rejected so an applied Shift always represents a real movement and cannot create misleading operation/Undo history.
• Recovery preview previously searched only inside the interrupted Unit and used only shared Lesson dates. It now evaluates the Section’s effective Course schedule, including existing Section-specific overrides, and chooses the earliest fixed anchor by effective date across Units.
• Recovery Review copy was corrected so the UI describes the course-wide algorithm rather than the older Unit-only behavior.


Cross-layer hostile checks added:
• a later no-school/closure date invalidates a Section override that depended on that instructional day;
• shrinking a Unit invalidates overrides now outside the Unit;
• a valid change in another Section coexists with Period 5 recovery overrides;
• duplicate overrides and unresolved same-day collisions fail closed;
• fixed Lesson overrides fail closed;
• canonical P5 recovery remains Section-isolated and does not mutate shared Lesson objects.


Verified feature head: 93c238c0a60bd3ae5374700dc2eab5283b7902b6. GitHub Actions completed the lockfile-backed contract suite, TypeScript compile, and Vite build successfully before integration. Integrated develop checkpoint commit: 476b006f4ea9c55b44161e814fa3748883935cb7; independent develop verification required on that exact commit.


Disposition: mutation-domain audit cleared to proceed to Shift persistence. NOT cleared for teacher-facing Apply/Undo. Persistence/reload is not built yet. Explicit teacher-approved multiple-Lessons-on-one-Section/date behavior is also not modeled yet; current Shift integrity treats those as collisions. Browser click/keyboard testing remains a release gate.


CHECKPOINT — Calendar Setup UI 01 (2026-09-02)
Active branch: feature/calendar-setup-ui
Latest verified implementation commit: 873d5c603550050ac1417f0b125b0e26a5144c0a


Teacher-facing calendar setup now exists as the first configuration surface. It is deliberately restrained: school-year label, first/last day, normal instructional weekdays, and explicit exceptions. Manual setup is treated as confirmed because the teacher is directly declaring the pattern and exceptions.


Trust rules added in this pass:
• Saving hydrates a real SchoolCalendar and immediately replaces setup with the rendered calendar.
• Validation blocks empty/invalid bounds, zero instructional weekdays, duplicate exception dates, and out-of-range exceptions through the existing hydration contract.
• Exact teacher declarations are retained separately from hydrated output so later editing reopens what the teacher actually entered; Arc does not reverse-engineer a weekly pattern from generated dates.
• Cancel during editing restores the previous calendar unchanged.
• Calendar-view navigation is disabled while setup/editing is onscreen so hidden view state cannot drift behind the form.
• This surface does not yet persist through reload; durable storage remains intentionally out of scope for this pass.


Verification:
• calendar truth contract passed
• calendar projection contract passed
• calendar hydration contract passed
• full TypeScript compile passed
• Vite production bundle passed
• feature-branch Vercel preview build completed successfully
• no production deployment and no main-branch changes


Next boundary: persistence/reload-safe calendar storage and navigation through time, before planning objects are introduced.


FUNCTIONALITY RECHECK — 2026-09-02


Active branch: feature/calendar-truth
Verified commit: 9a50988a58f505daae9b418bc52efe742221aa3f


Findings and fixes:
- Existing Vercel preview project was still configured as Next.js while the rebuild is Vite/React. Added repo-level vercel.json with framework=vite, buildCommand=npm run build, outputDirectory=dist.
- Clean Vite build then exposed missing Vite client type declarations for CSS imports. Added src/vite-env.d.ts.
- Strengthened build gate so every preview build executes calendar truth and calendar projection contracts before TypeScript/Vite bundling.
- Vercel's latest TypeScript caused the legacy calendar-test module-resolution config to fail. Pinned TypeScript 5.8.3 for deterministic contract builds.


Verified result:
- calendar truth contract passed
- calendar projection contract passed
- TypeScript application build passed
- Vite production bundle passed
- Vercel preview status SUCCESS / READY for commit 9a50988a58f505daae9b418bc52efe742221aa3f


Not yet verified:
- browser-level click-through interaction, because the feature preview is protected by Vercel SSO and the available fetch path cannot retain the required auth cookie. Navigation/home behavior remains source-reviewed but not browser-automation-cleared.


Release status: NOT READY FOR MAIN. No production release performed.


ARC — CANONICAL PRODUCT SPEC — GREENFIELD REBUILD


FOUNDER INTERFACE AUTHORITY — September 4, 2026
These rules supersede any conflicting interface/navigation/furniture behavior elsewhere in this document unless Kelly explicitly reverses them.
• No persistent left rail. Utilities/settings are accessed through outer-edge furniture tabs/drawers, not a permanent navigation column.
• Week defaults to Mon–Fri. If weekends are enabled, Week may render Sun–Sat with Sunday first. Year Map excludes weekends and always begins each attendance week on Monday.
• Source-backed or teacher-entered non-instructional/after-school events may be placed in Notes or an optional After School lane; never fabricate school events.
• Selected objects open a contextual pop-up toolbar for actions such as Delete, Copy, Shift, Move, and Put in Drawer, with canonical guards.
• Fridge is the canonical name for the staging/holding surface.
• There is no Plan strip. Must / Should / Could is the Task Bar.
• Object capability deepens by surface without data loss: Ideas/Fridge = limited capture; Task Bar = task notes/time; Calendar = full customization. Moving an object to a shallower surface preserves deeper data but hides non-relevant controls by default; Full Edit/override remains available.
• Classes is not a tab. Day is the Section/class-centric view. Class isolation should be implemented as a filter/lens over canonical state.
• Visual object language: Units as magnets; Lessons as sticky-note/paper-note forms; Note/Idea as a distinct lightweight paper object.
• Furniture slides in/out from the outer left or right edge of the planner/wall space like a real drawer. It does not overlay the calendar and does not squeeze/reflow the calendar.




Status: Current product authority for all new Arc implementation work
Date: August 31, 2026
Implementation rule: Build from these product requirements. Do not copy prior Arc code, branches, CSS patch stacks, preview artifacts, or deployment structure unless a specific behavior is intentionally reimplemented from this document.


1. PRODUCT PROMISE


Arc is a calm, connected, teacher-first planning system. Its job is to simplify the teaching year, not create another layer of paperwork.


Arc is not a generic productivity app, LMS clone, AI lesson generator, gradebook, rigid administrative lesson-plan form, or prettier Google Calendar.


Core principles
• Respect — the teacher’s real calendar, files, schedule, classes, and workflow are the source of truth.
• Clarity — Arc must show what it knows, what came from a source, what was inferred, and what still needs confirmation.
• Adaptability — support different school calendars, schedules, courses, planning styles, and preferred calendar views.
• Ownership — the teacher owns the work. Sharing is explicit, not automatic.
• Craft — the interface should feel thoughtful, visual, calm, tactile, and teacher-made rather than corporate or form-heavy.


2. NON-NEGOTIABLE TRUST RULES


• Never invent school events, dates, holidays, workdays, bell schedules, lunch periods, faculty meetings, testing days, or district information.
• Never show demo data inside a real teacher workspace.
• Never claim a feature is deployed until the exact deployed build has been verified.
• Never claim save/Drive success unless the data was actually persisted to that destination.
• Arc data and Google Calendar data remain distinguishable. Google events are not Arc lessons.
• A teacher should never have to repeat setup information Arc already knows or the teacher already approved.
• No visible core control may be a placeholder, toast-only action, or decorative affordance without real behavior.
• Every destructive or structural planning action must preserve stable object identity and support recovery where appropriate.


3. GREENFIELD IMPLEMENTATION RULES


This rebuild begins with a new repository and a new Vercel project.


The previous Arc repository, preview projects, branches, ZIPs, and deployments are reference-only. They are not implementation dependencies.


Architecture rules
• One responsive application. Desktop is primary, but mobile uses the same data and application.
• One canonical domain model for planning objects, Units, Lessons, Magnets, Notes, priority relationships, calendar truth, and preferences.
• One canonical school-calendar service.
• One persistence layer with local fallback and authenticated account/Drive sync.
• One owner for navigation state.
• One owner for visual tokens and component styling. No version-number CSS patch layers.
• Stable IDs are mandatory for planning objects, Unit children, continuations, Magnets, Notes, markers, and saved relationships. Priority is a relationship/state layer, not a duplicate planning object.
• The rendered UI must be a projection of canonical state, not the canonical state itself.
• Add automated behavioral tests before adding secondary features.


Every preview must expose a build fingerprint that includes a human-readable build ID and Git commit SHA. A preview is invalid if the visible fingerprint and deployed commit do not match the intended build.


4. BRAND + VISUAL LANGUAGE


Brand: Arc by Wax & Wing.


Visual direction
• Warm paper/off-white base.
• Editorial rather than dashboard-heavy.
• Color direction defers to ARC — Canonical Brand System & Construction Rules. Product requirements may describe functional color roles but do not override canonical Wax & Wing tokens.
• Typography defers to ARC — Canonical Brand System & Construction Rules. Current canonical UI direction is Nunito Sans / Avenir Next Rounded with restrained editorial serif accents; older prototype font pairings are not authoritative.
• Logo remains visually intentional and is itself the Home control.
• No redundant Calendar label under the Arc logo.
• Teacher-owned course colors are authoritative.
• Units use the strongest course color; nested lesson values may progress through lighter-to-stronger values of the same course color.
• Sequence and completion are separate signals.
• Dark mode must preserve the same hierarchy and real assets without bright leftover panels.
• Working text must remain readable; avoid tiny decorative utility type.
• The interface should use visual hierarchy rather than narrating every possible action.


Interaction metaphor
Arc should feel like arranging planning pieces on a desk or refrigerator rather than filling out forms. Dragging is useful, but every important drag action needs a non-drag path.


5. HOME + VIEW MODEL


The calendar/planning desk is Arc Home.


Teacher-selectable views
• Day
• Week
• Month
• Quarter
• Semester
• Year Map


Home behavior
• The teacher may choose a fixed landing view or Last used view.
• Arc logo returns to that preference.
• Landing preference persists with the workspace.
• Day may be hidden from the main horizon switcher at teacher discretion without deleting Day planning capability.
• New-user default may be Month until the teacher chooses otherwise.


Default calendar display
• Monday–Friday is standard.
• Weekends are optional.
• Today and selected-date states must be visually distinct.


Jobs of the views
• Day — daily overview/summary: classes, active Units, Lessons, Notes, open priorities, and relevant Fridge/unscheduled context. A no-school day remains visible and plannable.
• Week — default Mon–Fri; when weekends are toggled on, Sunday–Saturday is allowed with Sunday first.  detailed working planner. Classes down the left, dates across the top, units spanning instructional days, lessons beneath, Notes compact, and priorities available without dominating the calendar.
• Month — multi-week Unit pacing and continuity.
• Quarter — course pacing against real, editable quarter boundaries.
• Semester — long-range Unit trajectory using actual plan data.
• Year Map — whole-course / whole-year curriculum arcs and the only home for Year markers/stickers.


6. SCHOOL CALENDAR TRUTH


One normalized SchoolCalendar service must drive:
• Day instructional/no-school status
• Unit instructional duration
• Shift
• Month placement
• Quarter boundaries
• Semester boundaries
• Year Map bounds
• next/previous instructional-day movement


No-school dates remain visible and may contain teacher notes/planning. They do not consume instructional-day duration.


The calendar may be configured through:
• source-backed district/school discovery when real extraction exists;
• file upload/import;
• manual entry.


If automatic discovery or upload is not actually working, those controls must be unavailable or explicitly labeled as not yet available. Never fake extracted results.


Desired source-backed extraction includes first/last student day, holidays/breaks/workdays, quarter boundaries, bell schedule when published, and special schedules only when present in the source.


Confidence vocabulary
• Confirmed — directly present in source.
• Mixed — partly explicit, partly derived.
• Inferred — calculated/estimated and visibly labeled as such.


7. ONBOARDING


Independent-teacher flow
1. Google sign-in / required permissions.
2. Profile: name + relevant role(s).
3. School day: district/school source path when real, with editable schedule details or manual/upload fallback.
4. Classes: courses + period/block/sections + teacher-controlled course colors.
5. Open Arc desk.


Organization-managed teachers may inherit approved schedule information, but their personal workspace remains private by default.


Do not include in initial onboarding
• lesson-template selection;
• grade-band/template-preview step;
• redundant final school-calendar confirmation page;
• repeated approval loops;
• “anything else I should know?” as a blocker;
• fake source cards;
• fabricated starter classes or events.


Lesson templates belong in Settings/template management later and are always optional.


8. CANONICAL PLAN MODEL


Canonical planning object types
• Unit
• Lesson
• Magnet
• Note


Planning material may be scheduled or unscheduled. The interaction metaphor is magnet-first, but the domain still distinguishes Unit, Lesson, Magnet, and Note where their protections and semantics differ.


Required shared concepts
• stable ID
• type
• title
• course ID when applicable
• date / schedule location
• parent Unit ID when applicable
• explicit Unit child order
• fixed-date state
• continuation relationship for Extend
• notes/details
• resources/links
• optional teacher-selected detail fields
• source/provenance where relevant
• location/context may include Fridge Door, Drawer, priority/task area, calendar, or teaching-derived presentation; location affects disclosure and manipulation, not object identity


A Unit is a real container, not merely a differently styled lesson.


Loose lessons are valid. Lessons may be nested inside Units.


Unit-child relationships and ordering must persist across reload, devices, account save, Drive sync, and offline fallback.


9. LESSON INTERACTION


Selecting a loose or unplaced Lesson exposes location-appropriate actions. A deliberate Edit action opens the fuller in-context Lesson editor without requiring the teacher to move the Lesson first.


Default lightweight information
• Lesson name
• Course
• Unit assignment when applicable
• Notes
• Date
• Fixed-date state
• Resources/links
• Add more info


Teacher-selected optional detail fields may include purpose/objective, plan/sequence, materials, standards, and teacher notes.


Add more info intentionally expands detail; it is not required to create or move a lesson.


Common actions should be easy to reach
• Tack → move the same lesson to the next instructional day.
• Extend +1 day → keep the current lesson and create a stable-ID continuation on the next instructional day.
• Move…
• Copy → when offered, create a distinct stable-ID copy.
• Unplace / move back to the Fridge without losing identity or backstory.


10. UNIT FOCUS


Clicking a Unit opens Unit Focus: an enlarged view of that same Unit stack without leaving calendar context.


Clicking a lesson that belongs to a Unit opens Unit Focus with that lesson selected while the surrounding sequence remains visible.


Unit Focus supports
• add lesson;
• open/edit lesson;
• explicit reorder;
• detach/unplace Lesson back to the Fridge or loose planning while preserving identity and history;
• Unit notes/details;
• resources;
• later standards/details without making them mandatory.


Closing Unit Focus returns the teacher to the exact context they came from.


11. FRIDGE DOOR + SPATIAL STAGING


The Fridge Door is a persistent spatial staging surface. It should be recognizable through placement, material language, and interaction rather than a redundant permanent surface label.


The Fridge Door holds intentionally unscheduled, unfinished, captured, or temporarily unplaced work without forcing the teacher to finish structuring it.


It must support
• loose lessons;
• loose Units;
• quick Magnets, Voice Magnets, resources, reminders, and other captured thought;
• temporary spatial stacks that do not silently create curriculum hierarchy;
• preserved ordering;
• direct creation;
• location-appropriate edit actions, Put away/Bring back, Magnet Discard with Undo, and protected Unit/Lesson Delete;
• calendar → Fridge/unplaced return without losing object identity, accumulated details, history, or relationships;
• Fridge → priority/task → calendar movement by drag/drop where valid, using the same canonical transition logic;
• explicit non-drag Move/Schedule fallback using the same preview, validation, and persistence path.


The refrigerator/magnet metaphor is structural interaction language, not decorative naming. The Fridge must remain finite, persistent, recoverable, and subordinate to the calendar.


12. MUST / SHOULD / COULD


Arc’s priority organizer remains visually separate from the core calendar and should not consume the main planning surface.


Required behavior
• horizontal Must / Should / Could arrangement;
• collapsible;
• accepts the same underlying planning objects/Magnets without cloning them; exposes middle-depth task editing rather than a separate priority object CRUD model;
• move between tiers;
• personal and school priorities may coexist;
• red-circle cannot-forget emphasis available as a task-level state;
• completed item crosses out;
• explicit clear/remove from the priority area after completion without deleting the underlying planning object unless Delete/Discard is separately chosen;
• keyboard/non-drag tier movement.


13. SHIFT + DISRUPTION RECOVERY


Shift exists because teacher plans move.


Required behavior
• preview before apply;
• teacher chooses affected classes/courses;
• one shared school calendar determines instructional-day movement;
• fixed-date plans remain fixed;
• collisions are surfaced and can block unsafe apply;
• unscheduled/uncommitted Fridge objects are not shifted;
• applied Shift participates in Undo/Redo.


14. COLLISIONS + OCCUPANCY


Arc should be collision-safe by default while still allowing teachers to intentionally stack work.


• Multiple same-day lessons must receive distinct lanes rather than paint over one another.
• Overlapping Units receive separate lanes where necessary.
• Multiple Notes stack instead of overlaying.
• Intentional stacking may be an explicit choice.
• Structural moves must preflight child collisions where relevant.


15. YEAR MAP


Year Map is the whole-course planning surface.


• Units appear as broad arcs across the real school-year bounds.
• Unit identity is shared with every other view.
• Year Map does not become a separate Map a Course silo.
• Prior-year reuse eventually belongs here or in a closely connected workflow.
• Year markers/stickers exist only here.


Canonical marker set
☺  ✂  ♕  $  ‼  abc  🔗  ☆  ⚑


16. FILTERS


Teachers can temporarily isolate
• one class or all classes;
• Everything / Units / Lessons / Magnets / Notes.


Filters combine, remain non-destructive, and may persist as user preferences.


17. SAVING + OWNERSHIP


P0 rule: all user-created Arc data must persist.


Persistence model
• authenticated Arc-private workspace store;
• teacher-owned Google Drive mirror where appropriate;
• durable local fallback if remote access is unavailable;
• reconcile/sync after connection returns.


Required save UX
• autosave;
• visible Save now;
• ⌘/Ctrl+S;
• truthful status such as Saved on this device / Saved to Arc account / Saved to Google Drive + Arc / Save problem;
• reconnect is recovery, never a restart of onboarding.


Teacher workspace is private by default. Each authenticated user has a separate workspace keyed to the authenticated user identity. Neither user may hydrate another user’s private data.


18. GOOGLE CALENDAR


Google events may appear as overlays inside Arc views when the teacher chooses calendars to display.


Google Calendar events remain separate from Arc lesson/unit data.


Connections need visible status, reconnect, and explicit refresh/sync behavior.


19. DESKTOP + MOBILE


Desktop
• calendar remains dominant;
• fixed/minimal Arc identity and core navigation;
• optional drawers overlay rather than squeeze the calendar;
• no lower blind bar;
• secondary tools do not crowd primary navigation.


Mobile
• same application and same canonical data;
• core mobile actions remain reachable through context-appropriate controls; exact dock labels are not fixed here and must follow the label-light shell and current Fridge/Live Classroom architecture;
• every core desktop action must remain reachable;
• touch dragging and tap/non-drag alternatives must be tested separately.


20. PAID / LATER PRODUCT FAMILIES


Do not allow these to block the first real teacher beta.


Later / potentially paid
• Sub Plans, including distinct daily and emergency flows;
• Student Leaders nested under the Sub Plans family;
• template management/import;
• prior-year reuse/import;
• shared spaces / teams / organization administration;
• expanded Google Docs write-through;
• selective Google Calendar sync enhancements;
• optional AI assistance controlled by the teacher.


Sharing remains explicit. Coworkers/friends never gain automatic access to a private workspace.


21. REJECTED / DO NOT REINTRODUCE


• Forced Week as Home for everyone.
• Lesson-plan page as Home.
• Lesson-template choice in onboarding.
• Redundant final school-calendar onboarding page.
• Fabricated Faculty meeting / Early release / First full week or any other demo local event.
• Fake official-source findings.
• Separate desktop and mobile products.
• Right-click or hidden shortcuts as the only way to perform core actions.
• Cramped permanent workbench that squeezes the calendar.
• Global permanent sticker tray.
• Duplicate Calendar link beneath the Arc logo.
• Generic dashboard cards that are not tied to teacher planning actions.
• Version-number CSS recovery layers.
• Parallel state stores that can disagree about the same plan or school calendar.
• Source-presence tests being treated as release-readiness proof.
• Automatic deployment after every tiny change.


22. TESTING + RELEASE GATES


Development loop
Change → automated behavioral tests → rendered desktop/mobile check → fix → intentional preview deployment → verify exact build fingerprint → beta gate.


Required exact-build gates before external beta
• clean first-run onboarding;
• all six views render and navigate correctly;
• Day/no-school behavior;
• add/edit/move/delete protected Lesson, Unit, and Note objects; capture/move/Discard Magnet; assign/change/clear priority relationships without cloning the underlying object;
• Unit nesting/order/detach;
• Tack / Extend / Unplace or move back to the Fridge with backstory preserved;
• Shift + fixed-date protection;
• Undo/Redo;
• landing preference/home behavior;
• keyboard-only core workflow;
• touch/mobile core workflow;
• dark mode;
• 200% zoom / smaller laptop;
• reduced-motion/high-contrast behavior;
• authenticated Save now → hard reload;
• Drive write-through/reconnect when enabled;
• two-account isolation;
• accumulated-data stress;
• no demo/fabricated user data;
• exact Arc logo / brand identity.


Hard stops
• visible nonfunctional core control;
• user data loss after reload;
• wrong-account hydration;
• partial movement corruption;
• fabricated data;
• archived/rejected interface regression;
• inaccessible mobile core action;
• false save/Drive success;
• deployed build fingerprint does not match expected commit.


23. BETA EVIDENCE RULE


Simulated teacher personas are useful scenario coverage but are not human beta research.


Every beta scenario should record
• action attempted;
• expected result;
• observed result;
• persistence evidence;
• recovery behavior;
• device/input mode;
• PASS / FAIL / BLOCKED;
• defect ID or growth area.


Repeated failure across 3+ personas automatically becomes Must Do and restarts the audit cycle.


24. GREENFIELD DELIVERY ORDER


Phase 0 — repository + deployment reset
• new GitHub repository;
• new Vercel project;
• new preview domain;
• build fingerprint visible in QA;
• old repository/project treated as archive only.


Phase 1 — trustworthy skeleton
• auth;
• canonical domain model;
• school-calendar service;
• persistence/local fallback;
• Arc shell + Home/view preference;
• course setup.


Phase 2 — core planning loop
• Week;
• Day;
• Unit/Lesson/Note CRUD;
• Fridge Door + magnet-depth movement;
• Unit Focus;
• Must/Should/Could;
• Undo/Redo.


Phase 3 — flexible planning
• Month / Quarter / Semester / Year Map;
• Shift;
• Tack / Extend;
• filters;
• Year markers.


Phase 4 — trust + beta
• Drive mirror;
• browser/device/accessibility gates;
• two-account isolation;
• accumulated-data stress;
• two-person real teacher beta.


Phase 5 — paid/later systems
• Sub Plans + Student Leaders;
• prior-year reuse;
• templates;
• collaboration/shared spaces;
• optional AI.


25. SOURCE OF TRUTH RULE


This document is the current product authority for the greenfield rebuild.


The prior ARC — Master Working File is historical evidence only. Old branches, deployments, ZIPs, preview URLs, and checkpoint numbers do not override this document.


When a product decision changes, update this document first. Then implement the change in one active repository and one active preview pipeline.


26. BUILD RECORD + RELEASE BRANCH RULE
Major build decisions are documented as they happen in the relevant canonical Google Drive document and repeated as an in-chat checkpoint. Git records implementation history; Drive records product and architecture authority; chat provides a recoverable running decision trail.


Repository discipline for the rebuild:
• main is release-only.
• feature/* contains active implementation work.
• develop is the integration and pre-release branch.
• previews come only from non-main branches until release clearance.
• every preview identifies its branch and commit SHA.
• nothing is merged to or deployed from main until the current build has passed the agreed product, functional, visual, accessibility, persistence, regression, and exact-build release gates and is explicitly judged ready to go.


Documentation discipline:
• update existing canonical documents rather than multiplying files;
• keep only documents with an active or enduring purpose;
• archive superseded working documents clearly;
• do not allow an old document, branch, deployment, screenshot, or ZIP to silently become authoritative again.


Rebuild order is intentionally constrained: frame/shell → navigation → calendar truth → movement and recovery → Day/Live Classroom teaching continuity → integrations → Fridge/reactive magnet depth system → visual polish and secondary systems. Features from prior builds do not enter early merely because code already exists for them.






BUILD CHECKPOINT — FRAME FOUNDATION
Date: September 2, 2026
Active branch: feature/frame-foundation-v2
Production/main status: untouched; no deployment performed.


Scope completed in this checkpoint:
• Removed nonfunctional placeholder controls from the frame.
• Established one global header band, one narrow view-rail region, and one uninterrupted calendar stage.
• Removed the permanent Ideas column from frame geometry; secondary tools must use the overlay layer so the calendar is not squeezed.
• Centralized canonical Wax & Wing / Arc color, spacing, radius, typography, line, and gutter values in design tokens.
• Added responsive frame behavior for desktop, small laptop/tablet, and narrow mobile widths.
• Added a working skip-to-calendar accessibility path and reduced-motion baseline.
• Kept calendar behavior, navigation behavior, secondary tools, integrations, and visual assets out of this pass intentionally.


Audit finding corrected during the pass:
The first reset skeleton contained clickable Search, Help, Profile, calendar navigation, Today/arrows, and Ideas-add controls without implemented behavior. These violated the Arc trust rule that visible core affordances must be real. They were removed before proceeding.


Verification status:
Source structure has been reviewed through the connected GitHub repository. A local dependency/build run could not be executed from the isolated runtime because outbound GitHub network resolution is unavailable there. This checkpoint is therefore SOURCE-REVIEWED, NOT YET RENDER-VERIFIED. No deployment was created merely to work around that limitation.


BUILD CHECKPOINT — CALENDAR PROJECTION LAYER
Date: September 2, 2026
Active branch: feature/calendar-truth
Production/main status: untouched; no deployment per
BUILD CHECKPOINT — RENDERED CALENDAR SKELETON
Date: September 2, 2026
Active branch: feature/calendar-truth
Production/main status: untouched; no deployment performed.


Scope completed in this checkpoint:
• Added one rendered calendar component family for Day, Week, Month, Quarter, Semester, and Year Map.
• All six renderers consume the canonical projection layer; no view contains independent date math.
• Added visual states for weekends, out-of-school-year padding, no-school/holiday/break/workday, and unknown dates without changing canonical truth.
• Kept horizontal overflow available on dense horizons rather than shrinking calendar cells into illegibility.
• Added an honest unconfigured state for the live workspace when no real SchoolCalendar and anchor date have been supplied.
• Removed the temporary fabricated render fixture from the live shell and then removed the unused fixture file entirely.


Trust correction during the pass:
A temporary render fixture was briefly connected to the shell to exercise the six-view renderer. This would have violated the rule against fabricated school data in a real workspace. The fixture was disconnected before checkpoint completion and deleted from runtime code. The live shell now shows no invented dates.


Verification status:
The underlying calendar and projection contracts remain compiler- and runtime-verified through the dependency-free calendar test harness. The new React rendering layer has been source-reviewed but is not yet render-verified because no preview deployment was created and the isolated runtime does not currently have the project React/Vite dependency set installed. No deployment was created merely to obtain a screenshot.


Canonical rule reinforced:
Rendered views may express the same calendar truth differently, but they may not own or invent date truth. If real calendar state is unavailable, Arc must say so rather than fill the workspace with sample data.
formed.


Projection rule: every calendar horizon is derived from the same canonical SchoolCalendar. A view may change presentation, density, and visibility, but it may not invent or reinterpret date truth.


Implemented in this checkpoint:
• Pure projections for Day, Week, Month, Quarter, Semester, and Year Map.
• Week projections align to Monday and retain all seven calendar days as facts.
• Month projections compute a complete Monday–Sunday grid around the anchor month without fabricating school status for padding days.
• Quarter and Semester projections use the canonical boundary objects already present in SchoolCalendar.
• Year Map uses exact school-year bounds and exposes the same quarter/semester boundaries.
• Projected days retain canonical kind/source/confidence and add presentation-safe flags for weekend and in-school-year status.
• Weekend visibility remains a display preference; it does not alter calendar truth.
• Projection contract tests were added to the existing calendar test command.


Audit finding corrected during the pass:
The first shared boundary helper returned a QuarterProjection | SemesterProjection union even when called with a literal boundary type. A real TypeScript compile check caught the mismatch. The helper API was corrected with exact overloads rather than hidden behind casts.


Verification:
The projection source compiled successfully under strict TypeScript after the fix. The projection contract then executed successfully against Day truth preservation, Monday week alignment, weekend flags, six-row August 2026 month geometry, unknown-day preservation, quarter/semester identity, and exact Year Map bounds.




BUILD CHECKPOINT — NAVIGATION FOUNDATION
Date: September 2, 2026
Active branch: feature/frame-foundation-v2
Production/main status: untouched; no deployment performed.


Scope completed in this checkpoint:
• Implemented one canonical navigation-state owner.
• Implemented six canonical calendar horizons: Year Map, Semester, Quarter, Month, Week, and Day.
• Month is the current new-user default home view.
• The Arc wordmark is a real Home control and returns to Month in this pass.
• Current-view state is visible in the navigation and announced semantically with aria-current.
• Desktop uses a left view rail; narrow mobile uses a horizontally scrollable bottom view rail so six horizons are not crushed into unreadable targets.
• Preserved the uninterrupted calendar canvas; navigation does not introduce secondary tools or drawers.
• Did not add Today, previous/next, date movement, calendar data, landing-preference persistence, Ideas, Shift, Search, Help, Profile, Easel, or integrations.


Audit finding corrected during the pass:
The first navigation draft inherited only five views and used “Year.” The canonical product spec defines six views and explicitly names Year Map and Semester. The implementation was corrected before closing this checkpoint.


Verification status:
Source structure has been reviewed in GitHub. This checkpoint is SOURCE-REVIEWED, NOT YET RENDER-VERIFIED. No preview or production deployment was created merely to obtain a render.






BUILD CHECKPOINT — CALENDAR TRUTH FOUNDATION
Date: September 2, 2026
Active branch: feature/calendar-truth
Production/main status: untouched; no deployment performed.


Core decision: calendar facts are modeled independently from calendar rendering. Missing dates are never silently assumed to be instructional. A missing date is `unknown`, and structural planning operations must not use incomplete calendar truth.


Implemented in this checkpoint:
• Canonical SchoolCalendar model with first/last day, explicit day records, quarters, and semesters.
• Explicit day kinds: instructional, no-school, teacher-workday, holiday, break, unknown.
• Calendar-day provenance fields for source and confidence.
• UTC/ISO date arithmetic to avoid local-time rollover errors.
• next/previous instructional-day movement and instructional-day range calculation.
• Quarter/semester boundary lookup and calendar structural validation.
• Calendar readiness preflight. Unknown days or structural errors block movement/recovery operations rather than being guessed through.
• Dependency-free TypeScript calendar contract test wired as `npm run test:calendar`.


Audit correction made during the pass:
The first calendar service draft treated unspecified weekdays as instructional. That was rejected because it could silently invent teachable time. The service now returns unknown for any date without an explicit normalized calendar record.


Verification:
The isolated TypeScript calendar service was compiled and executed against contract cases covering month rollover, leap day, invalid dates, unknown-day handling, teacher-workday skipping, forward/backward instructional movement, instructional-day ranges, and readiness blocking. Assertions passed. Full application rendering remains intentionally outside this checkpoint.




Checkpoint — Calendar Hydration Foundation
Branch: feature/calendar-hydration
Commit: c64cd7256b2ed7266d5813eedaf2ad54289a14f7


Canonical decisions:
• Arc hydrates school calendars only from an explicitly declared instructional-week pattern plus explicit exceptions. It never invents a normal school week.
• Hydration creates one explicit calendar record for every date inside the school-year bounds. Declared instructional weekdays become instructional; undeclared weekdays become explicit no-school days; exceptions override the pattern.
• Duplicate exceptions, duplicate weekday declarations, invalid dates, and exceptions outside school-year bounds are rejected rather than silently resolved.
• Exception-level provenance overrides pattern provenance; otherwise exceptions inherit the pattern source/confidence.
• A weekend may be instructional when explicitly declared or overridden. Display treatment must never redefine calendar truth.
• Calendar readiness now requires every school-year date to be explicit AND confidence=confirmed. Mixed or inferred dates block structural planning even when there are no unknown dates.
• Unknown remains a first-class state and always blocks structural movement.
• The canonical calendar public API is exposed through src/calendar/index.ts so future features consume one domain boundary rather than internal files directly.
• Every preview build runs calendar truth, projection, and hydration contracts before the application compile/bundle.


Verification at this checkpoint:
• calendar truth contract passed
• calendar projection contract passed
• calendar hydration contract passed
• TypeScript application compile passed
• Vite production bundle passed
• Vercel feature-branch preview build passed
• No production release; main remains untouched


Still intentionally excluded: import-provider adapters, setup UI, persistence, lessons/units/notes, movement/recovery UI, Easel, integrations, and production deployment.




30. PRUNE + PERSISTENCE CHECKPOINT — 2026-09-02


Project pruning completed before further feature work. Active authority is now explicit: main remains release-only; develop is the integrated pre-release source of truth; one current feature branch is used for active implementation; archive/pre-frame-reset-2026-09-02 is the preserved rollback point. Historical branches remain physically present because the connected GitHub tooling does not expose branch deletion, but they are explicitly non-authoritative and must not be used for new work, previews, audits, or recovery unless requested.


Superseded Google Drive documents were visibly archived rather than left competing with current authority, including the pre-greenfield rebuild guide, superseded brand/style guide, duplicate market-research copy, and prior beta-test report. The canonical Product Spec and canonical Brand System remain the active authorities.


Calendar persistence is now integrated through develop at commit 604f1574e6fc5d201acd86d3fd7f485b31e6da62. Persistence stores the teacher's original CalendarHydrationInput declaration in a versioned browser payload, not a serialized hydrated runtime calendar. On reload Arc parses, validates, re-hydrates, and structurally validates the declaration before use. Malformed JSON, unknown schema versions, invalid weekdays, duplicate exceptions, invalid term boundaries, unavailable browser storage, or otherwise untrusted data fail closed. Invalid or unavailable persistence is surfaced to the teacher instead of silently becoming an empty calendar.


The feature-branch gate passed calendar truth, projection, hydration, and persistence contracts, followed by full TypeScript compilation and Vite production bundling. Account-backed/cloud persistence is not yet implemented; current persistence is browser-local and intentionally versioned behind a replaceable storage boundary.




31. SAFE PERIOD NAVIGATION CHECKPOINT — 2026-09-02


Calendar period navigation is integrated through develop at commit ef8fc45546558dac8bf9d49281f14d53dfde36ba. Previous / Today / Next controls are view-aware and derive movement from the loaded SchoolCalendar rather than UI-local date guesses.


Movement contract:
• Day moves one calendar day and stops at school-year bounds.
• Week moves seven calendar days and stops at school-year bounds.
• Month moves one month using UTC-safe month math and clamps invalid month-end days safely.
• Quarter moves only between explicit quarter boundaries.
• Semester moves only between explicit semester boundaries.
• Year Map does not fake navigation into an unloaded school year; previous/next remain unavailable.
• Today uses the browser's current local date and is available only when that date is inside the loaded school year.


Controls are disabled when the underlying movement is unsupported, including Quarter/Semester when term boundaries have not yet been declared. This is intentional: unavailable truth appears unavailable rather than broken or guessed.


The final feature-branch preview identified branch feature/calendar-period-navigation and exact commit 736c5666e25c44464de99232a9f7b6627faeddda and reached READY. Its build executed and passed calendar truth, projection, hydration, persistence, and navigation contracts, followed by TypeScript compilation and Vite production bundling. Documentation-only commit ef8fc45546558dac8bf9d49281f14d53dfde36ba was then integrated to develop. main remains untouched.




32. PRE-PLANNING OBJECT AUDIT — HARDENING CHECKPOINT
Date: September 2, 2026
Integrated branch after audit: develop
Integrated SHA: 9867cf9717de5e0bd9cd49a2b4ce74d97a495a46
Main remains untouched.


Audit scope:
- branch/SHA provenance and preview status
- calendar truth, projection, hydration, persistence, navigation, and manual-edit invariants
- date setup/edit preservation
- term-boundary ambiguity
- accessibility contrast for focus, controls, and text actions
- calendar readability/orientation
- dependency determinism


Material issues found and fixed:
1. Top-level dependencies used `latest`; React, React DOM, Vite, plugin-react, and React type packages are now pinned to exact versions. A committed package lockfile is still required before release-level reproducibility clearance.
2. Quarter and Semester could be selected without configured boundaries and open dead calendar states. Unavailable term views now remain visibly unavailable until their truth exists.
3. Visible calendar labels used raw ISO strings and weak orientation. Day/Week/Month now use human-readable localized labels, weekday context, and fuller accessible date labels.
4. Term boundaries could overlap or duplicate IDs, leaving navigation ambiguous. Hydration now rejects malformed, overlapping, out-of-range, reversed, or duplicate-ID term boundaries.
5. Dusty-blue focus rings failed non-text contrast against paper. A darker focus-only blue token now clears the focus-indicator requirement while canonical dusty blue remains available for non-critical use.
6. Terracotta text actions failed AA for normal text. A darker terracotta text token is now used for text-bearing actions while canonical terracotta remains an accent color.
7. Standard 22%-ink control borders were too faint for form/control boundaries. Controls now use a separate higher-contrast border token; decorative hairlines remain light.
8. Editing calendar dates silently dropped quarter and semester boundaries. Date edits now preserve unrelated term structures.
9. Calendar identity was derived from the editable school-year label. Manual calendars now receive a stable ID that survives renaming and date edits.


Verification:
- exact hardened functional preview SHA: 4074170fa94007ae923a692dade8516ff6581a26
- six calendar contracts passed: truth, projection, hydration, persistence, navigation, manual setup/edit preservation
- TypeScript compile passed
- Vite production bundle passed
- Vercel preview reached READY
- exact preview returned HTTP 200 with expected Vite assets


Audit limitation:
Interactive browser automation is not available in the current runtime. Keyboard/click behavior was source-reviewed and contract-backed but not physically browser-driven here. This remains an explicit release gate, not an assumed pass.


Audit disposition:
CLEAR TO CONTINUE INTO TERM-BOUNDARY CONFIGURATION.
NOT RELEASE-READY.
Do not begin Units/Lessons until term-boundary configuration is built and audited against these preservation rules.




33. TERM BOUNDARY CONFIGURATION + REPRODUCIBLE BUILD CHECKPOINT
Date: September 2–3, 2026
Integrated branch: develop
Integrated checkpoint: 78e6f301c7f2a525f65a30bc3c56a36bc91a2f62
Release branch: main remains untouched.


TERM TRUTH
- Quarter and Semester configuration are now teacher-facing calendar truth rather than placeholder views.
- Term editing is separate from Edit dates. Changing terms cannot silently alter instructional days, exceptions, or calendar identity.
- Quarter/Semester dates are never inferred. The teacher/source declares them explicitly.
- Term IDs remain stable across edits.
- Same-type overlaps, malformed/reversed dates, duplicate IDs, and out-of-year boundaries are rejected.
- When quarters and semesters are both configured, every quarter must fit entirely inside one semester.
- Native date controls are bounded to the configured school year.
- If a term edit leaves the current Quarter/Semester anchor outside any remaining matching boundary, Arc returns safely to the default Month view instead of displaying a dead term state.


TERM CONTEXT ACROSS VIEWS
- Day exposes its containing quarter/semester quietly.
- Week and Month expose intersecting term context without stealing calendar space.
- Quarter and Semester show their confirmed date span.
- Year Map exposes the full configured term structure.
- All term context derives from the canonical SchoolCalendar; views do not own separate term logic.


PERSISTENCE + CROSS-FEATURE SAFETY
- Term boundaries survive serialization, reload, re-validation, and re-hydration.
- Calendar date editing preserves existing terms.
- Term editing preserves calendar date declarations and exceptions.
- Calendar and term identity remain stable through display-label changes.


REPRODUCIBLE BUILD GATE
- Exact top-level dependencies are pinned and a real package-lock.json (lockfileVersion 3) is now committed.
- GitHub Actions provides an independent verification surface using Node 22, npm ci from the committed lockfile, the full Arc contract suite, TypeScript compilation, and Vite production bundling.
- Seven calendar contracts are now gated: truth, projection, hydration, persistence, navigation, manual setup, and term configuration.
- The exact term milestone passed GitHub Actions independently of Vercel.
- Vercel Hobby branch previews hit the platform build-rate limit during this milestone. Arc did not create another preview project or bypass the release/deployment rules. This was treated as an infrastructure limitation, not as evidence of source failure.


FOCUSED TERM AUDIT FINDINGS FIXED
- Term persistence is now explicitly tested, not assumed.
- Editing a term can no longer strand the active Quarter/Semester view in a gap.
- Cross-semester quarters are rejected.
- Term context is visible but subordinate to the calendar.


CURRENT CLEARANCE
- Term architecture/data integrity: cleared for the next planning-domain layer.
- Dependency-lock/reproducible CI gate: cleared.
- Physical browser click/keyboard/responsive verification: still an explicit release gate and not assumed.
- Units/Lessons are not yet implemented.
- main/production remain untouched.


NEXT BUILD ORDER
Calendar truth → Terms [complete] → Units → Lessons → Movement/Recovery.




34. UNIT DOMAIN FOUNDATION — COURSE / SECTION / UNIT SEPARATION
Date: September 3, 2026
Integrated branch: develop
Integration record commit: 56c2e932c43a8702ad9255cdd122689a1fcb89a8
Release branch: main remains untouched.


CORE MODEL DECISION
- Course is the shared curriculum identity (for example AP Art History).
- Section is a specific teaching group/instance (for example Period 2, Period 5, Period 7) that references a Course and school calendar.
- Unit belongs to Course + calendar, never directly to Section.
- Multiple Sections may therefore share one Unit/Lesson plan while later carrying different live teaching progress.
- Section-specific delivery/recovery state is intentionally deferred to the later teaching-state layer; it must not be stored on Unit.


WHY THIS MATTERS
This model is required for Arc’s canonical continuity scenario: Period 2 can finish a lesson, Period 5 can stop after the demo, and Period 7 can never start while all three still reference the same underlying Course/Unit/Lesson plan. Arc can then preserve divergence without duplicating curriculum.


UNIT INVARIANTS
- Unit has stable identity independent of its placement dates.
- Unit may exist unplaced.
- Placing, moving, or unplacing a Unit cannot change its ID, title ownership, Course ownership, or calendar ownership.
- Unit placement requires complete confirmed SchoolCalendar truth.
- A placed Unit must remain inside the loaded school year and contain at least one confirmed instructional day.
- Unit cannot silently attach to a different SchoolCalendar.
- Unit quarter/semester relationships and instructional-day count are derived from current calendar truth; they are not stored as stale term foreign keys.
- Course/Section/Unit ownership has explicit validation helpers.


TEST / BUILD ARCHITECTURE
- The obsolete calendar-only test compiler was removed.
- The build now runs a domain-wide contract suite using tsconfig.contracts.json.
- Current contracts cover calendar truth, projections, hydration, persistence, navigation, manual calendar setup, term configuration, Course/Section scope, and Unit behavior.
- Unit domain contract verifies stable identity, immutable placement, unplaced state, confirmed-calendar gating, school-year bounds, non-instructional-only rejection, calendar mismatch rejection, and derived term membership.
- Course/Section contract verifies that multiple Sections can share one Course/Unit plan while unrelated Courses remain isolated.


CURRENT CLEARANCE
- Unit domain architecture: integrated and structurally cleared.
- Unit teacher-facing UI: not built.
- Course/Section teacher-facing setup + persistence: not built.
- Lessons and Section-specific delivery state: not built.
- No fake Course/Section data should be introduced merely to render Unit UI.
- Next implementation should establish real teacher-facing Course/Section scope before Unit creation UI, then render Units against that real scope.




BUILD CHECKPOINT — TEACHER CLASS SETUP
Date: September 2, 2026
Integrated branch: develop
Integrated SHA: da59e84ff299e0df6d359b96a448511d18eeecc6
Production/main status: untouched; no production deployment performed.


Scope completed:
• Added teacher-facing Classes setup after calendar truth and term setup.
• Teachers define each shared Course once, then attach real periods/sections to it.
• No sample or demo classes are created.
• Course owns shared curriculum; Section represents one actual teaching group.
• Course and Section identities are generated by the planning domain and remain stable through edits.
• Removing a Course also removes its dependent Sections rather than creating orphan records.
• Sections cannot silently reference a missing Course or a different school calendar.
• Added versioned browser persistence for validated Course/Section declarations.
• Reload restore re-validates planning scope before Arc accepts it.
• Class setup is an editor state over the calendar; it does not permanently reduce calendar space.
• Added planning-workspace persistence and foreign-key behavior to the domain contract suite.


Verification:
• Exact feature head d71eb06165dcb55bd3548f0bde30348ed101f52b passed GitHub Actions.
• Exact integrated develop head da59e84ff299e0df6d359b96a448511d18eeecc6 passed GitHub Actions from the committed lockfile.
• main remains untouched.


Next authorized build layer:
Unit persistence + first real Unit creation/editing surface using the teacher-defined Course/Section workspace. Unit UI must not invent classes or duplicate curriculum per Section.




BUILD CHECKPOINT — UNIT PERSISTENCE + FIRST REAL UNIT EDITOR
Date: September 2, 2026
Integrated branch: develop
Integrated SHA: 49e0f84fb0985b90cab84009722cec283259f44c
Production/main status: untouched; no production deployment performed.


Scope completed:
• Added first teacher-facing Unit creation/editing surface using the teacher’s real Course workspace; no demo/sample Courses or Units are invented.
• Units preserve stable identity across edits, placement changes, persistence, and reload.
• Units may remain unscheduled.
• Placed Units require at least one confirmed instructional day and must remain inside the loaded school-year bounds.
• Added versioned Unit persistence and revalidation against current calendar truth and Course ownership on restore.
• Duplicate Unit identities, missing Course references, wrong-calendar references, and invalid placements are rejected.
• Courses referenced by existing Units are protected from destructive removal.
• Added cross-layer protection: Arc refuses calendar edits that would strand an existing Unit outside the school year or remove all instructional days from its placement. Arc does not silently auto-shift or repair the Unit.
• Added explicit domain-contract coverage for Unit workspace persistence and calendar/Unit integrity.
• Unit and Class editors remain temporary editor states; the calendar remains the dominant product surface.


Verification:
• Hardened feature head 3d7c24eca2f878d838bb1f8b3f31876119580424 passed GitHub Actions from the committed package lockfile.
• Integrated develop head 49e0f84fb0985b90cab84009722cec283259f44c completed the build gate successfully in GitHub Actions.
• main remains untouched.


Next build layer:
Lesson domain + per-Section delivery state. Lesson must remain shared curriculum under Course/Unit, while Section-specific progress records where each actual class stopped, completed, skipped, or needs to resume. Do not begin with Lesson UI; define identity, nesting, delivery-state divergence, and recovery invariants first.




36. LESSON CONTINUITY + SECTION DELIVERY STATE CHECKPOINT
Date: September 2, 2026
Integrated branch: develop
Integrated checkpoint SHA: ee82f4dde37f0c6b618bc1ca44aea868f0d9e5a1
Production/main status: untouched; no production deployment performed.


Scope completed:
• Added stable shared Lesson objects beneath Units; Lessons belong to Course + Unit + school calendar, never directly to one Section.
• Added optional Lesson planned dates constrained to the placed Unit and confirmed instructional days.
• Added sparse per-Section delivery state with not-started, in-progress, completed, and skipped states.
• Missing delivery state derives as not-started; Arc stores only real divergence rather than every Lesson × Section pair.
• In-progress delivery state requires an actual teaching date and a resume note so Arc can preserve exactly where that Section stopped.
• Completed delivery state requires the actual teaching date.
• Proven canonical scenario: one shared Lesson can be completed in Period 2, interrupted after the demo in Period 5 with a preserved resume note, and untouched in Period 7 without cloning the Lesson.
• Added versioned Lesson continuity persistence and restore-time revalidation against current calendar, Classes, Units, ownership, and instructional-day truth.
• Added dependency protection: Units containing Lessons cannot be silently removed; Sections with recorded progress cannot be silently removed; Lessons with teaching history cannot be casually removed.
• Cross-Course Lesson moves with teaching history are refused instead of clearing or detaching that history.
• Calendar, Class, and Unit edits are revalidated against existing Lesson continuity before Arc accepts them.
• Added first teacher-facing Lesson continuity editor separating the stable shared plan from class-by-class progress.


Verification:
• Lesson divergence and Lesson workspace/persistence contracts are part of the domain-wide gate.
• Exact Lesson feature head passed npm ci, all domain contracts, TypeScript, and Vite before integration.
• develop integration checkpoint is being independently reverified from the committed lockfile.
• Interactive browser click/keyboard verification remains a later release gate and has not been falsely claimed.


Next build seam:
Recovery preview / Shift logic. Arc must derive consequences from Section divergence and calendar truth, preview them before consequence, preserve fixed dates and resume notes, and make no schedule mutation until the teacher explicitly applies a validated operation.




37. RECOVERY CONSEQUENCE PREVIEW CHECKPOINT
Date: September 2, 2026
Integrated branch: develop
Integration checkpoint SHA: 813762d7fcf044f8273cb33b1643e06067ba60bc
Production/main status: untouched; no production deployment performed.


Scope completed:
• Added explicit Lesson date policy: flexible or fixed.
• Fixed Lessons require a real planned date. Legacy saved Lessons created before this field existed migrate to flexible, never fixed.
• Added pure RecoveryPreview domain logic. It derives the next confirmed instructional resume day from the canonical SchoolCalendar, preserves the exact Section resume note, identifies flexible Lessons affected before the next fixed anchor, and surfaces the fixed anchor without changing it.
• Canonical scenario is now executable: Period 5 interrupted Wednesday resumes Thursday; Thursday Lesson 18 is surfaced as the flexible collision; Friday test remains the fixed anchor.
• Recovery preview is explicitly non-mutating and contract-backed. The preview object records mutationApplied=false and tests verify Lesson/delivery state are byte-for-byte unchanged after preview generation.
• If no future confirmed instructional day exists inside the loaded school year, recovery blocks with an explicit reason instead of inventing a date.
• Added teacher-facing Recovery review. It appears only when genuine in-progress Section state exists and shows resume date, saved stop note, flexible pressure, and fixed anchor.
• Recovery review is read-only. There is intentionally no Apply/Shift control in this checkpoint.


Standing rules established:
• Preview before consequence remains absolute.
• Flexible means eligible for movement review, never silent movement.
• Fixed means Arc may surface a collision but may not move the Lesson automatically.
• Recovery preview cannot mutate Lessons, dates, Units, or Section delivery state.
• Any future Shift/apply implementation must consume the proven preview contract rather than inventing separate movement rules.


Verification:
• Recovery preview and fixed-date migration tests are part of the domain-wide build gate.
• Exact feature head e225b6efd9e9910f0c16bbf1672882f46964a218 passed npm ci, all domain contracts, TypeScript, and Vite before integration.
• develop integration checkpoint is independently reverified after integration.


Next build seam:
Atomic recovery/Shift operation with explicit teacher approval and whole-operation undo. No drag UI or automatic movement should be added before the mutation object, validation, and reversal contract are proven.




39. SHIFT / RECOVERY RUTHLESS HARDENING + HOUSEKEEPING — 2026-09-03


Integrated develop checkpoint: a93f9d27486c345bb5716ed1c01adef0ba616c2c


Purpose: stop feature work and aggressively review the recovery/Shift function against prior code, current teaching-state rules, repository hygiene, and build infrastructure before persistence or Apply Shift UI.


Findings corrected:
• Recovery previously treated scheduled work as future pressure even when that Section had already completed or skipped it. Recovery now reads live Section delivery state and excludes finished/skipped work.
• Recovery Shift now independently refuses to move completed or skipped Section work, so a malformed future caller cannot bypass the preview safeguard.
• Recovery consequence dates that include Section overrides are now named effectiveDate rather than plannedDate; redundant preview date-policy data was removed.
• Section schedule collision validation now ignores completed/skipped work and validates calendar ownership consistently across Class, Unit, Lesson, and schedule workspaces.
• Existing safeguards remain: Section-scoped Undo, stale-Undo refusal, fixed-anchor immutability, no-op Shift rejection, explicit collision resolution, Unit/calendar bounds, and no shared-Lesson mutation.


Housekeeping/pruning:
• README was cut back to a repository operating contract. Milestone history remains in this canonical Product Spec rather than being duplicated in Git.
• Contract execution moved from an unreadable package.json shell chain to tests/run-contracts.mjs.
• Contract compilation remains explicit via the pinned local TypeScript binary; the runner no longer invokes npx or any opportunistic package download path.
• GitHub verification is now read-only. CI no longer rewrites/commits package-lock.json. It installs only from the committed lockfile with npm ci, then runs the full build gate.
• Historical feature branches remain physically present because the connected GitHub surface does not expose branch deletion. They are explicitly non-authoritative; main, develop, the current feature branch, and the preserved archive checkpoint are the only authority lines.


Hostile coverage added/retained:
• completed future Lesson excluded from Recovery consequence preview;
• skipped/completed Lesson cannot be moved by recovery Shift;
• existing Section override is used as the effective recovery date;
• fixed anchor can be found in a later Unit across the same Course;
• completed/skipped work does not create false same-day collision pressure;
• mismatched Class/calendar workspace is rejected;
• unrelated Section changes survive another Section's Undo;
• same-Section newer work invalidates stale Undo;
• no-op, weekend/no-school, fixed-date, stale-preview, orphan, duplicate, calendar-closure, Unit-shrink, and unresolved-collision cases remain blocking.


Open gates remain deliberate: Section schedule + Undo persistence/reload; teacher-facing Apply/Undo; explicit teacher-approved multiple-Lessons-on-one-day behavior; browser-driven keyboard/click/responsive verification. No production release. main untouched.




40. SHIFT PERSISTENCE + RELOAD-SAFE UNDO CHECKPOINT — 2026-09-03


Integrated branch: develop
Integrated commit: 3d609db3ef2a07337c29508623a04acf1e7b79c1


Persisted state now stores a versioned Section schedule payload containing the calendar ID, Section-specific Lesson date overrides, and an optional Shift Undo token. Restore order is parse → validate durable Section schedule → restore schedule → validate Undo structure and current applicability. Durable schedule state outranks Undo capability: malformed, stale, orphaned, or newly-illegal Undo data is discarded without discarding a valid Section schedule.


Undo is restored only when its affected Section still exactly matches the applied snapshot and its previous snapshot is itself valid under the current calendar, Classes, Units, Lessons, and collision rules. A later calendar closure, Unit change, Lesson change, or same-Section schedule edit may invalidate Undo while leaving the current durable schedule intact.


The shell restore chain is now Calendar → Classes → Units → Lessons → Shift. Recovery Review consumes persisted Section overrides so consequence previews use the effective Section schedule after reload rather than reverting to shared Lesson dates.


Upstream edits now reconcile against persisted Section schedule state before commit. If an edit would invalidate the durable Section schedule, Arc refuses the edit. If only Undo becomes unsafe, the edit may proceed and Undo is dropped. Storage failure is surfaced explicitly.


Hostile persistence contract covers: exact serialization round-trip; malformed JSON; unknown schema; malformed dates; malformed Undo; stale Undo after a valid same-Section change; invalid durable schedule collision; previous Undo snapshot becoming illegal after calendar truth changes; browser reload preserving valid schedule while dropping stale Undo; and invalid schedule failing closed.


Feature exact-head verification passed at dc22be96c54cddebc9b3ae78658a3ddee9dd437f using read-only CI with npm ci, full domain contracts, TypeScript, and Vite production bundle.


Teacher-facing Apply Shift / Undo controls remain intentionally unbuilt. Same-day multi-Lesson explicit approval remains an open product rule. main remains untouched.




41. EXPLICIT APPLY SHIFT + RELOAD-SAFE UNDO INTERACTION CHECKPOINT — 2026-09-03


Status: integrated into develop after exact feature-head verification. Main remains untouched.


Interaction contract
- Recovery review remains consequence-first. Nothing moves until the teacher explicitly chooses required destination dates and presses Apply Shift.
- Recovery resolution offers confirmed instructional dates inside the affected Lesson's Unit. Displaced flexible work must move after the class resume date; backward recovery destinations are rejected in both UI and domain logic.
- Shift binds to the interrupted Lesson's exact reviewed effective fromDate, including a legitimate null for an unscheduled interrupted Lesson. Stale reviewed state cannot apply.
- If an interrupted Lesson is fixed, Recovery blocks before an Apply operation is offered. Fixed anchors are never silently moved.
- Apply changes only the target Section schedule. Shared Course/Unit/Lesson dates and unrelated Sections remain unchanged.
- Every resulting Section schedule is revalidated as a complete persisted workspace before the UI commits it.
- After successful Apply, an in-progress class may remain visible in Recovery, but Arc does not reoffer the same already-applied Shift when the effective schedule already makes room.
- One whole-operation Undo is exposed only while its Section-scoped token remains valid. Undo revalidates the restored schedule before commit and cannot overwrite newer work in that Section.


Reload and persistence semantics
- Shift restore now distinguishes undoStatus = none | restored | discarded.
- A saved schedule with no Undo does not generate a false discarded-Undo warning.
- Malformed, stale, or newly-illegal Undo is discarded while a valid durable Section schedule is preserved.
- Invalid durable Section schedule state still fails closed.


Inconsistencies caught and corrected during this pass
- Recovery preview originally lacked the interrupted Lesson effective fromDate required for stale-preview enforcement.
- Reload could not distinguish absent Undo from discarded Undo.
- Recovery could have reoffered an already-applied Shift while delivery state remained in-progress.
- Initial resolution options could include instructional dates before the interruption.
- An unscheduled interrupted Lesson was briefly treated as ineligible for recovery instead of using fromDate null.
- An interrupted fixed Lesson could have reached an Apply path that the mutation domain would necessarily reject.
- New recovery select styling briefly referenced a nonexistent focus token; corrected to the canonical accessible focus-blue token.


Verification
- Added explicit recovery Shift draft contract.
- Added end-to-end recovery Apply contract covering preview → explicit resolution → Apply → persistence → reload → no duplicate Apply → Undo.
- Canonical scenario proves P5 Lesson 17 Wednesday → Thursday, P5 Lesson 18 Thursday → teacher-selected Monday, Friday fixed test unchanged, P2/P7 shared plan unchanged, reload preserves P5 effective schedule and valid Undo, and Undo restores exact prior P5 schedule without touching P2/P7.
- End-to-end contract also covers interrupted fixed Lessons and unscheduled interrupted Lessons.
- Feature diff was scoped to recovery/Shift code, contracts, styles, and contract manifest; feature was zero commits behind develop before integration.
- Exact feature head 15f3cc827076592ccc485e5d0e9833cd64aad757 passed read-only lockfile-backed CI before integration.
- Integrated develop checkpoint commit: 0119588b8b19eb9c98f1071325edd6c59d3b75fd. Integration CI required before this checkpoint is considered fully closed.


Still open
- Browser-driven keyboard/click/responsive verification of Apply/Undo remains a release gate and is not being inferred from source/build success.
- Explicit teacher-approved same-day multi-Lesson behavior remains unmodeled; current live collisions block Shift.
- Unit/Lesson rendering across calendar horizons, account-backed sync, integrations, and production release remain later work.




42. APPLY / UNDO HOSTILE INTERACTION AUDIT — 2026-09-03


Scope: teacher-facing recovery Apply Shift and Undo after persistence integration.


Findings fixed:
- Successful Apply previously left the teacher inside Recovery Review while the promised Undo control was hidden. Apply now returns to the calendar immediately so the one Undo is visible with the persisted status message.
- Recovery date selectors previously offered instructional dates that were already occupied by live or fixed Section work, forcing the teacher to discover a predictable collision only after pressing Apply. Destination preflight is now a domain function and excludes occupied live/fixed dates, closures/non-instructional dates, the current date, and dates on/before the resume date under the current collision-blocking policy.
- Duplicate recovery destinations are rejected before Shift operation creation while same-day stacking remains disabled.
- Completed/skipped work does not reserve future destination dates.


Verification:
- New recovery-resolution hostile contract covers fixed occupancy, live occupancy, no-school dates, completed-work reuse, forward-only recovery, and duplicate destination rejection.
- Existing end-to-end recovery contract remains in the full build gate.
- Exact feature audit head dee2d7515ccca227698ccee5ad7fdde0b2e6a459 passed npm ci, all domain contracts, TypeScript, and Vite before integration.
- Integrated develop checkpoint begins at that audited head; main remains untouched.


Unverified release gate:
- Browser-driven keyboard/click/responsive interaction could not be executed in the current runtime because the browser automation binary is unavailable. This remains an explicit release blocker, not an inferred pass.


Next domain seam:
- Teacher-approved same-day multi-Lesson behavior must be explicit permission, not a global weakening of collision integrity. Ordinary same-day collisions remain errors unless the teacher deliberately approves the Section/date combination.




43. SAME-DAY LESSON APPROVAL — DOMAIN FOUNDATION


Purpose: support the real teacher case where more than one live Lesson may intentionally occupy the same Section/date without weakening Arc's default collision protection.


Model:
- Same-day permission is explicit, not global.
- Approval identity is exact to one Section, one confirmed instructional date, and one exact Lesson ID set.
- An approval for two Lessons does not approve a third; an approval for one date does not carry to another date; an approval for one Section does not carry to another Section.
- Approval requires at least two unique Lesson IDs and a confirmed instructional date.


Schedule integrity:
- Multiple live Lessons on the same Section/date remain an error by default.
- Section schedule validation accepts the collision only when an exact approval covers the live Lesson set on that date.
- Completed/skipped work does not create future collision pressure and does not require same-day approval.


Shift integration:
- Shift recognizes an existing exact approval and may apply the approved same-day result.
- Shift does not create, infer, broaden, or delete approval state.
- Unapproved same-day collisions remain blocking.
- A cross-layer inconsistency was corrected: Shift collision validation now excludes completed/skipped Lessons, matching Recovery and Section schedule integrity.


Verification:
- Feature branch: feature/same-day-lesson-approval.
- Domain checkpoint head 76c78d55feafbdb2c855034274fa7cf2889fbed6 passed npm ci, the full domain contract suite, TypeScript, and Vite before integration.
- Integration checkpoint on develop begins at that green domain head; main remains untouched.
- Contract proves default collision rejection, exact approval permission, non-transfer across Section/date/Lesson set, no-school rejection, duplicate Lesson-ID rejection, Shift recognition, and completed-work collision exclusion.


Deliberate boundary:
- Same-day approval persistence is NOT implemented in this checkpoint.
- Teacher-facing approval UI is NOT implemented in this checkpoint.
- Current Shift persistence/AppFrame does not yet own approval state. Adding persistence without first establishing one explicit owner could allow Apply/Undo/reconciliation to drop appro


44. REDEVELOPMENT CHANNEL AUDIT + BLUEPRINT RECONCILIATION — 2026-09-03


Purpose: clear implementation drift before continuing feature work; compare current develop against the updated blueprint, canonical Brand System, repository authority, build infrastructure, and actual redevelopment sequence.


CURRENT AUTHORITY
- develop at audit start: 293aaddddcc5a1931f150f209e54b6839c1f9ee6.
- main remains release-only and untouched at fadb208f8284f1bbc7788444e07988a3a280f7ee.
- feature/redevelopment-audit-cleanup is the only active audit implementation branch.
- all other feature/checkpoint/easel/rebuild branches are historical, abandoned, accidental, or reference-only. They must not be used as new-work source even though physical branch deletion is unavailable through the connected GitHub surface.
- feature/same-day-approval-persistence is explicitly abandoned/reference-only. Its eight unintegrated commits are not part of Arc truth.


BLUEPRINT RECONCILIATION
The older Phase 0–5 list remains useful as a completeness checklist, but Rule 26’s later constrained rebuild order is authoritative when sequencing conflicts:
frame/shell → navigation → calendar truth → movement/recovery → Day/Easel teaching continuity → integrations → visual polish/secondary systems.


Current position in that newer order: movement/recovery proof is substantially complete at the domain + teacher-facing Apply/Undo level; Day/Easel continuity is the next product layer. However, older platform obligations remain incomplete and must not be accidentally marked done merely because later domain work exists.


What is genuinely complete/integrated:
- greenfield shell and six calendar horizons;
- normalized school-calendar truth, manual declarations, term boundaries, local persistence, and safe period navigation;
- real Course/Section setup;
- Unit and Lesson foundations with stable shared curriculum and sparse per-Section delivery state;
- recovery consequence preview;
- Section-scoped atomic Shift Apply, browser-local persistence, reload-safe Undo, stale-preview protection, fixed anchors, and hostile collision preflight;
- exact same-day approval domain foundation only.


What is NOT complete:
- auth and account identity/isolation;
- landing-view preference persistence;
- Unit/Lesson rendering as actual planning objects across Week/Day/Month/Quarter/Semester/Year Map;
- Day as a real teaching-continuity surface;
- Easel as Arc’s live teaching surface;
- Note / Ideas / Unit Focus / Must-Should-Could / Tack / Extend / filters / Year markers;
- account-backed Arc-private persistence, Google Drive mirror, offline reconciliation, and Save-now status model;
- browser-driven keyboard/touch/responsive verification;
- external beta readiness.


AUDIT FINDINGS
1. BUILD FINGERPRINT GAP. The canonical Product Spec required every preview to expose a human-readable build ID and Git SHA, but develop had no visible fingerprint. feature/redevelopment-audit-cleanup adds a visible build fingerprint sourced from Vercel/GitHub build SHA. Exact cleanup head must pass the full build gate before integration.
2. LEGACY CLOUDFLARE PIPELINE RESIDUE. The current develop SHA passed Arc’s GitHub Actions verification but also received a failed Cloudflare Workers production check. Cloudflare is not the canonical preview/release path for this rebuild and should be disconnected at repository/app administration level. The available connector cannot perform that external disconnection, so this remains an explicit ops cleanup item rather than a falsely claimed fix.
3. BRANCH GOVERNANCE IS NOT TECHNICALLY ENFORCED. main and develop are reported as unprotected. Policy says main is release-only and develop is integration-only, but repository branch protection/rulesets still need admin-level enforcement.
4. BRANCH COUNT IS OPERATOR RISK. Historical branch accumulation is now large enough to increase stale-source mistakes. Physical deletion is unavailable in the connected GitHub surface; therefore authority must remain explicit and future work must create only one current feature branch at a time.
5. APPFRAME IS APPROACHING GOD-COMPONENT STATUS. AppFrame currently owns restore chains, multiple persistence layers, editor routing, recovery mutation, Undo, navigation, notices, and shell orchestration. This was acceptable for proving vertical slices but is now architectural debt. Before Day/Easel or secondary systems expand the shell, workspace restoration/persistence/mutation orchestration should be extracted behind a stable application boundary.
6. SAME-DAY PERSISTENCE WAS PREMATURE. The exact approval domain is useful and remains integrated, but persisting/undoing the exception before ordinary Unit/Lesson calendar rendering and Day continuity is over-engineering an edge workflow. The unfinished persistence branch is abandoned. Teacher-facing same-day stacking should resume only when the primary planner can expose the real collision action that needs it.
7. BRAND CONFLICT CORRECTED. This Product Spec still carried older prototype color/type language that conflicted with the canonical Brand System. The visual section now defers explicitly to ARC — Canonical Brand System & Construction Rules; the Brand System remains the sole visual authority.


NEXT AUTHORIZED ORDER AFTER THIS AUDIT
1. integrate only verified audit cleanup/build-fingerprint work;
2. extract AppFrame workspace orchestration before adding another major subsystem;
3. render real Units/Lessons across calendar horizons, beginning with Week/Day truth;
4. build Day/Easel continuity from that same state;
5. close auth/account-isolation and account/Drive persistence obligations before external beta;
6. add secondary systems only when the primary planning loop requires them.


Standing release blockers remain browser interaction verification, account isolation, remote persistence/reconciliation, exact-build preview verification, accessibility/device gates, and explicit release clearance. main remains untouched.


46. WEEK + DAY REAL PLANNING PROJECTION CHECKPOINT — 2026-09-03


Status: feature verified; integration follows this checkpoint.
Feature head: 546a647784e0fd1c7a87bfa0e18793fa7497be7f
Exact feature CI: Arc verify run 33760380799 — success.


Arc now has its first real teacher planning projection on the calendar. Week and Day no longer show only date scaffolding when canonical planning data exists. They project the existing Course → Unit → Lesson plan together with Section-specific teaching state, without creating a second calendar truth.


Architecture:
• src/planning/planningProjection.ts is the canonical adapter from planning domain state to renderable date-range state.
• src/components/PlanningWeekDayView.tsx is presentation only; it does not calculate effective Lesson dates, delivery defaults, Shift ownership, or Unit ownership.
• CalendarProjectionView delegates Week/Day planning rendering to this projection boundary. AppFrame and useArcWorkspace were not expanded for this feature.
• Future calendar horizons should reuse the projection rules rather than reimplement effective dates or Section state inside view components.


Planning truth now projected:
• A Course is rendered once as shared curriculum context.
• A placed Unit is rendered once per Course, not duplicated for every Section.
• Each Section renders its own row beneath the shared Course/Unit context.
• Lessons use each Section’s effective date, including persisted Shift overrides.
• Missing delivery state remains sparse and projects as not-started without writing synthetic state.
• completed / in-progress / skipped status survives projection.
• in-progress work carries the saved resume note into the planning surface.
• fixed versus flexible Lesson policy remains visible.
• Section-specific date divergence is visible as a class-specific Shift rather than mutating the shared Lesson.
• Day and Week use the same projection rules and therefore expose the same effective planning truth.


Week behavior:
• Default teacher Week is Monday–Friday, consistent with the canonical product rule.
• Weekend dates remain part of SchoolCalendar truth and are still reachable through Day. A teacher preference to show weekends remains later work.
• Horizontal overflow is contained within the planning surface rather than allowed to distort the Arc shell.


Progressive setup behavior:
• Classes alone remain visible as Section rows before Units or Lessons exist.
• Placed Units add shared Unit bands before Lessons exist.
• Lessons add dated work when available.
• Empty Unit/Lesson projection layers are render-only conveniences and are never persisted as fake teacher data.


Contract coverage includes the canonical divergence case: one shared AP Art History plan with P2 completed, P5 in progress and shifted to its effective continuation date, and P7 still not started; the shared fixed assessment remains fixed. It also covers Week↔Day consistency, progressive setup, fixed-date identity, sparse delivery state, Section-specific effective dates, and cross-calendar ownership failure.


Accessibility audit correction made before integration:
• Initial planning-grid utility type below the brand-system minimum was rejected.
• Core Lesson/class/resume copy is now 16 px; metadata is no smaller than 14 px.
• completed/skipped state no longer depends on whole-card opacity that could reduce text contrast.
• state remains communicated by text and structure rather than color alone.


Scope deliberately excluded from this checkpoint:
• Month / Quarter / Semester / Year Map planning-object rendering.
• full Day teaching-continuity controls.
• Easel.
• drag/drop movement.
• weekend display preference.
• auth/account isolation and remote/account-backed persistence.
• physical browser keyboard/click/touch/responsive verification.


Next gate after integration: hostile audit of Week ↔ Day planning truth before expanding planning projection into the remaining calendar horizons.




45. APPFRAME FOUNDATION DECOMPOSITION — 2026-09-03


Integrated develop SHA: 5e8d2fd388772babd1e87715d7ea92fa4895e9c2. Exact feature head and integrated develop head both passed the read-only lockfile-backed Arc verification gate: npm ci, full domain contracts, TypeScript, and Vite production bundle. main remains untouched.


Purpose: prevent AppFrame from becoming a god component before Unit/Lesson calendar rendering, Day/Easel continuity, auth, and secondary systems expand the application.


Ownership boundaries established:
- AppFrame is composition only: shell assembly and callback wiring. No persistence, domain validation, recovery math, or feature-specific business rules belong there.
- useWorkspaceMode owns one mutually-exclusive temporary workspace mode instead of independent editor booleans that could disagree.
- WorkspaceStage owns surface selection only: calendar/setup/classes/Units/Lessons/recovery rendering.
- CalendarStageHeader owns calendar-stage controls/action entry points only.
- CalendarViewRail owns horizon navigation only.
- workspaceBootstrap owns the ordered local restore chain and initial persistence notices only.
- shiftReconciliation owns cross-layer Shift/Undo preservation policy when upstream calendar/planning state changes.
- useArcWorkspace owns canonical workspace state transitions and coordinated validated saves. It may not become the default home for unrelated future subsystems; Fridge/magnet interaction, Live Classroom, auth, Notes, etc. must receive their own boundaries when introduced.


Structural result: AppFrame fell from roughly 26 KB / 386 removed lines of mixed orchestration to a roughly 96-line composition component. Restore and Shift policy were extracted into pure app-layer modules. The refactor intentionally changed no domain behavior; the existing complete contract suite remained green.


Developer rule: UI composition files must never become parallel state stores. Controllers must not absorb unrelated domains merely because they already have access to shared state. Prefer one clear new boundary over another conditional in an existing large file.


Current sequencing remains: foundation decomposition complete → render real Units/Lessons in Week/Day → project the same truth into Month/Quarter/Semester/Year Map → build Day/Easel continuity → restore auth/account isolation and account/Drive persistence before external beta → secondary systems later.




Audit integration proof: verified cleanup head 50d97fb4e686444fce81aa3c898a7ff839b18e6e passed the exact lockfile-backed GitHub Actions gate, was integrated to develop at the same SHA, and develop independently passed npm ci, the full Arc contract suite, TypeScript compilation, and Vite production bundling. main remains untouched.
SEQUENCING SUPERSESSION — 2026-09-03
The earlier same-day-approval persistence “Next gate” instruction is superseded. Same-day approval remains a valid domain foundation only; its persistence/UI branch is abandoned/reference-only until the ordinary planning loop exposes a real need for teacher-approved stacking. Current sequencing authority comes from Rule 26 and the latest redevelopment audit checkpoints.




47. WEEK / DAY HOSTILE PLANNING AUDIT — 2026-09-03
Feature branch: feature/week-day-hostile-audit
Verified feature head: 87bf1e6465fcb7934ad32e6923965a5b6f5e26fc
Exact feature verification: Arc verify run 33761527132 — success.


Purpose: stress the first real Week/Day planning projection before expanding the same planning truth into Month. The audit intentionally attacked model truth, projection geometry, overlap behavior, teaching-history truthfulness, long-content containment, multi-Course/multi-Section load, holidays, blank weeks, and cross-week Shift behavior.


Findings corrected:
• Overlapping Units were correctly returned by the planning projection but the first renderer placed them in one CSS grid lane, allowing visual overlap. Unit bands now render in explicit separate lanes while remaining shared once per Course rather than duplicated per Section.
• projectPlanningRange previously assumed callers supplied unique, ascending visible dates. The projection API now rejects duplicate or unsorted dates before calculating Unit geometry. Future Month/Quarter/Semester/Year callers must meet the same invariant rather than relying on renderer behavior.
• A completed Lesson whose actual taught date differed from its displayed planned/effective date could read as though completion happened on the displayed date. The Lesson remains in its plan/effective slot, but the tile now exposes the actual taught date when different. Planning truth and teaching-history truth remain distinct.
• Long Course, Section, Lesson, and resume-note content now wraps safely instead of relying on ideal labels. Week overflow remains contained inside the planning surface rather than distorting the Arc shell.


Permanent hostile contract coverage now includes multiple Courses, six Sections, long labels, a holiday inside a Unit, fixed anchors, cross-week Section Shift, completed work with a future shared plan date, overlapping Units, blank weeks with no phantom planning objects, Day↔Week consistency, duplicate visible-date rejection, and unsorted-date rejection.


Process note: at the beginning of this audit an attempted hostile-test bootstrap created a temporary placeholder file on develop before the feature branch existed. The exact placeholder was immediately removed. Comparison to the prior integrated Week/Day SHA showed two transparent no-op commits and zero file changes. The integration history was not force-rewritten merely to cosmetically erase the mistake; transparent history was judged safer than rewriting develop.


Clearance: Week/Day planning projection is cleared to expand into Month using the same canonical planningProjection boundary. Month must use Month-appropriate density rather than reproducing the Week grid. Browser-driven keyboard/touch/responsive verification remains a release gate and is not inferred from contract/build success. main remains untouched.






48. MONTH REAL PLANNING PROJECTION CHECKPOINT — 2026-09-03
Feature branch: feature/month-planning-projection
Verified feature head: d642678eccce323223c6f218249e2a3f560a2ec2
Exact feature verification: Arc verify run 33762866923 — build gate success.


Purpose: extend the same canonical Course/Unit/Lesson/Section-effective planning truth already proven in Week/Day into Month without shrinking the Week interface into a six-week grid.


Architecture:
• canonical calendar projectMonth remains the only owner of Month boundaries, Monday–Sunday row geometry, outside-month padding dates, term context, and day kind.
• src/planning/monthPlanningProjection.ts is a Month-specific aggregation over projectMonth geometry plus the canonical planningProjection output. It does not calculate alternate effective Lesson dates or create another planning state model.
• src/components/PlanningMonthView.tsx is presentation only. AppFrame/workspace state ownership did not expand.
• shared planning-view date formatting is centralized in src/components/planningDateLabels.ts so Week/Day/Month do not accumulate independent Intl formatting helpers.


Month behavior:
• Unit pacing sits above each calendar week. A Unit crossing a Sunday becomes multiple visual week segments while retaining one stable Unit identity.
• compact Lesson signals group the same Course/Lesson identity across Sections scheduled on that date rather than rendering one duplicate Lesson card per Section.
• signal scope names the exact Sections. Section-specific Shift is visibly identified while unrelated Sections remain on the shared date.
• fixed date identity and meaningful delivery-state counts remain visible.
• Classes-only progressive setup remains render-only and does not fabricate Units or Lessons.
• outside-month padding dates remain visible for calendar continuity and are visually subordinate rather than removed.


Audit corrections during implementation:
• Month object titles were raised back to the canonical 16px core-UI floor; 14px remains metadata only.
• fake ARIA grid semantics were removed because the Month surface does not yet implement keyboard-grid interaction. Semantic labels describe the current interface rather than aspirational behavior.
• long Course/Section/Shift/status metadata is contained with wrapping rather than overflowing calendar columns.
• duplicate date-format helpers were pruned before they spread into later horizon renderers.


Permanent Month projection contract covers canonical month-week geometry, cross-week Unit segmentation with stable identity, shared-Lesson grouping, exact Section scope, Section-specific Shift, fixed anchors, delivery-state aggregation, destination-week visibility, and progressive setup without fake planning data.


Clearance: Month implementation is green but is not yet cross-view-cleared. Next mandatory step is a hostile Week↔Day↔Month consistency audit before Quarter/Semester/Year Map planning projection begins. Browser-driven interaction remains a separate release gate. main remains untouched.


49. WEEK ↔ DAY ↔ MONTH CROSS-VIEW TRUTH AUDIT — 2026-09-03


Purpose: prove that Month is a density change over the already-cleared Section-effective planning truth, not a second planning model.


Audit result:
- Week, Day, and Month reconstruct the same Lesson/Course identity for every visible date.
- Month Section scope now uses one explicit object per Section: Section ID, display name, Section-specific Shift flag, and delivery status remain attached to each other.
- Parallel sectionIds / sectionNames / shiftedSectionIds / aggregate status arrays were removed because independent deduplication could break identity when two real Sections share the same display name.
- Two distinct Sections may have the same display name and must remain distinct by stable Section ID.
- Duplicate placement of the same Section/Lesson/date now fails closed instead of being silently deduplicated.
- Month status summaries are derived from Section scope rather than stored as a second aggregate truth.
- A Section-specific Shift across an adjacent-month boundary is proven to appear only on that Section’s effective date; the Section is removed from the shared date and no ghost duplicate remains.
- Adjacent-month padding dates preserve real planning continuity.
- Holiday/no-school truth remains separate from Unit visual continuity: a Unit may visually cross weekends/holidays as a calendar span without turning those dates into instructional days or allowing Lesson placement there.
- Month Unit week segments reconstruct the exact visible calendar-date coverage of the stable Unit placement without gaps or invented dates.


Scope discipline:
- Audit branch is zero commits behind develop and touches only Month projection/presentation, Month contracts, the cross-view contract, and the contract manifest/README.
- No AppFrame, workspace controller, persistence, recovery, navigation, or unrelated styling changes were introduced.
- The tightening reduced synchronization risk rather than adding another state owner or wrapper layer.


Verification:
- Original cross-view audit head 447db6a870de7263af7b4d3b624f5a8403091d04 passed the full lockfile-backed GitHub Actions gate.
- Stricter Section-scope/cross-month audit head 13e223894f7ab222bf62277111d97e150b2a52b1 passed npm ci, the full permanent contract suite, TypeScript compilation, and Vite production bundling.
- Final documented branch head must pass again before integration; develop must pass independently after integration.


Clearance:
- Week ↔ Day ↔ Month planning truth is cleared for Quarter projection work after exact-head integration verification.
- Browser-driven interaction/responsive testing remains a separate release gate and is not inferred from contract/build success.
- main remains untouched.


50. FULL-SECTOR FOUNDATION REALIGNMENT + PRIMARY-LOOP SEQUENCING — 2026-09-03
Purpose: pause feature expansion and re-audit the integrated rebuild against Rule 26, the canonical view jobs, trust rules, code ownership, accessibility rules, and the actual teacher workflow before adding more horizon-specific code.


SEQUENCING DECISION
- Week, Day, and Month planning truth are integrated and cross-view cleared. That clearance proves Quarter work is safe; it does not make Quarter the highest-priority next feature.
- The experimental feature/quarter-planning-projection branch is frozen/reference-only. It must not be merged or used as implementation authority.
- Continuing Quarter → Semester → Year Map now would favor technically comfortable projection work while the primary teaching-continuity loop remains incomplete.
- Rule 26 and the product jobs-of-views regain sequencing priority: next product work is Day teaching continuity, then Easel from that exact Day/Section/Lesson state. Quarter/Semester/Year Map planning presentation resumes afterward as natural zoom-outs of the proven calendar language.
- Same-day approval persistence/UI remains deferred/reference-only. The integrated exact-approval domain foundation stays valid.


MANIFEST / DOCUMENTATION CORRECTIONS
- The stale same-day-approval persistence “Next gate” instruction and an adjacent broken text fragment were removed and replaced with an explicit sequencing-supersession note.
- Historical checkpoint prose remains historical evidence. Where older checkpoint sequencing conflicts with this checkpoint, Rule 26 plus this latest audit is authoritative.
- The older Phase 0–5 delivery list remains a completeness checklist, not the active implementation sequence.


CODE-OWNERSHIP HARDENING
- src/planning/planningLessonSignals.ts now owns reusable shared-Lesson aggregation from canonical Section-effective range placements. Section ID, display name, Shift ownership, and delivery status remain one Section-scope object; duplicate Section/Lesson/date placement fails closed.
- Month now consumes that shared signal projector instead of owning duplicate Lesson-grouping truth.
- src/components/dateLabels.ts is the single UI date-label formatter boundary; the older planningDateLabels.ts helper was removed.
- src/components/CalendarProjectionPrimitives.tsx now owns shared non-interactive projection primitives and term context.
- CalendarProjectionView.tsx was reduced to horizon routing/delegation rather than accumulating generic primitives, formatting, and planning-domain logic. This is an explicit anti-god-component rule before Day/Easel complexity arrives.
- Calendar-only Month no longer claims ARIA grid/row/gridcell semantics because keyboard-grid interaction is not implemented. Accessibility semantics describe implemented behavior only.
- No workspace state, persistence schema, recovery/Shift logic, navigation state, or canonical planning behavior changed in this refactor.


SCOPE / RESIDUE AUDIT
- Final branch comparison against develop is zero commits behind and limited to README, calendar projection routing/primitives/date labels, Week/Day + Month formatter consumers, shared Lesson-signal extraction/contract, Month aggregation cleanup, and the contract manifest.
- No Quarter implementation files are present on the active audit branch.
- No AppFrame/useArcWorkspace expansion occurred.
- The refactor removes duplicated ownership rather than introducing a parallel store or a new wrapper layer for its own sake.


VERIFICATION
- Exact active audit head: 5fe3d0febfd13db07cfde5c58243397289853493.
- Arc verify run 33767145181 passed npm ci from the committed lockfile, the complete permanent contract suite, TypeScript compilation, and Vite production bundling.
- Browser-driven click/keyboard/touch/responsive verification remains explicitly unverified and is still a release gate.
- main remains untouched.


NEXT AUTHORIZED IMPLEMENTATION
1. integrate this exact foundation realignment only after the documented head remains green;
2. build a pure Day teaching-continuity projection over existing canonical state, answering “Where am I today?” per Section without creating another state model;
3. audit Day against Week/Month/recovery truth;
4. build Easel from that exact Day state and prove Arc → Easel → Arc continuity;
5. return to Quarter/Semester/Year Map planning presentation as coherent zoom-outs;
6. close auth/account isolation and account/Drive persistence before external beta;
7. complete physical browser accessibility/responsive gates before release.


51. DAY TEACHING-CONTINUITY DOMAIN + RUTHLESS REAUDIT — 2026-09-03
Feature branch: feature/day-teaching-continuity
Exact audited head: 0ebfae3329a3db086b556b929f0cf437e983071b
Exact final Arc verify run: 33768922619 — success.


Purpose: stop feature momentum and prove the first Day-specific continuity layer against the entire integrated Arc domain/build gate before adding teacher-facing Day presentation. Day must answer per Section what is scheduled today and what unfinished teaching Arc is still holding, without becoming a second Recovery/Shift engine.


Findings corrected during the audit:
- The first Day carryover type incorrectly required every in-progress Lesson to have an effective calendar date. Arc already permits genuinely unscheduled in-progress work, so Day continuity now preserves that state with effectiveDate=null instead of throwing it away.
- An unused Lesson lookup was removed from the projection before the contract was finalized.
- The repository operating contract still named feature/foundation-realignment-audit as the active branch and still told developers to finish foundation realignment next. README authority was corrected to feature/day-teaching-continuity and Day continuity was added to the permanent gate list.


Day continuity contract now proves:
- active Unit context remains visible when appropriate;
- today’s Section-effective scheduled Lessons remain the schedule truth;
- unresolved in-progress work from an earlier teaching day surfaces as carryover with the saved resume note;
- genuinely unscheduled in-progress work remains visible rather than disappearing;
- unfinished work may remain visible after its Unit’s planned calendar span has ended, while that expired Unit is not falsely labeled active;
- completed and skipped work never appears as unfinished carryover;
- in-progress state is not surfaced before its actual taught/interruption date;
- after a valid Section Shift places the interrupted Lesson today, it appears once in the effective schedule and is not duplicated as carryover;
- displaced work leaves today when its Section-specific effective date moves;
- multiple Courses remain isolated and no Lesson crosses Course/Section ownership;
- Day continuity is read-only and does not mutate scheduling, delivery, Recovery, or Shift state.


Verification loop:
- first strengthened Day gate at 76ab80277c119a9e7f83ea35c8c8d6b089ac5299 passed npm ci, the complete permanent Arc contract suite, TypeScript compilation, and Vite production bundling;
- hostile coverage was expanded and exact head 8c485e6fe50b9251f975febda2d4128a8b1dc32d passed the same full gate;
- governance correction produced final exact head 0ebfae3329a3db086b556b929f0cf437e983071b, and Arc verify run 33768922619 passed the complete gate again.


Current disposition:
- Source/domain/build audit: CLEAN at exact head 0ebfae3329a3db086b556b929f0cf437e983071b.
- No automated contract, TypeScript, dependency-install, or Vite bundle errors remain in the current exact-head gate.
- Day teacher-facing continuity presentation is still not built and therefore is not being falsely claimed complete.
- Browser-driven keyboard/click/touch/responsive verification remains a separate release gate and has not been inferred from source/build success.
- main remains untouched. develop remains the integrated pre-release authority until this Day feature is complete and separately cleared for integration.




INTEGRATION PROOF
- develop was fast-forwarded to 5fe3d0febfd13db07cfde5c58243397289853493 with no main-branch change.
- Independent develop Arc verify run 33767751668 completed successfully on that exact SHA: committed-lockfile npm ci, full permanent contract suite, TypeScript compilation, and Vite production bundle all passed.
- Foundation realignment is therefore integrated and cleared. Next authorized product branch begins from this exact develop SHA and targets Day teaching continuity.


52. DAY TEACHING CONTINUITY PRESENTATION — 2026-09-03
Feature branch: feature/day-teaching-continuity
Exact verified feature head: 07f6f32da53feaf4a3824cad98e69030f84ec1d1
Exact feature Arc verify run: 33781665516 — success.


Purpose: replace the temporary one-column Week treatment of Day with a dedicated teacher-facing continuity surface over the already-proven Day projection. Day now prioritizes actual unfinished teaching state without creating another schedule, recovery engine, or state owner.


Architecture:
- src/planning/dayContinuityProjection.ts remains the read-only owner of Day continuity truth.
- src/components/PlanningDayContinuityView.tsx is presentation only. It does not calculate Shift, Recovery, effective dates, or persistence decisions.
- CalendarProjectionView routes Day through the dedicated Day continuity projection/presentation while Week continues through the canonical range projection and Month remains unchanged.
- AppFrame, useArcWorkspace, persistence schemas, Recovery/Shift mutation logic, and Quarter work were not expanded in this milestone.


Teacher-facing behavior:
- Each Course remains shared curriculum context and each Section receives its own teaching-continuity row.
- Genuine unresolved in-progress work from an earlier teaching day appears first under “Arc is holding your place.”
- The effective Section schedule appears separately as “Today’s plan.”
- Unscheduled in-progress work remains visible and is explicitly labeled as having no planned date.
- After a valid Section Shift places the interrupted Lesson today, that Lesson appears once in Today’s plan and is not duplicated as carryover.
- Saved resume notes remain visible as the concrete continuation point.
- Actual taught date is visibly exposed whenever it differs from the displayed/effective planning date, preserving the difference between planning truth and teaching-history truth.
- Active Unit context remains visible without falsely treating an expired Unit as active merely because unfinished work still exists.
- No-school, holiday, break, teacher-workday, and unknown days remain visible in Day so unfinished teaching context does not disappear.


Visual/accessibility constraints preserved:
- core UI/body copy remains at least 16px; 14px is metadata only;
- state is communicated by text and structure, not color or opacity alone;
- the surface uses editorial rows/hairlines rather than generic dashboard-card stacking;
- long labels and resume notes wrap rather than overflow;
- responsive layout stacks Section and continuity columns at smaller widths without changing the underlying information hierarchy;
- no fake interaction or aspirational ARIA behavior was introduced.


Audit correction during presentation work:
- The first Day presentation could show a Lesson as Completed on today’s effective slot without visibly exposing that it had actually been taught earlier. This repeated an ambiguity already corrected in Week. Day now shows the actual taught date whenever taughtDate differs from effectiveDate.


Verification:
- UI implementation head 32ba13c4cf9fea9b41e0c69d731790e68f61da25 passed the full Arc gate.
- Final documented feature head 07f6f32da53feaf4a3824cad98e69030f84ec1d1 passed Arc verify run 33781665516: committed-lockfile npm ci, complete permanent contract suite, TypeScript compilation, and Vite production bundle.
- Branch scope remains limited to Day projection/contract/presentation/style, horizon routing, the permanent contract manifest, and repository operating-contract updates. No AppFrame/controller/persistence/Quarter residue was introduced.


Disposition:
- Day source/domain/build presentation milestone is cleared for integration.
- Browser-driven keyboard/click/touch/responsive verification remains a separate release gate and is not inferred from source/build success.
- Easel remains unbuilt. Next authorized product work after exact develop integration verification is Easel continuity from this exact Day/Section/Lesson state.
- main remains untouched.


Integration proof:
- develop was fast-forwarded to exact Day feature SHA 07f6f32da53feaf4a3824cad98e69030f84ec1d1 with main untouched.
- Independent develop Arc verify run 33781898412 completed successfully on that exact SHA: committed-lockfile npm ci, complete permanent contract suite, TypeScript compilation, and Vite production bundle all passed.
- Day teaching continuity is therefore integrated and source/domain/build cleared. Browser-driven interaction remains a separate release gate. Next authorized branch begins from this exact develop SHA and targets Easel continuity.


53. ARC ↔ EASEL DOMAIN CONTINUITY — 2026-09-03
Feature branch: feature/easel-continuity
Exact verified feature head: 1e561f65fd44c575b484060a0ade0fb8ed6abdbd
Exact feature Arc verify run: 33783543546 — success.


Purpose: prove the Arc Day → Easel → Arc continuity boundary in the domain before building the live teaching surface. Easel is Arc’s teaching surface, not a separate product, repository, class store, Lesson store, or schedule authority.


Architecture supersession:
- The historical standalone Easel guide previously described Easel as a separate product/repository. That doctrine is explicitly superseded. The guide remains reference evidence for useful classroom-screen behaviors, but the current Arc Product Spec controls product architecture.
- Arc Day is the launch truth. Easel consumes canonical Course/Section/Unit/Lesson/delivery state and returns only validated Section delivery state.
- Easel never owns or mutates the Arc schedule. Recovery/Shift remains the only schedule-consequence path.


Arc → Easel handoff:
- src/planning/easelSessionProjection.ts owns the read-only launch boundary.
- Easel launch is exact to one Day + Section + Lesson candidate. When a Section has unfinished carryover and a different Lesson planned today, Easel must not guess which one the teacher intends to teach.
- The same shared Lesson may be launched by multiple Sections while preserving different Section delivery state and resume notes.
- Genuine unscheduled in-progress teaching may enter Easel with effectiveDate=null; no date is invented merely to satisfy the live surface.
- After a legitimate Section Shift, the continuing Lesson appears once from the effective schedule and does not remain as a ghost carryover candidate.
- Unknown Sections/Lessons and duplicate Section/Lesson launch context fail closed.
- Projecting a session is read-only and does not mutate Lesson, delivery, Recovery, or Shift state.


Easel → Arc teaching outcome:
- src/planning/easelTeachingOutcome.ts is a thin adapter over Arc’s existing delivery-state rules, not a second teaching-state model.
- Supported outcomes are completed, stopped with a concrete resume note, and skipped for work that has not already begun.
- stopped records ordinary in-progress Section delivery state with the exact teaching date and normalized resume note.
- completed records ordinary completed Section delivery state with the actual finish date and clears the stopping note through the existing Arc rule.
- skipped preserves Arc’s existing skipped semantics.
- completed/skipped history is terminal inside Easel and cannot be silently rewritten there.
- already-started teaching cannot be relabeled skipped because that would erase evidence that teaching occurred.
- an Easel session opened against older delivery state refuses to overwrite newer Arc state; the teacher must return to Day and reopen the Lesson.
- teaching progress may be recorded only on a confirmed instructional date under the current canonical Arc calendar/delivery policy.
- Easel never performs Shift. A stopped Lesson returns as in-progress Section state; Arc Recovery owns consequence preview and schedule repair.


Tightening / residue prevention:
- The existing confirmed-instructional-day condition had gained a second legitimate consumer. It is now centralized as isConfirmedInstructionalDay in src/calendar/schoolCalendar.ts and reused by Lesson workspace validation and Easel outcome recording rather than duplicated.
- No AppFrame, useArcWorkspace, persistence schema, recovery mutation, Section-schedule mutation, Quarter implementation, or standalone Easel data store was introduced.
- Final branch tree is limited to the Easel session/outcome domain, their contracts/exports, one shared calendar helper, the existing Lesson validator consumer, contract manifest, and repository operating-contract documentation.


Hostile contracts prove:
- unresolved carryover and today’s plan remain distinct launch candidates;
- same shared Lesson across two Sections preserves distinct Section stopping points;
- unscheduled carryover remains unscheduled;
- Shift removes duplicate/ghost launch context;
- missing Section/Lesson launch fails closed;
- stopped → later completed follows ordinary Arc delivery-state rules;
- blank stop note is rejected;
- stale session overwrite is rejected;
- in-progress → skipped is rejected;
- terminal teaching-history rewrite is rejected;
- non-confirmed instructional-day progress is rejected;
- wrong-Section outcome is rejected;
- projection/outcome operations do not mutate source workspace objects or shared Lesson planning dates.


Failed-gate investigation:
- The first handoff contract incorrectly assumed an incidental carryover ordering. Day intentionally sorts unfinished teaching by recency; the contract was corrected to assert candidate identity/source rather than presentation order.
- A second failure persisted after that correction. Runtime execution of the new contract was temporarily removed and the gate still failed, then the contract body was temporarily replaced with a compile-only placeholder and the gate passed. This isolated the defect to the fixture’s TypeScript compile rather than production handoff code.
- The actual fixture issue was a redundant comparison between two already-narrowed, disjoint literal resume-note values. That unnecessary assertion was removed. The full contract and permanent gate were restored before clearance. Diagnostic states were never integrated.


Verification:
- Restored handoff gate head 96c9c760… passed the full Arc gate after the investigation.
- Full Arc→Easel→Arc outcome head 9fb1ecdac4fa25c111b742f2ce427a0351752a64 passed the complete gate.
- Final documented feature head 1e561f65fd44c575b484060a0ade0fb8ed6abdbd passed Arc verify run 33783543546: committed-lockfile npm ci, complete permanent contract suite, TypeScript compilation, and Vite production bundle.


Disposition:
- Arc↔Easel domain continuity is cleared for integration.
- The teacher-facing Easel live surface is not built yet and is not being falsely claimed complete.
- Browser-driven Day→Easel→Day interaction, keyboard/touch/responsive behavior, and across-room presentation remain separate gates.
- Next authorized work after exact develop integration verification is the minimal live Easel surface: explicit Day launch → exact live Section/Lesson context → validated outcome → return to exact Day. Classroom tools come only after that loop works.
- main remains untouched.
54. ARC ↔ EASEL HIGH-STAKES CORE-LOOP AUDIT — 2026-09-03
Feature branch: feature/easel-continuity
Exact final audited head: 1bde71858850aef23df0ed46782efd7940d36b74
Exact final Arc verify run: 33786981566 — success.


Purpose: raise the Arc→Easel→Arc assessment standard beyond ordinary happy-path/domain verification before permitting the live-surface implementation to depend on this seam. This audit actively searched for stale-context corruption, invalid live-teaching context, replay, terminal-history reopening, Section identity mistakes, unnecessary stickiness, and wrong-subsystem schedule mutation.


Material failures found and corrected:
- Stale-session protection previously compared only Section delivery state. A Lesson could be Shifted after Easel opened while delivery status/note stayed unchanged, allowing the old live session to write against outdated schedule context. Easel writeback now reconstructs the current Day/Easel context from canonical Arc workspaces plus current Section overrides and compares the structural live context before accepting an outcome.
- A navigable future or no-school Day could previously be treated as sufficient Easel launch context. Live Easel now requires the selected Day to equal the supplied current live date and that date to be a confirmed instructional day. Past/future/no-school Day remains valid Arc planning context but is not live-teaching permission.
- Completed or skipped Lessons could previously appear as Easel launch candidates when they occupied today’s effective schedule. Terminal history now remains visible in Arc but cannot be reopened as a live Easel session.
- Easel outcome writeback previously trusted caller-supplied current domain objects too much. Before writeback Arc now validates Planning, Unit, and Lesson workspace integrity against the loaded calendar, resolves the exact Lesson/Section by stable ID, reconstructs the current Day session, and fails closed if the opened session no longer matches current canonical truth.


High-stakes stale-context contract:
- selected-Section Shift after launch invalidates the old Easel session;
- carryover becoming scheduled after launch requires reopening rather than silently changing session meaning;
- fixed/flexible Lesson-policy changes invalidate the old session;
- delivery-state changes or a previously consumed session invalidate replay;
- wrong calendar/workspace ownership fails closed;
- completed/skipped history cannot launch or be rewritten;
- no-school/future Day cannot launch live teaching;
- same display name never substitutes for stable Section identity.


Anti-stickiness contract:
- an unrelated Section schedule change does not invalidate the selected Section’s unchanged session;
- a Lesson title-only/copy change does not invalidate an otherwise identical live session;
- stale protection compares structural teaching context, not presentation copy merely for the sake of being strict.


Subsystem boundaries retained:
- Easel may return only validated Section delivery state.
- Easel never performs Shift or directly repairs the calendar.
- stopped teaching becomes ordinary in-progress Section state; Arc Recovery remains the only consequence-preview/schedule-repair path.
- launch and outcome adapters remain pure with respect to shared Lesson planning dates, Section overrides, and source workspace objects.
- no AppFrame, useArcWorkspace, persistence-schema, Recovery mutation, Shift mutation, Quarter implementation, or live-surface UI was added in this audit.


Permanent verification:
- Added src/planning/easelCoreLoop.hostile.contract.ts to the permanent contract manifest.
- Elevated hostile head 628258201b558640b3f23058fccce432471921a6 passed Arc verify run 33786541777.
- Second-order hardened head 7249ede25c56fc7cabb0ee6add4447472eb6baa6 passed Arc verify run 33786834556.
- Final documented exact head 1bde71858850aef23df0ed46782efd7940d36b74 passed Arc verify run 33786981566: committed-lockfile npm ci, complete permanent contract suite including the high-stakes Easel hostile contract, TypeScript compilation, and Vite production bundle.


Disposition:
- Arc↔Easel domain/state integrity is CLEARED FOR INTEGRATION at the exact final audited head above.
- The parallel live-surface branch must rebase/adapt to this audited API rather than preserving older permissive Easel call signatures.
- Teacher-facing Day→Easel→Day browser interaction, stale-session UX, keyboard/touch/responsive behavior, and across-room presentation remain separate high-stakes gates and are not inferred from domain/build success.
- main remains untouched.
INTEGRATION PROOF
- develop was fast-forwarded to exact audited head 1bde71858850aef23df0ed46782efd7940d36b74 with force disabled; main remained untouched.
- Independent develop Arc verify run 33787252463 completed successfully on that exact SHA. The committed-lockfile npm ci, complete permanent contract suite including the elevated Easel hostile contract, TypeScript compilation, and Vite production bundle all passed.
- Arc↔Easel domain/state integrity is therefore integrated and cleared as the behavioral foundation for the parallel live-surface implementation.


55. ARCHITECTURE / UX ↔ INTERFACE / UI GOVERNANCE + LIVE CLASSROOM BEHAVIORAL CONTRACT — 2026-09-03


Standing responsibility rule:
- UX/Architecture defines the behavioral contract. UI defines the perceptual contract.
- UX owns product architecture, information architecture, interaction architecture, structural wireframes, user flows, hierarchy, navigation logic, calendar behavior, responsive structural behavior, accessibility requirements at the interaction level, failure/recovery states, and pressure-testing with realistic teacher data.
- UI owns visual execution of approved architecture: typography application, spacing, color, borders/rules/radii/surfaces, icon placement, component styling, visual hierarchy, responsive visual refinement, state/feedback presentation, micro-interactions, approved analog/artifact treatments, polished screens, and production design-system components.
- State/feedback boundary: UX defines which states exist, what triggers them, what must be communicated, and what recovery path exists. UI determines how those states are visually expressed.
- Responsive boundary: UX defines what survives, reorders, collapses, overlays, or changes interaction pattern. UI determines the precise visual adaptation.
- Micro-interaction boundary: UI may own hover, focus, pressed, animation, inline-edit affordances, selection feedback, and error presentation only when those choices do not change workflow or state semantics.
- Escalation test: if a proposed fix changes the system, workflow, state model, hierarchy, navigation, or product behavior, it returns to UX/Architecture. If it only clarifies the already-approved system, UI owns it.
- Structural wireframes are architecture artifacts. They remain low-fidelity enough to test placement, persistence, disclosure, movement, hierarchy, and state transitions before styling becomes the deciding factor.
- The Wax & Wing Brand System remains canonical for visual construction. UX may not contradict it; UI may not reinterpret architecture in order to achieve a visual treatment.
- Easel is legacy terminology only. Its useful classroom-display/live-teaching behavior is absorbed into Arc and must never reappear as a separate product, repository, state store, or navigation silo.


LIVE CLASSROOM BEHAVIORAL CONTRACT
Entry:
- Live classroom mode may launch only from the current Arc Day on a confirmed instructional date.
- Launch binds to one explicit stable Section ID + Lesson ID. Display names are never identity.
- If one Section has more than one legitimate candidate (for example unfinished Lesson 17 plus planned Lesson 18), Arc requires explicit teacher choice. It never guesses.
- Completed/skipped history may remain visible in Day but is not launchable as a live teaching session.
- Opening live classroom mode is read-only with respect to schedule truth, Shift, Recovery, and shared Lesson planning state.


Context while live:
- The session preserves exact Course, Section, Unit, Lesson, launch source, effective date/override state, delivery state, taught date, and resume note needed to validate safe return.
- A live session is a view onto canonical Arc truth, not a second class profile or Lesson object.
- A harmless presentation-copy change (such as title wording) may update without invalidating the session when structural context is unchanged.
- An unrelated Section change must not interrupt the active class.
- A structural change affecting the active Section/Lesson—Shift, launch-source change, delivery-state change, fixed/flexible policy change, removal, calendar/workspace mismatch—invalidates the old session for writeback.


Teacher outcomes:
- Complete: valid for not-started or in-progress work; records actual completion date and clears any resume note through canonical delivery-state rules.
- Stop here: valid for not-started or in-progress work; requires a concrete resume note and records ordinary in-progress Section state on the live teaching date.
- Skip: valid only for not-started work. Started work may not be relabeled skipped because that erases teaching history.
- Leave/Back without an outcome: exits without changing teaching state.
- Live classroom mode never performs Shift and never silently repairs future dates.


Stale-session behavior:
- On outcome submission, Arc revalidates current canonical calendar, Planning, Unit, Lesson, Section schedule, and delivery state rather than trusting the opened screen.
- If the active structural context changed, writeback fails closed. Arc must explain that the plan changed and require return to the exact Day/reopen; it must not silently refresh the session into a different teaching context.
- Replaying an already-consumed session or attempting to rewrite completed/skipped history is blocked.


Return behavior:
- A successful outcome returns the teacher to the exact originating Day/Section context, not to a generic Home or dashboard.
- The returned Day immediately reflects the validated new Section delivery state.
- After Stop here, Arc surfaces the saved stopping point and any resulting Recovery availability. It does NOT auto-open Recovery or auto-Shift anything. The teacher decides when to review consequences.
- After Complete, the class no longer appears as unfinished carryover; actual taught/finished date remains teaching-history truth even when the shared plan date differs.
- After Skip, the Lesson remains historical curriculum context but no longer creates future recovery pressure for that Section.


Structural responsive/accessibility contract:
- The live teaching task, current Lesson identity, and exit/outcome controls must survive every supported viewport. Secondary classroom tools may collapse/overlay before these core controls disappear.
- Keyboard users must be able to enter the live surface, identify current Section/Lesson, operate every outcome path, cancel safely, and return to the originating Day without relying on drag, hover, gesture, or color.
- Touch targets and mobile reflow may change presentation but not the outcome/state model.
- Across-room/student-facing presentation must not remove the teacher’s ability to recover control; teacher controls may become subordinate or reveal-on-demand, but the route back must remain explicit and reliable.


Pressure-test scenarios required before behavioral clearance of the live surface:
- one Section has unfinished carryover plus a different planned Lesson today;
- two Sections share the same Lesson but have different stopping points;
- two Sections share the same display name but have different stable IDs;
- unscheduled in-progress work;
- active Lesson Shifted while the live screen is open;
- unrelated Section Shifted while the live screen is open;
- live Lesson title edited without structural change;
- active delivery state changed from another Arc surface while live;
- completed/skipped Lesson attempted as launch;
- Stop here with blank note;
- started work attempted as Skip;
- outcome attempted on no-school/future Day;
- double-submit/replay after successful outcome;
- return to Day after Complete, Stop here, Skip, and Cancel;
- narrow laptop, 200% zoom, keyboard-only, touch/mobile, reduced motion, and high-contrast conditions.


Clearance rule:
- UI may now implement this behavioral contract and decide its perceptual expression under the canonical Brand System.
- Any interface proposal that changes candidate selection, live-session identity, outcome semantics, stale-session rules, return destination, Recovery relationship, or structural responsive behavior must be escalated to UX/Architecture before implementation.












56. STRUCTURAL WIREFRAME CONTRACT — DAY → LIVE CLASSROOM → DAY — 2026-09-03


Purpose: define the low-fidelity spatial/interaction architecture for the live teaching loop before interface styling. This contract governs what lives where and how the teacher enters/exits; UI owns the perceptual execution.


PLACE IN ARC ARCHITECTURE
- Live Classroom is a temporary Arc stage mode, not a calendar horizon, dashboard, separate product, or permanent navigation destination.
- Day remains the architectural launch/return surface because Day owns “where am I today?” and Section-specific continuity.
- Entering Live Classroom temporarily replaces the central calendar stage with a teaching/presentation stage while preserving the exact originating Day + Section context in application state.
- The global Arc shell may simplify while live, but there must always be an explicit, reliable route back. The teacher must never need browser Back to recover Arc context.
- Leaving Live Classroom restores the exact originating Day/date and Section focus rather than defaulting to Month/Home.


DAY STRUCTURAL WIREFRAME
Top: existing Arc shell + Day navigation context.
Main stage: Day continuity list grouped by Course, then Section rows.
Each Section row structurally contains:
1. Section identity / active Unit context.
2. “Arc is holding your place” area only when genuine unfinished carryover exists.
3. “Today’s plan” area for Section-effective scheduled Lessons.
4. Live-launch affordance attached to each eligible teaching candidate, not as a detached global button.
5. Recovery availability when relevant, subordinate to the continuity state and never automatically opened.


Launch behavior:
- exactly one eligible candidate for a Section: the candidate may expose a direct Teach/Present action;
- multiple eligible candidates: activating live teaching first opens a lightweight candidate chooser anchored to that Section context;
- chooser presents the real distinction (for example Continue Lesson 17 — stopped after demo versus Start Lesson 18 — today’s plan) and requires explicit choice;
- chooser must be dismissible without state change;
- completed/skipped Lessons do not expose live launch.


LIVE CLASSROOM STRUCTURAL WIREFRAME
The live stage is organized by priority, not card count:
A. persistent session identity region: Course / Section / Lesson, with enough context that the teacher can immediately verify they opened the correct class/work;
B. primary teaching/presentation region: the classroom-facing content surface; this receives the largest share of space;
C. teacher-control layer: core session controls and outcome controls, visually subordinate to student-facing content but always recoverable;
D. optional secondary classroom-tool layer: timer/clock/cleanup/media/etc. later; these must overlay, dock, or collapse without reducing the primary teaching surface into a dashboard grid;
E. explicit Exit/Back-to-Day route.


The live surface must not structurally display the whole planner, future schedule, Recovery editor, Fridge Door, or unrelated Section rows. Live mode is intentionally focused on the selected teaching context.


Teacher-control behavior:
- core outcomes are Complete, Stop here, Skip only when eligible, and Leave/Back without outcome;
- Stop here opens/reveals a required resume-note input before submission; it does not send the teacher through a separate formal lesson-plan form;
- controls must remain reachable when the presentation layer is full-screen/across-room;
- UI may hide or reveal teacher controls perceptually, but the interaction architecture requires an explicit reliable recovery path and cannot depend on hover alone.


STALE-SESSION STRUCTURAL STATE
If the active teaching context becomes structurally stale while Live Classroom is open:
- the presentation may remain visible so the room is not abruptly blanked;
- outcome writeback becomes unavailable until resolved;
- Arc presents a blocking teacher-facing stale-state message explaining that this class/lesson changed in Arc;
- the primary recovery action is Return to Day / Reopen current Lesson;
- Arc must not silently swap the active Lesson, Section, schedule date, or launch source underneath a presenting teacher;
- unrelated Section changes do not trigger this blocking state.


RETURN STRUCTURE
Complete:
- return to originating Day + Section focus;
- completed Lesson no longer appears as unfinished continuity;
- actual completion date remains available as history.


Stop here:
- return to originating Day + Section focus;
- saved resume note appears immediately in “Arc is holding your place” unless a valid effective schedule already places that Lesson today;
- Recovery availability may appear as an explicit next action;
- no automatic Shift and no automatic Recovery takeover.


Skip:
- return to originating Day + Section focus;
- skipped Lesson ceases to create live/recovery pressure for that Section.


Cancel/Back:
- return to originating Day + Section focus with no delivery-state mutation.


RESPONSIVE STRUCTURAL PRIORITIES
Desktop / classroom display:
- teaching/presentation region dominates;
- session identity and essential controls remain available without permanently squeezing the presentation area;
- secondary tools use overlay/dock/collapse patterns rather than a multi-column control dashboard.


Small laptop / high zoom:
- session identity compresses before content disappears;
- secondary tools collapse before core outcomes;
- primary teaching content and Exit/Back remain reachable without horizontal page-level overflow.


Mobile/touch:
- same canonical session and outcomes;
- presentation content becomes vertically scrollable if needed;
- core outcomes remain reachable in a stable control region or explicit control sheet;
- no core action requires hover, right-click, drag, or precision pointer input.


CLASSROOM-DISPLAY SCOPE BOUNDARY
Arc has a broader “one source of truth” classroom-display requirement for showing the day across multiple classes/periods. That is NOT the same structural surface as an exact Section+Lesson live session.
- Live Classroom = focused teaching context for one explicit Section + Lesson.
- Daily Board / classroom display = later Day-derived student/sub-facing summary across multiple Sections/periods.
- Both belong inside Arc and consume the same Day truth.
- Daily Board must not be smuggled into the first Live Classroom implementation as extra widgets or a second data model.


UX acceptance question for the structural wireframe:
At every point, a tired teacher should be able to answer: What class am I in? What am I teaching? Where did I stop? What happens if I end this session? How do I get back to today? If any of those answers require guessing, the architecture is not cleared for visual polish.




57. RGAV INTERFACE-DAY AUDIT + NO-VERCEL DIRECTIVE — 2026-09-03


Audit authority: Wax & Wing Obsessive Audit Prompt Arsenal / Risk-Gated Adversarial Validation (RGAV). GREEN means best and requires direct evidence; source/build success alone cannot create Green.


Deployment directive:
- User explicitly instructed: do not deploy to Vercel during this audit/workstream.
- No Vercel deployment or retry was initiated by Architecture/UX during this audit.
- Earlier interface commits b0a56a49edb3f9db3f71c7fb4a953d35473ef25d and 5aeb89e1848e480ace49303b81e85cf68f514737 received Vercel failures solely because the project was deployment-rate-limited (“retry in 24 hours”), not because Arc source/build verification failed.
- Because repository Git integration may still react automatically to branch pushes, Architecture/UX will avoid code commits that could trigger Vercel while the no-deploy directive is active. Review comments and documentation updates remain allowed.


Current audited interface branch:
- feature/interface-day-continuity, draft PR #13.
- Exact audited head: f72d320604bf9f17aa557aced5fcd32969049643.
- GitHub Arc verify run 33790365162 completed successfully on that exact head.
- Build success proves committed-lockfile install, permanent Arc contracts, TypeScript, and Vite bundle only. It does not prove perceptual, accessibility, or browser interaction quality.


RGAV STATUS: ORANGE — DO NOT INTEGRATE.


UX-STRUCT-01 — RESOLVED / APPROVED:
- Carryover-first stacking is now an explicit Architecture/UX decision rather than an unauthorized UI invention.
- Approved Day Section reading order: Section identity → unfinished carryover (“Arc is holding your place”) → today’s plan.
- Unfinished teaching is prerequisite reality, not a peer planning column. It receives reading priority and full available work width.
- Stacking is approved across desktop and smaller layouts. Extra vertical height is acceptable because it occurs only for Sections with genuine divergence and preserves readable resume notes/high-zoom behavior.
- UI owns the perceptual treatment of this approved stack; it may not reorder the behavioral hierarchy without escalation.


UX-NAV-01 — OPEN BLOCKER:
- The interface branch added CalendarViewRail scrollIntoView behavior on every active-view change.
- This changes navigation/scroll behavior outside the approved Day interface scope and may move ancestor scroll containers.
- Remove it from this PR or escalate it as a separate UX/navigation proposal with a specific user problem and direct evidence. It may not hitchhike on Day visual work.


A11Y-SEM-01 — OPEN:
- Day presentation currently applies aria-label to generic div containers for unfinished teaching, plan-for-today, and Lesson groupings.
- Accessibility semantics must describe real structure. Prefer native section/heading relationships or an appropriate semantic element/role only when warranted.
- Generic-container naming is not accepted as sufficient accessibility evidence. Assistive-technology/browser verification remains required.


QA-PERCEPT-01 — OPEN TEST-SUITE BLIND SPOT:
- Existing permanent contracts prove Day data/projection truth but not the rendered perceptual contract.
- Plausible UI mutations such as hiding a resume note, reversing carryover/plan priority, or visually collapsing their distinction could still leave the domain suite green.
- Add the smallest stable render/structure regression coverage for the approved hierarchy. Avoid brittle pixel-only snapshots.


DIRECT-EVIDENCE-01 — OPEN EVIDENCE GATE:
- Keyboard-only, 200–400% zoom/reflow, small-laptop, touch/mobile, rendered hierarchy inspection, and meaningful assistive-technology semantics are not yet directly proven.
- These are not automatically source defects, but they prevent GREEN.


PASSING EVIDENCE RETAINED:
- Day interface changes remain mostly narrow and use canonical Wax & Wing tokens.
- No new primary palette, type family, generic card system, gradient/glass treatment, or separate product identity was introduced.
- Core copy remains at/above the canonical size floor and long content wrapping is improved.
- No Day UI change has taken ownership of persistence, Recovery, Shift, schedule truth, or canonical planning state.


Clearance condition:
- PR #13 stays unmerged while ORANGE.
- Resolve/remove the unrelated navigation behavior; correct semantic structure; add robust perceptual hierarchy coverage; then re-run RGAV from zero against the new exact head.
- GREEN cannot be assigned until relevant direct interaction/accessibility evidence also exists.


58. TWO-CLEAN-AUDIT GO RULE — 2026-09-03
Standing rule:
- Two consecutive clean audits may trigger GO for the audited milestone or integration decision.
- A clean audit means no unresolved blocker, no unresolved hard stop, no newly discovered material defect, no false-Green evidence gap material to the decision, and no known authority/branch/SHA mismatch.
- The two audits must be meaningfully independent in method or focus. Re-running the same superficial check twice does not count as two clean audits.
- Audit 2 must begin from the current exact artifact/head and must not inherit Audit 1's assumptions. If the artifact changes materially between audits, the count resets.
- If either audit returns ORANGE, RED, a hard stop, or a material unresolved evidence gap, the count resets to zero after fixes.
- When two qualifying clean audits are complete, Arc may automatically advance to GO for that specific milestone without requiring a third discretionary review unless the Product Spec explicitly requires human approval for that action.
- This rule does not override release-only protections, main-branch protection, external-beta gates, legal/security/privacy requirements, or any action that explicitly requires Kelly's approval.
- GREEN remains the highest/best state. Two consecutive GREEN-equivalent clean audits are the qualifying path to GO.




Checkpoint 58 — Canonical Unit/Lesson Object Actions + Two-Clean-Audit GO
Date: 2026-09-03


Behavioral contract:
• Move preserves stable identity and teaching history. Drag-and-drop is only an accelerator for Move, never the only route.
• Unplace removes calendar placement but preserves the curriculum object and teaching history.
• Delete destroys the curriculum object and is dependency-checked/fail-closed.
• UI must use precise labels Move / Edit / Unplace / Delete. “Remove” is not an approved ambiguous action label.


Unit rules:
• Move Unit is rejected if any child Lesson or Section-specific Lesson placement would fall outside the proposed Unit span.
• Unplace Unit is rejected while child Lessons remain scheduled or Section-specific placements remain. Arc will not silently cascade-remove those dates.
• Delete Unit is rejected while any child Lesson remains.


Lesson rules:
• Move Lesson preserves ID, date policy, and teaching history and must remain within its Unit on a confirmed instructional day.
• Unplace Lesson clears the shared planned date and all Section-specific schedule overrides, preserves stable identity and teaching history, converts fixed-with-no-date to flexible, and returns the exact removed Section overrides as consequence evidence.
• Delete Lesson is rejected while teaching history or Section-specific schedule overrides remain.


Audit evidence:
Audit 1 exact head e68b6c14f1d6e8eac7923f0317f1361ef510a38f, GitHub Arc verify run 33804718013: GREEN.
Audit 2 was an independent false-Green/test-suite mutation pass using the Wax & Wing RGAV standing audit rules. It identified an implicit consequence-reporting weakness in Lesson Unplace, corrected it by making removed Section overrides explicit, strengthened preservation assertions, and then exact head a757f3546a159cb32048f142447fda6270280331 passed GitHub Arc verify run 33804965312: GREEN.
Under the standing governance rule, two consecutive clean audits trigger GO for this domain milestone. Browser/UI interaction remains a separate evidence gate.


59. FRIDGE DOOR INTERACTION LOCK + WORKSPACE RESET + VOICE MAGNETS — 2026-09-04


Authority / supersession
- This checkpoint is the current product authority for the Fridge / Ideas planning surface and supersedes older Ideas Workbench language wherever the two conflict.
- Historical Ideas terminology remains evidence only. The active architecture is the Fridge Door: a finite, persistent spatial planning surface over canonical Units, Lessons, and Fridge-owned Magnets.
- The calendar remains Arc Home and the dominant product surface. The Fridge may overlay/dock/collapse but must never become a second planner or permanent dashboard.
- Simpler is the governing interaction rule. Do not add additional magnet taxonomies, color systems, cleanup automations, or tutorial chrome unless a demonstrated user problem requires them.


Fridge object model
- Unit, Lesson, and Magnet remain distinct canonical object kinds. Fridge position, calendar placement, stack membership, Unit relationship, and Must/Should/Could priority are separate dimensions and must never silently rewrite one another.
- Magnets are deliberately unfinished thinking. Units and Lessons are real curriculum objects and retain canonical object-action protections.
- Door = working now. Drawer = keep for later. Neither location deletes or archives the object.
- Stack = temporary spatial/sequence relationship only. Stacking never silently assigns a Unit, changes a calendar date, changes priority, or creates curriculum structure.


Magnet types and recognition
- Magnet type is intentionally small and recognition-first: Idea, Voice, Resource, Reminder. Unit and Lesson remain their own object types rather than magnet subtypes.
- Color communicates magnet type only. Exact colors must be selected from the canonical Wax & Wing / Arc palette; no new primary palette is authorized by this checkpoint.
- Color may never be the only signal. Magnet type/provenance must remain available through accessible semantics and contextual visible text where ambiguity requires it; an always-visible type tag is not mandatory chrome.
- When visible type/provenance text is needed, it communicates what the object is. Contextual previews communicate what the teacher can do with it.
- First-use/contextual previews may explain unfamiliar magnet types or interactions, then get out of the way. The teacher may toggle these previews off after learning the interface.
- Type/provenance semantics are structural recognition/accessibility cues and are not removed by turning tutorial/discovery help off.
- Do not add a permanent Fridge legend merely to explain an over-coded type system. Help may explain type/provenance on demand if testing shows a real recognition need.
- Must/Should/Could remains a separate priority relationship. Priority must not recolor a Magnet in a way that destroys its type meaning.


Voice Magnet
- Voice capture is a first-class Magnet input path: record first, organize later.
- Starting a recording creates/preserves a Voice Magnet even if transcription is unavailable or later fails. Audio is the primary captured artifact; transcript is an enhancement, not a prerequisite for existence.
- A Voice Magnet may be stacked, repositioned, prioritized, put away, brought back, discarded, or deliberately promoted/attached through later explicit workflows. Arc must not automatically convert a recording into a Lesson, Unit, task, or calendar commitment.
- Voice capture is particularly appropriate after teaching. A teacher may record what happened, what failed, what to revisit, or what to remember without completing a formal reflection workflow.
- Live Classroom may expose a lightweight post-teaching voice capture path, but any relationship to the taught Lesson versus creation of a new Fridge Magnet must remain explicit. Arc never guesses future work from a recording.
- Future transcription/AI assistance remains teacher-controlled and may not replace or silently rewrite the original recording.


Discard / Delete / Put away
- Put away is non-destructive and moves an item from Door to Drawer.
- Discard is a Fridge-specific destructive action for Magnet objects only. It means the teacher no longer wants that captured thought/resource/reminder/recording.
- Discard must offer an immediate recoverable Undo path appropriate to the implementation. It may not silently destroy a Unit or Lesson.
- Units and Lessons continue to use canonical Delete with dependency checks, explicit consequence/confirmation behavior, and fail-closed protection. Do not relabel Unit/Lesson destruction as Discard.
- When a Magnet is selected and focus is not inside an editable text/input control, Delete or Backspace invokes Discard.
- When a Unit or Lesson is selected and focus is not inside an editable text/input control, Delete or Backspace opens the canonical Delete confirmation; it never immediately destroys the curriculum object.
- Delete/Backspace must behave normally while typing and must never trigger a Fridge destructive action from an editable field.
- Esc cancels a transient drag/selection/menu where safe and does not mutate canonical content.


Clean Up = workspace reset, not content cleanup
- Clean Up means “put the workspace away and return to the calendar,” not delete, archive, auto-sort, or reorganize teacher content.
- Clean Up closes/collapses transient Fridge surfaces, closes the Drawer, collapses open Magnet stacks, dismisses transient menus/editors, clears selection, cancels uncommitted drags, and returns the central stage to the teacher’s main calendar context.
- Clean Up must preserve every canonical object, Fridge position, stack membership, priority, calendar placement, teaching-history record, and saved relationship. It performs no hidden scheduling, reprioritization, reparenting, archival, or deletion.
- The interaction should feel like pushing the drawers in at the end of a work session: concise, satisfying, and subordinate to speed.
- UI may sequence the closing motion perceptually, but the behavioral result must be deterministic and quick. Reduced-motion mode resolves immediately or with minimal motion.
- “Clear Workspace” is not the preferred label because it suggests destruction. The approved product language is Clean Up.


Separate Fridge housekeeping behavior
- A future “tidy” or cleanup-assistance function may suggest spatial housekeeping when the Door is crowded, but it is distinct from Clean Up.
- Any tidy operation may snap/reflow positions only when explicitly chosen and must not change stacks, Unit relationships, calendar placement, priority, or object identity unless separately previewed and approved.
- Age may be used to suggest review but never to auto-demote, auto-discard, or silently move content.
- Full Door behavior remains finite and safe: new eligible unplaced content goes to Drawer when Door capacity is full; nothing is evicted because it is old.


Reactive interaction contract
- Reactive magnet UI is an authorized next interface milestone only on top of the already-cleared Fridge domain/persistence foundation.
- Drag is an accelerator over canonical behavior, never a second logic path. Every drag action must have a non-drag equivalent.
- Required feedback includes magnet lift/selection state, live snap targets, valid/invalid target feedback, stack-formation preview, stack fan/reorder behavior, Must/Should/Could target reactions, structural Unit-assignment preview, Drawer/overflow reactions, and smooth return to origin when an action is rejected.
- Invalid targets explain why. Stale targets or failed actions preserve canonical state and return the Magnet/object safely.
- Keyboard, touch, high-zoom, high-contrast, and reduced-motion equivalents are release requirements, not optional polish.


Do not reintroduce
- automatic oldest-item eviction;
- hidden infinite backlog behavior;
- folders/categories/type tabs as the primary Fridge model;
- overlap that silently creates a stack;
- stack overlap that silently reparents curriculum;
- color-only type recognition;
- priority colors that overwrite Magnet-type meaning;
- automatic Voice Magnet → Lesson/Unit conversion;
- “Clean Up” that deletes, archives, schedules, restructures, or reprioritizes content;
- generic permanent trash-can UI that encourages accidental destructive dragging;
- tutorial overlays that remain noisy after the teacher has learned the interaction.


Implementation sequencing
1. Preserve the current GREEN Fridge domain/persistence foundation.
2. Implement this interaction contract through the Fridge UI without inventing new state ownership.
3. Apply the canonical Brand System before visual construction; exact magnet colors/treatments come from approved tokens/assets, not new taste-driven choices.
4. Add contextual first-use previews and the teacher toggle without making tutorial state part of canonical planning truth.
5. Add Voice Magnet capture with recording persistence and failure-safe audio retention before optional transcription enhancement.
6. Run hostile browser interaction/a11y testing, including keyboard Delete/Backspace, editable-field protection, Discard Undo, Clean Up state preservation, drag rejection, full Door/Drawer behavior, touch, high zoom, and reduced motion.
7. Material interaction changes reset the two-clean-audit count for the affected UI milestone. GREEN remains the best state.


60. MAGNET DEPTH MODEL + LABEL-LIGHT SHELL + TAKE A LOOK AROUND — 2026-09-04
Authority / supersession
- This checkpoint extends and, where necessary, supersedes Section 59. It is the current interaction authority for magnet movement, contextual editability, visible surface labels, and Arc’s first-use/help-discovery experience.
- Governing metaphor: teacher input behaves like a magnet whose history persists while its current location determines how much structure and manipulation Arc exposes. Location changes capability depth, not identity or backstory.
- Keep the model simple. Do not require teachers to classify or fully structure an idea before moving it somewhere useful.


Magnet-first interaction model
- Drag-and-drop is a first-class interaction for all magnets and all eligible magnet-like teacher planning input. Drag is not decorative. It is the primary spatial accelerator for moving the same object through Arc’s levels of commitment.
- Every drag path still requires an accessible non-drag equivalent. Keyboard/touch/non-drag movement must invoke the same canonical transition and validation path rather than parallel logic.
- A magnet retains stable identity, accumulated notes/history/resources/relationships, and prior teaching/planning context as it moves. Moving backward to a lower-depth surface reduces the controls currently exposed; it does not erase information already collected.
- Location controls default editability. The same underlying object may expose progressively richer manipulation as it moves closer to committed teaching.
- Example metaphor: a Fridge magnet that says “Las Vegas” may be nothing more than that thought. Moving it to the priority/task area exposes lightweight task-level editing such as notes and red-circle cannot-forget emphasis. Moving it to the calendar exposes the full planning controls appropriate to a scheduled object. Those calendar-level details can eventually feed the Day/Live Classroom/classroom-display surfaces.
- Dragging an object back to a prior surface returns it to that surface’s normal capability depth without deleting the richer backstory it accumulated elsewhere.
- Teachers may explicitly override progressive disclosure. Selecting an object may expose a simple Edit action that opens the fullest appropriate editor when the teacher wants deeper control without first moving the object to a higher-depth surface.
- Progressive disclosure is a UI/accessibility strategy, not a data-loss strategy. Hidden fields remain canonical data and must reappear when the object returns to a context that exposes them or when full Edit is explicitly invoked.


Capability depth by location
- Fridge Door: capture/recognize/arrange. Default interaction is intentionally light: title/thought, basic type or capture provenance when needed for accessibility, stacking/spatial organization, Put away/Bring back, and movement onward. Do not turn Fridge capture into a form.
- Priority/task area: action-oriented middle depth. The object may gain lightweight notes, Must/Should/Could relationship, red-circle/cannot-forget emphasis, completion/task treatment, and movement toward a date while retaining its original capture history.
- Calendar: committed planning depth. Scheduling exposes the fuller Unit/Lesson/planning controls, date/course/Section relationships, resources, structure, and other approved editable fields. Calendar placement does not create a new copy.
- Day / Live Classroom / classroom display: teaching depth derived from the same canonical planning object plus Section-specific teaching state. These surfaces consume the accumulated object history rather than rebuilding it.
- The exact field set at each depth is UX-owned and should remain minimal. UI may progressively reveal controls, but may not invent a new state model per surface.


Labels and visual orientation
- Remove redundant persistent labels for self-evident primary surfaces and objects. A calendar does not need a large label saying Calendar; the Fridge Door should read as the Fridge Door through placement, material language, interaction, and context rather than constant explanatory chrome.
- This does NOT authorize removing necessary semantic names, accessible labels, object titles, dates, Section identity, or disambiguating text. Visual-label reduction must never make keyboard, screen-reader, high-zoom, or new-user orientation ambiguous.
- Section 59’s requirement for always-visible Magnet type tags is superseded as a universal visual rule. Magnet type/provenance may be communicated contextually through approved visual treatment and accessible semantics; visible text type labels should appear only where they materially prevent ambiguity. Color alone is still insufficient for accessibility.
- Prefer recognizable placement and reactive behavior over permanent instructional labels.


Take a Look Around: first-use discovery model
- Replace conventional tutorial chrome, persistent question-mark badges, and step-by-step modal walkthroughs with a reactive first-use discovery mode called “Take a Look Around.”
- It may run on first entry after setup and may be deliberately reset/restarted later from Help/settings. It never blocks ordinary use once dismissed.
- Opening state: the calendar remains recognizable in the background. A simple Arc shape appears near the center with a slow, restrained pulse that creates anticipation and clearly suggests interaction without text-heavy instruction.
- Activating the Arc shape begins the welcome. The surrounding interface dims from outside inward while the central focus remains clear. Reduced-motion mode uses an immediate or minimal transition rather than the full animated sequence.
- Welcome language should be concise and human, e.g. “Welcome to Arc.” Then orient around things the teacher can do rather than interface nouns: jot an idea, record a thought, shift a class, plan the day, put something away.
- No more than five key locations/actions are introduced in the initial sequence. Candidate anchors are the calendar, Fridge Door/capture area, priority/task area, Drawer, and Shift or the most important remaining primary action. Final selection should follow the implemented architecture rather than forcing five when fewer are sufficient.
- During orientation, the relevant physical regions slide/reveal/react briefly to show where those actions live. Example: “jot an idea” causes the Fridge Door/capture region to reveal itself. The tutorial teaches spatial cause-and-effect rather than presenting a diagram of labeled features.
- The sequence ends with a deliberate wrap-up motion: revealed regions return to their resting positions, the dimming clears, and Arc returns to the real workspace rather than a tutorial-only screen.
- Closing message should communicate exploration, not homework. Directional intent: “Explore. As you get to know Arc, helpful things you haven’t tried yet will light up. Click when you want, or leave them for later.” Final copy is UI/voice work, not locked verbatim here.


Ongoing discovery / How-to mode
- After the initial Take a Look Around sequence, unexplored helpful interactions may receive a restrained persistent highlight/reactive state based on actual use history.
- Highlights are triggered by interaction discovery state, not by a fixed tour order. A teacher’s click/use pattern determines which unexplored affordances remain eligible to light up.
- An unexplored highlight stays available until the teacher uses/opens that affordance or explicitly disables discovery help. It does not repeatedly interrupt work, open itself, or demand completion.
- Clicking a highlighted affordance gives a short contextual explanation at the point of use, then clears that affordance’s unexplored highlight.
- No question-mark badges on every object or feature. Help is a single intentional route plus contextual discovery.
- Help may offer “Keep how-to mode on” / equivalent preference so teachers can retain reactive discovery, turn it off, or restart Take a Look Around later.
- Discovery state is a preference/learning layer only. It must never change canonical planning data, object depth, scheduling, priority, Fridge placement, or teaching history.


Reactive movement requirements
- While dragging, destinations must react before drop: valid target recognition, capability-depth preview, rejection reason when invalid, and clear return-to-origin behavior on cancel/failure.
- A move from Fridge → task/priority → calendar should preview the new level of available manipulation without forcing the teacher through an editor before the move completes unless canonical validation requires missing information.
- A move backward should preview that the object is becoming lighter/less exposed, not being erased. If hidden richer data exists, Arc preserves it silently and may provide a quiet backstory/details affordance rather than warning as though information will be lost.
- Dragging between surfaces never clones by default. It is one object changing context. Copy/duplicate, when supported, must be explicit.
- Structural changes that genuinely alter curriculum relationships, Section schedule, or calendar truth still require the existing canonical previews/validation. The magnet metaphor does not bypass Move/Shift/Unit/Lesson safety contracts.


Do not reintroduce
- permanent labels for self-evident primary surfaces merely to explain the UI;
- visible type tags on every Magnet as mandatory chrome;
- question-mark badges scattered across objects;
- a linear tutorial checklist the teacher must finish;
- modal tutorial cards covering the interface when spatial reaction can teach the same thing;
- separate copies of an idea/task/lesson as it changes surfaces;
- loss of accumulated object details when moving backward in capability depth;
- forced full-detail editing before a teacher can capture or move a thought;
- drag-only core behavior without keyboard/touch/non-drag equivalents;
- discovery highlights that blink, nag, auto-open, or interfere with planning.


Implementation / audit consequence
- Before reactive-magnet UI is considered GREEN, test Fridge → priority/task → calendar → backward movement with accumulated history and prove no data loss, no cloning, and correct capability-depth changes.
- Test explicit full Edit from a lower-depth location.
- Test first-run Take a Look Around, dismissal, restart/reset, reduced motion, keyboard-only, touch, 200–400% zoom, screen-reader semantics, and partial exploration across reload.
- Test that unexplored highlights follow use history, persist appropriately, clear only when learned/disabled, and never mutate planning state.
- Any implementation that restores the older Ideas Workbench model, mandatory Magnet type labels, question-mark tutorial system, or surface-specific copies conflicts with this checkpoint and must be treated as a regression.


61. FULL BLUEPRINT CONTINUITY AUDIT — MAGNET DEPTH HIERARCHY — 2026-09-04


Audit purpose
- Reconcile the entire canonical Product Spec against the Section 60 hierarchy: capture lightly, add task-level structure when useful, commit to calendar when ready, and derive Day/Live Classroom/classroom display from the same accumulated planning truth.
- Prevent older Ideas-workbench, separate-priority-object, surface-copy, mandatory-label, or Easel-era language from competing with the current model.


Continuity result
- The hierarchy is coherent with Arc’s strongest existing architectural rules: stable identity, one canonical truth, reversible movement, preview before consequence, no silent loss, calendar-centered navigation, Section-specific teaching state, and progressive disclosure.
- The magnet metaphor is an interaction model, not a mandate to collapse every domain entity into one literal Magnet type. Unit, Lesson, Magnet, and Note remain distinct canonical object kinds where their semantics, dependencies, history, or deletion protections differ. All may participate in magnet-like direct manipulation where appropriate.
- Location controls default capability depth and visibility of controls. Location must not become the sole owner of data, identity, history, or curriculum semantics.
- Must / Should / Could is a relationship/state layer on the same underlying planning object, not a cloned task object.
- Calendar placement is increased commitment and increased editing depth, not automatic conversion into a Lesson. When Lesson/Unit semantics are genuinely required, Arc asks for explicit structure/promotion while preserving the original object identity/provenance/backstory wherever the domain permits.
- Day, Live Classroom, and classroom display are downstream projections/teaching surfaces. They consume canonical planning objects plus Section-specific teaching state; they do not create new copies of the same thought.


Core-spec conflicts corrected in this audit
- Replaced the active Ideas Workbench doctrine with Fridge Door + spatial staging.
- Reframed the canonical model to include Magnet explicitly and removed the obsolete calendar-or-Ideas binary location rule.
- Reframed loose Lesson editing around location-appropriate actions plus explicit full Edit.
- Replaced Return to Ideas / detach-to-Ideas language with Unplace / move back to Fridge while preserving identity and backstory.
- Reframed Must/Should/Could from separate add/edit/delete task CRUD toward a relationship on the same planning object; red-circle behavior now means cannot-forget emphasis rather than defining object identity.
- Replaced unscheduled Ideas wording in Shift with unscheduled/uncommitted Fridge objects.
- Replaced Ideas in active filter, mobile, beta-gate, and delivery-order language with the current Fridge/Magnet model.
- Updated the active rebuild-order language from Day/Easel to Day/Live Classroom and placed Fridge/reactive magnet depth work explicitly after foundational continuity/integration work.
- Removed the duplicate competing Section 60 and retained one consolidated Section 60 authority.
- Removed the universal requirement for visible type tags and permanent legends while preserving accessible semantics and contextual disambiguation.


Historical-language rule
- Earlier build checkpoints may continue to contain words such as Ideas or Easel when they accurately describe what existed or was believed at that historical checkpoint. Those references are historical evidence only.
- Historical checkpoint language must not be interpreted as current product direction when Sections 55, 59, 60, or this Section 61 supersede it.
- Older “next authorized” instructions inside historical checkpoints are not active sequencing authority once a later supersession/checkpoint explicitly changes them.
- Easel remains legacy terminology in historical code/checkpoint records only; the current product surface is Live Classroom inside Arc.


Authoritative interaction hierarchy
1. Fridge Door / Drawer — capture, remember, arrange, stack, put away, bring back. Minimal required structure.
2. Priority/task depth — same underlying object gains lightweight action detail, notes, Must/Should/Could relationship, cannot-forget emphasis, and completion treatment.
3. Calendar depth — same underlying planning object gains date/course/placement context and richer planning controls. Structural Unit/Lesson rules remain explicit and protected.
4. Day — projects what matters today from canonical planning truth plus Section-specific continuity.
5. Live Classroom — focused teaching view of one explicit Section + Lesson context; may record teaching outcome but never becomes a second schedule/planning store.
6. Classroom display / Daily Board — later Day-derived student/sub-facing projection across periods; same truth, no duplicate planning model.


Backward movement contract
- Moving toward a shallower depth changes what is exposed, not what Arc remembers.
- Accumulated notes, resources, audio, provenance, historical structure, relationships, and teaching history remain stored when valid for that object.
- Hidden richer fields are not silently cleared merely because the current surface does not show them.
- Any true structural consequence required by canonical Unit/Lesson rules still receives preview/validation and may block the move rather than pretending the hierarchy overrides domain safety.


UI authority / communication rule
- UI must treat Sections 55, 59, 60, and 61 plus the canonical Brand System as the current behavioral/perceptual boundary for Fridge, magnet movement, progressive disclosure, labels, tutorial/discovery, and Live Classroom continuity.
- Before implementing or materially changing any Fridge, task/priority, calendar-object, onboarding, Help, or drag interaction, UI must check the current Product Spec rather than relying on older PR copy, screenshots, or historical checkpoint language.
- Any UI proposal that creates separate visual copies for Idea → Task → Lesson, removes stored history on backward movement, requires permanent explanatory labels, or turns progressive disclosure into separate state stores is a regression and must be escalated to Architecture/UX.
- Any future Architecture/UX change to object depth, movement consequence, label policy, tutorial/discovery, or data survival must be recorded in the Product Spec first and communicated to the relevant active UI issue/PR before implementation proceeds.


Audit status
- PRODUCT/ARCHITECTURE CONTINUITY: CLEAN after reconciliation.
- This is a blueprint/document audit only. It does not certify current UI implementation, browser interaction, persistence wiring, or accessibility execution as GREEN.
- Reactive magnet UI still requires its own implementation, hostile browser/a11y audit, and the standing two-clean-audit rule before GO.


62. SIMULATED TEACHER COUNCIL PRODUCT PRESSURE TEST — 2026-09-04


Evidence status
- This is simulated consumer/product pressure-testing, not human beta research. It is intended to expose obvious adoption, trust, workflow, accessibility, and classroom-reality failures before UI implementation hardens them.
- Simulated roles include: veteran high-school teacher, first-year teacher, elementary teacher, special-education teacher/case manager, AP/advanced-course teacher, itinerant/shared-room teacher, teacher with heavy family/personal-calendar load, tech-averse teacher, keyboard/assistive-tech user, and teacher who plans collaboratively across Sections.


Pitch used for the panel
Arc is a teacher-first planner built around the calendar you already live in. You can throw a thought onto the Fridge in seconds, drag the same idea toward priority or calendar commitment as it becomes more real, and Arc reveals more structure only when you need it. It remembers the backstory when plans move backward. The same planning truth follows through Day, class-by-class teaching progress, Live Classroom, and eventually a student/sub-facing Daily Board. Arc is designed for the fact that teaching plans change, classes get out of sync, and teachers need to recover without rebuilding everything.


Council question: “Do I have to decide whether something is a Unit, Lesson, task, or idea before I write it down?”
ARC SOLUTION:
- No. Quick capture defaults to a lightweight Magnet when the teacher has not explicitly chosen stronger structure.
- Arc may recognize obvious intent for presentation, but it must not silently convert a loose thought into Unit/Lesson curriculum structure.
- Explicit Unit/Lesson creation remains available when the teacher already knows what the object is.
- Moving toward calendar commitment may request only the minimum missing information required for a valid placement, such as Course/date/Unit relationship when required. It must not open a full formal lesson-plan workflow as a prerequisite to scheduling.


Council question: “What if I drag something to the calendar and Arc suddenly asks me twenty questions?”
ARC SOLUTION:
- Calendar drop uses minimum-required completion. Ask only for information structurally necessary to make the requested placement safe.
- Optional detail remains hidden behind explicit Edit/Add more info.
- If a target cannot accept the object without additional structure, the drop preview says what is missing before commitment. Cancel returns the object to origin unchanged.
- No surprise form takeover after drop.


Council question: “What if I put something somewhere and later cannot remember where it went?”
ARC SOLUTION:
- No important planning object may become undiscoverable because of depth/location changes.
- Add a lightweight universal Locate/Find capability as recovery infrastructure, not primary navigation chrome. It searches object title/content/provenance and reports current context: Fridge Door, Drawer, priority/task, calendar date, Unit, or teaching history where applicable.
- A Locate result must take the teacher to the object’s current real context rather than making a detached duplicate search card.
- Recently moved/changed objects may also surface in immediate Undo/history feedback, but Locate/Find is the durable recovery path.


Council question: “I’m scared drag-and-drop will move something important by accident.”
ARC SOLUTION:
- Drag is preview-first. Structural calendar/Unit/Section consequences remain visible before commitment where meaningful.
- Invalid or ambiguous drops reject safely and return to origin.
- Small spatial repositioning within the Fridge may commit directly because it changes only position; structural movement uses canonical Move/preview rules.
- Undo/recovery remains appropriate to the action; destructive Unit/Lesson changes never happen from an accidental drop alone.


Council question: “What happens when Tuesday blows up and Period 2 is ahead of Period 5?”
ARC SOLUTION:
- Existing canonical Course → shared Unit/Lesson → Section-specific teaching-state architecture is the answer.
- Shared curriculum does not clone per Section. Day shows exact Section continuity. Shift/Recovery previews schedule consequences without moving fixed work silently. Live Classroom records where an individual Section actually stopped/completed/skipped.
- This is a core Arc differentiator and must be visible in product demos without turning the UI into a data model lecture.


Council question: “Can I plan my life too, or is this only school?”
ARC SOLUTION:
- The calendar remains broad enough to coexist with teacher-selected personal Google Calendar overlays and teacher-owned Notes/priorities.
- Personal events remain distinguishable from Arc curriculum and school-calendar truth. Arc does not reinterpret a dentist appointment as a Lesson.
- The product should support real teacher-life orientation without turning into a generic life-management app.


Council question: “I teach six periods. Am I going to enter the same thing six times?”
ARC SOLUTION:
- No. Course curriculum is shared; Sections reference it. Per-Section divergence is recorded only when teaching reality differs.
- Creating or editing shared curriculum once should remain the default. Arc must never force per-Section duplication just to display progress.


Council question: “What if I just want to write ‘Las Vegas’ and move on?”
ARC SOLUTION:
- That is a first-class success case. Capture must take seconds.
- No required tags, category picker, Unit assignment, date, standards, objective, or template selection at Fridge depth.
- Voice Magnet is equivalent: record first, organize later.


Council question: “How do I know what all these colors and weird magnet things mean?”
ARC SOLUTION:
- Do not solve this with permanent labels everywhere.
- Use restrained, consistent visual treatment plus accessible semantics; visible disambiguation appears only where ambiguity exists.
- Take a Look Around teaches spatial cause-and-effect on first use. Ambient How-to highlights unexplored helpful interactions without interrupting work.
- If real usability testing shows type recognition remains weak, add the smallest contextual cue that fixes the problem rather than reinstating a permanent legend by default.


Council question: “What if I hate tutorials?”
ARC SOLUTION:
- First-use discovery is brief, skippable, restartable, and never blocks ordinary use after dismissal.
- How-to mode can be turned off. Discovery state is preference-only and never changes planning behavior.


Council question: “What if I love tutorials because I forget things?”
ARC SOLUTION:
- Help can restart Take a Look Around and keep contextual How-to mode on.
- Unexplored useful areas may stay quietly highlighted until used or disabled; they do not expire on an arbitrary timer.


Council question: “Can I use Arc without dragging? I’m on a trackpad / keyboard / touch device / I have motor-access needs.”
ARC SOLUTION:
- Every drag route has the same non-drag destination chooser, preview, validation, and persistence path.
- Keyboard/touch/high-zoom behavior is a release requirement, not a later accessibility enhancement.
- The hierarchy cannot depend on hover or precision pointer placement.


Council question: “Does moving something backward make me lose the lesson plan I already wrote?”
ARC SOLUTION:
- Never as a side effect of depth change. Backward movement reduces visible controls, not stored backstory.
- If a canonical Unit/Lesson structural rule genuinely blocks the move, Arc blocks and explains rather than clearing data to make the metaphor work.
- Full Edit remains available from shallower locations when the teacher needs richer stored detail.


Council question: “What does Clean Up actually do? Is it deleting my stuff?”
ARC SOLUTION:
- Clean Up is workspace closure only: push the drawers in, collapse transient stacks/panels, clear transient selection, cancel uncommitted drag, return to the main calendar context.
- It never deletes, archives, schedules, reprioritizes, reparents, or changes saved Fridge positions.
- The animation should be satisfying but fast; reduced motion resolves immediately/minimally.


Council question: “What if my Fridge becomes a disaster?”
ARC SOLUTION:
- Door is finite. Drawer safely receives overflow. Nothing is evicted because it is old.
- Teacher-controlled Tidy may reflow/snap positions only; it cannot silently change meaning, stacks, Unit relationships, priority, or calendar placement.
- Locate/Find prevents Drawer/Fridge depth from becoming a memory trap.


Council question: “Can I record myself while I’m walking between classes?”
ARC SOLUTION:
- Voice Magnet supports capture-first use. Audio persists even if transcription is unavailable or fails.
- Transcription/AI enhancement is optional and teacher-controlled.
- Product/privacy implementation must expose recording/transcription status truthfully and never imply a transcript exists when it does not.


Council question: “I do not want a microphone app listening to me all day.”
ARC SOLUTION:
- Voice capture is explicit user initiation only. No passive listening.
- Recording state must be unmistakable while active and easy to stop/cancel.
- Audio/transcript retention, deletion, sync, and account/privacy behavior require an explicit privacy/storage contract before external beta. This is now a product gate, not a later legal footnote.


Council question: “Can I get from a calendar plan to something students can actually see?”
ARC SOLUTION:
- Yes, but through the same planning truth. Calendar-level detail feeds Day; Day/Section context feeds Live Classroom; a later Daily Board projects the day across periods for students/subs.
- Daily Board is not a second lesson-plan system and not a manual copy/paste display. It derives from teacher-selected Day truth and allows presentation-specific visibility choices without mutating curriculum.


Council question: “What if the thing students should see is different from my private teacher notes?”
ARC SOLUTION:
- Classroom-facing visibility must be explicit. Private teacher notes/resources never become student/sub-facing merely because the object is scheduled.
- Add a presentation-visibility layer to calendar/Day-level detail: teacher-only by default for private notes; explicitly included fields/items may project into Live Classroom/Daily Board.
- Visibility is presentation metadata, not a duplicate content object.


Council question: “Can I prep a sub without exposing everything?”
ARC SOLUTION:
- The same presentation-visibility principle applies. Daily Board/Sub Plan views consume approved fields from canonical planning truth; private notes stay private.
- Sub Plans remain later product-family work but must reuse this visibility layer instead of inventing a second copy of Lessons.


Council question: “Will Arc work if the internet is bad at school?”
ARC SOLUTION:
- Existing product requirement remains: durable local fallback with truthful save state and reconciliation after connection returns.
- No cloud-only core planning interaction may be presented as complete for beta until offline/reconnect behavior is proven.


Council question: “What about Google Classroom, Canvas, PowerSchool, Teams, etc.?”
ARC SOLUTION:
- Arc cannot promise every SIS/LMS integration at launch. The product should say this plainly.
- Integrations are adapters around canonical Arc truth, never the owner of planning identity.
- Launch priority remains Google sign-in/calendar/Drive where actually implemented. Other LMS/SIS integrations require separate supported-provider work and should not block the core planner unless beta evidence shows a specific platform is essential to adoption.


Council question: “Can my teammate and I co-plan?”
ARC SOLUTION:
- Shared curriculum/team spaces are later product-family work, not part of the first independent-teacher beta.
- Before collaboration is enabled, ownership/permissions/version-conflict behavior must be explicit; Arc must not fake collaboration through shared Drive files that can overwrite canonical state unpredictably.
- The current single-teacher workspace remains private by default.


Council question: “I am a first-year teacher. What if I have no curriculum to start with?”
ARC SOLUTION:
- Arc should still open as a usable calendar + capture system with no demo curriculum.
- Quick Magnets, Units/Lessons created on demand, import/reuse later, and optional templates later support growth without fabricating content.
- Empty-state UI should invite a real action (“jot something,” “add your first Unit,” etc.) without filling the workspace with fake sample lessons.


Council question: “I am a veteran teacher. What if I already have years of stuff?”
ARC SOLUTION:
- Prior-year reuse/import remains required later and should preserve provenance rather than flattening old plans into new copies with no history.
- Import should preview what will be created/linked before consequence. It cannot become a reason to delay the core planner, but it is a serious retention/adoption feature for experienced teachers.


Council question: “Is this going to become another giant teacher dashboard?”
ARC SOLUTION:
- No. Calendar remains visually dominant. Fridge/task/Drawer/Help/Live Classroom are contextual surfaces, not a permanent multi-column control center.
- Clean Up restores the workspace to the calendar. Label-light shell remains authoritative.


New requirements created by this council audit
1. UNIVERSAL LOCATE/FIND RECOVERY
- Add a lightweight universal Locate/Find capability for teacher-owned Arc planning objects.
- Search returns the object’s real current context and navigates there; it does not create detached duplicate result cards as a second workspace.
- Must work across Fridge Door, Drawer, task/priority context, calendar placement, Unit relationship, and relevant teaching-history reference.
- Search/Locate is recovery infrastructure and may remain visually quiet until invoked.


2. MINIMUM-REQUIRED CALENDAR COMMITMENT
- Moving a lightweight Magnet toward calendar commitment requests only information required for a valid canonical placement/structure.
- Optional planning fields remain optional and available through Edit.
- Missing-required-info preview occurs before final structural commitment; cancel returns the same object unchanged.


3. PRESENTATION VISIBILITY LAYER
- Classroom-facing and substitute-facing projection requires explicit visibility metadata over canonical content.
- Private teacher content is private by default.
- Visibility controls presentation, not object identity, curriculum structure, or calendar placement.
- Live Classroom, Daily Board, and future Sub Plans must consume the same visibility rule rather than each inventing separate copies/settings.


4. VOICE PRIVACY/STORAGE GATE
- No passive listening.
- Recording requires explicit teacher initiation and unmistakable active state.
- Voice recordings are local-first. By default, audio is stored in an Arc-owned local document holder on the teacher’s device/app storage and is not automatically uploaded to Google Drive, Arc cloud storage, or a transcription service.
- The Voice Magnet stores one durable reference to that local recording plus its metadata/transcript state; moving the Magnet across Fridge, task/priority, calendar, Day, or other Arc surfaces must not duplicate the audio file.
- Voice recording remains push-to-record only. No passive listening.
- If local audio is deleted, Arc must handle the linked Voice Magnet truthfully: never show playable audio that no longer exists; preserve non-audio backstory where appropriate and clearly mark the recording as unavailable.
- Discard/deletion behavior must explicitly define whether the linked local recording is deleted, retained, or recoverable. No hidden file destruction.
- Transcription remains optional and teacher-controlled. Any future cloud backup, sync, transcription upload, or cross-device audio availability is a separate opt-in feature and must disclose its destination before transfer.
- Account isolation and offline behavior remain required. A local recording must never be surfaced inside another teacher’s workspace on the same device.


5. DEMO/PITCH REQUIREMENT
- Product demos must show the hierarchy through one persistent object, not feature slides: quick capture → task-level depth → calendar depth → Day/Section divergence → Live Classroom, with backward movement proving retained backstory.
- The demo must also show one failure/recovery case so Arc’s trust model is visible, not merely claimed.


Council audit disposition
- The new magnet-depth hierarchy survives the simulated teacher pressure test and becomes stronger under it.
- No blocker requires abandoning the hierarchy


63. SIMULATED TEACHER COUNCIL — LOCAL VOICE RECOVERY + DEVICE CONTINUITY — 2026-09-04
Evidence status
- Simulated product pressure-test only, not real human beta research.


Council question: “If Voice recordings live locally, what happens when I get a new laptop, clear browser/app data, or need the recording on another device?”
ARC SOLUTION:
- Local-first remains the default. Arc does not silently upload recordings merely to make multi-device access convenient.
- A Voice Magnet must always distinguish recording metadata from recording availability. The planning object/backstory may persist even if the local audio file is not present on the current device.
- Arc needs an explicit teacher-controlled backup/export path before Voice Magnet is considered beta-ready. Minimum acceptable behavior: Export local Voice recordings, or selected recordings, with stable identifiers sufficient for Arc to relink them later without creating duplicate Magnets.
- A future Restore/Import path may relink exported recordings to their existing Voice Magnets by stable recording/object identity. It must preview conflicts and may not silently overwrite newer local files or duplicate planning objects.
- Cross-device audio sync is optional future behavior, not assumed by the first local-first implementation. If offered, it is explicit opt-in and shows the destination, account, and consequences before upload.
- Clearing browser/app storage or removing the local Arc document holder may destroy local audio. Arc must warn truthfully before any Arc-controlled clear/reset action that would affect recordings. It cannot claim recovery when no backup exists.
- Ordinary Clean Up never touches local recording files.
- Sign-out must not silently delete local Voice recordings. Account/workspace separation and local file ownership must be explicit in implementation.
- Locate/Find may find the Voice Magnet even when its audio is unavailable on the current device, and should report that state rather than hiding the object.


Council question: “So am I expected to manage files?”
ARC SOLUTION:
- No. Normal use should feel like recording into Arc, not maintaining a folder tree.
- The Arc document holder is implementation/storage infrastructure, not a primary workspace the teacher has to organize manually.
- File-management controls belong in a quiet storage/backup area: local storage used, recordings available, Export/Backup, Restore/Import, and later optional sync.
- Arc should surface action only when needed: low local storage, missing recording, backup/export request, or device migration. Do not add permanent file-management chrome to the planner.


Council question: “What if my device is almost full?”
ARC SOLUTION:
- Arc must detect/report storage failure truthfully. A recording that cannot be durably saved is not allowed to masquerade as saved.
- Before recording when storage is known to be insufficient, block or warn before capture where the platform permits reliable preflight.
- If a save fails after recording, preserve whatever recoverable temporary artifact the platform allows long enough to offer an immediate save/export recovery path; never silently discard and show a successful Voice Magnet.
- Arc may offer teacher-controlled cleanup by recording size/age, but never automatic oldest-recording deletion.
- Tidy/Clean Up must never be repurposed as storage cleanup.


UI reconciliation
- Voice Magnet UI needs a quiet availability state: locally available, unavailable on this device, saving/problem, and future backed-up/synced states only when those capabilities actually exist.
- Do not show cloud/sync icons before cloud/sync exists.
- Device migration/backup belongs in Help/Settings/storage management, not on every Magnet.
- Missing audio must not make the whole Magnet disappear; retain title, transcript if legitimately stored, notes, provenance, and planning history while clearly indicating the recording itself is unavailable.


Audit consequence
- Voice Magnet cannot be GREEN for external beta until local-save truth, storage-failure handling, sign-out/reset behavior, export/backup, missing-file recovery state, account isolation, and destructive-clear warnings are tested.
- Cross-device cloud sync is not required for first beta if the local backup/export + restore/relink path is complete and honest.
.
- Four material product gaps were found and are now repaired at blueprint level: durable Locate/Find, minimum-required calendar commitment, presentation visibility, and Voice privacy/storage gating.
- Collaboration, broad LMS/SIS integrations, and prior-year import remain later work; Arc must not pretend they exist before implemented.
- This section is product/architecture authority, not evidence of real teacher demand. External beta still requires real human research and browser/device/accessibility evidence.


UI reconciliation
- UI must incorporate Locate/Find as quiet recovery infrastructure, not a new dashboard/search-results home.
- UI must design calendar-drop completion as minimum-required and in-context, never a surprise full lesson form.
- UI must provide an explicit, comprehensible teacher-only vs presentation-visible treatment before Daily Board/Sub Plan work ships.
- UI must make active Voice recording unmistakable and must not imply background listening.
- UI must communicate local-device storage plainly and quietly, including recording availability, any missing-local-file state, and any future opt-in cloud/transcription transfer before it occurs.
- UI demos/prototypes should use one persistent object through depth changes to prove continuity perceptually.




64. SIMULATED TEACHER COUNCIL — VOICE MAGNET CLASSROOM PRIVACY + CAPTURE BOUNDARY — 2026-09-04
Evidence status
- Simulated product pressure-test only. This section defines conservative product behavior; it is not jurisdiction-specific legal advice.


Council question: “What if I hit record and students are talking in the room?”
ARC SOLUTION:
- Voice Magnet is designed for the teacher’s own spoken planning/reflection, not for recording students, parent conferences, staff meetings, or other people as source material.
- Arc must say this plainly at the first Voice use and in Help without turning every recording into a warning dialog.
- Recording starts only from an explicit teacher action and the active-recording state must be unmistakable on every supported viewport.
- Arc should not offer passive, always-on, auto-start, wake-word, or background classroom capture.
- Arc should not market Voice Magnet as classroom documentation, behavior evidence, meeting recording, student assessment recording, or surveillance.
- If other voices are incidentally captured, Arc does not analyze, identify, diarize, label, or create student/person profiles from them.
- Any future speaker recognition, automatic person naming, student-linked recording, or meeting-transcription feature is outside the approved Voice Magnet model and requires a separate privacy/legal/product review before implementation.


Council question: “Could a Voice Magnet accidentally show up on the classroom screen?”
ARC SOLUTION:
- No. Voice recordings, raw transcripts, and teacher reflection are teacher-private by default under the presentation-visibility layer.
- Scheduling or moving a Voice Magnet to calendar depth does not make its audio/transcript student-facing.
- Live Classroom/Daily Board/Sub Plans may expose only explicitly presentation-approved content. The existence of a private Voice Magnet need not be exposed to students at all.
- A future teacher may deliberately extract or write student-facing text from a Voice Magnet, but that is an explicit content choice, not automatic publication of the recording/transcript.


Council question: “Can transcription happen without me knowing?”
ARC SOLUTION:
- No. Local audio existence and transcription state are separate.
- Recording does not imply transcription.
- If transcription requires sending audio beyond the local device, Arc must obtain an explicit teacher action/setting before transfer and show the destination/provider category and current state truthfully.
- A failed/cancelled transcription leaves the original local recording intact and does not silently retry through another provider.
- Arc must not imply that local-first storage means local-only transcription unless that is technically true for the implemented transcription path.


Council question: “What if I change my mind right after recording?”
ARC SOLUTION:
- The immediate post-record state must make Keep and Discard understandable without forcing metadata entry.
- Discard follows the canonical Magnet recovery rule. Where technically feasible, immediate Undo restores the Magnet and its audio atomically; Arc must not restore one while losing the other and call that success.
- If platform storage makes recoverable audio deletion impossible, Arc must make that limitation explicit and use a safer delayed-delete/tombstone design rather than promise a false Undo.


UI reconciliation
- First Voice use may include one concise privacy cue: intended for your own notes; recording is local by default; no background listening.
- During capture, show unmistakable recording state plus Stop/Cancel without relying on color alone.
- Do not add student/person selectors, speaker labels, waveform-surveillance aesthetics, or meeting-recorder language to the Voice Magnet UI.
- Raw audio/transcript remains visually teacher-private by default even when the parent planning object moves to deeper calendar contexts.
- Any presentation-visible content derived from Voice must use the existing explicit presentation-visibility treatment.


Audit consequence
- Voice Magnet cannot be GREEN if the interface can begin recording ambiguously, hide active capture, publish audio/transcript through ordinary scheduling, imply transcription that did not occur, or represent a non-atomic Discard/Undo as successful.
- Real legal/privacy review may still be required before public release depending on implementation, distribution context, and jurisdictions; product architecture must not assume this simulated audit substitutes for that review.




63. CATCH-UP REVIEW + NEGLECT-TOLERANT RECONCILIATION — 2026-09-04
Purpose
- Arc must tolerate periods of low or no use without becoming punitive, cluttered, or structurally unreliable.
- Catch-Up Review is a reconciliation workflow for when Arc's recorded plan may have fallen behind classroom reality. It is distinct from Recovery, which handles known instructional disruption while the teacher is actively using Arc.
Trigger rule
- Do not infer that the teacher was absent. Arc may only observe meaningful Arc inactivity and unresolved past planning objects.
- Suggested copy should remain truthful, e.g. “Looks like it’s been a busy week. Want to catch Arc up?”
- Trigger from a combination such as several instructional days of low/no meaningful Arc updates plus unresolved past Lessons. Do not trigger merely because seven calendar days passed.
- No trigger during breaks/summer or when there is nothing unresolved.
- Offer Catch Up and Not now. Not now must suppress nagging; teacher may disable Catch-Up suggestions entirely.
- Catch Up must also be manually available from an appropriate Help/calendar route so the feature does not depend on Arc guessing correctly.
Catch-Up Review behavior
- Review only unresolved past planning objects since the last meaningful reconciliation point.
- For each past Lesson, teacher may record: Taught it; Taught it later (choose actual taught date); Still need to teach it; Skip/didn’t happen; Leave it alone.
- “Still need to teach it” may offer Move to today, Move forward…, Put on Fridge, or Put away in Drawer, using existing canonical actions and persistence paths.
- Taught-it-later records teaching-history truth without rewriting the original plan as though it happened on that date.
- Leave it alone is always valid. Catch-Up Review may be partial; the teacher never has to get to zero.
Sequence handling
- If multiple consecutive unresolved Lessons appear displaced, Arc may suggest handling the remaining sequence together, but must preview the actual calendar consequences before commitment.
- Group movement must reuse canonical Shift/Move validation rather than inventing a Catch-Up-specific movement engine.
- Fixed dates remain fixed unless the teacher deliberately changes them through an already-approved canonical path.
Fridge/Drawer relationship
- Catch Up may rescue unresolved work into Fridge or Drawer without destroying identity/backstory.
- Fridge = still actively thinking/working with it. Drawer = keep for later. Neither means deleted or abandoned.
- Catch Up must never auto-dump missed work to Fridge/Drawer merely because it is old.
Trust / neglect tolerance
- Arc must not punish absence from Arc with badges, inbox debt, escalating warnings, or mandatory cleanup.
- If Catch Up is ignored, canonical data remains unchanged and ordinary planning remains available.
- The teacher may return after days or weeks and still understand what Arc knows versus what has not been reconciled.
UI consequence
- Catch-Up Review is a temporary review mode, not a new dashboard or notification center.
- It should feel fast, skippable, and consequence-oriented rather than like a wizard.
- UI must distinguish Arc’s uncertainty from facts: Arc knows what is unresolved in its records; it does not know why.
Acceptance question
- A teacher should be able to ignore Arc during a chaotic week, return, reconcile only what matters, and continue planning without repairing the app before repairing the week.


63. PERSONAL PLANNING LANE — 2026-09-04


Purpose
- Arc may expose a teacher-controlled Personal planning lane inside Day, Week, and Month so work-life reality can coexist with school planning without turning Arc into a generic life-management product.
- Personal is a parallel calendar lane, not a Course, not a Section, and not school curriculum. It should visually behave like an additional foldable row/bar in calendar views while retaining distinct semantics.


Visibility / shell behavior
- Personal can be toggled on or off by the teacher in Day, Week, and Month.
- When on, it appears as a collapsible/foldable lane alongside instructional planning, subordinate to the calendar but persistent enough to be useful.
- Hiding Personal is a presentation preference only. It never deletes, archives, unschedules, or changes personal objects.
- Personal content must remain excluded from Live Classroom, Daily Board, Sub Plans, and student-facing presentation unless a future explicit product decision creates a separate private presentation path.


Magnet-depth relationship
- The same teacher-owned Magnet/Note may move from Fridge Door or priority/task depth into the Personal lane without becoming school curriculum.
- Moving to Personal adds personal-calendar commitment/depth while preserving object identity, provenance, notes, priority relationship, and prior backstory.
- A personal object must not silently convert into Unit/Lesson or inherit Course/Section semantics.
- Non-drag Move/Schedule parity is required; drag remains an accelerator over the same canonical transition path.


Personal item fields
- Personal calendar depth should stay lightweight by default. Selecting a personal item may expose concise in-context fields such as:
  • Notes
  • Time / duration
  • Recurring?
  • Optional location/reminder later if product evidence supports them
- These are personal planning fields, not Lesson-plan fields.
- Full Edit may expose richer stored detail without requiring the teacher to leave the calendar context.


Recurring personal plans
- Arc supports explicit recurring personal schedules, e.g. “Piano lesson every Wednesday at 4:30 PM.”
- Recurrence creates a linked series relationship, not independent accidental clones and not a single shared object whose every occurrence must remain identical forever.
- Each occurrence has stable identity plus a series parent/reference so the teacher can change or cancel one date without rewriting the other occurrences.
- Editing one occurrence defaults to “This one only.” A deliberate separate action may edit “This and future” or “Entire series” where appropriate.
- Canceling/deleting one future occurrence must not delete the whole series unless the teacher explicitly chooses that consequence.
- Per-occurrence notes are independent. Example: one Wednesday may add “Bring Ava too” or “Don’t forget to cut Rhys’s nails” without changing other piano-lesson occurrences.
- Series-level defaults such as title, normal time, and recurrence pattern may exist separately from occurrence-level overrides.
- If a series default later changes, Arc must preserve explicit occurrence overrides unless the teacher deliberately replaces them.


Personal vs Google Calendar
- Arc-native Personal items remain distinguishable from external Google Calendar events.
- A teacher may optionally view Google Calendar overlays, but Arc must not silently absorb or rewrite external events into Arc-native Personal objects.
- Future explicit sync/import may map between them only with clear provenance and consequence preview.


Privacy / ownership
- Personal planning content is teacher-private by default and follows the same account-isolation and local/remote persistence trust rules as other private Arc data.
- Personal items are never student-facing merely because they share a calendar date with Lessons.


Catch-Up / neglect behavior
- Catch-Up Review may include unresolved personal items only when doing so is helpful and not noisy. Personal reconciliation should be opt-in within Catch Up and clearly separated from instructional Recovery.
- Arc must not imply that a missed personal item was completed, canceled, or moved without teacher input.


UI reconciliation
- UI should treat Personal as one collapsible parallel lane/bar in Day/Week/Month, not a second dashboard or full life-planner workspace.
- Personal items should read as part of the same Arc spatial system while remaining perceptually distinct from Course/Section curriculum.
- Recurrence editing must make “this occurrence” vs “series” consequences explicit before save.
- Per-occurrence overrides must be easy to discover and must not visually suggest that changing one item changes the whole series.
- Personal toggle state and collapsed/expanded preference may persist as user preferences.


Acceptance example
A teacher creates “Piano lesson” every Wednesday at 4:30 PM in Personal. The recurring series appears in the Personal lane. On one Wednesday she edits only that occurrence to add “Bring Ava too” and “Cut Rhys’s nails.” A later Wednesday is canceled and removed for that date only. Other Wednesday piano lessons retain the normal title/time and remain unchanged. The teacher may hide Personal entirely and later turn it back on with all state preserved.




SECTION 68 — PAPER-PLANNER MARKS: RED CIRCLE + CROSS OUT — 2026-09-04


Arc supports two lightweight, universal planner marks that travel with the underlying object rather than creating duplicate objects.


RED CIRCLE / CANNOT-FORGET EMPHASIS
• A teacher may red-circle an eligible visible planning item anywhere the item is meaningfully represented: Fridge, Drawer/review surfaces where visible, Must/Should/Could, School Notes, Personal, Day/Week/Month calendar, and eligible Unit/Lesson planning surfaces.
• Red circle is emphasis only. It does not change priority, completion, calendar placement, object identity, Unit/Lesson structure, presentation visibility, or Shift/Recovery state.
• The mark persists with the object across context changes until the teacher removes it.
• Red is not the sole semantic signal. Accessible state must expose the emphasis (for example, “marked important” / “circled”) and high-contrast/reduced-color modes need an equivalent treatment.
• Visual treatment should feel like a restrained paper-planner annotation, not an alert badge or notification counter.


CROSS OUT
• Cross out is a teacher-authored planner mark, not Delete and not automatically equivalent to canonical Lesson teaching completion.
• For lightweight Magnets, Notes, School Notes, Personal items, and task-like items, cross out may represent “done / handled” while preserving the item and its history until the teacher later removes or clears it.
• For canonical Units/Lessons and teaching-state objects, crossing out must not silently fabricate Completed/Taught/Skipped state. If a surface requires a formal teaching outcome, Arc must preserve that distinction and offer the appropriate canonical action.
• Crossed-out items remain recoverable and can be uncrossed. Cross out never destroys content.


KEYBOARD ACCELERATORS
• When a single eligible object is selected and focus is not inside an editable text field: Shift+1 toggles Red Circle; Shift+2 toggles Cross Out.
• Shortcuts are accelerators only. Every action must also have a discoverable pointer/touch/non-shortcut route.
• While typing/editing, browser/OS/input behavior wins; Arc must not steal these keystrokes.
• Shortcut collisions must be browser-tested across supported platforms before Green. If a supported environment reserves or transforms a shortcut, Arc must preserve the action through another accessible route and may require a configurable shortcut rather than breaking expected platform behavior.
• Undo should restore the immediately previous mark state where the existing Undo model applies.


RELATIONSHIP TO MUST/SHOULD/COULD
• Red circle and Cross Out are independent dimensions from Must/Should/Could.
• Example: a Should item can be red-circled without becoming Must. A Must item can be crossed out without being deleted.
• Arc must not infer one state from another.


UI GOVERNANCE
• These marks are intended to recreate useful paper-planner behavior across Arc, not create another status system or dashboard.
• Avoid persistent toolbars, notification dots, gamification, completion confetti, or global counts solely for these marks.
• Selection/context menus may expose Circle / Cross out using concise language and approved iconography/treatments.
• Reactive drag/drop remains orthogonal; marking an object does not change its valid destinations.




SECTION 69 — DESK ENVIRONMENT + ARC PAPER SURFACE + HAND-DRAWN ASSET REPLACEMENT — 2026-09-04


CORE VISUAL SPLIT
• The desk/background is its own environmental layer. It may carry warmth, materiality, and restrained tactile character.
• The calendar itself remains Arc paper white across Day/Week/Month/Quarter/Year and other primary planning surfaces. The calendar is the instrument; the desk is the environment around it.
• Do not tint the calendar to match the desk or apply decorative desk texture inside calendar cells.
• Depth between desk and paper should be subtle and believable: spacing, edge definition, restrained shadow/elevation if used, never glossy card-stack UI.
• Personal, School Notes, Fridge, Drawer, and other planning layers may visually sit around/alongside the paper system, but they must not erode the calendar’s paper-white visual authority.


DESK BACKGROUND
• The desk surface may be selectable or themeable later, but first implementation should use one approved Wax & Wing-compatible surface rather than a theme marketplace.
• Avoid literal photoreal desk clutter, excessive woodgrain, faux leather planner aesthetics, or decorative objects that compete with planning content.
• The desk may host tactile environmental cues and hand-drawn artifacts where they improve orientation or brand recognition.


HAND-DRAWN ASSET REPLACEMENT REGISTER
Preferred candidates for original hand-drawn replacement assets, subject to UI legibility and accessible semantic fallback:
1. Red Circle mark — loose hand-drawn ring variations, restrained and consistent enough for state recognition.
2. Cross-out stroke — hand-drawn strike treatment, with accessible nonvisual state and high-contrast fallback.
3. Arc Fridge/refrigerator illustration — approved yellow refrigerator/artifact treatment where the Fridge is represented environmentally.
4. Small magnet silhouettes / paper scraps — subtle tactile shapes for loose Magnets, Voice provenance, or stack edges; not every control.
5. Paper clip / binder clip / tack-like affordance cues where already approved by the Arc physical-planner metaphor.
6. Drawer/Basket environmental cue — simple hand-drawn or cut-paper representation if the Drawer needs a distinct physical anchor.
7. Voice Magnet recording glyph/accent — hand-drawn waveform/mic-adjacent mark only if it remains unmistakably functional and does not resemble surveillance/meeting-recording UI.
8. Take a Look Around welcome illustration / Arc shape — original hand-drawn welcome/brand art can replace generic tutorial graphics.
9. Empty-state illustrations — only for genuinely empty spatial surfaces such as Fridge/Drawer; no generic SaaS characters.
10. School-context annotation marks — restrained hand-drawn symbols for assembly/testing/half-day only if the semantic label remains explicit; never icon-only for critical schedule changes.
11. Personal-lane optional marker — a subtle hand-drawn divider/tab/accent may distinguish the foldable Personal lane without making it look like a separate app.
12. Clean Up micro-illustration / tuck-away cue — only if needed; must not imply deletion.


ASSET GUARDRAILS
• Hand-drawn assets are brand texture, not substitutes for semantic structure.
• Never use a hand drawing as the only representation of a destructive, privacy-sensitive, or schedule-changing action.
• Accessible names, focus states, contrast, and nonvisual state must remain programmatic.
• Avoid a full hand-drawn icon set unless separately approved. Core interface controls should remain coherent and legible; original drawings should appear where tactility meaningfully improves the Arc metaphor.
• Prefer transparent SVG/PNG assets with clean bounds and multiple tested sizes. Preserve original art separately from optimized UI derivatives.
• UI implementation must identify any placeholder asset intended for later replacement so the user can supply final original art without requiring behavioral rewrites.




SECTION 69 — TACTILE CALENDAR SURFACE + PAPER CUTOUT LANGUAGE — 2026-09-04


The calendar remains Arc paper white across Day, Week, Month, Quarter, and Year, but it should read as a physical planner resting on the surrounding desk environment.


CALENDAR DEPTH
• Calendar receives a restrained drop shadow sufficient to separate planner paper from desk surface.
• Add faux page-edge depth beneath/along exposed calendar edges so the planner feels like a small stack of real paper rather than a flat white app panel.
• Page-edge treatment must remain subtle, matte, and believable: no glossy 3D, neumorphism, glass, oversized floating-card shadow, or novelty skeuomorphism.
• Calendar white remains visually dominant and stable; depth belongs to its perimeter, not to tinted/gradient calendar interiors.
• At high zoom/small screens, page-edge detail may simplify before calendar legibility or usable area is compromised.


DESK ENVIRONMENT
• Desk/background is a distinct environmental surface behind the paper calendar and may carry warmer/material character than the calendar.
• It must not become a literal photorealistic desktop or decorative scene that competes with planning content.
• Desk and calendar should be immediately distinguishable by material/depth, not by excessive borders or chrome.


COLORED PAPER CUTOUTS
• Approved Wax & Wing palette may appear as restrained colored paper-cutout artifacts layered around or attached to appropriate planner interactions.
• Cutouts should feel hand-cut / paper-based, with slight organic edge variation where appropriate, not generic vector blobs, glossy stickers, clay UI, or AI-app decoration.
• Use cutouts selectively for tactile anchors, magnet families, contextual accents, tutorial/welcome moments, Fridge/Drawer cues, School Notes/Personal markers, and other places where physical-planner metaphor clarifies interaction.
• Never place decorative cutouts over calendar content or reduce calendar scanability.
• Color remains supporting information; semantic meaning must not depend on color alone.
• Prefer user-supplied hand-drawn / hand-cut visual assets when available. Generated placeholders are temporary and must not silently become canonical approved assets.


TACTILITY PRINCIPLE
Arc should feel wonderfully tactile because surfaces, edges, marks, movement, and paper artifacts reinforce the planner metaphor. Tactility must come from coherent material behavior, not from adding more UI chrome.




SECTION 70 — SCHOOL CALENDAR + BELL SCHEDULE SEARCH/IMPORT — 2026-09-04


Arc should absorb district/school scheduling complexity during setup rather than requiring teachers to manually enter every in-service day, holiday, early-release date, testing day, quarter boundary, and bell schedule exception.


PRIMARY SETUP FLOW — SCHOOL CALENDAR
1. Ask for district name, school name, city/state (or equivalent location), and school year.
2. Arc searches for the most likely official district/school calendar source, prioritizing official district/school websites and primary-source PDFs/CSVs.
3. When one or more likely matches are found, show the teacher the source name, school year, district/school identity, and a preview before import.
4. Arc extracts and proposes: first/last instructional day, holidays/breaks, teacher workdays/in-service/professional-development days, non-student days, quarter/term boundaries, testing/calendar exceptions where explicitly present, and other marked schedule changes.
5. Ask explicitly: “Early release?” If yes, Arc searches/extracts recurring and exception early-release dates/times where supported, then previews them separately so the teacher can confirm.
6. Never silently infer ambiguous dates. Low-confidence or conflicting dates are surfaced for teacher confirmation.
7. Teacher approves/edit/rejects before anything becomes canonical school-calendar truth.


FALLBACK IMPORT
• If Arc cannot find a reliable source, the setup immediately offers Upload calendar.
• Supported first-pass formats: PDF and CSV. Other structured formats may be added later.
• Uploaded documents are parsed into the same review model as searched documents.
• Manual entry remains available, but as fallback, not primary path.
• Arc must preserve source provenance for imported dates so the teacher can later see where the calendar came from and replace/re-import it safely.


BELL SCHEDULE FLOW
1. Ask which school(s) the teacher teaches at. Support one school first, but do not structurally block multi-campus/itinerant use later.
2. Search official school/district sources for bell schedule, block schedule, A/B schedule, period times, lunch/planning structures, and published early-release/testing schedules where available.
3. Preview proposed periods and times before save.
4. Ask whether the teacher follows the standard school bell schedule or has Section-specific exceptions.
5. If Arc cannot locate a reliable bell schedule, offer PDF/CSV upload for prefilling, then manual correction.
6. Bell-schedule import must not create fake classes; it defines time structure that Sections/classes can map onto.


SOURCE + CONFIDENCE RULES
• Prefer official district/school sources over third-party reposts.
• Never treat a search result as canonical until the teacher confirms it.
• Show the exact school year/date range being imported.
• Conflicting PDFs or stale school years trigger a warning rather than silent merge.
• If a PDF has multiple calendars (e.g., traditional, year-round, charter, employee), Arc asks the teacher which applies.
• Re-import compares against existing Arc school-calendar truth and shows a diff before replacing dates.
• Existing planning objects are never silently shifted during re-import. If date changes would affect lessons/units, show a separate impact preview and use canonical Shift/Move rules.


EARLY RELEASE
• Early release is explicitly asked during setup because it is frequently omitted from generic calendar extraction and materially changes planning time.
• Teachers may define recurring patterns (e.g., every Wednesday) and exception dates.
• Imported early-release days belong to school time structure, not personal calendar.
• If period lengths change on early-release days, Arc can use an alternate bell-schedule template for those dates rather than mutating the normal schedule.


UX PRINCIPLE
The successful setup experience should feel like: “Tell Arc where you teach; Arc does the scavenger hunt; you verify the answer.” Teachers should not be forced to transcribe district bureaucracy into a planner.




SECTION 69 — SCHOOL CALENDAR + BELL SCHEDULE IMPORT CONTRACT — 2026-09-04


GOVERNING PRINCIPLE
Prefill aggressively, commit conservatively. Arc should do the annoying setup work, but never silently make schedule-changing assumptions.


PRIMARY SCHOOL CALENDAR FLOW
1. Ask teacher for district, school name, city/state, and school year.
2. Search official district/school sources first for the current calendar.
3. Present the likely source with enough provenance for the teacher to recognize it (district/school name, school year, source title/domain, publication/update date where available).
4. Parse and prefill instructional dates, first/last student days, holidays, teacher workdays, in-service/professional-development days, planning days, breaks, no-school days, half days, early release days, testing/special schedules where explicitly stated, and other schedule-affecting dates that can be supported by the source.
5. Ask explicitly: “Does your school have early release days?” If yes, Arc should verify the pattern/source and preview all detected dates rather than inferring from one example.
6. Teacher reviews a human-readable calendar preview and confirms before Arc commits school-date state.
7. Manual editing remains available for exceptions, but is not the primary path.


SOURCE AUTHORITY + CONFIDENCE
• Official district/school pages and directly hosted district/school PDFs outrank aggregators, scraped calendars, social posts, and search snippets.
• If multiple official sources conflict, Arc must surface the conflict instead of picking silently.
• Arc must never infer that a similarly named district/school is the correct one solely from text similarity.
• School year must match. A previous-year calendar cannot silently populate the current year.
• Search results should be treated as candidates until teacher confirmation.
• Parsed dates should carry source provenance internally so later review can explain where a date came from.


UPLOAD FALLBACK
• If Arc cannot find a sufficiently reliable source, offer Upload PDF or CSV immediately.
• Uploaded documents are parsed into a preview, never committed directly.
• Partial parse is acceptable if Arc clearly labels uncertain/missing items and lets the teacher correct them.
• Do not fabricate missing dates from patterns.
• If the upload contains multiple school years, campuses, calendars, or legends, Arc must ask the teacher to choose the relevant one or restrict the import.
• CSV import should support common date + label patterns without requiring an Arc-specific template where reasonable.


BELL SCHEDULE FLOW
1. Ask which school/campus the teacher is at; do not assume district-wide bell times are campus-specific truth.
2. Search official school/district sources for bell schedule, block schedule, A/B day pattern, lunch structure, planning periods where published, and early-release/special-day bell schedules.
3. Preview period names/numbers, start/end times, lunch, planning period options, A/B/block patterns, and any alternate schedule types before commit.
4. Ask the teacher to identify which period is planning and which classes they actually teach; imported bell times do not create Sections automatically without teacher confirmation.
5. If the school has multiple bell schedules (regular, early release, assembly, testing), Arc stores them as named schedule patterns and associates them only with explicitly confirmed dates/rules.
6. If no reliable source is found, offer PDF/CSV upload and prefill from that document.


EARLY RELEASE / SPECIAL SCHEDULES
• Early release is a first-class setup question, not a hidden side effect of calendar parsing.
• A special schedule may change period times without making the day non-instructional.
• Half day, early release, testing, assembly, and other schedule variants must remain distinguishable.
• Arc should show the teacher which dates use which schedule pattern.
• A schedule-pattern change never silently Shift/Move existing Lessons.


RE-IMPORT / REVISED DISTRICT CALENDAR
• Re-import is a diff, not replacement.
• Arc shows: added dates, removed dates, changed day types, changed bell patterns, and confidence/provenance changes.
• Existing teacher edits are preserved unless the teacher explicitly chooses to replace them.
• Any consequence to placed Lessons/Units must go through existing preview + canonical Move/Shift/Recovery paths.
• Fixed-date items remain fixed unless the teacher explicitly changes them.
• No silent bulk movement.


HOSTILE CASES TO TEST
• Wrong district with same school name.
• Correct district, wrong school year.
• District updates calendar after teacher already planned six weeks.
• PDF includes decorative mini-calendars and legend dates that should not import as events.
• Image-heavy/scanned PDF with incomplete machine-readable text.
• Calendar says “teacher workday/student holiday” and Arc must not misclassify as universal holiday.
• Several in-service days have different labels but same no-student consequence.
• Early release is only certain Wednesdays, not every Wednesday.
• One campus in district has different early-release pattern.
• Bell schedule differs by grade level/campus.
• A/B schedule starts midweek after a holiday.
• Testing week overrides regular bell schedule.
• Assembly schedule changes only one period.
• Teacher teaches at two campuses.
• Uploaded CSV has duplicate dates, malformed rows, or ambiguous month/day formats.
• Upload contains next year’s dates mixed with current year.
• Teacher cancels import after review: no state mutation.
• Browser refresh during preview: no partial commit.
• Save failure: prior setup remains intact and Arc reports failure truthfully.
• Re-import with existing fixed assessments: preview must show conflicts without moving them.


ACCESSIBILITY + UI
• Search, candidate selection, upload, review, and correction must be keyboard/touch/screen-reader operable.
• Imported dates should be reviewable as a calendar and as a structured list for accessibility/high zoom.
• Confidence/provenance cannot be color-only.
• Avoid forcing teachers through dozens of tiny date fields after a successful import.
• Manual mode remains available but visually secondary.


GREEN GATE
This setup path is not Green until search/source selection, PDF/CSV parsing, preview-before-commit, ambiguous-source handling, early-release/special-schedule distinctions, bell-pattern import, re-import diffing, cancellation/no-mutation, persistence failure handling, and accessibility/browser proof are all demonstrated.




SECTION 71 — VISUAL IMPORT REVIEW: MINIATURE CALENDAR OVERVIEW — 2026-09-04


Imported school calendars should be reviewed visually before they are reviewed textually.


PRIMARY REVIEW SURFACE
• After district/school calendar search or PDF/CSV import, Arc renders a miniature overview calendar using the same Arc paper-white calendar language as the main product.
• The miniature review is the primary proof surface. Long lines of extracted dates are secondary detail, not the default review experience.
• At a glance, the teacher should be able to verify school year boundaries, instructional days, no-school days, breaks, teacher workdays/in-service days, holidays, early-release dates/patterns, and other special schedule days.
• Month structure must remain recognizable. The preview should look like a small real calendar, not a heatmap, spreadsheet, token grid, or data dashboard.


VISUAL SEMANTICS
• Use restrained brand-approved markings that remain distinguishable without color alone.
• No-school days should read clearly as unavailable instructional dates.
• Early-release and special-schedule days should remain instructional dates with an additional schedule marker, never visually collapse into no-school treatment.
• Multi-day breaks should read as continuous spans where appropriate.
• Teacher workdays/in-service days should be differentiated from student holidays if the source distinguishes them.
• District-level and school-specific exceptions should be identifiable without adding a dense legend.


INTERACTION
• Selecting a marked date opens a small contextual explanation, for example: “Oct 12 — Teacher Workday — no students” or “Sep 23 — Early Release schedule.”
• Teacher may correct a date/category from this contextual view before import is committed.
• If Arc is uncertain about an extracted date/category, that date is visibly flagged for review rather than silently accepted.
• A small secondary text/details route remains available for accessibility, exact inspection, and bulk review.
• Keyboard, touch, high-zoom, and screen-reader users must have an equivalent structured review path.


IMPORT CONFIRMATION
• Arc summarizes confidence without turning setup into an approval form. Example: “We found 182 instructional days, 10 no-school days, and 8 early-release Wednesdays.”
• Teacher confirms the calendar as a whole after inspecting the visual overview and any flagged uncertainties.
• Teacher should not be forced to individually approve every successfully parsed date.
• If changes are made, the miniature preview updates immediately.


RE-IMPORT / REVISION REVIEW
• When a district republishes or revises a calendar, Arc uses the same miniature calendar surface to show only changed dates in context.
• Added, removed, and changed-status dates must be distinguishable before any planning consequence is committed.
• Existing Lessons never move from this review surface alone. Any consequences continue through canonical Shift/Move preview and confirmation.


BELL-SCHEDULE REVIEW
• Bell schedule import should use a similarly visual compact preview rather than a paragraph/list-first review.
• Show a miniature sample day or side-by-side representative day patterns (for example Regular / Early Release / A Day / B Day) with period blocks and times.
• Teacher can inspect/correct a period or time without opening a giant setup form.


DESIGN INTENT
• The review should feel like Arc has already done the tedious work and is asking the teacher to glance over the result, not like Arc has converted a PDF into forty-seven form fields.
• Keep the paper-planner metaphor. Calendar preview remains Arc paper white with tactile depth; surrounding setup environment may use the desk/background system.


SECTION 69 — PROGRESSIVE DESKTOP SETUP / CALENDAR-FIRST ENTRY — 2026-09-04


GOAL
Teachers must reach the real Arc calendar before setup fatigue can cause abandonment. Setup should happen inside Arc, progressively and contextually, not as a long blocking wizard in front of the product.


CORE PRINCIPLE
Start using Arc first. Finish setup as Arc needs information.


FIRST ENTRY
- After account/basic identity, land directly in the real Arc desktop calendar shell.
- Calendar remains the visual center and should already feel like the product, not a configuration screen.
- Show a lightweight setup layer embedded in the desktop, never a full-screen administrative wizard unless absolutely required.
- Default calendar may initially use a provisional school-year range based on current date and locale; clearly mark any inferred values as provisional until confirmed.


PROGRESSIVE SETUP ORDER
1. School identity: district, school, location.
2. Arc searches official district/school sources for current school-year calendar.
3. Imported school dates appear immediately in a miniature overview calendar for visual review.
4. Ask only the next decision needed: e.g. “Does your school have early release?”
5. Bell schedule search/import follows only when the user is ready to add classes or when schedule structure is needed.
6. Course/Section setup can happen after the teacher is already inside the calendar.
7. Optional refinements (personal lane, external calendars, advanced schedule patterns, presentation settings) remain deferred until relevant.


EMBEDDED DESKTOP PATTERN
- Use a small contextual setup rail, tray, or anchored panel attached to the calendar environment.
- The panel should feel temporary and easy to dismiss, not like a permanent dashboard.
- Each setup step should visibly update the calendar behind it, creating immediate cause/effect.
- Prefer one clear question at a time.
- Avoid multi-page forms, accordion mazes, long checklists, progress-percentage gamification, or “complete your profile” language.
- Teacher can close setup and still explore Arc; incomplete setup should not make the product unusable when the missing data is not yet structurally required.


MINIATURE CALENDAR REVIEW
- Imported dates render as a compact year/semester overview directly in the setup panel or adjacent surface.
- Mark breaks, no-school days, in-service days, early-release dates, and special schedule patterns visually.
- Clicking/tapping a marked date reveals detail and edit controls.
- Text summaries are secondary to the overview.
- Teacher should be able to approve the whole import after visual review without reading a long list.


EARLY RELEASE / SPECIAL SCHEDULE PROMPT
- Ask plainly after initial calendar import: “Does your school have early release days?”
- If yes, Arc attempts to locate the school-specific pattern and bell schedule.
- If confidence is insufficient, offer upload PDF/CSV or simple manual definition of the pattern.
- Early release is a schedule pattern on an instructional day, not a no-school state.


BELL SCHEDULE TIMING
- Do not force full bell schedule entry before the teacher sees Arc.
- Trigger bell schedule setup when the teacher starts creating Sections, opens Day view with time structure, or explicitly chooses “Set up my day.”
- Search official school source first; upload PDF/CSV second; manual entry last.
- Preview Regular / Early Release / A Day / B Day as compact visual schedules, not long text tables.


ABANDONMENT SAFEGUARDS
- Every blocking question must be structurally necessary for the next requested action.
- If not necessary, allow “Not now.”
- Preserve progress automatically.
- Returning teachers resume at the real calendar, not a setup wizard.
- Never trap the teacher because a district source cannot be found.
- Never make document parsing failure feel like user failure.
- Manual fallback must remain concise and editable later.
- Avoid shame, incomplete-profile badges, or persistent setup warnings.


HOSTILE TESTS
- teacher signs in and immediately wants to jot a Fridge Magnet before school setup
- teacher closes setup halfway through and returns tomorrow
- district calendar import succeeds but bell schedule cannot be found
- wrong district/school source confidence is low
- teacher teaches at two schools
- school calendar changes after planning has started
- teacher uses only Week/Month initially and never opens Day
- teacher wants to explore before adding classes
- keyboard-only/high zoom/touch operation
- setup panel closed and reopened without losing state
- imported values remain visibly distinguishable from teacher-confirmed values until confirmed


UI GUARDRAIL
The embedded setup layer must respect the desk/calendar physical metaphor. Calendar stays Arc paper white on the desk environment. Setup may float or tuck alongside as a lightweight paper/tray element, but it must not visually replace the calendar with a generic SaaS wizard.




TEAM ALIGNMENT CHECKPOINT — PROGRESSIVE DESKTOP SETUP + SCHOOL CALENDAR / BELL IMPORT — 2026-09-04


This checkpoint is authoritative and supersedes conflicting older onboarding/setup instructions.


Governing onboarding rule
• Get teachers into Arc before asking them to configure Arc.
• Setup begins inside the real Arc desktop/calendar, not in a blocking pre-product wizard.
• The teacher should see and be able to use the recognizable Arc calendar almost immediately.
• Setup is progressive, resumable, dismissible, and contextual. Closing setup never traps the teacher outside the product or discards completed setup work.
• Safe actions such as Fridge capture and basic calendar exploration remain available before every optional setup detail is complete.
• Arc asks only for information required by the next meaningful action. Bell schedules, Personal, external calendars, presentation settings, and similar refinements are deferred until relevant.


School calendar import
• Preferred path: district + school + location + school year → search official district/school sources → identify likely calendar source/PDF → prefill → teacher review.
• Fallback order: official-source search first; teacher-provided PDF/CSV second; manual entry last.
• Arc must expose source/provenance and clearly flag ambiguous matches, partial extraction, unsupported content, or low-confidence interpretation.
• Arc may prefill aggressively, but must commit conservatively. No imported interpretation becomes consequential without a reviewable teacher-controlled commit.
• Miniature Arc year/semester calendar is the primary review surface. No-school days, breaks, in-service days, early-release patterns, and special schedules are shown spatially. Text detail is secondary/drill-down.
• Visual meaning cannot depend on color alone. Keyboard, touch, high-zoom, reduced-motion, and screen-reader equivalents are required.


Early release and bell schedules
• Early release is an alternate instructional bell/schedule pattern, not a no-school flag. Lessons may remain valid on an early-release day.
• Bell schedule setup follows the same search/import model and is normally deferred until classes/Sections or period timing make it useful.
• Arc may support multiple named patterns, including Regular, Early Release, A Day, B Day, block schedules, testing schedules, assembly schedules, and campus-specific variants when the source supports them.
• Bell review should be compact and visual rather than a long wall of period text.
• Teachers working at more than one campus/school must be able to associate the correct schedule context without one campus silently overwriting another.


Re-import and change safety
• Revised district/school calendars and bell schedules produce a diff preview before commit.
• Re-import never silently moves Lessons, Units, fixed dates, or existing teacher-authored planning.
• Any resulting instructional-calendar consequences route through the canonical Move / Shift / Recovery contracts.
• Fixed dates remain fixed unless the teacher explicitly changes them through an allowed canonical action.


Desktop integration
• Calendar configuration appears as a temporary tray, rail, sheet, or other integrated Arc desktop treatment while the real calendar remains visible.
• As trustworthy imported information is accepted, the visible calendar updates in context so the teacher sees the payoff immediately.
• Take a Look Around runs on a recognizable working Arc desktop, not a blank wizard shell.
• Incomplete setup is represented truthfully. Arc never fabricates a school schedule merely to make setup look finished.
• If search/import fails or is unavailable, the teacher can continue in a safe provisional workspace where possible and return to setup later.


Hostile acceptance cases
Test abandonment/resume at every setup step; wrong district/school/year; ambiguous school names; scanned and malformed PDFs; malformed CSV; color-only legends; shorthand/footnotes; teacher workdays vs student holidays; partial parse; contradictory sources; revised calendars after curriculum placement; A/B schedules interrupted by holidays; irregular early release; one-off testing/assembly schedules; multiple campuses; offline/search failure; refresh/restart; year rollover; small laptop; keyboard-only; touch; 200%+ zoom; reduced motion; screen reader; and interaction with Take a Look Around.


Ownership boundary
• Product/UX owns setup sequence, source trust, parsing consequences, review/commit behavior, calendar truth, re-import safety, and failure/recovery semantics.
• UI owns the perceptual execution of the integrated tray/sheet, miniature calendar review, source/confidence presentation, tactile treatment, responsive adaptation, and feedback states.
• UI must not reintroduce a blocking SaaS-style wizard or silently reinterpret imported dates/schedules.


Product shorthand
Here’s Arc → What school are you at? → Arc finds and pre-fills the school year → Does this look right? → the teacher is already using Arc.
