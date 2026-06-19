import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const now = "2026-06-19T10:00:00.000Z";

const bridge = require(path.join(repoRoot, "core/cmp-public-property-bridge.js"));
const derivation = require(path.join(repoRoot, "core/cmp-compliance-derivation.js"));
const scenarios = require(path.join(repoRoot, "core/cmp-scenario-definitions.js"));
const seeding = require(path.join(repoRoot, "core/cmp-scenario-seeding.js"));
const guidedSession = require(path.join(repoRoot, "core/cmp-guided-demo-session.js"));
const portfolio = require(path.join(repoRoot, "core/cmp-portfolio-derivation.js"));

const tests = [];
const auditMode = parseAuditMode(process.argv);
const keyRoutes = [
  "index.html",
  "services.html",
  "epcs.html",
  "gas-safety.html",
  "eicr.html",
  "evictions-possession.html",
  "possession-eviction-preparation.html",
  "mould-damp.html",
  "add-property.html",
  "my-properties.html",
  "dashboard-labs.html?propertyId=prop_stage12_smoke",
  "dashboard-labs.html?demo=nick",
  "dashboard-labs.html?demoScenario=no-epc-found&qa=1",
  "dashboard-labs.html?portfolioDemo=1&qa=1",
  "az-checker-v2.html",
  "dashboard.html",
];

function parseAuditMode(argv) {
  const flag = argv.find((item) => item.startsWith("--write-audit="));
  if (!flag) return "";
  const value = flag.split("=")[1];
  if (!["pre", "post"].includes(value)) {
    throw new Error("--write-audit must be pre or post");
  }
  return value;
}

function test(name, fn) {
  tests.push({ name, fn });
}

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), "utf8");
}

function changedFiles() {
  return execFileSync("git", ["diff", "--name-only", "HEAD"], { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
}

function fakeStorage(initial = {}) {
  const store = new Map(Object.entries(initial).map(([key, value]) => [key, String(value)]));
  return {
    get length() {
      return store.size;
    },
    key(index) {
      return [...store.keys()][index] ?? null;
    },
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    dump() {
      return Object.fromEntries(store.entries());
    },
  };
}

function selection(overrides = {}) {
  return {
    id: "stage12-address-1",
    uprn: "STAGE12-UPRN-1",
    address: "22 Canon Walk, York, YO1 7AA",
    postcode: "YO1 7AA",
    city: "York",
    type: "Terraced house",
    bedrooms: 3,
    storeys: 2,
    hasGas: true,
    fixedCombustion: true,
    epc: {
      rating: "C",
      currentScore: 70,
      potential: "B",
      potentialScore: 82,
      issue: "2024-04-10",
      expiry: "2034-04-10",
      certificate: "STAGE12-EPC",
      source: "Simulated EPC preview",
    },
    ...overrides,
  };
}

function journeyContext(overrides = {}) {
  return {
    entryService: "full_compliance",
    focusMode: "full_compliance",
    isTenanted: "yes",
    sourceRoute: "add-property.html",
    answeredQuestions: {},
    ...overrides,
  };
}

function createScenarioProperty(scenarioId) {
  const definition = scenarios.getScenarioDefinition(scenarioId);
  assert.equal(definition.ok, true, JSON.stringify(definition.errors || []));
  const created = seeding.createPropertyRecordFromScenario(definition.value, { now });
  assert.equal(created.ok, true, JSON.stringify(created.errors || []));
  return created.value.propertyRecord;
}

function assertNoLiveClaims(value, label) {
  assert.doesNotMatch(value, /fully compliant|legally compliant|AI confirmed|AI verified/i, `${label} contains unsafe compliance copy`);
  assert.doesNotMatch(value, new RegExp("(?<!No )supplier\\s+contacted", "i"), `${label} contains unsupported supplier-contact copy`);
  assert.doesNotMatch(value, new RegExp("(?<!No )payment\\s+taken", "i"), `${label} contains unsupported payment copy`);
  assert.doesNotMatch(value, /uploaded and stored|document stored|stored and verified/i, `${label} contains unsupported storage copy`);
}

function functionSlice(source, functionName, length = 5000) {
  const index = source.indexOf(`function ${functionName}`);
  assert.ok(index >= 0, `${functionName} not found`);
  const nextFunctionIndex = source.indexOf("\nfunction ", index + 1);
  const end = nextFunctionIndex > index ? nextFunctionIndex : index + length;
  return source.slice(index, Math.min(end, index + length));
}

async function withStaticServer(fn) {
  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, "http://127.0.0.1");
    const pathname = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
    const filePath = path.normalize(path.join(repoRoot, pathname));
    if (!filePath.startsWith(repoRoot)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    fs.readFile(filePath, (error, body) => {
      if (error) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      response.writeHead(200, { "content-type": contentType(filePath) });
      response.end(body);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

function contentType(filePath) {
  const ext = path.extname(filePath);
  return {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
  }[ext] || "application/octet-stream";
}

async function routeSmoke(routes = keyRoutes) {
  const results = [];
  await withStaticServer(async (origin) => {
    for (const route of routes) {
      const response = await fetch(`${origin}/${route}`);
      const body = await response.text();
      results.push({
        route,
        status: response.status,
        ok: response.status === 200,
        textSample: body.replace(/\s+/g, " ").slice(0, 260),
      });
    }
  });
  return results;
}

function playwrightAvailable() {
  try {
    require.resolve("playwright");
    return true;
  } catch (_error) {
    return false;
  }
}

async function writeAudit(mode) {
  const root = path.join(repoRoot, "audit/2026-06-18-cmp-stage-12-final-audit", `${mode}-polish`);
  const screenshotsDir = path.join(root, "screenshots");
  fs.mkdirSync(screenshotsDir, { recursive: true });
  const results = await routeSmoke(keyRoutes);
  const hasPlaywright = playwrightAvailable();
  const label = mode === "pre" ? "PRE_POLISH" : "POST_POLISH";
  const contactSheetPath = path.join(root, `${label}_VISUAL_CONTACT_SHEET.html`);
  const auditPath = path.join(root, `${label}_UX_AUDIT.md`);
  const issueRows = results.map((result) => {
    const status = result.ok ? "Loaded" : `HTTP ${result.status}`;
    const screenshot = hasPlaywright ? "Screenshot capture available if Playwright workflow is enabled." : "Screenshot skipped: Playwright is not installed in this repo.";
    return `<article class="audit-card"><h2>${escapeHtml(result.route)}</h2><p><strong>${status}</strong></p><div class="placeholder">${escapeHtml(screenshot)}</div><p>${escapeHtml(result.textSample)}</p></article>`;
  }).join("\n");
  fs.writeFileSync(contactSheetPath, `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CMP Stage 12 ${mode} polish contact sheet</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #172033; background: #f6f7f4; }
    h1 { margin-bottom: 8px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
    .audit-card { background: #fff; border: 1px solid #dfe4da; border-radius: 10px; padding: 16px; }
    .placeholder { min-height: 120px; border: 1px dashed #aeb7aa; border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 12px; color: #66715f; background: #fbfcfa; }
  </style>
</head>
<body>
  <h1>CMP Stage 12 ${mode} polish contact sheet</h1>
  <p>${hasPlaywright ? "Playwright is available." : "Playwright is not installed; this contact sheet records route smoke and text snapshots."}</p>
  <section class="grid">${issueRows}</section>
</body>
</html>
`);
  fs.writeFileSync(auditPath, `# CMP Stage 12 ${mode === "pre" ? "Pre" : "Post"}-Polish UX Audit

Generated: ${new Date().toISOString()}

## Screenshot Capture

${hasPlaywright ? "- Playwright is available for screenshot capture." : "- Playwright is not installed. Screenshot capture was skipped and route text snapshots were recorded instead."}

## Route Smoke

${results.map((result) => `- ${result.ok ? "PASS" : "FAIL"} ${result.route}: HTTP ${result.status}`).join("\n")}

## Audit Focus

- Product clarity across public and app routes.
- Capability-safe wording.
- Internal terminology leakage.
- Demo, scenario and portfolio route availability.
- Mobile smoke coverage by source and route availability.
`);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

test("core public and internal routes return HTTP 200", async () => {
  const results = await routeSmoke(keyRoutes);
  assert.deepEqual(results.filter((result) => !result.ok), []);
});

test("Add Property creates canonical PropertyRecord and My Properties opens by propertyId", () => {
  const storage = fakeStorage();
  const created = bridge.createOrUpdatePropertyFromSelection(selection(), {
    storage,
    journeyContext: journeyContext(),
    now,
    randomUUID: () => "stage12-flow",
  });
  assert.equal(created.ok, true, JSON.stringify(created.errors || []));
  assert.equal(created.value.property.namespace, bridge.PUBLIC_GUEST_NAMESPACE_ID);
  assert.equal(created.value.property.identity.displayAddress, "22 Canon Walk, York, YO1 7AA");
  assert.match(read("public-pages.js"), /dashboard-labs\.html\?propertyId=/);
  assert.match(read("my-properties.html"), /core\/cmp-public-property-bridge\.js/);
});

test("selected property workspace exposes canonical status, action, services, Ask CMP, reports and monitoring", () => {
  const labsHtml = read("dashboard-labs.html");
  const labsJs = read("dashboard-labs.js");
  assert.match(labsHtml, /core\/cmp-compliance-derivation\.js/);
  assert.match(labsHtml, /core\/cmp-service-lifecycle\.js/);
  assert.match(labsHtml, /core\/cmp-ask-context\.js/);
  assert.match(labsJs, /renderSelectedCanonicalWorkspaceShell/);
  assert.match(labsJs, /data-canonical-next-action/);
  assert.match(labsJs, /data-canonical-service-request/);
  assert.match(labsJs, /data-canonical-ask-panel/);
  assert.match(labsJs, /data-canonical-report-panel/);
  assert.match(labsJs, /data-canonical-monitoring-preview/);
});

test("normal public and selected-workspace copy uses safe Stage 12 terminology", () => {
  const publicPages = read("public-pages.js");
  const labsHtml = read("dashboard-labs.html");
  const labsJs = read("dashboard-labs.js");
  const selectedWorkspace = [
    functionSlice(labsJs, "renderSelectedCanonicalWorkspaceShell", 9000),
    functionSlice(labsJs, "renderCanonicalAskReportPanel", 7000),
    functionSlice(labsJs, "renderPortfolioHomeState", 7000),
  ].join("\n");
  assert.doesNotMatch(publicPages, /From postcode to fully compliant|A-Z compliance checker|We don.t just make you compliant/i);
  assert.doesNotMatch(labsHtml, /Civic Property Intelligence OS|data-global-nav="Journey OS"|>Book a service<|Open Book a service|Use Book a service|Journey OS simulation|Journey OS engine|Journey OS guided demo/i);
  assert.doesNotMatch(selectedWorkspace, /Journey OS|labsState|fixture|debug|raw state|state=\*/i);
  assertNoLiveClaims(publicPages, "public-pages.js");
  assertNoLiveClaims(labsHtml, "dashboard-labs.html");
  assertNoLiveClaims(selectedWorkspace, "canonical selected workspace");
});

test("demo and scenario flows use canonical scenario properties without 57 The Butts fallback", () => {
  const demoStore = bridge.createEmptyStore(scenarios.DEMO_SCENARIO_NAMESPACE, { now });
  const session = guidedSession.createGuidedDemoSession(demoStore, { now });
  assert.equal(session.ok, true, JSON.stringify(session.errors || []));
  assert.equal(session.value.namespaceId, scenarios.DEMO_SCENARIO_NAMESPACE);
  assert.equal(session.value.scenarioId, "standard-first-property");
  assert.doesNotMatch(session.value.property.identity.displayAddress, /57 The Butts/i);
  const noEpc = createScenarioProperty("no-epc-found");
  const derived = derivation.derivePropertyComplianceState(noEpc, { now });
  assert.equal(derived.ok, true, JSON.stringify(derived.errors || []));
  const noEpcText = JSON.stringify(noEpc);
  assert.doesNotMatch(noEpcText, /epcRating|epcPotential|epcExpiry|EPC-derived heating/i);
  assert.ok(derived.value.issues.some((issue) => issue.category === "epc"));
});

test("portfolio states protect single-property users and derive multi-property summary from canonical records", () => {
  const one = portfolio.derivePortfolioIntelligence([createScenarioProperty("standard-first-property")], { now });
  assert.equal(one.ok, true, JSON.stringify(one.errors || []));
  assert.equal(one.value.state, "one_property");
  assert.equal(one.value.portfolioToolsVisible, false);

  const multi = portfolio.derivePortfolioIntelligence([
    createScenarioProperty("standard-first-property"),
    createScenarioProperty("missing-gas-evidence"),
    createScenarioProperty("missing-eicr-evidence"),
  ], { now });
  assert.equal(multi.ok, true, JSON.stringify(multi.errors || []));
  assert.equal(multi.value.state, "multi_property");
  assert.equal(multi.value.portfolioToolsVisible, true);
  assert.ok(multi.value.summary.evidenceGapCount > 0);
  assert.ok(multi.value.rankedProperties.length >= 3);
});

test("mobile and visual-system source has responsive hooks without broad route rewrites", () => {
  const landingCss = read("landing.css");
  const labsCss = read("dashboard-labs.css");
  assert.match(landingCss, /@media\s*\(max-width:\s*(?:760|768|780|820|900)px\)/);
  assert.match(labsCss, /@media\s*\(max-width:\s*(?:760|768|780|820|900|980)px\)/);
  const diff = execFileSync("git", ["diff", "HEAD"], { cwd: repoRoot, encoding: "utf8" });
  assert.doesNotMatch(diff, /^\+.*\/app\//m);
  assert.doesNotMatch(diff, /^\+.*Netlify rewrite/im);
  assert.doesNotMatch(diff, /^\+.*(?:localStorage\.clear|sessionStorage\.clear|fetch\(|XMLHttpRequest|OpenAI|api\.openai)/m);
});

test("Stage 12 changes stay within final visual/audit scope", () => {
  const allowed = new Set([
    "public-pages.js",
    "landing.css",
    "dashboard-labs.html",
    "dashboard-labs.js",
    "dashboard-labs.css",
    "tools/cmp-stage-12-final-audit-check.mjs",
  ]);
  const changed = changedFiles().filter((file) => !file.startsWith("audit/"));
  assert.deepEqual(changed.filter((file) => !allowed.has(file)), []);
});

if (auditMode) {
  await writeAudit(auditMode);
}

for (const { name, fn } of tests) {
  try {
    await fn();
  } catch (error) {
    console.error(`Stage 12 check failed: ${name}`);
    throw error;
  }
}

console.log(`CMP Stage 12 final audit check passed (${tests.length} assertions).${auditMode ? ` Wrote ${auditMode}-polish audit output.` : ""}`);
