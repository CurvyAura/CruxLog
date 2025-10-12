"use client";

import Link from "next/link";
import ProblemList from "../../components/ProblemList";
import ProblemForm from "../../components/ProblemForm";
import { useState } from "react";

// Dedicated Problems page showing the full list and allowing edits/deletes
export default function ProblemsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSaved() {
    // bump key so ProblemList re-reads storage
    setRefreshKey((k) => k + 1);
  }
  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Problems</h1>
        <nav className="flex gap-4">
          {/* <Link href="/dashboard">Dashboard</Link>
          <Link href="/problems/new">Add</Link> */}
        </nav>
      </header>

      <section className="grid gap-6">
        <div className="p-4 border rounded max-w-md">
          <h2 className="font-semibold mb-2">Add Problem</h2>
          <ProblemForm onSaved={handleSaved} />
        </div>
        <div>
          <ProblemList refreshKey={refreshKey} />
        </div>
      </section>
    </div>
  );
}
