# CMP Wix Homepage Demo V1

Fresh static homepage prototype for ComplyMyProperty, built from the approved visual foundation report and the loaded live Wix homepage reference.

## How to View

Open `index.html` directly in a browser, or run a local static server from the repo root:

```bash
python3 -m http.server 4173 --bind 127.0.0.1 --directory prototypes/cmp-wix-homepage-demo-v1
```

Then open `http://127.0.0.1:4173/`.

## Branch

`prototype/cmp-wix-homepage-demo-v1-build-v1`

## What Was Built

- Static responsive homepage in `index.html`, `styles.css` and `script.js`.
- Sections included: header, hero, latest landlord updates ribbon, help chooser, postcode module, warning/story modules, guided clarity, main services preview, CMP Verified Inspections, how-it-works, human support/smart assistance, and footer.
- Prototype interactions: mobile menu, postcode form state, and Verified Inspections carousel.

## Asset Source Summary

Primary source folder:

- `/Users/davidtaylor/Desktop/Comply my property all`

Verified Inspections source folder:

- `/Users/davidtaylor/Desktop/VIBECODE/CMP-source-assets/cmp-verified-inspections-carousel-assets`

Hero source:

- `/Users/davidtaylor/Desktop/VIBECODE/David-s-website/assets/generated/homepage-hero-wide.jpg`

Only selected originals were copied into `prototypes/cmp-wix-homepage-demo-v1/assets/`. Previous CMP Origin V1/V2 optimized assets were not used as the source.

## Copied Original Transparent PNGs

- `assets/logo/cmp-grey-logo.png` from `GREY LOGO COMPLY MY PROPERTY.png`
- `assets/logo/cmp-square-mark.png` from `cmp normal square trans.png`
- `assets/footer/cmp-grey-logo.png` copied from the selected grey logo
- `assets/origami/origami-house-wide.png` from `oragami house.png`
- `assets/origami/origami-house-hd.png` from `HOUSE OREGAMI HD.png`
- `assets/warnings/top-tile-epc.png` from `top tile epc.png`
- `assets/warnings/top-tile-solicitor.png` from `top tile solicitor.png`
- `assets/services/compliance-checker-az-tile.png` from `Compliance Checker A-Z TILE.png`
- `assets/services/epc-tile.png` from `epc's tile.png`
- `assets/services/eicr-tile.png` from `EICR tile.png`
- `assets/services/aml-tile.png` from ` AML TILE.png`
- `assets/services/gas-safety-tile.png` from `gas safety tile2.png`
- `assets/services/property-inspections-tile.png` from `property inspections tile.png`
- `assets/services/selective-licensing-tile.png` from `Selective licensing tile.png`
- `assets/services/landlord-insurance-tile.png` from `landlord insurance tile.png`
- `assets/icons/icon-epc.png` from `iconsforcmp/SERVICE_0008_----EPC.png`
- `assets/icons/icon-gas.png` from `iconsforcmp/SERVICE_0009_gas.png`
- `assets/icons/icon-eicr.png` from `iconsforcmp/SERVICE_0005_EICR.png`
- `assets/icons/icon-property-inspections.png` from `iconsforcmp/SERVICE_0010_----Property-Inspections.png`
- `assets/icons/icon-aml.png` from `iconsforcmp/SERVICE_0003_AML-Checks.png`
- `assets/icons/icon-selective-licensing.png` from `iconsforcmp/SERVICE_0002_----Selective-Licensing.png`
- `assets/icons/icon-green-tick.png` from `iconsforcmp/colour-_0003_green-tick.png`
- `assets/support/feel-a-bit-lost.png` from `Feel a bit lost_.png`
- `assets/support/overcomplicating-things-tile.png` from `overcomplicating things tile.png`
- `assets/support/epc-big-tile.png` from `EPC BIG TILE.png`
- `assets/support/human-layer.png` from `png human layer.png`
- `assets/dashboard/how-cmp-works-infographic.png` from `dashboard png.png`

## Copied SVGs

- `assets/verified-inspections/01-live-verified-capture.svg`
- `assets/verified-inspections/02-no-upload-loophole.svg`
- `assets/verified-inspections/03-room-coverage.svg`
- `assets/verified-inspections/04-lidar-depth-aware.svg`
- `assets/verified-inspections/05-compare-over-time.svg`
- `assets/verified-inspections/06-evidence-with-property.svg`

## Other Copied Assets

- `assets/hero/homepage-hero-wide.jpg` from the approved local opaque hero JPG.

## Assets Still Missing

- No separate original transparent source was found for `homepage-hero-wide.jpg`; the approved local opaque JPG is used.
- No additional footer artwork was needed.

## Known Limitations

- The postcode lookup is a prototype state only and does not run a live address lookup.
- The Latest Landlord Updates content is example prototype content.
- The Verified Inspections carousel is a static product teaser with local SVGs.
- Very large original PNGs are intentionally kept unoptimized for this visual pass.

## QA Notes

Browser path:

- Browser plugin unavailable in this session, so Playwright was used.
- Local QA URL: `http://127.0.0.1:4173/`
- Direct file opening also works with `index.html`.

Desktop QA:

- Checked at `1440x1100`.
- Page identity loaded correctly.
- Console errors: none after adding favicon.
- Broken images: none.
- Horizontal overflow: `0`.
- Header, hero, updates ribbon, postcode, warnings, services, Verified Inspections, workflow, support and footer were inspected by scrolling the rendered page.

Tablet QA:

- Checked at `1024x1100`.
- Broken images: none.
- Horizontal overflow: `0`.
- Sections stack cleanly; news ribbon and service cards remain readable.

Mobile QA:

- Checked at `390x1100`.
- Broken images: none.
- Horizontal overflow: `0`.
- Mobile menu opens and closes with `aria-expanded` state.
- Hero, postcode form, warning modules, services, Verified Inspections, workflow and footer were inspected at mobile width.

Transparency QA:

- `sips -g hasAlpha` confirmed alpha channels for the grey logo, both origami assets, both warning tiles and human support layer.
- Transparent PNGs were not flattened or converted.
- No accidental white, grey or blue image boxes were added around transparent assets.

Copy and Claims QA:

- New homepage files were checked for the forbidden evidential/legal outcome phrases from the build brief.
- Copy stays UK private-landlord specific and avoids legal outcome promises.
- Image-baked text was not duplicated as adjacent visible section headings or captions.

Deployment:

- No deploy performed.
- No production deploy performed.
- No `--prod` used.
- `/Users/davidtaylor/Code/mysite` was not touched.
