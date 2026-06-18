# CMP Transitional Adapter Specification

Last updated: 2026-06-18  
Status: Committed product source of truth

This document describes how later stages should adapt current storage/state into canonical records. Stage 2 does not implement adapters.

## Adapter Principles

- Do not destructively clear storage.
- Retain original values until migration succeeds.
- Version canonical records.
- Record migration source.
- Support rollback.
- Do not merge demo and live namespaces.
- `57 The Butts` becomes an explicit scenario fixture only.
- Public Add Property records must not be silently replaced by Labs fixtures.

## Source Stores To Adapt

### `cmp_compliance_workspaces::guest`

Current public Add Property and My Properties store.

Later adapter should:

- read existing guest properties.
- create `PropertyRecord` instances with `migrationSource`.
- retain original guest workspace data.
- attach public entry context.
- avoid redirecting to a hardcoded Labs property.

### Per-User Public Workspaces

Current per-user or authenticated public workspaces should map to owner namespaces.

Later adapter should:

- preserve user namespace.
- preserve created/updated timestamps where available.
- mark unknown source and confidence when metadata is missing.

### `cmp_journey_context::*`

Current public handoff/session context.

Later adapter should:

- map service/problem/check entry to `PropertyRecord.entryContext`.
- expire or close handoff context only after canonical record creation succeeds.
- preserve service intent IDs.

### `cmp_public_service_draft::*`

Current public service draft storage.

Later adapter should:

- create `ServiceIntentDraft`.
- preserve service ID, source route, contact, answers and evidence placeholders.
- attach to `PropertyRecord` only when an address/property identity exists.

### Labs `labsState`

Current Labs workspace and fixture state.

Later adapter should:

- treat Labs data as transitional app state.
- map selected property-like data into explicit `PropertyRecord` only with property ID.
- keep raw state fixtures QA-only.
- avoid treating query parameters as product ownership.

### Journey OS `journeyState`

Current Journey OS answers, issues, evidence and actions.

Later adapter should:

- map answers to `LandlordAnswer`.
- map found data to `SmartCheckResult`.
- map issues/actions/evidence/services/monitoring to canonical child entities.
- retain rule/scenario provenance.

### Hardcoded Fixture Properties

Hardcoded demo properties include `57 The Butts` and portfolio fixtures.

Later adapter should:

- convert them into `ScenarioDefinition` seeds.
- assign unique fictional property IDs.
- avoid using any fixture as default fallback product state.

### Old Dashboard/Supabase Records

Old dashboard records are legacy sources.

Later adapter should:

- migrate useful records only after canonical model is stable.
- keep old dashboard route internal/legacy until verified.
- record source as old-dashboard or Supabase import.

### A-Z Checker Storage

Standalone A-Z checker state is a legacy duplicate.

Later adapter should:

- extract any useful question/answer semantics.
- map to canonical full property journey where appropriate.
- keep route hidden/legacy until replacement is verified.

## Rollback Contract

Adapters must write canonical records alongside originals first. A rollback must be able to ignore canonical records and continue using legacy storage until a stage passes acceptance tests.

No adapter should clear browser storage, overwrite live/guest properties with demo properties, or collapse multiple source records into one property without explicit match evidence.
