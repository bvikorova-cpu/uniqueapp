import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAntiqueCredits } from "@/hooks/useAntiqueCredits";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export const AntiqueExpertMarketplace = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { credits } = useAntiqueCredits();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); setResult(null); }
  };

  const handleConsult = async () => {
    if (!selectedFile) { toast.error("Please upload a photo"); return; }
    try {
      setIsAnalyzing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const fileName = `${user.id}/${Date.now()}.${selectedFile.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('antiques').upload(fileName, selectedFile);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('antiques').getPublicUrl(fileName);

      const { data, error: fnError } = await supabase.functions.invoke('antique-expert-consult', {
        body: { imageUrl: publicUrl, question: question || "Please provide a comprehensive expert opinion on this antique." }
      });
      if (fnError) throw fnError;
      setResult(data.analysis);
      toast.success("Expert consultation complete!");
    } catch (err: any) {
      toast.error(err.message || "Error during consultation");
    } finally { setIsAnalyzing(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How Antique Expert Marketplace works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-lime-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-lime-500" /> Expert Marketplace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get an AI-powered expert dealer opinion with detailed assessment, buying/selling advice, and market positioning insights. <strong>Cost: 10 credits</strong>
            </p>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Antique" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-8">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <label htmlFor="expert-upload">
                    <Button variant="outline" asChild><span>Select Photo</span></Button>
                  </label>
                  <input id="expert-upload" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </div>
              )}
            </div>
            <Textarea placeholder="Ask a specific question (optional)..." value={question} onChange={e => setQuestion(e.target.value)} rows={2} />
            {selectedFile && (
              <Button className="w-full" onClick={handleConsult} disabled={isAnalyzing || !credits || credits.credits_remaining < 10}>
                {isAnalyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Consulting...</> : "Get Expert Opinion (10 credits)"}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 backdrop-blur-xl">
            <CardHeader><CardTitle>Expert Consultation Report</CardTitle></CardHeader>
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
