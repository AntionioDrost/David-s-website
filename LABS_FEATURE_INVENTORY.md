# CMP Labs Feature Inventory

## Branches Inspected

- `labs/compliance-autopilot-v1`
- `labs/timeline-flight-recorder-v1`
- `labs/ask-cmp-wow-and-service-context-v1`
- `labs/multi-property-ux-logic-polish-v1`
- `labs/portfolio-home-v1`
- `labs/global-evidence-vault-v1`
- `labs/global-tasks-v1`
- `labs/documents-autopilot-v1`
- `origin/labs/compliance-autopilot-v1`
- `origin/labs/timeline-flight-recorder-v1`
- `origin/labs/ask-cmp-wow-and-service-context-v1`

Inspection used `git branch`, `git grep`, and current-file searches only. No branch checkout was performed.

## Earlier Features Found

- CMP Autopilot cards and property-file strength.
- Scenario-aware compliance concepts including vacant, ready-to-let, tenanted and new-purchase modes.
- What-if simulator for future tenancy, HMO-style occupancy, advertising and vacant-period scenarios.
- PRS Database readiness preview.
- Timeline/flight-recorder style activity history.
- Landlord answers in activity/task context.
- Global Evidence Vault, global Tasks and service recommendation surfaces.
- Ask CMP service context and assistant prompts.

## Already Present In Current Labs Route

- Scenario panel in the property Compliance tab.
- What-if panel.
- PRS readiness drawer.
- Portfolio Home, Properties, Compliance Centre, Evidence Vault, Tasks, Activity, Ask CMP, Book a Service, Learn and Settings routes.
- Smart Upload demo and evidence timeline.
- Multi-property starter state for 57 The Butts and 18 Willow Brook Drive.
- Service recommendation pathway and support request modal.

## Missing Or Degraded

- No complete Compliance A-Z Checker existed as a flagship workflow.
- Portfolio-wide checking did not avoid repeated answers with shared questions plus property-specific follow-up.
- Evidence score existed as property-file strength, but compliance score was not separate.
- Empty portfolio state was not fully supported.
- Five-property portfolio state did not exist.
- Scenario builder was present but not connected to a full checker output.
- Earlier features appear to have been carried forward as individual panels rather than merged into a single guided compliance workspace.

## Restored Or Reintegrated Now

- Scenario Builder is reconnected through the A-Z Checker scenario selector and output summary.
- Journey concepts restored in the checker: general, vacant, ready to let, tenanted, new purchase, HMO/licensing, possession readiness and evidence pack.
- Portfolio Sweep adds shared questions, apply-to-all, copy-from-property and only-unknown matrix concepts.
- Six-essential-check style compliance matrix remains and is extended by the A-Z taxonomy.
- 90-day/forecast and PRS readiness remain in Compliance Centre.
- Ask CMP, Book a Service and Tasks now link into A-Z/checker paths.

## Deferred

- Live legal/rules engine.
- Real document extraction or official-record lookup.
- Full per-property workspace for every portfolio-only demo property.
- Downloadable compliance report generation.
- Real supplier booking, auth, API, routing or backend changes.

## Likely Reason Features Disappeared

The older branches appear to have introduced feature concepts in separate prototype passes. Later polish work retained many UI fragments but did not centralise them into a single guided workflow. The A-Z Checker needed a new integration layer rather than a simple branch port.
