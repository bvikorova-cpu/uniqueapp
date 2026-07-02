import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const styles = ["Pink Palace", "Fairy Tale Castle", "Beach House", "Treehouse", "Modern Penthouse", "Cottage Garden", "Crystal Tower", "Cloud Mansion"];
const rooms = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Pool Area", "Garden", "Rooftop Terrace", "Secret Room"];

export function DreamHouseBuilder({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [style, setStyle] = useState("");
  const [room, setRoom] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const generate = async () => {
    if (!style || !room) return toast({ title: "Select style and room", variant: "destructive" });
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");

      const { data, error } = await supabase.functions.invoke("glamour-ai-generate", {
        body: { type: "dream_house", prompt: `Design a ${style} style ${room}. Details: ${details}`, coins: 5 },
      });
      if (error) throw error;

      setResult(data.result);
      await supabase.from("glamour_creations").insert({
        user_id: user.id, creation_type: "dream_house", title: `${style} ${room}`,
        prompt: details, result_text: data.result, credits_used: 5,
      });
    } catch (e: any) {
      const isCoinsErr = e?.context?.status === 402 || (typeof e?.message === "string" && e.message.includes("insufficient_glamour_coins"));
        if (isCoinsErr) {
          toast({ title: "Not enough Glamour Coins ✨", description: "Buy more coins in the Coin Shop to keep creating!", variant: "destructive" });
        } else {
          toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Dream House Builder - How it works"} steps={[{ title: 'Open', desc: 'Access the Dream House Builder section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Dream House Builder.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <h2 className="text-2xl font-black">🏰 Dream House Builder</h2>
      <p className="text-muted-foreground">Design your perfect dream house room by room!</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={style} onValueChange={setStyle}>
          <SelectTrigger><SelectValue placeholder="House Style" /></SelectTrigger>
          <SelectContent>{styles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={room} onValueChange={setRoom}>
          <SelectTrigger><SelectValue placeholder="Room Type" /></SelectTrigger>
          <SelectContent>{rooms.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <Textarea placeholder="Describe your dream room... (e.g., pink walls, chandelier, cozy reading nook)" value={details} onChange={e => setDetails(e.target.value)} />
      <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-pink-500 to-purple-500">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
        Design Room (5 coins)
      </Button>
      {result && (
        <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-400/20 rounded-xl p-6 whitespace-pre-wrap">{result}</div>
      )}
    </div>
    </>
  );
}
