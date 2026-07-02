import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const AICulturalGuide = ({ onBack }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [destination, setDestination] = useState("");

  const generate = async () => {
    if (!destination) { toast({ title: "Enter a destination", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required");
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          prompt: `Provide a comprehensive cultural guide for travelers visiting ${destination}. Include: greeting customs, dress codes, dining etiquette, tipping culture, religious sensitivities, local gestures to avoid, basic phrases in the local language (with pronunciation), public behavior norms, photography rules, negotiation/bargaining customs, and important local holidays or events. Be respectful and thorough.`
        }
      });
      if (error) throw error;
      setResult(data.message || data.text);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Cultural Guide - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Cultural Guide section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Cultural Guide.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back to Hub</Button>
      <Card className="border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-background to-pink-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="w-6 h-6 text-rose-500" />AI Cultural Guide<span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full ml-2">3 Credits</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Country or city (e.g., Japan, Morocco, India)" value={destination} onChange={e => setDestination(e.target.value)} />
          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {loading ? "Generating..." : "Get Cultural Guide"}
          </Button>
          {result && <Card className="bg-card/50"><CardContent className="pt-4 whitespace-pre-wrap text-sm">{result}</CardContent></Card>}
        </CardContent>
      </Card>
    </div>
    </>
  );
};
