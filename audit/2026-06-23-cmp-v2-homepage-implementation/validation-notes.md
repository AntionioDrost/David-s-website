# Validation Notes

## Browser Path

- Local static server used for validation: `python3 -m http.server 4173`.
- Browser runner: installed Google Chrome via DevTools Protocol.
- After URL: `http://127.0.0.1:4173/index.html`.
- Before screenshots were generated from a temporary copy of `visual/cmp-wix-public-alignment-v1` files under `/tmp`.
- `browser-validation-report.json` records `overallStatus: pass`.

## Required Viewports

- Desktop: `after-desktop-1440x1000.png`
- Tablet: `after-tablet-1024x900.png`
- Mobile: `after-mobile-390x844.png`

## Checks Recorded In `browser-validation-report.json`

- No horizontal overflow: pass at 1440, 1024, and 390 widths.
- Primary CTA visible in first viewport: pass at 1440, 1024, and 390 widths.
- First-viewport tap targets: pass, no below-44px controls reported.
- Reduced motion: pass.
- Contrast sanity: pass for hero H1, hero body copy, primary CTA, principles strip, and dark human copy.

## Static Checks Re-run In This Session

- `node --check public-pages.js`: pass.
- `node audit/2026-06-23-cmp-v2-homepage-implementation/protected-hook-check.mjs`: pass, 36/36.
- `node audit/2026-06-23-cmp-v2-homepage-implementation/homepage-browser-audit.mjs`: pass.
