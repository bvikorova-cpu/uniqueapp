import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/* Circuit geometry                                                    */
/* ------------------------------------------------------------------ */

const TRACK_WIDTH = 9;

/** A closed F1-style circuit: long straight, hairpin, chicane, sweeping curves. */
function useCircuitCurve(seed = 0) {
  return useMemo(() => {
    const raw: [number, number][] = [
      [0, -46], [16, -44], [26, -34], [28, -20], [22, -8],
      [30, 2], [42, 6], [46, 18], [36, 28], [20, 30],
      [8, 24], [-4, 28], [-18, 34], [-32, 28], [-36, 14],
      [-28, 4], [-34, -8], [-40, -22], [-32, -36], [-16, -46],
    ];
    const wobble = (i: number) => Math.sin((i + 1) * (seed + 1.7)) * 2.2;
    const pts = raw.map(([x, z], i) => new THREE.Vector3(x + wobble(i), 0, z + wobble(i * 1.3)));
    return new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.5);
  }, [seed]);
}

/** Build a flat ribbon mesh following the curve. */
function ribbonGeometry(curve: THREE.CatmullRomCurve3, width: number, samples = 600, y = 0) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const side = new THREE.Vector3().crossVectors(tan, up).normalize().multiplyScalar(width / 2);
    pos.push(p.x - side.x, y, p.z - side.z);
    pos.push(p.x + side.x, y, p.z + side.z);
    uv.push(0, t * samples * 0.06, 1, t * samples * 0.06);
    if (i < samples) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function Circuit({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const asphalt = useMemo(() => ribbonGeometry(curve, TRACK_WIDTH, 700, 0.02), [curve]);
  const runoff = useMemo(() => ribbonGeometry(curve, TRACK_WIDTH + 5.5, 700, 0), [curve]);
  const centerLine = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 400; i++) pts.push(curve.getPointAt(i / 400).setY(0.05));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [curve]);

  // kerb blocks along both edges
  const kerbs = useMemo(() => {
    const out: { pos: THREE.Vector3; rot: number; alt: boolean }[] = [];
    const up = new THREE.Vector3(0, 1, 0);
    const count = 190;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const side = new THREE.Vector3().crossVectors(tan, up).normalize();
      const rot = Math.atan2(tan.x, tan.z);
      [-1, 1].forEach((s) => {
        out.push({
          pos: new THREE.Vector3(
            p.x + side.x * s * (TRACK_WIDTH / 2 + 0.55),
            0.06,
            p.z + side.z * s * (TRACK_WIDTH / 2 + 0.55),
          ),
          rot,
          alt: i % 2 === 0,
        });
      });
    }
    return out;
  }, [curve]);

  const start = curve.getPointAt(0);
  const startTan = curve.getTangentAt(0);

  return (
    <group>
      {/* ground */}
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[320, 320]} />
        <meshStandardMaterial color="#050b18" />
      </mesh>

      {/* run-off / grass apron */}
      <mesh geometry={runoff} receiveShadow>
        <meshStandardMaterial color="#0c1c30" roughness={0.95} />
      </mesh>

      {/* asphalt */}
      <mesh geometry={asphalt} receiveShadow>
        <meshStandardMaterial color="#1b2130" roughness={0.75} metalness={0.15} />
      </mesh>

      {/* glowing racing line */}
      <primitive object={new THREE.Line(centerLine, new THREE.LineDashedMaterial({ color: "#22d3ee", dashSize: 2.2, gapSize: 2.6, transparent: true, opacity: 0.55 }))} />

      {/* kerbs */}
      {kerbs.map((k, i) => (
        <mesh key={i} position={k.pos} rotation={[0, k.rot, 0]}>
          <boxGeometry args={[1.1, 0.12, 1.5]} />
          <meshStandardMaterial
            color={k.alt ? "#ef4444" : "#f8fafc"}
            emissive={k.alt ? "#7f1d1d" : "#334155"}
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}

      {/* start / finish */}
      <mesh position={[start.x, 0.07, start.z]} rotation={[-Math.PI / 2, 0, -Math.atan2(startTan.x, startTan.z)]}>
        <planeGeometry args={[TRACK_WIDTH, 2.2]} />
        <meshStandardMaterial color="#e2e8f0" emissive="#94a3b8" emissiveIntensity={0.3} />
      </mesh>
      <group position={[start.x, 0, start.z]} rotation={[0, -Math.atan2(startTan.x, startTan.z), 0]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * (TRACK_WIDTH / 2 + 0.8), 3, 0]}>
            <boxGeometry args={[0.5, 6, 0.5]} />
            <meshStandardMaterial color="#0e7490" emissive="#06b6d4" emissiveIntensity={0.6} />
          </mesh>
        ))}
        <mesh position={[0, 6, 0]}>
          <boxGeometry args={[TRACK_WIDTH + 2, 1.4, 0.4]} />
          <meshStandardMaterial color="#0f172a" emissive="#0891b2" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Car                                                                 */
/* ------------------------------------------------------------------ */

function Car3D({ color }: { color: string }) {
  return (
    <group scale={1.5}>
      <mesh position={[0, 0.32, 0]} castShadow>
        <boxGeometry args={[1, 0.34, 2.6]} />
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.18} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0.56, -0.15]}>
        <boxGeometry args={[0.6, 0.3, 0.8]} />
        <meshStandardMaterial color="#0b1220" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* front wing */}
      <mesh position={[0, 0.16, 1.45]}>
        <boxGeometry args={[1.5, 0.08, 0.5]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* rear wing */}
      <mesh position={[0, 0.78, -1.3]}>
        <boxGeometry args={[1.3, 0.4, 0.12]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* wheels */}
      {[[0.66, 0.28, 0.95], [-0.66, 0.28, 0.95], [0.7, 0.3, -1], [-0.7, 0.3, -1]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.28, 20]} />
          <meshStandardMaterial color="#111827" roughness={0.9} />
        </mesh>
      ))}
      {/* engine glow */}
      <pointLight position={[0, 0.4, -1.6]} distance={5} intensity={2} color={color} />
      <mesh position={[0, 0.35, -1.45]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.2} />
      </mesh>
    </group>
  );
}

type Racer = { id: string; name: string; color: string; pace: number; lane: number };

function RacingPack({
  curve,
  racers,
  isRacing,
  laps,
  onStandings,
}: {
  curve: THREE.CatmullRomCurve3;
  racers: Racer[];
  isRacing: boolean;
  laps: number;
  onStandings: (s: { name: string; color: string; lap: number; pct: number }[], finished: boolean) => void;
}) {
  const groups = useRef<(THREE.Group | null)[]>([]);
  const progress = useRef<number[]>(racers.map((_, i) => -i * 0.012));
  const camRig = useRef<THREE.Group>(null);
  const tick = useRef(0);
  const done = useRef(false);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useEffect(() => {
    progress.current = racers.map((_, i) => -i * 0.012);
    done.current = false;
  }, [racers, isRacing]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    racers.forEach((r, i) => {
      const g = groups.current[i];
      if (!g) return;

      if (isRacing && !done.current) {
        // slower through tight corners, plus a little per-driver rhythm
        const u = ((progress.current[i] % 1) + 1) % 1;
        const curv = curvature(curve, u);
        const cornerFactor = 1 - Math.min(curv * 2.4, 0.45);
        const rhythm = 1 + Math.sin(t * 1.3 + i * 2.1) * 0.06;
        progress.current[i] += delta * 0.055 * r.pace * cornerFactor * rhythm;
      }

      const p = Math.max(progress.current[i], 0);
      const u = p % 1;
      const point = curve.getPointAt(u);
      const tan = curve.getTangentAt(u);
      const side = new THREE.Vector3().crossVectors(tan, up).normalize();
      // drivers drift toward the racing line while battling for position
      const laneTarget = r.lane * (isRacing ? 0.9 : 1.5) + (isRacing ? Math.sin(t * 0.9 + i) * 0.7 : 0);
      g.position.set(point.x + side.x * laneTarget, 0, point.z + side.z * laneTarget);
      g.rotation.y = Math.atan2(tan.x, tan.z);
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, isRacing ? -curvature(curve, u) * 1.4 : 0, 0.08);
    });

    // broadcast camera chases the leader
    if (camRig.current) {
      const leader = progress.current.reduce((a, b, i) => (b > progress.current[a] ? i : a), 0);
      const u = ((Math.max(progress.current[leader], 0) % 1) + 1) % 1;
      const p = curve.getPointAt(u);
      camRig.current.position.lerp(new THREE.Vector3(p.x, 0, p.z), 0.05);
    }

    tick.current += delta;
    if (tick.current > 0.2) {
      tick.current = 0;
      const standings = racers
        .map((r, i) => ({
          name: r.name,
          color: r.color,
          lap: Math.min(Math.floor(Math.max(progress.current[i], 0)) + 1, laps),
          pct: Math.min((Math.max(progress.current[i], 0) / laps) * 100, 100),
          raw: progress.current[i],
        }))
        .sort((a, b) => b.raw - a.raw)
        .map(({ raw, ...rest }) => rest);
      const finished = progress.current.some((p) => p >= laps);
      if (finished) done.current = true;
      onStandings(standings, finished);
    }
  });

  return (
    <>
      <group ref={camRig}>
        <pointLight position={[0, 14, 0]} intensity={1.1} color="#67e8f9" distance={60} />
      </group>
      {racers.map((r, i) => (
        <group key={r.id} ref={(el) => (groups.current[i] = el)}>
          <Car3D color={r.color} />
        </group>
      ))}
    </>
  );
}

function curvature(curve: THREE.CatmullRomCurve3, u: number) {
  return curve.getTangentAt(u).angleTo(curve.getTangentAt((u + 0.01) % 1));
}

/* ------------------------------------------------------------------ */
/* Public component                                                    */
/* ------------------------------------------------------------------ */

const FALLBACK_COLORS = ["#22d3ee", "#f472b6", "#facc15", "#34d399", "#a78bfa", "#fb923c", "#60a5fa", "#f87171", "#2dd4bf", "#c084fc"];

export interface GPCircuit3DProps {
  participants: any[];
  isRacing: boolean;
  trackName?: string;
  laps?: number;
  seed?: number;
}

export function GPCircuit3D({ participants, isRacing, trackName = "Circuit", laps = 3, seed = 0 }: GPCircuit3DProps) {
  const curve = useCircuitCurve(seed);
  const [standings, setStandings] = useState<{ name: string; color: string; lap: number; pct: number }[]>([]);

  const racers: Racer[] = useMemo(() => {
    const list = participants?.length
      ? participants
      : Array.from({ length: 6 }).map((_, i) => ({ id: `ghost-${i}`, f1_cars: { name: `Car ${i + 1}` } }));
    const n = list.length;
    return list.map((p: any, i: number) => ({
      id: p.id ?? `r-${i}`,
      name: p.f1_cars?.name ?? p.car_name ?? `Driver ${i + 1}`,
      color: p.f1_cars?.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      pace: 0.9 + ((i * 37) % 23) / 100,
      lane: (i - (n - 1) / 2) * (TRACK_WIDTH / (n + 1)),
    }));
  }, [participants]);

  return (
    <div className="relative h-full w-full">
      <Canvas shadows dpr={[1, 1.8]}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 62, 78]} fov={42} />
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.15} minDistance={30} maxDistance={150} autoRotate={!isRacing} autoRotateSpeed={0.35} />
          <ambientLight intensity={0.45} color="#7dd3fc" />
          <directionalLight position={[40, 60, 20]} intensity={1.3} color="#e0f2fe" castShadow />
          <pointLight position={[-40, 20, -30]} intensity={0.6} color="#0ea5e9" />
          <hemisphereLight args={["#0ea5e9", "#020617", 0.5]} />
          <fog attach="fog" args={["#050b18", 90, 260]} />
          <Circuit curve={curve} />
          <RacingPack curve={curve} racers={racers} isRacing={isRacing} laps={laps} onStandings={(s) => setStandings(s)} />
        </Suspense>
      </Canvas>

      {/* Broadcast HUD */}
      <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-cyan-500/25 bg-slate-950/70 px-3 py-2 backdrop-blur-md">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-400/60">{isRacing ? "Live" : "Formation lap"}</p>
        <p className="font-mono text-sm font-bold uppercase tracking-wider text-white">{trackName}</p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-cyan-300/70">
          Lap {standings[0]?.lap ?? 1} / {laps}
        </p>
      </div>

      <div className="pointer-events-none absolute right-3 top-3 w-40 space-y-1 rounded-lg border border-cyan-500/25 bg-slate-950/70 p-2 backdrop-blur-md">
        <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-cyan-400/60">Standings</p>
        {standings.slice(0, 8).map((s, i) => (
          <div key={s.name + i} className="flex items-center gap-1.5">
            <span className="w-3 font-mono text-[10px] text-cyan-400/60">{i + 1}</span>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="flex-1 truncate font-mono text-[10px] text-white/90">{s.name}</span>
            <span className="font-mono text-[9px] text-cyan-300/60">{Math.round(s.pct)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GPCircuit3D;
