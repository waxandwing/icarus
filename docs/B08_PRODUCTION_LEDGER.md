# B08 — Persistence + Authenticated State Integrity — Production Ledger

Status: ACTIVE / NOT YET GREEN

Implementation target: `waxandwing/icarus`
Branch: `b08/authenticated-persistence`
Deployment: NOT AUTHORIZED FROM B08

## Verified starting risk

The prior `icarus` runtime persisted one IndexedDB snapshot under a global `current` key and had no authenticated/account-keyed persistence boundary. That state could not satisfy B08 account isolation or sign-back-in continuity.

## Completed material work

- Added authenticated Supabase browser boundary using the browser-safe publishable key; no service-role secret is present in client code.
- Explicit normal sign-out scope is `local`.
- Replaced global local snapshot ownership with account-keyed IndexedDB cache keys.
- Added Supabase `arc_workspaces` remote backing while preserving local-first continuity.
- Added explicit legacy `current` snapshot claim/decline flow rather than silently attaching pre-auth work to an account.
- Added stale-account guards around asynchronous load/save/migration work.
- Added malformed-cloud fail-closed handling so unknown remote payloads cannot be mistaken for an empty cloud row and overwritten.
- Added one persistence envelope for canonical domain, Undo/history snapshot, durable calendar view, anchor date, and open furniture state.
- Added native email/password sign-in fields with browser autofill/password-manager semantics.
- Added normal account sign-out in Settings without altering calendar composition.
- Added deterministic auth-boundary and workspace-envelope unit tests.
- Added a non-deploying direct Chromium hostile A/B account circuit with rendered evidence retention.

## Live Supabase security evidence

Migration `harden_arc_workspaces_client_grants` applied to project `jnbppgjkzzuquhenaqtq`:

- `anon`: no privileges on `public.arc_workspaces`.
- `authenticated`: SELECT / INSERT / UPDATE only.
- browser roles no longer hold DELETE / TRUNCATE / TRIGGER / REFERENCES.
- owner-bound RLS remains enabled.
- account A own-row SELECT: allowed.
- account A own-row UPDATE: allowed.
- account A cross-row SELECT against account B: zero rows.
- account A cross-row UPDATE against account B: zero rows.
- anonymous SELECT: database `42501 permission denied`.
- owner reassignment A → B: database `42501` RLS violation.

## Verification history

- Exact head `ac82b995303784f2eff65477c5cc5ca5668616bb`: lint PASS; 14 inherited tests PASS; production build PASS.
- Later B08 unit expansion: 21 tests PASS on the direct-browser candidate; production build PASS before browser execution.
- First direct-Chromium attempt was a harness-only RED: Chrome process launched but DevTools endpoint was not reachable. No Arc product Green was claimed. The harness was changed to make Chromium launch diagnostics visible and add explicit remote-debug allowances.

## Green blockers remaining

- Direct Chromium hostile account circuit must pass on the final unchanged material head.
- Rendered 390px auth and 1280px restored-workspace evidence must be inspected for professional-interface quality, clipping, malformed objects, typography, and frozen-shell regressions.
- B08 primary and meaningfully independent second audit must both pass after the final material change.
- Bounded neighboring/frozen regression verification must pass for B01–B07 semantics affected by persistence/auth changes.
- Only after all above evidence is clean may B08 be marked Green and merged.

## Release boundary

B08 Green does not authorize deployment. B09–B12 and the full release-readiness gates remain downstream. The founder-authorized single deployment is reserved for the complete release candidate.
