/**
 * Simple data model helpers for CruxLog local prototype
 */
export function makeId(prefix = "i") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function makeBoulder({ name, grade, area, notes, photoUrl }) {
  return {
    id: makeId("boulder"),
    name: name || "Untitled",
    grade: grade || "?",
    area: area || "",
    notes: notes || "",
    photoUrl: photoUrl || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function makeSession({ date, location, notes, attempts = [] }) {
  return {
    id: makeId("session"),
    date: date || new Date().toISOString(),
    location: location || "",
    notes: notes || "",
    attempts,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function makeAttempt({ boulderId, result = "attempt", notes = "" }) {
  return {
    id: makeId("attempt"),
    boulderId,
    result,
    notes,
    timestamp: new Date().toISOString(),
  };
}
