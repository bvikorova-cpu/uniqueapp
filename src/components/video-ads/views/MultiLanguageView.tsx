import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe2, Sparkles, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const MultiLanguageView = ({ onBack }: { onBack: () => void }) => {
  const [script, setScript] = useState("");
  const [languages, setLanguages] = useState("Spanish, French, German, Japanese");
  const [product, setProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!script.trim()) { toast.error("Enter a script to translate"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("video-ad-tools", {
        body: { action: "multi_language_translator", script, languages, product },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setResult(data.result);
      toast.success("Translations generated! (3 CR)");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  return (
    <>
      <FloatingHowItWorks title={"Multi Language View - How it works"} steps={[{ title: 'Open', desc: 'Access the Multi Language View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Multi Language View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Globe2 className="w-6 h-6 text-white" />
          </div>
          <div><h2 className="text-2xl font-black">AI Multi-Language Translator</h2><p className="text-muted-foreground text-sm">Localize your ad scripts for global markets</p></div>
          <Badge className="ml-auto bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0"><Sparkles className="w-3 h-3 mr-1" />3 CR</Badge>
        </div>
      </motion.div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Translation Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Product / Brand</Label><Input placeholder="e.g. Fitness App" value={product} onChange={e => setProduct(e.target.value)} /></div>
            <div><Label>Original Script *</Label><Textarea placeholder="Paste your ad script here..." value={script} onChange={e => setScript(e.target.value)} rows={6} /></div>
            <div><Label>Target Languages</Label><Input placeholder="e.g. Spanish, French, German" value={languages} onChange={e => setLanguages(e.target.value)} /></div>
            <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Translating...</> : <><Globe2 className="mr-2 h-4 w-4" />Translate (3 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Translations</CardTitle></CardHeader>
          <CardContent>
            {!result ? (
              <div className="text-center py-12 text-muted-foreground"><Globe2 className="w-16 h-16 mx-auto mb-4 opacity-20" /><p>Translate your ad scripts into multiple languages</p></div>
            ) : (
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                {result.translations?.map((t: any, i: number) => (
                  <Card key={i} className="bg-muted/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold flex items-center gap-2">
                          <span className="text-lg">{t.flag || '🌐'}</span> {t.language}
                        </h4>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(t.translatedScript)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm whitespace-pre-wrap mb-3">{t.translatedScript}</p>
                      {t.culturalNotes && <div className="p-2 bg-primary/5 rounded-lg text-xs"><strong>Cultural Notes:</strong> {t.culturalNotes}</div>}
                      {t.localizedCTA && <div className="mt-2 text-xs"><strong>Localized CTA:</strong> {t.localizedCTA}</div>}
                    </CardContent>
                  </Card>
                ))}
                {result.generalTips && <div className="p-4 bg-primary/5 rounded-xl"><h4 className="font-bold mb-2">Localization Tips</h4><p className="text-sm text-muted-foreground">{result.generalTips}</p></div>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};
