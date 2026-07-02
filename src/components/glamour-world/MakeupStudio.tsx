import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const looks = ["Natural Glow", "Glitter Glam", "Princess Pink", "Mermaid Magic", "Fairy Sparkle", "Rainbow Eyes", "Sunset Ombre", "Ice Queen"];

export function MakeupStudio({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [look, setLook] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const generate = async () => {
    if (!look) return toast({ title: "Select a look", variant: "destructive" });
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("glamour-ai-generate", {
        body: { type: "makeup", prompt: `Create a ${look} makeup tutorial. ${details}. Include step-by-step instructions, product suggestions, and tips.`, coins: 4 },
      });
      if (error) throw error;
      setResult(data.result);
      await supabase.from("glamour_creations").insert({
        user_id: user.id, creation_type: "makeup", title: look,
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
      <FloatingHowItWorks title={"Makeup Studio - How it works"} steps={[{ title: 'Open', desc: 'Access the Makeup Studio section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Makeup Studio.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <h2 className="text-2xl font-black">💄 Makeup Studio</h2>
      <p className="text-muted-foreground">Get AI-powered makeup tutorials and looks!</p>
      <Select value={look} onValueChange={setLook}>
        <SelectTrigger><SelectValue placeholder="Choose a Look" /></SelectTrigger>
        <SelectContent>{looks.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
      </Select>
      <Textarea placeholder="Any preferences... (e.g., for blue eyes, pale skin)" value={details} onChange={e => setDetails(e.target.value)} />
      <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-pink-500 to-rose-500">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
        Create Look (4 coins)
      </Button>
      {result && <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-400/20 rounded-xl p-6 whitespace-pre-wrap">{result}</div>}
    </div>
    </>
  );
}
