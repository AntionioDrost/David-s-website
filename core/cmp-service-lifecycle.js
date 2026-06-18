(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.CMPServiceLifecycle = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const SERVICE_CATALOG = [
    {
      serviceId: "epc-assessment",
      label: "EPC assessment",
      category: "epc",
      recommendedBecause: "Recommended because this property needs EPC evidence or an updated EPC check.",
      supportedIssueCategories: ["epc"],
      supportedRuleIds: ["epc_missing", "epc_expired"],
      requiredPropertyContext: ["address"],
      evidenceExpected: [{ evidenceType: "epc_certificate", proofStatus: "needs_review" }],
      capabilityStatus: "simulated",
    },
    {
      serviceId: "gas-safety",
      label: "Gas Safety",
      category: "gas_safety",
      recommendedBecause: "Recommended because this property has a gas safety evidence gap.",
      supportedIssueCategories: ["gas_safety"],
      supportedRuleIds: ["gas_missing_evidence"],
      requiredPropertyContext: ["address", "gas_context"],
      evidenceExpected: [{ evidenceType: "gas_safety_certificate", proofStatus: "needs_review" }],
      capabilityStatus: "simulated",
    },
    {
      serviceId: "eicr",
      label: "EICR",
      category: "eicr",
      recommendedBecause: "Recommended because this property needs electrical safety evidence.",
      supportedIssueCategories: ["eicr"],
      supportedRuleIds: ["eicr_missing_or_unknown", "eicr_proof_missing"],
      requiredPropertyContext: ["address"],
      evidenceExpected: [{ evidenceType: "eicr_certificate", proofStatus: "needs_review" }],
      capabilityStatus: "simulated",
    },
    {
      serviceId: "property-inspection",
      label: "Property Inspection",
      category: "property_condition",
      recommendedBecause: "Recommended because this property needs condition evidence or inspection notes.",
      supportedIssueCategories: ["property_condition"],
      supportedRuleIds: ["condition_review"],
      requiredPropertyContext: ["address", "access_notes"],
      evidenceExpected: [{ evidenceType: "inspection_report", proofStatus: "needs_review" }],
      capabilityStatus: "simulated",
    },
    {
      serviceId: "damp-mould-support",
      label: "Damp / Mould inspection",
      category: "property_condition",
      recommendedBecause: "Recommended because this property has a damp or mould concern to review.",
      supportedIssueCategories: ["property_condition"],
      supportedRuleIds: ["condition_damp_mould"],
      requiredPropertyContext: ["address", "condition_context"],
      evidenceExpected: [{ evidenceType: "condition_report", proofStatus: "needs_review" }],
      capabilityStatus: "simulated",
    },
    {
      serviceId: "licensing-hmo-check",
      label: "Licensing / HMO check",
      category: "licensing_hmo",
      recommendedBecause: "Recommended because this property may need a licensing or HMO check.",
      supportedIssueCategories: ["licensing_hmo"],
      supportedRuleIds: ["licensing_hmo_possible"],
      requiredPropertyContext: ["address", "occupancy_context"],
      evidenceExpected: [{ evidenceType: "licensing_check", proofStatus: "needs_review" }],
      capabilityStatus: "simulated",
    },
    {
      serviceId: "possession-readiness",
      label: "Possession readiness support",
      category: "tenancy_admin",
      recommendedBecause: "Recommended because this property needs tenancy admin evidence reviewed before action.",
      supportedIssueCategories: ["deposit_admin", "tenancy_admin"],
      supportedRuleIds: ["deposit_admin_unknown"],
      requiredPropertyContext: ["address", "tenancy_context"],
      evidenceExpected: [{ evidenceType: "tenancy_admin_pack", proofStatus: "needs_review" }],
      capabilityStatus: "simulated",
    },
    {
      serviceId: "epc-improvement-review",
      label: "EPC improvement review",
      category: "future_readiness",
      recommendedBecause: "Recommended because this property has future EPC improvement work to review.",
      supportedIssueCategories: ["future_readiness"],
      supportedRuleIds: ["epc_low_future_readiness"],
      requiredPropertyContext: ["address", "epc_context"],
      evidenceExpected: [{ evidenceType: "epc_improvement_plan", proofStatus: "needs_review" }],
      capabilityStatus: "simulated",
    },
    {
      serviceId: "evidence-admin-review",
      label: "Evidence/admin review",
      category: "evidence_confidence",
      recommendedBecause: "Recommended because this property has evidence that needs review.",
      supportedIssueCategories: ["evidence_confidence", "deposit_admin"],
      supportedRuleIds: ["evidence_needs_review"],
      requiredPropertyContext: ["address"],
      evidenceExpected: [{ evidenceType: "evidence_review_note", proofStatus: "needs_review" }],
      capabilityStatus: "simulated",
    },
    {
      serviceId: "done-for-me-compliance-review",
      label: "Done-for-me compliance review",
      category: "general_compliance",
      recommendedBecause: "Recommended because this property has multiple open setup gaps.",
      supportedIssueCategories: ["future_readiness", "evidence_confidence"],
      supportedRuleIds: ["general_compliance_review"],
      requiredPropertyContext: ["address"],
      evidenceExpected: [{ evidenceType: "compliance_review_pack", proofStatus: "needs_review" }],
      capabilityStatus: "simulated",
    },
  ];

  const SUPPORTED_STATUSES = new Set([
    "draft",
    "quote_requested",
    "quote_received",
    "awaiting_payment",
    "booked",
    "in_progress",
    "completed",
    "evidence_received",
    "closed",
  ]);

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

  function slug(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function serviceById(serviceId) {
    const aliases = {
      epc: "epc-assessment",
      gas: "gas-safety",
      mould: "damp-mould-support",
      damp: "damp-mould-support",
      licensing: "licensing-hmo-check",
      inspection: "property-inspection",
      eviction: "possession-readiness",
      possession: "possession-readiness",
      aml: "evidence-admin-review",
      insurance: "evidence-admin-review",
      mortgage: "evidence-admin-review",
      rent_guarantee: "evidence-admin-review",
    };
    const canonicalId = aliases[serviceId] || serviceId;
    return SERVICE_CATALOG.find((service) => service.serviceId === canonicalId) || null;
  }

  function issueForAction(actionItem, derivedState = {}) {
    return (derivedState.issues || []).find((issue) => issue.issueId === actionItem?.linkedIssueId) || null;
  }

  function optionMatchesIssue(option, issue, actionItem) {
    if (!option || !issue) return false;
    const issueCategory = slug(issue.category);
    const issueRule = slug(issue.createdFromRule);
    const actionText = slug(`${actionItem?.title || ""} ${actionItem?.reason || ""} ${actionItem?.primaryCtaType || ""}`);
    if ((option.supportedIssueCategories || []).map(slug).includes(issueCategory)) {
      if (!option.supportedRuleIds?.length || option.supportedRuleIds.map(slug).includes(issueRule)) return true;
      if (option.serviceId === "damp-mould-support" && actionText.includes("mould")) return true;
    }
    if (option.serviceId === "damp-mould-support" && actionText.includes("damp")) return true;
    return false;
  }

  function resolveServiceOptionsForAction(actionItem, propertyRecord, derivedState = {}, options = {}) {
    const issue = options.issue || issueForAction(actionItem, derivedState);
    if (!actionItem || !issue) {
      return resultOk([], ["No service option: action is not linked to an issue."]);
    }
    const matches = SERVICE_CATALOG.filter((service) => optionMatchesIssue(service, issue, actionItem)).map((service) => ({
      ...clone(service),
      recommendedBecause: service.recommendedBecause.startsWith("Recommended because")
        ? service.recommendedBecause
        : `Recommended because ${service.recommendedBecause}`,
      linkedIssueId: issue.issueId,
      linkedActionId: actionItem.actionId,
    }));
    if (!matches.length) {
      return resultOk([], [`No service option: ${issue.category || "unknown issue"} is not mapped to a canonical service.`]);
    }
    return resultOk(matches);
  }

  function safeStatusCopy(status) {
    const copies = {
      draft: "Service request prepared. No supplier contacted. No payment taken.",
      quote_requested: "Simulated quote request prepared - no supplier contacted. No payment taken.",
      quote_received: "Simulated quote response prepared for review. No supplier contacted. No payment taken.",
      awaiting_payment: "Prototype payment step prepared. No payment taken.",
      booked: "Prototype booking step prepared. No supplier contacted.",
      in_progress: "Simulated service work in progress. No supplier contacted.",
      completed: "Simulated service marked complete. Evidence needs review.",
      evidence_received: "Simulated evidence received. Evidence needs review.",
      closed: "Simulated request closed. Guidance, not legal advice.",
    };
    return copies[status] || copies.draft;
  }

  function sourceReference(overrides = {}) {
    return {
      sourceType: overrides.sourceType || "user_stated",
      sourceLabel: overrides.sourceLabel || "CMP prototype service loop",
      sourceIdentifier: overrides.sourceIdentifier ?? null,
      checkedDate: overrides.checkedDate ?? null,
      confidence: overrides.confidence || "medium",
      capabilityStatus: overrides.capabilityStatus || "simulated",
    };
  }

  function requestBase(propertyRecord, serviceOption, fields, options = {}) {
    const timestamp = nowIso(options);
    const id = fields.id || `svc_${String(randomPart(options) || "request").trim()}`;
    const expected = clone(serviceOption?.evidenceExpected || fields.evidenceExpected || []);
    return {
      id,
      propertyId: propertyRecord.id,
      issueId: fields.issueId || null,
      actionId: fields.actionId || null,
      serviceId: serviceOption?.serviceId || fields.serviceId,
      source: fields.source || "manual",
      requestMode: "simulated",
      requestStatus: fields.requestStatus || "draft",
      propertyAccessDetails: fields.propertyAccessDetails || {
        address: propertyRecord.identity?.displayAddress || propertyRecord.address || "",
        postcode: propertyRecord.identity?.postcode || "",
      },
      contactDetails: fields.contactDetails || {},
      evidenceExpected: expected,
      supplierJobPackData: {
        serviceLabel: serviceOption?.label || fields.serviceLabel || fields.serviceId,
        recommendedBecause: serviceOption?.recommendedBecause || fields.recommendedBecause || "Recommended because this property has an open gap.",
        statusCopy: safeStatusCopy(fields.requestStatus || "draft"),
        supplierContacted: false,
        paymentTaken: false,
        liveBooking: false,
        prototypeOnly: true,
        serviceAnswers: fields.serviceAnswers || {},
        evidencePlaceholders: fields.evidencePlaceholders || [],
      },
      timelineEffects: [{
        eventType: "service_request_prepared",
        summary: "Service request prepared. No supplier contacted. No payment taken.",
      }],
      monitoringEffects: [{
        monitoringType: "service_request_follow_up",
        reason: "Track this simulated request until evidence is reviewed.",
      }],
      verificationStatus: "unverified",
      capabilityStatus: "simulated",
      sourceReferences: fields.sourceReferences || [sourceReference({
        sourceIdentifier: fields.issueId || fields.sourceIntentId || id,
      })],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  function addOrReplaceRequest(propertyRecord, serviceRequest) {
    const nextRecord = clone(propertyRecord);
    nextRecord.serviceRequests = (nextRecord.serviceRequests || []).filter((request) => request.id !== serviceRequest.id);
    nextRecord.serviceRequests.push(serviceRequest);
    nextRecord.timeline = [
      ...(nextRecord.timeline || []),
      {
        id: `timeline_${serviceRequest.id}_${serviceRequest.requestStatus}`,
        propertyId: nextRecord.id,
        eventType: "service_request_prepared",
        sourceEntityType: "service_request",
        sourceEntityId: serviceRequest.id,
        timestamp: serviceRequest.updatedAt,
        summary: safeStatusCopy(serviceRequest.requestStatus),
        visibility: "landlord",
        capabilityStatus: "simulated",
      },
    ];
    nextRecord.updatedAt = serviceRequest.updatedAt;
    return nextRecord;
  }

  function createServiceRequestFromAction(propertyRecord, actionItem, serviceOption, options = {}) {
    if (!propertyRecord?.id) return resultFail("PropertyRecord is required.");
    if (!actionItem?.actionId) return resultFail("ActionItem with actionId is required.");
    if (!serviceOption?.serviceId) return resultFail("Service option with serviceId is required.");
    const serviceRequest = requestBase(propertyRecord, serviceOption, {
      issueId: actionItem.linkedIssueId || serviceOption.linkedIssueId || null,
      actionId: actionItem.actionId || serviceOption.linkedActionId || null,
      source: actionItem.primaryCtaType === "add_evidence" ? "evidence_gap" : "action_plan",
      sourceReferences: [sourceReference({
        sourceLabel: "Derived action gap",
        sourceIdentifier: actionItem.actionId,
        confidence: actionItem.sourceConfidenceSummary?.includes("unknown") ? "unknown" : "medium",
      })],
    }, options);
    const nextRecord = addOrReplaceRequest(propertyRecord, serviceRequest);
    return resultOk({ propertyRecord: nextRecord, serviceRequest });
  }

  function createServiceRequestFromServiceIntent(propertyRecord, serviceIntentDraft, options = {}) {
    if (!propertyRecord?.id) return resultFail("PropertyRecord is required.");
    if (!serviceIntentDraft?.serviceId) return resultFail("ServiceIntentDraft with serviceId is required.");
    const serviceOption = serviceById(serviceIntentDraft.serviceId) || {
      serviceId: serviceIntentDraft.serviceId,
      label: serviceIntentDraft.serviceId,
      recommendedBecause: "Recommended because this was the selected public service intent.",
      evidenceExpected: [],
      capabilityStatus: "simulated",
    };
    const serviceRequest = requestBase(propertyRecord, serviceOption, {
      source: "public_service",
      sourceIntentId: serviceIntentDraft.id,
      contactDetails: serviceIntentDraft.contact || {},
      serviceAnswers: serviceIntentDraft.serviceAnswers || {},
      evidencePlaceholders: serviceIntentDraft.evidencePlaceholders || [],
      sourceReferences: [sourceReference({
        sourceLabel: "Public service intent",
        sourceIdentifier: serviceIntentDraft.id,
      })],
    }, options);
    serviceRequest.supplierJobPackData.sourceServiceIntentId = serviceIntentDraft.id;
    const nextRecord = addOrReplaceRequest(propertyRecord, serviceRequest);
    return resultOk({ propertyRecord: nextRecord, serviceRequest });
  }

  function updateServiceRequestStatus(propertyRecord, serviceRequestId, nextStatus, options = {}) {
    if (!SUPPORTED_STATUSES.has(nextStatus)) {
      return resultFail(`Unsupported service status: ${nextStatus}`);
    }
    const current = (propertyRecord.serviceRequests || []).find((request) => request.id === serviceRequestId);
    if (!current) return resultFail(`Unknown service request: ${serviceRequestId}`);
    if (current.requestStatus === nextStatus) {
      return resultOk({ propertyRecord: clone(propertyRecord), serviceRequest: clone(current) }, [`Service request ${serviceRequestId} already ${nextStatus}.`]);
    }
    const timestamp = nowIso(options);
    const nextRequest = clone(current);
    nextRequest.requestStatus = nextStatus;
    nextRequest.updatedAt = timestamp;
    nextRequest.requestMode = "simulated";
    nextRequest.capabilityStatus = "simulated";
    nextRequest.verificationStatus = nextStatus === "evidence_received" ? "needs_review" : "unverified";
    nextRequest.supplierJobPackData = {
      ...(nextRequest.supplierJobPackData || {}),
      statusCopy: safeStatusCopy(nextStatus),
      supplierContacted: false,
      paymentTaken: false,
      liveBooking: false,
      prototypeOnly: true,
    };
    const nextRecord = addOrReplaceRequest(propertyRecord, nextRequest);
    return resultOk({ propertyRecord: nextRecord, serviceRequest: nextRequest });
  }

  function createEvidencePlaceholderFromServiceRequest(propertyRecord, serviceRequest, options = {}) {
    const evidenceApi = root?.CMPEvidenceLifecycle || (typeof require === "function" ? require("./cmp-evidence-lifecycle.js") : null);
    if (!evidenceApi?.createEvidencePlaceholderFromServiceRequest) return resultFail("Evidence lifecycle module unavailable.");
    return evidenceApi.createEvidencePlaceholderFromServiceRequest(propertyRecord, serviceRequest, options);
  }

  function createSimulatedEvidenceFromServiceRequest(propertyRecord, serviceRequest, options = {}) {
    const evidenceApi = root?.CMPEvidenceLifecycle || (typeof require === "function" ? require("./cmp-evidence-lifecycle.js") : null);
    if (!evidenceApi?.createSimulatedEvidenceFromServiceRequest) return resultFail("Evidence lifecycle module unavailable.");
    return evidenceApi.createSimulatedEvidenceFromServiceRequest(propertyRecord, serviceRequest, options);
  }

  function applyServiceLifecycleEvent(propertyRecord, serviceRequestId, event, options = {}) {
    const eventType = typeof event === "string" ? event : event?.type;
    if (eventType === "create_placeholder") {
      const request = (propertyRecord.serviceRequests || []).find((item) => item.id === serviceRequestId);
      return createEvidencePlaceholderFromServiceRequest(propertyRecord, request, options);
    }
    if (eventType === "receive_evidence") {
      const request = (propertyRecord.serviceRequests || []).find((item) => item.id === serviceRequestId);
      return createSimulatedEvidenceFromServiceRequest(propertyRecord, request, options);
    }
    return updateServiceRequestStatus(propertyRecord, serviceRequestId, eventType, options);
  }

  return {
    SERVICE_CATALOG,
    resolveServiceOptionsForAction,
    createServiceRequestFromAction,
    createServiceRequestFromServiceIntent,
    updateServiceRequestStatus,
    createEvidencePlaceholderFromServiceRequest,
    createSimulatedEvidenceFromServiceRequest,
    applyServiceLifecycleEvent,
    safeStatusCopy,
  };
});
