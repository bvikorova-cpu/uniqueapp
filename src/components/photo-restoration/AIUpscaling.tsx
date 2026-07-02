import { useState } from "react";
import { getReadableUrl } from "@/lib/storageSigned";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Maximize, Upload, ArrowLeft, Download, Zap } from "lucide-react";
import { usePhotoCredits } from "@/hooks/usePhotoCredits";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const AIUpscaling = ({ onBack }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [scale, setScale] = useState("2x");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { credits } = usePhotoCredits();

  const creditCost = scale === "4x" ? 10 : scale === "3x" ? 7 : 5;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); }
  };

  const handleUpscale = async () => {
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

      const { data, error } = await supabase.functions.invoke('photo-ai-upscaling', {
        body: { imageUrl: publicUrl, scale }
      });
      if (error) throw error;
      setResult(data);
      toast.success(`Photo upscaled to ${scale}!`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to upscale photo");
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Upscaling - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Upscaling section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Upscaling.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Maximize className="h-6 w-6 text-teal-500" />
          AI Upscaling 4K
        </h2>
        <p className="text-muted-foreground mb-6">
          Upscale low-resolution photos to ultra-high resolution for printing and large displays. AI enhances details and removes artifacts.
        </p>

        <div className="mb-6">
          <Label className="mb-2 block">Upscale Factor</Label>
          <Select value={scale} onValueChange={setScale}>
            <SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2x">⚡ 2x Upscale (5 credits)</SelectItem>
              <SelectItem value="3x">🔥 3x Upscale (7 credits)</SelectItem>
              <SelectItem value="4x">💎 4x Upscale — 4K (10 credits)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-2 block">Original Photo</Label>
            <div className="aspect-square bg-muted rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-8">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">Upload a low-res photo</p>
                  <label htmlFor="upscale-file"><Button variant="outline" asChild><span>Choose File</span></Button></label>
                  <Input id="upscale-file" type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>
              )}
            </div>
            <Button className="w-full mt-4" onClick={handleUpscale} disabled={loading || !file || (credits?.credits_remaining ?? 0) < creditCost}>
              {loading ? "Upscaling..." : `Upscale ${scale} (${creditCost} credits)`}
            </Button>
          </div>

          <div>
            <Label className="mb-2 block">Upscaled Result</Label>
            <div className="aspect-square bg-muted rounded-xl flex items-center justify-center overflow-hidden">
              {result?.upscaledImageUrl ? (
                <img src={result.upscaledImageUrl} alt="Upscaled" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-8">
                  <Maximize className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upscaled photo appears here</p>
                </div>
              )}
            </div>
            {result?.upscaledImageUrl && (
              <a href={result.upscaledImageUrl} download>
                <Button variant="outline" className="w-full mt-4 gap-2"><Download className="h-4 w-4" /> Download HD</Button>
              </a>
            )}
          </div>
        </div>

        {result?.details && (
          <Card className="mt-6 p-4 bg-muted/50">
            <h3 className="font-semibold mb-2 flex items-center gap-2"><Zap className="h-4 w-4 text-teal-500" /> Upscale Details</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold">{result.details.originalResolution || '—'}</p>
                <p className="text-xs text-muted-foreground">Original</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-primary">{result.details.newResolution || '—'}</p>
                <p className="text-xs text-muted-foreground">Upscaled</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{result.details.enhancement || '—'}</p>
                <p className="text-xs text-muted-foreground">Quality</p>
              </div>
            </div>
          </Card>
        )}

        {credits && <p className="text-sm text-muted-foreground mt-4">Remaining credits: {credits.credits_remaining}</p>}
      </Card>
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
    </motion.div>
    </>
  );
};
