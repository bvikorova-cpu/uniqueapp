import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Recycle, Copy, Twitter, Linkedin, Instagram, Mail, FileText, MessageSquare } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const OUTPUT_FORMATS = [
  { id: "twitter_thread", name: "Twitter Thread", icon: Twitter, desc: "Break into engaging tweet-sized chunks" },
  { id: "linkedin_post", name: "LinkedIn Post", icon: Linkedin, desc: "Professional, thought-leadership style" },
  { id: "instagram_caption", name: "Instagram Caption", icon: Instagram, desc: "Visual-first with hashtags & emojis" },
  { id: "email_newsletter", name: "Email Newsletter", icon: Mail, desc: "Engaging email with subject line" },
  { id: "blog_summary", name: "Blog Summary", icon: FileText, desc: "Concise summary with key takeaways" },
  { id: "sms_marketing", name: "SMS / Short Message", icon: MessageSquare, desc: "Ultra-short promotional message" },
];

interface Props {
  onBack: () => void;
}

const ContentRepurposer = ({ onBack }: Props) => {
  const [sourceContent, setSourceContent] = useState("");
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const toggleFormat = (id: string) => {
    setSelectedFormats(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleRepurpose = async () => {
    if (!sourceContent.trim() || selectedFormats.length === 0) {
      toast.error("Please provide content and select at least one output format");
      return;
    }
    setLoading(true);
    setResults({});
    try {
      const { data, error } = await supabase.functions.invoke("content-studio-ai", {
        body: { action: "repurpose", sourceContent, formats: selectedFormats },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResults(data.results || {});
      toast.success(`Repurposed into ${Object.keys(data.results || {}).length} formats! ${data.creditsUsed} credits used.`);
    } catch (e: any) {
      if (e.message?.includes("402")) toast.error("Insufficient credits. Please purchase more.");
      else if (e.message?.includes("429")) toast.error("Rate limited. Please wait a moment.");
      else toast.error(e.message || "Failed to repurpose content");
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
        title="How Content Repurposer works"
        steps={[
          { title: 'Paste source', desc: 'Blog, transcript, or long-form post.' },
          { title: 'Pick targets', desc: 'Tweet thread, reel script, LinkedIn.' },
          { title: 'Generate', desc: 'AI reshapes for each channel.' },
          { title: 'Publish', desc: 'Copy each variant and post.' },
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-black">AI Content Repurposer</h2>
          <p className="text-muted-foreground">Transform one piece of content into multiple formats instantly</p>
        </div>
        <Badge variant="outline">3 credits per format</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Source Content</CardTitle>
          <CardDescription>Paste your original content — blog post, article, script, or any text</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={sourceContent}
            onChange={(e) => setSourceContent(e.target.value)}
            placeholder="Paste your blog post, article, or any content here..."
            rows={8}
            className="mb-4"
          />
          <p className="text-xs text-muted-foreground">{sourceContent.length} characters</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Output Formats</CardTitle>
          <CardDescription>Select one or more formats to convert your content into</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {OUTPUT_FORMATS.map((fmt) => {
              const Icon = fmt.icon;
              const selected = selectedFormats.includes(fmt.id);
              return (
                <motion.div key={fmt.id} whileTap={{ scale: 0.97 }}>
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                    onClick={() => toggleFormat(fmt.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                      <div>
                        <p className="font-medium text-sm">{fmt.name}</p>
                        <p className="text-xs text-muted-foreground">{fmt.desc}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedFormats.length} format{selectedFormats.length !== 1 ? "s" : ""} selected — {selectedFormats.length * 3} credits total
            </p>
            <Button onClick={handleRepurpose} disabled={loading || !sourceContent.trim() || selectedFormats.length === 0}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Repurposing...</> : <><Recycle className="h-4 w-4 mr-2" /> Repurpose Content</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Repurposed Content</h3>
          {Object.entries(results).map(([formatId, content]) => {
            const fmt = OUTPUT_FORMATS.find(f => f.id === formatId);
            const Icon = fmt?.icon || FileText;
            return (
              <motion.div key={formatId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className="h-5 w-5 text-primary" />
                        {fmt?.name || formatId}
                      </CardTitle>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(content)}>
                        <Copy className="h-4 w-4 mr-1" /> Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg text-sm">{content}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
};

export default ContentRepurposer;
