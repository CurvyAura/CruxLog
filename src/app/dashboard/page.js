"use client";

import Link from "next/link";
import ProblemForm from "../../components/ProblemForm";
import ProblemList from "../../components/ProblemList";
import SessionList from "../../components/SessionList";
import InsightsChart from "../../components/InsightsChart";

/**
 * Dashboard: add problems and view recent sessions.
 * The Recent Problems panel is intentionally commented out to keep the
 * dashboard focused; use /problems for a dedicated problems view.
 */
export default function Dashboard() {
  return (
    <div className="p-8">
      {/* Header removed — global header provides title and navigation */}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Progress Insights</h2>
          <InsightsChart />
        </div>
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Recent Problems</h2>
          <ProblemList limit={5} />
        </div>
      </section>
      <section className="mt-8 p-4 border rounded">
        <h2 className="font-semibold mb-2">Recent Sessions</h2>
        <SessionList limit={5} />
      </section>
    </div>
  );
}
