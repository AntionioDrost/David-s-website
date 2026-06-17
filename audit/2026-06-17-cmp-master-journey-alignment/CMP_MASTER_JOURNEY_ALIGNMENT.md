# CMP Master Journey Alignment

Date: 2026-06-17

Preview: `http://127.0.0.1:4174/dashboard-labs.html?demo=nick`

Screenshot folder: `audit/2026-06-17-cmp-master-journey-alignment/`

## What Changed

- Renamed the main Nick demo to `Guided landlord compliance journey`.
- Reframed the main route around the master landlord flow: Add Property -> Auto Checks -> Review Found Data -> Answer Unknowns -> Compliance Analysis -> Action Plan -> Take Action -> Monitor & Update.
- Removed the old guided workspace-tab sequence from the main journey.
- Added a controlled Compliance Analysis reveal showing found records, landlord answers, evidence gaps, scores, risk level, blockers, missing evidence, future risks and opportunities.
- Changed Action Plan to use the flowchart buckets: urgent actions / legal blockers, expiring soon, missing evidence, future risks, opportunities and improvements.
- Added a structured Take Action stage with one primary service-request path and secondary supporting systems.
- Made Monitoring the end value moment before Scenario Explorer.
- Kept Scenario Explorer hidden until the main route has landed.

## Flowchart Match

The main demo now matches the master journey shape:

1. Add Property
2. Auto Checks
3. Review Found Data
4. Answer Unknowns
5. Compliance Analysis
6. Action Plan
7. Take Action
8. Monitor & Update

Supporting systems are now contextual rather than equal tabs. Ask CMP, Evidence, Services, communications, reminders and professional support appear in the Take Action/Monitoring story because the compliance analysis produced a property gap.

## Ready For Nick

Verdict: Ready with caveats.

The route is clearer and no longer dumps the user into a dense workspace tab tour after unknowns. The remaining caveat is visual polish: the surrounding shell still reads as prototype-grade in places, especially the left navigation and dense score/action cards, but the journey structure is now stable enough to review.

## Top Remaining Issues

1. The global left navigation remains visible and can still imply a broader dashboard before the user needs it.
2. The Compliance Analysis screen is clear but dense; a later pass could make the analysis moment more visual.
3. Scenario cards are improved by ordering, but still tall and text-heavy.
4. Supporting systems are mentioned in Take Action, but deeper Ask CMP/Evidence/Reports flows remain free-explore rather than fully choreographed in this main route.
5. The demo still uses prototype disclaimers and local simulated state, which should be called out verbally in a high-stakes walkthrough.
