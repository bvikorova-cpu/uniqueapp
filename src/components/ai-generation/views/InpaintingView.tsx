import { useState } from "react";
import { motion } from "framer-motion";
import { Eraser, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onCreditsUsed: () => void; }

const REGIONS = [
  { value: "background", label: "Background" },
  { value: "foreground", label: "Foreground / Subject" },
  { value: "sky", label: "Sky" },
  { value: "left", label: "Left Side" },
  { value: "right", label: "Right Side" },
  { value: "center", label: "Center" },
  { value: "top", label: "Top Area" },
  { value: "bottom", label: "Bottom Area" },
];

export const InpaintingView = ({ onCreditsUsed }: Props) => {
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [region, setRegion] = useState("background");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInpaint = async () => {
    if (!originalPrompt.trim() || !editPrompt.trim()) return toast.error("Fill in both fields");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-image-tools", {
        body: { action: "inpainting", prompt: originalPrompt.trim(), editPrompt: editPrompt.trim(), region },
      });
      if (error) throw error;
      setResult(data.imageUrl);
      onCreditsUsed();
      toast.success("Inpainting complete!");
    } catch (e: any) {
      toast.error(e.message || "Inpainting failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Inpainting View - How it works"} steps={[{ title: 'Open', desc: 'Access the Inpainting View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Inpainting View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-2">🎯 AI Inpainting</h2>
        <p className="text-muted-foreground text-sm">Selectively edit specific areas of an image concept. Cost: 4 CR</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-bold mb-1 block">Original Image Concept</label>
          <Textarea value={originalPrompt} onChange={(e) => setOriginalPrompt(e.target.value)} placeholder="Describe the base image (e.g., 'A cozy cabin in a snowy forest')" rows={2} className="resize-none" />
        </div>

        <div>
          <label className="text-sm font-bold mb-1 block">Region to Edit</label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {REGIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-bold mb-1 block">What to Change</label>
          <Textarea value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} placeholder="Describe the change (e.g., 'Replace with a sunset sky with aurora borealis')" rows={2} className="resize-none" />
        </div>

        <Button onClick={handleInpaint} disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eraser className="w-4 h-4" />}
          {loading ? "Processing Inpainting..." : "Apply Inpainting (4 CR)"}
        </Button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl overflow-hidden border border-border">
          <img src={result} alt="Inpainted" className="w-full" />
          <div className="p-3 flex justify-end">
            <a href={result} download="inpainted.webp">
              <Button size="sm" variant="outline" className="gap-1"><Download className="w-3 h-3" /> Download</Button>
            </a>
          </div>
        </motion.div>
      )}
    </div>
    </>
  );
};
