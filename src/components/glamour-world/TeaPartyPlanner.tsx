import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const themes = ["Royal Tea Party", "Garden Party", "Alice in Wonderland", "Mermaid Splash", "Pajama Party", "Spa Day", "Fairy Picnic", "Rainbow Celebration"];

export function TeaPartyPlanner({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [theme, setTheme] = useState("");
  const [guests, setGuests] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const generate = async () => {
    if (!theme) return toast({ title: "Select a theme", variant: "destructive" });
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("glamour-ai-generate", {
        body: { type: "party", prompt: `Plan a ${theme} party. Guests: ${guests || "5 friends"}. Include: decorations, dress code, food menu, activities, games, music playlist, and party favors.`, coins: 4 },
      });
      if (error) throw error;
      setResult(data.result);
      await supabase.from("glamour_creations").insert({
        user_id: user.id, creation_type: "party", title: theme,
        prompt: guests, result_text: data.result, credits_used: 4,
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
      <FloatingHowItWorks title={"Tea Party Planner - How it works"} steps={[{ title: 'Open', desc: 'Access the Tea Party Planner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tea Party Planner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <h2 className="text-2xl font-black">🫖 Party Planner</h2>
      <p className="text-muted-foreground">Plan the most magical parties!</p>
      <Select value={theme} onValueChange={setTheme}>
        <SelectTrigger><SelectValue placeholder="Party Theme" /></SelectTrigger>
        <SelectContent>{themes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
      </Select>
      <Textarea placeholder="Guest details... (e.g., 8 girls, ages 10-12)" value={guests} onChange={e => setGuests(e.target.value)} />
      <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-pink-500 to-purple-500">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
        Plan Party (4 coins)
      </Button>
      {result && <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-400/20 rounded-xl p-6 whitespace-pre-wrap">{result}</div>}
    </div>
    </>
  );
}
