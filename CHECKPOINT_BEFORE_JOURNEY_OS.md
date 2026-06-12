# Checkpoint Before Journey OS Experiment

## Snapshot

- Date/time: 2026-06-12 15:55:40 BST (+0100)
- Stable source branch: `labs/az-checker-and-demo-states-v2`
- Stable source commit: `596f2fe`
- Stable checkpoint tag: `checkpoint/cmp-before-journey-os`
- Experimental branch: `labs/cmp-journey-os-v1`

## Purpose

Preserve the current CMP prototype before starting a larger experimental rebuild of the landlord compliance journey. The next phase should remain fake but convincing, using mock data, fake API responses, simulated document scanning, fake service bookings, and simulated property brain logic. It must not require real API keys or live external services.

## Restore Instructions

To return to the stable demo branch:

```bash
git switch labs/az-checker-and-demo-states-v2
```

To restore the exact checkpoint commit from anywhere:

```bash
git switch --detach checkpoint/cmp-before-journey-os
```

To create a new branch from the exact checkpoint:

```bash
git switch -c restore/cmp-before-journey-os checkpoint/cmp-before-journey-os
```

## Important Files At Checkpoint

- `dashboard-labs.html`
- `dashboard-labs.css`
- `dashboard-labs.js`
- `dashboard.html`
- `journey-context.js`
- `add-property.html`
- `az-checker-v2.html`
- `az-checker-v2.css`
- `az-checker-v2.js`
- `app.js`
- `public-pages.js`
- `landing.html`
- `landing.css`
- `landing.js`
- `styles.css`
- `supabase-client.js`
- `supabase-config.js`
- `ai-key.example.js`
- `LABS_FEATURE_INVENTORY.md`
- `DESIGN_POLISH_PLAN.md`
- `DESIGN_POLISH_REPORT.md`
- `assets/generated/property-os-preview.svg`

## Validation Run

- `node --check` on all JavaScript files found by `rg --files -g '*.js'`: passed.
- No `package.json` or lockfile was present, so no existing npm lint/test/check script was available.
- `git diff --check`: passed after adding this checkpoint note.

## Known Issues Before Experimental Work

- No automated project lint, test, or browser smoke-test command was discoverable from a package manifest.
- Validation is limited to JavaScript syntax and Git whitespace checks unless a project-specific test command is added later.
- Any real Supabase/OpenAI-style integrations must remain disabled or mocked for the Journey OS experiment. Do not add real API keys.
