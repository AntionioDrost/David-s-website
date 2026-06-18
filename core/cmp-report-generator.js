(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.CMPReportGenerator = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

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

  function randomPart(options = {}) {
    if (typeof options.randomId === "function") return options.randomId();
    const randomUUID = root?.crypto?.randomUUID?.bind(root.crypto) || globalThis.crypto?.randomUUID?.bind(globalThis.crypto);
    return randomUUID ? randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function reportTitle(reportType) {
    const titles = {
      property_summary: "Property Summary",
      compliance_status_summary: "Compliance Status Summary",
      evidence_gap_summary: "Evidence Gap Summary",
      pre_let_readiness_summary: "Pre-Let Readiness Summary",
      service_job_pack_preview: "Service Job Pack Preview",
      monitoring_summary: "Monitoring Summary",
      possession_readiness_summary: "Possession Readiness Summary",
      epc_improvement_summary: "EPC Improvement Summary",
    };
    return titles[reportType] || "Property Report Preview";
  }

  function section(title, items) {
    return {
      title,
      items: (items || []).filter((item) => item !== null && item !== undefined && String(item).trim()),
    };
  }

  function scoreLine(score) {
    if (!score) return null;
    return `${score.label}: ${score.value}/100 - ${score.explanation}`;
  }

  function sourceConfidenceSummary(propertyRecord, derivedState) {
    return {
      smartChecks: propertyRecord.smartCheckResults?.length || 0,
      evidenceItems: propertyRecord.evidence?.length || 0,
      openIssues: derivedState?.issues?.length || 0,
      confidenceLevel: derivedState?.confidenceLevel || "unknown",
      capabilityStatus: "simulated",
    };
  }

  function reportSections(propertyRecord, derivedState, reportType) {
    const identity = propertyRecord.identity || {};
    const next = derivedState?.nextBestAction;
    const issues = derivedState?.issues || [];
    const gaps = derivedState?.evidenceGaps || [];
    const services = propertyRecord.serviceRequests || [];
    const monitoring = derivedState?.monitoringItems || [];
    const scores = derivedState?.scores || {};

    const sections = [
      section("Property identity", [
        identity.displayAddress || propertyRecord.address || "Selected property",
        identity.postcode ? `Postcode: ${identity.postcode}` : "Postcode not recorded",
        identity.uprn ? `UPRN: ${identity.uprn}` : "UPRN not confirmed",
      ]),
    ];

    if (["property_summary", "compliance_status_summary", "pre_let_readiness_summary"].includes(reportType)) {
      sections.push(section("Current status", [
        `Status: ${derivedState?.overallStatus || "setup_incomplete"}`,
        `Risk level: ${derivedState?.riskLevel || "unknown"}`,
        next ? `Next best action: ${next.title} - ${next.reason}` : "No ranked action yet",
      ]));
      sections.push(section("Scores", [
        scoreLine(scores.legalCompliance),
        scoreLine(scores.evidenceStrength),
        scoreLine(scores.futureReadiness),
        scoreLine(scores.confidence),
        scoreLine(scores.conditionRisk),
      ]));
    }

    if (["compliance_status_summary", "evidence_gap_summary", "pre_let_readiness_summary"].includes(reportType)) {
      sections.push(section("Open issues", issues.slice(0, 8).map((issue) => `${issue.category}: ${issue.reason} (Confidence: ${issue.confidence})`)));
      sections.push(section("Evidence gaps", gaps.slice(0, 8).map((gap) => `${gap.evidenceType}: ${gap.proofStatus} - ${gap.recommendedNextStep}`)));
    }

    if (reportType === "service_job_pack_preview") {
      sections.push(section("Service requests", services.length ? services.map((request) => {
        return `${request.supplierJobPackData?.serviceLabel || request.serviceId}: ${request.supplierJobPackData?.recommendedBecause || "Recommended because this property has an open issue."} Prototype only.`;
      }) : ["No service request has been prepared yet."]));
    }

    if (reportType === "monitoring_summary" || reportType === "pre_let_readiness_summary") {
      sections.push(section("Monitoring", monitoring.length ? monitoring.map((item) => `${item.title || item.monitoringType}: ${item.reason || ""} ${item.nextAction || ""}`.trim()) : ["Annual review placeholder and unresolved evidence gaps remain the monitoring focus."]));
    }

    if (reportType === "property_summary") {
      sections.push(section("Smart Checks", (propertyRecord.smartCheckResults || []).slice(0, 8).map((check) => {
        return `${check.checkType}: ${check.resultStatus || "unknown"} (Confidence: ${check.confidence || "unknown"})`;
      })));
    }

    return sections.filter((item) => item.items.length);
  }

  function generateReportPreview(propertyRecord, derivedState, reportType = "property_summary", options = {}) {
    if (!propertyRecord?.id) return resultFail("PropertyRecord with id is required.");
    const timestamp = nowIso(options);
    const type = reportType || "property_summary";
    const preview = {
      id: `preview_${propertyRecord.id}_${type}`,
      propertyId: propertyRecord.id,
      reportType: type,
      title: `${reportTitle(type)} - Report preview`,
      generatedAt: timestamp,
      generatedFrom: {
        schemaVersion: propertyRecord.schemaVersion || "unknown",
        ruleVersion: derivedState?.ruleVersion || "unknown",
      },
      currentStatus: derivedState?.overallStatus || "setup_incomplete",
      sections: reportSections(propertyRecord, derivedState || {}, type),
      sourceConfidenceSummary: sourceConfidenceSummary(propertyRecord, derivedState || {}),
      caveat: "Report preview based on current information. Guidance, not legal advice. Source, confidence and simulated capability status must be reviewed before use.",
      capabilityStatus: "simulated",
    };
    return resultOk(preview);
  }

  function createReportRecord(propertyRecord, derivedState, reportType = "property_summary", options = {}) {
    const preview = generateReportPreview(propertyRecord, derivedState, reportType, options);
    if (!preview.ok) return preview;
    const reportRecord = {
      id: `report_${String(randomPart(options) || "preview").trim()}`,
      propertyId: propertyRecord.id,
      reportType,
      generatedFrom: clone(preview.value.generatedFrom),
      includedEvidence: (propertyRecord.evidence || []).map((item) => item.id),
      includedIssues: (derivedState?.issues || []).map((issue) => issue.issueId),
      includedActions: (derivedState?.actionItems || []).map((action) => action.actionId),
      generatedAt: preview.value.generatedAt,
      capabilityStatus: "simulated",
      simulated: true,
      preview: preview.value,
    };
    return resultOk({ reportRecord, reportPreview: preview.value });
  }

  return {
    generateReportPreview,
    createReportRecord,
  };
});
