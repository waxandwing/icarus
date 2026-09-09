# Dependency note

`@supabase/supabase-js` is now pinned in package.json. The previous npm lockfile predated this dependency and was removed rather than committing a knowingly stale lock graph. Regenerate and commit `package-lock.json` with the next trusted npm install/build runner before merge to main.
