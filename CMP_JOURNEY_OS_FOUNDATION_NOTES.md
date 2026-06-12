# CMP Journey OS Foundation Notes

## What Was Built

- Added an isolated Journey OS experiment inside `dashboard-labs.html`.
- Added a central mock `journeyState` and `propertyBrain` model in `dashboard-labs.js`.
- Added fake property search, auto checks, property match branches, review found data, unknowns wizard, property brain animation, action plan, route selector, workspace tabs, timeline, service basket, evidence vault and monitoring preview.
- Added demo scenarios for clean match, multiple matches, no EPC, EPC risk, HMO, flat/block, damp/mould, council contact, done-for-me and portfolio preview cases.
- Added the wow-layer pass: richer fake service baskets, service intakes, fake upload scanner, contextual Ask CMP responses, tenant message generator, monitoring cards and portfolio preview.

## Demo Script

Use `CMP_JOURNEY_OS_DEMO_SCRIPT.md` for the recommended walkthrough paths, including clean property, no EPC, HMO risk, damp/mould, council/enforcement, service booking, upload scanning, Ask CMP, tenant messages, monitoring and portfolio preview.

## QA And Polish Report

Use `CMP_JOURNEY_OS_QA_REPORT.md` for the focused demo-readiness pass, including scenario coverage, action-path fixes, browser checks, remaining limitations and suggested next pass.

## How To Open And Test

1. Open `dashboard-labs.html`.
2. Click `Check My Property` on the portfolio home page, or choose `Journey OS` in the sidebar.
3. Use the Journey OS stage flow:
   - Start
   - Add Property
   - Auto Checks
   - Confirm Property
   - Review Found Data
   - Answer Unknowns
   - Property Brain
   - Action Plan
   - Property Workspace

## Demo Scenario Switcher

Use the `Demo scenario` selector in the Journey OS header. Changing scenario resets the Journey OS state and rebuilds the simulated property brain/action plan.

Supported scenarios include:

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

## Simulated Parts

- API checks are local fake progress states.
- EPC, UPRN, licensing, local authority and property clues are mock data.
- Document intelligence is simulated.
- Uploads add local placeholder evidence only.
- Service booking adds local placeholder service basket items only.
- Ask CMP responses are generated from current prototype state, not from live AI.
- Monitoring reminders are local placeholder items.

## Placeholder Buttons

- Upload evidence
- Book service
- Ask CMP
- Set reminder
- Defer

These update local prototype state just enough to support the foundation walkthrough. Full upload, supplier, payment, AI and notification flows are intentionally out of scope.

## Known Limitations

- No live API integrations.
- No real document upload or parsing.
- No persistence beyond the current page session.
- No payment or supplier workflows.
- No legal guarantee; all data is simulated demo content.
- Visual polish is foundation-level and should be refined after flow testing.

## Suggested Next Steps

- Add richer upload simulation with fake document extraction states.
- Add a fuller service booking intake and basket review.
- Add Ask CMP canned responses for each route and action group.
- Add a Nick-facing guided demo script.
- Add a browser smoke-test checklist once the final demo path is stable.
