# Ready For Nick Stabilised Demo

Date: 2026-06-17

## What Changed

- Reverted the committed Demo Theatre presentation layer back to the last stable guided route baseline before applying the simpler repair.
- Reframed the main path as **Guided first property setup** / **Start first property walkthrough**.
- Removed guided-tour arrows completely. The guided surface is now target ring plus one local tooltip.
- Integrated the macaw as a small badge in the tooltip header and removed the separate macaw speech bubble.
- Rebuilt the main guided route around one property: add property, Smart Search, confirm unknowns, build the workspace, then explain workspace tabs.
- Added the controlled workspace tab tour: Overview, Compliance, Evidence, Services, Timeline, Ask CMP, Monitoring.
- Kept Scenario Explorer behind a deliberate **Try another landlord situation** action until the first walkthrough lands.
- Hid the right Ask CMP rail until the Ask CMP step in strict guided mode.
- Fixed the condition **None** submit copy to say **Continue with no known issues**.
- Added card/grid width guards to avoid unreadable narrow columns.

## Main Route Readability

Ready with caveats. The route is much easier to follow than the Demo Theatre state: the user now starts with one property, follows one tooltip, sees one target, and only reaches scenarios after the workspace tour.

The remaining caveat is visual density in the underlying product shell. The guided mode quiets the rail and removes duplicate guide surfaces, but the workspace still contains the existing navigation shell and some dashboard content below the focused section.

## Arrows

Removed. No guided arrow elements are rendered, and the old arrow positioning function is intentionally inert.

## Tab Tour

Works. The guided route covers:

- Overview
- Compliance
- Evidence
- Services
- Timeline
- Ask CMP
- Monitoring

## Top 5 Remaining Issues

1. The workspace still inherits some dashboard density below the focused guided section.
2. The progress spine still uses some older product-stage labels rather than a fully bespoke workspace-tab progress model.
3. The guided top panel is compact and non-overlapping, but it still adds another visual band above the product.
4. Scenario cards are ordered and delayed, but their visual treatment is still closer to prototype cards than a polished commercial selector.
5. Mobile is stable with no horizontal overflow, but the first viewport remains tight because the product shell is still present.

## Verification

- `git diff --check`
- `for f in *.js tools/*.mjs; do node --check "$f" || exit 1; done`
- `node tools/cmp-nick-hardening-check.mjs`
- `node tools/cmp-guided-demo-repair-check.mjs`
- `node tools/cmp-guided-tour-overlay-check.mjs`

Screenshot review folder:

`audit/2026-06-17-cmp-guided-demo-stabilised/`
