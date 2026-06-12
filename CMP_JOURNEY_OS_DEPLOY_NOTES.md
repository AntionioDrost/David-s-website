# CMP Journey OS Deploy Notes

## Deployment Check

- Branch: `labs/cmp-journey-os-v1`
- Journey OS demo commit inspected: `496117263e2dd796694d9de9be0f4ea9ddd8d6a6`
- Pushed to origin: yes, `labs/cmp-journey-os-v1` was pushed successfully.
- Checkpoint tag present locally: `checkpoint/cmp-journey-os-wow-layer`

## Netlify Status

- Netlify CLI/config in this checkout: not found.
- `.netlify` site link: not found.
- `netlify.toml`: not found.
- GitHub commit statuses for `496117263e2dd796694d9de9be0f4ea9ddd8d6a6`: no Netlify status or deploy-preview URL reported.
- GitHub deployments for `496117263e2dd796694d9de9be0f4ea9ddd8d6a6`: none reported.
- Production Netlify link changed: no production settings or production deploys were changed by this pass.

If Netlify branch previews are configured outside this repository, check the Netlify dashboard for the `labs/cmp-journey-os-v1` branch. If they are not configured, create or enable branch deploys/deploy previews in Netlify for this repo.

## Local Preview

- Port `8000`: busy.
- Local fallback used: `http://localhost:8001/dashboard-labs.html`
- Page checked: `dashboard-labs.html`

## Smoke Test Results

- Dashboard rendered with `Check My Property`.
- Journey OS entry activated.
- Journey OS page rendered.
- Journey spine was visible.
- Demo scenario switcher was visible.
- Action Plan rendered.
- Property Workspace rendered.
- Workspace tabs checked:
  - Services
  - Evidence
  - Ask CMP
  - Timeline
  - Monitoring
- Mobile-width smoke check: Journey spine remained visible at `430px`; no horizontal overflow was detected.
- Runtime errors: no obvious `TypeError`, `ReferenceError` or `SyntaxError` logs in the smoke run.

## What To Check Next

1. Open the local preview or Netlify branch preview, if your Netlify dashboard creates one.
2. Click `Check My Property`.
3. Run the clean Journey OS path into the Property Workspace.
4. Switch to `No EPC found`, `HMO/high-occupancy risk`, `Damp/mould complaint` and `Done-for-me landlord`.
5. Check Upload Evidence, Book Service, Ask CMP and Monitoring in the workspace.
6. Confirm the demo feels clear enough for a walkthrough with Nick.

## Known Limitations

- This is still fake/local/mock only.
- No real APIs, uploads, supplier bookings, payments, backend services, AI calls or legal analysis are connected.
- Netlify deploy preview could not be confirmed from local config, CLI, GitHub statuses or GitHub deployments.
