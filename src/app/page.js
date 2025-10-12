import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto text-center py-24">
      <h1 className="text-4xl font-bold mb-4">CruxLog</h1>
      <p className="text-lg text-muted-foreground mb-8">Track your bouldering progress. Local-first prototype — data is stored in your browser.</p>

      <div className="flex gap-4 justify-center">
        <Link href="/dashboard" className="px-5 py-3 bg-foreground text-background rounded">Open Dashboard</Link>
        <Link href="/boulders" className="px-5 py-3 border rounded">View Boulders</Link>
      </div>

      <section className="mt-12 text-sm text-muted-foreground">
        <p>Quick start: add a boulder, then go to Log Session to add attempts.</p>
      </section>
    </div>
  );
}
