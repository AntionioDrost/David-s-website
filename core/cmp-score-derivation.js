(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.CMPScoreDerivation = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function clamp(value) {
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  function issueCount(issues, predicate) {
    return issues.filter(predicate).length;
  }

  function score(value, label, explanation, direction = "higher_is_better") {
    return {
      value: clamp(value),
      label,
      explanation,
      direction,
    };
  }

  function deriveScores({ propertyRecord, issues = [], evidenceGaps = [] } = {}) {
    const critical = issueCount(issues, (issue) => issue.severity === "critical");
    const high = issueCount(issues, (issue) => issue.severity === "high");
    const medium = issueCount(issues, (issue) => issue.severity === "medium");
    const unknowns = issueCount(issues, (issue) => issue.confidence === "unknown" || issue.recommendedActionType === "answer_unknowns");
    const legalSafety = issueCount(issues, (issue) => ["epc", "gas_safety", "eicr", "alarms", "deposit_admin", "licensing_hmo"].includes(issue.category));
    const evidenceGapCount = evidenceGaps.length;
    const expiredEvidence = evidenceGaps.filter((gap) => gap.proofStatus === "expired").length;
    const simulatedAccepted = (propertyRecord?.evidence || []).filter((item) => item.capabilityStatus === "simulated" && item.proofStatus === "accepted").length;
    const conditionIssues = issueCount(issues, (issue) => issue.category === "property_condition");
    const futureIssues = issueCount(issues, (issue) => issue.category === "future_readiness");

    return {
      legalCompliance: score(
        92 - critical * 35 - high * 20 - medium * 9 - legalSafety * 4,
        "Legal compliance",
        legalSafety
          ? "Needs evidence or confirmation before CMP can treat legal compliance as ready."
          : "Looks okay based on current information; this is guidance, not legal advice."
      ),
      evidenceStrength: score(
        88 - evidenceGapCount * 14 - expiredEvidence * 12 - simulatedAccepted * 5,
        "Evidence strength",
        evidenceGapCount
          ? "Evidence gaps reduce confidence until proof is added or reviewed."
          : "Evidence trail looks okay based on current information."
      ),
      conditionRisk: score(
        conditionIssues * 32 + high * 8 + critical * 15,
        "Condition risk",
        conditionIssues
          ? "Property condition concerns need review because they can affect safety and tenant outcomes."
          : "No serious condition issue has been identified from current information.",
        "higher_is_riskier"
      ),
      futureReadiness: score(
        86 - futureIssues * 24 - expiredEvidence * 8 - unknowns * 3,
        "Future readiness",
        futureIssues
          ? "Future readiness is affected by EPC improvement, expiry or setup gaps."
          : "Future readiness looks okay based on current information."
      ),
      confidence: score(
        84 - unknowns * 12 - evidenceGapCount * 5 - simulatedAccepted * 4,
        "Confidence",
        unknowns
          ? "Unknowns reduce confidence and should become questions or evidence steps."
          : "Confidence is based on available sources and proof status."
      ),
    };
  }

  return {
    deriveScores,
  };
});
