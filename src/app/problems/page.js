"use client";

import Link from "next/link";
import ProblemList from "../../components/ProblemList";

export default function ProblemsPage() {
  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Problems</h1>
        <nav className="flex gap-4">
          {/* <Link href="/dashboard">Dashboard</Link>
          <Link href="/problems/new">Add</Link> */}
        </nav>
      </header>

      <section>
        <ProblemList />
      </section>
    </div>
  );
}
