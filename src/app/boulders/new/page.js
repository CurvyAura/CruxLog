"use client";

import Link from "next/link";
import BoulderForm from "../../../components/BoulderForm";

export default function NewBoulder() {
  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add Boulder</h1>
        <nav className="flex gap-4">
          <Link href="/boulders">Back</Link>
        </nav>
      </header>
      <BoulderForm />
    </div>
  );
}
