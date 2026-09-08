# ARC — Content Migration and How-To

## What to migrate

- Current canonical product language and rules.
- Verified Course/Section/Unit/Lesson/Note domain behavior.
- Confirmed school-calendar source data and provenance.
- Verified tests that express current behavior.
- User-authored content and links.
- Approved or recreated assets from this package.

## What not to migrate blindly

- Component structure from historical branches.
- View-specific duplicated schedule state.
- Screenshots or baked calendar content.
- Archived terminology such as Easel when the current term is Live Classroom.
- Rejected build geometry.
- Canva SVG wrappers, unverified vectors, or uncertain raster textures.
- Historical instructions that conflict with the master operating document.

## How to use this package with Claude

1. Create a new Claude Project or development workspace.
2. Upload the entire unzipped package, preserving folder names.
3. Paste `CLAUDE_START_PROMPT.md` as the first instruction.
4. Require Claude to read files in the stated authority order before proposing code.
5. Ask for the Phase 1 vertical-slice plan and state invariants first.
6. Approve the plan before broad UI implementation.
7. Require screenshots and test evidence for every Green claim.
8. Keep each decision in a dated change log and reconcile changes back to the Master Operating Document.

## How to use this package with an agency

1. Send the ZIP as pre-read material.
2. Use the Executive Brief for discovery and the master documents for requirement traceability.
3. Ask the agency to identify every proposed deviation explicitly.
4. Require an architecture workshop focused on state identity, projections, persistence, and recovery—not only screens.
5. Contract the trusted vertical slice before the full build.
6. Make the acceptance gates part of the statement of work.
7. Require editable source files and documented asset provenance at handoff.

## Change control

Kelly's latest explicit decision wins. Update the Master Operating Document when a decision materially changes the product. Do not create another competing “current truth” file when an existing authority can be amended.

