(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.CMPPriorityRules = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const SEVERITY_WEIGHT = {
    low: 8,
    medium: 18,
    high: 30,
    critical: 42,
  };

  const LEGAL_URGENCY_WEIGHT = {
    watch: 6,
    soon: 16,
    high: 28,
    urgent: 40,
  };

  const ACTION_TYPE_WEIGHT = {
    add_evidence: 8,
    request_service: 7,
    answer_unknowns: 5,
    check: 5,
    prepare_service_request: 5,
    plan_improvement: 2,
    monitor: 1,
  };

  function contextMultiplier(issue, context = {}) {
    const occupancy = context.occupancyStatus || "unknown";
    const category = issue.category || "";
    if (occupancy === "occupied" && ["gas_safety", "eicr", "alarms", "deposit_admin", "licensing_hmo"].includes(category)) {
      return 1.25;
    }
    if (occupancy === "vacant" && ["deposit_admin"].includes(category)) {
      return 0.45;
    }
    if (occupancy === "pre_let" && ["epc", "gas_safety", "eicr", "alarms"].includes(category)) {
      return 1.15;
    }
    return 1;
  }

  function dueDateWeight(issue, context = {}) {
    const dueDate = issue.dueDate || issue.expiryDate || null;
    if (!dueDate) return 0;
    const now = new Date(context.now || Date.now());
    const due = new Date(dueDate);
    if (Number.isNaN(now.getTime()) || Number.isNaN(due.getTime())) return 0;
    const days = Math.ceil((due.getTime() - now.getTime()) / 86400000);
    if (days < 0) return 24;
    if (days <= 30) return 18;
    if (days <= 90) return 10;
    return 2;
  }

  function confidenceMitigation(issue) {
    if (issue.confidence === "high") return 0;
    if (issue.confidence === "medium") return 2;
    if (issue.confidence === "low") return 5;
    return 7;
  }

  function calculateIssuePriority(issue, context = {}) {
    const severity = SEVERITY_WEIGHT[issue.severity] || SEVERITY_WEIGHT.medium;
    const urgency = LEGAL_URGENCY_WEIGHT[issue.legalUrgency] || LEGAL_URGENCY_WEIGHT.soon;
    const action = ACTION_TYPE_WEIGHT[issue.recommendedActionType] || 3;
    const dependency = issue.blocksDerivation ? 8 : 0;
    const enforcement = context.hasEnforcementContact ? 10 : 0;
    const userGoal = context.userGoal && String(context.userGoal).includes(issue.category) ? 5 : 0;
    const raw = (severity + urgency + action + dueDateWeight(issue, context) + dependency + enforcement + userGoal - confidenceMitigation(issue)) * contextMultiplier(issue, context);
    const score = Math.max(0, Math.round(raw));
    return {
      score,
      explanation: [
        `Severity: ${issue.severity || "medium"}`,
        `Legal urgency: ${issue.legalUrgency || "soon"}`,
        `Occupancy context: ${context.occupancyStatus || "unknown"}`,
        `Confidence: ${issue.confidence || "unknown"}`,
      ].join(" · "),
    };
  }

  function rankActionItems(actionItems = []) {
    return [...actionItems].sort((a, b) => {
      if ((b.priorityScore || 0) !== (a.priorityScore || 0)) return (b.priorityScore || 0) - (a.priorityScore || 0);
      return String(a.actionId || "").localeCompare(String(b.actionId || ""));
    });
  }

  function selectNextBestAction(actionItems = []) {
    return rankActionItems(actionItems).find((action) => action.status !== "completed" && action.status !== "dismissed") || null;
  }

  return {
    calculateIssuePriority,
    rankActionItems,
    selectNextBestAction,
  };
});
