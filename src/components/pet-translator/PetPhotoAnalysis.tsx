import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, Upload, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function PetPhotoAnalysis({ onBack }: { onBack: () => void }) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [petType, setPetType] = useState("dog");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imagePreview) { toast.error("Please upload a photo first"); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }

      const { data, error } = await supabase.functions.invoke("pet-translator-ai", {
        body: { action: "photo_emotion", pet_type: petType, image_description: "User uploaded a photo of their pet for emotion analysis" },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast.success("Photo analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Pet Photo Analysis works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>
      <Card className="max-w-3xl mx-auto bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 border-purple-500/20">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3">
            <Camera className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">📸 Photo Emotion Analysis</CardTitle>
          <p className="text-muted-foreground">Upload a photo of your pet for AI emotion detection</p>
          <Badge className="w-fit mx-auto bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Sparkles className="h-3 w-3 mr-1" /> 5 Credits
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500/60 transition-colors"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Pet" className="max-h-48 mx-auto rounded-lg" />
            ) : (
              <div className="space-y-2">
                <Upload className="h-10 w-10 text-purple-400 mx-auto" />
                <p className="text-sm text-muted-foreground">Click to upload a pet photo</p>
              </div>
            )}
          </div>
          <select value={petType} onChange={e => setPetType(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="bird">Bird</option>
            <option value="rabbit">Rabbit</option>
            <option value="other">Other</option>
          </select>
          <Button onClick={handleAnalyze} disabled={loading || !imagePreview} className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : "Analyze Emotions"}
          </Button>
          {result && (
            <Card className="bg-card/80 border-purple-500/20 p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div>
            </Card>
          )}
        </CardContent>
      </Card>
    </motion.div>
    </>
    );
}
