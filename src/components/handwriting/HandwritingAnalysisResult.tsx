import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SocialShareButtons } from "@/components/shared/SocialShareButtons";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Heart,
  MessageCircle,
  Briefcase,
  Users,
  Target,
  Activity,
  Lightbulb,
  Crown,
} from "lucide-react";

interface HandwritingAnalysisResultProps {
  analysis: any;
}

export const HandwritingAnalysisResult = ({
  analysis,
}: HandwritingAnalysisResultProps) => {
  const getTypeLabel = (type: string) => {
    const labels = {
      personal: "Personal Analysis",
      professional: "Professional Analysis",
      relationship: "Relationship Analysis",
      business: "Business Analysis",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      personal: "bg-purple-500",
      professional: "bg-blue-500",
      relationship: "bg-pink-500",
      business: "bg-green-500",
    };
    return colors[type as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">Analysis Results</h2>
          <Badge className={getTypeColor(analysis.analysis_type)}>
            {getTypeLabel(analysis.analysis_type)}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          Analyzed on {new Date(analysis.created_at).toLocaleDateString()} • {analysis.credits_used} credits used
        </div>

        <img
          src={analysis.image_url}
          alt="Analyzed handwriting"
          className="w-full max-h-64 object-contain rounded-lg border mb-6"
        />
      </Card>

      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg sm:text-xl font-bold">Detailed Analysis</h3>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">
          {analysis.detailed_analysis}
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h3 className="text-base sm:text-lg font-bold">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {analysis.strengths?.map((strength: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-sm sm:text-base">{strength}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-orange-500" />
            <h3 className="text-base sm:text-lg font-bold">Areas for Growth</h3>
          </div>
          <ul className="space-y-2">
            {analysis.weaknesses?.map((weakness: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span className="text-sm sm:text-base">{weakness}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-pink-500" />
            <h4 className="font-semibold text-sm">Emotional State</h4>
          </div>
          <p className="text-sm text-muted-foreground">{analysis.emotional_state}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-4 w-4 text-blue-500" />
            <h4 className="font-semibold text-sm">Communication Style</h4>
          </div>
          <p className="text-sm text-muted-foreground">{analysis.communication_style}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-4 w-4 text-indigo-500" />
            <h4 className="font-semibold text-sm">Work Approach</h4>
          </div>
          <p className="text-sm text-muted-foreground">{analysis.work_approach}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-green-500" />
            <h4 className="font-semibold text-sm">Relationship Patterns</h4>
          </div>
          <p className="text-sm text-muted-foreground">{analysis.relationship_patterns}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-red-500" />
            <h4 className="font-semibold text-sm">Decision Making</h4>
          </div>
          <p className="text-sm text-muted-foreground">{analysis.decision_making}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-orange-500" />
            <h4 className="font-semibold text-sm">Stress Indicators</h4>
          </div>
          <p className="text-sm text-muted-foreground">{analysis.stress_indicators}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <h4 className="font-semibold text-sm">Creativity Level</h4>
          </div>
          <p className="text-sm text-muted-foreground">{analysis.creativity_level}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-purple-500" />
            <h4 className="font-semibold text-sm">Leadership Qualities</h4>
          </div>
          <p className="text-sm text-muted-foreground">{analysis.leadership_qualities}</p>
        </Card>
      </div>

      {analysis.personality_traits && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Personality Traits</h3>
          <div className="space-y-3">
            {Object.entries(analysis.personality_traits).map(([trait, description]) => (
              <div key={trait}>
                <h4 className="font-semibold text-sm capitalize mb-1">{trait}</h4>
                <p className="text-sm text-muted-foreground">{description as string}</p>
                {trait !== "neuroticism" && <Separator className="mt-3" />}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-blue-500" />
          <h3 className="text-base sm:text-lg font-bold">Recommendations</h3>
        </div>
        <ul className="space-y-2">
          {analysis.recommendations?.map((rec: string, idx: number) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">→</span>
              <span className="text-sm sm:text-base">{rec}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Social Share Section */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-500/5 to-indigo-500/5">
        <h3 className="text-base sm:text-lg font-bold mb-4 text-center">Share Your Results</h3>
        <SocialShareButtons
          title={`My Handwriting Analysis - ${getTypeLabel(analysis.analysis_type)}`}
          description={`I just discovered my personality traits through handwriting analysis! My strengths include: ${analysis.strengths?.slice(0, 2).join(", ")}. Try it yourself!`}
          hashtags={["HandwritingAnalysis", "PersonalityTest", "Graphology"]}
        />
      </Card>
    </div>
  );
};
