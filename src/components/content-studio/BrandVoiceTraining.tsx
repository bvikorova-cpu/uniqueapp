import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Sparkles, Brain, Save, Trash2, Plus, Wand2 } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface BrandVoice {
  id: string;
  brand_name: string;
  tone: string;
  style_notes: string;
  sample_content: string;
  created_at: string;
}

interface Props {
  onBack: () => void;
}

const BrandVoiceTraining = ({ onBack }: Props) => {
  const [voices, setVoices] = useState<BrandVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [testPrompt, setTestPrompt] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);

  const [form, setForm] = useState({
    brand_name: "",
    tone: "",
    style_notes: "",
    sample_content: "",
  });

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await (supabase as any)
      .from("brand_voices")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setVoices((data as any[]) || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.brand_name.trim() || !form.tone.trim()) {
      toast.error("Brand name and tone are required");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await (supabase as any).from("brand_voices").insert({
        user_id: user.id,
        brand_name: form.brand_name,
        tone: form.tone,
        style_notes: form.style_notes,
        sample_content: form.sample_content,
      });
      if (error) throw error;
      toast.success("Brand voice saved!");
      setForm({ brand_name: "", tone: "", style_notes: "", sample_content: "" });
      setShowForm(false);
      loadVoices();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await (supabase as any).from("brand_voices").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Brand voice deleted");
      loadVoices();
    }
  };

  const handleTestVoice = async () => {
    if (!selectedVoice || !testPrompt.trim()) return;
    setGenerating(true);
    setTestResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("content-studio-ai", {
        body: { action: "brand-voice", voiceId: selectedVoice, prompt: testPrompt },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTestResult(data.content);
      toast.success(`Content generated! ${data.creditsUsed} credits used.`);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title="How Brand Voice Training works"
        steps={[
          { title: 'Add samples', description: 'Paste 3–10 examples of your voice.' },
          { title: 'Train', description: 'AI extracts tone, phrasing, style.' },
          { title: 'Test outputs', description: 'Regenerate until it matches.' },
          { title: 'Use everywhere', description: 'Applied across all Studio tools.' },
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-black">Brand Voice Training</h2>
          <p className="text-muted-foreground">Train AI to write in your brand's unique tone & style</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Voice
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Create Brand Voice Profile</CardTitle>
              <CardDescription>Define your brand's personality for consistent AI-generated content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Brand Name *</label>
                  <Input value={form.brand_name} onChange={(e) => setForm({ ...form, brand_name: e.target.value })} placeholder="e.g. TechStart Inc." />
                </div>
                <div>
                  <label className="text-sm font-medium">Tone *</label>
                  <Input value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} placeholder="e.g. Professional yet friendly, witty, authoritative" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Style Notes</label>
                <Textarea value={form.style_notes} onChange={(e) => setForm({ ...form, style_notes: e.target.value })} placeholder="Preferred vocabulary, phrases to avoid, formatting preferences, target audience details..." rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Sample Content (for AI to learn from)</label>
                <Textarea value={form.sample_content} onChange={(e) => setForm({ ...form, sample_content: e.target.value })} placeholder="Paste examples of your existing content so AI can match the style..." rows={5} />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Brand Voice
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : voices.length === 0 && !showForm ? (
        <Card className="text-center py-12">
          <CardContent>
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">No Brand Voices Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first brand voice profile to generate consistent, on-brand content.</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create Brand Voice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {voices.map((v) => (
            <motion.div key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className={`cursor-pointer transition-all ${selectedVoice === v.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/30"}`}>
                <CardContent className="p-5" onClick={() => setSelectedVoice(selectedVoice === v.id ? null : v.id)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{v.brand_name}</h3>
                      <Badge variant="outline" className="mt-1">{v.tone}</Badge>
                    </div>
                    <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(v.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  {v.style_notes && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{v.style_notes}</p>}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {selectedVoice && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Generate with Brand Voice
                <Badge variant="outline">5 credits</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea value={testPrompt} onChange={(e) => setTestPrompt(e.target.value)} placeholder="What content do you want to generate in this brand's voice?" rows={3} />
              <Button onClick={handleTestVoice} disabled={generating || !testPrompt.trim()}>
                {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {generating ? "Generating..." : "Generate Content"}
              </Button>
              {testResult && (
                <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg text-sm mt-4">{testResult}</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};

export default BrandVoiceTraining;
