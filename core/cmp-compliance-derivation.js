(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.CMPComplianceDerivation = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const priorityRules = root?.CMPPriorityRules || (typeof require === "function" ? require("./cmp-priority-rules.js") : null);
  const scoreDerivation = root?.CMPScoreDerivation || (typeof require === "function" ? require("./cmp-score-derivation.js") : null);
  const monitoringDerivation = root?.CMPMonitoringDerivation || (typeof require === "function" ? require("./cmp-monitoring-derivation.js") : null);

  const RULE_VERSION = "stage6.rules.v1";

  function resultOk(value, warnings = []) {
    return { ok: true, value, warnings };
  }

  function resultFail(errors) {
    return { ok: false, errors: Array.isArray(errors) ? errors : [errors] };
  }

  function token(value) {
    return String(value ?? "").trim().toLowerCase().replace(/[-\s]+/g, "_");
  }

  function textIncludes(value, words) {
    const normalized = token(value);
    return words.some((word) => normalized.includes(token(word)));
  }

  function dateOnly(value) {
    return String(value || "").slice(0, 10) || null;
  }

  function isPastDate(value, now) {
    if (!value) return false;
    const date = new Date(value);
    const current = new Date(now || Date.now());
    if (Number.isNaN(date.getTime()) || Number.isNaN(current.getTime())) return false;
    return date.getTime() < current.getTime();
  }

  function findCheck(propertyRecord, checkType) {
    return (propertyRecord.smartCheckResults || []).find((check) => check.checkType === checkType) || null;
  }

  function answersFor(propertyRecord, match) {
    return (propertyRecord.landlordAnswers || []).filter((answer) => {
      return textIncludes(answer.questionId, [match]) || textIncludes(answer.answer, [match]);
    });
  }

  function firstAnswer(propertyRecord, matches) {
    return (propertyRecord.landlordAnswers || []).find((answer) => {
      return matches.some((match) => textIncludes(answer.questionId, [match]) || textIncludes(answer.answer, [match]));
    }) || null;
  }

  function evidenceMatches(item, evidenceType) {
    const type = token(item.evidenceType);
    const target = token(evidenceType);
    if (type === target) return true;
    if (target === "gas_safety_certificate") return type.includes("gas");
    if (target === "eicr_certificate") return type.includes("eicr") || type.includes("electrical");
    if (target === "alarm_record") return type.includes("alarm") || type.includes("smoke") || type.includes("co");
    if (target === "deposit_protection") return type.includes("deposit");
    if (target === "epc_certificate") return type.includes("epc");
    return type.includes(target);
  }

  function evidenceFor(propertyRecord, evidenceType) {
    return (propertyRecord.evidence || []).filter((item) => evidenceMatches(item, evidenceType));
  }

  function validEvidenceFor(propertyRecord, evidenceType, now) {
    return evidenceFor(propertyRecord, evidenceType).find((item) => {
      if (item.proofStatus === "expired") return false;
      if (item.expiryDate && isPastDate(item.expiryDate, now)) return false;
      return ["accepted", "held"].includes(item.proofStatus);
    }) || null;
  }

  function expiredEvidenceFor(propertyRecord, evidenceType, now) {
    return evidenceFor(propertyRecord, evidenceType).find((item) => {
      return item.proofStatus === "expired" || (item.expiryDate && isPastDate(item.expiryDate, now));
    }) || null;
  }

  function sourceRefs(...items) {
    return items.flatMap((item) => item?.sourceReferences || []).filter(Boolean).map((reference) => {
      if (!reference || typeof reference !== "object") return reference;
      const copy = { ...reference };
      if (typeof copy.notes === "string") {
        copy.notes = copy.notes.replace(/EPC-derived heating/gi, "heating from a missing EPC");
      }
      return copy;
    });
  }

  function sourceConfidenceSummary(issue) {
    return `Source confidence: ${issue.confidence || "unknown"} · Capability: ${issue.capabilityStatus || "simulated"}`;
  }

  function deriveContext(propertyRecord) {
    const entryTenancy = token(propertyRecord.entryContext?.isTenanted || "unsure");
    const occupancyAnswer = firstAnswer(propertyRecord, ["occupancy", "current_occupancy", "tenanted", "vacant"]);
    const occupancyText = token(occupancyAnswer?.answer || "");
    let occupancyStatus = "unknown";
    let occupantCount = null;

    if (entryTenancy === "yes") occupancyStatus = "occupied";
    if (entryTenancy === "no") occupancyStatus = "vacant";
    if (occupancyText.includes("vacant")) occupancyStatus = "vacant";
    if (textIncludes(occupancyText, ["occupied", "tenanted", "single_household", "one_two"])) occupancyStatus = "occupied";
    if (textIncludes(occupancyText, ["future", "intended", "pre_let", "advertised"])) occupancyStatus = "pre_let";
    if (textIncludes(occupancyText, ["five", "5", "five_plus"])) occupantCount = 5;
    if (occupancyStatus === "vacant") occupantCount = null;

    return {
      occupancyStatus,
      occupantCount,
      userGoal: propertyRecord.entryContext?.entryService || propertyRecord.entryContext?.focusMode || "full_compliance",
      currentPropertyUse: occupancyAnswer?.answer || propertyRecord.entryContext?.isTenanted || "unknown",
    };
  }

  function issue(propertyRecord, fields) {
    return {
      issueId: `${propertyRecord.id}_${fields.createdFromRule}`,
      propertyId: propertyRecord.id,
      category: fields.category,
      status: fields.status || "open",
      severity: fields.severity || "medium",
      legalUrgency: fields.legalUrgency || "soon",
      confidence: fields.confidence || "medium",
      sourceRefs: fields.sourceRefs || [],
      triggerFacts: fields.triggerFacts || [],
      triggerAnswers: fields.triggerAnswers || [],
      reason: fields.reason,
      recommendedActionType: fields.recommendedActionType || "check",
      evidenceNeeded: fields.evidenceNeeded || [],
      createdFromRule: fields.createdFromRule,
      capabilityStatus: fields.capabilityStatus || "simulated",
      dueDate: fields.dueDate || null,
      expiryDate: fields.expiryDate || null,
      blocksDerivation: Boolean(fields.blocksDerivation),
    };
  }

  function evidenceGap(propertyRecord, linkedIssue, fields = {}) {
    return {
      gapId: `${linkedIssue.issueId}_${fields.evidenceType || linkedIssue.evidenceNeeded?.[0] || "evidence"}`,
      propertyId: propertyRecord.id,
      linkedIssueId: linkedIssue.issueId,
      linkedActionId: null,
      evidenceId: fields.evidenceId || null,
      evidenceType: fields.evidenceType || linkedIssue.evidenceNeeded?.[0] || "evidence",
      proofStatus: fields.proofStatus || "missing",
      sourceConfidence: linkedIssue.confidence || "unknown",
      recommendedNextStep: fields.recommendedNextStep || "Add proof later or prepare a service request.",
      capabilityStatus: fields.capabilityStatus || linkedIssue.capabilityStatus || "simulated",
      expiryDate: fields.expiryDate || linkedIssue.expiryDate || null,
      reason: fields.reason || linkedIssue.reason,
    };
  }

  function deriveIssues(propertyRecord, context, options = {}) {
    const now = options.now || new Date().toISOString();
    const issues = [];
    const epc = findCheck(propertyRecord, "epc");
    const heating = findCheck(propertyRecord, "heating_source");
    const epcValue = epc?.value || {};
    const epcRating = String(epcValue.epcRating || "").toUpperCase();

    if (epc && (epc.resultStatus === "missing" || epcValue.epcFound === false)) {
      issues.push(issue(propertyRecord, {
        category: "epc",
        severity: context.occupancyStatus === "pre_let" ? "high" : "medium",
        legalUrgency: context.occupancyStatus === "pre_let" ? "urgent" : "high",
        confidence: epc.confidence || "medium",
        sourceRefs: sourceRefs(epc),
        triggerFacts: [{ checkId: epc.id, checkType: "epc", resultStatus: "missing", epcFound: false }],
        reason: "No EPC was found in the simulated Smart Check. No EPC rating, potential, expiry or heating claim has been inferred from that missing record.",
        recommendedActionType: "request_service",
        evidenceNeeded: ["epc_certificate"],
        createdFromRule: "epc_missing",
        capabilityStatus: epc.capabilityStatus || "simulated",
      }));
    } else if (epcValue.epcExpiry && isPastDate(epcValue.epcExpiry, now)) {
      issues.push(issue(propertyRecord, {
        category: "epc",
        severity: "high",
        legalUrgency: "high",
        confidence: epc.confidence || "medium",
        sourceRefs: sourceRefs(epc),
        triggerFacts: [{ checkId: epc.id, checkType: "epc", resultStatus: "expired" }],
        reason: "The EPC expiry date appears to be in the past.",
        recommendedActionType: "request_service",
        evidenceNeeded: ["epc_certificate"],
        createdFromRule: "epc_expired",
        capabilityStatus: epc.capabilityStatus || "simulated",
        expiryDate: epcValue.epcExpiry,
      }));
    }

    if (["E", "F", "G"].includes(epcRating)) {
      issues.push(issue(propertyRecord, {
        category: "future_readiness",
        severity: epcRating === "G" ? "high" : "medium",
        legalUrgency: "watch",
        confidence: epc.confidence || "medium",
        sourceRefs: sourceRefs(epc),
        triggerFacts: [{ checkId: epc.id, checkType: "epc", epcRating }],
        reason: `EPC ${epcRating} should be reviewed for future readiness and improvement planning.`,
        recommendedActionType: "plan_improvement",
        evidenceNeeded: [],
        createdFromRule: "epc_low_rating_future_readiness",
        capabilityStatus: epc.capabilityStatus || "simulated",
      }));
    }

    const hasGas = heating?.value?.hasGas;
    const gasEvidence = validEvidenceFor(propertyRecord, "gas_safety_certificate", now);
    const expiredGas = expiredEvidenceFor(propertyRecord, "gas_safety_certificate", now);
    if (hasGas === true && !gasEvidence) {
      issues.push(issue(propertyRecord, {
        category: "gas_safety",
        status: "awaiting_evidence",
        severity: "high",
        legalUrgency: context.occupancyStatus === "occupied" ? "urgent" : "high",
        confidence: heating.confidence || "low",
        sourceRefs: sourceRefs(heating, expiredGas),
        triggerFacts: [{ checkId: heating.id, checkType: "heating_source", hasGas: true }],
        reason: expiredGas ? "Gas Safety proof appears expired." : "Gas appears relevant, but no current Gas Safety proof is recorded.",
        recommendedActionType: expiredGas ? "add_evidence" : "request_service",
        evidenceNeeded: ["gas_safety_certificate"],
        createdFromRule: expiredGas ? "gas_expired_evidence" : "gas_missing_evidence",
        capabilityStatus: heating.capabilityStatus || "simulated",
        expiryDate: expiredGas?.expiryDate || null,
      }));
    } else if (hasGas === undefined || hasGas === null || heating?.resultStatus === "unknown") {
      issues.push(issue(propertyRecord, {
        category: "gas_safety",
        severity: "medium",
        legalUrgency: "soon",
        confidence: "unknown",
        sourceRefs: sourceRefs(heating),
        triggerFacts: [{ checkId: heating?.id || null, checkType: "heating_source", resultStatus: "unknown" }],
        reason: "Gas or fixed-combustion status is unknown and needs landlord confirmation.",
        recommendedActionType: "answer_unknowns",
        evidenceNeeded: [],
        createdFromRule: "gas_unknown",
        capabilityStatus: heating?.capabilityStatus || "simulated",
        blocksDerivation: true,
      }));
    }

    const eicrAnswer = firstAnswer(propertyRecord, ["eicr", "electrical"]);
    const eicrText = token(eicrAnswer?.answer || "");
    const eicrEvidence = validEvidenceFor(propertyRecord, "eicr_certificate", now);
    const expiredEicr = expiredEvidenceFor(propertyRecord, "eicr_certificate", now);
    if (textIncludes(eicrText, ["have_it_but_no_proof", "no_proof", "held_no_proof", "i_have_it"])) {
      issues.push(issue(propertyRecord, {
        category: "eicr",
        status: "awaiting_evidence",
        severity: "high",
        legalUrgency: "urgent",
        confidence: "medium",
        sourceRefs: sourceRefs(eicrAnswer),
        triggerAnswers: [eicrAnswer.id],
        reason: "The landlord says an EICR exists, but no proof is available in CMP.",
        recommendedActionType: "add_evidence",
        evidenceNeeded: ["eicr_certificate"],
        createdFromRule: "eicr_held_no_proof",
        capabilityStatus: "simulated",
        blocksDerivation: true,
      }));
    } else if (!eicrEvidence) {
      issues.push(issue(propertyRecord, {
        category: "eicr",
        status: "awaiting_evidence",
        severity: "high",
        legalUrgency: context.occupancyStatus === "occupied" ? "high" : "soon",
        confidence: expiredEicr ? "medium" : "unknown",
        sourceRefs: sourceRefs(expiredEicr),
        triggerFacts: expiredEicr ? [{ evidenceId: expiredEicr.id, proofStatus: "expired" }] : [],
        reason: expiredEicr ? "EICR proof appears expired." : "No EICR proof is currently recorded.",
        recommendedActionType: expiredEicr ? "add_evidence" : "request_service",
        evidenceNeeded: ["eicr_certificate"],
        createdFromRule: expiredEicr ? "eicr_expired_evidence" : "eicr_missing_or_unknown",
        capabilityStatus: expiredEicr?.capabilityStatus || "simulated",
        expiryDate: expiredEicr?.expiryDate || null,
      }));
    }

    const alarmAnswer = firstAnswer(propertyRecord, ["alarm", "smoke", "co_alarm"]);
    if (!validEvidenceFor(propertyRecord, "alarm_record", now) && !alarmAnswer) {
      issues.push(issue(propertyRecord, {
        category: "alarms",
        severity: "medium",
        legalUrgency: "soon",
        confidence: "unknown",
        reason: "Smoke and CO alarm status is unknown and needs confirmation or proof.",
        recommendedActionType: "answer_unknowns",
        evidenceNeeded: ["alarm_record"],
        createdFromRule: "alarms_unknown",
        capabilityStatus: "simulated",
      }));
    }

    if (context.occupancyStatus === "occupied" && !validEvidenceFor(propertyRecord, "deposit_protection", now) && !firstAnswer(propertyRecord, ["deposit"])) {
      issues.push(issue(propertyRecord, {
        category: "deposit_admin",
        severity: "medium",
        legalUrgency: "soon",
        confidence: "unknown",
        reason: "Deposit protection and prescribed information status is unknown for a current tenancy context.",
        recommendedActionType: "answer_unknowns",
        evidenceNeeded: ["deposit_protection"],
        createdFromRule: "deposit_unknown",
        capabilityStatus: "simulated",
      }));
    }

    if (context.occupantCount >= 5 || textIncludes(firstAnswer(propertyRecord, ["occupants", "hmo"])?.answer, ["five", "5", "hmo"])) {
      issues.push(issue(propertyRecord, {
        category: "licensing_hmo",
        severity: "high",
        legalUrgency: "high",
        confidence: "medium",
        reason: "Occupancy answers suggest HMO or licensing should be checked.",
        recommendedActionType: "check",
        evidenceNeeded: ["licence_or_local_authority_check"],
        createdFromRule: "licensing_hmo_possible",
        capabilityStatus: "simulated",
      }));
    }

    const conditionAnswer = firstAnswer(propertyRecord, ["condition", "damp", "mould", "repair"]);
    if (conditionAnswer && textIncludes(conditionAnswer.answer, ["damp", "mould", "repair", "complaint"])) {
      issues.push(issue(propertyRecord, {
        category: "property_condition",
        severity: "high",
        legalUrgency: "high",
        confidence: "medium",
        triggerAnswers: [conditionAnswer.id],
        reason: "A damp, mould, repair or condition concern has been recorded.",
        recommendedActionType: "check",
        evidenceNeeded: ["condition_photos_or_inspection"],
        createdFromRule: "condition_damp_mould",
        capabilityStatus: "simulated",
      }));
    }

    const noProofAnswers = (propertyRecord.landlordAnswers || []).filter((answer) => {
      return textIncludes(answer.answer, ["no_proof", "proof_missing", "have_it_but_no_proof"]) || answer.evidenceStatus === "missing";
    });
    if (noProofAnswers.length) {
      issues.push(issue(propertyRecord, {
        category: "evidence_confidence",
        status: "awaiting_evidence",
        severity: "medium",
        legalUrgency: "soon",
        confidence: "medium",
        triggerAnswers: noProofAnswers.map((answer) => answer.id),
        reason: "One or more landlord answers say proof exists or may exist, but CMP does not have evidence.",
        recommendedActionType: "add_evidence",
        evidenceNeeded: ["supporting_evidence"],
        createdFromRule: "evidence_claimed_no_proof",
        capabilityStatus: "simulated",
      }));
    }

    return issues;
  }

  function deriveEvidenceGaps(propertyRecord, issues, options = {}) {
    const now = options.now || new Date().toISOString();
    const gaps = [];

    for (const item of propertyRecord.evidence || []) {
      if (item.proofStatus === "expired" || (item.expiryDate && isPastDate(item.expiryDate, now))) {
        const linkedIssue = issues.find((issue) => issue.evidenceNeeded?.some((needed) => evidenceMatches(item, needed))) || issue(propertyRecord, {
          category: "evidence_confidence",
          severity: "medium",
          legalUrgency: "soon",
          confidence: "medium",
          reason: `${item.evidenceType} appears expired.`,
          recommendedActionType: "add_evidence",
          evidenceNeeded: [item.evidenceType],
          createdFromRule: `expired_${token(item.evidenceType)}`,
          capabilityStatus: item.capabilityStatus || "simulated",
          expiryDate: item.expiryDate || null,
        });
        gaps.push(evidenceGap(propertyRecord, linkedIssue, {
          evidenceId: item.id,
          evidenceType: item.evidenceType,
          proofStatus: "expired",
          expiryDate: item.expiryDate || null,
          recommendedNextStep: "Add updated proof or prepare a service request.",
          capabilityStatus: item.capabilityStatus || "simulated",
        }));
      }
    }

    for (const linkedIssue of issues) {
      for (const evidenceType of linkedIssue.evidenceNeeded || []) {
        if (linkedIssue.createdFromRule === "eicr_held_no_proof") {
          gaps.push(evidenceGap(propertyRecord, linkedIssue, {
            evidenceType,
            proofStatus: "held_no_proof",
            recommendedNextStep: "Add proof later before booking a duplicate service.",
          }));
        } else if (linkedIssue.createdFromRule?.includes("expired")) {
          gaps.push(evidenceGap(propertyRecord, linkedIssue, {
            evidenceType,
            proofStatus: "expired",
            expiryDate: linkedIssue.expiryDate || null,
            recommendedNextStep: "Add updated proof or prepare a service request.",
          }));
        } else if (!validEvidenceFor(propertyRecord, evidenceType, now)) {
          gaps.push(evidenceGap(propertyRecord, linkedIssue, {
            evidenceType,
            proofStatus: linkedIssue.confidence === "unknown" ? "unknown" : "missing",
            recommendedNextStep: linkedIssue.recommendedActionType === "answer_unknowns" ? "Answer unknowns first." : "Add proof later or prepare a service request.",
          }));
        }
      }
    }

    const seen = new Set();
    return gaps.filter((gap) => {
      const key = `${gap.linkedIssueId}:${gap.evidenceType}:${gap.proofStatus}:${gap.evidenceId || ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function ctaForIssue(issue) {
    if (issue.recommendedActionType === "add_evidence") {
      return {
        primaryCtaType: "add_evidence",
        primaryCtaLabel: "Add proof later",
        secondaryCtaType: "request_service",
        secondaryCtaLabel: "Request service",
        nextStep: "Add proof to close the evidence gap before requesting duplicate work.",
      };
    }
    if (issue.recommendedActionType === "request_service") {
      return {
        primaryCtaType: "request_service",
        primaryCtaLabel: "Request service",
        secondaryCtaType: "add_evidence",
        secondaryCtaLabel: "Add proof later",
        nextStep: "Prepare a service request or add proof if you already have it.",
      };
    }
    if (issue.recommendedActionType === "answer_unknowns") {
      return {
        primaryCtaType: "answer_unknowns",
        primaryCtaLabel: "Answer unknowns",
        secondaryCtaType: "add_evidence",
        secondaryCtaLabel: "Add proof later",
        nextStep: "Answer the unknown before CMP treats this as a confident compliance fact.",
      };
    }
    if (issue.recommendedActionType === "plan_improvement") {
      return {
        primaryCtaType: "plan_improvement",
        primaryCtaLabel: "Plan improvement",
        secondaryCtaType: "monitor",
        secondaryCtaLabel: "Add to monitoring",
        nextStep: "Review improvement options and keep this visible in monitoring.",
      };
    }
    return {
      primaryCtaType: "check",
      primaryCtaLabel: "Check details",
      secondaryCtaType: "add_evidence",
      secondaryCtaLabel: "Add proof later",
      nextStep: "Check the details before CMP treats this as resolved.",
    };
  }

  function deriveActions(propertyRecord, issues, context, options = {}) {
    return issues.map((linkedIssue) => {
      const priority = priorityRules.calculateIssuePriority(linkedIssue, {
        ...context,
        now: options.now,
      });
      const cta = ctaForIssue(linkedIssue);
      return {
        actionId: `${linkedIssue.issueId}_action`,
        propertyId: propertyRecord.id,
        linkedIssueId: linkedIssue.issueId,
        title: actionTitle(linkedIssue),
        reason: linkedIssue.reason,
        sourceConfidenceSummary: sourceConfidenceSummary(linkedIssue),
        nextStep: cta.nextStep,
        primaryCtaType: cta.primaryCtaType,
        primaryCtaLabel: cta.primaryCtaLabel,
        secondaryCtaType: cta.secondaryCtaType,
        secondaryCtaLabel: cta.secondaryCtaLabel,
        status: "recommended",
        priorityScore: priority.score,
        priorityExplanation: priority.explanation,
        capabilityStatus: linkedIssue.capabilityStatus || "simulated",
      };
    });
  }

  function actionTitle(issue) {
    const titles = {
      epc_missing: "Find or request EPC evidence",
      epc_expired: "Update EPC evidence",
      epc_low_rating_future_readiness: "Plan EPC improvement",
      gas_missing_evidence: "Add or request Gas Safety evidence",
      gas_expired_evidence: "Add updated Gas Safety proof",
      gas_unknown: "Confirm gas and heating setup",
      eicr_missing_or_unknown: "Add or request EICR evidence",
      eicr_expired_evidence: "Add updated EICR proof",
      eicr_held_no_proof: "Add EICR proof",
      alarms_unknown: "Confirm smoke and CO alarm evidence",
      deposit_unknown: "Confirm deposit protection evidence",
      licensing_hmo_possible: "Check licensing or HMO position",
      condition_damp_mould: "Review property condition concern",
      evidence_claimed_no_proof: "Add missing proof",
    };
    return titles[issue.createdFromRule] || "Continue property setup";
  }

  function deriveOverall({ issues, evidenceGaps, scores, nextBestAction }) {
    const top = nextBestAction?.priorityScore || 0;
    const riskLevel = top >= 95 ? "urgent" : top >= 70 ? "high" : top >= 40 ? "medium" : "low";
    const confidenceScore = scores.confidence.value;
    const confidenceLevel = confidenceScore >= 75 ? "high" : confidenceScore >= 55 ? "medium" : confidenceScore >= 30 ? "low" : "unknown";
    const overallStatus = riskLevel === "urgent" || riskLevel === "high"
      ? "action_needed"
      : evidenceGaps.length
      ? "needs_evidence"
      : confidenceLevel === "low" || confidenceLevel === "unknown"
      ? "setup_incomplete"
      : "looks_ok_based_on_current_information";
    return { riskLevel, confidenceLevel, overallStatus };
  }

  function derivePropertyComplianceState(propertyRecord, options = {}) {
    if (!propertyRecord?.id) return resultFail("PropertyRecord with id is required.");
    if (!priorityRules || !scoreDerivation || !monitoringDerivation) return resultFail("Derivation dependencies are unavailable.");

    const context = deriveContext(propertyRecord);
    const issues = deriveIssues(propertyRecord, context, options);
    const evidenceGaps = deriveEvidenceGaps(propertyRecord, issues, options);
    let actionItems = deriveActions(propertyRecord, issues, context, options);
    const actionByIssue = new Map(actionItems.map((action) => [action.linkedIssueId, action.actionId]));
    evidenceGaps.forEach((gap) => {
      gap.linkedActionId = actionByIssue.get(gap.linkedIssueId) || null;
    });
    actionItems = priorityRules.rankActionItems(actionItems);
    const nextBestAction = priorityRules.selectNextBestAction(actionItems);
    const scores = scoreDerivation.deriveScores({ propertyRecord, issues, evidenceGaps });
    const monitoringItems = monitoringDerivation.deriveMonitoringItems({
      propertyRecord,
      issues,
      evidenceGaps,
      actionItems,
      now: options.now,
    });
    const overall = deriveOverall({ issues, evidenceGaps, scores, nextBestAction });
    const warnings = [];
    const epc = findCheck(propertyRecord, "epc");
    if (epc?.value?.epcFound === false || epc?.resultStatus === "missing") {
      warnings.push("No EPC found: no EPC rating, potential, expiry or heating claim was created from that missing record.");
    }

    return resultOk({
      propertyId: propertyRecord.id,
      ruleVersion: RULE_VERSION,
      ...overall,
      context,
      scores,
      issues,
      evidenceState: propertyRecord.evidence || [],
      evidenceGaps,
      actionItems,
      nextBestAction,
      monitoringItems,
      explanations: {
        status: "Based on current information. Guidance, not legal advice.",
        priority: nextBestAction?.priorityExplanation || "No current action was ranked.",
      },
      warnings,
    });
  }

  return {
    RULE_VERSION,
    derivePropertyComplianceState,
  };
});
