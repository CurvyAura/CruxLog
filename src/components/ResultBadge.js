"use client";

export default function ResultBadge({ result }) {
  const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
  if (result === "send") return <span className={`${base} bg-green-600 text-white`}>Send</span>;
  if (result === "fail") return <span className={`${base} bg-red-600 text-white`}>Fail</span>;
  return <span className={`${base} bg-gray-600 text-white`}>Attempt</span>;
}
