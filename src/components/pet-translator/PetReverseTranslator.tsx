import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2, MessageSquareText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { usePetProfiles } from "@/hooks/usePetProfiles";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function PetReverseTranslator({ onBack }: { onBack: () => void }) {
  const { active } = usePetProfiles();
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.7; u.pitch = active?.species === "cat" ? 2 : 0.6;
    speechSynthesis.speak(u);
  };

  const handle = async () => {
    if (!message.trim()) return toast.error("Type a message");
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("pet-translator-ai", {
      body: { action: "reverse_translate", message, pet_type: active?.species || "dog" },
    });
    setLoading(false);
    if (error || data?.error) return toast.error(error?.message || data.error);
    setResult(data.result);
  };

  return (
    <>
      <FloatingHowItWorks title="How Pet Reverse Translator works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><MessageSquareText className="w-5 h-5 text-primary" /> Speak Pet (Human → {active?.species || "Pet"})</h2>
        <p className="text-sm text-muted-foreground mb-4">Type what you want to say to your pet — get sound + body-language guide.</p>
        <Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="I love you, I missed you, food is coming…" />
        <Button onClick={handle} disabled={loading} className="mt-3 w-full">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Translating…</> : "Translate to Pet (3 credits)"}
        </Button>
      </Card>
      {result && (
        <Card className="p-6">
          <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div>
          <Button variant="outline" className="mt-3" onClick={() => speak(message)}>🔊 Play synthesized sound</Button>
        </Card>
      )}
    </div>
    </>
    );
}
