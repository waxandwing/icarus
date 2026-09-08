# ARC B01 Canonical Asset Handoff

## Authority / scope
This package is for the B01 canonical Week shell + furniture matching pass only. It does not authorize B02 Unit/Lesson/Note grammar changes.

## Non-negotiable dynamic UI boundary
DO NOT bake changing UI into artwork. Dates, course names, Unit/Lesson/Note text, settings labels/controls, tasks, Must/Should/Could content, drawer entry content, focus/hover/selected states, accessibility labels, contextual toolbars, and other changing content remain live HTML/CSS/React.

Assets may provide static physical surfaces, silhouettes, textures, decorative marks, and approved brand identity only.

## ARC-003 Calendar Shell — corrected implementation rule
The approved calendar/planner image is the **canonical visual authority** for the Calendar Shell. It establishes the book/paper geometry, page proportions, center gutter, exterior-edge treatment, paper treatment, spacing, and overall composition.

Production is **hybrid**:
- The canonical calendar image/reference is an asset/reference and must remain available to the implementation team.
- Static book/paper surface, edge, texture, or decorative shell treatments may be implemented as assets when that produces the closest match.
- The working calendar grid and all changing/interactive information remain live HTML/CSS/React.
- Do **not** implement the complete working calendar as a baked screenshot.
- Do **not** simplify the approved planner appearance into a generic white application panel merely because the content is live.
- Preserve the proven Course → continuous Unit span → Section rows → Lessons structure.
- Furniture must open around the fixed Calendar Shell without shrinking, squeezing, shifting, or reflowing its approved geometry.

Canonical packaged reference:
`02_CANONICAL_STATE_REFERENCES/ARC_ARC-003_CALENDAR-SHELL_VISUAL-AUTHORITY_REFERENCE.jpeg`

## B01 linking order and disposition
1. ARC-003 Calendar Shell — **HYBRID: VISUAL REFERENCE ASSET + LIVE UI.** Use the packaged canonical image as appearance/geometry authority while preserving the current proven live calendar hierarchy.
2. ARC-001 Arc Logo — static vector candidate: https://to.adobe.com/SjENGYjaohk5UfwU
3. ARC-004 Settings Closed — CODE, NOT ASSET. Live CSS/HTML edge-tab silhouette; SETTINGS text live.
4. ARC-005 Settings Open — static vector candidate: https://to.adobe.com/mL6siBn9ky7AHHy4
5. ARC-006 Fridge Closed — CODE, NOT ASSET. Live CSS/HTML right-edge tab/handle.
6. ARC-007 Fridge Open — static vector candidate: https://to.adobe.com/xbCQj1NMHaleofP5
7. ARC-008 Task Bar Closed — CODE, NOT ASSET. Live CSS/HTML bottom tab/folder silhouette; TASKS text live.
8. ARC-009 Task Bar Open — static vector candidate: https://to.adobe.com/PYXIcETSxTwkIKcx
9. ARC-013 Important Red Circle — static vector candidate: https://to.adobe.com/IVCKPpZtKyJOHzou
10. ARC-021 Drawer Entry Field — CODE, NOT ASSET. The rounded gray raster reference may be deleted if live CSS is cleaner.

## Vector QA completed
Adobe vectorization was run individually and visually checked for ARC-001, ARC-005, ARC-007, ARC-009, and ARC-013. The shapes visually preserve the isolated references closely enough for implementation matching.

## Canva SVG warning
The supplied Canva `9.svg`, `10.svg`, and `11.svg` files are NOT true path-vector masters. Inspection found embedded raster-image data inside SVG wrappers. They are included only under `04_CANVA_SVG_WRAPPERS_REFERENCE_ONLY` so nobody accidentally links them as production vectors.

## Rights / release gate
Technical handoff is ready for beta linking. Rows still marked VERIFY in the master ledger are not being represented as commercially rights-cleared. ARC-003 distinguishes the live-code clearance from any raster reference-image provenance: **CLEARED CODE / VERIFY IMAGE** until the source provenance is confirmed.

## B01 acceptance proof after linking
Render and audit: all furniture closed; Settings open; Fridge open; Task Bar open; all three open; small-laptop. Calendar geometry must remain fixed with no squeeze/reflow, furniture must emerge from exterior edges, no phantom whitespace, no rail/SaaS-panel feel, no clipping, and no baked dynamic content.

