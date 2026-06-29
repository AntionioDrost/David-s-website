# CMP Prime Experience Brief

## Purpose

This brief defines the CMP Prime user experience before implementation. It is an anti-regression design lock for the future CMP Prime prototype build, not a build pass.

CMP Prime must be a reinvented upgrade, not a restyled version of any previous CMP prototype. The future build must solve the landlord journey first, then add visual polish only where it supports clarity.

The main failure to avoid is a landlord seeing many features but not knowing what to do next. CMP Prime must make one property, one readiness picture, and one next action obvious within 30 seconds.

## Product Positioning

CMP Prime is an action-led landlord command centre for self-managing landlords. This is the product definition, not a phrase that should dominate public-facing UI copy.

Core promise:

"Know what's missing, what to do next, and where every property record is stored."

The experience should feel:

- simple;
- commercially impressive;
- landlord-specific;
- practical;
- evidence-led;
- reassuring;
- modern;
- focused on one next action.

It should not feel:

- like a generic dashboard template;
- like a legal advice tool;
- like a government website;
- like a document archive only;
- like a chatbot app;
- like an old CMP repair branch;
- like a feature dump.

## Anti-Regression Rules

CMP Prime must avoid these old-prototype failure patterns:

1. Too many features visible at once.
2. Multiple Add Property routes or entry points.
3. Duplicate progress systems.
4. Duplicate "what to do next" areas.
5. Demo or scenario controls leaking into the normal journey.
6. Portfolio tools appearing before the landlord has multiple properties.
7. Ask CMP acting like a competing command centre instead of contextual help.
8. Services appearing as a disconnected catalogue instead of a response to property gaps.
9. Evidence, actions, services and monitoring feeling like separate products.
10. Vague handoff copy that does not explain what happens next.
11. UI passing automated checks while still feeling confusing manually.
12. Low-contrast or invisible text.
13. Too much implementation language.
14. A landlord not knowing what to do within 30 seconds.

The future build must use landlord-facing language. Avoid internal or legacy terms such as canonical, renderer, fixture, journey OS, labs, demo mode, QA route, legal compliance decision, and official verification.

## Core UX Model

The CMP Prime journey is:

Property -> Smart Checks -> Missing details -> Property Brain -> One next action -> Evidence or service -> Monitoring

Every screen must answer one landlord question:

| Screen | Landlord question |
| --- | --- |
| Homepage | What does CMP do for me? |
| Add Property | Which property am I checking? |
| Smart Checks | What has CMP found? |
| Review Found Data | What does CMP still need from me? |
| Property Questions | What do I need to confirm? |
| Property Brain Overview | How ready is this property? |
| Action Plan | What should I fix first? |
| Evidence Vault | Where do I store proof? |
| Services | What help can I request for this gap? |
| Monitoring | What do I need to remember later? |
| My Properties | Which property needs attention next? |
| Ask CMP drawer | What does this record, gap, or action mean? |

## Screen-by-Screen Brief

### 1. Homepage

User question: What does CMP do for me?

Purpose: Explain CMP Prime quickly as a guided readiness check for one rental property, with a clear promise that CMP will show what is missing and what to do next.

Primary CTA: Check a property.

Secondary CTA: View example property, if needed for a future prototype walkthrough. It must be visibly secondary and must not become Demo Mode.

What must be visible:

- the core promise in plain landlord language;
- one strong property-check entry point;
- a short explanation of Smart Checks, Property Brain, Evidence Vault and Monitoring as one connected flow;
- high-contrast logo and navigation;
- enough below-the-fold hinting to show this is a full product experience.

What must be hidden:

- portfolio comparison;
- scenario toggles;
- service catalogue browsing;
- permanent Ask CMP panel;
- multiple Add Property links competing for attention.

State change: Starting the journey creates an active property check session.

Manual review fails if: A landlord cannot explain within 30 seconds that CMP checks one property, identifies missing records, and recommends one next action.

### 2. Add Property

User question: Which property am I checking?

Purpose: Capture the property address with minimum friction and make clear that the check starts with one property.

Primary CTA: Run Smart Checks.

Secondary CTA: Enter address manually, shown only if postcode lookup is unavailable or the landlord cannot find the address.

What must be visible:

- one postcode input;
- selected address confirmation;
- clear note that postcode data can help identify location and local authority context;
- reassurance that missing records can be added later;
- source label when live postcode data is used: "Postcode data from live postcode lookup".

What must be hidden:

- duplicate postcode forms;
- Add Property links elsewhere on the same screen;
- portfolio setup;
- supplier/service prompts;
- advanced property settings before an address exists.

State change: The selected property becomes the active property and Smart Checks can run against it.

Manual review fails if: There is more than one obvious way to add a property, the address choice is unclear, or failure of a live lookup blocks the journey.

### 3. Smart Checks

User question: What has CMP found?

Purpose: Show that CMP is checking available property context and separating found data from records that still need landlord confirmation.

Primary CTA: Review found data.

Secondary CTA: Continue with prototype data if a live EPC lookup is unavailable.

What must be visible:

- one Smart Checks step;
- simple check categories such as address, local authority, EPC, and required landlord records;
- honest found/not found statuses;
- source labels such as "Postcode data from live postcode lookup" and "Prototype EPC data shown for review";
- reassurance that unverified landlord records are not being officially checked.

What must be hidden:

- technical API logs;
- fake official verification;
- legal advice claims;
- duplicate progress bars;
- controls that simulate unrelated scenarios.

State change: The property gains a found-data set and a missing-details list.

Manual review fails if: The screen claims Gas Safety, EICR, smoke/CO, licensing, deposit or tenancy records have been officially checked without evidence.

### 4. Review Found Data

User question: What does CMP still need from me?

Purpose: Let the landlord confirm or correct what CMP found before CMP asks only for missing information.

Primary CTA: Confirm and continue.

Secondary CTA: Edit found data.

What must be visible:

- found address and local authority/admin context;
- EPC information if available, clearly labelled as live or prototype review data;
- a short list of missing record areas CMP still needs;
- honest source labels;
- visible distinction between "found", "not known" and "needs landlord confirmation".

What must be hidden:

- unrelated service offers;
- all record categories expanded at once;
- any readiness score that competes with the later Property Brain;
- Ask CMP as a permanent side panel.

State change: Confirmed data is marked as reviewed and the remaining missing details become the next question set.

Manual review fails if: The landlord cannot tell the difference between data CMP found and data they still need to confirm.

### 5. Property Questions

User question: What do I need to confirm?

Purpose: Ask only the missing details needed to build the Property Brain. The questions must feel targeted, not like a full compliance questionnaire.

Primary CTA: Save answers.

Secondary CTA: Skip for now, where an answer is genuinely optional for the prototype journey.

What must be visible:

- a short question set based on missing records;
- evidence states such as Not known, Landlord says held, Needs renewal, and Monitor later;
- plain descriptions of each record area;
- clear next-step consequence for unanswered items.

What must be hidden:

- already found or already confirmed items;
- legal conclusion language;
- long all-record forms;
- duplicate progress or completion systems;
- service prompts before the gap is known.

State change: Landlord answers update record states and allow the Property Brain to calculate readiness.

Manual review fails if: The screen asks everything at once or makes the landlord feel they are completing a legal audit.

### 6. Property Brain Overview

User question: How ready is this property?

Purpose: Translate found data and landlord confirmations into a focused readiness view with one recommended next action.

Primary CTA: Start next action.

Secondary CTA: View evidence gaps.

What must be visible:

- readiness summary for the active property;
- one dominant next action;
- evidence status labels such as "Needs evidence", "Landlord confirmed" and "Evidence added";
- grouped record areas without overwhelming detail;
- explanation of why the next action matters.

What must be hidden:

- multiple competing next actions;
- portfolio tools for a one-property user;
- permanent Ask CMP panel;
- service catalogue navigation;
- a second readiness/progress system elsewhere on the screen.

State change: The property receives a readiness status and a ranked next action.

Manual review fails if: The landlord can see a score but cannot tell what to fix first.

### 7. Evidence Vault

User question: Where do I store proof?

Purpose: Store or simulate storing evidence against the specific record gap or action that needs proof.

Primary CTA: Add evidence.

Secondary CTA: Mark as landlord confirmed, where proof is not yet available.

What must be visible:

- the active property;
- the record or action requiring evidence;
- evidence state labels;
- upload or simulated evidence flow;
- clear confirmation after evidence is added;
- connection back to the next action and monitoring.

What must be hidden:

- archive-only views with no action context;
- unrelated documents;
- claims that evidence has been legally verified;
- supplier/service upsells not tied to the current gap.

State change: The selected record changes from Not known or Needs evidence to Evidence added, or to Landlord confirmed if no proof is added.

Manual review fails if: The vault feels like a disconnected document archive instead of the proof point for an identified gap.

### 8. Action Plan

User question: What should I fix first?

Purpose: Give the landlord one practical next action, why it matters, and the two possible routes: add evidence or prepare a service request.

Primary CTA: Resolve this action.

Secondary CTA: Choose service help, where the action is a gap a supplier could help with.

What must be visible:

- one next action only;
- the reason it is first;
- affected record area;
- evidence route;
- service route if relevant;
- what happens after the action is resolved.

What must be hidden:

- long task boards;
- multiple equal-priority actions;
- unrelated service browsing;
- scenario controls;
- vague "continue" copy with no consequence.

State change: The next action changes to in progress, evidence added, service request drafted, monitor later, or resolved depending on landlord choice.

Manual review fails if: The screen turns into a task manager instead of a single guided action.

### 9. Services

User question: What help can I request for this gap?

Purpose: Let the landlord prepare a service request only because a property gap or next action needs help.

Primary CTA: Draft service request.

Secondary CTA: Return to evidence options.

What must be visible:

- the property and record gap that triggered the service route;
- recommended service type tied to the gap;
- request draft preview;
- labels: "Service request drafted", "No supplier contacted" and "No payment taken";
- clear explanation of what the landlord must do next.

What must be hidden:

- disconnected service catalogue;
- shopping basket;
- payment language;
- supplier contact claims;
- unrelated landlord services.

State change: The action or record state changes to Service request drafted. Monitoring can track follow-up, but no supplier is contacted and no payment is taken.

Manual review fails if: Services feel like a shop instead of a response to a property need.

### 10. Monitoring

User question: What do I need to remember later?

Purpose: Turn evidence, renewals, service drafts and follow-ups into clear reminders for the active property.

Primary CTA: Save monitoring plan.

Secondary CTA: Return to Property Brain.

What must be visible:

- renewal dates where known;
- records needing future evidence;
- service request follow-ups;
- monitor later state;
- connection back to My Properties.

What must be hidden:

- complex calendar product features;
- reminders unrelated to the property;
- portfolio-level analytics for one property;
- technical notification configuration.

State change: Monitoring items are created or updated for the property.

Manual review fails if: The landlord cannot tell which dates or follow-ups matter next.

### 11. My Properties

User question: Which property needs attention next?

Purpose: Show the landlord their property or properties with the most important next action surfaced first.

Primary CTA: Open property.

Secondary CTA: Add another property, shown clearly but without competing with the selected property's next action.

What must be visible:

- each property address;
- readiness status;
- one next action per property;
- monitoring alerts;
- evidence/service state summaries;
- portfolio comparison only when there are at least two properties.

What must be hidden:

- portfolio tools for a one-property user;
- duplicate Add Property entry points;
- dense analytics;
- service catalogue browsing.

State change: Returning from an action updates the relevant property row with its latest state and next action.

Manual review fails if: A one-property landlord sees portfolio features before they need them or cannot tell which property needs attention.

### 12. Ask CMP Drawer

User question: What does this record, gap, or action mean?

Purpose: Provide contextual explanations tied to the current property, record, evidence state or next action.

Primary CTA: Apply guidance to this step, where the drawer can help the landlord continue.

Secondary CTA: Close drawer.

What must be visible:

- short explanation of the current context;
- why CMP is asking for a record or action;
- honest limits on verification;
- a route back to the current task;
- no global chatbot framing.

What must be hidden:

- permanent command panel;
- unrelated prompts;
- general chatbot homepage;
- actions that compete with the screen's primary CTA;
- legal advice positioning.

State change: Ask CMP does not own the journey. It may clarify a decision or help the landlord continue, but the main screen remains the source of truth.

Manual review fails if: Ask CMP becomes the main product experience or competes with the one next action.

## Landlord Experience Principles

### A. Progressive disclosure

Do not show everything at once. Show the next useful thing, then reveal more only when it helps the landlord complete the current step.

### B. One primary action

Every screen should have one dominant action. Secondary actions must be visibly secondary and must not create alternate journeys.

### C. Evidence-led confidence

CMP should not claim something is legally verified unless proof exists and the product has genuinely performed that verification. Use honest states such as "Needs evidence", "Landlord confirmed" and "Evidence added".

### D. Services are attached to gaps

Services should appear because a property has a missing record or action. Do not make Services feel like a disconnected shop.

### E. Ask CMP is contextual

Ask CMP should help explain the current property, record or action. It must not dominate the layout or become a competing product surface.

### F. Portfolio appears later

Portfolio comparison is hidden until there are at least two properties. A one-property landlord should see their property and its next action, not portfolio tooling.

### G. Demo is the real journey

The normal product journey must be clear enough to show Nick. There must be no separate public Demo Mode and no visible scenario controls in the user journey.

## Data and API Experience

CMP Prime should behave honestly with live, unavailable and prototype data:

- Postcode lookup can be live through Postcodes.io.
- EPC should use a safe adapter/fallback.
- If live EPC is unavailable, show honest prototype data.
- Do not block the journey if EPC lookup fails.
- Do not pretend Gas Safety, EICR, smoke/CO, licensing, deposit or tenancy records have been officially checked.
- These records are evidence-led and landlord-confirmed until proof is added.
- Do not add private API keys.
- Do not expose tokens in frontend JavaScript.
- Do not claim supplier contact or payment unless that action genuinely happened.

Source and state labels:

- "Postcode data from live postcode lookup"
- "Prototype EPC data shown for review"
- "Landlord confirmed"
- "Evidence added"
- "Service request drafted"
- "No supplier contacted"
- "No payment taken"

## Record Areas

CMP Prime must be able to account for these landlord record areas without showing them all at once:

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

Use these evidence states where relevant:

- Not known
- Landlord says held
- Evidence added
- Needs renewal
- Service request drafted
- Service requested
- Monitor later

## Visual and Brand Direction

Logo: Shield/tick mark.

Colour scheme:

- charcoal;
- emerald;
- clean white;
- pale mint;
- bright green accent.

Style: Modern SaaS dashboard, but warmer and more landlord-specific than a generic analytics product.

Layout feeling:

- clean;
- confident;
- spacious;
- card-based;
- strong hierarchy;
- no pale text;
- no cramped side panels;
- no permanent command centre.

CMP Prime should use its visual system to support decisions, not decoration. The readiness summary, current property, and next action must carry the screen hierarchy.

### Brand separation

CMP Prime must be visually different from CMP Vault:

- Prime is action-led and readiness-led.
- Vault will be records-first and should feel more like a secure property file or digital binder.
- Prime should not look like an archive product with actions added later.

CMP Prime must be visually different from CMP Concierge:

- Prime surfaces service help only when a property gap needs it.
- Concierge will be services-first and should feel like a guided service organiser.
- Prime should not feel like a service marketplace.

CMP Prime must be visually different from the old parked rescue prototype:

- Prime must not copy old root-level CMP layouts, styles, interaction patterns, rescue pages, or progress systems.
- Prime must not inherit old dashboard-labs logic.
- Prime must not feel like old screens with a new colour scheme.
- Prime must make the landlord journey clearer before adding more features.

## Acceptance Gates

CMP Prime fails manual review if:

- the first screen does not explain CMP quickly;
- there is more than one obvious next action;
- the landlord cannot tell what to do within 30 seconds;
- the Property Brain does not show one next action;
- Evidence Vault feels disconnected from actions;
- Services feel like a standalone catalogue;
- Ask CMP dominates the main journey;
- portfolio tools appear too early;
- old terms appear;
- text is low contrast;
- mobile feels like an afterthought;
- the site feels like a visual reskin rather than a better landlord journey.

CMP Prime passes manual review if:

- the landlord can add a property;
- CMP shows what was found;
- CMP asks only missing details;
- CMP produces one clear next action;
- the landlord can add evidence or draft a service request;
- the property status improves visibly;
- monitoring makes future renewals obvious;
- My Properties shows the property and its next action;
- the design feels clearly different from the old prototype.

The future prototype must also work at 1440x1000, 1280x800, 1024x900 and 390x844, with no horizontal overflow, no invisible text, and 44px minimum tap targets on mobile.

## 90-Second Nick Walkthrough Script

1. "This is CMP Prime."
2. "A landlord starts by checking one property."
3. "CMP runs Smart Checks."
4. "It separates what CMP found from what the landlord still needs to confirm."
5. "The Property Brain turns that into one next action."
6. "The landlord can add evidence or prepare a service request."
7. "CMP updates the property file and monitoring."
8. "My Properties shows what needs attention next."

Keep the walkthrough practical. The point is not to sell features; it is to prove that a landlord can understand the journey quickly.

## Instructions for the future CMP Prime build pass

- Build only inside prototypes/cmp-prime/.
- Do not reuse old dashboard-labs layouts.
- Do not import old root-level CSS/JS.
- Do not copy old Add Property logic.
- Do not create Demo Mode.
- Do not create multiple progress systems.
- Do not show portfolio tools for one-property users.
- Do not make Ask CMP permanent.
- Do not make Services a disconnected catalogue.
- Implement the experience described in this brief before adding decorative polish.
