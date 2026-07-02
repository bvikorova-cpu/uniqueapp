import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import {
  ArrowLeft, Loader2, Copy, Sparkles, Mail, Megaphone, Linkedin, Twitter,
  Instagram, FileText, Presentation, ShoppingBag, Newspaper, MessageSquare,
} from "lucide-react";

const TEMPLATES = [
  { id: "email_marketing", name: "Email Marketing", icon: Mail, credits: 3, desc: "Compelling email campaigns with subject lines and CTA" },
  { id: "facebook_ad", name: "Facebook Ad", icon: Megaphone, credits: 2, desc: "High-converting ad copy with headlines and descriptions" },
  { id: "linkedin_post", name: "LinkedIn Post", icon: Linkedin, credits: 2, desc: "Professional thought leadership posts" },
  { id: "twitter_thread", name: "Twitter/X Thread", icon: Twitter, credits: 3, desc: "Viral thread with hooks and engagement" },
  { id: "instagram_caption", name: "Instagram Caption", icon: Instagram, credits: 1, desc: "Engaging captions with relevant hashtags" },
  { id: "press_release", name: "Press Release", icon: Newspaper, credits: 5, desc: "Professional press releases with quotes" },
  { id: "product_description", name: "Product Description", icon: ShoppingBag, credits: 2, desc: "Persuasive product copy that sells" },
  { id: "pitch_deck", name: "Pitch Deck Script", icon: Presentation, credits: 5, desc: "Investor pitch deck slide scripts" },
  { id: "newsletter", name: "Newsletter", icon: FileText, credits: 3, desc: "Engaging newsletter content with sections" },
  { id: "chatbot_script", name: "Chatbot Script", icon: MessageSquare, credits: 3, desc: "Customer service chatbot dialog flows" },
];

interface Props {
  onBack: () => void;
}

const AIContentTemplates = ({ onBack }: Props) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const template = TEMPLATES.find((t) => t.id === selectedTemplate);

  const handleGenerate = async () => {
    if (!selectedTemplate || !topic.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("content-studio-ai", {
        body: { action: "templates", templateType: selectedTemplate, topic, details },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.content);
      toast.success(`Template generated! ${data.creditsUsed} credits used.`);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate template");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <>
      <FloatingHowItWorks
        title="How AI Content Templates works"
        steps={[
          { title: 'Browse templates', desc: 'Hooks, captions, scripts, threads.' },
          { title: 'Fill the prompt', desc: 'Add topic and context.' },
          { title: 'Generate', desc: 'AI writes based on the template.' },
          { title: 'Save favorites', desc: 'Reuse templates that convert.' },
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div>
          <h2 className="text-2xl font-black">AI Content Templates</h2>
          <p className="text-muted-foreground">Pre-built templates for instant professional content</p>
        </div>
      </div>

      {!selectedTemplate ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg active:scale-[0.97]"
                  onClick={() => setSelectedTemplate(t.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold">{t.name}</h3>
                          <Badge variant="outline" className="text-xs">{t.credits} cr</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {template && <template.icon className="h-5 w-5 text-primary" />}
                {template?.name}
                <Badge variant="outline">{template?.credits} credits</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Topic / Subject *</label>
                <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What is this content about?" />
              </div>
              <div>
                <label className="text-sm font-medium">Additional Details</label>
                <Textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Target audience, tone, key points, brand guidelines..."
                  rows={4}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setSelectedTemplate(null); setResult(null); }}>
                  Change Template
                </Button>
                <Button onClick={handleGenerate} disabled={loading || !topic.trim()} className="flex-1">
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  {loading ? "Generating..." : `Generate (${template?.credits} credits)`}
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated Content</CardTitle>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(result)}>
                      <Copy className="h-4 w-4 mr-2" /> Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg text-sm">{result}</div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </div>
    </>
  );
};

export default AIContentTemplates;
