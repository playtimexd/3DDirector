import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach } from "vitest";
import { createInitialDirectorState, useDirectorStore } from "../store/directorStore";
import { PropPanel } from "./PropPanel";

beforeEach(() => {
  const base = createInitialDirectorState();
  useDirectorStore.setState({
    ...useDirectorStore.getState(),
    ...base,
    selectedObjectId: "prop_model_1",
    project: {
      ...base.project,
      assets: [
        {
          id: "asset_model_1",
          kind: "prop",
          sourceType: "model",
          fileName: "ATM_low.fbx",
          url: "blob:atm",
        },
      ],
      objects: [
        ...base.project.objects,
        {
          id: "prop_model_1",
          name: "ATM",
          kind: "prop",
          visible: true,
          locked: false,
          color: "#d7e7ff",
          assetRefId: "asset_model_1",
          transform: {
            position: [0, 0, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
          },
        },
      ],
    },
  });
});

it("renders the prop inspector fields for imported models", () => {
  render(<PropPanel />);

  expect(screen.getByText("Model")).toBeInTheDocument();
  expect(screen.getByLabelText("Model name")).toBeInTheDocument();
  expect(screen.getByLabelText("Model position X")).toBeInTheDocument();
  expect(screen.getByLabelText("Model rotation X")).toBeInTheDocument();
  expect(screen.getByLabelText("Model scale X")).toBeInTheDocument();
  expect(screen.getByLabelText("Model uniform scale")).toBeInTheDocument();
  expect(screen.getByLabelText("Model color HEX")).toBeInTheDocument();
});

it("updates the selected prop name, uniform scale, and color", async () => {
  const user = userEvent.setup();
  render(<PropPanel />);

  await user.clear(screen.getByLabelText("Model name"));
  await user.type(screen.getByLabelText("Model name"), "Close-up ATM");
  await user.clear(screen.getByLabelText("Model uniform scale"));
  await user.type(screen.getByLabelText("Model uniform scale"), "1.4");
  await user.clear(screen.getByLabelText("Model color HEX"));
  await user.type(screen.getByLabelText("Model color HEX"), "#aaccee");

  const prop = useDirectorStore.getState().project.objects.find((item) => item.id === "prop_model_1");
  expect(prop?.name).toBe("Close-up ATM");
  expect(prop?.transform.scale).toEqual([1.4, 1.4, 1.4]);
  expect(prop?.color).toBe("#aaccee");
});
