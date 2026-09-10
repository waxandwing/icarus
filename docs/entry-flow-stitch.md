# ARC entry-flow stitch

This branch stitches the entry experience ahead of the planner shell.

## Canonical opening animation

The approved opening motion is V8 GOLD. Do not substitute, simplify, regenerate, or re-time it during integration.

Production source candidate:

- Review MP4: `ARC_Opening_Motion_v8_REVIEW.mp4`
- Production WebM candidate: `Arc_Motion_V8_GOLD_WHITE.webm`
- Canvas: 900 × 900
- Duration: 9.233 seconds
- Frame rate: 30 fps
- Background: intentional white, matching the approved entry stage
- Codec: VP9, yuv420p
- Review MP4 SHA-256: `666388951b06af48da672f395fd5178d87948da6a7c1d3ec4c6f6fb9842e7078`
- Production WebM SHA-256: `cdaa5f4cc707805eefaf6aeec885bc60c7f26527d99ecf08cd4e200a17eb0243`

The previous `ARC_Opening_Motion_v8_WHITE.webm` candidate was rejected during implementation audit because it was truncated to approximately 2.566 seconds. It is not production media. The replacement WebM above was regenerated from the approved V8 review master, verified at the full 9.233-second duration, and compared at eight timestamps against the MP4 master. The legacy application slot `/Arc_Motion_Transparent.webm` may remain temporarily for minimal code churn, but the approved V8 production media is intentionally opaque white rather than transparent.

V8 GOLD motion authority:

- Teacher planning notes accumulate quickly and become overwhelming.
- Notes use varied, gravity-led arrival timing and a unified physical scale.
- Stationery spans multiple content areas and teacher-life reminders.
- Planning objects swirl and compress without disappearing.
- Significant tangram fragments inherit visible provenance from individual notes or magnets.
- Those same fragments become the ARC geometry. No substitution event and no dissolve standing in for transformation.
- The exact current ARC mark hard-locks at approximately 7.08s.
- Once locked, the mark does not bounce, pulse, drift, or resettle.
- `PLAN THE WAY YOU THINK.` enters separately and more slowly beginning around 7.52s.
- The completed animation remains above the access gate. Entry choices appear below it and must not displace or resize the final mark.

## Entry architecture authority

There are exactly two entry branches. No third login/signup path may be introduced without founder approval.

1. `/beta` — beta tester login.
   - Shared tester password: `icarus` unless overridden by the `ARC_BETA_PASSWORD` server environment variable.
   - Validation stays server-side through `/api/beta-access`.
   - Success enters teacher setup, then the planner.
2. `/interest` — public interest form.
   - Email required; name and role optional.
   - Submissions write to the canonical Supabase table `arc_interest_signups` through `/api/interest`.
   - Interest submission does not create an account, unlock the beta, or enter setup.
   - Duplicate addresses return a calm already-on-the-list state.

The former email pseudo-auth route is superseded. Email is an interest-list branch only.

## Entry visual/material rules

- The V8 mark and `PLAN THE WAY YOU THINK.` remain visually intact above the entry surface.
- Entry surfaces use assets already present in `/public/assets/arc`, including the approved paper textures, ARC geometric pattern, and ARC mark.
- Do not invent generic decorative primitives, placeholder illustrations, faux stationery, generic gradients, or substitute icons for this flow.
- Functional HTML controls remain semantic controls, but their material surfaces inherit approved ARC textures rather than decorative CSS approximations.
- The beta and interest branches share one physical ARC apparatus and switch content without moving the resolved mark.
- The stage remains true white to match V8.

## Accessibility + trust

- Media failure and reduced-motion states fail open to the current ARC mark plus immediately available entry controls.
- Password responses are uncached and deliberately generic; input is bounded.
- Interest form includes server-side validation, a honeypot field, bounded inputs, loading/error/duplicate/success states, and no false-success path.
- Errors use text and a non-color-dependent field state and are announced live.
- Both branches are direct-loadable routes through Vercel rewrites and remain keyboard accessible.

## Typography authority

Implementation must load and use the current ARC typography system:

- Inter — sustained interface/body copy
- League Spartan — short labels and controls
- Instrument Serif — large editorial headings and brief accents

Legacy Nunito/Fraunces/Caveat loading is implementation drift.

## GOLD review authority

Entry integration must survive the standing review authority before merge:

1. disciplinary ruthless review
2. teacher-with-a-task review
3. accessibility and reduced-motion review
4. hostile/random-frame review
5. primitive/placeholder detection
6. material-provenance review
7. brand-with-logo-covered recognition
8. implementation fidelity review
9. final adversarial veto

GOLD is not a synonym for acceptable. It means no meaningful defect survives the full review cycle. Taste alone does not reopen GOLD. New evidence does.

## Current implementation evidence

- V8 is founder-approved GOLD motion.
- Password surface has been reviewed in desktop default, loading, error, mobile default, and mobile error states.
- The earlier single-password-only implementation was corrected after architecture review to restore the canonical `/beta` and `/interest` split.
- The historical Group 4 entry-gate branch confirmed the same public route contract: `Enter the beta` -> `/beta`; `Join the interest list` -> `/interest`.
- The historical interest branch confirmed the existing `arc_interest_signups` Supabase destination. The current implementation moves that write behind `/api/interest` instead of exposing the write logic in the browser.
- CI previously exposed and resolved a TypeScript `verbatimModuleSyntax` failure. Lint + production build were green before the two-route restoration and must rerun after these changes.
- The regenerated V8 production WebM is locally verified at 900 × 900, 30 fps, 9.233 seconds. Its remaining blocker is repository binary placement plus final browser playback verification.

## Stitch order

1. V8 GOLD opening animation
2. two-route entry apparatus: `/beta` + `/interest`
3. teacher setup from successful beta access only
4. existing ARC planner shell
5. implementation audit against the locked GREEN++ / GOLD authority

Do not merge until the verified `cdaa5f4c...` V8 WebM has been placed in the application media slot, both entry branches pass browser verification, and the complete entry flow survives the GOLD review authority.
