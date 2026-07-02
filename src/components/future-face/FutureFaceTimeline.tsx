import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, CalendarDays, Gem } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { handleEdgeError, throwIfInvokeError } from "@/lib/handleEdgeError";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export default function FutureFaceTimeline() {
  const [age, setAge] = useState("30");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!description.trim()) { toast({ title: "Please describe your current skin state", variant: "destructive" }); return; }
    try {
      setLoading(true);
      setResult("");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Please sign in first", variant: "destructive" }); return; }

      const res = await supabase.functions.invoke("future-face-ai", {
        body: { action: "before_after_timeline", prompt: description, age: parseInt(age) }
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
      <FloatingHowItWorks title={"Future Face Timeline - How it works"} steps={[{ title: 'Open', desc: 'Access the Future Face Timeline section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Future Face Timeline.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">📅 Before & After Timeline</h2>
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold">Skin Improvement Photo Journal</p>
              <p className="text-xs text-muted-foreground">Track your skin journey and get AI predictions for improvement milestones</p>
            </div>
            <Badge className="ml-auto bg-indigo-500/20 text-indigo-400 border-indigo-500/30">5 CR</Badge>
          </div>

          <div className="flex gap-2">
            <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Your age" className="w-24" />
          </div>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your current skin state: concerns, what products you use, your routine, any recent changes..."
            rows={3}
          />
          <Button onClick={handleAnalyze} disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CalendarDays className="h-4 w-4 mr-2" />}
            {loading ? "Generating Timeline..." : "Generate Improvement Timeline (5 Credits)"}
          </Button>
          {result && (
            <Card className="bg-card/80 border-indigo-500/20">
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
