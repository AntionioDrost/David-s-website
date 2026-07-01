# CMP Origin V2 Homepage Foundation

Static homepage prototype for CMP Origin V2.

## Scope

- Builds only the homepage inside `prototypes/cmp-origin-v2/`.
- Follows `CMP_ORIGIN_V2_HOMEPAGE_VISUAL_BLUEPRINT.md`.
- Uses copied optimized local assets from `prototypes/cmp-origin/assets/optimized/`.
- Does not build service pages, dashboards, account flows, payment flows, or real API lookups.

## Local Use

Open `index.html` directly in a browser, or serve the repository root with a local static server and visit:

`/prototypes/cmp-origin-v2/index.html`

## Validation

Run:

```bash
node --check prototypes/cmp-origin-v2/app.js
node prototypes/cmp-origin-v2/tools/cmp-origin-v2-homepage-check.mjs
git diff --check
```
