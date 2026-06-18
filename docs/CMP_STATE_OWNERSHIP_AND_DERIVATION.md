# CMP State Ownership And Derivation

Last updated: 2026-06-18  
Status: Committed product source of truth

This document defines which entity owns each fact and what must be derived. It is a contract only; Stage 2 does not implement these derivations.

## Ownership Rules

1. Property identity is owned by `PropertyRecord.identity`.
2. Smart Checks add sourced findings; they do not silently overwrite user-confirmed facts.
3. User edits create history and trigger recomputation.
4. Questions are derived from missing/uncertain facts and scenario/entry context.
5. Issues are derived by the rules engine.
6. Scores are derived from current issues, evidence and confidence.
7. The top next action is derived from explicit priority rules.
8. Evidence updates recompute issues, scores, actions and monitoring.
9. Service completion can create evidence and timeline events.
10. Monitoring is derived from unresolved issues, evidence gaps, known expiry dates, open service requests, explicit reminders and applicable rule changes.
11. Ask CMP reads canonical state and never creates an unsupported fact.
12. Reports snapshot canonical state and model/rule versions.
13. Demo state is namespaced and must not clear live/guest properties.
14. Portfolio summaries are derived from multiple `PropertyRecord` instances.

## Ownership Map

| Fact or feature | Owner | Derived consumers |
|---|---|---|
| Address and UPRN | `PropertyRecord.identity` | Smart Checks, workspace title, service job packs, reports |
| Found external data | `SmartCheckResult` | Review found data, issues, Ask CMP, reports |
| Landlord-stated data | `LandlordAnswer` | issues, actions, Ask CMP, reports |
| Compliance gaps | `Issue` from rules engine | Next best action, Action Plan, Evidence Vault, Monitoring |
| Proof state | `EvidenceItem` | issues, scores, actions, monitoring, reports |
| Recommended next steps | `ActionItem` | dashboard, services, timeline, monitoring |
| Public service intent | `ServiceIntentDraft` | Add Property, ServiceRequest |
| Property service request | `ServiceRequest` | timeline, evidence, monitoring |
| Activity | `TimelineEvent` | workspace timeline, reports |
| Renewal and follow-up | `MonitoringItem` | monitoring view, dashboard current status |
| Portfolio summary | derived aggregate | My Properties, portfolio intelligence |

## Derivation Flow

```text
PropertyIdentity
  -> SmartCheckResult[]
  -> unanswered or uncertain facts
  -> LandlordAnswer[]
  -> rules engine
  -> Issue[]
  -> ActionItem[]
  -> EvidenceItem[] / ServiceRequest[]
  -> TimelineEvent[]
  -> MonitoringItem[]
  -> reports and portfolio summaries
```

## Priority Formula Contract

The top next action must be derived from explicit priority inputs:

- legal urgency.
- health/safety severity.
- current occupancy/letting status.
- evidence confidence.
- expiry/due date.
- enforcement/contact status.
- dependency/blocking effect.
- user goal.

High-level formula:

```text
priority =
  legal urgency
  + health/safety severity
  + occupancy/letting multiplier
  + due-date urgency
  + enforcement/contact escalation
  + dependency/blocking effect
  + user-goal relevance
  - confidence/evidence completeness mitigation
```

An arbitrary array order is not an acceptable priority rule.

## Recompute Triggers

Recompute issues, scores, actions and monitoring when:

- property identity changes.
- Smart Check source or confidence changes.
- landlord answer changes.
- evidence proof or verification status changes.
- service request reaches a meaningful lifecycle step.
- a due date passes or approaches.
- applicable rules change.
- demo seed changes in demo namespace.

## AI Boundary

AI may explain, extract, summarise, draft and guide. It may propose language for a user to review. It does not own facts unless the fact is captured as extracted text with a source reference and confirmation state.

The rules engine owns compliance state and action priority.
