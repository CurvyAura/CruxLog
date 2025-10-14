"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAll, remove, put } from "../../../lib/storage";
import ConfirmDialog from "../../../components/ConfirmDialog";

/**
 * ManageSessions page
 * - Lists saved sessions and allows deleting sessions or toggling attempt results.
 * - Delete shows a confirmation dialog before performing the destructive action.
 */
export default function ManageSessions() {
  const [sessions, setSessions] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, sessionId: null });

  useEffect(() => {
    getAll("sessions").then((s) => setSessions((s || []).slice().reverse()));
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

  // Toggle between 'send' and 'fail' for an attempt and persist the session.
  async function toggleAttemptResult(sessionId, attemptId) {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    const attempts = session.attempts.map((a) => (a.id === attemptId ? { ...a, result: a.result === "send" ? "fail" : "send" } : a));
    await put("sessions", sessionId, { attempts });
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
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{new Date(s.date).toLocaleString()}</div>
                {s.location && <div className="text-sm text-muted-foreground">{s.location}</div>}
                <div className="mt-2 text-sm">Attempts:</div>
                <ul className="ml-4 mt-1 text-sm">
                  {s.attempts.map((a) => (
                    <li key={a.id} className="flex items-center gap-3">
                      <span>{a.result}</span>
                      <button onClick={() => toggleAttemptResult(s.id, a.id)} className="text-xs px-2 py-1 border rounded">Toggle</button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => deleteSession(s.id)} className="px-3 py-1 border rounded text-sm">Delete</button>
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
