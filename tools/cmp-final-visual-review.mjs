#!/usr/bin/env node
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import os from "node:os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const AUDIT_DIR = path.join(ROOT_DIR, "audit", "2026-06-16-cmp-final-demo");
const SCREENSHOT_DIR = path.join(AUDIT_DIR, "screenshots");
const SHEET_DIR = path.join(AUDIT_DIR, "contact-sheets");
const PDF_PATH = path.join(AUDIT_DIR, "CMP_FINAL_VISUAL_REVIEW.pdf");
const READY_PATH = path.join(AUDIT_DIR, "READY_FOR_NICK.md");
const FINAL_ISSUES_PATH = path.join(AUDIT_DIR, "final-issues.json");

const data = JSON.parse(await readFile(path.join(AUDIT_DIR, "issues.json"), "utf8"));
const scenarioData = JSON.parse(await readFile(path.join(AUDIT_DIR, "scenario-issues.json"), "utf8"));
const pages = data.pages || [];
const issues = data.issues || [];
const scenarios = scenarioData.scenarios || [];
const pageByScreenshot = new Map(pages.map((page) => [page.screenshot, page]));

const sheets = [
  {
    file: "01-nick-entry.jpg",
    title: "Nick Entry",
    purpose: "Validate the one-link entry, alias route, prototype framing and scenario explorer entry point.",
    screenshots: [
      "screenshots/14-desktop-nick-demo.png",
      "screenshots/15-desktop-nick-demo-alias.png",
      "screenshots/34-desktop-nick-scenario-clean-property-check-start.png",
      "screenshots/64-desktop-nick-scenario-portfolio-landlord-preview-start.png"
    ]
  },
  {
    file: "02-main-guided-journey.jpg",
    title: "Main Guided Journey",
    purpose: "Follow the core story: add property, Smart Search, review found data, confirm unknowns and create the workspace.",
    screenshots: [
      "screenshots/25-desktop-public-add-property-prefilled.png",
      "screenshots/26-desktop-public-add-property-results.png",
      "screenshots/27-desktop-public-add-property-handoff.png",
      "screenshots/29-desktop-new-property-review-smart-search.png",
      "screenshots/35-desktop-nick-scenario-clean-property-check-workspace.png"
    ]
  },
  {
    file: "03-scenarios.jpg",
    title: "Scenario Explorer",
    purpose: "Check that every post-demo scenario starts clearly and follows the same product spine.",
    screenshots: [
      "screenshots/34-desktop-nick-scenario-clean-property-check-start.png",
      "screenshots/39-desktop-nick-scenario-no-epc-found-start.png",
      "screenshots/44-desktop-nick-scenario-epc-expired-mees-risk-start.png",
      "screenshots/49-desktop-nick-scenario-hmo-licensing-risk-start.png",
      "screenshots/54-desktop-nick-scenario-damp-mould-enforcement-start.png",
      "screenshots/59-desktop-nick-scenario-done-for-me-plan-start.png",
      "screenshots/64-desktop-nick-scenario-portfolio-landlord-preview-start.png"
    ]
  },
  {
    file: "04-evidence-actions-ask-monitor.jpg",
    title: "Evidence, Actions, Ask CMP, Monitoring",
    purpose: "Verify CMP feels evidence-led and action-oriented rather than a generic service marketplace or magical AI demo.",
    screenshots: [
      "screenshots/30-desktop-one-property-evidence-vault.png",
      "screenshots/31-desktop-one-property-book-service.png",
      "screenshots/32-desktop-one-property-ask-cmp.png",
      "screenshots/36-desktop-nick-scenario-clean-property-check-evidence.png",
      "screenshots/37-desktop-nick-scenario-clean-property-check-ask.png",
      "screenshots/38-desktop-nick-scenario-clean-property-check-monitoring.png"
    ]
  },
  {
    file: "05-mobile-smoke.jpg",
    title: "Mobile Smoke",
    purpose: "Check the 390px entry, CTA reachability, mobile navigation and core dashboard surfaces.",
    screenshots: [
      "screenshots/72-mobile-nick-demo.png",
      "screenshots/79-mobile-empty-add-property-modal.png",
      "screenshots/80-mobile-new-property-review-smart-search.png",
      "screenshots/81-mobile-one-property-evidence-vault.png",
      "screenshots/82-mobile-one-property-book-service.png",
      "screenshots/83-mobile-one-property-ask-cmp.png",
      "screenshots/86-mobile-mobile-dashboard-menu.png",
      "screenshots/87-mobile-mobile-dashboard-evidence.png"
    ]
  }
];

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizePlaywrightModule(module) {
  return module.chromium ? module : module.default;
}

async function findCachedNpxPlaywright() {
  const npxDir = path.join(os.homedir(), ".npm", "_npx");
  let entries = [];
  try {
    entries = await import("node:fs/promises").then(({ readdir }) => readdir(npxDir, { withFileTypes: true }));
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
        candidates.push({ packageDir: path.dirname(packagePath), mtimeMs: packageStat.mtimeMs });
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
  } catch {
    const cachedPlaywright = await findCachedNpxPlaywright();
    if (!cachedPlaywright) {
      throw new Error("Playwright is not available. Run this after `npm exec --package=playwright@1.61.0` has populated the local npx cache.");
    }
    return normalizePlaywrightModule(await import(pathToFileURL(path.join(cachedPlaywright, "index.js")).href));
  }
}

function screenshotMeta(relativePath) {
  const page = pageByScreenshot.get(relativePath);
  return {
    filename: path.basename(relativePath),
    label: page?.label || relativePath.replace(/^screenshots\//, "").replace(/^\d+-/, "").replace(/-/g, " ").replace(/\.png$/, ""),
    path: page?.path || "(interaction capture)",
    h1: page?.h1 || "",
    flags: [
      page?.horizontalOverflow ? "horizontal overflow" : "",
      page?.pageErrors?.length ? "runtime error" : "",
      page?.consoleMessages?.length ? `${page.consoleMessages.length} console message(s)` : ""
    ].filter(Boolean).join(", ")
  };
}

function sheetHtml(sheet, { pdf = false } = {}) {
  const cards = sheet.screenshots.map((relativePath) => {
    const meta = screenshotMeta(relativePath);
    const imagePath = pathToFileURL(path.join(AUDIT_DIR, relativePath)).href;
    return `
      <article>
        <img src="${imagePath}" alt="${esc(meta.label)}">
        <div>
          <strong>${esc(meta.label)}</strong>
          <span>${esc(meta.filename)}</span>
          <small>${esc(meta.path)}${meta.flags ? ` · ${esc(meta.flags)}` : ""}</small>
        </div>
      </article>
    `;
  }).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #f4f0e8; color: #172033; font-family: Arial, sans-serif; }
    .sheet { width: ${pdf ? "1120px" : "1600px"}; min-height: ${pdf ? "790px" : "1200px"}; padding: 36px; background: #f7f4ee; }
    header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-end; margin-bottom: 22px; border-bottom: 2px solid #d8d0c1; padding-bottom: 18px; }
    h1 { margin: 0; font-size: ${pdf ? "26px" : "34px"}; letter-spacing: 0; }
    p { margin: 8px 0 0; color: #596273; font-size: ${pdf ? "12px" : "16px"}; line-height: 1.4; max-width: 900px; }
    .verdict { border: 1px solid #b7ad99; border-radius: 8px; padding: 10px 12px; background: #fff; color: #2f493f; font-weight: 700; white-space: nowrap; }
    main { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: ${pdf ? "12px" : "18px"}; }
    article { overflow: hidden; border: 1px solid #ddd4c6; border-radius: 8px; background: #fff; }
    img { display: block; width: 100%; height: ${pdf ? "210px" : "330px"}; object-fit: contain; object-position: top; background: white; border-bottom: 1px solid #ece4d6; }
    article div { padding: ${pdf ? "8px 10px" : "12px 14px"}; }
    strong { display: block; font-size: ${pdf ? "12px" : "16px"}; margin-bottom: 4px; }
    span, small { display: block; color: #657085; font-size: ${pdf ? "9px" : "12px"}; line-height: 1.35; }
  </style>
</head>
<body>
  <section class="sheet">
    <header>
      <div>
        <h1>${esc(sheet.title)}</h1>
        <p>${esc(sheet.purpose)}</p>
      </div>
      <div class="verdict">CMP final visual review</div>
    </header>
    <main>${cards}</main>
  </section>
</body>
</html>`;
}

async function renderContactSheets(browser) {
  await mkdir(SHEET_DIR, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 });
  for (const sheet of sheets) {
    await page.setContent(sheetHtml(sheet), { waitUntil: "load" });
    await page.waitForTimeout(250);
    await page.screenshot({
      path: path.join(SHEET_DIR, sheet.file),
      type: "jpeg",
      quality: 64,
      fullPage: true,
      animations: "disabled"
    });
  }
  await page.close();
}

async function renderPdf(browser) {
  const page = await browser.newPage({ viewport: { width: 1120, height: 790 }, deviceScaleFactor: 1 });
  const imagePages = (await Promise.all(sheets.map(async (sheet) => {
    const imageBuffer = await readFile(path.join(SHEET_DIR, sheet.file));
    const src = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
    return `<section class="pdf-page"><img src="${src}" alt="${esc(sheet.title)}"></section>`;
  }))).join("");
  await page.setContent(`<!doctype html>
<html><head><meta charset="utf-8"><style>
  @page { size: A4 landscape; margin: 8mm; }
  body { margin: 0; background: white; }
  .pdf-page { break-after: page; page-break-after: always; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
  .pdf-page:last-child { break-after: auto; page-break-after: auto; }
  img { max-width: 100%; max-height: 100%; object-fit: contain; }
</style></head><body>${imagePages}</body></html>`, { waitUntil: "load" });
  await page.pdf({ path: PDF_PATH, format: "A4", landscape: true, printBackground: true, margin: { top: "8mm", right: "8mm", bottom: "8mm", left: "8mm" } });
  await page.close();
}

function scenarioLine(item) {
  return `- ${item.label}: starts ${item.startsCorrectly ? "yes" : "no"}; action ${item.reachesAction ? "yes" : "no"}; evidence/service ${item.reachesEvidence ? "yes" : "no"}; Ask CMP ${item.reachesAskCmp ? "yes" : "no"}; monitoring ${item.reachesMonitoring ? "yes" : "no"}${item.confusingOrFake ? `; caveat: ${item.confusingOrFake}` : ""}.`;
}

function buildReadyMarkdown(pdfSizeMb) {
  const issueLines = issues.map((issue, index) => `${index + 1}. ${issue.severity}: ${issue.title} (${issue.where})`).join("\n");
  return `# Ready For Nick

Generated: 2026-06-16

## Verdict

Ready with caveats.

Confidence: 8/10.

CMP now feels like one coherent property-first product when Nick starts at the guided demo link. The route explains the prototype, starts with a property, shows Smart Search, separates found data from unknowns, turns gaps into evidence/actions/services, and finishes with Ask CMP plus monitoring.

## Exact Link

\`dashboard-labs.html?demo=nick\`

Alias checked by the journey audit:

\`dashboard-labs.html?journeyDemo=nick\`

## What David Should Show Live

1. Open \`dashboard-labs.html?demo=nick\`.
2. Read the prototype framing briefly.
3. Click \`Run the 2-minute demo\`.
4. Follow the guided story through Smart Search, found data, unknowns, Action Plan, Evidence Vault, service action, Ask CMP and Monitoring.
5. Only then show Scenario Explorer, starting with \`Clean property\` or \`Damp, mould or enforcement\`.

## Scenario Matrix

${scenarios.map(scenarioLine).join("\n")}

## Top Remaining Risks

${issueLines || "No issues recorded by the final journey audit."}

Additional human judgement:

1. Prototype-only features still need spoken framing.
2. Avoid the \`No EPC found\` scenario unless Nick specifically asks about missing public records.
3. Do not free-click into old dashboard routes, advanced/debug routes or portfolio sweep before the main story lands.
4. Public service pages are available, but they are not the strongest first route.
5. Scenario Explorer is safe after the guided demo, not as the opening experience.

## Avoid Clicking

- \`dashboard.html\`
- \`?advanced=1\`
- \`?debug=1\`
- Raw scenario/debug controls
- Portfolio Sweep before the one-property story is understood
- Public service catalogue as the first demo route

## Final Visual Pack

- PDF: \`audit/2026-06-16-cmp-final-demo/CMP_FINAL_VISUAL_REVIEW.pdf\` (${pdfSizeMb.toFixed(2)} MB)
- Contact sheets: \`audit/2026-06-16-cmp-final-demo/contact-sheets/\`
- Final issues JSON: \`audit/2026-06-16-cmp-final-demo/final-issues.json\`

## Caveat Script

"This is prototype mode using simulated data. Smart Search, Ask CMP, scoring, supplier booking, evidence updates and monitoring are here to test the landlord journey. No live lookup, supplier booking, payment, document storage or legal advice is happening."
`;
}

async function writeReadyFiles() {
  const pdfStat = await stat(PDF_PATH);
  const pdfSizeMb = pdfStat.size / 1024 / 1024;
  const verdict = {
    generated: "2026-06-16",
    verdict: "Ready with caveats",
    confidence: 8,
    nickLink: "dashboard-labs.html?demo=nick",
    liveRoute: "dashboard-labs.html?demo=nick -> Run the 2-minute demo",
    canSelfExploreScenarios: "Yes, after the guided demo. Avoid starting with No EPC found.",
    prototypeCaveatsVisibleEnough: true,
    feelsLikeOneProduct: true,
    pdf: {
      path: "audit/2026-06-16-cmp-final-demo/CMP_FINAL_VISUAL_REVIEW.pdf",
      sizeMb: Number(pdfSizeMb.toFixed(2)),
      under15Mb: pdfSizeMb < 15
    },
    contactSheets: sheets.map((sheet) => `audit/2026-06-16-cmp-final-demo/contact-sheets/${sheet.file}`),
    remainingIssues: issues,
    scenarios
  };
  await writeFile(FINAL_ISSUES_PATH, `${JSON.stringify(verdict, null, 2)}\n`);
  await writeFile(READY_PATH, buildReadyMarkdown(pdfSizeMb));
  return verdict;
}

await mkdir(AUDIT_DIR, { recursive: true });
await mkdir(SCREENSHOT_DIR, { recursive: true });
const { chromium } = await loadPlaywright();
const browser = await chromium.launch({ headless: true });
try {
  await renderContactSheets(browser);
  await renderPdf(browser);
} finally {
  await browser.close();
}

const verdict = await writeReadyFiles();
console.log(JSON.stringify({
  status: "completed",
  verdict: verdict.verdict,
  confidence: verdict.confidence,
  pdf: verdict.pdf,
  contactSheets: verdict.contactSheets.length,
  finalIssues: "audit/2026-06-16-cmp-final-demo/final-issues.json",
  readyReport: "audit/2026-06-16-cmp-final-demo/READY_FOR_NICK.md"
}, null, 2));
