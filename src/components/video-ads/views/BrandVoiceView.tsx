import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mic2, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const BrandVoiceView = ({ onBack }: { onBack: () => void }) => {
  const [brand, setBrand] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!brand.trim()) { toast.error("Enter your brand name"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("video-ad-tools", {
        body: { action: "brand_voice", brand, industry, description, audience },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setResult(data.result);
      toast.success("Brand voice analyzed! (2 CR)");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Brand Voice View - How it works"} steps={[{ title: 'Open', desc: 'Access the Brand Voice View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Brand Voice View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
            <Mic2 className="w-6 h-6 text-white" />
          </div>
          <div><h2 className="text-2xl font-black">AI Brand Voice Matcher</h2><p className="text-muted-foreground text-sm">Define your unique brand identity & tone</p></div>
          <Badge className="ml-auto bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0"><Sparkles className="w-3 h-3 mr-1" />2 CR</Badge>
        </div>
      </motion.div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Brand Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Brand Name *</Label><Input placeholder="e.g. Nike" value={brand} onChange={e => setBrand(e.target.value)} /></div>
            <div><Label>Industry</Label><Input placeholder="e.g. Sports & Fitness" value={industry} onChange={e => setIndustry(e.target.value)} /></div>
            <div><Label>Brand Description</Label><Textarea placeholder="Describe your brand values, mission..." value={description} onChange={e => setDescription(e.target.value)} rows={3} /></div>
            <div><Label>Target Audience</Label><Input placeholder="e.g. Athletes 18-35" value={audience} onChange={e => setAudience(e.target.value)} /></div>
            <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-teal-500 to-cyan-600">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Mic2 className="mr-2 h-4 w-4" />Analyze (2 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Brand Voice Profile</CardTitle></CardHeader>
          <CardContent>
            {!result ? (
              <div className="text-center py-12 text-muted-foreground"><Mic2 className="w-16 h-16 mx-auto mb-4 opacity-20" /><p>Analyze your brand to define its voice</p></div>
            ) : (
              <div className="space-y-5 max-h-[700px] overflow-y-auto pr-2">
                {result.voiceProfile && (
                  <Card className="bg-muted/30"><CardContent className="pt-4">
                    <h4 className="font-bold mb-2">Voice Profile</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Personality:</strong> {result.voiceProfile.personality}</div>
                      <div><strong>Tone:</strong> {result.voiceProfile.tone}</div>
                      <div><strong>Values:</strong> {result.voiceProfile.values}</div>
                      <div><strong>Keywords:</strong> {result.voiceProfile.keywords}</div>
                    </div>
                  </CardContent></Card>
                )}
                {result.brandArchetype && <div className="p-3 bg-primary/5 rounded-lg"><strong>Archetype:</strong> {result.brandArchetype}</div>}
                {result.uniqueSellingProposition && <div className="p-3 bg-primary/5 rounded-lg"><strong>USP:</strong> {result.uniqueSellingProposition}</div>}
                <div className="grid md:grid-cols-2 gap-4">
                  {result.doList && (
                    <div><h4 className="font-bold mb-2 flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" />Do</h4>
                      <ul className="space-y-1">{result.doList.map((d: string, i: number) => <li key={i} className="text-sm text-muted-foreground">✅ {d}</li>)}</ul>
                    </div>
                  )}
                  {result.dontList && (
                    <div><h4 className="font-bold mb-2 flex items-center gap-1"><XCircle className="w-4 h-4 text-red-500" />Don't</h4>
                      <ul className="space-y-1">{result.dontList.map((d: string, i: number) => <li key={i} className="text-sm text-muted-foreground">❌ {d}</li>)}</ul>
                    </div>
                  )}
                </div>
                {result.samplePhrases && (
                  <div><h4 className="font-bold mb-2">Sample Phrases</h4>
                    <div className="flex flex-wrap gap-2">{result.samplePhrases.map((p: string, i: number) => <Badge key={i} variant="secondary">"{p}"</Badge>)}</div>
                  </div>
                )}
                {result.musicStyleRecommendation && <div className="p-3 bg-primary/5 rounded-lg"><strong>Music Style:</strong> {result.musicStyleRecommendation}</div>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};
