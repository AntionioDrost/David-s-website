# CMP Nick-Safe Rescue Report

Date: 2026-06-29  
Branch: `rescue/cmp-nick-safe-single-property-journey-v1`  
Source branch: `redesign/cmp-stage-h-full-presentation-rebuild-v1`  
Source commit: `9f61ace26a72a9735076bb7430832a5188527412`

## Verdict

Pass for local Nick walkthrough testing. The normal one-property journey now follows the intended spine:

Homepage or service page -> Add Property -> Smart Checks -> Review found data -> Answer property questions -> Property Brain -> one next best action -> Evidence or service action -> Monitoring -> My Properties.

No merge was performed. No deploy was performed. No API keys were added. `/Users/davidtaylor/Code/mysite` was not touched.

## What Changed

- Review Found Data now renders as two decision groups only:
  - What CMP found
  - What CMP still needs
- The duplicate/ghost "What to do next" review group was removed.
- The single Review Found Data handoff now uses:
  - Heading: "What happens next"
  - Copy: "Answer the remaining property questions so CMP can complete the Property Brain and recommend one clear next action."
  - Primary CTA: "Continue property setup"
  - Secondary CTA: "Save and return to My Properties"
- The selected-property workspace first view now leads with:
  - property identity
  - property setup/status copy
  - file strength
  - confirmed facts
  - remaining checks
  - next best action
  - one primary CTA
- Ask CMP is contextual:
  - visible as secondary helper actions
  - drawer-only in the selected-property workspace
  - no permanent right-hand command-centre rail on the first route
- Normal one-property workspace navigation is reduced to:
  - Overview
  - Evidence
  - Action Plan
  - Monitoring
- Portfolio/demo/scenario surfaces are hidden from the normal selected-property route.
- Services now appear from the Action Plan as a response to an evidence/service action, not as a competing main journey.

## Hidden Or Removed Duplicate Surfaces

- Removed the Review Found Data "What to do next" group.
- Removed the duplicate handoff wording by making only one visible `data-canonical-handoff-section`.
- Hid normal-route sidebar entries for Add property, Ask CMP, Compliance centre, My Properties/Properties, Request service, Learn and Settings.
- Hid support/account sidebar groups on the selected-property workspace route.
- Hid the permanent assistant rail on normal one-property routes unless the contextual drawer is opened.
- Hid all-property evidence selection from the selected-property Evidence route.
- Hid portfolio/demo/scenario controls from normal one-property routes.

## Validation

Focused rescue check:

```bash
node tools/cmp-nick-safe-rescue-check.mjs
```

Result: passed 33 assertions.

The check confirms:

- one Add Property route
- one Review Found Data renderer
- one handoff section
- no duplicate "What to do next" cards
- no "Continue guided check" on normal routes
- no visible demo/scenario controls on normal one-property routes
- no low-opacity or low-contrast normal text found by the focused check
- no horizontal overflow at 390px mobile
- selected property route uses one `propertyId` and one address
- first workspace view has one clear next action
- 390px Review Found Data handoff remains readable

## Screenshots

Contact sheet: `audit/2026-06-29-cmp-nick-safe-rescue/CMP_NICK_SAFE_CONTACT_SHEET.html`

Screenshot manifest: `audit/2026-06-29-cmp-nick-safe-rescue/screenshot-manifest.json`

Before screenshots: `audit/2026-06-29-cmp-nick-safe-rescue/before/`  
After screenshots: `audit/2026-06-29-cmp-nick-safe-rescue/after/`

Captured states:

- Add Property initial
- Review Found Data
- Review handoff
- property questions
- first workspace overview
- Evidence
- Action Plan
- Monitoring
- My Properties one-property state

Captured breakpoints:

- 1440x1000
- 1280x800
- 1024x900
- 390x844

## Remaining Issues

No blocking issues found for the Nick-safe one-property walkthrough. Evidence, Action Plan and Monitoring still retain compact filter toolbars below the main route content, but they are scoped to the selected property and are not visible as competing portfolio/demo controls on the first workspace screen.
