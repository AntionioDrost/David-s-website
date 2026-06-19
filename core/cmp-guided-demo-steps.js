(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.CMPGuidedDemoSteps = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const DEFAULT_GUIDED_DEMO_SCENARIO_ID = "standard-first-property";

  function resultOk(value, warnings = []) {
    return { ok: true, value, warnings };
  }

  function resultFail(errors) {
    return { ok: false, errors: Array.isArray(errors) ? errors : [errors] };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  const guidedDemoSteps = [
    ["welcome", "Welcome", "CMP starts with one simulated demo property and keeps every gap attached to it.", "Guided demo landing", "start_demo", "[data-guided-story='clean-property-check']"],
    ["add-or-check-property", "Add or check a property", "The guide points to the property-first entry, not a separate demo product.", "Property setup", "check_property", "[data-journey-go='add']"],
    ["smart-checks", "Smart Checks", "Simulated Smart Checks show what CMP found before landlord questions.", "Smart Checks summary", "review_checks", "[data-guided-target='auto-review']"],
    ["review-found-data", "Review found data", "Found records stay separate from answers CMP still needs.", "Review Found Data", "review_found_data", "[data-guided-target='review-found-data']"],
    ["answer-unknowns", "Answer unknowns", "Unknowns become gaps or questions, not false facts.", "Answer Unknowns", "answer_unknowns", "[data-guided-target='recommended-answer']"],
    ["property-brain-status", "Property Brain", "The Property Brain explains status from the canonical property record.", "Property Brain status", "review_status", "[data-canonical-workspace-shell]"],
    ["next-best-action", "Next best action", "CMP shows one recommended action before deeper detail.", "Next Best Action", "open_next_action", "[data-canonical-next-action]"],
    ["evidence-or-service-loop", "Evidence or service loop", "A gap can prepare evidence or a simulated service request without live booking.", "Service and evidence loop", "prepare_service", "[data-canonical-service-request]"],
    ["ask-cmp-explanation", "Ask CMP", "Ask CMP explains this selected property using simulated context.", "Ask CMP", "ask_cmp", "[data-canonical-ask-panel]"],
    ["report-preview", "Report preview", "Reports are previews generated from the Property Brain snapshot.", "Report preview", "generate_report_preview", "[data-canonical-report-panel]"],
    ["monitoring-preview", "Monitoring preview", "Monitoring keeps open gaps and dates visible after setup.", "Monitoring", "review_monitoring", "[data-canonical-monitoring-preview]"],
    ["finish", "Finish", "The route ends with a property workspace the user can explore safely.", "Selected property shell", "free_explore", "[data-canonical-workspace-shell]"],
    ["scenario-explorer", "Scenario explorer", "Scenario cards load other canonical demo properties without touching guest records.", "Scenario explorer", "load_scenario", "[data-guided-scenario-id]"],
  ].map(([stepId, title, explanation, targetProductSurface, targetActionType, preferredSelector]) => ({
    stepId,
    title,
    explanation,
    targetProductSurface,
    targetActionType,
    preferredSelector,
    productEventKey: targetActionType,
    expectedRouteState: stepId === "scenario-explorer" ? "demo scenario selected" : "demo=nick",
    scenarioRequirement: stepId === "scenario-explorer" ? "any Stage 9 scenario" : DEFAULT_GUIDED_DEMO_SCENARIO_ID,
    realUserAction: title,
    fallback: "Show a small guide note beside the selected property workspace if the exact target is not visible.",
    optionalHook: ["ask-cmp-explanation", "report-preview", "evidence-or-service-loop"].includes(stepId) ? stepId : "",
    completionRule: stepId === "scenario-explorer" ? "scenario_loaded" : "step_viewed_or_target_clicked",
    skipRule: "Skip keeps the selected canonical demo property intact.",
  }));

  const legacyStoryScenarioMap = {
    "clean-property-check": "standard-first-property",
    "no-epc-found": "no-epc-found",
    "epc-expired-mees-risk": "expired-epc",
    "hmo-licensing-risk": "missing-gas-evidence",
    "damp-mould-enforcement": "damp-mould-concern",
    "done-for-me-plan": "done-for-me-compliance",
    "portfolio-landlord-preview": "standard-first-property",
  };

  function listGuidedDemoSteps() {
    return resultOk(clone(guidedDemoSteps));
  }

  function getGuidedDemoStep(stepId) {
    const step = guidedDemoSteps.find((item) => item.stepId === stepId) || null;
    return step ? resultOk(clone(step)) : resultFail(`Unknown guided demo step: ${stepId}`);
  }

  function mapLegacyGuidedStoryToScenario(storyId) {
    return legacyStoryScenarioMap[storyId] || DEFAULT_GUIDED_DEMO_SCENARIO_ID;
  }

  function scenarioDemonstrates(definition) {
    const categories = (definition.expectedIssues || []).map((item) => item.category).filter(Boolean);
    if (categories.includes("epc")) return "EPC evidence handling";
    if (categories.includes("gas_safety")) return "Gas Safety evidence";
    if (categories.includes("eicr")) return "Electrical Safety evidence";
    if (categories.includes("property_condition")) return "condition evidence";
    if (categories.includes("deposit_admin")) return "possession readiness evidence";
    if (definition.id === "done-for-me-compliance") return "done-for-me review";
    return "the normal property-first journey";
  }

  function listGuidedScenarioExplorerCards(definitions = []) {
    if (!Array.isArray(definitions)) return resultFail("Scenario definitions must be an array.");
    return resultOk(definitions.map((definition) => ({
      scenarioId: definition.id,
      title: definition.label,
      story: definition.propertySeed?.story || definition.label,
      demonstrates: scenarioDemonstrates(definition),
      ctaLabel: "Load scenario",
      placement: "secondary",
      propertyId: definition.uniqueFictionalPropertyId,
      address: definition.uniqueFictionalAddress,
      capabilityStatus: "simulated",
    })));
  }

  return {
    DEFAULT_GUIDED_DEMO_SCENARIO_ID,
    listGuidedDemoSteps,
    getGuidedDemoStep,
    mapLegacyGuidedStoryToScenario,
    listGuidedScenarioExplorerCards,
  };
});
