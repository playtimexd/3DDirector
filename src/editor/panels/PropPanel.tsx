import {
  InspectorAxisGroup,
  InspectorColorField,
  InspectorPanel,
  InspectorRangeNumberField,
  InspectorTextField,
} from "./InspectorControls";
import { useDirectorStore } from "../store/directorStore";

function replaceAxis(tuple: [number, number, number], axis: 0 | 1 | 2, value: number): [number, number, number] {
  return tuple.map((item, index) => (index === axis ? value : item)) as [number, number, number];
}

export function PropPanel() {
  const prop = useDirectorStore((state) => {
    const selected = state.project.objects.find((item) => item.id === state.selectedObjectId);
    const selectedAsset = selected?.assetRefId
      ? state.project.assets.find((asset) => asset.id === selected.assetRefId)
      : undefined;

    if (!selected) return undefined;
    if (selected.kind === "prop") return selected;
    if (selectedAsset?.sourceType === "model") return selected;

    return undefined;
  });
  const updateObjectName = useDirectorStore((state) => state.updateObjectName);
  const updateObjectTransform = useDirectorStore((state) => state.updateObjectTransform);
  const updateUniformScale = useDirectorStore((state) => state.updateUniformScale);
  const updateObjectColor = useDirectorStore((state) => state.updateObjectColor);

  if (!prop) return null;

  const propColor = prop.color ?? "#d7e7ff";

  return (
    <InspectorPanel title="Model" ariaLabel="Model properties panel" className="prop-inspector">
      <InspectorTextField label="Name" ariaLabel="Model name" value={prop.name} onChange={(value) => updateObjectName(prop.id, value)} />
      <InspectorAxisGroup
        label="Position"
        axes={[
          {
            axis: "X",
            ariaLabel: "Model position X",
            value: prop.transform.position[0],
            onChange: (value) => updateObjectTransform(prop.id, { position: replaceAxis(prop.transform.position, 0, Number(value)) }),
          },
          {
            axis: "Y",
            ariaLabel: "Model position Y",
            value: prop.transform.position[1],
            onChange: (value) => updateObjectTransform(prop.id, { position: replaceAxis(prop.transform.position, 1, Number(value)) }),
          },
          {
            axis: "Z",
            ariaLabel: "Model position Z",
            value: prop.transform.position[2],
            onChange: (value) => updateObjectTransform(prop.id, { position: replaceAxis(prop.transform.position, 2, Number(value)) }),
          },
        ]}
      />
      <InspectorAxisGroup
        label="Rotation"
        axes={[
          {
            axis: "X",
            ariaLabel: "Model rotation X",
            value: prop.transform.rotation[0],
            onChange: (value) => updateObjectTransform(prop.id, { rotation: replaceAxis(prop.transform.rotation, 0, Number(value)) }),
          },
          {
            axis: "Y",
            ariaLabel: "Model rotation Y",
            value: prop.transform.rotation[1],
            onChange: (value) => updateObjectTransform(prop.id, { rotation: replaceAxis(prop.transform.rotation, 1, Number(value)) }),
          },
          {
            axis: "Z",
            ariaLabel: "Model rotation Z",
            value: prop.transform.rotation[2],
            onChange: (value) => updateObjectTransform(prop.id, { rotation: replaceAxis(prop.transform.rotation, 2, Number(value)) }),
          },
        ]}
      />
      <InspectorAxisGroup
        label="Scale"
        axes={[
          {
            axis: "X",
            ariaLabel: "Model scale X",
            step: "0.01",
            value: prop.transform.scale[0],
            onChange: (value) => updateObjectTransform(prop.id, { scale: replaceAxis(prop.transform.scale, 0, Number(value)) }),
          },
          {
            axis: "Y",
            ariaLabel: "Model scale Y",
            step: "0.01",
            value: prop.transform.scale[1],
            onChange: (value) => updateObjectTransform(prop.id, { scale: replaceAxis(prop.transform.scale, 1, Number(value)) }),
          },
          {
            axis: "Z",
            ariaLabel: "Model scale Z",
            step: "0.01",
            value: prop.transform.scale[2],
            onChange: (value) => updateObjectTransform(prop.id, { scale: replaceAxis(prop.transform.scale, 2, Number(value)) }),
          },
        ]}
      />
      <InspectorRangeNumberField
        label="Uniform scale"
        rangeAriaLabel="Model uniform scale slider"
        numberAriaLabel="Model uniform scale"
        max="3"
        min="0.2"
        step="0.01"
        value={prop.transform.scale[0]}
        onValueChange={(value) => updateUniformScale(prop.id, Number(value))}
      />
      <InspectorColorField
        label="Color"
        colorAriaLabel="Model color"
        hexAriaLabel="Model color HEX"
        value={propColor}
        onColorChange={(value) => updateObjectColor(prop.id, value)}
        onHexChange={(value) => updateObjectColor(prop.id, value)}
      />
    </InspectorPanel>
  );
}
