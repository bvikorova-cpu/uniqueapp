import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Search } from "lucide-react";
import { useAntiqueCredits } from "@/hooks/useAntiqueCredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";


import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const analysisOptions = [
  { type: 'basic', name: 'Antique Identification', icon: Search, credits: 5, description: 'Identify the item, period, and style', color: 'text-primary' },
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
          const result = data?.analysisResult ?? data?.result ?? data?.text ?? null;
          if (!result) { toast.error("No analysis returned, please try again"); return; }
          setAnalysisResult(result);
          toast.success("Analysis complete!");
          supabase.from('antiques').insert({
            user_id: user.id, image_url: publicUrl, analysis_type: analysisType,
            analysis_result: result, credits_used: data?.creditsCharged ?? data?.creditsUsed ?? selected?.credits ?? 5
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



      {/* Upload & Result */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="antique-frame rounded-md">
          <CardHeader><CardTitle className="antique-display uppercase tracking-widest text-base">Upload Antique Photo</CardTitle></CardHeader>
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
                disabled={isIdentifying || !credits || credits.credits_remaining < (selected?.credits || 5)}>
                {isIdentifying ? "Analyzing..." : `Analyze (${selected?.credits} credits)`}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="antique-frame rounded-md">
          <CardHeader><CardTitle className="antique-display uppercase tracking-widest text-base">Analysis Result</CardTitle></CardHeader>
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
