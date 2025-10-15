"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAll, save, put, getSetting, setSetting } from "../../../lib/storage";
import Select from "../../../components/ui/Select";
import { makeSession, makeAttempt } from "../../../lib/schema";
import { useRouter } from "next/navigation";
import ResultBadge from "../../../components/ResultBadge";
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
    // For any attempt that is a 'send', mark the referenced problem as completed
    // with the session date.
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
        <Select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-full">
          <option value="">Select problem</option>
          {problems.map((b) => (
            <option key={b.id} value={b.id}>{b.name} — {b.grade}</option>
          ))}
        </Select>
        <div className="flex gap-2 items-center flex-wrap">
          <Select value={result} onChange={(e) => setResult(e.target.value)}>
            <option value="send">Send</option>
            <option value="fail">Fail</option>
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
                <li key={a.id} className="p-2 border rounded flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="min-w-40">
                      <div className="font-semibold">
                        {p ? p.name : a.problemId} {p && <span className="text-sm text-muted-foreground">({p.grade})</span>}
                      </div>
                    </div>
                    <ResultBadge result={a.result} />
                  </div>
                  <div className="flex items-center gap-2">
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
                      <option value="fail">Fail</option>
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
