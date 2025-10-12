"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAll, save } from "../../../lib/storage";
import { makeSession, makeAttempt } from "../../../lib/schema";

export default function NewSession() {
  const [boulders, setBoulders] = useState([]);
  const [selected, setSelected] = useState("");
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    getAll("boulders").then(setBoulders);
  }, []);

  function addAttempt() {
    if (!selected) return;
    const a = makeAttempt({ boulderId: selected, result: "attempt" });
    setAttempts((s) => [a, ...s]);
  }

  async function saveSession() {
    const s = makeSession({ attempts });
    await save("sessions", s);
    setAttempts([]);
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
          <option value="">Select boulder</option>
          {boulders.map((b) => (
            <option key={b.id} value={b.id}>{b.name} — {b.grade}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button onClick={addAttempt} className="px-4 py-2 bg-foreground text-background rounded">Add Attempt</button>
          <button onClick={saveSession} className="px-4 py-2 border rounded">Save Session</button>
        </div>

        <div>
          <h3 className="font-semibold">Attempts</h3>
          <ul className="mt-2 grid gap-2">
            {attempts.map((a) => (
              <li key={a.id} className="p-2 border rounded">{a.boulderId} • {a.result}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
