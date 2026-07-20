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
      <circleGeometry args={[9, 96]} />
      <meshStandardMaterial color="#e8dcc4" roughness={0.25} metalness={0.15} />
    </mesh>
  );
}

function Rug() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <circleGeometry args={[3.8, 96]} />
        <meshStandardMaterial color="#6b4423" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} receiveShadow>
        <ringGeometry args={[3.4, 3.55, 96]} />
        <meshStandardMaterial color="#c9a24a" metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Table() {
  return (
    <group position={[0, 0.45, 0]}>
      {/* wood top */}
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[1.15, 1.15, 0.09, 96]} />
        <meshStandardMaterial color="#3a1f14" metalness={0.25} roughness={0.35} />
      </mesh>
      {/* brass inlay */}
      <mesh position={[0, 0.401, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.12, 96]} />
        <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} emissive="#3a2600" emissiveIntensity={0.3} />
      </mesh>
      {/* pedestal */}
      <mesh castShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.34, 0.7, 32]} />
        <meshStandardMaterial color="#2a1810" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.08, 48]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* candle */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.18, 16]} />
        <meshStandardMaterial color="#f5e6c8" emissive="#ffb060" emissiveIntensity={0.5} />
      </mesh>
      {/* flame */}
      <mesh position={[0, 0.66, 0]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial color="#ffd88a" />
      </mesh>
      <pointLight position={[0, 0.78, 0]} intensity={2.2} distance={5} color="#ffb060" castShadow />
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

  // Warm cognac leather palette; brass when 'mine', muted when free
  const leather = occupied ? (isMine ? "#c9962b" : "#6b2a1e") : isHovered ? "#8a3a2a" : "#5a2418";
  const emissive = isMine ? "#3a2600" : "#1a0800";

  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {/* seat cushion (tufted look via slight scale) */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 0.55, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <boxGeometry args={[0.95, 0.22, 0.95]} />
        <meshStandardMaterial color={leather} emissive={emissive} emissiveIntensity={0.15} roughness={0.55} metalness={0.05} />
      </mesh>
      {/* back — taller wingback silhouette */}
      <mesh castShadow position={[0, 1.25, -0.42]}>
        <boxGeometry args={[0.95, 1.4, 0.18]} />
        <meshStandardMaterial color={leather} roughness={0.55} metalness={0.05} />
      </mesh>
      {/* rolled arms */}
      <mesh castShadow position={[0.44, 0.82, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.95, 20]} />
        <meshStandardMaterial color={leather} roughness={0.55} />
      </mesh>
      <mesh castShadow position={[-0.44, 0.82, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.95, 20]} />
        <meshStandardMaterial color={leather} roughness={0.55} />
      </mesh>
      {/* brass legs */}
      {[[0.35, 0.15, 0.35],[ -0.35,0.15, 0.35],[0.35,0.15,-0.35],[-0.35,0.15,-0.35]].map((p, i) => (
        <mesh key={i} position={p as [number,number,number]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.5, 12]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} />
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
            <meshStandardMaterial color="#1a1410" roughness={0.6} />
          </mesh>
          <Html position={[0, 0.55, 0]} center distanceFactor={8}>
            <div className="px-2 py-1 rounded-full bg-[#1a0f08]/80 backdrop-blur text-[10px] tracking-wide text-amber-100 border border-amber-500/40 whitespace-nowrap">
              {seat.occupant?.name}
            </div>
          </Html>
        </group>
      )}

      {/* Seat number label */}
      {!occupied && (
        <Html position={[0, 1.5, 0]} center distanceFactor={10}>
          <div className="px-2 py-1 rounded-md bg-amber-100/10 border border-amber-300/40 text-amber-100 text-[10px] uppercase tracking-widest">
            Seat {seat.index + 1}
          </div>
        </Html>
      )}
    </group>
  );
}

function Room() {
  return (
    <group>
      {/* warm ivory walls */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[9, 9, 6.5, 96, 1, true]} />
        <meshStandardMaterial
          color="#c9a878"
          emissive="#3a2410"
          emissiveIntensity={0.12}
          side={THREE.BackSide}
          roughness={0.85}
        />
      </mesh>
      {/* dark wood wainscoting */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[8.98, 8.98, 1.8, 96, 1, true]} />
        <meshStandardMaterial color="#2a1810" side={THREE.BackSide} roughness={0.7} metalness={0.1} />
      </mesh>
      {/* ceiling */}
      <mesh position={[0, 6.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[9, 96]} />
        <meshStandardMaterial color="#1a1008" side={THREE.BackSide} roughness={0.9} />
      </mesh>
      {/* Chandelier */}
      <mesh position={[0, 5.4, 0]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color="#ffd88a" emissive="#ffb060" emissiveIntensity={2.5} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.55, 5.25, Math.sin(a) * 0.55]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#ffd88a" emissive="#ffb060" emissiveIntensity={2} />
          </mesh>
        );
      })}
      <pointLight position={[0, 5, 0]} intensity={3} distance={14} color="#ffc98a" />

      {/* Fireplace-like warm rim lights around the room */}
      <pointLight position={[6, 1.6, 4]} intensity={0.9} distance={10} color="#ff8a3a" />
      <pointLight position={[-6, 1.6, -4]} intensity={0.9} distance={10} color="#ff8a3a" />
      <pointLight position={[-5, 1.6, 5]} intensity={0.7} distance={9} color="#ffb060" />
      <pointLight position={[5, 1.6, -5]} intensity={0.7} distance={9} color="#ffb060" />
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
      <color attach="background" args={["#1a0e07"]} />
      <fog attach="fog" args={["#2a1810", 9, 22]} />
      <ambientLight intensity={0.45} color="#ffd8a8" />
      <hemisphereLight args={["#ffd8a8", "#3a1f10", 0.4]} />
      <Environment preset="apartment" />
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
