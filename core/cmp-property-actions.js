(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.CMPPropertyActions = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const serviceLifecycle = root?.CMPServiceLifecycle || (typeof require === "function" ? require("./cmp-service-lifecycle.js") : null);
  const evidenceLifecycle = root?.CMPEvidenceLifecycle || (typeof require === "function" ? require("./cmp-evidence-lifecycle.js") : null);
  const reportGenerator = root?.CMPReportGenerator || (typeof require === "function" ? require("./cmp-report-generator.js") : null);

  function resultOk(value, warnings = []) {
    return { ok: true, value, warnings };
  }

  function resultFail(errors) {
    return { ok: false, errors: Array.isArray(errors) ? errors : [errors] };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function selectedAction(context, actionRequest = {}) {
    if (actionRequest.actionId) {
      return (context.actionItems || []).find((action) => action.actionId === actionRequest.actionId) || null;
    }
    return context.nextBestAction || (context.actionItems || [])[0] || null;
  }

  function baseValue(context, actionRequest, changedCanonicalState) {
    return {
      propertyId: context.property?.id || context.propertyRecord?.id,
      sourceAction: actionRequest.type,
      capabilityStatus: "simulated",
      changedCanonicalState,
      nextStep: "Prepared for review. Guidance, not legal advice.",
    };
  }

  function resolvePropertyAwareAction(context, actionRequest = {}, options = {}) {
    if (!context?.propertyRecord?.id) return resultFail("Ask CMP context with PropertyRecord is required.");
    const type = actionRequest.type || "open_next_action";
    const propertyRecord = clone(context.propertyRecord);

    if (type === "open_next_action") {
      return resultOk({
        ...baseValue(context, actionRequest, false),
        actionItem: selectedAction(context, actionRequest),
        nextStep: "Open the selected next best action and review source/confidence details.",
      });
    }

    if (type === "prepare_service_request") {
      if (!serviceLifecycle?.resolveServiceOptionsForAction || !serviceLifecycle?.createServiceRequestFromAction) {
        return resultFail("Service lifecycle module unavailable.");
      }
      const actionItem = selectedAction(context, actionRequest);
      if (!actionItem) return resultFail("No action item is available for service preparation.");
      const derivedState = {
        issues: context.issues || [],
        actionItems: context.actionItems || [],
        nextBestAction: context.nextBestAction || null,
      };
      const serviceOptions = serviceLifecycle.resolveServiceOptionsForAction(actionItem, propertyRecord, derivedState);
      if (!serviceOptions.ok) return serviceOptions;
      const serviceOption = actionRequest.serviceId
        ? serviceOptions.value.find((item) => item.serviceId === actionRequest.serviceId)
        : serviceOptions.value[0];
      if (!serviceOption) return resultFail("No mapped service option is available for this action.");
      const created = serviceLifecycle.createServiceRequestFromAction(propertyRecord, actionItem, serviceOption, options);
      if (!created.ok) return created;
      return resultOk({
        ...baseValue(context, actionRequest, true),
        propertyRecord: created.value.propertyRecord,
        serviceRequest: created.value.serviceRequest,
        nextStep: "Service request prepared. No live supplier action has happened and no payment has been taken.",
      }, created.warnings || []);
    }

    if (type === "create_evidence_placeholder") {
      if (!evidenceLifecycle?.createEvidencePlaceholderFromServiceRequest) {
        return resultFail("Evidence lifecycle module unavailable.");
      }
      const serviceRequest = (propertyRecord.serviceRequests || []).find((request) => request.id === actionRequest.serviceRequestId);
      if (!serviceRequest) return resultFail(`Unknown service request: ${actionRequest.serviceRequestId || "not provided"}`);
      const created = evidenceLifecycle.createEvidencePlaceholderFromServiceRequest(propertyRecord, serviceRequest, options);
      if (!created.ok) return created;
      return resultOk({
        ...baseValue(context, actionRequest, true),
        propertyRecord: created.value.propertyRecord,
        evidenceItem: created.value.evidenceItem,
        nextStep: "Evidence placeholder prepared. Evidence needs review.",
      }, created.warnings || []);
    }

    if (type === "generate_report_preview") {
      if (!reportGenerator?.generateReportPreview) return resultFail("Report generator module unavailable.");
      const preview = reportGenerator.generateReportPreview(propertyRecord, {
        ruleVersion: context.sourceConfidence?.ruleVersion || "unknown",
        overallStatus: context.derivedStatus || "setup_incomplete",
        issues: context.issues || [],
        evidenceGaps: context.evidenceGaps || [],
        actionItems: context.actionItems || [],
        monitoringItems: context.monitoringItems || [],
        nextBestAction: context.nextBestAction || null,
        scores: context.scores || {},
      }, actionRequest.reportType || "property_summary", options);
      if (!preview.ok) return preview;
      return resultOk({
        ...baseValue(context, actionRequest, false),
        reportPreview: preview.value,
        nextStep: "Report preview prepared from the Property Brain.",
      }, preview.warnings || []);
    }

    if (type === "create_report_record") {
      if (!reportGenerator?.createReportRecord) return resultFail("Report generator module unavailable.");
      const report = reportGenerator.createReportRecord(propertyRecord, {
        ruleVersion: context.sourceConfidence?.ruleVersion || "unknown",
        overallStatus: context.derivedStatus || "setup_incomplete",
        issues: context.issues || [],
        evidenceGaps: context.evidenceGaps || [],
        actionItems: context.actionItems || [],
        monitoringItems: context.monitoringItems || [],
        nextBestAction: context.nextBestAction || null,
        scores: context.scores || {},
      }, actionRequest.reportType || "property_summary", options);
      if (!report.ok) return report;
      const nextRecord = clone(propertyRecord);
      nextRecord.reports = (nextRecord.reports || []).filter((item) => item.id !== report.value.reportRecord.id);
      nextRecord.reports.push(report.value.reportRecord);
      return resultOk({
        ...baseValue(context, actionRequest, true),
        propertyRecord: nextRecord,
        reportRecord: report.value.reportRecord,
        reportPreview: report.value.reportPreview,
        nextStep: "Report preview record prepared for review.",
      }, report.warnings || []);
    }

    if (type === "create_monitoring_placeholder") {
      const nextRecord = clone(propertyRecord);
      const id = actionRequest.id || `monitoring_${Date.now()}`;
      nextRecord.monitoring = [
        ...(nextRecord.monitoring || []),
        {
          id,
          propertyId: nextRecord.id,
          monitoringType: actionRequest.monitoringType || "manual_review",
          reason: actionRequest.reason || "Manual monitoring reminder prepared from Ask CMP.",
          currentState: "prepared_for_review",
          nextAction: actionRequest.nextAction || "Review this reminder during monitoring setup.",
          capabilityStatus: "simulated",
        },
      ];
      return resultOk({
        ...baseValue(context, actionRequest, true),
        propertyRecord: nextRecord,
        monitoringItem: nextRecord.monitoring[nextRecord.monitoring.length - 1],
        nextStep: "Monitoring placeholder prepared for review.",
      });
    }

    return resultFail(`Unsupported property-aware action: ${type}`);
  }

  return {
    resolvePropertyAwareAction,
  };
});
