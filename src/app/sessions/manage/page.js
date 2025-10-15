"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAll, remove, put } from "../../../lib/storage";
import ConfirmDialog from "../../../components/ConfirmDialog";
import Button from "../../../components/ui/Button";

/**
 * ManageSessions page
 * - Lists saved sessions and allows deleting sessions or toggling attempt results.
 * - Delete shows a confirmation dialog before performing the destructive action.
 */
export default function ManageSessions() {
  const [sessions, setSessions] = useState([]);
  const [problems, setProblems] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, sessionId: null });

  useEffect(() => {
    getAll("sessions").then((s) => setSessions((s || []).slice().reverse()));
    getAll("problems").then((p) => setProblems(p || []));
  }, []);

  async function deleteSession(id) {
    // show confirm dialog in place of immediate delete
    if (!confirmDelete.open) {
      setConfirmDelete({ open: true, sessionId: id });
      return;
    }
    await remove("sessions", id);
    setSessions((s) => s.filter((x) => x.id !== id));
    setConfirmDelete({ open: false, sessionId: null });
  }

  // Toggle between 'send' and 'attempt' for an attempt and persist the session.
  async function toggleAttemptResult(sessionId, attemptId) {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    const attempts = session.attempts.map((a) => (a.id === attemptId ? { ...a, result: a.result === "send" ? "attempt" : "send" } : a));

    // Persist the updated attempts on the session
    await put("sessions", sessionId, { attempts });

    // Also update the related problem's completedDate when toggling to 'send',
    // or clear it when toggling away from 'send'.
    const changed = attempts.find((a) => a.id === attemptId);
    if (changed) {
      const probId = changed.problemId;
      const newResult = changed.result;
      if (newResult === "send") {
        // set completedDate to the session date
        await put("problems", probId, { completedDate: session.date });
      } else {
        // clear completedDate
        await put("problems", probId, { completedDate: null });
      }
    }

    setSessions((s) => s.map((x) => (x.id === sessionId ? { ...x, attempts } : x)));
  }

  if (!sessions.length) return (
    <div className=" max-w-6xl">
      <h1 className="text-2xl font-bold mb-4">Manage Sessions</h1>
      <p className="text-sm text-muted-foreground">No sessions to manage.</p>
      <Link href="/dashboard" className="mt-4 inline-block">Back</Link>
    </div>
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Manage Sessions</h1>
      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete session"
        message="Are you sure you want to delete this session? This action cannot be undone."
        onCancel={() => setConfirmDelete({ open: false, sessionId: null })}
        onConfirm={() => deleteSession(confirmDelete.sessionId)}
      />
      <ul className="grid gap-3">
        {sessions.map((s) => (
          <li key={s.id} className="p-3 border rounded">
            <div className="flex flex-col md:flex-row md:justify-between items-start gap-3">
              <div>
                <div className="font-semibold">{new Date(s.date).toLocaleString()}</div>
                {s.location && <div className="text-sm text-muted-foreground">{s.location}</div>}
                <div className="mt-2 text-sm">Attempts:</div>
                <ul className="ml-4 mt-1 text-sm">
                  {s.attempts.map((a) => {
                      const prob = problems.find((b) => b.id === a.problemId);
                      return (
                        <li key={a.id} className="flex items-center gap-3">
                          <span className="font-medium truncate max-w-xs">{prob ? `${prob.name} (${prob.grade})` : a.problemId}</span>
                          <span className="text-sm text-muted-foreground">{a.result}</span>
                          <Button variant="ghost" onClick={() => toggleAttemptResult(s.id, a.id)} className="text-xs px-2 py-1">Toggle</Button>
                        </li>
                      );
                    })}
                </ul>
              </div>
              <div className="flex flex-col gap-2 md:items-end w-full md:w-auto">
                <Button variant="ghost" onClick={() => deleteSession(s.id)} className="px-3 py-1 text-sm">Delete</Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Link href="/dashboard">Back</Link>
      </div>
    </div>
  );
}
