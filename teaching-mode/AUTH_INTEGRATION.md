# Arc Teaching Mode — Authentication Integration

Status: AUTH + CONTROLLER SEAM IMPLEMENTED
Date: 2026-09-09

## Decision
Arc's browser client uses Supabase Auth with `@supabase/supabase-js` pinned to 2.107.0.

The public browser configuration uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. No secret/service-role key belongs in the browser bundle.

## Session contract
- `getArcSession()` reads the persisted browser session.
- `getArcAccessToken()` returns the raw access token only for forwarding to the Teaching Session Edge Function.
- `verifyArcUser()` calls Supabase Auth to validate the signed-in user when identity verification is required.
- `onArcAuthStateChange()` exposes login/logout/token refresh changes to the React shell.
- `signInArcTeacher()` and `signOutArcTeacher()` provide the minimal password-auth seam without dictating the final visual gate.

## Teaching Controller
`src/teaching/teachingController.ts` is now the teacher-authority boundary for the UI. It obtains the current Arc access token internally and exposes:
- start
- resume
- update
- roster
- start pass
- return pass
- active passes
- end

UI components therefore do not need to carry or manually thread JWTs through event handlers.

Private teacher state contains section/lesson/class context, quick notes, and teacher-only pass identity. Room projection remains a separate sanitized object.

## Teaching Mode handoff
The Teaching Controller receives the current access token from this auth layer. The Edge Function independently validates that token with Auth before any teacher-authority action.

`getSession()` is not treated as an authorization decision. It is used only to obtain the raw token for transport. Server-side authorization remains in the Edge Function.

## Security boundary
- publishable key: browser-safe application identifier
- user JWT: signed-in teacher identity, short-lived and refreshable
- secret/service-role key: backend only, never committed to client code
- Smart Board: no teacher login and no teacher token

## Still required before production merge
1. Supply the project's publishable key through the deployment environment.
2. Connect the existing Arc access/beta gate to `signInArcTeacher()` rather than creating a second competing login screen.
3. Run authenticated `start → roster → pass → update → resume → end` against the live Edge Function with a disposable teacher account.
4. Run the B06 render/accessibility matrix twice.
