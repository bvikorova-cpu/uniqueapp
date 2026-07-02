import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Sparkles, Heart, TrendingUp, Users } from "lucide-react";
import { MilestoneCelebration } from "./MilestoneCelebration";
import { DonorBadge, getTierFromAmount } from "./DonorBadge";
import { LiveDonationFeed } from "./LiveDonationFeed";
import { MatchDonationBadge } from "./MatchDonationBadge";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Donation {
  id: string;
  amount: number;
  donor_name?: string | null;
  is_anonymous?: boolean;
  message?: string | null;
  created_at: string;
}

interface Props {
  currentAmount: number;
  targetAmount: number;
  supportersCount: number;
  campaignType: string;
  campaignId?: string;
  topDonations?: Donation[];
}

/**
 * Premium enhancements bundle for any fundraising detail page.
 * - Milestone celebration with confetti
 * - Top donors with tier badges
 * - Sponsor matching badge (if active)
 */
export function CampaignDetailEnhancements({
  currentAmount,
  targetAmount,
  supportersCount,
  campaignType,
  campaignId,
  topDonations = [],
}: Props) {
  const pct = Math.min((currentAmount / targetAmount) * 100, 100);
  const topThree = [...topDonations].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 3);
  const [match, setMatch] = useState<any>(null);

  useEffect(() => {
    if (!campaignId) return;
    (async () => {
      const { data } = await supabase
        .from("donation_matches")
        .select("*")
        .eq("campaign_id", campaignId)
        .eq("campaign_type", campaignType)
        .eq("active", true)
        .maybeSingle();
      setMatch(data);
    })();
  }, [campaignId, campaignType]);

  return (
    <>
      <FloatingHowItWorks title={"Campaign Detail Enhancements - How it works"} steps={[{ title: 'Open', desc: 'Access the Campaign Detail Enhancements section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Campaign Detail Enhancements.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {match && (
        <MatchDonationBadge
          sponsorName={match.sponsor_name}
          sponsorLogoUrl={match.sponsor_logo_url}
          matchRatio={match.match_ratio}
          matchCap={match.match_cap}
          matchedSoFar={match.matched_so_far}
        />
      )}
      {/* Milestone progress badges + celebration overlay */}
      <Card className="p-4 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold">Milestones</h3>
          <span className="text-xs text-muted-foreground ml-auto">{pct.toFixed(0)}% funded</span>
        </div>
        <MilestoneCelebration pct={pct} />
      </Card>

      {/* Top donors with badges */}
      {topThree.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold">Top Heroes</h3>
            <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
              <Users className="w-3 h-3" /> {supportersCount}
            </span>
          </div>
          <div className="space-y-2">
            {topThree.map((d, i) => {
              const tier = getTierFromAmount(Number(d.amount));
              const name = d.is_anonymous || !d.donor_name ? "Anonymous Hero" : d.donor_name;
              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                >
                  <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                  <Heart className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{name}</p>
                    <DonorBadge tier={tier} size="sm" showLabel={false} totalDonated={Number(d.amount)} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
    </>
  );
}

/**
 * Live feed section, suitable for placing below the main content.
 */
export function CampaignDetailLiveFeed() {
  return <LiveDonationFeed />;
}
