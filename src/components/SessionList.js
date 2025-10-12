"use client";

import { useEffect, useState } from "react";
import { getAll } from "../lib/storage";

function fmtDate(iso) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function SessionList() {
  const [sessions, setSessions] = useState([]);
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([getAll("sessions"), getAll("problems")]).then(([slist, plist]) => {
      if (!mounted) return;
      setSessions((slist || []).slice().reverse());
      setProblems(plist || []);
    });
    return () => (mounted = false);
  }, []);

  const findProblem = (id) => problems.find((p) => p.id === id);

  if (!sessions.length) return <p className="text-sm text-muted-foreground">No sessions yet.</p>;

  return (
    <ul className="grid gap-3">
      {sessions.map((s) => (
        <li key={s.id} className="p-3 border rounded">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="font-semibold">{fmtDate(s.date)}</div>
              {s.location && <div className="text-sm text-muted-foreground">{s.location}</div>}
              {s.notes && <div className="mt-2 text-sm">{s.notes}</div>}
            </div>
            <div className="text-sm">
              <div className="font-medium">Attempts</div>
              <ul className="mt-1">
                {(s.attempts || []).map((a) => {
                  const p = findProblem(a.boulderId);
                  return (
                    <li key={a.id} className="mt-1">
                      <span className="font-semibold">{p ? p.name : a.boulderId}</span>
                      <span className="text-muted-foreground"> — {a.result}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
