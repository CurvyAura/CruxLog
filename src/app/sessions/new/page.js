"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAll, save } from "../../../lib/storage";
import { makeSession, makeAttempt } from "../../../lib/schema";
import { useRouter } from "next/navigation";
import ResultBadge from "../../../components/ResultBadge";

/**
 * NewSession page
 * - Lets the user pick problems and add attempts for a session.
 * - Attempts are accumulated locally in component state and then saved
 *   as a Session object into local storage.
 */
export default function NewSession() {
  const [problems, setProblems] = useState([]);
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState("send");
  const [attempts, setAttempts] = useState([]);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getAll("problems").then(setProblems);
  }, []);

  function addAttempt() {
    if (!selected) return;
    const a = makeAttempt({ problemId: selected, result });
    setAttempts((s) => [a, ...s]);
  }

  async function saveSession() {
    const s = makeSession({ attempts });
    await save("sessions", s);
    setAttempts([]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // navigate back to dashboard so user sees the saved session
    router.push("/dashboard");
  }

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Log Session</h1>
        <nav className="flex gap-4">
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </header>

      <div className="grid gap-4 max-w-md">
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="border p-2 rounded">
          <option value="">Select problem</option>
          {problems.map((b) => (
            <option key={b.id} value={b.id}>{b.name} — {b.grade}</option>
          ))}
        </select>
        <div className="flex gap-2 items-center">
          <select value={result} onChange={(e) => setResult(e.target.value)} className="border p-2 rounded">
            <option value="send">Send</option>
            <option value="fail">Fail</option>
            <option value="attempt">Attempt</option>
          </select>
          <button onClick={addAttempt} className="px-4 py-2 bg-foreground text-background rounded">Add Attempt</button>
          <button onClick={saveSession} className="px-4 py-2 border rounded">Save Session</button>
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
                      <div className="font-semibold">{p ? p.name : a.problemId}</div>
                      <div className="text-sm text-muted-foreground">{p ? p.grade : ""}</div>
                    </div>
                    <ResultBadge result={a.result} />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={a.result}
                      onChange={(e) => {
                        const copy = attempts.slice();
                        copy[idx] = { ...copy[idx], result: e.target.value };
                        setAttempts(copy);
                      }}
                      className="border p-1 rounded"
                    >
                      <option value="send">Send</option>
                      <option value="fail">Fail</option>
                      <option value="attempt">Attempt</option>
                    </select>
                    <button
                      onClick={() => setAttempts((s) => s.filter((_, i) => i !== idx))}
                      className="px-2 py-1 text-sm border rounded"
                      aria-label="Remove attempt"
                    >
                      Remove
                    </button>
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
