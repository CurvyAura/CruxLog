"use client";

import { useEffect } from "react";
import { useTheme } from "../../components/ThemeProvider";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // ensure dropdown initial state aligns with theme
  }, [theme]);

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
    </div>
  );
}
