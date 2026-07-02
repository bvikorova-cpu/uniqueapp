import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Compass, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const AILocalGuide = ({ onBack }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [form, setForm] = useState({ location: "", question: "" });

  const generate = async () => {
    if (!form.location) { toast({ title: "Enter a location", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required");
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          prompt: `Act as a knowledgeable local guide for ${form.location}. ${form.question ? `Answer this specific question: ${form.question}` : "Provide an insider's guide including: best local restaurants (not tourist traps), hidden gems, cultural etiquette, safety tips, best times to visit popular attractions, local transportation hacks, and money-saving tips."} Be detailed and practical.`
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
      <FloatingHowItWorks title={"A I Local Guide - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Local Guide section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Local Guide.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back to Hub</Button>
      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-background to-teal-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Compass className="w-6 h-6 text-emerald-500" />AI Local Guide<span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full ml-2">3 Credits</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Location (e.g., Barcelona, Kyoto, New York)" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          <Textarea placeholder="Ask a specific question (optional) — e.g., 'Best street food spots?' or 'How to avoid tourist scams?'" value={form.question} onChange={e => setForm({...form, question: e.target.value})} />
          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {loading ? "Generating..." : "Get Local Insights"}
          </Button>
          {result && <Card className="bg-card/50"><CardContent className="pt-4 whitespace-pre-wrap text-sm">{result}</CardContent></Card>}
        </CardContent>
      </Card>
    </div>
    </>
  );
};
