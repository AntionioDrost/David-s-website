# CMP Radar

CMP Radar is Prototype Option 4: a risk-first, deadline-first landlord decision prototype.

It is built only inside `prototypes/cmp-radar/` and uses the storage namespace `cmpRadarPrototypeV1`.

## What It Shows

- Homepage with risk route entry points.
- Risk Radar decision screen for `9 Cedar Lane, Nottingham, NG7 2AB`.
- Top risk panel with cautious scenario responses.
- Deadline timeline.
- Evidence upload flow that reduces visible risk after confirmation.
- Possession evidence readiness route.
- Ask CMP drawer with deterministic responses.
- My Properties with one property card.

## Trust Boundary

This prototype organises risk, evidence, reminders and advisor preparation. It is guidance only, not legal advice, and should be reviewed before relying on the information.

## Validation

Run:

```bash
git diff --check
node --check prototypes/cmp-radar/app.js
node prototypes/cmp-radar/tools/cmp-radar-check.mjs
```
