"use client";

import { useState } from "react";
import { save } from "../lib/storage";
import { makeBoulder } from "../lib/schema";

export default function BoulderForm({ onSaved }) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [area, setArea] = useState("");

  async function submit(e) {
    e.preventDefault();
    const b = makeBoulder({ name, grade, area });
    await save("boulders", b);
    setName("");
    setGrade("");
    setArea("");
    if (onSaved) onSaved(b);
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
        placeholder="Grade (e.g. V5 or 7A)"
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
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-foreground text-background rounded">Add Boulder</button>
      </div>
    </form>
  );
}
