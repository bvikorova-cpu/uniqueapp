import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const CATEGORIES = [
  "Superhero",
  "Anime",
  "Fantasy",
  "Sci-Fi",
  "Cartoon",
  "Villain"
];

export const CharacterCreator = () => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const queryClient = useQueryClient();

  const createCharacter = useMutation({
    mutationFn: async (data: { name: string; category: string; description: string; isPremium: boolean }) => {
      const { data: result, error } = await supabase.functions.invoke('create-character', {
        body: data
      });

      if (error) throw error;
      return result;
    },
    onSuccess: async (aiResult) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save character to database
      const { error } = await supabase
        .from('characters')
        .insert({
          user_id: user.id,
          name,
          category,
          description,
          backstory: aiResult.backstory,
          image_url: aiResult.imageUrl,
          hp: aiResult.stats.hp,
          attack: aiResult.stats.attack,
          defense: aiResult.stats.defense,
          speed: aiResult.stats.speed,
          is_premium: isPremium,
        });

      if (error) throw error;

      toast.success("Character created successfully!");
      queryClient.invalidateQueries({ queryKey: ["character-credits"] });
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      
      // Reset form
      setName("");
      setCategory("");
      setDescription("");
      setIsPremium(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create character");
    },
  });

  const handleCreate = () => {
    if (!name || !category || !description) {
      toast.error("Please fill in all fields");
      return;
    }

    createCharacter.mutate({ name, category, description, isPremium });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-6 w-6 text-purple-500" />
        <h2 className="text-2xl font-bold text-foreground">Create Your Character</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-foreground text-sm mb-2 block">Character Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter character name..."
            disabled={createCharacter.isPending}
          />
        </div>

        <div>
          <label className="text-foreground text-sm mb-2 block">Category</label>
          <Select value={category} onValueChange={setCategory} disabled={createCharacter.isPending}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-foreground text-sm mb-2 block">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your character's appearance, powers, and personality..."
            className="min-h-[100px]"
            disabled={createCharacter.isPending}
          />
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={() => setIsPremium(false)}
            variant={!isPremium ? "default" : "outline"}
            disabled={createCharacter.isPending}
          >
            Basic (5 credits)
          </Button>
          <Button
            onClick={() => setIsPremium(true)}
            variant={isPremium ? "default" : "outline"}
            disabled={createCharacter.isPending}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Premium (15 credits)
          </Button>
        </div>

        <Button
          onClick={handleCreate}
          disabled={createCharacter.isPending}
          className="w-full"
          size="lg"
        >
          {createCharacter.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Character...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Create Character
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
