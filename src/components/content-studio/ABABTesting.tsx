import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, FlaskConical, Copy, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props {
  onBack: () => void;
}

const CONTENT_TYPES = [
  { id: "email_subject", label: "Email Subject Line" },
  { id: "ad_headline", label: "Ad Headline" },
  { id: "social_post", label: "Social Media Post" },
  { id: "cta_button", label: "Call-to-Action" },
  { id: "product_description", label: "Product Description" },
];

const ABABTesting = ({ onBack }: Props) => {
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [contentType, setContentType] = useState("email_subject");
  const [variantCount, setVariantCount] = useState(3);
  const [variants, setVariants] = useState<{ id: string; content: string; reasoning: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please provide a topic or product name");
      return;
    }
    setLoading(true);
    setVariants([]);
    setWinner(null);
    try {
      const { data, error } = await supabase.functions.invoke("content-studio-ai", {
        body: { action: "ab-test", topic, context, contentType, variantCount },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setVariants(data.variants || []);
      setWinner(data.recommended || null);
      toast.success(`Generated ${data.variants?.length || 0} variants! ${data.creditsUsed} credits used.`);
    } catch (e: any) {
      if (e.message?.includes("402")) toast.error("Insufficient credits. Please purchase more.");
      else if (e.message?.includes("429")) toast.error("Rate limited. Please wait a moment.");
      else toast.error(e.message || "Failed to generate variants");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  return (
    <>
      <FloatingHowItWorks
        title="How A/B Testing works"
        steps={[
          { title: 'Create variants', desc: 'Two versions of the same asset.' },
          { title: 'Split audience', desc: 'Send each variant to a segment.' },
          { title: 'Track results', desc: 'Compare CTR, engagement, conversions.' },
          { title: 'Roll out winner', desc: 'Promote the best-performing variant.' },
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-black">AI A/B Testing</h2>
          <p className="text-muted-foreground">Generate and compare multiple content variations with AI recommendations</p>
        </div>
        <Badge variant="outline">5 credits</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>Define what you want to test and AI will generate optimized variants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Topic / Product *</label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Summer Sale, New App Launch..." />
            </div>
            <div>
              <label className="text-sm font-medium">Content Type</label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Additional Context (Optional)</label>
            <Textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="Target audience, brand tone, specific requirements..." rows={3} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Variants:</label>
              {[2, 3, 4, 5].map(n => (
                <Button key={n} size="sm" variant={variantCount === n ? "default" : "outline"} onClick={() => setVariantCount(n)}>{n}</Button>
              ))}
            </div>
            <Button onClick={handleGenerate} disabled={loading || !topic.trim()}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><FlaskConical className="h-4 w-4 mr-2" /> Generate Variants</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {variants.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {variants.length} Variants Generated
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {variants.map((variant, i) => (
              <motion.div key={variant.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className={`transition-all ${winner === variant.id ? "border-primary ring-2 ring-primary/20" : ""}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Variant {String.fromCharCode(65 + i)}
                        {winner === variant.id && (
                          <Badge className="ml-2 bg-primary/10 text-primary">
                            <ThumbsUp className="h-3 w-3 mr-1" /> AI Recommended
                          </Badge>
                        )}
                      </CardTitle>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(variant.content)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-muted p-4 rounded-lg font-medium">{variant.content}</div>
                    <p className="text-sm text-muted-foreground">{variant.reasoning}</p>
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

export default ABABTesting;
