import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Dna } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { handleEdgeError, throwIfInvokeError } from "@/lib/handleEdgeError";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export default function FutureFaceDNAAging() {
  const [age, setAge] = useState("30");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!description.trim()) { toast({ title: "Please describe your genetic background", variant: "destructive" }); return; }
    try {
      setLoading(true);
      setResult("");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Please sign in first", variant: "destructive" }); return; }

      const res = await supabase.functions.invoke("future-face-ai", {
        body: { action: "dna_aging", prompt: description, age: parseInt(age) }
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
      <FloatingHowItWorks title={"Future Face D N A Aging - How it works"} steps={[{ title: 'Open', desc: 'Access the Future Face D N A Aging section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Future Face D N A Aging.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">🧬 DNA-Based Aging Prediction</h2>
      <Card className="border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/5 to-pink-500/5">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white">
              <Dna className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold">Genetic Aging Prediction Engine</p>
              <p className="text-xs text-muted-foreground">AI analysis based on ethnic background, family history & genetic markers</p>
            </div>
            <Badge className="ml-auto bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30">6 CR</Badge>
          </div>

          <div className="flex gap-2">
            <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Your age" className="w-24" />
          </div>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your genetic background: ethnicity, family aging patterns, parents' skin at older age, known genetic conditions, hair graying pattern..."
            rows={4}
          />
          <Button onClick={handleAnalyze} disabled={loading} className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-600">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Dna className="h-4 w-4 mr-2" />}
            {loading ? "Analyzing DNA Patterns..." : "Run DNA Aging Analysis (6 Credits)"}
          </Button>
          {result && (
            <Card className="bg-card/80 border-fuchsia-500/20">
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
