# CMP Prime V2 A-Z Checker Brief

CMP Prime V2 is an A-Z rental compliance checker for self-managing landlords. It turns a rental property into a scenario-aware action plan, then guides the landlord toward proof upload, service booking, more answers or monitoring.

This is a product and UX brief for the next build. It is not an implementation. It must not be treated as permission to copy CMP Prime V1.

## Product Definition

Position CMP Prime V2 as:

> An A-Z rental compliance checker for self-managing landlords that turns one property into a scenario-aware action plan and service-booking journey.

Core promise:

> "Check every key rental requirement, fix what is missing, and keep the property ready."

Homepage positioning must not use "one property at a time". The language must allow future portfolio features even if the V2 prototype focuses on one property.

Better homepage positioning options:

- "Rental compliance, evidence and services in one guided checker."
- "Check a rental property from A-Z, then fix what is missing."
- "Turn a rental property into a clear compliance action plan."
- "Find the gaps, book the services, store the proof."

Commercial intent:

- CMP should make money by leading naturally to service bookings where landlord gaps require professional help.
- The service opportunity should emerge from the compliance check, not appear as a disconnected marketplace.
- Evidence and monitoring should support the service loop by showing what the service will produce and when it needs renewal.

## Hard Guardrails

- Do not build from CMP Prime V1.
- Do not patch CMP Prime V1.
- Do not copy CMP Prime V1 layouts.
- Do not copy CMP Prime V1 section or tab structure.
- Do not inspect old dashboard-labs UI as source material.
- Do not create a tabbed property dashboard.
- Do not make Evidence, Services and Monitoring separate competing journeys.
- Do not create generic "add evidence" as the only resolution route.
- Do not add OpenAI API, expose API keys or make Ask CMP the main journey.
- Do not production deploy from this branch.
- Do not use `/Users/davidtaylor/Code/mysite`.

## Core V2 Journey

The V2 flow should be:

1. Start check.
2. Enter postcode.
3. Select exact address.
4. Confirm property scenario.
5. Run A-Z Smart Check.
6. Review compliance map.
7. See required, missing, optional and monitor-later items.
8. Choose the highest priority path:
   - add proof;
   - book service;
   - answer more questions;
   - monitor later.
9. Complete or simulate action.
10. Property plan updates.
11. My Properties shows one property with integrated next steps.

The property page should not be a tabbed dashboard. It should use a single integrated "Compliance Map" or "Property Plan" layout that keeps the journey visible after the initial check.

The landlord should see:

- property identity;
- overall readiness;
- A-Z categories;
- highest priority issue;
- bookable service options;
- evidence gaps;
- monitoring dates;
- what has improved after each action.

## Address And EPC Logic

The correct Add Property order is:

1. Postcode.
2. Address list.
3. Exact address selected.
4. Property scenario.
5. EPC search or prototype EPC match.

Do not show an EPC result before an exact address is selected.

Address picker requirements:

- If OS Places or another safe address API is unavailable, show a clearly labelled prototype address list generated from the postcode.
- The UI must still feel like the landlord is selecting an exact property.
- Do not imply that a postcode alone identifies one property.
- The selected address should become the identity anchor for all later module checks, evidence and bookings.

EPC requirements:

- EPC data should be matched after address selection.
- If live EPC is unavailable, use honest copy: "Prototype EPC match shown for review."
- If EPC cannot be matched, treat EPC as a gap: "EPC not found - upload proof or book EPC assessment."
- If the landlord corrects the address, EPC matching should run again only after the corrected exact address is selected.

## Modular Engine Model

V2 should be defined around modular engines. The prototype can use deterministic local data, but the UX should make it clear that CMP understands property scenario, compliance modules, evidence, services and monitoring as connected parts of one checker.

### A. Property Identity Engine

Stores:

- address;
- postcode;
- local authority;
- property type;
- bedrooms;
- tenancy status;
- occupancy status;
- HMO/licensing uncertainty;
- known repairs/damp/mould issue.

### B. Scenario Engine

Determines which modules matter based on landlord answers.

Scenarios include:

- preparing to rent;
- currently tenanted;
- vacant;
- HMO or possible HMO;
- family let;
- student let;
- short-term/temporary let;
- property with known damp/mould;
- property with missing certificates;
- property with expired/unknown EPC;
- landlord has documents but has not uploaded proof;
- landlord needs service help.

The scenario engine should change module relevance, urgency, copy and available actions. For example, a possible HMO should raise Licensing/HMO to review-required status, while known damp/mould should create a fix-first or book-now path depending on severity.

### C. A-Z Compliance Module Engine

Modules:

- Address and property identity
- EPC
- Gas Safety
- EICR
- Smoke alarms
- CO alarms
- Licensing/HMO
- Tenancy agreement
- Deposit protection
- Prescribed information
- Right to Rent note
- Inventory/check-in
- Inspections
- Repairs
- Damp/mould
- Contractor records
- Service history
- Renewal monitoring

Each module has:

- status;
- source;
- evidence state;
- risk/urgency;
- possible actions;
- service options;
- monitoring date.

Each module should resolve to one clear status and one clear next action in the main Compliance Map.

### D. Priority Engine

Ranks actions into:

1. Fix first.
2. Book now.
3. Add proof.
4. Answer next.
5. Monitor later.

Only one "Fix first" item should dominate the page. Supporting next steps can be visible, but the landlord should never have to choose between several competing primary calls to action.

### E. Evidence Engine

Evidence is attached to the relevant module and action. It is not a separate journey.

Evidence states should include:

- no proof held;
- landlord says proof exists but not uploaded;
- proof uploaded;
- prototype proof added;
- generated after service;
- renewal date needed.

When proof is added, the relevant module should update immediately and the Property Plan should show what improved.

### F. Service Engine

Maps compliance gaps to services.

Direct bookable services:

- EPC assessment
- Gas Safety check
- EICR
- Smoke/CO alarm check
- Property inspection
- Inventory/check-in support

Request/review services:

- Licensing/HMO review
- Damp/mould inspection
- Tenancy pack support
- Repairs follow-up
- Possession-prep evidence review if later added

The service flow should feel commercial and useful. It should show the landlord why the service is relevant, what it should produce, and what state will change in the Compliance Map after booking.

### G. Monitoring Engine

Creates future reminders from:

- evidence expiry dates;
- service booking outcomes;
- landlord answers;
- inspection dates;
- renewal intervals;
- monitor-later decisions.

Monitoring should appear as an outcome of the check, not as a separate product area that competes with the main action.

## Main Property Screen Model

Use one integrated screen, not tabs.

Header:

- address;
- readiness;
- one fix-first action.

Main area:

- A-Z Compliance Map.

Each module appears as a row or card with:

- category;
- status;
- evidence;
- action;
- service option if relevant.

Right or lower area:

- "What to do next" panel with only one top recommendation.

Below:

- "Bookable services from this check";
- "Monitoring created from this check".

Evidence, Services and Monitoring should remain visible as outcomes of the checker, not separate competing products.

## A-Z Compliance Map States

Every module should resolve to one of these states:

- Checked
- Needs answer
- Needs proof
- Needs service
- Bookable now
- Review required
- Monitor later
- Not relevant

Each module should have one clear action:

- Add proof
- Book service
- Answer question
- Mark not relevant
- Set reminder
- View detail

Do not show five actions for one module in the map. If more choices are needed, they should appear only after the landlord opens that module or resolves the current top action.

## Service Booking Experience

Services should not only be "draft request".

Prototype booking flow:

1. Landlord clicks "Book service" from a module.
2. CMP opens a service booking panel.
3. Property and gap are prefilled.
4. Landlord selects:
   - urgency;
   - preferred date/time;
   - contact preference;
   - whether they already have a contractor.
5. CMP shows:
   - service summary;
   - likely evidence outcome;
   - what the contractor/landlord needs next.
6. Prototype state becomes:
   - "Booking ready"; or
   - "Service request prepared".

Because this is a prototype, still show:

- "No supplier contacted in this prototype."
- "No payment taken in this prototype."

The interaction should feel like a booking journey, not a vague request form.

## Action Resolution Experience

Fix "Resolve this action" by giving each top action relevant options.

For missing Gas Safety:

- Add existing certificate
- Book Gas Safety check
- Mark as not held yet
- Ask CMP what evidence is needed

For missing EICR:

- Add existing EICR
- Book EICR
- Mark as not held yet
- Ask CMP why it matters

For missing EPC:

- Add EPC proof
- Book EPC assessment
- Search again after address correction

For smoke/CO:

- Add alarm proof
- Book smoke/CO check
- Mark landlord confirmed
- Set reminder

For damp/mould:

- Add repair/inspection note
- Book inspection
- Create monitoring item

Do not use a generic "add evidence" popup for every action.

## My Properties

My Properties must show one property once.

Inside that one property card, show integrated status:

- readiness;
- fix-first action;
- 2-3 supporting next steps;
- evidence gaps count;
- services ready to book count;
- monitoring reminders count.

Do not duplicate the same property as separate cards because it has multiple actions.

Portfolio features should remain hidden until there are at least two distinct properties. The copy and structure can still allow CMP to scale beyond one property later.

## Ask CMP V2

Ask CMP should remain optional but feel more realistic.

Prototype behaviour:

- show a text input;
- accept landlord typed question;
- provide deterministic responses from templates;
- show suggested prompts;
- tie responses to the active property, module or action.

Suggested prompts:

- "What should I fix first?"
- "Can I rent this property yet?"
- "What proof do I need for this?"
- "Which services can I book?"
- "What happens if I do nothing?"
- "What should I monitor next?"

Do not add OpenAI API. Do not expose API keys. Do not make Ask CMP the main journey.

## Homepage Repositioning

Homepage must explain CMP within 10 seconds.

Avoid:

- "Rental readiness, one property at a time."

Use one of:

- "Check a rental property from A-Z, then fix what is missing."
- "Rental compliance, evidence and services in one guided checker."
- "Find the gaps, book the services, store the proof."
- "A clearer way to get a rental property ready."

Homepage should show:

1. Check the property.
2. See the A-Z compliance map.
3. Add proof or book services.
4. Keep renewals monitored.

It should preview the commercial/service side earlier without overwhelming the user.

## What V2 Must Feel Like

V2 should feel:

- more original;
- more commercially useful;
- more scenario-aware;
- more like an A-Z checker;
- less like a tabbed dashboard;
- less like a document vault;
- less like an old CMP reskin;
- more obviously useful to landlords;
- more directly connected to service revenue.

V2 must prove:

- CMP understands the property scenario;
- CMP knows which records matter;
- CMP tells the landlord what is missing;
- CMP can convert a missing item into a service booking;
- CMP stores proof;
- CMP monitors future dates;
- CMP can later scale to portfolio-wide features.

## Acceptance Gates

CMP Prime V2 fails if:

- it looks like V1 with small changes;
- it uses the same tabbed dashboard structure;
- Add Property has no address picker;
- EPC appears before address selection;
- the main property screen has separate disconnected sections;
- My Properties duplicates one property;
- service flow is only a vague request form;
- Resolve Action opens a generic add-evidence modal;
- Ask CMP has no typed input;
- the homepage does not explain the product quickly.

CMP Prime V2 passes if:

- address selection feels real;
- EPC appears only after address selection;
- the A-Z compliance map is the centre of the product;
- each module has one clear status and one clear action;
- the top recommendation is obvious;
- services are bookable from gaps;
- evidence updates the relevant module;
- monitoring is created from actions;
- My Properties shows one property once with integrated next steps;
- the prototype feels materially different from old CMP.

## Future Build Instructions

The future V2 build must:

- build inside `prototypes/cmp-prime-v2/` or replace `prototypes/cmp-prime/` only from the brief branch, not from V1;
- avoid copying V1 HTML/CSS/JS;
- use a new localStorage namespace, for example `cmpPrimeV2Prototype`;
- create a proper address-selection step;
- delay EPC until after address selection;
- use a modular compliance engine;
- use an integrated A-Z Compliance Map;
- create service booking panels;
- fix My Properties duplication;
- make Ask CMP typed but deterministic;
- avoid old root-level CMP UI entirely.

Recommended build folder:

`prototypes/cmp-prime-v2/`

## Build Handoff Summary

The next builder should start from this brief and design a new V2 experience around the A-Z Compliance Map. The centre of the product is not a dashboard and not a vault; it is a guided checker that explains what matters, identifies what is missing, converts gaps into proof or services, and creates monitoring from the result.
