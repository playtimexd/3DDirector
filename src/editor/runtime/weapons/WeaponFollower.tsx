import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Euler, Group, Quaternion, Vector3, type Object3D } from "three";
import type { WeaponAttachment } from "../../schema/directorProject";
import { WeaponModel } from "./WeaponModel";

const DEG = Math.PI / 180;
// How far from the wrist toward the finger bases the grip sits (0 = wrist
// pivot, 1 = finger bases). ~0.5 lands the handle in the middle of the palm.
const GRIP_LERP = 0.5;

const worldPosition = new Vector3();
const worldQuaternion = new Quaternion();
const worldScale = new Vector3();
const gripAnchor = new Vector3();
const fingersCentroid = new Vector3();
const fingerPosition = new Vector3();
const localOffset = new Vector3();
const userEuler = new Euler();
const userQuaternion = new Quaternion();

function isBone(object: Object3D): boolean {
  return (object as Object3D & { isBone?: boolean }).isBone === true;
}

/**
 * Renders a weapon into the scene root and, every frame, snaps it onto the
 * target hand so it stays gripped through any pose. The anchor is the palm
 * (interpolated between the wrist bone and the centroid of the finger bones)
 * rather than the wrist pivot, so the handle sits inside the hand. Only the
 * hand's world position + rotation are used, so the deep skeleton scale never
 * distorts the weapon. The attachment offset is applied in the hand's local
 * frame; rotation and scale are the user's adjustments.
 */
export function WeaponFollower({ bone, weapon }: { bone: Object3D; weapon: WeaponAttachment }) {
  const { scene } = useThree();
  const groupRef = useRef<Group>(null);
  const fingerBones = useMemo(() => bone.children.filter(isBone), [bone]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    bone.updateWorldMatrix(true, true);
    bone.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);

    gripAnchor.copy(worldPosition);
    if (fingerBones.length > 0) {
      fingersCentroid.set(0, 0, 0);
      for (const fingerBone of fingerBones) {
        fingerPosition.setFromMatrixPosition(fingerBone.matrixWorld);
        fingersCentroid.add(fingerPosition);
      }
      fingersCentroid.multiplyScalar(1 / fingerBones.length);
      gripAnchor.lerp(fingersCentroid, GRIP_LERP);
    }

    localOffset.set(weapon.offset[0], weapon.offset[1], weapon.offset[2]).applyQuaternion(worldQuaternion);
    group.position.copy(gripAnchor).add(localOffset);

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
