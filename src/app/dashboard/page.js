"use client";

import Link from "next/link";
import ProblemForm from "../../components/ProblemForm";
import ProblemList from "../../components/ProblemList";
import SessionList from "../../components/SessionList";
import InsightsChart from "../../components/InsightsChart";
import LevelCard from "../../components/LevelCard";
import AchievementList from "../../components/AchievementList";

/**
 * Dashboard: add problems and view recent sessions.
 * The Recent Problems panel is intentionally commented out to keep the
 * dashboard focused; use /problems for a dedicated problems view.
 */
export default function Dashboard() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-4 lg:col-span-2">
          <h2 className="font-semibold mb-3">Progress Insights</h2>
          <InsightsChart />
        </div>

        <div>
          <LevelCard />
          {/* Achievements are shown below the Level card; debug flag left off in production */}
          <AchievementList />
        </div>
      </section>
    </div>
  );
}
