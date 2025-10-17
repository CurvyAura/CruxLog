import Link from "next/link";
import Button from "../components/ui/Button";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-4">
      <section className="text-center mb-10">
        <h1 className="text-5xl font-extrabold mb-3">CruxLog</h1>
        <p className="text-lg text-muted mb-6">Track your climbing progress.</p>
        <div className="flex justify-center gap-4">
          <Link href="/dashboard"><Button>Open Dashboard</Button></Link>
          <Link href="/problems"><Button variant="ghost">View Problems</Button></Link>
        </div>
      </section>

      <section className="text-center text-sm text-muted">
        <p>Quick start: add a problem, then go to Log Session to add attempts.</p>
      </section>
    </div>
  );
}
