"use client";

import { useEffect, useState, useRef } from "react";
import { getAll, put, remove } from "../lib/storage";
import ConfirmDialog from "./ConfirmDialog";
import ResultBadge from "./ResultBadge";

// Format session date for display with locale-sensitive formatting.
function fmtDate(iso) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/**
 * SessionList
 * - Loads sessions and problems and displays recent sessions.
 * - Provides long-press deletion for individual attempts; if a session loses
 *   all attempts it's removed entirely.
 */
export default function SessionList() {
  const [sessions, setSessions] = useState([]);
  const [problems, setProblems] = useState([]);

  // Load sessions and problems on mount.
  useEffect(() => {
    let mounted = true;
    Promise.all([getAll("sessions"), getAll("problems")]).then(([slist, plist]) => {
      if (!mounted) return;
      setSessions((slist || []).slice().reverse());
      setProblems(plist || []);
    });
    return () => (mounted = false);
  }, []);

  // Small helper to find a problem by id to show its name in attempts list.
  const findProblem = (id) => problems.find((p) => p.id === id);

  const longPressRefs = useRef({});
  const [confirm, setConfirm] = useState({ open: false, sessionId: null, attemptId: null });

  // Long-press flow: set a timer to open confirmation dialog instead of immediate delete.
  function startLongPress(sessionId, attemptId) {
    const key = `${sessionId}:${attemptId}`;
    clearTimeout(longPressRefs.current[key]);
    longPressRefs.current[key] = setTimeout(() => {
      // open confirm dialog instead of immediate delete
      setConfirm({ open: true, sessionId, attemptId });
    }, 700);
  }

  function cancelLongPress(sessionId, attemptId) {
    const key = `${sessionId}:${attemptId}`;
    clearTimeout(longPressRefs.current[key]);
  }

  // When deletion is confirmed, either remove the attempt or remove the whole session
  // if no attempts remain.
  function handleConfirmDelete() {
    const { sessionId, attemptId } = confirm;
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return setConfirm({ open: false, sessionId: null, attemptId: null });
    const attempts = (session.attempts || []).filter((a) => a.id !== attemptId);
    if (!attempts.length) {
      // remove entire session
      remove("sessions", sessionId).then(() => {
        setSessions((ss) => ss.filter((x) => x.id !== sessionId));
        setConfirm({ open: false, sessionId: null, attemptId: null });
      });
    } else {
      put("sessions", sessionId, { attempts }).then(() => {
        setSessions((ss) => ss.map((x) => (x.id === sessionId ? { ...x, attempts } : x)));
        setConfirm({ open: false, sessionId: null, attemptId: null });
      });
    }
  }

  if (!sessions.length) return <p className="text-sm text-muted-foreground">No sessions yet.</p>;

  return (
    <>
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
                  const p = findProblem(a.problemId);
                  return (
                    <li
                      key={a.id}
                      className="mt-1 flex items-center gap-2"
                      onMouseDown={() => startLongPress(s.id, a.id)}
                      onMouseUp={() => cancelLongPress(s.id, a.id)}
                      onMouseLeave={() => cancelLongPress(s.id, a.id)}
                      onTouchStart={() => startLongPress(s.id, a.id)}
                      onTouchEnd={() => cancelLongPress(s.id, a.id)}
                    >
                      <span className="font-semibold">{p ? p.name : a.problemId}</span>
                      <ResultBadge result={a.result} />
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </li>
      ))}
    </ul>
      <ConfirmDialog
        open={confirm.open}
        title="Delete attempt"
        message="Are you sure you want to delete this attempt? If this was the only attempt in the session the entire session will be removed."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirm({ open: false, sessionId: null, attemptId: null })}
      />
    </>
  );
}
