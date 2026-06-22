# CMP V2 Homepage Implementation Notes

## Scope

Implemented the selected public hybrid V2 aesthetic on the public homepage only.

Production code changes were limited to:
- `public-pages.js`
- `landing.css`
- `assets/generated/public-homepage-v2/`

Audit artifacts were written to:
- `audit/2026-06-23-cmp-v2-homepage-implementation/`

## Source Reference

Design source:
`/Users/davidtaylor/Desktop/VIBECODE/CMP-art-direction-lab/design-artifacts/cmp-selected-public-hybrid-v2/`

Confirmed design lab commit:
`a596873887749880989b6529cddc9a9d0bf65872`

Referenced:
- `CMP_SELECTED_HYBRID_V2_CONTACT_SHEET.html`
- `CMP_V1_V2_COMPARISON.md`
- `CMP_SELECTED_HYBRID_V2_SCORECARD.json`
- `CMP_V2_IMAGE_PROVENANCE.md`
- `homepage/index.html`
- `shared/tokens.css`
- `shared/components.css`

## Implementation Summary

- Replaced the homepage renderer with a V2 editorial homepage shell.
- Added refined home-only CMP wordmark/navigation output.
- Added light editorial hero copy and readable Property Brain product proof.
- Added factual principles strip.
- Added three ways to begin: Check a property, Request one service, Continue from My Properties.
- Added evidence-to-action loop.
- Added curated service preview using existing `SERVICE_CONFIG` routes.
- Preserved the postcode form id, input id, input name and Add Property handoff.
- Added human support/resources and final company-depth CTA sections.
- Copied approved generated concept images into `assets/generated/public-homepage-v2/` with provenance.

## Deliberately Not Touched

- `core/`
- `dashboard-labs.*`
- `app.js`
- `journey-context.js`
- Supabase/auth files
- Add Property logic
- My Properties logic
- service journey/storage logic
- Netlify files
- `/Users/davidtaylor/Code/mysite`

## Validation

Commands run:
- `node --check public-pages.js`
- `node audit/2026-06-23-cmp-v2-homepage-implementation/protected-hook-check.mjs`
- `node audit/2026-06-23-cmp-v2-homepage-implementation/homepage-browser-audit.mjs`

Browser validation covered:
- desktop screenshot: 1440x1000
- tablet screenshot: 1024x900
- mobile screenshot: 390x844
- no horizontal overflow
- primary CTA visible on mobile first viewport
- first-viewport tap targets at least 44px
- reduced-motion CSS support
- contrast sanity for key text/CTA surfaces

## Caveats

The copied V2 photography assets are concept/prototype assets. The copied `CMP_V2_IMAGE_PROVENANCE.md` states they should be replaced or relicensed before production launch unless CMP confirms ownership and rights.
