import { useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Room {
  id: string;
  room_name: string;
  description: string;
  panorama_url: string | null;
  order_index: number;
}

interface Castle3DViewerProps {
  castleName: string;
  rooms: Room[];
}

interface RoomBoxProps {
  position: [number, number, number];
  room: Room;
  onRoomClick: (room: Room) => void;
  color: string;
}

function RoomBox({ position, room, onRoomClick, color }: RoomBoxProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current && hovered) {
      meshRef.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.1);
    } else if (meshRef.current) {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[1.5, 1.5, 1.5]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => room.panorama_url && onRoomClick(room)}
      >
        <meshStandardMaterial
          color={hovered ? '#FFD700' : color}
          emissive={hovered ? '#FFA500' : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </Box>
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {room.room_name}
      </Text>
    </group>
  );
}

function CastleStructure({ rooms, onRoomClick }: { rooms: Room[]; onRoomClick: (room: Room) => void }) {
  const castleRef = useRef<THREE.Group>(null);

  // Auto-rotate castle slowly
  useFrame(() => {
    if (castleRef.current) {
      castleRef.current.rotation.y += 0.001;
    }
  });

  // Castle color palette
  const roomColors = ['#9B59B6', '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#1ABC9C'];

  // Position rooms in a circular castle layout
  const positions: [number, number, number][] = rooms.map((_, index) => {
    const angle = (index / rooms.length) * Math.PI * 2;
    const radius = 4;
    return [
      Math.cos(angle) * radius,
      Math.sin(index * 0.5), // Vary height slightly
      Math.sin(angle) * radius
    ];
  });

  return (
    <group ref={castleRef}>
      {/* Castle base */}
      <Box args={[10, 0.5, 10]} position={[0, -2, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>

      {/* Central tower */}
      <Box args={[2, 6, 2]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#A0522D" />
      </Box>

      {/* Tower top */}
      <mesh position={[0, 4.5, 0]}>
        <coneGeometry args={[1.5, 2, 4]} />
        <meshStandardMaterial color="#FF69B4" />
      </mesh>

      {/* Rooms around the castle */}
      {rooms.map((room, index) => (
        <RoomBox
          key={room.id}
          position={positions[index]}
          room={room}
          onRoomClick={onRoomClick}
          color={roomColors[index % roomColors.length]}
        />
      ))}

      {/* Decorative elements */}
      <pointLight position={[0, 8, 0]} intensity={0.5} color="#FFD700" />
    </group>
  );
}

function PanoramaViewer({ panoramaUrl, onClose }: { panoramaUrl: string; onClose: () => void }) {
  return (
    <div className="relative w-full h-full bg-black">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>
      
      <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
        <ambientLight intensity={1} />
        <PanoramaSphere panoramaUrl={panoramaUrl} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          rotateSpeed={-0.5}
          minDistance={0.1}
          maxDistance={10}
        />
      </Canvas>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg">
        <p className="text-sm">Pohybuj myšou alebo prstom pre otáčanie • Zoomuj kolieskom</p>
      </div>
    </div>
  );
}

function PanoramaSphere({ panoramaUrl }: { panoramaUrl: string }) {
  const texture = useLoader(THREE.TextureLoader, panoramaUrl);
  
  return (
    <Sphere args={[500, 60, 40]}>
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </Sphere>
  );
}

export function Castle3DViewer({ castleName, rooms }: Castle3DViewerProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showPanorama, setShowPanorama] = useState(false);

  const handleRoomClick = (room: Room) => {
    if (room.panorama_url) {
      setSelectedRoom(room);
      setShowPanorama(true);
    }
  };

  const roomsWithPanoramas = rooms.filter(r => r.panorama_url);

  return (
    <>
      <div className="w-full h-[600px] bg-gradient-to-b from-sky-400 to-sky-200 rounded-lg overflow-hidden">
        <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-10, -10, -5]} intensity={0.3} color="#FFE4B5" />
          
          <CastleStructure rooms={roomsWithPanoramas} onRoomClick={handleRoomClick} />
          
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            minDistance={5}
            maxDistance={30}
            maxPolarAngle={Math.PI / 2}
          />
          
          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.3, 0]} receiveShadow>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#90EE90" />
          </mesh>
        </Canvas>

        <div className="absolute bottom-4 left-4 bg-white/90 p-4 rounded-lg shadow-lg max-w-xs">
          <h3 className="font-bold text-lg mb-2">{castleName}</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Klikni na farebnú miestnosť pre zobrazenie 360° panorámy
          </p>
          <p className="text-xs text-muted-foreground">
            {roomsWithPanoramas.length} z {rooms.length} miestností má panorámu
          </p>
        </div>
      </div>

      <Dialog open={showPanorama} onOpenChange={setShowPanorama}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] h-[90vh] p-0">
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
            <DialogTitle className="text-white text-center">
              {selectedRoom?.room_name}
            </DialogTitle>
            <p className="text-white/80 text-sm text-center mt-1">
              {selectedRoom?.description}
            </p>
          </DialogHeader>
          
          {selectedRoom?.panorama_url && (
            <PanoramaViewer
              panoramaUrl={selectedRoom.panorama_url}
              onClose={() => setShowPanorama(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
