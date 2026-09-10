# Arc Teaching Mode — Functional Beta Audit

## Result

- Strict Run A: **46/46 GREEN**
- Strict Run B: **46/46 GREEN**
- Consecutive-green requirement: **MET**
- Functional baseline frozen before reskin: `ARC_TEACHING_MODE_FUNCTIONAL_GREEN_BASELINE_v2.html`

## Failures found and fixed before green

- Projector/classroom display inherited app padding and overflowed the viewport by 44px at every tested projector size. Room view now becomes a fixed viewport surface.
- Initial automated navigation checks were case-sensitive against visual uppercase treatment; behavior was correct and harness was corrected rather than changing product behavior.
- The environment blocks browser navigation to local/file URLs. The beta harness therefore renders the exact HTML directly in Chromium and uses the build’s test-only storage fallback to exercise persistence/re-entry without weakening production localStorage behavior.

## Coverage

- [x] launch_has_eligible_start
- [x] session_started
- [x] duplicate_session_prevented
- [x] no_native_prompt_alert
- [x] advance_deterministic
- [x] release_matches_current
- [x] hold_state
- [x] advance_does_not_release_held_content
- [x] reentry_shows_resume
- [x] reentry_restores_step
- [x] reentry_restores_hold
- [x] note_persists
- [x] disconnect_explicit
- [x] controller_works_disconnected
- [x] reconnect_explicit
- [x] keyboard_previous
- [x] keyboard_release
- [x] keyboard_hold
- [x] keyboard_note_focus
- [x] critical_hit_targets_44px
- [x] keyboard_focus_visible
- [x] end_has_confirmation
- [x] end_recoverable
- [x] returns_to_arc_surface
- [x] outcome_payload_saved
- [x] render_390x844_no_horizontal_scroll
- [x] room_390x844_privacy
- [x] render_768x1024_no_horizontal_scroll
- [x] room_768x1024_privacy
- [x] render_1024x768_no_horizontal_scroll
- [x] room_1024x768_no_vertical_scroll
- [x] room_1024x768_privacy
- [x] render_1280x720_no_horizontal_scroll
- [x] room_1280x720_no_vertical_scroll
- [x] room_1280x720_privacy
- [x] render_1366x768_no_horizontal_scroll
- [x] room_1366x768_no_vertical_scroll
- [x] room_1366x768_privacy
- [x] zoom_200_room_no_horizontal_scroll
- [x] zoom_200_room_content_present
- [x] render_1600x900_no_horizontal_scroll
- [x] room_1600x900_no_vertical_scroll
- [x] room_1600x900_privacy
- [x] render_1920x1080_no_horizontal_scroll
- [x] room_1920x1080_no_vertical_scroll
- [x] room_1920x1080_privacy

## Visual audit notes before reskin

- Desktop teacher control is functionally clear and stable, but still intentionally generic. It is not the final Arc skin.
- Mobile controller is usable but vertically long; this is acceptable for the pre-reskin functional gate, not the final interaction target.
- Classroom display is correctly quiet, content-first, private, and scroll-free at the tested projector sizes.
- Current visual treatment must not be treated as approved brand direction. The next branch should inherit Arc material/typographic/object language without altering the proven state machine.

## Reskin rule

Visual work must occur on a copy of the frozen baseline. Any functional change introduced during reskin resets the relevant green gate and must pass two consecutive runs again.
