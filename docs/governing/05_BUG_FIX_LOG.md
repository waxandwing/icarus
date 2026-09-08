ARC — Bug Fix Log


September 4, 2026


Canonical bug-log rule
Any unresolved issue identified as a structural bug must be added to this document when it is identified, before it is treated as forgotten, deferred, or implicitly resolved. Structural bugs stay in this log until they are explicitly fixed, verified, and marked resolved. Visual polish, preference changes, and feature ideas do not belong here unless they expose a structural failure in the product.
BUG 001 — Year Map weekday alignment
Problem
All weeks should start on Monday so there aren’t random Mondays appearing on the right side of the grid. The Year Map is currently laying dates into continuous seven-day rows without preserving fixed weekday columns, so the weekday alignment drifts.


Expected behavior
Year Map is an attendance/school-year view and does not include weekends. Every Year Map row must use a fixed Monday → Friday structure. A school date must always appear under its actual weekday. When the school year begins midweek, leave the earlier weekday cells empty rather than shifting dates left. The next Monday must return to the first column.


Acceptance criteria
• Monday is always the first column of every week.
• Tuesday through Friday remain in their fixed Year Map weekday columns; weekends are not rendered in Year Map.
• Partial first/last weeks use blank cells instead of compressing dat  es.
• No Monday can appear in the far-right/Sunday column.
• Year, Quarter, Month, and Week views use the same weekday mapping logic.


Reference screenshot




RUTHLESS AUDIT SYSTEM — ACTIVE
Audit 001 — Structural functionality sweep
Target: waxandwing/arc-greenfield · develop @ 3ab7768581a46b3072477019d14c5a46abc01642
Status: ORANGE — source/contract evidence is available, but this exact artifact has not yet completed an independent rendered/browser interaction pass in this audit cycle. GREEN cannot be assigned from source inspection alone.


Operating rule
Every structural functionality defect discovered by a ruthless audit is entered in this log immediately. Intentionally deferred scope is not mislabeled as a bug. A bug remains unresolved until the implementation is corrected, the affected workflow is retested, and the result is explicitly marked verified. Two consecutive clean, meaningfully independent audits are required before a GO recommendation for the audited milestone.


BUG 002 — Home / landing-view preference is not persisted
Severity: P1 — structural navigation/state
Status: RESOLVED / VERIFIED / MERGED


Problem
Canonical Arc behavior allows the teacher to choose a fixed landing view or Last used view, persists that preference with the workspace, and makes the Arc logo return to that preference. The current develop implementation initializes the active view from a static DEFAULT_HOME_VIEW of Month and the Arc logo explicitly sends the workspace back to that same static Month view. No landing-view preference is being restored or persisted in the current workspace state path.


Functional impact
A teacher who works primarily in Week, Day, Quarter, or another chosen horizon cannot make Arc reliably return there. Reload/home behavior therefore ignores a canonical teacher preference and creates inconsistent navigation state.


Acceptance criteria
• Teacher can select a fixed landing view or Last used view.
• The selected home behavior persists with the workspace.
• Reload honors the saved behavior.
• Clicking the Arc logo returns to the configured home behavior, not an unconditional Month view.
• A missing/corrupt preference falls back safely to the documented default without damaging other workspace state.


BUG 003 — Optional weekend display is not available in Week view
Severity: P2 — structural calendar preference gap
Status: RESOLVED / VERIFIED / MERGED


Problem
Canonical Arc behavior defines Monday–Friday as the standard calendar display with weekends optional. The current Week projection hard-filters dates to Monday through Friday. There is no teacher-facing weekend preference in this path, so Saturday/Sunday cannot be intentionally shown in Week even though weekend dates exist in the SchoolCalendar and remain reachable elsewhere.


Functional impact
Teachers who plan weekend events, performances, competitions, travel, special programs, or personal/calendar continuity cannot make Week reflect the full interval when they need it. The current implementation behaves as if Monday–Friday is mandatory rather than the default.


Acceptance criteria
• Week defaults to Monday–Friday.
• Teacher can explicitly show weekends.
• Weekend preference persists with the workspace.
• Turning weekends on adds Saturday/Sunday in their true weekday positions without shifting Monday–Friday.
• Turning weekends off does not delete or mutate weekend calendar/planning data.
• Day remains capable of reaching weekend dates regardless of the Week display preference.


Audit 001 checkpoint
Confirmed structural issues BUG 001, BUG 002, and BUG 003 are resolved in develop. No known unresolved structural bugs remain in this log at this checkpoint.
Next audit pass must exercise the exact merged develop artifact independently through rendered navigation, calendar-horizon transitions, home/reload behavior, weekend handling, date alignment, keyboard/touch paths, and save/recovery behavior. One clean CI/browser gate is not sufficient for milestone Green; RGAV still requires two independent consecutive clean audits after the final material change. Any newly discovered structural failure is to be appended here immediately.


BUG 001 — RESOLVED / VERIFIED / MERGED
Branch: fix/calendar-monday-alignment
Merged PR: #43
Verified head: b89c5a0fcd3d24cce70ad2c5d086c9c468f34e1e
Develop merge commit: 7f32d6340c0e939ba4c2ea8ed12491e2c99fa3e5


Root cause confirmed
Year Map and other generic range views rendered dates as uninterrupted grid items beginning on the range’s first date. If the first date was midweek, weekday columns drifted. Month/Week had Monday-aware date math, but generic ranges did not share a fixed weekday-column renderer.


Fix applied
• Added shared Monday-first weekday index helper.
• Week boundary math now uses the shared helper.
• Quarter, Semester, and Year Map pad partial first weeks with empty cells so dates remain under their real weekdays.
• Compact Year Map now uses seven fixed weekday columns rather than a fourteen-column flowing grid.
• Added regression contract checks for Monday, Wednesday, and Sunday column mapping.


Verification checkpoint
• Typecheck: PASS.
• Production bundle build: PASS.
• Domain contracts: PASS.
• Browser/accessibility smoke gate: PASS.
• Rendered visual verification: PASS. Browser regression created a calendar beginning Wednesday 2026-09-02 and verified Wednesday in column 3, Sunday in column 7, and Monday 2026-09-07 in column 1.


Status: RESOLVED. All protected checks passed on the final material head, the rendered regression directly reproduced the historical alignment condition, and PR #43 was squash-merged into develop.


BUG 002 — RESOLVED / VERIFIED / MERGED
Resolution branch: fix/arc-phase0-structural-resolution
Merged PR: #45
Develop merge commit: f18dbbe5d9115641e0caef62cfa6b5a3dfe16443


Root cause confirmed
Active calendar view is initialized from static Month, calendar save resets to static Month, and the Arc wordmark also routes directly to static Month. No persisted home/landing preference is part of the current navigation state path.


State contract added
• Versioned navigation preference state.
• Home behavior supports Last used or fixed CalendarView.
• Last-used view is stored independently from the fixed-home choice.
• Invalid/corrupt persisted values fail safely to the documented Month default.
• Unavailable requested views resolve safely to an available default rather than damaging workspace state.
• Contract coverage added for round-trip persistence, Last
BUG 003 — RESOLVED / VERIFIED / MERGED
Resolution branch: fix/arc-phase0-structural-resolution
Merged PR: #45
Develop merge commit: f18dbbe5d9115641e0caef62cfa6b5a3dfe16443


Fix applied
• Week remains Monday–Friday by default.
• Teacher can explicitly show Saturday/Sunday through View options.
• Weekend preference persists safely in browser storage.
• Weekend visibility is presentation-only; hiding weekends does not delete or mutate calendar/planning data.
• Day remains independent of the Week visibility preference.


Verification checkpoint
• Domain contracts: PASS.
• Typecheck: PASS.
• Production bundle build: PASS.
• Browser/accessibility smoke gate: PASS.
• PR #45 squash-merged to develop.


Audit status after final material change: STRUCTURAL BUGS RESOLVED; MILESTONE NOT YET GREEN. A second independent RGAV/browser/UI pass on develop is still required before Phase 1 can earn Green.
 used, fixed view, unavailable view fallback, and corrupt storage.


Status: RESOLVED. The landing preference is wired into the calendar shell, exposes fixed-home or Last used behavior, persists safely in browser storage, records last-used view, gives the Arc wordmark the configured home target with safe fallback, and passed contracts, typecheck, production build, and browser/accessibility checks on PR #45 before squash merge.








BUG 004 — Calendar save resets the active view to Month
Severity: P1 — structural navigation/state regression
Status: RESOLVED / VERIFIED / MERGED


Problem
The persisted home/Last used preference introduced for BUG 002 is not the only navigation owner affecting the active calendar view. useArcWorkspace.useCalendar still calls setActiveView(DEFAULT_HOME_VIEW) after saving calendar dates. When an already-configured teacher edits dates, the workspace can be forced back to Month even when the teacher was working in Day/Week or configured a different home behavior. The AppFrame home-preference effect only runs when calendar availability changes from unavailable to available, so it does not correct this reset during an ordinary calendar edit.


Expected behavior
Saving calendar-date changes must preserve the teacher’s current usable calendar view unless the edited calendar makes that view unavailable. If a fallback is required, the shell must resolve it through the same canonical home/view-availability logic rather than hard-coding Month.


Acceptance criteria
• Editing and saving calendar dates does not unconditionally switch the teacher to Month.
• Current usable Day/Week/Month/Year Map context is preserved after calendar save.
• Quarter/Semester fall back safely only when the edited boundaries make the current view unavailable.
• Persisted fixed-home and Last used behavior remain authoritative for explicit Home/Arc-wordmark and reload behavior.
• Direct browser regression covers calendar edit → save → preserved view.
• Contracts, typecheck, build, and browser/a11y gates pass after the fix.


Discovery evidence
RGAV Phase 1 shell audit found the hard-coded reset in src/app/useArcWorkspace.ts on fix/phase1-shell-semantics, based on develop @ f18dbbe5d9115641e0caef62cfa6b5a3dfe16443.




BUG 004 — RESOLUTION CHECKPOINT
Resolution branch: fix/phase1-shell-semantics
Merged PR: #46
Final tested head: c4ac43f62c60534fa29cb8f2eca941c9196ca43f
Develop merge commit: 3ab7768581a46b3072477019d14c5a46abc01642


Fix applied
• Calendar-date edits preserve the active usable CalendarView instead of hard-resetting to Month.
• The current anchor date is preserved when it remains inside the edited school-year range; otherwise Arc falls back to the new first school day.
• Quarter/Semester fall back to Month only when the edited boundaries make the current anchored term unavailable.
• Existing fixed-home and Last used behavior remains authoritative for explicit Home/reload behavior.
• Browser regression directly reproduces Week → next Week → Edit dates → save and verifies both Week and the same anchored range survive.


Verification checkpoint
• Domain contracts: PASS.
• Typecheck: PASS.
• Production bundle build: PASS.
• Browser/accessibility gate: PASS on final material head.
• Browser gate also directly passed shell hierarchy/semantics, Monday-first mapping, 200%/400% zoom stress, 320/390px reflow, 44px touch target, reduced motion, validation focus, runtime-error checks, and calendar-edit context continuity.
• Exact tested 1280px shell screenshot was captured and reviewed before merge.
• PR #46 squash-merged to develop.


Status: RESOLVED. No known unresolved structural bugs remain at this checkpoint. This ORANGE status was superseded by the Phase 1 Green checkpoint below after the focused shell art-direction pass and two independent clean RGAV audits


PHASE 1 — GREEN CHECKPOINT
Develop merge commit: 881b477bd355e6c0c43400978bc45803e2da01e1
Merged PR: #47 — Art-direct the Phase 1 Arc shell
Final tested head: e56fe0c03e0555673cec88bfce4bcb9d9cc4efb6
Verification run: GitHub Actions 33939103744
Status: GREEN — PHASE 1 COMPLETE


Evidence:
• Domain contracts: PASS.
• Typecheck: PASS.
• Production build: PASS.
• Primary browser/accessibility RGAV A: PASS.
• Independent RGAV B: PASS on a different teacher path and viewport, covering Last used persistence, optional weekends, Week navigation/home/reload, overflow, keyboard skip, and runtime-error checks.
• Exact 1280px shell screenshot from the same passing head: visual brand gate PASS.
• Calendar remains the visual center; shell reads as restrained planner/paper furniture rather than generic SaaS chrome.
• Unavailable Semester/Quarter treatment no longer resembles teacher-authored Cross Out semantics.
• No new structural product bug was found in the final Phase 1 pass. Two intermediate RGAV-B failures were test-harness assumption errors and were corrected without product-code changes.


Release decision for this milestone: GO to Phase 2 Core Planning Truth. Any material shell regression resets the relevant Green evidence.
.


BUG 005 — Same-day Lessons are rejected as a Section schedule collision
Severity: P1 — structural planning truth / save-blocking regression
Status: RESOLVED / VERIFIED / MERGED
Discovered: Phase 2 rendered planning truth gate, PR #49, branch feature/phase2-planning-truth-gate
Reproduction head: 332f877b7e565c1c760892dd342f1d829972be4e
GitHub Actions run: 33942296787


Problem
A teacher can create two distinct shared Lessons under the same Unit on the same confirmed instructional date, but Save Lessons refuses to commit them and leaves Arc trapped in Lesson setup. The rendered notice is: “That Lesson change would invalidate an existing Section schedule. Resolve the affected Section dates first; Arc has not changed the Lessons.” This occurs in a fresh workspace with one Course, one Section, no teaching history, and no Section-specific schedule overrides.


Why this is structural
Arc’s canonical model permits multiple planning items on one day. Shared Lesson planned dates are curriculum placement; Section-specific divergence is stored separately. A fresh pair of same-day shared Lessons must not be treated as an already-invalid Section override collision when no Section-specific schedule has been authored. The current validation makes a legal planning state impossible to save and prevents Month/Week/Day from projecting that truth.


Expected behavior
• Two or more distinct Lessons may share the same confirmed instructional day when the teacher intentionally plans them there.
• Saving shared same-day Lessons succeeds when there is no incompatible Section-specific state.
• Each Lesson retains its own stable ID and history.
• Month, Week, and Day show all same-day Lessons from the same canonical state.
• Moving one same-day Lesson later does not mutate or move its neighbor.
• Section-specific collision logic remains fail-closed only for genuinely incompatible Section delivery/override state; it must not fabricate a collision from shared planned dates alone.
• Save failure, if a real Section-specific conflict exists, must identify the affected Section/date and provide a usable resolution path rather than leaving the teacher with an opaque generic block.
• Save → reload preserves both Lessons and their placements.


Direct evidence
The Phase 2 browser gate configured 2026–27, created AP Art History / Period 2, placed Unit “Ancient Egypt” from September 14–25, created “Temple lesson” and “Image comparison” both on September 16, then pressed Save Lessons. Arc stayed in Lesson setup and emitted the Section schedule invalidation notice. Contracts, typecheck, build, browser-a11y, and independent shell RGAV passed on the same head, isolating the failure to planning/schedule validation rather than shell instability.


Fix rule
Fix the smallest root cause in Section schedule validation. Do not weaken real Section collision protection globally. Add a contract reproducing fresh same-day shared Lessons plus a rendered browser regression that proves create → save → Month/Week/Day → reload → move-one → reload. Retest historical Section isolation, explicit same-day approval, Shift, persistence, and collision contracts after the fix.






BUG 005 — RESOLUTION CHECKPOINT
Resolution branch: feature/phase2-planning-truth-gate
Merged PR: #49
Final tested head: 2513e767c6e167af0340629e7e74276cf0de74e2
Develop merge commit: 6ee25a33fc769ab858e5c213723a536df844f95d
Verification run: GitHub Actions 33942406495


Root cause confirmed
Section schedule validation grouped every live Lesson by effective date for every Section. Because effectiveLessonDate falls back to the shared curriculum plannedDate when no Section override exists, ordinary shared same-day Lessons were misclassified as Section-specific collisions and required an explicit same-day approval even though the teacher had not authored any Section divergence.


Fix applied
• Same-day shared curriculum placement is legal when no Lesson in that Section/date set has an explicit Section override.
• Same-day approval remains required when at least one Lesson’s effective date is changed by an explicit Section override and that creates multiple live Lessons on the same Section/date.
• Existing Shift and same-day approval safety remains fail-closed for genuine Section collisions.
• Added a domain regression proving two shared Lessons can intentionally share one day without fabricating a Section schedule collision.
• Added a rendered browser regression covering create two same-day Lessons → save → Month → Week → Day → reload → move one Lesson → reload.


Verification checkpoint
• Domain contracts: PASS, including historical Section schedule, same-day approval, Shift, persistence, and collision coverage.
• Typecheck: PASS.
• Production build: PASS.
• Browser/accessibility gate: PASS.
• Independent shell RGAV: PASS.
• Phase 2 rendered planning truth gate: PASS.
• The rendered path directly verified both same-day Lessons survive save/reload, appear from the same canonical state in Month/Week/Day, and moving one Lesson to September 17 does not move or delete its September 16 neighbor.


Status: RESOLVED / VERIFIED / MERGED. No known unresolved structural defect is carried forward from BUG 005. Phase 2 itself is not Green yet; remaining object-action, Section-divergence, recovery/Undo, non-drag, and broader planning-truth gates remain open.


PHASE 2 AUDIT CHECKPOINT — OBJECT ACTIONS + SECTION DIVERGENCE
Target: waxandwing/arc-greenfield · develop @ c5a20d67417856fd50d4b64e0f67648b17c9e651
Merged PR: #50 — Prove Phase 2 object actions and Section divergence
Final tested head: 909d566b27efdefbe215c20b9f1a34e5f0ba33cd
Verification run: GitHub Actions 33967396031


Direct rendered evidence:
• Unit Unplace and Delete fail closed while a scheduled child Lesson remains.
• Period 2 in-progress state, actual taught date, and resume note remain isolated from Period 5 and survive reload on one shared Lesson.
• Lesson Unplace preserves the Lesson and clears placement across reload.
• Safe Lesson Delete remains deleted and does not disturb an unrelated Lesson.
• Unit Unplace preserves the Unit unscheduled after its dependencies are removed; explicit Unit Delete then remains deleted across reload.
• Browser runtime remains clean.


Protected verification: contracts PASS; typecheck PASS; production build PASS; browser/accessibility PASS; independent shell RGAV PASS; baseline Phase 2 planning truth PASS; Phase 2 object-action + Section-divergence gate PASS.


Audit-harness note: intermediate failures came from a text-based locator targeting an input value and an unsupported Playwright diagnostic API. Both were corrected in the test harness only. Product code did not change in response and BUG 006 was not opened.


Status: CLEAN FOR THIS SLICE; PHASE 2 NOT GREEN. No known unresolved structural bug remains at this checkpoint. Remaining Phase 2 evidence includes multi-day behavior, no-school/weekend boundaries, recovery/Undo, non-drag parity, UI polish, and two final independent Phase 2 RGAV passes.


PHASE 2 AUDIT CHECKPOINT — CALENDAR-EDGE PLANNING TRUTH
Target: waxandwing/arc-greenfield · develop @ 5c38ec60ebc9157932ddd6ec9f05d9c1c75d2557
Merged PR: #51 — Prove Phase 2 calendar-edge planning truth
Final tested head: 80ee864094762feb1fd27dba6823d184ad516160
Verification run: GitHub Actions 33967723293


Direct rendered evidence:
• A multi-day Unit can span a confirmed no-school date and weekend while retaining one placement.
• A Sunday-only Unit placement with no confirmed instructional day fails closed without leaking rejected state.
• A Lesson on a teacher-declared no-school exception fails closed.
• A teacher-declared instructional Saturday accepts a Lesson.
• Month shows the Unit span, no-school exception, and Saturday Lesson from canonical state.
• Week defaults Monday–Friday; weekend display reveals seven days and the Saturday Lesson; toggling weekends off/on does not mutate or delete it.
• Reload preserves the calendar exceptions, multi-day Unit, and Saturday Lesson while the rejected no-school Lesson remains absent.
• Browser runtime remains clean.


Protected verification: contracts PASS; typecheck PASS; production build PASS; browser/accessibility PASS; independent shell RGAV PASS; baseline Phase 2 planning truth PASS; object-action + Section-divergence gate PASS; calendar-edge planning-truth gate PASS.


Audit-harness note: the only intermediate failure targeted a nonexistent `.planning-week-day` selector. The real Week renderer exposes `.planning-date-heading`; the harness was corrected only. Product code did not change and BUG 006 was not opened.


Status: CLEAN FOR THIS SLICE; PHASE 2 NOT GREEN. No known unresolved structural bug remains at this checkpoint. Remaining Phase 2 evidence: rendered recovery/Undo continuity, non-drag parity, focused UI polish, and two final independent Phase 2 RGAV passes.


PHASE 2 AUDIT CHECKPOINT — RECOVERY / UNDO CONTINUITY
Target: waxandwing/arc-greenfield · develop @ 2af8acbcd26f20169ff55c0eee99fef255460f01
Merged PR: #53 — Prove Phase 2 recovery and Undo continuity
Final tested head: 14e5cc8439f7d5be5cac1a827fcf1d93205dc281
Verification run: GitHub Actions 33968011904


Direct rendered evidence:
• One in-progress Period 2 Lesson surfaces exactly one Recovery review while Period 5 remains on shared curriculum truth.
• Recovery preview preserves the exact stop note, chooses the next confirmed instructional resume date, identifies affected flexible work, and protects the later fixed anchor.
• Teacher explicitly chooses the flexible follow-up destination before Apply.
• Apply creates only Period 2 Section-specific schedule changes; Period 5 remains on shared Wednesday/Thursday placement.
• Reload preserves the shifted Period 2 schedule and its Undo token.
• Undo from the teacher-facing header restores Period 2 to shared placement without disturbing Period 5.
• Reload after Undo preserves the restored schedule and the consumed Undo token does not return.
• Browser runtime remains clean.


Protected verification: contracts PASS; typecheck PASS; production build PASS; browser/accessibility PASS; independent shell RGAV PASS; baseline Phase 2 planning truth PASS; object-action + Section-divergence PASS; calendar-edge planning truth PASS; recovery/Undo continuity PASS.


No product defect was discovered in this slice. No BUG 006 was opened.


Status: CLEAN FOR THIS SLICE; PHASE 2 NOT GREEN. No known unresolved structural bug remains at this checkpoint. Remaining Phase 2 evidence: non-drag/keyboard parity, focused behavior UI/brand polish, and tw


PHASE 2 AUDIT CHECKPOINT — NON-DRAG / KEYBOARD PARITY
Target: waxandwing/arc-greenfield · develop @ f3914bff6b0ff03432d98e80d99735f3cf6d7877
Merged PR: #54 — Prove Phase 2 non-drag keyboard parity
Final tested head: f59d5e5f5b18c6d0293001f8e6742ed416561bb8
Verification run: GitHub Actions 33968258396


Canonical interpretation:
The active Phase 2 src/ planner does not expose drag as a required mutation route. Calendar views are read projections and current planning mutations are explicit labelled controls. Parity therefore means the real current actions must be fully operable without pointer/drag.


Direct rendered evidence:
• Current planning surface exposes no draggable=true required mutation control.
• Keyboard focus + Enter activates Edit Lessons and Lesson selection.
• A focused planned-date control moves a Lesson; keyboard Save persists that move across reload.
• Keyboard Unplace preserves a Lesson unscheduled across reload.
• Keyboard Delete persists after reload when dependency-safe.
• Keyboard Recovery review, destination selection, Apply Shift, and Undo all complete successfully.
• Consumed Undo does not return after reload.
• Browser runtime remains clean.


Protected verification: contracts PASS; typecheck PASS; production build PASS; browser/accessibility PASS; independent shell RGAV PASS; baseline Phase 2 planning truth PASS; object-action + Section-divergence PASS; calendar-edge planning truth PASS; recovery/Undo continuity PASS; non-drag/keyboard parity PASS.


No product code change was needed for this slice. No product defect was discovered and BUG 006 was not opened.


Status: CLEAN FOR THIS SLICE; PHASE 2 NOT GREEN. No known unresolved structural bug remains at this checkpoint. Remaining Phase 2 work: focused planning UI/brand gate and two independent final Phase 2 RGAV passes after the last material change.
o final independent Phase 2 RGAV passes.










RUTHLESS AUDIT — RECONCILIATION BRANCH CHECKPOINT — SEPTEMBER 5, 2026
Target: waxandwing/arc-greenfield · codex/reconcile-founder-laws
Status: ACTIVE / NOT GREEN — source-level adversarial audit is finding and fixing trust defects; rendered independent RGAV remains required after the final material change.


BUG 006 — Blocked movement can look like a dead control instead of explaining the protected dependency
Severity: P1 — structural trust / interaction feedback
Status: UNRESOLVED
Problem
The domain now correctly fails closed when a teacher attempts to move a fixed dated object, move a Unit containing a fixed dated descendant, Cut a fixed tree, or Put a Unit in the Fridge while scheduled child Lessons remain. However, current interaction callers can receive the no-op without a canonical user-facing explanation. In some paths the shell may still update transient selection/paste-target feedback even though the canonical move was rejected.
Functional impact
A teacher can perform an apparently valid action and see nothing happen, which makes a correct safety guard feel like a broken control. Arc must explain what protected dependency blocked the action and must not show success-adjacent UI for a rejected mutation.
Acceptance criteria
• Rejected fixed-date movement identifies the fixed object/date that blocked the move.
• Rejected Unit unplace identifies the scheduled child Lesson(s) that must be reconciled first.
• Rejected Cut explains that fixed placement cannot be relocated without an explicit override path.
• A rejected action creates no history entry, no saved mutation, no paste-target/success state, and no silent data change.
• Keyboard, click, touch, and drag-triggered attempts receive equivalent explanation.
• Focus remains on or returns to the initiating object/control after the message is dismissed.


BUG 007 — Recovery quarantine exists without a teacher-facing recovery notice or restore/export path
Severity: P0 — data trust / recoverability
Status: UNRESOLVED
Problem
The workspace loader now quarantines malformed, structurally invalid, unknown-schema, or ambiguous duplicate-ID local data instead of overwriting it with an empty workspace. The Arc store exposes recoveryAvailable. The current shell does not yet surface that state to the teacher or provide an inspect/export/restore path.
Functional impact
The original payload is preserved, but a teacher can still open Arc and see an empty fallback workspace without understanding that recoverable data exists. Preserving bytes without exposing recovery is not sufficient for the product promise that important work does not silently disappear.
Acceptance criteria
• When recoveryAvailable is true, Arc shows a clear non-destructive recovery notice before ordinary blank-state onboarding can be mistaken for lost work.
• Arc does not auto-overwrite or delete the quarantined payload.
• Teacher can export/download the quarantined raw recovery payload before any repair attempt.
• A repair/restore attempt is explicit and reversible; failure cannot destroy the original quarantine copy.
• Starting fresh is an explicit choice and does not erase the recovery copy without a second destructive confirmation.
• Reload preserves the recovery notice until the teacher explicitly resolves it.
• Recovery behavior is covered by source contracts plus rendered reload/browser regression.


PHASE 2 GREEN / PARALLEL-BRANCH SCOPE RECONCILIATION — SEPTEMBER 5, 2026
Active implementation authority: waxandwing/arc-greenfield · develop @ 63cc31abb13a4d23f1751b3d6bb595ab9b966fc9.
Final material Phase 2 product head: 68f0e848e70eab6c2a1048dd1d78209bdbd02d10.
Material visual verification: PR #56 / head 724089f6c0df1361951a1328f5e7be0d868d719c / run 33968842253 — PASS, including exact 1366px Lesson editor and Recovery artifacts.
Final RGAV A: merged-head full circuit run 33968981175 — PASS.
Final RGAV B: independent alternate teacher-path run 33969143061 — PASS after correcting one audit-navigation defect only; neighboring full suite 33969143069 PASS. PR #57 merged audit-only coverage; post-merge develop run 33969207994 PASS.
Phase 2 status: GREEN for the active Vite src/ implementation.


Scope decision for BUG 006 and BUG 007
BUG 006 and BUG 007 remain UNRESOLVED. They are not being reclassified as resolved or discarded. They were discovered on draft PR #48 / codex/reconcile-founder-laws, which targets main, is explicitly not ready to merge, is deeply diverged from current develop, and implements the older Next/Zustand app/ + lib/ architecture.
• BUG 006 depends on that branch’s fixed-tree / Cut / Fridge movement interaction layer. Those Cut/Fridge pathways are not present in the active Phase 2 Vite src/ runtime. The active Phase 2 Unit/Lesson protected actions already have direct rendered fail-closed evidence and keyboard parity.
• BUG 007 depends on that branch’s recoveryAvailable quarantine subsystem. That quarantine subsystem does not exist in the active Phase 2 Vite src/ runtime.
Therefore these bugs do not invalidate Phase 2 Green on develop, but they remain hard blockers for merging PR #48 or integrating equivalent functionality. If either affected subsystem is introduced into develop later, the corresponding bug becomes an active integration blocker and must be fixed, rendered, reload-tested, and independently RGAV-verified before that integration can earn Green.


No unresolved structural bug is currently known in the active Phase 2 Vite src/ milestone. BUG 006–007 remain open, branch-scoped reconciliation debt.






BUG 008 — Reconciliation shell reintroduces Home / landing-view preference regression
Severity: P1 — structural navigation/state regression
Status: UNRESOLVED — branch-scoped to draft PR #48
Problem
The codex/reconcile-founder-laws shell initializes its active calendar view to Week and the Arc wordmark also routes directly to Week. Manual Week/Month/Quarter switches do not persist WorkspacePreferences.lastUsedView. The existing canonical workspace already stores landingView and lastUsedView, so this branch is bypassing its own navigation truth and reintroducing the same bug class previously resolved under BUG 002/004 in the active develop line.
Functional impact
A teacher’s saved fixed home or Last used preference can be ignored on reload and when using the Arc wordmark. The branch can also display one view while persisting stale navigation metadata, creating split navigation state.
Acceptance criteria
• Initial shell view resolves from persisted landingView / lastUsedView through one canonical availability resolver.
• Teacher can choose Last used, Week, Month, or available Quarter from Settings in this branch’s currently implemented view set.
• Manual supported view changes persist lastUsedView without changing landingView.
• Arc wordmark resolves the configured home target rather than hard-coding Week.
• An unavailable or not-yet-implemented saved view falls back safely to an available view without silently overwriting the stored preference.
• Quarter falls back safely if quarter boundaries are unavailable.
• Reload, Home, Settings change, and ordinary workspace edits do not reset the active usable view.
• Source contracts, current CI, and rendered browser/a11y regression must pass before this branch-scoped bug can be marked resolved.


BUG 009 — Editing a source-backed calendar silently converts it to manual truth and drops provenance
Severity: P1 — school-truth provenance / persistence regression
Status: RESOLVED / VERIFIED / MERGED
Discovered: Phase 3 source-backed calendar proposal review foundation, PR #58


Problem
The active CalendarSetup edit path always calls buildManualCalendarInput. Once a district-source or import-backed CalendarHydrationInput exists, opening Edit dates and saving an ordinary teacher correction would currently rebuild the calendar with patternSource = manual and patternConfidence = confirmed. The builder also has no provenance field, so the persisted evidence trail would be lost.


Functional impact
A teacher could import or review source-backed school truth correctly, make a routine date edit later, and unknowingly erase both the source classification and evidence needed to understand where the calendar came from. Arc would also silently upgrade mixed/inferred source truth to confirmed manual truth. That violates provenance retention, conservative commit, and “nothing important disappears silently.”


Acceptance criteria
• Editing an existing source-backed calendar preserves patternSource unless the teacher explicitly replaces the source.
• Editing preserves patternConfidence unless the teacher explicitly re-confirms/reclassifies source confidence through a defined review path.
• Existing provenance records survive ordinary calendar edits and save/reload.
• Teacher-added/edited exception dates may be marked manual/confirmed individually without rewriting the calendar’s underlying source provenance.
• A truly manual calendar remains manual/confirmed.
• Contracts cover district-source/import edit preservation plus manual-calendar behavior.
• Existing Phase 1/2 calendar-edit, persistence, navigation, browser/a11y, and planning regressions remain Green.


BUG 008 — RECONCILIATION RESOLUTION CHECKPOINT — SEPTEMBER 5, 2026
Status: RESOLVED / VERIFIED ON DRAFT BRANCH — NOT MERGED
Branch: codex/reconcile-founder-laws
Verification head: 16f36b1b9bc8a43ad7be2a30c3f29066955ef928
Verification run: GitHub Actions 33971189472 — PASS


Fix applied
• Day is now a first-class current planner/home view alongside Week, Month, and available Quarter.
• Settings persists landingView, including Last used behavior.
• Manual supported view changes persist lastUsedView without changing landingView.
• Arc wordmark resolves the configured home through one canonical availability resolver rather than hard-coding Week.
• Unavailable saved views fall back safely without replacing the stored preference.
• The obsolete pre-Day shell that reintroduced split navigation truth was deleted so the branch no longer compiles two competing navigation owners.


Verification
• Dependency advisory gate: PASS.
• No-Vercel deployment law gate: PASS.
• Typecheck: PASS.
• Tests: PASS.
• Production build: PASS.
• Canonical build contract: PASS.


Merge note
This resolution is branch-scoped only. Draft PR #48 remains unmerged and is not release authority.


BUG 010 — Explicit Section persistence is not yet fully wired through progressive setup
Severity: P1 — structural Course / Section truth and teaching divergence
Status: UNRESOLVED — reconciliation branch integration blocker
Discovered: Day → class isolation → Live Classroom implementation and hostile reconciliation audit, September 5, 2026


Problem
The reconciled Day and Live Classroom architecture now correctly distinguishes a shared Course from a teaching Section and stores sparse Section-specific delivery state. However, older workspaces and the current setup path may not yet contain explicit Section records. The branch therefore uses a temporary compatibility projection that derives one Section per Course when Workspace.sections is absent. That protects legacy data and allows the new Day surface to render, but it cannot represent the final canonical case where one shared Course has multiple real Sections with independent delivery state unless setup and persistence create stable Section records.


Functional impact
A teacher with multiple Sections of the same Course could otherwise be collapsed into one derived teaching instance. Class focus, carryover, actual-taught state, resume notes, Live Classroom eligibility, and Section-specific recovery would then lack the stable Section identity required for safe divergence. The compatibility fallback must not become the permanent model.


Acceptance criteria
• Progressive setup creates and persists explicit stable Section records for every teaching instance.
• Multiple Sections may reference one shared Course without duplicating the Course curriculum model.
• Section IDs survive save, reload, import/re-import, and ordinary setup edits.
• Day view projects real Sections and class focus remains a filter/projection, never a Classes destination.
• Live Classroom always launches from an exact Section + Lesson and writes only that Section’s delivery state.
• Shared Lesson planning remains shared until explicit Section divergence occurs.
• Existing legacy workspaces migrate without losing Course, Lesson, Unit, Task Bar, Fridge, notes, resources, or history data.
• The temporary one-Section-per-Course fallback remains compatibility-only and can be retired once migration coverage is proven.
• Contracts and rendered regression cover one Course with at least two Sections, divergent teaching outcomes, reload, and isolation.


FIVE-STEP RECONCILIATION AUDIT CHECKPOINT — SEPTEMBER 5, 2026
Target: waxandwing/arc-greenfield · codex/reconcile-founder-laws
Status: CLEAN FOR DAY/LIVE IMPLEMENTATION SLICE; NOT GREEN FOR PR #48 AS A WHOLE


Evidence
• Canonical Day view implemented with period/class rows inside the calendar surface.
• Class isolation implemented as a local Day projection/filter; no Classes tab was introduced.
• Carryover precedes Today’s Plan and unfinished Section work remains visible.
• Optional After School / Notes lane is present for teacher-entered non-instructional events and notes.
• Live Classroom launches only from Day → exact eligible Section + Lesson on an instructional date.
• Completed/skipped lessons cannot relaunch; Stop here requires a resume note; Leave without outcome writes nothing.
• Live outcome writeback revalidates canonical Section/Lesson/date context immediately before mutation and fails closed if stale.
• Figma now contains a separate canonical page, ARC — CANONICAL 2026-09-05, with Week closed, Week weekends-on, Day/class lens, outer-edge drawers, Task Bar, and Live Classroom frames. Older rail-based frames remain historical evidence only.
• Figma audit caught and corrected an omitted Task Bar in the first Day frame before the frame was accepted.
• Git audit caught and removed the superseded pre-Day shell after it became a competing compile-time navigation owner.
• Final branch verification at 16f36b1b9bc8a43ad7be2a30c3f29066955ef928 passed the full protected workflow.


Remaining blocker discovered in this slice: BUG 010 explicit Section persistence/setup migration.
BUG 009 — RESOLUTION CHECKPOINT — SEPTEMBER 5, 2026
Status: RESOLVED / VERIFIED / MERGED
Resolution branch: feature/phase3-calendar-proposal-review-foundation
Merged PR: #58 — Add Phase 3 source-backed calendar review foundation
Final tested head: f389370273b60ea09613b798555d9e7e1e631ace
Develop merge commit: 149bb820b550a7d709673159770a79b47e869ef2
Verification: Arc verify run 33969776471 — PASS; independent RGAV run 33969776448 — PASS.
Fix applied
• Source-backed CalendarHydrationInput now carries provenance through the same canonical persistence path as manual calendars.
• Source-backed proposals fail closed before explicit review and preserve confirmed/mixed/inferred confidence instead of silently promoting uncertain truth.
• Ordinary edits to a district-source/import calendar preserve patternSource, patternConfidence, and provenance unless a separate explicit source-replacement/review action changes them.
• Teacher-edited exception dates can become manual/confirmed individually without rewriting the underlying calendar source.
• Manual calendars remain manual/confirmed.
• Persistence round-trip and calendar-edit contracts cover provenance retention and source mismatch rejection.
Protected verification
• Domain contracts: PASS.
• Typecheck: PASS.
• Production build: PASS.
• Browser/accessibility and frozen Phase 1/2 regression suite: PASS.
• Independent RGAV: PASS.
Status: RESOLVED / VERIFIED / MERGED. Phase 3 remains IN PROGRESS; this closes only the provenance-loss defect and the first source-backed review foundation slice.
BUG 011 — Live NCES school identity query fails to return an expected official public-school match
Severity: P1 — Phase 3 official-source acquisition / school identity trust
Status: RESOLVED / VERIFIED / MERGED
Discovered: PR #62, branch feature/phase3-nces-school-identity-provider, live NCES smoke run 33978353072 on head 8af2e93babdb5eb0b6b8d75961a718704b730308


Problem
The new NCES school-identity adapter passes its mocked hostile contracts, and the live NCES service responds successfully, but the real query for Oak Ridge High in Orlando, Florida does not yield the expected school identity. Arc therefore cannot yet treat the current NCES query shape/provider mapping as a trustworthy official-source search path.


Functional impact
A teacher can supply a valid real school identity and receive no usable candidate even though the authoritative directory is reachable. That would incorrectly look like “no match” and could push the teacher toward manual setup or fallback import when official identity evidence actually exists.


Acceptance criteria
• Inspect the live NCES layer schema and actual feature response before changing code.
• Correct only the smallest provider/query/schema mismatch; do not weaken locality disambiguation or fabricate fuzzy matches.
• A live Orlando query returns the expected Oak Ridge public-school identity with stable NCES school and district identifiers.
• Zero-result, malformed response, provider-error, network-failure, SQL escaping, candidate limits, and non-mutating search behavior remain covered by contracts.
• NCES identity remains identity evidence only; it must not become school-calendar date truth.
• Full Arc verify, frozen Phase 2 independent RGAV, Phase 3 source-review regression, and the live NCES gate all pass on the same final head before merge.
BUG 011 — RESOLUTION CHECKPOINT — SEPTEMBER 5, 2026
Status: RESOLVED / VERIFIED / MERGED — AUDIT-FIXTURE FALSE POSITIVE; NO PRODUCT PROVIDER CODE CHANGE
Resolution branch: feature/phase3-nces-school-identity-provider
Merged PR: #62 — Add live NCES school identity provider
Final tested head: e60a19e808ab50c7820f0d288b1efca8c9bf2d88
Develop merge commit: 196d3ce94ca1dc514a90976032221daab9a24bb3
Verification: live NCES run 33978586024 PASS; full Arc verify 33978585976 PASS; Phase 3 source-review 33978585983 PASS; independent Phase 2 RGAV 33978585961 PASS.


Root cause confirmed
The NCES provider and query were already functioning correctly. The audit smoke compared raw ArcGIS text attributes without normalizing provider padding, while Arc’s actual provider parser already trims returned text. Earlier test assumptions also used a local district brand label rather than the NCES agency label and an incorrect/outdated mocked school identifier. The live authoritative NCES identity is Oak Ridge High, NCESSCH 120144001406, LEAID 1201440, agency label Orange. Once the smoke normalized the same way as production and used current NCES identity truth, the live lookup passed. No product-provider code was changed in response to BUG 011.


Verification evidence
• Live NCES lookup returns Oak Ridge High / Orange / 120144001406 from the official NCES EDGE service.
• Provider contracts still pass SQL escaping, locality constraints, stable identity, zero-result, malformed-provider, provider-error, network-failure, candidate-limit, and non-mutating semantics.
• NCES remains school identity evidence only and does not create calendar-date truth.
• Full frozen Phase 1/2 and Phase 3 source-review regressions remain Green.


Status: RESOLVED / VERIFIED / MERGED. The audit correctly blocked merge until the mismatch was explained; the mismatch was in test expectations/normalization, not Arc’s provider behavior.












BUG 012 — First-time setup blocks entry into the real calendar
Severity: P0 — progressive setup / product-entry architecture
Status: UNRESOLVED
Discovered: Phase 3 progressive-setup audit on develop @ c72976ca3a0919cedbdeb4d4dc7896ac30678614, September 6, 2026


Problem
On a fresh workspace with no committed SchoolCalendar, WorkspaceStage unconditionally renders CalendarSetup instead of a calendar projection, and AppFrame marks the workspace busy and disables CalendarViewRail whenever calendar/anchorDate are missing. The teacher therefore cannot enter or safely explore the real Arc calendar until setup has produced canonical calendar truth.


Why this is structural
Arc’s current operating law explicitly retires blocking onboarding and requires progressive setup inside the real calendar desktop: “Get the teacher into Arc before configuring all of Arc.” Setup must be contextual, resumable, and dismissible, and safe exploration must be possible before all setup fields are complete. The current implementation makes setup the only first-load workspace and therefore violates the product architecture, not merely a visual preference.


Functional impact
A first-time teacher experiences Arc as a setup form rather than a calendar-centered workspace. They cannot orient themselves spatially, inspect the canonical view furniture, dismiss setup and return later, or understand what they are configuring in context. This increases setup pressure and makes the calendar cease to be the product center at the exact moment Arc is introducing itself.


Expected behavior
• A teacher can enter the real Arc calendar shell before school setup is complete.
• Incomplete calendar truth must never be used for consequential scheduling, movement, recovery, or any action that requires confirmed SchoolCalendar dates.
• Before canonical school dates exist, Arc may render only a clearly provisional/non-consequential calendar exploration surface; it may not fabricate school days, closures, terms, bell patterns, or other school truth.
• Setup is visible in context but dismissible; dismissing it reveals the calendar rather than a blank/dashboard substitute.
• The teacher can reopen/resume setup from the same shell without losing entered setup progress.
• Reload preserves the resumable setup state or safely restores the same incomplete state without silently committing a SchoolCalendar.
• Calendar-view furniture remains operable for safe exploration where meaningful; unavailable/consequential controls remain clearly unavailable rather than pretending setup is complete.
• Keyboard-only dismissal, resume, navigation, and setup continuation are supported.
• 390px reflow, small-laptop behavior, reduced motion, focus order, and runtime cleanliness remain Green.
• Frozen Phase 1 shell and Phase 2 canonical planning behavior remain unchanged for configured workspaces.


Root-fix rule
Fix the composition/state boundary, not the symptom. Do not add a cosmetic “skip” button that simply hides setup into an empty surface. Introduce an explicit pre-calendar exploration/setup state that can coexist with the real shell while keeping canonical SchoolCalendar null until reviewed/committed truth exists. Do not fabricate a temporary SchoolCalendar just to satisfy existing projection types. Keep Fridge implementation, early-release/bell schedules, and Courses/Sections outside this slice.


BUG B01-V17-01 — Task content is not bounded by its furniture surface
Status: UNRESOLVED — source-confirmed containment defect; draft patch prepared, visual verification blocked.
Artifact: ARC Local Build v17 — B01 Furniture Ownership Correction.html (Drive ID 118Axo64TLaLa0OB9HtQY4vui_R29Gobs).
Evidence: .task-furniture-surface has a fixed percentage height; .task-area explicitly permits visible overflow; .task-list has no scroll boundary; the existing add handler appends unlimited rows. More tasks or wrapped text can escape the owned surface. This is source evidence, not a claimed rendered reproduction.
Draft correction: keep the existing geometry and Task Bar owner; bound the surface and group, make only the task list scroll, preserve heading/add/input space, wrap long task text, and let the entry occupy the add-control slot. No calendar/object markup, embedded assets, behavior scripts, or donor logic changed.
Acceptance still required: desktop and 1280×720, mobile-preview size, long task names, multiple added tasks, entry/Return/Escape/blur, task completion, keyboard reachability and visible focus, unchanged calendar bounds, and two final rendered B01 audits. Check that containment does not clip controls or focus indicators before accepting the patch.
Blocked verification: the Cloud browser security policy denied local HTML access. No workaround attempted after the explicit policy rejection. No new reviewed HTML version was placed in Drive; v17 remains the visual baseline, and no Green status is claimed.
Other B01 checks still pending rendering: side-furniture attachment/open/closed boundaries, usable exterior area, bottom asset extent, mobile scaling, phantom space, layering, and asset collisions.
Scope authority: current local v17+ Week owns presentation. Historical waxandwing/arc-instructional-calendar app/core/page.tsx is a selective functional donor only. B02/B07 integration waits until B01 reaches Green. No historical UI hunt, shell transplant, or deployment.


B01 V17 — CONTINUED SOURCE AUDIT (NOT A RENDERED PASS)


BUG B01-V17-02 — Settings closes its content without retracting its furniture
Status: UNRESOLVED — source-confirmed state/ownership mismatch.
Evidence: setSettingsOpen changes only settingsPanel.dataset.open and the trigger aria-expanded value. The settings asset remains an independent .arc-shell child at width 11.5%, height 58%, top 18%, regardless of open state. There is no closed-state selector or motion for that asset. The enlarged furniture footprint therefore remains present when the text panel closes. Its precise visible extent requires rendering.
Required correction: coordinate the asset, content and attached trigger under one open/closed ownership rule; closed state must read as a narrow attached tab. Preserve the locked calendar dimensions and outer-edge direction. Verify both states and focus return before closure.


BUG B01-V17-03 — Earlier important declarations defeat the intended v17 furniture layer values
Status: UNRESOLVED — source-confirmed cascade conflict; visible collisions not yet established.
Evidence: the earlier B01 stylesheet sets settings-panel/fridge-copy z-index:4 !important and settings-trigger/fridge-trigger z-index:5 !important. Later v17 declarations of 11, 8 and 12 are normal declarations and cannot supersede those rules. Bottom furniture remains z-index:6. Source comments and declared v17 intent do not match the effective cascade.
Required correction: consolidate the affected layer rules into one authority after checking intended stacking against rendered open/closed states. Do not simply raise all layers. Verify no furniture covers calendar work, no trigger is obstructed and no asset/content pair separates.


Additional source finding: .bottom-furniture has data-state="open" and a CSS closed state, but no toggle control or state mutation activates it. Its closed state is unimplemented, not verified. Resolve only the B01 shell/tab behavior already authorized; do not introduce priorities/domain integration. Reduced-motion coverage currently targets Fridge only; any newly wired bottom-furniture motion must honor reduced motion.


Audit boundary: these findings concern the fetched v17 artifact only. No claim is made about later builds or the active git product. The unrendered containment draft remains pending, with no further visual changes applied during this source pass. Desktop/mobile screenshots supplied by the user can support visual inspection, but cannot establish interaction or keyboard test results. B01 remains open; B02/B07 donor integration remains deferred.


B01 V17 FURNITURE BATCH — SOURCE CORRECTIONS IMPLEMENTED; VERIFICATION PENDING
The earlier source-only findings now have one combined draft: ARC_B01_v17_furniture_batch_UNVERIFIED.html. It is not a reviewed next-version Drive preview and does not supersede v17 visual authority.
Implemented: Settings asset/content/tab share one retracting owner; conflicting shell layer declarations were removed and replaced with one explicit layer order; Task Bar gets an attached open/close tab and owner-scoped motion; closed content is inert; Escape returns focus; existing task-entry blur behavior is retained; reduced-motion coverage includes the moving owners. Earlier task-list overflow containment is included.
Evidence completed: node --check passes; exact source comparison preserves the complete calendar subtree and existing task handlers; a multiset comparison preserves all embedded asset bytes. These are source/syntax checks only. No visual or runtime interaction pass is claimed. All B01-V17 issues remain unresolved pending verification of the draft.
Still pending: desktop, 1280×720, mobile-preview rendering; open/closed combinations; attachment, clipping, hierarchy, layers and assets; click/keyboard/Escape/focus; task growth and entry lifecycle; two final rendered B01 audits. Drawer copy fit and Task Bar tab/content spacing particularly need visual checking.
Rendering diagnosis: attempted tool was the control-browser skill's cloud Chrome/CDP session through mcp__node_repl__js. The local HTTP request returned net::ERR_BLOCKED_BY_CLIENT. The file URL request returned "Browser Use rejected this action due to browser security policy" and explicitly said the Cloud browser URL policy blocks the page and forbids workarounds. The browser tool itself is available; this was URL/access denial, not tool absence.
Supported workflow check: the documented Sites supervised preview client is installed; sites-preview status returned "Sites preview stopped". It requires a compatible development-server project. The current standalone HTML has no package.json/dev server; the environment reference expressly says plain static assets have no compatible development server. No supported preview was started previously. Earlier direct-server setup was the wrong workflow; no conclusion that all rendering is unavailable is justified. No retry through alternate URLs, browser engines or public deployment was attempted.
User action: no documented user-facing setting was found that can lift this cloud-browser URL policy. This cannot be solved by changing personal Chrome permissions. A platform-supported rendering workflow for the standalone artifact, or a separately authorized move to an eligible development-project workflow, is needed to resume direct QA. Neither is assumed to guarantee access. No screenshots requested as a substitute for diagnosis. B02/B07 remain deferred; no deployment.


B01 PREVIEW QA CHECKPOINT — SUPPORTED PREVIEW WORKING
Package: ARC_B01_preview_project_YELLOW.zip; Drive ID 11kRQnaIpTAGuxXP2S71ywRAXJDM-d-dC, saved in the Arc folder. Contains complete HTML with original embedded assets, Vite package/lockfile/config, viewport harnesses, AUDIT.md and six screenshot files.
The user explicitly authorized packaging the standalone into a compatible development-server project. Supervised Sites preview started and the documented browser route loaded. Earlier local/file URL denials were not bypassed. No registration, publication or deployment occurred.
Verified scope: desktop 1440×900, laptop 1280×720, mobile-preview iframe 390×844; open and closed furniture rendered and visually inspected. Settings retracts as an owner and its text fits its paper. Layer order no longer places furniture over the calendar. Task Bar toggles via click and keyboard; closed contents are inert. Overflow stays inside task lists with Add controls retained. Desktop calendar bounds stayed x233.265625/y90/w990.71875/h630 open and closed; mobile bounds stayed x63.171875/y24.375/w268.3125/h170.625.
Rendered failures corrected: Settings text alignment/width; Task Bar content outside original header artwork; Task Bar/calendar boundary; mobile unscaled text collisions; viewport scrollbar displacement. Task Bar uses an extended matching CSS paper body with unchanged original artwork. Narrow widths use proportional desktop preview scaling, not a new mobile design.
Neighboring runtime defect discovered and fixed: Enter/removal could re-enter commit through blur, yielding a duplicate action/NotFoundError; an entryFinished guard prevents reentrancy and ensures Escape cancellation. Final direct test produced exactly one task on Enter and zero on Escape, with Task Bar remaining open and no new application-origin errors during the test interval. This is a bounded task-entry correction exposed by B01 furniture/overflow verification; no donor/domain integration occurred.
Validation: all embedded asset bytes and full calendar markup preserved; local Vite build passed. Details and remaining untested cases are in AUDIT.md. Final laptop-open image was inspected but failed file synchronization; other evidence is saved. Full-page/cropped screenshots sometimes timed out; normal viewport capture worked.
Status: B01-V17-01/02/03 and bottom-toggle findings corrected and verified for exercised states in this package. Whole B01 remains YELLOW, not Green: no second independent final review was performed. Mobile is composition-preview verification only; full touch usability, zoom, complete keyboard traversal, reduced-motion emulation, planning/persistence and other-view behavior are not certified. B02/B07 remain deferred.




B01 V20 — FOUNDER SVG OPEN-STATE COMPOSITION
Current review artifact: ARC_LOCAL_B01_v20_YELLOW.html, Drive ID 14D7d5GjNMXwDUgbrdT17PC0W1IrmHBX5. Based on v18 plus typography correction; founder SVG governs furniture proportions only. No calendar styling or SVG export artifacts transplanted.
Completed one furniture batch: substantial Settings/Fridge open surfaces, deeper wide Task Bar, compact closed tabs; asset/tab/content ownership and inert closed regions. Fixed focus-induced internal planner scrolling and long-task overflow that displaced Add controls. Calendar subtree and typography CSS preserved; no Unit/Lesson/Note semantics or donor integration.
Rendered and audited all closed, Settings only, Fridge only, Tasks only, all open (1440×900), and laptop all open (1280×720). All six pass the exercised composition checks. Desktop calendar remains x233.265625 y90 width990.71875 height630 in all five states; laptop matches prior corrected-type baseline. No furniture/calendar intersection, failed assets or final internal planner scroll displacement. Click opening/retraction and long-task Tab/blur containment tested. Retest long task: list45px client height/82px scroll height; zero escaped Add/entry controls. Vite build passes. Eight screenshots and detailed limits in ARC_B01_v20_review.zip in Arc folder.
Mobile closed/open also rendered at390×844: proportional desktop preview removes inherited overlap; this is not a certified touch/phone UI. Whole B01 remains YELLOW pending independent final audit. Settings remains existing preview copy; Fridge is empty, so populated-content interaction not certified. Full keyboard/zoom/reduced-motion emulation and task Enter/Escape lifecycle not verified on this candidate. Earlier v17 task-entry fixes were not silently transplanted to the v18 line. B02/B07 remain deferred. No deployment or publishing


B01 V20 — FOUNDER VISUAL REJECTION / GREEN EVIDENCE RESET
Status: RED — v20 is not a release candidate and cannot proceed to independent Green audit.
Founder review: the composition reads as very sloppy. This invalidates the prior assumption that the remaining B01 gate was only an independent final audit.
Interpretation: the exercised geometry/containment evidence remains useful, but technical non-overlap does not satisfy the canonical UI/UX gate. B01 requires deliberate composition, proportion, alignment, spacing rhythm, material coherence, and a unified furniture/planner silhouette. A screen that is technically bounded but visibly patched, stretched, crowded, mechanically enlarged, or assembled in isolated pieces is Red.
Control decision: rename the v20 artifact RED; freeze Phase 3 expan


B01 V21 — CANONICAL COMPOSITION REPAIR DRAFT / RENDER PENDING
Canonical visual comparison: Figma file dyh1zoTd4mJ7JzuWcIU3CX, page ARC — CANONICAL 2026-09-05. Frame 62:3 establishes the 1440×960 Week resting composition; frame 62:124 establishes outer-edge drawer geometry. The canonical drawer frame uses a 1176×700 planner at x132/y118, Settings and Fridge drawers 270×560 at y173, and a restrained 986×116 Task Bar. The side drawers are materially shorter than v20's 78–86% shell-height owners.
Source-level root finding in rejected v20: the final composition block made Settings 16%×78%, Fridge 15.7%×86%, and flattened the native 465×309 Task Bar PNG into a 100%-wide 180px strip with object-fit:fill plus a synthetic extended paper body. Those choices explain how geometry containment could pass while the composition accumulated stretched/assembled treatment. This is source evidence tied to founder rejection; it is not being misrepresented as a rendered reproduction.
Draft correction prepared locally as ARC_LOCAL_B01_v21_COMPOSITION_REPAIR.html. Scope is composition-only: side furniture height/top rhythm is reconciled toward the founder-locked Figma proportions; the Task Bar returns to the previously proven native-ratio ownership pattern instead of a flattened fill; the synthetic extension is removed; calendar geometry/typography, object markup, planning semantics, and Phase 3 code are untouched. JavaScript syntax check passes.
Verification status: NOT GREEN / NOT REVIEWABLE YET. The current container Chromium path timed out while loading the standalone 6MB embedded-asset artifact from localhost, so no trustworthy runtime screenshot or interaction evidence exists for v21 in this run. No visual success claim is permitted. The supported preview workflow used previously for B01 must be restored before this draft can supersede v20.
Required next evidence: exact rendered resting state, Settings open, Fridge open, Tasks open, all open, 1280×720; compare hierarchy/proportion/rhythm/material coherence to canonical Figma; verify unchanged calendar bounds, no furniture intersection, no clipping, Task content containment, focus/keyboard/Escape/reduced-motion neighboring regressions; then two independent Green-equivalent audits after the final material change.
sion and B02/B05/B07; do not incrementally polish v20 as though it were near-Green. Preserve proven calendar geometry, typography, object semantics, furniture ownership, open/closed behavior, and no-overlay rules while the B01 composition layer is reworked from canonical founder-locked references only. No new product or art-direction invention is authorized.
Evidence reset: all previous v20 composition passes are retained as structural regression evidence only. Any material B01 visual correction resets final RGAV count. Two independent rendered Green-equivalent audits remain required after the final material visual change.


B01 SOURCE AUTHORITY PRUNING CHECKPOINT — SEPTEMBER 7, 2026
Status: RED — source architecture / traceability blocker; no unverified source change promoted.
Evidence: rejected v20 contains seven separate <style> authorities and 209 !important declarations. The B01 Git branch design/b01-canonical-week-asset-match still points exactly at develop @ c72976ca3a0919cedbdeb4d4dc7896ac30678614, so the local B01 preview lineage is not yet represented by a B01 implementation commit. A separate local v21 composition draft is documented but remains unrendered and is not merge authority.
Canonical conflict: the Master requires one visual token owner, rejects versioned CSS recovery layers, and requires source → rendered artifact → audit traceability before Green. The current override/cascade accumulation makes the Week surface difficult to reason about and unsafe to treat as a reference implementation even where measured geometry passes.
Steward action: no additional visual patch was layered onto v20. A behavior-neutral local experiment mechanically consolidated the seven style blocks while preserving cascade order, but it was discarded rather than promoted because rendered equivalence could not be established. Do not reuse the v21 label for a separate pruning artifact. Preserve the proven calendar subtree, geometry, typography, object semantics, furniture ownership, open/closed behavior, and no-overlay evidence while pruning the composition authority.
Current verification blocker: Chromium access to localhost is denied by platform policy with ERR_BLOCKED_BY_ADMINISTRATOR in the current run. No workaround was attempted. Historical B01 evidence shows the supported supervised preview workflow can render a compatible Vite-wrapped artifact; direct runtime proof must resume through a supported workflow before any source consolidation or composition repair can supersede the RED baseline.
Acceptance required before B01 promotion: one Git-traceable B01 composition authority; obsolete/contradictory override paths removed; exact calendar/behavior preservation checks; rendered baseline-versus-pruned comparison; all closed / Settings open / Fridge open / Tasks open / all open; 1280×720 small-laptop; keyboard/focus/Escape/reduced-motion neighboring regressions; founder visual review; then two independent Green-equivalent audits after the final material change.
.


B01 CURRENT-AUTHORITY RECONCILIATION — SEPTEMBER 7, 2026
Status: RED / RGAV 0 — pruning sequence clarified; no unverified product change promoted.
Git truth: design/b01-canonical-week-asset-match and develop are identical at 51e815715090ed627edd450e12ec80b7bc85013e. The prior c72976c reference is stale, but there is still no B01 implementation delta mapping the rejected local preview lineage to Git.
New exact-head finding: AppFrame still renders CalendarViewRail as a shell child and global.css reserves a 116px full-height left grid track (100px at <=800px; bottom-fixed rail at <=520px). This conflicts with the current founder lock prohibiting a persistent full-height left navigation rail.
Pruning rule: do not transplant rejected v20's fragmented override architecture into Vite and do not preserve the Vite rail solely because it is current production code. Converge on one Git-traceable B01 composition owner; preserve proven calendar/domain semantics; remove superseded shell allocation and fragmented visual authority before composition polish. No Green claim without direct build/render/runtime evidence and two final independent audits.
B01 VIEW-NAVIGATION DECISION BLOCKER — SEPTEMBER 7, 2026
Status: RED / FOUNDER DECISION REQUIRED FOR NEXT MATERIAL SHELL CHANGE.
Canonical Figma inspection: page ARC — CANONICAL 2026-09-05 frames 62:3, 62:42, 62:87 and 62:124 explicitly label NO LEFT RAIL; the authority note says older rail-based frames are historical evidence only. The canonical frames define current-view labels, Settings tab/drawer, Fridge tab/drawer and Task Bar, but contain no Month/Week/Day/Quarter/Year switching control. A page-wide node-name search confirmed no replacement view-nav/tab treatment is defined in that canonical page.
Git evidence: protected develop and design/b01-canonical-week-asset-match are aligned at 51e815715090ed627edd450e12ec80b7bc85013e. Exact-head src/components/AppFrame.tsx still imports and renders CalendarViewRail. Removing that rail is canonically required; choosing a replacement location for its view-switch function is not canonically determined.
Steward rule: do not invent a header, Settings, Fridge, Task Bar, or other placement; do not silently remove view-switch access. Preserve current navigation semantics until founder placement is selected, then implement rail removal + replacement as one B01 shell batch with rendered desktop/small-laptop, keyboard/focus, home/last-used, weekend, and historical navigation regressions. B01 remains RED / RGAV 0; Phase 3 and B02+ remain frozen.
B01 VIEW-NAVIGATION FOUNDER LOCK — SEPTEMBER 7, 2026
Status: DECISION RESOLVED / IMPLEMENTATION AUTHORIZED; B01 REMAINS RED UNTIL RENDERED VERIFICATION.
Founder selected the restrained replacement: the current calendar view name itself is the always-reachable view-switch control. Activating the current view name (for example, Week) reveals the available calendar horizons. This replaces the superseded permanent left rail; it does not create a new furniture surface or navigation owner.
Implementation boundary: preserve the existing CalendarView state owner, availability rules, persisted fixed-home / Last used behavior, Arc-wordmark home behavior, calendar-edit continuity, weekend preference, and all existing domain/persistence truth. Remove CalendarViewRail from shell ownership and remove its reserved grid track/dead responsive rail treatments. The replacement must remain keyboard reachable, expose current state and unavailable-view reasons accessibly, close predictably, and preserve one H1 workspace heading.
Required proof before promotion: contracts, typecheck, production build, browser/a11y, current-view switch interaction, keyboard/Escape/focus behavior, 1280 desktop and small-laptop render, 200/400% zoom/reflow, home/Last used, calendar-edit continuity, Monday-first, weekend and frozen Phase 2 regressions. No Vercel deployment. B01 remains RED / RGAV 0 until direct rendered/runtime evidence exists.
B01 NO-VERCEL LAW REGRESSION — SEPTEMBER 7, 2026
Status: RED / BUILD-PLAN BLOCKER — STOP FURTHER GIT PUSHES UNTIL GIT-INTEGRATION PREVIEWS ARE DISABLED.
Direct evidence: implementing the founder-approved current-view switcher on design/b01-canonical-week-asset-match triggered the Git-linked Vercel project arc-greenfield-preview automatically. Vercel deployment inventory shows ten preview deployment attempts for this B01 batch; the latest head e386450867ff5da09b91e46c2247baacf7591bef is READY as preview deployment dpl_7wYBCTqT3JchuH5VhsPwcah5Vtjk. These were automatic Git-integration previews, not an intentional steward deploy, but they still violate the explicit No Vercel deployment law.
Immediate containment: no further Git commits/pushes are authorized from the steward until the arc-greenfield-preview Git integration is disabled or configured not to create previews for Arc build branches. Available Vercel connector access can inspect projects/deployments but exposes no delete/unlink/disable-Git-integration action, so the already-created previews cannot be removed safely from this run.
B01 implementation evidence before containment: draft PR #79 removes CalendarViewRail and its reserved shell track, moves horizon switching into the current view title, preserves one CalendarView owner, and updates keyboard/Escape/focus plus historical horizon regressions. Final head e386450867ff5da09b91e46c2247baacf7591bef: production build PASS; typecheck PASS; browser/a11y PASS with exact screenshot publication; independent Phase 2 RGAV PASS; baseline Phase 2 planning truth PASS. Full Arc verify still reports FAILURE, so the implementation is not review-ready Green even apart from the Vercel-law blocker.
Required resume condition: disable automatic Vercel previews for waxandwing/arc-greenfield (or disconnect that repo from arc-greenfield-preview), then resume on the same draft PR/head, inspect the remaining Arc verify failure without pushing, fix only if needed, rerun direct rendered evidence, inspect the exact screenshot, and continue B01 pruning/composition. No production promotion occurred. B01 remains RED / RGAV 0.










B01 GREEN GATE — 7 SEPTEMBER 2026
Founder requires all B01 gates Green before moving on. B02/B07/backend remain paused.
Keyboard audit confirmed two v20 failures: Escape in a nonempty task entry saved one unwanted task; Escape did not close Task Bar. v21 working candidate reuses entryFinished protection, prevents Escape propagation from entry cancellation, closes the focused furniture owner and returns focus to its tab. Retests: zero cancelled rows, exactly one Enter-created row, Task Bar Escape closes, Fridge Escape leaves Settings and Tasks open. Desktop open/closed regression images inspected. All presentation source unchanged. This is a working checkpoint, not a Green release.
NEW STRUCTURAL BLOCKER — mobile automatic shrinking. At390px viewport, shell zoom0.304688 renders nominal11.5px Lesson type at approximately3.5px; Settings trigger is10.359375px wide. Earlier mobile results were composition-only and must not be interpreted as usability passes. Needs readable pannable planner or approved responsive phone composition; desktop geometry remains locked. Status FAIL, not pending.
Other gates remain unverified: 200% browser zoom (Control-plus produced no viewport/DPR change in supported cloud browser), reduced-motion runtime emulation (no advertised emulation API), and independent final review. CSS media-rule presence does not count as runtime verification. No independent agent review performed. No deployment
B01 V21 PREVIEW QA CHECKPOINT — SEPTEMBER 7, 2026
Status: YELLOW / UNVERIFIED — requested B01 rendered/interaction checks pass on the corrected standalone candidate, but the documented Sites supervised preview client is not exposed in the current execution environment, so no claim is made that the Sites-managed route itself started. No Vercel deployment or production publication occurred.
Package: ARC_B01_v21_preview_project_YELLOW.zip · Drive ID 1p9hM7MIPf-w51wDRiEq8jgVqJUaz3eBs · SHA-256 8912331eb015eb326f327c5fe0b429f43f18a100faff79efdcdd09bdc50f9c10. Package contains corrected self-contained index.html, dependency-free development-server script, AUDIT.md, measured JSON evidence, and rendered screenshots.
Preservation: 7/7 embedded image assets preserved byte-for-byte from v20; parsed .calendar subtree unchanged (SHA-256 e4a3f6e6cd73c8e9ce105d68a0f310293470c6f1f6af82dba3a98a87e306d482); inline JavaScript node --check PASS. No Unit/Lesson/Note/domain semantics changed.
Desktop direct render: 1440×900 all closed, Settings open, Fridge open, Tasks open, all open, and long-task overflow. Calendar stayed x233.27/y90/w990.72/h630 in every state; Settings/Fridge/Task owned surfaces each measured 0 px² calendar intersection; desktop document overflow 0. Small laptop 1280×720 closed/all-open also held fixed calendar x250.61/y72/w792.56/h504 with 0 px² furniture-surface intersections.
Interaction: Settings Escape closes owner + returns focus; Fridge Escape closes only Fridge and preserves simultaneously open Settings/Tasks; native Space opens Task Bar; Escape from focused Task content closes Task Bar + returns focus; nonempty task-entry Escape creates zero rows; Enter creates exactly one row with idempotent entryFinished protection. Long-task stress produced list clientHeight44/scrollHeight420 with zero escaped Add/input controls and zero runtime errors.
Layer evidence: at exercised lower side-furniture/calendar overlaps, elementFromPoint resolves to live calendar descendants; Settings/Fridge tabs remain hit-test reachable above the shell.
Failures corrected in this pass: closed native-ratio Task Bar tab being translated below viewport; Settings copy starting above its paper; nuisance baseline task-list scrollbar; mobile automatic shrinking; task-entry Escape/blur re-entry; missing owner-aware Task Bar Escape. Narrow 390×844 preview now keeps planner zoom=1 with native-size controls and horizontal panning instead of shrinking the interface; left/right open-state screenshots verify both edges. This is a pannable desktop preview, not a new responsive-phone art direction.
Remaining gate: actual Sites supervised preview route must be exercised when that client is available, followed by independent final Green-equivalent review. B01 is not Green and this package must not be promoted or published.
.
B01 / G1 REVIEW-READY GREEN CHECKPOINT — SEPTEMBER 7, 2026


Status: REVIEW-READY GREEN ON EXACT GIT HEAD; PR #79 UNMERGED.


Final material head: 8afb89a930b6eb10600f4684fd9510040e736b36 on design/b01-canonical-week-asset-match.


Structural discrepancies closed: the Task Bar no longer covers calendar territory; Settings and Fridge no longer extend underneath the calendar and now terminate at the left/right planner seams; the title-owned calendar view switch remains the sole always-reachable horizon switch with no permanent rail. Calendar/document geometry remains fixed while furniture opens.


Direct rendered/runtime evidence:
• B01 canonical furniture run 34121666202: primary PASS and independent PASS.
• Exact B01 render artifact arc-b01-furniture-states id 10018442778, digest sha256:a16deb3db7a907b8b59addb992b6b193ec78cbc7498da95eeb22b3c6218cb291.
• Direct inspection completed for all closed, Settings open, Fridge open, Tasks open, all open at 1440, and all open at 1280×720. Settings/Fridge/Task surfaces remain outside calendar bounds; no hidden underlap, Task/calendar intersection, or horizontal overflow.
• Independent B01 audit verifies alternate teacher data, 44px targets, keyboard opening, fixed document geometry, explicit all-open non-overlap, order-agnostic Escape closure, exact focus restoration, and runtime cleanliness.
• Arc verify 34121666125: contracts, typecheck, production build, browser/accessibility, shell RGAV, planning truth, calendar-edge, recovery/Undo, keyboard parity, and object-action/Section-divergence checks all PASS.
• Phase 2 independent RGAV 34121666127 PASS.


Rejected standalone v20/v21 preview lineage remains historical evidence only; the current Git-owned Vite B01 is implementation authority for review.


Governance disposition: B01/G1 meets the requested Green evidence on this exact head and may be promoted from draft to founder review. This does not authorize merge, B02/B07 expansion before founder review, or any Vercel deployment. Any material shell change resets the relevant rendered/RGAV evidence.




B02 FINAL GREEN CLOSURE — SEPTEMBER 7, 2026
Status: GREEN / FROZEN


Final reference: develop commit 45e6421eabac96e94f7c30f4eca2cc9ef8dc8021.
Recovery PR: #91, merged after the post-#82 small-laptop containment defect was corrected.


Resolved defect: At 1280×720, the Week planning grid could force an internal horizontal scroll width that hid the rightmost Friday column and visually clipped the Important After School paper/ring. This meant the earlier B02 merge could not be treated as final Green despite passing automated checks.


Final correction: Week now fits the governed planner width at small-laptop size. All five teacher-week columns remain visible simultaneously. The Friday Important After School note and hand-drawn red ring remain within the edge day column. Independent QA now fails on internal planning-scroll overflow and Important edge escape.


Verified recovery evidence before merge: primary B02 rendered audit Green; independently written B02 rendered hierarchy/brand audit Green; 1440 desktop and 1280×720 small-laptop renders; Course/Section → continuous Unit → subordinate Lessons; multiple same-day Lessons; independent Note/Idea lane; subordinate After School lane; Important semantics and visible ring; provenance; Arc verify contracts/typecheck/build/browser-a11y/planning regressions; frozen B01 primary + independent furniture audits; Phase 2 independent RGAV.


Post-merge evidence: protected develop now points to 45e6421e… and GitHub Actions checks on the merged reference are successful, including build and Phase-2 continuity checks. Issue #81 was corrected to replace the stale premature-Green record; discrepancy register #71 records the RED→GREEN closure.


Deployment law: vercel.json on develop retains git.deploymentEnabled=false. No Vercel, main, or production deployment is authorized.


Disposition: B02 is Green and frozen. B03 is the next active numbered batch.


B03/B04 INTERACTION-TRUTH RED — SEPTEMBER 7, 2026
Status: RED / active G2 blocker.
Observed: the draft Week contextual toolbar advertises direct Move / resize / edit actions but routes Unit and Lesson selections to legacy global editors; shared Lesson selection lacks Section identity; Notes have no Move action; Section-specific Shift preview/apply is absent; current-calendar Unit/Lesson/Note quick-add is absent.
Canonical expected: selected objects own temporary contextual controls; Move changes placement while preserving stable identity/history; Unit range edit is a real placement operation; Shift is Section-specific, preview-first, fixed-anchor/collision guarded, and Undo-safe; legacy editors are explicitly Full Edit; Week quick-add creates Unit/Lesson/Note with minimum commitment through canonical workspace persistence.
Impacted layers: UX, UI, frontend, domain adapter, persistence, accessibility.
Containment: B01/B02 remain frozen; final B02 small-laptop containment is carried forward on the B03 branch. No B05/B07/B08/Phase3 expansion. No Vercel deployment.
Retest required: direct Move/range edit/Note Move; Section-owned Shift preview/apply/Undo; correct Section-scoped Lesson selection; live Week quick-add Unit/Lesson/Note; pointer/keyboard/touch parity; save/reload; 1440 and 1280x720 plus zoom/reflow; frozen B01/B02/Phase2 regressions; two independent rendered/runtime B03/B04 audits.




B03/B04 LOCAL INTEGRATION AUDIT — NO-VERCEL WORKAROUND — SEPTEMBER 7, 2026
Status: RED → LOCAL REPAIR CANDIDATE / PROMOTION BLOCKED BY ACTIVE VERCEL GIT LINK.
Root regression: PR #92 moved the Unit grid span to a new interaction wrapper while leaving the visible Unit button at intrinsic width. Exact PR-merge B02 CI measured the visible Unit at 136.359375 px and failed both frozen B02 audits. This is an integration regression, not a domain-model failure.
Neighboring defect: PR #92 added selectable Unit/Lesson/Note controls and contextual toolbar markup without a dedicated Arc visual-control layer, allowing native button styling to alter canonical Week objects.
Local repair: preserve current develop/B02 containment rules; make the interaction wrapper own the date span while the visible Unit fills that span; reset only the newly introduced selection buttons; add 44 px minimum contextual-action controls using existing Arc tokens; Escape dismisses the selected-object toolbar and restores focus to its originating trigger. No new product surface, furniture, object type, or art-direction decision is introduced.
Local evidence: 1440×900 and 1280×720 harness measurements show visible Unit width 975.921875 px inside a 987.921875 px span owner (98.8% fill), zero internal/page horizontal overflow, 44 px contextual controls, Important-ring containment, multiple same-day Lessons retained, and Escape focus return with toolbar dismissal. Browser runtime in the current container is now blocked from fresh localhost/file navigation by ERR_BLOCKED_BY_ADMINISTRATOR, so these existing direct measurements remain the latest usable runtime evidence; no new Green claim is made from source inspection alone.
Promotion rule: do not push/rebase/merge while arc-greenfield-preview remains Git-linked to waxandwing/arc-greenfield, because Git writes can trigger Vercel previews. Continue local reconciliation/audits; once disconnected, rebase B03/B04 onto current develop, run frozen B01+B02, Phase 2 RGAV, neighboring Phase 3, exact-head browser/a11y, and two final independent B03/B04 Green-equivalent audits before promotion.
B03/B04 ACCESSIBILITY / EXACT-HEAD FOLLOW-UP — SEPTEMBER 7, 2026
Status: LOCAL FIX PREPARED / EXACT-HEAD GREEN NOT YET CLAIMED.
Exact inspected PR #92 branch head: 52034ea01cc7a0ecca6b78b63c2fc0f56945be34. Frozen develop/B02 reference remains 45e6421eabac96e94f7c30f4eca2cc9ef8dc8021.
Current branch correction confirmed in source: the visible multi-day Unit now fills its spanning interaction owner; Unit/Lesson/Note selectors and temporary contextual controls have Arc-owned styling with 44 px minimum interaction height; current Week wiring includes real Unit range movement, Lesson movement, Section-specific Shift preview/apply, Note movement, and Unit/Lesson/Note quick-add through the canonical workspace persistence path. The primary B03/B04 rendered gate now explicitly reload-tests Unit range, Section Shift/Undo, Note move, and all three quick-add types at 1440 and 1280×720 while checking B02 overflow and 44 px quick-add targets.
New residual accessibility defect identified before Green: opening quick-add moves focus into the composer, but Escape, Close, and successful submit currently unmount the composer with onDismiss={() => setQuickAdd(null)} and do not restore focus to the instructional-day + trigger that opened it. This violates the B03/B04 predictable dismissal/focus-recovery requirement.
Local bounded repair prepared: retain the opening HTMLButtonElement in a ref, pass the trigger through PlanningDateHeader’s onQuickAdd callback, and after quick-add unmount restore focus with requestAnimationFrame. No domain, persistence, object grammar, furniture, or art-direction semantics change.
Retest required after integration: pointer + keyboard opening; Escape focus return; Close focus return; successful Unit/Lesson/Note submit focus return; 44 px targets; save/reload; 1440 + 1280×720; frozen B01/B02/Phase2; neighboring Phase3; primary + meaningfully independent B03/B04 rendered audits.
No Git write, merge, Vercel deploy, main promotion, or production publication was made by this steward run. arc-greenfield-preview remains treated as an active Git-trigger risk until directly verified disconnected.




B03/B04 FOCUS-LIFECYCLE EXACT-HEAD AUDIT — SEPTEMBER 7, 2026
Status: RED / BOUNDED INTERACTION-LIFECYCLE REPAIR REQUIRED; NO DOMAIN FAILURE.
Exact inspected head: d6e16c0ccca35c83cfd6e8193b69eeff2dc5c5eb on design/b03-object-selection-context-actions. Exact B03/B04 run 34139750382: primary rendered interaction job PASS; independent adversarial job FAIL; stress job FAIL. Contracts, typecheck, and production bundle build PASS on the same head.
Independent root finding: toolbar Escape correctly deselects the Unit but focus restoration is scheduled through requestAnimationFrame, so the persistent Unit trigger is not deterministically active when the dismissal completes. This violates predictable keyboard focus recovery.
Stress root finding: successful Unit range Apply closes the inline editor after canonical state updates but does not restore focus to the persistent Unit object. Focus is lost with the removed Apply control; the following Escape therefore may not reach the Week owner to clear selection, and the next Unit click toggles selection off instead of opening the toolbar. This explains the subsequent timeout waiting for Move / resize. The same lifecycle pattern exists for successful Note Move, shared Lesson Move, Section Shift Apply, and explicit inline-editor cancellation.
Bounded correction rule: restore focus directly to the persistent originating object/quick-add trigger on contextual-toolbar dismissal, quick-add dismissal, successful Unit/Lesson/Shift/Note mutation closure, and explicit inline-editor cancellation. Do not close editors on rejected mutations; rejected actions must remain recoverable and must not fabricate success. No domain model, persistence semantics, B01/B02 grammar, furniture, or art-direction change is authorized.
Retest required: independent toolbar keyboard/Escape focus; quick-add Escape/Close/success focus; successful and rejected Unit range changes; Lesson Move; Section Shift preview/apply/Undo; Note Move; repeated stress loops; pointer/keyboard paths; 1440 and 1280×720; frozen B01/B02 and Phase 2 regressions; then two meaningfully independent B03/B04 rendered audits after the final material change.
No steward Git write, merge, Vercel deployment, main promotion, or production publication is authorized while arc-greenfield-preview remains Git-linked to waxandwing/arc-greenfield.


B03/B04 FINAL GREEN CLOSURE — SEPTEMBER 7, 2026
Status: GREEN / MERGED / FROZEN.
Final exact tested head: 62b3dd0082b039a4818d6a75523c3dac55a787a1 on design/b03-object-selection-context-actions.
Merged PR: #92. Develop merge commit: cdf5ba43c403a6695258a8f1c23ab5a22240af4d. The merge commit is content-identical to the final tested head; compare shows no file delta between the final head and develop after merge.
Final repairs closed before Green: visible Unit continues to own the full multi-day B02 span; temporary contextual controls remain in selected-object flow and no longer cover/intercept neighboring Week objects; quick-add and contextual dismissal restore focus to the originating persistent trigger; successful Unit/Lesson/Section Shift/Note mutation lifecycles remain recoverable; stress Shift uses a valid empty instructional destination; stress fixtures target the semantic Important checkbox without colliding with the Important decorative mark.
Exact-head protected matrix: B01 canonical furniture PASS; B02 Week object grammar PASS; B03/B04 primary interaction PASS; B03/B04 independent adversarial PASS; B03/B04 stress PASS; Arc verify PASS; Phase 2 independent RGAV PASS; Phase 3 source calendar review PASS; Phase 3 official-source handoff PASS; Phase 3 read-dates proposal review PASS; Phase 3 school identity search PASS; Phase 3 live NCES browser PASS.
Primary/independent/stress artifact evidence from run 34142623193: primary artifact 10026485786 digest sha256:de83d14fd62b9e7a48bac12e1ff201daca5db1207b6ab27afe6e8e87acfbfbe9; independent artifact 10026483095 digest sha256:d8e75c0c1bb2eadf73d73dd63dc3231271430178139d3fb60de07d0022407bdb; stress artifact 10026495412 digest sha256:557ebff65110ce2c39e922c5abfb101db111ac355a593a4a6e25590334e94be8.
Direct rendered review completed at 1440 desktop, 1280×720 stress/small-laptop, and independent 1366 path. No contextual toolbar overlap/interception, no Week horizontal blowout, Unit continuity remains intact, multiple Lessons/Notes remain legible, Important semantics remain visible, and rejected invalid movement remains recoverable rather than silently mutating state.
Post-Green repeat audit: the exact same B03/B04 run was re-executed after Green. Latest primary, independent, and stress jobs all completed PASS again, establishing repeatability after the first Green observation. No material product change occurred between the first and repeat Green passes.
Deployment note: vercel.json retains git.deploymentEnabled=false. This closure used GitHub CI and inspection only; no manual Vercel deployment or credit-burning preview loop was used.
Disposition: B03/B04 is Green and frozen. Any material B01–B04 regression resets the affected evidence. The next governed checkpoint may proceed to B05/B06 only from protected develop.


B05/B06 ACTIVE AUDIT CHECKPOINT — SEPTEMBER 7, 2026
Status: ACTIVE / NOT GREEN. Draft PR #95 from protected develop cdf5ba43c403a6695258a8f1c23ab5a22240af4d.


Initial implementation establishes one Task Bar domain/persistence owner with Must/Should/Could priority, stable task identity, explicit completion and Important semantics, editing, reprioritization, and local reload persistence. Existing Fridge round-trip behavior remains the canonical Fridge transaction path; no duplicate Fridge subsystem was introduced.


First exact-head CI failure was isolated to contract-runner registration for the new Task Bar contracts. After registering both contracts, contracts/typecheck/build and frozen B01/B02/B03/B04, Phase 2 RGAV, and neighboring Phase 3 gates passed; Arc verify then isolated one B06 semantic defect: TaskBarPanel used aria-label on a generic div. That defect was corrected by promoting the labelled Task Bar root to a semantic section.


Adversarial focus audit also identified and corrected Task Bar lifecycle risks before Green: Add cancellation/success now restores focus to the persistent Add trigger; keyboard edit Enter/Escape restores focus to the persistent edit trigger; destructive task language is explicit Delete rather than ambiguous Remove.


Clean Up is now implemented as a non-mutating furniture action: it closes Settings, Fridge, and Task Bar together and returns focus to the calendar stage without changing Task Bar persistence, Fridge/planning truth, scheduling, priority, or saved positions. A dedicated B05/B06 rendered gate is being added for Task Bar CRUD/priority/Important/completion/reload, Clean Up non-mutation, fixed calendar geometry, all-open non-overlap, 44px targets, 1280 overflow, reduced motion, and runtime cleanliness.


Green remains blocked until the dedicated primary gate passes, a meaningfully independent final B05/B06 audit is added and passes on the exact final material head, direct screenshots are inspected, narrow/high-zoom/reflow evidence is clean, and the full frozen regression matrix passes twice after the final material change. No Vercel/main/production deployment is authorized.


B05/B06 OPENING AUDIT — SEPTEMBER 7, 2026
Status: RED / ACTIVE BATCH; B01–B04 remain GREEN / FROZEN.
Authority base: protected develop @ cdf5ba43c403a6695258a8f1c23ab5a22240af4d.
B05 structural finding: the current Task Bar is only a B01 furniture shell. AppFrame does not pass a tasks owner, so B01Furniture renders static Must / Should / Could headings with no canonical task data, mutation owner, persistence, completion, Cross Out, red-circle emphasis, or non-drag task movement. This is now an active B05 requirement, not permission to invent a component-local task store.
B05 Fridge finding: current develop already has canonical Lesson Fridge round-trip domain functions and undo receipt semantics. The active UI exposes unscheduled Lessons/Units and return-to-Fridge actions. Reuse this authority; do not revive the deeply diverged historical Fridge UI wholesale or add new Fridge transaction policy to useArcWorkspace.
B06 structural accessibility finding: current furniture presentation violates the repository accessibility baseline for core interface text. b01-furniture.css uses 11px Settings/Fridge/Task tabs, 12–13px Task content and Settings utility copy; b01-fridge-content.css uses 13px body copy, 11px section headings, and 12px action labels. README requires core body/interface text to remain at least 16px, with smaller type reserved for metadata. These are active-interface controls/content, not metadata.
Frozen geometry finding: existing B01 browser gate proves Settings/Fridge/Task surfaces stay outside the fixed calendar at 1440 and 1280×720, closed Task content is contained, Escape restores focus, document overflow remains bounded, and reduced motion is respected. B05/B06 fixes must preserve these exact guarantees rather than redesign furniture ownership.
Root-fix boundary: establish one canonical task transaction/persistence owner outside React presentation, then wire Task Bar to it; harden furniture typography/targets/reflow without changing B01 composition hierarchy. Do not broaden into B07 drag engine, B08 auth/account persistence, B09 onboarding, B10 new capture/Magnet/Voice object types, or later Live Classroom work.
Required Green evidence: live Must/Should/Could behavior with stable IDs and persistence; safe add/edit/complete/Cross Out/remove semantics according to canonical rules; no data loss when moving through shallower surfaces; keyboard/non-drag operation; predictable focus; 44px targets; no color-only Important state; 200–400% zoom/reflow and 1280×720/narrow stress; reduced motion; fixed B01 geometry; frozen B02 and B03/B04 regressions; primary + independent + stress B05/B06 rendered audits; then repeat the exact final Green audit again before freezing.
BUG 013 — Task Bar transient editor loses keyboard focus on close
Severity: P1 — B06 accessibility / interaction recovery
Status: FIX APPLIED / DIRECT RETEST PENDING
Discovered: B05/B06 primary rendered gate, PR #95, run 34145172721 on branch design/b05-b06-furniture-taskbar-hardening.
Problem: cancelling a nonempty Must task draft with Escape unmounts the transient input before focus is reliably restored to the persistent + Add task trigger. The first dedicated B05/B06 browser gate failed on this exact focus assertion. The same timing pattern could affect successful add and keyboard task-edit closure.
Expected behavior: Escape cancellation, successful add, edit Enter, and edit Escape must return focus to the persistent originating control after the transient editor has actually unmounted. No draft may commit on cancellation and no focus may fall to document/body.
Root fix: move restoration from requestAnimationFrame scheduled before remount to state-transition effects that focus only after the persistent Add/Edit trigger is mounted again. Keep blur behavior non-forcing and preserve canonical task mutations/persistence unchanged.
Fix commit: d18182dd2e16cc5d825ef6bae97439adf5881e3a on PR #95 branch.
Verification required: rerun the dedicated B05/B06 primary focus assertions, then neighboring browser/a11y, frozen B01–B04, Phase 2/Phase 3 regressions, independent/stress B05/B06, and final repeat audit after the last material change before marking resolved
B05/B06 EXACT-HEAD GREEN-CANDIDATE CHECKPOINT — SEPTEMBER 7, 2026
Status: REVIEW-READY GREEN CANDIDATE / PROMOTION BLOCKED BY VERCEL GIT-INTEGRATION RISK.
Exact current PR #95 head: 7ae840a7479bea9a8e529c0afe8d709c23195aaa on design/b05-b06-furniture-taskbar-hardening; base remains protected develop cdf5ba43c403a6695258a8f1c23ab5a22240af4d.
BUG 013 direct closure evidence: transient Task Bar Add/Edit focus lifecycle now restores focus only after the persistent trigger has remounted. A later independent rendered audit exposed a separate Clean Up focus race: furniture state collapsed before the calendar-stage focus callback was deterministic. That bounded defect was corrected by deferring the Clean Up focus callback until the committed all-closed state is observed. No Task Bar domain, persistence, Fridge, calendar, B01/B02 object grammar, or B03/B04 interaction semantics changed.
Exact-head B05/B06 run 34146574871 first final attempt: primary rendered gate PASS and independent rendered gate PASS. Primary artifact 10027878575 digest sha256:6f4d16c2c56caaa767ed5e72e066aa36bb68e11f8d7b3dd40657fc101879b0de; independent artifact 10027879655 digest sha256:7c58d59900face79dbb44a82f33a0f02b58d2cf75f15af85342b3aed7b0a3b92. Direct screenshots were inspected at 1440 desktop, 1280×720 small laptop, 1366 alternate path, and 390×844 narrow reflow. The calendar remains fixed while all three furniture owners open; Task Bar owns the full bottom furniture width; no global horizontal overflow was reported; task controls meet the 44px gate; Clean Up is non-mutating and returns focus to the calendar; Important remains visible by text plus ring and is not color-only.
Frozen exact-head matrix already PASS: B01 canonical furniture, B02 Week object grammar, B03/B04 Week interaction, Phase 2 independent RGAV, Phase 3 source calendar review, official-source handoff, read-dates proposal review, school identity search, and live NCES browser. Arc verify contracts, browser-a11y, shell RGAV and multiple Phase 2 jobs are PASS; the full Arc verify workflow was still completing at this checkpoint, so final all-green closure is not yet claimed.
Repeatability gate: an unchanged rerun of the exact-head B05/B06 primary job has been started after the first Green observation. No material product change is permitted between repeat runs. The independent unchanged repeat will follow only after the active rerun completes.
Audit-method note: the independent 400% stress path currently uses CSS documentElement zoom rather than true browser zoom. Its screenshot can visually clip because CSS zoom does not reproduce browser effective-viewport/media-query behavior. Treat the 390px narrow reflow and repository browser-a11y reflow checks as the stronger current evidence; do not infer a product failure solely from the CSS-zoom screenshot. A future audit-only hardening may replace this emulation with an effective-width reflow check without changing product behavior.
DEPLOYMENT-LAW BLOCKER: Vercel inspection now confirms arc-greenfield-preview received an automatic deployment attempt during this Git branch activity. Latest observed deployment dpl_FUFUnUyF3zdpLD6MM6pWshmFBmEJ is ERROR with target null; no successful production target or deliberate steward deploy occurred. However, the existence of the automatic attempt proves the Git integration remains an active No-Vercel-law risk. STOP further Git commits, pushes, merges, ready-state promotion, main changes, or production publication from this steward until automatic Vercel Git deployment is disabled/disconnected and directly verified. Read-only inspection and GitHub Actions reruns may continue.
Promotion rule: PR #95 may be called a review-ready Green candidate only after the full exact-head Arc verify matrix and unchanged repeat audits complete Green. Merge/promotion remains blocked independently by the Vercel Git-integration condition.
.




BUG 014 — Retired Task Bar persistence contracts remain registered after canonical persistence consolidation
Severity: P1 — B05 build/contract authority regression
Status: UNRESOLVED / EXACT-HEAD SOURCE CONFIRMED
Discovered: PR #95 exact head 26336fd8b28841b9afc15c777669fce5720d437d, September 7, 2026.
Problem: the branch correctly removed the parallel arc.task-bar.v1 persistence implementation in favor of canonical PlanningWorkspace Note persistence, but two stale contract artifacts still target the retired API. src/planning/taskBar.contract.ts imports EMPTY_TASK_BAR, normalizeTaskBarWorkspace, and removeTask even though current taskBar.ts exports TaskBarWorkspace as PlanningWorkspace and exposes deleteTask instead. src/planning/taskBarPersistence.contract.ts still imports the removed ./taskBarPersistence module and the same retired EMPTY_TASK_BAR API. tests/run-contracts.mjs still registers both stale contracts.
Impact: exact-head contracts/typecheck cannot be trusted Green until the obsolete contracts are either rewritten against canonical PlanningWorkspace persistence or removed if fully superseded. Leaving them registered creates split test authority and can make the build fail for code that is otherwise intentionally deleted.
Required correction: keep the single canonical PlanningWorkspace persistence owner; do not restore arc.task-bar.v1 or recreate taskBarPersistence.ts. Rewrite Task Bar contract coverage around PlanningWorkspace notes with placement=task-bar, stable Note identity, Must/Should/Could, Important, completion, delete, save/reload through existing workspace persistence, and explicit proof that arc.task-bar.v1 is not recreated. Remove only stale retired contract registrations after equivalent canonical coverage exists.
Retest: contracts/typecheck/build; B05/B06 primary + independent rendered gates; canonical planning persistence reload; frozen B01–B04 and Phase 2 regressions. No Green claim on this head until exact-head CI confirms the stale-contract cleanup.


BUG 015 — Shared PlanningNote type expansion breaks frozen planning contracts
Severity: P1 — B05 integration regression against frozen B02/Phase 2
Status: UNRESOLVED / CI CONFIRMED ON 26336fd8; SOURCE STILL PRESENT ON 30b173be
Discovered: exact PR #95 build on merge ref 86b4d7eea8d4cc46658822b7d27b2fa58eb4a8b0 for branch head 26336fd8b28841b9afc15c777669fce5720d437d.
Problem: B05 adds task-bar priority/completion fields directly to the shared hydrated PlanningNote type as required properties. Existing frozen planningProjection.contract.ts fixtures construct ordinary calendar/after-school PlanningNote objects directly and therefore no longer satisfy the type. Exact CI reports TS2739 for note-freeform, note-after-school, and note-next-week missing priority, completed, and completedAt. This causes B02, Phase 2 and Phase 3 workflow builds to fail before their rendered gates execute.
Current source check: head 30b173bed90efb309e0a1bc29f247d72c15e6ccc still declares priority/completed/completedAt required on PlanningNote while the frozen planningProjection contract still constructs legacy ordinary Notes without those fields.
Required correction: preserve canonical Task Bar-as-Note semantics without forcing unrelated calendar/after-school Note callers to become B05-aware unnecessarily. Either migrate all canonical hydrated Note fixtures/constructors through createPlanningNote while proving no runtime schema regression, or model task-only fields so ordinary hydrated Notes remain backwards-compatible and validation still enforces task-bar invariants. Do not weaken Task Bar validation and do not alter frozen projection behavior.
Retest: exact contracts/typecheck/build first; then B02 primary+independent, B03/B04, Phase 2 independent RGAV, Phase 3 neighbors, and B05/B06 rendered gates. Any fix that changes ordinary Note runtime shape requires explicit persistence/reload coverage for existing calendar and after-school Notes


B05/B06 TOTAL TRUTH RECONCILIATION CHECKPOINT — SEPTEMBER 7, 2026


Current exact candidate: design/b05-b06-furniture-taskbar-hardening @ af941d54a34027bef024addeb3e3dd8cfb2cd835. PR #95 remains draft/unmerged at this checkpoint.


Current exact-head matrix: B01 canonical furniture PASS; B02 Week object grammar PASS; B03/B04 Week interaction PASS; B05/B06 primary PASS; B05/B06 independent PASS; Arc verify PASS; Phase 2 independent RGAV PASS; Phase 3 source calendar review PASS; official-source handoff PASS; read-dates proposal review PASS; school identity search PASS; live NCES browser PASS. Arc verify’s browser-a11y job explicitly passed 200/400% zoom stress, 320/390 reflow, 44px touch target, reduced motion, overflow, keyboard/focus semantics, and runtime errors.


Rendered evidence directly inspected from exact-head run 34149998174. Primary artifact arc-b05-b06-primary id 10029041978 digest sha256:0662beb187464f5a384747a5c57a34da86dcc32ffcd9bfbc178422c635c7e35e. Independent artifact arc-b05-b06-independent id 10029041303 digest sha256:b6d87f3fce9d11a42a4bb80cb0cd28badfdeb2dd6122ec7be0cb53d79c1c402e. Direct inspection covered populated/all-open 1440, 1280×720 all-open, 1366 alternate, 390×844 narrow vertical reflow, and the 400%-CSS-zoom stress artifact. The CSS-zoom screenshot is retained as weak emulation evidence only; it is not used to override the stronger passing browser-a11y 200/400% reflow gate.


BUG 013 — RESOLVED / VERIFIED ON CURRENT EXACT CANDIDATE. Add cancellation/success and task edit Enter/Escape restore focus through the persistent trigger lifecycle; Clean Up also returns focus to the calendar only after committed all-closed state. Primary and independent rendered gates pass on af941d54.


BUG 014 — RESOLVED / VERIFIED ON CURRENT EXACT CANDIDATE. The retired parallel Task Bar persistence authority is not restored. Current Task Bar contracts compile and pass against canonical PlanningWorkspace Notes, and the rendered independent gate explicitly verifies arc.task-bar.v1 remains absent while task-bar Notes persist through the canonical workspace owner. Exact contracts/typecheck/build all pass.


BUG 015 — RESOLVED / VERIFIED ON CURRENT EXACT CANDIDATE. Shared PlanningNote compatibility is reconciled without weakening Task Bar invariants. Frozen B02, B03/B04, Phase 2, neighboring Phase 3, contracts, typecheck, build, and browser gates all pass on the same candidate.


Audit-harness discrepancies closed in this total audit: B01 smoke/independent tests had retained the retired trigger label “Tasks” and now target canonical “Task Bar” without relaxing geometry/focus assertions; B06 narrow target collection had counted a zero-box hidden native select descendant and now measures rendered interactive targets only while preserving the 44px floor.


Architecture discrepancies closed: Task Bar mutations use canonical PlanningWorkspace Note state and the existing workspace persistence owner rather than a second task store; furniture surface colors are now semantic values owned by src/styles/tokens.css with the exact prior visual values preserved; Day now exposes only a dormant optional Live Classroom extension contract carrying exact date + Course + Section + Lesson identity, with no provider and therefore no current placeholder button/surface or fake teaching behavior.


Truth-document reconciliation completed: Master now distinguishes historical macro checklist blocks from the later B01–B12 execution spine and records current architecture; Desktop Interaction Blueprint has a current-authority reconciliation; Brand System’s contradictory “Easel is the teaching surface” heading is corrected to Live Classroom; docs/CLASSROOM_NAMING.md now treats Live Classroom as the current UI term, Classroom as descriptive family shorthand, and Easel as legacy only. Product Spec remains deep behavioral/domain authority and does not override later Master task-state checkpoints with historical delivery-order prose.


No-Vercel governance recheck: the Vercel project arc-greenfield-preview still exists and live=false, but its latest deployment remains the historical failed attempt dpl_FUFUnUyF3zdpLD6MM6pWshmFBmEJ created at 2026-09-07 13:58:03 UTC with target null. No current B05/B06 reconciliation commit produced a newer deployment. Active branch vercel.json explicitly retains git.deploymentEnabled=false. Therefore the prior “stop all Git writes because previews are actively firing” condition is superseded as an active-state claim; the absolute no-Vercel/no-production-deployment law remains in force.


Status: GREEN CANDIDATE, NOT YET FROZEN. One unchanged rerun of the final B05/B06 evidence is being completed to satisfy repeatability after the final material change. Do not merge/freeze until that unchanged repeat passes and PR head remains af941d54. Any material change resets this checkpoint.
.
B05/B06 FINAL GREEN / MERGED / FROZEN CLOSURE — SEPTEMBER 7, 2026


Status: GREEN / MERGED / FROZEN.
Final audited candidate: af941d54a34027bef024addeb3e3dd8cfb2cd835.
Merged PR #95 to protected develop as 4f9a00ab53e60f0ba9732662e27fde2c93afe106.
Candidate and merge resolve to identical source tree d3ff565fc41397045775fcf1c761fd7524c100e8.
Issue #94: CLOSED / COMPLETED.


Repeatability closure: the final B05/B06 primary and independent rendered jobs were rerun unchanged after the last material source change and both passed again. The exact candidate’s full frozen/neighboring matrix remained Green. Post-merge protected Arc verify push run 34150472165 completed PASS on develop @ 4f9a00ab53e60f0ba9732662e27fde2c93afe106. Because the squash merge has the identical audited tree, the twice-rendered candidate evidence and protected post-merge integration evidence refer to the same source content.


BUG 013 final disposition: RESOLVED / VERIFIED / FROZEN. Task Add/Edit cancellation/success and Clean Up focus lifecycle are deterministic on the final rendered candidate. Reopen only if a downstream regression reproduces the failure.
BUG 014 final disposition: RESOLVED / VERIFIED / FROZEN. Task Bar remains canonical PlanningWorkspace Note state; no retired parallel task persistence owner or arc.task-bar.v1 store is restored. Reopen only if a downstream regression recreates split persistence authority.
BUG 015 final disposition: RESOLVED / VERIFIED / FROZEN. Shared PlanningNote compatibility and Task Bar invariants pass frozen B02, B03/B04, Phase 2, neighboring Phase 3, contracts, typecheck, build, and browser verification. Reopen only on reproduced integration regression.


Historical bug-log note: earlier B01 local-preview RED/YELLOW records, old `Tasks` wording, historical Vercel preview incidents, and draft reconciliation-branch BUG 006–008/010 records remain evidence of prior branches/artifacts. They do not override later explicit Green checkpoints for the active Vite develop line. BUG 006–008 remain branch-scoped debt unless their affected retired subsystem is reintroduced. BUG 010 remains dependency-aligned with later explicit Section/setup/Live Classroom integration work rather than a B05/B06 blocker. BUG 012 remains a future progressive-setup/B09 blocker and is not silently marked resolved.


Deployment-law final check: active source retains vercel.json with git.deploymentEnabled=false. The Vercel preview project remains live=false; no B05/B06 final candidate, merge, or post-merge verification created a new intentional deployment. No Vercel, main, or production deployment occurred. The historical “STOP Git writes because previews are actively firing” entry is retained as historical incident evidence and is superseded for current-state governance by the directly verified deployment guard; the absolute no-deployment law remains active.


Current protected implementation authority: develop @ 224e66a6a93447ea1930c5806c47b70e4c866ac1.
B01–B07 are frozen except for demonstrated downstream integration regressions.
Next authorized batch: B08 — PERSISTENCE + AUTHENTICATED STATE INTEGRITY. Do not broaden into B09+ or deployment.


BUG 016 — Week orchestration can announce success after canonical mutation rejection
Severity: P1 — B07 interaction truth / trust
Status: RESOLVED / VERIFIED / MERGED / FROZEN
Discovered: B07 inventory on reconcile/b07-interaction-engine, September 7, 2026.
Problem: useArcWorkspace correctly rejects Unit/Class/Lesson candidates that violate Lesson, Section-schedule, or transactional persistence integrity, but its useClasses/useUnits/useLessons mutation methods returned no acceptance signal. useWeekPlanningActions therefore emitted success context notices unconditionally after calling those methods. The Fridge round-trip path also created or cleared an Undo receipt even when useLessons had rejected or rolled back the underlying Lesson + Shift transaction. This could make a protected no-op look successful or expose Undo state for a mutation that never became canonical state.
Root fix: the canonical workspace boundary now returns boolean acceptance for useClasses/useUnits/useLessons. False is returned for integrity rejection or failed atomic Lesson+Shift persistence; true means the candidate became active canonical session state. Week contextual success notices are emitted only on true acceptance. Fridge Undo receipts are created/cleared only when the underlying Lesson mutation is accepted. No guard, domain rule, B01–B06 visual behavior, or B08 persistence scope was weakened or expanded.
Active repair commits: df2c36fb178f08c2ef703f252808f31afc510d0d and b5aff081b634b2cac59ac610c3bb880a78a1e917. Draft PR #97 targets develop. B07 FINAL GREEN / MERGED / FROZEN — SEPTEMBER 7, 2026. Final tested feature head 347a40d3f809da1df27ed44f7ce918a27b322503 passed contracts/typecheck/build, frozen B01–B06, Phase 2/Phase 3 neighbors, rendered rejection behavior, Fridge Undo truth, cross-view/reload proof, and both independent B07 audits on one unchanged final head. PR #97 merged with the expected-head safeguard to protected develop as 224e66a6a93447ea1930c5806c47b70e4c866ac1; all six post-merge develop integration workflows also passed. BUG 016 and BUG 017 are resolved and frozen. No deployment occurred.


BUG 017 — Rejected Week Quick Add can dismiss the teacher draft as if creation succeeded
Severity: P1 — B07 creation/recovery truth
Status: RESOLVED / VERIFIED / MERGED / FROZEN
Discovered: B07 interaction-source audit while verifying BUG 016, September 7, 2026.
Problem: QuickAddComposer invoked Unit/Lesson/Note creation callbacks and always dismissed immediately afterward. A locally valid Lesson can still be rejected later at the canonical workspace boundary because existing Section-specific schedule state makes the proposed shared Lesson unsafe. In that case Arc could reject the object correctly but still close Quick Add and discard the teacher’s entered draft, visually implying completion.
Root fix: current Week creation callbacks now return canonical acceptance. Quick Add dismisses only when the candidate was accepted into canonical session state. A rejected creation remains open and preserves the entered draft while the existing canonical rejection notice explains why. Successful Unit/Lesson/Note creation behavior and focus restoration remain unchanged. No duplicate state store or new product surface was introduced.
Repair commits: f0c366e77c77d7d6f11ea22be518139cf7496a70, 1e9edbbc0b4aa15bca688a00326d828ac6962ee6, and B07 regression extension 04d3330ad8d665f171fc1977f727b89031f9ff30. Green requires direct rejection proof plus the full exact-head B07/frozen matrix and two independent audits after the final material change.




GOVERNANCE + REPOSITORY CLEANUP CHECKPOINT — SEPTEMBER 7, 2026


Status: CLEANUP COMPLETE FOR CURRENT AUTHORITY SURFACE; NO NEW PRODUCT BUG OPENED.


• Stale production PR #86 was closed as superseded. It targeted an older release/main lineage and is not merge or release authority. No merge, Vercel deployment, main change, or production publication occurred.
• Active B07 branch `reconcile/b07-interaction-engine` was created from protected develop @ 4f9a00ab53e60f0ba9732662e27fde2c93afe106. Repository README authority drift was corrected on that branch in commit 14441616850bb10fdc262feac5edf30d723575ea so the Master is first authority, B01–B06 are Green/frozen, B07/#96 is active, Live Classroom replaces Easel terminology, and the no-deployment law remains explicit.
• Stale Easel issues #3/#4/#5/#6/#9/#10/#11/#12 were closed not-planned/superseded. Their historical ideas do not constitute current Live Classroom implementation authority.
• Conflicting pre-B01/B05 UI authorities #20/#23/#25/#26/#33/#42 were closed historical/superseded so old reflow/compress furniture and separate Priority-object models cannot compete with frozen B01 geometry or canonical Note-backed Task Bar truth.
• #70 was closed completed. #72 and #15 were superseded/moved into active B07 issue #96. Old repository-cleanup issue #8 was consolidated into the historical-mining ledger #37 and approved-prune queue #78.
• Remaining open issue roles are explicit: #96 active B07; #71 discrepancy register; #37 historical branch-mining ledger; #78 approved branch prune pending physical deletion; #73 future B08 input; #27 future B09 input; #74 future-batch input; #30 legacy hardening backlog only.
• Branch inventory confirmed that many refs checked in #78 still physically exist. The #78 checkmarks mean approved for deletion, not deletion completed. Current steward tooling exposes branch creation/update but no supported Git ref deletion action, so no branch was falsely reported removed. Physical deletion remains pending until a supported delete-ref path is available and each target is rechecked for newer commits.
• Preserve `main`, `develop`, `reconcile/b07-interaction-engine`, all un-audited refs, and `design/b01-canonical-week-asset-match` under its existing preservation rule until a dedicated prune audit explicitly supersedes it.


No structural product behavior changed during this cleanup except the B07-branch README authority documentation. B01–B06 remain Green/frozen. B07 remains the only active implementation batch. BUG 012 remains future B09 debt; branch-scoped BUG 006–008/010 remain historical/integration debt unless their affected subsystem is reintroduced or an equivalent active-runtime failure is reproduced.






DEPLOYMENT VERTICAL-SLICE RED BLOCKERS — SEPTEMBER 7, 2026


BUG 018 — Canonical Arc title media package is unavailable at the controlled runtime paths
Severity: P1 — deployment/title identity and alpha-rendering trust
Status: UNRESOLVED / PREVIEW BLOCKER


Problem
The beta deployment shell now references the controlled title-media paths `/assets/arc-entry-alpha.webm` and `/assets/arc-entry-poster.png`, but the founder-approved binary assets have not been positively located in the current Git branch, connected Google Drive, or ChatGPT Library. The approved entry audit requires a 900×900 VP9-alpha WebM with preserved transparency plus its transparent static poster. Existing opaque H.264/MP4 exports are not equivalent and must not be substituted merely to make the route render.


Functional impact
A preview can build while the title media still returns 404 or falls back to a non-authoritative static state. That would make the deployed entry page visually incomplete and would invalidate the title-animation/alpha portion of the deployment gate even if auth and the planner work correctly.


Acceptance criteria
• Founder-approved 900×900 VP9-alpha WebM exists at `/assets/arc-entry-alpha.webm`.
• Paired approved transparent poster exists at `/assets/arc-entry-poster.png`.
• Both assets return HTTP 200 from the exact preview deployment.
• Rendered desktop and 390×844 paths preserve transparent background and opaque paper/artwork pixels.
• Reduced-motion and media-error paths expose the approved static title state.
• Final Arc mark bounds/timing match the approved title package; no opaque MP4/H.264 substitute is introduced.
• Asset map contains one controlled runtime authority and no stale duplicate runtime references.


BUG 019 — Vercel preview project root/environment configuration is not yet deployment-valid
Severity: P0 — hosting pipeline / preview build blocker
Status: UNRESOLVED / EXTERNAL CONFIGURATION BLOCKER


Problem
The linked `arc-greenfield-preview` Vercel project’s latest observed build fails before Arc compilation because npm is invoked where `/vercel/path1/package.json` does not exist. The protected Arc repository does contain `package.json` at its repository root and the strict source build remains contracts → typecheck → Vite bundle, so this is a Vercel project-root/configuration failure rather than missing application source. The current connector can inspect Vercel but does not expose a supported write action for Root Directory or project environment variables.


Functional impact
Until the project points at the repository root and the Preview environment has the existing Arc Supabase runtime values, a hosted preview cannot prove title routing, server beta gate, Google callback, `/core`, or cloud persistence. A Vercel URL alone is not deployable evidence.


Acceptance criteria
• Vercel Root Directory is the repository root containing `package.json`.
• Preview build executes the existing strict `npm run build` successfully; the `/vercel/path1/package.json` ENOENT disappears.
• Preview environment contains `SUPABASE_URL` and the active `SUPABASE_PUBLISHABLE_KEY`; no service-role/secret key is exposed to the client.
• Supabase Auth accepts the exact preview origin `/auth/callback` redirect.
• `/`, `/interest`, `/beta`, `/auth/callback`, and gated `/core` resolve correctly on the preview.
• Unauthorized Google accounts cannot mount the planner.
• Allowlisted account save → reload restores the same workspace; account A and account B remain isolated.
• Deployment target remains Preview only; no production target, `main`, Arc-domain promotion, or PR #100 merge is implied


BUG 020 — Cloud hydration can erase valid local planner state before remote restore is validated
Severity: P0 — data-loss / authenticated-state integrity
Status: UNRESOLVED / SOURCE-CONFIRMED DEPLOYMENT BLOCKER
Target: PR #101 deploy/beta-vertical-slice @ 434b91e759b2518ac831ec09d3dc806369f00523, based on protected develop @ 224e66a6a93447ea1930c5806c47b70e4c866ac1.


CONFIRMED evidence
src/deployment/arcCloud.ts hydrateCloudWorkspace() calls clearPlannerStorage() before issuing the arc_workspaces GET and before validating that a usable cloud row/payload/browserStorage object exists. clearPlannerStorage() removes every localStorage key beginning arc. except arc.auth.v1. If the remote request fails, CoreGate catches the error only after local planner data has already been deleted. If the request succeeds with no row or no usable browserStorage payload, hydrateCloudWorkspace returns successfully after clearing local state; CoreGate then mounts Arc and starts the cloud mirror from the now-empty local planner state.


Reproduction
1. On the PR #101 beta candidate, seed a valid non-empty local Arc workspace in canonical arc.* browser-storage keys for an allowlisted account.
2. Enter /core with a valid beta session.
3a. Make GET /rest/v1/arc_workspaces fail after authorization, OR
3b. Return HTTP 200 with [] / a row lacking a valid browserStorage payload.
4. Observe the Arc-owned local planner keys after hydrateCloudWorkspace executes.


Expected
Remote hydration must be non-destructive until a valid replacement snapshot has been fetched and validated. A failed, empty, malformed, or first-use cloud response must preserve recoverable local planner state or enter an explicit migration/recovery path; Arc must never silently erase the only good copy.


Actual
Arc-owned local planner keys are deleted before remote restore validity is known. Failure leaves the planner unmounted but local data erased; an empty successful response can mount a blank planner and start mirroring from blank state.


Affected area
B08 persistence/authenticated state integrity; beta deployment /core cloud restore; save/reload trust.


Regression status
NEW active-branch defect. Not a duplicate of BUG 018/019. It also violates the standing Arc data-trust rule that important work must not disappear silently.


Minimal acceptance test
• Seed canonical local Arc planner data and snapshot it byte-for-byte.
• Remote GET 500/timeout: hydrate fails and the local snapshot remains byte-identical.
• Remote GET 200 []: local snapshot remains intact and Arc does not silently replace/mirror blank state; an explicit migration/reconciliation decision is required.
• Remote GET malformed/unsupported payload: local snapshot remains intact and recoverable.
• Remote GET valid workspace: validate the complete remote snapshot first, then replace/hydrate atomically; reload restores exactly that account’s workspace.
• Account A/B isolation remains intact and no service-role secret is exposed.
• Add a deterministic source/contract regression plus hosted/browser save→reload evidence before BUG 020 can be marked resolved.


Patch boundary
Do not paper over this with an error message after deletion. Change the hydration transaction so destructive local replacement occurs only after remote payload validation and a deliberate local-vs-cloud reconciliation rule. Preserve the frozen B01–B07 planner semantics.




BUG 020 — PRODUCTION RETEST CHECKPOINT
Status: UNRESOLVED / P0 — original destructive ordering repaired in source; authenticated account-isolation/reconciliation remains unsafe.
Current PR #101 head inspected: 77fdfabffdb838d347d65912bb7a6d52a14b0cc0.
Verified source improvement: hydrateCloudWorkspace now fetches and parses remote planner storage before any replacePlannerStorage call. Failed, missing, or malformed remote payloads no longer invoke the original clear-before-validation path. cloudWorkspace.contract.ts covers missing, empty, malformed/auth-key, and validated remote decisions.
Residual P0 finding: decideCloudHydration treats non-empty local planner state + empty remote browserStorage as first-cloud-sync / keep-local. CoreGate then starts the cloud mirror, whose immediate flush(true) writes that local snapshot to the currently authenticated user_id. The local planner snapshot carries no authenticated account binding. A browser retaining Account A local planner state can therefore sign into a fresh Account B and seed A state into B cloud storage. Non-empty local + non-empty remote also resolves to use-remote without an explicit divergence/reconciliation decision, so valid unsynced local work can be replaced silently.
Required correction: bind or otherwise prove local snapshot ownership before first cloud seeding; do not start the mirror until a safe authenticated hydration/reconciliation decision exists; treat divergent local/remote state non-destructively; preserve local bytes on failed/empty/malformed restore; prove same-account first sync, Account A → sign out → Account B isolation, fresh-B non-seeding, valid same-account remote restore, save/reload, and no secret-key exposure. BUG 020 remains P0 until these cases pass deterministic contracts plus independent runtime/browser retest.


BUG 021 — Deployment composition layer regresses frozen planner shell verification
Severity: P1 — B08 integration / frozen-interface regression
Status: UNRESOLVED / EXACT-HEAD CI CONFIRMED; causal isolation bounded to deployment integration layer.
Target: PR #101 deploy/beta-vertical-slice @ 77fdfabffdb838d347d65912bb7a6d52a14b0cc0.
Evidence: src/main.tsx globally imports src/styles/canonicalArchitecture.css even when localhost regression mode mounts the frozen App directly. That stylesheet applies broad Arc shell, calendar, furniture, control, responsive, and typography overrides. On the exact head, contracts and production build pass, while frozen B01 canonical furniture, B05/B06 furniture Task Bar, B07 interaction engine, Phase 2 independent RGAV, Arc browser-a11y, and shell-independent verification fail. Several neighboring Phase 3 and B02/B03/B04 workflows continue to pass. Do not weaken frozen tests to accommodate this integration branch.
Required correction: deployment/entry presentation must not globally restyle the frozen planner runtime. Scope deployment-only styles to deployment surfaces or remove the global planner-composition override, then rerun the exact frozen B01–B07/Phase 2 matrix and browser-a11y before any B08 promotion. Preserve the already-Green planner geometry, object grammar, interactions, accessibility, and persistence semantics.
Governance containment: PR #101 remains draft. GitHub confirms a successful automatic Vercel Preview was created from this branch despite the standing no-Vercel law. No further steward Git writes, merge, ready-state promotion, main changes, or production publication until automatic preview triggering is disabled or otherwise directly contained. Read-only inspection and non-deploying tracking updates may continue.


BUG 022 — Beta access cookie can be forged when the server secret is absent
Severity: P0 — preview access-control / security integrity
Status: UNRESOLVED / SOURCE-CONFIRMED SECURITY BLOCKER
Target: PR #101 deploy/beta-vertical-slice @ 77fdfabffdb838d347d65912bb7a6d52a14b0cc0.


CONFIRMED evidence
api/beta-access.js computes the signed beta-access cookie with createHmac('sha256', secret), but signedAccessToken() falls back to EXPECTED_PASSWORD_HASH when ARC_BETA_COOKIE_SECRET is absent. EXPECTED_PASSWORD_HASH is hard-coded in the same source file, and the message arc-beta-access-v1 is also fixed. Therefore the fallback signing secret is public/deterministic rather than secret. Anyone who knows the source can reproduce the exact valid arc_beta_access cookie without knowing the beta password. docs/DEPLOYMENT_EXTERNAL_SETTINGS.md currently lists SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY as the Preview environment variables but does not require ARC_BETA_COOKIE_SECRET, making the insecure fallback a plausible deployed configuration rather than a dead-code edge case.


Reproduction
1. Run the PR #101 beta-access API with ARC_BETA_COOKIE_SECRET unset.
2. Compute HMAC-SHA256 of the fixed message arc-beta-access-v1 using the hard-coded EXPECTED_PASSWORD_HASH as the HMAC key.
3. Send GET /api/beta-access with Cookie: arc_beta_access=<computed hex digest>.
4. Observe unlocked=true without submitting or knowing the beta password.


Expected
Beta-access authorization must rely on a server-only unpredictable secret that is mandatory in any hosted preview. Missing secret configuration must fail closed; source-visible constants must never be valid cookie-signing keys.


Actual
When ARC_BETA_COOKIE_SECRET is absent, the API accepts a cookie whose signing key can be derived entirely from repository source.


Affected area
B08/deployment beta gate; preview access control; trust boundary before Google authentication.


Regression status
NEW active-branch defect. Not a duplicate of BUG 019–021. This is independent of Supabase account authorization: it bypasses the outer beta-password gate itself.


Minimal acceptance test
• Remove the public fallback signing key entirely.
• Hosted/production-like mode with missing ARC_BETA_COOKIE_SECRET fails closed and cannot issue or validate an access cookie.
• ARC_BETA_COOKIE_SECRET is documented as a required server-only Preview environment variable and is never exposed through /api/runtime-config or client bundles.
• Correct password with a strong configured secret issues a cookie that validates successfully.
• A cookie generated from EXPECTED_PASSWORD_HASH or any other source-visible constant is rejected.
• Wrong password, modified cookie, expired/cleared cookie, and missing cookie remain rejected.
• Retest /beta → auth → gated /core and confirm no service-role/secret material reaches the browser.


Patch boundary
Do not weaken or remove the beta gate to fix this. Make the signing secret mandatory and fail closed on missing configuration; keep password verification constant-time and preserve the separate Supabase allowlist/account gate.




B08 INDEPENDENT QA RETEST CHECKPOINT — SEPTEMBER 8, 2026
Target: PR #101 deploy/beta-vertical-slice @ 7def31068dc0139bfb44b5438bb6463806a193e6.


BUG 020 — FIX EVIDENCE IMPROVED; REMAINS UNRESOLVED P0 PENDING INDEPENDENT AUTHENTICATED RUNTIME RETEST. Source now binds local planner state through arc.cloud-owner.v1, excludes that owner key from cloud payloads, blocks mirror startup unless the local owner matches the authenticated user, pauses on unbound/cross-account/divergent local state, and leaves both copies untouched. The exact-head B08 account-isolation contract PASS covers unbound local + missing remote, same-account first sync, Account A local → Account B empty cloud non-seeding, empty local/remote, valid remote restore into empty local, identical local/remote, divergent same-account state, and invalid auth/owner-key payload rejection. Arc verify and the full frozen B01–B07/Phase 2 matrix PASS on the same head. BUG 020 is not marked resolved because a real authenticated Account A → sign out → Account B browser/cloud round trip plus save/reload has not yet been independently exercised.


BUG 021 — INDEPENDENT RETEST PASS ON CURRENT PR HEAD; PATCH VERIFIED FOR THE REPORTED REGRESSION. src/main.tsx no longer applies the deployment composition override to the frozen planner path, and the exact-head CI now passes B01 canonical furniture, B02 Week grammar, B03/B04 interactions, B05/B06 furniture/Task Bar, B07 interaction engine, Phase 2 independent RGAV, and Arc verify/browser-a11y. This closes the specific regression evidence from 77fdfab; keep PR #101 draft until remaining B08/entry gates are satisfied.


BUG 022 — FIX EVIDENCE IMPROVED; SECURITY CONTRACT PASS, HOSTED RETEST STILL REQUIRED BEFORE FINAL RESOLUTION. api/beta-access.js now requires ARC_BETA_COOKIE_SECRET >=32 characters and returns 503 when missing/weak instead of using a source-visible fallback. The exact-head security contract PASS verifies missing secret fail-closed, weak secret no-cookie, wrong password rejection, valid password/cookie validation, rejection of a forged cookie derived from the public password hash, tampered-cookie rejection, and explicit cookie clearing. Source inspection confirms the public password hash is no longer a signing key. Final closure still requires the documented /beta → auth → /core runtime path with a configured server-only secret and proof that secret material is absent from client runtime config/bundles.


BUG 018 — RETEST CONFIRMED STILL OPEN; DO NOT DUPLICATE. Local visual preview run 34177154369 on the exact repaired B08 head completed strict contracts/typecheck/build successfully but failed 4/34 entry checks because /assets/Arc_Motion_Transparent.webm and /assets/arc-motion-final-transparent.png returned text/html rather than media/image content at both 1440 and 390 widths. The entry source references those two paths, and repository search/change inventory contains no corresponding runtime asset files. Keep BUG 018 as the existing P1 title-media blocker; do not open a new bug for this failure.


No new structural product bug was opened in this QA pass. Frozen planner regressions are clean on the exact repaired B08 head; remaining QA risk is concentrated in authenticated runtime reconciliation/security proof and the already-logged missing title-media package.


BUG 018 — ASSET RECOVERY / PACKAGING CHECKPOINT — SEPTEMBER 8, 2026
Status: UNRESOLVED P1 — canonical media recovered; Git runtime packaging remains blocked by binary-ingest tooling.
Exact active target: PR #101 deploy/beta-vertical-slice @ 7def31068dc0139bfb44b5438bb6463806a193e6.
Fresh evidence: the controlled Arc Library contains the intended title media referenced by the current entry source. Arc_Motion_Transparent.webm is 1,872,695 bytes, SHA-256 d0d7b8d8aded140dc2beaea132d880908c485a738d421aa5e7718a57eb0b515b; local ffprobe confirms VP9, 900×900, 8.000 seconds. arc-motion-final-transparent.png is 31,373 bytes, SHA-256 53d6f13fd70969f8667fa93a5b1306b10b676b05eb7b810957051b3d6ef5a4ff; local inspection confirms RGBA 900×900 with alpha extrema 0–255. Existing Arc repair documentation identifies this WebM as the genuine transparent rerender from the layered animation source and the PNG as its transparent final-frame poster; the opaque MP4 remains reference-only and must not be substituted.
Current CI isolation: exact-head Local visual preview run 34177154369 passes strict contracts/typecheck/build and 30/34 preview checks; its only four failures are the WebM and poster returning text/html at desktop-1440 and mobile-390 because the files are not present at the runtime asset paths. All frozen B01–B07, Phase 2, neighboring Phase 3, and Arc verify workflows pass on the same repaired head.
Required packaging action: add the recovered WebM and PNG to the Vite static-asset owner so the current source paths /assets/Arc_Motion_Transparent.webm and /assets/arc-motion-final-transparent.png return their real media types in the built preview. Do not rename or substitute the assets without reconciling current entry source and the asset map. After packaging, rerun Local visual preview, inspect desktop + 390 renders, verify reduced-motion/media-error fallback, and then continue BUG 020/022 authenticated runtime closure.
Tooling blocker: the connected GitHub write surface supports UTF-8 file writes and base64 blob creation but exposes no file-reference/binary-upload action. The 1.87 MB WebM is available as a verified Library file but cannot be safely streamed into Git through the current connector. No partial poster-only commit was made because that would leave the same runtime blocker and split one coherent media package.
No Vercel deployment occurred. The arc-greenfield-preview Git integration is disconnected; the absolute no-deployment law remains active.
.
BUG 018 — INDEPENDENT QA CLOSURE — SEPTEMBER 8, 2026
Status: RESOLVED / INDEPENDENTLY RETESTED ON PR #101 EXACT HEAD 6eadd165e79156e591b09c23029bad66a5e04276.
Evidence: the approved runtime files now exist at public/assets/Arc_Motion_Transparent.webm and public/assets/arc-motion-final-transparent.png. Exact-head Local visual preview run 34182165434 completed SUCCESS and produced fresh local-preview/build artifacts. The preview gate now resolves the WebM and poster from the expected /assets paths at desktop and 390px instead of returning text/html, and the neighboring frozen B01–B07, Phase 2, Arc verify, and Phase 3 workflows all completed SUCCESS on the same head.
Regression status: BUG 018 is closed for the reported missing-title-media/runtime-packaging failure. Reopen only if a later material entry/deployment change causes either controlled title asset path, MIME delivery, transparent poster/media fallback, or local visual-preview gate to regress.
Remaining B08 blockers are not duplicates of BUG 018: BUG 020 still requires independent real authenticated Account A → sign out → Account B isolation/reconciliation plus save/reload proof; BUG 022 still requires hosted /beta → auth → /core runtime proof with the configured server-only cookie secret absent from client runtime material. PR #101 remains draft until those P0 runtime proofs are complete.






BUG 020 — INDEPENDENT QA PRIVACY RETEST ADDENDUM — SEPTEMBER 8, 2026
Status: CONFIRMED P0 PRIVACY EXPOSURE WITHIN EXISTING BUG 020; DO NOT OPEN A DUPLICATE BUG.
Exact active target: PR #101 deploy/beta-vertical-slice @ 6eadd165e79156e591b09c23029bad66a5e04276.
CONFIRMED source-path evidence: cross-account upload is now correctly paused, but cross-account local display is not isolated. When Account A planner data remains in local arc.* keys with arc.cloud-owner.v1=A, then Account B authenticates and B has missing/empty remote state, decideCloudHydration returns action=reconcile / allowMirror=false. CoreGate shows the protective cloud-warning but still proceeds to state=ready and mounts <App /> without replacing, quarantining, hiding, or account-scoping the existing local planner snapshot. The planner therefore continues reading Account A’s browser-local canonical data while Account B is the authenticated identity. This prevents A→B cloud seeding, but it does not prevent B from seeing A’s planner on the shared browser.
Reproduction: (1) sign in as Account A, create identifiable planner data, confirm arc.cloud-owner.v1=A; (2) sign out/disconnect Google without clearing planner state; (3) authenticate as fresh Account B whose arc_workspaces row is absent/empty; (4) enter /core; (5) observe cloud sync paused warning and inspect the mounted planner content. Expected: Account B must never be shown Account A’s planner data; cross-account local state must be isolated behind an explicit reconciliation/recovery boundary before App mounts. Actual: the reconcile branch prevents mirror startup but CoreGate mounts App against the still-present Account A local snapshot. Affected area: B08 authenticated-state integrity, account isolation, shared-device privacy. Regression status: new independent evidence extending already-open BUG 020; not a duplicate. Minimal acceptance test: deterministic browser/runtime test must prove Account A local data is not visible after Account B authenticates; B cannot upload, mutate, or inherit A local state; A’s bytes remain recoverable and unchanged; explicit account-aware reconciliation can restore the correct owner without silent overwrite; same-account save→reload remains exact; Account A→B→A round trip preserves isolation. Patch boundary: do not clear A data on B login and do not merely hide the warning. Gate planner mounting or use account-scoped local persistence/reconciliation so authenticated identity and visible planner ownership cannot diverge. Frozen B01–B07 semantics remain untouched.


BUG 023 — Group 1 calendar-shell refresh obscures lower Week content behind Task Bar at 1280×720
Severity: P1 — frozen B01/B02 small-laptop integration regression
Status: CONFIRMED / UNRESOLVED — PR #104 BLOCKER
Target: PR #104 group1/calendar-shell-current-visuals @ bfd36a81289783be38cb83d2dfbfb260be76fc4f, based on protected develop @ 224e66a6a93447ea1930c5806c47b70e4c866ac1.
CONFIRMED evidence: Exact-head B01 canonical furniture workflow 34182752616 reports PASS and produced fresh rendered artifacts. Independent inspection of artifact arc-b01-furniture-states id 10039486315 shows the 1280×720 all-open state with the Task Bar beginning over the lower Week planner content: Period 4 Lesson cards continue below the Task Bar’s top edge and are visibly covered/obscured. The same B01 artifact at 1440 does not show this collision. Comparison against the B01 artifact from PR #101 head 6eadd165e79156e591b09c23029bad66a5e04276 shows the prior 1280×720 planner terminates above the Task Bar; this is therefore introduced by the Group 1 shell/composition refresh rather than inherited from the frozen baseline.
Reproduction: (1) check out PR #104 exact head bfd36a81289783be38cb83d2dfbfb260be76fc4f; (2) use the B01 canonical furniture fixture with Settings, Fridge, and Task Bar all open; (3) render at 1280×720; (4) inspect the lower Week rows near Period 4 and Task Bar top boundary. Expected: Task Bar remains outside calendar/planner territory and no Lesson/Note/Unit content is visually hidden by opening furniture at the governed small-laptop viewport. Actual: Task Bar overlaps and obscures the lower Period 4 Lesson cards. Affected area: Group 1 calendar shell composition; frozen B01 furniture ownership; frozen B02 small-laptop Week containment/readability. Regression status: downstream integration regression against frozen B01/B02; do not weaken existing gates or reclassify the historical small-laptop containment closure. Evidence also exposes a test blind spot because the exact-head B01 workflow passed despite the rendered collision.
Minimal acceptance test: render PR #104 successor at 1280×720 with all three furniture owners open and a populated Week containing lower-row Lesson cards; assert zero visual/bounding-box intersection between Task Bar owned surface and the complete live planner/calendar content region, and verify all lower-row cards remain fully visible/reachable. Repeat at 1440, 1366, 200%/400% effective reflow, and with Task Bar close/open cycles; keyboard focus must not move into obscured content. Frozen B01/B02/B03-B04/B05-B06/B07 and Phase 2 regressions must remain Green on the exact repaired head. Patch boundary: correct only Group 1 shell vertical composition/containment; do not move Task Bar into calendar ownership, change object semantics, or redesign furniture.


BUG 023 — PATCH CHECKPOINT — SEPTEMBER 8, 2026
Status: FIX APPLIED ON PR #104 / INDEPENDENT RENDERED RETEST PENDING.
Patch PR #105 was squash-merged into the Group 1 branch. Current PR #104 head: 17c2410507ea6585fdc507ab6c6e2c312adc2804.
Fix: a narrowly scoped 801–1280px override reserves an additional 24px of exterior bottom clearance when the Task Bar is open. The calendar box is not resized or repositioned; Task Bar height, content, behavior, object semantics, and the <=800px in-flow mobile composition are unchanged.
Retest required before resolution: exact-head 1280×720 all-open populated Week must show zero Task Bar/planner-content intersection and fully visible lower Lesson rows; verify unchanged calendar bounds open/closed, then 1440/1366 and the frozen B01/B02/B03-B04/B05-B06/B07/Phase 2 matrix. BUG 023 remains unresolved until direct rendered evidence passes.


BUG 023 — INDEPENDENT QA CLOSURE — SEPTEMBER 8, 2026
Status: RESOLVED / INDEPENDENTLY RETESTED ON PR #104 EXACT HEAD 17c2410507ea6585fdc507ab6c6e2c312adc2804.
Direct evidence: B01 canonical furniture run 34218089023 completed SUCCESS and produced arc-b01-furniture-states artifact 10052632317 (digest sha256:deeb97d0ccd29ee64e84a0e6cb5c6063a399d4581436dd04db6b9df0cc03fa86) plus independent artifact 10052634696 (digest sha256:74c60cc9150cda76a63c1d085bda4e02814795395ae1ccb419c39d6bbf490009). Independent inspection of 06-all-open-1280x720.png shows the Task Bar begins entirely below the planner with visible exterior clearance; the previously obscured lower Week/Lesson region is no longer covered by Task Bar furniture. Independent 1366×768 all-open evidence also shows the Task Bar outside the planner content region. The calendar remains in the same fixed central composition; the patch changes only the small-laptop exterior clearance when Task Bar is open.
Regression evidence: exact-head B02 Week object grammar and B05/B06 furniture + Task Bar workflows completed SUCCESS, and the exact-head PR workflow inventory contains no failed workflow. Neighboring Phase 3 checks observed in the same matrix also remain successful.
Disposition: BUG 023 is resolved for the reported 1280×720 Task Bar/planner-content obstruction. Reopen only if a later material Group 1/shell change reintroduces furniture obstruction of live planner content. This closes the defect only; PR #104 visual/art-direction acceptance as a whole remains a separate production/founder review decision.


BUG 023 — INDEPENDENT QA RESOLUTION CHECKPOINT — SEPTEMBER 8, 2026
Status: RESOLVED / INDEPENDENTLY RETESTED ON PR #104 EXACT HEAD 17c2410507ea6585fdc507ab6c6e2c312adc2804.
Independent retest evidence: exact-head B01 canonical furniture workflow 34218089023 completed PASS and produced fresh rendered artifact arc-b01-furniture-states id 10052632317. Direct inspection of 06-all-open-1280x720.png confirms the Task Bar begins below the journal/calendar boundary with visible exterior clearance; the previously obscured lower Week content is no longer behind the Task Bar. The corresponding B05/B06 furniture/Task Bar workflow 34218089033 also completed PASS on the same exact head. The patch remains narrowly scoped to 801–1280px exterior bottom clearance and does not resize/reposition the calendar or alter Task Bar logic/content/height. Regression status: downstream Group 1 small-laptop integration regression closed for the reported overlap. Reopen only if a later shell/furniture change reproduces calendar/Task Bar intersection or lower-row obstruction.


BUG 024 — Group 3 canonical shell restoration breaks the exact-head production build
Severity: P1 — integration/build blocker affecting frozen regression execution
Status: CONFIRMED / UNRESOLVED — PR #102 BLOCKER
Target: PR #102 group3/object-visual-grammar @ 26ae869a9f1aa5a09deeade40a41d8ca389f8e28, based on protected develop @ 224e66a6a93447ea1930c5806c47b70e4c866ac1.
CONFIRMED evidence: latest exact-head Phase 3 school identity workflow 34235249782 fails at Build browser target before rendered QA can execute; neighboring exact-head workflows also fail at build. Source inspection isolates a compile-time type error introduced in src/components/CalendarStageHeader.tsx: plannerDateHeading(anchorDate, activeView) compares CalendarView to the lowercase literal 'week', while canonical CalendarView is the uppercase-title union 'Year Map' | 'Semester' | 'Quarter' | 'Month' | 'Week' | 'Day'. The branch therefore introduces a comparison against a literal that is not a member of CalendarView. This file is part of the PR delta and was added in the same final shell-restoration commit.
Reproduction: (1) check out PR #102 exact head 26ae869a9f1aa5a09deeade40a41d8ca389f8e28; (2) run the repository production/browser build through any protected workflow; (3) observe Build browser target fail before rendered gate execution; (4) inspect CalendarStageHeader plannerDateHeading and CalendarView type definition. Expected: visual-only Group 3 refinement compiles without changing frozen planner behavior and all protected regressions reach execution. Actual: build fails before browser QA because the new header helper uses an invalid lowercase CalendarView literal. Affected area: Group 3 object-visual-grammar integration; planner shell/header compilation; every workflow that requires the browser build. Regression status: NEW downstream integration regression; not a duplicate of BUG 023 and not a domain/persistence failure.
Minimal acceptance test: change only the invalid view comparison to the canonical CalendarView value/logic; run contracts, typecheck, production build first; then require B01, B02, B03/B04, B05/B06, B07, Phase 2 independent RGAV, browser-a11y, and neighboring Phase 3 workflows to execute and pass on the exact repaired head. Verify Group 3 remains visual-only and does not overwrite Group 1 shell ownership or planner navigation semantics. Patch boundary: do not weaken TypeScript checks, alter CalendarView casing/authority, or broaden into domain/state/auth work.
BUG 025 — Integrated calendar shell clips/overlaps Phase 3 school-identity setup at 1280×720
Severity: P1 — setup interaction/accessibility + frozen Phase 3 integration regression
Status: CONFIRMED / UNRESOLVED — PR #106 BLOCKER
Target: PR #106 exact head 4f345efdf3877fea938bdffbe7b66f8a07a0535d.


CONFIRMED evidence: exact-head Phase 3 school identity workflow 34248634816 reaches the browser target but fails its rendered 1280 job while the production build and Arc verify complete successfully. Artifact 10065100984 (school-identity-search-1280.png) directly shows the planner journal/header composited over the school-identity setup: the large Month heading overlaps the setup title/form, right-side fields and candidate-selection controls are clipped by the planner boundary, and lower setup content extends beyond the fixed journal composition. This is direct rendered product evidence, not a harness-only assertion.


Source cause is bounded to composition ownership. On this exact head, AppFrame always mounts WorkspaceStage inside section.calendar-canvas, including when WorkspaceStage returns CalendarSetup because calendar/anchorDate are missing. calendarShell.css then applies the fixed journal aspect-ratio, 162px small-laptop top padding, overflow:auto, and absolute calendar-stage header to that same calendar-canvas/header owner without excluding setup state. The long setup surface therefore inherits planner-page geometry that was authored for the configured calendar projections.


Reproduction: (1) check out PR #106 exact head 4f345efdf3877fea938bdffbe7b66f8a07a0535d; (2) run the Phase 3 school-identity 1280 browser flow; (3) enter/search school identity and display candidate-selection/setup content; (4) inspect the 1280×720 rendered state. Expected: school identity/setup remains fully legible and operable at small-laptop size, no planner heading/chrome covers setup content, no fields or candidate controls are clipped, and keyboard focus can reach every visible control. Actual: planner Month/header content overlaps the setup and multiple right/lower setup controls are visibly cropped by the fixed journal composition.


Affected area: first-time/calendar setup; Phase 3 school identity; 1280×720 responsive behavior; keyboard/focus reachability; Group 1 shell integration with frozen Phase 3 setup surfaces.


Regression status: NEW downstream integration regression on PR #106. Not a duplicate of BUG 012, which concerns blocking first-time product-entry architecture, and not BUG 023, which concerned Task Bar obstruction of configured Week content.


Minimal acceptance test: render the repaired exact head at 1280×720 and 390×844 through the Phase 3 school-identity flow; assert zero overlap between calendar-stage header/month lockup and the setup surface; document/setup horizontal overflow is zero; every input, candidate action, source/review action and continuation control is fully visible, keyboard reachable, and has visible focus; Phase 3 school identity passes; neighboring source-calendar-review, official-source-handoff, read-dates-review, frozen B01–B07, Phase 2 and browser-a11y regressions remain Green.


Patch boundary: fix ownership/scoping only. Setup may coexist with the Arc desktop, but must not inherit the fixed-aspect notebook/planner projection constraints unless explicitly intended. Scope journal/header presentation to actual planner projection/configured-calendar state or provide an explicit setup composition owner. Do not redesign school search, alter calendar/domain/state truth, or weaken frozen tests.


BUG 025 — INDEPENDENT QA RETEST ADDENDUM — SEPTEMBER 8, 2026
Status: CONFIRMED / STILL UNRESOLVED — CURRENT PR #106 HEAD 7da8d1fd306a245b6b9e38d5fe6948b72483c58e.
Fresh exact-head evidence: Phase 3 school identity workflow 34255894946 reports SUCCESS and publishes artifact arc-phase3-school-identity-search-1280 id 10067870616 (digest sha256:0d524a8b55ad2ffc4c5f52d08756d6b0a593f30c3a60257a9043c175b1fe1271), but independent inspection of school-identity-search-1280.png still reproduces BUG 025. The setup is rendered inside the journal/planner composition; the large Month heading remains above the setup surface, the District or agency field is clipped at the right journal boundary, the Find my school row is cut at the lower journal edge, and additional setup content continues below the notebook. The source delta still applies fixed-aspect calendar-canvas geometry and absolute calendar-stage header styling to the shared owner. This is a rendered product failure despite a Green school-identity workflow, exposing an automated visual-gate blind spot rather than closing the defect.
Regression status: repeated downstream Group 1/2 shell integration failure on the latest PR #106 head. Do not mark BUG 025 resolved from workflow conclusion alone.
Minimal acceptance test remains: exact-head 1280×720 and 390×844 school-identity/setup renders with zero header/setup overlap, zero horizontal clipping/overflow, all form/candidate/review/continuation controls fully visible and keyboard reachable with visible focus, plus frozen B01–B07, Phase 2, browser-a11y, and neighboring Phase 3 Green. The rendered gate must add an assertion that setup controls stay inside the usable setup owner rather than merely completing the school-search flow.


BUG 011 — LIVE PROVIDER REGRESSION RETEST ADDENDUM — SEPTEMBER 8, 2026
Status: CONFIRMED REPEATED LIVE-GATE FAILURE / PRODUCT CAUSE UNVERIFIED — DO NOT OPEN A DUPLICATE BUG YET.
Target: PR #106 current head 7da8d1fd306a245b6b9e38d5fe6948b72483c58e; Phase 3 live browser NCES run 34255895070.
Evidence: the exact-head build, contracts, typecheck, and bundle all pass, including the deterministic NCES school identity provider contract. The live availability step then returns `NCES live smoke candidates: []` for the canonical Oak Ridge High / Orlando / FL query and fails before the same-origin browser integration step. Independent QA reran the failed job unchanged; the second attempt again returned an empty candidate list and failed at the same live availability step. PR #106 changes are confined to shell/furniture/presentation files and do not alter the NCES provider/query implementation. This is therefore a reproducible live-provider-path failure at this time, but current evidence does not yet distinguish upstream NCES data/service behavior from an environment/query compatibility regression.
Expected: the live authoritative query returns Oak Ridge High with NCESSCH 120144001406 and LEAID 1201440, or the gate classifies genuine provider unavailability as external without falsely asserting product failure. Actual: HTTP/provider parsing succeeds far enough to return a valid feature collection with zero candidates, causing the expected identity check to fail twice.
Affected area: Phase 3 live official school identity verification / external-provider reliability. Regression status: recurrence of the previously resolved BUG 011 failure class; deterministic product contracts remain Green, so do not change provider code until the live layer/schema/current response is inspected.
Minimal acceptance test: inspect the current NCES layer response/schema directly; rerun the exact canonical query; if Oak Ridge is present, identify and repair only the smallest query/schema/environment mismatch and require live gate + deterministic contracts + school-identity browser flow Green. If the authoritative layer itself no longer contains/returns the expected record for this query, document the upstream condition and adjust the availability sentinel without weakening Arc identity matching or fabricating fallback truth.






BUG 025 — QA REPAIR CHECKPOINT — SEPTEMBER 8, 2026
Status: FIX APPLIED ON PR #106 EXACT HEAD f6be719e92795b4cd767bdeb4842bcc74c0a7dd6; INDEPENDENT RENDERED RETEST IN PROGRESS.
Repair: non-planner setup/editor surfaces are now explicitly separated from the fixed journal composition. The planner sketchbook rules continue only when CalendarStageHeader renders planner-header-primary. Setup/editor flows use normal document height, relative header placement, no journal background/aspect-ratio lock, and narrow reflow without inheriting the fixed planner canvas.
NCES live recurrence repair: the existing 2024–25 NCES geocode layer remains primary. If it returns no candidates, Arc now queries the official same-year NCES Public School Administrative Data layer and normalizes SCH_NAME/LCITY/LSTATE/LZIP fields back into the existing Arc candidate schema. This does not introduce fuzzy identity guessing or a non-NCES source. The live smoke now exercises the same two-layer official-source path.
Patch path: QA PR #108 was squash-merged into the PR #106 integration branch. No merge to develop/main and no deployment occurred.
Retest required before BUG 025 resolution: exact-head 1280×720 and 390×844 setup renders with no Month/header overlap, clipped district/candidate controls, or horizontal overflow; frozen B01/B02/B03-B04/B05-B06/B07 and Phase 2 matrix; Phase 3 school identity; live NCES identity smoke; live browser NCES. Do not mark resolved until those direct checks pass.


BUG 025 — FINAL SOURCE REPAIR FOLLOW-UP — SEPTEMBER 8, 2026
Current PR #106 head: 4b9f365fb57289c1b64cd1536cfc1b18c47d0603.
Additional direct rendered review of the prior repaired head showed the main clipping/overlap fixed, but exposed two residual planner-only artifacts in first-time setup: the stale Month H1 and dormant Settings/Fridge/Task Bar artwork after the long setup content. Those remnants are now removed from the first-time/non-planner composition: CalendarStageHeader exposes “Calendar setup” rather than the current planner view when no SchoolCalendar exists, and non-planner setup/editor surfaces suppress B01 furniture ownership instead of placing planner furniture after the long form.
The school-identity gate is hardened to fail if first-time setup exposes a Month heading, visible planner furniture, 1280px district/candidate controls escaping the viewport, 390px horizontal overflow, or 390px district-field clipping. It now publishes both 1280 and 390 full-page evidence.
NCES recurrence evidence: exact head 7ff0da80dadf15705456979dd22d2a3dc7e60aea passed the live NCES identity sentinel through the official same-year administrative fallback, returning OAK RIDGE HIGH / NCESSCH 120144001406, while Phase 3 live browser NCES and deterministic school-identity search also passed. The final 4b9f365f head retains that repair; its complete exact-head matrix is queued/running and remains required before final resolved status.
BUG 025 — INDEPENDENT QA CLOSURE — SEPTEMBER 8, 2026
Status: RESOLVED / INDEPENDENTLY RETESTED ON PR #106 EXACT HEAD 496d9e1af4e118a822a75632f1c220712dc5fb55.
Evidence: exact-head Phase 3 school identity search, source-calendar review, official-source handoff, read-dates review, live NCES identity, live browser NCES, Arc verify, B01, B02, B03/B04, B05/B06, B07, and Phase 2 independent RGAV all completed SUCCESS. Fresh school-identity artifacts at 1280 and 390 were independently inspected: Calendar setup owns normal document flow; no stale Month planner heading appears; no Settings/Fridge/Task Bar furniture appears in setup; district/candidate controls are fully contained; 390 reflows without horizontal clipping. Reopen only if a later shell integration reintroduces planner geometry/furniture into non-planner setup.


BUG 026 — Full-space furniture asset integration clips live Settings/Fridge content at viewport edges
Severity: P1 — frozen B01 responsive/interaction regression; PR #106 blocker.
Status: CONFIRMED / UNRESOLVED on PR #106 exact head 496d9e1af4e118a822a75632f1c220712dc5fb55.
Reproduction: run B01 canonical furniture all-open fixture at 1440×900 or 1280×720 on exact head; inspect side furniture. Expected: Settings and Fridge remain outside planner ownership but all live furniture text/inputs/actions stay fully visible, readable, keyboard reachable, and inside the viewport. Actual: fresh artifact arc-b01-furniture-states id 10073490321 shows Settings content cut against the left viewport and Fridge content substantially clipped off the right viewport at 1440; 1280×720 reproduces the right-side clipping and truncates live Fridge copy/controls. The workflow reports PASS despite the visible failure.
Affected area: B01 furniture composition, exterior owner bounds, responsive small-laptop behavior, keyboard/accessibility reachability, asset layering.
Regression status: NEW downstream regression after head 4b9f365f. Compare 4b9f365f→496d9e1a adds full-space SVG furniture assets plus b01-furniture-fullspace.css and modifies B01 furniture composition. Source shows the desktop full-space owner uses exact 16:9 viewport geometry while existing side-surface rules remain layered underneath; current automated geometry assertions do not verify viewport containment of the live side-surface content.
Minimal acceptance test: at 1440×900, 1366×768, and 1280×720 with Settings/Fridge/Task Bar all open, assert every live Settings/Fridge control bounding box is fully within document viewport and fully visible; zero horizontal clipping/hidden interactive content; tabs remain reachable; calendar bounds remain unchanged; open/close/Escape/focus restoration pass; frozen B01–B07, Phase 2, browser-a11y, and Phase 3 matrix remain Green. Patch boundary: correct exterior content/owner geometry only; do not move furniture into planner ownership, resize the governed calendar, or change Task/Fridge semantics.
