"use client";

import Link from "next/link";
import BoulderForm from "../../components/BoulderForm";
import BoulderList from "../../components/BoulderList";

export default function Dashboard() {
  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">CruxLog — Dashboard</h1>
        <nav className="flex gap-4">
          <Link href="/boulders">Boulders</Link>
          <Link href="/sessions/new">Log Session</Link>
        </nav>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Add Boulder</h2>
          <BoulderForm />
        </div>
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Recent Boulders</h2>
          <BoulderList />
        </div>
      </section>
    </div>
  );
}
