import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Award, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAntiqueCredits } from "@/hooks/useAntiqueCredits";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export const AntiqueCertificate = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [itemName, setItemName] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { credits } = useAntiqueCredits();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); setResult(null); }
  };

  const handleGenerate = async () => {
    if (!selectedFile) { toast.error("Please upload a photo"); return; }
    try {
      setIsAnalyzing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const fileName = `${user.id}/${Date.now()}.${selectedFile.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('antiques').upload(fileName, selectedFile);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('antiques').getPublicUrl(fileName);

      const { data, error: fnError } = await supabase.functions.invoke('antique-certificate', {
        body: { imageUrl: publicUrl, itemName: itemName || "Antique Item" }
      });
      if (fnError) throw fnError;
      setResult(data.analysis);
      toast.success("Certificate generated!");
    } catch (err: any) {
      toast.error(err.message || "Error generating certificate");
    } finally { setIsAnalyzing(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How Antique Certificate works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-sky-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-sky-500" /> AI Certificate of Authenticity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate a digital certificate of authenticity with AI-verified details, provenance summary, and unique certificate ID. <strong>Cost: 15 credits</strong>
            </p>
            <Input placeholder="Item name (e.g., 'Victorian Pocket Watch')" value={itemName} onChange={e => setItemName(e.target.value)} />
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Antique" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-8">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <label htmlFor="cert-upload">
                    <Button variant="outline" asChild><span>Select Photo</span></Button>
                  </label>
                  <input id="cert-upload" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </div>
              )}
            </div>
            {selectedFile && (
              <Button className="w-full" onClick={handleGenerate} disabled={isAnalyzing || !credits || credits.credits_remaining < 15}>
                {isAnalyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : "Generate Certificate (15 credits)"}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 backdrop-blur-xl border-2 border-sky-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-sky-500" /> Certificate of Authenticity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none bg-gradient-to-br from-sky-500/5 to-transparent p-4 rounded-lg border border-sky-500/10">
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
