import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Wand2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function AIVirtualStylistSession() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [preferences, setPreferences] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { credits } = useAICredits();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); setResult(null); }
  };

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      let imageUrl = "";
      if (selectedFile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const fileName = `${user.id}/${Date.now()}.${selectedFile.name.split('.').pop()}`;
        const { error } = await supabase.storage.from("fashion-uploads").upload(fileName, selectedFile);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from("fashion-uploads").getPublicUrl(fileName);
        imageUrl = publicUrl;
      }
      const { data, error: fnError } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "virtual-stylist", imageUrl, preferences: preferences || "Complete styling session with seasonal and occasion-based recommendations" }
      });
      if (fnError) throw fnError;
      setResult(data.analysis);
      toast.success("Styling session complete!");
    } catch (err: any) { toast.error(err.message || "Error"); } finally { setIsAnalyzing(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How AIVirtual Stylist Session works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20">
          <CardHeader><CardTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5 text-purple-500" /> Virtual Stylist Session</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Get a comprehensive AI styling consultation with wardrobe analysis and personalized recommendations. <strong>Cost: 15 credits</strong></p>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {previewUrl ? <img src={previewUrl} alt="Style" className="w-full h-full object-cover" /> : (
                <div className="text-center p-8">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <label htmlFor="stylist-upload"><Button variant="outline" asChild><span>Upload Photo (optional)</span></Button></label>
                  <input id="stylist-upload" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </div>
              )}
            </div>
            <Textarea placeholder="Your style preferences, body type, lifestyle, upcoming events..." value={preferences} onChange={e => setPreferences(e.target.value)} rows={3} />
            <Button className="w-full" onClick={handleAnalyze} disabled={isAnalyzing || !credits || credits.credits_remaining < 15}>
              {isAnalyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Styling...</> : "Start Stylist Session (15 credits)"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 backdrop-blur-xl"><CardHeader><CardTitle>Stylist Session Report</CardTitle></CardHeader>
            <CardContent><div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div></CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
    );
}
