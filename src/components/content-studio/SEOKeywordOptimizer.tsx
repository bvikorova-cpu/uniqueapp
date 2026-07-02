import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Search, TrendingUp, AlertTriangle, CheckCircle, Target } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface KeywordResult {
  keyword: string;
  density: number;
  occurrences: number;
  recommendation: string;
}

interface SEOAnalysis {
  overall_score: number;
  title_analysis: { score: number; feedback: string };
  keyword_analysis: KeywordResult[];
  readability: { score: number; feedback: string };
  suggestions: string[];
  meta_description_suggestion: string;
}

interface Props {
  onBack: () => void;
}

const SEOKeywordOptimizer = ({ onBack }: Props) => {
  const [content, setContent] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!content.trim() || !targetKeyword.trim()) {
      toast.error("Please provide content and a target keyword");
      return;
    }
    setLoading(true);
    setAnalysis(null);
    try {
      const { data, error } = await supabase.functions.invoke("content-studio-ai", {
        body: { action: "seo-analyze", content, targetKeyword },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAnalysis(data.analysis);
      toast.success(`SEO analysis complete! ${data.creditsUsed} credits used.`);
    } catch (e: any) {
      if (e.message?.includes("402")) toast.error("Insufficient credits. Please purchase more.");
      else if (e.message?.includes("429")) toast.error("Rate limited. Please wait a moment.");
      else toast.error(e.message || "Failed to analyze content");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (score >= 50) return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };

  return (
    <>
      <FloatingHowItWorks
        title="How SEO Keyword Optimizer works"
        steps={[
          { title: 'Enter topic', desc: 'Add seed keyword or URL.' },
          { title: 'Analyze', desc: 'See volume, difficulty, intent.' },
          { title: 'Get suggestions', desc: 'AI proposes titles and headings.' },
          { title: 'Optimize', desc: 'Update content and re-check.' },
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-black">SEO Keyword Optimizer</h2>
          <p className="text-muted-foreground">AI-driven keyword density analysis and optimization recommendations</p>
        </div>
        <Badge variant="outline">4 credits</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content to Analyze</CardTitle>
          <CardDescription>Paste your content and specify your target keyword for SEO analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Target Keyword *</label>
            <Input value={targetKeyword} onChange={(e) => setTargetKeyword(e.target.value)} placeholder="e.g. AI content marketing, best travel tips..." />
          </div>
          <div>
            <label className="text-sm font-medium">Content *</label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Paste your blog post, article, or landing page content..." rows={10} />
            <p className="text-xs text-muted-foreground mt-1">{content.split(/\s+/).filter(Boolean).length} words</p>
          </div>
          <Button onClick={handleAnalyze} disabled={loading || !content.trim() || !targetKeyword.trim()} className="w-full">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : <><Search className="h-4 w-4 mr-2" /> Analyze SEO</>}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Overall Score */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className={`text-6xl font-black mb-2 ${getScoreColor(analysis.overall_score)}`}>
                {analysis.overall_score}
              </div>
              <p className="text-muted-foreground">Overall SEO Score</p>
              <Progress value={analysis.overall_score} className="mt-4 max-w-xs mx-auto" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {getScoreIcon(analysis.title_analysis.score)}
                  Title Analysis
                  <Badge variant="outline">{analysis.title_analysis.score}/100</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{analysis.title_analysis.feedback}</p>
              </CardContent>
            </Card>

            {/* Readability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {getScoreIcon(analysis.readability.score)}
                  Readability
                  <Badge variant="outline">{analysis.readability.score}/100</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{analysis.readability.feedback}</p>
              </CardContent>
            </Card>
          </div>

          {/* Keyword Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Keyword Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.keyword_analysis.map((kw, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{kw.keyword}</p>
                      <p className="text-xs text-muted-foreground">{kw.recommendation}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{kw.density.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">{kw.occurrences}x found</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Meta Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Suggested Meta Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg text-sm">{analysis.meta_description_suggestion}</div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Optimization Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};

export default SEOKeywordOptimizer;
