"use client";

import Link from "next/link";
import ProblemForm from "../../../components/ProblemForm";

// Simple page used to add a new problem (uses ProblemForm)
export default function NewProblem() {
  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add Problem</h1>
        <nav className="flex gap-4">
          <Link href="/problems">Back</Link>
        </nav>
      </header>
      <ProblemForm />
    </div>
  );
}
