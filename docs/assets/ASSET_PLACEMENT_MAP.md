# Arc asset placement map

Source: founder-uploaded image set, September 8, 2026.

The original PNG files are preserved in `docs/assets/source/`. Optimized WebP
renders used by the application live in `public/assets/arc/`. Dynamic dates,
labels, controls, object content, focus states, and accessibility semantics
remain live React/CSS.

| Asset | Current role |
| --- | --- |
| `calendar-open-planner` | Desktop calendar shell beneath live calendar content |
| `texture-wood` | Outer desk/environment only |
| `texture-cream-paper` | Responsive planner fallback and Settings surface |
| `texture-blue-paper` | Fridge furniture surface |
| `texture-mustard-paper` | Task Bar furniture surface |
| `fridge-notes-blue` | Subtle decorative Fridge-door background |
| `arc-mark-stacked` | Product mark in the planner header and loading/recovery states |
| `fridge-notes-cream` | Preserved alternate staging/empty-state decoration |
| `fridge-open-surface` | Preserved horizontal Fridge-surface variant; not stretched into the current vertical drawer |
| `settings-folder-cream` | Preserved Settings/folder silhouette for a later geometry-matching pass |
| `taskbar-folder-mustard` | Preserved Task Bar/folder silhouette for a later geometry-matching pass |
| `pattern-arc-geometric` | Setup/onboarding environment; intentionally absent from the everyday calendar |
| `onboarding-tell-us-about-your-day*` | Setup/onboarding composition variants; intentionally absent from the everyday calendar |

The three onboarding compositions contain baked headline copy. They may be
used only where that exact static setup composition is approved; they must not
replace live, editable interface content.
