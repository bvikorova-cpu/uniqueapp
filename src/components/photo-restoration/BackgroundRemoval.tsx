import { useState } from "react";
import { getReadableUrl } from "@/lib/storageSigned";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Scissors, Upload, ArrowLeft, Download } from "lucide-react";
import { usePhotoCredits } from "@/hooks/usePhotoCredits";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const BackgroundRemoval = ({ onBack }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { credits } = usePhotoCredits();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); setResult(""); }
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

      const { data, error } = await supabase.functions.invoke('photo-background-removal', {
        body: { imageUrl: publicUrl }
      });
      if (error) throw error;
      setResult(data.processedImageUrl);
      toast.success("Background removed successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to process photo");
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Background Removal - How it works"} steps={[{ title: 'Open', desc: 'Access the Background Removal section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Background Removal.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Scissors className="h-6 w-6 text-purple-500" />
          AI Background Removal
        </h2>
        <p className="text-muted-foreground mb-6">Upload any photo and AI will cleanly remove the background. Cost: 3 credits</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-2 block">Upload Photo</Label>
            <div className="aspect-square bg-muted rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
              {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : (
                <div className="text-center p-8">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">Select an image</p>
                  <label htmlFor="bg-file"><Button variant="outline" asChild><span>Choose File</span></Button></label>
                  <Input id="bg-file" type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>
              )}
            </div>
            <Button className="w-full mt-4" onClick={handleProcess} disabled={loading || !file || (credits?.credits_remaining ?? 0) < 3}>
              {loading ? "Processing..." : "Remove Background (3 credits)"}
            </Button>
          </div>

          <div>
            <Label className="mb-2 block">Result</Label>
            <div className="aspect-square bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTVlN2ViIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=')] rounded-xl flex items-center justify-center overflow-hidden">
              {result ? <img src={result} alt="Result" className="w-full h-full object-contain" /> : (
                <div className="text-center p-8"><Scissors className="w-12 h-12 mx-auto mb-3 text-muted-foreground" /><p className="text-sm text-muted-foreground">Result appears here</p></div>
              )}
            </div>
            {result && <a href={result} download><Button variant="outline" className="w-full mt-4 gap-2"><Download className="h-4 w-4" /> Download</Button></a>}
          </div>
        </div>

        {credits && <p className="text-sm text-muted-foreground mt-4">Remaining credits: {credits.credits_remaining}</p>}
      </Card>
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
    </motion.div>
    </>
  );
};
