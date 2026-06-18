# CMP Architecture Decisions

Last updated: 2026-06-18  
Status: Committed product source of truth

## Decision 1: Property-First Architecture

- Decision: CMP is property-first.
- Reason: Compliance, evidence, actions, services and monitoring all depend on a specific property.
- Alternatives rejected: chat-first architecture; service-only product; dashboard-first generic widgets.
- Consequences: Every major app surface must eventually require or derive from a property context.
- Implementation stage: Stage 3+.

## Decision 2: One Canonical PropertyRecord

- Decision: `PropertyRecord` is the technical root entity.
- Reason: Current state is fragmented across public pages, Labs, old dashboard, A-Z and scenarios.
- Alternatives rejected: maintaining separate public, Labs and scenario stores.
- Consequences: Later stages must create adapters instead of clearing or replacing legacy state.
- Implementation stage: Stage 4.

## Decision 3: Property Brain As User-Facing Representation

- Decision: Property Brain is the landlord-facing representation of the canonical property graph.
- Reason: Landlords need a simple product concept, not internal entity names.
- Alternatives rejected: exposing `PropertyRecord`, `Journey OS` or raw rule state.
- Consequences: User-facing surfaces should describe knowledge, gaps and next actions through Property Brain language.
- Implementation stage: Stage 3+ and visual-copy stage.

## Decision 4: Rules Engine Decides; AI Assists

- Decision: The rules engine determines compliance state, issues, scores and priority; AI explains, extracts, summarises, drafts and guides.
- Reason: Compliance decisions must be auditable and source/rule based.
- Alternatives rejected: AI independently determining legal compliance.
- Consequences: AI outputs require source/context boundaries and cannot create unsupported facts.
- Implementation stage: Stage 4+.

## Decision 5: Full Property Check Is Not A Separate A-Z Application

- Decision: The A-Z/full-compliance concept remains, but it is part of the canonical Add Property journey.
- Reason: A separate A-Z app duplicates state and questions.
- Alternatives rejected: retaining `az-checker-v2.html` as a normal product route.
- Consequences: Standalone A-Z can remain direct/internal until merged or archived.
- Implementation stage: Stage 3+.

## Decision 6: Public Services Remain Acquisition Routes

- Decision: Individual service pages stay public and lightweight.
- Reason: They are useful acquisition routes and preserve commercial entry points.
- Alternatives rejected: hiding services until after Add Property; forcing full account setup before service intent.
- Consequences: Service pages must produce `ServiceIntentDraft` and later attach to a property.
- Implementation stage: Stage 7.

## Decision 7: Demo Scenarios Become Seeded Properties

- Decision: Demo scenarios seed normal product data.
- Reason: Current scenarios tell good stories but run as separate or overwriting state.
- Alternatives rejected: separate demo-only product logic.
- Consequences: Each scenario needs unique fictional property ID/address and namespace isolation.
- Implementation stage: Stage 8.

## Decision 8: Portfolio Is Derived, Not Query-State Driven

- Decision: Portfolio tools derive from multiple `PropertyRecord` instances.
- Reason: Query-state portfolio fixtures currently look like real product states.
- Alternatives rejected: `state=portfolio`, `two-property` and `five-property` as product states.
- Consequences: Portfolio appears only with multiple properties or explicit portfolio/demo mode.
- Implementation stage: Stage 5+.

## Decision 9: Evidence, Actions, Services, Timeline And Monitoring Form A Closed Loop

- Decision: Issue resolution creates or updates evidence, services, timeline and monitoring together.
- Reason: CMP's value is ongoing proof and follow-up, not isolated recommendations.
- Alternatives rejected: independent widgets with duplicated state.
- Consequences: Child entities must link back to property and issue/action context.
- Implementation stage: Stage 6+.

## Decision 10: Transitional Static HTML Routes Remain Until Ownership Is Stable

- Decision: Current static routes remain while contracts and adapters are introduced.
- Reason: Rewriting routing before state ownership is stable would increase risk.
- Alternatives rejected: immediate `/app/...` router or Netlify rewrite migration.
- Consequences: Stage 2 documents future routes but does not implement them.
- Implementation stage: Stage 3-5.

## Decision 11: Pretty `/app/...` Routes Are Target Architecture Only For Now

- Decision: `/app/...` routes are documented targets, not Stage 2 implementation.
- Reason: The static prototype lacks canonical state and route ownership.
- Alternatives rejected: introducing clean routes before property IDs and adapters exist.
- Consequences: Current routes remain aliases/transitional paths until later stages.
- Implementation stage: Stage 5+.

## Decision 12: No Bare Workspace Fallback To A Hardcoded Property

- Decision: A selected workspace must eventually require a valid `propertyId`; no workspace may silently fall back to `57 The Butts`.
- Reason: Hardcoded fallback is the central contradiction between real properties and demos.
- Alternatives rejected: treating `57 The Butts` as default app state.
- Consequences: Bare `dashboard-labs.html` is transitional and noncanonical until property routing exists.
- Implementation stage: Stage 4+.
