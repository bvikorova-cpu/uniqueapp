import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Luggage, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const AIPackingList = ({ onBack }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [form, setForm] = useState({ destination: "", duration: "7", season: "summer", activities: "" });

  const generate = async () => {
    if (!form.destination) { toast({ title: "Enter a destination", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required");
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          prompt: `Create a comprehensive packing list for a ${form.duration}-day trip to ${form.destination} during ${form.season}. Activities planned: ${form.activities || "general travel"}. Organize by categories: Clothing, Toiletries, Electronics, Documents, First Aid, Accessories. Include quantities and tips for each item.`
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
      <FloatingHowItWorks title={"A I Packing List - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Packing List section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Packing List.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back to Hub</Button>
      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-background to-orange-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Luggage className="w-6 h-6 text-amber-500" />AI Packing Assistant<span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full ml-2">3 Credits</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Destination" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <Select value={form.duration} onValueChange={v => setForm({...form, duration: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["3","5","7","10","14","21","30"].map(d => <SelectItem key={d} value={d}>{d} days</SelectItem>)}</SelectContent>
            </Select>
            <Select value={form.season} onValueChange={v => setForm({...form, season: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="summer">Summer</SelectItem>
                <SelectItem value="winter">Winter</SelectItem>
                <SelectItem value="spring">Spring</SelectItem>
                <SelectItem value="autumn">Autumn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input placeholder="Planned activities (hiking, beach, business...)" value={form.activities} onChange={e => setForm({...form, activities: e.target.value})} />
          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {loading ? "Generating..." : "Generate Packing List"}
          </Button>
          {result && <Card className="bg-card/50"><CardContent className="pt-4 whitespace-pre-wrap text-sm">{result}</CardContent></Card>}
        </CardContent>
      </Card>
    </div>
    </>
  );
};
