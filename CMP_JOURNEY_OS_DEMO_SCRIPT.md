# CMP Journey OS Demo Script

## Final Nick Rehearsal Route

Start here unless Nick specifically asks for free exploration.

Opening line:

> This is simulated data, but the journey is the important part. The real product would connect EPC, address, licensing and document intelligence later. Right now we are testing whether the landlord journey makes sense and whether the commercial service paths feel compelling.

Recommended link:

`dashboard-labs.html?journeyDemo=nick`

Fast route:

1. Click `Run the 2-minute demo`.
2. Step through address, auto checks, clean match and found data.
3. Point out that CMP checks records first, then asks only landlord-only unknowns.
4. Show the property brain and action plan.
5. Click `Book legal essentials` or `Request quotes first`.
6. Show the fake confirmation and explain no supplier/payment/upload is real.
7. Open Evidence Vault, Compliance Centre, Ask CMP and Monitoring to prove the same property brain powers the wider product.

If you have more time, switch to No EPC, HMO/licensing, damp/mould and done-for-me stories from guided mode. End each story by clicking one next-step action so the demo shows commercial follow-through rather than stopping at the workspace.

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

## Nick-Facing Guided Demo Mode

Use `Guided demo` inside Journey OS, or open `dashboard-labs.html?journeyDemo=nick`.

For the full A-Z prototype, the normal landlord-facing entry is now `Add / check property` in the sidebar, `Check My Property` on the dashboard, or `dashboard-labs.html?state=new-property`. All three routes lead into the same simulated Journey OS property check, then return to the Property Workspace, Compliance Centre, Evidence Vault, services and monitoring.

Recommended opening line:

> This is simulated data, but the journey is the important part. The real product would connect EPC, address, licensing and document intelligence later. Right now we are testing whether the landlord journey makes sense and whether the commercial service paths feel compelling.

### 2-Minute Demo Script

1. Open Journey OS and click `Guided demo`.
2. Click `Run the 2-minute demo`.
3. Use `Next moment` through:
   - address start,
   - simulated auto checks,
   - clean property match,
   - review found data,
   - landlord-only unknowns,
   - property brain,
   - action plan,
   - workspace monitoring.
4. Point out: CMP checks what it can before asking questions.
5. Point out: every branch returns to one property workspace.
6. End on Monitoring and say: this is the subscription value.

### 10-Minute Demo Script

1. Start with the clean property story to explain the mainline.
2. Restart and run `No EPC found`.
3. Show that a missing EPC becomes a clear action, not a dead end.
4. Run `HMO/licensing risk`.
5. Point out that landlord answers add licensing and safety services.
6. Run `Damp, mould and enforcement risk`.
7. Show tenant message and timeline/evidence value.
8. Run `Done-for-me compliance plan`.
9. Show the service basket and click one quote/book/concierge option through to the fake confirmation.
10. Point out the pending/generated evidence in Evidence Vault, the Compliance Centre bridge, and Monitoring follow-up.
11. End in Monitoring and portfolio preview.

### Five Story Map

| Guided story | What to click | What to point out | Question for Nick |
| --- | --- | --- | --- |
| Clean property check | Run 2-minute demo | Property brain turns a property into a plan | Does the main landlord journey make sense? |
| No EPC found | Start `No EPC found` | Missing data becomes an action | Is this a strong way to handle failed lookups? |
| HMO/licensing risk | Start `HMO/licensing risk` | Answers add a specialist side route | Which HMO/licensing services feel commercial? |
| Damp, mould and enforcement risk | Start `Damp, mould and enforcement risk` | Condition, evidence and messages join the same workspace | Does this go beyond certificate checking in the right way? |
| Done-for-me compliance plan | Start `Done-for-me compliance plan` | CMP becomes a service concierge | Would landlords pay for this managed route? |

### Service Journey Test Add-On

After any story reaches the workspace, click a service next step such as `Book legal essentials`, `Request quotes first`, `Book EPC assessment` or `Book damp/mould survey`. The prototype should show a fake confirmation, update service status, add pending/generated evidence, update monitoring, and return to the workspace without any live supplier, payment or upload integration.

### What Is Simulated In Guided Mode

- Fake API checks.
- Fake EPC checks.
- Fake local authority and licensing checks.
- Fake document scanning.
- Fake service booking and quote requests.
- Fake Ask CMP responses.
- Fake monitoring.

### What Would Be Real Later

- EPC API.
- Address and UPRN lookup.
- Local authority and licensing lookup.
- Secure evidence storage.
- Document intelligence.
- Real supplier booking and quotes.
- Real compliance rules engine.
- Accounts, roles and permissions.

## Suggested Next Pass

After testing with Nick, convert the strongest story into a tighter sales/demo route and decide which underlying integration should be built properly first.
