import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const themes = ["Pink Paradise", "Unicorn Dreams", "Starry Night", "Ocean Princess", "Flower Garden", "Cloud Nine", "Crystal Cave", "Candy Land"];

export function RoomDecorator({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [theme, setTheme] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const generate = async () => {
    if (!theme) return toast({ title: "Select a theme", variant: "destructive" });
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("glamour-ai-generate", {
        body: { type: "room_decor", prompt: `Design a ${theme} themed bedroom. ${details}. Include: wall colors, furniture, decorations, lighting, bedding, rugs, and DIY ideas.`, coins: 4 },
      });
      if (error) throw error;
      setResult(data.result);
      await supabase.from("glamour_creations").insert({
        user_id: user.id, creation_type: "room_decor", title: theme,
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
      <FloatingHowItWorks title={"Room Decorator - How it works"} steps={[{ title: 'Open', desc: 'Access the Room Decorator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Room Decorator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <h2 className="text-2xl font-black">🎀 Room Decorator</h2>
      <p className="text-muted-foreground">Design your dream room!</p>
      <Select value={theme} onValueChange={setTheme}>
        <SelectTrigger><SelectValue placeholder="Room Theme" /></SelectTrigger>
        <SelectContent>{themes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
      </Select>
      <Textarea placeholder="Your room details... (e.g., small room, loves purple)" value={details} onChange={e => setDetails(e.target.value)} />
      <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-purple-500 to-pink-500">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
        Design Room (4 coins)
      </Button>
      {result && <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl p-6 whitespace-pre-wrap">{result}</div>}
    </div>
    </>
  );
}
