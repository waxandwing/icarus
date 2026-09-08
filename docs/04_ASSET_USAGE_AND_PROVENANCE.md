# ARC — Asset Usage and Provenance

## Included assets

The package contains 21 recreated asset families in editable SVG and rendered PNG. They cover the Arc mark, planner paper, calendar shell surface, closed/open edge furniture, Unit/Lesson/Note forms, the Important circle, utility marks, decorative Fridge artwork, surface textures, tab icons, creation accents, and drawer-entry reference.

Use `asset-manifest.csv` for file mapping and `asset-metadata.json` for dimensions, notes, palette, and provenance.

## Re-render rule

Retain the established Arc palette, tactile-editorial character, object roles, and edge-furniture composition. Minor adjustments are permitted for responsive behavior, accessibility, optimization, seamless tiling, antialiasing, contrast, and clean attachment to live UI regions. Do not reinterpret the family into a different design language.

## SVG and PNG

- Prefer SVG for marks, silhouettes, furniture surfaces, and scalable decorative geometry.
- Prefer PNG for environments or textures when raster rendering is more reliable.
- Optimize copies for production but keep the supplied SVG masters unchanged.
- PNGs are rendered at high density from the corresponding SVG masters.
- Decorative images should use empty alt text when they convey no unique information.
- Semantic labels and states always live in code.

## Prohibited baked content

Never bake dates, course names, Unit/Lesson/Note text, settings labels, tasks, input values, focus/hover/selected states, contextual toolbars, or accessibility labels into artwork.

## Provenance

These replacement assets were created from scratch on September 8, 2026 from functional descriptions and the established color palette. No Canva export or Figma vector was used as source geometry. The old materials may be consulted to understand product roles, but must not be traced or copied into production masters.

Before commercial release:

- Perform a trademark review for the Arc name and mark.
- Record any agency modifications and authorship.
- Retain editable masters, exports, dates, prompts/briefs, and approvals.
- Confirm that any added font, icon, photograph, texture, or illustration permits commercial software use.

