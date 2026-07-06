import { useState } from "react";
import { requestViewportCapture } from "../io/captureBridge";
import { serializeProject } from "../io/exportProjectJson";
import { parseProject } from "../io/importProjectJson";
import { downloadCaptureResults } from "../io/screenshotExport";
import { useDirectorStore } from "../store/directorStore";

export function CapturePanel() {
  const [captureStatus, setCaptureStatus] = useState<string | null>(null);
  const project = useDirectorStore((state) => state.project);
  const replaceProject = useDirectorStore((state) => state.replaceProject);
  const saveLatestSnapshot = useDirectorStore((state) => state.saveLatestSnapshot);
  const restoreLatestSnapshot = useDirectorStore((state) => state.restoreLatestSnapshot);

  async function handleCapture(preset: "current" | "four" | "twelve") {
    try {
      const results = await requestViewportCapture({
        preset,
        source: "capture-panel",
      });
      const count = downloadCaptureResults(results);
      setCaptureStatus(`Exported ${count} captures`);
    } catch (error) {
      setCaptureStatus(error instanceof Error ? error.message : "Capture failed");
    }
  }

  return (
    <section className="panel-card">
      <h2>Capture</h2>
      <button className="capture-action" type="button" onClick={() => void handleCapture("current")}>
        Capture current view
      </button>
      <button className="capture-action" type="button" onClick={() => void handleCapture("four")}>
        Four-angle capture
      </button>
      <button className="capture-action" type="button" onClick={() => void handleCapture("twelve")}>
        Twelve-angle capture
      </button>
      {captureStatus ? <p className="capture-status">{captureStatus}</p> : null}
      <button
        className="capture-action"
        type="button"
        onClick={() => {
          const blob = new Blob([serializeProject(project)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank");
        }}
      >
        Export project JSON
      </button>
      <input
        className="ui-field"
        aria-label="Import project JSON"
        accept="application/json"
        type="file"
        onChange={async (event) => {
          const file = event.currentTarget.files?.[0];
          if (!file) return;
          replaceProject(parseProject(await file.text()));
        }}
      />
      <button className="capture-action" type="button" onClick={saveLatestSnapshot}>
        Save latest project
      </button>
      <button className="capture-action" type="button" onClick={restoreLatestSnapshot}>
        Restore latest project
      </button>
    </section>
  );
}
