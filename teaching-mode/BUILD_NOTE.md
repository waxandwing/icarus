# Dependency note

`@supabase/supabase-js` is pinned in `package.json` at `2.107.0`.

The previous npm lockfile predated this dependency. It was removed rather than leaving a stale dependency graph that could falsely imply a reproducible build.

## Required before merge
Run a trusted npm install/build runner, regenerate `package-lock.json`, commit it, then run build + lint + the Teaching Mode regression suite. Until that happens, the dependency/build gate is YELLOW even though the source integration is complete.

Do not merge this branch to `main` while this gate is yellow.
