# CMP Prime

## Concept

CMP Prime is the action-led version of CMP. Its internal shorthand is a landlord command centre, but public-facing copy must avoid that term and focus on readiness, clear findings, and one next action.

It helps a self-managing landlord see whether a property is ready to rent, what CMP has found, what needs evidence, and what action should happen next.

## Target User Feeling

The landlord should feel focused, confident, and guided. The experience should feel like a modern business tool that reduces uncertainty and makes the next step obvious.

## Visual Direction

- Modern SaaS dashboard.
- Clear readiness summary.
- Strong next action area.
- Sparse, high-contrast surfaces.
- No permanent side panels that compete with the main task.

## Logo Direction

- Shield/tick mark.
- Compact enough for a header and mobile view.
- Should signal readiness and protection without implying legal certification.

## Colour Scheme

- Charcoal.
- Emerald.
- Clean white.
- Pale mint.

The palette must be visibly different from CMP Vault and CMP Concierge.

## Core Journey

Homepage
-> Add Property
-> Smart Checks
-> Review found data
-> Answer missing details
-> Property Brain
-> One next best action
-> Evidence or service action
-> Monitoring
-> My Properties

## Pages To Build Later

- Homepage / property readiness entry screen.
- Add Property.
- Smart Checks.
- Review found data.
- Missing details.
- Property Brain.
- Evidence or service action.
- Monitoring.
- My Properties.

Do not create these pages during the setup pass.

## What Must Not Be Copied From Old CMP

- Root-level CMP UI.
- Old journey code.
- Rescue prototype pages.
- Old copy patterns.
- Old progress systems.
- Old Add Property routing.
- Old Ask CMP placement.
- Old screenshot or audit outputs.

CMP Prime must be built independently inside `prototypes/cmp-prime/`.

## API Approach

- Use a local adapter layer for external data calls.
- Postcodes.io may be used for live postcode validation and local authority/admin data.
- EPC lookup may be added later only through a safe server-side or environment-safe adapter.
- The prototype must continue gracefully if EPC lookup is unavailable.
- Do not expose private tokens in frontend JavaScript.
- Do not fake official verification for Gas Safety, EICR, smoke/CO, licensing, deposits, or tenancy documents.

## Validation Requirements

- One primary CTA per screen.
- One Add Property path.
- One postcode input.
- One Smart Checks step.
- One found-data review.
- One next action.
- Evidence state can change after a simulated upload.
- Service request state can change after a drafted request.
- Monitoring updates after evidence or service changes.
- Ask CMP appears only in context.
- My Properties works.
- No invisible text.
- No horizontal overflow.
- Works at 1440x1000, 1280x800, 1024x900, and 390x844.
- Uses 44px minimum tap targets on mobile.
