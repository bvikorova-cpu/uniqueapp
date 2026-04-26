import { useRef, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Info, Volume2, VolumeX, Sparkles, Languages } from "lucide-react";
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

// Sleeping Beauty Castle (Disneyland) - 10 rooms
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
      
      // Sleeping Beauty Castle (Disneyland) - 10 rooms
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
      
      // Paris Belle (Disneyland Paris) - 10 rooms
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

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
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
  collectibles = [],
  onCollectItem,
  collectedIds = []
}: FairyPanoramaViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [ambientVolume, setAmbientVolume] = useState(0.3);
  const [isAmbientMuted, setIsAmbientMuted] = useState(false);
  const [hoveredCollectible, setHoveredCollectible] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(getDefaultLanguage);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioCache, setAudioCache] = useState<Record<string, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const elevenLabsAudioRef = useRef<HTMLAudioElement | null>(null);

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
      audio.volume = ambientVolume;
      audioRef.current = audio;
      
      // Auto-play ambient sound
      audio.play().catch(error => {
        console.log("Ambient sound autoplay prevented:", error);
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
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play();
    elevenLabsAudioRef.current = audio;
    setIsPlaying(true);
  };

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
        <CameraController />
      </Canvas>

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

          {/* Audio Progress & Sound Wave */}
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

      {/* Ambient Sound Controls */}
      {ambientSound && (
        <div className="absolute top-24 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsAmbientMuted(!isAmbientMuted)}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              {isAmbientMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={ambientVolume}
              onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
              className="w-20 accent-blue-600"
            />
          </div>
          <p className="text-xs text-gray-600 mt-1 text-center">Ambient</p>
        </div>
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
