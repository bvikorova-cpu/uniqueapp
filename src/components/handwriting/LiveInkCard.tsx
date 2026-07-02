import { useRef, useState, useCallback, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Eraser, Wand2, Coins } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useLiveInkAnalyze } from "@/hooks/useHandwritingCapsule";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type Point = { x: number; y: number; t: number; p: number };
type Stroke = { points: Point[]; color: string };

const W = 600;
const H = 240;

// 3D ribbon mesh built from strokes
function InkRibbon({ strokes }: { strokes: Stroke[] }) {
  const geometries = strokes
    .filter((s) => s.points.length > 1)
    .map((s, idx) => {
      const pts = s.points.map(
        (p) => new THREE.Vector3(
          (p.x / W - 0.5) * 4,
          -(p.y / H - 0.5) * 1.6,
          Math.sin(p.t / 200) * 0.05,
        ),
      );
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubeSegments = Math.max(20, pts.length * 2);
      return (
    <>
      <FloatingHowItWorks title={"Live Ink Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Live Ink Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Live Ink Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <mesh key={idx}>
          <tubeGeometry args={[curve, tubeSegments, 0.025, 8, false]} />
          <meshStandardMaterial
            color={s.color}
            emissive={s.color}
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.4}
          />
        </mesh>
    </>
  );
    });
  return <>{geometries}</>;
}

export function LiveInkCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [drawing, setDrawing] = useState(false);
  const startedAt = useRef<number>(0);
  const live = useLiveInkAnalyze();

  const ctx = () => canvasRef.current?.getContext("2d");

  const redraw = useCallback((all: Stroke[]) => {
    const c = ctx();
    if (!c) return;
    c.clearRect(0, 0, W, H);
    c.lineCap = "round";
    c.lineJoin = "round";
    for (const s of all) {
      if (s.points.length < 2) continue;
      c.strokeStyle = s.color;
      c.lineWidth = 2.5;
      c.beginPath();
      c.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) c.lineTo(s.points[i].x, s.points[i].y);
      c.stroke();
    }
  }, []);

  const getPos = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * W,
      y: ((e.clientY - r.top) / r.height) * H,
      t: performance.now(),
      p: e.pressure || 0.5,
    };
  };

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    if (strokes.length === 0) startedAt.current = performance.now();
    setDrawing(true);
    setStrokes((prev) => [...prev, { points: [getPos(e)], color: "hsl(var(--primary))" }]);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drawing) return;
    setStrokes((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      last.points.push(getPos(e));
      redraw(next);
      return next;
    });
  };

  const onUp = (e: React.PointerEvent) => {
    canvasRef.current?.releasePointerCapture(e.pointerId);
    setDrawing(false);
  };

  const clearAll = () => {
    setStrokes([]);
    redraw([]);
  };

  const analyze = () => {
    if (strokes.length === 0) return;
    const allPoints = strokes.flatMap((s) => s.points);
    const pressureAvg =
      allPoints.reduce((a, p) => a + p.p, 0) / Math.max(1, allPoints.length);
    let totalDist = 0;
    for (const s of strokes) {
      for (let i = 1; i < s.points.length; i++) {
        const dx = s.points[i].x - s.points[i - 1].x;
        const dy = s.points[i].y - s.points[i - 1].y;
        totalDist += Math.sqrt(dx * dx + dy * dy);
      }
    }
    const durationMs = Math.max(1, performance.now() - startedAt.current);
    const speedAvg = totalDist / (durationMs / 1000);
    live.mutate({ strokes, durationMs: Math.round(durationMs), pressureAvg, speedAvg });
  };

  const reading = (live.data as any)?.reading;

  return (
    <Card className="bg-gradient-to-br from-amber-50/80 to-yellow-100/60 dark:from-amber-950/30 dark:to-yellow-900/20 border-amber-300/40">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-700" /> Live Ink Studio
          </CardTitle>
          <Badge variant="outline" className="text-xs gap-1">
            <Coins className="w-3 h-3" /> 4 credits
          </Badge>
        </div>
        <p className="text-xs text-amber-900/80 dark:text-amber-200/80">
          Write directly with your finger or stylus — watch your strokes become a 3D ribbon, then get an instant AI reading.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border-2 border-amber-300/40 bg-white/70 dark:bg-amber-950/20 overflow-hidden touch-none">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="w-full h-[180px] touch-none cursor-crosshair"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
          />
        </div>
        <div className="rounded-lg overflow-hidden h-[160px] bg-gradient-to-br from-zinc-900 to-zinc-800">
          <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[2, 2, 2]} intensity={1.2} />
            <pointLight position={[-2, -1, 2]} intensity={0.6} color="#ffd166" />
            <Suspense fallback={null}>
              <InkRibbon strokes={strokes} />
            </Suspense>
            <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={1.5} />
          </Canvas>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={clearAll} className="gap-2">
            <Eraser className="w-4 h-4" /> Clear
          </Button>
          <Button
            size="sm"
            onClick={analyze}
            disabled={strokes.length === 0 || live.isPending}
            className="gap-2 ml-auto"
          >
            <Wand2 className="w-4 h-4" />
            {live.isPending ? "Reading…" : "Read my stroke"}
          </Button>
        </div>

        {reading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-amber-100/60 dark:bg-amber-900/30 border border-amber-300/40 p-3 space-y-2"
          >
            <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
              {reading.headline}
            </p>
            <p className="text-xs text-amber-900/80 dark:text-amber-100/80">{reading.insight}</p>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                ["Energy", reading.energy],
                ["Confidence", reading.confidence],
                ["Focus", reading.focus],
                ["Creativity", reading.creativity],
              ].map(([label, v]) => (
                <div key={label as string} className="text-center">
                  <div className="text-base font-black text-amber-800 dark:text-amber-300">{v as number}</div>
                  <div className="text-[10px] uppercase tracking-wide text-amber-900/70">{label as string}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
