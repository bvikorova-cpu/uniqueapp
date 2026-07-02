import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const categories = ["Cupcakes", "Cookies", "Cake Pops", "Smoothie Bowl", "Ice Cream", "Macarons", "Hot Chocolate", "Candy", "Pancake Art", "Fruit Art"];

export function RecipeBaker({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [category, setCategory] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const generate = async () => {
    if (!category) return toast({ title: "Select a category", variant: "destructive" });
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("glamour-ai-generate", {
        body: { type: "recipe", prompt: `Create a magical ${category} recipe. ${details}. Include: ingredients, step-by-step instructions, decoration ideas, presentation tips, and a fun name for the creation.`, coins: 3 },
      });
      if (error) throw error;
      setResult(data.result);
      await supabase.from("glamour_creations").insert({
        user_id: user.id, creation_type: "recipe", title: `${category} Recipe`,
        prompt: details, result_text: data.result, credits_used: 3,
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
      <FloatingHowItWorks title={"Recipe Baker - How it works"} steps={[{ title: 'Open', desc: 'Access the Recipe Baker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Recipe Baker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <h2 className="text-2xl font-black">🧁 Recipe Baker</h2>
      <p className="text-muted-foreground">Create magical sweet recipes!</p>
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger><SelectValue placeholder="What to bake?" /></SelectTrigger>
        <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
      </Select>
      <Textarea placeholder="Details... (e.g., pink theme, unicorn shape, no nuts)" value={details} onChange={e => setDetails(e.target.value)} />
      <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-pink-500 to-orange-400">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
        Create Recipe (3 coins)
      </Button>
      {result && <div className="bg-gradient-to-br from-pink-500/10 to-orange-500/10 border border-pink-400/20 rounded-xl p-6 whitespace-pre-wrap">{result}</div>}
    </div>
    </>
  );
}
