import { useState } from "react";
import { getReadableUrl } from "@/lib/storageSigned";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Upload, ArrowLeft, Download } from "lucide-react";
import { usePhotoCredits } from "@/hooks/usePhotoCredits";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

export const FaceEnhancement = ({ onBack }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { credits } = usePhotoCredits();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); }
  };

  const handleProcess = async () => {
    if (!file) { toast.error("Please select a photo"); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('old-photos').upload(fileName, file);
      if (uploadError) throw uploadError;
      const publicUrl = await getReadableUrl('old-photos', fileName);

      const { data, error } = await supabase.functions.invoke('photo-face-enhancement', {
        body: { imageUrl: publicUrl }
      });
      if (error) throw error;
      setResult(data);
      toast.success("Face enhancement complete!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to enhance faces");
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Users className="h-6 w-6 text-pink-500" />
          AI Face Enhancement
        </h2>
        <p className="text-muted-foreground mb-6">Upscale and enhance faces in old or blurry photos with AI. Cost: 5 credits</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-2 block">Upload Photo</Label>
            <div className="aspect-square bg-muted rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
              {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : (
                <div className="text-center p-8">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">Upload a photo with faces</p>
                  <label htmlFor="face-file"><Button variant="outline" asChild><span>Choose File</span></Button></label>
                  <Input id="face-file" type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>
              )}
            </div>
            <Button className="w-full mt-4" onClick={handleProcess} disabled={loading || !file || (credits?.credits_remaining ?? 0) < 5}>
              {loading ? "Enhancing..." : "Enhance Faces (5 credits)"}
            </Button>
          </div>

          <div>
            <Label className="mb-2 block">Enhanced Result</Label>
            <div className="aspect-square bg-muted rounded-xl flex items-center justify-center overflow-hidden">
              {result?.enhancedImageUrl ? <img src={result.enhancedImageUrl} alt="Enhanced" className="w-full h-full object-cover" /> : (
                <div className="text-center p-8"><Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" /><p className="text-sm text-muted-foreground">Enhanced photo appears here</p></div>
              )}
            </div>
            {result?.enhancedImageUrl && <a href={result.enhancedImageUrl} download><Button variant="outline" className="w-full mt-4 gap-2"><Download className="h-4 w-4" /> Download</Button></a>}
          </div>
        </div>

        {result?.analysis && (
          <Card className="mt-6 p-4 bg-muted/50">
            <h3 className="font-semibold mb-2">Enhancement Analysis</h3>
            <p className="text-sm text-muted-foreground">{result.analysis.description}</p>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="text-center"><p className="text-lg font-bold">{result.analysis.facesDetected || 0}</p><p className="text-xs text-muted-foreground">Faces Found</p></div>
              <div className="text-center"><p className="text-lg font-bold">{result.analysis.qualityScore || '—'}</p><p className="text-xs text-muted-foreground">Quality Score</p></div>
              <div className="text-center"><p className="text-lg font-bold">{result.analysis.enhancementLevel || '—'}</p><p className="text-xs text-muted-foreground">Enhancement</p></div>
            </div>
          </Card>
        )}

        {credits && <p className="text-sm text-muted-foreground mt-4">Remaining credits: {credits.credits_remaining}</p>}
      </Card>
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
    </motion.div>
  );
};
