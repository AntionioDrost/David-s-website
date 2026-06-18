(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.CMPEvidenceLifecycle = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
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

  function dateOnly(value) {
    return String(value || "").slice(0, 10) || null;
  }

  function slug(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function addYears(dateValue, years) {
    const date = new Date(dateValue || Date.now());
    if (Number.isNaN(date.getTime())) return null;
    date.setUTCFullYear(date.getUTCFullYear() + years);
    return date.toISOString().slice(0, 10);
  }

  function expectedEvidenceType(serviceRequest) {
    const expected = serviceRequest?.evidenceExpected?.[0]?.evidenceType;
    if (expected) return expected;
    const byService = {
      "epc-assessment": "epc_certificate",
      "gas-safety": "gas_safety_certificate",
      eicr: "eicr_certificate",
      "property-inspection": "inspection_report",
      "damp-mould-support": "condition_report",
      "licensing-hmo-check": "licensing_check",
      "possession-readiness": "tenancy_admin_pack",
      "epc-improvement-review": "epc_improvement_plan",
      "evidence-admin-review": "evidence_review_note",
      "done-for-me-compliance-review": "compliance_review_pack",
    };
    return byService[serviceRequest?.serviceId] || "service_evidence";
  }

  function expiryForEvidence(evidenceType, issuedDate) {
    const type = slug(evidenceType);
    if (type.includes("gas")) return addYears(issuedDate, 1);
    if (type.includes("eicr") || type.includes("electrical")) return addYears(issuedDate, 5);
    if (type.includes("epc_certificate")) return addYears(issuedDate, 10);
    return null;
  }

  function sourceReference(serviceRequest, options = {}) {
    return {
      sourceType: "supplier_confirmed",
      sourceLabel: "Simulated service outcome",
      sourceIdentifier: serviceRequest?.id || null,
      checkedDate: dateOnly(nowIso(options)),
      confidence: options.confidence || "medium",
      capabilityStatus: "simulated",
    };
  }

  function buildEvidenceItem(propertyRecord, serviceRequest, fields = {}, options = {}) {
    const timestamp = nowIso(options);
    const issuedDate = dateOnly(timestamp);
    const evidenceType = fields.evidenceType || expectedEvidenceType(serviceRequest);
    const id = fields.id || `ev_${slug(serviceRequest.id)}_${slug(evidenceType)}`;
    return {
      id,
      propertyId: propertyRecord.id,
      linkedIssueId: serviceRequest.issueId || null,
      linkedActionId: serviceRequest.actionId || null,
      linkedServiceRequestId: serviceRequest.id,
      evidenceType,
      proofStatus: fields.proofStatus || "needs_review",
      verificationStatus: fields.verificationStatus || "needs_review",
      source: "supplier_confirmed",
      capabilityStatus: "simulated",
      issuedDate,
      expiryDate: fields.expiryDate === undefined ? expiryForEvidence(evidenceType, issuedDate) : fields.expiryDate,
      extractedFields: {
        serviceId: serviceRequest.serviceId,
        serviceRequestId: serviceRequest.id,
        preparedStatus: fields.preparedStatus || "Evidence needs review",
        supplierContacted: false,
        paymentTaken: false,
        liveDocumentStored: false,
        ...(fields.extractedFields || {}),
      },
      userConfirmationState: fields.userConfirmationState || "needs_confirmation",
      sourceReferences: [sourceReference(serviceRequest, options)],
    };
  }

  function addOrReplaceEvidence(propertyRecord, evidenceItem, serviceRequest, options = {}) {
    const timestamp = nowIso(options);
    const nextRecord = clone(propertyRecord);
    nextRecord.evidence = (nextRecord.evidence || []).filter((item) => item.id !== evidenceItem.id);
    nextRecord.evidence.push(evidenceItem);
    if (serviceRequest?.id) {
      nextRecord.serviceRequests = (nextRecord.serviceRequests || []).map((request) => {
        if (request.id !== serviceRequest.id) return request;
        return {
          ...request,
          requestStatus: evidenceItem.proofStatus === "accepted" ? "evidence_received" : request.requestStatus,
          verificationStatus: evidenceItem.verificationStatus,
          updatedAt: timestamp,
          supplierJobPackData: {
            ...(request.supplierJobPackData || {}),
            statusCopy: evidenceItem.proofStatus === "accepted"
              ? "Simulated evidence received. Evidence needs review."
              : "Evidence placeholder prepared. Evidence needs review.",
            supplierContacted: false,
            paymentTaken: false,
            liveBooking: false,
            prototypeOnly: true,
          },
        };
      });
    }
    nextRecord.timeline = [
      ...(nextRecord.timeline || []),
      {
        id: `timeline_${evidenceItem.id}`,
        propertyId: nextRecord.id,
        eventType: evidenceItem.proofStatus === "accepted" ? "simulated_evidence_received" : "evidence_placeholder_prepared",
        sourceEntityType: "evidence",
        sourceEntityId: evidenceItem.id,
        timestamp,
        summary: evidenceItem.proofStatus === "accepted"
          ? "Simulated evidence received. Evidence needs review."
          : "Evidence placeholder prepared. No document stored.",
        visibility: "landlord",
        capabilityStatus: "simulated",
      },
    ];
    nextRecord.updatedAt = timestamp;
    return nextRecord;
  }

  function createEvidencePlaceholderFromServiceRequest(propertyRecord, serviceRequest, options = {}) {
    if (!propertyRecord?.id) return resultFail("PropertyRecord is required.");
    if (!serviceRequest?.id) return resultFail("ServiceRequest is required.");
    if (serviceRequest.propertyId !== propertyRecord.id) return resultFail("ServiceRequest propertyId does not match PropertyRecord.");
    const evidenceItem = buildEvidenceItem(propertyRecord, serviceRequest, {
      proofStatus: "needs_review",
      verificationStatus: "needs_review",
      userConfirmationState: "needs_confirmation",
      preparedStatus: "Evidence needs review",
    }, options);
    const nextRecord = addOrReplaceEvidence(propertyRecord, evidenceItem, serviceRequest, options);
    return resultOk({ propertyRecord: nextRecord, evidenceItem });
  }

  function createSimulatedEvidenceFromServiceRequest(propertyRecord, serviceRequest, options = {}) {
    if (!propertyRecord?.id) return resultFail("PropertyRecord is required.");
    if (!serviceRequest?.id) return resultFail("ServiceRequest is required.");
    if (serviceRequest.propertyId !== propertyRecord.id) return resultFail("ServiceRequest propertyId does not match PropertyRecord.");
    const confirmed = options.confirmationState === "confirmed";
    const evidenceItem = buildEvidenceItem(propertyRecord, serviceRequest, {
      proofStatus: confirmed ? "accepted" : "needs_review",
      verificationStatus: confirmed ? "accepted" : "needs_review",
      userConfirmationState: confirmed ? "confirmed" : "needs_confirmation",
      preparedStatus: confirmed ? "Prepared for review" : "Evidence needs review",
      extractedFields: {
        simulatedOutcome: true,
        needsReview: !confirmed,
        guidance: "Guidance, not legal advice",
      },
    }, options);
    const nextRecord = addOrReplaceEvidence(propertyRecord, evidenceItem, serviceRequest, options);
    return resultOk({ propertyRecord: nextRecord, evidenceItem });
  }

  return {
    createEvidencePlaceholderFromServiceRequest,
    createSimulatedEvidenceFromServiceRequest,
  };
});
