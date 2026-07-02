import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, Brain, MessageSquare, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface AnalysisResultsProps {
  analysis: {
    results: any;
    truthfulness_score: number | null;
    analysis_type: string;
    created_at: string;
  };
}

export const AnalysisResults = ({ analysis }: AnalysisResultsProps) => {
  const results = analysis.results;
  const score = results.truthfulness_score || results.overall_truthfulness_score || analysis.truthfulness_score;

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 70) return "stroke-green-500";
    if (score >= 40) return "stroke-yellow-500";
    return "stroke-red-500";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return { label: "Likely Truthful", variant: "default" as const, icon: CheckCircle };
    if (score >= 40) return { label: "Uncertain", variant: "secondary" as const, icon: AlertTriangle };
    return { label: "Likely Deceptive", variant: "destructive" as const, icon: XCircle };
  };

  const renderArray = (arr: any[]) => {
    if (!arr || arr.length === 0) return <p className="text-xs sm:text-sm text-muted-foreground">None detected</p>;
    return (
    <>
      <FloatingHowItWorks title={"Analysis Results - How it works"} steps={[{ title: 'Open', desc: 'Access the Analysis Results section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Analysis Results.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <ul className="space-y-2">
        {arr.map((item, idx) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            {typeof item === 'object' ? JSON.stringify(item) : item}
          </motion.li>
        ))}
      </ul>
    </>
  );
  };

  const scoreBadge = score ? getScoreBadge(score) : null;
  const ScoreIcon = scoreBadge?.icon;
  const circumference = 2 * Math.PI * 45;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {score && (
        <Card className="bg-card/60 backdrop-blur-sm border-border/50 overflow-hidden">
          <div className={`h-1 bg-gradient-to-r ${score >= 70 ? 'from-green-500 to-emerald-500' : score >= 40 ? 'from-yellow-500 to-amber-500' : 'from-red-500 to-rose-500'}`} />
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" opacity="0.2" />
                  <motion.circle
                    cx="50" cy="50" r="45"
                    fill="none"
                    className={getScoreRingColor(score)}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl sm:text-3xl font-black ${getScoreColor(score)}`}>{score}%</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">Truthfulness Score</h3>
                </div>
                {scoreBadge && (
                  <Badge variant={scoreBadge.variant} className="text-xs mb-2">
                    {ScoreIcon && <ScoreIcon className="h-3 w-3 mr-1" />}
                    {scoreBadge.label}
                  </Badge>
                )}
                {results.confidence_level && (
                  <p className="text-xs text-muted-foreground">
                    Confidence: <span className="font-semibold text-foreground">{results.confidence_level}</span>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.deception_indicators && (
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Deception Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>{renderArray(results.deception_indicators)}</CardContent>
          </Card>
        )}

        {results.manipulation_tactics && (
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Manipulation Tactics
              </CardTitle>
            </CardHeader>
            <CardContent>{renderArray(results.manipulation_tactics)}</CardContent>
          </Card>
        )}
      </div>

      {results.emotional_analysis && (
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              Emotional Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {typeof results.emotional_analysis === 'object'
                ? JSON.stringify(results.emotional_analysis, null, 2)
                : results.emotional_analysis}
            </div>
          </CardContent>
        </Card>
      )}

      {results.recommendations && (
        <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {typeof results.recommendations === 'string' ? (
              <p className="text-xs sm:text-sm text-foreground whitespace-pre-wrap">{results.recommendations}</p>
            ) : (
              renderArray(results.recommendations)
            )}
          </CardContent>
        </Card>
      )}

      {results.raw_analysis && !score && (
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Analysis Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs sm:text-sm text-foreground whitespace-pre-wrap">{results.raw_analysis}</div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};
