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

Branch head for this integration batch should remain on `teaching-mode`; no production deploy and no merge to `main` are authorized by this work.

The build gate cannot be inferred from TypeScript source review. Record actual command output before changing YELLOW to GREEN.

Once dependency verification is green, the next executable gate is the real authenticated two-device contract run, followed by B06 twice.

The final reskin remains blocked until those functional gates are green twice.

Do not reintroduce the deleted pre-Supabase lockfile. A new lock must be generated from the updated package manifest.

Green means evidence, not intention.

Expected final sequence: dependency build green → authenticated live contract green twice → B06 green twice → reskin.

No Vercel, Lovable, or Replit is part of this verification path.

No visual change should be approved from this auth batch alone.
