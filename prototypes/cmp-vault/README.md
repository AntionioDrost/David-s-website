# CMP Vault

## Concept

CMP Vault is the records-first version of CMP. It presents the product as a secure property file and evidence vault for self-managing landlords.

It helps a landlord organise rental records, understand missing evidence, prepare service requests, and monitor renewals without implying that CMP has legally verified compliance.

## Target User Feeling

The landlord should feel organised, reassured, and in control of the property file. The experience should make evidence gaps easy to spot and renewals easy to track.

## Visual Direction

- Secure property file / digital binder.
- Evidence-first layout.
- Record sections with clear status labels.
- Calm, archival, trustworthy visual tone.
- No cluttered dashboard patterns from old CMP pages.

## Logo Direction

- Vault/folder/keyhole mark.
- Should imply safe record keeping.
- Must not imply government approval or official legal certification.

## Colour Scheme

- Navy.
- Brass.
- Parchment.
- Slate.

The palette must be visibly different from CMP Prime and CMP Concierge.

## Core Journey

Homepage
-> Add Property
-> Smart Checks
-> Review found data
-> Answer missing details
-> Property Vault
-> One next best action
-> Evidence or service action
-> Monitoring
-> My Properties

## Pages To Build Later

- Homepage / property file entry screen.
- Add Property.
- Smart Checks.
- Review found data.
- Missing details.
- Property Vault.
- Evidence record detail.
- Service request preparation.
- Renewal monitoring.
- My Properties.

Do not create these pages during the setup pass.

## What Must Not Be Copied From Old CMP

- Root-level CMP UI.
- Old journey code.
- Rescue prototype pages.
- Old evidence displays.
- Old route structure.
- Old terminology.
- Old portfolio tools before multiple properties exist.
- Old screenshot or audit outputs.

CMP Vault must be built independently inside `prototypes/cmp-vault/`.

## API Approach

- Use a local adapter layer for external data calls.
- Postcodes.io may be used for live postcode validation and local authority/admin data.
- EPC lookup may be added later only through a safe server-side or environment-safe adapter.
- The prototype must not block if EPC lookup is unavailable.
- Do not expose private tokens in frontend JavaScript.
- Do not fake official verification for Gas Safety, EICR, smoke/CO, licensing, deposits, or tenancy documents.

## Validation Requirements

- One primary CTA per screen.
- One Add Property path.
- One postcode input.
- One Smart Checks step.
- One found-data review.
- One next action.
- Evidence states are visible and understandable.
- Evidence state can change after a simulated upload.
- Service request state can change after a drafted request.
- Monitoring updates after evidence or service changes.
- Ask CMP appears only in context.
- My Properties works.
- No invisible text.
- No horizontal overflow.
- Works at 1440x1000, 1280x800, 1024x900, and 390x844.
- Uses 44px minimum tap targets on mobile.
