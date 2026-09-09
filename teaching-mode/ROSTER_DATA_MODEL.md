# Arc Teaching Mode — Roster & Student Event Data Model

Status: IMPLEMENTED FOUNDATION
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
- active/inactive state

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

## Privacy rule
Teacher controller may know the student identity associated with an active pass.

The classroom projection does not receive the roster or teacher-only student data. A display-safe pass state may show only intentionally public wording such as `PASS OUT` / `PASS AVAILABLE` unless a later product decision explicitly approves something else.

## Security
- RLS is enabled on all roster/event tables.
- `anon` receives no direct table privileges.
- `authenticated` receives CRUD privileges but RLS restricts every row to `auth.uid() = owner_user_id`.
- enrollment writes additionally verify that both referenced class and student belong to the same teacher.
- pass-event writes additionally verify class, student, and optional teaching session ownership.
- classroom display traffic continues through the sanitized Teaching Mode projection rather than roster tables.

## Current boundary
This migration establishes the data foundation. Production roster import UI, SIS synchronization, and broader student participation analytics are separate later features and should not be inferred from this schema.
