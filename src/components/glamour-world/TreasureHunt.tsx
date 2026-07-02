import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const locations = ["Indoor - Home", "Backyard", "Park", "School", "Shopping Mall", "Beach", "Library", "Neighborhood"];

export function TreasureHunt({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const generate = async () => {
    if (!location) return toast({ title: "Select a location", variant: "destructive" });
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("glamour-ai-generate", {
        body: { type: "treasure_hunt", prompt: `Create a magical treasure hunt for ${location}. ${details}. Include: 10 clues with riddles, hiding spots, a treasure map description, prize ideas, and theme decorations.`, coins: 4 },
      });
      if (error) throw error;
      setResult(data.result);
      await supabase.from("glamour_creations").insert({
        user_id: user.id, creation_type: "treasure_hunt", title: `Treasure Hunt - ${location}`,
        prompt: details, result_text: data.result, credits_used: 4,
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
      <FloatingHowItWorks title={"Treasure Hunt - How it works"} steps={[{ title: 'Open', desc: 'Access the Treasure Hunt section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Treasure Hunt.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <h2 className="text-2xl font-black">🗺️ Treasure Hunt</h2>
      <p className="text-muted-foreground">Create epic treasure hunts with riddles!</p>
      <Select value={location} onValueChange={setLocation}>
        <SelectTrigger><SelectValue placeholder="Hunt Location" /></SelectTrigger>
        <SelectContent>{locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
      </Select>
      <Textarea placeholder="Details... (e.g., 6 players, ages 8-12, princess theme)" value={details} onChange={e => setDetails(e.target.value)} />
      <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-amber-500 to-pink-500">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
        Create Hunt (4 coins)
      </Button>
      {result && <div className="bg-gradient-to-br from-amber-500/10 to-pink-500/10 border border-amber-400/20 rounded-xl p-6 whitespace-pre-wrap">{result}</div>}
    </div>
    </>
  );
}
