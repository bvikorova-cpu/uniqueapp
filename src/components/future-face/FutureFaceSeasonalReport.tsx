import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { handleEdgeError, throwIfInvokeError } from "@/lib/handleEdgeError";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const seasons = [
  { id: "spring", label: "🌸 Spring" },
  { id: "summer", label: "☀️ Summer" },
  { id: "autumn", label: "🍂 Autumn" },
  { id: "winter", label: "❄️ Winter" },
];

export default function FutureFaceSeasonalReport() {
  const [season, setSeason] = useState("summer");
  const [age, setAge] = useState("30");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!description.trim()) { toast({ title: "Please describe your skin", variant: "destructive" }); return; }
    try {
      setLoading(true);
      setResult("");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Please sign in first", variant: "destructive" }); return; }

      const res = await supabase.functions.invoke("future-face-ai", {
        body: { action: "seasonal_report", prompt: `Season: ${season}. ${description}`, age: parseInt(age) }
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
      <FloatingHowItWorks title={"Future Face Seasonal Report - How it works"} steps={[{ title: 'Open', desc: 'Access the Future Face Seasonal Report section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Future Face Seasonal Report.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">🌤️ Seasonal Skin Report</h2>
      <Card className="border-sky-500/20 bg-gradient-to-br from-sky-500/5 to-blue-500/5">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white">
              <Sun className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold">Seasonal Skincare Adaptation Plan</p>
              <p className="text-xs text-muted-foreground">Get a custom skincare plan adapted to the current season and weather conditions</p>
            </div>
            <Badge className="ml-auto bg-sky-500/20 text-sky-400 border-sky-500/30">5 CR</Badge>
          </div>

          <div className="flex gap-3 flex-wrap">
            {seasons.map(s => (
              <Button
                key={s.id}
                variant={season === s.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSeason(s.id)}
                className={season === s.id ? "bg-gradient-to-r from-sky-600 to-blue-600" : ""}
              >
                {s.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Your age" className="w-24" />
          </div>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your skin type, climate you live in, current concerns, sensitivity to weather changes..."
            rows={3}
          />
          <Button onClick={handleAnalyze} disabled={loading} className="w-full bg-gradient-to-r from-sky-600 to-blue-600">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
            {loading ? "Generating Report..." : "Get Seasonal Report (5 Credits)"}
          </Button>
          {result && (
            <Card className="bg-card/80 border-sky-500/20">
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
