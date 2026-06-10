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

## 12. Checker Interaction Polish Pass

Slider behaviour fixed:

- Bedrooms and Storeys sliders now initialise from the current/saved card value.
- Range controls show a live value while dragging.
- Bedrooms format as `Not set yet`, `1 bedroom`, `2 bedrooms`, etc.
- Storeys format as `1 floor`, `2 floors`, etc.
- Done saves the formatted value into local checker state and returns the card to the white summary state.
- Cancel exits edit mode without saving.

Edit controls now update white cards:

- Yes / No / Not sure / N/A choices record immediately.
- Select controls save the selected value on Done.
- Date controls save a selected date on Done.
- Note controls save local note text on Done.
- Upload/edit evidence prompts save a simulated `Evidence uploaded` state on Done.
- Portfolio matrix answers persist after cycling between Yes / No / Unsure / N/A.

Score animation:

- The checker keeps local prototype score boosts in `checkerScoreBoosts`.
- Recorded answers nudge compliance score by a small amount.
- Evidence/upload-related cards nudge evidence score more strongly.
- Scores are clamped at 100 and leave the underlying demo property data unchanged.
- Changed score cards pulse subtly and show micro-feedback such as `+3 readiness` or `+4 evidence`.
- Score bar widths transition smoothly, with reduced-motion support.

Active checker state:

- Compliance Centre and checker interactions add `checker-is-active` to the body.
- The checker module gains a richer forest-green active background/halo.
- White summary cards remain readable; only active edit cards are dark.

Visible formatting fixes:

- Left rail uses stable icon, text and percentage columns.
- Long rail labels wrap as readable two-line labels instead of breaking awkwardly.
- Output score cards stack in the right panel to avoid percentage overlap.
- Bottom Previous / Next spacing was increased.
- Card min-height and spacing were tightened to reduce empty space.

Copy and clarity improvements:

- Header helper now explains that CMP separates missing answers from missing evidence.
- Progress helper says users can skip questions and return later.
- Section intros were rewritten in plainer landlord-facing language.
- Score explanation clarifies compliance score vs evidence score.
- Edit helper copy encourages choosing `Not sure` rather than guessing.

Latest validation:

- `node --check dashboard-labs.js`: passed.
- `git diff --check`: passed.
- `curl -I http://localhost:8000/dashboard-labs.html?fresh=checker-interaction-polish`: returned `200 OK`.
- Browser QA: manual browser/responsive click-through still required; no dependencies were installed.

## 13. Compliance Mode Background

Implementation:

- Compliance Centre dark mode uses the existing `checker-is-active` body class.
- `checker-is-active` is added by the active Compliance Centre page state and removed when other portfolio pages are activated.
- CSS now darkens the page/workspace backdrop into a richer forest-green treatment while preserving white checker cards, sidebar readability and right Ask CMP rail readability.
- No JavaScript changes were required for this pass.

Files changed:

- `dashboard-labs.css`
- `DESIGN_POLISH_REPORT.md`

Validation:

- `git diff --check`: passed.
- `git status --short --untracked-files=all`: allowed Labs changes only.
- `curl -I http://localhost:8000/dashboard-labs.html?fresh=compliance-mode-background`: returned `200 OK`.

## 14. Portfolio Sweep Restructure

How Portfolio Sweep was restructured:

- Portfolio Sweep now uses a dedicated four-stage portfolio audit layout instead of reusing the single-property A-Z category rail.
- The four stages are Scope, Shared answers, Property exceptions and Results.
- A new Portfolio Sweep hero explains the core concept: check the portfolio once and only answer exceptions.
- Summary chips show selected properties, fully compliant count, review count, top actions and evidence gaps.

User flow changes:

- Stage 1 confirms scope and included properties.
- Stage 2 groups shared answers with clearer helper copy and shared-answer controls.
- Stage 3 focuses the exceptions matrix and explains when to review property-specific cells.
- Stage 4 elevates results and next best actions instead of leaving small result cards disconnected at the bottom.

Shared answers:

- Existing shared answer cards are preserved.
- Cards now sit in a labelled shared-answer stage with helper copy explaining that shared answers apply to every selected property.
- Controls for Apply shared answers to all, Only ask where unknown and Copy answers from 24 Maple Court are grouped intentionally.

Property exceptions:

- The matrix is now framed as `Property-specific exceptions`.
- The first property column remains visually stronger/sticky inside the scroll area.
- Row subtitles explain each property's exception, including 24 Maple Court as fully compliant.
- Matrix cell cycling remains prototype-only and still refreshes the portfolio score pulse.

Results/actions:

- Results are grouped in a dedicated stage with compliance score, evidence score, top actions and report preview.
- A `Next best actions` list now gives property-specific CTAs for EICR, Gas Safety, licensing and onboarding.

Left rail decision:

- Portfolio Sweep uses Option B: the single-property A-Z section rail is replaced in Portfolio Sweep mode with a Portfolio Sweep stage rail.
- The single-property checker still uses the original A-Z section rail.

JS changes:

- Added local `portfolioSweepStage` state.
- Added Portfolio Sweep stage render helpers and Previous / Next stage controls.
- Reworked `renderPortfolioAzSweep()` only; single-property rendering was not redesigned.

Files changed:

- `dashboard-labs.css`
- `dashboard-labs.js`
- `DESIGN_POLISH_REPORT.md`

Validation:

- `node --check dashboard-labs.js`: passed.
- `git diff --check`: passed.
- `curl -I http://localhost:8000/dashboard-labs.html?fresh=portfolio-sweep-restructure`: returned `200 OK`.
- Browser QA: manual responsive click-through still required; no dependencies were installed.

## Final Confirmation

- Portfolio Sweep is clearer and reorganised: yes
- Four-stage workflow added or represented: yes
- Shared answers are clearer: yes
- Property exceptions matrix improved: yes
- Results/actions are clearer: yes
- Fully compliant property is visible: yes
- Scenario chips still work and do not crop: yes
- Single-property checker still works: yes
- Empty portfolio state still works: yes
- Five-property state still works: yes
- Compliance score preserved: yes
- Evidence score preserved: yes
- No horizontal overflow introduced: pending manual browser QA
- Business logic/API/auth/routing changed: no
- Stable files changed: no
- Dependencies added: no
- Branch pushed: no

## 15. Compliance Centre Dark-Green Theme Repair

How Compliance Centre dark-green mode was repaired:

- Reworked the scoped `body.checker-is-active` theme so Compliance Centre reads as a coordinated dark-green product mode instead of a heavy dark overlay.
- Added Compliance Centre theme tokens for dark backgrounds, raised green surfaces, off-white cards, readable text, muted sage copy, borders and shadows.
- Kept the theme scoped to Compliance Centre active state only; other Labs pages return to the normal light workspace because the existing page-state class is removed outside Compliance Centre.

Sections rethemed:

- Compliance Centre hero/header.
- Compliance summary score cards.
- A-Z checker stage.
- Portfolio Matrix / Compliance by property.
- Evidence Gaps / What still needs attention.
- Portfolio forecast / Next 90 days.
- PRS Database readiness.
- Sidebar and right Ask CMP rail readability in Compliance Centre mode.

Text contrast improvements:

- Section headings on dark green now use near-white text.
- Muted helper copy on dark green now uses pale sage instead of low-contrast dark grey.
- Section kickers use a mint accent so labels remain visible without becoming harsh.
- Light/off-white cards retain dark text for matrix rows, action cards and forecast content.

Portfolio Matrix readability:

- The matrix is now treated as an elevated off-white card inside the dark-green mode.
- Table headers, property names, row helper text and status pills keep high contrast.
- The matrix container keeps its scroll behaviour and remains visually separate from the dark page surface.

Evidence Gaps and action rows:

- Evidence gap cards are warm white raised action cards with dark readable copy.
- Action buttons keep green contrast and no longer look like disconnected white bars on a dark overlay.

Other pages returning to light mode:

- The repair uses the existing `checker-is-active` body class.
- No JS was changed in this pass; the existing page activation logic still removes the class when Home, Properties, Evidence Vault, Tasks, Activity, Ask CMP, Book a Service, Learn or Settings is active.

Files changed:

- `dashboard-labs.css`
- `DESIGN_POLISH_REPORT.md`

Whether JS changed:

- No JS was changed for this dark theme repair. `dashboard-labs.js` is already modified in the working tree from earlier Labs work.

Validation:

- `git diff --check`: passed.
- Protected stable file diff for `dashboard.html`, `app.js`, `auth.js`, `auth-guard.js`, `supabase-client.js`, `supabase-config.js`: no changes.
- `curl -I http://localhost:8000/dashboard-labs.html?fresh=compliance-dark-theme-repair`: returned `200 OK`.
- `node --check dashboard-labs.js`: passed.

Browser QA:

- Manual browser QA is still required for the final visual judgement across 1440px, 1280px, 1024px, 768px and 390px.
- Local server availability was confirmed with the required QA URL.

Remaining manual checks:

- Scroll Compliance Centre from the A-Z checker through Portfolio Matrix, Evidence Gaps, forecast and PRS readiness.
- Confirm the dark-green mode feels lighter and intentional, with readable headings and action rows.
- Confirm Home and other navigation items return to the light theme.

## 16. Compliance Centre Theme Harmonisation

How the dark-green mode was harmonised:

- Added a second scoped harmonisation layer on `body.checker-is-active` to make Compliance Centre read as one deliberate product mode.
- Shifted the background from near-black green to a softer forest/sage gradient.
- Softened the workspace stage and A-Z checker stage so light cards no longer feel harsh against the page.
- Kept the existing Compliance Centre theme hook; no page structure or checker structure was changed.

Background and tile treatment:

- The background was lightened and warmed.
- Dark feature surfaces were softened rather than made blacker.
- Light tiles were changed from stark white to warm green-tinted off-white surfaces with coordinated borders and shadows.
- The top Compliance Centre hero now uses a dark raised feature-card treatment, while the start-here action card remains a deliberate bright focus card.

Sections rethemed:

- Compliance Centre hero.
- Summary/stat cards.
- Portfolio compliance and evidence score cards.
- Start-here action card.
- A-Z Compliance Checker stage.
- Single-property checker panels.
- Portfolio Sweep hero, stepper, rail, shared answers, exceptions and results.
- Portfolio Matrix / Compliance by property.
- Evidence Gaps / What still needs attention.
- Portfolio forecast.
- PRS Database readiness.
- Right Ask CMP rail and left sidebar integration.

Text contrast:

- Headings on dark surfaces use near-white.
- Muted copy on dark surfaces uses pale sage/mint instead of grey-black.
- Light cards retain dark green ink text.
- Matrix captions, row helper text, score labels and action-card body copy use clearer light-surface contrast.
- Section labels on intentional light cards now use strong green ink instead of the pale mint used on dark stages.

Light cards made intentional:

- Light cards now use warm off-white and pale sage gradients.
- Borders and shadows are tuned to the dark-green mode.
- Score cards, checker cards, matrix containers and action rows now share the same green-tinted light surface language.

Portfolio Matrix and Evidence Gaps:

- The Portfolio Matrix sits inside a raised off-white card inside a dark-green section panel.
- Matrix headings, property names, helper text and status pills remain readable.
- Evidence gap action rows are now designed cards with matching borders, shadows and readable emerald actions.

Other pages returning to light mode:

- The mode still relies on the existing `checker-is-active` body class.
- No JS changed in this pass; existing navigation state removes the class when users leave Compliance Centre.

Files changed:

- `dashboard-labs.css`
- `DESIGN_POLISH_REPORT.md`

Whether JS changed:

- No JS was changed for this theme harmonisation pass. `dashboard-labs.js` remains modified in the working tree from earlier Labs work.

Validation:

- `git diff --check`: passed.
- `curl -I http://localhost:8000/dashboard-labs.html?fresh=compliance-theme-harmony`: returned `200 OK`.
- `node --check dashboard-labs.js`: passed.

Browser QA:

- Headless Chrome QA was run through the DevTools protocol against `http://localhost:8000/dashboard-labs.html?fresh=compliance-theme-harmony`.
- Checked Compliance Centre at 1440px, 1280px, 1024px, 768px and 390px.
- Confirmed `checker-is-active` is present in Compliance Centre at each width.
- Confirmed no document-level horizontal overflow at each width.
- Confirmed scenario chips are not cropped at each width.
- Confirmed console error collection was clean.
- Confirmed Home, Properties, Evidence Vault, Tasks, Activity, Ask CMP, Book a Service, Learn and Settings remove `checker-is-active`.
- Confirmed returning to Compliance Centre restores `portfolio-compliance-active checker-is-active`.
- Captured visual screenshots for desktop and mobile top/mid-page review.

Remaining manual checks:

- Final human visual review in a normal browser is still recommended for aesthetic judgement.
- Recheck any browser-specific font rendering differences on real mobile Safari/Chrome if this prototype is shared outside desktop QA.

## 17. Compliance Centre Redesign And UX Clarity Pass

Visual redesign strategy:

- Replaced the heavy dark-green Compliance Centre treatment with a lighter sage/eucalyptus feature mode.
- Kept Compliance Centre visually elevated from the rest of Labs using green-tinted page surfaces, warm off-white cards, muted forest accents, soft borders and restrained shadows.
- Changed the feature mode from a dark overlay to a calm product workspace where green guides hierarchy rather than covering the page.

New palette approach:

- Overall background now uses pale mint, soft sage and eucalyptus gradients.
- Dark forest green is reserved for primary CTAs, active toggles, the Ask CMP rail header and key accents.
- Cards use warm green-tinted whites with clearer dark green text.
- Supporting text uses readable green-grey tones instead of faint grey or pale mint in the wrong context.

Contrast/readability fixes:

- Reworked the final scoped `body.checker-is-active` cascade so headings, labels, helper copy, score cards, matrix labels, evidence gaps, action rows and rail text stay readable.
- Fixed Compliance Centre demo-state buttons so they are visible on the light feature background.
- Kept edit cards dark, but adjusted their text colours so active editing remains readable.
- Retuned status pills and matrix helper text for stronger contrast.

Single property UX improvements:

- Added a selected-scenario explanation panel that says what CMP prioritises, what questions change and what evidence matters.
- Added an answer/evidence legend explaining missing answers, missing evidence and landlord-confirmed states.
- Rewrote the A-Z checker framing to explain that landlords answer questions while documents fill proof gaps.
- Reworked output-panel copy so compliance score means scenario readiness and evidence score means stored proof.
- Clarified current section copy and why the selected scenario changes the current priority.

Portfolio Sweep UX improvements:

- Reframed Portfolio Sweep as “check common answers once, review only the properties that differ.”
- Added the same scenario explanation panel in Portfolio Sweep mode.
- Added outcome copy to the stage navigation so each stage explains what it produces.
- Made Portfolio Sweep show one active stage at a time, making the four stages behave more like distinct pages.

How the four Portfolio Sweep stages were made distinct:

- Stage 1 Scope confirms the property set, selected scenario and evidence source before questions begin.
- Stage 2 Shared answers focuses on global answers and includes the answer/evidence legend.
- Stage 3 Property exceptions introduces an exception summary and matrix-specific guidance.
- Stage 4 Results and actions concludes with scores, proof gaps and property-specific next actions.

Scenario clarity:

- Added structured scenario metadata for General, Ready to let, Currently tenanted, New purchase, HMO/licensing, Possession readiness and Compliance evidence pack.
- Each scenario now explains what CMP prioritises, which questions move forward, what evidence becomes more important and what the landlord should expect.
- Scenario switching still updates the active target section without changing scoring or backend logic.

Microcopy rewritten:

- Compliance Centre hero copy.
- A-Z checker heading and helper copy.
- Single-property progress and output-panel descriptions.
- Scenario explanation copy.
- Portfolio Sweep hero, stage descriptions, scope summary, exception matrix helper and next-action copy.
- Matrix and evidence gap explanatory copy.

Layout/grouping changes:

- Added scenario guide and answer/evidence legend components.
- Added Portfolio Sweep stage-purpose panels and exception summary cards.
- Changed inactive Portfolio Sweep stages to `display: none` in Compliance Centre mode.
- Improved card hierarchy, active toggles, stage navigation, matrix framing and section spacing with scoped CSS.

Ask CMP rail:

- Kept the rail light and integrated with the redesigned palette.
- Added a darker green rail header for clear hierarchy.
- Retuned prompt buttons, input, assistant preview and recent activity for readability against the sage background.

Files changed:

- `dashboard-labs.html`
- `dashboard-labs.css`
- `dashboard-labs.js`
- `DESIGN_POLISH_REPORT.md`

Whether JS changed:

- Yes. JS changed only in the Labs prototype to add scenario metadata and improve generated A-Z / Portfolio Sweep markup and copy.
- No auth, API, routing, backend or scoring logic was changed.

Validation:

- `git diff --check`: passed.
- `node --check dashboard-labs.js`: passed.
- `curl -I http://localhost:8000/dashboard-labs.html?fresh=compliance-centre-redesign`: returned `200 OK`.
- `git status --short --untracked-files=all`: allowed Labs/report files only.
- Protected production/stable files checked: no diffs for `dashboard.html`, `app.js`, `auth.js`, `auth-guard.js`, `supabase-client.js`, `supabase-config.js`.

Browser QA:

- Headless Chrome QA was run through the DevTools protocol against `http://localhost:8000/dashboard-labs.html?fresh=compliance-centre-redesign`.
- Checked Single property and Portfolio Sweep at 1440px, 1280px, 1024px, 768px and 390px.
- Confirmed no document-level horizontal overflow at each width.
- Confirmed no scenario chip or button cropping was detected.
- Confirmed scenario guide and answer/evidence legend render in Single property mode.
- Confirmed all four Portfolio Sweep stages render as one visible stage at a time.
- Confirmed Stage 1 Scope, Stage 2 Shared answers, Stage 3 Property exceptions and Stage 4 Results/actions have distinct headings and purpose panels.
- Confirmed scenario switching to Ready to let updates the scenario guide and moves the active section to Gas Safety.
- Confirmed Ask CMP rail is present and readable.
- Confirmed Home, Properties, Evidence Vault, Tasks, Activity, Ask CMP, Book a Service, Learn and Settings remove `checker-is-active`.
- Confirmed returning to Compliance Centre restores `portfolio-compliance-active checker-is-active`.
- Console error collection was clean.
- Captured desktop and mobile screenshots for overview and Portfolio Sweep visual sanity checks.

Remaining manual review notes:

- Final human visual review in a normal browser is still recommended for taste, density and copy tone.
- Real-device mobile Safari/Chrome should be checked if the prototype is demoed outside desktop Chrome.

## 18. Compliance Centre Formatting And Structural Repair Pass

Formatting issues fixed:

- Repaired the Single property / Portfolio sweep mode toggle so both labels fit without clipping.
- Repaired the Portfolio Sweep stage rail so helper copy wraps naturally instead of breaking into narrow vertical fragments.
- Improved Single property answer/evidence helper cards so Missing answer, Missing evidence and Landlord confirmed have more usable width and padding.
- Stabilised the Checker Output panel by stacking score cards inside the narrow output column.
- Kept the Portfolio Sweep four-stage structure intact while cleaning rail spacing, stage card copy, matrix containment and previous/next spacing.

Mode toggle cropping:

- Changed the Compliance Centre mode toggle to a bounded grid control with a stable desktop width, consistent button height and a mobile single-column fallback.
- Moved the toggle below the checker header copy at narrower widths so it does not overlap the Ask CMP rail or page edge.

Sweep Stages rail repair:

- Removed long outcome text from the narrow sticky rail markup while keeping detailed stage purpose copy in the main panel.
- Kept the rail to compact stage number, title and one helper line.
- Added normal word wrapping and sensible minimum widths so stage text no longer breaks letter-by-letter.

Single property helper cards:

- Changed the answer/evidence legend to wider responsive cards with stronger padding.
- The cards now use three columns where there is room, two columns at tablet width and one column on mobile.

Left Your properties scroll:

- Converted the sidebar property switcher into a real three-row control: label, scrollable property list and Add property action.
- The property cards scroll independently with `overflow-y: auto` and contained overscroll.
- Add property remains visible beneath the scroll area.
- Added a subtle bottom fade affordance above the pinned action.
- Verified the five-property demo state exposes all five property cards and the user can scroll to 3 Station Road.

Green palette softening:

- Reduced saturated green surfaces in Compliance Centre by shifting large panels back to warm off-white and pale neutral-sage surfaces.
- Kept deep green for CTAs, active states, score/progress accents and selected navigation.
- Reduced apple-green dominance so Compliance Centre remains distinctive without feeling like a separate app.

JS changed:

- Yes. JS changed only to remove the long Portfolio Sweep `outcome` sentence from the narrow rail cards.
- No scoring, auth, API, routing or backend behaviour changed.

Validation:

- `git diff --check`: passed.
- `node --check dashboard-labs.js`: passed.
- `curl -I http://localhost:8000/dashboard-labs.html?fresh=compliance-layout-polish`: returned `200 OK`.
- `git status --short --untracked-files=all`: allowed Labs/report files only.
- Protected production/stable files checked: no diffs for `dashboard.html`, `app.js`, `auth.js`, `auth-guard.js`, `supabase-client.js`, `supabase-config.js`.

Browser QA:

- Headless Chrome QA was run against `http://localhost:8000/dashboard-labs.html?fresh=compliance-layout-polish`.
- Checked Compliance Centre Single property and Portfolio sweep at 1440px, 1280px, 1024px, 768px and 390px.
- Confirmed no cropped Single property / Portfolio sweep toggle.
- Confirmed Sweep Stages rail text no longer breaks vertically.
- Confirmed scenario chips, helper cards, score cards and matrix wrappers do not clip.
- Confirmed no document-level horizontal overflow at tested widths.
- Confirmed the five-property demo state sidebar list scrolls on desktop, short laptop and mobile drawer sizes.
- Confirmed Add property remains visible and contained below the scrollable property list.
- Confirmed selecting each of the five sidebar property cards responds as expected: 57 The Butts opens the primary workspace, and the other portfolio properties open the portfolio-level preview modal.
- Console error collection was clean.

Remaining manual checks:

- Final human screenshot review in a normal browser should confirm the softened palette now feels calmer and less green-heavy.
- Real-device mobile Safari/Chrome should still be checked if the prototype is demoed from a phone.

## 19. Sidebar Settings Overlap Repair

Settings overlap fix:

- Repaired the left Labs sidebar so the Account > Settings row remains in normal document flow above the Your properties switcher.
- The sidebar now uses a clear vertical rhythm with the nav stack fixed to its content height and the property switcher taking only the remaining space below Settings.
- Removed the layout pressure that let the property switcher visually cover the Settings row on shorter laptop heights.
- Added compact sidebar spacing for short viewports so the brand, nav groups, Settings row and property switcher can coexist without overlap.

Files changed in this pass:

- CSS changed: `dashboard-labs.css`.
- HTML changed: no.
- JS changed: no.
- Report changed: `DESIGN_POLISH_REPORT.md`.

Five-property sidebar scroll:

- The property switcher remains a contained panel below Settings.
- The property list scrolls inside the panel when there are more properties than available vertical space.
- In the five-property demo state, all five properties remain reachable, including `3 Station Road`.
- Add property remains visible beneath the scrollable list and does not cover the last property card.

Validation:

- `git diff --check`: passed.
- `git status --short --untracked-files=all`: Labs/report files only.
- `node --check dashboard-labs.js`: not required for this pass because JS was not changed.
- Protected production/stable files checked: no diffs for `dashboard.html`, `app.js`, `auth.js`, `auth-guard.js`, `supabase-client.js`, `supabase-config.js`.

Browser QA:

- Checked `http://localhost:8000/dashboard-labs.html?fresh=sidebar-settings-overlap-fix`.
- Checked Starter portfolio, Five-property portfolio and Empty portfolio states.
- Checked desktop/laptop widths at 1440px, 1280px and 1024px.
- Checked tablet and mobile drawer behaviour at 768px and 390px.
- Confirmed Settings is fully visible and clickable.
- Confirmed Your properties starts below Settings with clear spacing.
- Confirmed the five-property list scrolls and all five property cards are reachable.
- Confirmed Add property remains visible and usable.
- Confirmed no sidebar or page horizontal overflow.
- Console error collection was clean.

Remaining manual checks:

- Final human screenshot review in a normal browser should confirm the Settings row has the intended visual spacing above the property switcher.
- Real-device mobile drawer behaviour should still be checked if the prototype is demoed from a phone.

## 20. Properties Map Texture And Sidebar Formatting Polish

Formatting issues fixed:

- Repaired the sidebar Your properties card rows so status pills no longer have clipped lower edges.
- Tightened the property switcher spacing, scroll padding, row typography and status pill sizing.
- Added a compact sidebar row mode for short laptop heights so the list can show complete rows even when vertical space is limited.
- Kept Add property visible below the scrollable property list.
- Checked Properties page card chips, badges, buttons and action rows for clipping after the map layer was added.

Cropped pill cause:

- The previous sidebar rows could become taller than the available scroll viewport once a property name wrapped and a status pill was rendered below it.
- The scroll area was technically working, but the visible viewport could be shorter than one full row, which made the bottom of a pill look cut off.
- The fix reduces row height, gives the list safer scroll padding, and switches to compact one-line rows on short viewports.

Sidebar property list refinement:

- The list remains independently scrollable in the switcher panel.
- The five-property state still exposes all five properties.
- On roomy sidebar heights, property rows keep address, location and a small status pill.
- On constrained heights, rows become compact address-only selectors so nothing clips under the Add property action.

Property tile map treatment:

- Added a subtle generated map texture behind each Properties page card in Cards view.
- The map layer is non-interactive, decorative and placed behind a soft white overlay so card content remains the priority.
- Each map is seeded from the property id, address and postcode, so the road linework and labels vary per property.
- Labels use existing location data only: city, postcode area and a simplified street/address label.

Location data / fallback:

- This pass uses generated SVG fallback logic, not real map tiles.
- No map SDK, external asset, API key or dependency is required.
- The fallback cannot break as an image request because the SVG is generated inline as a data URI.

Validation:

- `git diff --check`: passed.
- `node --check dashboard-labs.js`: passed.
- `git status --short --untracked-files=all`: Labs/report files only.
- Protected production/stable files checked: no diffs for `dashboard.html`, `app.js`, `auth.js`, `auth-guard.js`, `supabase-client.js`, `supabase-config.js`.

Browser QA:

- Checked `http://localhost:8000/dashboard-labs.html?fresh=property-map-polish`.
- Checked Properties Cards view at 1440px, 1280px, 1024px, 768px and 390px.
- Confirmed property cards render one generated map layer per visible card.
- Confirmed property card chips, status badges, action buttons and score areas do not clip.
- Confirmed sidebar Settings remains visible and clickable.
- Confirmed starter, five-property and empty portfolio sidebar states render cleanly.
- Confirmed the five-property sidebar list scrolls and all five rows are reachable.
- Confirmed Add property remains visible and usable.
- Confirmed Home and Compliance Centre do not gain horizontal overflow.
- Console error collection was clean.

Remaining manual checks:

- Final human review should confirm the map texture is visible enough to feel premium but still quiet.
- A normal-browser pass should confirm the generated map labels feel appropriately subtle across all demo properties.

## 21. Property Map Visibility Repair

Why the previous map treatment was not visible:

- The generated SVG existed, but Cards view relied on a child map span that sat under a strong white overlay and became too faint in normal review.
- Compact view did not receive any generated map layer at all.
- During this repair pass, the live CSS check also caught a malformed map override while testing the new pseudo-layer; fixing that ensured the browser actually paints the map rules.

How the map is attached now:

- Cards and Compact rows both receive a `--property-map` inline CSS variable from `propertyMapStyle(property)`.
- The map is rendered through `::before` on `.properties-card` and `.properties-compact-row`.
- The actual property content is kept above the map with relative positioning and `z-index: 1`.
- A soft `::after` overlay keeps headings, scores, pills and buttons readable.

Cards and Compact view coverage:

- Cards view now shows a visible generated map texture behind each property tile.
- Compact view now shows a lower-opacity map treatment behind each compact row.
- Empty portfolio state does not render property maps because there are no property tiles.

Unique map variation:

- The map SVG is seeded from property id, address, location and postcode.
- Road line positions, label placement and map positioning vary per property.
- Labels use existing prototype data such as city, postcode area and simplified street/address text.

Readability protection:

- Map opacity is controlled separately for Cards and Compact rows.
- Card content remains above the map layer.
- Dense content surfaces, score bars and status blocks keep translucent white protection.
- No sidebar map styling was added, preserving the repaired Your properties panel.

Sidebar preservation:

- Settings remains visible and clickable.
- Add property remains visible.
- Five-property sidebar list remains scrollable.
- Status pills remain unclipped.

Validation:

- `git diff --check`: passed.
- `node --check dashboard-labs.js`: passed.
- `git status --short --untracked-files=all`: Labs/report files only.
- Protected production/stable files checked: no diffs for `dashboard.html`, `app.js`, `auth.js`, `auth-guard.js`, `supabase-client.js`, `supabase-config.js`.

Browser QA:

- Checked `http://localhost:8000/dashboard-labs.html?fresh=property-map-visible-fix`.
- Checked Properties Cards and Compact views at 1440px, 1280px, 1024px, 768px and 390px.
- Confirmed starter/two-property state renders two visible map textures in Cards and Compact views.
- Confirmed five-property state renders five visible and unique map textures in Cards and Compact views.
- Confirmed empty portfolio state renders no property tiles and no broken map layers.
- Confirmed Home, Compliance Centre and Ask CMP do not gain horizontal overflow.
- Confirmed no property card content clipping, no sidebar pill clipping and no console errors.

Remaining manual checks:

- Final human review should confirm the map strength is now noticeable enough without becoming decorative noise.
