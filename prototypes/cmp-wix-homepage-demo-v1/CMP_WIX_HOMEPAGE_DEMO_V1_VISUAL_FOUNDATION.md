# CMP Wix Homepage Demo V1 — Visual Foundation and Asset Discovery

## Preflight

- Current working directory: `/Users/davidtaylor/Desktop/VIBECODE/David-s-website`
- Git root: `/Users/davidtaylor/Desktop/VIBECODE/David-s-website`
- Current branch before task branch creation: `prototype/cmp-origin-v2-premium-homepage-rebuild-v1`
- Task branch: `prototype/cmp-wix-homepage-demo-v1-visual-foundation`
- Full HEAD: `72631d95ad09ff3ecfe7ef4447fadf2684b92dda`
- Short HEAD: `72631d9`
- Git status before task changes: clean (`git status --porcelain=v1` returned no entries)
- Tracked files clean before task changes: yes
- Untracked files/folders before task changes: none
- `/Users/davidtaylor/Desktop/VIBECODE/David-s-website` exists: yes
- `/Users/davidtaylor/Desktop/VIBECODE` exists: yes
- `/Users/davidtaylor/Code/mysite` handling: ignored completely; not searched, edited, read as an asset source, deployed from, or touched.

## Reference Artifacts Created

- Wix section screenshots: `prototypes/cmp-wix-homepage-demo-v1/reference/wix-homepage/`
- Wix screenshot contact sheet: `prototypes/cmp-wix-homepage-demo-v1/reference/wix-homepage/wix-homepage-section-contact-sheet.jpg`
- Local asset transparency/contact sheet: `prototypes/cmp-wix-homepage-demo-v1/reference/local-assets/cmp-candidate-assets-contact-sheet.jpg`
- Local asset metadata audit: `prototypes/cmp-wix-homepage-demo-v1/reference/local-assets/cmp-candidate-asset-audit.json`
- Verified Inspections preview screenshot: `prototypes/cmp-wix-homepage-demo-v1/reference/local-assets/verified-inspections-preview.png`

## 1. Verdict

Enough genuine local CMP/Wix assets exist to build a premium homepage prototype.

The strongest source of truth is the original local folder:

- `/Users/davidtaylor/Desktop/Comply my property all`

That folder contains real local Wix/CMP homepage assets matching the live homepage by filename, dimensions and visual content: grey logo, origami house imagery, warning tiles, service tiles, latest/support tiles, how-it-works infographic, and the `dashboard png.png` live asset. It also contains many additional CMP service, document, inspection, logo and support graphics.

The second strong source is:

- `/Users/davidtaylor/Desktop/VIBECODE/CMP-source-assets/cmp-verified-inspections-carousel-assets`

This is a dedicated CMP Verified Inspections asset pack with six local SVG homepage teaser banners.

The future build is ready from an asset-foundation point of view, with two caveats:

- The live Wix hero image matches the local `assets/generated/homepage-hero-wide.jpg`, but the best found local copy is an opaque JPG in the repo generated assets, not a transparent original PNG.
- Some live Wix service/dashboard assets are visually strong but contain baked-in text. The next build must avoid duplicating that text beside the images.

## 2. Wix Homepage Visual Reference

The live Wix homepage was loaded in a browser, waited on, slowly scrolled top to bottom with section pauses, then returned to the top for a final screenshot. The page reported title `ComplyMyProperty | Landlord Compliance Made Simple`, viewport `1440x1100`, and scroll height `7558px`.

Major sections observed:

- Header with grey horizontal CMP logo, compact green `Log In`, and a long horizontal nav.
- Hero with small green/blue value line, blue uppercase eyebrow, centered headline `The safest place to automate property compliance.`, supporting copy, three pill CTAs, and a wide dark laptop/dashboard compliance image.
- `What do you need help with today?` section repeating the CTA triad.
- Postcode/find-address area with a pale service selector pill, headline `The one stop shop for Property Compliance`, postcode input/button, and paper/origami house imagery.
- `We prepare you for what happens next` section with two warning tiles: EPC rent risk and eviction/non-compliance risk.
- Main services grid using tall PNG service cards.
- `The latest` support/news-style card row, including `Feel a bit lost?`, `Overcomplicating things?`, and EPC certificate content.
- `How ComplyMyProperty works` section using the large `dashboard png.png`/workflow infographic.
- Purple `Real people. Smart tech. No guesswork.` band with small CTAs.
- Very large multi-column footer with contact details, services, company information, platform positioning, legal/data protection, and social links.

Useful design cues:

- Centered Apple-like hero typography and generous white space.
- Blue uppercase eyebrow labels and restrained green support colour.
- Premium compliance desk image in the hero.
- Paper/origami/document language around postcode and property checks.
- Real warning tiles that feel landlord-specific rather than generic SaaS.
- Service-card graphics with recognisable CMP language.
- Strong product positioning phrase: `Real people. Smart tech. No guesswork.`

Typography, spacing and colour observations:

- Wix uses Helvetica-style fonts: `helvetica-w01-bold`, `helvetica-w01-roman`, plus Arial fallbacks.
- Hero headline is around `45px` on desktop, black, tightly centered.
- Eyebrows are small uppercase blue, around `13px`.
- Supporting text is grey, around `15px`.
- Core colours: black/near-black text, white background, bright blue `rgb(52, 94, 255)`, green `rgb(94, 197, 143)`, soft greys, and a violet/purple support band.
- Spacing is strongest in the hero and postcode sections, weaker in the service grid and footer.

Assets seen on Wix:

- `GREY LOGO COMPLY MY PROPERTY.png`
- `homepage-hero-wide.jpg`
- `oragami house.png`
- `HOUSE OREGAMI HD.png`
- `top tile epc.png`
- `top tile solicitor.png`
- Several transparent PNG service cards around `3935x4825`
- `dashboard png.png`

Areas the new prototype should improve:

- Simplify the overloaded header nav.
- Avoid repeated hero/CTA language in adjacent sections.
- Make the postcode journey feel more premium and less like a form dropped into an image band.
- Use transparent PNGs as composed objects, not as random tile collages.
- Improve service-card rhythm and hierarchy.
- Replace or redesign the dense how-it-works infographic if it undermines the premium direction.
- Make `The latest` into a polished news ribbon rather than static card clutter.
- Keep footer content but reduce visual weight and improve scan hierarchy.

## 3. Local Asset Search Summary

Folders searched or inspected:

- `/Users/davidtaylor/Desktop/VIBECODE/David-s-website`
- `/Users/davidtaylor/Desktop/VIBECODE`
- `/Users/davidtaylor/Desktop/Comply my property all`
- `/Users/davidtaylor/Desktop/VIBECODE/CMP-source-assets`
- `/Users/davidtaylor/Desktop/VIBECODE/CMP-art-direction-lab`
- `/Users/davidtaylor/Desktop/VIBECODE/cmp-netlify-publish-e8b67e4`

Important folders found:

- `/Users/davidtaylor/Desktop/Comply my property all` - strongest original local CMP/Wix asset pack.
- `/Users/davidtaylor/Desktop/Comply my property all/iconsforcmp` - transparent service icon set.
- `/Users/davidtaylor/Desktop/VIBECODE/CMP-source-assets/cmp-verified-inspections-carousel-assets` - dedicated Verified Inspections local SVG pack.
- `/Users/davidtaylor/Desktop/VIBECODE/David-s-website/prototypes/cmp-origin/assets/source-selected` - normalized local copies of many original assets; useful as confirmation/fallback, not as design source.
- `/Users/davidtaylor/Desktop/VIBECODE/David-s-website/assets/generated` - contains `homepage-hero-wide.jpg`, matching the live Wix hero.
- `/Users/davidtaylor/Desktop/VIBECODE/CMP-art-direction-lab/design-artifacts/cmp-local-asset-inventory-2026-06-22` - existing local asset manifest/contact sheet. It was used as an index only; it was not treated as the source of truth.

Likely Wix/CMP export folders found:

- `/Users/davidtaylor/Desktop/Comply my property all`
- `/Users/davidtaylor/Desktop/VIBECODE/David-s-website/prototypes/cmp-origin/assets/source-selected`
- `/Users/davidtaylor/Desktop/VIBECODE/David-s-website/prototypes/cmp-origin-v2/assets`

Missing or weak source areas:

- No raw local folder named `wix-homepage-assets` was found.
- No local file path containing the live Wix media hash IDs was found.
- No separate original transparent source for `homepage-hero-wide.jpg` was found; the available matching file is an opaque JPG.
- A top-level `/Users/davidtaylor/Desktop/iconsforcmp` folder was not present, but the nested folder `/Users/davidtaylor/Desktop/Comply my property all/iconsforcmp` exists.

Source folders that should not be edited:

- `/Users/davidtaylor/Desktop/Comply my property all`
- `/Users/davidtaylor/Desktop/VIBECODE/CMP-source-assets`
- `/Users/davidtaylor/Desktop/VIBECODE/CMP-art-direction-lab`
- `/Users/davidtaylor/Desktop/VIBECODE/David-s-website/prototypes/cmp-origin`
- `/Users/davidtaylor/Desktop/VIBECODE/David-s-website/prototypes/cmp-origin-v2`

Source folders that should not be committed:

- Do not commit the whole `/Users/davidtaylor/Desktop/Comply my property all` asset pack.
- Do not commit the whole `/Users/davidtaylor/Desktop/VIBECODE/CMP-source-assets` folder.
- Do not commit previous prototype asset folders wholesale.
- Future build should copy only selected original assets into `prototypes/cmp-wix-homepage-demo-v1/`.

`/Users/davidtaylor/Code/mysite` was not searched, read, edited or touched. The existing art-direction manifest mentions it as part of an older scan, but this task did not access that path.

## 4. Visual Asset Matching

### Logo

Exact live-Wix match:

- `/Users/davidtaylor/Desktop/Comply my property all/GREY LOGO COMPLY MY PROPERTY.png`
- Live Wix alt: `GREY LOGO COMPLY MY PROPERTY.png`
- Transparent PNG, `1304x168`, suitable for header and footer.

Additional useful logo assets:

- `/Users/davidtaylor/Desktop/Comply my property all/cmp sideways trans.png`
- `/Users/davidtaylor/Desktop/Comply my property all/cmp normal square trans.png`

### Hero

Likely live-Wix match:

- `/Users/davidtaylor/Desktop/VIBECODE/David-s-website/assets/generated/homepage-hero-wide.jpg`

This visually matches the live hero: dark desk, laptop compliance dashboard, binders, documents, blue lighting. It is an opaque JPG, not a transparent original.

### Paper / Origami / Postcode

Exact live-Wix matches:

- `/Users/davidtaylor/Desktop/Comply my property all/oragami house.png`
- `/Users/davidtaylor/Desktop/Comply my property all/HOUSE OREGAMI HD.png`

Both are transparent PNGs and are central to the Wix paper/document visual language. They should be used as floating/grounded artwork, not placed inside visible boxes.

### Warning Tiles

Exact live-Wix matches:

- `/Users/davidtaylor/Desktop/Comply my property all/top tile epc.png`
- `/Users/davidtaylor/Desktop/Comply my property all/top tile solicitor.png`

Both are transparent PNGs with intentional baked warning-card rectangles. They should not receive additional card frames unless the future layout deliberately uses a framed warning module.

### Services

Strong visual matches to the live services area:

- `/Users/davidtaylor/Desktop/Comply my property all/Compliance Checker A-Z TILE.png`
- `/Users/davidtaylor/Desktop/Comply my property all/epc's tile.png`
- `/Users/davidtaylor/Desktop/Comply my property all/ AML TILE.png`
- `/Users/davidtaylor/Desktop/Comply my property all/gas safety tile2.png`
- `/Users/davidtaylor/Desktop/Comply my property all/property inspections tile.png`
- `/Users/davidtaylor/Desktop/Comply my property all/landlord insurance tile.png`
- `/Users/davidtaylor/Desktop/Comply my property all/Selective licensing tile.png`
- `/Users/davidtaylor/Desktop/Comply my property all/Mortgages tile.png`
- `/Users/davidtaylor/Desktop/Comply my property all/Trouble Tenants tile.png`

The live service images have no useful alt names in the DOM, but their dimensions and visual style match this original pack. These are genuine CMP/Wix candidates, not stock fillers.

### Dashboard / Product Preview

Exact live-Wix how-it-works image:

- `/Users/davidtaylor/Desktop/Comply my property all/dashboard png.png`

Important note: despite its filename, this is the `How ComplyMyProperty works` infographic, not the dark dashboard hero image.

Useful non-Wix product fallback:

- `/Users/davidtaylor/Desktop/VIBECODE/David-s-website/assets/cmp-dashboard-preview.png`

This is a cleaner opaque product UI preview and may be stronger for premium product storytelling, but it is not the exact live Wix homepage asset.

### Support / Human-Tech

Live/latest visual matches:

- `/Users/davidtaylor/Desktop/Comply my property all/Feel a bit lost_.png`
- `/Users/davidtaylor/Desktop/Comply my property all/bit lost tile.png`
- `/Users/davidtaylor/Desktop/Comply my property all/overcomplicating things tile.png`
- `/Users/davidtaylor/Desktop/Comply my property all/EPC BIG TILE.png`

Useful support/human fallback candidates:

- `/Users/davidtaylor/Desktop/Comply my property all/png human layer.png`
- `/Users/davidtaylor/Desktop/VIBECODE/David-s-website/assets/generated/public-v2-system/photos/human-support-review.png`

### Verified Inspections

Not part of the current live Wix homepage, but a strong local source pack for the future requested component:

- `/Users/davidtaylor/Desktop/VIBECODE/CMP-source-assets/cmp-verified-inspections-carousel-assets/01-live-verified-capture.svg`
- `/Users/davidtaylor/Desktop/VIBECODE/CMP-source-assets/cmp-verified-inspections-carousel-assets/02-no-upload-loophole.svg`
- `/Users/davidtaylor/Desktop/VIBECODE/CMP-source-assets/cmp-verified-inspections-carousel-assets/03-room-coverage.svg`
- `/Users/davidtaylor/Desktop/VIBECODE/CMP-source-assets/cmp-verified-inspections-carousel-assets/04-lidar-depth-aware.svg`
- `/Users/davidtaylor/Desktop/VIBECODE/CMP-source-assets/cmp-verified-inspections-carousel-assets/05-compare-over-time.svg`
- `/Users/davidtaylor/Desktop/VIBECODE/CMP-source-assets/cmp-verified-inspections-carousel-assets/06-evidence-with-property.svg`

The pack is purpose-built for a homepage `Coming Soon` carousel and uses careful language around live capture, location/session context, coverage, and LiDAR.

### Footer

No distinct footer artwork was found beyond logo usage. The footer should use the grey logo and improve the current Wix footer structure with cleaner columns, better grouping, and less visual density.

### Other Useful Assets

- `/Users/davidtaylor/Desktop/Comply my property all/iconsforcmp/*.png` - transparent service icon set.
- `/Users/davidtaylor/Desktop/Comply my property all/how it works png.png` - lighter how-it-works variant, visually less aligned to live Wix than `dashboard png.png`.
- `/Users/davidtaylor/Desktop/Comply my property all/making-tax-digital.png` - opaque/fully baked; useful only if Making Tax Digital becomes a lower-priority service tile.

## 5. Transparency Audit

| Asset filename | Source path | Type | Dimensions | Size | Alpha / transparency status | Transparency design-critical | Flat background status | Recommended future homepage use | Use original or optimised | Notes |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- | --- |
| `GREY LOGO COMPLY MY PROPERTY.png` | `/Users/davidtaylor/Desktop/Comply my property all/GREY LOGO COMPLY MY PROPERTY.png` | PNG | 1304x168 | 28.6 KB | Transparent pixels, 83.66% | Yes | Transparent/varied corners | Header and footer logo | Original PNG | Exact Wix logo match; never put in a white/grey box. |
| `cmp sideways trans.png` | `/Users/davidtaylor/Desktop/Comply my property all/cmp sideways trans.png` | PNG | 2480x2480 | 523.7 KB | Transparent pixels, 94.6% | Yes | Transparent/varied corners | Optional brand mark/accent | Original PNG | Useful if a vertical logo lockup is needed. |
| `cmp normal square trans.png` | `/Users/davidtaylor/Desktop/Comply my property all/cmp normal square trans.png` | PNG | 2480x2480 | 718.9 KB | Transparent pixels, 87.28% | Yes | Transparent/varied corners | Favicon/card accent only | Original PNG | Do not replace the live grey header logo with this in the main nav. |
| `homepage-hero-wide.jpg` | `/Users/davidtaylor/Desktop/VIBECODE/David-s-website/assets/generated/homepage-hero-wide.jpg` | JPG | 1823x863 | 248.5 KB | Opaque/no alpha | No | Opaque photographic crop | Hero media | Original local JPG | Visually matches live hero, but no transparency. |
| `oragami house.png` | `/Users/davidtaylor/Desktop/Comply my property all/oragami house.png` | PNG | 3456x1071 | 3.0 MB | Transparent pixels, 46.73% | Yes | Transparent/varied corners | Postcode/document landscape | Original PNG | Exact Wix asset; preserve spelling and transparency. |
| `HOUSE OREGAMI HD.png` | `/Users/davidtaylor/Desktop/Comply my property all/HOUSE OREGAMI HD.png` | PNG | 3024x4032 | 6.9 MB | Transparent pixels, 63.19% | Yes | Transparent/varied corners | Postcode focal object | Original PNG | Exact Wix asset; use over soft paper background. |
| `top tile epc.png` | `/Users/davidtaylor/Desktop/Comply my property all/top tile epc.png` | PNG | 8000x5000 | 6.3 MB | Transparent pixels, 53.44% | Yes | Transparent/varied corners | EPC risk warning tile | Original PNG | Visible warning rectangle is intentional artwork. |
| `top tile solicitor.png` | `/Users/davidtaylor/Desktop/Comply my property all/top tile solicitor.png` | PNG | 8000x5000 | 4.6 MB | Transparent pixels, 53.46% | Yes | Transparent/varied corners | Possession/eviction warning tile | Original PNG | Do not frame inside another accidental card. |
| `Compliance Checker A-Z TILE.png` | `/Users/davidtaylor/Desktop/Comply my property all/Compliance Checker A-Z TILE.png` | PNG | 3935x4825 | 22.8 MB | Transparent pixels, 7.64% | Yes | Transparent/varied corners | First service card | Original PNG | Very large; keep for visual pass. |
| `epc's tile.png` | `/Users/davidtaylor/Desktop/Comply my property all/epc's tile.png` | PNG | 8000x8000 | 419.9 KB | Transparent pixels, 72.6% | Yes | Transparent/varied corners | EPC service visual | Original PNG | Mostly transparent; needs careful scale/crop. |
| ` AML TILE.png` | `/Users/davidtaylor/Desktop/Comply my property all/ AML TILE.png` | PNG | 3935x4825 | 16.2 MB | Transparent pixels, 7.64% | Yes | Transparent/varied corners | AML service card | Original PNG | Leading filename space; preserve path carefully when copying later. |
| `gas safety tile2.png` | `/Users/davidtaylor/Desktop/Comply my property all/gas safety tile2.png` | PNG | 3935x4825 | 844.9 KB | Transparent pixels, 7.64% | Yes | Transparent/varied corners | Gas Safety service card | Original PNG | Strong match to live grid. |
| `property inspections tile.png` | `/Users/davidtaylor/Desktop/Comply my property all/property inspections tile.png` | PNG | 3935x4825 | 2.0 MB | Transparent pixels, 7.64% | Yes | Transparent/varied corners | Property inspections service card | Original PNG | Use near Verified Inspections only if story is clearly separated. |
| `landlord insurance tile.png` | `/Users/davidtaylor/Desktop/Comply my property all/landlord insurance tile.png` | PNG | 3935x4825 | 22.2 MB | Transparent pixels, 7.64% | Yes | Transparent/varied corners | Insurance service card | Original PNG | Very large; do not optimise in this visual pass. |
| `Selective licensing tile.png` | `/Users/davidtaylor/Desktop/Comply my property all/Selective licensing tile.png` | PNG | 3935x4825 | 2.1 MB | Transparent pixels, 7.64% | Yes | Transparent/varied corners | Selective licensing service card | Original PNG | Good landlord-specific visual. |
| `Mortgages tile.png` | `/Users/davidtaylor/Desktop/Comply my property all/Mortgages tile.png` | PNG | 3935x4825 | 1.2 MB | Transparent pixels, 7.64% | Yes | Transparent/varied corners | Mortgages service card | Original PNG | Lower homepage priority than compliance services. |
| `Trouble Tenants tile.png` | `/Users/davidtaylor/Desktop/Comply my property all/Trouble Tenants tile.png` | PNG | 3935x4825 | 1.9 MB | Transparent pixels, 7.64% | Yes | Transparent/varied corners | Tenant/legal support card | Original PNG | Avoid legal overclaims around possession/eviction. |
| `making-tax-digital.png` | `/Users/davidtaylor/Desktop/Comply my property all/making-tax-digital.png` | PNG | 1920x1080 | 214.4 KB | Alpha channel but fully opaque | No | Opaque similar corners | Optional lower-priority tile | Original if used | Not a transparency-critical asset. |
| `SERVICE_0008_----EPC.png` | `/Users/davidtaylor/Desktop/Comply my property all/iconsforcmp/SERVICE_0008_----EPC.png` | PNG | 1254x1254 | 1.1 MB | Transparent pixels, 50.26% | Yes | Transparent/varied corners | Small icon/system UI accent | Original PNG | Better than text buttons for compact controls. |
| `SERVICE_0009_gas.png` | `/Users/davidtaylor/Desktop/Comply my property all/iconsforcmp/SERVICE_0009_gas.png` | PNG | 1254x1254 | 1017.7 KB | Transparent pixels, 58.19% | Yes | Transparent/varied corners | Gas icon/accent | Original PNG | Use sparingly. |
| `SERVICE_0005_EICR.png` | `/Users/davidtaylor/Desktop/Comply my property all/iconsforcmp/SERVICE_0005_EICR.png` | PNG | 1254x1254 | 991.2 KB | Transparent pixels, 58.17% | Yes | Transparent/varied corners | EICR icon/accent | Original PNG | Good for service chooser. |
| `SERVICE_0003_AML-Checks.png` | `/Users/davidtaylor/Desktop/Comply my property all/iconsforcmp/SERVICE_0003_AML-Checks.png` | PNG | 1254x1254 | 755.3 KB | Transparent pixels, 62.53% | Yes | Transparent/varied corners | AML icon/accent | Original PNG | Preserve transparency. |
| `SERVICE_0010_----Property-Inspections.png` | `/Users/davidtaylor/Desktop/Comply my property all/iconsforcmp/SERVICE_0010_----Property-Inspections.png` | PNG | 1254x1254 | 1014.4 KB | Transparent pixels, 57.39% | Yes | Transparent/varied corners | Inspection icon/accent | Original PNG | Pairs with Verified Inspections teaser if needed. |
| `Feel a bit lost_.png` | `/Users/davidtaylor/Desktop/Comply my property all/Feel a bit lost_.png` | PNG | 4825x3935 | 11.8 MB | Transparent pixels, 10.9% | Yes | Transparent/varied corners | Latest/support card | Original PNG | Live/latest match; do not use alongside duplicate `bit lost tile.png`. |
| `bit lost tile.png` | `/Users/davidtaylor/Desktop/Comply my property all/bit lost tile.png` | PNG | 4825x3935 | 11.9 MB | Transparent pixels, 10.9% | Yes | Transparent/varied corners | Duplicate latest/support candidate | Original PNG | Use only if visually better than `Feel a bit lost_.png`; avoid duplicate. |
| `overcomplicating things tile.png` | `/Users/davidtaylor/Desktop/Comply my property all/overcomplicating things tile.png` | PNG | 4825x3935 | 1.5 MB | Transparent pixels, 10.9% | Yes | Transparent/varied corners | Latest/support card | Original PNG | Strong for plain-English positioning. |
| `EPC BIG TILE.png` | `/Users/davidtaylor/Desktop/Comply my property all/EPC BIG TILE.png` | PNG | 4825x3935 | 11.6 MB | Transparent pixels, 10.9% | Yes | Transparent/varied corners | Latest/support or EPC explainer | Original PNG | Contains baked copy; avoid duplicating nearby. |
| `mk-assets-20584440-automatedtasks-26-10-22.png` | `/Users/davidtaylor/Desktop/Comply my property all/mk-assets-20584440-automatedtasks-26-10-22.png` | PNG | 2200x1240 | 113.6 KB | Alpha channel but fully opaque | No | Opaque similar corners | Avoid or fallback only | Original if used | Generic automated-task visual; less CMP-specific. |
| `how it works png.png` | `/Users/davidtaylor/Desktop/Comply my property all/how it works png.png` | PNG | 4961x3508 | 1.7 MB | Transparent pixels, 0.2% | Low | Transparent/varied corners | Alternate how-it-works visual | Original PNG | Lighter variant; live Wix uses `dashboard png.png` look instead. |
| `dashboard png.png` | `/Users/davidtaylor/Desktop/Comply my property all/dashboard png.png` | PNG | 4961x3508 | 918.3 KB | Transparent pixels, 56.61% | Yes | Transparent/varied corners | How-it-works infographic | Original PNG | Exact live file name; not actually a dashboard preview. |
| `cmp-dashboard-preview.png` | `/Users/davidtaylor/Desktop/VIBECODE/David-s-website/assets/cmp-dashboard-preview.png` | PNG | 1536x1024 | 1.5 MB | Opaque/no alpha | No | Opaque photographic/UI background | Product preview fallback | Original local PNG if used | Stronger polished UI preview, but not live Wix exact. |
| `human-support-review.png` | `/Users/davidtaylor/Desktop/VIBECODE/David-s-website/assets/generated/public-v2-system/photos/human-support-review.png` | PNG | 1536x1024 | 2.0 MB | Opaque/no alpha | No | Opaque photographic crop | Human support fallback | Original local PNG if used | Not a Wix homepage match. |
| `png human layer.png` | `/Users/davidtaylor/Desktop/Comply my property all/png human layer.png` | PNG | 4961x2707 | 10.5 MB | Transparent pixels, 44.62% | Yes | Transparent/varied corners | Human support composition | Original PNG | Preserve transparency if used. |
| `01-live-verified-capture.svg` | `/Users/davidtaylor/Desktop/VIBECODE/CMP-source-assets/cmp-verified-inspections-carousel-assets/01-live-verified-capture.svg` | SVG | 1440x260 | 5.8 KB | Vector transparency possible | Yes | Vector | Verified Inspections carousel | Original SVG | Purpose-built teaser asset. |
| `02-no-upload-loophole.svg` | `/Users/davidtaylor/Desktop/VIBECODE/CMP-source-assets/cmp-verified-inspections-carousel-assets/02-no-upload-loophole.svg` | SVG | 1440x260 | 5.6 KB | Vector transparency possible | Yes | Vector | Verified Inspections carousel | Original SVG | Good for no camera-roll shortcut message. |
| `03-room-coverage.svg` | `/Users/davidtaylor/Desktop/VIBECODE/CMP-source-assets/cmp-verified-inspections-carousel-assets/03-room-coverage.svg` | SVG | 1440x260 | 5.7 KB | Vector transparency possible | Yes | Vector | Verified Inspections carousel | Original SVG | Good for red-to-green coverage concept. |
| `04-lidar-depth-aware.svg` | `/Users/davidtaylor/Desktop/VIBECODE/CMP-source-assets/cmp-verified-inspections-carousel-assets/04-lidar-depth-aware.svg` | SVG | 1440x260 | 5.7 KB | Vector transparency possible | Yes | Vector | Verified Inspections carousel | Original SVG | Wording includes `LiDAR-enhanced on compatible Pro devices`; keep careful wording. |
| `05-compare-over-time.svg` | `/Users/davidtaylor/Desktop/VIBECODE/CMP-source-assets/cmp-verified-inspections-carousel-assets/05-compare-over-time.svg` | SVG | 1440x260 | 5.7 KB | Vector transparency possible | Yes | Vector | Verified Inspections carousel | Original SVG | Good move-in vs later inspection story. |
| `06-evidence-with-property.svg` | `/Users/davidtaylor/Desktop/VIBECODE/CMP-source-assets/cmp-verified-inspections-carousel-assets/06-evidence-with-property.svg` | SVG | 1440x260 | 5.8 KB | Vector transparency possible | Yes | Vector | Verified Inspections carousel | Original SVG | Good evidence-storage story; avoid legal guarantee language. |

## 6. Must-Use Assets for the Future Build

Logo:

- `/Users/davidtaylor/Desktop/Comply my property all/GREY LOGO COMPLY MY PROPERTY.png`
- Optional: `/Users/davidtaylor/Desktop/Comply my property all/cmp normal square trans.png`

Hero:

- `/Users/davidtaylor/Desktop/VIBECODE/David-s-website/assets/generated/homepage-hero-wide.jpg`

Origami / postcode:

- `/Users/davidtaylor/Desktop/Comply my property all/oragami house.png`
- `/Users/davidtaylor/Desktop/Comply my property all/HOUSE OREGAMI HD.png`

Warning tiles:

- `/Users/davidtaylor/Desktop/Comply my property all/top tile epc.png`
- `/Users/davidtaylor/Desktop/Comply my property all/top tile solicitor.png`

Service cards:

- `/Users/davidtaylor/Desktop/Comply my property all/Compliance Checker A-Z TILE.png`
- `/Users/davidtaylor/Desktop/Comply my property all/epc's tile.png`
- `/Users/davidtaylor/Desktop/Comply my property all/ AML TILE.png`
- `/Users/davidtaylor/Desktop/Comply my property all/gas safety tile2.png`
- `/Users/davidtaylor/Desktop/Comply my property all/property inspections tile.png`
- `/Users/davidtaylor/Desktop/Comply my property all/landlord insurance tile.png`
- `/Users/davidtaylor/Desktop/Comply my property all/Selective licensing tile.png`
- `/Users/davidtaylor/Desktop/Comply my property all/Mortgages tile.png`
- `/Users/davidtaylor/Desktop/Comply my property all/Trouble Tenants tile.png`

Dashboard / product preview:

- `/Users/davidtaylor/Desktop/Comply my property all/dashboard png.png`
- Secondary polished fallback: `/Users/davidtaylor/Desktop/VIBECODE/David-s-website/assets/cmp-dashboard-preview.png`

Support / human-tech:

- `/Users/davidtaylor/Desktop/Comply my property all/Feel a bit lost_.png`
- `/Users/davidtaylor/Desktop/Comply my property all/overcomplicating things tile.png`
- `/Users/davidtaylor/Desktop/Comply my property all/EPC BIG TILE.png`
- Optional: `/Users/davidtaylor/Desktop/Comply my property all/png human layer.png`

Latest updates:

- Prefer a designed text/ribbon component, supported by small CMP service icons if needed.
- Do not force a large image into the updates ribbon.

Verified Inspections:

- All six SVGs in `/Users/davidtaylor/Desktop/VIBECODE/CMP-source-assets/cmp-verified-inspections-carousel-assets/`

Footer:

- Reuse `/Users/davidtaylor/Desktop/Comply my property all/GREY LOGO COMPLY MY PROPERTY.png`
- No separate footer image asset is required.

## 7. Assets to Avoid

- `Feel a bit lost?.png`, `bit lost tile?.png`, and `top tile .png` where they are 0-byte placeholder/broken files.
- Previous prototype WebP-optimised copies as the source of truth, especially under `prototypes/cmp-origin/assets/optimized` and `prototypes/cmp-origin-v2/assets`.
- Flattened WebP/JPG replacements for transparent PNGs when alpha matters.
- External stock-like files in `Comply my property all` such as generic Shutterstock/AdobeStock/mould/house photos unless David explicitly approves them later.
- `mk-assets-20584440-automatedtasks-26-10-22.png` as a major visual; it feels generic and is fully opaque.
- `Court-ready support.png` and any asset/copy implying court-ready, legally verified, eviction-ready or guaranteed legal outcomes.
- Duplicate `Feel a bit lost_` / `bit lost tile` variants in the same build.
- The dense `dashboard png.png` infographic as a hero/product dashboard replacement. It is acceptable for a how-it-works reference, but it is not a premium product dashboard.
- Large service cards with baked copy used beside duplicate live text. If the image already says it, the surrounding copy should summarise or route, not repeat.

## 8. New Homepage Design Direction

The next homepage should feel like a premium, polished upgrade of the Wix homepage, not a separate SaaS dashboard concept.

Direction:

- Wix-inspired structure, Apple-level spacing, quieter hierarchy and cleaner scan paths.
- Real CMP/Wix transparent PNGs used as composed brand objects, especially the grey logo, origami house, warning tiles and service cards.
- Paper, document and origami language carried through postcode, evidence and compliance sections.
- Soft white/near-white page base with subtle blue/green accents, light paper gradients and occasional glass effects.
- Hero should feel calm and high-trust: more Apple product page than startup landing page.
- Landlord-specific product storytelling: EPC, Gas Safety, EICR, alarms, documents, inspections, licensing, evidence, reminders and human help.
- Use restraint. The assets already have strong visual character, so the layout should not add decorative orbs, generic gradient blobs or random stock imagery.

The core feeling should be:

`A safer, clearer operating system for UK private landlords: real people, smart tech, no guesswork.`

## 9. Future Homepage Structure

### A. Header

- Purpose: Establish CMP brand trust and route landlords quickly.
- Layout: Slim sticky/glass header, grey logo left, primary nav grouped into `Services`, `How it works`, `Updates`, `Inspections`, `Support`, with `Log in` and one primary `Check property` action.
- Copy direction: Plain labels; no long duplicated service list in the top bar.
- Assets: `GREY LOGO COMPLY MY PROPERTY.png`.
- Transparency rules: Logo must remain transparent, no image box.
- Mobile behaviour: Logo left, compact menu icon right, primary CTA visible or in first drawer row.
- What to avoid: Current Wix-style overloaded horizontal nav.

### B. Hero

- Purpose: Explain CMP quickly to private landlords and establish premium confidence.
- Layout: Centered headline/copy with hero image underneath or partially visible behind the fold; keep a hint of next section visible.
- Copy direction: `Landlord compliance made simple.` followed by clear support/AI/compliance explanation.
- Assets: `homepage-hero-wide.jpg`, grey logo if needed.
- Transparency rules: Hero JPG is opaque; do not pretend it is transparent. Use full-bleed/cinematic crop.
- Mobile behaviour: Headline first, CTAs stacked, hero image cropped to show laptop/dashboard not just dark background.
- What to avoid: Generic SaaS claims, oversized dashboard UI cards, or replacing the Wix-aligned hero with unrelated stock.

### C. Latest Landlord Updates / News Ribbon

- Purpose: Show legislation reminders, upcoming changes, landlord news and compliance alerts.
- Layout: Premium BBC News-style ribbon below hero: static label, 3-4 headline chips, subtle progress/next control, no cheap marquee.
- Copy direction: Treat headlines as prototype/example content unless connected to a real feed later.
- Assets: Small service icons only if useful; no major image needed.
- Transparency rules: If using icons, preserve PNG transparency.
- Mobile behaviour: Horizontal snap list with one active headline and compact secondary headlines.
- What to avoid: Animated ticker chaos, fake live API claims, alarmist legal certainty.

Prototype headline directions:

- `Renters' reform watch: keep evidence and notices organised.`
- `EPC planning: know what expires before it becomes urgent.`
- `Damp and mould: record repairs, inspections and tenant reports clearly.`
- `Licensing checks: confirm local rules before advertising a property.`

### D. What Do You Need Help With Today?

- Purpose: Convert landlord uncertainty into focused next steps.
- Layout: Calm chooser with 4-6 service/intention chips, not a duplicate of the hero CTAs.
- Copy direction: `Start with the issue in front of you. CMP can widen the picture when it helps.`
- Assets: `iconsforcmp` transparent service icons.
- Transparency rules: Icons float on clean buttons; do not wrap icons in white boxes.
- Mobile behaviour: Two-column icon grid or horizontal segmented selector.
- What to avoid: Repeating Wix text verbatim right after the hero.

### E. Postcode / Find Address

- Purpose: Make property-specific compliance feel tangible.
- Layout: Paper/origami visual band with postcode input integrated into a premium panel, with documents fading behind.
- Copy direction: `Check one property first. See what CMP can find, what is missing, and what to do next.`
- Assets: `oragami house.png`, `HOUSE OREGAMI HD.png`.
- Transparency rules: Preserve transparency; place over soft paper gradient, no accidental image rectangle.
- Mobile behaviour: Input first, origami house below or behind at reduced opacity.
- What to avoid: Tiny form floating over a busy background.

### F. We Prepare You for What Happens Next

- Purpose: Show CMP understands real landlord risk, not just checklists.
- Layout: Two premium warning modules using the EPC and solicitor tiles, with short explanatory text.
- Copy direction: Evidence, notices, deadlines and next actions, not fear.
- Assets: `top tile epc.png`, `top tile solicitor.png`.
- Transparency rules: Tiles have intentional baked warning rectangles; do not put them in another visible image frame.
- Mobile behaviour: Stack warnings with image above text.
- What to avoid: Eviction-ready/court-ready guarantees.

### G. Guided Clarity / From "No Clue" to Under Control

- Purpose: Explain the calm guided workflow for landlords who do not yet understand compliance.
- Layout: Three-step horizontal story: `Find what applies`, `Understand what matters`, `Keep evidence organised`.
- Copy direction: Plain English, neurodivergent-friendly workflow language used subtly.
- Assets: `iconsforcmp` service icons, optional small document/paper assets.
- Transparency rules: Use transparent icons directly on the page.
- Mobile behaviour: Vertical timeline with clear step labels.
- What to avoid: Making this personal to David or making the product sound like one person built it.

### H. Main Services Preview

- Purpose: Show breadth of CMP services without turning the homepage into a collage.
- Layout: Curated 6-card grid on desktop; optional `View all services` route for the rest.
- Copy direction: Service names plus one plain-English landlord outcome.
- Assets: Original service tiles from `Comply my property all`.
- Transparency rules: Preserve alpha; use consistent crop/scale; avoid extra boxes around already-designed card artwork.
- Mobile behaviour: 2-card grid or horizontal snap cards.
- What to avoid: Showing every asset at full size with inconsistent spacing.

### I. CMP Verified Inspections Coming Soon

- Purpose: Tease future app-based inspection capture while avoiding legal overclaiming.
- Layout: Dark premium band or short carousel using the six local SVG banners.
- Copy direction: `Coming soon: inspections with fewer blind spots.`
- Assets: Verified Inspections SVG pack.
- Transparency rules: Preserve SVGs; do not rasterise unless forced by the build environment.
- Mobile behaviour: One SVG/card at a time with dots or segmented controls.
- What to avoid: Guaranteed, court-ready, legally verified, possession approved, eviction ready.

Recommended copy:

`CMP Verified Inspections is being designed to give landlords a clearer, more reliable view of property condition between visits, using live in-app capture, location checks, timestamps and guided room-by-room prompts. LiDAR-enhanced on compatible iPhone Pro and iPad Pro devices.`

### J. How ComplyMyProperty Works

- Purpose: Explain postcode-to-action-plan flow.
- Layout: Replace or refine the dense Wix infographic into a clearer 4-5 step premium flow. The original `dashboard png.png` can be used as visual reference or supporting image.
- Copy direction: `Enter postcode`, `CMP checks available data`, `You answer what we cannot know`, `CMP builds an action plan`, `Evidence stays organised`.
- Assets: `dashboard png.png` only if the design keeps the Wix infographic look; otherwise use icons and product UI.
- Transparency rules: If using `dashboard png.png`, preserve transparent areas and place it intentionally.
- Mobile behaviour: Vertical stepper with one line per step.
- What to avoid: Tiny unreadable infographic text on mobile.

### K. Real People. Smart Tech. No Guesswork.

- Purpose: Land the human support plus smart AI assistance message.
- Layout: Premium full-width support band, less heavy than Wix purple; split text and concise proof points.
- Copy direction: AI assists with speed and organisation; real people support judgement and service routing.
- Assets: Optional `png human layer.png` or `human-support-review.png`.
- Transparency rules: Preserve `png human layer.png` if used.
- Mobile behaviour: Text first, image/illustration below.
- What to avoid: AI hype or claiming AI makes legal decisions.

### L. Footer

- Purpose: Provide contact, services, company, legal and social information without overwhelming the page.
- Layout: Tidy multi-column footer with grouped headings, softer text hierarchy and clear compliance/legal notes.
- Copy direction: Keep current Wix facts but reduce repeated phrasing.
- Assets: Grey logo.
- Transparency rules: Logo transparent.
- Mobile behaviour: Accordion/grouped footer sections.
- What to avoid: Current dense wall of footer text.

## 10. Copy Direction

Hero:

- `Landlord compliance made simple.`
- `ComplyMyProperty helps UK private landlords understand what applies, track the evidence, and move from "no clue" to under control with real support and smart assistance.`
- `Start with one property. Check what matters. Keep the proof in one place.`

Postcode:

- `Check a property first. CMP can help you see what is known, what is missing, and what needs attention next.`

Guided clarity:

- `Designed around plain-English guidance, neurodivergent-friendly workflows and real-world testing to help landlords self-manage compliance from "no clue" to under control.`

Services:

- `EPC, Gas Safety, EICR, alarms, licensing, inspections, evidence and reminders - organised around the property, not scattered across inboxes.`

Human/AI:

- `AI helps organise the moving parts. Real people help keep the judgement grounded.`

Latest updates:

- `Important landlord updates, explained without the panic.`

Verified Inspections:

- `Coming soon: inspections with fewer blind spots.`
- `Guided live capture, room-by-room prompts, timestamps and property-linked records - designed to make condition evidence harder to recycle and easier to understand.`

Avoid:

- `Unlock your potential`
- `Seamless experience`
- `Transform your workflow`
- `Revolutionary platform`
- `Supercharge productivity`
- `Court-ready`
- `Legally verified`
- `Guaranteed`

## 11. Build Rules for the Next Prompt

- Build only inside `prototypes/cmp-wix-homepage-demo-v1/`.
- Do not use previous prototype files as the design source.
- Use the live Wix homepage and this report as the visual foundation.
- Use original transparent PNGs first from `/Users/davidtaylor/Desktop/Comply my property all`.
- Use Verified Inspections SVGs from `/Users/davidtaylor/Desktop/VIBECODE/CMP-source-assets/cmp-verified-inspections-carousel-assets`.
- Copy only selected assets into the future prototype; do not commit whole source folders.
- Do not flatten transparent assets.
- Do not convert transparent PNGs to JPG.
- Do not create accidental white, grey or blue image boxes around transparent assets.
- Do not duplicate text that is already baked into image assets.
- No Wix hotlinks.
- No external stock imagery unless explicitly approved.
- Include a premium Latest Landlord Updates ribbon.
- Include a CMP Verified Inspections Coming Soon section.
- Use `LiDAR-enhanced on compatible iPhone Pro and iPad Pro devices` wording only.
- Avoid legal/evidential overclaims: no guaranteed, court-ready, legally verified, possession approved or eviction ready wording.
- Keep the page landlord-specific and UK-specific.
- Desktop and mobile QA required before calling the build complete.
- Do not deploy.
- Do not production deploy.
- Do not use `--prod`.
- Do not touch `/Users/davidtaylor/Code/mysite`.

## 12. Open Questions / Missing Assets

- Is there a more original/non-generated source for `homepage-hero-wide.jpg`, or is the current local JPG the intended source?
- Should the next build copy source assets from `/Users/davidtaylor/Desktop/Comply my property all`, or should David provide a curated copy folder inside the repo first?
- Should the service preview show all current Wix service tiles or a tighter compliance-first set?
- Should `dashboard png.png` be used visually, or should the how-it-works section be redesigned in HTML around its ideas?
- Which latest-landlord-updates headlines are safe to use as prototype content if no live feed exists?
- Is CMP Verified Inspections intended to be one carousel, one hero banner, or a short explanatory section with one static visual?
- Confirm final footer legal/company copy before build, especially if it differs from live Wix.
