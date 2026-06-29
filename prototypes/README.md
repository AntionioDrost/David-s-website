# CMP Clean Prototype Programme

This folder contains the clean CMP prototype programme for three separate landlord-facing demo directions:

- `cmp-prime/`: action-led landlord readiness workspace.
- `cmp-vault/`: records-first property file and evidence vault.
- `cmp-concierge/`: services-first landlord organiser.
- `shared/`: shared documentation and future neutral helpers only.

This programme starts from a clean boundary. The prototypes must be built independently and must not import old root-level CMP UI, journey code, fixtures, screenshots, reports, or rescue prototype pages.

## Programme Rules

- Build only one prototype per prompt.
- Keep every prototype in its own folder.
- Do not copy legacy CMP page structure, copy, scripts, styles, or interaction patterns.
- Do not create root-level HTML, CSS, or JavaScript for these prototypes.
- Do not deploy the repository root.
- When a draft deploy is required later, deploy only the relevant prototype folder.
- Do not use `--prod` for prototype previews.
- Do not add private API keys.
- Do not claim official verification unless the action genuinely happened.

## Eventual Per-Prototype Deliverables

Each prototype will eventually have:

- its own HTML pages;
- its own styles;
- its own scripts;
- its own test file;
- its own screenshots;
- its own folder-only Netlify preview.

This setup pass intentionally creates documentation and starter folders only. It does not create prototype HTML, CSS, JavaScript, screenshots, audit outputs, or deployments.

## Core Product Promise

CMP helps self-managing landlords understand whether a rental property is ready, what CMP has found, what still needs landlord input, and what one next action should happen next.
