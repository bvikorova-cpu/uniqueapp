import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Horse3DProps {
  position: [number, number, number];
  color: string;
  speed: number;
  isRunning: boolean;
}

export const Horse3D = ({ position, color, speed, isRunning }: Horse3DProps) => {
  const horseRef = useRef<THREE.Group>(null);
  const legAnimation = useRef(0);

  useFrame((state, delta) => {
    if (horseRef.current && isRunning) {
      // Galloping animation
      legAnimation.current += delta * speed * 5;
      
      // Bob up and down
      horseRef.current.position.y = position[1] + Math.sin(legAnimation.current * 2) * 0.1;
      
      // Slight rotation for realism
      horseRef.current.rotation.z = Math.sin(legAnimation.current) * 0.05;
    }
  });

  // Convert color string to THREE.Color
  const threeColor = new THREE.Color(color);

  return (
    <>
      <FloatingHowItWorks title={"Horse3 D - How it works"} steps={[{ title: 'Open', desc: 'Access the Horse3 D section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Horse3 D.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <group ref={horseRef} position={position}>
      {/* Horse Body */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[0.8, 0.6, 1.2]} />
        <meshStandardMaterial color={threeColor} roughness={0.7} />
      </mesh>
      
      {/* Horse Head */}
      <mesh castShadow position={[0, 0.8, 0.8]}>
        <boxGeometry args={[0.4, 0.5, 0.6]} />
        <meshStandardMaterial color={threeColor} roughness={0.7} />
      </mesh>
      
      {/* Horse Neck */}
      <mesh castShadow position={[0, 0.7, 0.5]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.5, 8]} />
        <meshStandardMaterial color={threeColor} roughness={0.7} />
      </mesh>
      
      {/* Mane */}
      <mesh castShadow position={[0, 1.1, 0.5]}>
        <boxGeometry args={[0.1, 0.3, 0.4]} />
        <meshStandardMaterial color="#2d1810" roughness={0.9} />
      </mesh>
      
      {/* Legs (4) */}
      {[
        [-0.3, 0, 0.4],
        [0.3, 0, 0.4],
        [-0.3, 0, -0.4],
        [0.3, 0, -0.4],
      ].map((legPos, i) => (
        <mesh key={i} castShadow position={legPos as [number, number, number]}>
          <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
          <meshStandardMaterial color={threeColor} roughness={0.7} />
        </mesh>
      ))}
      
      {/* Tail */}
      <mesh castShadow position={[0, 0.5, -0.8]} rotation={[0.5, 0, 0]}>
        <coneGeometry args={[0.1, 0.5, 8]} />
        <meshStandardMaterial color="#2d1810" roughness={0.9} />
      </mesh>
    </group>
    </>
  );
};
