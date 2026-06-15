# CMP Journey OS Nick Demo Checklist

## Before Demo

- Open the correct local or deploy link.
- Confirm you are on the Journey OS branch/demo.
- Reset the demo.
- Enter Guided Demo Mode.
- Run the clean property story once.
- Keep raw scenario controls hidden by staying in Guided Demo Mode.
- Have the fallback normal testing mode ready in case you want to jump to a scenario manually.
- Recommended Nick link: `dashboard-labs.html?journeyDemo=nick`.
- Recommended fallback link: `dashboard-labs.html?state=new-property`.

## Opening Line

This is simulated data, but the journey is the important part. The real product would connect EPC, address, licensing and document intelligence later. Right now we are testing whether the landlord journey makes sense and whether the commercial service paths feel compelling.

## Final 2-Minute Walkthrough

1. Open `dashboard-labs.html?journeyDemo=nick`.
2. Click `Run the 2-minute demo`.
3. Step through address, simulated checks, property match and found data.
4. Point out that CMP checks what it can before asking the landlord anything.
5. Step through landlord-only unknowns and the property brain moment.
6. Open the action plan and point out the next best action.
7. Click one commercial next step, preferably `Book legal essentials` or `Request quotes first`.
8. Show the fake confirmation, then open Evidence Vault, Compliance Centre, Ask CMP and Monitoring.
9. End by saying the subscription value is keeping the property watched over time.

## Final 10-Minute Walkthrough

1. Start with the clean guided story to explain the mainline.
2. Open `dashboard-labs.html?state=new-property` to show the normal landlord entry.
3. Run the No EPC story and click `Book EPC assessment`.
4. Run the HMO/licensing story and click `Licensing Check` or `Fire Risk Assessment`.
5. Run the damp/mould story and generate a tenant message, then show evidence/timeline.
6. Run the done-for-me story and click `Request quotes first` or `Done-for-Me concierge`.
7. Show Services, Evidence Vault, Compliance Centre, Ask CMP and Monitoring all reflecting the same property brain.
8. Ask Nick which journey or service route should become the primary commercial demo.

## During Demo

- Explain that the data is simulated and local.
- Show that CMP starts from an address, not a large form.
- Show auto checks before landlord questions.
- Show landlord-only unknowns.
- Show the property brain moment.
- Show the action plan as the core output.
- Show one service basket path through fake booking or quote confirmation.
- Show how the fake service creates pending/generated evidence and monitoring.
- Show one Ask CMP response or tenant message.
- End in Monitoring to explain recurring value.

## Questions For Nick

- Does this feel like the right website/product journey?
- Is the Add/check property flow understandable?
- Does this flow make sense for landlords?
- Which service routes feel commercially strongest?
- Is Done-for-Me compelling?
- Does the fake API/checking concept make sense?
- Does Compliance Centre make sense after the property brain is built?
- Does Evidence Vault feel useful?
- Which areas should be built properly first?
- What would landlords pay for?
- Which part felt most impressive?
- Which part felt boring or unnecessary?

## If Asked About Real Integrations

- EPC, UPRN/address, licensing, scanning, booking and Ask CMP are simulated in this prototype.
- The current goal is to test the journey, product story and service paths.
- Fake booking references, quote requests and generated service evidence are local demo states.
- Real APIs, document intelligence, secure evidence storage and supplier booking would be later implementation layers.
