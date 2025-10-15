"use client";

import { useEffect, useState } from "react";
import { getSetting } from "../lib/storage";

const LEVELS = [
  { 
    lvl: 1, 
    name: "Base Camper", 
    emoji: "🏕️", 
    min: 0, 
    max: 99, 
    desc: "Setting out on your journey — every climb starts with the first move."
  },
  { 
    lvl: 2, 
    name: "Trail Scout", 
    emoji: "🥾", 
    min: 100, 
    max: 249, 
    desc: "Learning the ropes, finding your rhythm, and chasing that next hold."
  },
  { 
    lvl: 3, 
    name: "Rock Hopper", 
    emoji: "🪨", 
    min: 250, 
    max: 499, 
    desc: "Confidence is growing — movement feels smoother and flow begins to form."
  },
  { 
    lvl: 4, 
    name: "Cliff Climber", 
    emoji: "🧗‍♂️", 
    min: 500, 
    max: 799, 
    desc: "You’re pushing limits and discovering what you’re really capable of."
  },
  { 
    lvl: 5, 
    name: "Summit Seeker", 
    emoji: "🏔️", 
    min: 800, 
    max: 1199, 
    desc: "You’re chasing goals, refining beta, and starting to own the wall."
  },
  { 
    lvl: 6, 
    name: "Crux Crusher", 
    emoji: "💥", 
    min: 1200, 
    max: 1699, 
    desc: "Tough problems don’t scare you — you attack the crux with purpose."
  },
  { 
    lvl: 7, 
    name: "Route Ranger", 
    emoji: "🧭", 
    min: 1700, 
    max: 2299, 
    desc: "You read routes like a map — efficient, precise, and deliberate."
  },
  { 
    lvl: 8, 
    name: "Beta Master", 
    emoji: "📜", 
    min: 2300, 
    max: 2999, 
    desc: "Your climbing knowledge shines — you see sequences others miss."
  },
  { 
    lvl: 9, 
    name: "Peak Prodigy", 
    emoji: "⛰️", 
    min: 3000, 
    max: 3999, 
    desc: "Everything clicks — balance, strength, and focus merge into flow."
  },
  { 
    lvl: 10, 
    name: "Legend of the Wall", 
    emoji: "🐉", 
    min: 4000, 
    max: Infinity, 
    desc: "You move with mastery — every climb tells a story of skill and grit."
  },
];


function getLevelForXP(xp) {
  const val = Math.max(0, Number(xp) || 0);
  return LEVELS.find((l) => val >= l.min && val <= l.max) || LEVELS[0];
}

export default function LevelCard() {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(LEVELS[0]);

  useEffect(() => {
    let mounted = true;
    getSetting("xp", 0).then((v) => {
      if (!mounted) return;
      const val = Number(v) || 0;
      setXp(val);
      setLevel(getLevelForXP(val));
    });
    return () => (mounted = false);
  }, []);

  // progress within current level
  const min = level.min;
  const max = level.max === Infinity ? level.min : level.max;
  const range = max - min;
  const progress = range === 0 ? 100 : Math.min(100, Math.round(((xp - min) / range) * 100));

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted">Level</div>
          <div className="flex items-baseline gap-3">
            <div className="text-3xl font-bold">{level.lvl}</div>
            <div className="text-lg font-semibold">{level.name}</div>
            <div className="text-2xl" aria-hidden>
              {level.emoji}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted">XP</div>
          <div className="font-mono font-semibold">{xp.toLocaleString()}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="w-full bg-[var(--border)] h-3 rounded overflow-hidden">
          <div
            className="h-3 rounded"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg,var(--primary),var(--primary-contrast))' }}
            aria-hidden
          />
        </div>
        <div className="flex justify-between text-xs text-muted mt-1">
          <div>{min.toLocaleString()}</div>
          <div>{level.max === Infinity ? `+` : max.toLocaleString()}</div>
        </div>
      </div>

      <p className="text-sm text-muted mt-3">{level.desc}</p>
    </div>
  );
}
