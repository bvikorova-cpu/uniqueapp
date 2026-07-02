import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const genres = ["Pop Princess", "Fairy Lullaby", "Dance Party", "Magical Ballad", "Friendship Anthem", "Adventure Theme", "Nature Melody", "Inspirational"];

export function MusicBox({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [genre, setGenre] = useState("");
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const generate = async () => {
    if (!genre) return toast({ title: "Select a genre", variant: "destructive" });
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("glamour-ai-generate", {
        body: { type: "music", prompt: `Write a ${genre} song. Theme: ${theme || "being yourself"}. Include: song title, verse 1, chorus, verse 2, bridge, final chorus, and performance notes.`, coins: 4 },
      });
      if (error) throw error;
      setResult(data.result);
      await supabase.from("glamour_creations").insert({
        user_id: user.id, creation_type: "music", title: `${genre} Song`,
        prompt: theme, result_text: data.result, credits_used: 4,
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
      <FloatingHowItWorks title={"Music Box - How it works"} steps={[{ title: 'Open', desc: 'Access the Music Box section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Music Box.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <h2 className="text-2xl font-black">🎵 Music Box</h2>
      <p className="text-muted-foreground">Create your own magical songs!</p>
      <Select value={genre} onValueChange={setGenre}>
        <SelectTrigger><SelectValue placeholder="Song Genre" /></SelectTrigger>
        <SelectContent>{genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
      </Select>
      <Textarea placeholder="Song theme... (e.g., about friendship, being brave)" value={theme} onChange={e => setTheme(e.target.value)} />
      <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-pink-500 to-violet-500">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
        Write Song (4 coins)
      </Button>
      {result && <div className="bg-gradient-to-br from-pink-500/10 to-violet-500/10 border border-pink-400/20 rounded-xl p-6 whitespace-pre-wrap">{result}</div>}
    </div>
    </>
  );
}
