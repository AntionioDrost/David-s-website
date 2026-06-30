# CMP Concierge

CMP Concierge is a service-first landlord support prototype. It helps a landlord describe what they need, choose a service route, identify evidence, prepare booking details, upload documents for review, and speak to a CMP advisor when the route needs human guidance.

Core promise:

> Tell CMP what you need. We'll guide the service, evidence and next step.

## Prototype Shape

- Static single-page app in `index.html`, `styles.css` and `app.js`.
- New local storage namespace: `cmpConciergePrototypeV1`.
- No API keys, supplier integrations, payments or production services.
- One sample property: `22 Warwick Row, Coventry, CV1 1EX`.
- Main journeys: route selection, property selection, targeted questions, Service Plan, booking preparation, document check, possession preparation, advisor route, My Requests, My Properties and Ask CMP.

## Visual Direction

- Dark premium concierge interface.
- Deep plum, midnight navy, electric blue, coral, soft lilac and warm cream palette.
- Inline SVG house/service-bell mark with `CMP Concierge` lockup.
- Large guided choice panels, service cards, route preview and booking timeline.
- Service-first experience, not a map, records binder or generic dashboard.

## Trust Boundary

The prototype prepares service requests, evidence summaries and advisor prompts. It uses calm boundaries such as "No supplier contacted yet", "No payment taken", "advisor review recommended" and "guidance only, not legal advice".

## Validation

Run:

```bash
git diff --check
node --check prototypes/cmp-concierge/app.js
node prototypes/cmp-concierge/tools/cmp-concierge-check.mjs
```
