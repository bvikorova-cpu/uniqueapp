import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { usePetProfiles } from "@/hooks/usePetProfiles";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function PetVideoAnalysis({ onBack }: { onBack: () => void }) {
  const { active } = usePetProfiles();
  const [file, setFile] = useState<File | null>(null);
  const [desc, setDesc] = useState("");
  const [duration, setDuration] = useState(10);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!file && !desc.trim()) return toast.error("Upload video or describe behavior");
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("pet-translator-ai", {
      body: { action: "video_analyze", description: desc, duration, species: active?.species || "dog" },
    });
    setLoading(false);
    if (error || data?.error) return toast.error(error?.message || data.error);
    setResult(data.result);
  };

  return (
    <>
      <FloatingHowItWorks title="How Pet Video Analysis works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><Video className="w-5 h-5 text-primary" /> Video Behavior Analysis</h2>
        <p className="text-sm text-muted-foreground mb-4">Upload a short clip (≤30s) of your pet's behavior.</p>
        <input type="file" accept="video/*" onChange={(e) => {
          const f = e.target.files?.[0]; if (!f) return;
          setFile(f);
          const v = document.createElement("video");
          v.preload = "metadata"; v.onloadedmetadata = () => setDuration(Math.round(v.duration));
          v.src = URL.createObjectURL(f);
        }} className="mb-3 text-sm" />
        {file && <video src={URL.createObjectURL(file)} controls className="w-full rounded-md mb-3 max-h-64" />}
        <Textarea rows={3} placeholder="Describe what your pet is doing in the video…" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <Button onClick={handle} disabled={loading} className="mt-3 w-full">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing…</> : "Analyze (6 credits)"}
        </Button>
      </Card>
      {result && <Card className="p-6"><div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div></Card>}
    </div>
    </>
    );
}
