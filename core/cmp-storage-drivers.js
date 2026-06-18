"use strict";

const { resultOk, resultFail } = require("./cmp-domain-normalize.js");

function createMemoryStorageDriver(initial = {}) {
  const store = new Map(Object.entries(initial));

  return {
    async get(key) {
      return resultOk(store.has(key) ? store.get(key) : null);
    },
    async set(key, value) {
      store.set(key, String(value));
      return resultOk(true);
    },
    async remove(key) {
      store.delete(key);
      return resultOk(true);
    },
    async keys() {
      return resultOk([...store.keys()]);
    },
    _store: store,
  };
}

function createStorageObjectDriver(storage) {
  return {
    async get(key) {
      try {
        return resultOk(storage.getItem(key));
      } catch (error) {
        return resultFail(`Storage get failed for ${key}: ${error.message}`);
      }
    },
    async set(key, value) {
      try {
        storage.setItem(key, String(value));
        return resultOk(true);
      } catch (error) {
        return resultFail(`Storage set failed for ${key}: ${error.message}`);
      }
    },
    async remove(key) {
      try {
        storage.removeItem(key);
        return resultOk(true);
      } catch (error) {
        return resultFail(`Storage remove failed for ${key}: ${error.message}`);
      }
    },
    async keys() {
      try {
        if (typeof storage.key === "function" && typeof storage.length === "number") {
          const keys = [];
          for (let index = 0; index < storage.length; index += 1) {
            const key = storage.key(index);
            if (key !== null) keys.push(key);
          }
          return resultOk(keys);
        }
        return resultOk(Object.keys(storage));
      } catch (error) {
        return resultFail(`Storage key listing failed: ${error.message}`);
      }
    },
  };
}

function createLocalStorageDriver(storageLike) {
  if (!storageLike) return resultFail("A Storage-compatible object is required for localStorage driver");
  return createStorageObjectDriver(storageLike);
}

function createSessionStorageDriver(storageLike) {
  if (!storageLike) return resultFail("A Storage-compatible object is required for sessionStorage driver");
  return createStorageObjectDriver(storageLike);
}

module.exports = {
  createMemoryStorageDriver,
  createStorageObjectDriver,
  createLocalStorageDriver,
  createSessionStorageDriver,
};
