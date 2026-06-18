"use strict";

const crypto = require("node:crypto");

let fallbackCounter = 0;

function sanitizeIdPart(value) {
  return String(value || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "") || "unknown";
}

function stableHash(value) {
  return crypto
    .createHash("sha256")
    .update(typeof value === "string" ? value : JSON.stringify(value || {}))
    .digest("hex")
    .slice(0, 16);
}

function createCanonicalId(prefix = "prop", options = {}) {
  const uuidSource = options.randomUUID
    || globalThis.crypto?.randomUUID?.bind(globalThis.crypto)
    || crypto.randomUUID?.bind(crypto);
  const rawId = uuidSource ? uuidSource() : `fallback-${Date.now()}-${fallbackCounter += 1}`;
  return `${sanitizeIdPart(prefix)}_${rawId}`;
}

function createImportedId(sourceType, sourceRecordId, fallbackValue = null) {
  const source = sanitizeIdPart(sourceType).replace(/-/g, "_");
  const stablePart = sourceRecordId
    ? sanitizeIdPart(sourceRecordId)
    : `missing-${stableHash(fallbackValue || sourceType)}`;
  return `legacy_${source}_${stablePart}`;
}

function createMigrationKey(sourceType, sourceRecordId, adapterVersion = "v1", fallbackValue = null) {
  const stablePart = sourceRecordId
    ? sanitizeIdPart(sourceRecordId)
    : `missing-${stableHash(fallbackValue || sourceType)}`;
  return `${sanitizeIdPart(sourceType).replace(/-/g, "_")}::${stablePart}::${sanitizeIdPart(adapterVersion)}`;
}

module.exports = {
  createCanonicalId,
  createImportedId,
  createMigrationKey,
  sanitizeIdPart,
  stableHash,
};
