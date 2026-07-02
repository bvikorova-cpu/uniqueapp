import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Shield, ShieldCheck, ShieldAlert, Copy, RefreshCw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface PlagiarismResult {
  originalityScore: number;
  analysis: string;
  suggestions: string[];
  flaggedSections: { text: string; reason: string }[];
}

interface Props {
  onBack: () => void;
}

const PlagiarismChecker = ({ onBack }: Props) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlagiarismResult | null>(null);

  const handleCheck = async () => {
    if (!content.trim() || content.trim().length < 50) {
      toast.error("Please enter at least 50 characters to check");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("content-studio-ai", {
        body: { action: "plagiarism", content },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast.success(`Check complete! ${data.creditsUsed} credits used.`);
    } catch (e: any) {
      toast.error(e.message || "Failed to check content");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return ShieldCheck;
    if (score >= 70) return Shield;
    return ShieldAlert;
  };

  return (
    <>
      <FloatingHowItWorks
        title="How Plagiarism Checker works"
        steps={[
          { title: 'Paste content', desc: 'Any text up to configured limit.' },
          { title: 'Scan', desc: 'AI checks against public web sources.' },
          { title: 'Review matches', desc: 'See highlighted overlaps and sources.' },
          { title: 'Rewrite', desc: 'Use suggestions to make it original.' },
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div>
          <h2 className="text-2xl font-black">Plagiarism Checker</h2>
          <p className="text-muted-foreground">AI-powered originality verification for your content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Content to Check
              <Badge variant="outline">3 credits</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your content here to check for originality (minimum 50 characters)..."
              rows={12}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{content.length} characters</span>
              <Button onClick={handleCheck} disabled={loading || content.trim().length < 50}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
                ) : (
                  <><Shield className="h-4 w-4 mr-2" /> Check Originality</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                {(() => {
                  const ScoreIcon = getScoreIcon(result.originalityScore);
                  return (
                    <>
                      <ScoreIcon className={`h-16 w-16 mx-auto mb-3 ${getScoreColor(result.originalityScore)}`} />
                      <div className={`text-5xl font-black mb-2 ${getScoreColor(result.originalityScore)}`}>
                        {result.originalityScore}%
                      </div>
                      <p className="text-muted-foreground font-medium">Originality Score</p>
                      <Progress value={result.originalityScore} className="mt-4 h-3" />
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{result.analysis}</p>
              </CardContent>
            </Card>

            {result.flaggedSections.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-500">Flagged Sections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.flaggedSections.map((s, i) => (
                    <div key={i} className="border-l-2 border-yellow-500 pl-3 py-1">
                      <p className="text-sm italic">"{s.text}"</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.reason}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {result.suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <RefreshCw className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          <Card className="flex items-center justify-center min-h-[400px]">
            <CardContent className="text-center">
              <Shield className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Ready to Check</h3>
              <p className="text-muted-foreground text-sm">Paste your content and click "Check Originality" to get a detailed analysis</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
  );
};

export default PlagiarismChecker;
