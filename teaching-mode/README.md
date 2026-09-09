# Arc Teaching Mode

This directory is the production ledger for the live-teaching surface formerly known as Easel.

## Product relationship

**Arc plans the lesson. Teaching Mode runs the lesson. Arc remembers what happened.**

Teaching Mode is not a second planner, LMS, gradebook, slide builder, or dashboard. It is the front-of-room operational state of Arc.

## Production model

- `main` remains the canonical Arc planner branch.
- `teaching-mode` is the isolated implementation/reskin branch.
- The frozen functional beta passed 46/46 checks twice before reskin work began.
- `PRODUCTION_GATE.md` defines the non-negotiable acceptance standard.
- `FUNCTIONAL_AUDIT.md` records the twice-green baseline.
- Any visual change that alters behavior resets the affected gate and requires two clean runs again.

## Visual inheritance

Teaching Mode should feel like Arc changed posture rather than like a separate product opened.

Use the existing Arc design tokens as source of truth:
- paper: `--arc-paper`
- paper-white: `--arc-paper-white`
- ink: `--arc-ink`
- mustard: `--arc-mustard`
- terracotta: `--arc-terracotta`
- blue: `--arc-blue`
- sage: `--arc-sage`
- red emphasis: `--arc-red`
- serif: `--arc-font-serif`
- sans: `--arc-font-sans`
- hand accent: `--arc-font-hand`

Do not recreate these values locally unless the canonical token file changes.

## Spatial rule

Arc planning mode is a working desk. Teaching Mode is the front of the room.

Preserve the useful old Easel interaction DNA:
- central teaching / presentation stage
- stable lesson progression
- restrained teacher controls
- explicit room visibility state
- hold / release behavior
- quick private note
- radically quieter classroom display

Remove the weak old Easel grammar:
- rounded-card mosaic editing
- generic AI/SaaS dashboard surfaces
- duplicate class planning/setup
- excessive containers and uppercase micro-labels
- customization chores during live teaching

## Build sequence

1. Preserve twice-green session spine.
2. Introduce Arc tokens and material hierarchy without changing behavior.
3. Recompose teacher control around a strong central stage.
4. Make classroom display even quieter and more distance-legible.
5. Render and inspect the full viewport matrix.
6. Run functional matrix twice again if behavior changed.
7. Only then configure a Cloudflare Pages preview.

## Deployment rule

No production deployment from this branch until the visual and functional gate is explicitly approved. Cloudflare Pages is for milestone previews after local/rendered QA, not for every edit.
