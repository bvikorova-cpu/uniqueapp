import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Film, Upload, Loader2, Download, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { useTimeReversalCredits, TIME_REVERSAL_COSTS } from "@/hooks/useTimeReversalCredits";

interface Props { onBack: () => void; }

export function TimeLapseCreator({ onBack }: Props) {
  const { toast } = useToast();
  const { spend } = useTimeReversalCredits();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [startAge, setStartAge] = useState([80]);
  const [endAge, setEndAge] = useState([20]);
  const [generating, setGenerating] = useState(false);
  const [generatedFrames, setGeneratedFrames] = useState<{ url: string; age: number }[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      toast({ title: "Upload a photo first", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Login required", variant: "destructive" }); return; }
      const paid = await spend("timelapse");
      if (!paid) return;

      // Upload original photo (best-effort archive) and prefer a public URL,
      // but fall back to the inline data URL so generation never depends on storage.
      const ext = (selectedFile.name.split(".").pop() || "jpg").toLowerCase();
      const path = `time-reversal/timelapse/${session.user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(path, selectedFile, { contentType: selectedFile.type || "image/jpeg", upsert: true });
      let sourceUrl = preview as string; // data URL from FileReader
      if (!upErr) {
        const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
        if (pub?.publicUrl) sourceUrl = pub.publicUrl;
      } else {
        console.error("timelapse upload failed", upErr);
      }

      // Generate AI frames via edge function
      const { data, error } = await supabase.functions.invoke("time-reversal-timelapse", {
        body: { imageUrl: sourceUrl, startAge: startAge[0], endAge: endAge[0], frames: 8 } });


      if (error) throw error;

      const list = Array.isArray(data?.frames) ? data.frames : [];
      const normalized = list
        .map((f: any, i: number) => ({
          url: typeof f === "string" ? f : f?.url,
          age: typeof f?.age === "number"
            ? f.age
            : Math.round(startAge[0] + ((endAge[0] - startAge[0]) * i) / Math.max(list.length - 1, 1)) }))
        .filter((f: any) => typeof f.url === "string" && f.url.length > 0);

      if (!normalized.length) throw new Error(data?.message || "Could not generate frames. Please try again.");

      setGeneratedFrames(normalized);
      setCurrentFrame(0);
      toast({ title: "Time-Lapse Generated!", description: `${normalized.length} age frames created.` });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Generation failed", description: e?.message || "Please try again.", variant: "destructive" });
    } finally { setGenerating(false); }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Time Lapse Creator'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Time Lapse Creator panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Time-Lapse Video Creator</h2>
          <p className="text-sm text-muted-foreground">Generate reverse-aging timelapse from your photos</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload & Settings */}
        <Card className="border-purple-500/30">
          <CardHeader><CardTitle className="flex items-center gap-2"><Film className="h-5 w-5 text-purple-400" /> Create Time-Lapse</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-6 text-center">
              <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="timelapse-upload" />
              <label htmlFor="timelapse-upload" className="cursor-pointer">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-40 h-40 object-cover rounded-xl mx-auto" />
                ) : (
                  <>
                    <Upload className="h-10 w-10 mx-auto mb-3 text-purple-400" />
                    <p className="text-sm text-muted-foreground">Upload your photo</p>
                  </>
                )}
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Starting Age: {startAge[0]}</label>
                <Slider value={startAge} onValueChange={setStartAge} min={40} max={90} step={1} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Target Age: {endAge[0]}</label>
                <Slider value={endAge} onValueChange={setEndAge} min={5} max={39} step={1} />
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={generating || !selectedFile} className="w-full bg-gradient-to-r from-purple-600 to-violet-600">
              {generating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Time-Lapse</>}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="border-purple-500/30">
          <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
          <CardContent>
            {generatedFrames.length > 0 ? (
              <div className="space-y-4">
                <div className="aspect-square rounded-xl overflow-hidden bg-black/20 flex items-center justify-center">
                  <img src={generatedFrames[currentFrame]?.url} alt={`Age ${generatedFrames[currentFrame]?.age} frame`} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Frame {currentFrame + 1}/{generatedFrames.length}</span>
                  <Slider value={[currentFrame]} onValueChange={(v) => setCurrentFrame(v[0])} min={0} max={Math.max(generatedFrames.length - 1, 0)} step={1} className="flex-1" />
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Age: {generatedFrames[currentFrame]?.age} years
                </div>
                <Button variant="outline" className="w-full" onClick={async () => {
                  try {
                    const src = generatedFrames[currentFrame]?.url;
                    const res = await fetch(src);
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = `timelapse-frame-${currentFrame + 1}.jpg`; a.click();
                    URL.revokeObjectURL(url);
                    toast({ title: "Frame downloaded", description: `Frame ${currentFrame + 1} saved.` });
                  } catch {
                    toast({ title: "Download failed", variant: "destructive" });
                  }
                }}><Download className="h-4 w-4 mr-2" /> Download Current Frame</Button>
              </div>
            ) : (
              <div className="aspect-square rounded-xl bg-card/50 border border-border/40 flex items-center justify-center">
                <p className="text-muted-foreground text-sm text-center px-4">Upload a photo and generate to see your reverse aging time-lapse</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
