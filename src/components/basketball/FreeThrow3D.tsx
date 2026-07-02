import { useState, useRef, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";
import * as THREE from "three";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

// --- 3D Components ---

function Court() {
  return (
<group>
      {/* Wooden court */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[28, 15]} />
        <meshStandardMaterial color="#c68642" />
      </mesh>
      {/* Court lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[1.8, 1.88, 32]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Free throw line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -3]}>
        <planeGeometry args={[3.6, 0.06]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Free throw circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -3]}>
        <ringGeometry args={[1.8, 1.86, 32]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Three point line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -2]}>
        <ringGeometry args={[6.5, 6.56, 32, 1, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Key/paint area */}
      {[[-1.8, 0.01, -4.5], [1.8, 0.01, -4.5]].map((pos, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={pos as [number, number, number]}>
          <planeGeometry args={[0.06, 3]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
    </group>
  );
}

function Backboard() {
  return (
    <group position={[0, 3.05, -6.5]}>
      {/* Backboard */}
      <mesh castShadow>
        <boxGeometry args={[1.8, 1.05, 0.05]} />
        <meshStandardMaterial color="white" transparent opacity={0.7} />
      </mesh>
      {/* Backboard outline */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[1.82, 1.07]} />
        <meshStandardMaterial color="#333" wireframe />
      </mesh>
      {/* Rim */}
      <mesh position={[0, -0.35, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.23, 0.02, 8, 16]} />
        <meshStandardMaterial color="#ff4500" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Net (simplified) */}
      <mesh position={[0, -0.6, 0.3]}>
        <cylinderGeometry args={[0.23, 0.15, 0.4, 8, 1, true]} />
        <meshStandardMaterial color="white" wireframe transparent opacity={0.5} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, -1.5, -0.3]}>
        <cylinderGeometry args={[0.08, 0.08, 4, 8]} />
        <meshStandardMaterial color="#555" metalness={0.8} />
      </mesh>
    </group>
  );
}

function Ball({ shooting, targetPos, onAnimDone }: { shooting: boolean; targetPos: THREE.Vector3; onAnimDone: (scored: boolean) => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const progress = useRef(0);
  const startPos = new THREE.Vector3(0, 1.5, 3);
  const done = useRef(false);

  useFrame((_, delta) => {
    if (!ref.current) return;
    if (shooting && !done.current) {
      progress.current += delta * 1.8;
      const t = Math.min(progress.current, 1);
      const x = THREE.MathUtils.lerp(startPos.x, targetPos.x, t);
      const z = THREE.MathUtils.lerp(startPos.z, targetPos.z, t);
      const arcHeight = 4 + targetPos.y;
      const y = THREE.MathUtils.lerp(startPos.y, targetPos.y, t) + Math.sin(t * Math.PI) * arcHeight;
      ref.current.position.set(x, y, z);
      ref.current.rotation.x -= delta * 10;
      if (t >= 1) {
        done.current = true;
        // Scored if close to rim position
        const rimPos = new THREE.Vector3(0, 2.7, -6.2);
        const dist = new THREE.Vector3(targetPos.x, 2.7, targetPos.z).distanceTo(rimPos);
        onAnimDone(dist < 0.5);
      }
    } else if (!shooting) {
      ref.current.position.copy(startPos);
      progress.current = 0;
      done.current = false;
    }
  });

  return (
    <mesh ref={ref} position={[0, 1.5, 3]} castShadow>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color="#ff6b00" roughness={0.8} />
      <mesh>
        <sphereGeometry args={[0.125, 4, 4]} />
        <meshStandardMaterial color="#1a1a1a" wireframe transparent opacity={0.4} />
      </mesh>
    </mesh>
  );
}

function Shooter({ hasBall }: { hasBall: boolean }) {
  if (!hasBall) return null;
  return (
    <group position={[0.3, 0, 3.5]}>
      <mesh position={[0, 1, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.9, 4, 8]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>
      <mesh position={[0, 1.9, 0]} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#f5c6a0" />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <capsuleGeometry args={[0.27, 0.2, 4, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-0.15, 0.15, 0]}>
        <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
        <meshStandardMaterial color="#f5c6a0" />
      </mesh>
      <mesh position={[0.15, 0.15, 0]}>
        <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
        <meshStandardMaterial color="#f5c6a0" />
      </mesh>
    </group>
  );
}

function AimTarget({ onShoot }: { onShoot: (x: number, y: number) => void }) {
  const { camera, raycaster, pointer } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    raycaster.setFromCamera(pointer, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 6.2);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);
    if (intersection) {
      const x = THREE.MathUtils.clamp(intersection.x, -0.8, 0.8);
      const y = THREE.MathUtils.clamp(intersection.y, 2.2, 3.5);
      meshRef.current.position.set(x, y, -6.19);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 2.7, -6.19]} onClick={(e) => {
      e.stopPropagation();
      onShoot(e.object.position.x, e.object.position.y);
    }}>
      <ringGeometry args={[0.1, 0.18, 16]} />
      <meshBasicMaterial color="#ff0000" transparent opacity={0.7} side={THREE.DoubleSide} />
    </mesh>
  );
}

function StadiumLights() {
  return (
    <>
      <pointLight position={[-8, 10, -3]} intensity={80} color="#fff5e0" castShadow />
      <pointLight position={[8, 10, -3]} intensity={80} color="#fff5e0" castShadow />
      <pointLight position={[0, 8, 5]} intensity={40} color="#e0e0ff" />
    </>
  );
}

function Crowd() {
  const rows = [];
  for (let row = 0; row < 3; row++) {
    for (let i = -10; i <= 10; i += 1.2) {
      const colors = ["#1e40af", "#dc2626", "#f59e0b", "#10b981", "#8b5cf6", "#f97316"];
      rows.push(
        <mesh key={`${row}-${i}`} position={[i, 2 + row * 0.8, -10 - row * 1.5]}>
          <capsuleGeometry args={[0.15, 0.3, 4, 4]} />
          <meshStandardMaterial color={colors[Math.floor(Math.random() * colors.length)]} />
        </mesh>
      );
    }
  }
  return <group>{rows}</group>;
}

// --- Scene ---

interface GameState {
  phase: "aiming" | "shooting" | "result" | "gameover";
  round: number;
  scored: number;
  missed: number;
  shootTarget: [number, number];
  lastResult: string;
}

function Scene({ gameState, onShoot, onAnimDone }: { gameState: GameState; onShoot: (x: number, y: number) => void; onAnimDone: (scored: boolean) => void }) {
  const targetPos = new THREE.Vector3(gameState.shootTarget[0], gameState.shootTarget[1], -6.2);
  return (
    <>
      <fog attach="fog" args={["#1a0a2e", 15, 35]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
      <Court />
      <Backboard />
      <Ball shooting={gameState.phase === "shooting"} targetPos={targetPos} onAnimDone={onAnimDone} />
      <Shooter hasBall={gameState.phase === "aiming"} />
      {gameState.phase === "aiming" && <AimTarget onShoot={onShoot} />}
      <StadiumLights />
      <Crowd />
      <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2.5} minAzimuthAngle={-Math.PI / 6} maxAzimuthAngle={Math.PI / 6} />
    </>
  );
}

// --- Main ---

export function FreeThrow3D({ onBack }: { onBack: () => void }) {
  const [gameState, setGameState] = useState<GameState>({
    phase: "aiming", round: 1, scored: 0, missed: 0, shootTarget: [0, 2.7], lastResult: "",
  });

  const handleShoot = useCallback((x: number, y: number) => {
    setGameState(prev => ({ ...prev, phase: "shooting", shootTarget: [x, y] }));
  }, []);

  const handleAnimDone = useCallback((scored: boolean) => {
    setGameState(prev => {
      const isGameOver = prev.round >= 10;
      return {
        ...prev,
        phase: isGameOver ? "gameover" : "result",
        scored: prev.scored + (scored ? 1 : 0),
        missed: prev.missed + (scored ? 0 : 1),
        lastResult: scored ? "SWISH! 🏀🔥" : "MISSED! 😤",
      };
    });
  }, []);

  const nextRound = useCallback(() => {
    setGameState(prev => ({ ...prev, phase: "aiming", round: prev.round + 1, shootTarget: [0, 2.7], lastResult: "" }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState({ phase: "aiming", round: 1, scored: 0, missed: 0, shootTarget: [0, 2.7], lastResult: "" });
  }, []);

  return (
    <div className="space-y-4">
      <FloatingHowItWorks title="FreeThrow3D — How it works" steps={[{title:"Open this section",desc:"Access FreeThrow3D from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <h2 className="text-xl font-bold">🏀 Free Throw Challenge</h2>
        <div className="ml-auto"><Button variant="outline" size="sm" onClick={resetGame} className="gap-1"><RotateCcw className="h-3 w-3" /> Reset</Button></div>
      </div>
      <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50">
        <div className="text-center"><p className="text-xs text-muted-foreground">Scored</p><p className="text-2xl font-black text-primary">{gameState.scored}</p></div>
        <div className="text-center"><p className="text-xs text-muted-foreground">Round</p><p className="text-lg font-bold">{gameState.round}/10</p></div>
        <div className="text-center"><p className="text-xs text-muted-foreground">Missed</p><p className="text-2xl font-black text-destructive">{gameState.missed}</p></div>
      </div>
      <div className="relative rounded-xl overflow-hidden border border-border/50 bg-black" style={{ height: "min(60vh, 500px)" }}>
        <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center bg-background/80"><p className="text-muted-foreground animate-pulse">Loading 3D scene...</p></div>}>
          <Canvas shadows camera={{ position: [0, 3.5, 8], fov: 50 }}><Scene gameState={gameState} onShoot={handleShoot} onAnimDone={handleAnimDone} /></Canvas>
        </Suspense>
        {gameState.phase === "aiming" && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-white text-sm font-medium text-center">🎯 Click on the hoop to shoot!</p>
          </div>
        )}
        {gameState.phase === "result" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="text-center space-y-3">
              <p className="text-4xl font-black text-white drop-shadow-lg">{gameState.lastResult}</p>
              <Button onClick={nextRound} className="bg-primary hover:bg-primary/90">Next Shot →</Button>
            </div>
          </div>
        )}
        {gameState.phase === "gameover" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-center space-y-3 p-6">
              <p className="text-lg text-white/80">{gameState.lastResult}</p>
              <p className="text-5xl font-black text-white drop-shadow-lg">
                {gameState.scored >= 7 ? "🏆 AMAZING!" : gameState.scored >= 5 ? "👏 GOOD JOB!" : "💪 KEEP TRYING!"}
              </p>
              <p className="text-2xl font-bold text-white">{gameState.scored}/10 shots made</p>
              <Button onClick={resetGame} size="lg" className="bg-primary hover:bg-primary/90 gap-2"><RotateCcw className="h-4 w-4" /> Play Again</Button>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground text-center">Aim at the hoop and click to shoot!</p>
    </div>
  );
}
