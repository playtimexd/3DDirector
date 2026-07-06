import type { WeaponType } from "../../schema/directorProject";

const GRIP_COLOR = "#2b2b30";
const WOOD_COLOR = "#6b4a2b";
const STRING_COLOR = "#e6e2d3";

function Metal({ color }: { color: string }) {
  return <meshStandardMaterial color={color} metalness={0.7} roughness={0.34} />;
}

function Grip() {
  return <meshStandardMaterial color={GRIP_COLOR} metalness={0.1} roughness={0.6} />;
}

function Wood() {
  return <meshStandardMaterial color={WOOD_COLOR} metalness={0.02} roughness={0.82} />;
}

/**
 * Each weapon is modeled with the grip centered at the origin and its length
 * running along +Y, so it can be dropped onto a hand bone and oriented with the
 * attachment's rotation. Dimensions are in meters.
 */
export function WeaponModel({ type, color }: { type: WeaponType; color: string }) {
  switch (type) {
    case "dagger":
      return (
        <group name="weapon-dagger">
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.014, 0.017, 0.11, 12]} />
            <Grip />
          </mesh>
          <mesh position={[0, 0.045, 0]}>
            <boxGeometry args={[0.1, 0.02, 0.03]} />
            <Metal color={color} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.035, 0.28, 0.01]} />
            <Metal color={color} />
          </mesh>
        </group>
      );

    case "axe":
      return (
        <group name="weapon-axe">
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.02, 0.022, 0.86, 12]} />
            <Wood />
          </mesh>
          <mesh position={[0.02, 0.66, 0]}>
            <boxGeometry args={[0.04, 0.2, 0.05]} />
            <Metal color={color} />
          </mesh>
          <mesh position={[0.12, 0.66, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.18, 0.24, 0.02]} />
            <Metal color={color} />
          </mesh>
        </group>
      );

    case "spear":
      return (
        <group name="weapon-spear">
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.017, 0.02, 1.6, 12]} />
            <Wood />
          </mesh>
          <mesh position={[0, 1.45, 0]}>
            <coneGeometry args={[0.045, 0.24, 12]} />
            <Metal color={color} />
          </mesh>
        </group>
      );

    case "staff":
      return (
        <group name="weapon-staff">
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.02, 0.024, 1.7, 12]} />
            <Wood />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.07, 20, 16]} />
            <Metal color={color} />
          </mesh>
        </group>
      );

    case "bow":
      return (
        <group name="weapon-bow" position={[-0.42, 0, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <torusGeometry args={[0.5, 0.014, 10, 28, Math.PI]} />
            <Wood />
          </mesh>
          <mesh position={[-0.5, 0, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 1.0, 6]} />
            <meshStandardMaterial color={STRING_COLOR} metalness={0} roughness={0.9} />
          </mesh>
        </group>
      );

    case "rifle":
      return (
        <group name="weapon-rifle">
          <mesh position={[0, 0.16, 0]}>
            <boxGeometry args={[0.05, 0.58, 0.1]} />
            <Metal color={color} />
          </mesh>
          <mesh position={[0, 0.62, 0.01]}>
            <cylinderGeometry args={[0.015, 0.015, 0.46, 12]} />
            <Metal color={color} />
          </mesh>
          <mesh position={[0, -0.05, 0.03]} rotation={[0.35, 0, 0]}>
            <boxGeometry args={[0.045, 0.14, 0.05]} />
            <Grip />
          </mesh>
          <mesh position={[0, 0.02, -0.08]}>
            <boxGeometry args={[0.03, 0.16, 0.07]} />
            <Grip />
          </mesh>
          <mesh position={[0, -0.16, -0.02]}>
            <boxGeometry args={[0.05, 0.16, 0.1]} />
            <Metal color={color} />
          </mesh>
        </group>
      );

    case "pistol":
      return (
        <group name="weapon-pistol">
          <mesh position={[0, 0.07, 0.01]}>
            <boxGeometry args={[0.032, 0.16, 0.05]} />
            <Metal color={color} />
          </mesh>
          <mesh position={[0, 0.15, 0.02]}>
            <cylinderGeometry args={[0.01, 0.01, 0.06, 10]} />
            <Metal color={color} />
          </mesh>
          <mesh position={[0, -0.04, -0.03]} rotation={[0.28, 0, 0]}>
            <boxGeometry args={[0.036, 0.13, 0.045]} />
            <Grip />
          </mesh>
        </group>
      );

    case "shield":
      return (
        <group name="weapon-shield">
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.33, 0.33, 0.04, 32]} />
            <Metal color={color} />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <sphereGeometry args={[0.06, 20, 16]} />
            <Metal color={color} />
          </mesh>
        </group>
      );

    case "sword":
    default:
      return (
        <group name="weapon-sword">
          <mesh position={[0, -0.09, 0]}>
            <sphereGeometry args={[0.028, 16, 12]} />
            <Grip />
          </mesh>
          <mesh position={[0, -0.015, 0]}>
            <cylinderGeometry args={[0.016, 0.02, 0.16, 12]} />
            <Grip />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <boxGeometry args={[0.18, 0.03, 0.04]} />
            <Metal color={color} />
          </mesh>
          <mesh position={[0, 0.52, 0]}>
            <boxGeometry args={[0.05, 0.86, 0.014]} />
            <Metal color={color} />
          </mesh>
          <mesh position={[0, 0.97, 0]}>
            <coneGeometry args={[0.025, 0.08, 4]} />
            <Metal color={color} />
          </mesh>
        </group>
      );
  }
}
