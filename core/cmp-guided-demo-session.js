(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.CMPGuidedDemoSession = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const stepsApi = root?.CMPGuidedDemoSteps || (typeof require === "function" ? require("./cmp-guided-demo-steps.js") : null);
  const definitionsApi = root?.CMPScenarioDefinitions || (typeof require === "function" ? require("./cmp-scenario-definitions.js") : null);
  const seedingApi = root?.CMPScenarioSeeding || (typeof require === "function" ? require("./cmp-scenario-seeding.js") : null);

  function resultOk(value, warnings = []) {
    return { ok: true, value, warnings };
  }

  function resultFail(errors) {
    return { ok: false, errors: Array.isArray(errors) ? errors : [errors] };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function nowIso(options = {}) {
    return options.now || new Date().toISOString();
  }

  function dependencyError() {
    if (!stepsApi?.listGuidedDemoSteps) return "Guided demo steps module unavailable.";
    if (!definitionsApi?.DEMO_SCENARIO_NAMESPACE) return "Scenario definitions module unavailable.";
    if (!seedingApi?.seedScenarioProperty) return "Scenario seeding module unavailable.";
    return "";
  }

  function normalizeScenarioId(options = {}) {
    if (options.scenarioId) return options.scenarioId;
    if (options.storyId && stepsApi?.mapLegacyGuidedStoryToScenario) {
      return stepsApi.mapLegacyGuidedStoryToScenario(options.storyId);
    }
    return stepsApi?.DEFAULT_GUIDED_DEMO_SCENARIO_ID || "standard-first-property";
  }

  function buildSessionValue(seeded, scenarioId, options = {}) {
    const definitions = definitionsApi.listScenarioDefinitions();
    const cards = definitions.ok && stepsApi?.listGuidedScenarioExplorerCards
      ? stepsApi.listGuidedScenarioExplorerCards(definitions.value)
      : { ok: true, value: [] };
    const steps = stepsApi.listGuidedDemoSteps();
    return {
      sessionId: `guided_demo_${scenarioId}`,
      route: options.route || "dashboard-labs.html?demo=nick&qa=1",
      mode: "guided_demo",
      namespaceId: definitionsApi.DEMO_SCENARIO_NAMESPACE,
      scenarioId,
      propertyId: seeded.property.id,
      property: seeded.property,
      store: seeded.store,
      steps: steps.ok ? steps.value : [],
      scenarioCards: cards.ok ? cards.value : [],
      activeStepId: options.activeStepId || "welcome",
      defaultScenarioId: stepsApi.DEFAULT_GUIDED_DEMO_SCENARIO_ID,
      capabilityStatus: "simulated",
      copy: {
        badge: "Simulated demo property",
        caveat: "Based on current information. Guidance, not legal advice. No supplier contacted. No payment taken.",
      },
      createdAt: nowIso(options),
    };
  }

  function loadGuidedDemoScenario(store, scenarioId, options = {}) {
    const missing = dependencyError();
    if (missing) return resultFail(missing);
    if (!store || store.namespaceId !== definitionsApi.DEMO_SCENARIO_NAMESPACE) {
      return resultFail(`Guided demo requires ${definitionsApi.DEMO_SCENARIO_NAMESPACE} store.`);
    }
    const id = scenarioId || stepsApi.DEFAULT_GUIDED_DEMO_SCENARIO_ID;
    const seeded = seedingApi.seedScenarioProperty(store, id, options);
    if (!seeded.ok) return seeded;
    return resultOk(buildSessionValue(seeded.value, id, options), seeded.warnings || []);
  }

  function createGuidedDemoSession(store, options = {}) {
    const scenarioId = normalizeScenarioId(options);
    return loadGuidedDemoScenario(store, scenarioId, options);
  }

  function resolveGuidedDemoRoute(queryParams, options = {}) {
    const get = typeof queryParams?.get === "function"
      ? (key) => queryParams.get(key)
      : (key) => queryParams?.[key] || null;
    const isNick = get("demo") === "nick" || get("journeyDemo") === "nick";
    if (!isNick && !options.force) return resultOk({ active: false });
    const scenarioId = normalizeScenarioId({
      scenarioId: get("scenarioId") || get("guidedScenario") || options.scenarioId,
      storyId: get("story") || options.storyId,
    });
    return resultOk({
      active: true,
      scenarioId,
      namespaceId: definitionsApi?.DEMO_SCENARIO_NAMESPACE || "demo:canonical-scenarios",
      route: "dashboard-labs.html?demo=nick&qa=1",
      requiresQa: true,
    });
  }

  function sessionSnapshot(session) {
    if (!session?.property?.id) return resultFail("Guided demo session with selected property is required.");
    return resultOk({
      sessionId: session.sessionId,
      scenarioId: session.scenarioId,
      propertyId: session.property.id,
      namespaceId: session.namespaceId,
      address: session.property.identity?.displayAddress || session.property.address,
      steps: clone(session.steps || []),
      scenarioCards: clone(session.scenarioCards || []),
      capabilityStatus: session.capabilityStatus || "simulated",
    });
  }

  return {
    createGuidedDemoSession,
    loadGuidedDemoScenario,
    resolveGuidedDemoRoute,
    sessionSnapshot,
  };
});
