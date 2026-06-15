# CMP Final Nick Demo Audit

Date/time: 2026-06-16 00:34 BST
Branch: `labs/cmp-journey-os-v1`
Starting commit: `3b995496772ad86ba74aae257ede7c689c5abe84`
Checkpoint tag: `checkpoint/cmp-before-final-nick-demo-audit`
Pushed to origin before audit: Yes, `labs/cmp-journey-os-v1` was pushed so Prompt 2 is backed up.

## Audit Purpose

This audit checks the fake/local/mock CMP Journey OS prototype before showing it to Nick. The prototype is intended to demonstrate the future landlord journey: dashboard entry, add/check property, simulated checks, landlord-only unknowns, property brain, action plan, service/evidence follow-through, Compliance Centre, Evidence Vault, Ask CMP and monitoring.

No real APIs, uploads, payments, supplier booking, AI, storage or legal analysis are connected.

## Route Matrix

| Entry point | Scenario | Expected journey | Key clicks checked | Outcome | Status | Fixes made | Remaining issue |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Dashboard / sidebar | Main A-Z | Dashboard -> Add/check property -> checks -> review -> unknowns -> brain -> plan -> legal essentials -> workspace surfaces | `Check My Property`, clean match, unknowns, service plan, Evidence Vault, Compliance Centre | Static route inspection confirms handlers and bridge surfaces are connected | Pass with caveat | None beyond service-target fixes below | Full CDP click automation was unstable on this machine |
| Query path | `?state=new-property` | Opens Journey OS Add Property rather than old unfinished setup | URL load and code route checked | Local page render includes Journey OS/new-property copy | Pass | None | Manual visual click-through still recommended before Nick call |
| Query path | `?journeyDemo=nick` | Opens guided demo hub | URL route and guided renderer checked | Guided demo entry and story definitions present | Pass | None | Manual rehearsal recommended |
| Demo Control Centre | Property scenarios | Global states, property scenarios, guided stories and reset grouped | Modal structure inspected | Controls remain available for testing | Pass | None | Presenter mode still exposes normal controls after exit by design |
| No EPC | Missing EPC | Unknown EPC rating, potential and expiry; EPC becomes action; occupancy carried into unknowns | No-EPC data model and branch handlers checked | No confident EPC value is shown in No EPC state | Pass | Changed guided No EPC next step to `EPC Assessment`; removed `book-epc` link from EPC improvement service | None known |
| HMO/licensing | High occupancy | Room/shared-house answers add licensing/fire/room-size services | Guided next-step mappings and service catalog checked | Specific services now route correctly | Pass | Guided HMO next steps now use `Fire Risk Assessment` and `Room Measurement` services | None known |
| Damp/mould + pests | Multi-select condition | Multiple condition issues add multiple routes/services | Multi-select handlers and service mappings checked | Damp and pests are represented as separate condition actions/services | Pass | Tenant-message mapping now uses damp/repair templates where relevant | None known |
| Done-for-me | Concierge route | Service basket, plan buttons and confirmations show commercial route | Plan button and confirmation functions checked | Fake bundle confirmations update local state | Pass | Confirmation tenant message now follows selected service/bundle context | None known |
| Legal essentials booking | Plan-level button | Fake confirmation, pending evidence, timeline, monitoring and workspace return | `applyServicePlan`, confirmation renderer and side effects checked | Service plan has confirmation and bridge updates | Pass | None | Manual visual confirmation recommended |
| Quote request | Quote-first route | Quote status stays open and Ask CMP explains risk remains | Ask CMP quote branch and service lifecycle checked | Quote request state remains distinct from solved/completed | Pass | None | None known |
| Service lifecycle | Gas/EICR/EPC/Licensing/Damp/Deposit | Recommended -> basket/quote/booked/in progress/completed -> evidence/monitoring | Lifecycle renderer, side effects and catalog checked | Buttons are status-aware | Pass | Service-specific tenant messages added | None known |
| Evidence scanner | EICR/EPC/deposit/council/photos | Fake scanner updates Evidence Vault, timeline, compliance where relevant | Scanner outcomes and acceptance path inspected | Scanner remains local and visible | Pass with caveat | None | Wrong-property/unclear outcomes should be manually spot-checked |
| Compliance Centre | Active property brain | Shows scores, gaps, service status and action links | Bridge renderer inspected | Reads Journey OS state when property brain activity exists | Pass | None | It is still a bridge, not a true shared datastore |
| Evidence Vault | Active property brain | Shows required, pending, generated and scanned evidence | Bridge renderer inspected | Reads Journey OS evidence and missing evidence | Pass | None | It is still local state only |
| Ask CMP | Multiple contexts | Responds to dashboard, journey, action, service, evidence, compliance and guided context | Prompt routing inspected | Scripted responses reference service/evidence state | Pass | None | Scripted/local; not real AI |
| Monitoring | Service/evidence follow-up | Renewal, quote, service and condition follow-ups visible | `upsertMonitoringFromService` and monitoring catalog inspected | Service actions can create monitoring items | Pass | None | Dates are illustrative |
| Reset behaviour | Normal and guided | Reset/restart/exit should not leave stale story state | Reset functions inspected | Guided reset rebuilds story state | Pass with caveat | None | Manual rehearsal should include reset after each guided story |
| Responsive layout | Desktop/mobile | No obvious horizontal overflow or blocked controls | CSS responsive rules inspected; local Chrome direct render partially checked | No known blocking layout issue from static inspection | Pass with caveat | None | CDP/mobile automation was unstable; manual browser check recommended |

## Areas Tested

- Dashboard entry and Add/check property navigation.
- `dashboard-labs.html?state=new-property`.
- `dashboard-labs.html?journeyDemo=nick`.
- Demo Control Centre structure.
- No EPC route data consistency and carry-forward answer logic.
- HMO/licensing guided next-step routes.
- Damp/mould + pests multi-select route logic.
- Done-for-me service plan and confirmation route.
- Legal essentials, quote request and service lifecycle logic.
- Fake scanner and Evidence Vault bridge logic.
- Compliance Centre bridge logic.
- Ask CMP context logic.
- Monitoring side effects.
- Guided story next-step panels.
- Responsive CSS rules for Journey OS, service cards, modals and guided mode.

## Fixes Made During Audit

- No EPC guided next step now opens `EPC Assessment`, not `EPC Improvement Plan`.
- EPC Improvement Plan no longer links to the missing-EPC `book-epc` action, keeping missing EPC and future-improvement routes separate.
- HMO guided next steps now route to the specific `Fire Risk Assessment` and `Room Measurement` services.
- Booked service cards and confirmation panels now generate tenant-message drafts based on the selected service instead of always using Gas Safety access copy.

## Browser / Preview Notes

Local preview server: `http://localhost:8001/dashboard-labs.html`.

The local server started successfully. Chrome direct render confirmed the normal page produced expected Journey OS/property workspace text. CDP/headless automation was unstable in this environment because Chrome repeatedly exited before the Node harness could attach, so interactive browser coverage is documented as partial rather than overstated.

Manual visual rehearsal is still recommended immediately before showing Nick:

- `http://localhost:8001/dashboard-labs.html?journeyDemo=nick`
- `http://localhost:8001/dashboard-labs.html?state=new-property`
- `http://localhost:8001/dashboard-labs.html`

## Validation

- `node --check dashboard-labs.js`: passed.
- `node --check` across all `.js` files: passed.
- `git diff --check`: passed.
- Guided/service reference consistency check: passed; guided next-step service IDs all resolve to catalog services.

## Final Nick Readiness

Status: Ready with caveats.

Show Nick first:

- Open guided demo mode.
- Run the clean 2-minute story.
- Show one commercial next step: `Book legal essentials` or `Request quotes first`.
- Show the resulting Evidence Vault, Compliance Centre, Ask CMP and Monitoring state.

Do not show unless asked:

- Raw prototype scenario controls.
- Older A-Z checker internals.
- Edge scanner outcomes such as wrong-property/unclear unless you want feedback on document intelligence.
- Netlify/deploy settings.

Known prototype limitations:

- Everything is fake/local/mock and resets on reload.
- Compliance Centre and Evidence Vault are bridged to Journey OS local state, not a true shared data layer.
- Ask CMP is scripted local copy, not live AI.
- Scanner outcomes and service confirmations are simulated.
- No real supplier, payment, evidence storage, legal analysis or external data source exists.

Next build recommendations:

- Run one live manual rehearsal with Nick's preferred demo path and capture feedback.
- Tighten whichever story Nick finds strongest into the primary sales/demo route.
- Decide which real integration should be built first: EPC/address lookup, document intelligence, or supplier quote/booking.
