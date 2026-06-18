# CMP Canonical Store API

Last updated: 2026-06-18  
Status: Stage 3 implementation contract

Stage 3 adds an isolated canonical property data foundation. It is not wired into product pages.

## Store Envelope

The canonical store envelope is versioned and namespaced:

```text
{
  storeVersion,
  namespaceId,
  propertiesById,
  propertyOrder,
  lastSelectedPropertyId,
  serviceIntentsById,
  migrationIndex,
  createdAt,
  updatedAt
}
```

Rules:

- `lastSelectedPropertyId` is UI convenience only.
- It must never replace a required route `propertyId`.
- Service intents may exist before a `PropertyRecord`.
- Properties are keyed by stable canonical ID.
- `propertyOrder` is explicit and deterministic.
- Writes update timestamps.
- Invalid records do not overwrite valid stored data.

## Namespace Rules

Storage keys use:

```text
cmp_canonical_property_store_v1::<namespaceId>
```

Namespace examples:

- `guest:<id>`
- `user:<userId>`
- `demo:<scenarioId>`
- `qa:<fixtureSet>`

Namespaces are explicit. The store API requires a namespace ID and does not decide authentication timing.

## Storage Drivers

Implemented drivers:

- `createMemoryStorageDriver(initial?)`
- `createStorageObjectDriver(storageLike)`
- `createLocalStorageDriver(storageLike)`
- `createSessionStorageDriver(storageLike)`

Driver contract:

- `get(key)`
- `set(key, value)`
- `remove(key)`
- `keys()`

Drivers return structured result objects. They do not access global browser storage during module import.

## API Methods

`createCanonicalStore(options)` creates an isolated store API with explicit `namespaceId` and `driver`.

Supported methods:

- `loadStore()`
- `saveStore(store)`
- `listProperties()`
- `getProperty(propertyId)`
- `upsertProperty(propertyRecord)`
- `archiveProperty(propertyId)`
- `setLastSelectedProperty(propertyId)`
- `getLastSelectedPropertyId()`
- `upsertServiceIntent(serviceIntentDraft)`
- `getServiceIntent(intentId)`
- `attachServiceIntentToProperty(intentId, propertyId)`
- `previewImport(sourceType, sourceValue, options)`
- `importLegacyRecord(sourceType, sourceValue, options)`
- `archiveImportedRecord(migrationKey)`

## Result Shape

Normal success:

```text
{ ok: true, value, warnings: [] }
```

Validation or storage failure:

```text
{ ok: false, errors: [] }
```

Malformed stored JSON returns a structured failure with quarantine metadata. Ordinary validation failures do not throw.

## Validation Behaviour

Implemented validation layers:

- store envelope validation.
- `PropertyRecord` validation against `contracts/property-record.schema.json`.
- `ServiceIntentDraft` validation by Stage 3 contract.
- `ServiceRequest` validation against `contracts/service-request.schema.json`.
- adapter output validation.
- contract example validation.

The lightweight schema validator supports required fields, enums, nested object/array shapes, `$ref`, constants and additional-property checks needed by the Stage 2 schemas.

## Import Lifecycle

`previewImport`:

- maps source data through a pure adapter.
- validates output.
- returns candidates, warnings and errors.
- writes nothing.

`importLegacyRecord`:

- requires explicit caller invocation.
- validates before writing.
- records migration identity.
- is idempotent by migration key.
- reports collisions without overwriting.
- reports potential duplicates without merging.

## Archive And Rollback

`archiveProperty` marks a property as archived. It does not hard-delete by default.

`archiveImportedRecord(migrationKey)` archives the canonical record created by an import. It does not touch the original legacy source.

## Examples

Fictional examples live under:

```text
contracts/examples/
```

They cover standard records, no-EPC records, vacant records, evidence gaps, service intents, simulated service requests and a store envelope.

## Deliberately Not Done In Stage 3

Stage 3 does not:

- wire the store into Add Property.
- wire the store into My Properties.
- wire the store into Labs, Journey OS, services or demo routes.
- auto-migrate legacy data on page load.
- dual-write from current product flows.
- clear or overwrite legacy storage.
- introduce `/app/...` routes.
- alter questions, scenarios, Compliance Analysis, Action Plan, Evidence, Services, Ask CMP, Reports or Monitoring.
