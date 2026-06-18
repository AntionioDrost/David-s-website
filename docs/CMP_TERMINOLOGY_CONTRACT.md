# CMP Terminology Contract

Last updated: 2026-06-18  
Status: Committed product source of truth

This contract defines approved CMP language by context. Stage 2 does not bulk-replace product copy. Later stages should use this contract when changing routes, components, content or tests.

## Public Terminology

Preferred public terms:

| Term | Use |
|---|---|
| `Check My Property` | Primary public CTA into the full property journey. |
| `Full property check` | Supporting phrase for the full compliance journey. |
| `Book a service` | Public service acquisition intent, only where booking is not falsely implied as completed. |
| `Try the demo` | Public demo entry once demo runs over the normal journey. |
| `Ask CMP` | Public helper or app assistant, with clear context boundaries. |
| `Services` | Public service directory and service routes. |
| `Possession readiness` | Specialist public possession route. |
| `Property compliance` | Broad public category language. |

## App Terminology

Preferred app terms:

| Term | Use |
|---|---|
| `My Properties` | App home/property list. |
| `Add property` | App action for creating or adding a property record. |
| `Smart Checks` | User-facing stage where CMP checks available data. |
| `Review found data` | Stage for reviewing sourced findings. |
| `Answer unknowns` | Stage for landlord-only or uncertain data. |
| `Property Brain` | User-facing representation of the canonical property graph. |
| `Compliance Analysis` | Rules-engine analysis view. |
| `Current status` | Status summary without legal guarantee. |
| `Next best action` | One priority action shown before deeper detail. |
| `Action Plan` | Derived action list. |
| `Evidence Vault` | Evidence and proof state for a property. |
| `Request service` | App/prototype service action where no live booking is completed. |
| `Timeline` | Chronological property activity and generated events. |
| `Ask CMP` | Property-aware assistant. |
| `Monitoring` | Derived reminders, changes and renewal watchlist. |
| `Reports` | Generated reports and compliance packs from Property Brain snapshots. |

## Internal-Only Terminology

These terms must not normally appear to landlords:

- `Journey OS`
- `labsState`
- `PropertyRecord`
- `ScenarioDefinition`
- `fixture`
- `QA state`
- `state=new-property`
- raw debug/advanced terms
- internal rule IDs
- raw storage keys

Internal terms may appear in developer docs, QA tools, test reports and code comments where appropriate.

## Clarified Concepts

| Concept | Approved definition |
|---|---|
| `Property Brain` | User-facing representation of the canonical property graph. It describes what CMP knows, found, needs and recommends for one property. |
| `PropertyRecord` | Technical root entity for one property. It owns identity, source findings, answers, issues, evidence, actions, services, timeline, monitoring and reports. |
| `Smart Checks` | User-facing stage label for checks CMP runs against available data and simulated/live sources. |
| `Automatic checks` | Supporting explanatory phrase, not the primary stage label. |
| `A-Z Compliance Check` | Marketing/product concept for the full property journey. It is not a separate application route or state store. |
| `Add property` | App action used by returning or signed-in users. |
| `Check My Property` | Public entry CTA into the full property journey. |
| `Book a service` | Public service intent. It must not imply completed booking unless live booking exists. |
| `Request service` | Prototype/app action where no live booking exists. |
| `Add evidence` | Normal product concept for adding proof. |
| `Add proof later` | Valid prototype/evidence-gap state. |
| `Verified` | Restricted. Use only when verification source/status is explicit. |
| `Compliant` | Restricted. Must not be presented as a legal guarantee. |

## Deprecated-Language Table

| Current/deprecated term | Approved replacement | Replacement timing |
|---|---|---|
| `A-Z checker` as a standalone app | `Full property check` or `Check My Property` | Stage 3+ |
| `Journey OS` in landlord UI | `Property Brain`, `Compliance Analysis` or `Action Plan` by context | internal-only |
| `Labs` in landlord UI | `Workspace` or `My Properties` by context | visual-copy stage |
| `state=new-property` | canonical property setup/review route | internal-only |
| `fixture` | `demo scenario` in demo context | internal-only |
| `advanced` / `debug` | hidden QA controls | internal-only |
| `dashboard` for the app | `My Properties` or `Property workspace` | Stage 3+ |
| `Book now` where no live booking exists | `Request service` or `Prepare request` | visual-copy stage |
| `Uploaded` where no document is stored | `Add proof later` or `Prepared for review` | Stage 4+ |
| `Verified` without explicit source | `Needs confirmation`, `Likely match` or `Accepted proof` | Stage 4+ |
| `Fully compliant` | `No current gaps found` with source/rule limits | visual-copy stage |
| `AI confirmed compliance` | `CMP guidance based on current rules and evidence` | visual-copy stage |

## Copy Rules

- Prefer action-oriented language over internal system labels.
- Use `Current status` instead of legal guarantees.
- Use `Next best action` for the primary recommendation.
- Use `Recommended because...` for every service recommendation.
- Use `Unknown` without blame and explain the next step it creates.
