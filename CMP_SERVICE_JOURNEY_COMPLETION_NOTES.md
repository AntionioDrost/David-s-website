# CMP Service Journey Completion Notes

Date: 2026-06-15
Branch: `labs/cmp-journey-os-v1`

## What was completed

- Service cards now use a clearer fake lifecycle: Recommended, Added to basket, Quote requested, Booked, In progress, Completed and Saved for later.
- Service detail modals now show the property, linked compliance area, why CMP recommends the service, expected evidence and supplier-ready questions.
- Booking and quote intakes now end with confirmation panels instead of silently returning to the workspace.
- Plan-level buttons now create fake bundle confirmations for urgent, legal essentials, risk-protected, future-proof, quote-first and done-for-me routes.
- Booked/in-progress/completed services create local evidence and monitoring side effects.
- Completed services generate simulated evidence and update the active property brain, Compliance Centre, Evidence Vault, timeline and monitoring.
- Ask CMP now understands fake bookings, quote requests, pending evidence and completed service state.

## Fake states added

- Pending evidence from fake bookings.
- Generated evidence from completed fake services.
- Quote follow-up monitoring.
- Service completion / renewal monitoring.
- Service confirmation references such as `CMP-BOOK-*`, `CMP-QUOTE-*` and `CMP-EVID-*`.

## Evidence updates simulated

- Gas Safety, EICR, EPC, licensing, deposit, tenancy, condition and monitoring services can create pending or generated evidence.
- Evidence remains local to the prototype and is never uploaded or stored remotely.
- Evidence Vault reads these local items and can route back to the linked service or Journey OS workspace.

## What remains fake/local/mock

- No supplier is contacted.
- No payment is taken.
- No document is uploaded.
- No API, document intelligence, rules engine or legal analysis runs.
- Service status and evidence confidence are local prototype state only.

## How to test

- Legal essentials: build the property brain, open the action plan and click `Book legal essentials`.
- Individual service: open Services, click `View details` or `Book now` on Gas Safety or EICR, complete the fake intake and inspect the confirmation.
- Quote request: click `Request quotes first`, then ask CMP `What should I do after requesting quotes?`.
- Completion: mark a booked/in-progress service complete and check Evidence Vault, Compliance Centre, Timeline and Monitoring.
- Evidence: simulate an EICR, Deposit Certificate, EPC or Council Letter upload and check the same bridge surfaces.
- Guided demo: run a guided story, use the next-step buttons, and confirm they open the completed fake service/evidence journeys.
