# CMP Civic Property Intelligence Alignment Notes

## Direction Applied

This pass aligns the Labs prototype with the Stage 1 direction: Civic Property Intelligence OS.

The interface is now weighted toward government-grade clarity, premium property intelligence, evidence-led compliance and restrained assistant support. The visual treatment is calmer and more audit-ready, with navy/ink structure, warm stone backgrounds, white evidence surfaces and status colours reserved for clear compliance meaning.

## Tokens And Colour System

The late CSS alignment layer in `dashboard-labs.css` introduces civic semantic tokens:

- Ink / navy for structure, headers, primary action and trust moments.
- Warm stone for the main app background.
- White surfaces and stone borders for audit-ready evidence panels.
- Green only for verified, accepted, completed or safe states.
- Amber for attention, evidence needed, review and expiring states.
- Red reserved for future high-risk blockers.
- Civic blue for primary actions and system intelligence.
- Cyan/AI accent for Ask CMP and source-backed assistant moments.
- Unknown grey for neutral or not-yet-known states.

The pass avoids generic AI gradients, glowing orbs, low-contrast luxury styling and heavy green dominance.

## UI Areas Updated

- Dashboard shell, sidebar, brand lockup and navigation active states.
- Property workspace and portfolio header surfaces.
- Journey OS stage, guided demo, action plan, service basket, evidence and monitoring surfaces.
- Ask CMP rail and Ask CMP command centre, including source/evidence styling and demo-mode limits.
- Evidence Vault rows, document states, missing evidence panels and health cards.
- Compliance Centre headers, matrix, gaps and readiness panels.
- Timeline, task, service and status chip treatment.
- Mobile status chip wrapping and calmer card shadows.

## Copy And Status Changes

- Reduced user-facing "Property Brain" language in favour of Property Intelligence, Property Compliance Profile, Property Record and Evidence Profile language.
- Replaced "fully compliant" certainty with "Evidence-ready" where the prototype is only showing demo readiness.
- Ask CMP responses are now formatted around summary, source basis, meaning, next action and limits.
- Prototype/demo language is more explicit: demo data, simulated local data, no live lookup and not legal advice.
- Deferred and request states remain visually open and do not look solved.
- Accepted evidence is described as evidence accepted rather than broad legal resolution.

## Deliberately Not Changed

- No Journey OS flow logic changed.
- No service lifecycle logic changed.
- No fake scanner logic changed.
- No route or scenario logic changed.
- No real APIs, backend dependencies, payments, uploads, AI calls or supplier integrations were added.
- No Netlify production settings were changed.

## Accessibility And Readability Considerations

- Text colours were moved toward higher-contrast ink, navy, slate and status tones.
- Status chips use stronger foreground colours and subtle backgrounds rather than pale text on pale fills.
- Focus states now use a visible civic blue focus ring.
- Mobile chip wrapping is preserved to reduce overflow risk.
- Motion-heavy Ask CMP shimmer is disabled in the civic layer to keep the assistant calm and reduce visual noise.

## Later Brand-Pack Work

- Replace provisional tokens with final CMP brand tokens once the brand pack is approved.
- Review typography after brand typefaces are chosen.
- Produce final iconography and illustration rules.
- Run a full accessibility pass with contrast tooling and keyboard navigation checks.
- Decide whether "Civic Property Intelligence OS" remains public product language or internal positioning.
