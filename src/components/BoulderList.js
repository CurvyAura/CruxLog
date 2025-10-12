"use client";

import { useEffect, useState } from "react";
import { getAll } from "../lib/storage";

export default function BoulderList() {
  const [boulders, setBoulders] = useState([]);

  useEffect(() => {
    let mounted = true;
    getAll("boulders").then((list) => {
      if (mounted) setBoulders(list.reverse());
    });
    return () => (mounted = false);
  }, []);

  if (!boulders.length) {
    return <p className="text-sm text-muted-foreground">No boulders yet.</p>;
  }

  return (
    <ul className="grid gap-2">
      {boulders.map((b) => (
        <li key={b.id} className="p-3 border rounded">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">{b.name}</div>
              <div className="text-sm text-muted-foreground">{b.grade} • {b.area}</div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
