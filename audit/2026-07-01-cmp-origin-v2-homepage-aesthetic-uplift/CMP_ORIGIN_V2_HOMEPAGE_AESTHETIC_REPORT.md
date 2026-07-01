# CMP Origin V2 Homepage Aesthetic Uplift Report

## Scope

- Branch: `prototype/cmp-origin-v2-homepage-aesthetic-uplift-v1`
- Source branch/commit: `prototype/cmp-origin-v2-homepage-foundation-v1` at `b5dc06698740ac5d0668d4a1b3633b32cdf9ff0e`
- Page edited: homepage only in `prototypes/cmp-origin-v2/`
- No service pages, dashboards, APIs, deploy, production deploy, or `/Users/davidtaylor/Code/mysite` work.

## Visual Critique Before Editing

The foundation build was materially better than the failed prototype because it followed the approved section order, used optimized local CMP assets, kept the grey logo, retained the white/pale-grey Wix-aligned brand direction, preserved the paper/origami compliance metaphor, avoided the dark-dashboard product concept, and already handled the basic 390px overflow requirement.

It still felt less premium than it should because most sections used the same simple card treatment, the hero image sat in a flat pale rectangle, visual hierarchy relied mainly on large type, the services grid felt like a clean prototype grid rather than an expensive commercial page, the warning tiles lacked deliberate framing, the dashboard preview had little relationship to the process steps, the smart-tech section felt quiet, and the footer read like a tidy sitemap rather than a finished brand close.

The most prototype-like sections were the help cards, service cards, warning tiles, dashboard/process preview, smart-tech support band, and footer. The hero needed stronger first-impression staging without becoming a split SaaS hero. The service cards needed stronger composition and selected states. The origami/postcode section had the right idea but needed more depth and form presence. Mobile was functional, but mostly a stacked version of desktop rather than a designed mobile composition.

Safe improvements were CSS/markup refinements using existing assets only: stronger paper-stage framing, better shadows and borders, clearer CTA grouping, more deliberate card proportions, a small origami visual in the honesty section, selected service styling, refined address-result styling, fuller support/footer composition, and tighter mobile media sizing.

## Changes Made

- Refined the header with a more premium floating pill shell, larger grey CMP logo treatment, improved nav spacing, stronger CTA balance, and cleaner public-site alignment.
- Reworked the hero visual treatment into a larger paper-stage composition with subtle document lines, layered paper planes, stronger shadowing, and a more confident CTA group while keeping centered text and the origami asset.
- Improved section rhythm with more deliberate white-to-pale-grey transitions, deeper but restrained shadows, cleaner section spacing, and less repetitive flat card styling.
- Upgraded the help cards with more deliberate numbered markers, top accent treatment on hover, stronger card depth, and better spacing.
- Strengthened the postcode/origami band with a more premium form container, softer document-line motif, larger origami scene, and improved interaction panel styling.
- Reframed warning tiles with padded media frames, stronger image borders, more balanced card height, and clearer copy hierarchy.
- Added a cropped origami visual to the honesty section and composed the honesty points into a more intentional paper-led panel.
- Rebuilt the services card presentation through CSS with stable image frames, richer card depth, better card proportions, hover styling, and a selected-card state.
- Improved the selected service interaction with visible selected-card styling and a more premium selected-service panel.
- Improved the dashboard preview frame and process-step rail relationship without making the product preview the main homepage concept.
- Made the smart-tech/human-support close feel more confident with a full-width band, stronger support tile framing, and better CTA/pill rhythm.
- Finished the footer with a logo treatment, stronger column spacing, refined dividers, better text hierarchy, and cleaner mobile stacking.
- Updated the homepage check tool so this branch's requested aesthetic audit folder is an allowed QA output path and fixed its git-status parser for modified files.

## Why These Changes Improve Aesthetics

- The hero now has a stronger designed moment while remaining white, centered, paper-led, and recognisably CMP/Wix-aligned.
- The page has more depth and hierarchy through controlled shadows, borders, document-line motifs, and media frames rather than extra sections or unrelated visuals.
- The postcode/origami sequence now feels like a signature branded moment instead of a simple form followed by an image.
- Warning cards now feel deliberate and high-value while keeping the language careful and non-alarmist.
- Services feel more expensive because the grid uses consistent framing, stronger proportions, selected states, and more deliberate CTA treatment.
- The product preview remains lower on the page but now reads as framed proof tied to process steps.
- The smart-tech support close and footer now feel like a designed end to the journey, not leftover page content.

## Before / After Notes

- Before: cleaner than the failed prototype, but visually flat and repetitive.
- After: still clearly the same CMP Origin V2 homepage concept, but with a more premium first impression, stronger paper/document composition, richer section rhythm, and a more finished footer.
- Before: mobile stacked correctly but felt utilitarian.
- After: mobile keeps the 44px hero cap, avoids horizontal overflow, keeps image heights controlled, and makes the cards/support/footer feel intentionally stacked.

## Desktop Result

Desktop target `1440x1000` was captured. The header fits cleanly, the centered hero remains dominant, the paper/origami image is more polished, the postcode band and warning tiles have stronger framing, the services grid is more composed, the product preview remains lower, the support close has more confidence, and the footer is visibly more complete.

## Mobile Result

Mobile target `390x844` was captured. No horizontal overflow was detected (`0px`). Tap targets remain at least 44px. The header is not cramped, the hero heading remains capped, images are not enormous, services remain usable in a single-column stack, and the footer stacks cleanly.

## Validation Result

Initial validation after the uplift passed:

- `node --check prototypes/cmp-origin-v2/app.js`
- `node prototypes/cmp-origin-v2/tools/cmp-origin-v2-homepage-check.mjs`
- `git diff --check`

The homepage check passed all 50 checks after the parser fix, including allowed-path checks, no Wix hotlinks, no raw Desktop paths, required copy, forbidden overclaim absence, no oversized V2 assets, no 390px horizontal overflow, and no console errors.

## Tradeoffs

- The exact dark Wix laptop hero was not used because the local optimized exact source is not available and the brief asked to preserve the paper/origami direction without Wix hotlinks.
- The page now uses richer CSS depth and a longer CSS override block rather than a broader structural rewrite, keeping the homepage scope controlled.
- Service imagery remains constrained by the existing local optimized tiles; the uplift improves framing and consistency without adding raw assets.

## Verdict

The page is now more premium than the foundation build. It keeps the same homepage-only scope, same section order, Wix-aligned CMP direction, paper/origami/document language, grey logo, landlord compliance positioning, and pale premium atmosphere, but feels more designed and less like a safe static prototype.

Ready for David manual review: yes.
