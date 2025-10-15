"use client";

import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

let root = null;

function Toast({ id, message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      role="status"
      style={{
        background: "var(--primary)",
        color: "var(--primary-contrast)",
        padding: "12px 18px",
        borderRadius: 10,
        boxShadow: "var(--shadow-md)",
        fontWeight: 700,
        display: "inline-block",
        maxWidth: "min(92vw, 720px)",
      }}
    >
      {message}
    </div>
  );
}

function PortalApp() {
  const [toasts, setToasts] = useState([]);

  function addToast(msg) {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((s) => [...s, { id, msg }]);
    return id;
  }

  function removeToast(id) {
    setToasts((s) => s.filter((t) => t.id !== id));
  }

  // Expose global helper
  useEffect(() => {
    window.__crux_toast_add = addToast;
  }, []);

  return (
    <div style={{ position: "fixed", left: 0, right: 0, top: "calc(env(safe-area-inset-top, 0px) + 16px)", display: "flex", justifyContent: "center", zIndex: 9999, pointerEvents: "none" }}>
      <div style={{ pointerEvents: "auto" }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ marginTop: 8 }}>
            <Toast id={t.id} message={t.msg} onClose={() => removeToast(t.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ensureToastRoot() {
  if (typeof document === "undefined") return;
  if (!root) {
    const el = document.createElement("div");
    el.id = "__crux_toast_root";
    document.body.appendChild(el);
    root = createRoot(el);
    root.render(<PortalApp />);
  }
}

export function showToast(message) {
  if (typeof window === "undefined") return;
  ensureToastRoot();
  // give PortalApp a tick to mount
  setTimeout(() => {
    if (window.__crux_toast_add) window.__crux_toast_add(message);
  }, 0);
}

export default function ToastPortal() {
  useEffect(() => ensureToastRoot(), []);
  return null;
}
