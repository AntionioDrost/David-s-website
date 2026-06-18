# CMP Capability Status And Copy Contract

Last updated: 2026-06-18  
Status: Committed product source of truth

This contract controls how the prototype speaks about simulated and live capabilities.

## Capability Statuses

| Status | Meaning |
|---|---|
| `simulated` | Prototype data or workflow. No external system action is completed. |
| `live` | Real external system, supplier, upload, payment or verification action is completed. |
| `prepared_for_review` | Draft or generated output exists for user review. |
| `needs_confirmation` | CMP has a likely or inferred value that requires user confirmation. |
| `not_available` | Capability does not exist in the prototype or current route. |

Operational status, verification status and simulated/live capability status must be stored separately.

## Approved Prototype-Safe Wording

Use these phrases when the capability is simulated or incomplete:

- `Simulated Smart Check`
- `Prepared for review`
- `Add proof later`
- `Evidence gap`
- `Request prepared`
- `No supplier contacted`
- `No payment taken`
- `No document stored`
- `Guidance, not legal advice`
- `Likely match`
- `Needs confirmation`
- `Current status`
- `No current gaps found from available information`
- `Recommended because...`

## Restricted Or Prohibited Wording

Do not use these unless the capability is real and the source/status is explicit:

- `Verified`
- `Booked`
- `Paid`
- `Uploaded and stored`
- `Fully compliant`
- `Legally compliant`
- `AI confirmed compliance`

## Topic-Specific Rules

### Simulated Data

Label simulated source data as simulated. Do not mix simulated and live results without clear status.

### Live/Official Checks

Only describe a check as official when the source is a real official or local-authority source. Otherwise use `Simulated Smart Check`, `Likely match` or `Needs confirmation`.

### Uploads And Document Storage

If no document is actually stored, use `Add proof later`, `Evidence gap` or `No document stored`.

### Document Extraction

If extraction is simulated, say `Prepared for review` or `Needs confirmation`. Extracted fields must carry source and confirmation state.

### Supplier Contact, Quotes, Booking And Payment

Use `Request prepared`, `No supplier contacted` and `No payment taken` unless live supplier contact, quote, booking or payment has actually occurred.

### Evidence Verification

Use `Verified` only with explicit verification source/status. Otherwise use `Needs confirmation`, `Unverified` or `Accepted proof` where acceptance is only user-side proof handling.

### Compliance Status

Use `Current status` and explain limits. Do not present compliance as a legal guarantee.

### Legal Advice

Use `Guidance, not legal advice` where a conclusion could be mistaken for legal advice.

### AI

AI can explain, extract, summarise, draft and guide. It cannot independently determine legal compliance. Avoid `AI confirmed compliance`.
