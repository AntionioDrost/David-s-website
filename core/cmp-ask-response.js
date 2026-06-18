(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.CMPAskResponse = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function resultOk(value, warnings = []) {
    return { ok: true, value, warnings };
  }

  function resultFail(errors) {
    return { ok: false, errors: Array.isArray(errors) ? errors : [errors] };
  }

  function token(value) {
    return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  }

  function hasIssue(context, category, rulePart) {
    return (context.issues || []).some((issue) => {
      const categoryMatches = token(issue.category) === token(category);
      const ruleMatches = !rulePart || token(issue.createdFromRule).includes(token(rulePart));
      return categoryMatches && ruleMatches;
    });
  }

  function prompt(id, label, category = "general") {
    return { id, label, category };
  }

  function getSuggestedAskCmpPrompts(context) {
    if (!context?.property?.id) return resultFail("Ask CMP context is required.");
    const prompts = [
      prompt("found-automatically", "What did CMP find automatically?"),
      prompt("unknowns", "What does CMP still not know?"),
      prompt("next-best-action", "What should I fix first?"),
      prompt("why-next-best-action", "Why is this my next best action?"),
      prompt("evidence-needed", "What evidence do I need?"),
      prompt("recommended-services", "What services are recommended and why?"),
      prompt("monitoring-next", "What should I monitor next?"),
      prompt("property-summary-report", "Can I generate a property summary?"),
    ];

    if (hasIssue(context, "epc", "missing") || hasIssue(context, "epc", "expired")) {
      prompts.push(prompt("epc-missing", "Explain the EPC evidence gap", "epc"));
    }
    if (hasIssue(context, "gas_safety", "gas_unknown")) {
      prompts.push(prompt("gas-confirmation", "What do I need to confirm about gas or heating?", "gas"));
    } else if (hasIssue(context, "gas_safety")) {
      prompts.push(prompt("gas-service", "Why is a Gas Safety service recommended?", "gas"));
    }
    if (hasIssue(context, "eicr", "held_no_proof")) {
      prompts.push(prompt("eicr-proof", "What EICR proof should I add?", "eicr"));
    } else if (hasIssue(context, "eicr")) {
      prompts.push(prompt("eicr-evidence", "What should I do about EICR evidence?", "eicr"));
    }
    if (hasIssue(context, "property_condition")) {
      prompts.push(prompt("condition-issue", "What should I do about the condition concern?", "condition"));
    }
    if (hasIssue(context, "deposit_admin") || hasIssue(context, "tenancy_admin")) {
      prompts.push(prompt("possession-readiness", "What admin evidence affects possession readiness?", "tenancy"));
    }
    return resultOk(prompts);
  }

  function promptIdFor(context, promptIdOrText) {
    const raw = String(promptIdOrText || "").trim();
    if (!raw) return "next-best-action";
    const byId = raw.toLowerCase();
    const suggestions = getSuggestedAskCmpPrompts(context);
    if (suggestions.ok) {
      const byLabel = suggestions.value.find((item) => item.label === raw || token(item.label) === token(raw));
      if (byLabel) return byLabel.id;
    }
    if (byId.includes("automatic") || byId.includes("found")) return "found-automatically";
    if (byId.includes("not know") || byId.includes("unknown")) return "unknowns";
    if (byId.includes("first") || byId.includes("next")) return "next-best-action";
    if (byId.includes("evidence")) return "evidence-needed";
    if (byId.includes("service")) return "recommended-services";
    if (byId.includes("monitor")) return "monitoring-next";
    if (byId.includes("report") || byId.includes("summary")) return "property-summary-report";
    return raw;
  }

  function formatFacts(facts, emptyCopy) {
    if (!facts?.length) return emptyCopy;
    return facts.slice(0, 4).map((fact) => `${fact.label}: ${fact.value} (Source: ${fact.source}; Confidence: ${fact.confidence})`).join("; ");
  }

  function formatGaps(context) {
    const gaps = context.evidenceGaps || [];
    if (!gaps.length) return "No open evidence gap is currently ranked by the rules engine.";
    return gaps.slice(0, 4).map((gap) => {
      const type = String(gap.evidenceType || "evidence").replace(/_/g, " ");
      return `${type} is ${gap.proofStatus || "unknown"}; ${gap.recommendedNextStep || "prepare it for review"}`;
    }).join("; ");
  }

  function formatServices(context) {
    const requests = context.serviceRequests || [];
    const actions = (context.actionItems || []).filter((action) => action.primaryCtaType === "request_service");
    if (requests.length) {
      return requests.slice(0, 3).map((request) => {
        const because = request.supplierJobPackData?.recommendedBecause || "Recommended because this property has an open issue or evidence gap.";
        return `${request.supplierJobPackData?.serviceLabel || request.serviceId}: ${because}`;
      }).join("; ");
    }
    if (actions.length) {
      return actions.slice(0, 3).map((action) => `Recommended because ${action.reason}`).join("; ");
    }
    return "No mapped service is currently recommended by the selected-property rules output.";
  }

  function answerAskCmpPrompt(context, promptIdOrText) {
    if (!context?.property?.id) return resultFail("Ask CMP context is required.");
    const id = promptIdFor(context, promptIdOrText);
    const address = context.property.displayAddress || "this property";
    const base = `Based on current information for ${address}, `;
    const caveat = " Guidance, not legal advice. Source and Confidence labels should be reviewed before acting.";
    let body = "";

    if (id === "found-automatically") {
      body = `${base}CMP found: ${formatFacts(context.knownFacts, "no confirmed automatic facts yet")}. Simulated Smart Checks remain prepared for review.`;
    } else if (id === "unknowns" || id === "gas-confirmation") {
      body = `${base}CMP still needs confirmation for: ${formatFacts(context.unknownFacts, "no open unknowns are listed")}. Missing data stays unknown until you answer or add proof.`;
    } else if (id === "evidence-needed" || id === "eicr-proof" || id === "epc-missing") {
      body = `${base}Evidence gap summary: ${formatGaps(context)}. Evidence is prepared for review until real proof and confirmation exist.`;
    } else if (id === "recommended-services" || id === "gas-service") {
      body = `${base}${formatServices(context)}. Service suggestions come from linked issues or actions. No live supplier action has happened and no payment has been taken.`;
    } else if (id === "monitoring-next") {
      const monitoring = (context.monitoringItems || []).slice(0, 3).map((item) => `${item.title || item.monitoringType}: ${item.reason || ""} ${item.nextAction || ""}`.trim()).join("; ");
      body = `${base}monitoring should focus on ${monitoring || "annual review and unresolved evidence gaps"}.`;
    } else if (id === "property-summary-report") {
      body = `${base}CMP can prepare a report preview from the Property Brain without re-entering data. It remains a prototype snapshot with source, confidence and capability caveats.`;
    } else {
      const action = context.nextBestAction;
      body = action
        ? `${base}the next best action is ${action.title}. ${action.reason} Priority reason: ${action.priorityExplanation || "ranked by CMP rules"}.`
        : `${base}no single action is currently ranked. Continue reviewing found data and unknowns.`;
    }

    return resultOk({
      promptId: id,
      answerText: `${body}${caveat}`,
      capabilityStatus: "simulated",
    });
  }

  return {
    getSuggestedAskCmpPrompts,
    answerAskCmpPrompt,
  };
});
