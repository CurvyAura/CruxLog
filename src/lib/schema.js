/**
 * Simple data model helpers for CruxLog local prototype.
 *
 * These helpers create the canonical objects stored by the app:
 * - Problem
 * - Session
 * - Attempt
 *
 * The functions intentionally return plain POJOs so they are storage-friendly
 * and easy to serialize via localforage / IndexedDB.
 */
export function makeId(prefix = "i") {
  // Small, readable id used for client-only prototyping.
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Create a Problem object.
 * Fields:
 * - id: unique id
 * - name: problem name/title
 * - grade: e.g., 'C1'..'C9'
 * - area: gym/area string
 * - completedDate: ISO date string or null
 * - notes: optional notes
 * - photoUrl: optional photo
 * - createdAt / updatedAt: timestamps
 */
export function makeProblem({ name, grade, area, completedDate, notes, photoUrl }) {
  return {
    id: makeId("problem"),
    name: name || "Untitled",
    grade: grade || "C1",
    area: area || "",
    completedDate: completedDate || null,
    notes: notes || "",
    photoUrl: photoUrl || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Create a Session object which groups attempts made during a climbing session.
 * - date: ISO string timestamp for the session (defaults to now)
 * - location: optional venue/gym
 * - attempts: array of Attempt objects
 */
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

/**
 * Create an Attempt object linking a problem to a result.
 * - result: one of 'send', 'fail', 'attempt'
 * - timestamp: when the attempt was recorded
 */
export function makeAttempt({ problemId, result = "attempt", notes = "" }) {
  return {
    id: makeId("attempt"),
    problemId,
    result,
    notes,
    timestamp: new Date().toISOString(),
  };
}
