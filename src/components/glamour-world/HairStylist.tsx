import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const hairStyles = ["Princess Curls", "Mermaid Waves", "Braided Crown", "Space Buns", "Fairy Updo", "Butterfly Clips Style", "Glitter Ponytail", "Rainbow Streaks"];
const hairTypes = ["Straight", "Wavy", "Curly", "Coily", "Fine", "Thick"];

export function HairStylist({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [style, setStyle] = useState("");
  const [hairType, setHairType] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const generate = async () => {
    if (!style) return toast({ title: "Select a hairstyle", variant: "destructive" });
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("glamour-ai-generate", {
        body: { type: "hair", prompt: `Create a ${style} hairstyle tutorial for ${hairType || "any"} hair. ${details}. Include: tools needed, step-by-step instructions, accessory suggestions, and how to maintain the style.`, coins: 3 },
      });
      if (error) throw error;
      setResult(data.result);
      await supabase.from("glamour_creations").insert({
        user_id: user.id, creation_type: "hair", title: style,
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
      <FloatingHowItWorks title={"Hair Stylist - How it works"} steps={[{ title: 'Open', desc: 'Access the Hair Stylist section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Hair Stylist.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <h2 className="text-2xl font-black">💇‍♀️ Hair Stylist</h2>
      <p className="text-muted-foreground">Get beautiful hairstyle tutorials!</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={style} onValueChange={setStyle}>
          <SelectTrigger><SelectValue placeholder="Hairstyle" /></SelectTrigger>
          <SelectContent>{hairStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={hairType} onValueChange={setHairType}>
          <SelectTrigger><SelectValue placeholder="Hair Type" /></SelectTrigger>
          <SelectContent>{hairTypes.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <Textarea placeholder="Details... (e.g., for prom, medium length)" value={details} onChange={e => setDetails(e.target.value)} />
      <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-pink-500 to-purple-500">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
        Style Hair (3 coins)
      </Button>
      {result && <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-400/20 rounded-xl p-6 whitespace-pre-wrap">{result}</div>}
    </div>
    </>
  );
}
