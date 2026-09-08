# ARC — Web Agency / Claude Handoff Package

Package date: September 8, 2026

## What this package is

This is the portable source package for rebuilding Arc as a responsive, code-native web application. It contains the current master product documents, an agency brief, implementation and state architecture, interaction and accessibility rules, a complete original replacement asset family in SVG and PNG, design tokens, and a ready-to-use Claude kickoff prompt.

The assignment is a faithful re-render of Arc's established visual and product intent. It is not permission to replace Arc with a generic dashboard, productivity app, or conventional ed-tech interface.

## Start here

1. Read `agency-handoff/00_EXECUTIVE_BRIEF.md`.
2. Read the master documents in numbered order under `master-documents/`.
3. Read `agency-handoff/01_ARCHITECTURE_AND_STATE.md` and `02_INTERACTION_AND_VISUAL_RULES.md`.
4. Review `asset-manifest.csv`, `asset-metadata.json`, and the contact sheet.
5. Use `agency-handoff/03_BUILD_PLAN_AND_ACCEPTANCE.md` as the statement of work.
6. If using Claude, begin with `CLAUDE_START_PROMPT.md` and provide the entire package as project context.

## Package map

```text
ARC_CLAUDE_HANDOFF_PACKAGE/
├── README.md
├── CLAUDE_START_PROMPT.md
├── asset-manifest.csv
├── asset-metadata.json
├── tokens.css
├── agency-handoff/
│   ├── 00_EXECUTIVE_BRIEF.md
│   ├── 01_ARCHITECTURE_AND_STATE.md
│   ├── 02_INTERACTION_AND_VISUAL_RULES.md
│   ├── 03_BUILD_PLAN_AND_ACCEPTANCE.md
│   ├── 04_ASSET_USAGE_AND_PROVENANCE.md
│   └── 05_CONTENT_MIGRATION_AND_HOW_TO.md
├── master-documents/
│   ├── 00_AGENT_SOURCE_OF_TRUTH_MAP.md
│   ├── 01_MASTER_OPERATING_DOCUMENT.md
│   ├── 02_CANONICAL_PRODUCT_SPEC.md
│   ├── 03_DESKTOP_INTERACTION_BLUEPRINT.md
│   ├── 04_CANONICAL_BRAND_SYSTEM.md
│   ├── 05_BUG_FIX_LOG.md
│   ├── 06_LEGACY_ASSET_LEDGER_REFERENCE.txt
│   ├── 07_B01_ASSET_HANDOFF_REFERENCE.md
│   └── 08_REBUILD_DECISION_ADDENDUM_2026-09-08.md
├── assets/
    ├── svg/   (21 editable masters)
    ├── png/   (21 rendered copies)
    └── ARC_ASSET_CONTACT_SHEET.png
└── reference-only/
    ├── current-build-screens/  (four composition/state references)
    └── code-branches/          (three immutable source snapshots)
```

## Governing rule

Kelly's latest explicit direction overrides every document. The Master Operating Document is the written source of truth beneath that direction. Old prototypes and archived builds are evidence only.

## Copyright and provenance boundary

The replacement assets in this package were created from scratch from functional descriptions and the established Arc palette. They do not embed or trace Canva exports. Existing Canva/Figma/Adobe links remain historical references only and are not package dependencies.

This is an AI-assisted original design package, not a legal opinion. Before commercial release, conduct ordinary trademark review for the Arc name/mark and retain this package, generation date, and modification history as provenance documentation.

## Live-code boundary

Dates, course and Section names, Units, Lessons, Notes, task content, settings, inputs, labels, selection states, focus states, toolbars, accessibility names, and every other changing UI element must remain live HTML/CSS/React. Static assets may provide the environment, silhouettes, surface treatment, decorative marks, and brand identity only.
