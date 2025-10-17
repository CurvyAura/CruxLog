
"use client";

import { useEffect, useState, useRef } from "react";
import { useTheme } from "../../components/ThemeProvider";
import { clearAll } from "../../lib/storage";
import Button from "../../components/ui/Button";

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
          <option value="light">Light — Default</option>
          <option value="woody">Light — Woody</option>
          <option value="dark">Dark — Default</option>
          <option value="dark-ink">Dark — Ink</option>
          <option value="dark-emerald">Dark — Emerald</option>
          <option value="neon">Accent — Neon</option>
        </select>
      </div>

      <div className="mt-4">
        <label className="block text-sm">Grade system prefix</label>
        <select value={gradePrefix} onChange={(e) => onPrefixChange(e.target.value)} className="mt-1 border rounded p-2">
          <option value="C">C (C1 - C9)</option>
          <option value="V">V (V0 - V16)</option>
        </select>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Danger zone</h2>
        <p className="text-sm text-muted-foreground mt-1">Reset all locally-stored account data (problems, sessions, and settings). This cannot be undone.</p>
        <div className="mt-3">
          <Button size="sm" variant="destructive" onClick={async () => {
              const ok = confirm("Reset all local account data? This will delete problems, sessions, and settings stored locally.");
              if (!ok) return;
              await clearAll();
              // reload to reflect cleared state
              window.location.reload();
            }}
          >
            Reset account data
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Backup (Export / Import)</h2>
        <p className="text-sm text-muted-foreground mt-1">Download a local backup of problems, sessions and settings, or restore from a backup file.</p>

        <div className="mt-3 flex flex-col md:flex-row md:items-center gap-3">
          <div className="w-full md:w-auto">
            <Button size="sm"
              className="w-auto"
              onClick={async () => {
                const { getAll } = await import("../../lib/storage");
                const problems = await getAll("problems");
                const sessions = await getAll("sessions");
                // get all settings (helper added in storage)
                const { getAllSettings } = await import("../../lib/storage");
                const settings = await getAllSettings();

                const payload = { problems, sessions, settings, exportedAt: new Date().toISOString() };
                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `cruxlog-backup-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }}
            >
              Export backup
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm">On import:</label>
            <select id="importMode" defaultValue="replace" className="border rounded p-1">
              <option value="replace">Replace existing (recommended)</option>
              <option value="merge">Merge into existing</option>
            </select>
          </div>

            <div className="w-auto">
            <Button size="sm" className="w-auto" onClick={() => document.getElementById("_crux_import_hidden").click()}>Import backup</Button>
          </div>

          <input
            id="_crux_import_hidden"
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files && e.target.files[0];
              if (!file) return;
              const text = await file.text();
              let data;
              try {
                data = JSON.parse(text);
              } catch (err) {
                alert("Invalid JSON file.");
                return;
              }

              const modeEl = document.getElementById("importMode");
              const mode = modeEl ? modeEl.value : "replace";

              // Basic validation
              if (!data || typeof data !== "object" || (!Array.isArray(data.problems) && !Array.isArray(data.sessions) && typeof data.settings !== "object")) {
                alert("Backup file missing expected keys (problems, sessions, settings).");
                return;
              }

              if (mode === "replace") {
                const ok = confirm("This will replace your current local data with the backup. It is recommended you export first. Proceed?");
                if (!ok) return;
              }

              const { save, clearAll: clearEverything, setSetting } = await import("../../lib/storage");

              try {
                if (mode === "replace") {
                  await clearEverything();
                }

                if (Array.isArray(data.problems)) {
                  for (const p of data.problems) {
                    await save("problems", p);
                  }
                }
                if (Array.isArray(data.sessions)) {
                  for (const s of data.sessions) {
                    await save("sessions", s);
                  }
                }

                if (data.settings && typeof data.settings === "object") {
                  for (const [k, v] of Object.entries(data.settings)) {
                    await setSetting(k, v);
                  }
                }

                // notify app to refresh
                window.dispatchEvent(new CustomEvent("cruxlog:problems:updated"));
                window.dispatchEvent(new CustomEvent("cruxlog:sessions:updated"));
                window.dispatchEvent(new CustomEvent("cruxlog:achievements:updated"));

                alert("Import completed successfully.");
                // reload to reflect restored state
                window.location.reload();
              } catch (err) {
                console.error(err);
                alert("Import failed — see console for details.");
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
