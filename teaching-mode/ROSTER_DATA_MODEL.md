# Arc Teaching Mode — Roster & Student Event Data Model

Status: IMPLEMENTED FOUNDATION + CONTROLLER CONTRACT
Date: 2026-09-09

## Ownership model
Roster data belongs to Arc, not to the classroom display.

Teacher → Classes → Enrollments → Students

Teaching Mode receives only the roster for the active class. The Smart Board client never queries roster tables directly.

## Tables

### `public.arc_classes`
Persistent teacher-owned classes.
- teacher owner
- class name / course name
- period label
- school year
- source (`manual`, `import`, future `sis`)
- optional external class ID
- optional `arc_section_id` linking the class to a stable Arc planner section
- active/inactive state

`arc_section_id` is the automatic Day → Teaching Mode handoff key. A teacher should not need to choose the class again when Arc already knows which section is being taught.

### `public.arc_students`
Persistent teacher-owned student records.
- first name
- last name
- preferred name
- optional external student ID
- active/inactive state

### `public.arc_enrollments`
Membership between classes and students.
- class
- student
- active / inactive / withdrawn
- joined / left timestamps

A roster edit changes enrollment state. It does not rewrite historical classroom events.

### `public.arc_pass_events`
Historical bathroom/pass event record.
- teacher owner
- class
- student
- optional Teaching Mode session
- departed time
- returned time
- status (`out`, `returned`, `cancelled`)

Only one open pass event is allowed per student at a time.

### `public.teaching_sessions.class_id`
Teaching sessions can now be attached to the Arc class they are running.

## Teacher API contract
The deployed `teaching-session` Edge Function now supports authenticated teacher-side actions for:
- start session with `classId` or Arc `sectionId`
- resume active session
- load the active class roster
- list active passes
- start a pass only for a student actively enrolled in the session class
- mark a pass returned
- update teacher state + sanitized room projection
- end session

The frontend transport lives in `src/teaching/liveSessionTransport.ts`.
The orchestration boundary lives in `src/teaching/teachingSessionController.ts`.

The controller takes the authenticated Arc access token from its caller. It does not manufacture, persist, or infer authentication credentials.

## Privacy rule
Teacher controller may know the student identity associated with an active pass.

The classroom projection does not receive the roster or teacher-only student data. A display-safe pass state may show only intentionally public wording such as `PASS OUT` / `PASS AVAILABLE` unless a later product decision explicitly approves something else.

When the classroom is paused or blanked, the Smart Board renders a pure black viewport with no Arc label, status text, clock, pass state, connection status, or other visible chrome.

## Security
- RLS is enabled on all roster/event tables.
- `anon` receives no direct table privileges.
- `authenticated` receives only required CRUD privileges and RLS restricts every row to `auth.uid() = owner_user_id`.
- enrollment writes additionally verify that both referenced class and student belong to the same teacher.
- pass-event writes additionally verify class, student, and optional teaching session ownership.
- the server validates active enrollment before opening a pass event.
- classroom display traffic continues through the sanitized Teaching Mode projection rather than roster tables.
- current Supabase security advisor reports no roster/Teaching Mode RLS warning. The only remaining project security warning is the unrelated account-level leaked-password-protection setting.

## Current boundary
The production data/controller contract is now ready for Arc authentication handoff. The current local Arc prototype repository does not yet contain a Supabase authentication client, so a real teacher JWT cannot be fabricated inside this branch. Final live proof remains:

Arc authenticated session → Start Teaching → section resolves to class → roster loads → pass event → Smart Board state → controller refresh/resume → end.

Production roster import UI, SIS synchronization, and broader student participation analytics remain later features and should not be inferred from this schema.
