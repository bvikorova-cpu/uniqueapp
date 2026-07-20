import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Html, ContactShadows, Text } from "@react-three/drei";
import * as THREE from "three";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";

const SEATS = 6;
const RADIUS = 2.6;

type Seat = {
  index: number;
  angle: number;
  position: [number, number, number];
  occupant?: { name: string; avatar?: string } | null;
};

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <circleGeometry args={[8, 64]} />
      <meshStandardMaterial color="#0b0908" roughness={0.35} metalness={0.6} />
    </mesh>
  );
}

function Rug() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
      <circleGeometry args={[3.6, 64]} />
      <meshStandardMaterial color="#3a0d1a" roughness={0.9} />
    </mesh>
  );
}

function Table() {
  return (
    <group position={[0, 0.45, 0]}>
      {/* top */}
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 0.08, 64]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} />
      </mesh>
      {/* pedestal */}
      <mesh castShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.28, 0.7, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.06, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* candle */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.16, 16]} />
        <meshStandardMaterial color="#f5e6c8" emissive="#f5b041" emissiveIntensity={0.4} />
      </mesh>
      <pointLight position={[0, 0.75, 0]} intensity={1.4} distance={4} color="#ffb060" castShadow />
    </group>
  );
}

function Chair({
  angle,
  seat,
  onClick,
  isMine,
  isHovered,
  setHovered,
}: {
  angle: number;
  seat: Seat;
  onClick: () => void;
  isMine: boolean;
  isHovered: boolean;
  setHovered: (v: boolean) => void;
}) {
  const x = Math.cos(angle) * RADIUS;
  const z = Math.sin(angle) * RADIUS;
  const rotY = -angle + Math.PI / 2;
  const occupied = !!seat.occupant;

  const color = occupied ? (isMine ? "#d4af37" : "#7a1f2b") : isHovered ? "#b8892a" : "#2b1a10";
  const emissive = isMine ? "#5a3a00" : "#000000";

  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {/* seat cushion */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 0.55, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <boxGeometry args={[0.9, 0.18, 0.9]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.25} roughness={0.6} />
      </mesh>
      {/* back */}
      <mesh castShadow position={[0, 1.1, -0.4]}>
        <boxGeometry args={[0.9, 1.1, 0.15]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* arms */}
      <mesh castShadow position={[0.42, 0.75, 0]}>
        <boxGeometry args={[0.12, 0.4, 0.9]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[-0.42, 0.75, 0]}>
        <boxGeometry args={[0.12, 0.4, 0.9]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* legs */}
      {[[0.35, 0.15, 0.35],[ -0.35,0.15, 0.35],[0.35,0.15,-0.35],[-0.35,0.15,-0.35]].map((p, i) => (
        <mesh key={i} position={p as [number,number,number]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.5, 12]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Avatar (occupant) */}
      {occupied && (
        <group position={[0, 1.55, -0.05]}>
          <mesh castShadow>
            <sphereGeometry args={[0.28, 24, 24]} />
            <meshStandardMaterial color="#e8c78a" roughness={0.55} />
          </mesh>
          {/* torso */}
          <mesh castShadow position={[0, -0.55, 0]}>
            <cylinderGeometry args={[0.28, 0.36, 0.7, 20]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.7} />
          </mesh>
          <Html position={[0, 0.55, 0]} center distanceFactor={8}>
            <div className="px-2 py-1 rounded-full bg-black/70 backdrop-blur text-[10px] tracking-wide text-amber-200 border border-amber-500/40 whitespace-nowrap">
              {seat.occupant?.name}
            </div>
          </Html>
        </group>
      )}

      {/* Seat number label */}
      {!occupied && (
        <Html position={[0, 1.3, 0]} center distanceFactor={10}>
          <div className="px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[10px] uppercase tracking-widest">
            Seat {seat.index + 1}
          </div>
        </Html>
      )}
    </group>
  );
}

function Room() {
  // dim ambient room walls (circular)
  const wallRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (wallRef.current) {
      const m = wallRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.05 + Math.sin(clock.getElapsedTime() * 0.5) * 0.02;
    }
  });
  return (
    <group>
      <mesh ref={wallRef} position={[0, 3, 0]}>
        <cylinderGeometry args={[8, 8, 6, 64, 1, true]} />
        <meshStandardMaterial
          color="#1a0f0a"
          emissive="#3a0d1a"
          emissiveIntensity={0.06}
          side={THREE.BackSide}
          roughness={1}
        />
      </mesh>
      {/* Chandelier hint */}
      <mesh position={[0, 5.2, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#f5b041" emissive="#f5b041" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[0, 5, 0]} intensity={2} distance={12} color="#ffb060" />
    </group>
  );
}

function SalonScene({
  seats,
  onSeatClick,
  myUserId,
}: {
  seats: Seat[];
  onSeatClick: (i: number) => void;
  myUserId: string | null;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <>
      <color attach="background" args={["#08050a"]} />
      <fog attach="fog" args={["#08050a", 8, 22]} />
      <ambientLight intensity={0.15} />
      <Environment preset="night" />
      <Room />
      <Floor />
      <Rug />
      <Table />
      {seats.map((s) => (
        <Chair
          key={s.index}
          seat={s}
          angle={s.angle}
          onClick={() => onSeatClick(s.index)}
          isMine={!!s.occupant && (s.occupant as any).id === myUserId}
          isHovered={hovered === s.index}
          setHovered={(v) => setHovered(v ? s.index : null)}
        />
      ))}
      <Text
        position={[0, 3.6, -4.5]}
        fontSize={0.45}
        color="#d4af37"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.15}
      >
        THE SALON
      </Text>
      <Text position={[0, 3.1, -4.5]} fontSize={0.14} color="#a8896a" anchorX="center">
        Unique · Exclusive
      </Text>
      <ContactShadows position={[0, 0.01, 0]} opacity={0.6} blur={2.4} scale={12} far={4} />
      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={Math.PI / 3.4}
        minDistance={4}
        maxDistance={10}
        target={[0, 1, 0]}
      />
    </>
  );
}

export default function ExclusiveSalon() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [mySeat, setMySeat] = useState<number | null>(null);

  // Demo occupants (until realtime presence is wired)
  const [seats, setSeats] = useState<Seat[]>(() =>
    Array.from({ length: SEATS }, (_, i) => {
      const angle = (i / SEATS) * Math.PI * 2;
      const demo = [
        { name: "A. Kovács" },
        null,
        { name: "M. Laurent" },
        null,
        { name: "R. Weiss" },
        null,
      ][i] as Seat["occupant"];
      return {
        index: i,
        angle,
        position: [Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS],
        occupant: demo,
      };
    })
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) { setIsMember(false); return; }
      const { data } = await supabase
        .from("exclusive_members")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) setIsMember(!!data && data.status === "active");
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleSeat = (i: number) => {
    if (!user) { toast.error("Sign in to take a seat"); return; }
    if (isMember === false) { toast.error("Members only. Join Exclusive to enter The Salon."); return; }
    setSeats((prev) => {
      const next = prev.map((s) => ({ ...s }));
      if (mySeat !== null) next[mySeat].occupant = null;
      if (next[i].occupant && !(next[i].occupant as any).id) {
        toast.error("This seat is taken");
        return prev;
      }
      next[i].occupant = { name: "You", ...(user ? { id: user.id } as any : {}) };
      return next;
    });
    setMySeat(i);
    toast.success(`You took Seat ${i + 1}`);
  };

  return (
    <div className="fixed inset-0 bg-[#08050a] text-amber-100">
      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <Link to="/exclusive" className="flex items-center gap-2 text-amber-200/80 hover:text-amber-100 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-amber-400" />
          <span className="text-xs sm:text-sm tracking-[0.35em] uppercase text-amber-300">The Salon</span>
        </div>
        <div className="text-[10px] sm:text-xs text-amber-300/60 uppercase tracking-widest">
          {seats.filter((s) => s.occupant).length}/{SEATS} seated
        </div>
      </div>

      {/* Canvas */}
      <Canvas shadows camera={{ position: [0, 3, 7], fov: 45 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <SalonScene seats={seats} onSeatClick={handleSeat} myUserId={user?.id ?? null} />
        </Suspense>
      </Canvas>

      {/* Loading overlay while checking membership */}
      {isMember === null && user && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur">
          <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
        </div>
      )}

      {/* Non-member gate */}
      {isMember === false && (
        <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6">
          <div className="max-w-md mx-auto rounded-2xl border border-amber-500/30 bg-black/70 backdrop-blur-xl p-5 text-center">
            <Crown className="h-6 w-6 mx-auto text-amber-400 mb-2" />
            <div className="text-amber-100 font-semibold tracking-wide">Members only</div>
            <p className="text-amber-200/70 text-sm mt-1">
              The Salon is reserved for Unique Exclusive members. Take a seat at the golden table.
            </p>
            <button
              onClick={() => navigate("/exclusive")}
              className="mt-4 w-full px-4 py-2.5 rounded-full bg-amber-500 text-black font-medium hover:bg-amber-400 transition"
            >
              Join Exclusive
            </button>
          </div>
        </div>
      )}

      {/* Helper hint */}
      {isMember && (
        <div className="absolute bottom-4 inset-x-0 z-10 flex justify-center pointer-events-none">
          <div className="px-3 py-1.5 rounded-full bg-black/60 border border-amber-500/30 text-[11px] text-amber-200/80 tracking-wide">
            Drag to orbit · Scroll to zoom · Tap a chair to sit
          </div>
        </div>
      )}
    </div>
  );
}
