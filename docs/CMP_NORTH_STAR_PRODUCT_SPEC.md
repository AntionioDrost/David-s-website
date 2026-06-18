# CMP North Star Product Specification

Last updated: 2026-06-18  
Status: Committed product source of truth

## 1. Product Promise

CMP should feel like this:

```text
Add a property once. CMP checks what it can, asks only what it must, builds a Property Brain, gives one clear next action, helps fix gaps, stores the proof, then monitors everything over time.
```

CMP is property-first, evidence-led and action-oriented. It is not a chat-first product. Chat and AI features support the property journey; they do not replace the property model, evidence trail or rules engine.

Canonical product loop:

```text
Homepage / service / problem / advice / demo entry
  -> Add Property
  -> Smart Checks
  -> Review Found Data
  -> Answer Unknowns
  -> Property Brain
  -> Compliance Analysis
  -> One Next Best Action
  -> Evidence / Service / Ask CMP / Report
  -> Timeline and Monitoring
  -> Portfolio Intelligence
```

## 2. Public Website Structure

The public website sells the SaaS system first and services second. It should make clear that CMP is one ongoing property compliance system, not a set of disconnected service forms.

Public structure:

- Homepage: explains the full property journey and primary value proposition.
- Services: lists individual service acquisition routes.
- Individual service pages: EPC, Gas Safety, EICR, Inspections, Damp / Mould, Licensing, Possession Readiness and relevant insurance or finance routes while those remain part of the commercial offer.
- Problem-led routes: help a landlord start from a concern such as damp, possession, missing certificate or letting readiness.
- Ask CMP: a public pre-property helper with strict context boundaries.
- Demo: a future public entry into seeded data over the normal product journey.
- Contact and resources: support and education.

Public navigation must not expose QA states, raw fixtures, debug controls, old dashboard paths or standalone duplicate applications.

## 3. Public Entry-Point Router

Public entry choices are:

- Check My Property
- Book a Service
- problem-led journey
- Ask CMP
- Try Demo

All entry modes must eventually be capable of creating or updating:

- Property data
- Smart Check findings
- landlord answers
- evidence
- rules results
- recommended actions
- services
- timeline
- monitoring

The A-Z/full-compliance concept remains valid as a marketing and product concept. It is not a separate application, route family or state store. The full property check starts through the same Add Property journey as every other property-first path.

## 4. Homepage Journey

The homepage should prioritize:

1. The property-first promise.
2. Check My Property / Full property check.
3. The progression from Smart Checks to one next best action.
4. Evidence, services and monitoring as a closed loop.
5. Services as supporting acquisition routes.
6. Demo mode only when it runs over the normal product journey.

Homepage CTAs should route to the transitional Add Property entry until canonical app routes are implemented.

## 5. Add Property

Add Property is the canonical start of the app journey. A property is added once.

Add Property must:

- Capture address and identity.
- Prefer UPRN or a stable address match when available.
- Preserve entry context such as service intent, problem-led journey, public Ask CMP prompt or demo seed.
- Create or update one `PropertyRecord`.
- Avoid silently replacing a user-entered property with a fixture.
- Hand off to Smart Checks and Review Found Data.

`Check My Property` is public language. `Add property` is app language. Both enter the same underlying property creation flow.

## 6. Smart Checks

Smart Checks are the user-facing stage where CMP checks what it can from available data, existing records, documents, suppliers or simulated prototype sources.

Every Smart Check finding must include:

- SourceReference.
- confidence.
- simulated/live capability status.
- checked date where applicable.
- whether landlord confirmation is required.
- unknown or missing reason where no fact is available.

Smart Checks classify facts by source and confidence. They do not silently overwrite user-confirmed facts.

## 7. Review Found Data

Review Found Data shows what CMP found before asking the landlord for missing information.

This stage must distinguish:

- found data with source and confidence.
- likely matches needing confirmation.
- missing data.
- unknown data.
- inferred data that must not be presented as confirmed.

If no EPC is found, CMP must not claim "the EPC suggests" anything. EPC rating, potential and expiry remain unknown unless there is a named source.

## 8. Answer Unknowns

CMP asks only questions it cannot reasonably answer from Smart Checks, existing property data, documents, service records or user history.

`Unknown` is always a valid answer. It creates a gap, action or follow-up check rather than a false fact.

Questions must:

- Have a reason.
- Link to missing or uncertain facts.
- Respect dependencies.
- Clear dependent answers when a parent answer changes.
- Capture current versus future/intended context where relevant.
- Preserve evidence status separately from the answer.

## 9. Property Brain

The Property Brain is the landlord-facing representation of the canonical property graph. It is a major user-facing product moment.

It should show:

- what CMP knows.
- what CMP found.
- what the landlord confirmed.
- what remains unknown.
- what evidence exists.
- what issues are open.
- what action matters most.

The technical root entity behind the Property Brain is `PropertyRecord`.

## 10. Compliance Analysis

Compliance Analysis is determined by the rules engine using current property facts, Smart Checks, landlord answers, evidence state and service history.

The rules engine determines compliance state, issue status, scores and action priority. AI explains, extracts, summarises, drafts and guides. AI does not independently determine legal compliance.

Compliance Analysis must not present "Compliant" as a legal guarantee. It should use capability-safe language such as "current status", "needs evidence", "needs confirmation" and "guidance, not legal advice".

## 11. Results / Next Best Action

Results must present one next best action before deeper detail.

The top action is derived from explicit priority rules, not arbitrary array order. Inputs include legal urgency, health and safety severity, occupancy/letting status, evidence confidence, due dates, enforcement context, dependency/blocking effect and user goal.

The landlord should understand:

- what matters most now.
- why it matters.
- what CMP used to decide that.
- what the next step is.
- what evidence or service will close the loop.

## 12. Action Plan

The Action Plan is a structured list of actions derived from issues.

Each action must include:

- linked issue.
- reason.
- source and confidence summary.
- priority.
- primary CTA.
- secondary CTA.
- service options where relevant.
- status.

Actions should be grouped for usability, but grouping must not obscure the single top priority.

## 13. Evidence Vault

Evidence Vault stores or references proof state for a property.

Evidence concepts:

- held proof.
- missing proof.
- expired proof.
- unverified proof.
- proof needing review.
- accepted proof.

Prototype language must be clear when no document is actually uploaded or stored. "I have it but no proof" creates an evidence gap. "I do not know" creates a check or action.

## 14. Service Requests And Bookings

Services are recommended because of a public service intent or a property gap.

Every service recommendation must say `Recommended because...` and reference either:

- the public service intent.
- an open issue.
- an action.
- an evidence gap.

The prototype must not imply live supplier contact, booking, payment or evidence receipt unless that capability exists. Use "Request prepared", "No supplier contacted" and "No payment taken" for simulated requests.

## 15. Ask CMP

Ask CMP can exist in two contexts:

- public/pre-property helper.
- property-aware in-app assistant.

Public Ask CMP must be clear that it has no property record unless the user provides one. Property-aware Ask CMP must use current property and page context, including findings, answers, issues, evidence, actions and capability limits.

Ask CMP can explain, summarise, draft and guide. It must not create unsupported facts or independently determine legal compliance.

## 16. Reports And Compliance Packs

Reports are generated from the Property Brain. Information is not re-entered.

Reports must snapshot:

- PropertyRecord schema version.
- rules version.
- included evidence.
- included issues.
- included actions.
- generated date.
- simulated/live status.

Report output should distinguish guidance, working summaries and legally sensitive conclusions.

## 17. Monitoring

Monitoring is generated from unresolved issues, evidence gaps, expiry dates, open service requests, explicit reminders and applicable rule changes.

Monitoring explains:

- what changed.
- why it matters.
- what to do next.

It should create timeline events when action, service or evidence state changes.

## 18. My Properties And Portfolio Intelligence

My Properties is the app home for property owners. It lists `PropertyRecord` instances.

Portfolio Intelligence appears only when:

- more than one property exists.
- explicit portfolio/demo mode is active.

Portfolio summaries are derived from multiple properties. They must not be query-state driven product surfaces.

## 19. Demo/Scenario Architecture

Demo Mode uses seeded data over the normal product journey. It must not run a separate product.

Scenario rules:

- Each scenario has a unique fictional property ID and address.
- Scenario state is namespaced.
- Demo state must not clear live or guest properties.
- Scenario completion can optionally add the demo property to My Properties.
- Guided demo steps navigate normal product surfaces.
- QA controls remain hidden from normal navigation.

## 20. Possession Readiness

Possession readiness remains a specialist public route. It should connect to the wider property model when the user chooses to attach it to a property.

It must preserve its specialist context while avoiding a separate compliance state store.

## 21. EPC Improvement Journey

EPC improvement can be a public service or property-gap journey.

It must:

- preserve EPC source and confidence.
- distinguish current rating, potential rating and expiry.
- avoid EPC-derived inferences when no EPC was found.
- link improvements to an issue/action/service where appropriate.

## 22. Full System Feedback Loop

Evidence, actions, services, timeline and monitoring form one closed loop:

```text
Issue
  -> ActionItem
  -> EvidenceItem or ServiceRequest
  -> TimelineEvent
  -> MonitoringItem
  -> recomputed Issue and ActionItem status
```

No surface should maintain an isolated copy of the property truth.

## 23. Progressive Disclosure Rules

The landlord-facing experience remains simple, progressive and property-first.

Rules:

- Show the next best action first.
- Show deeper analysis after status and priority are clear.
- Ask only necessary questions.
- Label unknowns and gaps explicitly.
- Do not expose raw rule IDs, fixture names, debug state or storage keys.
- Use technical language only in internal QA surfaces.

## 24. Prototype Capability Boundaries

The prototype may simulate checks, uploads, supplier requests, document extraction, payment, booking and verification.

When simulated, wording must make that clear. Restricted words such as "Verified", "Booked", "Paid", "Uploaded and stored", "Fully compliant", "Legally compliant" and "AI confirmed compliance" require the corresponding real capability and source/status.

## 25. Product Audit Checklist

Use this checklist before later implementation stages ship:

- A property is added once.
- Every app surface reads one canonical property state.
- Smart Checks include source and confidence.
- Unknown answers create gaps, not false facts.
- Property Brain and PropertyRecord are clearly separated.
- Compliance state and priorities come from the rules engine.
- AI explains and guides only within stated limits.
- One next best action appears before detail.
- Services are linked to service intent or property gap.
- Evidence, actions, services, timeline and monitoring form a closed loop.
- Reports are generated from Property Brain snapshots.
- Demo scenarios seed the normal product model.
- Scenario properties have unique fictional IDs and addresses.
- Portfolio tools appear only for multiple properties or explicit portfolio/demo mode.
- QA states and raw scenario controls are hidden from normal navigation.
