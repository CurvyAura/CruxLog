import localforage from "localforage";

// Simple local persistence layer using localforage (IndexedDB fallback).
// The library stores arrays of items per `kind` under keys prefixed by DB_PREFIX.
const DB_PREFIX = "cruxlog";

localforage.config({
  name: "CruxLog",
  storeName: "cruxlog_store",
});

// Build the storage key for a given kind (e.g., 'problems', 'sessions')
function key(kind) {
  return `${DB_PREFIX}:${kind}`;
}

/**
 * Retrieve all items for a kind.
 * Returns an array (empty if no items persisted yet).
 *
 * @param {string} kind
 * @returns {Promise<Array>}
 */
export async function getAll(kind) {
  const items = (await localforage.getItem(key(kind))) || [];
  return items;
}

/**
 * Get a single app setting by name. Settings are stored as an object under the 'settings' key.
 * @param {string} name
 * @param {any} defaultValue
 */
export async function getSetting(name, defaultValue = null) {
  const map = (await localforage.getItem(key("settings"))) || {};
  return map[name] !== undefined ? map[name] : defaultValue;
}

/**
 * Return the entire settings object stored under the 'settings' key.
 */
export async function getAllSettings() {
  const map = (await localforage.getItem(key("settings"))) || {};
  return map;
}

/**
 * Persist a single app setting under the 'settings' key.
 * @param {string} name
 * @param {any} value
 */
export async function setSetting(name, value) {
  const map = (await localforage.getItem(key("settings"))) || {};
  map[name] = value;
  await localforage.setItem(key("settings"), map);
  return map;
}

/**
 * Save a new item for a kind. The item is appended to the stored array.
 * Returns the saved item.
 *
 * @param {string} kind
 * @param {object} item
 */
export async function save(kind, item) {
  const items = (await getAll(kind));
  items.push(item);
  await localforage.setItem(key(kind), items);
  return item;
}

/**
 * Update an existing item by id. Merges `patch` into the existing object.
 * Returns the updated item.
 *
 * @param {string} kind
 * @param {string} id
 * @param {object} patch
 */
export async function put(kind, id, patch) {
  const items = (await getAll(kind)).map((it) => (it.id === id ? { ...it, ...patch } : it));
  await localforage.setItem(key(kind), items);
  return items.find((it) => it.id === id);
}

/**
 * Remove all items for a kind (clear storage for that kind).
 *
 * @param {string} kind
 */
export async function clearKind(kind) {
  await localforage.removeItem(key(kind));
}

/**
 * Remove a single item by id for a kind.
 * Returns void.
 *
 * @param {string} kind
 * @param {string} id
 */
export async function remove(kind, id) {
  const items = (await getAll(kind)).filter((it) => it.id !== id);
  await localforage.setItem(key(kind), items);
}

/**
 * Clear all app data: problems, sessions and settings.
 * Used by a user-facing "reset account data" action.
 */
export async function clearAll() {
  await Promise.all([
    localforage.removeItem(key("problems")),
    localforage.removeItem(key("sessions")),
    localforage.removeItem(key("settings")),
  ]);
}
