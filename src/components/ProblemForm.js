"use client";

import { useState, useEffect } from "react";
import { save, getAll, getSetting, setSetting } from "../lib/storage";
import { findAchievement } from "../lib/achievements";
import { ensureToastRoot, showToast } from "./ToastPortal";
import { makeProblem } from "../lib/schema";
import Input from "./ui/Input";
import Button from "./ui/Button";
/**
 * ProblemForm
 * - Renders a small form to create a new Problem and persist it locally.
 * - onSaved callback is called with the new problem after successful save.
 */
export default function ProblemForm({ onSaved }) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [area, setArea] = useState("");
  const [completedDate, setCompletedDate] = useState("");
  const [gradePrefix, setGradePrefix] = useState("C");

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

  // Submit handler: create a Problem object and persist it using the storage helper.
  async function submit(e) {
    e.preventDefault();
    // load existing problems to determine whether this is the first logged problem
    // and whether the area is new
    let existing = [];
    try {
      existing = await getAll("problems");
    } catch (err) {
      existing = [];
    }

    const prevCount = existing.length;
    const existingAreas = new Set(existing.map((x) => (x.area || "").trim()).filter(Boolean));

    const p = makeProblem({ name, grade, area, completedDate });
    await save("problems", p);
    // Reset form fields
    setName("");
    setGrade("");
    setArea("");
    setCompletedDate("");
    if (onSaved) onSaved(p);
    // Broadcast a global event so lists across pages can refresh immediately
    try {
      window.dispatchEvent(new CustomEvent("cruxlog:problems:updated", { detail: p }));
    } catch (err) {
      // ignore (server-side rendering won't have window)
    }

    // Achievements: check for First Grip and New Territory when creating a problem
    try {
      const unlockedNow = Array.isArray(await getSetting("achievementsUnlocked", [])) ? await getSetting("achievementsUnlocked", []) : [];
      const toAdd = [];
      if (prevCount === 0 && !unlockedNow.includes('first-grip')) toAdd.push('first-grip');
      if ((area || '').trim() && !existingAreas.has((area || '').trim()) && !unlockedNow.includes('new-territory')) toAdd.push('new-territory');

      if (toAdd.length) {
        const updated = [...unlockedNow, ...toAdd];
        await setSetting("achievementsUnlocked", updated);

        // award xp for each achievement and show toast
        let awarded = 0;
        for (const id of toAdd) {
          const ach = findAchievement(id);
          if (!ach) continue;
          awarded += ach.xp || 0;
          try { ensureToastRoot(); showToast(`Achievement unlocked: ${ach.name} ${ach.emoji} (+${ach.xp} XP)`); } catch (e) {}
        }
        if (awarded > 0) {
          const prevXp = Number(await getSetting('xp', 0)) || 0;
          await setSetting('xp', prevXp + awarded);
        }

        try { window.dispatchEvent(new CustomEvent('cruxlog:achievements:updated')); } catch (e) {}
      }
    } catch (err) {
      // don't fail creation if achievements handling has an error
      console.error('Error awarding achievements on problem save', err);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-2">
      <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input placeholder={`Grade (${gradePrefix}1 - ${gradePrefix}9)`} value={grade} onChange={(e) => setGrade(e.target.value)} />
      <Input placeholder="Area / Gym" value={area} onChange={(e) => setArea(e.target.value)} />
      <Input type="date" value={completedDate} onChange={(e) => setCompletedDate(e.target.value)} aria-label="Completed date" />
      <div className="flex gap-2">
        <Button>Add Problem</Button>
      </div>
    </form>
  );
}
