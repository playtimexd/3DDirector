import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach } from "vitest";
import { createInitialDirectorState, useDirectorStore } from "../store/directorStore";
import { ObjectTreePanel } from "./ObjectTreePanel";

beforeEach(() => {
  useDirectorStore.setState({
    ...useDirectorStore.getState(),
    ...createInitialDirectorState(),
  });
});

it("filters the object tree by keyword", async () => {
  const user = userEvent.setup();
  render(<ObjectTreePanel />);

  await user.type(screen.getByLabelText("Search scene contents"), "Camera");

  expect(screen.getByRole("button", { name: "Camera01" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Character01" })).not.toBeInTheDocument();
});

it("shows a centered empty search state when no objects match", async () => {
  const user = userEvent.setup();
  render(<ObjectTreePanel />);

  await user.type(screen.getByLabelText("Search scene contents"), "nonexistent");

  const emptyState = screen.getByRole("status", { name: "No results found" });
  expect(emptyState).toHaveClass("object-search-empty-state");
  const emptyIcon = within(emptyState).getByTestId("object-search-empty-icon");
  expect(emptyIcon.querySelector(".lucide-search")).toBeInTheDocument();
  expect(emptyIcon.querySelector(".lucide-search-x")).not.toBeInTheDocument();
  expect(screen.queryByRole("group", { name: "Characters group" })).not.toBeInTheDocument();
  expect(screen.queryByRole("treeitem")).not.toBeInTheDocument();
});

it("shows visibility and lock controls for each object", () => {
  render(<ObjectTreePanel />);

  expect(screen.getByLabelText("Character01 visibility")).toBeInTheDocument();
  expect(screen.getByLabelText("Character01 lock")).toBeInTheDocument();
});

it("hides empty left panel groups and keeps the approved group order", () => {
  render(<ObjectTreePanel />);

  const groups = screen.getAllByRole("group").map((group) => group.getAttribute("aria-label"));

  expect(groups).toEqual(["Characters group", "Cameras group"]);
  expect(screen.queryByRole("group", { name: "Crowd group" })).not.toBeInTheDocument();
  expect(screen.queryByRole("group", { name: "Geometry group" })).not.toBeInTheDocument();
});

it("shows crowd arrays in a dedicated crowd group using grouped labels like crowd 3x3 and 4x3", () => {
  const base = createInitialDirectorState();
  useDirectorStore.setState({
    ...useDirectorStore.getState(),
    ...base,
  });

  useDirectorStore.getState().addCrowdCharacters({ rows: 3, columns: 3, spacing: 1.2 });
  useDirectorStore.getState().addCrowdCharacters({ rows: 4, columns: 3, spacing: 1.2 });

  render(<ObjectTreePanel />);

  expect(screen.getAllByRole("group").map((group) => group.getAttribute("aria-label"))).toEqual([
    "Characters group",
    "Crowd group",
    "Cameras group",
  ]);

  const crowdGroup = screen.getByRole("group", { name: "Crowd group" });
  expect(within(crowdGroup).getByRole("treeitem", { name: "Crowd (3x3)" })).toBeInTheDocument();
  expect(within(crowdGroup).getByRole("treeitem", { name: "Crowd (4x3)" })).toBeInTheDocument();
  expect(within(crowdGroup).getAllByTestId("object-row-icon-crowd")).toHaveLength(2);
  expect(within(crowdGroup).queryByRole("button", { name: "Character02" })).not.toBeInTheDocument();
});

it("selects all members of a crowd array from the grouped crowd row", async () => {
  const user = userEvent.setup();
  useDirectorStore.setState({
    ...useDirectorStore.getState(),
    ...createInitialDirectorState(),
  });
  useDirectorStore.getState().addCrowdCharacters({ rows: 3, columns: 3, spacing: 1.2 });

  render(<ObjectTreePanel />);

  await user.click(screen.getByRole("treeitem", { name: "Crowd (3x3)" }));

  expect(screen.getByRole("treeitem", { name: "Crowd (3x3)" })).toHaveAttribute("aria-selected", "true");
  expect(useDirectorStore.getState().selectedObjectIds).toHaveLength(9);
});

it("expands and collapses crowd groups to preview the members while keeping group-only selection", async () => {
  const user = userEvent.setup();
  useDirectorStore.setState({
    ...useDirectorStore.getState(),
    ...createInitialDirectorState(),
  });
  useDirectorStore.getState().addCrowdCharacters({ rows: 2, columns: 2, spacing: 1.2 });

  render(<ObjectTreePanel />);

  expect(screen.queryByRole("button", { name: "Character02" })).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Expand Crowd (2x2)" }));

  expect(screen.getByRole("button", { name: "Character02" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Character03" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Character04" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Character05" })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Character02" }));

  expect(screen.getByRole("treeitem", { name: "Crowd (2x2)" })).toHaveAttribute("aria-selected", "true");
  expect(useDirectorStore.getState().selectedObjectIds).toHaveLength(4);
  expect(useDirectorStore.getState().selectedObjectIds).toContain("char_preset_2");
  expect(useDirectorStore.getState().selectedObjectIds).toContain("char_preset_5");

  await user.click(screen.getByRole("button", { name: "Collapse Crowd (2x2)" }));

  expect(screen.queryByRole("button", { name: "Character02" })).not.toBeInTheDocument();
});

it("deletes every member of a selected crowd array with the keyboard delete key", async () => {
  const user = userEvent.setup();
  useDirectorStore.setState({
    ...useDirectorStore.getState(),
    ...createInitialDirectorState(),
  });
  useDirectorStore.getState().addCrowdCharacters({ rows: 3, columns: 3, spacing: 1.2 });

  render(<ObjectTreePanel />);

  await user.click(screen.getByRole("treeitem", { name: "Crowd (3x3)" }));
  await user.keyboard("{Delete}");

  expect(screen.queryByRole("group", { name: "Crowd group" })).not.toBeInTheDocument();
  expect(useDirectorStore.getState().project.objects.filter((item) => item.crowdId)).toHaveLength(0);
});

it("shows geometry groups when prop objects exist and gives each row the matching icon", () => {
  const base = createInitialDirectorState();
  useDirectorStore.setState({
    ...useDirectorStore.getState(),
    ...base,
    project: {
      ...base.project,
      objects: [
        ...base.project.objects,
        {
          id: "prop_cube_1",
          name: "Cube",
          kind: "prop",
          visible: true,
          locked: false,
          transform: {
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
          },
        },
      ],
    },
  });

  render(<ObjectTreePanel />);

  expect(screen.getAllByRole("group").map((group) => group.getAttribute("aria-label"))).toEqual([
    "Characters group",
    "Geometry group",
    "Cameras group",
  ]);
  expect(within(screen.getByRole("button", { name: "Character01" })).getByTestId("object-row-icon-character")).toBeInTheDocument();
  expect(within(screen.getByRole("button", { name: "Cube" })).getByTestId("object-row-icon-geometry")).toBeInTheDocument();
  expect(within(screen.getByRole("button", { name: "Camera01" })).getByTestId("object-row-icon-camera")).toBeInTheDocument();
});

it("shows imported local and library models in a separate my models group below geometry", () => {
  const base = createInitialDirectorState();
  useDirectorStore.setState({
    ...useDirectorStore.getState(),
    ...base,
    project: {
      ...base.project,
      assets: [
        {
          id: "asset_local_1",
          kind: "prop",
          sourceType: "model",
          fileName: "local-chair.fbx",
          url: "blob:local-chair",
        },
      ],
      objects: [
        ...base.project.objects,
        {
          id: "geo_box_1",
          name: "Cube",
          kind: "prop",
          visible: true,
          locked: false,
          geometryType: "box",
          transform: {
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
          },
        },
        {
          id: "obj_local_1",
          name: "Local Chair",
          kind: "prop",
          visible: true,
          locked: false,
          assetRefId: "asset_local_1",
          transform: {
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
          },
        },
      ],
    },
  });

  render(<ObjectTreePanel />);

  expect(screen.getAllByRole("group").map((group) => group.getAttribute("aria-label"))).toEqual([
    "Characters group",
    "Geometry group",
    "My Models group",
    "Cameras group",
  ]);
  expect(within(screen.getByRole("group", { name: "Geometry group" })).getByRole("button", { name: "Cube" })).toBeInTheDocument();
  expect(within(screen.getByRole("group", { name: "My Models group" })).getByRole("button", { name: "Local Chair" })).toBeInTheDocument();
});

it("keeps any object backed by a model asset visible in my models even when older data uses a non-prop kind", () => {
  const base = createInitialDirectorState();
  useDirectorStore.setState({
    ...useDirectorStore.getState(),
    ...base,
    project: {
      ...base.project,
      assets: [
        {
          id: "asset_scene_model_1",
          kind: "scene",
          sourceType: "model",
          fileName: "microwave_low.fbx",
          url: "blob:microwave",
        },
      ],
      objects: [
        ...base.project.objects,
        {
          id: "obj_scene_model_1",
          name: "Microwave",
          kind: "scene",
          visible: true,
          locked: false,
          assetRefId: "asset_scene_model_1",
          transform: {
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
          },
        },
      ],
    },
  });

  render(<ObjectTreePanel />);

  expect(screen.queryByRole("group", { name: "Geometry group" })).not.toBeInTheDocument();
  expect(within(screen.getByRole("group", { name: "My Models group" })).getByRole("button", { name: "Microwave" })).toBeInTheDocument();
});

it("selects rows and keeps selected state available for styling", async () => {
  const user = userEvent.setup();
  render(<ObjectTreePanel />);

  await user.click(screen.getByRole("button", { name: "Character01" }));

  expect(screen.getByRole("treeitem", { name: "Character01" })).toHaveAttribute("aria-selected", "true");
  expect(useDirectorStore.getState().selectedObjectId).toBe("char_default_a");
});

it("selects a row from anywhere inside the list row without needing repeated clicks", async () => {
  const user = userEvent.setup();
  render(<ObjectTreePanel />);

  await user.click(screen.getByRole("treeitem", { name: "Character01" }));

  expect(screen.getByRole("treeitem", { name: "Character01" })).toHaveAttribute("aria-selected", "true");
  expect(useDirectorStore.getState().selectedObjectId).toBe("char_default_a");
});

it("keeps flag buttons from also selecting the row", async () => {
  const user = userEvent.setup();
  render(<ObjectTreePanel />);

  await user.click(screen.getByLabelText("Character01 visibility"));

  expect(screen.getByRole("treeitem", { name: "Character01" })).toHaveAttribute("aria-selected", "false");
  expect(useDirectorStore.getState().selectedObjectId).toBeNull();
});

it("supports shift-click multi-select in the left object list", async () => {
  const user = userEvent.setup();
  useDirectorStore.getState().addPresetCharacter("female");
  render(<ObjectTreePanel />);

  await user.click(screen.getByRole("button", { name: "Character01" }));
  await user.keyboard("{Shift>}");
  await user.click(screen.getByRole("button", { name: "Character02" }));
  await user.keyboard("{/Shift}");

  expect(screen.getByRole("treeitem", { name: "Character01" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("treeitem", { name: "Character02" })).toHaveAttribute("aria-selected", "true");
  expect(useDirectorStore.getState().selectedObjectIds).toEqual(["char_default_a", "char_preset_2"]);
});

it("deletes all selected rows when users press the keyboard delete key", async () => {
  const user = userEvent.setup();
  useDirectorStore.getState().addPresetCharacter("female");
  render(<ObjectTreePanel />);

  await user.click(screen.getByRole("button", { name: "Character01" }));
  await user.keyboard("{Shift>}");
  await user.click(screen.getByRole("button", { name: "Character02" }));
  await user.keyboard("{/Shift}");
  await user.keyboard("{Delete}");

  expect(screen.queryByRole("button", { name: "Character01" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Character02" })).not.toBeInTheDocument();
  expect(useDirectorStore.getState().selectedObjectId).toBeNull();
  expect(useDirectorStore.getState().selectedObjectIds).toEqual([]);
});

it("does not render a delete icon and deletes the selected object with the keyboard delete key", async () => {
  const user = userEvent.setup();
  useDirectorStore.getState().addPresetCharacter("female");
  render(<ObjectTreePanel />);

  await user.click(screen.getByRole("button", { name: "Character02" }));

  expect(screen.queryByRole("button", { name: "Delete selected" })).not.toBeInTheDocument();

  await user.keyboard("{Delete}");

  expect(screen.queryByRole("button", { name: "Character02" })).not.toBeInTheDocument();
  expect(useDirectorStore.getState().selectedObjectId).toBeNull();
  expect(useDirectorStore.getState().project.objects.some((item) => item.name === "Character02")).toBe(false);
});

it("switches the active camera when users select a camera row", async () => {
  const user = userEvent.setup();
  useDirectorStore.getState().addCameraShot();
  render(<ObjectTreePanel />);

  expect(useDirectorStore.getState().project.activeCameraId).toBe("cam_2");

  await user.click(screen.getByRole("button", { name: "Camera01" }));

  expect(useDirectorStore.getState().project.activeCameraId).toBe("cam_1");
  expect(useDirectorStore.getState().selectedObjectId).toBe("cam_object_1");
});
