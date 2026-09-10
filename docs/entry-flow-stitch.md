# ARC entry-flow stitch

This branch stitches the entry experience ahead of the planner shell.

## Canonical opening animation

Do not substitute or regenerate this media during integration.

- Video: `Arc_Motion_Transparent.webm`
- Format: WebM, VP9 alpha
- Canvas: 900 × 900
- Duration: 8 seconds
- SHA-256: `d0d7b8d8aded140dc2beaea132d880908c485a738d421aa5e7718a57eb0b515b`
- Poster: `arc-motion-final-transparent.png`
- Poster: 900 × 900 RGBA PNG
- Poster SHA-256: `53d6f13fd70969f8667fa93a5b1306b10b676b05eb7b810957051b3d6ef5a4ff`

Timing is inherited from the approved repaired source:

- note-arrival phase ends: 3.28s
- settle completes: 6.65s
- copy/access reveal: 7.08s
- opening scale: 1.10
- settled scale: 0.68
- progressive top trim: 40.10%

The animation shows planning overload resolving into the ARC mark. The landing copy is:

- `PLAN THE WAY YOU THINK.`
- `Making it make sense.`
- `A teacher planner built for what actually happens.`
- `Sign up with email`
- `Log in with beta password`

Reduced-motion and media-error states must fail open to the transparent final poster plus immediately available access controls.

## Stitch order

1. canonical opening animation
2. access / beta password
3. teacher setup
4. existing ARC planner shell
5. implementation audit against the GREEN++ Figma specification

The binary media has been recovered from the canonical embedded landing candidate and verified locally. It still needs to be placed in `/public` on this branch before the branch can be treated as a runnable integration candidate.
