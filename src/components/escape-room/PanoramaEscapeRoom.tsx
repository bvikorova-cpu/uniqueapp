import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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

const hotspotScreenPosition = ([x, y, z]: [number, number, number]) => {
  const distance = Math.sqrt(x * x + y * y + z * z) || 1;
  const yaw = Math.atan2(x, -z);
  const pitch = Math.asin(y / distance);
  return {
    left: `${((yaw + Math.PI) / (Math.PI * 2)) * 100}%`,
    top: `${(0.5 - pitch / Math.PI) * 100}%`,
  };
};

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
  const [revealedClue, setRevealedClue] = useState<string | null>(null);

  
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

  // Clear a revealed clue whenever the room or solved state changes
  useEffect(() => {
    setRevealedClue(null);
  }, [currentRoomIndex, solvedHotspots]);


  // Keep the authored room interactions without adding arbitrary visible markers.
  useEffect(() => {
    setLocalRooms(rooms);
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

  // Generate AI scene image for the current room (full-screen searchable scene)
  const sceneCacheKey = (roomIdx: number) => {
    const room = localRooms[roomIdx];
    const sceneVersion = `${room?.name ?? ""}|${room?.description ?? ""}`
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
    return `escape-scene:${theme}:${room?.id ?? roomIdx}:${encodeURIComponent(sceneVersion)}`;
  };

  const generateAIPanorama = useCallback(async (roomIdx = currentRoomIndex, silent = false) => {
    const room = localRooms[roomIdx];
    if (!room) return;

    setIsGeneratingPanorama(true);
    if (!silent) {
      toast({
        title: "🎨 Generating scene...",
        description: "Building a scene that matches this room"
      });
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-gift-message', {
        body: { 
          type: 'generate_escape_room_panorama',
          roomName: room.name, 
          theme: theme,
          description: room.description 
        }
      });

      // Edge function returns a structured failure payload even on non-2xx
      if (data?.error || error) {
        const detail = {
          message: data?.error ?? error?.message ?? 'Unknown error',
          errorType: data?.errorType ?? 'invoke_failed',
          logId: data?.logId ?? null,
          status: data?.status ?? null,
        };
        throw Object.assign(new Error(detail.message), detail);
      }

      if (data?.imageUrl) {
        try { sessionStorage.setItem(sceneCacheKey(roomIdx), data.imageUrl); } catch { /* quota */ }
        setLocalRooms(prev => prev.map((r, idx) => 
          idx === roomIdx 
            ? { ...r, panoramaUrl: data.imageUrl }
            : r
        ));
        
        onUpdateRoomPanorama?.(roomIdx, data.imageUrl);
        sounds.playEffect('success');
        
        if (!silent) {
          toast({
            title: "✨ Scene ready!",
            description: "The room now matches its story"
          });
        }
      }
    } catch (err) {
      const info = err as Error & { errorType?: string; logId?: string | null; status?: number | null };
      console.error('Failed to generate scene:', info.errorType, info.logId, info.message);
      sounds.playEffect('error');
      toast({
        title: "Scene generation failed",
        description: [
          `Reason: ${info.errorType ?? 'unknown'}${info.status ? ` (HTTP ${info.status})` : ''}`,
          info.message,
          info.logId ? `Log ID: ${info.logId}` : null,
          'Showing the default scene — tap "New scene" to retry.',
        ].filter(Boolean).join(' · '),
        variant: "destructive",
        duration: 12000 });
    } finally {
      setIsGeneratingPanorama(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoomIndex, localRooms, theme, onUpdateRoomPanorama, sounds, toast]);

  // Auto-generate a matching scene when entering a room that still uses a stock photo
  useEffect(() => {
    if (!gameStarted) return;
    const room = localRooms[currentRoomIndex];
    if (!room) return;
    const isStock = /unsplash\.com|placeholder/.test(room.panoramaUrl);
    if (!isStock || isGeneratingPanorama) return;

    const cached = (() => { try { return sessionStorage.getItem(sceneCacheKey(currentRoomIndex)); } catch { return null; } })();
    if (cached) {
      setLocalRooms(prev => prev.map((r, idx) => idx === currentRoomIndex ? { ...r, panoramaUrl: cached } : r));
      return;
    }
    generateAIPanorama(currentRoomIndex, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, currentRoomIndex, localRooms[currentRoomIndex]?.panoramaUrl]);


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
        } else if (hotspot.requiredItem) { sounds.playEffect('error');
          toast({
            title: "🔒 Locked",
            description: "You need the correct item from your inventory",
            variant: "destructive" });
        } else {
          setActiveHotspot(hotspot);
          setPuzzleAnswer("");
        }
        break;
        
      case "door": {
        const requiredHotspots = currentRoom.hotspots.filter(h => h.type === "lock" || h.type === "puzzle");
        const allChallengesSolved = requiredHotspots.every(h =>
          solvedHotspots.has(`${currentRoomIndex}-${h.id}`)
        );
        const requiredItem = hotspot.requiredItem
          ? inventory.find(item => item.id === hotspot.requiredItem)
          : null;
        const hasRequiredItem = !hotspot.requiredItem || Boolean(requiredItem);

        if (allChallengesSolved && hasRequiredItem) {
          if (requiredItem) removeFromInventory(requiredItem.id);
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
        } else { sounds.playEffect('error');
          toast({
            title: "🚪 Door is locked",
            description: !allChallengesSolved
              ? "Solve every puzzle in this room before leaving."
              : "Find the item that unlocks this door first.",
            variant: "destructive" });
        }
        break;
      }
    }
  }, [currentRoomIndex, solvedHotspots, selectedItem, addToInventory, removeFromInventory, rooms, currentRoom, inventory, toast, elapsedTime, hintsUsed, onComplete, sounds, foundHiddenItems]);

  const handlePuzzleSubmit = useCallback(() => {
    if (!activeHotspot?.puzzle) return;

    const normalize = (v: string) =>
      v.toLowerCase().replace(/[^a-z0-9áäčďéíĺľňóôŕšťúýž]+/gi, " ").trim().replace(/\s+/g, " ");

    const given = normalize(puzzleAnswer);
    const accepted = activeHotspot.puzzle.answer
      .split("|")
      .map(normalize)
      .filter(Boolean);

    const isCorrect =
      given.length > 0 &&
      accepted.some(
        (expected) =>
          given === expected ||
          given.split(" ").includes(expected) ||
          expected.split(" ").includes(given) ||
          given.includes(expected) ||
          expected.includes(given)
      );

    
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
    } else { sounds.playEffect('error');
      toast({
        title: "❌ Incorrect",
        description: "Try again",
        variant: "destructive" });
    }
  }, [activeHotspot, puzzleAnswer, currentRoomIndex, addToInventory, toast, sounds]);

  const useHint = useCallback(() => { if (activeHotspot?.puzzle) {
      setHintsUsed(prev => prev + 1);
      sounds.playEffect('hint');
      toast({
        title: "💡 Hint",
        description: activeHotspot.puzzle.hint });
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

  // ---- Search guidance (what to look for) ----
  const pendingHotspots = (currentRoom?.hotspots || []).filter(
    (h) => !solvedHotspots.has(`${currentRoomIndex}-${h.id}`) && h.type !== "door"
  );
  const nextTarget = pendingHotspots[0];

  const searchClue = (() => {
    if (!nextTarget) return "Everything here is solved — find the way out and tap the door.";
    switch (nextTarget.type) {
      case "puzzle":
        return "Somewhere in this room a puzzle is waiting — look for numbers, symbols or a strange marking.";
      case "lock":
        return "Something is locked. Search for the lock, then find what opens it.";
      case "item":
        return "An object you can carry is hidden in plain sight — check furniture, shelves and corners.";
      case "clue":
        return "There is a written clue nearby — inspect notes, walls and papers.";
      case "hidden":
        return "Something is very well hidden here. Look at the darkest corners of the scene.";
      default:
        return "Look around carefully and tap anything that seems out of place.";
    }
  })();

  const revealSearchClue = () => {
    if (!nextTarget) {
      toast({ title: "Nothing left to search", description: "Tap the door to move on." });
      return;
    }
    const [x, y] = nextTarget.position;
    const horizontal = x < -0.15 ? "left" : x > 0.15 ? "right" : "centre";
    const vertical = y > 0.15 ? "upper" : y < -0.15 ? "lower" : "middle";
    setHintsUsed((n) => n + 1);
    sounds.playEffect("hint");
    setRevealedClue(
      `Hint: look at the ${vertical} ${horizontal} part of the scene — it hides “${nextTarget.label}”.`
    );
  };



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
      <FloatingHowItWorks title="Escape Room - How it works" steps={[{ title: "Search", desc: "Inspect the full scene carefully. Interactive objects are not marked." }, { title: "Discover", desc: "Tap objects in the scene to find clues, items, and puzzles." }, { title: "Solve", desc: "Solve every required puzzle and find the key item." }, { title: "Escape", desc: "Only the unlocked exit takes you to the next room." }]} />

      {/* Full-scene search view. Hit areas are deliberately invisible. */}
      <img
        src={currentRoom.panoramaUrl}
        alt={`${currentRoom.name} escape room scene`}
        className="absolute inset-0 h-full w-full object-cover select-none"
        draggable={false}
      />
      <div className="absolute inset-0 z-10">
        {currentRoom.hotspots.map((hotspot) => {
          const solved = solvedHotspots.has(`${currentRoomIndex}-${hotspot.id}`);
          return (
            <Button
              key={hotspot.id}
              type="button"
              variant="ghost"
              aria-label={`Examine ${hotspot.label}`}
              onClick={() => handleHotspotClick(hotspot)}
              disabled={solved && hotspot.type !== "door"}
              className="absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent opacity-0 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none sm:h-20 sm:w-20"
              style={hotspotScreenPosition(hotspot.position)}
            />
          );
        })}
      </div>

      {/* Scene generation overlay */}
      {isGeneratingPanorama && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm pointer-events-none">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-white font-semibold">Painting “{currentRoom.name}”…</p>
          <p className="text-white/70 text-xs">Generating a scene that matches the story</p>
        </div>
      )}



      {/* Top HUD with animations */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute z-20 top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 flex flex-col gap-2 pointer-events-none select-none [-webkit-touch-callout:none]"
      >
        {/* Row: stats + actions (compact on mobile) */}
        <div className="flex items-center justify-between gap-2 pointer-events-auto">
          <Card className="bg-black/80 border-white/20 text-white">
            <CardContent className="py-1.5 px-2.5 sm:py-2 sm:px-4 flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-xs sm:text-sm">{formatTime(elapsedTime)}</span>
              </div>
              <div className="flex items-center gap-1 text-xs sm:text-sm">
                <Lightbulb className="h-4 w-4" />
                <span>{hintsUsed}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="text-white p-1 h-auto"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => generateAIPanorama(currentRoomIndex)}
              disabled={isGeneratingPanorama}
              aria-label="Generate a new scene"
              className="h-9 px-2.5 sm:px-3"
            >
              {isGeneratingPanorama ? (
                <Loader2 className="h-4 w-4 animate-spin sm:mr-1" />
              ) : (
                <Wand2 className="h-4 w-4 sm:mr-1" />
              )}
              <span className="hidden sm:inline">New scene</span>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={onExit}
              aria-label="Exit room"
              className="h-9 px-2.5 sm:px-3"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Exit</span>
            </Button>
          </div>
        </div>

        {/* Room info */}
        <Card className="bg-black/75 border-white/20 text-white pointer-events-auto w-full sm:max-w-xs">
          <CardHeader className="py-2 px-3 sm:py-3 sm:px-4">
            <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{currentRoom.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-1.5 px-3 sm:py-2 sm:px-4">
            <p className="text-[11px] sm:text-xs text-gray-300 mb-2 line-clamp-2">{currentRoom.description}</p>
            <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs items-center">
              <Badge variant="outline" className="border-white/30">
                Room {currentRoomIndex + 1}/{rooms.length}
              </Badge>
              {foundHiddenItems > 0 && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  ✨ {foundHiddenItems} hidden
                </Badge>
              )}
              <span className="text-white/70">Progress: {Math.round(progress)}%</span>
            </div>
            <div className="mt-2 bg-white/10 rounded-full p-0.5">
              <motion.div
                className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>


      {/* Bottom - Search clue + inventory */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute z-20 bottom-3 left-2 right-2 sm:bottom-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:max-w-xl pointer-events-auto"
      >
        {/* Search clue banner */}
        <Card className="bg-black/80 border-white/20 mb-2">
          <CardContent className="py-2 px-3 flex items-start gap-2">
            <Search className="h-4 w-4 mt-0.5 text-yellow-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs text-white/90 leading-snug">
                {searchClue}
              </p>
              {revealedClue && (
                <p className="text-[11px] sm:text-xs text-yellow-300 leading-snug mt-1">
                  {revealedClue}
                </p>
              )}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={revealSearchClue}
              className="h-8 px-2 shrink-0"
            >
              <Lightbulb className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Clue</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-black/80 border-white/20">
          <CardContent className="py-2 px-3 sm:px-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowInventory(!showInventory)}
                className="text-white text-xs sm:text-sm"
              >
                <Package className="h-4 w-4 mr-1" />
                Inventory ({inventory.length})
              </Button>
              
              <AnimatePresence>
                {showInventory && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2 flex-wrap"
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
                      <span className="text-gray-400 text-xs px-2">Empty</span>
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
                  className="mt-2 text-[11px] sm:text-xs text-gray-300 border-t border-white/20 pt-2 overflow-hidden"
                >
                  <strong>{selectedItem.name}:</strong> {selectedItem.description}
                  <br />
                  <span className="text-yellow-400">Tap an object in the scene to use it</span>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
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
              Clue
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
