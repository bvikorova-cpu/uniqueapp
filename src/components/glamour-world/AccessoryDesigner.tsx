import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const types = ["Tiara", "Necklace", "Bracelet", "Earrings", "Handbag", "Hair Clip", "Sunglasses", "Watch", "Ring", "Bow"];

export function AccessoryDesigner({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const generate = async () => {
    if (!type) return toast({ title: "Select accessory type", variant: "destructive" });
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("glamour-ai-generate", {
        body: { type: "accessory", prompt: `Design a beautiful ${type}. Style: ${description}. Include materials, colors, gems, and styling tips.`, coins: 3 },
      });
      if (error) throw error;
      setResult(data.result);
      await supabase.from("glamour_creations").insert({
        user_id: user.id, creation_type: "accessory", title: `Custom ${type}`,
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
      <FloatingHowItWorks title={"Accessory Designer - How it works"} steps={[{ title: 'Open', desc: 'Access the Accessory Designer section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Accessory Designer.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <h2 className="text-2xl font-black">💎 Accessory Designer</h2>
      <p className="text-muted-foreground">Create stunning accessories with AI!</p>
      <Select value={type} onValueChange={setType}>
        <SelectTrigger><SelectValue placeholder="Accessory Type" /></SelectTrigger>
        <SelectContent>{types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
      </Select>
      <Textarea placeholder="Describe your dream accessory... (e.g., rose gold with diamonds)" value={description} onChange={e => setDescription(e.target.value)} />
      <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-rose-500 to-pink-500">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
        Design Accessory (3 coins)
      </Button>
      {result && <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-400/20 rounded-xl p-6 whitespace-pre-wrap">{result}</div>}
    </div>
    </>
  );
}
