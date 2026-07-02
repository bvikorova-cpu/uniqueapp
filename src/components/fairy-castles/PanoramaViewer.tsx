import { useRef, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Info, Volume2, VolumeX } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Hotspot {
  position: [number, number, number];
  label: string;
  nextRoomId?: string;
  info?: string;
}

interface PanoramaViewerProps {
  imageUrl: string;
  hotspots?: Hotspot[];
  onHotspotClick?: (hotspot: Hotspot) => void;
  audioGuideText?: string;
}

function PanoramaSphere({ imageUrl }: { imageUrl: string }) {
  const texture = useTexture(imageUrl);
  
  return (
    <>
      <FloatingHowItWorks title={"Panorama Viewer - How it works"} steps={[{ title: 'Open', desc: 'Access the Panorama Viewer section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Panorama Viewer.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <mesh>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
    </>
  );
}

function HotspotMarker({ 
  position, 
  label, 
  onClick 
}: { 
  position: [number, number, number]; 
  label: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <mesh
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.5 : 1}
      >
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial color={hovered ? "#FFD700" : "#4A90E2"} />
      </mesh>
      {hovered && (
        <sprite position={[0, 5, 0]} scale={[20, 5, 1]}>
          <spriteMaterial color="#ffffff" />
        </sprite>
      )}
    </group>
  );
}

function CameraController() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 0.1);
  }, [camera]);

  return null;
}

export function PanoramaViewer({ 
  imageUrl, 
  hotspots = [], 
  onHotspotClick,
  audioGuideText 
}: PanoramaViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleSpeak = () => {
    if (!audioGuideText) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(audioGuideText);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <div className="relative w-full h-screen">
      <Canvas camera={{ fov: 75 }}>
        <CameraController />
        <PanoramaSphere imageUrl={imageUrl} />
        
        {hotspots.map((hotspot, index) => (
          <HotspotMarker
            key={index}
            position={hotspot.position}
            label={hotspot.label}
            onClick={() => onHotspotClick?.(hotspot)}
          />
        ))}

        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          rotateSpeed={-0.5}
          minDistance={0.1}
          maxDistance={100}
        />
      </Canvas>

      {/* Controls Overlay */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
        {audioGuideText && (
          <Button
            onClick={handleSpeak}
            className="bg-white/90 hover:bg-white text-gray-900"
          >
            {isPlaying ? <VolumeX className="mr-2 h-5 w-5" /> : <Volume2 className="mr-2 h-5 w-5" />}
            {isPlaying ? "Stop Guide" : "Audio Guide"}
          </Button>
        )}
        
        <Button
          onClick={() => setShowInfo(!showInfo)}
          variant="outline"
          className="bg-white/90 hover:bg-white"
        >
          <Info className="mr-2 h-5 w-5" />
          Help
        </Button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute top-4 right-4 bg-white/95 p-6 rounded-lg shadow-xl max-w-md">
          <h3 className="font-bold text-lg mb-2">How to Explore</h3>
          <ul className="space-y-2 text-sm">
            <li>🖱️ Click and drag to look around</li>
            <li>🔍 Scroll to zoom in/out</li>
            <li>🔵 Click blue hotspots to navigate</li>
            <li>🔊 Use Audio Guide to hear the story</li>
            <li>📱 Works great on mobile too!</li>
          </ul>
        </div>
      )}
    </div>
  );
}
