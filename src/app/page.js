import Link from "next/link";

/**
 * Landing page for the prototype. Keeps instructions minimal and points
 * to the Dashboard and Problems pages.
 */
export default function Home() {
  return (
    <div className="max-w-3xl mx-auto text-center py-24">
      <h1 className="text-4xl font-bold mb-4">CruxLog</h1>
  <p className="text-lg text-muted-foreground mb-8">Track your climbing progress. Local-first prototype — data is stored in your browser.</p>

      <div className="flex gap-4 justify-center">
        <Link href="/dashboard" className="px-5 py-3 bg-foreground text-background rounded">Open Dashboard</Link>
  <Link href="/problems" className="px-5 py-3 border rounded">View Problems</Link>
      </div>

      <section className="mt-12 text-sm text-muted-foreground">
  <p>Quick start: add a problem, then go to Log Session to add attempts.</p>
      </section>
    </div>
  );
}
