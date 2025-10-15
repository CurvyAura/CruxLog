"use client";

import { useEffect, useState } from "react";
import { getAll } from "../lib/storage";
import Button from "./ui/Button";

// Map grades like 'C1'..'C9' to numeric values 1..9. Falls back to null for unknowns.
function gradeToNumber(g) {
  if (!g || typeof g !== "string") return null;
  // Extract any numeric portion from the grade string (supports C1..C9, V0..V16, etc.)
  const m = g.match(/(\d+)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

// Compute average numeric grade for a session by looking up the problems referenced in attempts
// and averaging their grade numbers. Sessions without numeric-grade attempts are filtered out.
function computeSessionAverages(sessions, problemsById, gradePrefix = null) {
  return sessions
    .map((s) => {
      // Only consider attempts that resulted in a send (completed)
      const vals = (s.attempts || [])
        .filter((a) => a.result === "send")
        .map((a) => {
          const p = problemsById[a.problemId];
          // If a gradePrefix is specified, only consider problems matching that prefix
          if (!p) return null;
          if (gradePrefix && !(p.grade && String(p.grade).startsWith(gradePrefix))) return null;
          return gradeToNumber(p.grade);
        })
        .filter((v) => v != null);
      if (!vals.length) return null;
      const avg = vals.reduce((sum, v) => sum + v, 0) / vals.length;
      const max = Math.max(...vals);
      // Also return the raw numeric grades used so callers can build histograms
      return { date: s.date, avg, max, grades: vals };
    })
    .filter((x) => x && Number.isFinite(x.avg))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Small responsive SVG line chart. Accepts data: [{date, avg}, ...]
export default function InsightsChart({ width = 600, height = 160 }) {
  const [data, setData] = useState([]);
  const [range, setRange] = useState("30d"); // options: 7d, 30d, 1y, all
  const [selectedIdx, setSelectedIdx] = useState(null); // index of clicked/tapped point
  const [gradePrefix, setGradePrefix] = useState("C");

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [slist, plist] = await Promise.all([getAll("sessions"), getAll("problems")]);
      if (!mounted) return;
      const problemsById = (plist || []).reduce((acc, p) => ((acc[p.id] = p), acc), {});
      const points = computeSessionAverages(slist || [], problemsById, gradePrefix);
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
  }, [gradePrefix]);

  // Load gradePrefix setting so labels/axes use the user's chosen system
  useEffect(() => {
    let mounted = true;
    import("../lib/storage").then(({ getSetting }) => {
      getSetting("gradePrefix", "C").then((v) => {
        if (!mounted) return;
        setGradePrefix(v || "C");
      });
    });
    return () => (mounted = false);
  }, []);

  if (!data.length) {
    return <p className="text-sm text-muted-foreground">No graded attempts for {gradePrefix} grades yet.</p>;
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
  // compute highest grade (numeric) among filtered sessions (if any)
  const highestNumeric = filtered.length ? Math.max(...filtered.map((d) => (d.max != null ? d.max : -Infinity))) : null;
  const highestDisplay = highestNumeric != null && Number.isFinite(highestNumeric) && highestNumeric !== -Infinity ? `${gradePrefix}${highestNumeric}` : "—";

  if (!filtered.length) {
    return (
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex gap-2">
          {[("7d"), ("30d"), ("1y"), ("all")].map((r) => (
            <Button key={r} className="text-xs px-2 py-1" variant={range === r ? "default" : "ghost"} onClick={() => setRange(r)}>
              {r === "7d" ? "Last 7d" : r === "30d" ? "Last 30d" : r === "1y" ? "Last year" : "All"}
            </Button>
          ))}
          </div>
          <div className="text-sm text-muted-foreground">Sessions: 0 • Highest: {highestDisplay}</div>
        </div>
        <p className="text-sm text-muted-foreground">No sessions in this range.</p>
      </div>
    );
  }

  const sessionCount = filtered.length;
  // Determine sensible grade bounds depending on grade prefix system
  const prefixRange = gradePrefix === "V" ? { min: 0, max: 16 } : { min: 1, max: 9 };

  // Build histogram counts per numeric grade for the filtered sessions
  const gradeCounts = (() => {
    const counts = {};
    for (let g = prefixRange.min; g <= prefixRange.max; g++) counts[g] = 0;
    filtered.forEach((d) => {
      if (!d.grades || !d.grades.length) return;
      d.grades.forEach((n) => {
        if (n >= prefixRange.min && n <= prefixRange.max) counts[n] = (counts[n] || 0) + 1;
      });
    });
    return counts;
  })();
  const maxCount = Math.max(...Object.values(gradeCounts));

  // Build simple scales with separate paddings so axis labels fit inside the viewBox
  const leftPad = 25; // reserve space for y-axis labels (reduced to align with histogram)
  const rightPad = 12;
  const topPad = 12;
  const bottomPad = 28; // reserve space for x-axis labels
  const innerW = width - leftPad - rightPad;
  const innerH = height - topPad - bottomPad;

  const dates = filtered.map((d) => new Date(d.date).getTime());
  const avgs = filtered.map((d) => d.avg);
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const minY = Math.max(prefixRange.min, Math.floor(Math.min(...avgs) - 0.5));
  const maxY = Math.min(prefixRange.max, Math.ceil(Math.max(...avgs) + 0.5));

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
        <div className="text-sm text-muted-foreground">Sessions: {sessionCount} • Highest: {highestDisplay}</div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="xMidYMid meet">
        {/* grid lines and y-axis labels */}
        {[...Array(maxY - minY + 1)].map((_, i) => {
          const yVal = minY + i;
          const y = yFor(yVal);
          return (
            <g key={i}>
              <line x1={leftPad} x2={width - rightPad} y1={y} y2={y} stroke="#2b2b2b" strokeOpacity="0.12" />
              <text x={leftPad - 8} y={y} fontSize="14" fill="var(--muted)" textAnchor="end" dominantBaseline="middle">{`${gradePrefix}${yVal}`}</text>
            </g>
          );
        })}

  {/* polyline */}
  <polyline fill="none" stroke="var(--primary)" strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />

        {/* points */}

        {filtered.map((d, i) => (
          <circle
            key={i}
            cx={xFor(new Date(d.date).getTime())}
            cy={yFor(d.avg)}
            r={4}
            fill="var(--primary)"
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

      {/* Histogram: counts per numeric grade */}
      <div className="mt-3 grid grid-cols-1 gap-1">
        {Object.keys(gradeCounts)
          .map((k) => Number(k))
          .sort((a, b) => a - b)
          .map((g) => {
            const cnt = gradeCounts[g] || 0;
            const pct = maxCount ? Math.round((cnt / maxCount) * 100) : 0;
            return (
              <div key={g} className="flex items-center gap-3 text-sm">
                <div className="w-12" style={{ color: "var(--muted)" }}>{`${gradePrefix}${g}`}</div>
                  <div className="flex-1 flex items-center bg-transparent">
                    <div style={{ width: `${pct}%`, background: "var(--primary)" }} className="h-3 rounded" />
                  </div>
                  <div className="w-8 text-right" style={{ color: "var(--muted)", lineHeight: "1" }}>{cnt}</div>
              </div>
            );
          })}
      </div>
      
    </div>
  );
}
