
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "../../components/ThemeProvider";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

    const [gradePrefix, setGradePrefix] = useState("C");

    useEffect(() => {
      // ensure dropdown initial state aligns with theme
    }, [theme]);

    useEffect(() => {
      let mounted = true;
      import("../../lib/storage").then(({ getSetting }) => {
        getSetting("gradePrefix", "C").then((val) => {
          if (!mounted) return;
          setGradePrefix(val || "C");
        });
      });
      return () => (mounted = false);
    }, []);

    function onPrefixChange(v) {
      setGradePrefix(v);
      import("../../lib/storage").then(({ setSetting }) => setSetting("gradePrefix", v));
    }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-sm text-muted-foreground mt-2">Local prototype settings — tweak your preferences here.</p>
      <div className="mt-4">
        <label className="block text-sm">Theme</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="mt-1 border rounded p-2"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className="mt-4">
        <label className="block text-sm">Grade system prefix</label>
        <select value={gradePrefix} onChange={(e) => onPrefixChange(e.target.value)} className="mt-1 border rounded p-2">
          <option value="C">C (C1 - C9)</option>
          <option value="V">V (V0 - V16)</option>
        </select>
      </div>
    </div>
  );
}
