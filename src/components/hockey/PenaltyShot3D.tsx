import { useState, useRef, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";
import * as THREE from "three";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

function IceRink() {
  return (
    <>
      <FloatingHowItWorks title={"Penalty Shot3 D - How it works"} steps={[{ title: 'Open', desc: 'Access the Penalty Shot3 D section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Penalty Shot3 D.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[30, 15]} />
        <meshStandardMaterial color="#d4e8f0" metalness={0.3} roughness={0.1} />
      </mesh>
      {/* Center line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[0.08, 15]} />
        <meshStandardMaterial color="#cc0000" />
      </mesh>
      {/* Blue lines */}
      {[-4, 4].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z]}>
          <planeGeometry args={[30, 0.12]} />
          <meshStandardMaterial color="#0033cc" />
        </mesh>
      ))}
      {/* Center circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[2.8, 2.88, 32]} />
        <meshStandardMaterial color="#0033cc" />
      </mesh>
      {/* Goal crease */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -6]}>
        <circleGeometry args={[1.5, 32, 0, Math.PI]} />
        <meshStandardMaterial color="#4488cc" transparent opacity={0.3} />
      </mesh>
      {/* Boards */}
      {[[-15, 0.5, 0], [15, 0.5, 0]].map((pos, i) => (
        <mesh key={`b${i}`} position={pos as [number, number, number]}>
          <boxGeometry args={[0.2, 1, 15]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
    </>
  );
}

function HockeyGoal() {
  const postMat = <meshStandardMaterial color="#cc0000" metalness={0.6} roughness={0.3} />;
  const netMat = <meshStandardMaterial color="white" transparent opacity={0.15} wireframe />;
  return (
    <group position={[0, 0, -6.5]}>
      <mesh position={[-0.9, 0.6, 0]} castShadow><cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />{postMat}</mesh>
      <mesh position={[0.9, 0.6, 0]} castShadow><cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />{postMat}</mesh>
      <mesh position={[0, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.04, 0.04, 1.8, 8]} />{postMat}</mesh>
      <mesh position={[0, 0.6, -0.8]}><planeGeometry args={[1.8, 1.2, 6, 4]} />{netMat}</mesh>
      <mesh position={[0, 1.2, -0.4]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[1.8, 0.8, 6, 3]} />{netMat}</mesh>
      <mesh position={[-0.9, 0.6, -0.4]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[0.8, 1.2, 3, 4]} />{netMat}</mesh>
      <mesh position={[0.9, 0.6, -0.4]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[0.8, 1.2, 3, 4]} />{netMat}</mesh>
    </group>
  );
}

function Goalie({ targetX, diving }: { targetX: number; diving: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    if (diving) {
      ref.current.position.lerp(new THREE.Vector3(targetX * 1.5, 0, -6), delta * 5);
      ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, targetX < 0 ? -Math.PI / 4 : Math.PI / 4, delta * 5);
    } else {
      ref.current.position.lerp(new THREE.Vector3(0, 0, -6), delta * 3);
      ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, 0, delta * 3);
    }
  });
  return (
    <group ref={ref} position={[0, 0, -6]}>
      <mesh position={[0, 0.7, 0]} castShadow><capsuleGeometry args={[0.25, 0.6, 4, 8]} /><meshStandardMaterial color="#ffd700" /></mesh>
      <mesh position={[0, 1.3, 0]} castShadow><sphereGeometry args={[0.18, 8, 8]} /><meshStandardMaterial color="#333" /></mesh>
      <mesh position={[-0.35, 0.7, 0]}><boxGeometry args={[0.15, 0.6, 0.3]} /><meshStandardMaterial color="#ffd700" /></mesh>
      <mesh position={[0.35, 0.7, 0]}><boxGeometry args={[0.15, 0.6, 0.3]} /><meshStandardMaterial color="#ffd700" /></mesh>
      <mesh position={[-0.12, 0.15, 0]}><capsuleGeometry args={[0.1, 0.3, 4, 8]} /><meshStandardMaterial color="#1a1a2e" /></mesh>
      <mesh position={[0.12, 0.15, 0]}><capsuleGeometry args={[0.1, 0.3, 4, 8]} /><meshStandardMaterial color="#1a1a2e" /></mesh>
    </group>
  );
}

function Puck({ shooting, targetPos, onAnimDone }: { shooting: boolean; targetPos: THREE.Vector3; onAnimDone: (scored: boolean) => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const progress = useRef(0);
  const startPos = new THREE.Vector3(0, 0.05, 3);
  const done = useRef(false);

  useFrame((_, delta) => {
    if (!ref.current) return;
    if (shooting && !done.current) {
      progress.current += delta * 3;
      const t = Math.min(progress.current, 1);
      const x = THREE.MathUtils.lerp(startPos.x, targetPos.x, t);
      const z = THREE.MathUtils.lerp(startPos.z, targetPos.z, t);
      const y = 0.05 + Math.sin(t * Math.PI) * targetPos.y * 0.5;
      ref.current.position.set(x, y, z);
      ref.current.rotation.y += delta * 20;
      if (t >= 1) {
        done.current = true;
        const inGoal = Math.abs(targetPos.x) < 0.8 && targetPos.y < 1.0;
        onAnimDone(inGoal);
      }
    } else if (!shooting) {
      ref.current.position.copy(startPos);
      progress.current = 0;
      done.current = false;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0.05, 3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.12, 0.12, 0.03, 16]} />
      <meshStandardMaterial color="#1a1a1a" />
    </mesh>
  );
}

function AimTarget({ onShoot }: { onShoot: (x: number, y: number) => void }) {
  const { camera, raycaster, pointer } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!meshRef.current) return;
    raycaster.setFromCamera(pointer, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 6.49);
    const pt = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, pt);
    if (pt) {
      meshRef.current.position.set(
        THREE.MathUtils.clamp(pt.x, -0.8, 0.8),
        THREE.MathUtils.clamp(pt.y, 0.1, 1.1),
        -6.49
      );
    }
  });
  return (
    <mesh ref={meshRef} position={[0, 0.6, -6.49]} onClick={(e) => { e.stopPropagation(); onShoot(e.object.position.x, e.object.position.y); }}>
      <ringGeometry args={[0.08, 0.14, 16]} />
      <meshBasicMaterial color="#ff0000" transparent opacity={0.7} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Crowd() {
  const rows = [];
  for (let row = 0; row < 3; row++)
    for (let i = -10; i <= 10; i += 1.2) {
      const c = ["#0033cc", "#cc0000", "#ffd700", "#00aa44", "#ff6600"][Math.floor(Math.random() * 5)];
      rows.push(<mesh key={`${row}-${i}`} position={[i, 2 + row * 0.8, -10 - row * 1.5]}><capsuleGeometry args={[0.15, 0.3, 4, 4]} /><meshStandardMaterial color={c} /></mesh>);
    }
  return <group>{rows}</group>;
}

interface GameState {
  phase: "aiming" | "shooting" | "result" | "gameover";
  round: number; scored: number; saved: number;
  shootTarget: [number, number]; gkDir: number; lastResult: string;
}

function Scene({ gs, onShoot, onAnimDone }: { gs: GameState; onShoot: (x: number, y: number) => void; onAnimDone: (s: boolean) => void }) {
  const tp = new THREE.Vector3(gs.shootTarget[0], gs.shootTarget[1], -6.5);
  return (
    <>
      <fog attach="fog" args={["#0a1428", 15, 35]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
      <pointLight position={[-8, 10, -3]} intensity={60} color="#e0f0ff" />
      <pointLight position={[8, 10, -3]} intensity={60} color="#e0f0ff" />
      <IceRink />
      <HockeyGoal />
      <Goalie targetX={gs.gkDir} diving={gs.phase === "shooting"} />
      <Puck shooting={gs.phase === "shooting"} targetPos={tp} onAnimDone={onAnimDone} />
      {gs.phase === "aiming" && <AimTarget onShoot={onShoot} />}
      <Crowd />
      <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2.5} minAzimuthAngle={-Math.PI / 6} maxAzimuthAngle={Math.PI / 6} />
    </>
  );
}

export function PenaltyShot3D({ onBack }: { onBack: () => void }) {
  const [gs, setGs] = useState<GameState>({
    phase: "aiming", round: 1, scored: 0, saved: 0, shootTarget: [0, 0.5], gkDir: 0, lastResult: "",
  });

  const handleShoot = useCallback((x: number, y: number) => {
    setGs(p => ({ ...p, phase: "shooting", shootTarget: [x, y], gkDir: (Math.random() - 0.5) * 2 }));
  }, []);

  const handleAnimDone = useCallback((scored: boolean) => {
    setGs(p => {
      const gkSaved = scored && Math.abs(p.gkDir * 1.5 - p.shootTarget[0]) < 0.6 && p.shootTarget[1] < 0.8;
      const actuallyScored = scored && !gkSaved;
      const isOver = p.round >= 5;
      return {
        ...p, phase: isOver ? "gameover" : "result",
        scored: p.scored + (actuallyScored ? 1 : 0),
        saved: p.saved + (actuallyScored ? 0 : 1),
        lastResult: !scored ? "WIDE! 😱" : gkSaved ? "SAVED! 🧤" : "GOAL! 🏒🔥",
      };
    });
  }, []);

  const nextRound = useCallback(() => setGs(p => ({ ...p, phase: "aiming", round: p.round + 1, shootTarget: [0, 0.5], gkDir: 0, lastResult: "" })), []);
  const reset = useCallback(() => setGs({ phase: "aiming", round: 1, scored: 0, saved: 0, shootTarget: [0, 0.5], gkDir: 0, lastResult: "" }), []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <h2 className="text-xl font-bold">🏒 Penalty Shot</h2>
        <div className="ml-auto"><Button variant="outline" size="sm" onClick={reset} className="gap-1"><RotateCcw className="h-3 w-3" /> Reset</Button></div>
      </div>
      <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50">
        <div className="text-center"><p className="text-xs text-muted-foreground">Goals</p><p className="text-2xl font-black text-primary">{gs.scored}</p></div>
        <div className="text-center"><p className="text-xs text-muted-foreground">Round</p><p className="text-lg font-bold">{gs.round}/5</p></div>
        <div className="text-center"><p className="text-xs text-muted-foreground">Saved</p><p className="text-2xl font-black text-destructive">{gs.saved}</p></div>
      </div>
      <div className="relative rounded-xl overflow-hidden border border-border/50 bg-black" style={{ height: "min(60vh, 500px)" }}>
        <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center bg-background/80"><p className="text-muted-foreground animate-pulse">Loading 3D scene...</p></div>}>
          <Canvas shadows camera={{ position: [0, 2.5, 8], fov: 50 }}><Scene gs={gs} onShoot={handleShoot} onAnimDone={handleAnimDone} /></Canvas>
        </Suspense>
        {gs.phase === "aiming" && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2"><p className="text-white text-sm font-medium text-center">🎯 Click on the goal to shoot!</p></div>}
        {gs.phase === "result" && <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"><div className="text-center space-y-3"><p className="text-4xl font-black text-white drop-shadow-lg">{gs.lastResult}</p><Button onClick={nextRound}>Next Shot →</Button></div></div>}
        {gs.phase === "gameover" && <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"><div className="text-center space-y-3 p-6"><p className="text-lg text-white/80">{gs.lastResult}</p><p className="text-5xl font-black text-white">{gs.scored > gs.saved ? "🏆 YOU WIN!" : gs.scored < gs.saved ? "😢 YOU LOSE" : "🤝 DRAW!"}</p><p className="text-2xl font-bold text-white">{gs.scored} - {gs.saved}</p><Button onClick={reset} size="lg" className="gap-2"><RotateCcw className="h-4 w-4" /> Play Again</Button></div></div>}
      </div>
    </div>
  );
}
