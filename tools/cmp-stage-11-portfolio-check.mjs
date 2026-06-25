import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const bridge = require(path.join(repoRoot, "core/cmp-public-property-bridge.js"));
const derivation = require(path.join(repoRoot, "core/cmp-compliance-derivation.js"));
const scenarios = require(path.join(repoRoot, "core/cmp-scenario-definitions.js"));
const seeding = require(path.join(repoRoot, "core/cmp-scenario-seeding.js"));
const portfolio = require(path.join(repoRoot, "core/cmp-portfolio-derivation.js"));
const portfolioActions = require(path.join(repoRoot, "core/cmp-portfolio-actions.js"));

const tests = [];
const now = "2026-06-19T10:00:00.000Z";

function test(name, fn) {
  tests.push({ name, fn });
}

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), "utf8");
}

function changedFiles() {
  // Historical Stage 11 scope is pinned to its commit range; functional checks
  // below still read the current cumulative branch.
  return execFileSync("git", ["diff", "--name-only", "464140a..48708a2"], { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
}

function createScenarioProperty(scenarioId) {
  const definition = scenarios.getScenarioDefinition(scenarioId);
  assert.equal(definition.ok, true, JSON.stringify(definition.errors || []));
  const created = seeding.createPropertyRecordFromScenario(definition.value, { now });
  assert.equal(created.ok, true, JSON.stringify(created.errors || []));
  return created.value.propertyRecord;
}

function derive(records) {
  const result = portfolio.derivePortfolioIntelligence(records, { now });
  assert.equal(result.ok, true, JSON.stringify(result.errors || []));
  return result.value;
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
      response.writeHead(200);
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

test("core portfolio derivation handles empty, one and multi states", () => {
  const empty = derive([]);
  assert.equal(empty.state, "empty");
  assert.equal(empty.propertyCount, 0);
  assert.deepEqual(empty.rankedProperties, []);

  const one = derive([createScenarioProperty("standard-first-property")]);
  assert.equal(one.state, "one_property");
  assert.equal(one.propertyCount, 1);
  assert.equal(one.portfolioToolsVisible, false);
  assert.ok(one.items[0].derivedState);
  assert.ok(one.items[0].nextBestAction);

  const multi = derive([
    createScenarioProperty("standard-first-property"),
    createScenarioProperty("missing-gas-evidence"),
  ]);
  assert.equal(multi.state, "multi_property");
  assert.equal(multi.propertyCount, 2);
  assert.equal(multi.portfolioToolsVisible, true);
  assert.ok(Number.isInteger(multi.summary.evidenceGapCount));
  assert.ok(Number.isInteger(multi.summary.lowConfidencePropertyCount));
});

test("portfolio ranking uses explicit risk signals rather than array order", () => {
  const lowEpc = createScenarioProperty("low-epc-improvement");
  const gasGap = createScenarioProperty("missing-gas-evidence");
  const ranked = derive([lowEpc, gasGap]);
  assert.equal(ranked.rankedProperties[0].propertyId, gasGap.id);
  assert.match(ranked.rankedProperties[0].priorityExplanation, /because/i);
  assert.ok(ranked.rankedProperties[0].portfolioPriorityScore > ranked.rankedProperties[1].portfolioPriorityScore);

  const eicr = createScenarioProperty("missing-eicr-evidence");
  const standard = createScenarioProperty("standard-first-property");
  assert.equal(derive([standard, eicr]).rankedProperties[0].propertyId, eicr.id);

  const condition = createScenarioProperty("damp-mould-concern");
  assert.equal(derive([standard, condition]).rankedProperties[0].propertyId, condition.id);
});

test("portfolio sweep, service opportunities and report preview are safe", () => {
  const intelligence = derive([
    createScenarioProperty("missing-gas-evidence"),
    createScenarioProperty("missing-eicr-evidence"),
    createScenarioProperty("damp-mould-concern"),
  ]);
  assert.ok(intelligence.sweepItems.length >= 3);
  assert.ok(intelligence.serviceOpportunities.length >= 2);
  assert.match(intelligence.topPortfolioAction.reason, /Based on current information/i);
  const intelligenceText = JSON.stringify(intelligence);
  assert.doesNotMatch(intelligenceText, /fully compliant|legally compliant|AI confirmed|uploaded and stored/i);
  assert.doesNotMatch(intelligenceText, new RegExp("(?<!No )supplier\\s+contacted", "i"));
  assert.doesNotMatch(intelligenceText, new RegExp("(?<!No )payment\\s+taken", "i"));

  const report = portfolioActions.createPortfolioReportPreview(intelligence, "portfolio_summary", { now });
  assert.equal(report.ok, true, JSON.stringify(report.errors || []));
  assert.match(report.value.title, /Portfolio Summary/i);
  assert.match(report.value.caveat, /Guidance, not legal advice/i);
  assert.equal(report.value.capabilityStatus, "simulated");
});

test("demo portfolio seeding uses demo namespace and preserves guest store", () => {
  const guestStore = bridge.createEmptyStore(bridge.PUBLIC_GUEST_NAMESPACE_ID, { now });
  guestStore.propertiesById.guest_property = { id: "guest_property" };
  guestStore.propertyOrder.push("guest_property");

  const demoStore = bridge.createEmptyStore(scenarios.DEMO_SCENARIO_NAMESPACE, { now });
  const seeded = seeding.seedScenarioSet(demoStore, ["standard-first-property", "no-epc-found", "missing-gas-evidence"], { now });
  assert.equal(seeded.ok, true, JSON.stringify(seeded.errors || []));
  assert.equal(seeded.value.store.namespaceId, scenarios.DEMO_SCENARIO_NAMESPACE);
  assert.equal(seeded.value.properties.length, 3);
  assert.equal(seeded.value.store.propertyOrder.length, 3);
  assert.deepEqual(guestStore.propertyOrder, ["guest_property"]);
  assert.equal(seeded.value.properties.some((record) => /57 The Butts/i.test(record.identity?.displayAddress || "")), false);
});

test("product wiring exposes canonical portfolio modes without broad route or storage changes", () => {
  const myPropertiesHtml = read("my-properties.html");
  const labsHtml = read("dashboard-labs.html");
  const publicPages = read("public-pages.js");
  const labs = read("dashboard-labs.js");
  assert.ok(myPropertiesHtml.includes("core/cmp-portfolio-derivation.js"));
  assert.ok(labsHtml.includes("core/cmp-portfolio-derivation.js"));
  assert.ok(labsHtml.includes("core/cmp-portfolio-actions.js"));
  assert.match(publicPages, /derivePortfolioIntelligence/);
  assert.match(publicPages, /dashboard-labs\.html\?portfolio=guest/);
  assert.match(labs, /portfolioDemo/);
  assert.match(labs, /qa"\)\s*===\s*"1"/);
  assert.match(labs, /hydrateCanonicalPortfolioMode/);
  assert.doesNotMatch(labs, /portfolioDemo=1[\s\S]{0,700}(?:localStorage\.clear|sessionStorage\.clear|removeItem\()/);
});

test("stage isolation stays within allowed files and routes load", async () => {
  const forbidden = [
    "index.html",
    "services.html",
    "add-property.html",
    "app.js",
    "az-checker-v2.js",
    "netlify.toml",
  ];
  assert.deepEqual(changedFiles().filter((file) => forbidden.includes(file)), []);
  const diff = execFileSync("git", ["diff", "HEAD"], { cwd: repoRoot, encoding: "utf8" });
  assert.doesNotMatch(diff, /^.*\+.*(?:\/app\/|Netlify rewrite|localStorage\.clear|sessionStorage\.clear|fetch\(|XMLHttpRequest|OpenAI|api\.openai)/m);
  assert.doesNotMatch(diff, /^\+.*(?:fully compliant|legally compliant|AI confirmed|Uploaded and stored)/im);
  assert.doesNotMatch(diff, new RegExp("^\\+.*(?<!No )supplier\\s+contacted", "im"));
  assert.doesNotMatch(diff, new RegExp("^\\+.*(?<!No )payment\\s+taken", "im"));

  await withStaticServer(async (origin) => {
    for (const route of [
      "/my-properties.html",
      "/dashboard-labs.html?portfolio=guest",
      "/dashboard-labs.html?portfolioDemo=1&qa=1",
      "/dashboard-labs.html?propertyId=prop_stage11_smoke",
      "/dashboard-labs.html?demo=nick&qa=1",
      "/dashboard-labs.html?demoScenario=no-epc-found&qa=1",
      "/az-checker-v2.html",
      "/dashboard.html",
    ]) {
      const response = await fetch(`${origin}${route}`);
      assert.equal(response.status, 200, `${route} should return HTTP 200`);
    }
  });
});

for (const { name, fn } of tests) {
  try {
    await fn();
  } catch (error) {
    console.error(`Stage 11 check failed: ${name}`);
    throw error;
  }
}

console.log(`CMP Stage 11 portfolio check passed (${tests.length} assertions).`);
