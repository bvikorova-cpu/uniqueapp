import { useState, useEffect, useCallback } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  ArrowLeft, Clock, Lightbulb, Package, Eye, Lock, Unlock, 
  Key, Search, X, Check, MapPin, Volume2, VolumeX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types
interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  usableOn?: string[];
}

interface Hotspot {
  id: string;
  position: [number, number, number];
  type: "puzzle" | "item" | "door" | "clue" | "lock";
  label: string;
  description?: string;
  puzzle?: PuzzleData;
  item?: InventoryItem;
  requiredItem?: string;
  nextRoom?: number;
  solved?: boolean;
}

interface PuzzleData {
  type: "code" | "riddle" | "sequence" | "cipher" | "combination";
  question: string;
  hint: string;
  answer: string;
  reward?: InventoryItem;
}

interface RoomData {
  id: number;
  name: string;
  description: string;
  panoramaUrl: string;
  hotspots: Hotspot[];
  ambientSound?: string;
}

interface PanoramaEscapeRoomProps {
  theme: string;
  rooms: RoomData[];
  onComplete: (score: number, time: number) => void;
  onExit: () => void;
}

// Panorama Sphere Component
function PanoramaSphere({ imageUrl }: { imageUrl: string }) {
  const texture = useTexture(imageUrl);
  
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
  }, [texture]);
  
  return (
    <mesh>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

// Interactive Hotspot Marker
function HotspotMarker({ 
  hotspot, 
  onClick,
  isSolved
}: { 
  hotspot: Hotspot;
  onClick: () => void;
  isSolved: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const getColor = () => {
    if (isSolved) return "#22c55e"; // green
    switch (hotspot.type) {
      case "puzzle": return "#f59e0b"; // amber
      case "item": return "#3b82f6"; // blue
      case "door": return "#8b5cf6"; // purple
      case "clue": return "#06b6d4"; // cyan
      case "lock": return "#ef4444"; // red
      default: return "#ffffff";
    }
  };

  const getIcon = () => {
    switch (hotspot.type) {
      case "puzzle": return "🧩";
      case "item": return "📦";
      case "door": return "🚪";
      case "clue": return "🔍";
      case "lock": return isSolved ? "🔓" : "🔒";
      default: return "❓";
    }
  };

  return (
    <group position={hotspot.position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 4 : 3}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial 
          color={getColor()} 
          transparent 
          opacity={hovered ? 1 : 0.8}
        />
      </mesh>
      
      {/* Pulsing ring */}
      {!isSolved && (
        <mesh scale={[5, 5, 0.1]}>
          <ringGeometry args={[0.8, 1, 32]} />
          <meshBasicMaterial color={getColor()} transparent opacity={0.3} />
        </mesh>
      )}

      {/* Label on hover */}
      {hovered && (
        <Html center position={[0, 6, 0]}>
          <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
            <span className="mr-2">{getIcon()}</span>
            {hotspot.label}
          </div>
        </Html>
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

// Main Component
export function PanoramaEscapeRoom({ 
  theme, 
  rooms, 
  onComplete, 
  onExit 
}: PanoramaEscapeRoomProps) {
  const { toast } = useToast();
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [solvedHotspots, setSolvedHotspots] = useState<Set<string>>(new Set());
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showInventory, setShowInventory] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  // Dialog states
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [puzzleAnswer, setPuzzleAnswer] = useState("");
  const [showClue, setShowClue] = useState<string | null>(null);

  const currentRoom = rooms[currentRoomIndex];

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addToInventory = useCallback((item: InventoryItem) => {
    if (!inventory.find(i => i.id === item.id)) {
      setInventory(prev => [...prev, item]);
      toast({
        title: `📦 Nový predmet!`,
        description: `${item.name} bol pridaný do inventára`,
      });
    }
  }, [inventory, toast]);

  const removeFromInventory = useCallback((itemId: string) => {
    setInventory(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const handleHotspotClick = useCallback((hotspot: Hotspot) => {
    const hotspotKey = `${currentRoomIndex}-${hotspot.id}`;
    
    // Already solved
    if (solvedHotspots.has(hotspotKey) && hotspot.type !== "door") {
      toast({
        title: "Už vyriešené",
        description: "Tento objekt si už preskúmal",
      });
      return;
    }

    switch (hotspot.type) {
      case "item":
        if (hotspot.item) {
          addToInventory(hotspot.item);
          setSolvedHotspots(prev => new Set([...prev, hotspotKey]));
        }
        break;
        
      case "clue":
        setShowClue(hotspot.description || "Žiadna stopa...");
        break;
        
      case "puzzle":
        setActiveHotspot(hotspot);
        setPuzzleAnswer("");
        break;
        
      case "lock":
        if (hotspot.requiredItem && selectedItem?.id === hotspot.requiredItem) {
          setSolvedHotspots(prev => new Set([...prev, hotspotKey]));
          removeFromInventory(selectedItem.id);
          setSelectedItem(null);
          toast({
            title: "🔓 Odomknuté!",
            description: hotspot.description || "Zámok sa otvoril!",
          });
        } else if (hotspot.requiredItem) {
          toast({
            title: "🔒 Zamknuté",
            description: "Potrebuješ správny predmet z inventára",
            variant: "destructive",
          });
        } else {
          setActiveHotspot(hotspot);
          setPuzzleAnswer("");
        }
        break;
        
      case "door":
        const lockHotspots = currentRoom.hotspots.filter(h => h.type === "lock");
        const allLocksOpen = lockHotspots.every(h => 
          solvedHotspots.has(`${currentRoomIndex}-${h.id}`)
        );
        
        if (allLocksOpen || lockHotspots.length === 0) {
          if (hotspot.nextRoom !== undefined && hotspot.nextRoom < rooms.length) {
            setCurrentRoomIndex(hotspot.nextRoom);
            toast({
              title: "🚪 Nová miestnosť!",
              description: `Vstupuješ do: ${rooms[hotspot.nextRoom].name}`,
            });
          } else if (currentRoomIndex === rooms.length - 1) {
            // Last room - complete!
            const score = Math.max(0, 1000 - (elapsedTime * 2) - (hintsUsed * 100));
            onComplete(score, elapsedTime);
          }
        } else {
          toast({
            title: "🚪 Dvere sú zamknuté",
            description: "Najprv musíš vyriešiť všetky hádanky v tejto miestnosti",
            variant: "destructive",
          });
        }
        break;
    }
  }, [currentRoomIndex, solvedHotspots, selectedItem, addToInventory, removeFromInventory, rooms, currentRoom, toast, elapsedTime, hintsUsed, onComplete]);

  const handlePuzzleSubmit = useCallback(() => {
    if (!activeHotspot?.puzzle) return;
    
    const isCorrect = puzzleAnswer.toLowerCase().trim() === 
                      activeHotspot.puzzle.answer.toLowerCase().trim();
    
    if (isCorrect) {
      const hotspotKey = `${currentRoomIndex}-${activeHotspot.id}`;
      setSolvedHotspots(prev => new Set([...prev, hotspotKey]));
      
      if (activeHotspot.puzzle.reward) {
        addToInventory(activeHotspot.puzzle.reward);
      }
      
      toast({
        title: "✅ Správne!",
        description: "Hádanka vyriešená!",
      });
      
      setActiveHotspot(null);
      setPuzzleAnswer("");
    } else {
      toast({
        title: "❌ Nesprávne",
        description: "Skús to znova",
        variant: "destructive",
      });
    }
  }, [activeHotspot, puzzleAnswer, currentRoomIndex, addToInventory, toast]);

  const useHint = useCallback(() => {
    if (activeHotspot?.puzzle) {
      setHintsUsed(prev => prev + 1);
      toast({
        title: "💡 Nápoveda",
        description: activeHotspot.puzzle.hint,
      });
    }
  }, [activeHotspot, toast]);

  // Count progress
  const totalPuzzles = rooms.reduce((acc, room) => 
    acc + room.hotspots.filter(h => h.type === "puzzle" || h.type === "lock").length, 0
  );
  const solvedPuzzles = solvedHotspots.size;
  const progress = totalPuzzles > 0 ? (solvedPuzzles / totalPuzzles) * 100 : 0;

  if (!currentRoom) {
    return <div className="min-h-screen flex items-center justify-center">Načítava sa...</div>;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Panorama Canvas */}
      <Canvas camera={{ fov: 75 }}>
        <CameraController />
        <PanoramaSphere imageUrl={currentRoom.panoramaUrl} />
        
        {currentRoom.hotspots.map((hotspot) => (
          <HotspotMarker
            key={hotspot.id}
            hotspot={hotspot}
            onClick={() => handleHotspotClick(hotspot)}
            isSolved={solvedHotspots.has(`${currentRoomIndex}-${hotspot.id}`)}
          />
        ))}

        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          rotateSpeed={-0.5}
          minDistance={0.1}
          maxDistance={100}
          minPolarAngle={Math.PI * 0.2}
          maxPolarAngle={Math.PI * 0.8}
        />
      </Canvas>

      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        {/* Left - Room info */}
        <Card className="bg-black/80 border-white/20 text-white pointer-events-auto max-w-xs">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {currentRoom.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <p className="text-xs text-gray-300 mb-2">{currentRoom.description}</p>
            <div className="flex gap-2 text-xs">
              <Badge variant="outline" className="border-white/30">
                Miestnosť {currentRoomIndex + 1}/{rooms.length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Right - Stats */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          <Card className="bg-black/80 border-white/20 text-white">
            <CardContent className="py-2 px-4 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(elapsedTime)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Lightbulb className="h-4 w-4" />
                <span>{hintsUsed}</span>
              </div>
            </CardContent>
          </Card>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onExit}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Ukončiť
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 pointer-events-none">
        <div className="bg-black/60 rounded-full p-1">
          <div 
            className="h-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-white/80 text-xs mt-1">
          Postup: {Math.round(progress)}%
        </p>
      </div>

      {/* Bottom - Inventory */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <Card className="bg-black/80 border-white/20">
          <CardContent className="py-2 px-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowInventory(!showInventory)}
                className="text-white"
              >
                <Package className="h-4 w-4 mr-1" />
                Inventár ({inventory.length})
              </Button>
              
              {showInventory && (
                <div className="flex gap-2">
                  {inventory.map(item => (
                    <Button
                      key={item.id}
                      variant={selectedItem?.id === item.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedItem(
                        selectedItem?.id === item.id ? null : item
                      )}
                      className="text-lg"
                      title={item.name}
                    >
                      {item.icon}
                    </Button>
                  ))}
                  {inventory.length === 0 && (
                    <span className="text-gray-400 text-sm px-2">Prázdny</span>
                  )}
                </div>
              )}
            </div>
            
            {selectedItem && (
              <div className="mt-2 text-xs text-gray-300 border-t border-white/20 pt-2">
                <strong>{selectedItem.name}:</strong> {selectedItem.description}
                <br />
                <span className="text-yellow-400">Klikni na objekt pre použitie</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 text-white/60 text-xs pointer-events-none">
        🖱️ Ťahaj pre rozhliadanie • 🔍 Scroll pre zoom • Klikni na objekty
      </div>

      {/* Puzzle Dialog */}
      <Dialog open={!!activeHotspot} onOpenChange={() => setActiveHotspot(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeHotspot?.type === "puzzle" ? "🧩" : "🔒"}
              {activeHotspot?.label}
            </DialogTitle>
            <DialogDescription>
              {activeHotspot?.puzzle?.question}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Zadaj odpoveď..."
              value={puzzleAnswer}
              onChange={(e) => setPuzzleAnswer(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handlePuzzleSubmit()}
              autoFocus
            />
            
            <div className="flex gap-2">
              <Button onClick={handlePuzzleSubmit} className="flex-1">
                <Check className="h-4 w-4 mr-1" />
                Potvrdiť
              </Button>
              <Button variant="outline" onClick={useHint}>
                <Lightbulb className="h-4 w-4 mr-1" />
                Nápoveda
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clue Dialog */}
      <Dialog open={!!showClue} onOpenChange={() => setShowClue(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Stopa
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">{showClue}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PanoramaEscapeRoom;
