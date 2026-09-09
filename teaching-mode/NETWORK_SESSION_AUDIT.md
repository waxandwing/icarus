# ARC Teaching Mode — Network Session Ruthless Audit v4

Status: **ENGINEERING GREEN, pending external deployed-endpoint invocation from an unrestricted network**
Date: 2026-09-09

## Canonical standard
Risk-Gated Adversarial Validation (RGAV): prove behavior by direct evidence, attack highest-risk failure first, preserve known-good behavior, rerun historical failures, and require two consecutive Green passes.

## Production work completed
- Existing Arc Supabase project reused. No new paid project created.
- `private.teaching_sessions` created in a non-exposed schema.
- `anon` and `authenticated` have no table privileges on the session store.
- Teaching-session Edge Function deployed.
- Teacher actions require a valid Supabase user access token and owner match.
- Smart Board join requires only an 8-character room code.
- Successful join yields an opaque per-session channel key used for subsequent sync.
- Room display receives only the sanitized `room_projection`.
- Teacher state and private notes are absent from join/sync queries.
- Sessions expire after 12 hours; ended/expired data is purged opportunistically.
- Smart Board client committed as `public/teaching-room.html`.
- Teacher transport adapter committed as `src/teaching/liveSessionTransport.ts`.
- Display polls approximately every 900 ms. Timer countdown uses an absolute `endsAt` value and runs locally between polls.

## Privacy boundary
The room projection may contain released lesson content, step indices, room mode, clock/layout, timer state, and public pass state. It does not contain teacher quick notes, teacher-only pass student name, planner state, teacher identity, or teacher authentication credentials.

## Adversarial network-contract circuit
Run A: **25/25 GREEN**
Run B: **25/25 GREEN**

Coverage included room-code generation, join, private-state omission, invalid room rejection, stale channel rejection, pass sanitization, timer, blank/restore, hold/release separation, 50 rapid updates, reconnect, two displays, owner isolation, malformed input clamps, step/text caps, allowlisted room/layout state, expiry, and end-of-session invalidation.

## Database/security evidence
- Session table is in `private`, not `public`.
- Explicit grants inspection showed no `anon` or `authenticated` privileges.
- Supabase security advisor produced no finding against the new teaching-session table.
- Existing unrelated project warning: leaked-password protection is disabled.
- Existing unrelated performance warning: `public.beta_allowlist` has an auth RLS initplan optimization opportunity.
- New session indexes are currently reported as unused, expected before traffic.

## Runtime limitation of this audit environment
The local container cannot resolve external DNS for the Supabase project host, and Chromium blocks localhost navigation/fetch. Therefore the deployed Edge Function could not be invoked end-to-end from this container. Deployment status, source, DB schema, grants, and advisors were verified through the connected Supabase control plane, while the client/server contract was exercised locally twice.

This is not being mislabeled as a completed live-network field test. The first unrestricted browser pair must verify authenticated teacher start, Smart Board join, sync cadence, refresh/rejoin, update propagation, and session-end propagation.

## Release judgment
**B04 visibility/control: GREEN locally and contract-tested twice.**  
**B05 continuity/reconnect: GREEN locally and contract-tested twice.**  
**Cross-device production architecture: IMPLEMENTED.**  
**External field invocation: YELLOW until one unrestricted browser pair hits the deployed endpoint.**

Brand/reskin remains intentionally paused. The upper-left identity area stays reserved and empty.
