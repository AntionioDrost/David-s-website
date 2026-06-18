# CMP Legacy Adapter Matrix

Last updated: 2026-06-18  
Status: Stage 3 implementation contract

All adapters are pure functions. They copy and normalise. They do not mutate source data, touch browser storage, route users or write canonical records by themselves.

| Source | Adapter function | Mapped canonical fields | Unmapped fields | Warnings | Confidence/source handling | Migration key | Later live integration stage |
|---|---|---|---|---|---|---|---|
| `cmp_compliance_workspaces::guest` | `adaptPublicWorkspaceStore` | `PropertyRecord.id`, namespace, identity, address, UPRN when present, entry migration metadata | UI flash, selected property as active route | selected property is metadata only | source type `cmp_history`, simulated | `public_workspace::<sourceId>::v1` | Stage 4-5 |
| per-user public workspaces | `adaptPublicWorkspaceStore` with user namespace | same as guest public workspace with caller namespace | auth/session ownership details not present in source | missing metadata remains unknown | source type `cmp_history`, simulated | `public_workspace::<sourceId>::v1` | Stage 4-5 |
| `cmp_journey_context::*` | `adaptJourneyContext` | entry context fields for service/problem/Ask/demo attachment | authoritative property facts | transitional context only | no property truth created | `journey_context::<sourceId>::v1` | Stage 4 |
| `cmp_public_service_draft::*` | `adaptPublicServiceDraft` | `ServiceIntentDraft`, service ID, contact, address input, answers, evidence placeholders | no `ServiceRequest` before property attachment | file names are placeholders only | placeholders are simulated, not stored evidence | `public_service_draft::<serviceOrId>::v1` | Stage 7 |
| Labs property fixture | `adaptLabsPropertyFixture` | demo-namespace `PropertyRecord`, fixture metadata, identity/address | route state and live selection | demo namespace only | source type `cmp_history`, simulated | `labs_fixture::<sourceId>::v1` | Stage 8 |
| Journey OS state | `adaptJourneyOsState` | `PropertyRecord`, Smart Check imports, landlord answers, legacy-derived issues/actions | canonical rule derivation and priority | imported issues/actions are not canonical rules-engine output | `cmp_history`, simulated, legacy rule version | `journey_os::<sourceId>::v1` | Stage 6 and Stage 8 |
| old dashboard/Supabase-shaped workspace | `adaptOldDashboardWorkspace` | `PropertyRecord` identity/address and migration metadata | live Supabase access, remote ownership | no live data access during tests | source type `cmp_history`, simulated | `old_dashboard::<sourceId>::v1` | Stage 4+ |
| standalone A-Z checker state | `adaptAzCheckerState` | answers into partial `PropertyRecord` when property identity exists | verified compliance, proof, full route completion | no property identity returns non-importable result | user answers remain user-stated; no verified compliance | `az_checker::<sourceId>::v1` | Stage 3+ extraction, Stage 6 logic |

## Adapter Rules

- Unknown remains unknown.
- Missing remains missing.
- Empty string is not confirmed absence.
- No-EPC source data does not create EPC rating, potential, expiry or EPC-derived heating.
- Proof missing does not become verified.
- Simulated evidence remains simulated.
- Potential duplicates are reported, not merged.
- Source objects remain unchanged.

## Unresolved Mapping Issues

- Public workspaces do not contain enough source metadata to assign high confidence automatically.
- Journey OS imported issues/actions are useful migration data but not canonical rules-engine output.
- A-Z checker state can be non-importable if it has no property identity.
- Public service file names remain placeholders until a real evidence upload/storage capability exists.
- Old dashboard records may need a future Supabase-specific adapter once live data access is intentionally introduced.
