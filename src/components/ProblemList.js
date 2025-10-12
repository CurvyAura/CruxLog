"use client";

import { useEffect, useState } from "react";
import { getAll } from "../lib/storage";

export default function ProblemList() {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    let mounted = true;
    getAll("problems").then((list) => {
      if (mounted) setProblems(list.reverse());
    });
    return () => (mounted = false);
  }, []);

  if (!problems.length) {
    return <p className="text-sm text-muted-foreground">No problems yet.</p>;
  }

  return (
    <ul className="grid gap-2">
      {problems.map((p) => (
        <li key={p.id} className="p-3 border rounded">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-muted-foreground">{p.grade} • {p.area} • {p.completedDate}</div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
