(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.CMPPortfolioActions = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function resultOk(value, warnings = []) {
    return { ok: true, value, warnings };
  }

  function resultFail(errors) {
    return { ok: false, errors: Array.isArray(errors) ? errors : [errors] };
  }

  function nowIso(options = {}) {
    return options.now || new Date().toISOString();
  }

  function createPortfolioReportPreview(portfolioIntelligence, reportType = "portfolio_summary", options = {}) {
    if (!portfolioIntelligence) return resultFail("Portfolio intelligence is required.");
    const ranked = portfolioIntelligence.rankedProperties || [];
    const summary = portfolioIntelligence.summary || {};
    const preview = {
      id: `preview_portfolio_${reportType}`,
      reportType,
      title: "Portfolio Summary - Report preview",
      generatedAt: nowIso(options),
      generatedFrom: {
        ruleVersion: portfolioIntelligence.ruleVersion || "unknown",
        propertyCount: portfolioIntelligence.propertyCount || 0,
      },
      currentStatus: portfolioIntelligence.state || "empty",
      sections: [
        {
          title: "Portfolio priority order",
          items: ranked.slice(0, 6).map((item, index) => `${index + 1}. ${item.address} - ${item.priorityExplanation}`),
        },
        {
          title: "Open portfolio signals",
          items: [
            `${summary.urgentPropertyCount || 0} urgent/high priority properties`,
            `${summary.evidenceGapCount || 0} evidence gaps`,
            `${summary.upcomingExpiryCount || 0} upcoming expiry items`,
            `${summary.lowConfidencePropertyCount || 0} low confidence properties`,
            `${summary.futureReadinessConcernCount || 0} future-readiness concerns`,
          ],
        },
        {
          title: "Service opportunities",
          items: (portfolioIntelligence.serviceOpportunities || []).slice(0, 6).map((item) => {
            return `${item.address}: ${item.label} - ${item.recommendedBecause}`;
          }),
        },
      ].filter((section) => section.items.length),
      sourceConfidenceSummary: {
        propertyCount: portfolioIntelligence.propertyCount || 0,
        capabilityStatus: "simulated",
        caveat: "Source and confidence labels must be reviewed property by property.",
      },
      caveat: "Report preview based on current information. Guidance, not legal advice. No supplier contacted. No payment taken.",
      capabilityStatus: "simulated",
    };
    return resultOk(preview);
  }

  function resolvePortfolioAction(portfolioIntelligence, actionRequest = {}, options = {}) {
    if (!portfolioIntelligence) return resultFail("Portfolio intelligence is required.");
    const type = actionRequest.type || "open_priority_property";
    if (type === "generate_report_preview") {
      const report = createPortfolioReportPreview(portfolioIntelligence, actionRequest.reportType || "portfolio_summary", options);
      if (!report.ok) return report;
      return resultOk({
        type,
        capabilityStatus: "simulated",
        changedCanonicalState: false,
        reportPreview: report.value,
        nextStep: "Review the report preview before taking action.",
      });
    }
    if (type === "prepare_service_bundle") {
      return resultOk({
        type,
        capabilityStatus: "simulated",
        changedCanonicalState: false,
        serviceOpportunities: portfolioIntelligence.serviceOpportunities || [],
        nextStep: "Review each property before preparing any individual service request.",
        copy: "Bundle opportunity prepared. No supplier contacted. No payment taken. Review before action.",
      });
    }
    if (type === "open_priority_property") {
      const top = portfolioIntelligence.rankedProperties?.[0] || null;
      return resultOk({
        type,
        capabilityStatus: "simulated",
        changedCanonicalState: false,
        propertyId: top?.propertyId || null,
        nextStep: top ? `Open ${top.address}` : "Add a property first.",
        reason: top?.priorityExplanation || "No portfolio priority is available yet.",
      });
    }
    return resultFail(`Unsupported portfolio action: ${type}`);
  }

  return {
    resolvePortfolioAction,
    createPortfolioReportPreview,
  };
});
