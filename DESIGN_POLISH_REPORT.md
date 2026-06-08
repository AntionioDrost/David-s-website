# CMP Labs QA Repair Report

## 1. Regressions Found

- Demo state opened through the original hook, but the modal could appear misplaced because the overlay CSS was being overridden by the v2 card polish layer.
- Demo guide had the same overlay positioning risk.
- Smart Upload, Evidence Vault preview, timeline, service request and related wireframe modals could appear low or partly off-screen instead of fixed and centred.
- Drawer and modal decorative layers needed hardening so they could not block clicks.

## 2. Root Cause

The v2 visual polish accidentally applied premium card treatment to overlay components:

- `.smart-modal`
- `.timeline-modal`
- `.drawer-panel`

Those rules introduced `position: relative`, `overflow: hidden` and `isolation: isolate` to elements that depend on fixed overlay positioning, internal scrolling and predictable z-index layering. That made modal content look like a normal card in the document flow instead of a fixed, usable dialog.

## 3. Files Changed

- `dashboard-labs.css`
- `DESIGN_POLISH_REPORT.md`

No HTML changes were made. No JavaScript changes were made.

## 4. CSS / HTML / JS Change Summary

- CSS changed: yes
- HTML changed: no
- JavaScript changed: no

The repair is CSS-only.

## 5. What Was Fixed

- Restored fixed overlay architecture for `.smart-modal` and `.timeline-modal`.
- Re-established modal/backdrop z-index layers.
- Restored centered desktop modal positioning.
- Added mobile bottom-sheet positioning for modal usability on narrow screens.
- Restored modal internal scrolling with `overflow-y: auto`.
- Removed overlay isolation side effects by overriding modal/drawer `isolation` back to `auto`.
- Ensured modal, timeline and drawer pseudo-elements use `pointer-events: none`.
- Kept drawer/backdrop click behaviour available by preserving active pointer events on the backdrop.

## 6. Premium Styling Preserved

- Dark green CMP Autopilot command card.
- LandlordOS-inspired darker green feature surfaces.
- Polished cards, buttons, tabs, sidebar and assistant rail styling.
- Inset/clipped accent treatments on cards.
- Reduced-motion and lower-cost visual effects from the v2 polish pass.

## 7. Styling Removed Or Simplified

- The repair neutralises the broad v2 card treatment on fixed overlays where it conflicted with dialog positioning.
- It avoids treating modals as ordinary clipped cards.
- Decorative pseudo-elements on modal and drawer surfaces are explicitly non-interactive.

## 8. Browser QA: Demo State And Demo Guide

Browser QA was run against:

`http://localhost:8000/dashboard-labs.html?fresh=qa-repair`

Desktop QA at 1440px:

- Demo state button opened the modal through `data-demo-state-open`.
- Demo state modal was visible, fixed, centred and usable.
- Demo state "Two-property portfolio" option changed the visible service recommendation to "Arrange Gas Safety renewal first".
- Demo guide button opened the modal through `data-demo-guide-open`.
- Demo guide modal was visible, fixed, centred and usable.
- Demo guide close button hid the modal successfully.
- No console errors were captured.

Responsive overlay QA:

- 1440px: no horizontal overflow, guide usable.
- 1280px: no horizontal overflow, guide usable.
- 1024px: no horizontal overflow, guide usable.
- 768px: no horizontal overflow, guide usable.
- 390px: no horizontal overflow, guide usable.

## 9. Browser QA: Modal / Upload / Drawer Flows

Automated browser click-through confirmed:

- Home
- Properties
- Compliance Centre
- Evidence Vault
- Tasks
- Activity
- Ask CMP
- Book a service
- Learn
- Settings
- Add Property modal
- Review next action / workspace flow
- Ask CMP why this matters
- Summary prompt chips
- Cards / Compact toggle
- Property tabs
- Smart Upload / document preview modal
- Evidence Vault upload / preview flow
- Timeline summary modal
- Service request modal
- Gas Safety support request in two-property demo state
- Ask CMP drawer open/close
- Mobile menu

Observed overlay results:

- Demo state modal: `position: fixed`, z-index `100`, visible and inside viewport.
- Demo guide modal: `position: fixed`, z-index `100`, visible and inside viewport.
- Service request modal: `position: fixed`, z-index `100`, visible and inside viewport.
- Smart Upload modal: visible and usable after the repair.
- Timeline modal: visible and usable after the repair.
- Ask CMP drawer/rail: visible and usable.

Gas Safety upload note:

- `Upload Gas Safety certificate` preserves the existing prototype behaviour: it shows the preview-only toast rather than opening a document modal. No JS was changed.

## 10. Validation Commands

- `git diff --check`: passed.
- `git status --short --untracked-files=all`: confirmed only allowed files changed before report update.
- `node --check dashboard-labs.js`: not run because JavaScript was not changed.

## 11. Remaining Manual Checks

- Re-test the exact machine/browser Nick will see, especially at the projected demo screen size.
- Click through service request duplicate prevention manually after creating a support request.
- Manually test real file picker behaviour, because automated headless QA does not interact with the OS picker.
- Re-check any freeze reports in DevTools Performance if freezes still appear; this repair did not identify or require a JS freeze fix.

## 12. Suggested Demo Path For Nick

1. Start on Home and explain the portfolio command centre.
2. Show the dark green CMP Autopilot recommendation.
3. Use Demo state to switch to the two-property portfolio.
4. Open Book a service and show Gas Safety as the first portfolio support priority.
5. Open the service request modal and close it.
6. Open Evidence Vault and show the Smart Upload / preview flow.
7. Open Ask CMP and show the assistant context.
8. Return to Compliance Centre for portfolio-level confidence.

## Final Confirmation

- Demo state working: yes
- Demo guide working: yes
- Modals centred and usable: yes
- Evidence Vault / Smart Upload usable: yes
- Business logic changed: no
- API contracts changed: no
- Auth changed: no
- Routing changed: no
- State management changed: no
- JavaScript changed: no
- Dependencies added: no
- Files outside allowed scope changed: no
- Branch pushed: no
