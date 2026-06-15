# CMP A-Z Prototype Integration Audit

Date: 2026-06-15
Branch: `labs/cmp-journey-os-v1`

## Existing strengths from earlier dashboard-labs

- Portfolio shell with landlord-facing navigation, side assistant, property cards and status surfaces.
- Property workspace visual style and tabs for overview, compliance, documents, timeline, services and details.
- Compliance Centre with scores, matrix, evidence gaps and forecast framing.
- Evidence Vault with document rows, filters, inbox concept and missing-evidence sections.
- Tasks/activity surfaces that make the product feel operational rather than only a wizard.
- Existing demo state modal, query-state handling and portfolio demo states.
- Original add-property/new-property copy that frames Smart Search and property setup.

## Existing strengths from Journey OS

- Property brain concept connecting identity, auto checks, tenancy answers, evidence, scores and actions.
- Fake add/check property flow with simulated address, EPC, local authority and licensing checks.
- Unknowns wizard that asks landlord-only questions instead of showing one large form.
- Prioritised action plan with routes for legal minimum, risk-protected, future-proof, done-for-me and prioritised.
- Service basket, fake booking intakes and service-plan buttons.
- Fake evidence scanner and local evidence vault updates.
- Contextual Ask CMP responses from local property state.
- Monitoring preview, timeline events and guided demo stories.

## Loose ends identified

- Demo controls were scattered between global demo states, Journey OS scenarios and guided stories.
- The visible sidebar label `Journey OS` sounded like an internal portfolio tool rather than a property action.
- `?state=new-property` opened an older setup mode rather than the newer Journey OS property-check engine.
- No-EPC data needed safer display so unknown EPC did not imply a confident potential score.
- No-EPC context could repeat as the first unknowns question.
- Condition issues needed multi-select because real properties often have more than one problem.
- The action plan needed a lightweight way to edit previous answers.
- Service status labels needed a clearer lifecycle.
- Compliance Centre and Evidence Vault did not clearly read from the Journey OS property brain.
- Ask CMP needed to feel context-aware across dashboard, Journey, compliance, evidence and services.

## Proposed unified A-Z flow

1. Portfolio/dashboard.
2. Add/check property.
3. Smart simulated checks.
4. Review found data.
5. Answer landlord-only unknowns.
6. Build property brain.
7. Action plan.
8. Book/upload/ask/defer/escalate.
9. Property workspace.
10. Compliance Centre and Evidence Vault update from the same property brain.
11. Monitoring and portfolio overview keep the property visible over time.

## Integration principle

Journey OS should act as the property-level engine. The older dashboard-labs surfaces should remain valuable as portfolio, compliance, evidence and service destinations, but they should read from the Journey OS mock property brain whenever the property-check journey has started.
