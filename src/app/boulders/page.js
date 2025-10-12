"use client";

import Link from "next/link";
import BoulderList from "../../components/BoulderList";

export default function BouldersPage() {
  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Boulders</h1>
        <nav className="flex gap-4">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/boulders/new">Add</Link>
        </nav>
      </header>

      <section>
        <BoulderList />
      </section>
    </div>
  );
}
