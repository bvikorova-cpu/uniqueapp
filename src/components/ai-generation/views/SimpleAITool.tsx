import { useState, ReactNode } from "react";
import { motion } from "framer-motion";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface SimpleAIToolProps {
  title: string;
  emoji: string;
  description: string;
  cost: number;
  action: string;
  buttonLabel: string;
  buildBody: () => Record<string, unknown> | null; // return null to abort with toast
  children: ReactNode;
  onCreditsUsed: () => void;
  resultKey?: "imageUrl" | "imageUrls";
}

export const SimpleAITool = ({
  title, emoji, description, cost, action, buttonLabel, buildBody, children, onCreditsUsed,
  resultKey = "imageUrl",
}: SimpleAIToolProps) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const run = async () => {
    const body = buildBody();
    if (!body) return;
    setLoading(true); setResults([]);
    try {
      const { data, error } = await supabase.functions.invoke("ai-image-tools", {
        body: { action, ...body },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      const out = resultKey === "imageUrls" ? (data.imageUrls || []) : (data.imageUrl ? [data.imageUrl] : []);
      setResults(out);
      onCreditsUsed();
      toast.success(`${title} complete!`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Simple A I Tool - How it works"} steps={[{ title: 'Open', desc: 'Access the Simple A I Tool section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Simple A I Tool.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-1">{emoji} {title}</h2>
        <p className="text-muted-foreground text-sm">{description} Cost: {cost} CR</p>
      </div>

      <div className="space-y-3">{children}</div>

      <Button onClick={run} disabled={loading} className="w-full gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {loading ? "Processing..." : `${buttonLabel} (${cost} CR)`}
      </Button>

      {results.length > 0 && (
        <div className={results.length > 1 ? "grid grid-cols-2 gap-3" : ""}>
          {results.map((url, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-xl overflow-hidden border border-border">
              <img src={url} alt={`${title} ${i + 1}`} className="w-full" />
              <div className="p-3 flex justify-end">
                <a href={url} download={`${action}-${i + 1}.webp`}>
                  <Button size="sm" variant="outline" className="gap-1"><Download className="w-3 h-3" /> Download</Button>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};
