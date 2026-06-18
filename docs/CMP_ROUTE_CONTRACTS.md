# CMP Route Contracts

Last updated: 2026-06-18  
Status: Committed product source of truth

Stage 2 documents route contracts only. It does not edit product links, redirects, storage, Netlify configuration or client routing.

## Route Classes

CMP distinguishes:

1. Current transitional static routes.
2. Future canonical routes.
3. Redirect aliases.
4. Public routes.
5. App routes.
6. Demo routes.
7. QA/internal routes.
8. Legacy routes.

## Current Transitional Contract

Until route architecture is implemented:

| Route | Audience | Required identifiers | Allowed entry contexts | State owner | Canonical destination | Temporary alias | Auth eventually | Demo behaviour | QA visibility | Invalid/missing-ID behaviour |
|---|---|---|---|---|---|---|---|---|---|---|
| `index.html` | Public | none | marketing, service, problem, advice, demo teaser | none | `/` | current file | no | may link to demo later | no QA controls | n/a |
| `services.html` | Public | none | public services | public page state | `/services` | current file | no | n/a | no QA controls | n/a |
| individual service `.html` pages | Public | service slug by file | service intent | `cmp_public_service_draft::*` until adapted | `/services/<slug>` | current files | no | n/a | no QA controls | keep service context |
| `add-property.html` | Public/app transitional | address input, future property ID | Check My Property, Add property, service intent, problem-led | public workspace store until adapted | `/app/properties/new` | current file | later optional | demo may seed input later | no QA controls | return to address entry |
| `my-properties.html` | App transitional | guest/user namespace | app home, auth return | public workspace store until adapted | `/app/properties` | current file | later yes | may list demo properties if persisted | no QA controls | show empty state |
| `dashboard-labs.html` | Internal/transitional app shell | none today, propertyId required later | temporary public handoff, direct internal review | Labs local state | selected-property workspace | current file | later yes | direct demo remains | QA chrome hidden unless `qa=1` | bare Labs workspace is transitional and noncanonical |
| `dashboard-labs.html?demo=nick` | Internal demo | demo identifier | direct internal demo review | guided demo state | `/app/demo/nick` | current query route | no for demo | seeds Nick story in current system | QA chrome hidden unless `qa=1` | invalid demo returns normal Labs |
| `dashboard-labs.html?state=*` | QA/internal | state fixture key | QA fixture inspection | Labs fixture state | `/app/qa/...` | current query route | internal only | may seed fixture | requires `qa=1` for visible QA chrome | invalid state falls back safely |
| `dashboard-labs.html?advanced=1&qa=1` | QA/internal | QA flag | internal controls | Labs internal controls | `/app/qa/...` | current query route | internal only | allowed | visible only with `qa=1` | no product state created |
| `dashboard-labs.html?debug=1&qa=1` | QA/internal | QA flag | internal debug | Labs internal controls | `/app/qa/...` | current query route | internal only | allowed | visible only with `qa=1` | no product state created |
| `dashboard.html` | Legacy | none | direct internal legacy inspection | old dashboard state | `/app/properties` later | legacy file | later yes | old demos only | internal/legacy | redirect/archive after replacement |
| `az-checker-v2.html` | Legacy duplicate | none | direct internal legacy inspection | A-Z checker storage | `/app/properties/new` later | legacy file | no | old A-Z scenarios only | internal/legacy | redirect/archive after full journey replacement |

Important transitional rule: bare `dashboard-labs.html` is not a valid final selected-property destination. A selected-property workspace must eventually require a `propertyId`.

Public Add Property and My Properties currently hand off to bare Labs only as a temporary unresolved bridge. This is a high-priority route-contract violation for Stage 3-5, not approved architecture.

## Future Canonical Contract

These routes are target architecture only. Do not implement them in Stage 2.

| Route | Audience | Required identifiers | Allowed entry contexts | State owner | Auth eventually | Demo behaviour | QA visibility | Invalid/missing-ID behaviour |
|---|---|---|---|---|---|---|---|---|
| `/app/properties` | App | owner/guest namespace | app home, auth return | canonical property store | yes | may show persisted demo namespace if enabled | none | show empty state or property list |
| `/app/properties/new` | App/public bridge | none until property created | Check My Property, Add property, service intent, problem-led | `PropertyRecord` draft | later optional | can receive scenario seed | none | stay in Add Property |
| `/app/properties/:propertyId/review` | App | valid `propertyId` | after Add Property, demo seed | `PropertyRecord.smartChecks` | yes | normal route over seeded property | none | return to My Properties with message |
| `/app/properties/:propertyId/unknowns` | App | valid `propertyId` | missing/uncertain facts | `PropertyRecord.landlordAnswers` | yes | normal route over seeded property | none | return to My Properties with message |
| `/app/properties/:propertyId/analysis` | App | valid `propertyId` | after review/unknowns or workspace nav | rules-derived issues | yes | normal route over seeded property | none | return to My Properties with message |
| `/app/properties/:propertyId` | App | valid `propertyId` | workspace open | `PropertyRecord` | yes | normal route over seeded property | none | return to My Properties with message |
| `/app/properties/:propertyId/actions` | App | valid `propertyId` | next action, nav, analysis | derived `ActionItem` list | yes | normal route over seeded property | none | return to My Properties with message |
| `/app/properties/:propertyId/evidence` | App | valid `propertyId` | issue/action/evidence nav | `EvidenceItem` list | yes | normal route over seeded property | none | return to My Properties with message |
| `/app/properties/:propertyId/services` | App | valid `propertyId`, optional `serviceIntentId` | public service intent, action, evidence gap | `ServiceRequest` | yes | normal route over seeded property | none | return to My Properties with message |
| `/app/properties/:propertyId/timeline` | App | valid `propertyId` | workspace nav | `TimelineEvent` list | yes | normal route over seeded property | none | return to My Properties with message |
| `/app/properties/:propertyId/ask` | App | valid `propertyId` | property-aware Ask CMP | `AskCmpContext` | yes | normal route over seeded property | none | return to My Properties with message |
| `/app/properties/:propertyId/monitoring` | App | valid `propertyId` | monitoring nav, timeline, action outcome | `MonitoringItem` list | yes | normal route over seeded property | none | return to My Properties with message |
| `/app/demo?scenario=<scenarioId>` | Demo | valid `scenarioId` | public/internal demo | namespaced demo seed store | no/optional | creates seeded `PropertyRecord` | no QA controls | choose valid scenario |
| `/app/qa/...` | QA/internal | QA flag/context | internal inspection | fixture/debug systems | internal only | may inspect seeded states | visible only to QA | reject or hide without QA flag |

## Redirect Aliases

| Current alias | Future target | Rule |
|---|---|---|
| `add-property.html` | `/app/properties/new` | Alias after canonical Add Property exists. |
| `my-properties.html` | `/app/properties` | Alias after canonical property list exists. |
| `dashboard-labs.html?demo=nick` | `/app/demo/nick` | Preserve direct internal demo alias. |
| `dashboard-labs.html?journeyDemo=nick` | `/app/demo/nick` | Redirect alias after demo route exists. |
| `dashboard.html` | `/app/properties` | Redirect/archive only after app list is verified. |
| `az-checker-v2.html` | `/app/properties/new` | Redirect/archive only after full-check UX is merged. |
| individual service `.html` pages | `/services/<slug>` | Alias after route architecture exists. |

## Route Invariants

1. No property workspace may silently fall back to `57 The Butts`.
2. A property-specific route requires a valid `propertyId`.
3. Missing or invalid `propertyId` returns to My Properties with a clear message.
4. Public Home and App Home are distinct.
5. App Home does not unexpectedly return to marketing Home.
6. Scenario routes seed a property before entering the journey.
7. Service routes preserve `serviceIntentId` or equivalent context.
8. QA parameters do not become product state.
9. `state=*` remains internal-only.
10. Legacy routes remain aliases until their canonical replacement passes.

## Stage 3-5 Route Violations To Resolve

- Public Add Property completion currently cannot open a selected workspace by `propertyId`.
- Public My Properties and Labs do not share route/state ownership.
- Bare `dashboard-labs.html` is a transitional, noncanonical bridge.
- Direct fixture query states remain operational for QA but must not become product state.
