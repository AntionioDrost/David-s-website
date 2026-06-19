(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.CMPPortfolioDerivation = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const compliance = root?.CMPComplianceDerivation || (typeof require === "function" ? require("./cmp-compliance-derivation.js") : null);
  const serviceLifecycle = root?.CMPServiceLifecycle || (typeof require === "function" ? require("./cmp-service-lifecycle.js") : null);

  function resultOk(value, warnings = []) {
    return { ok: true, value, warnings };
  }

  function resultFail(errors) {
    return { ok: false, errors: Array.isArray(errors) ? errors : [errors] };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function propertyAddress(record = {}) {
    return record.identity?.displayAddress || record.address || "Selected property";
  }

  function propertyPostcode(record = {}) {
    return record.identity?.postcode || record.postcode || "";
  }

  function issueIsOpen(issue = {}) {
    return !["resolved", "closed", "dismissed"].includes(issue.status);
  }

  function urgentIssues(issues = []) {
    return issues.filter((issue) => issueIsOpen(issue) && ["urgent", "high"].includes(issue.legalUrgency));
  }

  function safetyIssues(issues = []) {
    return issues.filter((issue) => ["gas_safety", "eicr", "alarms", "property_condition"].includes(issue.category));
  }

  function futureIssues(issues = []) {
    return issues.filter((issue) => issue.category === "future_readiness");
  }

  function dateWithinDays(dateValue, nowValue, days) {
    if (!dateValue) return false;
    const now = new Date(nowValue || Date.now());
    const date = new Date(dateValue);
    if (Number.isNaN(now.getTime()) || Number.isNaN(date.getTime())) return false;
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / 86400000);
    return diffDays <= days;
  }

  function knownExpiryCount(record = {}, derivedState = {}, now) {
    const evidenceExpiries = (record.evidence || []).filter((item) => item.expiryDate && dateWithinDays(item.expiryDate, now, 120)).length;
    const monitoringExpiries = (derivedState.monitoringItems || []).filter((item) => item.dueDate && dateWithinDays(item.dueDate, now, 120)).length;
    return evidenceExpiries + monitoringExpiries;
  }

  function serviceOpportunitiesForItem(item) {
    if (!serviceLifecycle?.resolveServiceOptionsForAction || !item.nextBestAction) return [];
    const resolved = serviceLifecycle.resolveServiceOptionsForAction(item.nextBestAction, item.propertyRecord, item.derivedState);
    if (!resolved.ok) return [];
    return (resolved.value || []).map((service) => ({
      propertyId: item.propertyId,
      address: item.address,
      serviceId: service.serviceId,
      label: service.label,
      category: service.category,
      recommendedBecause: service.recommendedBecause,
      linkedIssueId: service.linkedIssueId || item.nextBestAction.linkedIssueId || null,
      linkedActionId: service.linkedActionId || item.nextBestAction.actionId || null,
      capabilityStatus: service.capabilityStatus || "simulated",
    }));
  }

  function fallbackPortfolioAction(propertyRecord, derivedState) {
    return {
      actionId: `${propertyRecord.id}_portfolio_review`,
      propertyId: propertyRecord.id,
      linkedIssueId: null,
      title: "Review property status",
      reason: derivedState.overallStatus === "looks_ok_based_on_current_information"
        ? "Looks okay based on current information. Keep evidence and monitoring under review."
        : "Review the current property setup before taking portfolio action.",
      nextStep: "Open property workspace",
      primaryCtaType: "open_property",
      primaryCtaLabel: "Open property",
      secondaryCtaType: "monitor",
      secondaryCtaLabel: "Review monitoring",
      status: "recommended",
      priorityScore: 0,
      priorityExplanation: "No urgent issue was ranked for this property.",
      capabilityStatus: "simulated",
    };
  }

  function priorityReasons(item) {
    const reasons = [];
    if (item.urgentIssueCount) reasons.push(`${item.urgentIssueCount} urgent/high issue${item.urgentIssueCount === 1 ? "" : "s"}`);
    if (item.safetyIssueCount) reasons.push(`${item.safetyIssueCount} safety issue${item.safetyIssueCount === 1 ? "" : "s"}`);
    if (item.evidenceGapsCount) reasons.push(`${item.evidenceGapsCount} evidence gap${item.evidenceGapsCount === 1 ? "" : "s"}`);
    if (item.upcomingExpiryCount) reasons.push(`${item.upcomingExpiryCount} upcoming expiry item${item.upcomingExpiryCount === 1 ? "" : "s"}`);
    if (item.lowConfidence) reasons.push("low confidence");
    if (item.conditionRiskFlag) reasons.push("condition risk");
    if (item.futureReadinessFlag) reasons.push("future-readiness concern");
    if (!reasons.length) reasons.push("the highest current priority score");
    return reasons;
  }

  function calculatePortfolioPriority(item) {
    const nextPriority = item.nextBestAction?.priorityScore || 0;
    const score = Math.round(
      nextPriority
      + item.urgentIssueCount * 18
      + item.legalBlockersCount * 12
      + item.safetyIssueCount * 10
      + item.evidenceGapsCount * 3
      + item.upcomingExpiryCount * 8
      + (item.lowConfidence ? 8 : 0)
      + (item.conditionRiskFlag ? 16 : 0)
      + (item.futureReadinessFlag ? 5 : 0)
      + item.serviceOpportunities.length * 2
    );
    return {
      score,
      explanation: `This property is first because ${priorityReasons(item).join(", ")}. Based on current information. Guidance, not legal advice.`,
    };
  }

  function portfolioItem(propertyRecord, options = {}) {
    if (!propertyRecord?.id) return resultFail("PropertyRecord with id is required.");
    if (!compliance?.derivePropertyComplianceState) return resultFail("Compliance derivation module unavailable.");
    const derived = compliance.derivePropertyComplianceState(propertyRecord, options);
    if (!derived.ok) return derived;
    const derivedState = derived.value;
    const issues = derivedState.issues || [];
    const evidenceGaps = derivedState.evidenceGaps || [];
    const topIssue = issues.find(issueIsOpen) || null;
    const base = {
      propertyId: propertyRecord.id,
      address: propertyAddress(propertyRecord),
      postcode: propertyPostcode(propertyRecord),
      setupStatus: propertyRecord.currentSetupStage || "workspace",
      overallStatus: derivedState.overallStatus,
      riskLevel: derivedState.riskLevel,
      confidenceLevel: derivedState.confidenceLevel,
      propertyRecord: clone(propertyRecord),
      derivedState,
      topIssue,
      nextBestAction: derivedState.nextBestAction || fallbackPortfolioAction(propertyRecord, derivedState),
      legalBlockersCount: urgentIssues(issues).length,
      urgentIssueCount: urgentIssues(issues).length,
      safetyIssueCount: safetyIssues(issues).length,
      evidenceGapsCount: evidenceGaps.length,
      knownExpiriesCount: knownExpiryCount(propertyRecord, derivedState, options.now),
      upcomingExpiryCount: knownExpiryCount(propertyRecord, derivedState, options.now),
      lowConfidence: ["low", "unknown"].includes(derivedState.confidenceLevel),
      conditionRiskFlag: safetyIssues(issues).some((issue) => issue.category === "property_condition") || (derivedState.scores?.conditionRisk?.value || 0) >= 50,
      futureReadinessFlag: futureIssues(issues).length > 0,
      monitoringCount: (derivedState.monitoringItems || []).length,
      sourceCapabilityStatus: propertyRecord.creationSource === "demo_scenario" ? "simulated" : "simulated",
    };
    base.serviceOpportunities = serviceOpportunitiesForItem(base);
    const priority = calculatePortfolioPriority(base);
    base.portfolioPriorityScore = priority.score;
    base.priorityExplanation = priority.explanation;
    return resultOk(base, derived.warnings || []);
  }

  function rankPortfolioProperties(portfolioItems = []) {
    return [...portfolioItems].sort((a, b) => {
      if ((b.portfolioPriorityScore || 0) !== (a.portfolioPriorityScore || 0)) {
        return (b.portfolioPriorityScore || 0) - (a.portfolioPriorityScore || 0);
      }
      return String(a.propertyId || "").localeCompare(String(b.propertyId || ""));
    });
  }

  function summarisePortfolioRisks(portfolioItems = []) {
    return {
      urgentPropertyCount: portfolioItems.filter((item) => ["urgent", "high"].includes(item.riskLevel)).length,
      legalBlockersCount: portfolioItems.reduce((sum, item) => sum + item.legalBlockersCount, 0),
      conditionRiskPropertyCount: portfolioItems.filter((item) => item.conditionRiskFlag).length,
      futureReadinessConcernCount: portfolioItems.filter((item) => item.futureReadinessFlag).length,
    };
  }

  function summarisePortfolioExpiries(portfolioItems = []) {
    return {
      upcomingExpiryCount: portfolioItems.reduce((sum, item) => sum + item.upcomingExpiryCount, 0),
      propertiesWithExpiries: portfolioItems.filter((item) => item.upcomingExpiryCount > 0).map((item) => item.propertyId),
    };
  }

  function summarisePortfolioEvidenceGaps(portfolioItems = []) {
    return {
      evidenceGapCount: portfolioItems.reduce((sum, item) => sum + item.evidenceGapsCount, 0),
      lowConfidencePropertyCount: portfolioItems.filter((item) => item.lowConfidence).length,
      propertiesNeedingEvidence: portfolioItems.filter((item) => item.evidenceGapsCount > 0).map((item) => item.propertyId),
    };
  }

  function summarisePortfolioServiceOpportunities(portfolioItems = []) {
    return portfolioItems.flatMap((item) => item.serviceOpportunities || []);
  }

  function createSweepItems(rankedProperties = []) {
    const items = [];
    for (const item of rankedProperties) {
      if (item.legalBlockersCount || item.safetyIssueCount) {
        items.push({
          type: "priority_property",
          propertyId: item.propertyId,
          address: item.address,
          reason: item.priorityExplanation,
          suggestedNextAction: item.nextBestAction?.title || "Review property priority",
          capabilityStatus: "simulated",
        });
      }
      if (item.evidenceGapsCount) {
        items.push({
          type: "missing_evidence",
          propertyId: item.propertyId,
          address: item.address,
          reason: `${item.evidenceGapsCount} evidence gap${item.evidenceGapsCount === 1 ? "" : "s"} need review.`,
          suggestedNextAction: "Review evidence gaps",
          capabilityStatus: "simulated",
        });
      }
      if (item.upcomingExpiryCount) {
        items.push({
          type: "upcoming_expiry",
          propertyId: item.propertyId,
          address: item.address,
          reason: `${item.upcomingExpiryCount} expiry or renewal item is visible.`,
          suggestedNextAction: "Review monitoring dates",
          capabilityStatus: "simulated",
        });
      }
      if (item.futureReadinessFlag) {
        items.push({
          type: "future_readiness",
          propertyId: item.propertyId,
          address: item.address,
          reason: "Future-readiness concern is present.",
          suggestedNextAction: "Review future-readiness action",
          capabilityStatus: "simulated",
        });
      }
    }
    return items;
  }

  function createPortfolioActionPlan(portfolioIntelligence, options = {}) {
    if (!portfolioIntelligence) return resultFail("Portfolio intelligence is required.");
    const ranked = portfolioIntelligence.rankedProperties || [];
    return resultOk({
      generatedAt: options.now || new Date().toISOString(),
      actions: ranked.slice(0, 5).map((item, index) => ({
        actionId: `portfolio_action_${index + 1}_${item.propertyId}`,
        propertyId: item.propertyId,
        title: index === 0 ? "Start with this property" : "Review next portfolio property",
        reason: item.priorityExplanation,
        suggestedNextAction: item.nextBestAction?.title || "Review evidence",
        capabilityStatus: "simulated",
      })),
      caveat: "Based on current information. Guidance, not legal advice. No supplier contacted. No payment taken.",
    });
  }

  function derivePortfolioIntelligence(propertyRecords = [], options = {}) {
    if (!Array.isArray(propertyRecords)) return resultFail("Portfolio derivation requires an array of PropertyRecord objects.");
    const warnings = [];
    const items = [];
    for (const record of propertyRecords) {
      const derived = portfolioItem(record, options);
      if (!derived.ok) return derived;
      items.push(derived.value);
      warnings.push(...(derived.warnings || []));
    }
    const rankedProperties = rankPortfolioProperties(items);
    const state = items.length === 0 ? "empty" : items.length === 1 ? "one_property" : "multi_property";
    const risks = summarisePortfolioRisks(items);
    const expiries = summarisePortfolioExpiries(items);
    const evidence = summarisePortfolioEvidenceGaps(items);
    const serviceOpportunities = summarisePortfolioServiceOpportunities(items);
    const summary = {
      ...risks,
      ...expiries,
      ...evidence,
      serviceOpportunityCount: serviceOpportunities.length,
    };
    const topProperty = rankedProperties[0] || null;
    const topPortfolioAction = topProperty ? {
      title: "Review top portfolio priority",
      propertyId: topProperty.propertyId,
      address: topProperty.address,
      reason: `Based on current information, ${topProperty.address} is first. ${topProperty.priorityExplanation}`,
      capabilityStatus: "simulated",
      primaryCtaLabel: "Open property",
      secondaryCtaLabel: "Review Portfolio Sweep",
    } : null;
    const value = {
      state,
      propertyCount: items.length,
      portfolioToolsVisible: items.length > 1 || options.explicitPortfolioMode === true,
      items,
      rankedProperties,
      summary,
      topPortfolioAction,
      serviceOpportunities,
      sweepItems: createSweepItems(rankedProperties),
      reportPreviewData: {
        reportType: "portfolio_summary",
        propertyCount: items.length,
        priorityOrder: rankedProperties.map((item) => item.propertyId),
        caveat: "Based on current information. Guidance, not legal advice.",
      },
      caveats: [
        "Based on current information.",
        "Guidance, not legal advice.",
        "Portfolio actions are prototype-level and do not contact suppliers or take payment.",
      ],
      ruleVersion: compliance?.RULE_VERSION || "unknown",
    };
    return resultOk(value, warnings);
  }

  return {
    derivePortfolioIntelligence,
    rankPortfolioProperties,
    summarisePortfolioRisks,
    summarisePortfolioExpiries,
    summarisePortfolioEvidenceGaps,
    summarisePortfolioServiceOpportunities,
    createPortfolioActionPlan,
  };
});
