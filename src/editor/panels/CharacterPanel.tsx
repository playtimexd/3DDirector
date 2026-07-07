import { useMemo, useState } from "react";
import {
  InspectorAxisGroup,
  InspectorColorField,
  InspectorPanel,
  InspectorRangeNumberField,
  InspectorSelectField,
  InspectorTextField,
  InspectorSection,
} from "./InspectorControls";
import { MANNEQUIN_POSE_PRESETS } from "../presets/mannequinPosePresets";
import { WEAPON_OPTIONS, type WeaponAttachment, type WeaponHand, type WeaponType } from "../schema/directorProject";
import { getCrowdAnchorTransform, useDirectorStore } from "../store/directorStore";

function replaceAxis(tuple: [number, number, number], axis: 0 | 1 | 2, value: number): [number, number, number] {
  return tuple.map((item, index) => (index === axis ? value : item)) as [number, number, number];
}

export function CharacterPanel() {
  const [activeTab, setActiveTab] = useState<"properties" | "pose">("properties");
  const selectedCrowdId = useDirectorStore((state) => state.selectedCrowdId);
  const selectedObjectId = useDirectorStore((state) => state.selectedObjectId);
  const objects = useDirectorStore((state) => state.project.objects);
  const updateObjectName = useDirectorStore((state) => state.updateObjectName);
  const updateCrowdLabel = useDirectorStore((state) => state.updateCrowdLabel);
  const updateObjectTransform = useDirectorStore((state) => state.updateObjectTransform);
  const updateCrowdTransform = useDirectorStore((state) => state.updateCrowdTransform);
  const updateUniformScale = useDirectorStore((state) => state.updateUniformScale);
  const updateCrowdUniformScale = useDirectorStore((state) => state.updateCrowdUniformScale);
  const updateObjectColor = useDirectorStore((state) => state.updateObjectColor);
  const updateCrowdColor = useDirectorStore((state) => state.updateCrowdColor);
  const setCharacterWeapon = useDirectorStore((state) => state.setCharacterWeapon);
  const updateCharacterWeapon = useDirectorStore((state) => state.updateCharacterWeapon);
  const setCrowdWeapon = useDirectorStore((state) => state.setCrowdWeapon);
  const updateCrowdWeapon = useDirectorStore((state) => state.updateCrowdWeapon);
  const applyPosePreset = useDirectorStore((state) => state.applyPosePreset);
  const applyCrowdPosePreset = useDirectorStore((state) => state.applyCrowdPosePreset);
  const updatePoseControl = useDirectorStore((state) => state.updatePoseControl);
  const updateCrowdPoseControl = useDirectorStore((state) => state.updateCrowdPoseControl);

  const selection = useMemo(() => {
    const role = objects.find((item) => item.id === selectedObjectId && item.kind === "character");

    if (selectedCrowdId) {
      const crowdMembers = objects.filter((item) => item.kind === "character" && item.crowdId === selectedCrowdId);
      const crowdAnchor = getCrowdAnchorTransform(objects, selectedCrowdId);

      if (crowdMembers.length && crowdAnchor) {
        return {
          mode: "crowd" as const,
          crowdId: selectedCrowdId,
          crowdMembers,
          crowdAnchor,
          role: crowdMembers[crowdMembers.length - 1] ?? crowdMembers[0],
          name: crowdMembers[0]?.crowdLabel ?? "Crowd",
          color: crowdMembers[0]?.color ?? "#4F8EF7",
        };
      }
    }

    if (!role) return null;

    return {
      mode: "single" as const,
      crowdId: null,
      crowdMembers: [role],
      crowdAnchor: role.transform,
      role,
      name: role.name,
      color: role.color ?? "#4F8EF7",
    };
  }, [objects, selectedCrowdId, selectedObjectId]);

  if (!selection) return null;

  const role = selection.role;
  const roleColor = selection.color;
  const transform = selection.crowdAnchor;
  const isCrowd = selection.mode === "crowd";
  const weapon = role.weapon;

  const applyWeaponType = (value: string) => {
    const nextType = value === "none" ? null : (value as WeaponType);
    if (isCrowd && selection.crowdId) setCrowdWeapon(selection.crowdId, nextType);
    else setCharacterWeapon(role.id, nextType);
  };

  const patchWeapon = (patch: Partial<WeaponAttachment>) => {
    if (isCrowd && selection.crowdId) updateCrowdWeapon(selection.crowdId, patch);
    else updateCharacterWeapon(role.id, patch);
  };
  const poseGroups = [
    {
      title: "Body",
      controls: [
        { key: "body.pitch", label: "Lean" },
        { key: "body.yaw", label: "Turn" },
        { key: "body.roll", label: "Tilt" },
      ],
    },
    {
      title: "Torso",
      controls: [
        { key: "torso.pitch", label: "Lean" },
        { key: "torso.yaw", label: "Twist" },
        { key: "torso.roll", label: "Tilt" },
      ],
    },
    {
      title: "Head",
      controls: [
        { key: "head.pitch", label: "Nod" },
        { key: "head.yaw", label: "Turn" },
        { key: "head.roll", label: "Tilt" },
      ],
    },
    {
      title: "Left shoulder",
      controls: [
        { key: "leftShoulder.pitch", label: "Raise" },
        { key: "leftShoulder.spread", label: "Spread" },
        { key: "leftShoulder.twist", label: "Twist" },
      ],
    },
    {
      title: "Right shoulder",
      controls: [
        { key: "rightShoulder.pitch", label: "Raise" },
        { key: "rightShoulder.spread", label: "Spread" },
        { key: "rightShoulder.twist", label: "Twist" },
      ],
    },
    {
      title: "Left elbow",
      controls: [{ key: "leftElbow.bend", label: "Bend" }],
    },
    {
      title: "Right elbow",
      controls: [{ key: "rightElbow.bend", label: "Bend" }],
    },
    {
      title: "Left hip",
      controls: [
        { key: "leftHip.pitch", label: "Raise" },
        { key: "leftHip.spread", label: "Spread" },
        { key: "leftHip.twist", label: "Twist" },
      ],
    },
    {
      title: "Right hip",
      controls: [
        { key: "rightHip.pitch", label: "Raise" },
        { key: "rightHip.spread", label: "Spread" },
        { key: "rightHip.twist", label: "Twist" },
      ],
    },
    {
      title: "Left knee",
      controls: [{ key: "leftKnee.bend", label: "Bend" }],
    },
    {
      title: "Right knee",
      controls: [{ key: "rightKnee.bend", label: "Bend" }],
    },
  ] as const;

  return (
    <InspectorPanel
      title="Character"
      ariaLabel="Character properties panel"
      className="character-inspector"
      tabs={[
        { label: "Properties", active: activeTab === "properties", onClick: () => setActiveTab("properties") },
        { label: "Pose", active: activeTab === "pose", onClick: () => setActiveTab("pose") },
      ]}
    >
      {activeTab === "properties" ? (
        <>
          <InspectorTextField
            label="Name"
            ariaLabel="Character name"
            value={selection.name}
            onChange={(value) => {
              if (isCrowd && selection.crowdId) {
                updateCrowdLabel(selection.crowdId, value);
                return;
              }

              updateObjectName(role.id, value);
            }}
          />
          <InspectorAxisGroup
            label="Position"
            axes={[
              {
                axis: "X",
                ariaLabel: "Character position X",
                value: transform.position[0],
                onChange: (value) =>
                  isCrowd && selection.crowdId
                    ? updateCrowdTransform(selection.crowdId, {
                        position: replaceAxis(transform.position, 0, Number(value)),
                      })
                    : updateObjectTransform(role.id, {
                        position: replaceAxis(transform.position, 0, Number(value)),
                      }),
              },
              {
                axis: "Y",
                ariaLabel: "Character position Y",
                value: transform.position[1],
                onChange: (value) =>
                  isCrowd && selection.crowdId
                    ? updateCrowdTransform(selection.crowdId, {
                        position: replaceAxis(transform.position, 1, Number(value)),
                      })
                    : updateObjectTransform(role.id, {
                        position: replaceAxis(transform.position, 1, Number(value)),
                      }),
              },
              {
                axis: "Z",
                ariaLabel: "Character position Z",
                value: transform.position[2],
                onChange: (value) =>
                  isCrowd && selection.crowdId
                    ? updateCrowdTransform(selection.crowdId, {
                        position: replaceAxis(transform.position, 2, Number(value)),
                      })
                    : updateObjectTransform(role.id, {
                        position: replaceAxis(transform.position, 2, Number(value)),
                      }),
              },
            ]}
          />
          <InspectorAxisGroup
            label="Rotation"
            axes={[
              {
                axis: "X",
                ariaLabel: "Character rotation X",
                value: transform.rotation[0],
                onChange: (value) =>
                  isCrowd && selection.crowdId
                    ? updateCrowdTransform(selection.crowdId, {
                        rotation: replaceAxis(transform.rotation, 0, Number(value)),
                      })
                    : updateObjectTransform(role.id, {
                        rotation: replaceAxis(transform.rotation, 0, Number(value)),
                      }),
              },
              {
                axis: "Y",
                ariaLabel: "Character rotation Y",
                value: transform.rotation[1],
                onChange: (value) =>
                  isCrowd && selection.crowdId
                    ? updateCrowdTransform(selection.crowdId, {
                        rotation: replaceAxis(transform.rotation, 1, Number(value)),
                      })
                    : updateObjectTransform(role.id, {
                        rotation: replaceAxis(transform.rotation, 1, Number(value)),
                      }),
              },
              {
                axis: "Z",
                ariaLabel: "Character rotation Z",
                value: transform.rotation[2],
                onChange: (value) =>
                  isCrowd && selection.crowdId
                    ? updateCrowdTransform(selection.crowdId, {
                        rotation: replaceAxis(transform.rotation, 2, Number(value)),
                      })
                    : updateObjectTransform(role.id, {
                        rotation: replaceAxis(transform.rotation, 2, Number(value)),
                      }),
              },
            ]}
          />
          <InspectorAxisGroup
            label="Scale"
            axes={[
              {
                axis: "X",
                ariaLabel: "Character scale X",
                step: "0.01",
                value: transform.scale[0],
                onChange: (value) =>
                  isCrowd && selection.crowdId
                    ? updateCrowdTransform(selection.crowdId, {
                        scale: replaceAxis(transform.scale, 0, Number(value)),
                      })
                    : updateObjectTransform(role.id, {
                        scale: replaceAxis(transform.scale, 0, Number(value)),
                      }),
              },
              {
                axis: "Y",
                ariaLabel: "Character scale Y",
                step: "0.01",
                value: transform.scale[1],
                onChange: (value) =>
                  isCrowd && selection.crowdId
                    ? updateCrowdTransform(selection.crowdId, {
                        scale: replaceAxis(transform.scale, 1, Number(value)),
                      })
                    : updateObjectTransform(role.id, {
                        scale: replaceAxis(transform.scale, 1, Number(value)),
                      }),
              },
              {
                axis: "Z",
                ariaLabel: "Character scale Z",
                step: "0.01",
                value: transform.scale[2],
                onChange: (value) =>
                  isCrowd && selection.crowdId
                    ? updateCrowdTransform(selection.crowdId, {
                        scale: replaceAxis(transform.scale, 2, Number(value)),
                      })
                    : updateObjectTransform(role.id, {
                        scale: replaceAxis(transform.scale, 2, Number(value)),
                      }),
              },
            ]}
          />
          <InspectorRangeNumberField
            label="Uniform scale"
            rangeAriaLabel="Character uniform scale slider"
            numberAriaLabel="Character uniform scale"
            max="3"
            min="0.2"
            step="0.01"
            value={transform.scale[0]}
            onValueChange={(value) =>
              isCrowd && selection.crowdId
                ? updateCrowdUniformScale(selection.crowdId, Number(value))
                : updateUniformScale(role.id, Number(value))
            }
          />
          <InspectorColorField
            label="Color"
            colorAriaLabel="Character color"
            hexAriaLabel="Character color HEX"
            value={roleColor}
            onColorChange={(value) =>
              isCrowd && selection.crowdId ? updateCrowdColor(selection.crowdId, value) : updateObjectColor(role.id, value)
            }
            onHexChange={(value) =>
              isCrowd && selection.crowdId ? updateCrowdColor(selection.crowdId, value) : updateObjectColor(role.id, value)
            }
          />
          <InspectorSection title="Weapon" className="weapon-section">
            <InspectorSelectField
              label="Type"
              ariaLabel="Weapon type"
              value={weapon?.type ?? "none"}
              onChange={applyWeaponType}
            >
              <option value="none">None</option>
              {WEAPON_OPTIONS.map((option) => (
                <option key={option.type} value={option.type}>
                  {option.label}
                </option>
              ))}
            </InspectorSelectField>
            {weapon ? (
              <>
                <InspectorSelectField
                  label="Hand"
                  ariaLabel="Weapon hand"
                  value={weapon.hand}
                  onChange={(value) => patchWeapon({ hand: value as WeaponHand })}
                >
                  <option value="right">Right hand</option>
                  <option value="left">Left hand</option>
                </InspectorSelectField>
                <InspectorAxisGroup
                  label="Grip offset"
                  axes={[
                    {
                      axis: "X",
                      ariaLabel: "Weapon offset X",
                      step: "0.01",
                      value: weapon.offset[0],
                      onChange: (value) => patchWeapon({ offset: replaceAxis(weapon.offset, 0, Number(value)) }),
                    },
                    {
                      axis: "Y",
                      ariaLabel: "Weapon offset Y",
                      step: "0.01",
                      value: weapon.offset[1],
                      onChange: (value) => patchWeapon({ offset: replaceAxis(weapon.offset, 1, Number(value)) }),
                    },
                    {
                      axis: "Z",
                      ariaLabel: "Weapon offset Z",
                      step: "0.01",
                      value: weapon.offset[2],
                      onChange: (value) => patchWeapon({ offset: replaceAxis(weapon.offset, 2, Number(value)) }),
                    },
                  ]}
                />
                <InspectorAxisGroup
                  label="Grip rotation"
                  axes={[
                    {
                      axis: "X",
                      ariaLabel: "Weapon rotation X",
                      step: "1",
                      value: weapon.rotation[0],
                      onChange: (value) => patchWeapon({ rotation: replaceAxis(weapon.rotation, 0, Number(value)) }),
                    },
                    {
                      axis: "Y",
                      ariaLabel: "Weapon rotation Y",
                      step: "1",
                      value: weapon.rotation[1],
                      onChange: (value) => patchWeapon({ rotation: replaceAxis(weapon.rotation, 1, Number(value)) }),
                    },
                    {
                      axis: "Z",
                      ariaLabel: "Weapon rotation Z",
                      step: "1",
                      value: weapon.rotation[2],
                      onChange: (value) => patchWeapon({ rotation: replaceAxis(weapon.rotation, 2, Number(value)) }),
                    },
                  ]}
                />
                <InspectorRangeNumberField
                  label="Weapon scale"
                  rangeAriaLabel="Weapon scale slider"
                  numberAriaLabel="Weapon scale"
                  max="3"
                  min="0.2"
                  step="0.01"
                  value={weapon.scale}
                  onValueChange={(value) => patchWeapon({ scale: Number(value) })}
                />
                <InspectorColorField
                  label="Weapon color"
                  colorAriaLabel="Weapon color"
                  hexAriaLabel="Weapon color HEX"
                  value={weapon.color}
                  onColorChange={(value) => patchWeapon({ color: value })}
                  onHexChange={(value) => patchWeapon({ color: value })}
                />
              </>
            ) : null}
          </InspectorSection>
        </>
      ) : (
        <InspectorSection title="Pose presets" className="pose-preset-section">
          {role.characterRig ? (
            <>
              <div className="preset-grid">
                {MANNEQUIN_POSE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className={role.characterRig?.posePresetId === preset.id ? "is-active" : undefined}
                    type="button"
                    onClick={() =>
                      isCrowd && selection.crowdId
                        ? applyCrowdPosePreset(selection.crowdId, preset.id)
                        : applyPosePreset(role.id, preset.id)
                    }
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <InspectorSection title="Pose adjustment" className="pose-adjust-section">
                <div className="pose-groups">
                  {poseGroups.map((group) => (
                    <section key={group.title} className="pose-group">
                      <h4>{group.title}</h4>
                      {group.controls.map((control) => (
                        <InspectorRangeNumberField
                          key={control.key}
                          label={control.label}
                          rangeAriaLabel={`${group.title} · ${control.label} slider`}
                          numberAriaLabel={`${group.title} · ${control.label}`}
                          max="90"
                          min="-90"
                          step="1"
                          value={role.characterRig?.controls[control.key] ?? 0}
                          onValueChange={(value) =>
                            isCrowd && selection.crowdId
                              ? updateCrowdPoseControl(selection.crowdId, control.key, Number(value))
                              : updatePoseControl(role.id, control.key, Number(value))
                          }
                        />
                      ))}
                    </section>
                  ))}
                </div>
              </InspectorSection>
              <InspectorSection title="Hands" className="pose-hands-section">
                {(
                  [
                    { key: "leftHand.grip", label: "Left grip" },
                    { key: "rightHand.grip", label: "Right grip" },
                  ] as const
                ).map((control) => (
                  <InspectorRangeNumberField
                    key={control.key}
                    label={control.label}
                    rangeAriaLabel={`${control.label} slider`}
                    numberAriaLabel={control.label}
                    max="100"
                    min="0"
                    step="1"
                    value={role.characterRig?.controls[control.key] ?? 0}
                    onValueChange={(value) =>
                      isCrowd && selection.crowdId
                        ? updateCrowdPoseControl(selection.crowdId, control.key, Number(value))
                        : updatePoseControl(role.id, control.key, Number(value))
                    }
                  />
                ))}
              </InspectorSection>
            </>
          ) : (
            <p>This model has no recognized standard humanoid skeleton, so pose editing is unavailable.</p>
          )}
        </InspectorSection>
      )}
    </InspectorPanel>
  );
}
