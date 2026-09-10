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
- The completed animation remains above the access gate. The password surface appears below it and must not displace or resize the final mark.

## Password handoff

The password experience is physically tied to the animation rather than being a second unrelated screen.

- The opening motion occupies the upper entry field on true white.
- The final ARC mark and `PLAN THE WAY YOU THINK.` remain visually intact above the access surface.
- When the reel finishes, the beta gate enters below it without changing the reel geometry.
- The gate is a cream-paper work surface using current ARC cream-paper and blue-paper textures, not a generic SaaS card.
- Only the implemented beta-password path is exposed. The earlier email pseudo-auth path was removed rather than presented as functional account creation.
- Password verification remains server-side through `/api/beta-access` and `ARC_BETA_PASSWORD`.
- Password responses are uncached and deliberately generic; supplied input is bounded to 256 characters.
- Media failure and reduced-motion states fail open to the current ARC mark plus immediately available access controls.
- Error state uses both text and a non-color-dependent field state; status is announced with `aria-live` / `role=alert`.
- Successful access hands directly into teacher setup.

## Typography authority

Implementation must load and use the current ARC typography system:

- Inter — sustained interface/body copy
- League Spartan — short labels and controls
- Instrument Serif — large editorial headings and brief accents

Legacy Nunito/Fraunces/Caveat loading was implementation drift and has been removed from this branch.

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

Taste alone does not reopen GOLD. New evidence does.

## Current implementation evidence

- Password surface reviewed in desktop default, desktop loading, desktop error, mobile default, and mobile error states.
- Initial audit exposed two real defects: the final tagline was partially hidden by the gate, and an off-white page revealed the video canvas as a white square. Both were corrected by reducing the reel footprint, removing the negative overlap, and matching the stage to true white.
- CI exposed a `verbatimModuleSyntax` TypeScript failure for `FormEvent`; the import was corrected to a type-only import.
- Latest Arc CI on the branch passes lint and production build.
- The regenerated V8 production WebM is locally verified at 900 × 900, 30 fps, 9.233 seconds. Its remaining blocker is repository binary placement plus final browser playback verification.

## Stitch order

1. V8 GOLD opening animation
2. integrated beta password beneath the resolved animation
3. teacher setup
4. existing ARC planner shell
5. implementation audit against the locked GREEN++ / GOLD authority

The text implementation is wired on `stitch/entry-flow-greenpp`. Do not merge until the verified `cdaa5f4c...` V8 WebM has been placed in the application media slot and playback has been checked in the target browsers.
