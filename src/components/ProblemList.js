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
                <input
                  type="checkbox"
                  checked={!!p.completedDate}
                  onChange={async (e) => {
                    // Toggle completed state. When checked, set current timestamp; when unchecked, clear it.
                    const completedDate = e.target.checked ? new Date().toISOString() : null;
                    await put("problems", p.id, { completedDate });
                    setProblems((s) => s.map((x) => (x.id === p.id ? { ...x, completedDate } : x)));
                  }}
                />
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{p.grade} • {p.area} • {p.completedDate ? new Date(p.completedDate).toLocaleDateString() : "Not completed"}</div>
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
