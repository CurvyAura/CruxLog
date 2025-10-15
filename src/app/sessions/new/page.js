"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getAll, save, put, getSetting, setSetting } from "../../../lib/storage";
import Select from "../../../components/ui/Select";
import { makeSession, makeAttempt } from "../../../lib/schema";
import { useRouter } from "next/navigation";
import ResultBadge from "../../../components/ResultBadge";
import { showToast, ensureToastRoot } from "../../../components/ToastPortal";
import Button from "../../../components/ui/Button";

/**
 * NewSession page
 * - Lets the user pick problems and add attempts for a session.
 * - Attempts are accumulated locally in component state and then saved
 *   as a Session object into local storage.
 */
export default function NewSession() {
  const [problems, setProblems] = useState([]);
  const [gradePrefix, setGradePrefix] = useState("C");
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState("send");
  const [attempts, setAttempts] = useState([]);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    getAll("problems").then(setProblems);
    let mounted = true;
    import("../../../lib/storage").then(({ getSetting }) => {
      getSetting("gradePrefix", "C").then((v) => {
        if (!mounted) return;
        setGradePrefix(v || "C");
      });
    });
    // load draft session if present
    let mountedDraft = true;
    getSetting("draftSession", null).then((draft) => {
      if (!mountedDraft || !draft) return;
      if (draft.selected) setSelected(draft.selected);
      if (draft.result) setResult(draft.result);
      if (Array.isArray(draft.attempts) && draft.attempts.length) setAttempts(draft.attempts);
    });
    return () => (mounted = false);
  }, []);

  // Update filtered problems when query or problems list changes
  useEffect(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) {
      setFilteredProblems(problems.slice(0, 50));
      setActiveIndex(0);
      return;
    }
    const matches = problems.filter((p) => (p.name || "").toLowerCase().includes(q) || (p.grade || "").toLowerCase().includes(q));
    setFilteredProblems(matches.slice(0, 50));
    setActiveIndex(0);
  }, [query, problems]);

    // Close dropdown when clicking outside the picker
    useEffect(() => {
      function onDocMouse(e) {
        if (!open) return;
        if (!containerRef.current) return;
        if (!containerRef.current.contains(e.target)) {
          setOpen(false);
        }
      }
      document.addEventListener("mousedown", onDocMouse);
      return () => document.removeEventListener("mousedown", onDocMouse);
    }, [open]);

    // Persist draft when the in-progress fields change so navigation away/back restores state
    useEffect(() => {
      // Save a minimal draft object
      const draft = { selected, result, attempts };
      // store under settings so it's persisted via localforage
      setSetting("draftSession", draft).catch(() => {});
    }, [selected, result, attempts]);

    function addAttempt() {
      if (!selected) return;
      const a = makeAttempt({ problemId: selected, result });
      setAttempts((s) => [a, ...s]);
    }

    async function saveSession() {
      const s = makeSession({ attempts });

      // XP rules (prototype):
      // - base for logging a session: 10 XP
      // - each non-send attempt: 5 XP
      // - each send: 15 XP
      // - if send is a new PB (grade numeric > previous best), award 100 XP instead of 15
      const BASE_SESSION_XP = 10;
      const ATTEMPT_XP = 5;
      const SEND_XP = 15;
      const PB_XP = 100;

      // helper: parse numeric part of a grade string like 'C3' or 'V10'
      function gradeNumber(g) {
        if (!g) return 0;
        const m = String(g).match(/(\d+)/);
        return m ? parseInt(m[0], 10) : 0;
      }

      // load previous problems to determine prior PB
      const existingProblems = await getAll("problems");
      let prevPB = 0;
      for (const p of existingProblems) {
        if (!p.completedDate) continue;
        const gn = gradeNumber(p.grade);
        if (gn > prevPB) prevPB = gn;
      }

      // compute xp gain and update prevPB as we award PBs within this session
      let xpGain = BASE_SESSION_XP;
      let workingPB = prevPB;
      for (const a of s.attempts) {
        if (a.result === "attempt") xpGain += ATTEMPT_XP;
        else if (a.result === "send") {
          // find the problem grade
          const prob = existingProblems.find((p) => p.id === a.problemId) || problems.find((p) => p.id === a.problemId);
          const gn = gradeNumber(prob ? prob.grade : "");
          if (gn > workingPB) {
            xpGain += PB_XP;
            workingPB = gn;
          } else {
            xpGain += SEND_XP;
          }
        }
      }

      // fetch current xp and compute new total
      const currentXp = (await getSetting("xp", 0)) || 0;
      const newXp = Number(currentXp) + xpGain;

      // small helper to determine level for xp (mirrors LevelCard levels)
      const LEVELS = [
        { lvl: 1, min: 0, max: 99 },
        { lvl: 2, min: 100, max: 249 },
        { lvl: 3, min: 250, max: 499 },
        { lvl: 4, min: 500, max: 799 },
        { lvl: 5, min: 800, max: 1199 },
        { lvl: 6, min: 1200, max: 1699 },
        { lvl: 7, min: 1700, max: 2299 },
        { lvl: 8, min: 2300, max: 2999 },
        { lvl: 9, min: 3000, max: 3999 },
        { lvl: 10, min: 4000, max: Infinity },
      ];
      function getLevelForXP(xpVal) {
        const v = Math.max(0, Number(xpVal) || 0);
        return LEVELS.find((l) => v >= l.min && v <= l.max) || LEVELS[0];
      }

      const prevLevel = getLevelForXP(currentXp).lvl;

      // persist XP before marking problems completed so LevelCard and others see new value
      await setSetting("xp", newXp);

      const newLevel = getLevelForXP(newXp).lvl;

      // If leveled up, show a toast using the portal-based helper
      if (newLevel > prevLevel) {
        const newLevelObj = getLevelForXP(newXp);
        try {
          ensureToastRoot();
          showToast(`LEVEL UP! You're now a ${newLevelObj.name || 'Level ' + newLevelObj.lvl} ${newLevelObj.emoji || ''}`);
        } catch (e) {}
      }

      // Now mark problems completed for send attempts with the session date.
      const sessionDate = s.date;
      await Promise.all(
        s.attempts
          .filter((a) => a.result === "send")
          .map((a) => put("problems", a.problemId, { completedDate: sessionDate }))
      );

      await save("sessions", s);
      // clear draft before resetting in-memory attempts
      await setSetting("draftSession", null);
      setAttempts([]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      // navigate back to dashboard so user sees the saved session
      router.push("/dashboard");
    }

    return (
      <div className="w-full max-w-xl py-8">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Log Session</h1>
        </header>

        <div className="grid gap-4">
          {/* Searchable problem picker */}
          <div className="relative" ref={containerRef}>
            <label className="sr-only">Select problem</label>
            <input
              ref={inputRef}
              type="text"
              value={selected ? (problems.find((p) => p.id === selected)?.name || "") : query}
              onChange={(e) => {
                // typing resets selected and filters
                setSelected("");
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActiveIndex((i) => Math.min(i + 1, filteredProblems.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActiveIndex((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  const pick = filteredProblems[activeIndex];
                  if (pick) {
                    setSelected(pick.id);
                    setOpen(false);
                    setQuery("");
                  }
                } else if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
              placeholder="Search problems"
              className="w-full border rounded p-2"
            />
            {open && (
              <ul
                className="absolute z-40 left-0 right-0 max-h-52 overflow-auto mt-1"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)",
                  borderRadius: "var(--radius-sm)",
                  padding: 4,
                  maxWidth: 'calc(100vw - 24px)',
                  boxSizing: 'border-box',
                  overflowX: 'hidden',
                }}
              >
                {filteredProblems.length ? (
                  filteredProblems.map((b, i) => {
                    const active = i === activeIndex;
                    return (
                      <li
                        key={b.id}
                        onMouseDown={(ev) => {
                          ev.preventDefault();
                          setSelected(b.id);
                          setOpen(false);
                          setQuery("");
                        }}
                        onMouseEnter={() => setActiveIndex(i)}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          background: active ? 'rgba(16,185,129,0.12)' : 'transparent',
                          color: 'var(--text)',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                        }}
                      >
                        <div style={{ fontWeight: 600, wordBreak: 'break-word' }}>{b.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{b.grade}</div>
                      </li>
                    );
                  })
                ) : (
                  <li style={{ padding: 10, color: 'var(--muted)' }} className="text-sm">No matches</li>
                )}
              </ul>
            )}
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <Select value={result} onChange={(e) => setResult(e.target.value)}>
              <option value="send">Send</option>
              <option value="attempt">Attempt</option>
            </Select>
            <Button onClick={addAttempt}>Add Attempt</Button>
            <Button variant="ghost" onClick={saveSession}>Save Session</Button>
          </div>

          {saved && <div className="text-sm text-green-400">Session saved.</div>}

          <div>
            <h3 className="font-semibold">Attempts</h3>
            <ul className="mt-2 grid gap-2">
              {attempts.map((a, idx) => {
                const p = problems.find((b) => b.id === a.problemId);
                return (
                  <li key={a.id} className="p-2 border rounded">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold flex-1 min-w-0 truncate" title={p ? p.name : a.problemId}>
                        {p ? p.name : a.problemId}
                        {p && <span className="text-sm text-muted-foreground"> ({p.grade})</span>}
                      </span>
                      <div className="ml-3 flex-shrink-0 w-16 flex justify-end">
                        <ResultBadge result={a.result} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                      <Select
                        value={a.result}
                        onChange={(e) => {
                          const copy = attempts.slice();
                          copy[idx] = { ...copy[idx], result: e.target.value };
                          setAttempts(copy);
                        }}
                        className="w-28"
                      >
                        <option value="send">Send</option>
                        <option value="attempt">Attempt</option>
                      </Select>
                      <Button variant="ghost" onClick={() => setAttempts((s) => s.filter((_, i) => i !== idx))} aria-label="Remove attempt">Remove</Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    );
  }
