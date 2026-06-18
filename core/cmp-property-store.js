"use strict";

const {
  resultOk,
  resultFail,
  validatePropertyRecord,
  validateServiceIntentDraft,
  validateStoreEnvelope,
} = require("./cmp-domain-normalize.js");
const { previewWithAdapter } = require("./cmp-transitional-adapters.js");

const CANONICAL_STORE_VERSION = 1;
const CANONICAL_STORE_KEY_PREFIX = "cmp_canonical_property_store_v1";

function nowIso(options = {}) {
  return options.now || new Date().toISOString();
}

function buildStorageKey(namespaceId) {
  return `${CANONICAL_STORE_KEY_PREFIX}::${namespaceId}`;
}

function createEmptyStoreEnvelope(namespaceId, options = {}) {
  const timestamp = nowIso(options);
  return {
    storeVersion: CANONICAL_STORE_VERSION,
    namespaceId,
    propertiesById: {},
    propertyOrder: [],
    lastSelectedPropertyId: null,
    serviceIntentsById: {},
    migrationIndex: {},
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeAddressKey(property) {
  return `${property.identity?.displayAddress || property.address || ""}|${property.identity?.postcode || ""}`.trim().toLowerCase();
}

function createCanonicalStore(options = {}) {
  const { namespaceId, driver } = options;
  if (!namespaceId) throw new Error("createCanonicalStore requires explicit namespaceId");
  if (!driver) throw new Error("createCanonicalStore requires explicit storage driver");
  const storageKey = buildStorageKey(namespaceId);

  async function loadStore() {
    const stored = await driver.get(storageKey);
    if (!stored.ok) return stored;
    if (stored.value === null || stored.value === undefined) {
      return resultOk(createEmptyStoreEnvelope(namespaceId, options));
    }

    let parsed;
    try {
      parsed = JSON.parse(stored.value);
    } catch (error) {
      return resultFail(`Malformed JSON in canonical store ${storageKey}: ${error.message}`, {
        quarantine: { storageKey, rawValue: stored.value },
      });
    }

    const validation = validateStoreEnvelope(parsed);
    if (!validation.ok) {
      return resultFail(validation.errors, {
        quarantine: { storageKey, parsed },
      });
    }
    return resultOk(parsed);
  }

  async function saveStore(store) {
    const nextStore = clone(store);
    nextStore.updatedAt = nowIso(options);
    const validation = validateStoreEnvelope(nextStore);
    if (!validation.ok) return validation;
    const write = await driver.set(storageKey, JSON.stringify(nextStore));
    if (!write.ok) return write;
    return resultOk(nextStore);
  }

  async function listProperties() {
    const loaded = await loadStore();
    if (!loaded.ok) return loaded;
    const store = loaded.value;
    return resultOk(store.propertyOrder.map((propertyId) => store.propertiesById[propertyId]).filter(Boolean));
  }

  async function getProperty(propertyId) {
    const loaded = await loadStore();
    if (!loaded.ok) return loaded;
    return resultOk(loaded.value.propertiesById[propertyId] || null);
  }

  async function upsertProperty(propertyRecord) {
    const validation = validatePropertyRecord(propertyRecord);
    if (!validation.ok) return validation;
    if (propertyRecord.namespace !== namespaceId) {
      return resultFail(`Property namespace ${propertyRecord.namespace} does not match store namespace ${namespaceId}`);
    }

    const loaded = await loadStore();
    if (!loaded.ok) return loaded;
    const store = loaded.value;
    const nextRecord = clone(propertyRecord);
    nextRecord.updatedAt = nowIso(options);
    store.propertiesById[nextRecord.id] = nextRecord;
    if (!store.propertyOrder.includes(nextRecord.id)) store.propertyOrder.push(nextRecord.id);
    return saveStore(store);
  }

  async function archiveProperty(propertyId) {
    const loaded = await loadStore();
    if (!loaded.ok) return loaded;
    const store = loaded.value;
    const record = store.propertiesById[propertyId];
    if (!record) return resultFail(`Cannot archive unknown property ${propertyId}`);
    record.lifecycleStatus = "archived";
    record.updatedAt = nowIso(options);
    return saveStore(store);
  }

  async function setLastSelectedProperty(propertyId) {
    const loaded = await loadStore();
    if (!loaded.ok) return loaded;
    const store = loaded.value;
    if (!store.propertiesById[propertyId]) return resultFail(`Cannot select unknown property ${propertyId}`);
    store.lastSelectedPropertyId = propertyId;
    return saveStore(store);
  }

  async function getLastSelectedPropertyId() {
    const loaded = await loadStore();
    if (!loaded.ok) return loaded;
    return resultOk(loaded.value.lastSelectedPropertyId || null);
  }

  async function upsertServiceIntent(serviceIntentDraft) {
    const validation = validateServiceIntentDraft(serviceIntentDraft);
    if (!validation.ok) return validation;
    const loaded = await loadStore();
    if (!loaded.ok) return loaded;
    const store = loaded.value;
    store.serviceIntentsById[serviceIntentDraft.id] = clone(serviceIntentDraft);
    return saveStore(store);
  }

  async function getServiceIntent(intentId) {
    const loaded = await loadStore();
    if (!loaded.ok) return loaded;
    return resultOk(loaded.value.serviceIntentsById[intentId] || null);
  }

  async function attachServiceIntentToProperty(intentId, propertyId) {
    const loaded = await loadStore();
    if (!loaded.ok) return loaded;
    const store = loaded.value;
    const intent = store.serviceIntentsById[intentId];
    if (!intent) return resultFail(`Cannot attach unknown service intent ${intentId}`);
    if (!store.propertiesById[propertyId]) return resultFail(`Cannot attach service intent to unknown property ${propertyId}`);
    intent.propertyId = propertyId;
    intent.status = "attached";
    intent.updatedAt = nowIso(options);
    return saveStore(store);
  }

  async function previewImport(sourceType, sourceValue, importOptions = {}) {
    const preview = previewWithAdapter(sourceType, sourceValue, { ...importOptions, namespaceId, now: nowIso(options) });
    if (!preview.ok) return preview;
    const value = preview.value;

    if (value.records) {
      const errors = [];
      for (const record of value.records) {
        const validation = validatePropertyRecord(record);
        if (!validation.ok) errors.push(...validation.errors);
      }
      if (errors.length) return resultFail(errors);
    } else if (value.serviceId) {
      const validation = validateServiceIntentDraft(value);
      if (!validation.ok) return validation;
    }

    return preview;
  }

  async function importLegacyRecord(sourceType, sourceValue, importOptions = {}) {
    const preview = await previewImport(sourceType, sourceValue, importOptions);
    if (!preview.ok) return preview;
    const loaded = await loadStore();
    if (!loaded.ok) return loaded;
    const store = loaded.value;
    const warnings = [...(preview.warnings || [])];
    const records = [];
    const migrationKeys = [];

    if (preview.value.serviceId) {
      store.serviceIntentsById[preview.value.id] = clone(preview.value);
      const saved = await saveStore(store);
      if (!saved.ok) return saved;
      return resultOk({ serviceIntent: preview.value, migrationKeys: [] }, warnings);
    }

    for (const record of preview.value.records || []) {
      const migration = record.entryContext?.migration;
      const migrationKey = migration?.migrationKey;
      if (!migrationKey) return resultFail(`Imported record ${record.id} is missing migration key`);

      if (store.migrationIndex[migrationKey]) {
        const existingId = store.migrationIndex[migrationKey].propertyId;
        records.push(store.propertiesById[existingId]);
        migrationKeys.push(migrationKey);
        warnings.push(`Record already imported for migration key ${migrationKey}.`);
        continue;
      }

      if (store.propertiesById[record.id]) {
        return resultFail(`Import collision: canonical property ${record.id} already exists for another source.`);
      }

      const candidateAddressKey = normalizeAddressKey(record);
      const potentialDuplicate = Object.values(store.propertiesById).find((existing) => normalizeAddressKey(existing) === candidateAddressKey);
      if (potentialDuplicate) {
        warnings.push(`Potential duplicate detected with ${potentialDuplicate.id}; records were preserved separately.`);
      }

      store.propertiesById[record.id] = clone(record);
      store.propertyOrder.push(record.id);
      store.migrationIndex[migrationKey] = {
        propertyId: record.id,
        sourceType,
        sourceRecordId: migration.sourceRecordId,
        importedAt: nowIso(options),
        adapterVersion: migration.adapterVersion,
        originalSchemaVersion: migration.originalSchemaVersion || null,
      };
      records.push(record);
      migrationKeys.push(migrationKey);
    }

    const saved = await saveStore(store);
    if (!saved.ok) return saved;
    return resultOk({ records, migrationKeys }, warnings);
  }

  async function archiveImportedRecord(migrationKey) {
    const loaded = await loadStore();
    if (!loaded.ok) return loaded;
    const migration = loaded.value.migrationIndex[migrationKey];
    if (!migration) return resultFail(`Unknown migration key ${migrationKey}`);
    return archiveProperty(migration.propertyId);
  }

  return {
    namespaceId,
    storageKey,
    loadStore,
    saveStore,
    listProperties,
    getProperty,
    upsertProperty,
    archiveProperty,
    setLastSelectedProperty,
    getLastSelectedPropertyId,
    upsertServiceIntent,
    getServiceIntent,
    attachServiceIntentToProperty,
    previewImport,
    importLegacyRecord,
    archiveImportedRecord,
  };
}

module.exports = {
  CANONICAL_STORE_VERSION,
  CANONICAL_STORE_KEY_PREFIX,
  buildStorageKey,
  createEmptyStoreEnvelope,
  createCanonicalStore,
};
