import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Sparkles, Search, Shield, BookOpen, TrendingUp, Wrench } from "lucide-react";
import { useAntiqueCredits } from "@/hooks/useAntiqueCredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const analysisOptions = [
  { type: 'basic', name: 'Basic Identification', icon: Search, credits: 3, description: 'Identify the item, period, and style', color: 'text-blue-500' },
  { type: 'valuation', name: 'Market Valuation', icon: TrendingUp, credits: 10, description: 'Estimate current market value', color: 'text-green-500' },
  { type: 'expert', name: 'Expert Report', icon: Sparkles, credits: 15, description: 'Complete analysis with history & value', color: 'text-purple-500', premium: true },
  { type: 'authenticity', name: 'Authenticity Check', icon: Shield, credits: 20, description: 'Verify authenticity & detect fakes', color: 'text-red-500', premium: true },
  { type: 'history', name: 'Historical Story', icon: BookOpen, credits: 3, description: 'AI-generated historical narrative', color: 'text-amber-500' },
  { type: 'restoration', name: 'Restoration Advice', icon: Wrench, credits: 3, description: 'Care and restoration recommendations', color: 'text-cyan-500' },
];

export const AntiqueAnalyze = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisType, setAnalysisType] = useState("basic");
  const { credits, identifyAntique, isIdentifying } = useAntiqueCredits();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) { toast.error("Please select a photo"); return; }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('antiques').upload(fileName, selectedFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('antiques').getPublicUrl(fileName);
      identifyAntique({ imageUrl: publicUrl, analysisType }, {
        onSuccess: (data: any) => {
          setAnalysisResult(data.analysisResult);
          toast.success("Analysis complete!");
          supabase.from('antiques').insert({
            user_id: user.id, image_url: publicUrl, analysis_type: analysisType,
            analysis_result: data.analysisResult, credits_used: data.creditsUsed
          });
        }
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error("Error uploading photo");
    }
  };

  const selected = analysisOptions.find(o => o.type === analysisType);

  return (
    <>
      <FloatingHowItWorks title="How Antique Analyze works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="space-y-6">
      {/* Analysis Type Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {analysisOptions.map((option, i) => {
          const Icon = option.icon;
          return (
            <motion.div key={option.type} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring" }}>
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  analysisType === option.type ? 'border-primary ring-2 ring-primary' : ''
                }`}
                onClick={() => setAnalysisType(option.type)}
              >
                <CardHeader className="p-3 sm:p-4">
                  <Icon className={`w-6 h-6 mb-2 ${option.color}`} />
                  <CardTitle className="text-sm flex items-center gap-2">
                    {option.name}
                    {option.premium && <Badge variant="secondary" className="text-[10px]">Premium</Badge>}
                  </CardTitle>
                  <CardDescription className="text-xs">{option.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <p className="text-xs font-bold text-primary">{option.credits} credits</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Upload & Result */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/80 backdrop-blur-xl">
          <CardHeader><CardTitle>Upload Antique Photo</CardTitle></CardHeader>
          <CardContent>
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Antique" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-8">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Upload antique photo</p>
                  <label htmlFor="antique-upload">
                    <Button variant="outline" asChild><span>Select Photo</span></Button>
                  </label>
                  <input id="antique-upload" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </div>
              )}
            </div>
            {selectedFile && (
              <Button className="w-full mt-4" onClick={handleAnalyze}
                disabled={isIdentifying || !credits || credits.credits_remaining < (selected?.credits || 3)}>
                {isIdentifying ? "Analyzing..." : `Analyze (${selected?.credits} credits)`}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-xl">
          <CardHeader><CardTitle>Analysis Result</CardTitle></CardHeader>
          <CardContent>
            <div className="min-h-[400px]">
              {analysisResult ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {typeof analysisResult === 'string' ? (
                    <ReactMarkdown>{analysisResult}</ReactMarkdown>
                  ) : (
                    <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                      {JSON.stringify(analysisResult, null, 2)}
                    </pre>
                  )}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <Sparkles className="w-16 h-16 mx-auto mb-4" />
                  <p>Analysis results will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
    );
};
