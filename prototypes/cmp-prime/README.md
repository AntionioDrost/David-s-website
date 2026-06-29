# CMP Prime

CMP Prime is the action-led CMP prototype. It helps a self-managing landlord check one rental property, understand what CMP found, answer only the missing details, and move to one practical next action.

## Build Scope

This prototype is static and self-contained inside `prototypes/cmp-prime/`.

Created routes:

- `index.html` - homepage and product explanation.
- `add-property.html` - postcode lookup, Smart Checks, found-data review, and landlord questions.
- `property.html` - Property Brain, Evidence Vault, Action Plan, Services, Monitoring, and contextual Ask CMP drawer.
- `services.html` - service request draft tied to the active property gap.
- `my-properties.html` - one-property status with portfolio comparison hidden until two or more properties exist.

Shared assets:

- `assets/cmp-prime.css`
- `assets/cmp-prime.js`
- `assets/property-data.js`

Validation:

- `tools/cmp-prime-check.mjs`

## Data

CMP Prime uses only this localStorage namespace:

```text
cmpPrimePrototypeV1
```

It does not read or write old CMP storage keys.

## External Data

Allowed live lookup:

- Postcodes.io postcode validation and local authority/admin context.

Fallback behaviour:

- If postcode lookup fails, the journey continues with a sample property fallback.
- EPC is isolated behind a placeholder adapter and currently uses honest prototype copy: `Prototype EPC data shown for review`.

No private API keys are used.

## Prototype Limits

The prototype gives landlord guidance only. It does not provide legal advice, contact suppliers, take payment, or make compliance guarantees.
