import { useState, useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Download, Sparkles, Camera, Loader2, User, Shirt, Gem } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DollIllustration } from "./DollIllustration";

// Color palettes — [hex, human-readable name for the AI render]
const SKIN_COLORS: [string, string][] = [
  ["#F7D9C4", "fair porcelain"],
  ["#EFC094", "light warm"],
  ["#D69F72", "golden tan"],
  ["#A9714B", "deep bronze"],
  ["#7A4A28", "rich brown"],
  ["#4A2B18", "deep ebony"],
];
const HAIR_COLORS: [string, string][] = [
  ["#2B1B12", "jet black"],
  ["#6B3E1E", "chestnut brown"],
  ["#E4C071", "golden blonde"],
  ["#F5A7C4", "pastel pink"],
  ["#D8D8DE", "platinum silver"],
  ["#B4441F", "copper red"],
  ["#6B3FA0", "violet"],
  ["#2F6FB5", "sapphire blue"],
];
const DRESS_COLORS: [string, string][] = [
  ["#FF69B4", "hot pink"],
  ["#E5175F", "crimson rose"],
  ["#B762D6", "orchid purple"],
  ["#2E5FD1", "royal blue"],
  ["#12A594", "emerald teal"],
  ["#E9C46A", "champagne gold"],
  ["#F5F3EE", "ivory white"],
  ["#1B1B22", "midnight black"],
];
const SHOE_COLORS: [string, string][] = [
  ["#FF69B4", "pink"],
  ["#E5175F", "red"],
  ["#E9C46A", "gold"],
  ["#D8D8DE", "silver"],
  ["#1B1B22", "black"],
  ["#F5F3EE", "nude ivory"],
];

const HAIR_STYLES = ["Long", "Short", "Ponytail", "Bun", "Pigtails", "Curly"];
const DRESS_STYLES = ["Ball Gown", "Mini Dress", "Mermaid", "A-Line", "Jumpsuit"];
const ACCESSORIES = ["None", "Tiara", "Necklace", "Sunglasses", "Handbag"];
const SCENES = ["Studio", "Runway", "Ballroom", "Garden", "City"];

interface BarbieConfig {
  skinColor: string;
  hairColor: string;
  hairStyle: string;
  dressColor: string;
  dressStyle: string;
  shoeColor: string;
  accessory: string;
}

const nameOf = (list: [string, string][], hex: string) =>
  list.find(([h]) => h === hex)?.[1] ?? "custom";

/** Smooth silhouette helper — builds a lathe profile from [radius, height] pairs. */
function latheProfile(points: [number, number][], segments = 48) {
  const pts = points.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.001), y));
  return new THREE.LatheGeometry(pts, segments);
}

function Doll({ config, isSpinning }: { config: BarbieConfig; isSpinning: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const animRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (isSpinning) groupRef.current.rotation.y += delta * 1.1;
    animRef.current += delta;
    groupRef.current.position.y = -1.5 + Math.sin(animRef.current * 1.2) * 0.02;
  });

  const skin = config.skinColor;
  const hair = config.hairColor;
  const dress = config.dressColor;
  const shoe = config.shoeColor;

  const headGeo = useMemo(
    () =>
      latheProfile([
        [0.005, 0.30], [0.10, 0.29], [0.175, 0.245], [0.21, 0.17], [0.222, 0.08],
        [0.212, -0.01], [0.19, -0.10], [0.15, -0.18], [0.095, -0.24], [0.005, -0.27],
      ]),
    []
  );

  const torsoGeo = useMemo(
    () =>
      latheProfile([
        [0.075, 0.42], [0.10, 0.36], [0.155, 0.26], [0.175, 0.16], [0.155, 0.06],
        [0.125, -0.04], [0.118, -0.14], [0.135, -0.24], [0.165, -0.34], [0.15, -0.42],
      ]),
    []
  );

  const skirtGeo = useMemo(() => {
    switch (config.dressStyle) {
      case "Ball Gown":
        return latheProfile([
          [0.16, 0.55], [0.22, 0.35], [0.34, 0.1], [0.5, -0.2], [0.62, -0.45],
          [0.66, -0.6], [0.6, -0.62], [0.18, -0.6], [0.005, -0.58],
        ]);
      case "Mini Dress":
        return latheProfile([
          [0.16, 0.35], [0.185, 0.2], [0.21, 0.05], [0.235, -0.1], [0.22, -0.14], [0.005, -0.13],
        ]);
      case "Mermaid":
        return latheProfile([
          [0.16, 0.6], [0.185, 0.35], [0.175, 0.05], [0.19, -0.2], [0.28, -0.5],
          [0.42, -0.68], [0.36, -0.72], [0.005, -0.7],
        ]);
      case "Jumpsuit":
        return latheProfile([
          [0.16, 0.5], [0.18, 0.25], [0.185, 0.0], [0.2, -0.3], [0.21, -0.6], [0.19, -0.64], [0.005, -0.62],
        ]);
      default: // A-Line
        return latheProfile([
          [0.16, 0.5], [0.2, 0.25], [0.28, -0.05], [0.38, -0.35], [0.44, -0.52],
          [0.4, -0.55], [0.005, -0.53],
        ]);
    }
  }, [config.dressStyle]);

  const skirtY = config.dressStyle === "Mini Dress" ? 1.2 : 1.05;
  const legsVisible = config.dressStyle !== "Jumpsuit";

  const skinMat = (
    <meshPhysicalMaterial color={skin} roughness={0.42} clearcoat={0.35} clearcoatRoughness={0.5} sheen={0.4} sheenColor="#ffd9cf" />
  );
  const hairMat = <meshPhysicalMaterial color={hair} roughness={0.28} clearcoat={0.7} clearcoatRoughness={0.25} sheen={0.6} sheenColor="#ffffff" />;
  const fabricMat = <meshPhysicalMaterial color={dress} roughness={0.45} sheen={1} sheenColor="#ffffff" clearcoat={0.15} />;

  const strands = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return { a, r: 0.2 + (i % 3) * 0.012, len: 0.55 + ((i * 37) % 20) / 100 };
      }),
    []
  );

  const renderHair = () => {
    const cap = (
      <mesh geometry={headGeo} position={[0, 2.45, 0]} scale={[1.09, 1.06, 1.09]}>
        {hairMat}
      </mesh>
    );
    switch (config.hairStyle) {
      case "Short":
        return cap;
      case "Ponytail":
        return (
          <>
            {cap}
            <mesh position={[0, 2.62, -0.24]} rotation={[-0.45, 0, 0]}>
              <capsuleGeometry args={[0.075, 0.6, 6, 16]} />
              {hairMat}
            </mesh>
          </>
        );
      case "Bun":
        return (
          <>
            {cap}
            <mesh position={[0, 2.82, -0.13]}>
              <sphereGeometry args={[0.15, 32, 32]} />
              {hairMat}
            </mesh>
          </>
        );
      case "Pigtails":
        return (
          <>
            {cap}
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.26, 2.42, -0.05]} rotation={[0, 0, -s * 0.35]}>
                <capsuleGeometry args={[0.062, 0.45, 6, 16]} />
                {hairMat}
              </mesh>
            ))}
          </>
        );
      case "Curly":
        return (
          <>
            {cap}
            {strands.map(({ a }, i) => (
              <mesh
                key={i}
                position={[Math.cos(a) * 0.23, 2.34 - (i % 4) * 0.07, Math.sin(a) * 0.23 - 0.02]}
              >
                <sphereGeometry args={[0.085, 20, 20]} />
                {hairMat}
              </mesh>
            ))}
          </>
        );
      default: // Long
        return (
          <>
            {cap}
            <mesh position={[0, 2.13, -0.09]} scale={[1, 1, 0.55]}>
              <capsuleGeometry args={[0.185, 0.42, 10, 28]} />
              {hairMat}
            </mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.2, 2.26, -0.04]} rotation={[0, 0, s * 0.05]}>
                <capsuleGeometry args={[0.045, 0.3, 8, 20]} />
                {hairMat}
              </mesh>
            ))}
          </>
        );
    }
  };

  const renderAccessory = () => {
    switch (config.accessory) {
      case "Tiara":
        return (
          <mesh position={[0, 2.63, 0.02]} rotation={[0.3, 0, 0]}>
            <torusGeometry args={[0.165, 0.016, 16, 48, Math.PI * 1.05]} />
            <meshPhysicalMaterial color="#F3D27A" metalness={1} roughness={0.12} />
          </mesh>
        );
      case "Necklace":
        return (
          <mesh position={[0, 2.06, 0.06]} rotation={[Math.PI / 2.2, 0, 0]}>
            <torusGeometry args={[0.115, 0.014, 12, 40]} />
            <meshPhysicalMaterial color="#F3D27A" metalness={1} roughness={0.1} />
          </mesh>
        );
      case "Sunglasses":
        return (
          <group position={[0, 2.48, 0.185]}>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.075, 0, 0]} rotation={[0, s * 0.25, 0]}>
                <sphereGeometry args={[0.055, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshPhysicalMaterial color="#15151b" roughness={0.05} metalness={0.4} clearcoat={1} />
              </mesh>
            ))}
          </group>
        );
      case "Handbag":
        return (
          <group position={[0.34, 1.28, 0.08]} rotation={[0, 0, 0.12]}>
            <mesh>
              <boxGeometry args={[0.17, 0.13, 0.06]} />
              <meshPhysicalMaterial color={dress} roughness={0.3} clearcoat={0.8} />
            </mesh>
            <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.055, 0.01, 10, 28, Math.PI]} />
              <meshPhysicalMaterial color="#F3D27A" metalness={1} roughness={0.15} />
            </mesh>
          </group>
        );
      default:
        return null;
    }
  };

  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      <mesh geometry={headGeo} position={[0, 2.45, 0]} castShadow>
        {skinMat}
      </mesh>

      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.077, 2.47, 0.163]}>
          <mesh scale={[1.25, 0.85, 0.7]}>
            <sphereGeometry args={[0.036, 24, 24]} />
            <meshPhysicalMaterial color="#fdfdfd" roughness={0.08} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0, 0.022]}>
            <sphereGeometry args={[0.019, 20, 20]} />
            <meshPhysicalMaterial color="#3E6FB0" roughness={0.05} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0, 0.033]}>
            <sphereGeometry args={[0.008, 16, 16]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh position={[0, 0.03, 0.02]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.036, 0.005, 8, 24, Math.PI]} />
            <meshStandardMaterial color="#2b1b12" />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 2.4, 0.19]} scale={[0.7, 1, 0.8]}>
        <sphereGeometry args={[0.022, 16, 16]} />
        {skinMat}
      </mesh>

      <group position={[0, 2.33, 0.175]}>
        <mesh scale={[1.6, 0.55, 0.5]} position={[0, 0.012, 0]}>
          <sphereGeometry args={[0.034, 24, 24]} />
          <meshPhysicalMaterial color="#D6486F" roughness={0.18} clearcoat={1} />
        </mesh>
        <mesh scale={[1.4, 0.6, 0.5]} position={[0, -0.016, 0]}>
          <sphereGeometry args={[0.034, 24, 24]} />
          <meshPhysicalMaterial color="#C93E64" roughness={0.18} clearcoat={1} />
        </mesh>
      </group>

      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.077, 2.535, 0.165]} rotation={[0, 0, s * -0.12]} scale={[1.5, 0.35, 0.4]}>
          <sphereGeometry args={[0.026, 16, 16]} />
          <meshStandardMaterial color={hair} roughness={0.7} />
        </mesh>
      ))}

      {renderHair()}

      <mesh position={[0, 2.12, 0]}>
        <capsuleGeometry args={[0.055, 0.12, 8, 24]} />
        {skinMat}
      </mesh>

      <mesh geometry={torsoGeo} position={[0, 1.66, 0]} castShadow>
        {fabricMat}
      </mesh>

      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.16, 2.02, 0]}>
            <sphereGeometry args={[0.058, 24, 24]} />
            {skinMat}
          </mesh>
          <mesh position={[s * 0.22, 1.79, 0.01]} rotation={[0, 0, s * 0.2]}>
            <capsuleGeometry args={[0.042, 0.34, 8, 20]} />
            {skinMat}
          </mesh>
          <mesh position={[s * 0.28, 1.45, 0.03]} rotation={[0, 0, s * 0.12]}>
            <capsuleGeometry args={[0.034, 0.32, 8, 20]} />
            {skinMat}
          </mesh>
          <mesh position={[s * 0.31, 1.26, 0.04]} scale={[0.8, 1.3, 0.5]}>
            <sphereGeometry args={[0.045, 20, 20]} />
            {skinMat}
          </mesh>
        </group>
      ))}

      <mesh geometry={skirtGeo} position={[0, skirtY, 0]} castShadow>
        {fabricMat}
      </mesh>

      {legsVisible &&
        [-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[s * 0.085, 0.72, 0]}>
              <capsuleGeometry args={[0.058, 0.36, 8, 20]} />
              {skinMat}
            </mesh>
            <mesh position={[s * 0.085, 0.3, 0.005]}>
              <capsuleGeometry args={[0.042, 0.4, 8, 20]} />
              {skinMat}
            </mesh>
          </group>
        ))}

      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.085, -0.02, 0.03]}>
          <mesh position={[0, 0, 0.045]} rotation={[0.35, 0, 0]} scale={[0.9, 0.5, 1.5]}>
            <sphereGeometry args={[0.055, 20, 20]} />
            <meshPhysicalMaterial color={shoe} roughness={0.15} metalness={0.3} clearcoat={1} />
          </mesh>
          <mesh position={[0, -0.06, -0.045]}>
            <cylinderGeometry args={[0.012, 0.016, 0.12, 12]} />
            <meshPhysicalMaterial color={shoe} roughness={0.15} metalness={0.4} clearcoat={1} />
          </mesh>
        </group>
      ))}

      {renderAccessory()}
    </group>
  );
}

function Podium() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.63, 0]} receiveShadow>
      <circleGeometry args={[1.6, 64]} />
      <meshPhysicalMaterial color="#F6DCE6" roughness={0.25} metalness={0.1} clearcoat={0.8} />
    </mesh>
  );
}

function SparkleParticles() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 60;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 4;
      arr[i * 3 + 1] = Math.random() * 4 - 1.2;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.18;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#FFD9A0" transparent opacity={0.55} />
    </points>
  );
}

const defaultConfig: BarbieConfig = {
  skinColor: SKIN_COLORS[0][0],
  hairColor: HAIR_COLORS[3][0],
  hairStyle: "Long",
  dressColor: DRESS_COLORS[0][0],
  dressStyle: "Ball Gown",
  shoeColor: SHOE_COLORS[0][0],
  accessory: "Tiara",
};

type Step = "look" | "dress" | "accessories";

interface ColorSwatchProps {
  label: string;
  colors: [string, string][];
  selected: string;
  onSelect: (c: string) => void;
}

function ColorSwatch({ label, colors, selected, onSelect }: ColorSwatchProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wider text-pink-600/80">{label}</p>
      <div className="grid grid-cols-6 gap-2">
        {colors.map(([hex, name]) => (
          <button
            key={hex}
            title={name}
            aria-label={name}
            onClick={() => onSelect(hex)}
            className={cn(
              "aspect-square rounded-xl border-2 transition-all hover:scale-105",
              selected === hex
                ? "border-pink-500 ring-2 ring-pink-300 scale-105"
                : "border-white/60 shadow-sm"
            )}
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>
    </div>
  );
}

interface StyleCardProps {
  options: string[];
  selected: string;
  onSelect: (s: string) => void;
  emoji?: (s: string) => string;
}

function StyleCard({ options, selected, onSelect, emoji }: StyleCardProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onSelect(o)}
          className={cn(
            "relative flex flex-col items-center justify-center gap-1 rounded-2xl border-2 p-3 text-xs font-semibold transition-all hover:scale-[1.02]",
            selected === o
              ? "border-pink-500 bg-gradient-to-br from-pink-50 to-fuchsia-50 text-pink-700 shadow-md"
              : "border-pink-200/60 bg-white/70 text-foreground hover:border-pink-300"
          )}
        >
          <span className="text-lg">{emoji ? emoji(o) : "✨"}</span>
          <span className="text-center leading-tight">{o}</span>
          {selected === o && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] text-white">
              ✓
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

const hairEmoji = (s: string) =>
  ({ Long: "💇", Short: "💇‍♀️", Ponytail: "🎀", Bun: "🍥", Pigtails: "👧", Curly: "🌀" }[s] ?? "✨");

const dressEmoji = (s: string) =>
  ({ "Ball Gown": "👗", "Mini Dress": "🎽", Mermaid: "🧜", "A-Line": "👘", Jumpsuit: "🩱" }[s] ?? "✨");

const accessoryEmoji = (s: string) =>
  ({ None: "🚫", Tiara: "👑", Necklace: "📿", Sunglasses: "🕶️", Handbag: "👜" }[s] ?? "✨");

const sceneEmoji = (s: string) =>
  ({ Studio: "📸", Runway: "🪩", Ballroom: "🏰", Garden: "🌸", City: "🌃" }[s] ?? "✨");

export function BarbieCreator3D({ onBack }: { onBack: () => void }) {
  const [config, setConfig] = useState<BarbieConfig>(defaultConfig);
  const [isSpinning, setIsSpinning] = useState(false);
  const [scene, setScene] = useState("Studio");
  const [rendering, setRendering] = useState(false);
  const [renderUrl, setRenderUrl] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("look");

  const update = (key: keyof BarbieConfig, value: string) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const renderRealistic = async () => {
    setRendering(true);
    try {
      const { data, error } = await supabase.functions.invoke("glamour-doll-render", {
        body: {
          skinTone: nameOf(SKIN_COLORS, config.skinColor),
          hairColor: nameOf(HAIR_COLORS, config.hairColor),
          hairStyle: config.hairStyle,
          dressColor: nameOf(DRESS_COLORS, config.dressColor),
          dressStyle: config.dressStyle,
          shoeColor: nameOf(SHOE_COLORS, config.shoeColor),
          accessory: config.accessory,
          scene,
        },
      });

      if (error) {
        const ctx = (error as { context?: Response }).context;
        let msg = error.message;
        let status: number | undefined;
        if (ctx && typeof ctx.json === "function") {
          status = ctx.status;
          try {
            const payload = await ctx.clone().json();
            msg = payload?.message || payload?.error || msg;
          } catch { /* keep generic */ }
        }
        if (status === 402) throw new Error(msg || "You need 3 AI credits for a realistic render.");
        if (status === 429) throw new Error("AI is busy right now — try again in a few seconds.");
        throw new Error(msg || "Render failed");
      }
      if (data?.error) throw new Error(data.error);
      if (!data?.imageUrl) throw new Error("No image returned");

      setRenderUrl(data.imageUrl);
      window.dispatchEvent(new Event("ai-credits-updated"));
      toast.success("Realistic doll photo ready! ✨");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Render failed");
    } finally {
      setRendering(false);
    }
  };

  const downloadRender = () => {
    if (!renderUrl) return;
    const a = document.createElement("a");
    a.href = renderUrl;
    a.download = `my-doll-${Date.now()}.png`;
    a.click();
  };

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: "look", label: "Choose Look", icon: <User className="h-4 w-4" /> },
    { key: "dress", label: "Dress Up", icon: <Shirt className="h-4 w-4" /> },
    { key: "accessories", label: "Accessorize", icon: <Gem className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-4">
      <FloatingHowItWorks
        title="3D Doll Creator — How it works"
        steps={[
          { title: "Choose Look", desc: "Pick skin tone, hair color and hairstyle for your doll." },
          { title: "Dress Up", desc: "Select a dress style, color and matching shoes." },
          { title: "Accessorize", desc: "Add a tiara, necklace or bag and choose a photo scene." },
          { title: "Render", desc: "Tap Realistic Photo (3 AI credits) to create a fashion shot." },
        ]}
      />

      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <div className="rounded-3xl border border-pink-300/30 bg-gradient-to-br from-pink-50/80 via-white/90 to-fuchsia-50/80 p-4 shadow-xl backdrop-blur-sm dark:from-pink-950/30 dark:to-fuchsia-950/30">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-pink-700">👸 My Doll</h2>
            <p className="text-sm text-pink-600/70">Design your dream fashion doll step by step</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setConfig(defaultConfig); setRenderUrl(null); }}
            className="border-pink-300/50"
          >
            <RotateCcw className="h-3 w-3 mr-1" /> Reset
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left: 3D preview */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border-4 border-white/60 bg-gradient-to-b from-pink-100 to-purple-100 shadow-inner dark:from-pink-950/30 dark:to-purple-950/30 h-[420px] lg:h-[560px]">
              {renderUrl ? (
                <>
                  <img src={renderUrl} alt="Photorealistic render of your custom doll" className="h-full w-full object-contain" />
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                    <Button size="sm" className="flex-1 bg-pink-500 hover:bg-pink-600" onClick={downloadRender}>
                      <Download className="h-3 w-3 mr-1" /> Download
                    </Button>
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => setRenderUrl(null)}>
                      Back to sketch
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center p-4">
                  <DollIllustration look={config} />
                </div>
              )}

              {rendering && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 backdrop-blur-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                  <p className="text-sm font-semibold">Rendering your realistic doll…</p>
                </div>
              )}
            </div>

            <div className="mt-3 flex gap-2">

              <Button
                size="sm"
                onClick={renderRealistic}
                disabled={rendering}
                className="flex-[2] bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white font-bold"
              >
                {rendering ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
                Realistic Photo · 3 credits
              </Button>
            </div>
          </div>

          {/* Right: step tabs + options */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-pink-300/30 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:bg-black/20">
              {/* Step tabs */}
              <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-pink-100/50 p-1.5 dark:bg-pink-950/20">
                {steps.map((s, idx) => (
                  <button
                    key={s.key}
                    onClick={() => setStep(s.key)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-xs font-bold transition-all sm:text-sm",
                      step === s.key
                        ? "bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-md"
                        : "text-pink-700/70 hover:bg-pink-200/40 dark:text-pink-300/70"
                    )}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{s.icon}</span>
                  </button>
                ))}
              </div>

              {/* Step content */}
              <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1 lg:max-h-[480px]">
                {step === "look" && (
                  <>
                    <ColorSwatch
                      label="Skin Tone"
                      colors={SKIN_COLORS}
                      selected={config.skinColor}
                      onSelect={(c) => update("skinColor", c)}
                    />
                    <ColorSwatch
                      label="Hair Color"
                      colors={HAIR_COLORS}
                      selected={config.hairColor}
                      onSelect={(c) => update("hairColor", c)}
                    />
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-pink-600/80">Hair Style</p>
                      <StyleCard
                        options={HAIR_STYLES}
                        selected={config.hairStyle}
                        onSelect={(s) => update("hairStyle", s)}
                        emoji={hairEmoji}
                      />
                    </div>
                  </>
                )}

                {step === "dress" && (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-pink-600/80">Dress Style</p>
                      <StyleCard
                        options={DRESS_STYLES}
                        selected={config.dressStyle}
                        onSelect={(s) => update("dressStyle", s)}
                        emoji={dressEmoji}
                      />
                    </div>
                    <ColorSwatch
                      label="Dress Color"
                      colors={DRESS_COLORS}
                      selected={config.dressColor}
                      onSelect={(c) => update("dressColor", c)}
                    />
                    <ColorSwatch
                      label="Shoe Color"
                      colors={SHOE_COLORS}
                      selected={config.shoeColor}
                      onSelect={(c) => update("shoeColor", c)}
                    />
                  </>
                )}

                {step === "accessories" && (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-pink-600/80">Accessory</p>
                      <StyleCard
                        options={ACCESSORIES}
                        selected={config.accessory}
                        onSelect={(s) => update("accessory", s)}
                        emoji={accessoryEmoji}
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-pink-600/80">Photo Scene</p>
                      <StyleCard
                        options={SCENES}
                        selected={scene}
                        onSelect={setScene}
                        emoji={sceneEmoji}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Navigation */}
              <div className="mt-5 flex items-center justify-between border-t border-pink-200/50 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={step === "look"}
                  onClick={() => setStep((prev) => (prev === "dress" ? "look" : "dress"))}
                  className="text-pink-700"
                >
                  ← Back
                </Button>
                <Button
                  size="sm"
                  disabled={step === "accessories"}
                  onClick={() => setStep((prev) => (prev === "look" ? "dress" : "accessories"))}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  Next Step →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
