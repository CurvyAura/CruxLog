"use client";

import { useState, useEffect } from "react";
import { save } from "../lib/storage";
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
