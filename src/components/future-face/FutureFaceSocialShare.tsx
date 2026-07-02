import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { handleEdgeError, throwIfInvokeError } from "@/lib/handleEdgeError";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export default function FutureFaceSocialShare() {
  const [age, setAge] = useState("30");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!description.trim()) { toast({ title: "Please describe what to share", variant: "destructive" }); return; }
    try {
      setLoading(true);
      setResult("");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Please sign in first", variant: "destructive" }); return; }

      const res = await supabase.functions.invoke("future-face-ai", {
        body: { action: "social_share", prompt: description, age: parseInt(age) }
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
      <FloatingHowItWorks title={"Future Face Social Share - How it works"} steps={[{ title: 'Open', desc: 'Access the Future Face Social Share section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Future Face Social Share.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">📱 Social Transformation Cards</h2>
      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <Share2 className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold">AI Transformation Card Generator</p>
              <p className="text-xs text-muted-foreground">Generate stunning before/after transformation cards with AI captions for social media</p>
            </div>
            <Badge className="ml-auto bg-amber-500/20 text-amber-400 border-amber-500/30">4 CR</Badge>
          </div>

          <div className="flex gap-2">
            <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Your age" className="w-24" />
          </div>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your transformation journey: what you changed, results you've seen, your skincare routine highlights, lifestyle changes..."
            rows={3}
          />
          <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-amber-600 to-orange-600">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
            {loading ? "Creating Card..." : "Generate Transformation Card (4 Credits)"}
          </Button>
          {result && (
            <Card className="bg-card/80 border-amber-500/20">
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
