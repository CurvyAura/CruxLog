"use client";

import Link from "next/link";
import ProblemForm from "../../components/ProblemForm";
import ProblemList from "../../components/ProblemList";
import SessionList from "../../components/SessionList";

export default function Dashboard() {
  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <nav className="flex gap-4">
          <Link href="/problems">Problems</Link>
          <Link href="/sessions/new">Log Session</Link>
        </nav>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Add Problem</h2>
          <ProblemForm />
        </div>
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Recent Problems</h2>
          <ProblemList />
        </div>
      </section>
      <section className="mt-8 p-4 border rounded">
        <h2 className="font-semibold mb-2">Recent Sessions</h2>
        <SessionList />
      </section>
    </div>
  );
}
