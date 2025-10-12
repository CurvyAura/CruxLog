"use client";

import Link from "next/link";
import NewSession from "./new/page";
import SessionList from "../../components/SessionList";

export default function SessionsIndex() {
  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sessions</h1>
      </header>

      <section className="grid gap-8">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2"></h2>
          <NewSession />
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Previous Sessions</h2>
          <SessionList />
        </div>
      </section>
    </div>
  );
}
