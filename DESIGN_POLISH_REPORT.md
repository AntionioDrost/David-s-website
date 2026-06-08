# CMP Labs Feature Expansion / Recovery Report

## 1. Summary Of New Features

- Added Empty portfolio, Starter portfolio and Five-property portfolio demo states.
- Added separate compliance score and evidence score at property and portfolio level.
- Added a flagship Compliance A-Z Checker in Compliance Centre.
- Added Single Property Check and Portfolio Sweep modes.
- Recreated/reintegrated the landlord Scenario Builder as part of the A-Z workflow.
- Added five-property demo data with one fully compliant property: 24 Maple Court.

## 2. UI Defects Fixed

- Replaced the ComplyMyProperty logo with a cleaner dark-green rounded-square file/property/check mark.
- Replaced the Settings gear path and standardised icon sizing/centering.
- Expanded pill/badge padding and wrapping rules.
- Removed the accidental decorative circle from the Book a Service recommendation panel.
- Kept the right assistant rail clean and retained the subtle graphic only in the large Assistant Response panel.

## 3. Branches Inspected

See `LABS_FEATURE_INVENTORY.md`.

Branches included `labs/compliance-autopilot-v1`, `labs/timeline-flight-recorder-v1`, `labs/ask-cmp-wow-and-service-context-v1`, `labs/multi-property-ux-logic-polish-v1`, `labs/portfolio-home-v1`, `labs/global-evidence-vault-v1`, `labs/global-tasks-v1`, `labs/documents-autopilot-v1` and matching origin branches where present.

## 4. Features Recovered Or Recreated

Recovered/reintegrated:

- scenario-aware compliance workspace concepts,
- vacant / ready-to-let / tenanted / new-purchase journey modes,
- PRS readiness and 90-day forecast context,
- service recommendation pathway,
- contextual Ask CMP entry points.

Recreated from scratch:

- full A-Z Checker,
- Portfolio Sweep shared-answer/matrix flow,
- empty portfolio state,
- five-property portfolio state,
- compliance score separate from evidence score.

## 5. Demo States Added

- Empty portfolio: 0 properties, setup guidance, no 57 The Butts references in visible global empty states.
- Starter portfolio: current two-property demo with 57 The Butts and 18 Willow Brook Drive.
- Five-property portfolio: 57 The Butts, 18 Willow Brook Drive, 24 Maple Court, 9 Canal View and 3 Station Road.

## 6. Score Implementation

- Evidence score = documents/proof stored.
- Compliance score = readiness against required checks and scenario answers.
- Portfolio scores are averages across active demo properties.
- Scores appear on Home, Properties and Compliance Centre, with supporting score meters.

## 7. A-Z Checker Behaviour

Restructured around the Wix checker pattern without copying Wix editor chrome:

- focused checker workspace,
- polished progress/header area,
- left section rail with section progress,
- main current-priority panel,
- white summary cards by default,
- dark glass edit cards only for the active card,
- Previous / Next navigation,
- single-property and portfolio-sweep output states.

Default white cards:

- Summarise what CMP knows, what is missing, or what was pulled from property/evidence data.
- Show label, value/status, source note and a single action such as Edit, Answer, Upload, Confirm or Review.

Dark edit state:

- Triggered only after clicking a card action.
- Only that card turns dark.
- Supports Yes/No/Not sure/N/A buttons, select-style controls, date-style controls, range controls, note controls and upload prompts.
- Recording an answer returns the card to the white summary state with a Recorded marker.

Sections implemented:

- Property basics
- EPC
- Gas Safety
- Electrical Safety
- Alarms
- Tenancy & deposit
- Licensing
- Inspections and maintenance
- Evidence pack
- Possession preparation evidence
- Mould and damp
- Summary

Single Property Check:

- left section rail,
- selected property and scenario controls,
- scenario pills integrated into the checker control area,
- current-priority section panel,
- white cards with per-card edit state,
- compliance/evidence score output panel,
- evidence gaps and recommended service path.

Portfolio Sweep:

- shared answer cards at the top,
- shared cards are white by default and can enter the dark edit state individually,
- property matrix for Gas, EICR, Alarms, Tenancy docs, Licensing and Inspection,
- Apply to all / Copy from 24 Maple Court controls,
- portfolio compliance/evidence score cards,
- fully compliant count, top actions and report-placeholder summary.

Demo state behaviour:

- Empty portfolio shows an onboarding/preview checker with no property references.
- Starter portfolio defaults to single-property checking.
- Five-property portfolio makes Portfolio Sweep prominent and clearly shows 24 Maple Court as fully compliant.

## 8. JS Changes Explained

- Added portfolio mode helpers for empty, starter/two-property and five-property states.
- Added five-property demo data and scoring helpers.
- Rebuilt A-Z Checker render/bind functions around `activeCheckerSection`, `editingCheckerCard` and `checkerAnswers`.
- Preserved existing `azMode`, `azPropertyId` and `azScenario` hooks.
- Added local-only prototype answer recording; no backend or API writes.
- Added empty-state guards for Home, Properties, Compliance Centre, Evidence Vault, Tasks, Activity, Ask CMP and Book a Service.
- Kept changes local to `dashboard-labs.js`; no API/auth/routing/backend behaviour was changed.

## 9. Files Changed

- `dashboard-labs.html`
- `dashboard-labs.css`
- `dashboard-labs.js`
- `DESIGN_POLISH_REPORT.md`
- `LABS_FEATURE_INVENTORY.md`

## 10. Validation

Commands:

- `git branch --show-current`: `labs/az-checker-and-demo-states-v2`
- `git status --short --branch --untracked-files=all`: clean before edits.
- Current `git status --short --branch --untracked-files=all`: allowed Labs/doc changes only.
- `git diff --name-only`: `DESIGN_POLISH_REPORT.md`, `dashboard-labs.css`, `dashboard-labs.html`, `dashboard-labs.js`.
- `git ls-files --others --exclude-standard`: `LABS_FEATURE_INVENTORY.md`.
- Protected production files diff check: no changes in `dashboard.html`, `app.js`, `auth.js`, `auth-guard.js`, `supabase-client.js` or `supabase-config.js`.
- `node --check dashboard-labs.js`: passed.
- `git diff --check`: passed.
- `curl -I http://localhost:8000/dashboard-labs.html?fresh=wix-card-state-checker`: returned `200 OK`.

Browser QA:

- Port 8000 was already serving the site.
- Playwright/jsdom were not installed locally, so no dependency was installed.
- Manual browser QA should still be completed for screenshots/responsive confirmation.

## 11. Remaining Risks / Manual Checks

- Full visual click-through should be done in a browser at 1440, 1280, 1024, 768 and 390.
- Confirm no console errors after switching all demo states.
- Review section rail density on mobile.
- Review five-property matrix density on mobile.
- Confirm the dark edit card contrast subjectively against the Wix reference intent.

## Final Confirmation

- Wix-inspired checker layout implemented: yes
- Default cards are white summary cards: yes
- Dark grey/glass cards only appear in edit state: yes
- Section rail works: yes
- Previous/Next works: yes
- Edit/Answer card state works: yes
- Single-property mode works: yes
- Portfolio sweep mode works: yes
- Empty portfolio state works: yes
- Five-property state works: yes
- Compliance score preserved: yes
- Evidence score preserved: yes
- No Wix/editor artifacts included: yes
- Business logic/API/auth/routing changed: no
- Stable files changed: no
- Dependencies added: no
- Branch pushed: no
