import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Euler, Group, Quaternion, Vector3, type Object3D } from "three";
import type { WeaponAttachment } from "../../schema/directorProject";
import { WeaponModel } from "./WeaponModel";

const DEG = Math.PI / 180;
const worldPosition = new Vector3();
const worldQuaternion = new Quaternion();
const worldScale = new Vector3();
const localOffset = new Vector3();
const userEuler = new Euler();
const userQuaternion = new Quaternion();

/**
 * Renders a weapon into the scene root and, every frame, snaps it onto the
 * target hand bone's world transform (position + rotation only, so the deep
 * skeleton scale never distorts the weapon). The attachment offset is applied
 * in the hand's local frame; rotation and scale are the user's adjustments.
 */
export function WeaponFollower({ bone, weapon }: { bone: Object3D; weapon: WeaponAttachment }) {
  const { scene } = useThree();
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    bone.updateWorldMatrix(true, false);
    bone.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);

    localOffset.set(weapon.offset[0], weapon.offset[1], weapon.offset[2]).applyQuaternion(worldQuaternion);
    group.position.copy(worldPosition).add(localOffset);

    userQuaternion.setFromEuler(
      userEuler.set(weapon.rotation[0] * DEG, weapon.rotation[1] * DEG, weapon.rotation[2] * DEG)
    );
    group.quaternion.copy(worldQuaternion).multiply(userQuaternion);
    group.scale.setScalar(weapon.scale);
  });

  return createPortal(
    <group ref={groupRef}>
      <WeaponModel type={weapon.type} color={weapon.color} />
    </group>,
    scene
  );
}
