import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Lightbulb, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GamePlayProps {
  roomId: string;
  onExit: () => void;
}

const GamePlay = ({ roomId, onExit }: GamePlayProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<any>(null);
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

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

    // Simple answer checking (in real app, this would be more sophisticated)
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
        description: `You completed the room in ${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toString().padStart(2, '0')}!`
      });

      setTimeout(onExit, 3000);
    } catch (error) {
      console.error("Error completing room:", error);
    }
  };

  const useHint = () => {
    setHintsUsed(hintsUsed + 1);
    toast({
      title: "Hint",
      description: puzzles[currentPuzzleIndex]?.hint_text || "Try looking more carefully at the clues..."
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const currentPuzzle = puzzles[currentPuzzleIndex];
  const progress = ((currentPuzzleIndex + 1) / puzzles.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onExit}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit Room
          </Button>
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
                Puzzle {currentPuzzleIndex + 1} of {puzzles.length}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="mb-4" />
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
