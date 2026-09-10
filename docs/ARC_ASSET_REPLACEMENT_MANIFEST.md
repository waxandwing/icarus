# ARC — One-for-One Asset Replacement Manifest

Status: ACTIVE RECONCILIATION GATE
Branch: `stitch/entry-flow-greenpp`
Purpose: prevent broad visual substitution. Every production visual slot must resolve to an approved ARC source asset before replacement.

## Authority rules

1. Google Drive canonical ARC assets are visual authority once provenance is verified.
2. `docs/assets/source/` and `public/assets/arc/` are current repository source/optimized copies, not automatically canonical.
3. `docs/asset-manifest.csv` and `docs/asset-metadata.json` describe a September 8 recreated package. They are requirement/history references, not final visual authority.
4. ArcTable assets are inventory-only for this ARC pass. Do not move, copy, or substitute them into ARC.
5. No missing asset may be replaced by a generic CSS primitive, placeholder, clip art, or newly improvised visual. Missing means `BLOCKED_MISSING_SOURCE` until an approved ARC asset exists.
6. Every asset must pass source-completeness, crop/bounds, transparency, shadow, baked-neighbor, rendered-size, and post-crop fidelity checks before installation.

## A. Current production/runtime asset slots

| Slot | Git production path | Repository source master | Current role | Drive authority | Status | Required action |
|---|---|---|---|---|---|---|
| P-001 | `public/assets/arc/arc-mark-stacked.webp` | `docs/assets/source/arc-mark-stacked.png` | Product mark / loading / recovery | `ARC_MARK_SOURCE_MASTER_WORKING.png` located in Drive | SOURCE_FOUND / FIDELITY_PENDING | Compare repo source and WebP to Drive master; replace one-for-one if stale; preserve C overshoot and non-square bounds. |
| P-002 | `public/assets/arc/calendar-open-planner.webp` | `docs/assets/source/calendar-open-planner.png` | Desktop planner/calendar shell | unresolved | BLOCKED_PROVENANCE | Locate exact approved Drive source, inspect full bounds, then retain or replace same slot. |
| P-003 | `public/assets/arc/fridge-notes-blue.webp` | `docs/assets/source/fridge-notes-blue.png` | Fridge decorative notes surface | unresolved | BLOCKED_PROVENANCE | Locate exact approved Drive source; reject exports with baked neighboring note fragments. |
| P-004 | `public/assets/arc/fridge-notes-cream.webp` | `docs/assets/source/fridge-notes-cream.png` | Alternate Fridge / empty-state decoration | unresolved | BLOCKED_PROVENANCE | Locate exact approved Drive source; inspect isolation, crop and shadow margin. |
| P-005 | `public/assets/arc/fridge-open-surface.webp` | `docs/assets/source/fridge-open-surface.png` | Preserved Fridge surface variant | unresolved | BLOCKED_PROVENANCE | Locate exact approved Drive source; confirm intended orientation and full surface bounds. |
| P-006 | `public/assets/arc/onboarding-tell-us-about-your-day.webp` | `docs/assets/source/onboarding-tell-us-about-your-day.png` | Setup/onboarding composition | unresolved | BLOCKED_PROVENANCE | Locate approved Drive source; confirm baked copy is intentional and exact. |
| P-007 | `public/assets/arc/onboarding-tell-us-about-your-day-hd.webp` | `docs/assets/source/onboarding-tell-us-about-your-day-hd.png` | High-density setup/onboarding composition | unresolved | BLOCKED_PROVENANCE | Same as P-006; verify crop and text integrity at rendered size. |
| P-008 | `public/assets/arc/onboarding-tell-us-about-your-day-wide.webp` | `docs/assets/source/onboarding-tell-us-about-your-day-wide.png` | Wide setup/onboarding composition | unresolved | BLOCKED_PROVENANCE | Same as P-006; verify wide composition is complete, not mechanically cropped. |
| P-009 | `public/assets/arc/pattern-arc-geometric.webp` | `docs/assets/source/pattern-arc-geometric.png` | Setup/entry geometric environment | unresolved | BLOCKED_PROVENANCE | Locate approved Drive source; verify repeat/crop edges and no accidental clipping. |
| P-010 | `public/assets/arc/settings-folder-cream.webp` | `docs/assets/source/settings-folder-cream.png` | Settings furniture silhouette | unresolved | BLOCKED_PROVENANCE | Locate approved Drive source; inspect tab/folder silhouette and transparent breathing room. |
| P-011 | `public/assets/arc/taskbar-folder-mustard.webp` | `docs/assets/source/taskbar-folder-mustard.png` | Task Bar furniture silhouette | unresolved | BLOCKED_PROVENANCE | Locate approved Drive source; inspect upward folder geometry and transparent bounds. |
| P-012 | `public/assets/arc/texture-blue-paper.webp` | `docs/assets/source/texture-blue-paper.png` | Blue paper material | unresolved | BLOCKED_PROVENANCE | Locate approved Drive material master; verify tile/crop behavior and texture scale. |
| P-013 | `public/assets/arc/texture-cream-paper.webp` | `docs/assets/source/texture-cream-paper.png` | Cream paper material / entry surface | unresolved | BLOCKED_PROVENANCE | Locate approved Drive material master; verify texture scale, seams and rendered-size fidelity. |
| P-014 | `public/assets/arc/texture-mustard-paper.webp` | `docs/assets/source/texture-mustard-paper.png` | Mustard Task Bar material | unresolved | BLOCKED_PROVENANCE | Locate approved Drive material master; verify tile/crop behavior. |
| P-015 | `public/assets/arc/texture-wood.webp` | `docs/assets/source/texture-wood.png` | Outer desk/environment only | unresolved | BLOCKED_PROVENANCE | Locate approved Drive source; confirm environmental role and no use inside planner surface. |
| P-016 | `/Arc_Motion_Transparent.webm` | production binary slot outside `/assets/arc` | Opening motion | GOLD V8 local master exists; repo slot currently unresolved | BLOCKED_BINARY | Install verified V8 binary one-for-one into production slot only after checksum and playback verification. White background is intentional despite legacy filename. |

## B. Current entry-flow references verified in code

`src/app/EntryFlow.tsx` currently references:

- `/Arc_Motion_Transparent.webm`
- `/assets/arc/arc-mark-stacked.webp`
- `/assets/arc/pattern-arc-geometric.webp`

`src/app/EntryFlow.module.css` currently references:

- `/assets/arc/texture-cream-paper.webp`
- `/assets/arc/texture-blue-paper.webp`

These five asset roles plus the V8 motion slot are hard dependencies for the entry experience. No entry asset may be swapped until its row above clears provenance and crop/fidelity inspection.

## C. Required ARC asset families from the existing repository manifest

The repository also contains a 21-family requirement manifest. These are treated as required role families, but the existing files are explicitly documented as recreated from scratch and therefore are not canonical source art by default.

| Requirement | Family | Required role | Reconciliation status |
|---|---|---|---|
| ARC-001 | ARC mark | Core product mark | Map to verified Drive master; existing recreation is not authority. |
| ARC-002 | Planner paper | Neutral planner paper | Drive source required. |
| ARC-003 | Calendar shell | Static planner/book surface | Drive source required. |
| ARC-004 | Settings tab closed | Left-edge furniture | Drive source required. |
| ARC-005 | Settings surface open | Open Settings furniture | Drive source required. |
| ARC-006 | Fridge tab closed | Right-edge furniture | Drive source required. |
| ARC-007 | Fridge surface open | Open Fridge furniture | Drive source required. |
| ARC-008 | Task Bar tab closed | Bottom furniture | Drive source required. |
| ARC-009 | Task Bar surface open | Expanded Task Bar furniture | Drive source required. |
| ARC-010 | Unit magnet | Calendar Unit object | Drive source required. |
| ARC-011 | Lesson paper | Calendar Lesson object | Drive source required. |
| ARC-012 | Note paper | Calendar Note object | Drive source required. |
| ARC-013 | Important circle | Important semantic object | Drive source required. |
| ARC-014 | Add mark | Utility add icon | Drive source required or verify approved live-code exception. |
| ARC-015 | Fridge artwork | Fridge decorative artwork | Drive source required. |
| ARC-016 | Settings texture | Settings material | Drive source required. |
| ARC-017 | Fridge texture | Fridge material | Drive source required. |
| ARC-018 | Task Bar texture | Task Bar material | Drive source required. |
| ARC-019 | Tab icons | Furniture icon family | Drive source required. |
| ARC-020 | Creation stickers | Optional creation accents | Deferred until core calendar is stable. |
| ARC-021 | Drawer entry field | Visual reference for accessible live input | Role remains live HTML/CSS; asset used only as approved visual reference. |

## D. Replacement gate

A row may move to `CLEARED_FOR_INSTALL` only when all are true:

- exact Drive source identified;
- source opened at full resolution;
- intended object is complete;
- transparency/background state is intentional;
- no neighboring artwork is baked into the export;
- no intentional protrusion or shadow is clipped;
- excess dead canvas is corrected only when necessary;
- corrected crop is compared back to source;
- actual rendered-size inspection passes;
- repo target path and interface role are confirmed;
- replacement is one-for-one and does not broaden the interface.

`GREEN++` means structural/functional clearance. `GOLD` requires this provenance and material-authenticity gate in addition to rendered-state, accessibility, teacher-task, hostile-frame, and memorability audits.
