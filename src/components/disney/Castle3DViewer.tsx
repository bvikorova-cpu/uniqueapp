import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface Princess {
  name: string;
  color: string;
  description: string;
  favoritePlace: string;
  phrase: string;
  voiceId: string;
}

interface RoomBoxProps {
  position: [number, number, number];
  room: Room;
  onRoomClick: (room: Room) => void;
  color: string;
}

interface Princess3DProps {
  princess: Princess;
  pathRadius: number;
  speed: number;
  onPrincessClick: (princess: Princess) => void;
}

function Princess3D({ princess, pathRadius, speed, onPrincessClick }: Princess3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Move along circular path
      setAngle((prev) => prev + delta * speed);
      
      const x = Math.cos(angle) * pathRadius;
      const z = Math.sin(angle) * pathRadius;
      
      groupRef.current.position.x = x;
      groupRef.current.position.z = z;
      groupRef.current.position.y = -1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // Face movement direction
      groupRef.current.rotation.y = angle + Math.PI / 2;
      
      // Bounce effect when hovered
      if (hovered) {
        groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 5) * 0.05;
      }
    }
  });

  const color = new THREE.Color(princess.color);

  return (
    <group 
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onPrincessClick(princess)}
    >
      {/* Body - dress */}
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.3, 0.6, 8]} />
        <meshStandardMaterial 
          color={hovered ? '#FFD700' : color} 
          emissive={hovered ? '#FFA500' : color}
          emissiveIntensity={hovered ? 0.5 : 0.1}
        />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#FFE4C4" />
      </mesh>
      
      {/* Crown */}
      <mesh position={[0, 1, 0]}>
        <coneGeometry args={[0.1, 0.15, 6]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFA500" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Sparkles when hovered */}
      {hovered && (
        <>
          <pointLight position={[0, 1, 0]} intensity={1} color="#FFD700" distance={2} />
          <mesh position={[0.3, 0.8, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
          <mesh position={[-0.3, 0.8, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
        </>
      )}
      
      {/* Name label */}
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {princess.name}
      </Text>
    </group>
  );
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

function CastleStructure({ 
  rooms, 
  onRoomClick, 
  princesses, 
  onPrincessClick 
}: { 
  rooms: Room[]; 
  onRoomClick: (room: Room) => void;
  princesses: Princess[];
  onPrincessClick: (princess: Princess) => void;
}) {
  const castleRef = useRef<THREE.Group>(null);

  // Auto-rotate castle slowly
  useFrame(() => {
    if (castleRef.current) {
      castleRef.current.rotation.y += 0.001;
    }
  });

  // Castle color palette - fairy tale colors
  const roomColors = ['#DDA0DD', '#FFB6C1', '#87CEEB', '#98FB98', '#FFD700', '#FFA07A'];

  // Position rooms in a circular castle layout
  const positions: [number, number, number][] = rooms.map((_, index) => {
    const angle = (index / rooms.length) * Math.PI * 2;
    const radius = 5;
    return [
      Math.cos(angle) * radius,
      Math.sin(index * 0.5), // Vary height slightly
      Math.sin(angle) * radius
    ];
  });

  return (
    <group ref={castleRef}>
      {/* Castle courtyard - stone */}
      <Box args={[14, 0.3, 14]} position={[0, -2.15, 0]}>
        <meshStandardMaterial color="#D3D3D3" roughness={0.8} />
      </Box>

      {/* Castle walls - main structure */}
      <Box args={[12, 3, 12]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#F5DEB3" roughness={0.7} />
      </Box>

      {/* Wall decorative trim */}
      <Box args={[12.2, 0.3, 12.2]} position={[0, 0.95, 0]}>
        <meshStandardMaterial color="#DEB887" />
      </Box>

      {/* Corner towers (4 towers) */}
      {[
        [4.5, 1.5, 4.5],
        [-4.5, 1.5, 4.5],
        [4.5, 1.5, -4.5],
        [-4.5, 1.5, -4.5],
      ].map((pos, i) => (
        <group key={`corner-tower-${i}`} position={pos as [number, number, number]}>
          {/* Tower body */}
          <mesh>
            <cylinderGeometry args={[0.8, 0.8, 5, 16]} />
            <meshStandardMaterial color="#F4A460" roughness={0.6} />
          </mesh>
          {/* Tower roof */}
          <mesh position={[0, 3, 0]}>
            <coneGeometry args={[1.2, 2, 16]} />
            <meshStandardMaterial color="#8B4789" metalness={0.3} roughness={0.5} />
          </mesh>
          {/* Gold top */}
          <mesh position={[0, 4.2, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Windows */}
          {[1, 2].map((h) => (
            <mesh key={h} position={[0.8, h, 0]}>
              <boxGeometry args={[0.05, 0.4, 0.3]} />
              <meshStandardMaterial color="#4169E1" emissive="#87CEEB" emissiveIntensity={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Central main tower */}
      <group position={[0, 2, 0]}>
        {/* Tower body */}
        <mesh>
          <cylinderGeometry args={[1.5, 1.5, 8, 16]} />
          <meshStandardMaterial color="#FFE4C4" roughness={0.6} />
        </mesh>
        
        {/* Tower windows - multiple floors */}
        {[-2, 0, 2].map((height, idx) => (
          <group key={`window-floor-${idx}`}>
            {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
              <mesh
                key={i}
                position={[Math.cos(angle) * 1.5, height, Math.sin(angle) * 1.5]}
                rotation={[0, angle, 0]}
              >
                <boxGeometry args={[0.05, 0.6, 0.4]} />
                <meshStandardMaterial 
                  color="#4169E1" 
                  emissive="#87CEEB" 
                  emissiveIntensity={0.4} 
                />
              </mesh>
            ))}
          </group>
        ))}

        {/* Main entrance door */}
        <mesh position={[0, -3.5, 1.5]}>
          <boxGeometry args={[1, 2, 0.2]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
        {/* Door arch */}
        <mesh position={[0, -2.5, 1.5]}>
          <boxGeometry args={[1.2, 0.3, 0.2]} />
          <meshStandardMaterial color="#654321" />
        </mesh>

        {/* Tower roof */}
        <mesh position={[0, 6.5, 0]}>
          <coneGeometry args={[2.2, 3, 16]} />
          <meshStandardMaterial color="#9370DB" metalness={0.3} roughness={0.5} />
        </mesh>

        {/* Spire */}
        <mesh position={[0, 9, 0]}>
          <cylinderGeometry args={[0.1, 0.3, 2, 8]} />
          <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Flag on top */}
        <mesh position={[0, 10.5, 0]}>
          <boxGeometry args={[0.8, 0.5, 0.05]} />
          <meshStandardMaterial color="#FF1493" />
        </mesh>
      </group>

      {/* Magical room towers around */}
      {rooms.map((room, index) => (
        <RoomBox
          key={room.id}
          position={positions[index]}
          room={room}
          onRoomClick={onRoomClick}
          color={roomColors[index % roomColors.length]}
        />
      ))}

      {/* Disney Princesses walking around */}
      {princesses.map((princess, index) => (
        <Princess3D
          key={princess.name}
          princess={princess}
          pathRadius={7.5}
          speed={0.2 + index * 0.1}
          onPrincessClick={onPrincessClick}
        />
      ))}

      {/* Magical lighting effects */}
      <pointLight position={[0, 10, 0]} intensity={1.2} color="#FFD700" distance={20} />
      <pointLight position={[6, 3, 6]} intensity={0.5} color="#FF69B4" distance={15} />
      <pointLight position={[-6, 3, -6]} intensity={0.5} color="#87CEEB" distance={15} />
      
      {/* Ambient sparkles */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={`sparkle-${i}`}
            position={[Math.cos(angle) * 10, 4, Math.sin(angle) * 10]}
          >
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
        );
      })}
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
  const [selectedPrincess, setSelectedPrincess] = useState<Princess | null>(null);
  const [showPrincessDialog, setShowPrincessDialog] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const handleRoomClick = (room: Room) => {
    if (room.panorama_url) {
      setSelectedRoom(room);
      setShowPanorama(true);
    }
  };

  const handlePrincessClick = async (princess: Princess) => {
    setSelectedPrincess(princess);
    setShowPrincessDialog(true);
    
    // Play princess phrase
    if (isPlayingAudio) return;

    try {
      setIsPlayingAudio(true);
      
      const { data, error } = await supabase.functions.invoke('princess-speech', {
        body: { 
          text: princess.phrase,
          voiceId: princess.voiceId
        }
      });

      if (error) throw error;

      if (data.audioContent) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.pause();
          URL.revokeObjectURL(audioRef.current.src);
        }
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsPlayingAudio(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      }
    } catch (error: any) {
      console.error('Error playing princess phrase:', error);
      toast({
        title: 'Chyba',
        description: 'Nepodarilo sa prehrať zvuk princeznej',
        variant: 'destructive',
      });
      setIsPlayingAudio(false);
    }
  };

  const roomsWithPanoramas = rooms.filter(r => r.panorama_url);

  // Disney Princesses data
  const princesses: Princess[] = [
    {
      name: "Elsa",
      color: "#87CEEB",
      description: "Kráľovná ľadu s magickými schopnosťami. Miluje zimu a sneh!",
      favoritePlace: "Ľadový palác",
      phrase: "Pusť to za seba! Nechaj to byť! Už nemôžem to viac skrývať!",
      voiceId: "EXAVITQu4vr4xnSDxMaL"
    },
    {
      name: "Anna",
      color: "#FF69B4",
      description: "Odvážna princezná, ktorá miluje dobrodružstvá a svoju sestru.",
      favoritePlace: "Tróna sála",
      phrase: "Niekto chce postaviť snehuliaka? Poďme sa hrať!",
      voiceId: "9BWtsMINqrJLrRacOk9x"
    },
    {
      name: "Belle",
      color: "#FFD700",
      description: "Inteligentná princezná, ktorá miluje čítanie kníh.",
      favoritePlace: "Knižnica",
      phrase: "Chcem viac než tento provinčný život! Chcem dobrodružstvo!",
      voiceId: "pFZP5JQG7iQjIQuC4Bku"
    },
    {
      name: "Ariel",
      color: "#FF6B6B",
      description: "Morská víla s nádherným hlasom a láskou k oceánu.",
      favoritePlace: "Fontána",
      phrase: "Chcem byť tam, kde sú ľudia! Chcem vidieť ich tanec!",
      voiceId: "XB0fDUnXU5powFXDhCwa"
    }
  ];

  return (
    <>
      <div className="w-full h-[600px] bg-gradient-to-b from-sky-400 to-sky-200 rounded-lg overflow-hidden">
        <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-10, -10, -5]} intensity={0.3} color="#FFE4B5" />
          
          <CastleStructure 
            rooms={roomsWithPanoramas} 
            onRoomClick={handleRoomClick}
            princesses={princesses}
            onPrincessClick={handlePrincessClick}
          />
          
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
            <span className="inline-flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Klikni na princezné alebo miestnosti
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {roomsWithPanoramas.length} miestností • {princesses.length} princezné
          </p>
        </div>
      </div>

      {/* Princess Info Dialog */}
      <Dialog open={showPrincessDialog} onOpenChange={setShowPrincessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              {selectedPrincess?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedPrincess?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <div 
                className="w-12 h-12 rounded-full"
                style={{ backgroundColor: selectedPrincess?.color }}
              />
              <div>
                <p className="text-sm font-semibold">Obľúbené miesto</p>
                <p className="text-sm text-muted-foreground">{selectedPrincess?.favoritePlace}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 Tip: Pohybuj myšou nad princeznou pre vytvorenie iskier!
              </p>
            </div>
          </div>

          <Button onClick={() => setShowPrincessDialog(false)} className="w-full">
            Zatvoriť
          </Button>
        </DialogContent>
      </Dialog>

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
