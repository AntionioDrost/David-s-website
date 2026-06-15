# CMP Journey OS Guided Demo Notes

## What Was Built

- A Nick-facing Guided Demo Mode layered over the existing fake/local Journey OS prototype.
- Five presenter-stepped stories: clean property, no EPC, HMO/licensing, damp/mould/enforcement, and done-for-me plan.
- A guided landing hub, presenter control panel, story cards, presenter callouts, and a property-brain visual moment.
- Query-parameter entry via `dashboard-labs.html?journeyDemo=nick`.
- Updated Demo Guide modal for a live Journey OS walkthrough.

## How To Enter Guided Demo

- Open `dashboard-labs.html`.
- Click `Journey OS`.
- Click `Guided demo`.
- Or open `dashboard-labs.html?journeyDemo=nick` to land directly in the guided demo hub.

## Reset And Replay

- `Restart story` restarts the current story from the first moment.
- `Reset demo` resets the active story state and local property brain.
- `Open workspace` jumps to the Property Workspace destination.
- `Exit guided demo` returns to the normal testing mode with scenario controls visible.

## Creative Additions

- Guided demo hub with stakeholder-facing story cards.
- Sticky presenter controls with current moment, progress and presenter notes.
- Presenter callouts that explain why each moment matters.
- Guided auto-check reveal styling.
- Property brain network visual showing records, answers, evidence, services and monitoring converging.
- Guided next-step buttons now route into completed fake service journeys: booking intake, quote request, generated evidence, monitoring and workspace return.

## Known Limitations

- All data remains fake/local/mock.
- Story steps are deterministic and presenter-stepped, not fully automated.
- The guided mode orchestrates existing state rather than replacing the prototype.
- No real APIs, document storage, AI, supplier booking, payments or legal analysis are included.
- Fake booking confirmations, quote references and generated evidence are local prototype state only.

## What To Test Next

- Run the 2-minute story end to end before presenting.
- Check the No EPC and Done-for-Me stories because they best show the commercial direction.
- Confirm the guided panel does not obstruct the demo viewport being used.
- Ask Nick which story feels strongest and which service route feels most commercially credible.
