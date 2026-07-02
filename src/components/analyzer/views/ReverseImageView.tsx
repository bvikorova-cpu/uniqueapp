import { useState, useRef } from "react";
import { ArrowLeft, Coins, Loader2, Search, ExternalLink, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useAnalyzerCredits } from "@/hooks/useAnalyzerCredits";
import { reserveAnalyzerCredits } from "../creditUtils";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const CREDIT_COST = 2;

export const ReverseImageView = ({ onBack }: { onBack: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { credits, isLoading: creditsLoading } = useAnalyzerCredits();
  const queryClient = useQueryClient();

  const remaining = credits?.credits_remaining ?? 0;
  const insufficient = !creditsLoading && remaining < CREDIT_COST;

  const handleFile = (f: File) => {
    setFile(f);
    const r = new FileReader();
    r.onloadend = () => setPreview(r.result as string);
    r.readAsDataURL(f);
  };

  const upload = async (f: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const ext = f.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, f);
    if (error) throw error;
    return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
  };

  const handleSearch = async () => {
    if (!file) { toast.error("Upload an image first"); return; }
    if (loading) return;
    setLoading(true);
    try {
      // Reserve credits BEFORE upload so we don't waste storage on insufficient balance.
      const reservation = await reserveAnalyzerCredits(CREDIT_COST);
      const imageUrl = await upload(file);
      const { data, error } = await supabase.functions.invoke("analyzer-reverse-image", { body: { imageUrl } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      await reservation.commit();
      queryClient.invalidateQueries({ queryKey: ["analyzer-credits"] });
    } catch (e: any) { toast.error(e.message || "Reverse search failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Reverse Image View - How it works"} steps={[{ title: 'Open', desc: 'Access the Reverse Image View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Reverse Image View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 gap-1.5">
            <Coins className="w-3.5 h-3.5" />
            {creditsLoading ? "..." : `${remaining} credits`}
          </Badge>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-2"><Search className="w-7 h-7" /><h1 className="text-2xl sm:text-3xl font-black">Reverse Image Search</h1></div>
            <p className="text-white/80 text-sm">Find where an image appears across Google, Bing, Yandex, TinEye</p>
            <Badge className="mt-2 bg-white/20 text-white border-0">{CREDIT_COST} credits per search</Badge>
          </div>
        </motion.div>

        <Card className="p-6 border-cyan-500/20 bg-card/80 space-y-4">
          {preview ? (
            <div className="space-y-4">
              <img src={preview} alt="Preview" className="w-full max-h-96 object-contain rounded-lg border border-cyan-500/20" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Image ready to search.</span>
                <span className={insufficient ? "text-red-400 font-semibold" : "text-muted-foreground"}>
                  Cost: {CREDIT_COST} • You have: {creditsLoading ? "…" : remaining}
                </span>
              </div>
              {insufficient && (
                <p className="text-xs text-red-400">Not enough credits — top up to continue.</p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setFile(null); setPreview(""); setResult(null); }} className="flex-1 border-cyan-500/20">Remove</Button>
                <Button onClick={handleSearch} disabled={loading || insufficient} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600">
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching...</> : <><Search className="w-4 h-4 mr-2" /> Find Image ({CREDIT_COST} credits)</>}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => inputRef.current?.click()} className="w-full h-32 flex-col border-cyan-500/20">
              <Upload className="w-8 h-8 mb-2 text-cyan-400" />
              <span>Upload Image</span>
              <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </Button>
          )}
        </Card>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 border-cyan-500/20 bg-gradient-to-br from-indigo-950/20 to-background space-y-4">
              <h2 className="text-xl font-bold text-cyan-400">Search This Image On:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.searchEngines?.map((e: any) => (
                  <Button key={e.name} variant="outline" className="justify-between border-cyan-500/20" onClick={() => window.open(e.url, "_blank", "noopener")}>
                    <span>{e.name}</span> <ExternalLink className="w-4 h-4" />
                  </Button>
                ))}
              </div>
              {result.description && (
                <div>
                  <h3 className="font-bold mt-4 mb-2 text-cyan-400">AI Description</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.description}</p>
                </div>
              )}
              {result.keywords?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((k: string, i: number) => <Badge key={i} variant="secondary">{k}</Badge>)}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </div>
    </>
  );
};
