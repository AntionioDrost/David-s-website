# CMP Journey OS Demo Script

## Core Demo Path

1. Open `dashboard-labs.html`.
2. Click `Check My Property`.
3. Use the default `Clean property match` scenario.
4. Run the address flow, confirm the clean match, review found data, answer unknowns, build the property brain, open the action plan, then enter the Property Workspace.
5. Explain the core promise: CMP checks what it can, asks what it must, builds a property brain, then routes every branch back to the workspace.

## Scenario Paths

- Clean property journey: default scenario, confirm match, show scores and action plan.
- Multiple match journey: switch to `Multiple EPC/address matches`, show multiple EPC/address choices, select one, explain identity confidence.
- No EPC journey: switch to `No EPC found`, choose currently rented or advertised, show EPC as an urgent action.
- EPC E future-risk journey: switch to `EPC E future-risk`, show future-risk and EPC improvement plan.
- EPC F/G urgent journey: switch to `EPC F/G urgent MEES risk`, show urgent MEES risk and EPC service recommendation.
- Occupied property journey: switch to `Occupied normal single household`, answer deposit/tenancy questions, show evidence gaps.
- Vacant/pre-let journey: switch to `Vacant/pre-let property`, show void/re-let services and readiness actions.
- Flat/block journey: switch to `Flat/block/common parts`, show leasehold/common-parts evidence logic.
- HMO risk journey: switch to `HMO/high-occupancy risk`, show licensing/HMO route and service basket.
- Damp/mould journey: switch to `Damp/mould complaint`, show Damp/Mould Survey and repair evidence route.
- Council/enforcement journey: switch to `Council/enforcement contact`, show enforcement response support and council letter upload path.
- Done-for-me journey: switch to `Done-for-me landlord`, show concierge-style service basket.

## Wow Layer Paths

- Upload evidence journey:
  1. Open Workspace > Evidence.
  2. Click `Upload evidence simulation`.
  3. Choose EICR, Deposit Certificate, Council letter or Insurance.
  4. Watch the fake scan stages.
  5. Accept the scan result and show evidence vault/timeline update.

- Book service journey:
  1. Open Workspace > Services.
  2. Open a Gas Safety, EICR, Licensing, Deposit or Damp/Mould service.
  3. Show what CMP already knows and the supplier-ready questions.
  4. Book now, request quote, add to basket or save for later.

- Ask CMP journey:
  1. Open Workspace > Ask CMP.
  2. Click `Can I rent this property now?` or `What should I book?`.
  3. Show the scripted property-specific response and action buttons.

- Tenant message journey:
  1. From Ask CMP, click `Generate tenant message`.
  2. Show the editable-looking practical draft.
  3. Log to timeline.

- Monitoring journey:
  1. Open Workspace > Monitoring.
  2. Set reminder, mark watched or defer a monitoring card.
  3. Show timeline update and monitoring status.

- Portfolio preview journey:
  1. Open Workspace > Overview.
  2. Scroll to Portfolio preview.
  3. Show 18 Willow Brook Drive, 57 The Butts and 22 King Street with portfolio-level stats.

## What Is Fake

- API checks, UPRN, EPC, licensing, local authority and property clues.
- Document upload, scanning, extraction, address matching and expiry checking.
- Ask CMP responses.
- Tenant messages.
- Supplier booking, quote requests and service basket.
- Monitoring reminders and portfolio stats.

## What Needs Real Integrations Later

- Official property/address and UPRN lookup.
- EPC register lookup.
- Local authority/licensing data.
- Secure document upload and storage.
- Real document scanning/extraction.
- Supplier availability, booking and quote workflows.
- Payments.
- Account-backed persistence.
- Professional/legal review workflows.

## Known Limitations

- Local prototype state only.
- No legal advice or compliance guarantee.
- No real messages are sent.
- No suppliers are contacted.
- No documents are uploaded.
- Some outcomes are scenario-guided rather than fully rule-driven.

## Suggested Next Pass

Create a tighter Nick-facing guided demo mode with scripted narration, fewer visible controls, and a polished happy-path sequence for five core stories: clean check, no EPC, HMO risk, damp/mould, and done-for-me.
