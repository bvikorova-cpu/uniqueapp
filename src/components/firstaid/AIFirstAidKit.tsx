import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Package, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function AIFirstAidKit({ onBack }: Props) {
  const [context, setContext] = useState("home");
  const [people, setPeople] = useState("4");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          prompt: `You are a first aid kit planning expert. Create a comprehensive, personalized first aid kit checklist for: Context: ${context}, Number of people: ${people}. Include: 1) Essential items with quantities, 2) Medications, 3) Specialized items for the context, 4) Maintenance schedule, 5) Estimated cost range in EUR. Format with clear categories and checkboxes (☐).`
        }
      });
      if (error) throw error;
      setResult(data?.message || "No result");
    } catch { toast.error("Generation failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I First Aid Kit - How it works"} steps={[{ title: 'Open', desc: 'Access the A I First Aid Kit section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I First Aid Kit.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <Button variant="outline" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back</Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-red-500" />AI First Aid Kit Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={context} onValueChange={setContext}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="home">Home & Family</SelectItem>
              <SelectItem value="car">Car / Road Trip</SelectItem>
              <SelectItem value="hiking">Hiking & Outdoor</SelectItem>
              <SelectItem value="workplace">Workplace / Office</SelectItem>
              <SelectItem value="sports">Sports & Athletics</SelectItem>
              <SelectItem value="travel">International Travel</SelectItem>
              <SelectItem value="baby">Baby & Toddler</SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" value={people} onChange={e => setPeople(e.target.value)} placeholder="Number of people" min="1" max="50" />
          <Button onClick={generate} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Building...</> : "Build Kit List (3 Credits)"}
          </Button>
          {result && <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap text-sm">{result}</div>}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
