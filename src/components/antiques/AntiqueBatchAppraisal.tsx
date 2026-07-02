import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Layers, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAntiqueCredits } from "@/hooks/useAntiqueCredits";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export const AntiqueBatchAppraisal = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [results, setResults] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { credits } = useAntiqueCredits();

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, 5);
    setFiles(selected);
    setPreviews(selected.map(f => URL.createObjectURL(f)));
    setResults([]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleBatchAnalyze = async () => {
    if (files.length === 0) { toast.error("Please select photos"); return; }
    const totalCost = files.length * 3;
    if (!credits || credits.credits_remaining < totalCost) {
      toast.error(`Insufficient credits. Need ${totalCost} credits for ${files.length} items.`);
      return;
    }

    try {
      setIsAnalyzing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const batchResults: string[] = [];
      for (const file of files) {
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`;
        const { error } = await supabase.storage.from('antiques').upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('antiques').getPublicUrl(fileName);

        const { data, error: fnError } = await supabase.functions.invoke('antique-batch-appraisal', {
          body: { imageUrl: publicUrl }
        });
        if (fnError) throw fnError;
        batchResults.push(data.analysis);
      }

      setResults(batchResults);
      toast.success(`Batch analysis complete! ${files.length} items analyzed.`);
    } catch (err: any) {
      toast.error(err.message || "Error during batch analysis");
    } finally { setIsAnalyzing(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How Antique Batch Appraisal works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-teal-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-teal-500" /> AI Batch Appraisal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload up to 5 antique photos for simultaneous analysis. Each item costs 3 credits for basic identification. <strong>Total: {files.length * 3} credits</strong>
            </p>

            {previews.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {previews.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={url} alt={`Item ${i + 1}`} className="w-full h-full object-cover" />
                    <button onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-1">
                      <X className="w-3 h-3 text-white" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-1">
                      Item {i + 1}
                    </div>
                  </div>
                ))}
                {files.length < 5 && (
                  <label htmlFor="batch-upload-more" className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-teal-500/50 transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <input id="batch-upload-more" type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelect} />
                  </label>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center p-8">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">Upload up to 5 antique photos</p>
                  <label htmlFor="batch-upload">
                    <Button variant="outline" asChild><span>Select Photos</span></Button>
                  </label>
                  <input id="batch-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelect} />
                </div>
              </div>
            )}

            {files.length > 0 && (
              <Button className="w-full" onClick={handleBatchAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing {files.length} items...</>
                ) : (
                  `Batch Analyze ${files.length} Items (${files.length * 3} credits)`
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {results.length > 0 && results.map((result, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <Card className="bg-card/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm">Item {i + 1} Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
    </>
    );
};
