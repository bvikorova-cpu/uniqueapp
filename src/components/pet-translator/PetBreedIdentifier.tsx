import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function PetBreedIdentifier({ onBack }: { onBack: () => void }) {
  const [species, setSpecies] = useState("dog");
  const [desc, setDesc] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!desc.trim()) return toast.error("Describe the pet's appearance");
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("pet-translator-ai", {
      body: { action: "breed_identify", species, photo_description: desc },
    });
    setLoading(false);
    if (error || data?.error) return toast.error(error?.message || data.error);
    setResult(data.result);
  };

  return (
    <>
      <FloatingHowItWorks title="How Pet Breed Identifier works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><Search className="w-5 h-5 text-primary" /> Breed Identifier</h2>
        <div className="flex gap-2 mb-3">
          {["dog","cat","other"].map((s) => (
            <Button key={s} size="sm" variant={species === s ? "default" : "outline"} onClick={() => setSpecies(s)}>{s}</Button>
          ))}
        </div>
        <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} className="mb-3 text-sm" />
        {photo && <img src={URL.createObjectURL(photo)} alt="pet" className="rounded-md max-h-48 mb-3" />}
        <Textarea rows={3} placeholder="Color, size, fur length, ears (floppy/erect), tail, distinctive features…" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <Button onClick={handle} disabled={loading} className="mt-3 w-full">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Identifying…</> : "Identify Breed (4 credits)"}
        </Button>
      </Card>
      {result && <Card className="p-6"><div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div></Card>}
    </div>
    </>
    );
}
