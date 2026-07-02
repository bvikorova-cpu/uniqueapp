import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Puzzle {
  title: string;
  description: string;
  puzzle_type: string;
  puzzle_data: any;
  solution: any;
  hint_text: string;
}

const RoomBuilder = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [roomData, setRoomData] = useState({
    title: "",
    description: "",
    difficulty: "medium",
    theme: "mystery",
    price: "0",
    duration_minutes: "60",
    max_players: "6",
    room_type: "multiplayer"
  });

  const addPuzzle = () => {
    setPuzzles([...puzzles, {
      title: "",
      description: "",
      puzzle_type: "riddle",
      puzzle_data: {},
      solution: {},
      hint_text: ""
    }]);
  };

  const removePuzzle = (index: number) => {
    setPuzzles(puzzles.filter((_, i) => i !== index));
  };

  const updatePuzzle = (index: number, field: string, value: any) => {
    const updated = [...puzzles];
    updated[index] = { ...updated[index], [field]: value };
    setPuzzles(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a room",
          variant: "destructive"
        });
        return;
      }

      // Create room
      const { data: room, error: roomError } = await supabase
        .from("escape_rooms")
        .insert([{
          creator_id: user.id,
          title: roomData.title,
          description: roomData.description,
          difficulty: roomData.difficulty,
          theme: roomData.theme,
          price: parseFloat(roomData.price),
          duration_minutes: parseInt(roomData.duration_minutes),
          max_players: parseInt(roomData.max_players),
          room_type: roomData.room_type,
          is_published: false
        }])
        .select()
        .single();

      if (roomError) throw roomError;

      // Add puzzles
      if (puzzles.length > 0) {
        const puzzleData = puzzles.map((puzzle, index) => ({
          room_id: room.id,
          puzzle_order: index + 1,
          ...puzzle,
          puzzle_data: JSON.stringify(puzzle.puzzle_data),
          solution: JSON.stringify(puzzle.solution)
        }));

        const { error: puzzleError } = await supabase
          .from("escape_room_puzzles")
          .insert(puzzleData);

        if (puzzleError) throw puzzleError;
      }

      toast({
        title: "Success",
        description: "Room created successfully! Publish it to make it available."
      });

      // Reset form
      setRoomData({
        title: "",
        description: "",
        difficulty: "medium",
        theme: "mystery",
        price: "0",
        duration_minutes: "60",
        max_players: "6",
        room_type: "multiplayer"
      });
      setPuzzles([]);
    } catch (error) {
      console.error("Error creating room:", error);
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Room Builder - How it works"} steps={[{ title: 'Open', desc: 'Access the Room Builder section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Room Builder.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
      <CardHeader>
        <CardTitle>Create Your Escape Room</CardTitle>
        <CardDescription>
          Design puzzles, set difficulty, and earn 70% from player fees
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Room Title</Label>
              <Input
                id="title"
                value={roomData.title}
                onChange={(e) => setRoomData({...roomData, title: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={roomData.theme} onValueChange={(v) => setRoomData({...roomData, theme: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horror">👻 Horror</SelectItem>
                  <SelectItem value="mystery">🔍 Mystery</SelectItem>
                  <SelectItem value="sci-fi">🚀 Sci-Fi</SelectItem>
                  <SelectItem value="adventure">🗺️ Adventure</SelectItem>
                  <SelectItem value="fantasy">🧙‍♂️ Fantasy</SelectItem>
                  <SelectItem value="educational">📚 Educational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={roomData.difficulty} onValueChange={(v) => setRoomData({...roomData, difficulty: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (€)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={roomData.price}
                onChange={(e) => setRoomData({...roomData, price: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={roomData.duration_minutes}
                onChange={(e) => setRoomData({...roomData, duration_minutes: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_players">Max Players</Label>
              <Input
                id="max_players"
                type="number"
                value={roomData.max_players}
                onChange={(e) => setRoomData({...roomData, max_players: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={roomData.description}
              onChange={(e) => setRoomData({...roomData, description: e.target.value})}
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Puzzles</h3>
              <Button type="button" onClick={addPuzzle} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Puzzle
              </Button>
            </div>

            {puzzles.map((puzzle, index) => (
              <Card key={index}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Puzzle {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePuzzle(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Puzzle Title"
                      value={puzzle.title}
                      onChange={(e) => updatePuzzle(index, "title", e.target.value)}
                    />
                    <Select
                      value={puzzle.puzzle_type}
                      onValueChange={(v) => updatePuzzle(index, "puzzle_type", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="riddle">Riddle</SelectItem>
                        <SelectItem value="code">Code Breaking</SelectItem>
                        <SelectItem value="pattern">Pattern Recognition</SelectItem>
                        <SelectItem value="logic">Logic Puzzle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Textarea
                    placeholder="Puzzle Description"
                    value={puzzle.description}
                    onChange={(e) => updatePuzzle(index, "description", e.target.value)}
                  />

                  <Input
                    placeholder="Hint (optional)"
                    value={puzzle.hint_text}
                    onChange={(e) => updatePuzzle(index, "hint_text", e.target.value)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Room (Draft)"}
          </Button>
        </form>
      </CardContent>
    </Card>
    </>
  );
};

export default RoomBuilder;
