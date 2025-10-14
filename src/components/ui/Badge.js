"use client";

export default function Badge({ children, className = "", tone = "muted" }) {
  const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium fade-in-up";
  const tones = {
    muted: `bg-transparent border px-2 py-0.5 text-muted`,
    success: `bg-green-600 text-white`,
    danger: `bg-red-600 text-white`,
  };
  return <span className={`${base} ${tones[tone] || tones.muted} ${className}`}>{children}</span>;
}

