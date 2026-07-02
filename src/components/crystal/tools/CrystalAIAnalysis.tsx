import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props {
  toolType: string;
  title: string;
  description: string;
  needsImage?: boolean;
  needsText?: boolean;
  textLabel?: string;
  textPlaceholder?: string;
}

export const CrystalAIAnalysis = ({ toolType, title, description, needsImage = true, needsText = false, textLabel, textPlaceholder }: Props) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `crystal-analysis/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("user-uploads").upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("user-uploads").getPublicUrl(path);
      setImageUrl(publicUrl);
      toast.success("Photo uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const analyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in to use this tool"); setLoading(false); return; }
      const { data, error } = await supabase.functions.invoke("crystal-ai-tool", {
        body: { toolType, imageUrl, textInput },
      });
      if (error) throw error;
      setResult(data.analysis);
      toast.success("Analysis complete!");
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const canAnalyze = (needsImage && imageUrl) || (needsText && textInput.trim()) || (!needsImage && !needsText);

  return (
    <>
      <FloatingHowItWorks title={"Crystal A I Analysis - How it works"} steps={[{ title: 'Open', desc: 'Access the Crystal A I Analysis section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Crystal A I Analysis.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {needsImage && (
          <div className="space-y-2">
            <Label>Upload Photo</Label>
            <div className="flex gap-2">
              <Input type="file" accept="image/*" onChange={handleUpload} disabled={uploading || loading} className="flex-1" />
              {uploading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
            </div>
            {imageUrl && <img src={imageUrl} alt="Uploaded" className="max-h-52 rounded-xl border object-contain w-full bg-muted/20" />}
          </div>
        )}
        {needsText && (
          <div className="space-y-2">
            <Label>{textLabel || "Your Input"}</Label>
            <Textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder={textPlaceholder} rows={4} disabled={loading} />
          </div>
        )}
        <Button onClick={analyze} disabled={loading || !canAnalyze} className="w-full gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> Start AI Analysis</>}
        </Button>
        {result && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
            <h4 className="font-bold text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> AI Analysis Result</h4>
            <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{result}</div>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
