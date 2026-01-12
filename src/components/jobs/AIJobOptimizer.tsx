import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, FileText, Target, CheckCircle, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AIJobOptimizer() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm">
          <Wand2 className="h-4 w-4" />
          <span className="hidden sm:inline">AI Optimizer</span>
          <span className="sm:hidden">Optimize</span>
          <Badge variant="secondary" className="ml-1 text-[10px]">Coming Soon</Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            AI Application Optimizer
            <Badge variant="secondary">Coming Soon</Badge>
          </DialogTitle>
          <DialogDescription>
            Let AI help you optimize your job applications for better success rates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Feature Preview Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  CV Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Upload your CV and get AI-powered suggestions to improve it for specific job positions
                </p>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Job Match Scoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See how well your profile matches job requirements with detailed scoring
                </p>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Cover Letter Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate personalized cover letters tailored to each job posting
                </p>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Skills Gap Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Identify missing skills and get recommendations for improvement
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Placeholder for future functionality */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">AI-Powered Application Optimization</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                    Our AI will analyze job descriptions and help you tailor your applications 
                    to increase your chances of getting interviews.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline">Resume Optimization</Badge>
                  <Badge variant="outline">Keyword Matching</Badge>
                  <Badge variant="outline">Interview Prep</Badge>
                  <Badge variant="outline">Salary Insights</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sample Input Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Preview: Paste your CV for analysis</label>
            <Textarea
              placeholder="This feature is coming soon. You'll be able to paste your CV here for AI-powered optimization suggestions..."
              className="min-h-[100px]"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              This feature will be available soon. Stay tuned for updates!
            </p>
          </div>

          <div className="flex justify-end">
            <Button disabled className="gap-2">
              <Sparkles className="h-4 w-4" />
              Analyze & Optimize
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
