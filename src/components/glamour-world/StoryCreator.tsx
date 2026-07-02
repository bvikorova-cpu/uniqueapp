import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const genres = ["Fairy Tale", "Princess Adventure", "Mermaid Story", "Magic School", "Enchanted Forest", "Space Princess", "Animal Kingdom", "Fashion World"];

export function StoryCreator({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [characters, setCharacters] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const { data: stories } = useQuery({
    queryKey: ["glamour-stories"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("glamour_stories").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
  });

  const generate = async () => {
    if (!title || !genre) return toast({ title: "Add title and genre", variant: "destructive" });
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("glamour-ai-generate", {
        body: { type: "story", prompt: `Write a magical ${genre} story titled "${title}". Characters: ${characters || "a brave princess"}. Make it enchanting, fun, and with a happy ending. Include dialogue and vivid descriptions.`, coins: 5 },
      });
      if (error) throw error;
      setResult(data.result);
      await supabase.from("glamour_stories").insert({
        user_id: user.id, title, genre: genre.toLowerCase().replace(/ /g, "_"),
        story_text: data.result, credits_used: 5,
      });
    } catch (e: any) {
      const isCoinsErr = e?.context?.status === 402 || (typeof e?.message === "string" && e.message.includes("insufficient_glamour_coins"));
        if (isCoinsErr) {
          toast({ title: "Not enough Glamour Coins ✨", description: "Buy more coins in the Coin Shop to keep creating!", variant: "destructive" });
        } else {
          toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Story Creator - How it works"} steps={[{ title: 'Open', desc: 'Access the Story Creator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Story Creator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <h2 className="text-2xl font-black">📖 Story Creator</h2>
      <p className="text-muted-foreground">Create magical fairy tales with AI!</p>
      <Input placeholder="Story title" value={title} onChange={e => setTitle(e.target.value)} />
      <Select value={genre} onValueChange={setGenre}>
        <SelectTrigger><SelectValue placeholder="Genre" /></SelectTrigger>
        <SelectContent>{genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
      </Select>
      <Textarea placeholder="Your characters... (e.g., Luna the brave princess and her magical cat)" value={characters} onChange={e => setCharacters(e.target.value)} />
      <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-purple-500 to-pink-500">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BookOpen className="h-4 w-4 mr-2" />}
        Write Story (5 coins)
      </Button>
      {result && <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl p-6 whitespace-pre-wrap max-h-96 overflow-y-auto">{result}</div>}
      {stories && stories.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold">Your Stories</h3>
          {stories.map(s => (
            <div key={s.id} className="bg-card border border-pink-400/20 rounded-lg p-3">
              <p className="font-semibold text-sm">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.genre} • {new Date(s.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
