import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const AIBudgetCalculator = ({ onBack }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [form, setForm] = useState({ destination: "", duration: "7", travelers: "2", style: "medium" });

  const generate = async () => {
    if (!form.destination) { toast({ title: "Enter a destination", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required");
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          prompt: `Create a detailed travel budget breakdown for ${form.travelers} travelers visiting ${form.destination} for ${form.duration} days. Travel style: ${form.style}. Include: flights (estimated range), accommodation per night, daily food budget, local transportation, activities/attractions, shopping, insurance, visa costs if applicable, and emergency fund. Give totals per person and for the group. Use EUR currency. Format as a clear budget table.`
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
      <FloatingHowItWorks title={"A I Budget Calculator - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Budget Calculator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Budget Calculator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back to Hub</Button>
      <Card className="border-sky-500/20 bg-gradient-to-br from-sky-500/5 via-background to-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calculator className="w-6 h-6 text-sky-500" />AI Budget Calculator<span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full ml-2">3 Credits</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Destination" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} />
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Days" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} type="number" min="1" />
            <Input placeholder="Travelers" value={form.travelers} onChange={e => setForm({...form, travelers: e.target.value})} type="number" min="1" />
            <Select value={form.style} onValueChange={v => setForm({...form, style: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {loading ? "Calculating..." : "Calculate Budget"}
          </Button>
          {result && <Card className="bg-card/50"><CardContent className="pt-4 whitespace-pre-wrap text-sm">{result}</CardContent></Card>}
        </CardContent>
      </Card>
    </div>
    </>
  );
};
