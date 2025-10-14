import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Wand2, Sparkles } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";

export const SongGenerator = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("pop");
  const [mood, setMood] = useState("happy");
  const [tempo, setTempo] = useState([120]);
  const [loading, setLoading] = useState(false);
  const { credits, refresh } = useAICredits();

  const genres = [
    "pop", "rock", "hip-hop", "electronic", "jazz", "classical", 
    "country", "r&b", "reggae", "metal", "indie", "folk"
  ];

  const moods = [
    "happy", "sad", "energetic", "relaxed", "romantic", 
    "aggressive", "dreamy", "mysterious", "uplifting"
  ];

  const handleGenerate = async () => {
    if (!title || !description) {
      toast.error("Please fill in title and description");
      return;
    }

    if ((credits?.credits_remaining ?? 0) < 15) {
      toast.error("Insufficient credits. You need 15 credits.");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to generate songs");
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: {
          type: 'generate',
          title,
          description,
          genre,
          mood,
          tempo: tempo[0],
        }
      });

      if (error) throw error;

      toast.success("Song generation started! Check 'My Songs' tab.");
      refresh();
      
      // Reset form
      setTitle("");
      setDescription("");
      setGenre("pop");
      setMood("happy");
      setTempo([120]);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to generate song");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-purple-500" />
          Generate Original Song
        </h2>
        <p className="text-muted-foreground mb-6">
          AI will create a unique song with melody, beat, and lyrics. Cost: 15 credits
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Song Title</Label>
            <Input
              id="title"
              placeholder="e.g., Summer Nights"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="description">Song Description / Theme</Label>
            <Textarea
              id="description"
              placeholder="Describe the song's theme, mood, or story..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="genre">Genre</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mood">Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {moods.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Tempo: {tempo[0]} BPM</Label>
            <Slider
              value={tempo}
              onValueChange={setTempo}
              min={60}
              max={200}
              step={5}
              className="mt-2"
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={loading || (credits?.credits_remaining ?? 0) < 15}
            className="w-full gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Generating..." : "Generate Song (15 credits)"}
          </Button>

          {credits && (
            <p className="text-sm text-muted-foreground text-center">
              Remaining credits: {credits.credits_remaining}
            </p>
          )}
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <h3 className="text-xl font-bold mb-3">How It Works</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-purple-500 font-bold">1.</span>
            <span>AI analyzes your description and generates lyrics based on your theme</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 font-bold">2.</span>
            <span>Creates a melody and beat matching your chosen genre and mood</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 font-bold">3.</span>
            <span>Generates professional cover art for your song</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 font-bold">4.</span>
            <span>Exports to professional format (MP3) ready to download</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};
