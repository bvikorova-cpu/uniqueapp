import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, BookOpen, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function AIFashionHistoryExplorer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { credits } = useAICredits();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); setResult(null); }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) { toast.error("Please upload a photo"); return; }
    try {
      setIsAnalyzing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const fileName = `${user.id}/${Date.now()}.${selectedFile.name.split('.').pop()}`;
      const { error } = await supabase.storage.from("fashion-uploads").upload(fileName, selectedFile);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("fashion-uploads").getPublicUrl(fileName);
      const { data, error: fnError } = await supabase.functions.invoke("fashion-ai", { body: { action: "history-explorer", imageUrl: publicUrl } });
      if (fnError) throw fnError;
      setResult(data.analysis);
      toast.success("Historical analysis complete!");
    } catch (err: any) { toast.error(err.message || "Error"); } finally { setIsAnalyzing(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How AIFashion History Explorer works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-amber-500/20">
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-amber-500" /> Fashion History Explorer</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Upload a fashion photo to discover its historical era, cultural influences, and evolution through time. <strong>Cost: 10 credits</strong></p>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {previewUrl ? <img src={previewUrl} alt="Fashion" className="w-full h-full object-cover" /> : (
                <div className="text-center p-8">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <label htmlFor="history-upload"><Button variant="outline" asChild><span>Select Photo</span></Button></label>
                  <input id="history-upload" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </div>
              )}
            </div>
            {selectedFile && (
              <Button className="w-full" onClick={handleAnalyze} disabled={isAnalyzing || !credits || credits.credits_remaining < 10}>
                {isAnalyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exploring...</> : "Explore History (10 credits)"}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 backdrop-blur-xl"><CardHeader><CardTitle>Fashion History Report</CardTitle></CardHeader>
            <CardContent><div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div></CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
    );
}
