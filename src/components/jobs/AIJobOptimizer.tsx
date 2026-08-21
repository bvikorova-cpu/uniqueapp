import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, 
  Wand2, 
  FileText, 
  Target, 
  CheckCircle, 
  Lightbulb,
  Crown,
  Zap,
  AlertCircle,
  TrendingUp,
  Award,
  Loader2,
  Upload,
  Star
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface ResumeAnalysis {
  professionalScore: number;
  scoreBreakdown: {
    formatting: number;
    content: number;
    keywords: number;
    experience: number;
  };
  strengths: string[];
  improvements: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  keywordsMissing: string[];
  hireabilityTips: string;
  summary: string;
}

export function AIJobOptimizer() {
  const [open, setOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  // Credit-only access (no subscriptions in the Work section)
  const { data: userStatus, refetch: refetchStatus } = useQuery({
    queryKey: ["jobs-optimizer-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { credits: 0, isLoggedIn: false };

      const { data: credits } = await supabase
        .from('ai_credits')
        .select('credits_remaining')
        .eq('user_id', user.id)
        .maybeSingle();

      return {
        credits: (credits as { credits_remaining?: number })?.credits_remaining || 0,
        isLoggedIn: true,
        userId: user.id
      };
    }
  });

  const handleAnalyze = async () => {
    if (!resumeText || resumeText.trim().length < 50) {
      toast({
        title: "Resume Too Short",
        description: "Please provide more resume content for analysis (at least 50 characters).",
        variant: "destructive"
      });
      return;
    }

    // Check if user can access
    if (!userStatus?.isLoggedIn) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to use the AI Resume Optimizer.",
        variant: "destructive"
      });
      return;
    }

    if ((userStatus?.credits ?? 0) < 5) {
      setUpgradeDialogOpen(true);
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-resume-ai', {
        body: { 
          resumeText,
          jobTitle,
          jobDescription
        }
      });

      if (error) throw error;

      if (data.error === 'Insufficient credits') {
        setUpgradeDialogOpen(true);
        return;
      }

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        setShowResults(true);
        refetchStatus();
        
        toast({
          title: "Analysis Complete!",
          description: `Your professional score: ${data.analysis.professionalScore}/100` });
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Could not analyze resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-400";
    if (score >= 60) return "from-yellow-500 to-amber-400";
    return "from-red-500 to-rose-400";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How AIJob Optimizer works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm border-primary/30 hover:border-primary/50 hover:bg-primary/5">
            <Wand2 className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">AI Optimizer</span>
            <span className="sm:hidden">Optimize</span>
            <Badge className="ml-1 text-[10px] bg-gradient-to-r from-violet-500 to-pink-500 text-white border-0">
              <Zap className="h-2.5 w-2.5 mr-0.5" />
              5 credits
            </Badge>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 backdrop-blur-xl bg-background/95 border-primary/20 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Wand2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  AI Resume Optimizer
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    5 Credits per scan
                  </Badge>
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>
              AI-powered resume analysis to boost your hireability by up to 40%
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[70vh] px-6 pb-6">
            {!showResults ? (
              <div className="space-y-6 py-4">
                {/* User Status Banner */}
                <Card className="backdrop-blur-sm border bg-muted/30 border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Your Credits: {userStatus?.credits || 0}</p>
                          <p className="text-sm text-muted-foreground">Each scan costs 5 credits</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { window.location.href = '/ai-credits'; }}
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Top up
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Feature Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="backdrop-blur-sm bg-card/50 border-primary/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Professional Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Get a detailed score breakdown across formatting, content, keywords, and experience
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="backdrop-blur-sm bg-card/50 border-primary/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        Actionable Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Receive 3+ prioritized improvement suggestions to enhance your resume
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Input Section */}
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Target Job Title (Optional)</Label>
                      <Input
                        id="jobTitle"
                        placeholder="e.g., Senior Software Engineer"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quick Paste</Label>
                      <p className="text-xs text-muted-foreground">
                        Copy your resume text and paste below
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobDescription">Job Description (Optional)</Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Paste the job description to get tailored optimization suggestions..."
                      className="min-h-[80px]"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resume">Your Resume Content *</Label>
                    <Textarea
                      id="resume"
                      placeholder="Paste your resume text here for AI-powered analysis and optimization suggestions...

Include your:
• Contact information
• Professional summary
• Work experience
• Education
• Skills"
                      className="min-h-[200px]"
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      {resumeText.length} characters • Minimum 50 required
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || resumeText.length < 50}
                    className="gap-2 bg-gradient-to-r from-primary to-primary/80"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Analyze Resume
                        <span className="text-xs opacity-80">(5 credits)</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : analysis && (
              <div className="space-y-6 py-4">
                {/* Score Hero Section */}
                <Card className="backdrop-blur-sm bg-gradient-to-br from-card/80 to-card/50 border-primary/20 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="relative">
                        <div className={`h-32 w-32 rounded-full bg-gradient-to-br ${getScoreGradient(analysis.professionalScore)} p-1`}>
                          <div className="h-full w-full rounded-full bg-background flex items-center justify-center">
                            <div className="text-center">
                              <span className={`text-4xl font-bold ${getScoreColor(analysis.professionalScore)}`}>
                                {analysis.professionalScore}
                              </span>
                              <span className="text-lg text-muted-foreground">/100</span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute -top-2 -right-2">
                          <Award className={`h-8 w-8 ${getScoreColor(analysis.professionalScore)}`} />
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-xl font-bold">Professional Score</h3>
                          <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(analysis.scoreBreakdown).map(([key, value]) => (
                            <div key={key} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="capitalize">{key}</span>
                                <span className={getScoreColor(value)}>{value}%</span>
                              </div>
                              <Progress value={value} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Strengths */}
                <Card className="backdrop-blur-sm bg-green-500/5 border-green-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      Your Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Star className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Improvements */}
                <Card className="backdrop-blur-sm bg-card/50 border-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Recommended Improvements
                    </CardTitle>
                    <CardDescription>
                      Prioritized suggestions to boost your hireability
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.improvements.map((improvement, i) => (
                      <div key={i} className="p-4 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold">{improvement.title}</h4>
                          <Badge className={`shrink-0 ${getPriorityColor(improvement.priority)}`}>
                            {improvement.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{improvement.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Missing Keywords */}
                {analysis.keywordsMissing.length > 0 && (
                  <Card className="backdrop-blur-sm bg-amber-500/5 border-amber-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="h-5 w-5" />
                        Missing Keywords
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keywordsMissing.map((keyword, i) => (
                          <Badge key={i} variant="outline" className="border-amber-500/30 text-amber-600">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Hireability Tips */}
                <Card className="backdrop-blur-sm bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Boost Your Hireability by 40%
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{analysis.hireabilityTips}</p>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setShowResults(false); setAnalysis(null); }}>
                    Analyze Another
                  </Button>
                  <Button onClick={() => setOpen(false)}>
                    Done
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Credits Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="max-w-md backdrop-blur-xl bg-background/95 border-primary/20">
          <div className="text-center space-y-6 py-4">
            <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Zap className="h-10 w-10 text-white" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">Not enough credits</h2>
              <p className="text-muted-foreground mt-2">
                An AI resume scan costs 5 credits. Top up to continue.
              </p>
            </div>

            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                <span className="text-sm">Detailed score breakdown</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                <span className="text-sm">Personalized improvement tips</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                <span className="text-sm">Keyword & ATS optimization</span>
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-violet-500 to-pink-500 text-white"
              onClick={() => {
                setUpgradeDialogOpen(false);
                window.location.href = '/ai-credits';
              }}
            >
              <Zap className="h-4 w-4 mr-2" />
              Buy Credits
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
    </>
    );
}
