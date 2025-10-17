"use client";

import { useEffect, useState } from "react";
import { ACHIEVEMENTS } from "../lib/achievements";
import { getSetting, setSetting, getAll } from "../lib/storage";

export default function AchievementList({ showDebug = false }) {
  const [unlocked, setUnlocked] = useState([]);

  // Load unlocked achievement IDs from persistent settings on mount
  useEffect(() => {
    let mounted = true;
    getSetting("achievementsUnlocked", []).then((arr) => {
      if (!mounted) return;
      setUnlocked(Array.isArray(arr) ? arr : []);
    });
    // refresh when other parts of the app broadcast updates
    function onUpdated() {
      getSetting("achievementsUnlocked", []).then((arr) => setUnlocked(Array.isArray(arr) ? arr : []));
    }
    window.addEventListener('cruxlog:achievements:updated', onUpdated);
    return () => (mounted = false);
  }, []);

  const isUnlocked = (id) => unlocked.includes(id);

  async function unlock(id) {
    if (isUnlocked(id)) return;
    const next = [...unlocked, id];
    setUnlocked(next);
    await setSetting("achievementsUnlocked", next);
    // award XP for achievement
    try {
      const { getSetting: g, setSetting: s } = await import("../lib/storage");
      const current = Number(await g("xp", 0)) || 0;
      const ach = ACHIEVEMENTS.find((a) => a.id === id);
      if (ach) {
        await s("xp", current + ach.xp);
      }
    } catch (e) {
      // noop
    }
  }

  async function unlockAll() {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    setUnlocked(ids);
    await setSetting("achievementsUnlocked", ids);
    // award all XP (not ideal for production but useful for testing)
    const total = ACHIEVEMENTS.reduce((sum, a) => sum + a.xp, 0);
    const { getSetting: g, setSetting: s } = await import("../lib/storage");
    const current = Number(await g("xp", 0)) || 0;
    await s("xp", current + total);
  }

  // Group by category
  const grouped = ACHIEVEMENTS.reduce((acc, a) => {
    (acc[a.category] = acc[a.category] || []).push(a);
    return acc;
  }, {});

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">Achievements</h3>
      <div className="grid grid-cols-1 gap-3">
        {Object.keys(grouped).map((cat) => (
          <div key={cat} className="card p-3">
            <div className="text-sm font-semibold mb-2">{cat}</div>
            <div className="grid grid-cols-1 gap-2">
              {grouped[cat].map((a) => (
                <div
                  key={a.id}
                  className={`flex items-center justify-between p-2 rounded border ${isUnlocked(a.id) ? 'bg-success/10 border-success' : 'opacity-60 bg-transparent border-transparent'}`}>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl" aria-hidden>
                      {isUnlocked(a.id) ? a.emoji : '🔒'}
                    </div>
                    <div>
                      <div className="font-semibold">{a.name}</div>
                      <div className="text-xs text-muted">{a.desc}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm">{isUnlocked(a.id) ? `+${a.xp} XP` : ''}</div>
                    {showDebug && !isUnlocked(a.id) ? (
                      <button className="btn-link text-xs mt-1" onClick={() => unlock(a.id)}>Unlock</button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showDebug ? (
        <div className="mt-3 text-xs text-muted">Debug: <button className="btn-link" onClick={unlockAll}>Unlock all</button></div>
      ) : null}
    </div>
  );
}
