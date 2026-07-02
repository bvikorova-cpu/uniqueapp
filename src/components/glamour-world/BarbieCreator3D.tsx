import { useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Download, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

// Color palettes
const SKIN_COLORS = ["#FFDCB5", "#E8B88A", "#C68642", "#8D5524", "#F5D0A9", "#4A2511"];
const HAIR_COLORS = ["#2C1608", "#8B4513", "#FFD700", "#FF69B4", "#C0C0C0", "#FF4500", "#800080", "#1E90FF"];
const DRESS_COLORS = ["#FF69B4", "#FF1493", "#DA70D6", "#BA55D3", "#FF6347", "#00CED1", "#FFD700", "#98FB98"];
const SHOE_COLORS = ["#FF69B4", "#FF1493", "#FFD700", "#C0C0C0", "#000000", "#FF4500"];

const HAIR_STYLES = ["Long", "Short", "Ponytail", "Bun", "Pigtails", "Curly"];
const DRESS_STYLES = ["Ball Gown", "Mini Dress", "Mermaid", "A-Line", "Jumpsuit"];
const ACCESSORIES = ["None", "Tiara", "Necklace", "Sunglasses", "Handbag"];

interface BarbieConfig {
  skinColor: string;
  hairColor: string;
  hairStyle: string;
  dressColor: string;
  dressStyle: string;
  shoeColor: string;
  accessory: string;
}

function BarbieDoll({ config, isSpinning }: { config: BarbieConfig; isSpinning: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const animRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (isSpinning) {
      groupRef.current.rotation.y += delta * 1.5;
    }
    animRef.current += delta;
    groupRef.current.position.y = Math.sin(animRef.current * 1.5) * 0.05;
  });

  const skin = new THREE.Color(config.skinColor);
  const hair = new THREE.Color(config.hairColor);
  const dress = new THREE.Color(config.dressColor);
  const shoe = new THREE.Color(config.shoeColor);

  const getDressGeometry = () => {
    switch (config.dressStyle) {
      case "Ball Gown":
        return <coneGeometry args={[0.7, 1.4, 16]} />;
      case "Mini Dress":
        return <cylinderGeometry args={[0.3, 0.35, 0.8, 16]} />;
      case "Mermaid":
        return <coneGeometry args={[0.5, 1.6, 16]} />;
      case "Jumpsuit":
        return <cylinderGeometry args={[0.28, 0.3, 1.2, 16]} />;
      default:
        return <coneGeometry args={[0.55, 1.2, 16]} />;
    }
  };

  const getHairGeometry = () => {
    switch (config.hairStyle) {
      case "Long":
        return (
    <>
      <FloatingHowItWorks title={"Barbie Creator3 D - How it works"} steps={[{ title: 'Open', desc: 'Access the Barbie Creator3 D section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Barbie Creator3 D.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <>
            <mesh position={[0, 2.65, 0]}>
              <sphereGeometry args={[0.38, 16, 16]} />
              <meshStandardMaterial color={hair} roughness={0.4} />
            </mesh>
            <mesh position={[0, 2.2, -0.15]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.6, 1.0, 0.2]} />
              <meshStandardMaterial color={hair} roughness={0.4} />
            </mesh>
          </>
    </>
  );
      case "Short":
        return (
          <mesh position={[0, 2.65, 0]}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color={hair} roughness={0.4} />
          </mesh>
        );
      case "Ponytail":
        return (
          <>
            <mesh position={[0, 2.65, 0]}>
              <sphereGeometry args={[0.38, 16, 16]} />
              <meshStandardMaterial color={hair} roughness={0.4} />
            </mesh>
            <mesh position={[0, 2.9, -0.3]} rotation={[-0.5, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.12, 0.8, 8]} />
              <meshStandardMaterial color={hair} roughness={0.4} />
            </mesh>
          </>
        );
      case "Bun":
        return (
          <>
            <mesh position={[0, 2.65, 0]}>
              <sphereGeometry args={[0.38, 16, 16]} />
              <meshStandardMaterial color={hair} roughness={0.4} />
            </mesh>
            <mesh position={[0, 3.05, -0.1]}>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshStandardMaterial color={hair} roughness={0.4} />
            </mesh>
          </>
        );
      case "Pigtails":
        return (
          <>
            <mesh position={[0, 2.65, 0]}>
              <sphereGeometry args={[0.38, 16, 16]} />
              <meshStandardMaterial color={hair} roughness={0.4} />
            </mesh>
            <mesh position={[-0.35, 2.6, 0]} rotation={[0, 0, 0.3]}>
              <cylinderGeometry args={[0.06, 0.08, 0.6, 8]} />
              <meshStandardMaterial color={hair} roughness={0.4} />
            </mesh>
            <mesh position={[0.35, 2.6, 0]} rotation={[0, 0, -0.3]}>
              <cylinderGeometry args={[0.06, 0.08, 0.6, 8]} />
              <meshStandardMaterial color={hair} roughness={0.4} />
            </mesh>
          </>
        );
      case "Curly":
        return (
          <>
            <mesh position={[0, 2.65, 0]}>
              <sphereGeometry args={[0.42, 16, 16]} />
              <meshStandardMaterial color={hair} roughness={0.6} />
            </mesh>
            {[...Array(8)].map((_, i) => (
              <mesh key={i} position={[
                Math.cos(i * Math.PI / 4) * 0.35,
                2.4 + Math.random() * 0.3,
                Math.sin(i * Math.PI / 4) * 0.35
              ]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial color={hair} roughness={0.6} />
              </mesh>
            ))}
          </>
        );
      default:
        return null;
    }
  };

  const getAccessory = () => {
    switch (config.accessory) {
      case "Tiara":
        return (
          <mesh position={[0, 3.0, 0.1]}>
            <torusGeometry args={[0.2, 0.03, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
          </mesh>
        );
      case "Necklace":
        return (
          <mesh position={[0, 2.0, 0.2]}>
            <torusGeometry args={[0.18, 0.02, 8, 16]} />
            <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
          </mesh>
        );
      case "Sunglasses":
        return (
          <group position={[0, 2.5, 0.32]}>
            <mesh position={[-0.12, 0, 0]}>
              <boxGeometry args={[0.14, 0.08, 0.02]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0.12, 0, 0]}>
              <boxGeometry args={[0.14, 0.08, 0.02]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.04, 0.02, 0.02]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          </group>
        );
      case "Handbag":
        return (
          <group position={[0.5, 1.3, 0]}>
            <mesh>
              <boxGeometry args={[0.2, 0.15, 0.08]} />
              <meshStandardMaterial color="#FF69B4" metalness={0.3} />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
              <torusGeometry args={[0.08, 0.015, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        );
      default:
        return null;
    }
  };

  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      {/* Head */}
      <mesh position={[0, 2.45, 0]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.1, 2.5, 0.28]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#4169E1" />
      </mesh>
      <mesh position={[0.1, 2.5, 0.28]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#4169E1" />
      </mesh>

      {/* Lips */}
      <mesh position={[0, 2.35, 0.28]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#FF6B8A" />
      </mesh>

      {/* Hair */}
      {getHairGeometry()}

      {/* Neck */}
      <mesh position={[0, 2.05, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.2, 8]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 1.75, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.5, 12]} />
        <meshStandardMaterial color={dress} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.35, 1.7, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.05, 0.06, 0.6, 8]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>
      <mesh position={[0.35, 1.7, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.05, 0.06, 0.6, 8]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>

      {/* Dress/Bottom */}
      <mesh position={[0, 0.95, 0]}>
        {getDressGeometry()}
        <meshStandardMaterial color={dress} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.12, 0.15, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.6, 8]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>
      <mesh position={[0.12, 0.15, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.6, 8]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>

      {/* Shoes */}
      <mesh position={[-0.12, -0.12, 0.05]}>
        <boxGeometry args={[0.1, 0.08, 0.18]} />
        <meshStandardMaterial color={shoe} metalness={0.3} roughness={0.3} />
      </mesh>
      <mesh position={[0.12, -0.12, 0.05]}>
        <boxGeometry args={[0.1, 0.08, 0.18]} />
        <meshStandardMaterial color={shoe} metalness={0.3} roughness={0.3} />
      </mesh>

      {/* Accessory */}
      {getAccessory()}
    </group>
  );
}

function PinkFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.65, 0]} receiveShadow>
      <circleGeometry args={[3, 32]} />
      <meshStandardMaterial color="#FFB6C1" roughness={0.8} />
    </mesh>
  );
}

function SparkleParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 50;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 4;
    positions[i * 3 + 1] = Math.random() * 4 - 1;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
  }

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#FFD700" transparent opacity={0.6} />
    </points>
  );
}

interface ColorPickerProps {
  label: string;
  colors: string[];
  selected: string;
  onSelect: (c: string) => void;
}

function ColorPicker({ label, colors, selected, onSelect }: ColorPickerProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
      <div className="flex gap-1 flex-wrap">
        {colors.map(c => (
          <button
            key={c}
            onClick={() => onSelect(c)}
            className={`w-7 h-7 rounded-full border-2 transition-transform ${selected === c ? "border-pink-500 scale-110" : "border-transparent"}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
}

interface StylePickerProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (s: string) => void;
}

function StylePicker({ label, options, selected, onSelect }: StylePickerProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
      <div className="flex gap-1 flex-wrap">
        {options.map(o => (
          <button
            key={o}
            onClick={() => onSelect(o)}
            className={`px-2 py-1 text-xs rounded-full border transition-all ${selected === o ? "bg-pink-500 text-white border-pink-500" : "bg-card border-border text-foreground"}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

const defaultConfig: BarbieConfig = {
  skinColor: SKIN_COLORS[0],
  hairColor: HAIR_COLORS[3],
  hairStyle: "Long",
  dressColor: DRESS_COLORS[0],
  dressStyle: "Ball Gown",
  shoeColor: SHOE_COLORS[0],
  accessory: "Tiara",
};

export function BarbieCreator3D({ onBack }: { onBack: () => void }) {
  const [config, setConfig] = useState<BarbieConfig>(defaultConfig);
  const [isSpinning, setIsSpinning] = useState(false);

  const update = (key: keyof BarbieConfig, value: string) =>
    setConfig(prev => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>
      <h2 className="text-2xl font-black">👸 3D Doll Creator</h2>
      <p className="text-muted-foreground text-sm">Design your perfect doll in 3D! Drag to rotate the view.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 3D Canvas */}
        <div className="bg-gradient-to-b from-pink-100 to-purple-100 dark:from-pink-950/30 dark:to-purple-950/30 rounded-2xl overflow-hidden h-[400px] lg:h-[500px] border border-pink-300/30">
          <Canvas camera={{ position: [0, 0.5, 4], fov: 45 }} shadows>
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 5, 3]} intensity={1} castShadow />
            <pointLight position={[-3, 3, -3]} intensity={0.4} color="#FF69B4" />
            <Suspense fallback={null}>
              <BarbieDoll config={config} isSpinning={isSpinning} />
              <PinkFloor />
              <SparkleParticles />
              <Environment preset="studio" />
            </Suspense>
            <OrbitControls
              enablePan={false}
              minDistance={2.5}
              maxDistance={6}
              minPolarAngle={0.3}
              maxPolarAngle={Math.PI / 2}
            />
          </Canvas>
        </div>

        {/* Controls */}
        <div className="space-y-3 bg-card/50 backdrop-blur-sm border border-pink-400/20 rounded-2xl p-4 overflow-y-auto max-h-[500px]">
          <div className="flex gap-2 mb-2">
            <Button
              size="sm"
              variant={isSpinning ? "default" : "outline"}
              onClick={() => setIsSpinning(!isSpinning)}
              className={isSpinning ? "bg-pink-500 hover:bg-pink-600" : ""}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {isSpinning ? "Stop Spin" : "Auto Spin"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setConfig(defaultConfig)}>
              <RotateCcw className="h-3 w-3 mr-1" /> Reset
            </Button>
          </div>

          <ColorPicker label="👩 Skin Tone" colors={SKIN_COLORS} selected={config.skinColor} onSelect={c => update("skinColor", c)} />
          <ColorPicker label="💇 Hair Color" colors={HAIR_COLORS} selected={config.hairColor} onSelect={c => update("hairColor", c)} />
          <StylePicker label="✂️ Hair Style" options={HAIR_STYLES} selected={config.hairStyle} onSelect={s => update("hairStyle", s)} />
          <ColorPicker label="👗 Dress Color" colors={DRESS_COLORS} selected={config.dressColor} onSelect={c => update("dressColor", c)} />
          <StylePicker label="💃 Dress Style" options={DRESS_STYLES} selected={config.dressStyle} onSelect={s => update("dressStyle", s)} />
          <ColorPicker label="👠 Shoe Color" colors={SHOE_COLORS} selected={config.shoeColor} onSelect={c => update("shoeColor", c)} />
          <StylePicker label="💎 Accessory" options={ACCESSORIES} selected={config.accessory} onSelect={s => update("accessory", s)} />
        </div>
      </div>
    </div>
  );
}
