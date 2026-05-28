import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Info, Volume2, VolumeX, Sparkles, Languages, Crosshair, BookOpen, Crown, Gem, Wand2, MapPin, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

// Magical Dreams (Hong Kong) - 10 rooms
import magicalDreams1 from "@/assets/fairy-castles/panoramas/magical-dreams-1.jpg";
import magicalDreams2 from "@/assets/fairy-castles/panoramas/magical-dreams-2.jpg";
import magicalDreams3 from "@/assets/fairy-castles/panoramas/magical-dreams-3.jpg";
import magicalDreams4 from "@/assets/fairy-castles/panoramas/magical-dreams-4.jpg";
import magicalDreams5 from "@/assets/fairy-castles/panoramas/magical-dreams-5.jpg";
import magicalDreams6 from "@/assets/fairy-castles/panoramas/magical-dreams-6.jpg";
import magicalDreams7 from "@/assets/fairy-castles/panoramas/magical-dreams-7.jpg";
import magicalDreams8 from "@/assets/fairy-castles/panoramas/magical-dreams-8.jpg";
import magicalDreams9 from "@/assets/fairy-castles/panoramas/magical-dreams-9.jpg";
import magicalDreams10 from "@/assets/fairy-castles/panoramas/magical-dreams-10.jpg";

// Cinderella Castle (Magic Kingdom) - 10 rooms
import cinderella1 from "@/assets/fairy-castles/panoramas/cinderella-1.jpg";
import cinderella2 from "@/assets/fairy-castles/panoramas/cinderella-2.jpg";
import cinderella3 from "@/assets/fairy-castles/panoramas/cinderella-3.jpg";
import cinderella4 from "@/assets/fairy-castles/panoramas/cinderella-4.jpg";
import cinderella5 from "@/assets/fairy-castles/panoramas/cinderella-5.jpg";
import cinderella6 from "@/assets/fairy-castles/panoramas/cinderella-6.jpg";
import cinderella7 from "@/assets/fairy-castles/panoramas/cinderella-7.jpg";
import cinderella8 from "@/assets/fairy-castles/panoramas/cinderella-8.jpg";
import cinderella9 from "@/assets/fairy-castles/panoramas/cinderella-9.jpg";
import cinderella10 from "@/assets/fairy-castles/panoramas/cinderella-10.jpg";

// Rose Castle (Magic Resort California) - 10 rooms
import sleepingBeauty1 from "@/assets/fairy-castles/panoramas/sleeping-beauty-1.jpg";
import sleepingBeauty2 from "@/assets/fairy-castles/panoramas/sleeping-beauty-2.jpg";
import sleepingBeauty3 from "@/assets/fairy-castles/panoramas/sleeping-beauty-3.jpg";
import sleepingBeauty4 from "@/assets/fairy-castles/panoramas/sleeping-beauty-4.jpg";
import sleepingBeauty5 from "@/assets/fairy-castles/panoramas/sleeping-beauty-5.jpg";
import sleepingBeauty6 from "@/assets/fairy-castles/panoramas/sleeping-beauty-6.jpg";
import sleepingBeauty7 from "@/assets/fairy-castles/panoramas/sleeping-beauty-7.jpg";
import sleepingBeauty8 from "@/assets/fairy-castles/panoramas/sleeping-beauty-8.jpg";
import sleepingBeauty9 from "@/assets/fairy-castles/panoramas/sleeping-beauty-9.jpg";
import sleepingBeauty10 from "@/assets/fairy-castles/panoramas/sleeping-beauty-10.jpg";

// Le Château de la Belle au Bois Dormant (Paris) - 10 rooms
import parisBelle1 from "@/assets/fairy-castles/panoramas/paris-belle-1.jpg";
import parisBelle2 from "@/assets/fairy-castles/panoramas/paris-belle-2.jpg";
import parisBelle3 from "@/assets/fairy-castles/panoramas/paris-belle-3.jpg";
import parisBelle4 from "@/assets/fairy-castles/panoramas/paris-belle-4.jpg";
import parisBelle5 from "@/assets/fairy-castles/panoramas/paris-belle-5.jpg";
import parisBelle6 from "@/assets/fairy-castles/panoramas/paris-belle-6.jpg";
import parisBelle7 from "@/assets/fairy-castles/panoramas/paris-belle-7.jpg";
import parisBelle8 from "@/assets/fairy-castles/panoramas/paris-belle-8.jpg";
import parisBelle9 from "@/assets/fairy-castles/panoramas/paris-belle-9.jpg";
import parisBelle10 from "@/assets/fairy-castles/panoramas/paris-belle-10.jpg";

// Cinderella Castle (Tokyo) - 10 rooms
import tokyoCinderella1 from "@/assets/fairy-castles/panoramas/tokyo-cinderella-1.jpg";
import tokyoCinderella2 from "@/assets/fairy-castles/panoramas/tokyo-cinderella-2.jpg";
import tokyoCinderella3 from "@/assets/fairy-castles/panoramas/tokyo-cinderella-3.jpg";
import tokyoCinderella4 from "@/assets/fairy-castles/panoramas/tokyo-cinderella-4.jpg";
import tokyoCinderella5 from "@/assets/fairy-castles/panoramas/tokyo-cinderella-5.jpg";
import tokyoCinderella6 from "@/assets/fairy-castles/panoramas/tokyo-cinderella-6.jpg";
import tokyoCinderella7 from "@/assets/fairy-castles/panoramas/tokyo-cinderella-7.jpg";
import tokyoCinderella8 from "@/assets/fairy-castles/panoramas/tokyo-cinderella-8.jpg";
import tokyoCinderella9 from "@/assets/fairy-castles/panoramas/tokyo-cinderella-9.jpg";
import tokyoCinderella10 from "@/assets/fairy-castles/panoramas/tokyo-cinderella-10.jpg";

// Enchanted Storybook Castle (Shanghai) - 10 rooms
import shanghaiStorybook1 from "@/assets/fairy-castles/panoramas/shanghai-storybook-1.jpg";
import shanghaiStorybook2 from "@/assets/fairy-castles/panoramas/shanghai-storybook-2.jpg";
import shanghaiStorybook3 from "@/assets/fairy-castles/panoramas/shanghai-storybook-3.jpg";
import shanghaiStorybook4 from "@/assets/fairy-castles/panoramas/shanghai-storybook-4.jpg";
import shanghaiStorybook5 from "@/assets/fairy-castles/panoramas/shanghai-storybook-5.jpg";
import shanghaiStorybook6 from "@/assets/fairy-castles/panoramas/shanghai-storybook-6.jpg";
import shanghaiStorybook7 from "@/assets/fairy-castles/panoramas/shanghai-storybook-7.jpg";
import shanghaiStorybook8 from "@/assets/fairy-castles/panoramas/shanghai-storybook-8.jpg";
import shanghaiStorybook9 from "@/assets/fairy-castles/panoramas/shanghai-storybook-9.jpg";
import shanghaiStorybook10 from "@/assets/fairy-castles/panoramas/shanghai-storybook-10.jpg";

interface FairyPanoramaViewerProps {
  imageUrl: string;
  audioGuideText?: string;
  ambientSound?: string;
  roomName?: string;
  collectibles?: Array<{
    id: string;
    position_x: number;
    position_y: number;
    position_z: number;
    collectible: {
      id: string;
      name: string;
      description: string;
      rarity: string;
    };
  }>;
  onCollectItem?: (collectibleId: string) => void;
  collectedIds?: string[];
}

function PanoramaSphere({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous'; // Enable CORS for external URLs
    
    // Map URL to imported image - All 60 unique panoramas
    const imageMap: Record<string, string> = {
      // Magical Dreams (Hong Kong) - 10 rooms
      'magical-dreams-1': magicalDreams1,
      'magical-dreams-2': magicalDreams2,
      'magical-dreams-3': magicalDreams3,
      'magical-dreams-4': magicalDreams4,
      'magical-dreams-5': magicalDreams5,
      'magical-dreams-6': magicalDreams6,
      'magical-dreams-7': magicalDreams7,
      'magical-dreams-8': magicalDreams8,
      'magical-dreams-9': magicalDreams9,
      'magical-dreams-10': magicalDreams10,
      
      // Cinderella Castle (Magic Kingdom) - 10 rooms
      'cinderella-1': cinderella1,
      'cinderella-2': cinderella2,
      'cinderella-3': cinderella3,
      'cinderella-4': cinderella4,
      'cinderella-5': cinderella5,
      'cinderella-6': cinderella6,
      'cinderella-7': cinderella7,
      'cinderella-8': cinderella8,
      'cinderella-9': cinderella9,
      'cinderella-10': cinderella10,
      
      // Rose Castle (Magic Resort California) - 10 rooms
      'sleeping-beauty-1': sleepingBeauty1,
      'sleeping-beauty-2': sleepingBeauty2,
      'sleeping-beauty-3': sleepingBeauty3,
      'sleeping-beauty-4': sleepingBeauty4,
      'sleeping-beauty-5': sleepingBeauty5,
      'sleeping-beauty-6': sleepingBeauty6,
      'sleeping-beauty-7': sleepingBeauty7,
      'sleeping-beauty-8': sleepingBeauty8,
      'sleeping-beauty-9': sleepingBeauty9,
      'sleeping-beauty-10': sleepingBeauty10,
      
      // Paris Belle (Enchanted Park Paris) - 10 rooms
      'paris-belle-1': parisBelle1,
      'paris-belle-2': parisBelle2,
      'paris-belle-3': parisBelle3,
      'paris-belle-4': parisBelle4,
      'paris-belle-5': parisBelle5,
      'paris-belle-6': parisBelle6,
      'paris-belle-7': parisBelle7,
      'paris-belle-8': parisBelle8,
      'paris-belle-9': parisBelle9,
      'paris-belle-10': parisBelle10,
      
      // Tokyo Cinderella - 10 rooms
      'tokyo-cinderella-1': tokyoCinderella1,
      'tokyo-cinderella-2': tokyoCinderella2,
      'tokyo-cinderella-3': tokyoCinderella3,
      'tokyo-cinderella-4': tokyoCinderella4,
      'tokyo-cinderella-5': tokyoCinderella5,
      'tokyo-cinderella-6': tokyoCinderella6,
      'tokyo-cinderella-7': tokyoCinderella7,
      'tokyo-cinderella-8': tokyoCinderella8,
      'tokyo-cinderella-9': tokyoCinderella9,
      'tokyo-cinderella-10': tokyoCinderella10,
      
      // Shanghai Storybook - 10 rooms
      'shanghai-storybook-1': shanghaiStorybook1,
      'shanghai-storybook-2': shanghaiStorybook2,
      'shanghai-storybook-3': shanghaiStorybook3,
      'shanghai-storybook-4': shanghaiStorybook4,
      'shanghai-storybook-5': shanghaiStorybook5,
      'shanghai-storybook-6': shanghaiStorybook6,
      'shanghai-storybook-7': shanghaiStorybook7,
      'shanghai-storybook-8': shanghaiStorybook8,
      'shanghai-storybook-9': shanghaiStorybook9,
      'shanghai-storybook-10': shanghaiStorybook10,
    };

    // Check if imageUrl is a key in imageMap or a direct URL
    const actualImageUrl = imageMap[imageUrl] || imageUrl;
    
    console.log('Loading panorama:', imageUrl, '-> Actual URL:', actualImageUrl.substring(0, 100));
    
    // Reset texture before loading new one
    setTexture(null);
    
    loader.load(
      actualImageUrl,
      (loadedTexture) => {
        // Optimize texture quality
        loadedTexture.minFilter = THREE.LinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;
        loadedTexture.anisotropy = 16; // Maximum anisotropic filtering
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        console.log('Texture loaded successfully');
        setTexture(loadedTexture);
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', error);
        console.error('Failed URL:', actualImageUrl);
      }
    );

    return () => {
      // Cleanup: dispose old texture when component unmounts or imageUrl changes
      if (texture) {
        texture.dispose();
      }
    };
  }, [imageUrl]);

  if (!texture) {
    return null;
  }

  return (
    <mesh ref={meshRef} rotation={[0, Math.PI, 0]}>
      <sphereGeometry args={[500, 128, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

function CameraController() {
  const controlsRef = useRef<any>();

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={true}
      enablePan={false}
      rotateSpeed={-0.3}
      minDistance={0.1}
      maxDistance={10}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={(3 * Math.PI) / 4}
    />
  );
}

function CollectibleMarker({ 
  position, 
  collectible, 
  onCollect, 
  isCollected 
}: { 
  position: [number, number, number]; 
  collectible: any;
  onCollect: () => void;
  isCollected: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  if (isCollected) return null;

  return (
    <mesh
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onCollect}
    >
      <sphereGeometry args={[5, 16, 16]} />
      <meshStandardMaterial 
        color={hovered ? "#FFD700" : "#FFA500"} 
        emissive={hovered ? "#FFD700" : "#FFA500"}
        emissiveIntensity={0.8}
      />
      {hovered && (
        <Html center>
          <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap pointer-events-none">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>{collectible.collectible?.name}</span>
            </div>
          </div>
        </Html>
      )}
    </mesh>
  );
}

// ============ POI HOTSPOTS (story / info / treasure / character) ============
type PoiKind = "story" | "info" | "treasure" | "character" | "landmark";

interface Poi {
  id: string;
  kind: PoiKind;
  title: string;
  narrative: string;
  // Spherical coords on the inside of the sphere (yaw deg, pitch deg)
  yaw: number;
  pitch: number;
}

// Deterministic hash so positions are stable across renders
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function buildPoisFromRoom(roomKey: string, roomName: string, audioGuideText: string): Poi[] {
  const name = (roomName || "").toLowerCase();
  const baseSeed = hashStr(roomKey || roomName);

  // Pick a themed POI palette by room name
  const palette: Array<Omit<Poi, "id" | "yaw" | "pitch">> = [];

  const push = (p: Omit<Poi, "id" | "yaw" | "pitch">) => palette.push(p);

  if (name.includes("ballroom") || name.includes("dance")) {
    push({ kind: "landmark", title: "Crystal Chandelier", narrative: "Look up — the chandelier is hand-cut crystal, said to chime when royalty enters the hall." });
    push({ kind: "story", title: "The Midnight Waltz", narrative: "On this very floor, Cinderella danced until the clock struck twelve." });
    push({ kind: "info", title: "Marble Pattern", narrative: "The floor uses three different Italian marbles arranged in a perfect star compass." });
    push({ kind: "character", title: "Court Musician", narrative: "Master Renato played here for forty winters — his violin still rests in the alcove." });
  } else if (name.includes("library") || name.includes("book")) {
    push({ kind: "story", title: "The Forbidden Tome", narrative: "Behind the third shelf hides a spellbook nobody dares to open after sunset." });
    push({ kind: "info", title: "12,000 Volumes", narrative: "Every book is hand-bound; the oldest is from the year 1422." });
    push({ kind: "treasure", title: "Hidden Quill", narrative: "A magical quill that writes by itself — find it and earn a wisdom badge." });
    push({ kind: "landmark", title: "Stained Glass", narrative: "The window depicts the seven scholars who founded this library." });
  } else if (name.includes("garden") || name.includes("enchanted")) {
    push({ kind: "story", title: "Whispering Roses", narrative: "Lean closer — the red roses whisper secrets to those who listen." });
    push({ kind: "character", title: "Garden Pixie", narrative: "A tiny pixie tends every flower; you might see her wings flicker." });
    push({ kind: "info", title: "Ancient Oak", narrative: "This oak is 700 years old — older than the castle itself." });
    push({ kind: "landmark", title: "Wishing Fountain", narrative: "Drop a coin (in your imagination!) and your kindest wish may come true." });
  } else if (name.includes("dragon") || name.includes("cave")) {
    push({ kind: "story", title: "Dragon's Lair", narrative: "Sparkling embers still glow — the dragon left only an hour ago." });
    push({ kind: "treasure", title: "Gold Hoard", narrative: "Stacks of coins guarded for centuries. Don't take any — it's bad luck." });
    push({ kind: "info", title: "Cave Crystals", narrative: "These purple crystals only grow in places touched by dragon-fire." });
    push({ kind: "landmark", title: "Claw Marks", narrative: "Three deep grooves on the wall — proof a real dragon once napped here." });
  } else if (name.includes("tower")) {
    push({ kind: "story", title: "The Long Wait", narrative: "A princess once sat by this window, watching the stars for a hundred nights." });
    push({ kind: "landmark", title: "Spiral Staircase", narrative: "Exactly 247 steps — every guardian had to memorize them in the dark." });
    push({ kind: "info", title: "Watchman's View", narrative: "From here you can see seven kingdoms on a clear day." });
    push({ kind: "treasure", title: "Hidden Compass", narrative: "An old brass compass that always points to home." });
  } else if (name.includes("chapel") || name.includes("royal") || name.includes("throne")) {
    push({ kind: "landmark", title: "Royal Throne", narrative: "Carved from a single oak that fell during the coronation storm." });
    push({ kind: "story", title: "The Vow", narrative: "Every monarch swears an oath here — to protect the realm and its children." });
    push({ kind: "info", title: "Gold Leaf Ceiling", narrative: "The ceiling is covered with 24-carat gold, applied leaf by leaf." });
    push({ kind: "character", title: "Old Bishop", narrative: "Bishop Aldo blessed three generations of kings in this very spot." });
  } else if (name.includes("gallery") || name.includes("hall")) {
    push({ kind: "info", title: "Royal Portraits", narrative: "Twelve generations of rulers — see if you can spot the family resemblance." });
    push({ kind: "story", title: "The Missing Painting", narrative: "One frame is empty — the portrait vanished one stormy night and was never seen again." });
    push({ kind: "landmark", title: "Vaulted Ceiling", narrative: "The arches above you were built without a single nail." });
    push({ kind: "treasure", title: "Hidden Insignia", narrative: "Look closely — a tiny royal crest is hidden in every painting." });
  } else {
    // Generic fallback palette
    push({ kind: "info", title: "Architectural Detail", narrative: "Every stone here was cut by hand — notice the marks left by the masons." });
    push({ kind: "story", title: "Castle Legend", narrative: "Locals say a friendly ghost still walks these halls at midnight." });
    push({ kind: "landmark", title: "Royal Crest", narrative: "The royal seal of this castle — three stars and a crown." });
    push({ kind: "treasure", title: "Hidden Symbol", narrative: "A secret rune is carved here for those who look carefully." });
  }

  // If we have audio guide text, use the FIRST sentence as a featured story POI
  if (audioGuideText) {
    const firstSentence = audioGuideText.split(/[.!?]/)[0]?.trim();
    if (firstSentence && firstSentence.length > 10) {
      palette.unshift({
        kind: "story",
        title: "Begin the Story",
        narrative: firstSentence + ".",
      });
    }
  }

  // Distribute POIs around the sphere — spread yaw evenly, vary pitch slightly
  return palette.slice(0, 5).map((p, i) => {
    const yawStep = 360 / Math.max(palette.length, 5);
    const yaw = (i * yawStep + (baseSeed % 40)) % 360;
    const pitchSeed = (baseSeed >> (i + 1)) % 30;
    const pitch = (i % 2 === 0 ? 1 : -1) * (5 + pitchSeed); // -25..+25 deg
    return {
      ...p,
      id: `${roomKey}-poi-${i}`,
      yaw,
      pitch,
    };
  });
}

function poiToVec3(yawDeg: number, pitchDeg: number, radius = 470): [number, number, number] {
  const theta = (yawDeg * Math.PI) / 180;
  const phi = ((90 - pitchDeg) * Math.PI) / 180;
  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

const POI_ICON: Record<PoiKind, { color: string; emissive: string; emoji: string }> = {
  story: { color: "#a855f7", emissive: "#c084fc", emoji: "📖" },
  info: { color: "#3b82f6", emissive: "#60a5fa", emoji: "ℹ️" },
  treasure: { color: "#f59e0b", emissive: "#fbbf24", emoji: "💎" },
  character: { color: "#ec4899", emissive: "#f472b6", emoji: "👤" },
  landmark: { color: "#10b981", emissive: "#34d399", emoji: "🏛️" },
};

function PoiMarker({
  poi,
  onClick,
  onGazeEnter,
  onGazeLeave,
  isActive,
  isVisited,
}: {
  poi: Poi;
  onClick: () => void;
  onGazeEnter: () => void;
  onGazeLeave: () => void;
  isActive: boolean;
  isVisited: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const position = useMemo(() => poiToVec3(poi.yaw, poi.pitch), [poi.yaw, poi.pitch]);
  const style = POI_ICON[poi.kind];

  // Pulsing animation
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const base = isActive ? 1.6 : isVisited ? 0.85 : 1;
    meshRef.current.scale.setScalar(base + Math.sin(t * 2 + poi.yaw) * 0.08);
  });

  return (
    <group position={position}>
      {/* Outer halo */}
      <mesh>
        <sphereGeometry args={[10, 24, 24]} />
        <meshBasicMaterial color={style.emissive} transparent opacity={isActive ? 0.35 : 0.18} />
      </mesh>
      {/* Core marker */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onGazeEnter(); }}
        onPointerOut={() => { setHovered(false); onGazeLeave(); }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <sphereGeometry args={[5, 24, 24]} />
        <meshStandardMaterial
          color={style.color}
          emissive={style.emissive}
          emissiveIntensity={isActive ? 1.4 : isVisited ? 0.4 : 0.9}
        />
      </mesh>
      {(hovered || isActive) && (
        <Html center distanceFactor={120} zIndexRange={[100, 0]}>
          <div className="pointer-events-none select-none bg-black/85 text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shadow-xl border border-white/20">
            <span className="mr-1">{style.emoji}</span>
            <span className="font-semibold">{poi.title}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

// Tracks where the camera is looking and reports the closest POI within an angular threshold.
function GazeTracker({
  pois,
  onGazeStart,
  onGazeEnd,
  thresholdDeg = 14,
}: {
  pois: Poi[];
  onGazeStart: (poiId: string) => void;
  onGazeEnd: (poiId: string) => void;
  thresholdDeg?: number;
}) {
  const { camera } = useThree();
  const currentRef = useRef<string | null>(null);
  const dwellRef = useRef<{ id: string | null; since: number }>({ id: null, since: 0 });
  const DWELL_MS = 900;

  useFrame(() => {
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    camDir.normalize();

    let bestId: string | null = null;
    let bestDot = Math.cos((thresholdDeg * Math.PI) / 180);

    for (const poi of pois) {
      const [x, y, z] = poiToVec3(poi.yaw, poi.pitch, 1);
      const v = new THREE.Vector3(x, y, z).normalize();
      const dot = v.dot(camDir);
      if (dot > bestDot) {
        bestDot = dot;
        bestId = poi.id;
      }
    }

    const now = performance.now();
    if (bestId !== dwellRef.current.id) {
      dwellRef.current = { id: bestId, since: now };
    }

    // Has the user been looking at this POI long enough?
    if (
      bestId &&
      bestId !== currentRef.current &&
      now - dwellRef.current.since > DWELL_MS
    ) {
      if (currentRef.current) onGazeEnd(currentRef.current);
      currentRef.current = bestId;
      onGazeStart(bestId);
    } else if (!bestId && currentRef.current) {
      onGazeEnd(currentRef.current);
      currentRef.current = null;
    }
  });

  return null;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

// Detect user's preferred language
const getDefaultLanguage = (): string => {
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  const supported = LANGUAGES.find(l => l.code === browserLang);
  return supported ? supported.code : 'en';
};

export function FairyPanoramaViewer({ 
  imageUrl, 
  audioGuideText,
  ambientSound,
  roomName,
  collectibles = [],
  onCollectItem,
  collectedIds = []
}: FairyPanoramaViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [ambientVolume, setAmbientVolume] = useState<number>(() => {
    if (typeof window === 'undefined') return 0.3;
    const v = parseFloat(localStorage.getItem('fairy.ambientVolume') || '0.3');
    return isNaN(v) ? 0.3 : Math.min(1, Math.max(0, v));
  });
  const [isAmbientMuted, setIsAmbientMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('fairy.ambientMuted') === '1';
  });
  const [guideVolume, setGuideVolume] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const v = parseFloat(localStorage.getItem('fairy.guideVolume') || '1');
    return isNaN(v) ? 1 : Math.min(1, Math.max(0, v));
  });
  const [isGuideMuted, setIsGuideMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('fairy.guideMuted') === '1';
  });
  const [poiVolume, setPoiVolume] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const v = parseFloat(localStorage.getItem('fairy.poiVolume') || '1');
    return isNaN(v) ? 1 : Math.min(1, Math.max(0, v));
  });
  const [isPoiMuted, setIsPoiMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('fairy.poiMuted') === '1';
  });
  const [hoveredCollectible, setHoveredCollectible] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(getDefaultLanguage);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioCache, setAudioCache] = useState<Record<string, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const elevenLabsAudioRef = useRef<HTMLAudioElement | null>(null);

  // ===== POI HOTSPOTS =====
  const pois = useMemo(
    () => buildPoisFromRoom(imageUrl, roomName || "", audioGuideText || ""),
    [imageUrl, roomName, audioGuideText]
  );
  const [activePoiId, setActivePoiId] = useState<string | null>(null);
  const [visitedPois, setVisitedPois] = useState<Set<string>>(new Set());
  const [poiAudioCache, setPoiAudioCache] = useState<Record<string, string>>({});
  const [poiPanelDismissed, setPoiPanelDismissed] = useState(false);
  const [autoGazeAudio, setAutoGazeAudio] = useState(true);
  const poiAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef<boolean>(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const pendingPoiRef = useRef<Poi | null>(null);
  const pendingGuideUrlRef = useRef<string | null>(null);

  // Unlock audio after the first user gesture (required by iOS Safari, Android Chrome).
  useEffect(() => {
    if (audioUnlockedRef.current) return;
    const unlock = async () => {
      if (audioUnlockedRef.current) return;
      try {
        // Play a 1-frame silent audio to unlock the HTMLAudioElement context
        const silent = new Audio(
          'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTcu3UrAIwUdkRgQbFAZC1CQEwTJ9mjRvBA4UOLD8nKVOWfh+UlK3z/177OXrfOdKl7pyn3Xf//FJAhhEEEDhwAQAYAGzaBWyQI///4AwAAAQA0AAAQAAACgAQQAAAAAAAQAAJAAYBgGAAAAAAAAAAAAAAAAAAA='
        );
        silent.volume = 0;
        await silent.play();
        silent.pause();
        audioUnlockedRef.current = true;
        setAudioUnlocked(true);
        setNeedsGesture(false);

        // Replay any audio that was queued while locked
        if (audioRef.current && audioRef.current.paused) {
          audioRef.current.volume = isAmbientMuted ? 0 : ambientVolume;
          audioRef.current.play().catch(() => {});
        }
        if (pendingGuideUrlRef.current) {
          const url = pendingGuideUrlRef.current;
          pendingGuideUrlRef.current = null;
          // Re-trigger guide playback
          playAudioRef.current?.(url);
        }
        if (pendingPoiRef.current) {
          const poi = pendingPoiRef.current;
          pendingPoiRef.current = null;
          playPoiAudioRef.current?.(poi);
        }
      } catch (e) {
        console.warn('Audio unlock failed:', e);
      }
    };

    const events: Array<keyof WindowEventMap> = ['pointerdown', 'touchstart', 'click', 'keydown'];
    events.forEach((ev) => window.addEventListener(ev, unlock, { once: false, passive: true }));
    return () => events.forEach((ev) => window.removeEventListener(ev, unlock));
  }, [ambientVolume, isAmbientMuted]);

  // Refs to playback functions so the unlock effect can call them without dep churn
  const playAudioRef = useRef<((url: string) => void) | null>(null);
  const playPoiAudioRef = useRef<((poi: Poi) => Promise<void>) | null>(null);
  const activePoi = pois.find((p) => p.id === activePoiId) || null;

  // Persist audio preferences across sessions
  useEffect(() => { localStorage.setItem('fairy.ambientVolume', String(ambientVolume)); }, [ambientVolume]);
  useEffect(() => { localStorage.setItem('fairy.ambientMuted', isAmbientMuted ? '1' : '0'); }, [isAmbientMuted]);
  useEffect(() => { localStorage.setItem('fairy.guideVolume', String(guideVolume)); }, [guideVolume]);
  useEffect(() => { localStorage.setItem('fairy.guideMuted', isGuideMuted ? '1' : '0'); }, [isGuideMuted]);
  useEffect(() => { localStorage.setItem('fairy.poiVolume', String(poiVolume)); }, [poiVolume]);
  useEffect(() => { localStorage.setItem('fairy.poiMuted', isPoiMuted ? '1' : '0'); }, [isPoiMuted]);

  // Live-apply volume/mute to currently playing audio elements
  useEffect(() => {
    if (elevenLabsAudioRef.current) {
      elevenLabsAudioRef.current.volume = isGuideMuted ? 0 : guideVolume;
    }
  }, [guideVolume, isGuideMuted]);
  useEffect(() => {
    if (poiAudioRef.current) {
      poiAudioRef.current.volume = isPoiMuted ? 0 : poiVolume;
    }
  }, [poiVolume, isPoiMuted]);

  // Reset all audio preferences to defaults (and persist immediately)
  const handleResetAudio = () => {
    setAmbientVolume(0.3);
    setIsAmbientMuted(false);
    setGuideVolume(1);
    setIsGuideMuted(false);
    setPoiVolume(1);
    setIsPoiMuted(false);
    // Apply immediately to live audio (effects also handle this on next tick)
    if (audioRef.current) audioRef.current.volume = 0.3;
    if (elevenLabsAudioRef.current) elevenLabsAudioRef.current.volume = 1;
    if (poiAudioRef.current) poiAudioRef.current.volume = 1;
    // Persist immediately (effects will also write, but be safe if user navigates)
    try {
      localStorage.setItem('fairy.ambientVolume', '0.3');
      localStorage.setItem('fairy.ambientMuted', '0');
      localStorage.setItem('fairy.guideVolume', '1');
      localStorage.setItem('fairy.guideMuted', '0');
      localStorage.setItem('fairy.poiVolume', '1');
      localStorage.setItem('fairy.poiMuted', '0');
    } catch {}
  };

  // Reset POIs when room changes
  useEffect(() => {
    setActivePoiId(null);
    setVisitedPois(new Set());
    setPoiPanelDismissed(false);
    if (poiAudioRef.current) {
      poiAudioRef.current.pause();
      poiAudioRef.current = null;
    }
  }, [imageUrl]);

  const playPoiAudio = async (poi: Poi) => {
    // Stop any existing POI audio + main audio guide to avoid overlap
    if (poiAudioRef.current) {
      poiAudioRef.current.pause();
      poiAudioRef.current = null;
    }
    if (elevenLabsAudioRef.current && isPlaying) {
      elevenLabsAudioRef.current.pause();
      setIsPlaying(false);
    }

    const cacheKey = `${poi.id}-${selectedLanguage}`;
    let url = poiAudioCache[cacheKey];

    if (!url) {
      try {
        const { data, error } = await supabase.functions.invoke('translate-and-generate-audio', {
          body: { text: `${poi.title}. ${poi.narrative}`, language: selectedLanguage },
        });
        if (error) throw error;
        if (data?.audioContent) {
          const binaryString = atob(data.audioContent);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
          const blob = new Blob([bytes], { type: 'audio/mpeg' });
          url = URL.createObjectURL(blob);
          setPoiAudioCache((prev) => ({ ...prev, [cacheKey]: url! }));
        }
      } catch (e) {
        console.error('POI audio generation failed:', e);
        // Browser TTS fallback so the experience still works
        if ('speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(`${poi.title}. ${poi.narrative}`);
          u.lang = selectedLanguage;
          u.rate = 0.95;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
        }
        return;
      }
    }

    if (!url) return;
    const audio = new Audio(url);
    audio.preload = 'auto';
    // iOS sometimes ignores volume set before play() — set both before and after.
    audio.volume = isPoiMuted ? 0 : poiVolume;
    poiAudioRef.current = audio;

    try {
      await audio.play();
      // Re-apply volume after play() resolves (Safari quirk)
      audio.volume = isPoiMuted ? 0 : poiVolume;
    } catch (err: any) {
      // NotAllowedError = no user gesture yet → queue and prompt
      if (err?.name === 'NotAllowedError') {
        pendingPoiRef.current = poi;
        setNeedsGesture(true);
      } else {
        console.warn('POI audio play failed:', err);
      }
    }
  };

  const handleGazeStart = (poiId: string) => {
    const poi = pois.find((p) => p.id === poiId);
    if (!poi) return;
    setActivePoiId(poiId);
    setPoiPanelDismissed(false);
    setVisitedPois((prev) => new Set(prev).add(poiId));
    if (autoGazeAudio) playPoiAudio(poi);
  };

  const handleGazeEnd = (_poiId: string) => {
    // We keep the panel open until user moves to another POI or dismisses it.
    // (No-op intentionally.)
  };

  const handlePoiClick = (poi: Poi) => {
    setActivePoiId(poi.id);
    setPoiPanelDismissed(false);
    setVisitedPois((prev) => new Set(prev).add(poi.id));
    playPoiAudio(poi);
  };

  // Stop POI audio on unmount
  useEffect(() => {
    return () => {
      if (poiAudioRef.current) {
        poiAudioRef.current.pause();
        poiAudioRef.current = null;
      }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);


  useEffect(() => {
    // Auto-hide info after 5 seconds
    const timer = setTimeout(() => setShowInfo(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Ambient sound management
  useEffect(() => {
    if (ambientSound && !audioRef.current) {
      const audio = new Audio(ambientSound);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = isAmbientMuted ? 0 : ambientVolume;
      audioRef.current = audio;

      audio.play()
        .then(() => {
          // Re-apply volume after play() resolves (Safari quirk)
          audio.volume = isAmbientMuted ? 0 : ambientVolume;
        })
        .catch((err: any) => {
          if (err?.name === 'NotAllowedError' && !audioUnlockedRef.current) {
            // Will auto-resume after first user gesture (handled in unlock effect)
            setNeedsGesture(true);
          } else {
            console.log('Ambient sound autoplay prevented:', err);
          }
        });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [ambientSound]);

  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isAmbientMuted ? 0 : ambientVolume;
    }
  }, [ambientVolume, isAmbientMuted]);

  const handleSpeak = async () => {
    if (!audioGuideText) return;

    if (isPlaying) {
      if (elevenLabsAudioRef.current) {
        elevenLabsAudioRef.current.pause();
        elevenLabsAudioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }

    // Check cache first
    const cacheKey = `${imageUrl}-${selectedLanguage}`;
    if (audioCache[cacheKey]) {
      playAudio(audioCache[cacheKey]);
      return;
    }

    // Generate new audio
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-and-generate-audio', {
        body: {
          text: audioGuideText,
          language: selectedLanguage,
        },
      });

      if (error) throw error;

      if (data?.audioContent) {
        // Convert base64 to blob URL
        const binaryString = atob(data.audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(blob);

        // Cache the audio URL
        setAudioCache(prev => ({ ...prev, [cacheKey]: audioUrl }));
        playAudio(audioUrl);
      }
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (elevenLabsAudioRef.current) {
      elevenLabsAudioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audio.preload = 'auto';
    audio.volume = isGuideMuted ? 0 : guideVolume;
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    elevenLabsAudioRef.current = audio;
    setIsPlaying(true);

    audio.play()
      .then(() => {
        audio.volume = isGuideMuted ? 0 : guideVolume;
      })
      .catch((err: any) => {
        if (err?.name === 'NotAllowedError') {
          pendingGuideUrlRef.current = audioUrl;
          setNeedsGesture(true);
          setIsPlaying(false);
        } else {
          console.warn('Guide audio play failed:', err);
          setIsPlaying(false);
        }
      });
  };

  // Wire refs for unlock effect to call after first user gesture
  useEffect(() => {
    playAudioRef.current = playAudio;
    playPoiAudioRef.current = playPoiAudio;
  });

  return (
    <div className="relative w-full h-screen">
      <Canvas
        camera={{ 
          position: [0, 0, 0.1],
          fov: 75,
        }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <PanoramaSphere imageUrl={imageUrl} />
        {collectibles.map((item: any) => {
          const theta = (item.position_x * Math.PI) / 180;
          const phi = ((90 - item.position_y) * Math.PI) / 180;
          const radius = item.position_z || 480;
          
          const x = radius * Math.sin(phi) * Math.cos(theta);
          const y = radius * Math.cos(phi);
          const z = radius * Math.sin(phi) * Math.sin(theta);

          return (
            <CollectibleMarker
              key={item.id}
              position={[x, y, z]}
              collectible={item}
              onCollect={() => onCollectItem?.(item.collectible.id)}
              isCollected={collectedIds.includes(item.collectible.id)}
            />
          );
        })}

        {/* Story / Info / Treasure POIs */}
        {pois.map((poi) => (
          <PoiMarker
            key={poi.id}
            poi={poi}
            isActive={activePoiId === poi.id}
            isVisited={visitedPois.has(poi.id)}
            onClick={() => handlePoiClick(poi)}
            onGazeEnter={() => { /* hover hint only */ }}
            onGazeLeave={() => { /* hover hint only */ }}
          />
        ))}

        <GazeTracker
          pois={pois}
          onGazeStart={handleGazeStart}
          onGazeEnd={handleGazeEnd}
        />

        <CameraController />
      </Canvas>

      {/* Centered gaze reticle (helps user aim at hotspots) */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className={`relative transition-all duration-300 ${activePoi ? 'scale-125' : 'scale-100'}`}>
          <Crosshair
            className={`h-6 w-6 drop-shadow-lg transition-colors ${
              activePoi ? 'text-amber-300' : 'text-white/60'
            }`}
          />
          {activePoi && (
            <div className="absolute -inset-3 rounded-full border-2 border-amber-300/70 animate-ping" />
          )}
        </div>
      </div>

      {/* POI counter chip */}
      {pois.length > 0 && (
        <div className="absolute top-[19rem] sm:top-44 right-3 sm:right-6 z-10 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-amber-300" />
          <span className="font-semibold">{visitedPois.size}/{pois.length}</span>
          <span className="opacity-70">discovered</span>
        </div>
      )}

      {/* POI Info Panel — gaze or click triggered */}
      {activePoi && !poiPanelDismissed && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 max-w-md w-[calc(100%-2rem)] animate-fade-in">
          <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl border border-border/60 p-5">
            <div className="flex items-start gap-3">
              <div
                className="flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: POI_ICON[activePoi.kind].color + '33' }}
              >
                {activePoi.kind === 'story' && <BookOpen className="h-5 w-5 text-purple-500" />}
                {activePoi.kind === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                {activePoi.kind === 'treasure' && <Gem className="h-5 w-5 text-amber-500" />}
                {activePoi.kind === 'character' && <Crown className="h-5 w-5 text-pink-500" />}
                {activePoi.kind === 'landmark' && <Wand2 className="h-5 w-5 text-emerald-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-bold text-base">{activePoi.title}</h4>
                  <button
                    onClick={() => setPoiPanelDismissed(true)}
                    className="text-muted-foreground hover:text-foreground text-xs"
                    aria-label="Close hotspot info"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{activePoi.narrative}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => playPoiAudio(activePoi)}
                    className="h-8 text-xs"
                  >
                    <Volume2 className="mr-1 h-3.5 w-3.5" /> Replay
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setAutoGazeAudio((v) => !v)}
                    className="h-8 text-xs"
                    title="Toggle automatic audio when you look at hotspots"
                  >
                    {autoGazeAudio ? '🎧 Auto-play: On' : '🔇 Auto-play: Off'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio Guide Control */}
      {audioGuideText && (
        <div className="absolute top-24 left-6 z-20 flex flex-col gap-3">
          {/* Main Controls Row */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSpeak}
              size="lg"
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-2xl disabled:opacity-50 min-w-[180px]"
            >
              {isGenerating ? (
                <>
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : isPlaying ? (
                <>
                  <VolumeX className="mr-2 h-5 w-5" />
                  Stop Story
                </>
              ) : (
                <>
                  <Volume2 className="mr-2 h-5 w-5" />
                  🎧 Play Story
                </>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/90 hover:bg-white shadow-xl"
                >
                  <Languages className="mr-2 h-4 w-4" />
                  {LANGUAGES.find(l => l.code === selectedLanguage)?.flag} {LANGUAGES.find(l => l.code === selectedLanguage)?.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white max-h-[300px] overflow-y-auto">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang.code);
                      if (isPlaying && elevenLabsAudioRef.current) {
                        elevenLabsAudioRef.current.pause();
                        elevenLabsAudioRef.current.currentTime = 0;
                        setIsPlaying(false);
                      }
                    }}
                    className={`cursor-pointer ${lang.code === selectedLanguage ? 'bg-purple-100' : ''}`}
                  >
                    <span className="mr-2 text-lg">{lang.flag}</span>
                    {lang.name}
                    {lang.code === selectedLanguage && (
                      <span className="ml-auto text-purple-600">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Guide volume + mute */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
            <Button
              onClick={() => setIsGuideMuted((m) => !m)}
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label={isGuideMuted ? 'Unmute guide' : 'Mute guide'}
              title={isGuideMuted ? 'Unmute guide' : 'Mute guide'}
            >
              {isGuideMuted || guideVolume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isGuideMuted ? 0 : guideVolume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setGuideVolume(v);
                if (v > 0 && isGuideMuted) setIsGuideMuted(false);
              }}
              className="w-28 accent-purple-600"
              aria-label="Guide volume"
            />
            <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Guide</span>
          </div>
          {isPlaying && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                {/* Sound Wave Animation */}
                <div className="flex items-end gap-0.5 h-6">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-purple-600 to-blue-500 rounded-full animate-pulse"
                      style={{
                        height: `${20 + Math.random() * 80}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.5s',
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600 ml-auto">Playing...</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-blue-500 animate-pulse w-full" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audio Mixer (Ambient + POI) */}
      <div className="absolute top-28 sm:top-24 right-3 sm:right-6 bg-white/90 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl shadow-lg space-y-2 min-w-[160px] sm:min-w-[180px] max-w-[calc(100%-1.5rem)]">
        {ambientSound && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsAmbientMuted(!isAmbientMuted)}
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0"
              aria-label={isAmbientMuted ? 'Unmute ambient' : 'Mute ambient'}
              title={isAmbientMuted ? 'Unmute ambient' : 'Mute ambient'}
            >
              {isAmbientMuted || ambientVolume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isAmbientMuted ? 0 : ambientVolume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setAmbientVolume(v);
                if (v > 0 && isAmbientMuted) setIsAmbientMuted(false);
              }}
              className="w-24 accent-blue-600"
              aria-label="Ambient volume"
            />
            <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider w-14 text-right">Ambient</span>
          </div>
        )}

        {pois.length > 0 && (
          <div className="flex items-center gap-2 border-t border-gray-200 pt-2">
            <Button
              onClick={() => {
                const next = !isPoiMuted;
                setIsPoiMuted(next);
                if (next && poiAudioRef.current) {
                  poiAudioRef.current.volume = 0;
                }
              }}
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0"
              aria-label={isPoiMuted ? 'Unmute hotspot audio' : 'Mute hotspot audio'}
              title={isPoiMuted ? 'Unmute hotspot audio' : 'Mute hotspot audio'}
            >
              {isPoiMuted || poiVolume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isPoiMuted ? 0 : poiVolume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setPoiVolume(v);
                if (v > 0 && isPoiMuted) setIsPoiMuted(false);
              }}
              className="w-24 accent-amber-500"
              aria-label="Hotspot audio volume"
            />
            <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider w-14 text-right">Hotspot</span>
          </div>
        )}

        {/* Reset audio prefs */}
        <div className="border-t border-gray-200 pt-2 flex justify-end">
          <Button
            onClick={handleResetAudio}
            variant="ghost"
            size="sm"
            className="h-7 text-[11px] text-gray-600 hover:text-gray-900 gap-1.5"
            title="Reset Guide, Hotspot and Ambient volumes to defaults"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset audio
          </Button>
        </div>
      </div>

      {/* Audio gesture banner — required by iOS/Android to allow autoplay */}
      {needsGesture && !audioUnlocked && (
        <button
          onClick={() => {
            // The unlock effect's listeners will fire from this very click and resume queued audio
            setNeedsGesture(false);
          }}
          className="fixed bottom-44 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-pulse"
        >
          <Volume2 className="h-5 w-5" />
          <span className="text-sm font-semibold">Tap to enable audio</span>
        </button>
      )}

      {/* Help Overlay */}
      {showInfo && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl max-w-md animate-fade-in">
          <div className="flex items-start gap-3">
            <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg mb-2">How to Explore</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>🖱️ <strong>Click & drag</strong> to look around</li>
                <li>🔍 <strong>Scroll</strong> to zoom in/out</li>
                <li>🎧 <strong>Audio Guide</strong> tells the castle story</li>
                <li>🎵 <strong>Ambient sounds</strong> create atmosphere</li>
                <li>📱 <strong>Mobile</strong>: Touch and swipe to explore</li>
              </ul>
              <Button
                onClick={() => setShowInfo(false)}
                variant="outline"
                size="sm"
                className="mt-3 w-full"
              >
                Got it!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
