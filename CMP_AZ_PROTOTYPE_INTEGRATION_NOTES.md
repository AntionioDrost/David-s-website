# CMP A-Z Prototype Integration Notes

Date: 2026-06-15
Branch: `labs/cmp-journey-os-v1`

## What was integrated

- Renamed the normal sidebar entry from internal `Journey OS` language to `Add / check property`.
- Reworked the Demo state modal into one Demo Control Centre with global app states, property-check scenarios, guided stories and reset controls.
- Routed `dashboard-labs.html?state=new-property` into the Journey OS add/check property flow.
- Connected the older new-property action path to the same Journey OS property check.
- Bridged Compliance Centre to active Journey OS scores, blockers, evidence gaps, service actions and monitoring.
- Bridged Evidence Vault to active Journey OS fake scans and missing evidence.
- Added context-aware Ask CMP copy for dashboard, Journey, Compliance Centre, Evidence Vault and service contexts.

## Journey OS flow fixes

- No-EPC scenarios now keep EPC rating, potential and expiry as `Unknown` unless evidence is uploaded or booked.
- No-EPC rented/advertised/vacant context is carried into the unknowns wizard so occupancy is not repeated.
- The unknowns wizard now has Back and answer-edit affordances.
- The condition question supports multi-select issues, with `None` and `Not sure` treated as exclusive paths.
- Action Plan includes an `Edit answers` note so the flow no longer feels one-way.
- Service recommendations now have filter chips and clearer lifecycle labels.
- Guided demo story endings now surface story-specific next-step actions in the workspace.

## What was preserved

- Existing fake Journey OS data model, property brain, action plan, service basket, scanner, Ask CMP and guided demo architecture.
- Existing portfolio, workspace, Compliance Centre, Evidence Vault, tasks and activity surfaces.
- Existing global demo states and Journey OS scenario testing power.
- All integrations remain local/mock only.

## Known limitations

- Compliance Centre and Evidence Vault are bridged to the active Journey OS property brain, but they are not yet a full shared data-store implementation.
- Multi-select was added for condition issues only; other questions remain intentionally simple.
- Service filtering is local presentation state only.
- Ask CMP remains scripted and local.
- Evidence scanning, service bookings, supplier statuses and monitoring are simulations only.

## What still needs a final audit

- Full click-through QA across every guided story after this integration.
- Mobile QA for the expanded Demo Control Centre and service filters.
- Review whether the old property workspace tabs should be renamed to match Journey OS tab labels.
- Decide whether presenter mode should hide the global Demo Control Centre entirely during Nick-facing demos.
