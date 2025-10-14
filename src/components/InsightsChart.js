"use client";

import { useEffect, useState } from "react";
import { getAll } from "../lib/storage";

// Map grades like 'C1'..'C9' to numeric values 1..9. Falls back to null for unknowns.
function gradeToNumber(g) {
  if (!g || typeof g !== "string") return null;
  const m = g.match(/C(\d+)/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

// Compute average numeric grade for a session by looking up the problems referenced in attempts
// and averaging their grade numbers. Sessions without numeric-grade attempts are filtered out.
function computeSessionAverages(sessions, problemsById) {
  return sessions
    .map((s) => {
      const vals = (s.attempts || [])
        .map((a) => {
          const p = problemsById[a.problemId];
          return p ? gradeToNumber(p.grade) : null;
        })
        .filter((v) => v != null);
      if (!vals.length) return null;
      const avg = vals.reduce((sum, v) => sum + v, 0) / vals.length;
      return { date: s.date, avg };
    })
    .filter((x) => x && Number.isFinite(x.avg))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Small responsive SVG line chart. Accepts data: [{date, avg}, ...]
export default function InsightsChart({ width = 600, height = 160 }) {
  const [data, setData] = useState([]);
  const [range, setRange] = useState("30d"); // options: 7d, 30d, 1y, all
  const [selectedIdx, setSelectedIdx] = useState(null); // index of clicked/tapped point

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [slist, plist] = await Promise.all([getAll("sessions"), getAll("problems")]);
      if (!mounted) return;
      const problemsById = (plist || []).reduce((acc, p) => ((acc[p.id] = p), acc), {});
      const points = computeSessionAverages(slist || [], problemsById);
      setData(points);
    }

    load();

    function onUpdated() {
      load();
    }

    window.addEventListener("cruxlog:sessions:updated", onUpdated);

    return () => {
      mounted = false;
      window.removeEventListener("cruxlog:sessions:updated", onUpdated);
    };
  }, []);

  if (!data.length) {
    return <p className="text-sm text-muted-foreground">Not enough graded attempts yet to chart.</p>;
  }

  // filter data by selected range
  const now = Date.now();
  const ranges = {
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
    "1y": 365 * 24 * 60 * 60 * 1000,
    all: Infinity,
  };
  const cutoff = range === "all" ? -Infinity : now - ranges[range];
  const filtered = data.filter((d) => new Date(d.date).getTime() >= cutoff);
  if (!filtered.length) {
    return (
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex gap-2">
          {[("7d"), ("30d"), ("1y"), ("all")].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-1 text-xs rounded ${range === r ? "bg-gray-800 text-white" : "bg-transparent text-muted-foreground border"}`}
            >
              {r === "7d" ? "Last 7d" : r === "30d" ? "Last 30d" : r === "1y" ? "Last year" : "All"}
            </button>
          ))}
          </div>
          <div className="text-sm text-muted-foreground">Sessions: 0</div>
        </div>
        <p className="text-sm text-muted-foreground">No sessions in this range.</p>
      </div>
    );
  }

  const sessionCount = filtered.length;

  // Build simple scales with separate paddings so axis labels fit inside the viewBox
  const leftPad = 40; // reserve space for y-axis labels
  const rightPad = 12;
  const topPad = 12;
  const bottomPad = 28; // reserve space for x-axis labels
  const innerW = width - leftPad - rightPad;
  const innerH = height - topPad - bottomPad;

  const dates = filtered.map((d) => new Date(d.date).getTime());
  const avgs = filtered.map((d) => d.avg);
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const minY = Math.max(1, Math.floor(Math.min(...avgs) - 0.5));
  const maxY = Math.min(9, Math.ceil(Math.max(...avgs) + 0.5));

  const xFor = (t) => ((t - minDate) / (maxDate - minDate || 1)) * innerW + leftPad;
  const yFor = (v) => (topPad + innerH - ((v - minY) / (maxY - minY || 1)) * innerH);

  const points = filtered.map((d) => `${xFor(new Date(d.date).getTime()).toFixed(1)},${yFor(d.avg).toFixed(1)}`).join(" ");

  // Prepare x-axis ticks (up to 4 labels) and formatter
  const fmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
  const tickCount = Math.min(4, filtered.length);
  const tickIndices = Array.from({ length: tickCount }, (_, i) => Math.round((i * (filtered.length - 1)) / Math.max(1, tickCount - 1)));
  const xTicks = tickIndices.map((idx) => ({
    t: new Date(filtered[idx].date).getTime(),
    label: fmt.format(new Date(filtered[idx].date)),
  }));

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex gap-2">
          {["7d", "30d", "1y", "all"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-1 text-xs rounded ${range === r ? "bg-gray-800 text-white" : "bg-transparent text-muted-foreground border"}`}
            >
              {r === "7d" ? "Last 7d" : r === "30d" ? "Last 30d" : r === "1y" ? "Last year" : "All"}
            </button>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">Sessions: {sessionCount}</div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="xMidYMid meet">
        {/* grid lines and y-axis labels */}
        {[...Array(maxY - minY + 1)].map((_, i) => {
          const yVal = minY + i;
          const y = yFor(yVal);
          return (
            <g key={i}>
              <line x1={leftPad} x2={width - rightPad} y1={y} y2={y} stroke="#2b2b2b" strokeOpacity="0.12" />
              <text x={leftPad - 8} y={y + 4} fontSize="10" fill="#9ca3af" textAnchor="end">{`C${yVal}`}</text>
            </g>
          );
        })}

        {/* polyline */}
        <polyline fill="none" stroke="#10b981" strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />

        {/* points */}

        {filtered.map((d, i) => (
          <circle
            key={i}
            cx={xFor(new Date(d.date).getTime())}
            cy={yFor(d.avg)}
            r={4}
            fill="#10b981"
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIdx(i === selectedIdx ? null : i);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              setSelectedIdx(i === selectedIdx ? null : i);
            }}
          />
        ))}
        {/* tooltip for selected point (shown on click/tap) */}
        {selectedIdx != null && filtered[selectedIdx] && (() => {
          const d = filtered[selectedIdx];
          const px = xFor(new Date(d.date).getTime());
          const py = yFor(d.avg);
          const label = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(d.date));
          const pad = 6;
          // clamp tooltip inside chart area
          const tx = Math.max(leftPad + pad, Math.min(width - rightPad - pad - 80, px - 40));
          const ty = Math.max(topPad + 8, py - 28);
          const rectW = 90;
          const rectH = 20;
          return (
            <g>
              <line x1={px} x2={px} y1={py} y2={topPad + innerH} stroke="#6b7280" strokeOpacity="0.2" strokeDasharray="2 2" />
              <g transform={`translate(${tx}, ${ty})`}>
                <rect x={0} y={0} rx={6} ry={6} width={rectW} height={rectH} fill="#111827" fillOpacity={0.95} />
                <text x={rectW / 2} y={rectH / 2 + 4} fontSize="11" fill="#fff" textAnchor="middle">{label}</text>
              </g>
            </g>
          );
        })()}
      </svg>
      <div className="mt-2 text-xs text-muted-foreground">
        <span className="font-medium">Avg grade</span> over time (C1 low → C9 high)
      </div>
    </div>
  );
}
