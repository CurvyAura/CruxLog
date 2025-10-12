import localforage from "localforage";

const DB_PREFIX = "cruxlog";

localforage.config({
  name: "CruxLog",
  storeName: "cruxlog_store",
});

function key(kind) {
  return `${DB_PREFIX}:${kind}`;
}

export async function getAll(kind) {
  const items = (await localforage.getItem(key(kind))) || [];
  return items;
}

export async function save(kind, item) {
  const items = (await getAll(kind));
  items.push(item);
  await localforage.setItem(key(kind), items);
  return item;
}

export async function put(kind, id, patch) {
  const items = (await getAll(kind)).map((it) => (it.id === id ? { ...it, ...patch } : it));
  await localforage.setItem(key(kind), items);
  return items.find((it) => it.id === id);
}

export async function clearKind(kind) {
  await localforage.removeItem(key(kind));
}

export async function remove(kind, id) {
  const items = (await getAll(kind)).filter((it) => it.id !== id);
  await localforage.setItem(key(kind), items);
}
