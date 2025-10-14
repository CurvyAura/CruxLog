"use client";

import { useEffect, useState, useRef } from "react";
import { getAll, remove, put } from "../lib/storage";
import ConfirmDialog from "./ConfirmDialog";
import Button from "./ui/Button";
import Input from "./ui/Input";

/**
 * ProblemList
 * - Displays saved problems.
 * - Supports long-press to confirm deletion (mobile-friendly).
 * - Provides a completed checkbox which sets/clears `completedDate` via `put`.
 */
export default function ProblemList({ limit = null, refreshKey = null }) {
  const [problems, setProblems] = useState([]);
  const [gradePrefix, setGradePrefix] = useState("C");
  const [confirm, setConfirm] = useState({ open: false, problemId: null });
  const longPressRefs = useRef({});

  // Load problems once on mount. Reverse so newest appear first.
  // Load problems on mount and when refreshKey changes. Reverse so newest appear first.
  useEffect(() => {
    let mounted = true;
    getAll("problems").then((list) => {
      if (!mounted) return;
      const ordered = (list || []).slice().sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setProblems(limit && Number.isInteger(limit) ? ordered.slice(0, limit) : ordered);
    });

    // Also listen for global updates so other components can trigger a refresh
    function onUpdated() {
      getAll("problems").then((list) => {
        if (!mounted) return;
        const ordered = (list || []).slice().sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setProblems(limit && Number.isInteger(limit) ? ordered.slice(0, limit) : ordered);
      });
    }

    window.addEventListener("cruxlog:problems:updated", onUpdated);

    // load app setting for grade prefix
    import("../lib/storage").then(({ getSetting }) => {
      getSetting("gradePrefix", "C").then((v) => {
        if (!mounted) return;
        setGradePrefix(v || "C");
      });
    });

    return () => {
      mounted = false;
      window.removeEventListener("cruxlog:problems:updated", onUpdated);
    };
  }, [limit, refreshKey]);

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
    return <p className="text-sm muted">No problems yet.</p>;
  }

  return (
    <>
      <ul className="grid gap-3">
        {problems.map((p) => (
          <li
            key={p.id}
            className="card p-3"
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
                <label
                  className={`switch ${p.completedDate ? "checked" : ""}`}
                  title={p.completedDate ? "Mark as not completed" : "Mark as completed"}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={!!p.completedDate}
                    onChange={async (e) => {
                      e.stopPropagation();
                      const completedDate = e.target.checked ? new Date().toISOString() : null;
                      await put("problems", p.id, { completedDate });
                      setProblems((s) => s.map((x) => (x.id === p.id ? { ...x, completedDate } : x)));
                    }}
                    aria-label={p.completedDate ? "Mark as not completed" : "Mark as completed"}
                  />
                  <span className="switch-track">
                    <span className="switch-thumb" />
                  </span>
                </label>
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm muted">{p.grade} • {p.area}</div>
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
                      <div className="text-sm muted mt-1">Not completed</div>
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
