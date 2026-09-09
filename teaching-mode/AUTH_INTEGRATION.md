# Arc Teaching Mode — Authentication Integration

Status: HEADLESS AUTH + CONTROLLER SEAM IMPLEMENTED
Date: 2026-09-09

## Decision
Arc's browser client uses Supabase Auth with `@supabase/supabase-js` pinned to 2.107.0.

The browser-safe Arc project URL and current publishable key are configured in `src/lib/supabaseClient.ts`; `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` may override them per environment. No secret/service-role key belongs in the browser bundle.

## Session contract
- `getArcSession()` reads the persisted browser session.
- `getArcAccessToken()` returns the raw access token only for forwarding to the Teaching Session Edge Function.
- `verifyArcUser()` calls Supabase Auth to validate the signed-in user when identity verification is required.
- `onArcAuthStateChange()` exposes login/logout/token refresh changes to the React shell.
- `signInArcTeacher()` and `signOutArcTeacher()` provide the auth seam without imposing a new visual gate.

## Teaching Controller
`src/teaching/teachingController.ts` is the teacher-authority boundary for the UI. It obtains the current Arc access token internally and exposes start, resume, update, roster, pass start/return, active passes, and end.

UI components therefore do not need to carry or manually thread JWTs through event handlers.

Private teacher state contains section/lesson/class context, quick notes, and teacher-only pass identity. Room projection remains a separate sanitized object.

## Security boundary
- publishable key: browser-safe application identifier
- user JWT: signed-in teacher identity, short-lived and refreshable
- secret/service-role key: backend only, never committed to client code
- Smart Board: no teacher login and no teacher token
- Edge Function independently validates teacher JWT for teacher-authority actions

## Design-scope rule
No new login UI is committed. The auth seam remains headless until it can be integrated into the canonical Arc beta/access gate without redesigning that surface or broadening scope.

## Current gates
- Auth client source: GREEN
- Teaching Controller token boundary: GREEN
- Browser-safe publishable key configuration: GREEN
- Supabase roster/pass RLS advisor check: GREEN
- npm lock/build verification after dependency addition: YELLOW, lock must be regenerated on a trusted npm runner
- Live authenticated teacher happy path: YELLOW, requires a disposable signed-in teacher account
- B06 rendered/accessibility matrix: pending after the two yellow integration gates above

## Still required before production merge
1. Regenerate `package-lock.json` with a trusted npm install/build runner and run build + lint.
2. Integrate the headless auth seam into the existing Arc access/beta gate once that canonical gate is in scope.
3. Run authenticated `start → roster → pass → update → resume → end` against the live Edge Function with a disposable teacher account.
4. Run the B06 render/accessibility matrix twice.

## Supabase project security note
The post-schema security advisor reports no roster/Teaching Mode RLS finding. The project-level leaked-password-protection warning remains and is unrelated to this integration; it should be resolved before broad production auth rollout.

## Evidence discipline
Do not mark the authenticated happy path GREEN from source inspection alone. It becomes GREEN only after a real signed-in teacher token exercises the deployed endpoint end-to-end.

The current Supabase project contains no Arc class/student/enrollment/pass seed data. No fake roster was inserted to manufacture a passing UI state.

The Edge Function remains the authoritative ownership check for session/class/student operations; client-side class IDs and student IDs are never trusted on their own.

## Current integration batch
Source changes in this batch are feature-branch-only. `main` is intentionally untouched and PR #1 remains a review boundary rather than a deployment instruction.

No brand/logo/reskin decisions are included in this batch.

## Smart Board invariant
The classroom display continues to authenticate only with room code + opaque channel key. It never receives the teacher JWT, publishable client session, roster, or teacher-private notes.

## Pause invariant
Pause/blank classroom state remains a literal black screen. Authentication work must not alter that behavior.

## Dependency note
The old lockfile was removed because it did not contain the new Supabase dependency. This is intentionally YELLOW until a real npm runner regenerates and verifies it; a fabricated lockfile is not acceptable evidence.

## Resume invariant
Teacher refresh/re-entry must use the persisted Supabase browser session to obtain a fresh/current access token, then call the server `resume` action. Teaching Mode must not persist a duplicate JWT inside its own state.

## Live test prerequisites
The authenticated live contract test requires a disposable Supabase Auth teacher user plus a disposable Arc class/student/enrollment owned by that user. Test records must be removed after the run. Production/user roster data must not be used for this proof.

The test must also confirm that a second teacher cannot load the first teacher's roster, mutate the first teacher's session, or return the first teacher's pass event.

## Completion rule
Authenticated live GREEN #2 must be a repeat against unchanged source/backend. Any auth/session/roster/pass change after a green resets that gate.

After authenticated live GREEN #2, B06 still runs independently at all required viewport, keyboard, focus, zoom, reduced-motion, and classroom-display states. Network correctness does not waive visual/accessibility correctness.

## Next executable action
Run the package install/build/lint in an environment with npm registry access. Do not continue adding auth architecture while that evidence gate is outstanding.

The feature branch must be advanced to the final integration commit before execution. This file intentionally does not claim that has happened until the branch ref is actually moved.
