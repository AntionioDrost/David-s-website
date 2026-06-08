# CMP Labs Design Polish Plan

## Safety Status

- Current branch: `labs/nick-demo-design-polish-v2`
- Working tree before this pass: clean
- No push or commit planned
- No dependency install planned
- Allowed implementation scope: `dashboard-labs.css`, `dashboard-labs.html` if needed, `dashboard-labs.js` only if justified, `DESIGN_POLISH_PLAN.md`, `DESIGN_POLISH_REPORT.md`

## Key Visual Issues Found

- Decorative accent strips from the previous polish layer use full-width pseudo-elements without consistent clipping/inset rules, which can make green lines look like they escape rounded cards.
- Several hero and header panels still read pale and flat beside the richer LandlordOS landing-page treatment.
- CMP Autopilot, Ask CMP, next actions, and summary areas need more contrast and stronger "start here" hierarchy.
- Sidebar property chips are dense and can truncate awkwardly.
- Many cards share similar white surfaces, borders, and shadows, so priority areas do not stand out enough.
- Modals, drawers, toasts, evidence rows, task cards, and status tiles need a more coherent premium component language.

## Freeze / Performance Risks Found

- `dashboard-labs.js` has no scroll listeners, resize listeners, requestAnimationFrame loops, or setInterval loops.
- Smart upload uses short `setTimeout` sequences and clears them through `clearScanTimers()` when the modal opens/closes.
- Event listeners are registered at script load; many are delegated document click listeners, but there is no obvious repeated initialisation loop.
- CSS includes infinite Ask CMP shimmer/pulse animations and backdrop blur on modal/drawer overlays. These are plausible contributors to jank on weaker devices, so this pass will reduce or disable the most expensive effects.
- No clear single JS freeze bug was found during static inspection. The implementation will avoid adding heavy animated backgrounds, large blur filters, or expensive transitions.

## Design Direction

Create a premium Property Compliance Operating System feel:
- dark forest green command surfaces for flagship product moments,
- warm clean neutrals for supporting workspace panels,
- emerald and subtle amber accents for priority/status,
- stronger typography hierarchy,
- clipped, inset decorative strips inside rounded cards,
- practical enterprise dashboard density with richer focal areas,
- LandlordOS-inspired hero depth translated into an app workspace.

## Files Planned To Touch

- `dashboard-labs.css`: primary implementation
- `DESIGN_POLISH_PLAN.md`: this plan
- `DESIGN_POLISH_REPORT.md`: final report update

No HTML or JS edits are planned unless browser QA shows a layout/performance problem that CSS cannot safely solve.

## Milestones

1. Performance and freezing stability: reduce expensive CSS effects and keep motion restrained.
2. Fix visual defects: clip/inset accent lines and decorative pseudo-elements inside rounded containers.
3. Premium visual system v2: richer tokens, backgrounds, type rhythm, borders, shadows, radii, and focus rings.
4. Stronger premium feature areas: dark green Autopilot, Ask CMP, next actions, and summary surfaces.
5. App shell polish: sidebar, active nav, property switcher, assistant rail, workspace staging.
6. Main demo path polish: Home, Properties, Compliance Centre, Evidence Vault, Tasks, Activity, Ask CMP, Book a service, property tabs.
7. Showcase component: upgrade CMP Autopilot command card as the flagship visual component.
8. Component polish: buttons, tabs, pills, cards, modals, forms, toasts, hover/focus/disabled states.
9. Responsive and overflow hardening for 1440, 1280, 1024, 768, and 390 widths.
10. Final QA and report.

## Validation Plan

- Run `git diff --check`.
- Run `git status --short`.
- If `dashboard-labs.js` changes, run `node --check dashboard-labs.js`.
- Serve locally with `python3 -m http.server` if possible.
- Browser-test `dashboard-labs.html` where tooling is available.
- Capture screenshots at 1440, 1280, 1024, 768, and 390 widths if automated browser tooling works locally.
- Click through main demo surfaces and modals.
- Confirm no business logic, API, auth, routing, state, data, modal, upload, or support-request behaviour changed.
