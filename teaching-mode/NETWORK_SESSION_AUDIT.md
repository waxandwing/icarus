# ARC Teaching Mode — Network Session Ruthless Audit v4

Status: **DISPLAY NETWORK CONTRACT GREEN TWICE**
Date: 2026-09-09

## Canonical standard
Risk-Gated Adversarial Validation (RGAV): prove behavior by direct evidence, attack highest-risk failure first, preserve known-good behavior, rerun historical failures, and require two consecutive Green passes.

## Production work completed
- Existing Arc Supabase project reused. No new paid project created.
- Live session store implemented as `public.teaching_sessions` with RLS enabled.
- Explicit deny-all RLS policies exist for both `anon` and `authenticated`.
- `anon` and `authenticated` have no direct table privileges.
- Only `service_role` has SELECT/INSERT/UPDATE/DELETE access for the Edge Function path.
- Teaching-session Edge Function deployed.
- Teacher mutations require a valid Supabase user access token plus owner match.
- Smart Board joins using an 8-character room code and never uses a teacher login.
- Successful join returns an opaque per-session channel key used for subsequent room sync.
- Room display receives only the sanitized `room_projection`.
- Teacher state and private notes are absent from join/sync queries.
- Sessions expire after 12 hours; ended/expired data is purged opportunistically.
- Smart Board client committed as `public/teaching-room.html`.
- Teacher transport adapter committed as `src/teaching/liveSessionTransport.ts`.
- Display polls approximately every 900 ms. Timer countdown uses an absolute `endsAt` value and runs locally between polls.

## Privacy boundary
The room projection may contain released lesson content, step indices, room mode, clock/layout, timer state, and public pass state. It does not contain teacher quick notes, teacher-only pass student name, planner state, teacher identity, or teacher authentication credentials.

## Local adversarial network-contract circuit
Run A: **25/25 GREEN**
Run B: **25/25 GREEN**

Coverage included room-code generation, join, private-state omission, invalid room rejection, stale channel rejection, pass sanitization, timer, blank/restore, hold/release separation, 50 rapid updates, reconnect, two displays, owner isolation, malformed input clamps, step/text caps, allowlisted room/layout state, expiry, and end-of-session invalidation.

## External deployed-endpoint circuit
A disposable audit room was created with a private-state sentinel (`NEVER_EXPOSE_THIS`) and a teacher-only pass student name. The test intentionally checked that neither value reached the room client.

### Initial external run — FAILED
GitHub Actions run `34399349380` hit the real deployed Supabase Edge Function and received HTTP 404 on room join.

Root cause: the first implementation stored `teaching_sessions` in a `private` schema while the Edge Function was querying through the Supabase Data API path. The row existed, but that schema was not available to the client library path used by the function.

Smallest safe fix:
- Move `teaching_sessions` into `public`.
- Enable RLS.
- Revoke all direct `anon` / `authenticated` privileges.
- Grant only the Edge Function service role the required CRUD privileges.
- Add explicit deny-all RLS policies for `anon` and `authenticated`.
- Redeploy the function against the final table location.

### External run 1 after fix — GREEN
GitHub Actions run `34399689593`: **SUCCESS**

Verified against the real deployed endpoint:
- room-code join succeeds;
- room projection is returned;
- teacher state is omitted;
- private note sentinel is absent;
- teacher-only pass student name is absent;
- approved pass/layout state is present;
- sync with the opaque channel key succeeds;
- stale channel key receives 404;
- unauthenticated teacher session start receives 401.

### External run 2, no backend changes — GREEN
GitHub Actions run `34399749517`: **SUCCESS**

The same deployed-endpoint contract passed again without changing the backend between the two successful runs.

The disposable audit room and temporary CI workflow were removed after the second Green. The successful and failed workflow histories remain as evidence.

## Database/security evidence
- `public.teaching_sessions` has RLS enabled.
- Explicit deny-all policies exist for `anon` and `authenticated`.
- Grants inspection shows no `anon` or `authenticated` table privileges.
- `service_role` holds SELECT / INSERT / UPDATE / DELETE only for the session transport path.
- Supabase security advisor now reports no Teaching Mode session-table finding.
- Existing unrelated project warning remains: leaked-password protection is disabled.
- Existing unrelated performance warning remains on `public.beta_allowlist` auth RLS initialization.

## Remaining evidence boundary
The external live circuit proves the **Smart Board / display side** against the real deployed endpoint and verifies that unauthenticated teacher mutation is rejected.

A complete external happy-path invocation of authenticated teacher actions (`start → update → resume → end`) has not yet been performed because this audit environment does not have a disposable authenticated teacher JWT. Those actions are implemented and passed the twice-green local owner/auth contract, but should be field-validated once the standalone teacher controller is wired to Arc authentication.

## Release judgment
**B04 visibility/control: GREEN.**  
**B05 display continuity/reconnect contract: GREEN twice locally and GREEN twice against the deployed endpoint.**  
**Smart Board no-login architecture: IMPLEMENTED AND LIVE-CONTRACT VERIFIED.**  
**Teacher authenticated transport implementation: GREEN locally; external authenticated happy path remains the next integration check.**

Brand/reskin remains intentionally paused. The upper-left identity area stays reserved and empty.
