"use strict";

const propertyRecordSchema = require("../contracts/property-record.schema.json");
const serviceRequestSchema = require("../contracts/service-request.schema.json");

const SOURCE_TYPES = ["official", "local_authority", "user_stated", "document_extracted", "supplier_confirmed", "cmp_history", "inferred", "missing", "unknown"];
const CONFIDENCE = ["high", "medium", "low", "unknown"];
const PROOF_STATUSES = ["held", "missing", "expired", "unverified", "needs_review", "accepted"];
const ISSUE_STATUSES = ["open", "awaiting_evidence", "in_progress", "resolved", "deferred"];
const ACTION_STATUSES = ["recommended", "queued", "in_progress", "completed", "dismissed"];
const SERVICE_STATUSES = ["draft", "quote_requested", "quote_received", "awaiting_payment", "booked", "in_progress", "completed", "evidence_received", "closed"];
const CAPABILITY_STATUSES = ["simulated", "live"];

function resultOk(value, warnings = []) {
  return { ok: true, value, warnings };
}

function resultFail(errors, extra = {}) {
  return { ok: false, errors: Array.isArray(errors) ? errors : [errors], ...extra };
}

function normalizeToken(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "_");
}

function normalizeEnum(value, allowed, fallback) {
  const token = normalizeToken(value);
  return allowed.includes(token) ? token : fallback;
}

function normalizeTimestamp(value, fallback = null) {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

function normalizePostcode(value) {
  const compact = String(value || "").toUpperCase().replace(/\s+/g, "");
  if (!compact) return "";
  if (compact.length <= 3) return compact;
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

function normalizeAddress(input = {}) {
  if (typeof input === "string") {
    return {
      displayAddress: input.trim(),
      line1: input.split(",")[0]?.trim() || null,
      line2: null,
      town: null,
      county: null,
      postcode: "",
    };
  }

  const displayAddress = input.displayAddress || input.address || [input.line1, input.line2, input.town, input.postcode].filter(Boolean).join(", ");
  return {
    displayAddress: String(displayAddress || "").trim(),
    line1: input.line1 || String(displayAddress || "").split(",")[0]?.trim() || null,
    line2: input.line2 || null,
    town: input.town || null,
    county: input.county || null,
    postcode: normalizePostcode(input.postcode || ""),
  };
}

function normalizeConfidence(value) {
  return normalizeEnum(value, CONFIDENCE, "unknown");
}

function normalizeSourceType(value) {
  return normalizeEnum(value, SOURCE_TYPES, "unknown");
}

function normalizeProofStatus(value) {
  return normalizeEnum(value, PROOF_STATUSES, "unverified");
}

function normalizeIssueStatus(value) {
  return normalizeEnum(value, ISSUE_STATUSES, "open");
}

function normalizeActionStatus(value) {
  return normalizeEnum(value, ACTION_STATUSES, "recommended");
}

function normalizeServiceStatus(value) {
  return normalizeEnum(value, SERVICE_STATUSES, "draft");
}

function normalizeCapabilityStatus(value) {
  return normalizeEnum(value, CAPABILITY_STATUSES, "simulated");
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

function normalizeEntityId(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

function normalizeUnknownish(value) {
  if (value === "unknown") return { kind: "unknown", value: "unknown" };
  if (value === "missing") return { kind: "missing", value: "missing" };
  if (value === "") return { kind: "empty_string", value: "" };
  if (value === undefined) return { kind: "undefined", value: undefined };
  if (value === null) return { kind: "null", value: null };
  return { kind: "value", value };
}

function normalizeNoEpcFinding(input = {}) {
  const propertyId = input.propertyId || "unknown_property";
  return {
    id: input.id || `${propertyId}_epc_missing`,
    propertyId,
    checkType: "epc",
    resultStatus: "missing",
    value: { epcFound: false },
    sourceReferences: [{
      sourceType: "missing",
      sourceLabel: input.sourceLabel || "No EPC found",
      sourceIdentifier: input.sourceIdentifier || null,
      checkedDate: input.checkedDate || null,
      confidence: "medium",
      capabilityStatus: normalizeCapabilityStatus(input.capabilityStatus),
      notes: "No EPC rating, potential, expiry or EPC-derived heating has been inferred.",
    }],
    confidence: "medium",
    requiresConfirmation: true,
    missingReason: input.missingReason || "No EPC found in source data",
    unknownReason: null,
    checkedAt: input.checkedAt || null,
    capabilityStatus: normalizeCapabilityStatus(input.capabilityStatus),
  };
}

function resolveRef(schema, ref) {
  if (!ref.startsWith("#/")) throw new Error(`Unsupported $ref: ${ref}`);
  return ref.slice(2).split("/").reduce((current, part) => current?.[part], schema);
}

function typeMatches(value, type) {
  if (type === "array") return Array.isArray(value);
  if (type === "null") return value === null;
  if (type === "integer") return Number.isInteger(value);
  if (type === "number") return typeof value === "number" && !Number.isNaN(value);
  if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  return typeof value === type;
}

function validateJsonSchema(value, schema, rootSchema = schema, path = "$") {
  const errors = [];

  function visit(current, currentSchema, currentPath) {
    if (!currentSchema) {
      errors.push(`${currentPath}: missing schema`);
      return;
    }

    if (currentSchema.$ref) {
      visit(current, resolveRef(rootSchema, currentSchema.$ref), currentPath);
      return;
    }

    if (currentSchema.const !== undefined && current !== currentSchema.const) {
      errors.push(`${currentPath}: expected const ${JSON.stringify(currentSchema.const)}`);
    }

    if (currentSchema.enum && !currentSchema.enum.includes(current)) {
      errors.push(`${currentPath}: expected one of ${currentSchema.enum.join(", ")}`);
    }

    if (currentSchema.type) {
      const types = Array.isArray(currentSchema.type) ? currentSchema.type : [currentSchema.type];
      if (!types.some((type) => typeMatches(current, type))) {
        errors.push(`${currentPath}: expected type ${types.join(" or ")}`);
        return;
      }
    }

    if (typeof current === "string" && currentSchema.minLength && current.length < currentSchema.minLength) {
      errors.push(`${currentPath}: expected minLength ${currentSchema.minLength}`);
    }

    if (Array.isArray(current)) {
      if (currentSchema.items) {
        current.forEach((item, index) => visit(item, currentSchema.items, `${currentPath}[${index}]`));
      }
      return;
    }

    if (current && typeof current === "object" && !Array.isArray(current)) {
      for (const key of currentSchema.required || []) {
        if (!(key in current)) errors.push(`${currentPath}.${key}: missing required field`);
      }

      const properties = currentSchema.properties || {};
      if (currentSchema.additionalProperties === false) {
        for (const key of Object.keys(current)) {
          if (!Object.hasOwn(properties, key)) errors.push(`${currentPath}.${key}: additional property is not allowed`);
        }
      }

      for (const [key, childSchema] of Object.entries(properties)) {
        if (key in current) visit(current[key], childSchema, `${currentPath}.${key}`);
      }
    }
  }

  visit(value, schema, path);
  return errors.length ? resultFail(errors) : resultOk(value);
}

function validatePropertyRecord(record) {
  return validateJsonSchema(record, propertyRecordSchema);
}

function validateServiceRequest(request) {
  return validateJsonSchema(request, serviceRequestSchema);
}

function validateServiceIntentDraft(intent) {
  const errors = [];
  if (!intent || typeof intent !== "object" || Array.isArray(intent)) errors.push("ServiceIntentDraft must be an object");
  for (const key of ["id", "serviceId", "sourceRoute", "status", "createdAt", "updatedAt"]) {
    if (!intent?.[key]) errors.push(`ServiceIntentDraft missing ${key}`);
  }
  if (intent?.propertyId !== undefined && intent.propertyId !== null && typeof intent.propertyId !== "string") {
    errors.push("ServiceIntentDraft propertyId must be a string or null");
  }
  if (!["draft", "attached", "converted", "abandoned", "closed"].includes(intent?.status)) {
    errors.push("ServiceIntentDraft has invalid status");
  }
  for (const placeholder of intent?.evidencePlaceholders || []) {
    if (placeholder.stored !== false) errors.push("Evidence placeholders must not be marked stored");
  }
  return errors.length ? resultFail(errors) : resultOk(intent);
}

function validateStoreEnvelope(store) {
  const errors = [];
  if (!store || typeof store !== "object" || Array.isArray(store)) errors.push("Store envelope must be an object");
  for (const key of ["storeVersion", "namespaceId", "propertiesById", "propertyOrder", "serviceIntentsById", "migrationIndex", "createdAt", "updatedAt"]) {
    if (!(key in (store || {}))) errors.push(`Store envelope missing ${key}`);
  }
  if (store?.storeVersion !== 1) errors.push("Store envelope storeVersion must be 1");
  if (!Array.isArray(store?.propertyOrder)) errors.push("Store envelope propertyOrder must be an array");

  for (const propertyId of store?.propertyOrder || []) {
    if (!store.propertiesById?.[propertyId]) errors.push(`propertyOrder references missing property ${propertyId}`);
  }

  for (const [propertyId, property] of Object.entries(store?.propertiesById || {})) {
    if (property.id !== propertyId) errors.push(`propertiesById key ${propertyId} does not match record id ${property.id}`);
    const validation = validatePropertyRecord(property);
    if (!validation.ok) errors.push(...validation.errors.map((error) => `${propertyId}: ${error}`));
  }

  for (const [intentId, intent] of Object.entries(store?.serviceIntentsById || {})) {
    if (intent.id !== intentId) errors.push(`serviceIntentsById key ${intentId} does not match intent id ${intent.id}`);
    const validation = validateServiceIntentDraft(intent);
    if (!validation.ok) errors.push(...validation.errors.map((error) => `${intentId}: ${error}`));
  }

  if (store?.lastSelectedPropertyId && !store.propertiesById?.[store.lastSelectedPropertyId]) {
    errors.push("lastSelectedPropertyId references an unknown property");
  }

  return errors.length ? resultFail(errors) : resultOk(store);
}

module.exports = {
  SOURCE_TYPES,
  CONFIDENCE,
  PROOF_STATUSES,
  ISSUE_STATUSES,
  ACTION_STATUSES,
  SERVICE_STATUSES,
  CAPABILITY_STATUSES,
  resultOk,
  resultFail,
  normalizeTimestamp,
  normalizePostcode,
  normalizeAddress,
  normalizeConfidence,
  normalizeSourceType,
  normalizeProofStatus,
  normalizeIssueStatus,
  normalizeActionStatus,
  normalizeServiceStatus,
  normalizeCapabilityStatus,
  normalizeArray,
  normalizeEntityId,
  normalizeUnknownish,
  normalizeNoEpcFinding,
  validateJsonSchema,
  validatePropertyRecord,
  validateServiceRequest,
  validateServiceIntentDraft,
  validateStoreEnvelope,
};
