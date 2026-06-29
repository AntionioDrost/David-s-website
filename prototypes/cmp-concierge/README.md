# CMP Concierge

## Concept

CMP Concierge is the services-first version of CMP. It organises landlord tasks around guided help, service request preparation, missing evidence, and follow-up monitoring.

It helps a self-managing landlord understand what CMP has found, what needs landlord confirmation, and which service request or evidence action should happen next.

## Target User Feeling

The landlord should feel helped, not judged. The experience should feel practical, friendly, and guided while still being clear about missing evidence and renewal risks.

## Visual Direction

- Helpful service organiser.
- Guided task flow.
- Warm but professional service request surfaces.
- Main task stays central; support actions stay contextual.
- No legacy route patterns or old broken journey code.

## Logo Direction

- House/service bell mark.
- Should suggest practical help for landlords.
- Must not imply that suppliers have been contacted unless a real request has been sent.

## Colour Scheme

- Deep plum.
- Blue.
- Coral.
- Soft lilac.

The palette must be visibly different from CMP Prime and CMP Vault.

## Core Journey

Homepage
-> Add Property
-> Smart Checks
-> Review found data
-> Answer missing details
-> Property Plan
-> One next best action
-> Evidence or service action
-> Monitoring
-> My Properties

## Pages To Build Later

- Homepage / guided help entry screen.
- Add Property.
- Smart Checks.
- Review found data.
- Missing details.
- Property Plan.
- Service request draft.
- Evidence upload simulation.
- Monitoring.
- My Properties.

Do not create these pages during the setup pass.

## What Must Not Be Copied From Old CMP

- Root-level CMP UI.
- Old journey code.
- Rescue prototype pages.
- Old service request patterns.
- Old Ask CMP placement.
- Old duplicated Add Property routes.
- Old low-contrast visual treatment.
- Old screenshot or audit outputs.

CMP Concierge must be built independently inside `prototypes/cmp-concierge/`.

## API Approach

- Use a local adapter layer for external data calls.
- Postcodes.io may be used for live postcode validation and local authority/admin data.
- EPC lookup may be added later only through a safe server-side or environment-safe adapter.
- The prototype must remain useful if EPC lookup is unavailable.
- Do not expose private tokens in frontend JavaScript.
- Do not fake official verification for Gas Safety, EICR, smoke/CO, licensing, deposits, or tenancy documents.
- Do not claim a supplier was contacted unless a real request was sent.

## Validation Requirements

- One primary CTA per screen.
- One Add Property path.
- One postcode input.
- One Smart Checks step.
- One found-data review.
- One next action.
- Service request draft is clear.
- Evidence state can change after a simulated upload.
- Service request state can change after a drafted request.
- Monitoring updates after evidence or service changes.
- Ask CMP appears only in context.
- My Properties works.
- No invisible text.
- No horizontal overflow.
- Works at 1440x1000, 1280x800, 1024x900, and 390x844.
- Uses 44px minimum tap targets on mobile.
