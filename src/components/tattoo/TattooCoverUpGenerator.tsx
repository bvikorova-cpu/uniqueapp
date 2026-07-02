import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, RefreshCw, Loader2, Sparkles, Upload, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const TattooCoverUpGenerator = ({ onBack }: Props) => {
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();
  const [oldTattooImg, setOldTattooImg] = useState<string | null>(null);
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ suggestions: string; coverUpUrl?: string } | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setOldTattooImg(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generate = async () => {
    if (!oldTattooImg) { toast.error("Upload your existing tattoo photo"); return; }
    if (credits.credits_remaining < 15) {
      toast.error("You need 15 credits. Redirecting...");
      setTimeout(() => navigate("/ai-credits"), 1500);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("tattoo-ai-tools", {
        body: { type: "cover_up", imageUrl: oldTattooImg, preferences },
      });
      if (error) throw error;
      setResult(data);
      
      if (data.coverUpUrl) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("ai_tattoo_designs").insert({
            user_id: user.id,
            prompt: `Cover-Up: ${preferences || "AI suggested"}`,
            style: "cover-up",
            design_url: data.coverUpUrl,
            credits_used: 15,
          });
        }
      }
      await refresh();
      toast.success("Cover-up design generated!");
    } catch (e: any) {
      toast.error(e.message || "Error generating cover-up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Tattoo Cover Up Generator - How it works"} steps={[{ title: 'Open', desc: 'Access the Tattoo Cover Up Generator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tattoo Cover Up Generator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-amber-400 hover:text-amber-300">
        <ArrowLeft className="h-4 w-4" /> Back to Atelier
      </Button>

      <Card className="p-6 max-w-3xl mx-auto bg-card/80 backdrop-blur-xl border-amber-500/20 shadow-[0_0_30px_rgba(212,175,55,0.08)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <RefreshCw className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Cover-Up Generator</h2>
            <p className="text-muted-foreground text-sm">AI designs to perfectly overlay your old tattoo</p>
          </div>
          <span className="ml-auto text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">15 Credits</span>
        </motion.div>

        <div className="space-y-4">
          <div>
            <Label className="text-amber-400/80 font-semibold">Upload Your Existing Tattoo</Label>
            <div className="mt-2 border-2 border-dashed border-amber-500/20 rounded-xl p-8 text-center cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-300" onClick={() => document.getElementById("coverup-upload")?.click()}>
              {oldTattooImg ? (
                <img src={oldTattooImg} alt="Old tattoo" className="max-h-64 mx-auto rounded-lg shadow-lg" />
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto text-amber-500/30 mb-3" />
                  <p className="text-muted-foreground font-medium">Click to upload your old tattoo photo</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Clear, well-lit photo for best results</p>
                </>
              )}
              <input id="coverup-upload" type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </div>
          </div>

          <div>
            <Label className="text-amber-400/80 font-semibold">Style Preferences (Optional)</Label>
            <Textarea placeholder="e.g., I'd like something floral, dark and bold, Japanese style..." value={preferences} onChange={(e) => setPreferences(e.target.value)} rows={3} className="mt-1 border-amber-500/20 focus:border-amber-500/50 bg-background/50" />
          </div>

          <Button onClick={generate} disabled={loading || !oldTattooImg} className="w-full gap-2 h-12 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold text-base shadow-lg shadow-amber-500/20">
            {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Generating Cover-Up...</> : <><Sparkles className="h-5 w-5" /> Generate Cover-Up — 15 Credits</>}
          </Button>

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {result.coverUpUrl && (
                <div>
                  <img src={result.coverUpUrl} alt="Cover-up design" className="w-full rounded-xl border-2 border-amber-500/30 shadow-2xl shadow-amber-500/10" />
                  <Button variant="outline" className="w-full gap-2 mt-3 border-amber-500/30 hover:bg-amber-500/10" onClick={() => {
                    const link = document.createElement("a");
                    link.href = result.coverUpUrl!;
                    link.download = `coverup-${Date.now()}.png`;
                    link.click();
                  }}>
                    <Download className="h-4 w-4" /> Download Design
                  </Button>
                </div>
              )}
              <Card className="p-5 bg-gradient-to-br from-amber-500/5 to-yellow-600/5 border-amber-500/20">
                <h3 className="font-black text-lg mb-3 bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">Cover-Up Strategy</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">{result.suggestions}</div>
              </Card>
            </motion.div>
          )}
        </div>
      </Card>
    </div>
    </>
  );
};
