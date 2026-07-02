import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float } from "@react-three/drei";
import * as THREE from "three";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

function FootballPitch() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
<group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Main pitch */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial color="#1a8c3a" roughness={0.8} />
      </mesh>
      {/* Pitch stripes */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={`stripe-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-7.2 + i * 1.78, 0.001, 0]}>
          <planeGeometry args={[0.89, 10]} />
          <meshStandardMaterial color="#22a548" roughness={0.8} />
        </mesh>
      ))}
      {/* Center circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[1.2, 1.3, 64]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Center line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[0.06, 10]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Boundary lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 5]}>
        <planeGeometry args={[16, 0.06]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -5]}>
        <planeGeometry args={[16, 0.06]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8, 0.002, 0]}>
        <planeGeometry args={[0.06, 10]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8, 0.002, 0]}>
        <planeGeometry args={[0.06, 10]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Penalty boxes */}
      {[-1, 1].map((side) => (
        <group key={`box-${side}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[side * 6.3, 0.002, 0]}>
            <planeGeometry args={[0.06, 5.5]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[side * 7.15, 0.002, 2.75]}>
            <planeGeometry args={[1.8, 0.06]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[side * 7.15, 0.002, -2.75]}>
            <planeGeometry args={[1.8, 0.06]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </group>
      ))}
      {/* Goals */}
      {[-1, 1].map((side) => (
        <group key={`goal-${side}`} position={[side * 8, 0, 0]}>
          <mesh position={[0, 0.6, -1.2]}>
            <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
            <meshStandardMaterial color="white" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.6, 1.2]}>
            <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
            <meshStandardMaterial color="white" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 2.4, 8]} />
            <meshStandardMaterial color="white" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}
      {/* Stadium stands */}
      {[
        { pos: [0, 1.5, -7] as [number, number, number], rot: [0.3, 0, 0] as [number, number, number], size: [18, 4, 0.3] as [number, number, number] },
        { pos: [0, 1.5, 7] as [number, number, number], rot: [-0.3, 0, 0] as [number, number, number], size: [18, 4, 0.3] as [number, number, number] },
        { pos: [-10, 1.5, 0] as [number, number, number], rot: [0, 0, -0.3] as [number, number, number], size: [0.3, 4, 12] as [number, number, number] },
        { pos: [10, 1.5, 0] as [number, number, number], rot: [0, 0, 0.3] as [number, number, number], size: [0.3, 4, 12] as [number, number, number] },
      ].map((stand, i) => (
        <mesh key={`stand-${i}`} position={stand.pos} rotation={stand.rot}>
          <boxGeometry args={stand.size} />
          <meshStandardMaterial color="#374151" roughness={0.6} />
        </mesh>
      ))}
      {/* Floodlights */}
      {[[-9, 5, -6], [9, 5, -6], [-9, 5, 6], [9, 5, 6]].map((pos, i) => (
        <group key={`light-${i}`}>
          <mesh position={pos as [number, number, number]}>
            <cylinderGeometry args={[0.08, 0.08, 5, 6]} />
            <meshStandardMaterial color="#555" metalness={0.9} />
          </mesh>
          <pointLight position={[pos[0], pos[1] + 2, pos[2]]} intensity={0.5} color="#fff5e0" distance={20} />
        </group>
      ))}
      {/* Football */}
      <Float speed={2} rotationIntensity={2} floatIntensity={0.5}>
        <mesh position={[0, 1, 0]} castShadow>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshStandardMaterial color="white" roughness={0.3} />
        </mesh>
      </Float>
    </group>
  );
}

function BasketballCourt() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Court floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#c4873b" roughness={0.4} />
      </mesh>
      {/* Court lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[1.5, 1.6, 64]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[0.06, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Three point arcs */}
      {[-1, 1].map((side) => (
        <mesh key={`arc-${side}`} rotation={[-Math.PI / 2, 0, 0]} position={[side * 5.5, 0.002, 0]}>
          <ringGeometry args={[2.8, 2.9, 32, 1, -Math.PI/2, Math.PI]} />
          <meshStandardMaterial color="white" side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Hoops */}
      {[-1, 1].map((side) => (
        <group key={`hoop-${side}`} position={[side * 6.5, 0, 0]}>
          <mesh position={[0, 1.8, 0]}>
            <boxGeometry args={[0.1, 1.2, 0.8]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh position={[-side * 0.4, 1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.25, 0.025, 8, 32]} />
            <meshStandardMaterial color="#ff4500" metalness={0.8} />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 3, 6]} />
            <meshStandardMaterial color="#666" metalness={0.9} />
          </mesh>
        </group>
      ))}
      {/* Stands */}
      {[
        { pos: [0, 1.5, -6] as [number, number, number], rot: [0.3, 0, 0] as [number, number, number], size: [16, 4, 0.3] as [number, number, number] },
        { pos: [0, 1.5, 6] as [number, number, number], rot: [-0.3, 0, 0] as [number, number, number], size: [16, 4, 0.3] as [number, number, number] },
      ].map((stand, i) => (
        <mesh key={`stand-${i}`} position={stand.pos} rotation={stand.rot}>
          <boxGeometry args={stand.size} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
      ))}
      {/* Basketball */}
      <Float speed={3} rotationIntensity={1} floatIntensity={1}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <sphereGeometry args={[0.24, 32, 32]} />
          <meshStandardMaterial color="#ff6b00" roughness={0.6} />
        </mesh>
      </Float>
    </group>
  );
}

function HockeyRink() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Ice surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial color="#e0f0ff" roughness={0.1} metalness={0.1} />
      </mesh>
      {/* Center line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[0.08, 8]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      {/* Blue lines */}
      {[-1, 1].map((side) => (
        <mesh key={`blue-${side}`} rotation={[-Math.PI / 2, 0, 0]} position={[side * 4, 0.002, 0]}>
          <planeGeometry args={[0.12, 8]} />
          <meshStandardMaterial color="#0066cc" />
        </mesh>
      ))}
      {/* Center circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[1.2, 1.3, 64]} />
        <meshStandardMaterial color="#0066cc" />
      </mesh>
      {/* Face-off circles */}
      {[[-5.5, 2.5], [-5.5, -2.5], [5.5, 2.5], [5.5, -2.5]].map((pos, i) => (
        <mesh key={`faceoff-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[pos[0], 0.002, pos[1]]}>
          <ringGeometry args={[1, 1.08, 64]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
      ))}
      {/* Boards */}
      <mesh position={[0, 0.3, -4.1]}>
        <boxGeometry args={[16.2, 0.8, 0.15]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.3, 4.1]}>
        <boxGeometry args={[16.2, 0.8, 0.15]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[-8.1, 0.3, 0]}>
        <boxGeometry args={[0.15, 0.8, 8.2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[8.1, 0.3, 0]}>
        <boxGeometry args={[0.15, 0.8, 8.2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* Goals */}
      {[-1, 1].map((side) => (
        <group key={`goal-${side}`} position={[side * 7.2, 0, 0]}>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[0.5, 0.7, 1.5]} />
            <meshStandardMaterial color="#cc0000" wireframe opacity={0.5} transparent />
          </mesh>
        </group>
      ))}
      {/* Stands */}
      {[
        { pos: [0, 2, -6.5] as [number, number, number], rot: [0.25, 0, 0] as [number, number, number], size: [18, 4, 0.3] as [number, number, number] },
        { pos: [0, 2, 6.5] as [number, number, number], rot: [-0.25, 0, 0] as [number, number, number], size: [18, 4, 0.3] as [number, number, number] },
      ].map((stand, i) => (
        <mesh key={`stand-${i}`} position={stand.pos} rotation={stand.rot}>
          <boxGeometry args={stand.size} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
      ))}
      {/* Puck */}
      <Float speed={2} rotationIntensity={3} floatIntensity={0.5}>
        <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.06, 32]} />
          <meshStandardMaterial color="#111" roughness={0.3} />
        </mesh>
      </Float>
    </group>
  );
}

function TennisCourt() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Court surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 7]} />
        <meshStandardMaterial color="#2d6a2d" roughness={0.7} />
      </mesh>
      {/* Service boxes */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[8.5, 5.2]} />
        <meshStandardMaterial color="#266126" roughness={0.7} />
      </mesh>
      {/* Court lines */}
      {/* Baseline */}
      {[-1, 1].map((side) => (
        <mesh key={`base-${side}`} rotation={[-Math.PI / 2, 0, 0]} position={[side * 4.25, 0.003, 0]}>
          <planeGeometry args={[0.05, 5.2]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      {/* Sidelines */}
      {[-1, 1].map((side) => (
        <mesh key={`side-${side}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, side * 2.6]}>
          <planeGeometry args={[8.5, 0.05]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      {/* Doubles sidelines */}
      {[-1, 1].map((side) => (
        <mesh key={`dside-${side}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, side * 3.3]}>
          <planeGeometry args={[8.5, 0.05]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      {/* Service line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <planeGeometry args={[0.05, 5.2]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Center service line */}
      {[-1, 1].map((side) => (
        <mesh key={`csl-${side}`} rotation={[-Math.PI / 2, 0, 0]} position={[side * 2.125, 0.003, 0]}>
          <planeGeometry args={[4.2, 0.05]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      {/* Net */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.03, 1, 7]} />
        <meshStandardMaterial color="#333" wireframe opacity={0.6} transparent />
      </mesh>
      {/* Net posts */}
      {[-1, 1].map((side) => (
        <mesh key={`post-${side}`} position={[0, 0.5, side * 3.5]}>
          <cylinderGeometry args={[0.04, 0.04, 1.1, 8]} />
          <meshStandardMaterial color="#888" metalness={0.9} />
        </mesh>
      ))}
      {/* Stands */}
      {[
        { pos: [0, 1.5, -5.5] as [number, number, number], rot: [0.3, 0, 0] as [number, number, number], size: [14, 3, 0.3] as [number, number, number] },
        { pos: [0, 1.5, 5.5] as [number, number, number], rot: [-0.3, 0, 0] as [number, number, number], size: [14, 3, 0.3] as [number, number, number] },
      ].map((stand, i) => (
        <mesh key={`stand-${i}`} position={stand.pos} rotation={stand.rot}>
          <boxGeometry args={stand.size} />
          <meshStandardMaterial color="#374151" roughness={0.6} />
        </mesh>
      ))}
      {/* Tennis ball */}
      <Float speed={3} rotationIntensity={2} floatIntensity={0.8}>
        <mesh position={[0, 1, 0]} castShadow>
          <sphereGeometry args={[0.13, 32, 32]} />
          <meshStandardMaterial color="#ccff00" roughness={0.8} />
        </mesh>
      </Float>
    </group>
  );
}

function AmericanFootballField() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 7]} />
        <meshStandardMaterial color="#1a7a2e" roughness={0.8} />
      </mesh>
      {/* Yard lines */}
      {Array.from({ length: 21 }).map((_, i) => (
        <mesh key={`yard-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-7.5 + i * 0.75, 0.002, 0]}>
          <planeGeometry args={[0.04, 7]} />
          <meshStandardMaterial color="white" opacity={0.6} transparent />
        </mesh>
      ))}
      {/* End zones */}
      {[-1, 1].map((side) => (
        <mesh key={`endzone-${side}`} rotation={[-Math.PI / 2, 0, 0]} position={[side * 7.5, 0.001, 0]}>
          <planeGeometry args={[1.5, 7]} />
          <meshStandardMaterial color={side === -1 ? "#1e3a8a" : "#991b1b"} roughness={0.8} />
        </mesh>
      ))}
      {/* Goal posts */}
      {[-1, 1].map((side) => (
        <group key={`goalpost-${side}`} position={[side * 8, 0, 0]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 3, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} />
          </mesh>
          <mesh position={[0, 3, -0.8]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 2, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} />
          </mesh>
          <mesh position={[0, 3, 0.8]}>
            <cylinderGeometry args={[0.03, 0.03, 2, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} />
          </mesh>
          <mesh position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1.6, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} />
          </mesh>
        </group>
      ))}
      {/* Stands */}
      {[
        { pos: [0, 1.8, -5.5] as [number, number, number], rot: [0.3, 0, 0] as [number, number, number], size: [18, 4, 0.3] as [number, number, number] },
        { pos: [0, 1.8, 5.5] as [number, number, number], rot: [-0.3, 0, 0] as [number, number, number], size: [18, 4, 0.3] as [number, number, number] },
        { pos: [-10, 1.5, 0] as [number, number, number], rot: [0, 0, -0.3] as [number, number, number], size: [0.3, 3.5, 9] as [number, number, number] },
        { pos: [10, 1.5, 0] as [number, number, number], rot: [0, 0, 0.3] as [number, number, number], size: [0.3, 3.5, 9] as [number, number, number] },
      ].map((stand, i) => (
        <mesh key={`stand-${i}`} position={stand.pos} rotation={stand.rot}>
          <boxGeometry args={stand.size} />
          <meshStandardMaterial color="#374151" roughness={0.6} />
        </mesh>
      ))}
      {/* Football */}
      <Float speed={2} rotationIntensity={2} floatIntensity={0.6}>
        <mesh position={[0, 1, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <sphereGeometry args={[0.18, 16, 32]} />
          <meshStandardMaterial color="#8B4513" roughness={0.6} />
        </mesh>
      </Float>
    </group>
  );
}

export type SportType = "football" | "basketball" | "hockey" | "tennis" | "american-football";

const sportConfigs: Record<SportType, { 
  ambientColor: string; 
  bgColor: string;
  cameraPos: [number, number, number];
}> = {
  football: { ambientColor: "#10b981", bgColor: "#0a1a0f", cameraPos: [8, 6, 8] },
  basketball: { ambientColor: "#f97316", bgColor: "#1a0f05", cameraPos: [7, 5, 7] },
  hockey: { ambientColor: "#06b6d4", bgColor: "#051520", cameraPos: [8, 5, 8] },
  tennis: { ambientColor: "#84cc16", bgColor: "#0a1a05", cameraPos: [6, 5, 6] },
  "american-football": { ambientColor: "#22c55e", bgColor: "#0a1510", cameraPos: [8, 6, 8] },
};

interface Stadium3DProps {
  sport: SportType;
  className?: string;
}

export function Stadium3D({ sport, className = "" }: Stadium3DProps) {
  const config = sportConfigs[sport];
  
  return (
    <div className={`w-full h-full ${className}`} style={{ background: config.bgColor }}>
      <FloatingHowItWorks title="Stadium3D — How it works" steps={[{title:"Open this section",desc:"Access Stadium3D from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
      <Canvas
        shadows
        camera={{ position: config.cameraPos, fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={[config.bgColor]} />
        <fog attach="fog" args={[config.bgColor, 15, 30]} />
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1} castShadow color="#fff5e0" />
        <directionalLight position={[-3, 5, -3]} intensity={0.3} color={config.ambientColor} />
        <pointLight position={[0, 10, 0]} intensity={0.5} color={config.ambientColor} />
        
        {sport === "football" && <FootballPitch />}
        {sport === "basketball" && <BasketballCourt />}
        {sport === "hockey" && <HockeyRink />}
        {sport === "tennis" && <TennisCourt />}
        {sport === "american-football" && <AmericanFootballField />}
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  );
}
