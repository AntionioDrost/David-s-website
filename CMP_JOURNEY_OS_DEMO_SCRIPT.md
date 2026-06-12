# CMP Journey OS Demo Script

## Quick 2-Minute Demo

Use this route when Nick needs the product idea fast.

1. Open `dashboard-labs.html`.
2. Click `Check My Property`.
3. Keep `Clean property match` selected.
4. Click `Check My Property`, use the demo address, and run fake auto checks.
5. Confirm the property match and point out: CMP checked what it could automatically.
6. On Review Found Data, point out EPC, local authority, property type, heating and data gaps.
7. Answer the unknowns quickly with the first option each time and point out: only landlord-confirmed facts are being asked.
8. Build the property brain and open the Action Plan.
9. Click `Book urgent only` to show the fake service basket updating.
10. Open Property Workspace > Ask CMP, click `Can I rent this property now?`, then generate a tenant message.
11. Open Monitoring and point out that the property is now watched over time.

What this proves: CMP can turn a messy landlord compliance journey into one guided property workspace.

## Full 10-Minute Demo

Use this route for a fuller product walkthrough.

1. Start with `EPC E future-risk`.
2. Run the add-property and auto-check flow.
3. Confirm the property, then point out the future-risk EPC copy on Review Found Data.
4. Answer unknowns to add a side route:
   - Choose `Flat` to show common-parts logic, or `Room in shared house` / `5+ people` to show HMO risk.
   - Choose `Damp/mould` or `Council contacted me` to show condition/enforcement support.
   - Choose `I want someone to handle it for me` to show the done-for-me route.
5. Build the property brain and open the Action Plan.
6. Switch between Legal Minimum, Risk-Protected, Future-Proof and Done-For-Me routes.
7. In Services, open Gas Safety or EICR to show supplier-ready fake intake.
8. In Evidence, upload:
   - EICR for a valid scan.
   - EPC (expired demo) for an expired scan.
   - Deposit Certificate for deposit evidence.
   - Council letter for enforcement context.
   - Damp/mould photos for partial/flagged condition evidence.
9. In Ask CMP, click `What should I book?`, then use the response buttons.
10. Generate and log a tenant message.
11. Open Timeline to show the property history.
12. Open Monitoring and Portfolio preview to show long-term value.

What this proves: Journey OS is not just a checklist. It is a property brain that updates evidence, services, questions, scores, timeline and monitoring.

## Scenario Demo Map

| Scenario switcher option | What to click | What to point out | What it proves |
| --- | --- | --- | --- |
| Clean property match | Confirm match, answer unknowns, build brain | Smooth mainline flow | CMP can guide a normal landlord path |
| Multiple EPC/address matches | Select a record or `I'm not sure` | Identity confidence and warning route | CMP can handle uncertain property identity |
| No EPC found | Choose rented, advertised, vacant, upload or manual | EPC remains visible until solved | CMP does not hide missing evidence |
| EPC E future-risk | Continue to Action Plan | Future-risk and improvement plan | CMP can distinguish legal-now from future risk |
| EPC F/G urgent MEES risk | Continue to Action Plan | Urgent MEES wording and EPC service | CMP can escalate high-risk energy cases |
| Occupied normal single household | Answer deposit/docs/gas/EICR questions | Active tenancy evidence gaps | CMP asks what APIs cannot know |
| Vacant/pre-let property | Open Services | Void/re-let readiness pack | CMP supports pre-let planning |
| Currently advertised property | Review EPC/action plan | Pre-let blockers | CMP can warn before marketing/renting |
| Flat/block/common parts | Choose flat route | Common-parts/freeholder evidence | CMP adds property-type side routes |
| HMO/high-occupancy risk | Choose room or 5+ people | Licensing and HMO services | CMP can branch into HMO risk |
| Converted/multiple-unit property | Continue to Action Plan | Planning/fire separation risk | CMP can flag classification uncertainty |
| Gas unknown | Ask CMP or Services | Gas Safety remains unconfirmed | Unknown does not equal safe |
| EICR missing | Upload valid EICR | Evidence and score improvement | The fake scanner updates the brain |
| Deposit evidence missing | Upload Deposit Certificate | Deposit evidence route improves | Evidence can reduce admin risk |
| Damp/mould complaint | Open Services and tenant message | Damp survey and repair evidence | CMP connects condition risk to action |
| Council/enforcement contact | Upload Council letter | Enforcement response support | CMP can preserve escalation context |
| Done-for-me landlord | Click concierge/service buttons | Pending service basket | CMP can sell a managed route |
| Portfolio landlord preview | Workspace Overview | Multi-property stats | Journey OS scales to portfolio value |

## What Is Simulated

- Fake APIs for address, UPRN, EPC, local authority, licensing and property clues.
- Fake EPC records and fake match confidence.
- Fake document upload, scanning, extraction, address matching and expiry checking.
- Fake service basket, quote request, booking intake and supplier-ready questions.
- Fake Ask CMP responses generated from local state.
- Fake tenant messages and timeline logging.
- Fake monitoring reminders and portfolio stats.

## What Would Be Real Later

- EPC API lookup.
- Address and UPRN lookup.
- Local authority and licensing datasets.
- Secure document upload and evidence storage.
- Document intelligence for extraction, dates, address match and classification.
- Supplier availability, quote and booking workflows.
- Payment or quote approval workflow.
- Real compliance rules engine with professional/legal review boundaries.
- User accounts, roles, permissions and audit history.

## Known Limitations

- The prototype is local state only and resets on reload.
- No document leaves the browser and no supplier is contacted.
- Ask CMP is scripted; it is not live AI.
- Tenant messages are practical drafts only and may need professional review depending on the situation.
- Some scoring changes are deliberately simple so the demo remains understandable.
- The current visual pass is demo-ready polish, not final product design.

## Suggested Next Pass

Create a Nick-facing guided demo mode with a single narrated route, fewer visible testing controls, and a reset button for five polished stories: clean property, no EPC, HMO risk, damp/mould/council contact and done-for-me.
