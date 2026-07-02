import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Star, Crown, Award, ExternalLink, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface TalentCampaign {
  id: string;
  title: string;
  description: string;
  talent_type: string;
  target_amount: number;
  current_amount: number;
  portfolio_url: string;
  achievements: string[];
  goals: string[];
  images: string[];
  sponsors_count: number;
  premium_subscriber: boolean;
  created_at: string;
}

const talentTypeLabels: Record<string, string> = {
  music: "🎵 Music", sports: "⚽ Sports", art: "🎨 Art", dance: "💃 Dance", other: "⭐ Other",
};

const quickAmounts = [5, 10, 25];

export function TalentCampaignCard({ campaign }: { campaign: TalentCampaign }) {
  const navigate = useNavigate();
  const [showQuickSponsor, setShowQuickSponsor] = useState(false);
  const progress = Math.min((campaign.current_amount / campaign.target_amount) * 100, 100);

  return (
    <>
      <FloatingHowItWorks title={"Talent Campaign Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Talent Campaign Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Talent Campaign Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.3 }}>
      <Card className={`overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300 ${campaign.premium_subscriber ? "border-accent/50 hover:shadow-accent/10" : "border-border/50 hover:shadow-primary/5"}`}>
        {campaign.images?.length > 0 && (
          <div className="relative h-44 overflow-hidden">
            <img src={campaign.images[0]} alt={campaign.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            {campaign.premium_subscriber && (
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Badge className="absolute top-3 left-3 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground">
                  <Crown className="h-3 w-3 mr-1" /> Premium
                </Badge>
              </motion.div>
            )}
            <Badge variant="secondary" className="absolute top-3 right-3">{talentTypeLabels[campaign.talent_type] || "⭐ Other"}</Badge>
          </div>
        )}

        <CardHeader className="pb-2">
          <CardTitle className="text-lg line-clamp-2">{campaign.title}</CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
        </CardHeader>

        <CardContent className="flex-1 space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-bold text-foreground">€{campaign.current_amount.toFixed(0)}</span>
              <span className="text-muted-foreground">of €{campaign.target_amount.toFixed(0)}</span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-2.5" />
              <motion.div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/50"
                style={{ left: `${Math.min(progress, 97)}%` }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">{progress.toFixed(0)}% funded</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3 w-3" />{campaign.sponsors_count} sponsors</div>
            </div>
          </div>

          {/* Achievement badges */}
          {campaign.achievements?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t pt-2">
              {campaign.achievements.slice(0, 3).map((a, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  <Award className="h-3 w-3 mr-1" /> {a}
                </Badge>
              ))}
            </div>
          )}

          {/* Goals milestone */}
          {campaign.goals?.length > 0 && (
            <div className="border-t pt-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
                <Target className="h-3 w-3" /> Goals
              </div>
              <div className="flex items-center gap-1">
                {campaign.goals.slice(0, 3).map((g, i) => (
                  <div key={i} className="flex items-center gap-1">
                    {i > 0 && <span className="text-muted-foreground text-xs">→</span>}
                    <span className="text-xs bg-accent/10 text-accent-foreground px-2 py-0.5 rounded-full truncate max-w-[90px]">{g}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {campaign.portfolio_url && (
            <a href={campaign.portfolio_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline">
              <ExternalLink className="h-3 w-3" /> View Portfolio
            </a>
          )}

          {showQuickSponsor && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex gap-2">
              {quickAmounts.map((amt) => (
                <Button key={amt} size="sm" variant="outline" className="flex-1 text-xs" onClick={() => navigate(`/fundraising/talent/${campaign.id}`)}>€{amt}</Button>
              ))}
            </motion.div>
          )}
        </CardContent>

        <CardFooter className="gap-2 pt-0">
          <Button className="flex-1" onClick={() => navigate(`/fundraising/talent/${campaign.id}`)}>
            <Star className="mr-1.5 h-4 w-4" /> Sponsor
          </Button>
          <Button variant="outline" size="icon" onClick={() => setShowQuickSponsor(!showQuickSponsor)}>
            <Star className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
    </>
  );
}
