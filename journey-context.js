(function () {
  if (typeof window.CMP_DEMO_MODE === "undefined") {
    // Prototype default: keep demo mode enabled unless a future build turns it off explicitly.
    window.CMP_DEMO_MODE = true;
  }

  const STORAGE_PREFIX = "cmp_journey_context::";
  const GUEST_KEY = `${STORAGE_PREFIX}guest`;
  const VALID_ENTRY_SERVICES = new Set([
    "epc",
    "gas",
    "eicr",
    "full_compliance",
    "eviction",
    "mould",
    "evidence_pack",
    "inspection",
    "licensing",
    "aml",
    "rent_guarantee",
    "insurance",
    "mortgage"
  ]);
  const VALID_FOCUS_MODES = new Set(["service_only", "related_checks", "full_compliance"]);
  const VALID_TENANCY_STATES = new Set(["yes", "no", "unsure"]);

  function nowIso() {
    return new Date().toISOString();
  }

  function sourceRouteFromLocation() {
    return `${window.location.pathname.split("/").pop() || "index.html"}${window.location.search}${window.location.hash}`;
  }

  function defaultContext(overrides = {}) {
    const createdAt = overrides.createdAt || nowIso();
    return {
      entryService: VALID_ENTRY_SERVICES.has(overrides.entryService) ? overrides.entryService : "full_compliance",
      focusMode: VALID_FOCUS_MODES.has(overrides.focusMode) ? overrides.focusMode : "full_compliance",
      isTenanted: VALID_TENANCY_STATES.has(overrides.isTenanted) ? overrides.isTenanted : null,
      selectedPropertyId: overrides.selectedPropertyId || null,
      sourceRoute: overrides.sourceRoute || sourceRouteFromLocation(),
      answeredQuestions: typeof overrides.answeredQuestions === "object" && overrides.answeredQuestions ? { ...overrides.answeredQuestions } : {},
      createdAt,
      updatedAt: overrides.updatedAt || createdAt
    };
  }

  function normalizeContext(raw) {
    if (!raw || typeof raw !== "object") return null;
    return defaultContext(raw);
  }

  function readRaw(storage, key) {
    try {
      return JSON.parse(storage.getItem(key) || "null");
    } catch {
      return null;
    }
  }

  function writeRaw(storage, key, value) {
    storage.setItem(key, JSON.stringify(value));
  }

  function userKey(userId) {
    return `${STORAGE_PREFIX}${userId}`;
  }

  function read(userId = null) {
    const storage = userId ? localStorage : sessionStorage;
    const key = userId ? userKey(userId) : GUEST_KEY;
    return normalizeContext(readRaw(storage, key));
  }

  function write(context, userId = null) {
    const storage = userId ? localStorage : sessionStorage;
    const key = userId ? userKey(userId) : GUEST_KEY;
    const normalized = normalizeContext(context);
    if (!normalized) return null;
    writeRaw(storage, key, normalized);
    return normalized;
  }

  function update(partial = {}, userId = null) {
    const current = read(userId) || defaultContext();
    const next = defaultContext({
      ...current,
      ...partial,
      answeredQuestions: partial.answeredQuestions
        ? { ...current.answeredQuestions, ...partial.answeredQuestions }
        : current.answeredQuestions,
      updatedAt: nowIso()
    });
    return write(next, userId);
  }

  function clear(userId = null) {
    const storage = userId ? localStorage : sessionStorage;
    const key = userId ? userKey(userId) : GUEST_KEY;
    storage.removeItem(key);
  }

  function claimForUser(userId) {
    if (!userId) return read();
    const existing = read(userId);
    if (existing) {
      clear();
      return existing;
    }
    const guest = read();
    if (!guest) return null;
    const adopted = write({ ...guest, updatedAt: nowIso() }, userId);
    clear();
    return adopted;
  }

  function setEntry(config = {}, userId = null) {
    const createdAt = read(userId)?.createdAt || nowIso();
    return write(defaultContext({
      ...config,
      createdAt,
      updatedAt: nowIso(),
      sourceRoute: config.sourceRoute || sourceRouteFromLocation(),
      answeredQuestions: config.answeredQuestions || {}
    }), userId);
  }

  window.CMPJourney = {
    claimForUser,
    clear,
    defaultContext,
    normalizeContext,
    read,
    setEntry,
    update,
    write
  };
})();
