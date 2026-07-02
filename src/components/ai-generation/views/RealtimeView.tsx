import { useEffect, useState, useRef } from "react";
import { Loader2, Zap } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const RealtimeView = ({ onCreditsUsed }: { onCreditsUsed: () => void }) => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!prompt.trim() || prompt.length < 12) return;
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("ai-image-tools", {
          body: { action: "generate", prompt },
        });
        if (error) throw error;
        if (data?.imageUrl) { setImageUrl(data.imageUrl); onCreditsUsed(); }
      } catch (e: any) { toast.error(e.message || "Failed"); }
      finally { setLoading(false); }
    }, 1500);
    return (
    <>
      <FloatingHowItWorks title={"Realtime View - How it works"} steps={[{ title: 'Open', desc: 'Access the Realtime View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Realtime View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [prompt, onCreditsUsed]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-1">⚡ Realtime Generation</h2>
        <p className="text-muted-foreground text-sm">Image regenerates as you type. 5 CR per render — pause typing 1.5s to trigger.</p>
      </div>
      <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Start typing... (min 12 chars to trigger)" rows={3} className="resize-none" />
      <div className="aspect-square rounded-xl border border-border bg-muted/30 flex items-center justify-center overflow-hidden relative">
        {imageUrl && <img src={imageUrl} alt="Realtime" className="w-full h-full object-cover" />}
        {loading && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        )}
        {!imageUrl && !loading && <Zap className="w-10 h-10 text-muted-foreground" />}
      </div>
    </div>
  );
};
