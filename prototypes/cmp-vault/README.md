# CMP Vault

CMP Vault is the records-first Prototype Option 2 for the CMP prototype programme.

It is a secure property passport for self-managing landlords: certificates, evidence, service outcomes and renewal dates are kept in one organised property file. The product question is:

> Is my property file complete, current and ready to rely on?

## Built Surface

- Homepage with the required Vault positioning and four entry CTAs.
- Start Vault flow: postcode, address selection and property passport creation.
- Document-first flow: simulated scan, suggested matches, landlord confirmation and record updates.
- Main Vault screen: property passport header, category rail, record drawers, file health, renewal panel and document inbox.
- Record detail drawer with one primary action and contextual Ask CMP prompts.
- Record-linked service flow with quiet service copy and follow-up reminder updates.
- Renewal timeline route.
- Possession readiness file framed as evidence readiness for advisor review.
- My Properties with one property card shown once.

## Implementation Boundary

This prototype is static and self-contained in `prototypes/cmp-vault/`.

Allowed implementation files:

- `index.html`
- `styles.css`
- `app.js`
- `README.md`
- `tools/cmp-vault-check.mjs`

No root HTML, CSS or JavaScript is used. No CMP Prime files are imported or edited. No API keys are required.

## Storage

Vault-only local storage namespace:

```text
cmpVaultPrototypeV1
```

The prototype does not read or write CMP Prime, dashboard, Supabase or old CMP storage keys.

## Sample Property

The seeded example property is:

```text
48 Maple Terrace, Leamington Spa, CV32 5AA
```

It uses static records for safety certificates, energy and condition, tenancy file, licensing/special cases, services and possession readiness.

## Validation

Run:

```bash
git diff --check
node --check prototypes/cmp-vault/app.js
node prototypes/cmp-vault/tools/cmp-vault-check.mjs
```

Browser QA should use a fresh temporary context. Do not clear normal browser storage.
