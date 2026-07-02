import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const danceStyles = ["Ballet", "Jazz", "Hip Hop", "Contemporary", "K-Pop", "Cheerleading", "Ballroom Waltz", "Latin"];

export function DanceStudio({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [style, setStyle] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const generate = async () => {
    if (!style) return toast({ title: "Select a dance style", variant: "destructive" });
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("glamour-ai-generate", {
        body: { type: "dance", prompt: `Create a ${style} dance choreography for ${level || "beginners"}. Include: warm-up, step-by-step moves, counts, music suggestion, outfit recommendation, and cool-down stretches.`, coins: 4 },
      });
      if (error) throw error;
      setResult(data.result);
      await supabase.from("glamour_creations").insert({
        user_id: user.id, creation_type: "dance", title: `${style} Choreography`,
        prompt: level, result_text: data.result, credits_used: 4,
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
      <FloatingHowItWorks title={"Dance Studio - How it works"} steps={[{ title: 'Open', desc: 'Access the Dance Studio section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Dance Studio.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <h2 className="text-2xl font-black">💃 Dance Studio</h2>
      <p className="text-muted-foreground">Learn amazing dance choreographies!</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={style} onValueChange={setStyle}>
          <SelectTrigger><SelectValue placeholder="Dance Style" /></SelectTrigger>
          <SelectContent>{danceStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger><SelectValue placeholder="Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-fuchsia-500 to-pink-500">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
        Get Choreography (4 coins)
      </Button>
      {result && <div className="bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 border border-fuchsia-400/20 rounded-xl p-6 whitespace-pre-wrap">{result}</div>}
    </div>
    </>
  );
}
