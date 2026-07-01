# CMP Origin V2 Homepage Visual Blueprint

## Preflight

- Current working directory: `/Users/davidtaylor/Desktop/VIBECODE/David-s-website`
- Git root: `/Users/davidtaylor/Desktop/VIBECODE/David-s-website`
- Current branch: `repair/cmp-origin-homepage-and-service-repair-v2`
- Full HEAD: `d04e470eaca256900455d4c4b8beeefcb859edba`
- Short HEAD: `d04e470`
- Git status at preflight: clean
- Worktree clean at preflight: yes
- Local branch `repair/cmp-origin-asset-audit-and-optimisation-v2` exists: yes
- `prototypes/cmp-origin/CMP_ORIGIN_ASSET_MAP.md` exists: yes
- `prototypes/cmp-origin/assets/optimized/` exists: yes
- `/Users/davidtaylor/Code/mysite` was ignored completely: yes

## Live Wix Load Verification

The Wix homepage appeared fully loaded before analysis.

Capture process used for the reference inspection:

- Opened `https://www.complymyproperty.com/` in a browser.
- Waited for the page body, header, and grey ComplyMyProperty logo.
- Waited for font readiness where the browser exposed `document.fonts.ready`.
- Waited for the hero image to report complete with a non-zero natural size.
- Waited 10 seconds after initial load.
- Slowly scrolled from top to bottom, pausing at each major section to trigger Wix lazy-loaded images.
- Waited at the bottom, then confirmed required imagery was loaded.
- Scrolled back to the top and waited another 4.5 seconds before reference screenshots.
- Repeated the process at desktop `1440x1000` and mobile `390x844`.

Loaded-image evidence from the slow desktop pass:

- Grey logo loaded: yes, `GREY LOGO COMPLY MY PROPERTY.png`
- Hero visual loaded: yes, `homepage-hero-wide.jpg`
- Origami/document imagery loaded: yes, `oragami house.png` and `HOUSE OREGAMI HD.png`
- EPC warning tile loaded: yes, `top tile epc.png`
- Solicitor/possession warning tile loaded: yes, `top tile solicitor.png`
- Service tile images loaded: yes, 12 service-card images detected
- Dashboard/product preview loaded: yes, `dashboard png.png`
- Support/latest tile images loaded: yes, 5 support/latest images detected
- Footer text loaded: yes

Loaded mobile still showed real horizontal overflow after all imagery had loaded: body scroll width `1271px` against a `390px` viewport. That is a live responsive-layout issue, not a lazy-loading artifact.

## 1. Verdict

Enough visual and asset evidence exists to build a Wix-aligned CMP Origin V2 homepage.

The strongest evidence is the combination of the fully loaded Wix homepage, the optimized asset map, and the exact optimized matches for the logo, origami/document scene, warning tiles, service tiles, support tiles, and product/process preview. The only important missing piece is the exact local source for the live dark laptop hero image. The next build should not use Wix hotlinks or raw desktop files. It should either use no hero image until a proper optimized replacement exists, or use the existing fallback only with restraint because it pushes the page toward a darker dashboard/product direction than the requested Wix-aligned homepage.

Guiding principle:

> Match the Wix homepage structure first. Improve the polish second.

## 2. Live Wix Homepage Summary

The fully loaded Wix homepage is a white, centered, image-led landlord compliance homepage. It is not a generic SaaS landing page. Its identity comes from the grey CMP wordmark, pill-shaped navigation, very large centered hero typography, a full-width laptop compliance image, paper/origami property imagery, warning graphics, and illustrated service tiles.

The top of the page uses a soft grey floating header with a left brand/login cluster and a long pill navigation row. It currently includes too many links and several temporary dashboard entries. The hero then sits in a large white field with a small green/blue trust line, a blue uppercase eyebrow, a bold multiline headline, short support copy, and three CTAs. Below that, the dark laptop hero image becomes the first strong visual moment.

The middle of the page repeats the help prompt and CTA row, then repeats the navigation as a rounded service chooser. That duplicated navigation should not be copied directly, but the intent should be preserved: the user is being asked to choose a focused landlord-compliance task rather than explore a broad platform.

The strongest visual sequence is the postcode/origami area and the warning-tile area. The page moves from "The one stop shop for Property Compliance" into a postcode and Find Address control, then into a large paper/origami house over compliance documents. Immediately below, the page uses direct risk language and two warning tiles: EPC compliance risk and solicitor/eviction risk. This is the most recognisably CMP part of the homepage.

The services section uses illustrated tiles in a broad carousel/grid. The cards are playful but topic-specific: EPC rating arc, AML record keeping, gas safety, inspections, landlord insurance, selective licensing, mortgages, and tenant issues. The cards should be retained as a core visual language, but the layout should be cleaner and not feel like an oversized carousel spilling off the page.

The lower page includes a "latest" strip with support tiles, a product/process preview titled "How ComplyMyProperty works", a strong "Real people. Smart tech. No guesswork." band, and a large multi-column footer. The content is useful, but the live structure is cluttered and should be simplified.

Visual findings:

- Header structure: floating grey/white pill header, logo/login on the left, long navigation to the right.
- Logo treatment: small grey horizontal CMP wordmark, restrained and professional.
- Navigation style: pill links with soft shadows, but too many links and temporary dashboard labels.
- Hero layout: centered text above a full-width visual, not a split SaaS hero.
- Hero typography scale: large multiline black headline, controlled support text, blue eyebrow.
- CTA treatment: rounded grey primary, outlined secondary, plain/text third action.
- Main visual assets: laptop hero, origami/document house, warning tiles, service tiles, product/process image.
- Section order: header, hero, help prompt, service chooser, postcode/origami, warning tiles, services, latest/support, product/process, smart-tech band, footer.
- Section spacing rhythm: generous white space at top; denser visual sections below.
- Card styles: rounded image cards with soft shadows and image-first service artwork.
- Postcode / Find Address treatment: centered small postcode input plus blue Find Address button over the origami section.
- Warning tile treatment: black/yellow legal-risk graphics, direct copy below each tile.
- Origami/document/house visual language: paper house and compliance documents are the central brand metaphor.
- Services section layout: broad card rows/carousel; should become a cleaner controlled grid.
- Dashboard/product preview placement: lower page, after service/support content, as an explainer/product proof point.
- Smart-tech / human-support section: bold horizontal band with headline, subhead, postcode CTA.
- Footer structure: large light-grey multi-column footer with green divider lines and small grey text.
- Mobile implications: current live mobile overflows horizontally after full load; V2 must not copy this.
- Weak Wix elements to avoid copying: duplicated nav, temporary dashboard links, repeated/latest clutter, carousel overflow, oversized mobile elements, broken horizontal layout.
- Strong Wix elements to preserve: centered premium hero, grey logo, pill UI language, paper/origami compliance metaphor, warning tile directness, service tile artwork, human-plus-tech positioning.

## 3. Design Direction

The V2 direction should be the finished, sharper, more premium version of the current Wix homepage.

Copy closely from Wix:

- Overall section order and visual story.
- White and pale-grey page atmosphere.
- Small grey CMP logo in the header.
- Centered hero composition.
- Big but controlled black hero headline.
- Blue/green small trust and eyebrow accents where appropriate.
- Rounded pill controls.
- Origami/document/house compliance metaphor.
- Direct EPC and possession warning tile moment.
- Illustrated service-card asset language.
- Product/process preview lower on the page.
- "Real people. Smart tech. No guesswork." as the closing reassurance.
- Large information-rich footer, but cleaned up.

Improve from Wix:

- Remove duplicated navigation and temporary dashboard links.
- Replace the body nav block with a deliberate help/service chooser.
- Reduce clutter in "latest" content.
- Turn carousel overflow into controlled responsive grids.
- Make mobile layout first-class.
- Keep hero type premium but not oversized.
- Keep CTAs consistent, accessible, and clearly ranked.
- Use optimized local assets only.
- Clean legal language so it is helpful and direct without overclaiming.

Avoid:

- Generic SaaS sections, dark dashboard concepts, stock gradients, random asset collages, CMP Prime/Vault/Concierge/Radar concepts, raw assets, Wix hotlinks, oversized typography, and full app/dashboard flows.

## 4. Section-by-Section Homepage Plan

### A. Header

- Purpose: establish CMP identity quickly and provide a concise navigation path.
- Layout direction: a single sticky or top-positioned rounded header, max-width aligned to the page content. Logo on the left, 4-6 primary nav items in the middle/right, Login or My Properties action at the far right.
- Copy direction: keep nav labels plain: Home, Services, Check Property, How It Works, Contact. Avoid dashboard placeholder labels.
- Asset usage: `logo-grey-live.png` as the primary logo. Optional `logo-colour-horizontal.png` only if contrast is needed in footer or small-screen treatment.
- Spacing notes: header height around 64-72px desktop; 56-64px mobile. Use 16-24px horizontal padding.
- Typography notes: nav text 14-15px, medium weight, no tiny 10px labels.
- What must resemble Wix: soft pill container, grey logo, calm white/grey surface, rounded nav controls.
- What should be improved from Wix: one navigation system only, no duplicate body menu, no temporary dashboard links.
- What to avoid: horizontal overflow, hidden clipped nav items, duplicated navigation, excessive pill links.

### B. Hero

- Purpose: communicate CMP's core promise before the user sees product/service detail.
- Layout direction: centered white hero text above a strong visual band. Keep the Wix structure: text first, hero visual below. Do not redesign into a split SaaS hero.
- Copy direction: keep close to the live message: landlord compliance made simple, safest place to automate property compliance, no subscription fee, start with one service or check a property.
- Asset usage: the exact live laptop hero asset is not available locally. Do not use Wix hotlinks. Do not make the page depend on `homepage-hero-dashboard-fallback.jpg`; it is optional only and visually darker than the Wix homepage direction. If used, crop it as a secondary product/support visual, not as the defining hero.
- Spacing notes: desktop hero text block should sit with 90-120px top breathing room after header and 44-64px before the image. Mobile should reduce top spacing to 48-64px.
- Typography notes: hero heading 56-64px desktop, 38-44px mobile, tight line-height around 0.98-1.05, max-width around 620px. Support copy 16-18px desktop, 15-16px mobile.
- What must resemble Wix: centered copy, blue uppercase eyebrow, three-action CTA row, hero visual directly below the copy.
- What should be improved from Wix: stronger hierarchy, more consistent CTA styling, no clipped mobile content.
- What to avoid: giant viewport-width type, dark-dashboard-first composition, split hero layout, generic gradient hero.

### C. What do you need help with today?

- Purpose: translate the homepage promise into a focused user choice.
- Layout direction: keep the Wix idea of a centered help prompt beneath the hero image, but replace the duplicated nav block with a compact service-choice panel.
- Copy direction: "What do you need help with today?" plus one short support line about choosing one service and widening later only if useful.
- Asset usage: no large image required. Small icon chips can use optimized service icons only if needed, but the service-card artwork should be saved for the services section.
- Spacing notes: 72-96px desktop after hero image; 48-64px mobile. Keep panel height modest.
- Typography notes: section eyebrow 12-13px uppercase, heading 36-42px desktop, 28-32px mobile.
- What must resemble Wix: the repeated question and the idea of focused choice.
- What should be improved from Wix: remove the second full navigation menu; use clean chips or buttons instead.
- What to avoid: "Property Dashboard", "Copy of Property Dashboard", "LABS DASHBOARD", and any app-flow promise.

### D. Postcode / Find Address Band

- Purpose: make property checking feel immediate and practical.
- Layout direction: a pale grey/white band with a subtle wavy document-line motif if feasible, centered headline, postcode input, Find Address button, and the origami house/document image underneath.
- Copy direction: keep close to Wix: "The one stop shop for Property Compliance" and "Enter your postcode here to check compliance".
- Asset usage: `homepage-origami-house-wide.webp` as the broad document-scene visual. Use `homepage-origami-house-cropped.webp` only if a tighter focal crop is needed.
- Spacing notes: 80-110px desktop section padding. On mobile, stack headline, input, button, then a cropped image with stable height.
- Typography notes: headline 36-44px desktop, 28-32px mobile. Input text 15-16px.
- What must resemble Wix: centered postcode action over paper/origami compliance imagery.
- What should be improved from Wix: better input/button alignment and no blue-only system drift unless used specifically for the Find Address action.
- What to avoid: full address lookup complexity, real API behavior, giant image overflow on mobile.

### E. We prepare you for what happens next

- Purpose: explain CMP as risk preparation, not just certificate booking.
- Layout direction: white or pale-grey section below the origami band, centered headline, then two warning tiles in a balanced two-column row.
- Copy direction: keep the Wix logic: "We don't just make you compliant. We prepare you for what happens next." Add a short honesty line: "You can be honest with us - we build around your real situation."
- Asset usage: `homepage-warning-epc.webp` and `homepage-warning-solicitor.webp`.
- Spacing notes: 72-96px top/bottom desktop; 48-64px mobile. Warning cards should have consistent aspect ratio and captions.
- Typography notes: heading 34-40px desktop, 27-32px mobile. Captions 15-16px.
- What must resemble Wix: black/yellow warning graphics and direct legal-risk tone.
- What should be improved from Wix: tone down fear where needed, keep copy legally careful, align tiles cleanly.
- What to avoid: overclaiming legal outcomes, excessive alarmism, stretched warning images.

### F. Origami / Honesty Section

- Purpose: reinforce the brand metaphor: real property compliance is messy, paper-based, and situational, and CMP helps organize it.
- Layout direction: this can be combined visually with D/E or treated as a short bridge after the warning tiles. Use a two-column layout on desktop: text on one side, cropped origami house on the other. Stack on mobile.
- Copy direction: explain that CMP can handle imperfect landlord situations: missing documents, uncertain EPC status, council licensing questions, notices, and renewal deadlines.
- Asset usage: `homepage-origami-house-cropped.webp` as the focal illustration if D uses the wide image. If D already uses both origami images, keep this section text-led.
- Spacing notes: keep this compact, 64-80px desktop, 44-56px mobile, so it does not create a dead zone.
- Typography notes: heading 30-36px desktop, 26-30px mobile; body 16-18px.
- What must resemble Wix: the honest, direct "real situation" line and paper-house visual language.
- What should be improved from Wix: make the message clearer and less visually repetitive.
- What to avoid: adding new stock house imagery or abstract document icons.

### G. Main Services Preview

- Purpose: show the real service breadth without making the homepage feel like a random marketplace.
- Layout direction: controlled card grid, not a spilling carousel. Desktop: 3 or 4 columns with 6 featured cards visible. Mobile: one-card horizontal snap carousel or one-column stack with no overflow.
- Copy direction: use concise titles and one-sentence descriptions. Prioritize compliance checker, EPC, AML, selective licensing, landlord insurance, and one optional service such as mortgages or possession support.
- Asset usage: essential service tiles:
  - `service-compliance-checker-tile.webp`
  - `service-epc-tile.webp`
  - `service-aml-tile.webp`
  - `service-selective-licensing-tile.webp`
  - `service-landlord-insurance-tile.webp`
  - optional: `service-mortgages-tile.webp` or a possession/legal tile
- Spacing notes: use 24px card gap desktop, 16px mobile. Keep card heights stable and avoid layout shift.
- Typography notes: service section heading 32-38px; card titles 18-21px; card support text 14-16px.
- What must resemble Wix: image-first illustrated cards with rounded corners and soft shadows.
- What should be improved from Wix: no clipped carousel, no giant offscreen row, no support/latest cards mixed into services.
- What to avoid: unrelated service concepts, raw assets, cards inside nested cards.

### H. Product / Dashboard Preview

- Purpose: show how CMP turns a property check into a compliance picture without launching a full app flow.
- Layout direction: lower-page light product proof section. Use the preview image centered with a short headline and three benefit points beside or below it.
- Copy direction: frame it as "From postcode to a clearer compliance picture", not a live dashboard promise.
- Asset usage: `homepage-dashboard-overview.webp` as the primary preview. It is the optimized version of the live lower product/process graphic.
- Spacing notes: 80-110px desktop, 56-72px mobile. Keep image width capped around 980-1100px desktop.
- Typography notes: heading 34-42px desktop, 28-32px mobile. Benefit labels 15-16px.
- What must resemble Wix: the "How ComplyMyProperty works" / "From Postcode to Fully Compliant" idea and the visual process preview.
- What should be improved from Wix: reduce clutter around the graphic, avoid repeating "latest", and make it feel like product proof rather than a busy infographic dump.
- What to avoid: dark dashboard blocks, full dashboard screens, app navigation, tenant-management detours.

### I. Real people. Smart tech. No guesswork.

- Purpose: close the page with trust: automation helps, but humans verify and support.
- Layout direction: full-width horizontal band before the footer. Use a pale grey or white band with green accents, not a large dark dashboard panel. A very restrained colored band is acceptable only if it remains within the CMP palette.
- Copy direction: keep the live headline exactly or nearly exactly: "Real people. Smart tech. No guesswork." Subhead: "AI helps us move fast - our team makes sure everything's right."
- Asset usage: optional support tiles `support-feel-lost.webp` and `support-overcomplicating.webp` can sit above or near this section as human-support proof. They should not become another "latest" carousel.
- Spacing notes: 72-96px desktop; 48-64px mobile. Include a small postcode CTA only if it does not duplicate the earlier band too aggressively.
- Typography notes: headline 38-48px desktop, 30-34px mobile. Subhead 18-22px desktop, 16-18px mobile.
- What must resemble Wix: the exact human-plus-tech message and late-page reassurance.
- What should be improved from Wix: align with the green/neutral CMP palette rather than a saturated purple block.
- What to avoid: overstating AI/legal automation, huge color block that feels unrelated to the rest of the page.

### J. Footer

- Purpose: provide contact, compliance, company, service, legal, and social information without overwhelming the page.
- Layout direction: light grey footer with a constrained inner grid. Desktop: 4-5 columns plus a bottom legal row. Mobile: accordion groups or stacked columns.
- Copy direction: preserve key categories from Wix: ComplyMyProperty description, Contact & Support, Company Information, Services & Compliance Support, Platform Positioning, Specialist Contacts, Data Protection, Legal, Follow.
- Asset usage: optional `logo-grey-live.png` or `logo-colour-horizontal.png`. Keep logo small and aligned.
- Spacing notes: 72-96px top padding desktop; 48-64px mobile. Use green divider lines sparingly.
- Typography notes: footer headings 12-13px uppercase; footer text 13-14px; links 13-14px.
- What must resemble Wix: large information-rich light footer and green divider detail.
- What should be improved from Wix: no horizontal clipping; stronger column alignment; reduce repeated contact clutter.
- What to avoid: tiny unreadable columns on mobile, legal overclaiming, full-width content wider than viewport.

## 5. Asset Usage Plan

All selected assets must come from `prototypes/cmp-origin/assets/optimized/`. Do not use raw desktop files, Wix hotlinks, or source-selected files.

All priority assets requested in the brief are present. No closest substitute is required for those files.

| Asset filename | Source location | Proposed V2 location | Section used in | Role in composition | Essential or optional | Size/performance concern |
|---|---|---|---|---|---|---|
| `logo-grey-live.png` | `prototypes/cmp-origin/assets/optimized/logo-grey-live.png` | Header and possibly footer | A, J | Exact live grey CMP logo | Essential | 650x84, 26 KB. Use rendered small, around 190-220px wide. |
| `homepage-origami-house-wide.webp` | `prototypes/cmp-origin/assets/optimized/homepage-origami-house-wide.webp` | Postcode / Find Address band | D | Wide document/origami scene | Essential | 1800x558, 103 KB. Good for desktop, needs capped/cropped mobile height. |
| `homepage-origami-house-cropped.webp` | `prototypes/cmp-origin/assets/optimized/homepage-origami-house-cropped.webp` | Origami/honesty bridge or mobile focal image | D, F | Cropped paper-house focal asset | Essential if wide image is insufficient on mobile | 900x1200, 89 KB. Good responsive fallback. |
| `homepage-warning-epc.webp` | `prototypes/cmp-origin/assets/optimized/homepage-warning-epc.webp` | Warning tile pair | E | EPC compliance risk tile | Essential | 900x563, 42 KB. Keep aspect ratio. |
| `homepage-warning-solicitor.webp` | `prototypes/cmp-origin/assets/optimized/homepage-warning-solicitor.webp` | Warning tile pair | E | Possession/solicitor risk tile | Essential | 900x563, 31 KB. Keep aspect ratio. |
| `service-compliance-checker-tile.webp` | `prototypes/cmp-origin/assets/optimized/service-compliance-checker-tile.webp` | Services grid | G | Lead service card | Essential | 900x1104, 82 KB. Stable card ratio required. |
| `service-epc-tile.webp` | `prototypes/cmp-origin/assets/optimized/service-epc-tile.webp` | Services grid | G | EPC service card | Essential | 900x1104, 42 KB. |
| `service-aml-tile.webp` | `prototypes/cmp-origin/assets/optimized/service-aml-tile.webp` | Services grid | G | AML service card | Essential | 900x1104, 65 KB. |
| `service-selective-licensing-tile.webp` | `prototypes/cmp-origin/assets/optimized/service-selective-licensing-tile.webp` | Services grid | G | Selective licensing card | Essential | 900x1104, 40 KB. |
| `service-landlord-insurance-tile.webp` | `prototypes/cmp-origin/assets/optimized/service-landlord-insurance-tile.webp` | Services grid | G | Landlord insurance card | Essential | 900x1104, 155 KB. Largest service tile; still acceptable but lazy-load below fold. |
| `service-mortgages-tile.webp` | `prototypes/cmp-origin/assets/optimized/service-mortgages-tile.webp` | Optional services grid card | G | Optional mortgage card if six-card row is needed | Optional | 900x1104, 34 KB. Only use if matching Wix service breadth. |
| `homepage-dashboard-overview.webp` | `prototypes/cmp-origin/assets/optimized/homepage-dashboard-overview.webp` | Product / dashboard preview | H | Process/product proof graphic | Essential | 1400x990, 98 KB. Cap width and avoid tiny unreadable mobile rendering. |
| `support-feel-lost.webp` | `prototypes/cmp-origin/assets/optimized/support-feel-lost.webp` | Human-support proof near smart-tech section | I | Support tile showing human help | Optional but useful | 900x734, 77 KB. Use one or two support tiles, not a new latest carousel. |
| `support-overcomplicating.webp` | `prototypes/cmp-origin/assets/optimized/support-overcomplicating.webp` | Human-support proof near smart-tech section | I | Support tile showing automation/support theme | Optional but useful | 900x734, 40 KB. |
| `support-epc-big-tile.webp` | `prototypes/cmp-origin/assets/optimized/support-epc-big-tile.webp` | Optional support/latest replacement | I or G | Extra topical support card | Optional | 900x734, 81 KB. Use only if the page needs a third support tile. |
| `homepage-hero-dashboard-fallback.jpg` | `prototypes/cmp-origin/assets/optimized/homepage-hero-dashboard-fallback.jpg` | Optional fallback only | B or H | Dark product/phone image fallback | Optional, use cautiously | 1800x1005, 66 KB. Not an exact live hero match; risks dark dashboard direction. |
| `logo-colour-horizontal.png` | `prototypes/cmp-origin/assets/optimized/logo-colour-horizontal.png` | Optional footer/contrast logo | J | Brand logo variant | Optional | 1402x216, 37 KB. |
| `green-button-reference.png` | `prototypes/cmp-origin/assets/optimized/green-button-reference.png` | CTA styling reference only | Global | Button visual reference | Optional reference | 656 B. Do not insert as content image unless needed. |

## 6. Typography Guidance

Use a mature, controlled type scale. The page should feel premium and readable, not loud. The live Wix homepage uses large type, but V2 should avoid oversized mobile headings and uncontrolled line breaks.

Suggested scale:

| Text role | Desktop size | Mobile size | Notes |
|---|---:|---:|---|
| Nav | 14-15px | 14px | Medium weight, no tiny 10px nav. |
| Eyebrow | 12-13px | 11-12px | Uppercase, blue or muted green, letter spacing 0. |
| Hero heading | 56-64px | 38-44px | Tight line-height, max-width 620px, controlled line breaks. |
| Hero support headline / subhead | 18-20px | 16-18px | Use for the line under the hero heading or smart-tech subhead. |
| Body copy | 16-18px | 15-16px | Charcoal or text grey. |
| Section headings | 34-44px | 28-34px | Keep shorter lines; avoid full-width headings. |
| Card titles | 18-22px | 17-20px | Enough weight to read over/near artwork. |
| Form/input text | 15-16px | 16px | Mobile inputs should avoid browser zoom issues. |
| Footer text | 13-14px | 13-14px | Keep readable; avoid faded, tiny footer copy. |
| Mobile hero heading | 38-44px | 38-44px | Absolute cap: do not exceed 44px at 390px width. |

Recommended font direction:

- Use a clean, professional sans-serif with strong numerals and readable lowercase.
- Avoid novelty fonts or generic startup display type.
- Keep letter spacing at 0.
- Use weight and line breaks for emphasis, not extra-large sizes.

## 7. Layout and Spacing Guidance

- Max page width: 1180-1240px for most content; allow selected visual bands to go full width when the Wix page does, especially hero and origami imagery.
- Desktop section spacing: 80-110px for major sections; 56-72px for compact bridge sections.
- Mobile section spacing: 48-64px for major sections; 36-48px for compact sections.
- Header width: max 1380px with 16-24px viewport gutters.
- Hero grid behavior: no split hero. Centered text block first, full-width visual below. On mobile, text must remain centered and fully visible.
- Hero image behavior: use stable aspect ratio and object-fit. Avoid enormous mobile height.
- Card grid behavior: desktop 3-4 columns; tablet 2 columns; mobile 1 column or horizontal snap. Never allow card rows to create body overflow.
- Warning tile behavior: desktop 2 columns, mobile stack.
- Postcode form behavior: desktop inline input/button; mobile stack or compact inline only if it fits at 390px.
- Product preview behavior: cap image width; on mobile show the image large enough to read or provide simplified supporting bullets.
- Footer layout: desktop multi-column grid; mobile stacked groups. Footer must stay inside the viewport.
- Mobile stacking rules: all content should fit inside `100vw` minus gutters. No fixed desktop widths. No offscreen carousel without intentional scroll containment.

## 8. Colour and UI System

Use a Wix-aligned CMP palette:

| Role | Colour |
|---|---|
| White | `#FFFFFF` |
| Pale grey | `#F5F6F4` |
| Soft card | `#FAFBF8` |
| Charcoal | `#1F1F1F` |
| Text grey | `#333333` |
| Muted grey | `#6F7472` |
| CMP green | `#007A3F` |
| Darker green | `#005C34` |
| Soft border | `#DCE1DC` |

Usage guidance:

- White and pale grey should dominate.
- Green should be used for primary CTAs, small status accents, divider lines, and selected states only.
- Charcoal should carry headings and high-priority text.
- Muted grey should carry support copy and footer text.
- Soft card surfaces should replace heavy nested card styling.
- Use blue only where it is inherited from specific Wix actions like Find Address, and consider converting to CMP green for system consistency.
- Avoid large dark dashboard blocks. The homepage should not become a dark product UI.
- Avoid one-note palettes. Do not let the page become entirely green, entirely grey, or purple-led.

## 9. Interaction Plan

Homepage-only interactions:

- `Check your property`: scrolls to the postcode / Find Address band or opens a small next-step panel anchored to that section.
- `View services`: scrolls to the Main Services Preview section.
- `My Properties`: opens a coming-next panel explaining that property management will come later; do not build a dashboard flow.
- `Find Address`: after a typed postcode, show 2-3 fictional sample addresses in a small results panel.
- Service card click: opens a selected-service panel with a short description, relevant next step, and a way back to services.

Do not build:

- Full dashboard flows.
- Real address lookup.
- Payment flow.
- Account creation.
- Legal case workflow.
- CMP Prime, Vault, Concierge, or Radar concepts.

## 10. Responsive Plan

### Desktop: 1440x1000

- Header should fit within the viewport with no horizontal clipping.
- Hero copy should be centered with the hero image visible below the fold hint.
- Postcode/origami band should have the same recognizable Wix composition.
- Warning tiles should sit as a balanced two-column row.
- Services should show a controlled grid, not offscreen carousel spillage.
- Product preview should be readable and centered.
- Footer should use a clean multi-column layout without negative x-positioning or clipping.

### Mobile: 390x844

- Current Wix after full slow-load verification still overflows horizontally: `1271px` body width for a `390px` viewport. V2 must fix this.
- Header should collapse to logo plus concise controls or a menu button.
- Hero heading should cap at 44px and remain fully visible.
- Hero image should crop with a stable aspect ratio, not push content sideways.
- Postcode and Find Address should stack or fit within the viewport.
- Warning tiles should stack at full available width.
- Services should show one card at a time or a contained snap carousel.
- Product preview should not render as a tiny unreadable desktop diagram.
- Footer columns should stack.

Risks to avoid:

- Oversized hero type.
- Enormous mobile images.
- Horizontal overflow.
- Cramped header.
- Too many cards visible at once.
- Chat/widget overlay covering primary CTAs in screenshots or prototypes.
- Footer clipped off the left or right edge.

## 11. Quality Bar

The build pass must satisfy this checklist:

- Clearly resembles the current Wix homepage.
- Feels cleaner and more premium than Wix.
- Matches Wix homepage structure first, then improves polish.
- Uses optimized local assets only.
- Uses the grey CMP logo treatment.
- Preserves the centered hero and image-led page rhythm.
- Preserves the origami/document/house visual language.
- Preserves the EPC and solicitor warning-tile moment.
- Preserves the service tile artwork style.
- Includes the product/process preview in the lower page.
- Includes "Real people. Smart tech. No guesswork."
- No random assets.
- No generic SaaS look.
- No oversized typography.
- No dark dashboard direction.
- No weak placeholder sections.
- No duplicated nav.
- No temporary dashboard links.
- No unoptimized assets.
- No Wix hotlinks.
- No raw Desktop files.
- No horizontal overflow at 390px.
- No overclaiming legal language.

## 12. Build Prompt Notes

Use these notes for the next build prompt:

- Build only the CMP Origin V2 homepage.
- The page should be a sharper, more premium rebuild of the live Wix homepage, not a new SaaS concept.
- Start from the live section order: Header, Hero, Help Today, Postcode/Find Address, Prepare for What Happens Next, Origami/Honesty, Main Services, Product Preview, Real People/Smart Tech, Footer.
- Use only assets from `prototypes/cmp-origin/assets/optimized/`.
- Use `logo-grey-live.png` in the header.
- Use `homepage-origami-house-wide.webp`, `homepage-origami-house-cropped.webp`, `homepage-warning-epc.webp`, `homepage-warning-solicitor.webp`, the selected service tiles, `homepage-dashboard-overview.webp`, and optionally the two support tiles.
- Do not use raw Desktop assets, Wix hotlinks, or source-selected files.
- Do not use the fallback dark hero image as the main direction unless a better exact hero asset is unavailable and the crop is carefully restrained.
- Keep the hero centered and white, with the visual below the copy.
- Replace duplicated Wix nav blocks with one clean header nav and one focused help/service chooser.
- Keep typography controlled: desktop hero around 56-64px, mobile hero capped at 44px.
- Use the CMP palette: white, pale grey, charcoal, muted grey, green accents.
- Use green for CTAs and small accents only.
- Avoid large dark dashboard sections.
- Make 390x844 mobile a first-class target and explicitly verify no horizontal overflow.
- Build only homepage interactions: scroll CTAs, fictional address results, selected-service panel, and coming-next panel for My Properties.
