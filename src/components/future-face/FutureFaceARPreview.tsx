import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ScanFace, Gem } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { handleEdgeError, throwIfInvokeError } from "@/lib/handleEdgeError";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const effects = [
  { id: "aging_10", label: "+10 Years" },
  { id: "aging_20", label: "+20 Years" },
  { id: "aging_30", label: "+30 Years" },
  { id: "rejuvenation", label: "Rejuvenation" },
  { id: "sun_damage", label: "Sun Damage Sim" },
  { id: "healthy_glow", label: "Healthy Glow" },
];

export default function FutureFaceARPreview() {
  const [effect, setEffect] = useState("aging_10");
  const [age, setAge] = useState("30");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!description.trim()) { toast({ title: "Please describe your face features", variant: "destructive" }); return; }
    try {
      setLoading(true);
      setResult("");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Please sign in first", variant: "destructive" }); return; }

      const res = await supabase.functions.invoke("future-face-ai", {
        body: { action: "ar_preview", prompt: `Effect: ${effect}. Description: ${description}`, age: parseInt(age) }
      });
      const data = throwIfInvokeError(res);
      setResult(data.result || "No result returned.");
    } catch (err: any) {
      if (!handleEdgeError(err, { navigate, context: "Future Face" })) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Future Face A R Preview - How it works"} steps={[{ title: 'Open', desc: 'Access the Future Face A R Preview section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Future Face A R Preview.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">📷 AR Face Preview</h2>
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
              <ScanFace className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold">Real-Time Face AR Simulation</p>
              <p className="text-xs text-muted-foreground">Select an aging effect and describe your features for a detailed AI simulation</p>
            </div>
            <Badge className="ml-auto bg-cyan-500/20 text-cyan-500 border-cyan-500/30">5 CR</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {effects.map(e => (
              <Button
                key={e.id}
                variant={effect === e.id ? "default" : "outline"}
                size="sm"
                onClick={() => setEffect(e.id)}
                className={effect === e.id ? "bg-gradient-to-r from-cyan-600 to-purple-600" : ""}
              >
                {e.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Your age" className="w-24" />
          </div>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your facial features: skin type, wrinkles, sun spots, overall appearance..."
            rows={3}
          />
          <Button onClick={handleAnalyze} disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-purple-600">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ScanFace className="h-4 w-4 mr-2" />}
            {loading ? "Simulating..." : "Run AR Simulation (5 Credits)"}
          </Button>
          {result && (
            <Card className="bg-card/80 border-cyan-500/20">
              <CardContent className="p-4 prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{result}</ReactMarkdown>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
