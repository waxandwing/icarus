# Dependency note

`@supabase/supabase-js` is pinned in `package.json` at `2.107.0`.

The previous npm lockfile predated this dependency. It was removed rather than leaving a stale dependency graph that could falsely imply a reproducible build.

## Required before merge
Run a trusted npm install/build runner, regenerate `package-lock.json`, commit it, then run build + lint + the Teaching Mode regression suite. Until that happens, the dependency/build gate is YELLOW even though the source integration is complete.

Do not merge this branch to `main` while this gate is yellow.

## Exact commands for the trusted runner
```sh
npm install
npm run build
npm run lint
```

Commit the regenerated `package-lock.json` only after those commands complete successfully.

This branch deliberately does not introduce a new visual login screen. Authentication must enter through the canonical Arc access gate when that surface is integrated.
