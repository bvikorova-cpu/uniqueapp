import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Layers, Copy, Download, CheckCircle } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props {
  onBack: () => void;
}

const PLATFORMS = [
  { id: "twitter", label: "Twitter/X" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "blog", label: "Blog Posts" },
  { id: "email", label: "Email Campaigns" },
];

const BulkContentGenerator = ({ onBack }: Props) => {
  const [topic, setTopic] = useState("");
  const [guidelines, setGuidelines] = useState("");
  const [platform, setPlatform] = useState("twitter");
  const [count, setCount] = useState(5);
  const [results, setResults] = useState<{ id: number; content: string; hashtags?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIds, setCopiedIds] = useState<Set<number>>(new Set());
  const [topicError, setTopicError] = useState("");
  const topicInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setTopicError("Topic / Theme is required");
      topicInputRef.current?.focus();
      toast.error("Topic / Theme is required");
      return;
    }
    setTopicError("");
    setLoading(true);
    setResults([]);
    setCopiedIds(new Set());
    try {
      const { data, error } = await supabase.functions.invoke("content-studio-ai", {
        body: { action: "bulk-generate", topic, guidelines, platform, count } });
      if (error) {
        let detail = "";
        try {
          const body = await (error as any)?.context?.json?.();
          detail = body?.error || body?.message || "";
        } catch { /* ignore */ }
        throw new Error(detail || error.message || "Failed to generate content");
      }
      if (data?.error) throw new Error(data.error);
      setResults(data.posts || []);
      toast.success(`Generated ${data.posts?.length || 0} posts! ${data.creditsUsed} credits used.`);
    } catch (e: any) {
      if (e.message?.includes("402")) toast.error("Insufficient credits. Please purchase more.");
      else if (e.message?.includes("429")) toast.error("Rate limited. Please wait a moment.");
      else toast.error(e.message || "Failed to generate content");
    } finally {
      setLoading(false);
    }
  };

  const copyItem = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIds(prev => new Set([...prev, id]));
    toast.success("Copied!");
  };

  const copyAll = () => {
    const all = results.map((r, i) => `--- Post ${i + 1} ---\n${r.content}${r.hashtags ? `\n${r.hashtags}` : ""}`).join("\n\n");
    navigator.clipboard.writeText(all);
    toast.success("All posts copied!");
  };

  return (
    <>
      <FloatingHowItWorks
        title="How Bulk Generator works"
        steps={[
          { title: 'Pick template', desc: 'Choose caption, hook, or thread style.' },
          { title: 'Set batch size', desc: 'Generate 5–50 variants at once.' },
          { title: 'Generate', desc: 'AI writes them in your voice.' },
          { title: 'Export', desc: 'Copy or download for scheduling.' },
        ]}
      />
    <div className="space-y-6 overflow-x-hidden pb-56 sm:pb-20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-black">Bulk Content Generator</h2>
          <p className="text-muted-foreground">Generate multiple posts from a single prompt — save hours of work</p>
        </div>
        <Badge variant="outline" className="w-fit">5 credits per batch</Badge>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Batch Configuration</CardTitle>
          <CardDescription>Define your topic and AI will generate multiple unique posts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="min-w-0 space-y-2">
              <label className="text-sm font-medium" htmlFor="bulk-topic">Topic / Theme *</label>
              <Input
                id="bulk-topic"
                ref={topicInputRef}
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (topicError) setTopicError("");
                }}
                placeholder="e.g. AI productivity tips"
                aria-invalid={Boolean(topicError)}
              />
              {topicError && <p className="text-sm font-medium text-destructive">{topicError}</p>}
            </div>
            <div className="min-w-0 space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="min-w-0 space-y-2">
            <label className="text-sm font-medium">Brand Guidelines / Tone (Optional)</label>
            <Textarea value={guidelines} onChange={(e) => setGuidelines(e.target.value)} placeholder="Describe your brand voice, tone, target audience..." rows={3} />
          </div>
          <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
            <div className="grid grid-cols-4 items-center gap-2 sm:flex sm:gap-3">
              <label className="col-span-4 text-sm font-medium sm:col-span-1">Number of posts:</label>
              {[3, 5, 7, 10].map(n => (
                <Button key={n} size="sm" variant={count === n ? "default" : "outline"} onClick={() => setCount(n)} className="min-h-11 w-full sm:w-auto">{n}</Button>
              ))}
            </div>
            <div className="text-sm font-medium text-muted-foreground sm:text-right">{count * 2} credits total</div>
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="min-h-12 w-full whitespace-normal leading-tight">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating {count} posts...</> : <><Layers className="h-4 w-4 mr-2" /> {topic.trim() ? `Generate ${count} Posts` : "Topic required"}</>}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{results.length} Posts Generated</h3>
            <Button variant="outline" size="sm" onClick={copyAll}>
              <Download className="h-4 w-4 mr-1" /> Copy All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="h-full">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Post {i + 1}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => copyItem(post.id, post.content + (post.hashtags ? `\n${post.hashtags}` : ""))}>
                        {copiedIds.has(post.id) ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                    {post.hashtags && <p className="text-xs text-primary">{post.hashtags}</p>}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default BulkContentGenerator;
