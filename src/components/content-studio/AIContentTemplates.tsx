import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { ArrowLeft, Loader2, Copy, Sparkles, Mail, Megaphone, Linkedin, Twitter,
  Instagram, FileText, Presentation, ShoppingBag, Newspaper, MessageSquare } from "lucide-react";

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
  const [topicTouched, setTopicTouched] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const template = TEMPLATES.find((t) => t.id === selectedTemplate);

  useEffect(() => {
    if (result) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      toast.error("Choose a template first");
      return;
    }
    const cleanTopic = topic.trim();
    if (!cleanTopic) {
      setTopicTouched(true);
      document.getElementById("content-template-topic")?.focus();
      toast.error("Enter a topic / subject first");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("content-studio-ai", {
        body: {
          action: "templates",
          templateType: selectedTemplate,
          topic: cleanTopic,
          details: details.trim(),
          systemPrompt: `You are a world-class copywriter. Write a professional "${template?.name ?? selectedTemplate}" (${template?.desc ?? ""}). Return polished, ready-to-use plain text — no JSON, no markdown code fences.`,
        } });
      if (error) {
        const ctx: any = (error as any)?.context;
        let msg = error.message;
        try {
          if (ctx && typeof ctx.json === "function") {
            const body = await ctx.json();
            if (body?.error) msg = String(body.error);
          }
        } catch { /* ignore */ }
        throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);

      const text =
        typeof data?.content === "string" ? data.content
        : typeof data?.result === "string" ? data.result
        : typeof data?.text === "string" ? data.text
        : data ? JSON.stringify(
            Object.fromEntries(Object.entries(data).filter(([k]) => k !== "creditsCharged")),
            null, 2,
          )
        : "";

      if (!text.trim()) throw new Error("AI returned an empty response. Please try again.");
      setResult(text);
      toast.success(`Template generated! ${data?.creditsCharged ?? template?.credits ?? 0} credits used.`);
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
    <div className="space-y-6 pb-32 sm:pb-6">
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
        <div className="mx-auto w-full max-w-3xl space-y-6 overflow-x-hidden px-0 sm:px-1">
          <Card className="w-full max-w-full overflow-hidden">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex flex-wrap items-center gap-2 text-left text-balance">
                {template && <template.icon className="h-5 w-5 text-primary" />}
                <span className="min-w-0 break-words">{template?.name}</span>
                <Badge variant="outline" className="shrink-0">{template?.credits} credits</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              <div>
                <label className="text-sm font-medium">Topic / Subject *</label>
                <Input
                  id="content-template-topic"
                  value={topic}
                  onBlur={() => setTopicTouched(true)}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    if (e.target.value.trim()) setTopicTouched(false);
                  }}
                  placeholder="What is this content about?"
                  aria-invalid={topicTouched && !topic.trim()}
                />
                {topicTouched && !topic.trim() && (
                  <p className="mt-1 text-sm text-destructive">Topic is required before generating.</p>
                )}
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
              <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                <Button variant="outline" className="h-auto min-h-12 w-full min-w-0 max-w-full px-3 py-3 whitespace-normal leading-tight" onClick={() => { setSelectedTemplate(null); setResult(null); setTopicTouched(false); }}>
                  Change Template
                </Button>
                <Button onClick={handleGenerate} disabled={loading} className="h-auto min-h-12 w-full min-w-0 max-w-full justify-center overflow-hidden px-3 py-3 text-center whitespace-normal leading-tight disabled:opacity-60">
                  {loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <Sparkles className="h-4 w-4 shrink-0" />}
                  <span className="min-w-0 break-words leading-tight">{loading ? "Generating..." : `Generate (${template?.credits} credits)`}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <motion.div ref={resultRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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
