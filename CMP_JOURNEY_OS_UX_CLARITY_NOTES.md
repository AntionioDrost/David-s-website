# CMP Journey OS UX Clarity Notes

Date: 2026-06-13
Branch: `labs/cmp-journey-os-v1`

## What This Pass Addressed

- The Journey OS setup screens looked like they were already inside the completed `57 The Butts` Property Workspace.
- The Journey Spine labels were cramped and clipped at desktop widths.
- Review Found Data tiles visually merged labels and values, such as `EPC ratingC`.
- Branch effect chips looked like unexplained or contradictory status tags.
- The Action Plan needed a clearer top-level summary before the long action lists.
- The Ask CMP right rail mixed current-property and portfolio activity without an explicit label.
- Early demo copy used internal wording that was less suitable for walkthroughs.

## Changes Made

- Hid the global property workspace header, utility bar and property tabs while the Journey OS view is active.
- Updated the Journey OS header copy to frame the flow as building a property brain before creating the workspace.
- Shortened visible Journey Spine labels while keeping the original meaning available via title text.
- Added a `Prototype controls` wrapper around the scenario selector with a demo/testing note.
- Reframed branch chips as `Latest route changes` so they read as journey history, not permanent contradictory state.
- Added a top `Next best action` summary to the Action Plan using existing local action data.
- Updated the Property Workspace heading to say `Property Workspace Created` after the property brain/action plan stage.
- Improved CSS spacing and hierarchy for the spine, found-data cards, branch chips, action cards and main Journey OS layout.
- Labelled the right rail activity as portfolio-level to avoid confusing references to other demo properties.

## Logic Deliberately Preserved

- Demo scenarios and scenario reset behaviour.
- Journey stage order and routing.
- Fake property brain data model.
- Action plan generation.
- Service basket logic.
- Fake upload scanner logic.
- Ask CMP scripted response logic.
- Evidence, timeline and monitoring update behaviour.
- Workspace tabs and modal behaviours.

## Tiny Display Logic Changes

- Visual Journey Spine labels were shortened for readability.
- Button wording was clarified where it affected journey understanding, such as `Run simulated auto checks`, `Simulate evidence upload`, and `Open workspace preview`.
- The Action Plan summary reads existing actions, route and service recommendations; it does not change scoring or state.

## Manual Checks For Tomorrow

- Confirm the setup flow no longer feels like it starts inside a finished workspace.
- Check the Review Found Data screen at desktop and mobile widths.
- Check the Action Plan after `No EPC`, `HMO`, `Damp/mould`, and `Done-for-me` scenarios.
- Confirm the right rail wording feels clear enough before presenter mode is added.
- Confirm the shortened spine labels are understandable in a live walkthrough.

## Future Presenter Mode Work

- Add a Nick-facing guided demo path that can hide prototype controls.
- Add guided callouts for the property brain build, route selection, service basket and workspace creation moments.
- Add a presenter-safe scenario picker or script mode without changing the underlying fake journey logic.
