import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const moods = ["Happy ☀️", "Excited 🎉", "Creative 🎨", "Dreamy 🌙", "Grateful 💖", "Adventurous 🗺️", "Calm 🧘", "Inspired ✨"];

export function DiaryJournal({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [mood, setMood] = useState("");
  const [entry, setEntry] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const generate = async () => {
    if (!entry) return toast({ title: "Write something in your diary", variant: "destructive" });
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("glamour-ai-generate", {
        body: { type: "diary", prompt: `Respond to this diary entry as a magical AI best friend. Mood: ${mood}. Entry: "${entry}". Give encouragement, fun advice, a motivational quote, and suggest a fun activity for the day.`, coins: 3 },
      });
      if (error) throw error;
      setResult(data.result);
      await supabase.from("glamour_creations").insert({
        user_id: user.id, creation_type: "diary", title: `Diary - ${mood || "Today"}`,
        prompt: entry, result_text: data.result, credits_used: 3,
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
      <FloatingHowItWorks title={"Diary Journal - How it works"} steps={[{ title: 'Open', desc: 'Access the Diary Journal section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Diary Journal.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <h2 className="text-2xl font-black">📓 Magic Diary</h2>
      <p className="text-muted-foreground">Your AI best friend diary companion!</p>
      <Select value={mood} onValueChange={setMood}>
        <SelectTrigger><SelectValue placeholder="How are you feeling?" /></SelectTrigger>
        <SelectContent>{moods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
      </Select>
      <Textarea placeholder="Dear Diary..." rows={5} value={entry} onChange={e => setEntry(e.target.value)} />
      <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-pink-500 to-purple-500">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
        Get AI Response (3 coins)
      </Button>
      {result && <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-400/20 rounded-xl p-6 whitespace-pre-wrap">{result}</div>}
    </div>
    </>
  );
}
