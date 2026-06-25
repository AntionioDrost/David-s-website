#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

const requiredDocs = [
  "docs/CMP_NORTH_STAR_PRODUCT_SPEC.md",
  "docs/CMP_TERMINOLOGY_CONTRACT.md",
  "docs/CMP_ROUTE_CONTRACTS.md",
  "docs/CMP_CANONICAL_DOMAIN_MODEL.md",
  "docs/CMP_STATE_OWNERSHIP_AND_DERIVATION.md",
  "docs/CMP_CAPABILITY_STATUS_AND_COPY.md",
  "docs/CMP_TRANSITIONAL_ADAPTER_SPEC.md",
  "docs/CMP_ARCHITECTURE_DECISIONS.md",
];

const requiredJson = [
  "contracts/cmp-route-contracts.json",
  "contracts/property-record.schema.json",
  "contracts/scenario-definition.schema.json",
  "contracts/service-request.schema.json",
];

const requiredEntities = [
  "PropertyRecord",
  "PropertyIdentity",
  "SourceReference",
  "SmartCheckResult",
  "LandlordAnswer",
  "Issue",
  "EvidenceItem",
  "ActionItem",
  "ServiceIntentDraft",
  "ServiceRequest",
  "TimelineEvent",
  "MonitoringItem",
  "AskCmpContext",
  "ReportRecord",
  "ScenarioDefinition",
];

const northStarStages = [
  "Add Property",
  "Smart Checks",
  "Review Found Data",
  "Answer Unknowns",
  "Property Brain",
  "Compliance Analysis",
  "Next Best Action",
  "Evidence",
  "Service",
  "Ask CMP",
  "Report",
  "Monitoring",
  "Portfolio Intelligence",
];

const requiredEnumValues = [
  "official",
  "local_authority",
  "user_stated",
  "document_extracted",
  "supplier_confirmed",
  "cmp_history",
  "inferred",
  "missing",
  "unknown",
  "high",
  "medium",
  "low",
  "held",
  "expired",
  "unverified",
  "needs_review",
  "accepted",
  "open",
  "awaiting_evidence",
  "in_progress",
  "resolved",
  "deferred",
  "recommended",
  "queued",
  "completed",
  "dismissed",
  "draft",
  "quote_requested",
  "quote_received",
  "awaiting_payment",
  "booked",
  "evidence_received",
  "closed",
  "simulated",
  "live",
];

const allowedChangedPaths = [
  /^core\//,
  /^docs\//,
  /^contracts\//,
  /^tools\/cmp-stage-2-contract-check\.mjs$/,
  /^tools\/cmp-stage-3-property-store-check\.mjs$/,
];

const failures = [];

function repoPath(filePath) {
  return path.join(root, filePath);
}

function readText(filePath) {
  return fs.readFileSync(repoPath(filePath), "utf8");
}

function requireFile(filePath) {
  const absolute = repoPath(filePath);
  if (!fs.existsSync(absolute)) {
    failures.push(`Missing required file: ${filePath}`);
    return false;
  }

  const stat = fs.statSync(absolute);
  if (!stat.isFile()) {
    failures.push(`Required path is not a file: ${filePath}`);
    return false;
  }

  if (stat.size === 0) {
    failures.push(`Required file is empty: ${filePath}`);
    return false;
  }

  return true;
}

function parseJson(filePath) {
  if (!requireFile(filePath)) return null;
  try {
    return JSON.parse(readText(filePath));
  } catch (error) {
    failures.push(`Invalid JSON in ${filePath}: ${error.message}`);
    return null;
  }
}

function assertIncludes(filePath, content, terms, label = "required text") {
  for (const term of terms) {
    if (!content.includes(term)) {
      failures.push(`${filePath} is missing ${label}: ${term}`);
    }
  }
}

function assertSchema(filePath) {
  const schema = parseJson(filePath);
  if (!schema) return;
  if (!schema.$schema) failures.push(`${filePath} is missing $schema`);
  if (!schema.title) failures.push(`${filePath} is missing title`);
  if (schema.type !== "object") failures.push(`${filePath} must define an object schema`);
}

for (const doc of requiredDocs) {
  requireFile(doc);
}

for (const jsonFile of requiredJson) {
  parseJson(jsonFile);
}

for (const schemaPath of requiredJson.filter((filePath) => filePath.endsWith(".schema.json"))) {
  assertSchema(schemaPath);
}

if (fs.existsSync(repoPath("docs/CMP_NORTH_STAR_PRODUCT_SPEC.md"))) {
  const spec = readText("docs/CMP_NORTH_STAR_PRODUCT_SPEC.md");
  assertIncludes("docs/CMP_NORTH_STAR_PRODUCT_SPEC.md", spec, northStarStages, "North Star journey stage");
  if (!/rules engine/i.test(spec) || !/AI does not independently determine legal compliance/i.test(spec)) {
    failures.push("North Star spec must distinguish rules-engine decisions from AI assistance");
  }
}

if (fs.existsSync(repoPath("docs/CMP_TERMINOLOGY_CONTRACT.md"))) {
  const terminology = readText("docs/CMP_TERMINOLOGY_CONTRACT.md");
  if (!/Property Brain[\s\S]*user-facing/i.test(terminology)) {
    failures.push("Terminology contract must define Property Brain as user-facing language");
  }
  if (!/PropertyRecord[\s\S]*technical root entity/i.test(terminology)) {
    failures.push("Terminology contract must define PropertyRecord as the technical root entity");
  }
}

if (fs.existsSync(repoPath("docs/CMP_CANONICAL_DOMAIN_MODEL.md"))) {
  const model = readText("docs/CMP_CANONICAL_DOMAIN_MODEL.md");
  assertIncludes("docs/CMP_CANONICAL_DOMAIN_MODEL.md", model, requiredEntities, "canonical entity");
}

if (fs.existsSync(repoPath("contracts/cmp-route-contracts.json"))) {
  const routeContracts = parseJson("contracts/cmp-route-contracts.json");
  if (routeContracts) {
    for (const key of ["currentTransitionalRoutes", "futureCanonicalRoutes", "redirectAliases", "routeInvariants"]) {
      if (!Array.isArray(routeContracts[key]) || routeContracts[key].length === 0) {
        failures.push(`contracts/cmp-route-contracts.json must include non-empty ${key}`);
      }
    }

    const routeContractsString = JSON.stringify(routeContracts);
    for (const route of ["index.html", "services.html", "add-property.html", "my-properties.html", "dashboard-labs.html", "/app/properties", "/app/properties/:propertyId"]) {
      if (!routeContractsString.includes(route)) {
        failures.push(`Route contract is missing ${route}`);
      }
    }

    if (!routeContractsString.includes("noncanonical") || !routeContractsString.includes("bare Labs")) {
      failures.push("Route contract must mark bare Labs workspace as transitional/noncanonical");
    }
  }
}

const schemaText = requiredJson
  .filter((filePath) => fs.existsSync(repoPath(filePath)))
  .map((filePath) => readText(filePath))
  .join("\n");

for (const enumValue of requiredEnumValues) {
  if (!schemaText.includes(`"${enumValue}"`)) {
    failures.push(`Required enum value is missing from JSON schemas/contracts: ${enumValue}`);
  }
}

try {
  // Historical Stage 2 scope is pinned to the contract commit. Cumulative
  // regression runs still validate current files through the assertions above.
  const changed = execFileSync("git", ["diff-tree", "--no-commit-id", "--name-only", "-r", "0c6c79f"], { cwd: root, encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const filePath of changed) {
    if (!allowedChangedPaths.some((pattern) => pattern.test(filePath))) {
      failures.push(`Product or disallowed file changed during Stage 2: ${filePath}`);
    }
  }
} catch (error) {
  failures.push(`Unable to inspect historical git scope: ${error.message}`);
}

if (failures.length) {
  console.error("CMP Stage 2 contract check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("CMP Stage 2 contract check passed.");
