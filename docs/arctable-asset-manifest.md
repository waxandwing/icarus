# ARC TABLE — Canonical Asset Manifest

Status: WORKING PRODUCTION AUTHORITY
Branch: `arc-table-greenpp`
Source authority: approved ARC + ArcTable Drive assets and governing documents. Do not infer visual authority from existing CSS primitives.

## Governance
- ArcTable is the classroom-facing ARC mode: teacher ↔ room.
- ARC remains the parent visual system. ArcTable inherits geometry, material logic, typography hierarchy, motion discipline, accessibility, and voice.
- ArcTable-specific assets must remain isolated from ARC planner assets unless explicitly identified as shared brand material.
- Never replace a missing authored asset with a generic CSS circle, rounded rectangle, card, gradient, stock icon, arbitrary Bauhaus geometry, or other improvised primitive.
- Dynamic labels, timers, names, dates, QR codes, pass data, focus states, and accessibility semantics remain live UI.
- Before installation, every raster asset must pass source, crop, bounds, transparency, actual-size, and provenance review.

## Identity + material authorities

| ID | Exact file title | Required appearance / role | Status |
| --- | --- | --- | --- |
| AT-001 | `ARC_TABLE_ASSET_01_PRIMARY_LOCKUP_GREENPP.png` | Primary ArcTable lockup. Preserve the exact canonical ARC mark. Pair TABLE as a controlled secondary wordmark. TABLE must not mutate or compete with ARC. | DRIVE SOURCE REQUIRED |
| AT-002 | `ARC_TABLE_ASSET_02_STRUCTURAL_GEOMETRY_GREENPP.png` | Structural geometry language. Large partial arcs and continuing forms derived from ARC's C / continuity grammar. Functional, not decorative Bauhaus confetti. | DRIVE SOURCE REQUIRED |
| AT-003 | `ARC_TABLE_ASSET_03_SURFACE_MATERIAL_REFERENCE_GREENPP.png` | Material authority for classroom surfaces: tactile paper/card/printed/painted character, adult, projector-safe, stronger than ARC without becoming childish. | DRIVE SOURCE REQUIRED |

## Interface asset family

| ID | Exact file title | Required appearance / function | Status |
| --- | --- | --- | --- |
| AT-006-01 | `ARC_TABLE_06_01_PROGRESS_RAIL_BASE.png` | Authored physical progress baseline / track. Quiet material/print variation, high classroom legibility. | DRIVE SOURCE REQUIRED |
| AT-006-02 | `ARC_TABLE_06_02_PROGRESS_ACTIVE_MARKER.png` | Current-position marker. Strongest state at teaching distance, not gamified. | DRIVE SOURCE REQUIRED |
| AT-006-03 | `ARC_TABLE_06_03_PROGRESS_COMPLETE_MARKER.png` | Completed-step marker. Clearly quieter than active. | DRIVE SOURCE REQUIRED |
| AT-006-04 | `ARC_TABLE_06_04_CLOCK_PLATE.png` | Low-noise, physical plate/frame for live clock content. Projector-friendly. | DRIVE SOURCE REQUIRED |
| AT-006-05 | `ARC_TABLE_06_05_TIMER_RING_NORMAL.png` | Normal timer ring. ARC-derived circular form with material edge and long-distance recognition. Timer numerals remain live. | DRIVE SOURCE REQUIRED |
| AT-006-06 | `ARC_TABLE_06_06_TIMER_RING_CLEANUP.png` | Cleanup timer state. More urgent than normal through form/material + color, without alarm/game styling. | DRIVE SOURCE REQUIRED |
| AT-006-07 | `ARC_TABLE_06_07_PASS_PLATE_AVAILABLE.png` | Bathroom/pass control apparatus in available state. Large touch target, instantly readable. | DRIVE SOURCE REQUIRED |
| AT-006-08 | `ARC_TABLE_06_08_PASS_PLATE_ACTIVE.png` | Pass-in-use state. Must differ from available through more than color alone. | DRIVE SOURCE REQUIRED |
| AT-006-09 | `ARC_TABLE_06_09_NOW_TAB.png` | Physical NOW tab / label. Strongest temporal hierarchy. | DRIVE SOURCE REQUIRED |
| AT-006-10 | `ARC_TABLE_06_10_NEXT_TAB.png` | Physical NEXT tab. Same family as NOW, clearly secondary. | DRIVE SOURCE REQUIRED |
| AT-006-11 | `ARC_TABLE_06_11_RESOURCE_QR_FRAME.png` | Authored frame/apparatus around live QR/resource surface. QR remains live. | DRIVE SOURCE REQUIRED |
| AT-006-12 | `ARC_TABLE_06_12_HOLD_OVERLAY_FRAME.png` | Full-room HOLD / paused-state frame. Reads immediately without becoming a generic modal. | DRIVE SOURCE REQUIRED |
| AT-006-13 | `ARC_TABLE_06_13_RECONNECTING_PLATE.png` | Quiet reconnecting/network status plate. Operational, not error theater. | DRIVE SOURCE REQUIRED |
| AT-006-14 | `ARC_TABLE_06_14_CLEANUP_CORNER_ACCENT.png` | Cleanup environmental cue. Functional state signal, not a decorative sticker. | DRIVE SOURCE REQUIRED |
| AT-006-15 | `ARC_TABLE_06_15_LEFT_CLASSROOM_ACCENT.png` | Large left-side environmental geometry derived from ARC curvature. May intentionally exceed viewport. | DRIVE SOURCE REQUIRED |
| AT-006-16 | `ARC_TABLE_06_16_UPPER_RIGHT_ACCENT.png` | Counterbalancing upper-right environmental geometry. Must not form a decorative border around the UI. | DRIVE SOURCE REQUIRED |
| AT-006-17 | `ARC_TABLE_06_17_PROGRESS_UNDERLINE.png` | Printed/drawn emphasis line for hierarchy and progress. Use sparingly. | DRIVE SOURCE REQUIRED |
| AT-006-18 | `ARC_TABLE_06_18_SECTION_SEPARATOR.png` | Repeated section divider with subtle printed/material behavior. | DRIVE SOURCE REQUIRED |

## Required behavioral asset families not yet represented by verified canonical filenames

These roles are required by the current product behavior, but a verified approved Drive filename has not yet been established. Do not invent filenames or visuals. Keep them `MISSING_CANONICAL_ASSET` until an approved source exists.

| ID | Required role | Current implementation pressure | Status |
| --- | --- | --- | --- |
| AT-M01 | Teacher-control furniture tab family: Tools / People / Pass | Current React uses generic furniture-tab buttons. | MISSING_CANONICAL_ASSET |
| AT-M02 | Open teacher drawer/surface | Current drawer is CSS surface. | MISSING_CANONICAL_ASSET |
| AT-M03 | Tool tile family: Groups / Picker / Notes / Media | Current tools are generic buttons. | MISSING_CANONICAL_ASSET |
| AT-M04 | People / roster state apparatus | Needed for group/student-status view. | MISSING_CANONICAL_ASSET |
| AT-M05 | Group markers / group identity family | Needed for teacher + student display grouping. | MISSING_CANONICAL_ASSET |
| AT-M06 | Pass-return / returned state | Required by pass tracking behavior. | MISSING_CANONICAL_ASSET |
| AT-M07 | Blank student-display working surface | Required for student-facing display shell. | MISSING_CANONICAL_ASSET |
| AT-M08 | Full blackout / paused screen state | Screen must be entirely black when explicitly paused/blackout. No decorative asset should remain visible. | BEHAVIORAL STATE; NO ART REQUIRED UNLESS APPROVED |
| AT-M09 | Media apparatus / frame family | Required when media/slides are introduced. | MISSING_CANONICAL_ASSET |
| AT-M10 | Unit/course marker for classroom footer | Current implementation uses a CSS circle. Must use approved authored object if identity-bearing. | MISSING_CANONICAL_ASSET |

## Current code areas requiring replacement audit
Current ArcTable code supports teacher and student display, Tools / People / Pass panels, current lesson, timer, progress, flow, groups, roster information, pass tracking, and student-facing Up Next / Groups / Clean Up.

The current implementation contains identity-bearing CSS constructions. These are temporary structural placeholders, not GOLD production assets. Audit and replace one-for-one only when approved authored asset sources are available.

## ArcTable expression palette
- Pine `#183A32`
- Slate `#4F6F8C`
- Ochre `#C69A3A`
- Clay `#C6473D`
- Cream `#F6EFE1`
- Fog `#DAD6CD`
- Ink `#17262A`

These are expression tokens, not permission to flatten authored materials into solid fills. Never recolor the canonical ARC mark to these values.

## Gold gate for every asset
1. Exact canonical source identified.
2. Full-resolution source inspected on all four edges.
3. Transparency/background behavior verified.
4. Neighboring artwork / accidental clipping / malformed shadows rejected.
5. Intentional overshoots documented and preserved.
6. Crop corrected with optical breathing room where needed.
7. Candidate compared directly to source.
8. Actual interface-size render reviewed.
9. Installed in exact manifest slot; no opportunistic reuse.
10. Architecture + interaction + visual hierarchy + material + brand + primitive detection + provenance + crop + accessibility + responsive audit.
11. Repeat review as teacher performing the real task.
12. Run logo-covered recognition, random-frame, competitor camouflage, counterfeit ARC, trend subtraction, grayscale, 200% zoom, keyboard-only, reduced motion, washed-out projector, 320px, large display, failed media, slow network, long text, empty state, and realistic maximum-density state.
13. `GREEN++` only after technical/structural production quality.
14. `GOLD` only after GREEN++ plus authored specificity, defensible provenance, memorability, teacher realism, material authenticity, and adversarial survival.

Do not dilute GOLD. Do not mark an asset GOLD merely because it is attractive or polished.
