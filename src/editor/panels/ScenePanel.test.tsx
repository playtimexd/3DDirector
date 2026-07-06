import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach } from "vitest";
import { createInitialDirectorState, useDirectorStore } from "../store/directorStore";
import { ScenePanel } from "./ScenePanel";

beforeEach(() => {
  useDirectorStore.setState({
    ...useDirectorStore.getState(),
    ...createInitialDirectorState(),
  });
});

it("uses the provided right inspector layout for scene properties", () => {
  const { container } = render(<ScenePanel />);

  expect(screen.getByLabelText("3D scene properties panel")).toHaveClass("right-inspector", "scene-inspector");
  expect(container.querySelector(".right-inspector-header")).toBeInTheDocument();
  expect(container.querySelector(".right-inspector-content")).toBeInTheDocument();
  expect(screen.getByLabelText("Scene position X").closest(".inspector-axis-input")).toBeInTheDocument();
});

it("lays scene switches out in one row and only toggles from the checkbox", async () => {
  const user = userEvent.setup();
  const { container } = render(<ScenePanel />);

  const switchRow = container.querySelector(".scene-switch-row");
  const labelText = screen.getByText("Character labels");
  const checkbox = screen.getByLabelText("Character labels");

  expect(switchRow).toBeInTheDocument();
  expect(switchRow?.querySelectorAll(".inspector-toggle-row")).toHaveLength(3);
  expect(checkbox).toBeChecked();

  await user.click(labelText);

  expect(checkbox).toBeChecked();

  await user.click(checkbox);

  expect(checkbox).not.toBeChecked();
});

it("updates scene transform, panorama, and ground controls", async () => {
  const user = userEvent.setup();
  render(<ScenePanel />);

  await user.clear(screen.getByLabelText("Scene scale"));
  await user.type(screen.getByLabelText("Scene scale"), "1.3");
  await user.clear(screen.getByLabelText("Scene position Y"));
  await user.type(screen.getByLabelText("Scene position Y"), "2");
  await user.clear(screen.getByLabelText("Scene rotation Z"));
  await user.type(screen.getByLabelText("Scene rotation Z"), "45");
  await user.clear(screen.getByLabelText("Sky color HEX"));
  await user.type(screen.getByLabelText("Sky color HEX"), "#123456");
  await user.clear(screen.getByLabelText("Panorama horizontal rotation"));
  await user.type(screen.getByLabelText("Panorama horizontal rotation"), "30");
  await user.clear(screen.getByLabelText("Panorama radius"));
  await user.type(screen.getByLabelText("Panorama radius"), "90");
  await user.click(screen.getByLabelText("Character labels"));
  await user.click(screen.getByLabelText("Snap to grid"));
  await user.clear(screen.getByLabelText("Ground opacity"));
  await user.type(screen.getByLabelText("Ground opacity"), "0.65");
  await user.clear(screen.getByLabelText("Ground height"));
  await user.type(screen.getByLabelText("Ground height"), "1.2");

  const scene = useDirectorStore.getState().project.scene;
  expect(scene.scale).toBe(1.3);
  expect(scene.position).toEqual([0, 2, 0]);
  expect(scene.rotation).toEqual([0, 0, 45]);
  expect(scene.backgroundColor).toBe("#123456");
  expect(scene.panoramaYaw).toBe(30);
  expect(scene.panoramaRadius).toBe(90);
  expect(scene.showLabels).toBe(false);
  expect(scene.snapToGrid).toBe(true);
  expect(scene.groundOpacity).toBe(0.65);
  expect(scene.groundHeight).toBe(1.2);
});

it("renders a connected panorama as a compact thumbnail card with the file name overlay", () => {
  const initialState = createInitialDirectorState();
  useDirectorStore.setState({
    ...useDirectorStore.getState(),
    ...initialState,
    project: {
      ...initialState.project,
      assets: [
        {
          id: "asset_panorama_1",
          kind: "panorama",
          sourceType: "image",
          fileName: "studio-panorama.jpg",
          url: "data:image/jpeg;base64,panorama-preview",
        },
      ],
      panoramaAssetId: "asset_panorama_1",
    },
  });

  render(<ScenePanel />);

  expect(screen.queryByText("Connected panorama: studio-panorama.jpg")).not.toBeInTheDocument();
  expect(screen.queryByText("Panorama preview")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Panorama preview card")).not.toBeInTheDocument();

  const thumbnailCard = screen.getByLabelText("Panorama thumbnail card");
  const thumbnailImage = screen.getByAltText("studio-panorama.jpg panorama thumbnail");

  expect(thumbnailCard).toHaveClass("panorama-thumbnail-card");
  expect(screen.getByText("studio-panorama.jpg")).toHaveClass("panorama-thumbnail-name");
  expect(thumbnailImage).toHaveClass("panorama-thumbnail-image");
  expect(thumbnailImage).toHaveAttribute(
    "src",
    "data:image/jpeg;base64,panorama-preview"
  );
});

it("removes the connected panorama when the delete icon is clicked", async () => {
  const user = userEvent.setup();
  const initialState = createInitialDirectorState();
  useDirectorStore.setState({
    ...useDirectorStore.getState(),
    ...initialState,
    project: {
      ...initialState.project,
      assets: [
        {
          id: "asset_panorama_1",
          kind: "panorama",
          sourceType: "image",
          fileName: "studio-panorama.jpg",
          url: "data:image/jpeg;base64,panorama-preview",
        },
      ],
      panoramaAssetId: "asset_panorama_1",
    },
  });

  render(<ScenePanel />);

  await user.click(screen.getByRole("button", { name: "Delete panorama" }));

  expect(useDirectorStore.getState().project.panoramaAssetId).toBeNull();
  expect(useDirectorStore.getState().project.assets).toHaveLength(0);
  expect(screen.getByLabelText("Panorama status")).toBeInTheDocument();
});

it("renders the disconnected panorama state as a fixed-size dark card", () => {
  render(<ScenePanel />);

  const panoramaStatus = screen.getByLabelText("Panorama status");

  expect(panoramaStatus).toHaveClass("panorama-empty-card");
  expect(screen.getByTestId("panorama-empty-icon")).toBeInTheDocument();
  expect(panoramaStatus).toHaveTextContent("No panorama connected");
});

it("updates panorama radius from both slider and numeric input", async () => {
  const user = userEvent.setup();
  render(<ScenePanel />);

  await user.clear(screen.getByLabelText("Panorama radius"));
  await user.type(screen.getByLabelText("Panorama radius"), "150");

  expect(useDirectorStore.getState().project.scene.panoramaRadius).toBe(150);
  expect(screen.getByLabelText("Panorama radius slider")).toHaveValue("150");

  fireEvent.change(screen.getByLabelText("Panorama radius slider"), { target: { value: "149" } });

  expect(useDirectorStore.getState().project.scene.panoramaRadius).toBe(149);
  expect(screen.getByLabelText("Panorama radius")).toHaveValue(149);
});

it("updates panorama yaw and ground height from both sliders and numeric inputs", async () => {
  const user = userEvent.setup();
  render(<ScenePanel />);

  await user.clear(screen.getByLabelText("Panorama horizontal rotation"));
  await user.type(screen.getByLabelText("Panorama horizontal rotation"), "45");

  expect(useDirectorStore.getState().project.scene.panoramaYaw).toBe(45);
  expect(screen.getByLabelText("Panorama horizontal rotation slider")).toHaveValue("45");

  fireEvent.change(screen.getByLabelText("Panorama horizontal rotation slider"), { target: { value: "-30" } });

  expect(useDirectorStore.getState().project.scene.panoramaYaw).toBe(-30);
  expect(screen.getByLabelText("Panorama horizontal rotation")).toHaveValue(-30);

  await user.clear(screen.getByLabelText("Ground height"));
  await user.type(screen.getByLabelText("Ground height"), "1.2");

  expect(useDirectorStore.getState().project.scene.groundHeight).toBe(1.2);
  expect(screen.getByLabelText("Ground height slider")).toHaveValue("1.2");

  fireEvent.change(screen.getByLabelText("Ground height slider"), { target: { value: "-1.5" } });

  expect(useDirectorStore.getState().project.scene.groundHeight).toBe(-1.5);
  expect(screen.getByLabelText("Ground height")).toHaveValue(-1.5);
});

it("hides ground opacity and height controls when ground is disabled", async () => {
  const user = userEvent.setup();
  render(<ScenePanel />);

  expect(screen.getByLabelText("Ground opacity")).toBeInTheDocument();
  expect(screen.getByLabelText("Ground height")).toBeInTheDocument();

  await user.click(screen.getByLabelText("Ground"));

  expect(screen.queryByLabelText("Ground opacity")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Ground height")).not.toBeInTheDocument();
});

it("updates scene scale from both slider and numeric input", async () => {
  const user = userEvent.setup();
  render(<ScenePanel />);

  expect(screen.getByLabelText("Scene scale slider")).toHaveValue("1");

  await user.clear(screen.getByLabelText("Scene scale"));
  await user.type(screen.getByLabelText("Scene scale"), "1.35");

  expect(useDirectorStore.getState().project.scene.scale).toBe(1.35);
  expect(screen.getByLabelText("Scene scale slider")).toHaveValue("1.35");

  fireEvent.change(screen.getByLabelText("Scene scale slider"), { target: { value: "1.8" } });

  expect(useDirectorStore.getState().project.scene.scale).toBe(1.8);
  expect(screen.getByLabelText("Scene scale")).toHaveValue(1.8);
});

it("keeps the axis drag affordance visible while dragging values", () => {
  render(<ScenePanel />);

  const xDragHandle = screen.getByLabelText("Scene position X drag to adjust");
  const axisInput = xDragHandle.closest(".inspector-axis-input");

  expect(xDragHandle).not.toHaveClass("is-dragging");
  expect(axisInput).not.toHaveClass("is-dragging");

  fireEvent.mouseDown(xDragHandle, { button: 0, clientX: 100 });

  expect(xDragHandle).not.toHaveClass("is-dragging");
  expect(axisInput).toHaveClass("is-dragging");

  fireEvent.mouseMove(window, { clientX: 120 });

  expect(useDirectorStore.getState().project.scene.position[0]).toBe(0.2);

  fireEvent.mouseUp(window);

  expect(xDragHandle).not.toHaveClass("is-dragging");
  expect(axisInput).not.toHaveClass("is-dragging");
});

it("keeps the XYZ drag handle width stable while dragging", () => {
  render(<ScenePanel />);

  const xDragHandle = screen.getByLabelText("Scene position X drag to adjust");
  const widthBeforeDrag = getComputedStyle(xDragHandle).width;

  fireEvent.mouseDown(xDragHandle, { button: 0, clientX: 100 });
  const widthDuringDrag = getComputedStyle(xDragHandle).width;
  fireEvent.mouseMove(window, { clientX: 120 });
  fireEvent.mouseUp(window);

  expect(widthDuringDrag).toBe(widthBeforeDrag);
});

it("keeps the XYZ drag handle visuals stable while dragging", () => {
  render(<ScenePanel />);

  const xDragHandle = screen.getByLabelText("Scene position X drag to adjust");
  const backgroundBeforeDrag = getComputedStyle(xDragHandle).backgroundColor;
  const colorBeforeDrag = getComputedStyle(xDragHandle).color;

  fireEvent.mouseDown(xDragHandle, { button: 0, clientX: 100 });

  const backgroundDuringDrag = getComputedStyle(xDragHandle).backgroundColor;
  const colorDuringDrag = getComputedStyle(xDragHandle).color;

  fireEvent.mouseUp(window);

  expect(backgroundDuringDrag).toBe(backgroundBeforeDrag);
  expect(colorDuringDrag).toBe(colorBeforeDrag);
});

it("keeps the XYZ drag handle focused instead of moving focus into the number input", () => {
  render(<ScenePanel />);

  const xDragHandle = screen.getByLabelText("Scene position X drag to adjust");
  const xInput = screen.getByLabelText("Scene position X");

  fireEvent.mouseDown(xDragHandle, { button: 0, clientX: 100 });

  expect(document.activeElement).toBe(xDragHandle);
  expect(document.activeElement).not.toBe(xInput);

  fireEvent.mouseUp(window);
});

it("renders the XYZ drag handle inside the 80px axis input shell", () => {
  render(<ScenePanel />);

  const xDragHandle = screen.getByLabelText("Scene position X drag to adjust");
  const axisInput = xDragHandle.closest(".inspector-axis-input");
  const valueInput = screen.getByLabelText("Scene position X");

  expect(axisInput).toBeInTheDocument();
  expect(axisInput).toHaveClass("inspector-axis-input");
  expect(valueInput.closest(".inspector-axis-input")).toBe(axisInput);
  expect(getComputedStyle(axisInput as HTMLElement).backgroundColor).toBe("rgb(11, 11, 12)");
});
