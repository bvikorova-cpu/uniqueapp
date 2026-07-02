import { useState, useRef, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";
import * as THREE from "three";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

function Field() {
  return (
<group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[40, 25]} />
        <meshStandardMaterial color="#2d8a4e" />
      </mesh>
      {/* Yard lines */}
      {Array.from({ length: 11 }, (_, i) => i * 2 - 10).map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z]}>
          <planeGeometry args={[10, 0.05]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      {/* Hash marks */}
      {Array.from({ length: 11 }, (_, i) => i * 2 - 10).map((z, i) => (
        <group key={`h${i}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3, 0.01, z]}>
            <planeGeometry args={[0.05, 0.3]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3, 0.01, z]}>
            <planeGeometry args={[0.05, 0.3]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function GoalPosts() {
  const mat = <meshStandardMaterial color="#ffd700" metalness={0.7} roughness={0.3} />;
  return (
    <group position={[0, 0, -10]}>
      {/* Main post */}
      <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.08, 0.08, 3, 8]} />{mat}</mesh>
      {/* Crossbar */}
      <mesh position={[0, 3, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 5.6, 8]} />{mat}</mesh>
      {/* Left upright */}
      <mesh position={[-2.8, 5, 0]}><cylinderGeometry args={[0.05, 0.05, 4, 8]} />{mat}</mesh>
      {/* Right upright */}
      <mesh position={[2.8, 5, 0]}><cylinderGeometry args={[0.05, 0.05, 4, 8]} />{mat}</mesh>
    </group>
  );
}

function Football({ shooting, targetPos, onAnimDone }: { shooting: boolean; targetPos: THREE.Vector3; onAnimDone: (s: boolean) => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const progress = useRef(0);
  const startPos = new THREE.Vector3(0, 0.15, 2);
  const done = useRef(false);

  useFrame((_, delta) => {
    if (!ref.current) return;
    if (shooting && !done.current) {
      progress.current += delta * 1.5;
      const t = Math.min(progress.current, 1);
      const x = THREE.MathUtils.lerp(startPos.x, targetPos.x, t);
      const z = THREE.MathUtils.lerp(startPos.z, targetPos.z, t);
      const y = 0.15 + Math.sin(t * Math.PI) * (targetPos.y + 3);
      ref.current.position.set(x, y, z);
      ref.current.rotation.x -= delta * 12;
      if (t >= 1) {
        done.current = true;
        const between = Math.abs(targetPos.x) < 2.6 && targetPos.y > 2.8 && targetPos.y < 7;
        onAnimDone(between);
      }
    } else if (!shooting) {
      ref.current.position.copy(startPos);
      progress.current = 0;
      done.current = false;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0.15, 2]} rotation={[Math.PI / 4, 0, 0]} castShadow>
      <sphereGeometry args={[0.15, 8, 6]} />
      <meshStandardMaterial color="#8B4513" roughness={0.8} />
    </mesh>
  );
}

function Kicker({ hasBall }: { hasBall: boolean }) {
  if (!hasBall) return null;
  return (
    <group position={[0.5, 0, 2.5]}>
      <mesh position={[0, 1, 0]} castShadow><capsuleGeometry args={[0.25, 0.8, 4, 8]} /><meshStandardMaterial color="#1e3a5f" /></mesh>
      <mesh position={[0, 1.85, 0]} castShadow><sphereGeometry args={[0.2, 8, 8]} /><meshStandardMaterial color="#f5c6a0" /></mesh>
      <mesh position={[0, 1.85, 0]}><sphereGeometry args={[0.22, 6, 4]} /><meshStandardMaterial color="#1e3a5f" /></mesh>
      <mesh position={[-0.15, 0.2, 0]}><capsuleGeometry args={[0.1, 0.4, 4, 8]} /><meshStandardMaterial color="white" /></mesh>
      <mesh position={[0.15, 0.2, 0]}><capsuleGeometry args={[0.1, 0.4, 4, 8]} /><meshStandardMaterial color="white" /></mesh>
    </group>
  );
}

function AimTarget({ onShoot }: { onShoot: (x: number, y: number) => void }) {
  const { camera, raycaster, pointer } = useThree();
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    raycaster.setFromCamera(pointer, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 10);
    const pt = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, pt);
    if (pt) {
      ref.current.position.set(
        THREE.MathUtils.clamp(pt.x, -3.5, 3.5),
        THREE.MathUtils.clamp(pt.y, 3, 7),
        -9.99
      );
    }
  });
  return (
    <mesh ref={ref} position={[0, 5, -9.99]} onClick={(e) => { e.stopPropagation(); onShoot(e.object.position.x, e.object.position.y); }}>
      <ringGeometry args={[0.2, 0.35, 16]} />
      <meshBasicMaterial color="#ff0000" transparent opacity={0.7} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Crowd() {
  const rows = [];
  for (let row = 0; row < 3; row++)
    for (let i = -12; i <= 12; i += 1.2) {
      const c = ["#1e3a5f", "#cc0000", "#ffd700", "#ffffff", "#ff6600"][Math.floor(Math.random() * 5)];
      rows.push(<mesh key={`${row}-${i}`} position={[i, 2 + row * 0.8, -14 - row * 1.5]}><capsuleGeometry args={[0.15, 0.3, 4, 4]} /><meshStandardMaterial color={c} /></mesh>);
    }
  return <group>{rows}</group>;
}

interface GameState {
  phase: "aiming" | "shooting" | "result" | "gameover";
  round: number; good: number; missed: number;
  shootTarget: [number, number]; lastResult: string;
}

function Scene({ gs, onShoot, onAnimDone }: { gs: GameState; onShoot: (x: number, y: number) => void; onAnimDone: (s: boolean) => void }) {
  const tp = new THREE.Vector3(gs.shootTarget[0], gs.shootTarget[1], -10);
  return (
    <>
      <fog attach="fog" args={["#0a1a0a", 18, 40]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 12, 5]} intensity={2} castShadow />
      <pointLight position={[-8, 10, -5]} intensity={60} color="#fff5e0" />
      <pointLight position={[8, 10, -5]} intensity={60} color="#fff5e0" />
      <Field />
      <GoalPosts />
      <Football shooting={gs.phase === "shooting"} targetPos={tp} onAnimDone={onAnimDone} />
      <Kicker hasBall={gs.phase === "aiming"} />
      {gs.phase === "aiming" && <AimTarget onShoot={onShoot} />}
      <Crowd />
      <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2.5} minAzimuthAngle={-Math.PI / 6} maxAzimuthAngle={Math.PI / 6} />
    </>
  );
}

export function FieldGoal3D({ onBack }: { onBack: () => void }) {
  const [gs, setGs] = useState<GameState>({ phase: "aiming", round: 1, good: 0, missed: 0, shootTarget: [0, 5], lastResult: "" });

  const handleShoot = useCallback((x: number, y: number) => {
    setGs(p => ({ ...p, phase: "shooting", shootTarget: [x, y] }));
  }, []);

  const handleAnimDone = useCallback((good: boolean) => {
    setGs(p => {
      const isOver = p.round >= 5;
      return {
        ...p, phase: isOver ? "gameover" : "result",
        good: p.good + (good ? 1 : 0),
        missed: p.missed + (good ? 0 : 1),
        lastResult: good ? "IT'S GOOD! 🏈🔥" : "NO GOOD! 😤",
      };
    });
  }, []);

  const nextRound = useCallback(() => setGs(p => ({ ...p, phase: "aiming", round: p.round + 1, shootTarget: [0, 5], lastResult: "" })), []);
  const reset = useCallback(() => setGs({ phase: "aiming", round: 1, good: 0, missed: 0, shootTarget: [0, 5], lastResult: "" }), []);

  return (
    <div className="space-y-4">
      <FloatingHowItWorks title="FieldGoal3D — How it works" steps={[{title:"Open this section",desc:"Access FieldGoal3D from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <h2 className="text-xl font-bold">🏈 Field Goal Challenge</h2>
        <div className="ml-auto"><Button variant="outline" size="sm" onClick={reset} className="gap-1"><RotateCcw className="h-3 w-3" /> Reset</Button></div>
      </div>
      <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50">
        <div className="text-center"><p className="text-xs text-muted-foreground">Good</p><p className="text-2xl font-black text-primary">{gs.good}</p></div>
        <div className="text-center"><p className="text-xs text-muted-foreground">Kick</p><p className="text-lg font-bold">{gs.round}/5</p></div>
        <div className="text-center"><p className="text-xs text-muted-foreground">Missed</p><p className="text-2xl font-black text-destructive">{gs.missed}</p></div>
      </div>
      <div className="relative rounded-xl overflow-hidden border border-border/50 bg-black" style={{ height: "min(60vh, 500px)" }}>
        <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center bg-background/80"><p className="text-muted-foreground animate-pulse">Loading 3D scene...</p></div>}>
          <Canvas shadows camera={{ position: [0, 4, 10], fov: 50 }}><Scene gs={gs} onShoot={handleShoot} onAnimDone={handleAnimDone} /></Canvas>
        </Suspense>
        {gs.phase === "aiming" && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2"><p className="text-white text-sm font-medium text-center">🎯 Click between the uprights to kick!</p></div>}
        {gs.phase === "result" && <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"><div className="text-center space-y-3"><p className="text-4xl font-black text-white drop-shadow-lg">{gs.lastResult}</p><Button onClick={nextRound}>Next Kick →</Button></div></div>}
        {gs.phase === "gameover" && <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"><div className="text-center space-y-3 p-6"><p className="text-lg text-white/80">{gs.lastResult}</p><p className="text-5xl font-black text-white">{gs.good >= 4 ? "🏆 ALL-PRO!" : gs.good >= 3 ? "👏 NICE!" : "💪 KEEP TRYING!"}</p><p className="text-2xl font-bold text-white">{gs.good}/5 field goals</p><Button onClick={reset} size="lg" className="gap-2"><RotateCcw className="h-4 w-4" /> Play Again</Button></div></div>}
      </div>
    </div>
  );
}
