import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Map } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAntiqueCredits } from "@/hooks/useAntiqueCredits";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export const ProvenanceTracker = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { credits } = useAntiqueCredits();

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
      const { error } = await supabase.storage.from('antiques').upload(fileName, selectedFile);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('antiques').getPublicUrl(fileName);
      const { data, error: fnError } = await supabase.functions.invoke('antique-provenance', {
        body: { imageUrl: publicUrl }
      });
      if (fnError) throw fnError;
      setResult(data.analysis);
      toast.success("Provenance analysis complete!");
    } catch (err: any) {
      toast.error(err.message || "Error analyzing provenance");
    } finally { setIsAnalyzing(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How Provenance Tracker works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-emerald-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Map className="h-5 w-5 text-emerald-500" /> AI Provenance Tracker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload an antique photo to trace its ownership history, origin, manufacturing details, and historical journey using AI research analysis. <strong>Cost: 8 credits</strong>
            </p>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Antique" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-8">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <label htmlFor="provenance-upload">
                    <Button variant="outline" asChild><span>Select Photo</span></Button>
                  </label>
                  <input id="provenance-upload" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </div>
              )}
            </div>
            {selectedFile && (
              <Button className="w-full" onClick={handleAnalyze}
                disabled={isAnalyzing || !credits || credits.credits_remaining < 8}>
                {isAnalyzing ? "Analyzing Provenance..." : "Track Provenance (8 credits)"}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 backdrop-blur-xl">
            <CardHeader><CardTitle>Provenance Report</CardTitle></CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
    );
};
