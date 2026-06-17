#!/usr/bin/env node
import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import os from "node:os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const AUDIT_DIR = path.join(ROOT_DIR, "audit", "2026-06-16-cmp-journey");
const DATA_PATH = path.join(AUDIT_DIR, "issues.json");
const PDF_HTML_PATH = path.join(AUDIT_DIR, "CMP_ARCHITECTURE_AUDIT.html");
const PDF_PATH = path.join(AUDIT_DIR, "CMP_ARCHITECTURE_AUDIT.pdf");
const REPORT_PATH = path.join(AUDIT_DIR, "CMP_ARCHITECTURE_AUDIT.md");
const SUMMARY_PATH = path.join(AUDIT_DIR, "HOW_CMP_SHOULD_ACTUALLY_WORK.md");

const data = JSON.parse(await readFile(DATA_PATH, "utf8"));
const pages = data.pages || [];
const screenshots = data.screenshots || [];
const flows = data.flows || [];
const pageByScreenshot = new Map(pages.map((page) => [page.screenshot, page]));
const flowByViewport = new Map(flows.filter((flow) => flow.id === "public-add-property-flow").map((flow) => [flow.viewport, flow]));

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function groupFor(id, viewport) {
  if (viewport === "mobile" || id.startsWith("mobile-")) return "Mobile";
  if (["home", "services", "epcs", "gas-safety", "eicr", "property-inspections", "landlord-insurance", "mortgages", "mould-damp", "selective-licensing", "contact", "news"].includes(id)) return "Public Website";
  if (id.includes("empty")) return "Empty Portfolio";
  if (id.includes("public-add-property") || id === "add-property") return "Add Property";
  if (id.includes("review-smart-search")) return "Smart Search";
  if (id.startsWith("new-property")) return "New Property Workspace";
  if (id.includes("one-property-evidence") || id.includes("mobile-dashboard-evidence")) return "Evidence";
  if (id.includes("book-service")) return "Services";
  if (id.includes("ask-cmp")) return "Ask CMP";
  if (id.includes("portfolio-compliance") || id === "portfolio") return "Portfolio Dashboard";
  if (id.includes("one-property") || id.includes("dashboard-start") || id.includes("dashboard-menu")) return "One Property Dashboard";
  return "Monitoring";
}

function stageFor(id, group) {
  if (group === "Public Website") return "Discover / understand CMP";
  if (group === "Empty Portfolio") return "Start / add first property";
  if (group === "Add Property") return "Add Property";
  if (group === "Smart Search") return "Review Findings";
  if (group === "New Property Workspace") return "Review Findings / Confirm Unknowns";
  if (group === "Evidence") return "Build Evidence";
  if (group === "Services") return "Fix Issues";
  if (group === "Ask CMP") return "Explain / support decisions";
  if (group === "Portfolio Dashboard") return "Scale across properties";
  if (group === "Mobile") return "Mobile access";
  return "Monitor Property";
}

function routeFor(record, screenshot) {
  if (record?.path) return record.path;
  if (screenshot.id.includes("public-add-property")) return "/add-property.html?postcode=CV1%203BJ";
  if (screenshot.id.includes("mobile-dashboard")) return "/dashboard-labs.html?state=one-property";
  return "(interaction capture)";
}

function purposeFor(id, label, group) {
  if (id === "home") return "Explain CMP and route landlords into property/service journeys.";
  if (group === "Public Website") return "Service-specific acquisition and orientation.";
  if (group === "Empty Portfolio") return "Explain that CMP starts by adding a property.";
  if (group === "Add Property") return "Capture address/postcode and create the initial property context.";
  if (group === "Smart Search") return "Show what CMP found automatically and what needs confirmation.";
  if (group === "New Property Workspace") return "Early property workspace before mature scoring and service recommendations.";
  if (group === "Evidence") return "Organise documents, gaps, evidence status and proof confidence.";
  if (group === "Services") return "Convert compliance gaps into service actions.";
  if (group === "Ask CMP") return "Explain the current property state in restrained guidance language.";
  if (group === "Portfolio Dashboard") return "Compare risk/evidence across multiple properties.";
  if (group === "Mobile") return "Prove the same route is usable on a phone.";
  return label || "Monitor renewals, activity and next actions.";
}

function architectureAssessment(id, group) {
  const base = {
    why: "Supports the landlord journey.",
    job: "Move the user to the next clear compliance action.",
    duplicate: "Some overlap with adjacent dashboard modules.",
    essential: "Useful, but should be simplified.",
    confusion: "Can confuse if shown outside the guided route.",
    premature: "Not premature if sequenced correctly.",
    merge: "Keep as part of the primary journey."
  };
  const map = {
    "Public Website": {
      why: "Acquire and orient a landlord before they trust CMP with a property.",
      job: "Explain the promise and provide a postcode/property entry.",
      duplicate: "Many service pages repeat the same start-with-one-service message.",
      essential: "Homepage and Add Property are essential; most service pages are secondary.",
      confusion: "The site risks feeling like a services brochure rather than an intelligence OS.",
      premature: "Detailed service routes are premature before a property exists.",
      merge: "Compress public pages around one property-first CTA plus service proof points."
    },
    "Empty Portfolio": {
      why: "A new landlord needs to know where to begin.",
      job: "Create the mental model: add property, CMP checks what it can, landlord confirms unknowns.",
      duplicate: "Overlaps with public Add Property and Journey OS start screens.",
      essential: "Essential.",
      confusion: "Any checker/demo/scenario language here competes with the first action.",
      premature: "Portfolio framing is premature before property one exists.",
      merge: "Make this the clean start of the logged-in product."
    },
    "Add Property": {
      why: "Address is the product's root object.",
      job: "Turn a postcode/address into a property workspace.",
      duplicate: "Public Add Property, dashboard Add/check property and Journey OS add screens overlap.",
      essential: "Essential.",
      confusion: "Multiple Add Property implementations make the product feel assembled from phases.",
      premature: "Not premature; it should be the first real product action.",
      merge: "Merge all add/check entry points into one canonical Smart Search flow."
    },
    "Smart Search": {
      why: "This is CMP's clearest product magic.",
      job: "Separate found data from landlord unknowns.",
      duplicate: "Overlaps with A-Z Checker, Journey OS auto checks and new-property findings.",
      essential: "Essential.",
      confusion: "It becomes confusing when another checker appears before the landlord saves found data.",
      premature: "Not premature after address selection.",
      merge: "Make this the primary post-add-property screen."
    },
    "New Property Workspace": {
      why: "Shows that a property file has been created.",
      job: "Move from found signals into confirmation and evidence setup.",
      duplicate: "Overlaps with one-property dashboard and Journey OS workspace.",
      essential: "Essential as a transitional state.",
      confusion: "Confusing if it looks like a mature dashboard too early.",
      premature: "Full scoring/services are premature here.",
      merge: "Keep as a lightweight workspace, then graduate to the full dashboard."
    },
    "One Property Dashboard": {
      why: "Shows CMP's mature single-property operating system.",
      job: "Summarise compliance, evidence, services, tasks, Ask CMP and monitoring.",
      duplicate: "Overlaps with Evidence Vault, Compliance Centre and Activity sections.",
      essential: "Essential for the demo after setup.",
      confusion: "Can overwhelm if every module is visible at once.",
      premature: "Premature before Smart Search and confirmations.",
      merge: "Keep as the main property OS, but hide advanced panels until setup is complete."
    },
    "Portfolio Dashboard": {
      why: "Shows CMP scales beyond one property.",
      job: "Compare risk, evidence and actions across properties.",
      duplicate: "Overlaps with one-property concepts when shown too early.",
      essential: "Essential later, not for the first landlord journey.",
      confusion: "Very confusing for a one-property landlord.",
      premature: "Premature before at least two properties exist.",
      merge: "Move to advanced/portfolio mode."
    },
    Evidence: {
      why: "Evidence is CMP's trust layer.",
      job: "Show what proof exists, what is missing and what is only a starting signal.",
      duplicate: "Evidence status appears in many dashboard cards.",
      essential: "Essential.",
      confusion: "Duplication is acceptable only if the Vault is the source of truth.",
      premature: "Not premature after property creation.",
      merge: "Make Evidence Vault the canonical proof store; dashboards should summarise it."
    },
    Services: {
      why: "CMP must turn gaps into action.",
      job: "Let the landlord arrange help for missing or risky items.",
      duplicate: "Service CTAs appear across public pages, dashboard cards and booking centre.",
      essential: "Essential for monetisation, but secondary to evidence clarity.",
      confusion: "Can feel like a marketplace before the compliance diagnosis is trusted.",
      premature: "Premature before the relevant gap is identified.",
      merge: "Expose services contextually from gaps, not as a generic nav destination."
    },
    "Ask CMP": {
      why: "Gives reassurance and explanation.",
      job: "Translate evidence/gaps into plain-English next steps.",
      duplicate: "Appears globally, in prompts, cards and side panels.",
      essential: "Useful, but not the product spine.",
      confusion: "Can feel like magic AI if not tied to evidence.",
      premature: "Not premature if framed as guidance, not legal advice.",
      merge: "Keep as an assistant layer over the property record."
    },
    Monitoring: {
      why: "Shows CMP continues after initial setup.",
      job: "Track renewals, timeline, alerts and future risk.",
      duplicate: "Activity, monitoring, tasks and timeline overlap.",
      essential: "Essential later.",
      confusion: "Confusing if mixed with initial setup before evidence exists.",
      premature: "Premature for first screen.",
      merge: "Combine activity/timeline/monitoring into one 'Monitor' concept."
    },
    Mobile: {
      why: "Landlords will check status on phones.",
      job: "Provide access to the same core journey.",
      duplicate: "Mobile repeats desktop information density.",
      essential: "Important, but not Nick's primary demo route.",
      confusion: "Dense navigation and controls feel heavier on mobile.",
      premature: "Not premature, but not the main demo surface.",
      merge: "Treat mobile as quick status/actions, not full architecture exposure."
    }
  };
  return map[group] || base;
}

const orderedGroups = [
  "Public Website",
  "Empty Portfolio",
  "Add Property",
  "Smart Search",
  "New Property Workspace",
  "One Property Dashboard",
  "Portfolio Dashboard",
  "Evidence",
  "Services",
  "Ask CMP",
  "Monitoring",
  "Mobile"
];

const visualItems = screenshots.map((shot) => {
  const page = pageByScreenshot.get(shot.relativePath);
  const group = groupFor(shot.id, shot.viewport);
  return {
    ...shot,
    page,
    group,
    route: routeFor(page, shot),
    purpose: purposeFor(shot.id, shot.label, group),
    stage: stageFor(shot.id, group),
    assessment: architectureAssessment(shot.id, group)
  };
});

function groupItems(group) {
  return visualItems.filter((item) => item.group === group);
}

function screenTableMarkdown() {
  return orderedGroups.map((group) => {
    const rows = groupItems(group);
    if (!rows.length) return "";
    return [
      `### ${group}`,
      "| Screenshot | Route | Why it exists | Job | Essential? | Duplicated/confusing/premature? |",
      "|---|---|---|---|---|---|",
      ...rows.map((item) => {
        const a = item.assessment;
        return `| ${item.filename} | \`${item.route}\` | ${a.why} | ${a.job} | ${a.essential} | Duplicate: ${a.duplicate}<br>Confusing: ${a.confusion}<br>Premature: ${a.premature} |`;
      })
    ].join("\n");
  }).filter(Boolean).join("\n\n");
}

const report = `# CMP Product Architecture & Visual Journey Audit

Generated: 2026-06-16

Source evidence: latest Playwright journey audit screenshots in \`audit/2026-06-16-cmp-journey/screenshots/\`.

## Verdict

CMP does **not yet feel like one coherent product**. It has one very strong product hiding inside several prototype layers.

The coherent product is:

**Add a property -> CMP finds what it can -> landlord confirms unknowns -> CMP builds evidence -> CMP recommends actions/services -> CMP monitors the property.**

The fragmented product is:

**Public services site + Add Property flow + Smart Search + Journey OS + A-Z Checker + Labs dashboard + Portfolio dashboard + Evidence Vault + Service booking + Ask CMP + demo controls.**

Those pieces are individually useful, but they currently compete for the job of explaining CMP. David's overwhelm is rational: the prototype contains multiple product architectures at once.

## 1. What Should Be Kept

- **Property-first spine:** everything should start with a property address.
- **Smart Search:** this is the clearest "CMP magic" and should become the central post-address moment.
- **Found vs unknown language:** "what CMP found automatically" and "what CMP still needs from you" is the right mental model.
- **Evidence Vault:** this is the trust engine and should be the canonical proof store.
- **One-property dashboard:** strong once setup is complete enough.
- **Ask CMP:** keep it as an evidence-aware explanation layer, not a generic AI chat product.
- **Service recommendations:** keep them when attached to specific evidence gaps.
- **Monitoring:** keep as the end-state promise after evidence and actions exist.

## 2. What Should Be Merged

- **Add Property, Smart Search and Journey OS add/check property** should become one flow. Right now they feel like three competing ways to start.
- **A-Z Checker and Confirm Unknowns** should become the same concept. The landlord should not have to understand both.
- **Activity, Timeline and Monitoring** should become one monitoring/history surface.
- **Evidence snippets across dashboards** should point back to one Evidence Vault source of truth.
- **Service pages and Book a Service** should share one action model: diagnose first, then offer help.

## 3. What Should Be Removed

- Public or dashboard routes that imply CMP is mainly a service directory.
- Duplicate checker language before a property exists.
- Legacy \`dashboard.html\` from the demo route.
- Any page that cannot answer: "What property am I looking at, what does CMP know, what does CMP need, what should I do next?"

## 4. What Should Be Hidden Until Later

- Portfolio Sweep.
- Scenario controls.
- Raw demo states.
- Advanced A-Z controls.
- Multiple EPC variants.
- Portfolio-heavy wording for one-property landlords.
- Generic services marketplace navigation.

## 5. What Should Become The Primary Journey

1. Start with a property.
2. Address matched.
3. Smart Search results: found automatically.
4. Confirm unknowns.
5. Evidence Vault: proof store and missing proof.
6. Action plan: fix issues or book services.
7. Ask CMP: explain why this matters.
8. Monitoring: keep the property ready.

That is CMP's product architecture. Everything else should support this route or stay hidden.

## 6. What Should Become Advanced Mode

- Portfolio dashboard.
- Portfolio Sweep.
- Scenario planning.
- Advanced A-Z Checker.
- Multi-property switching.
- Deep service catalogue.
- Compliance Centre cross-property comparison.

Advanced mode should appear only after the user has at least two properties or explicitly asks to manage a portfolio.

## 7. Screen-by-Screen Architecture Audit

${screenTableMarkdown()}

## 8. Journey Continuity Audit

Target journey:

\`Start -> Add Property -> Review Findings -> Confirm Unknowns -> Build Evidence -> Fix Issues -> Monitor Property\`

### Where the journey currently works

- Public Add Property now lands in the new-property workspace.
- Smart Search clearly separates found data from landlord unknowns.
- Evidence Vault and service booking demonstrate the value after diagnosis.
- Ask CMP is strongest when it explains a property-specific status.

### Where the user can accidentally leave the journey

- Public service pages can pull the user into individual service journeys before a property exists.
- Sidebar navigation exposes portfolio, compliance, evidence, tasks, activity, services, Learn and settings at once.
- Scenario controls and demo states expose the prototype machinery.
- A-Z Checker language appears as a second product model beside Smart Search.
- Portfolio Sweep appears too close to one-property onboarding.
- Generic Book a Service can look detached from evidence gaps.

### Continuity judgement

The journey is understandable only when David narrates and controls it. A first-time viewer free-clicking the prototype could reasonably conclude CMP is three products:

- a landlord services website,
- an AI/checker onboarding tool,
- and a compliance dashboard.

The next architecture pass should collapse those into one property-first workflow.

## 9. Navigation Audit

### Findings

- **Property-specific tools live under portfolio framing.** A one-property landlord sees "Portfolio" language before they understand their first property.
- **Portfolio features appear too early.** Portfolio Sweep and multi-property concepts should wait.
- **Duplicate navigation concepts exist.** Add/check property, Compliance Centre, A-Z Checker, Smart Search and Journey OS overlap.
- **Multiple routes reach the same destination.** Evidence appears as cards, Vault, dashboard summaries and service prompts.
- **Legacy navigation remains visible.** Demo state controls and older Journey OS language make the product feel internally inconsistent.

### Recommended navigation model

- Primary nav: Home, Property, Evidence, Actions, Ask CMP.
- Secondary once ready: Services, Monitor.
- Advanced portfolio mode: Portfolio, Sweep, Multi-property Evidence, Portfolio Actions.
- Hidden by default: Demo States, Scenario Controls, A-Z Advanced.

## 10. Original Vision Comparison

Vision:

> A property intelligence operating system that automatically discovers information, identifies unknowns, builds evidence, recommends actions, connects services, and monitors compliance.

### Where CMP matches the vision

- Smart Search discovers information.
- New-property workspace identifies unknowns.
- Evidence Vault builds trust.
- Service booking connects actions.
- Ask CMP explains the status.
- Monitoring shows the ongoing operating-system idea.

### Where CMP drifts

- Public services pages make CMP feel like a service marketplace.
- A-Z Checker makes CMP feel like a questionnaire product.
- Journey OS/demo controls make CMP feel like a prototype sandbox.
- Portfolio navigation makes CMP feel like enterprise software before the landlord has one property.
- Too many modules try to be the "brain" at once.

## 11. Brutally Honest Findings

### Keep

Smart Search, found/unknown split, Evidence Vault, one-property dashboard, Ask CMP as evidence support, contextual service recommendations, monitoring.

### Merge

Add Property + Smart Search + Journey OS start. A-Z Checker + Confirm Unknowns. Activity + Timeline + Monitoring. Evidence cards + Evidence Vault.

### Remove

Legacy dashboard route from demo. Duplicate checker previews. Service-directory feel as the main story. Any non-property-first start.

### Hide Until Later

Portfolio Sweep, scenario controls, raw demo states, advanced A-Z, EPC variant URLs, multi-property language, generic service catalogue.

### Primary Journey

Property-first Smart Search into an evidence-led workspace.

### Advanced Mode

Portfolio management, scenario simulation, cross-property sweep, deep compliance checker and service operations.

## 12. Demo Mode Recommendation

If Nick receives one Netlify link, it should start at:

\`dashboard-labs.html?fresh=1\`

The first screen should say, in effect:

**"Add your first property. CMP checks what it can automatically, then asks you to confirm the unknowns."**

### What Nick should click next

1. Add your first property.
2. Use the Coventry demo property.
3. Review Smart Search.
4. Save found data.
5. Answer or point to unknowns.
6. Open one-property dashboard.
7. Open Evidence Vault.
8. Book the recommended service.
9. Ask CMP why it matters.
10. Show monitoring.

### What should remain hidden

Portfolio Sweep, scenario controls, demo state controls, old dashboard, advanced A-Z, generic service browsing.

### Shortest route demonstrating CMP value

\`fresh=1 -> Add Property -> Smart Search -> Review found/unknown -> Evidence Vault -> Recommended Service -> Ask CMP -> Monitoring\`

This route demonstrates the vision without exposing the prototype's internal fragmentation.
`;

const summary = `# How CMP Should Actually Work

CMP should be a **property-first intelligence operating system**, not a services directory, not a questionnaire, and not a portfolio dashboard shown too early.

## The Core Product

1. **Add a property**
   The address is the root object. Nothing important should happen before a property exists.

2. **CMP finds what it can**
   Address, EPC-style record, UPRN, local authority, possible local/licensing signals.

3. **CMP shows what is still unknown**
   Bedrooms, occupancy, gas, EICR, alarms, tenancy/deposit, inspection evidence.

4. **The landlord confirms only the unknowns**
   This is the A-Z Checker, but it should not be branded as a separate product.

5. **CMP builds the evidence file**
   Evidence Vault becomes the source of truth.

6. **CMP recommends actions**
   Book/upload/fix only when a gap exists.

7. **CMP explains the position**
   Ask CMP should explain evidence, risk and next steps. It is guidance, not legal advice.

8. **CMP monitors the property**
   Renewals, missing proof, activity and future risk belong in one monitoring concept.

## The Simplification

Keep one spine:

**Add Property -> Smart Search -> Confirm Unknowns -> Evidence Vault -> Action Plan -> Ask CMP -> Monitor**

Hide everything that does not support that spine:

- Portfolio Sweep
- raw demo states
- scenario controls
- advanced A-Z controls
- generic service catalogue
- multi-property wording
- old dashboard routes

## Nick Demo Link

Start Nick at:

\`dashboard-labs.html?fresh=1\`

Then show:

**Add first property -> Smart Search -> Review found data -> Confirm unknowns -> Evidence Vault -> Book service -> Ask CMP -> Monitoring**

Do not let the demo become a tour of all available screens. The product is strongest when it feels inevitable: CMP starts with a property, builds intelligence, turns unknowns into evidence, then turns evidence into action.
`;

function visualHtml() {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>CMP Architecture Audit</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, sans-serif; color: #14251f; background: #f5f3ee; }
    .cover, .section, .shot { page-break-after: always; }
    .cover { display: grid; align-content: center; min-height: 180mm; gap: 16px; }
    h1 { margin: 0; font-size: 44px; letter-spacing: -0.02em; }
    h2 { margin: 0 0 12px; font-size: 28px; }
    h3 { margin: 0; font-size: 20px; }
    p, li { font-size: 12px; line-height: 1.45; }
    .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .box { padding: 12px; border: 1px solid #d6d0c4; border-radius: 10px; background: #fff; }
    .kicker { margin: 0 0 4px; color: #66736d; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
    .section { min-height: 180mm; display: grid; align-content: center; }
    .shot { display: grid; grid-template-columns: 1.1fr .9fr; gap: 16px; align-items: start; }
    .shot img { width: 100%; max-height: 160mm; object-fit: contain; border: 1px solid #d6d0c4; background: #fff; }
    .details { display: grid; gap: 10px; }
    .details dl { display: grid; grid-template-columns: 92px 1fr; gap: 6px 10px; margin: 0; font-size: 11px; }
    .details dt { color: #66736d; font-weight: 700; }
    .details dd { margin: 0; }
    .verdict { border-left: 4px solid #1f7a53; }
    .small { font-size: 10px; color: #66736d; }
  </style>
</head>
<body>
  <section class="cover">
    <p class="kicker">CMP Product Architecture & Visual Journey Audit</p>
    <h1>Does CMP feel like one product?</h1>
    <p>The answer from this evidence pack: <strong>not yet</strong>. The strong product is property-first Smart Search into evidence-led action. The fragmentation comes from exposing public services, Journey OS, A-Z, portfolio tools and demo controls at the same architectural level.</p>
    <div class="meta">
      <div class="box"><p class="kicker">Screenshots</p><h3>${screenshots.length}</h3></div>
      <div class="box"><p class="kicker">Audit Date</p><h3>2026-06-16</h3></div>
      <div class="box"><p class="kicker">Best Start</p><h3>fresh=1</h3></div>
      <div class="box"><p class="kicker">Primary Spine</p><h3>Property -> Evidence -> Action</h3></div>
    </div>
  </section>
  ${orderedGroups.map((group) => {
    const rows = groupItems(group);
    if (!rows.length) return "";
    return `
      <section class="section">
        <p class="kicker">Journey Group</p>
        <h2>${esc(group)}</h2>
        <p>${esc(architectureAssessment("", group).job)}</p>
      </section>
      ${rows.map((item) => `
        <section class="shot">
          <img src="${esc(item.relativePath)}" alt="${esc(item.filename)}">
          <div class="details">
            <div class="box">
              <p class="kicker">${esc(item.group)} / ${esc(item.stage)}</p>
              <h3>${esc(item.label)}</h3>
              <p class="small">${esc(item.filename)}</p>
            </div>
            <dl class="box">
              <dt>Route</dt><dd>${esc(item.route)}</dd>
              <dt>Purpose</dt><dd>${esc(item.purpose)}</dd>
              <dt>Why</dt><dd>${esc(item.assessment.why)}</dd>
              <dt>Job</dt><dd>${esc(item.assessment.job)}</dd>
              <dt>Duplicate?</dt><dd>${esc(item.assessment.duplicate)}</dd>
              <dt>Essential?</dt><dd>${esc(item.assessment.essential)}</dd>
              <dt>Confusing?</dt><dd>${esc(item.assessment.confusion)}</dd>
              <dt>Premature?</dt><dd>${esc(item.assessment.premature)}</dd>
            </dl>
            <div class="box verdict">
              <p class="kicker">Architecture note</p>
              <p>${esc(item.assessment.merge)}</p>
            </div>
          </div>
        </section>
      `).join("")}
    `;
  }).join("")}
</body>
</html>`;
}

await mkdir(AUDIT_DIR, { recursive: true });
await writeFile(REPORT_PATH, report);
await writeFile(SUMMARY_PATH, summary);
await writeFile(PDF_HTML_PATH, visualHtml());

function normalizePlaywrightModule(module) {
  return module.chromium ? module : module.default;
}

async function findCachedNpxPlaywright() {
  const npxDir = path.join(os.homedir(), ".npm", "_npx");
  let entries = [];
  try {
    entries = await readdir(npxDir, { withFileTypes: true });
  } catch {
    return null;
  }

  const candidates = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const packagePath = path.join(npxDir, entry.name, "node_modules", "playwright", "package.json");
    try {
      const packageStat = await stat(packagePath);
      const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
      if (packageJson.version === "1.61.0") {
        candidates.push({
          packageDir: path.dirname(packagePath),
          mtimeMs: packageStat.mtimeMs
        });
      }
    } catch {
      // Ignore incomplete npm cache entries.
    }
  }

  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return candidates[0]?.packageDir || null;
}

async function loadPlaywright() {
  try {
    return normalizePlaywrightModule(await import("playwright"));
  } catch (error) {
    const cachedPlaywright = await findCachedNpxPlaywright();
    if (cachedPlaywright) {
      return normalizePlaywrightModule(await import(pathToFileURL(path.join(cachedPlaywright, "index.js")).href));
    }
    throw error;
  }
}

let pdfWritten = false;
try {
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  await page.goto(pathToFileURL(PDF_HTML_PATH).href, { waitUntil: "networkidle" });
  await page.pdf({
    path: PDF_PATH,
    format: "A4",
    landscape: true,
    printBackground: true,
    preferCSSPageSize: true
  });
  await browser.close();
  pdfWritten = true;
} catch (error) {
  console.error(`PDF generation failed: ${error.message}`);
}

console.log(JSON.stringify({
  report: path.relative(ROOT_DIR, REPORT_PATH),
  summary: path.relative(ROOT_DIR, SUMMARY_PATH),
  html: path.relative(ROOT_DIR, PDF_HTML_PATH),
  pdf: pdfWritten ? path.relative(ROOT_DIR, PDF_PATH) : null,
  screenshots: screenshots.length
}, null, 2));
