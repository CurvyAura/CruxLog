"use client";

import { useEffect, useState, useRef } from "react";
import { getAll, remove, put } from "../lib/storage";
import ConfirmDialog from "./ConfirmDialog";

/**
 * ProblemList
 * - Displays saved problems.
 * - Supports long-press to confirm deletion (mobile-friendly).
 * - Provides a completed checkbox which sets/clears `completedDate` via `put`.
 */
export default function ProblemList() {
  const [problems, setProblems] = useState([]);
  const [confirm, setConfirm] = useState({ open: false, problemId: null });
  const longPressRefs = useRef({});

  // Load problems once on mount. Reverse so newest appear first.
  useEffect(() => {
    let mounted = true;
    getAll("problems").then((list) => {
      if (mounted) setProblems(list.reverse());
    });
    return () => (mounted = false);
  }, []);

  // Long-press helpers: start a timer on pointer down and clear on up/leave.
  function startLongPress(id) {
    const key = `p:${id}`;
    clearTimeout(longPressRefs.current[key]);
    longPressRefs.current[key] = setTimeout(() => {
      setConfirm({ open: true, problemId: id });
    }, 700);
  }

  function cancelLongPress(id) {
    const key = `p:${id}`;
    clearTimeout(longPressRefs.current[key]);
  }

  // Delete confirmed problem and update local state
  function handleConfirmDelete() {
    const { problemId } = confirm;
    remove("problems", problemId).then(() => {
      setProblems((s) => s.filter((p) => p.id !== problemId));
      setConfirm({ open: false, problemId: null });
    });
  }

  if (!problems.length) {
    return <p className="text-sm text-muted-foreground">No problems yet.</p>;
  }

  return (
    <>
      <ul className="grid gap-2">
        {problems.map((p) => (
          <li
            key={p.id}
            className="p-3 border rounded"
            onMouseDown={() => startLongPress(p.id)}
            onMouseUp={() => cancelLongPress(p.id)}
            onMouseLeave={() => cancelLongPress(p.id)}
            onTouchStart={() => startLongPress(p.id)}
            onTouchEnd={() => cancelLongPress(p.id)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {/* Accessible toggle button that replaces the native checkbox.
                    - role="switch" and aria-checked provide screen reader semantics.
                    - stopPropagation prevents the list-item long-press from also firing.
                */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!p.completedDate}
                  title={p.completedDate ? "Mark as not completed" : "Mark as completed"}
                  className={
                    `inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors ` +
                    (p.completedDate ? "bg-green-600 text-white" : "border bg-white text-gray-700")
                  }
                  onClick={async (e) => {
                    e.stopPropagation();
                    const completedDate = p.completedDate ? null : new Date().toISOString();
                    await put("problems", p.id, { completedDate });
                    setProblems((s) => s.map((x) => (x.id === p.id ? { ...x, completedDate } : x)));
                  }}
                >
                  {p.completedDate ? (
                    // Check SVG
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    // Plus / empty circle to indicate incomplete (subtle)
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                      <circle cx="12" cy="12" r="9" strokeWidth="2" />
                    </svg>
                  )}
                </button>
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{p.grade} • {p.area}</div>
                  {p.completedDate ? (
                    <div className="mt-1 flex items-center gap-2">
                      <label className="sr-only">Completed date</label>
                      <input
                        type="date"
                        value={new Date(p.completedDate).toISOString().slice(0, 10)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={async (e) => {
                          e.stopPropagation();
                          const val = e.target.value;
                          const iso = val ? new Date(val).toISOString() : null;
                          await put("problems", p.id, { completedDate: iso });
                          setProblems((s) => s.map((x) => (x.id === p.id ? { ...x, completedDate: iso } : x)));
                        }}
                        className="border rounded p-1 text-sm"
                      />
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground mt-1">Not completed</div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={confirm.open}
        title="Delete problem"
        message="Are you sure you want to delete this problem? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirm({ open: false, problemId: null })}
      />
    </>
  );
}
