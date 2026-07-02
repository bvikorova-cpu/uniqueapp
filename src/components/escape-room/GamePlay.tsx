import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Lightbulb, Boxes, Map } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Room3D from "./Room3D";
import { PanoramaEscapeRoom } from "./PanoramaEscapeRoom";
import { getRoomsForTheme, RoomData } from "./puzzleRooms";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface GamePlayProps {
  roomId: string;
  onExit: () => void;
}

const GamePlay = ({ roomId, onExit }: GamePlayProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [gameMode, setGameMode] = useState<"panorama" | "3d" | "classic">("panorama");

  useEffect(() => {
    loadRoom();
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [roomId, startTime]);

  const loadRoom = async () => {
    try {
      const { data: roomData, error: roomError } = await supabase
        .from("escape_rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (roomError) throw roomError;
      setRoom(roomData);

      // Load all 5 rooms for this escape room
      const { data: roomsData, error: roomsError } = await supabase
        .from("escape_room_rooms")
        .select("*")
        .eq("escape_room_id", roomId)
        .order("room_number");

      if (roomsError) throw roomsError;
      setRooms(roomsData || []);

      const { data: puzzleData, error: puzzleError } = await supabase
        .from("escape_room_puzzles")
        .select("*")
        .eq("room_id", roomId)
        .order("puzzle_order");

      if (puzzleError) throw puzzleError;
      setPuzzles(puzzleData || []);

      // Create session
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: session, error: sessionError } = await supabase
          .from("escape_room_sessions")
          .insert([{
            room_id: roomId,
            team_name: "Solo Player",
            status: "in_progress",
            started_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (sessionError) throw sessionError;
        setSessionId(session.id);

        await supabase
          .from("session_players")
          .insert([{
            session_id: session.id,
            user_id: user.id,
            role: "host"
          }]);
      }
    } catch (error) {
      console.error("Error loading room:", error);
      toast({
        title: "Error",
        description: "Failed to load escape room",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (!answer.trim()) return;

    toast({
      title: "Answer submitted",
      description: "Checking your answer..."
    });

    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
      setAnswer("");
    } else {
      completeRoom();
    }
  };

  const completeRoom = async () => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from("escape_room_sessions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          completion_time_seconds: elapsedTime,
          hints_used: hintsUsed,
          score: Math.max(0, 1000 - (elapsedTime * 2) - (hintsUsed * 50))
        })
        .eq("id", sessionId);

      if (error) throw error;

      toast({
        title: "🎉 Congratulations!",
        description: `You escaped all ${rooms.length} rooms in ${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toString().padStart(2, '0')}!`
      });

      setTimeout(onExit, 3000);
    } catch (error) {
      console.error("Error completing room:", error);
    }
  };

  const handleRoomComplete = () => {
    if (currentRoomIndex < rooms.length - 1) {
      setCurrentRoomIndex(currentRoomIndex + 1);
      toast({
        title: "Room Complete! 🎉",
        description: `Moving to room ${currentRoomIndex + 2}/${rooms.length}...`
      });
    } else {
      completeRoom();
    }
  };

  const useHint = () => {
    setHintsUsed(hintsUsed + 1);
    toast({
      title: "Hint",
      description: puzzles[currentPuzzleIndex]?.hint_text || "Try looking more carefully at the clues..."
    });
  };

  // State for panorama rooms with AI-generated URLs
  const [panoramaRooms, setPanoramaRooms] = useState<RoomData[]>(() => 
    getRoomsForTheme(room?.theme || "mystery")
  );

  // Update panorama rooms when theme changes
  useEffect(() => {
    setPanoramaRooms(getRoomsForTheme(room?.theme || "mystery"));
  }, [room?.theme]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const currentRoom = rooms[currentRoomIndex];
  const currentPuzzle = puzzles[currentPuzzleIndex];
  const progress = rooms.length > 0 ? ((currentRoomIndex + 1) / rooms.length) * 100 : 0;

  // Callback to update a room's panorama URL
  const handleUpdateRoomPanorama = (roomIndex: number, newUrl: string) => {
    setPanoramaRooms(prev => prev.map((r, idx) => 
      idx === roomIndex ? { ...r, panoramaUrl: newUrl } : r
    ));
  };


  // Panorama mode - main game mode
  if (gameMode === "panorama") {
    return (
      <PanoramaEscapeRoom
        theme={room?.theme || "mystery"}
        rooms={panoramaRooms}
        onComplete={(score, time) => {
          toast({
            title: "🎉 Gratulujem!",
            description: `You escaped in ${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')} with a score of ${score}!`
          });
          setTimeout(onExit, 3000);
        }}
        onExit={onExit}
        onUpdateRoomPanorama={handleUpdateRoomPanorama}
      />
    );
  }

  // 3D mode
  if (gameMode === "3d" && currentRoom) {
    return (
      <Room3D
        theme={room?.theme || "mystery"}
        currentRoom={currentRoomIndex + 1}
        totalRooms={rooms.length}
        roomName={currentRoom.room_name}
        roomDescription={currentRoom.description || ""}
        onRoomComplete={handleRoomComplete}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onExit}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit Room
            </Button>
            <Button variant="outline" onClick={() => setGameMode("panorama")}>
              <Map className="h-4 w-4 mr-2" />
              Panorama
            </Button>
            <Button variant="outline" onClick={() => setGameMode("3d")}>
              <Boxes className="h-4 w-4 mr-2" />
              3D Mode
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
            </div>
            <div className="flex items-center gap-1">
              <Lightbulb className="h-4 w-4" />
              {hintsUsed} hints
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{room?.title}</CardTitle>
              <span className="text-sm text-muted-foreground">
                Room {currentRoomIndex + 1} of {rooms.length}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="mb-4" />
            {currentRoom && (
              <div>
                <h3 className="font-semibold mb-1">{currentRoom.room_name}</h3>
                <p className="text-sm text-muted-foreground">{currentRoom.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {currentPuzzle && (
          <Card>
            <CardHeader>
              <CardTitle>{currentPuzzle.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose dark:prose-invert">
                <p>{currentPuzzle.description}</p>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Enter your answer..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSubmitAnswer()}
                />

                <div className="flex gap-2">
                  <Button onClick={handleSubmitAnswer} className="flex-1">
                    Submit Answer
                  </Button>
                  <Button variant="outline" onClick={useHint}>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Hint
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GamePlay;