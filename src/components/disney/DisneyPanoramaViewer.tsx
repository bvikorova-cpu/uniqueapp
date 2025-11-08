import { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Info, Volume2, VolumeX } from "lucide-react";

import cinderellaThrone from "@/assets/disney/cinderella-throne.jpg";
import sleepingBeautyBallroom from "@/assets/disney/sleeping-beauty-ballroom.jpg";
import parisLibrary from "@/assets/disney/paris-library.jpg";
import hongkongDreams from "@/assets/disney/hongkong-dreams.jpg";
import shanghaiHall from "@/assets/disney/shanghai-hall.jpg";
import tokyoCastle from "@/assets/disney/tokyo-castle.jpg";
import stainedGlassGallery from "@/assets/disney/panoramas/stained-glass-gallery.jpg";
import dragonCave from "@/assets/disney/panoramas/dragon-cave.jpg";
import royalChapel from "@/assets/disney/panoramas/royal-chapel.jpg";
import tapestryHall from "@/assets/disney/panoramas/tapestry-hall.jpg";
import enchantedGarden from "@/assets/disney/panoramas/enchanted-garden.jpg";
import royalLibrary from "@/assets/disney/panoramas/royal-library.jpg";
import towerRoom from "@/assets/disney/panoramas/tower-room.jpg";
import grandBallroom from "@/assets/disney/panoramas/grand-ballroom.jpg";

interface DisneyPanoramaViewerProps {
  imageUrl: string;
  audioGuideText?: string;
}

function PanoramaSphere({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    // Map URL to imported image
    const imageMap: Record<string, string> = {
      '/src/assets/disney/cinderella-throne.jpg': cinderellaThrone,
      '/src/assets/disney/sleeping-beauty-ballroom.jpg': sleepingBeautyBallroom,
      '/src/assets/disney/paris-library.jpg': parisLibrary,
      '/src/assets/disney/hongkong-dreams.jpg': hongkongDreams,
      '/src/assets/disney/shanghai-hall.jpg': shanghaiHall,
      '/src/assets/disney/tokyo-castle.jpg': tokyoCastle,
      'stained-glass-gallery': stainedGlassGallery,
      'dragon-cave': dragonCave,
      'royal-chapel': royalChapel,
      'tapestry-hall': tapestryHall,
      'enchanted-garden': enchantedGarden,
      'royal-library': royalLibrary,
      'tower-room': towerRoom,
      'grand-ballroom': grandBallroom,
    };

    const actualImageUrl = imageMap[imageUrl] || cinderellaThrone;
    
    loader.load(
      actualImageUrl,
      (loadedTexture) => {
        // Optimize texture quality
        loadedTexture.minFilter = THREE.LinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;
        loadedTexture.anisotropy = 16; // Maximum anisotropic filtering
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        setTexture(loadedTexture);
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', error);
      }
    );
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

export function DisneyPanoramaViewer({ 
  imageUrl, 
  audioGuideText 
}: DisneyPanoramaViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    // Auto-hide info after 5 seconds
    const timer = setTimeout(() => setShowInfo(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleSpeak = () => {
    if (!audioGuideText) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(audioGuideText);
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
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
        <PanoramaSphere imageUrl={imageUrl} />
        <CameraController />
      </Canvas>

      {/* Audio Guide Control */}
      {audioGuideText && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
          <Button
            onClick={handleSpeak}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl"
          >
            {isPlaying ? (
              <>
                <VolumeX className="mr-2 h-5 w-5" />
                Stop Audio Guide
              </>
            ) : (
              <>
                <Volume2 className="mr-2 h-5 w-5" />
                🎧 Play Audio Guide
              </>
            )}
          </Button>
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
