import { useState } from "react";
import { getReadableUrl } from "@/lib/storageSigned";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Palette, Upload, ArrowLeft, Download } from "lucide-react";
import { usePhotoCredits } from "@/hooks/usePhotoCredits";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

export const ColorizationPro = ({ onBack }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [era, setEra] = useState("1940s");
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

      const { data, error } = await supabase.functions.invoke('photo-colorization-pro', {
        body: { imageUrl: publicUrl, era }
      });
      if (error) throw error;
      setResult(data);
      toast.success("Pro colorization complete!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to colorize photo");
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Palette className="h-6 w-6 text-rose-500" />
          AI Colorization Pro
        </h2>
        <p className="text-muted-foreground mb-6">Advanced colorization with era-accurate color palettes. Cost: 8 credits</p>

        <div className="space-y-4 mb-6">
          <div>
            <Label>Select Era</Label>
            <Select value={era} onValueChange={setEra}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1920s">🎭 1920s - Jazz Age</SelectItem>
                <SelectItem value="1930s">🎬 1930s - Golden Hollywood</SelectItem>
                <SelectItem value="1940s">⚔️ 1940s - War Era</SelectItem>
                <SelectItem value="1950s">🚗 1950s - Post-War Boom</SelectItem>
                <SelectItem value="1960s">✌️ 1960s - Swinging Sixties</SelectItem>
                <SelectItem value="1970s">🎸 1970s - Disco Era</SelectItem>
                <SelectItem value="1980s">📼 1980s - Neon Era</SelectItem>
                <SelectItem value="auto">🤖 Auto-Detect Era</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-2 block">Original B&W Photo</Label>
            <div className="aspect-square bg-muted rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
              {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : (
                <div className="text-center p-8">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">Upload a B&W photo</p>
                  <label htmlFor="color-file"><Button variant="outline" asChild><span>Choose File</span></Button></label>
                  <Input id="color-file" type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>
              )}
            </div>
            <Button className="w-full mt-4" onClick={handleProcess} disabled={loading || !file || (credits?.credits_remaining ?? 0) < 8}>
              {loading ? "Colorizing..." : "Colorize Pro (8 credits)"}
            </Button>
          </div>

          <div>
            <Label className="mb-2 block">Colorized Result</Label>
            <div className="aspect-square bg-muted rounded-xl flex items-center justify-center overflow-hidden">
              {result?.colorizedImageUrl ? <img src={result.colorizedImageUrl} alt="Colorized" className="w-full h-full object-cover" /> : (
                <div className="text-center p-8"><Palette className="w-12 h-12 mx-auto mb-3 text-muted-foreground" /><p className="text-sm text-muted-foreground">Colorized result appears here</p></div>
              )}
            </div>
            {result?.colorizedImageUrl && <a href={result.colorizedImageUrl} download><Button variant="outline" className="w-full mt-4 gap-2"><Download className="h-4 w-4" /> Download</Button></a>}
          </div>
        </div>

        {result?.colorPalette && (
          <Card className="mt-6 p-4 bg-muted/50">
            <h3 className="font-semibold mb-3">Era-Accurate Color Palette</h3>
            <p className="text-sm text-muted-foreground mb-3">{result.colorPalette.description}</p>
            <div className="flex gap-2 flex-wrap">
              {result.colorPalette.colors?.map((color: any, i: number) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 rounded-lg border" style={{ backgroundColor: color.hex }} />
                  <p className="text-[10px] text-muted-foreground mt-1">{color.name}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {credits && <p className="text-sm text-muted-foreground mt-4">Remaining credits: {credits.credits_remaining}</p>}
      </Card>
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
    </motion.div>
  );
};
