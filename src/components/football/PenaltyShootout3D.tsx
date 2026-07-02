import { useState, useRef, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Environment } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";
import * as THREE from "three";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

// --- 3D Scene Components ---

function Pitch() {
  return (
    <><FloatingHowItWorks title="PenaltyShootout3D — How it works" steps={[{title:"Open this section",desc:"Access PenaltyShootout3D from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<group>
      {/* Main grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#2d8a4e" />
      </mesh>
      {/* Penalty area lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -6]}>
        <planeGeometry args={[16.5, 0.08]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[10, 0.08]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8.25, 0, -4]}>
        <planeGeometry args={[0.08, 4]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8.25, 0, -4]}>
        <planeGeometry args={[0.08, 4]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Penalty spot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 2]}>
        <circleGeometry args={[0.12, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  );
}

function GoalPost() {
  const postMaterial = <meshStandardMaterial color="white" metalness={0.8} roughness={0.2} />;
  const netMaterial = <meshStandardMaterial color="white" transparent opacity={0.15} side={THREE.DoubleSide} wireframe />;
  
  return (
    <group position={[0, 0, -6]}>
      {/* Left post */}
      <mesh position={[-3.66, 1.22, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 2.44, 8]} />
        {postMaterial}
      </mesh>
      {/* Right post */}
      <mesh position={[3.66, 1.22, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 2.44, 8]} />
        {postMaterial}
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, 2.44, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 7.32, 8]} />
        {postMaterial}
      </mesh>
      {/* Net - back */}
      <mesh position={[0, 1.22, -1.2]}>
        <planeGeometry args={[7.32, 2.44, 10, 6]} />
        {netMaterial}
      </mesh>
      {/* Net - top */}
      <mesh position={[0, 2.44, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.32, 1.2, 10, 3]} />
        {netMaterial}
      </mesh>
      {/* Net - left */}
      <mesh position={[-3.66, 1.22, -0.6]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.2, 2.44, 3, 6]} />
        {netMaterial}
      </mesh>
      {/* Net - right */}
      <mesh position={[3.66, 1.22, -0.6]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.2, 2.44, 3, 6]} />
        {netMaterial}
      </mesh>
    </group>
  );
}

interface GoalkeeperProps {
  targetX: number;
  diving: boolean;
}

function Goalkeeper({ targetX, diving }: GoalkeeperProps) {
  const groupRef = useRef<THREE.Group>(null);
  const armLRef = useRef<THREE.Mesh>(null);
  const armRRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (diving) {
      const targetPos = new THREE.Vector3(targetX * 2.5, 0.8, -5.5);
      groupRef.current.position.lerp(targetPos, delta * 4);
      // Dive animation
      if (targetX < 0) {
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -Math.PI / 4, delta * 4);
      } else {
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, Math.PI / 4, delta * 4);
      }
    } else {
      groupRef.current.position.lerp(new THREE.Vector3(0, 0, -5.5), delta * 3);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * 3);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -5.5]}>
      {/* Body */}
      <mesh position={[0, 1, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.8, 4, 8]} />
        <meshStandardMaterial color="#ffd700" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#f5c6a0" />
      </mesh>
      {/* Left arm */}
      <mesh ref={armLRef} position={[-0.4, 1.3, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
        <meshStandardMaterial color="#ffd700" />
      </mesh>
      {/* Right arm */}
      <mesh ref={armRRef} position={[0.4, 1.3, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
        <meshStandardMaterial color="#ffd700" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.15, 0.25, 0]}>
        <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.15, 0.25, 0]}>
        <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      {/* Gloves */}
      <mesh position={[-0.4, 1.65, 0]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial color="#ff6b35" />
      </mesh>
      <mesh position={[0.4, 1.65, 0]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial color="#ff6b35" />
      </mesh>
    </group>
  );
}

interface BallProps {
  shooting: boolean;
  targetPos: THREE.Vector3;
  onAnimDone: (scored: boolean) => void;
}

function Ball({ shooting, targetPos, onAnimDone }: BallProps) {
  const ref = useRef<THREE.Mesh>(null);
  const progress = useRef(0);
  const startPos = useRef(new THREE.Vector3(0, 0.22, 2));
  const done = useRef(false);

  useFrame((_, delta) => {
    if (!ref.current) return;
    if (shooting && !done.current) {
      progress.current += delta * 2.5;
      const t = Math.min(progress.current, 1);

      // Lerp position
      const x = THREE.MathUtils.lerp(startPos.current.x, targetPos.x, t);
      const z = THREE.MathUtils.lerp(startPos.current.z, targetPos.z, t);
      // Arc height
      const y = 0.22 + Math.sin(t * Math.PI) * (targetPos.y + 0.5);

      ref.current.position.set(x, y, z);
      ref.current.rotation.x -= delta * 15;

      if (t >= 1) {
        done.current = true;
        // Check if it's inside the goal (x between posts, y under crossbar, z past goal line)
        const inGoal = Math.abs(targetPos.x) < 3.4 && targetPos.y < 2.2;
        onAnimDone(inGoal);
      }
    } else if (!shooting) {
      ref.current.position.set(0, 0.22, 2);
      progress.current = 0;
      done.current = false;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0.22, 2]} castShadow>
      <sphereGeometry args={[0.22, 16, 16]} />
      <meshStandardMaterial color="white" />
      {/* Pentagon pattern */}
      <mesh>
        <sphereGeometry args={[0.225, 6, 6]} />
        <meshStandardMaterial color="#1a1a2e" wireframe transparent opacity={0.3} />
      </mesh>
    </mesh>
  );
}

function Kicker({ hasBall }: { hasBall: boolean }) {
  if (!hasBall) return null;
  return (
    <group position={[0.3, 0, 3]}>
      {/* Body */}
      <mesh position={[0, 1, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.8, 4, 8]} />
        <meshStandardMaterial color="#e63946" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#f5c6a0" />
      </mesh>
      {/* Shorts */}
      <mesh position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.27, 0.2, 4, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.15, 0.25, 0]}>
        <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
        <meshStandardMaterial color="#f5c6a0" />
      </mesh>
      <mesh position={[0.15, 0.25, 0]}>
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
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 6);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);
    if (intersection) {
      // Clamp to goal area
      const x = THREE.MathUtils.clamp(intersection.x, -3.5, 3.5);
      const y = THREE.MathUtils.clamp(intersection.y, 0.2, 2.3);
      meshRef.current.position.set(x, y, -5.99);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 1.2, -5.99]}
      onClick={(e) => {
        e.stopPropagation();
        const pos = e.object.position;
        onShoot(pos.x, pos.y);
      }}
    >
      <ringGeometry args={[0.15, 0.25, 16]} />
      <meshBasicMaterial color="#ff0000" transparent opacity={0.7} side={THREE.DoubleSide} />
    </mesh>
  );
}

function ScoreBoard3D({ homeScore, awayScore, round }: { homeScore: number; awayScore: number; round: number }) {
  return (
    <group position={[0, 4.5, -6]}>
      {/* Board background */}
      <mesh>
        <planeGeometry args={[5, 1.2]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <Text position={[-1.5, 0.2, 0.01]} fontSize={0.4} color="#ffffff" font="/fonts/Inter-Bold.ttf">
        YOU
      </Text>
      <Text position={[0, 0.2, 0.01]} fontSize={0.5} color="#ffd700" font="/fonts/Inter-Bold.ttf">
        {homeScore} - {awayScore}
      </Text>
      <Text position={[1.5, 0.2, 0.01]} fontSize={0.4} color="#ffffff" font="/fonts/Inter-Bold.ttf">
        GK
      </Text>
      <Text position={[0, -0.25, 0.01]} fontSize={0.25} color="#888888" font="/fonts/Inter-Bold.ttf">
        Round {round}/5
      </Text>
    </group>
  );
}

function StadiumLights() {
  return (
    <>
      <pointLight position={[-8, 10, -3]} intensity={80} color="#fff5e0" castShadow />
      <pointLight position={[8, 10, -3]} intensity={80} color="#fff5e0" castShadow />
      <pointLight position={[0, 8, 5]} intensity={40} color="#e0e0ff" />
      {/* Light pole meshes */}
      {[[-10, 0, -8], [10, 0, -8]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh position={[0, 5, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 10, 6]} />
            <meshStandardMaterial color="#555" metalness={0.8} />
          </mesh>
          <mesh position={[0, 10, 0]}>
            <boxGeometry args={[0.8, 0.3, 0.3]} />
            <meshStandardMaterial color="#ffffe0" emissive="#ffffe0" emissiveIntensity={2} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Crowd() {
  const rows = [];
  for (let row = 0; row < 3; row++) {
    for (let i = -12; i <= 12; i += 1.2) {
      const colors = ["#e63946", "#457b9d", "#f4a261", "#2a9d8f", "#e9c46a", "#264653"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      rows.push(
        <mesh key={`${row}-${i}`} position={[i, 2 + row * 0.8, -10 - row * 1.5]}>
          <capsuleGeometry args={[0.15, 0.3, 4, 4]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    }
  }
  return <group>{rows}</group>;
}

// --- Main Scene ---

interface SceneProps {
  gameState: GameState;
  onShoot: (x: number, y: number) => void;
  onAnimDone: (scored: boolean) => void;
}

function Scene({ gameState, onShoot, onAnimDone }: SceneProps) {
  const targetPos = new THREE.Vector3(
    gameState.shootTarget[0],
    gameState.shootTarget[1],
    -6
  );

  const gkDiveX = gameState.gkDiveDirection;

  return (
    <>
      <fog attach="fog" args={["#0a0a1a", 15, 35]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow shadow-mapSize={1024} />
      
      <Pitch />
      <GoalPost />
      <Goalkeeper targetX={gkDiveX} diving={gameState.phase === "shooting"} />
      <Ball shooting={gameState.phase === "shooting"} targetPos={targetPos} onAnimDone={onAnimDone} />
      <Kicker hasBall={gameState.phase === "aiming"} />
      
      {gameState.phase === "aiming" && <AimTarget onShoot={onShoot} />}
      
      <ScoreBoard3D homeScore={gameState.playerScore} awayScore={gameState.gkScore} round={gameState.round} />
      <StadiumLights />
      <Crowd />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        minAzimuthAngle={-Math.PI / 6}
        maxAzimuthAngle={Math.PI / 6}
      />
    </>
  );
}

// --- Game State ---

interface GameState {
  phase: "aiming" | "shooting" | "result" | "gameover";
  round: number;
  playerScore: number;
  gkScore: number;
  shootTarget: [number, number];
  gkDiveDirection: number;
  lastResult: string;
}

// --- Main Component ---

interface PenaltyShootout3DProps {
  onBack: () => void;
}

export function PenaltyShootout3D({ onBack }: PenaltyShootout3DProps) {
  const [gameState, setGameState] = useState<GameState>({
    phase: "aiming",
    round: 1,
    playerScore: 0,
    gkScore: 0,
    shootTarget: [0, 1.2],
    gkDiveDirection: 0,
    lastResult: "",
  });

  const handleShoot = useCallback((x: number, y: number) => {
    // GK picks random direction
    const gkDir = (Math.random() - 0.5) * 2; // -1 to 1
    setGameState(prev => ({
      ...prev,
      phase: "shooting",
      shootTarget: [x, y],
      gkDiveDirection: gkDir,
    }));
  }, []);

  const handleAnimDone = useCallback((scored: boolean) => {
    // Check if GK saved it (GK dove in right direction and was close)
    setGameState(prev => {
      const gkSaved = !scored || (Math.abs(prev.gkDiveDirection * 2.5 - prev.shootTarget[0]) < 1.2 && prev.shootTarget[1] < 1.8);
      const actuallyScored = scored && !gkSaved;
      
      const newPlayerScore = prev.playerScore + (actuallyScored ? 1 : 0);
      const newGkScore = prev.gkScore + (actuallyScored ? 0 : 1);
      const isGameOver = prev.round >= 5;

      let lastResult = "";
      if (!scored) lastResult = "MISSED! 😱";
      else if (gkSaved) lastResult = "SAVED! 🧤";
      else lastResult = "GOAL! ⚽🎉";

      return {
        ...prev,
        phase: isGameOver ? "gameover" : "result",
        playerScore: newPlayerScore,
        gkScore: newGkScore,
        lastResult,
      };
    });
  }, []);

  const nextRound = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: "aiming",
      round: prev.round + 1,
      shootTarget: [0, 1.2],
      gkDiveDirection: 0,
      lastResult: "",
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      phase: "aiming",
      round: 1,
      playerScore: 0,
      gkScore: 0,
      shootTarget: [0, 1.2],
      gkDiveDirection: 0,
      lastResult: "",
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h2 className="text-xl font-bold">⚽ Penalty Shootout</h2>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetGame} className="gap-1">
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
        </div>
      </div>

      {/* HUD */}
      <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">You</p>
          <p className="text-2xl font-black text-primary">{gameState.playerScore}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Round</p>
          <p className="text-lg font-bold">{gameState.round}/5</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Keeper</p>
          <p className="text-2xl font-black text-destructive">{gameState.gkScore}</p>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-border/50 bg-black" style={{ height: "min(60vh, 500px)" }}>
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <p className="text-muted-foreground animate-pulse">Loading 3D scene...</p>
          </div>
        }>
          <Canvas shadows camera={{ position: [0, 3, 8], fov: 50 }}>
            <Scene gameState={gameState} onShoot={handleShoot} onAnimDone={handleAnimDone} />
          </Canvas>
        </Suspense>

        {/* Overlay messages */}
        {gameState.phase === "aiming" && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-white text-sm font-medium text-center">🎯 Click on the goal to shoot!</p>
          </div>
        )}

        {gameState.phase === "result" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="text-center space-y-3">
              <p className="text-4xl font-black text-white drop-shadow-lg">{gameState.lastResult}</p>
              <Button onClick={nextRound} className="bg-primary hover:bg-primary/90">
                Next Shot →
              </Button>
            </div>
          </div>
        )}

        {gameState.phase === "gameover" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-center space-y-3 p-6">
              <p className="text-lg text-white/80">{gameState.lastResult}</p>
              <p className="text-5xl font-black text-white drop-shadow-lg">
                {gameState.playerScore > gameState.gkScore ? "🏆 YOU WIN!" : gameState.playerScore < gameState.gkScore ? "😢 YOU LOSE" : "🤝 DRAW!"}
              </p>
              <p className="text-2xl font-bold text-white">
                {gameState.playerScore} - {gameState.gkScore}
              </p>
              <Button onClick={resetGame} size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                <RotateCcw className="h-4 w-4" /> Play Again
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Aim with your mouse and click on the goal to shoot. The goalkeeper will try to save it!
      </p>
    </div>
  </>
  );
}
