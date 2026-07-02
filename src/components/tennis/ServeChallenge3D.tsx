import { useState, useRef, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";
import * as THREE from "three";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

function TennisCourt() {
  return (
    <><FloatingHowItWorks title="ServeChallenge3D — How it works" steps={[{title:"Open this section",desc:"Access ServeChallenge3D from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<group>
      {/* Court surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color="#2e6b3e" />
      </mesh>
      {/* Play area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10.97, 11.88]} />
        <meshStandardMaterial color="#336b48" />
      </mesh>
      {/* Baselines */}
      {[-5.94, 5.94].map((z, i) => (
        <mesh key={`bl${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z]}>
          <planeGeometry args={[10.97, 0.06]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      {/* Sidelines */}
      {[-5.485, 5.485].map((x, i) => (
        <mesh key={`sl${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, 0]}>
          <planeGeometry args={[0.06, 11.88]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      {/* Service line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -2]}>
        <planeGeometry args={[8.23, 0.06]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Center service line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -4]}>
        <planeGeometry args={[0.06, 4]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Net */}
      <mesh position={[0, 0.5, 0]}>
        <planeGeometry args={[12, 1, 20, 8]} />
        <meshStandardMaterial color="white" transparent opacity={0.2} wireframe side={THREE.DoubleSide} />
      </mesh>
      {/* Net top */}
      <mesh position={[0, 1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 12, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Net posts */}
      {[-6, 6].map((x, i) => (
        <mesh key={`np${i}`} position={[x, 0.5, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1, 8]} />
          <meshStandardMaterial color="#555" metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function TennisBall({ shooting, targetPos, onAnimDone }: { shooting: boolean; targetPos: THREE.Vector3; onAnimDone: (s: boolean) => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const progress = useRef(0);
  const startPos = new THREE.Vector3(0, 2.5, 5);
  const done = useRef(false);

  useFrame((_, delta) => {
    if (!ref.current) return;
    if (shooting && !done.current) {
      progress.current += delta * 2;
      const t = Math.min(progress.current, 1);
      const x = THREE.MathUtils.lerp(startPos.x, targetPos.x, t);
      const z = THREE.MathUtils.lerp(startPos.z, targetPos.z, t);
      const y = THREE.MathUtils.lerp(startPos.y, 0.1, t) + Math.sin(t * Math.PI) * 3;
      ref.current.position.set(x, y, z);
      ref.current.rotation.x -= delta * 25;
      if (t >= 1) {
        done.current = true;
        const inCourt = Math.abs(targetPos.x) < 5 && targetPos.z < 0 && targetPos.z > -6;
        onAnimDone(inCourt);
      }
    } else if (!shooting) {
      ref.current.position.copy(startPos);
      progress.current = 0;
      done.current = false;
    }
  });

  return (
    <mesh ref={ref} position={[0, 2.5, 5]} castShadow>
      <sphereGeometry args={[0.065, 12, 12]} />
      <meshStandardMaterial color="#c8e620" roughness={0.9} />
    </mesh>
  );
}

function Server({ hasBall }: { hasBall: boolean }) {
  if (!hasBall) return null;
  return (
    <group position={[0.5, 0, 5.5]}>
      <mesh position={[0, 0.9, 0]} castShadow><capsuleGeometry args={[0.22, 0.7, 4, 8]} /><meshStandardMaterial color="white" /></mesh>
      <mesh position={[0, 1.7, 0]} castShadow><sphereGeometry args={[0.18, 8, 8]} /><meshStandardMaterial color="#f5c6a0" /></mesh>
      <mesh position={[0, 0.35, 0]}><capsuleGeometry args={[0.24, 0.2, 4, 8]} /><meshStandardMaterial color="#1a1a2e" /></mesh>
      {/* Racket arm */}
      <mesh position={[0.35, 1.4, -0.1]} rotation={[0, 0, -0.3]}><capsuleGeometry args={[0.06, 0.45, 4, 8]} /><meshStandardMaterial color="#f5c6a0" /></mesh>
      {/* Racket */}
      <mesh position={[0.5, 1.8, -0.1]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.01, 0.01, 0.3, 6]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.55, 2, -0.1]}>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshStandardMaterial color="#333" wireframe />
      </mesh>
    </group>
  );
}

function AimTarget({ onShoot }: { onShoot: (x: number, z: number) => void }) {
  const { camera, raycaster, pointer } = useThree();
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    raycaster.setFromCamera(pointer, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const pt = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, pt);
    if (pt) {
      ref.current.position.set(
        THREE.MathUtils.clamp(pt.x, -5, 5),
        0.02,
        THREE.MathUtils.clamp(pt.z, -5.5, -0.5)
      );
    }
  });
  return (
    <mesh ref={ref} position={[0, 0.02, -3]} rotation={[-Math.PI / 2, 0, 0]} onClick={(e) => { e.stopPropagation(); onShoot(e.object.position.x, e.object.position.z); }}>
      <ringGeometry args={[0.2, 0.35, 16]} />
      <meshBasicMaterial color="#ff0000" transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Crowd() {
  const rows = [];
  for (let row = 0; row < 2; row++)
    for (let i = -8; i <= 8; i += 1) {
      const c = ["#ffffff", "#1e40af", "#dc2626", "#f59e0b", "#10b981"][Math.floor(Math.random() * 5)];
      rows.push(<mesh key={`${row}-${i}`} position={[i, 1.5 + row * 0.7, -9 - row]}><capsuleGeometry args={[0.12, 0.25, 4, 4]} /><meshStandardMaterial color={c} /></mesh>);
    }
  return <group>{rows}</group>;
}

interface GameState {
  phase: "aiming" | "shooting" | "result" | "gameover";
  round: number; aces: number; faults: number;
  shootTarget: [number, number]; lastResult: string;
}

function Scene({ gs, onShoot, onAnimDone }: { gs: GameState; onShoot: (x: number, z: number) => void; onAnimDone: (s: boolean) => void }) {
  const tp = new THREE.Vector3(gs.shootTarget[0], 0.1, gs.shootTarget[1]);
  return (
    <>
      <fog attach="fog" args={["#0a1a0a", 15, 35]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 12, 5]} intensity={2} castShadow />
      <pointLight position={[-6, 8, -3]} intensity={40} color="#fff5e0" />
      <pointLight position={[6, 8, -3]} intensity={40} color="#fff5e0" />
      <TennisCourt />
      <TennisBall shooting={gs.phase === "shooting"} targetPos={tp} onAnimDone={onAnimDone} />
      <Server hasBall={gs.phase === "aiming"} />
      {gs.phase === "aiming" && <AimTarget onShoot={onShoot} />}
      <Crowd />
      <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2.5} minAzimuthAngle={-Math.PI / 6} maxAzimuthAngle={Math.PI / 6} />
    </>
  );
}

export function ServeChallenge3D({ onBack }: { onBack: () => void }) {
  const [gs, setGs] = useState<GameState>({ phase: "aiming", round: 1, aces: 0, faults: 0, shootTarget: [0, -3], lastResult: "" });

  const handleShoot = useCallback((x: number, z: number) => {
    setGs(p => ({ ...p, phase: "shooting", shootTarget: [x, z] }));
  }, []);

  const handleAnimDone = useCallback((inCourt: boolean) => {
    setGs(p => {
      const isAce = inCourt && (Math.abs(p.shootTarget[0]) > 3 || p.shootTarget[1] < -4);
      const isOver = p.round >= 10;
      return {
        ...p, phase: isOver ? "gameover" : "result",
        aces: p.aces + (inCourt ? 1 : 0),
        faults: p.faults + (inCourt ? 0 : 1),
        lastResult: !inCourt ? "FAULT! 🚫" : isAce ? "ACE! 🎾🔥" : "IN! ✅",
      };
    });
  }, []);

  const nextRound = useCallback(() => setGs(p => ({ ...p, phase: "aiming", round: p.round + 1, shootTarget: [0, -3], lastResult: "" })), []);
  const reset = useCallback(() => setGs({ phase: "aiming", round: 1, aces: 0, faults: 0, shootTarget: [0, -3], lastResult: "" }), []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <h2 className="text-xl font-bold">🎾 Serve Challenge</h2>
        <div className="ml-auto"><Button variant="outline" size="sm" onClick={reset} className="gap-1"><RotateCcw className="h-3 w-3" /> Reset</Button></div>
      </div>
      <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50">
        <div className="text-center"><p className="text-xs text-muted-foreground">In</p><p className="text-2xl font-black text-primary">{gs.aces}</p></div>
        <div className="text-center"><p className="text-xs text-muted-foreground">Serve</p><p className="text-lg font-bold">{gs.round}/10</p></div>
        <div className="text-center"><p className="text-xs text-muted-foreground">Faults</p><p className="text-2xl font-black text-destructive">{gs.faults}</p></div>
      </div>
      <div className="relative rounded-xl overflow-hidden border border-border/50 bg-black" style={{ height: "min(60vh, 500px)" }}>
        <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center bg-background/80"><p className="text-muted-foreground animate-pulse">Loading 3D scene...</p></div>}>
          <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}><Scene gs={gs} onShoot={handleShoot} onAnimDone={handleAnimDone} /></Canvas>
        </Suspense>
        {gs.phase === "aiming" && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2"><p className="text-white text-sm font-medium text-center">🎯 Click on the court to serve!</p></div>}
        {gs.phase === "result" && <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"><div className="text-center space-y-3"><p className="text-4xl font-black text-white drop-shadow-lg">{gs.lastResult}</p><Button onClick={nextRound}>Next Serve →</Button></div></div>}
        {gs.phase === "gameover" && <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"><div className="text-center space-y-3 p-6"><p className="text-lg text-white/80">{gs.lastResult}</p><p className="text-5xl font-black text-white">{gs.aces >= 8 ? "🏆 PERFECT!" : gs.aces >= 5 ? "👏 GREAT!" : "💪 PRACTICE!"}</p><p className="text-2xl font-bold text-white">{gs.aces}/10 in</p><Button onClick={reset} size="lg" className="gap-2"><RotateCcw className="h-4 w-4" /> Play Again</Button></div></div>}
      </div>
    </div>
  </>
  );
}
