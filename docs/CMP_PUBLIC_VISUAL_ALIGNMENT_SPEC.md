# CMP Public Visual Alignment Spec

Last updated: 2026-06-19  
Status: Visual alignment source of truth for Wix-inspired CMP passes

## 1. Intent

This spec defines how CMP should borrow visual direction from the current Wix site without copying Wix source code, Wix assets, placeholder copy or broken route behaviour.

Use Wix as visual inspiration only. The canonical CMP model, storage, routes, service lifecycle, Ask CMP, reports, scenarios, guided demo and portfolio logic remain the product source of truth.

Prioritise these Wix references:

- `/book-online` for Request Centre and service-decision card language.
- `/copy-of-property-dashboard` for the property workspace visual bridge.
- `/property-dashboard` for property status/check framing.
- `/copy-of-gas-safety-1` for problem-led Mould & Damp visual urgency.
- `/possession-eviction-preparation` for question and decision-flow cards.

Do not copy:

- outdated EPC, Gas, finance or insurance pages as visual sources.
- placeholder or mismatched service copy.
- Wix internals, duplicated dashboard route labels, LABS labels or broken routes.
- live booking, supplier, payment, upload, verification or legal-compliance claims.

## 2. Colour Roles

- `Ink`: deep charcoal/blue-black for premium action surfaces and readable text.
- `Paper`: warm off-white and soft blue-grey shell backgrounds.
- `Glass`: translucent white panels with thin borders and subtle shadows.
- `Action blue`: primary public CTA colour for `Check My Property`.
- `Support green`: positive evidence or accepted-proof status, not legal compliance.
- `Amber`: issue-led or problem-led pages such as damp, possession or evidence gaps.
- `Muted stone`: secondary service/request surfaces, never the whole UI.

Use warning colours only for specific risk contexts. Avoid making every card blue.

## 3. Typography Scale

Public pages should use short, confident headings with compact explanatory copy:

- Hero headings: large, direct, balanced.
- Section headings: concise product promise or decision question.
- Card headings: action-oriented and scannable.
- Body copy: plain English, short enough to avoid data-dump feeling.

Do not scale text with viewport width outside existing responsive clamps. Letter spacing remains `0` except small uppercase labels.

## 4. Public Header Style

The public header should feel close to the Wix floating pill shell:

- softly floating container.
- rounded/pill navigation cluster.
- brand lockup at left.
- one quiet action cluster at right.
- no internal route labels.
- no QA, fixture, raw state or debug language.

On mobile, navigation may wrap, but it must not overflow horizontally.

## 5. Button Hierarchy

- Primary: deep ink/action surface for `Check My Property`, `Find address`, and selected next-step actions.
- Secondary: white/glass outline for safe supporting actions.
- Tertiary: quiet text or soft pill for demo or lower-priority links.

Use `Request service` for prototype/app service actions where no live booking is completed. `Book a service` remains public intent language only where it does not imply a completed booking.

## 6. Service-Card Families

Service cards should show different service personalities while using the same CMP system:

- energy/performance: blue.
- gas/safety: green.
- electrical: blue/steel.
- possession/admin: violet/ink.
- damp/condition: amber/problem-led.
- licensing/local authority: teal.

Card differentiation should come from icon, accent, top bar and small visual preview. Do not use emoji-like icons for serious compliance decisions.

## 7. Request-Centre Card Style

Borrow the `/book-online` pattern:

- one card equals one decision.
- clear heading.
- short explanation.
- action pill at the bottom.
- safe capability caveat where needed.

Translate examples safely:

- `Resolve one issue` -> request the relevant service.
- `Bundle multiple checks` -> prepare a bundle for review.
- `Get CMP guidance` -> Ask CMP guidance based on current information.

Always preserve `No supplier contacted` and `No payment taken` where a service request is simulated.

## 8. Property / Status Card Style

Borrow property dashboard principles:

- address and current status should dominate.
- one `Next best action` card should visually outrank secondary panels.
- evidence, service, Ask CMP, report and monitoring pathways should feel connected.
- status labels should say `Current status`, `Needs confirmation`, `Evidence gap`, `Accepted proof` or `Prepared for review`.

Do not present `Verified`, `Fully compliant`, `Legally compliant` or `AI confirmed compliance` unless explicitly supported.

## 9. Glass Panel Usage

Use glass panels for:

- public hero cards.
- service decision cards.
- Add Property and My Properties shell panels.
- selected property summary cards.

Do not overuse muddy brown/grey translucency. Readability beats visual novelty.

## 10. Icon And Graphic Rules

- Prefer restrained line icons, shield/file/property metaphors and status chips.
- Use real-world imagery only when it reinforces a problem-led service page.
- Do not hotlink Wix assets.
- Do not introduce a new illustration system during a foundation pass.
- Do not copy Wix source, spacing tokens or implementation details.

## 11. Section Rhythm

Public pages should alternate:

- hero / decision area.
- property-led explanation.
- service/request choices.
- evidence/monitoring/report continuity.

First viewport must show the product promise and a clear CTA. Do not copy Wix pages with large blank first viewports.

## 12. Public-To-App Bridge Rules

Public pages can be more expressive. App/workspace pages should be calmer and denser:

- shared brand/nav/card language should make the transition feel connected.
- workspace surfaces should prioritise utility, current status and next best action.
- demo/scenario/portfolio surfaces must not feel like a separate fake product.

## 13. Mobile Rules

- no horizontal overflow.
- cards stack clearly.
- CTAs remain visible and thumb-friendly.
- nav wraps without exposing debug/internal labels.
- guided demo panels must not hide the product target.
- selected property current status remains readable in the first mobile viewport.

## 14. What Not To Copy From Wix

- placeholder copy.
- duplicated route names.
- `LABS DASHBOARD`, `Copy of Property Dashboard` or route-internal names.
- pages with clipped first viewports.
- broken mobile dashboard overflow.
- booking/payment/supplier implications.
- policy/blank pages as visual references.
- any source code or hosted assets.
