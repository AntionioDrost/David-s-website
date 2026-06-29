# CMP Vault Records-First Brief

## 1. Purpose

CMP Vault is Prototype Option 2 for the CMP prototype programme. It is a records-first property passport for self-managing landlords, clearly separated from CMP Prime V2.

CMP Vault helps landlords keep every rental record, certificate, service outcome and renewal date in one organised property file. It is calmer and more document-led than Prime. It should feel like a secure property passport, evidence binder and renewal organiser, not a compliance-map product.

CMP Prime V2 asks:

> What should I fix first?

CMP Vault asks:

> Is my property file complete, current and ready to rely on?

Vault must not feel like:

- a reskin of CMP Prime;
- another A-Z checker;
- a tabbed dashboard;
- a generic cloud folder;
- a legal advice tool;
- a chatbot product.

## 2. Product Positioning

Define CMP Vault as:

> A secure property passport that helps landlords keep every rental record, certificate, service outcome and renewal date in one organised property file.

Core promise:

> Store the proof, see what is missing, and stay ready for review.

Supporting promise options:

- Every property record in one place, with gaps and renewals made clear.
- A clearer property file for certificates, evidence, services and renewals.
- Know what documents you have, what is missing, and what expires next.

Homepage hero direction:

> Build a complete property file before you need it.

Supporting copy:

> Your certificates, evidence and renewal dates in one secure property vault. Store the proof, spot the gaps and keep the file ready for review.

Primary CTA:

- Start a property vault

Secondary CTAs:

- Upload documents first
- Open example vault
- Check possession evidence readiness

## 3. Core Vault Journey

The main Vault journey is records-first:

1. Start property vault.
2. Enter postcode.
3. Select exact address.
4. Create property passport.
5. Add or scan documents.
6. CMP sorts records into categories.
7. Vault shows record completeness.
8. Missing, expired and weak records are highlighted.
9. Landlord opens a record drawer.
10. Landlord adds proof, books a service, sets reminder or asks for advisor review.
11. Vault updates file strength and renewal timeline.
12. My Properties shows each property once with record health, next renewal and missing proof.

This is not a Compliance Map journey. The main screen must feel like a property passport, document binder, evidence vault, renewal file and record confidence dashboard.

## 4. Information Architecture

Vault is organised around record categories, not compliance modules.

### A. Property Identity

- Address
- Postcode
- Local authority
- Property type
- Bedrooms
- Tenancy status
- Occupancy status

### B. Safety Certificates

- Gas Safety
- EICR
- Smoke alarm evidence
- CO alarm evidence

### C. Energy And Condition

- EPC
- Property inspection reports
- Damp/mould evidence
- Repair records
- Contractor invoices

### D. Tenancy File

- Tenancy agreement
- Deposit protection
- Prescribed information
- How to Rent guide where relevant
- Inventory/check-in
- Tenant communications
- Right-to-rent note

### E. Licensing And Special Cases

- HMO/licensing review
- Selective/additional licensing evidence
- Planning/use notes if relevant

### F. Services And Contractors

- Service bookings
- Service outcomes
- Contractor details
- Certificates produced by services
- Follow-up reminders

### G. Possession Readiness File

This should exist as an advanced drawer or category, not the default first experience.

Frame it as:

> Evidence readiness for advisor review.

Do not frame it as automatic eviction help.

It collects:

- Tenancy agreement
- Deposit evidence
- Prescribed information
- EPC
- Gas Safety
- How to Rent guide where relevant
- Licensing evidence where relevant
- Arrears record
- Tenant communication log
- Repair and complaint history
- Inspection photos
- Notices status
- Advisor review status

## 5. Main Screen Model

The primary Vault screen is a property passport.

Header should show:

- Property address
- File strength
- Records complete
- Records missing
- Next renewal
- Advisor review status if relevant

Main body should contain:

- Record category rail or stacked category list
- Selected category record list
- Record detail drawer

Primary panel:

> File health

Shows:

- Complete records
- Missing records
- Expired or renewal-soon records
- Advisor review recommended
- Services ready to book

Secondary panel:

> Next renewal

Shows:

- Gas Safety date
- EICR date
- EPC date
- Licence/review date
- Inspection follow-up
- Service follow-up

The product may show one "Next record to complete" prompt, but the centre of the experience is the property file, not an action map.

## 6. Record States And Actions

Every record has one clear state and one obvious primary action.

Record states:

- Not added
- Needs evidence
- Landlord says held
- Evidence added
- Expires soon
- Expired
- Service booked
- Advisor review recommended
- Ready to rely on
- Monitor later
- Not relevant

Primary actions:

- Add proof
- Scan document
- Book service
- Set renewal reminder
- Ask advisor to review
- Mark not relevant
- View record

Do not show too many actions at once. The default pattern should be one primary button, with secondary actions tucked behind a small menu or lower-priority link only when needed.

## 7. Document-First Experience

Document upload and scanning should feel central to CMP Vault.

Use product language:

- Add documents
- Scan property file
- Sort documents
- Confirm matches
- Update records

Document flow:

1. Landlord drags in files or chooses documents.
2. CMP suggests document type.
3. CMP extracts likely dates/details.
4. Landlord confirms.
5. Relevant record updates.
6. File strength improves.
7. Renewal reminder is created if a date is known.

Prototype note: the first build does not need real AI or live document parsing. Simulated matching is acceptable if the copy is honest and the landlord is always asked to confirm before the file updates.

Use honest product copy:

- Suggested match
- Confirm before updating the property file
- Document added for review
- Advisor review available
- Date found in uploaded document
- Landlord confirmed

Do not say:

- legally verified
- officially compliant
- AI approved
- guaranteed
- supplier contacted
- payment taken

## 8. Service Flow In Vault

Services arise from missing, expired or weak records. They should feel like a way to complete the property file, not a separate booking marketplace.

Missing Gas Safety:

- Add existing certificate
- Book Gas Safety check
- Speak to advisor

Missing EICR:

- Add EICR
- Book EICR
- Set reminder if inspection is already arranged

Missing EPC:

- Add EPC
- Book EPC assessment
- Search/check again after address confirmation

Possession file weak:

- Add evidence
- Prepare evidence pack
- Speak to advisor

Service copy should be quiet:

- Complete this record
- Book a service to produce this evidence
- Service outcome will update this record
- No supplier contacted yet
- No payment taken

## 9. Ask CMP In Vault

Ask CMP is contextual and record-specific. It should not dominate the page or become the main product surface.

Use prompts such as:

- Ask about this record
- What proof should I upload?
- When does this need renewing?
- Can this record support possession preparation?
- Should I speak to an advisor?
- What service would complete this record?

Ask CMP should appear inside record drawers, weak-record states and advisor-review moments, not as a persistent chatbot-led experience.

## 10. Human Support

Human support appears when records are unclear, missing, expired or legally sensitive.

Use:

- Ask a CMP advisor to review this file
- Book a quick evidence review
- Need help checking this record?
- Advisor review recommended

Advisor review is especially relevant for:

- Possession preparation
- Licensing/HMO uncertainty
- Damp/mould complaints
- Expired or missing key certificates
- Unclear scanned documents
- Multiple missing records

The advisor role is to review evidence readiness and help the landlord understand next steps. Vault must not claim to provide automatic legal decisions.

## 11. Route Previews

CMP Vault should visibly support four routes:

### A. Full Property Vault

The main route. The landlord creates one property passport and sees records, gaps, renewals and file strength.

### B. Upload Documents First

For landlords who already have certificates and tenancy files. The product sorts documents into likely record categories and asks the landlord to confirm matches.

### C. Possession Evidence Readiness

An advanced route showing the strength of the property file before advisor review. This route should be visible, but not framed as automatic eviction help.

### D. Renewal Check

For landlords who only want to know what is expiring. This route should lead into the full property file when missing or expired records are found.

Vault should not build every possible service route. It is about records and confidence.

## 12. Visual Direction

CMP Vault must look clearly different from CMP Prime V2.

Logo direction:

- Vault/folder/keyhole mark
- Implies secure record keeping
- Does not imply government approval or official legal certification

Palette:

- Deep navy
- Slate
- Brass/gold accent
- Parchment/off-white
- Muted blue-grey
- Strong ink

Style:

- Secure
- Premium
- Calm
- Document-led
- Property passport
- Digital binder
- Professional but not boring

Avoid:

- Prime's emerald action-map style
- SaaS feature-dashboard clutter
- Generic file-storage UI
- Old CMP root UI
- Tab-heavy layout

Visual metaphors:

- Property passport
- Record drawer
- Evidence binder
- Certificate timeline
- File strength seal
- Renewal ribbon

The first screen should make the Vault idea obvious within seconds: this is a secure property file, not another checker.

## 13. What Vault Must Prove

CMP Vault must prove:

- Landlords can see all records in one property file.
- Documents can be sorted into records.
- Missing evidence is obvious.
- Expired and expiring records are obvious.
- Services complete records.
- Possession readiness depends on the strength of the file.
- Advisor support fits naturally into sensitive cases.
- My Properties shows one property once.
- The design is materially different from Prime.

## 14. Acceptance Gates

Vault fails if:

- It looks like CMP Prime V2 with different colours.
- It uses an A-Z Compliance Map as the main screen.
- Documents feel like an afterthought.
- Service booking feels disconnected from records.
- Possession preparation is missing or hidden too deeply.
- My Properties duplicates one property.
- Ask CMP dominates the product.
- The first screen does not explain Vault quickly.
- It feels like generic cloud storage.

Vault passes if:

- The property file metaphor is obvious.
- Record completeness is clear.
- Missing and expired records are clear.
- Document scan is central but controlled.
- Services complete records.
- Possession evidence readiness is visible.
- Renewal timeline feels useful.
- Advisor review feels natural.
- It feels completely different from Prime.

## 15. Build Guardrails

When building later:

- Build independently inside `prototypes/cmp-vault/`.
- Do not copy CMP Prime V2 layouts.
- Do not copy the A-Z Compliance Map.
- Do not edit CMP Prime V2.
- Do not edit old CMP files.
- Do not edit root HTML/CSS/JS.
- Do not touch `/Users/davidtaylor/Code/mysite`.
- Do not add API keys.
- Do not clear browser storage.
- Do not deploy unless a later prompt explicitly requests deployment.

## 16. Questions And Assumptions For David

Assumptions for the first Vault build:

- Possession readiness is visible on the homepage as a secondary route and inside the vault as an advanced drawer.
- Document upload is prominent but secondary to "Start a property vault".
- Vault should feel like a premium secure property file, not a simple cloud folder.
- Safety certificates, tenancy file and renewal dates should be the most prominent record groups.
- Services should be commercial but quiet: they complete missing records rather than driving the whole experience.
- The example Vault should use a different sample property from Prime.

Questions to revisit before building:

1. Should possession readiness be visible on the homepage or only inside the vault?
2. Should document upload become the first route if the prototype needs to prove scanning fastest?
3. Should Vault lean more premium/legal-file or more simple landlord folder?
4. Which record categories should be most prominent above the fold?
5. How commercial should services feel in the records-first direction?
6. Should the example vault use the same sample property as Prime for comparison, or a different one for separation?
