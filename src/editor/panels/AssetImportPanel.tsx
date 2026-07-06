import { useState } from "react";
import { readLocalModelFile } from "../loaders/localModelImport";
import { readPanoramaFile } from "../loaders/panoramaImport";
import { useDirectorStore } from "../store/directorStore";

export function AssetImportPanel() {
  const addImportedAsset = useDirectorStore((state) => state.addImportedAsset);
  const assets = useDirectorStore((state) => state.project.assets);
  const panoramaAssetId = useDirectorStore((state) => state.project.panoramaAssetId);
  const [importError, setImportError] = useState<string | null>(null);

  const latestLocalModel = [...assets].reverse().find((item) => item.kind !== "panorama");
  const panoramaAsset = assets.find((item) => item.id === panoramaAssetId);

  async function handleLocalModel(file: File) {
    setImportError(null);
    const result = await readLocalModelFile(file);
    addImportedAsset({ kind: "prop", ...result });
  }

  async function handlePanorama(file: File) {
    setImportError(null);
    const result = await readPanoramaFile(file);
    addImportedAsset({ kind: "panorama", ...result });
  }

  return (
    <section className="panel-card">
      <h2>Import</h2>
      <label className="asset-import-item">
        Import local model
        <input
          aria-label="Import local model"
          accept=".fbx,.obj,.glb,.gltf"
          type="file"
          onChange={async (event) => {
            const input = event.currentTarget;
            const file = input.files?.[0];
            if (!file) return;
            try {
              await handleLocalModel(file);
            } catch (error) {
              setImportError(error instanceof Error ? error.message : "Local model import failed");
            } finally {
              input.value = "";
            }
          }}
        />
        <p className="asset-import-status">
          {latestLocalModel ? `Imported local model: ${latestLocalModel.fileName}` : "Supports FBX / OBJ / glTF (.glb/.gltf) files"}
        </p>
      </label>
      <label className="asset-import-item">
        Import panorama
        <input
          aria-label="Import panorama"
          accept=".jpg,.jpeg,.png,.webp"
          type="file"
          onChange={async (event) => {
            const input = event.currentTarget;
            const file = input.files?.[0];
            if (!file) return;
            try {
              await handlePanorama(file);
            } catch (error) {
              setImportError(error instanceof Error ? error.message : "Panorama import failed");
            } finally {
              input.value = "";
            }
          }}
        />
        <p className="asset-import-status">
          {panoramaAsset ? `Imported panorama: ${panoramaAsset.fileName}` : "Supports JPG / PNG / WEBP; ordinary images are auto-adapted into panorama backgrounds"}
        </p>
      </label>
      {importError ? <p className="capture-status">{importError}</p> : null}
    </section>
  );
}
