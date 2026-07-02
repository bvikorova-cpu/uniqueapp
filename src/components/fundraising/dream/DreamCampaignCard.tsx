import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Sparkles, Heart, TrendingUp, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface DreamCampaign {
  id: string;
  title: string;
  description: string;
  dream_type: string;
  target_amount: number;
  current_amount: number;
  image_url: string;
  supporters_count: number;
  created_at: string;
}

const dreamTypeLabels: Record<string, string> = {
  education: "🎓 Education",
  travel: "✈️ Travel",
  startup: "🚀 Startup",
  creative: "🎨 Creative",
  other: "✨ Other",
};

const quickAmounts = [5, 10, 25];

export const DreamCampaignCard = ({ campaign }: { campaign: DreamCampaign }) => {
  const navigate = useNavigate();
  const [showQuickDonate, setShowQuickDonate] = useState(false);
  const progress = Math.min((campaign.current_amount / campaign.target_amount) * 100, 100);

  const getUrgencyBadge = () => {
    if (progress >= 80) return { label: "⚡ Almost There", variant: "default" as const };
    if (campaign.supporters_count > 10) return { label: "🔥 Trending", variant: "secondary" as const };
    const daysSince = Math.floor((Date.now() - new Date(campaign.created_at).getTime()) / 86400000);
    if (daysSince <= 3) return { label: "🆕 New", variant: "outline" as const };
    return null;
  };

  const urgency = getUrgencyBadge();

  return (
    <>
      <FloatingHowItWorks title={"Dream Campaign Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Dream Campaign Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Dream Campaign Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden h-full flex flex-col border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
        {/* Image */}
        {campaign.image_url && (
          <div className="relative h-44 overflow-hidden">
            <img
              src={campaign.image_url}
              alt={campaign.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            {urgency && (
              <Badge variant={urgency.variant} className="absolute top-3 left-3">
                {urgency.label}
              </Badge>
            )}
            <Badge variant="secondary" className="absolute top-3 right-3">
              {dreamTypeLabels[campaign.dream_type] || "✨ Dream"}
            </Badge>
          </div>
        )}

        <CardHeader className="pb-2">
          <CardTitle className="text-lg line-clamp-2">{campaign.title}</CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
        </CardHeader>

        <CardContent className="flex-1 space-y-3">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-bold text-foreground">€{campaign.current_amount.toFixed(0)}</span>
              <span className="text-muted-foreground">of €{campaign.target_amount.toFixed(0)}</span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-2.5" />
              <motion.div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50"
                style={{ left: `${Math.min(progress, 97)}%` }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">{progress.toFixed(0)}% funded</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {campaign.supporters_count}
              </div>
            </div>
          </div>

          {/* Quick Donate */}
          {showQuickDonate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex gap-2"
            >
              {quickAmounts.map((amt) => (
                <Button
                  key={amt}
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => navigate(`/fundraising/dream/${campaign.id}`)}
                >
                  €{amt}
                </Button>
              ))}
            </motion.div>
          )}
        </CardContent>

        <CardFooter className="gap-2 pt-0">
          <Button
            className="flex-1"
            onClick={() => navigate(`/fundraising/dream/${campaign.id}`)}
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            Support
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowQuickDonate(!showQuickDonate)}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
    </>
  );
};
