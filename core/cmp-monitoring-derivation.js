(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.CMPMonitoringDerivation = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function evidenceLabel(type = "evidence") {
    return String(type)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function deriveMonitoringItems({ propertyRecord, issues = [], evidenceGaps = [], actionItems = [], now = new Date().toISOString() } = {}) {
    const propertyId = propertyRecord?.id || "unknown_property";
    const items = [];

    for (const evidence of propertyRecord?.evidence || []) {
      if (!evidence.expiryDate) continue;
      items.push({
        id: `${propertyId}_monitor_${evidence.id}`,
        propertyId,
        monitoringType: "expiry",
        reason: `${evidenceLabel(evidence.evidenceType)} has an expiry date recorded.`,
        dueDate: evidence.expiryDate,
        cadence: null,
        currentState: evidence.proofStatus === "expired" ? "expired" : "watching",
        nextAction: evidence.proofStatus === "expired" ? "Add updated proof or prepare a service request." : "Keep renewal date visible.",
        linkedIssueId: evidence.linkedIssueId || null,
        linkedEvidenceId: evidence.id,
        linkedActionId: evidence.linkedActionId || null,
        capabilityStatus: evidence.capabilityStatus || "simulated",
        createdAt: now,
      });
    }

    for (const gap of evidenceGaps) {
      items.push({
        id: `${propertyId}_monitor_gap_${gap.gapId}`,
        propertyId,
        monitoringType: "evidence_gap",
        reason: `${evidenceLabel(gap.evidenceType)} is ${gap.proofStatus}.`,
        dueDate: gap.expiryDate || null,
        cadence: null,
        currentState: "open",
        nextAction: gap.recommendedNextStep,
        linkedIssueId: gap.linkedIssueId,
        linkedEvidenceId: gap.evidenceId || null,
        linkedActionId: gap.linkedActionId || null,
        capabilityStatus: gap.capabilityStatus || "simulated",
        createdAt: now,
      });
    }

    for (const action of actionItems.filter((item) => (item.priorityScore || 0) >= 70).slice(0, 3)) {
      items.push({
        id: `${propertyId}_monitor_priority_${action.actionId}`,
        propertyId,
        monitoringType: "priority_issue",
        reason: action.title,
        dueDate: null,
        cadence: null,
        currentState: "open",
        nextAction: action.nextStep,
        linkedIssueId: action.linkedIssueId,
        linkedEvidenceId: null,
        linkedActionId: action.actionId,
        capabilityStatus: action.capabilityStatus || "simulated",
        createdAt: now,
      });
    }

    items.push({
      id: `${propertyId}_monitor_annual_review`,
      propertyId,
      monitoringType: "annual_review",
      reason: "Annual property review keeps evidence, renewals and landlord answers current.",
      dueDate: null,
      cadence: "annual",
      currentState: "watching",
      nextAction: "Review property information at least annually.",
      linkedIssueId: null,
      linkedEvidenceId: null,
      linkedActionId: null,
      capabilityStatus: "simulated",
      createdAt: now,
    });

    return items;
  }

  return {
    deriveMonitoringItems,
  };
});
