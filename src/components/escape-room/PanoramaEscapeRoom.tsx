import { useState, useEffect, useCallback } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture, Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  ArrowLeft, Clock, Lightbulb, Package, Eye, Lock, Unlock, 
  Key, Search, X, Check, MapPin, Volume2, VolumeX, Wand2, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEscapeRoomSounds } from "./useEscapeRoomSounds";
import { EscapeRoomTutorial } from "./EscapeRoomTutorial";
import { StoryNarrative } from "./StoryNarrative";

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
  type: "puzzle" | "item" | "door" | "clue" | "lock" | "hidden";
  label: string;
  description?: string;
  puzzle?: PuzzleData;
  item?: InventoryItem;
  requiredItem?: string;
  nextRoom?: number;
  solved?: boolean;
  isHidden?: boolean;
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
  onUpdateRoomPanorama?: (roomIndex: number, newUrl: string) => void;
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

// Interactive Hotspot Marker with animations
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
  const [pulse, setPulse] = useState(1);

  // Pulsing animation
  useEffect(() => {
    if (isSolved || hotspot.isHidden) return;
    const interval = setInterval(() => {
      setPulse(p => p === 1 ? 1.2 : 1);
    }, 800);
    return () => clearInterval(interval);
  }, [isSolved, hotspot.isHidden]);

  const getColor = () => {
    if (isSolved) return "#22c55e";
    if (hotspot.isHidden) return "#ffffff";
    switch (hotspot.type) {
      case "puzzle": return "#f59e0b";
      case "item": return "#3b82f6";
      case "door": return "#8b5cf6";
      case "clue": return "#06b6d4";
      case "lock": return "#ef4444";
      case "hidden": return "#ffffff";
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
      case "hidden": return "✨";
      default: return "❓";
    }
  };

  // Hidden hotspots are smaller and less visible
  const baseSize = hotspot.isHidden ? 1.5 : 3;
  const opacity = hotspot.isHidden ? (hovered ? 0.8 : 0.3) : (hovered ? 1 : 0.8);

  return (
    <group position={hotspot.position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? baseSize * 1.3 : baseSize * pulse}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial 
          color={getColor()} 
          transparent 
          opacity={opacity}
        />
      </mesh>
      
      {/* Pulsing ring - not for hidden or solved */}
      {!isSolved && !hotspot.isHidden && (
        <mesh scale={[5, 5, 0.1]}>
          <ringGeometry args={[0.8, 1, 32]} />
          <meshBasicMaterial color={getColor()} transparent opacity={0.3} />
        </mesh>
      )}

      {/* Label on hover */}
      {hovered && (
        <Html center position={[0, 6, 0]}>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg"
          >
            <span className="mr-2">{getIcon()}</span>
            {hotspot.label}
            {hotspot.isHidden && <span className="ml-2 text-yellow-400">⭐ Hidden!</span>}
          </motion.div>
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
  onExit,
  onUpdateRoomPanorama
}: PanoramaEscapeRoomProps) {
  const { toast } = useToast();
  const sounds = useEscapeRoomSounds(theme);
  
  // Game states
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [solvedHotspots, setSolvedHotspots] = useState<Set<string>>(new Set());
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showInventory, setShowInventory] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isGeneratingPanorama, setIsGeneratingPanorama] = useState(false);
  const [localRooms, setLocalRooms] = useState(rooms);
  const [isMuted, setIsMuted] = useState(false);
  const [foundHiddenItems, setFoundHiddenItems] = useState(0);
  
  // UI states
  const [showTutorial, setShowTutorial] = useState(true);
  const [showStory, setShowStory] = useState(false);
  const [storyRoomIndex, setStoryRoomIndex] = useState(-1);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Dialog states
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [puzzleAnswer, setPuzzleAnswer] = useState("");
  const [showClue, setShowClue] = useState<string | null>(null);

  const currentRoom = localRooms[currentRoomIndex];

  // Add hidden items to each room
  useEffect(() => {
    const roomsWithHidden = rooms.map(room => ({
      ...room,
      hotspots: [
        ...room.hotspots,
        // Add 2-3 hidden items per room
        {
          id: `hidden-${room.id}-1`,
          position: [Math.random() * 100 - 50, Math.random() * 30 - 15, -Math.random() * 100] as [number, number, number],
          type: "hidden" as const,
          label: "Hidden treasure",
          isHidden: true,
          item: {
            id: `secret-gem-${room.id}`,
            name: "Secret Gem",
            icon: "💎",
            description: "A rare hidden gem! +50 bonus points."
          }
        },
        {
          id: `hidden-${room.id}-2`,
          position: [Math.random() * 100 - 50, Math.random() * 20 - 10, Math.random() * 100 - 50] as [number, number, number],
          type: "hidden" as const,
          label: "Secret Coin",
          isHidden: true,
          item: {
            id: `secret-coin-${room.id}`,
            name: "Gold Coin",
            icon: "🪙",
            description: "An old gold coin! +25 bonus points."
          }
        }
      ]
    }));
    setLocalRooms(roomsWithHidden);
  }, [rooms]);

  // Handle tutorial completion
  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setShowStory(true);
    setStoryRoomIndex(-1);
    sounds.playAmbient();
  };

  // Handle story continue
  const handleStoryContinue = () => {
    if (storyRoomIndex === -1) {
      // After intro, show first room
      setShowStory(false);
      setGameStarted(true);
      setStoryRoomIndex(0);
    } else {
      setShowStory(false);
    }
  };

  // Show story when entering new room
  const enterRoom = (roomIdx: number) => {
    sounds.playEffect('door');
    setCurrentRoomIndex(roomIdx);
    setStoryRoomIndex(roomIdx);
    setShowStory(true);
  };

  // Timer
  useEffect(() => {
    if (!gameStarted) return;
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, gameStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate AI panorama for current room
  const generateAIPanorama = async () => {
    setIsGeneratingPanorama(true);
    toast({
      title: "🎨 Generating AI panorama...",
      description: "This may take a few seconds"
    });

    try {
      const { data, error } = await supabase.functions.invoke('generate-escape-room-panorama', {
        body: { 
          roomName: currentRoom.name, 
          theme: theme,
          description: currentRoom.description 
        }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setLocalRooms(prev => prev.map((room, idx) => 
          idx === currentRoomIndex 
            ? { ...room, panoramaUrl: data.imageUrl }
            : room
        ));
        
        onUpdateRoomPanorama?.(currentRoomIndex, data.imageUrl);
        sounds.playEffect('success');
        
        toast({
          title: "✨ Panorama generated!",
          description: "New AI panorama has been applied"
        });
      }
    } catch (err) {
      console.error('Failed to generate panorama:', err);
      sounds.playEffect('error');
      toast({
        title: "Error generating",
        description: "Try again later",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPanorama(false);
    }
  };

  const addToInventory = useCallback((item: InventoryItem) => {
    if (!inventory.find(i => i.id === item.id)) {
      setInventory(prev => [...prev, item]);
      sounds.playEffect('pickup');
      toast({
        title: `📦 New item!`,
        description: `${item.name} has been added to inventory`
      });
    }
  }, [inventory, toast, sounds]);

  const removeFromInventory = useCallback((itemId: string) => {
    setInventory(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const handleHotspotClick = useCallback((hotspot: Hotspot) => {
    const hotspotKey = `${currentRoomIndex}-${hotspot.id}`;
    sounds.playEffect('click');
    
    // Already solved
    if (solvedHotspots.has(hotspotKey) && hotspot.type !== "door") {
      toast({
        title: "Already solved",
        description: "You have already examined this object"
      });
      return;
    }

    switch (hotspot.type) {
      case "hidden":
      case "item":
        if (hotspot.item) {
          addToInventory(hotspot.item);
          setSolvedHotspots(prev => new Set([...prev, hotspotKey]));
          if (hotspot.isHidden) {
            setFoundHiddenItems(prev => prev + 1);
            sounds.playEffect('success');
            toast({
              title: "🎉 Hidden item found!",
              description: "+50 bonus points!"
            });
          }
        }
        break;
        
      case "clue":
        setShowClue(hotspot.description || "No clue...");
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
          sounds.playEffect('unlock');
          toast({
            title: "🔓 Unlocked!",
            description: hotspot.description || "The lock opened!"
          });
        } else if (hotspot.requiredItem) {
          sounds.playEffect('error');
          toast({
            title: "🔒 Locked",
            description: "You need the correct item from your inventory",
            variant: "destructive",
          });
        } else {
          setActiveHotspot(hotspot);
          setPuzzleAnswer("");
        }
        break;
        
      case "door": {
        const lockHotspots = currentRoom.hotspots.filter(h => h.type === "lock");
        const allLocksOpen = lockHotspots.every(h => 
          solvedHotspots.has(`${currentRoomIndex}-${h.id}`)
        );
        
        if (allLocksOpen || lockHotspots.length === 0) {
          if (hotspot.nextRoom !== undefined && hotspot.nextRoom < rooms.length) {
            enterRoom(hotspot.nextRoom);
            toast({
              title: "🚪 New room!",
              description: `Entering: ${rooms[hotspot.nextRoom].name}`
            });
          } else if (currentRoomIndex === rooms.length - 1 || hotspot.nextRoom === 999) {
            // Last room - complete!
            sounds.playEffect('complete');
            const baseScore = Math.max(0, 1000 - (elapsedTime * 2) - (hintsUsed * 100));
            const hiddenBonus = foundHiddenItems * 50;
            const finalScore = baseScore + hiddenBonus;
            onComplete(finalScore, elapsedTime);
          }
        } else {
          sounds.playEffect('error');
          toast({
            title: "🚪 Door is locked",
            description: "You must solve all puzzles in this room first",
            variant: "destructive",
          });
        }
        break;
      }
    }
  }, [currentRoomIndex, solvedHotspots, selectedItem, addToInventory, removeFromInventory, rooms, currentRoom, toast, elapsedTime, hintsUsed, onComplete, sounds, foundHiddenItems]);

  const handlePuzzleSubmit = useCallback(() => {
    if (!activeHotspot?.puzzle) return;
    
    const isCorrect = puzzleAnswer.toLowerCase().trim() === 
                      activeHotspot.puzzle.answer.toLowerCase().trim();
    
    if (isCorrect) {
      const hotspotKey = `${currentRoomIndex}-${activeHotspot.id}`;
      setSolvedHotspots(prev => new Set([...prev, hotspotKey]));
      sounds.playEffect('success');
      
      if (activeHotspot.puzzle.reward) {
        addToInventory(activeHotspot.puzzle.reward);
      }
      
      toast({
        title: "✅ Correct!",
        description: "Puzzle solved!"
      });
      
      setActiveHotspot(null);
      setPuzzleAnswer("");
    } else {
      sounds.playEffect('error');
      toast({
        title: "❌ Incorrect",
        description: "Try again",
        variant: "destructive",
      });
    }
  }, [activeHotspot, puzzleAnswer, currentRoomIndex, addToInventory, toast, sounds]);

  const useHint = useCallback(() => {
    if (activeHotspot?.puzzle) {
      setHintsUsed(prev => prev + 1);
      sounds.playEffect('hint');
      toast({
        title: "💡 Hint",
        description: activeHotspot.puzzle.hint,
      });
    }
  }, [activeHotspot, toast, sounds]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    sounds.setMuted(!isMuted);
  };

  // Count progress
  const totalPuzzles = rooms.reduce((acc, room) => 
    acc + room.hotspots.filter(h => h.type === "puzzle" || h.type === "lock").length, 0
  );
  const solvedPuzzles = [...solvedHotspots].filter(key => 
    !key.includes('hidden')
  ).length;
  const progress = totalPuzzles > 0 ? Math.min(100, (solvedPuzzles / totalPuzzles) * 100) : 0;

  // Show tutorial first
  if (showTutorial) {
    return (
      <EscapeRoomTutorial 
        onComplete={handleTutorialComplete}
        onSkip={() => {
          setShowTutorial(false);
          setShowStory(true);
          setStoryRoomIndex(-1);
          sounds.playAmbient();
        }}
      />
    );
  }

  // Show story narrative
  if (showStory && currentRoom) {
    return (
      <StoryNarrative
        theme={theme}
        roomIndex={storyRoomIndex}
        roomName={currentRoom?.name || ""}
        onContinue={handleStoryContinue}
      />
    );
  }

  if (!currentRoom) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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

      {/* Top HUD with animations */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none"
      >
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
                Room {currentRoomIndex + 1}/{rooms.length}
              </Badge>
              {foundHiddenItems > 0 && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  ✨ {foundHiddenItems} hidden
                </Badge>
              )}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white p-1 h-auto"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>
          
          <Button 
            variant="secondary" 
            size="sm"
            onClick={generateAIPanorama}
            disabled={isGeneratingPanorama}
            className="w-full"
          >
            {isGeneratingPanorama ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4 mr-1" />
            )}
            AI Panorama
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onExit}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Exit
          </Button>
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4 }}
        className="absolute top-20 left-1/2 -translate-x-1/2 w-64 pointer-events-none"
      >
        <div className="bg-black/60 rounded-full p-1">
          <motion.div 
            className="h-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-center text-white/80 text-xs mt-1">
          Postup: {Math.round(progress)}%
        </p>
      </motion.div>

      {/* Bottom - Inventory with animation */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto"
      >
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
                Inventory ({inventory.length})
              </Button>
              
              <AnimatePresence>
                {showInventory && (
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="flex gap-2 overflow-hidden"
                  >
                    {inventory.map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Button
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
                      </motion.div>
                    ))}
                    {inventory.length === 0 && (
                      <span className="text-gray-400 text-sm px-2">Empty</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <AnimatePresence>
              {selectedItem && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 text-xs text-gray-300 border-t border-white/20 pt-2 overflow-hidden"
                >
                  <strong>{selectedItem.name}:</strong> {selectedItem.description}
                  <br />
                  <span className="text-yellow-400">Click on an object to use</span>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 text-white/60 text-xs pointer-events-none">
        🖱️ Drag to look around • 🔍 Scroll to zoom • Click on objects
      </div>

      {/* Hidden items hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-4 left-4 text-yellow-400/60 text-xs pointer-events-none"
      >
        ✨ Look for hidden items for bonus points!
      </motion.div>

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
              placeholder="Enter answer..."
              value={puzzleAnswer}
              onChange={(e) => setPuzzleAnswer(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handlePuzzleSubmit()}
              autoFocus
            />
            
            <div className="flex gap-2">
              <Button onClick={handlePuzzleSubmit} className="flex-1">
                <Check className="h-4 w-4 mr-1" />
                Confirm
              </Button>
              <Button variant="outline" onClick={useHint}>
                <Lightbulb className="h-4 w-4 mr-1" />
                Hint
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
