# CMP Prototype Rules

These rules apply to CMP Prime, CMP Vault, and CMP Concierge.

## A. The Product Promise

CMP helps self-managing landlords:

- see whether a property is ready to rent;
- organise property records;
- identify missing evidence;
- prioritise one next action;
- prepare service requests;
- monitor renewals and risk areas;
- keep a clear property file.

## B. The Shared Journey

Every prototype must support:

Homepage
-> Add Property
-> Smart Checks
-> Review found data
-> Answer missing details
-> Property Brain / Property Vault / Property Plan
-> One next best action
-> Evidence or service action
-> Monitoring
-> My Properties

## C. Required Landlord Record Areas

Every prototype must include:

- EPC
- Gas Safety
- EICR
- smoke alarms
- CO alarms
- licensing/HMO review
- tenancy agreement
- deposit protection
- inventory/check-in
- inspection records
- repair records
- damp/mould case file
- contractor records
- service request history
- renewal monitoring

## D. Required Evidence States

Use:

- Not known
- Landlord says held
- Evidence added
- Needs renewal
- Service request drafted
- Service requested
- Monitor later

Do not claim:

- legally verified
- officially compliant
- supplier contacted
- payment taken
- live official lookup completed

unless that action genuinely happened.

## E. API Strategy

Use an adapter layer in each prototype.

Allowed now:

- Postcodes.io for live postcode validation and local authority/admin data.

Optional later:

- EPC API adapter if a safe server-side or environment-safe method exists.

Do not:

- hardcode private API keys;
- expose tokens in frontend JavaScript;
- block the demo if EPC lookup is unavailable;
- fake official verification for Gas Safety, EICR, smoke/CO, licensing, deposits or tenancy documents.

## F. Copy Rules

Use landlord-facing terms:

- Smart Checks
- Property Brain
- Property file
- Evidence Vault
- Next action
- Service request
- Monitoring
- Renewal
- Needs evidence
- Landlord confirmed

Do not use:

- canonical
- renderer
- fixture
- journey OS
- labs
- command centre
- state
- demo mode
- QA route
- legal compliance decision
- official verification

## G. UX Rules

Every prototype must:

- show one clear primary CTA per screen;
- avoid duplicate progress systems;
- avoid duplicate Add Property routes;
- avoid permanent side panels that compete with the main task;
- avoid portfolio tools until there are at least two properties;
- keep Ask CMP contextual;
- avoid invisible or low-contrast copy;
- work at 1440x1000, 1280x800, 1024x900 and 390x844;
- have no horizontal overflow;
- use 44px minimum tap targets on mobile.

## H. Brand Separation

Each prototype must look visibly different.

CMP Prime:

- logo: shield/tick mark
- palette: charcoal, emerald, clean white, pale mint
- style: modern SaaS dashboard
- emphasis: next action and readiness

CMP Vault:

- logo: vault/folder/keyhole mark
- palette: navy, brass, parchment, slate
- style: secure property file / digital binder
- emphasis: evidence, records and renewals

CMP Concierge:

- logo: house/service bell mark
- palette: deep plum, blue, coral, soft lilac
- style: helpful service organiser
- emphasis: service requests and guided help

## Programme Boundary

Prototype work must stay inside `prototypes/` unless a later prompt explicitly changes the boundary. Old CMP pages, rescue prototype files, root HTML/CSS/JS, `dashboard-labs.*`, `public-pages.js`, `landing.css`, Netlify config, Supabase files, old audit folders, old screenshot folders, and old CMP reports are out of scope.
