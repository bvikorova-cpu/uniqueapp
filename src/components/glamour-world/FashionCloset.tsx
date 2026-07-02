import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const occasions = ["Party", "School", "Beach Day", "Picnic", "Sleepover", "Dance Recital", "Royal Ball", "Movie Night"];
const seasons = ["Spring", "Summer", "Autumn", "Winter"];

export function FashionCloset({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [occasion, setOccasion] = useState("");
  const [season, setSeason] = useState("");
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const generate = async () => {
    if (!occasion) return toast({ title: "Select an occasion", variant: "destructive" });
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("glamour-ai-generate", {
        body: { type: "outfit", prompt: `Create a perfect ${season} outfit for a ${occasion}. Preferences: ${preferences}. Include: top, bottom, shoes, accessories, hairstyle suggestion, and color palette.`, coins: 4 },
      });
      if (error) throw error;
      setResult(data.result);
      await supabase.from("glamour_creations").insert({
        user_id: user.id, creation_type: "outfit", title: `${occasion} Outfit`,
        prompt: preferences, result_text: data.result, credits_used: 4,
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
      <FloatingHowItWorks title={"Fashion Closet - How it works"} steps={[{ title: 'Open', desc: 'Access the Fashion Closet section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Fashion Closet.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <h2 className="text-2xl font-black">👗 Fashion Closet</h2>
      <p className="text-muted-foreground">Get AI-designed outfits for every occasion!</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={occasion} onValueChange={setOccasion}>
          <SelectTrigger><SelectValue placeholder="Occasion" /></SelectTrigger>
          <SelectContent>{occasions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={season} onValueChange={setSeason}>
          <SelectTrigger><SelectValue placeholder="Season" /></SelectTrigger>
          <SelectContent>{seasons.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <Textarea placeholder="Your style preferences... (e.g., love pink, sparkly, comfortable)" value={preferences} onChange={e => setPreferences(e.target.value)} />
      <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-pink-500 to-fuchsia-500">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
        Create Outfit (4 coins)
      </Button>
      {result && <div className="bg-gradient-to-br from-pink-500/10 to-fuchsia-500/10 border border-pink-400/20 rounded-xl p-6 whitespace-pre-wrap">{result}</div>}
    </div>
    </>
  );
}
