import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SocialShareButtons } from "@/components/shared/SocialShareButtons";
import {
  Brain, TrendingUp, TrendingDown, Heart, MessageCircle,
  Briefcase, Users, Target, Activity, Lightbulb, Crown, Share2,
} from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface HandwritingAnalysisResultProps {
  analysis: any;
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    personal: "from-purple-500 to-violet-500",
    professional: "from-blue-500 to-cyan-500",
    relationship: "from-pink-500 to-rose-500",
    business: "from-emerald-500 to-teal-500",
  };
  return colors[type] || "from-primary to-accent";
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    personal: "Personal Analysis",
    professional: "Professional Analysis",
    relationship: "Relationship Analysis",
    business: "Business Analysis",
  };
  return labels[type] || type;
};

const insightCards = [
  { key: "emotional_state", label: "Emotional State", icon: Heart, iconColor: "text-pink-500" },
  { key: "communication_style", label: "Communication Style", icon: MessageCircle, iconColor: "text-blue-500" },
  { key: "work_approach", label: "Work Approach", icon: Briefcase, iconColor: "text-indigo-500" },
  { key: "relationship_patterns", label: "Relationship Patterns", icon: Users, iconColor: "text-green-500" },
  { key: "decision_making", label: "Decision Making", icon: Target, iconColor: "text-red-500" },
  { key: "stress_indicators", label: "Stress Indicators", icon: Activity, iconColor: "text-orange-500" },
  { key: "creativity_level", label: "Creativity Level", icon: Lightbulb, iconColor: "text-yellow-500" },
  { key: "leadership_qualities", label: "Leadership Qualities", icon: Crown, iconColor: "text-purple-500" },
];

export const HandwritingAnalysisResult = ({ analysis }: HandwritingAnalysisResultProps) => {
  const color = getTypeColor(analysis.analysis_type);

  return (
    <>
      <FloatingHowItWorks title={"Handwriting Analysis Result - How it works"} steps={[{ title: 'Open', desc: 'Access the Handwriting Analysis Result section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Handwriting Analysis Result.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header Card */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50 overflow-hidden">
        <div className={`h-1.5 bg-gradient-to-r ${color}`} />
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold mb-1">Analysis Results</h2>
              <p className="text-xs text-muted-foreground">
                {new Date(analysis.created_at).toLocaleDateString()} • {analysis.credits_used} credits
              </p>
            </div>
            <Badge className={`bg-gradient-to-r ${color} text-white border-0`}>
              {getTypeLabel(analysis.analysis_type)}
            </Badge>
          </div>
          {analysis.image_url && (
            <img
              src={analysis.image_url}
              alt="Analyzed handwriting"
              className="w-full max-h-48 object-contain rounded-xl border border-border/30 bg-muted/10"
            />
          )}
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Detailed Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {analysis.detailed_analysis}
          </p>
        </CardContent>
      </Card>

      {/* Strengths & Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.strengths?.map((s: string, i: number) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-2 text-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{s}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              Areas for Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.weaknesses?.map((w: string, i: number) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-2 text-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{w}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Insight Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {insightCards.map((card, i) => {
          const value = analysis[card.key];
          if (!value) return null;
          const Icon = card.icon;
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Card className="bg-card/60 backdrop-blur-sm border-border/50 p-4 h-full">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-4 w-4 ${card.iconColor}`} />
                  <h4 className="font-semibold text-xs">{card.label}</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{value}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Personality Traits */}
      {analysis.personality_traits && (
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Personality Traits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(analysis.personality_traits).map(([trait, description], i) => (
              <motion.div
                key={trait}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <h4 className="font-semibold text-xs capitalize text-foreground mb-0.5">{trait}</h4>
                <p className="text-[11px] text-muted-foreground">{description as string}</p>
                {i < Object.entries(analysis.personality_traits).length - 1 && <Separator className="mt-3" />}
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {analysis.recommendations && (
        <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec: string, i: number) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-2.5 text-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{rec}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Share */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Share2 className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Share Your Results</h3>
          </div>
          <SocialShareButtons
            title={`My Handwriting Analysis - ${getTypeLabel(analysis.analysis_type)}`}
            description={`I just discovered my personality traits through handwriting analysis! My strengths include: ${analysis.strengths?.slice(0, 2).join(", ")}. Try it yourself!`}
            hashtags={["HandwritingAnalysis", "PersonalityTest", "Graphology"]}
          />
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
