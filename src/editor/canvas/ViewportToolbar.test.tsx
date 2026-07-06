import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, vi } from "vitest";
import { clearViewportCaptureHandler, setViewportCaptureHandler } from "../io/captureBridge";
import { BODY_TYPE_OPTIONS } from "../runtime/mannequin/bodyTypes";
import { createInitialDirectorState, useDirectorStore } from "../store/directorStore";
import { getCameraRigPositionFromViewSnapshot, getCameraViewSnapshotFromShot } from "../schema/cameraGeometry";
import { ViewportToolbar } from "./ViewportToolbar";

const mockReadLocalModelFile = vi.fn();

vi.mock("../loaders/localModelImport", () => ({
  readLocalModelFile: (...args: unknown[]) => mockReadLocalModelFile(...args),
}));

function createMemoryStorage(): Storage {
  const storage = new Map<string, string>();

  return {
    get length() {
      return storage.size;
    },
    clear: () => storage.clear(),
    getItem: (key) => storage.get(key) ?? null,
    key: (index) => Array.from(storage.keys())[index] ?? null,
    removeItem: (key) => {
      storage.delete(key);
    },
    setItem: (key, value) => {
      storage.set(key, String(value));
    },
  };
}

beforeEach(() => {
  vi.stubGlobal("localStorage", createMemoryStorage());
  useDirectorStore.setState({
    ...useDirectorStore.getState(),
    ...createInitialDirectorState(),
  });
  mockReadLocalModelFile.mockReset();
});

afterEach(() => {
  clearViewportCaptureHandler();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("renders the viewport capsule as project icon-system buttons", () => {
  render(<ViewportToolbar />);

  const toolbar = screen.getByRole("group", { name: "3D viewport tools" });
  const expectedActions = [
    "Move",
    "Rotate",
    "Scale",
    "Add character",
    "Import panorama",
    "Import local model",
    "Model Library",
    "Add camera",
    "Select aspect ratio",
    "Capture current view",
    "Four-angle capture",
    "Twelve-angle capture",
    "Fullscreen",
  ];

  expectedActions.forEach((label) => {
    const button = within(toolbar).getByRole("button", { name: label });

    expect(button.querySelector("svg")).toBeInTheDocument();
    expect(button).toHaveClass("viewport-toolbar-button");
  });

  expect(toolbar).toHaveClass("viewport-toolbar");

  const toolbarButtonLabels = Array.from(toolbar.querySelectorAll("button[aria-label]")).map((button) =>
    button.getAttribute("aria-label")
  );
  expect(toolbarButtonLabels.indexOf("Model Library")).toBe(toolbarButtonLabels.indexOf("Import local model") + 1);
});

it("renders custom hover labels instead of native title tooltips", () => {
  render(<ViewportToolbar />);

  const toolbar = screen.getByRole("group", { name: "3D viewport tools" });
  const button = within(toolbar).getByRole("button", { name: "Import local model" });
  const label = within(button).getByText("Import local model");

  expect(button).not.toHaveAttribute("title");
  expect(label).toHaveClass("viewport-toolbar-label");
});

it("uses the requested viewport toolbar SVG icons for camera and capture actions", () => {
  render(<ViewportToolbar />);

  expect(screen.getByRole("button", { name: "Add camera" }).querySelector("svg")).toHaveClass("lucide-video");
  expect(screen.getByRole("button", { name: "Capture current view" }).querySelector("svg")).toHaveClass("lucide-camera");
  expect(screen.getByRole("button", { name: "Four-angle capture" }).querySelector("svg")).toHaveClass("lucide-grid2x2");
  expect(screen.getByRole("button", { name: "Twelve-angle capture" }).querySelector("svg")).toHaveClass("lucide-grid3x3");
});

it("uses the fullscreen button to collapse the side panels instead of entering browser fullscreen", async () => {
  const user = userEvent.setup();
  render(<ViewportToolbar />);

  expect((useDirectorStore.getState() as { viewportPanelsCollapsed?: boolean }).viewportPanelsCollapsed ?? false).toBe(
    false
  );

  await user.click(screen.getByRole("button", { name: "Fullscreen" }));

  expect((useDirectorStore.getState() as { viewportPanelsCollapsed?: boolean }).viewportPanelsCollapsed ?? false).toBe(
    true
  );
});

it("creates a new camera before storing viewport capsule screenshots from director view", async () => {
  const user = userEvent.setup();
  const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  const snapshot = {
    fov: 64,
    position: [3, 2, 1] as [number, number, number],
    target: [0, 1, -2] as [number, number, number],
  };
  const handler = vi.fn(async () => [
    {
      label: "Current camera",
      dataUrl: "data:image/png;base64,current-camera",
      meta: {
        mode: "camera" as const,
        cameraId: "cam_2",
        fov: 64,
        position: [3, 2, 1] as [number, number, number],
        target: [0, 1, -2] as [number, number, number],
      },
    },
  ]);

  setViewportCaptureHandler(handler);
  render(<ViewportToolbar getViewportCameraSnapshot={() => snapshot} />);

  await user.click(screen.getByRole("button", { name: "Capture current view" }));

  await waitFor(() => {
    expect(handler).toHaveBeenCalledWith({ preset: "current", source: "camera-panel", cameraId: "cam_2" });
  });

  const state = useDirectorStore.getState();
  const originalCamera = state.project.cameras[0];
  const newCamera = state.project.cameras[1];

  expect(anchorClick).not.toHaveBeenCalled();
  expect(state.viewMode).toBe("camera");
  expect(state.project.activeCameraId).toBe("cam_2");
  expect(state.selectedObjectId).toBe("cam_object_2");
  expect(originalCamera?.captures).toEqual([]);
  expect(newCamera?.fov).toBe(64);
  expect(newCamera?.transform.position).toEqual(getCameraRigPositionFromViewSnapshot(snapshot));
  expect(getCameraViewSnapshotFromShot(newCamera)).toEqual(snapshot);
  expect(newCamera?.captures).toEqual([
    {
      id: "cam_2-capture-01",
      index: 1,
      name: "Camera02-Capture01",
      dataUrl: "data:image/png;base64,current-camera",
    },
  ]);
  expect(newCamera?.lastCaptureUrl).toBe("data:image/png;base64,current-camera");
});

it("stores viewport capsule screenshots in the current camera while already in camera view", async () => {
  const user = userEvent.setup();
  const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  const secondCameraSnapshot = {
    fov: 58,
    position: [1, 2, 6] as [number, number, number],
    target: [0, 1, 0] as [number, number, number],
  };
  const handler = vi.fn(async ({ preset }: { preset: "current" | "four" | "twelve" }) =>
    Array.from({ length: preset === "four" ? 4 : 1 }, (_, index) => ({
      label: `Camera capture-${index + 1}`,
      dataUrl: `data:image/png;base64,camera-view-${index + 1}`,
      meta: {
        mode: "camera" as const,
        cameraId: "cam_2",
        fov: 58,
        position: [1, 2, 6] as [number, number, number],
        target: [0, 1, 0] as [number, number, number],
      },
    }))
  );

  useDirectorStore.getState().addCameraShot(secondCameraSnapshot);
  useDirectorStore.getState().setViewMode("camera");
  setViewportCaptureHandler(handler);
  render(<ViewportToolbar />);

  await user.click(screen.getByRole("button", { name: "Four-angle capture" }));

  await waitFor(() => {
    expect(handler).toHaveBeenCalledWith({ preset: "four", source: "camera-panel", cameraId: "cam_2" });
  });

  const state = useDirectorStore.getState();
  const originalCamera = state.project.cameras[0];
  const activeCamera = state.project.cameras[1];

  expect(anchorClick).not.toHaveBeenCalled();
  expect(state.project.cameras).toHaveLength(2);
  expect(state.viewMode).toBe("camera");
  expect(state.project.activeCameraId).toBe("cam_2");
  expect(originalCamera?.captures).toEqual([]);
  expect(activeCamera?.captures).toHaveLength(4);
  expect(activeCamera?.captures?.map((item) => item.name)).toEqual([
    "Camera02-Capture01",
    "Camera02-Capture02",
    "Camera02-Capture03",
    "Camera02-Capture04",
  ]);
  expect(activeCamera?.lastCaptureUrl).toBe("data:image/png;base64,camera-view-4");
});

it("switches the active transform control mode from the viewport capsule", async () => {
  const user = userEvent.setup();
  render(<ViewportToolbar />);

  expect(screen.getByRole("button", { name: "Move" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "Move" })).toHaveClass("is-active");
  expect(screen.getByRole("button", { name: "Rotate" })).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByRole("button", { name: "Scale" })).toHaveAttribute("aria-pressed", "false");

  await user.click(screen.getByRole("button", { name: "Rotate" }));
  expect(useDirectorStore.getState().transformMode).toBe("rotate");
  expect(screen.getByRole("button", { name: "Move" })).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByRole("button", { name: "Rotate" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "Rotate" })).toHaveClass("is-active");

  await user.click(screen.getByRole("button", { name: "Scale" }));
  expect(useDirectorStore.getState().transformMode).toBe("scale");
  expect(screen.getByRole("button", { name: "Rotate" })).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByRole("button", { name: "Scale" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "Scale" })).toHaveClass("is-active");

  await user.click(screen.getByRole("button", { name: "Move" }));
  expect(useDirectorStore.getState().transformMode).toBe("translate");
  expect(screen.getByRole("button", { name: "Move" })).toHaveAttribute("aria-pressed", "true");
});

it("keeps add role and add camera actions available from the viewport capsule", async () => {
  const user = userEvent.setup();
  const snapshot = { fov: 64, position: [3, 2, 1] as [number, number, number], target: [0, 1, -2] as [number, number, number] };

  render(<ViewportToolbar getViewportCameraSnapshot={() => snapshot} />);

  await user.click(screen.getByRole("button", { name: "Add character" }));
  await user.click(screen.getByRole("menuitem", { name: "Male" }));
  await user.click(screen.getByRole("button", { name: "Add camera" }));

  const state = useDirectorStore.getState();
  const characterCount = state.project.objects.filter((item) => item.kind === "character").length;
  const cameraCount = state.project.cameras.length;

  expect(characterCount).toBe(2);
  expect(cameraCount).toBe(2);
  expect(state.selectedObjectId).toBe("cam_object_2");
  expect(state.project.cameras[1].fov).toBe(64);
  expect(state.project.cameras[1].transform.position).toEqual(getCameraRigPositionFromViewSnapshot(snapshot));
  expect(getCameraViewSnapshotFromShot(state.project.cameras[1]).position).toEqual(snapshot.position);
  expect(state.project.cameras[1].target).toEqual([0, 1, -2]);
});

it("does not show operation feedback text on the right side of the viewport capsule", async () => {
  const user = userEvent.setup();
  render(<ViewportToolbar />);

  await user.click(screen.getByRole("button", { name: "Rotate" }));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(screen.queryByText("Switched to rotate tool")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Add character" }));
  await user.click(screen.getByRole("menuitem", { name: "Male" }));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(screen.queryByText("Added Male")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Select aspect ratio" }));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(screen.queryByText("Aspect ratio entry ready")).not.toBeInTheDocument();
});

it("adds a selected procedural body type from the add-character menu", async () => {
  const user = userEvent.setup();
  render(<ViewportToolbar />);

  await user.click(screen.getByRole("button", { name: "Add character" }));

  BODY_TYPE_OPTIONS.forEach((option) => {
    expect(screen.getByRole("menuitem", { name: option.label })).toBeInTheDocument();
  });

  await user.click(screen.getByRole("menuitem", { name: "Broad" }));

  const characters = useDirectorStore.getState().project.objects.filter((item) => item.kind === "character");
  const added = characters[characters.length - 1];

  expect(added?.bodyType).toBe("broad");
  expect(useDirectorStore.getState().selectedObjectId).toBe(added?.id);
});

it("adds geometry primitives from the add-character submenu", async () => {
  const user = userEvent.setup();
  render(<ViewportToolbar />);

  await user.click(screen.getByRole("button", { name: "Add character" }));

  const geometryMenuItem = screen.getByRole("menuitem", { name: "Geometry" });
  expect(geometryMenuItem.querySelector("svg")).toBeInTheDocument();

  await user.hover(geometryMenuItem);

  ["Cube", "Sphere", "Cylinder", "Torus", "Cone", "Pyramid"].forEach((label) => {
    expect(screen.getByRole("menuitem", { name: label })).toBeInTheDocument();
  });

  await user.click(screen.getByRole("menuitem", { name: "Cube" }));

  const prop = useDirectorStore.getState().project.objects.find((item) => item.kind === "prop");

  expect(prop?.name).toBe("Cube");
  expect(prop?.geometryType).toBe("box");
  expect(prop?.color).toBe("#d7e7ff");
  expect(useDirectorStore.getState().selectedObjectId).toBe(prop?.id);
});

it("opens a crowd panel from the add-character menu hover row and adds a 3x3 character array", async () => {
  const user = userEvent.setup();
  render(<ViewportToolbar />);

  await user.click(screen.getByRole("button", { name: "Add character" }));

  const crowdMenuItem = screen.getByRole("menuitem", { name: "Crowd (3x3)" });
  expect(crowdMenuItem.querySelector(".lucide-users")).not.toBeInTheDocument();
  expect(crowdMenuItem.querySelector(".lucide-chevron-right")).toBeInTheDocument();

  fireEvent.click(crowdMenuItem);
  expect(screen.queryByRole("dialog", { name: "Add crowd array" })).not.toBeInTheDocument();

  await user.hover(crowdMenuItem);

  const crowdDialog = screen.getByRole("dialog", { name: "Add crowd array" });
  expect(crowdDialog).toBeInTheDocument();
  expect(within(crowdDialog).getByText("9 total")).toBeInTheDocument();
  expect(within(crowdDialog).getByLabelText("Crowd rows")).toHaveValue(3);
  expect(within(crowdDialog).getByLabelText("Crowd columns")).toHaveValue(3);
  expect(within(crowdDialog).getByLabelText("Crowd spacing")).toHaveValue(1.2);
  expect(within(crowdDialog).getByRole("button", { name: "Cancel" })).toHaveClass("camera-capture-clear-all");
  expect(within(crowdDialog).getByRole("button", { name: "Add crowd" })).toHaveClass("camera-capture-send-all");

  await user.click(screen.getByRole("button", { name: "Add crowd" }));

  await waitFor(() => {
    expect(useDirectorStore.getState().project.objects.filter((item) => item.kind === "character")).toHaveLength(10);
  });

  const state = useDirectorStore.getState();
  const crowdCharacters = state.project.objects.filter((item) => item.kind === "character" && item.id !== "char_default_a");

  expect(crowdCharacters).toHaveLength(9);
  expect(screen.queryByRole("dialog", { name: "Add crowd array" })).not.toBeInTheDocument();
  expect(state.selectedObjectIds).toHaveLength(9);
  expect(state.selectedObjectId).toBe(crowdCharacters[crowdCharacters.length - 1]?.id ?? null);
});

it("opens the model library panel from the viewport capsule", async () => {
  const user = userEvent.setup();
  render(<ViewportToolbar />);

  await user.click(screen.getByRole("button", { name: "Model Library" }));

  expect(screen.getByRole("dialog", { name: "Model Library" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "Convenience" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("tab", { name: "Home Living" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "Outdoors" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "Tools & Accessories" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "My Models" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Close model library" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Add model ATM" })).toBeInTheDocument();
  expect(screen.getByText("ATM")).toBeInTheDocument();
  expect(screen.queryByText("ATM")).not.toBeInTheDocument();
  expect(screen.queryByText("2 Liter")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Add model ATM" }).querySelector("img")).toBeInTheDocument();
});

it("uses category thumbnail folders for outdoor and tools model library items", async () => {
  const user = userEvent.setup();
  render(<ViewportToolbar />);

  await user.click(screen.getByRole("button", { name: "Model Library" }));
  await user.click(screen.getByRole("tab", { name: "Outdoors" }));

  expect(screen.getByRole("button", { name: "Add model Backpack" }).querySelector("img")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Add model Thermos" }).querySelector("img")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Add model Deer Skull" }).querySelector("img")).toBeInTheDocument();

  await user.click(screen.getByRole("tab", { name: "Tools & Accessories" }));

  expect(screen.getByRole("button", { name: "Add model Wrench" }).querySelector("img")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Add model Drill Press" }).querySelector("img")).toBeInTheDocument();
});

it("renders floating viewport menus and model library outside the frosted toolbar shell", async () => {
  const user = userEvent.setup();
  render(<ViewportToolbar />);

  const toolbar = screen.getByRole("group", { name: "3D viewport tools" });

  await user.click(screen.getByRole("button", { name: "Add character" }));
  const characterMenu = screen.getByRole("menu", { name: "Select body type" });
  expect(toolbar.contains(characterMenu)).toBe(false);

  await user.hover(screen.getByRole("menuitem", { name: "Geometry" }));
  const geometryMenu = screen.getByRole("menu", { name: "Select geometry" });
  expect(toolbar.contains(geometryMenu)).toBe(false);

  await user.click(screen.getByRole("button", { name: "Model Library" }));
  const modelLibrary = screen.getByRole("dialog", { name: "Model Library" });
  expect(toolbar.contains(modelLibrary)).toBe(false);
});

it("closes the model library panel from its close button", async () => {
  const user = userEvent.setup();
  render(<ViewportToolbar />);

  await user.click(screen.getByRole("button", { name: "Model Library" }));
  await user.click(screen.getByRole("button", { name: "Close model library" }));

  expect(screen.queryByRole("dialog", { name: "Model Library" })).not.toBeInTheDocument();
});

it("adds a selected model library item into the viewport scene", async () => {
  const user = userEvent.setup();
  render(<ViewportToolbar />);

  await user.click(screen.getByRole("button", { name: "Model Library" }));
  await user.click(screen.getByRole("button", { name: "Add model ATM" }));

  const state = useDirectorStore.getState();
  const asset = state.project.assets.find((item) => item.fileName === "ATM_low.fbx");
  const prop = state.project.objects.find((item) => item.name === "ATM");

  expect(asset?.sourceType).toBe("model");
  expect(asset?.kind).toBe("prop");
  expect(asset?.url).toContain("ATM_low");
  expect(prop?.kind).toBe("prop");
  expect(prop?.assetRefId).toBe(asset?.id);
  expect(state.selectedObjectId).toBe(prop?.id);
});

it("shows a centered empty state with a local import action inside the my-models tab", async () => {
  const user = userEvent.setup();
  render(<ViewportToolbar />);

  await user.click(screen.getByRole("button", { name: "Model Library" }));
  await user.click(screen.getByRole("tab", { name: "My Models" }));

  const emptyState = screen.getByRole("status", { name: "No models yet" });
  expect(emptyState).toBeInTheDocument();
  expect(within(emptyState).getByRole("button", { name: "Import local" })).toBeInTheDocument();
});

it("imports a local model into the my-models tab without adding it to the scene immediately", async () => {
  const user = userEvent.setup();
  mockReadLocalModelFile.mockResolvedValue({
    id: "local-model-1",
    fileName: "chair.obj",
    name: "Local chair",
    url: "blob:local-chair",
  });
  render(<ViewportToolbar />);

  await user.click(screen.getByRole("button", { name: "Model Library" }));
  await user.click(screen.getByRole("tab", { name: "My Models" }));
  await user.click(screen.getByRole("button", { name: "Import local" }));

  const fileInput = screen.getByTestId("library-local-model-input") as HTMLInputElement | null;
  expect(fileInput).not.toBeNull();

  await user.upload(fileInput!, new File(["chair"], "chair.obj", { type: "model/obj" }));

  await waitFor(() => {
    expect(useDirectorStore.getState().project.assets.some((item) => item.fileName === "chair.obj")).toBe(true);
  });

  const state = useDirectorStore.getState();
  expect(state.project.assets.some((item) => item.fileName === "chair.obj")).toBe(true);
  expect(state.project.objects.some((item) => item.name === "Local chair")).toBe(false);
  expect(screen.queryByRole("status", { name: "No models yet" })).not.toBeInTheDocument();
  expect(screen.getByText("Local chair")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Import local" })).toBeInTheDocument();
});

it("imports multiple local model files into the my-models tab at once", async () => {
  const user = userEvent.setup();
  mockReadLocalModelFile.mockImplementation(async (file: File) => ({
    id: `local-${file.name}`,
    fileName: file.name,
    name: file.name.replace(/\.(fbx|obj)$/i, ""),
    url: `data:model/plain;base64,${file.name}`,
  }));
  render(<ViewportToolbar />);

  await user.click(screen.getByRole("button", { name: "Model Library" }));
  await user.click(screen.getByRole("tab", { name: "My Models" }));
  await user.click(screen.getByRole("button", { name: "Import local" }));

  const fileInput = screen.getByTestId("library-local-model-input") as HTMLInputElement | null;
  expect(fileInput).not.toBeNull();
  expect(fileInput).toHaveAttribute("multiple");

  await user.upload(fileInput!, [
    new File(["chair"], "Local chair.obj", { type: "model/obj" }),
    new File(["table"], "Local table.fbx", { type: "model/fbx" }),
  ]);

  await waitFor(() => {
    expect(useDirectorStore.getState().project.assets.filter((item) => item.assetSource === "local")).toHaveLength(2);
  });

  const state = useDirectorStore.getState();
  expect(state.project.objects.some((item) => item.name === "Local chair")).toBe(false);
  expect(state.project.objects.some((item) => item.name === "Local table")).toBe(false);
  expect(screen.getByText("Local chair")).toBeInTheDocument();
  expect(screen.getByText("Local table")).toBeInTheDocument();
  expect(mockReadLocalModelFile).toHaveBeenCalledTimes(2);
});

it("restores imported my-models assets after browser refresh initialization", async () => {
  const user = userEvent.setup();
  mockReadLocalModelFile.mockResolvedValue({
    id: "local-model-persisted",
    fileName: "chair.obj",
    name: "Local chair",
    url: "data:model/plain;base64,cGERSISTED",
  });
  render(<ViewportToolbar />);

  await user.click(screen.getByRole("button", { name: "Model Library" }));
  await user.click(screen.getByRole("tab", { name: "My Models" }));
  await user.click(screen.getByRole("button", { name: "Import local" }));
  await user.upload(
    screen.getByTestId("library-local-model-input") as HTMLInputElement,
    new File(["chair"], "chair.obj", { type: "model/obj" })
  );

  await waitFor(() => {
    expect(useDirectorStore.getState().project.assets.some((item) => item.fileName === "chair.obj")).toBe(true);
  });

  await act(async () => {
    useDirectorStore.setState({
      ...useDirectorStore.getState(),
      ...createInitialDirectorState({ includePersistedLocalAssets: true }),
    });
  });

  await waitFor(() => {
    expect(screen.getByText("Local chair")).toBeInTheDocument();
  });

  const restoredAsset = useDirectorStore.getState().project.assets.find((item) => item.fileName === "chair.obj");
  expect(restoredAsset?.assetSource).toBe("local");
  expect(restoredAsset?.url).toBe("data:model/plain;base64,cGERSISTED");
  expect(useDirectorStore.getState().project.objects.some((item) => item.name === "Local chair")).toBe(false);
});

it("still imports a local model directly into the scene from the viewport capsule action", async () => {
  const user = userEvent.setup();
  mockReadLocalModelFile.mockResolvedValue({
    id: "local-model-2",
    fileName: "lamp.obj",
    name: "Local lamp",
    url: "blob:local-lamp",
  });
  render(<ViewportToolbar />);

  await user.click(screen.getByRole("button", { name: "Import local model" }));

  const fileInput = screen.getByTestId("scene-local-model-input") as HTMLInputElement | null;
  expect(fileInput).not.toBeNull();

  await user.upload(fileInput!, new File(["lamp"], "lamp.obj", { type: "model/obj" }));

  await waitFor(() => {
    expect(useDirectorStore.getState().project.objects.some((item) => item.name === "Local lamp")).toBe(true);
  });

  const state = useDirectorStore.getState();
  expect(state.project.assets.some((item) => item.fileName === "lamp.obj")).toBe(true);
  expect(state.project.objects.some((item) => item.name === "Local lamp")).toBe(true);
});

it("shows a delete action on my-models cards and removes the asset plus its scene instances", async () => {
  const user = userEvent.setup();
  mockReadLocalModelFile.mockResolvedValue({
    id: "local-model-3",
    fileName: "chair.obj",
    name: "Local chair",
    url: "blob:local-chair",
  });
  render(<ViewportToolbar />);

  await user.click(screen.getByRole("button", { name: "Model Library" }));
  await user.click(screen.getByRole("tab", { name: "My Models" }));
  await user.click(screen.getByRole("button", { name: "Import local" }));

  const fileInput = screen.getByTestId("library-local-model-input") as HTMLInputElement | null;
  expect(fileInput).not.toBeNull();

  await user.upload(fileInput!, new File(["chair"], "chair.obj", { type: "model/obj" }));

  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Add model Local chair" })).toBeInTheDocument();
  });

  await user.click(screen.getByRole("button", { name: "Add model Local chair" }));

  await waitFor(() => {
    expect(useDirectorStore.getState().project.objects.some((item) => item.name === "Local chair")).toBe(true);
  });

  await user.click(screen.getByRole("button", { name: "Model Library" }));
  await user.click(screen.getByRole("tab", { name: "My Models" }));
  await user.hover(screen.getByRole("button", { name: "Add model Local chair" }));
  await user.click(screen.getByRole("button", { name: "Delete model Local chair" }));

  await waitFor(() => {
    expect(useDirectorStore.getState().project.assets.some((item) => item.fileName === "chair.obj")).toBe(false);
  });

  const state = useDirectorStore.getState();
  expect(state.project.assets.some((item) => item.fileName === "chair.obj")).toBe(false);
  expect(state.project.objects.some((item) => item.name === "Local chair")).toBe(false);
  expect(screen.getByRole("status", { name: "No models yet" })).toBeInTheDocument();
});

it("opens the geometry submenu only after hover every time the add-character menu is opened", async () => {
  const user = userEvent.setup();
  render(<ViewportToolbar />);

  await user.click(screen.getByRole("button", { name: "Add character" }));

  const geometryMenuItem = screen.getByRole("menuitem", { name: "Geometry" });
  fireEvent.click(geometryMenuItem);
  expect(screen.queryByRole("menu", { name: "Select geometry" })).not.toBeInTheDocument();

  await user.hover(geometryMenuItem);
  expect(screen.getByRole("menu", { name: "Select geometry" })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Add character" }));
  expect(screen.queryByRole("menu", { name: "Select body type" })).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Add character" }));
  expect(screen.getByRole("menu", { name: "Select body type" })).toBeInTheDocument();
  expect(screen.queryByRole("menu", { name: "Select geometry" })).not.toBeInTheDocument();

  await user.hover(screen.getByRole("menuitem", { name: "Geometry" }));
  expect(screen.getByRole("menu", { name: "Select geometry" })).toBeInTheDocument();
});

it("closes the geometry submenu when users hover another character menu item", async () => {
  const user = userEvent.setup();
  render(<ViewportToolbar />);

  await user.click(screen.getByRole("button", { name: "Add character" }));
  await user.hover(screen.getByRole("menuitem", { name: "Geometry" }));

  expect(screen.getByRole("menu", { name: "Select geometry" })).toBeInTheDocument();

  await user.hover(screen.getByRole("menuitem", { name: "Female" }));

  expect(screen.queryByRole("menu", { name: "Select geometry" })).not.toBeInTheDocument();
  expect(screen.getByRole("menu", { name: "Select body type" })).toBeInTheDocument();
});

it("closes open viewport toolbar menus when users click outside", async () => {
  const user = userEvent.setup();
  render(
    <>
      <button type="button">Canvas blank</button>
      <ViewportToolbar />
    </>
  );

  await user.click(screen.getByRole("button", { name: "Add character" }));
  await user.hover(screen.getByRole("menuitem", { name: "Geometry" }));

  expect(screen.getByRole("menu", { name: "Select body type" })).toBeInTheDocument();
  expect(screen.getByRole("menu", { name: "Select geometry" })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Canvas blank" }));

  expect(screen.queryByRole("menu", { name: "Select body type" })).not.toBeInTheDocument();
  expect(screen.queryByRole("menu", { name: "Select geometry" })).not.toBeInTheDocument();
});

it("opens the aspect ratio panel from the viewport capsule with the supported presets", async () => {
  const user = userEvent.setup();
  render(<ViewportToolbar />);

  await user.click(screen.getByRole("button", { name: "Select aspect ratio" }));

  const toolbar = screen.getByRole("group", { name: "3D viewport tools" });
  const dialog = screen.getByRole("dialog", { name: "Aspect Ratio" });

  expect(dialog).toBeInTheDocument();
  expect(toolbar.contains(dialog)).toBe(false);
  expect(screen.getByRole("button", { name: "Auto" })).toHaveAttribute("aria-pressed", "true");
  ["1:1", "2:1", "3:4", "4:3", "16:9", "21:9", "9:16"].forEach((label) => {
    expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
  });
});

it("updates the viewport aspect ratio from the ratio panel", async () => {
  const user = userEvent.setup();
  render(<ViewportToolbar />);

  await user.click(screen.getByRole("button", { name: "Select aspect ratio" }));
  await user.click(screen.getByRole("button", { name: "9:16" }));

  expect(useDirectorStore.getState().viewportAspectRatio).toBe("9:16");
  expect(screen.queryByRole("dialog", { name: "Aspect Ratio" })).not.toBeInTheDocument();
});
