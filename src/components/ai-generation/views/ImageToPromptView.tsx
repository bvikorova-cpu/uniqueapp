import { useState } from "react";
import { motion } from "framer-motion";
import { ScanSearch, Loader2, Copy, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onCreditsUsed: () => void; onUsePrompt: (prompt: string) => void; }

export const ImageToPromptView = ({ onCreditsUsed, onUsePrompt }: Props) => {
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ prompt: string; style: string; tags: string[] } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
      if (file.size > 8 * 1024 * 1024) throw new Error("Image is too large. Please use an image under 8 MB.");

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read image"));
        reader.onerror = () => reject(new Error("Could not read image"));
        reader.readAsDataURL(file);
      });

      setImageUrl(dataUrl);
      setResult(null);
      toast.success("Image ready for analysis");
    } catch (e: any) {
      toast.error(e.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const analyze = async () => {
    if (!imageUrl.trim()) return toast.error("Upload or paste an image URL first");
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-image-tools", {
        body: { action: "image_to_prompt", imageUrl: imageUrl.trim() } });
      if (error) throw error;
      if (!data?.prompt) throw new Error(data?.error || "Analysis returned no prompt");
      setResult(data);
      onCreditsUsed();
      toast.success("Image analyzed!");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const copyPrompt = () => {
    if (result?.prompt) {
      navigator.clipboard.writeText(result.prompt);
      toast.success("Prompt copied!");
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Image To Prompt View - How it works"} steps={[{ title: 'Open', desc: 'Access the Image To Prompt View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Image To Prompt View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-2xl mx-auto space-y-6 pb-44 sm:pb-0">
      <div>
        <h2 className="text-2xl font-black mb-2">🔍 AI Image-to-Prompt</h2>
        <p className="text-muted-foreground text-sm">Reverse engineer a detailed prompt from any image. Cost: 3 CR</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-bold mb-2 block">Upload Image</label>
          <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
          {uploading && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</p>}
        </div>

        <div>
          <label className="text-sm font-bold mb-2 block">Or Paste Image URL</label>
          <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
        </div>

        {imageUrl && (
          <div className="rounded-xl overflow-hidden border border-border">
            <img src={imageUrl} alt="Preview" className="w-full max-h-64 object-contain bg-muted" />
          </div>
        )}

        <Button onClick={analyze} disabled={analyzing || !imageUrl.trim()} className="w-full min-h-12 gap-2 whitespace-normal px-4">
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanSearch className="w-4 h-4" />}
          {analyzing ? "Analyzing Image..." : "Analyze Image (3 CR)"}
        </Button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="p-4 rounded-xl border bg-card/80">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm">Generated Prompt</h3>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={copyPrompt} className="gap-1 min-h-7 h-auto"><Copy className="w-3 h-3" /> Copy</Button>
                <Button size="sm" onClick={() => onUsePrompt(result.prompt)} className="gap-1 min-h-7 h-auto"><Wand2 className="w-3 h-3" /> Generate</Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{result.prompt}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border bg-card/60">
              <p className="text-xs font-bold mb-1">Detected Style</p>
              <p className="text-sm text-primary font-medium">{result.style}</p>
            </div>
            <div className="p-3 rounded-xl border bg-card/60">
              <p className="text-xs font-bold mb-1">Tags</p>
              <div className="flex flex-wrap gap-1">
                {result.tags?.map((tag, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
    </>
  );
};
