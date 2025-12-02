import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, Brain, MessageSquare } from "lucide-react";

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

  const getScoreBadge = (score: number) => {
    if (score >= 70) return { label: "Likely Truthful", variant: "default" as const, icon: CheckCircle };
    if (score >= 40) return { label: "Uncertain", variant: "secondary" as const, icon: AlertTriangle };
    return { label: "Likely Deceptive", variant: "destructive" as const, icon: XCircle };
  };

  const renderArray = (arr: any[]) => {
    if (!arr || arr.length === 0) return <p className="text-xs sm:text-sm text-muted-foreground">None detected</p>;
    return (
      <ul className="list-disc list-inside space-y-1">
        {arr.map((item, idx) => (
          <li key={idx} className="text-xs sm:text-sm text-foreground">
            {typeof item === 'object' ? JSON.stringify(item) : item}
          </li>
        ))}
      </ul>
    );
  };

  const scoreBadge = score ? getScoreBadge(score) : null;
  const ScoreIcon = scoreBadge?.icon;

  return (
    <div className="space-y-3 sm:space-y-4 animate-fade-in">
      {score && (
        <Card className="glassmorphism border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center justify-between">
              <span>Truthfulness Score</span>
              {scoreBadge && (
                <Badge variant={scoreBadge.variant} className="text-xs sm:text-sm">
                  {ScoreIcon && <ScoreIcon className="h-3 w-3 mr-1" />}
                  {scoreBadge.label}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`text-4xl sm:text-5xl font-bold ${getScoreColor(score)}`}>
                {score}%
              </div>
              {results.confidence_level && (
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Confidence: <span className="font-semibold">{results.confidence_level}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {results.deception_indicators && (
        <Card className="glassmorphism">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Deception Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderArray(results.deception_indicators)}
          </CardContent>
        </Card>
      )}

      {results.emotional_analysis && (
        <Card className="glassmorphism">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              Emotional Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs sm:text-sm text-foreground whitespace-pre-wrap">
              {typeof results.emotional_analysis === 'object' 
                ? JSON.stringify(results.emotional_analysis, null, 2)
                : results.emotional_analysis}
            </div>
          </CardContent>
        </Card>
      )}

      {results.manipulation_tactics && (
        <Card className="glassmorphism">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Manipulation Tactics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderArray(results.manipulation_tactics)}
          </CardContent>
        </Card>
      )}

      {results.recommendations && (
        <Card className="glassmorphism border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
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
        <Card className="glassmorphism">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Analysis Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs sm:text-sm text-foreground whitespace-pre-wrap">
              {results.raw_analysis}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};