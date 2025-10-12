"use client";

import { useState } from "react";
import { save } from "../lib/storage";
import { makeProblem } from "../lib/schema";

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
  }

  return (
    <form onSubmit={submit} className="grid gap-2">
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        placeholder="Grade (C1 - C9)"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        placeholder="Area / Gym"
        value={area}
        onChange={(e) => setArea(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="date"
        value={completedDate}
        onChange={(e) => setCompletedDate(e.target.value)}
        className="border p-2 rounded text-muted-foreground placeholder:text-muted-foreground"
        aria-label="Completed date"
      />
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-foreground text-background rounded">Add Problem</button>
      </div>
    </form>
  );
}
