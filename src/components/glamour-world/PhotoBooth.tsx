import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const filters = ["Fairy Dust", "Princess Crown", "Butterfly Wings", "Rainbow Aura", "Starlight Glow", "Rose Petals", "Diamond Sparkle", "Mermaid Scales"];

export function PhotoBooth({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [filter, setFilter] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const generate = async () => {
    if (!filter) return toast({ title: "Select a filter", variant: "destructive" });
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("glamour-ai-generate", {
        body: { type: "photo_booth", prompt: `Create a magical ${filter} photo booth concept. ${description}. Include: backdrop design, props list, pose suggestions, lighting tips, and Instagram caption ideas.`, coins: 3 },
      });
      if (error) throw error;
      setResult(data.result);
      await supabase.from("glamour_creations").insert({
        user_id: user.id, creation_type: "photo_booth", title: filter,
        prompt: description, result_text: data.result, credits_used: 3,
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
      <FloatingHowItWorks title={"Photo Booth - How it works"} steps={[{ title: 'Open', desc: 'Access the Photo Booth section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Photo Booth.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <h2 className="text-2xl font-black">📸 Photo Booth</h2>
      <p className="text-muted-foreground">Create magical photo shoot concepts!</p>
      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger><SelectValue placeholder="Magic Filter" /></SelectTrigger>
        <SelectContent>{filters.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
      </Select>
      <Textarea placeholder="Details... (e.g., for birthday party, outdoor setting)" value={description} onChange={e => setDescription(e.target.value)} />
      <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-pink-500 to-purple-500">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
        Create Concept (3 coins)
      </Button>
      {result && <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-400/20 rounded-xl p-6 whitespace-pre-wrap">{result}</div>}
    </div>
    </>
  );
}
