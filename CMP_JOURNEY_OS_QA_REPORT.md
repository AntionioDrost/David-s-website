# CMP Journey OS QA Report

## Run Details

- Date/time: 2026-06-12 17:44:42 BST
- Branch: `labs/cmp-journey-os-v1`
- Commit before QA: `d12f1d34de46e5be5eba13a6c4ff8f858ac458b3`
- Checkpoint tag created before edits: `checkpoint/cmp-journey-os-wow-layer`

## Pages Tested

- `dashboard-labs.html`
- Journey OS panel inside the Labs dashboard
- Property Workspace tabs:
  - Overview
  - Compliance
  - Evidence
  - Services
  - Timeline
  - Ask CMP
  - Monitoring

## Scenarios Reviewed

- Clean property match
- Multiple EPC/address matches
- No EPC found
- EPC E future-risk
- EPC F/G urgent MEES risk
- Occupied normal single household
- Vacant/pre-let property
- Currently advertised property
- Flat/block/common parts
- HMO/high-occupancy risk
- Converted/multiple-unit property
- Gas unknown
- EICR missing
- Deposit evidence missing
- Damp/mould complaint
- Council/enforcement contact
- Done-for-me landlord
- Portfolio landlord preview

## Actions Tested Or Audited

- Dashboard `Check My Property` entry.
- Add-property demo address flow.
- Fake auto-check progress.
- Clean match, multiple match and no-EPC branches.
- Review Found Data.
- Unknowns wizard.
- Property brain build.
- Route selector.
- Action Plan buttons.
- Service basket plan buttons.
- Service intake modal final actions.
- Fake upload scanner.
- Ask CMP quick questions and response action buttons.
- Tenant message generator and timeline logging.
- Monitoring actions.
- Defer behavior.
- Workspace tab routing.
- Portfolio preview.

## Browser And Viewport Checks

- Local server attempted on port `8000`; it was already in use.
- Local server started on port `8001`.
- Headless Chrome render checks were used for page-load/runtime smoke testing.
- Full CDP click automation was attempted, but the local Chrome target list was unstable in this environment, so the detailed path was completed as implementation-level action auditing plus render smoke checks.
- Desktop and mobile layout rules were reviewed in CSS, with focused updates for spine labels, modal width and message grids.

## Bugs Or UX Issues Found

- Some Journey OS buttons still used `placeholder` language even though they now open richer simulations.
- Ask CMP response buttons did not include all useful routes requested in the demo plan.
- Service `deferred`/`saved for later` feedback could read like a solved basket update.
- Fake scanner had no direct expired EPC path for demos.
- Deferring an action could recalculate scores through the older scoring helper.
- Action cards did not clearly explain what CMP recommends after identifying a risk.
- The tenant message generator existed, but the Ask CMP tab did not expose the full set of message templates.
- Status chips were visually similar across accepted, flagged, quote and deferred states.

## Fixes Made

- Added `EPC (expired demo)` as a scanner fixture.
- Improved scan outcomes so valid EPC, Gas, EICR, Deposit, Licence, Council and condition evidence update the property brain more visibly.
- Added explicit branch-effect feedback for expired, wrong-property and partially useful evidence.
- Added monitoring items for expired scan outcomes.
- Improved service status timeline copy so deferred remains visibly unresolved.
- Added action-card recommendation blocks and deferred-risk notes.
- Renamed review-screen buttons to simulation/product language instead of placeholder language.
- Added current/completed/upcoming hints to the Journey OS spine.
- Added Ask CMP actions for adding legal essentials, viewing evidence gaps and escalation placeholder.
- Wired Ask CMP evidence-gap and escalation actions to useful workspace/timeline outcomes.
- Added a tenant message picker to the Ask CMP tab.
- Added annual-review monitoring action.
- Improved CSS for status chips, action insight copy, message picker and mobile modal width.
- Reworked the demo script for a live 2-minute and 10-minute walkthrough.

## Remaining Known Limitations

- No real APIs, uploads, scanning, supplier booking, payments, AI calls or legal analysis.
- State is local to the page session.
- Full browser click automation could not be completed through CDP in this environment.
- Some scores are intentionally simple and illustrative.
- The prototype is presentation-ready, not production-ready.

## Suggested Next Pass

Create a guided demo mode that hides internal testing controls, preloads the best scenario path, and provides a presenter-friendly reset for clean property, no EPC, HMO risk, damp/mould and done-for-me stories.
