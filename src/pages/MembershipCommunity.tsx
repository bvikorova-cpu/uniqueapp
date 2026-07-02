import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Crown } from "lucide-react";
import { MembershipHero } from "@/components/membership/MembershipHero";
import { MembershipEngagementRow } from "@/components/membership/MembershipEngagementRow";
import { MembershipToolCards } from "@/components/membership/MembershipToolCards";
import { MembershipToolView } from "@/components/membership/MembershipToolView";

import { MembershipAbout } from "@/components/membership/MembershipAbout";
import { MembershipFeaturedCreators } from "@/components/membership/MembershipFeaturedCreators";
import { MembershipParityPack } from "@/components/membership/MembershipParityPack";
import { MembershipRevenueSplit } from "@/components/membership/MembershipRevenueSplit";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Creator {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  total_subscribers: number;
  is_verified: boolean;
}

export default function MembershipCommunity() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [myCreatorProfile, setMyCreatorProfile] = useState<Creator | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  useEffect(() => {
    checkMyCreatorProfile();
  }, []);

  const checkMyCreatorProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setMyCreatorProfile(data);
    } catch (error) {
      console.error("Error checking creator profile:", error);
    }
  };

  const handleBecomeCreator = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication Required", description: "Please sign in to become a creator", variant: "destructive" });
        navigate("/auth");
        return;
      }
      const { data: existingProfile } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (existingProfile) {
        toast({ title: "Already a Creator", description: "You already have a creator profile!" });
        return;
      }
      const { data: newProfile, error } = await supabase
        .from("creator_profiles")
        .insert({ user_id: user.id, display_name: user.email?.split("@")[0] || "Creator", bio: "New creator on the platform" })
        .select()
        .single();
      if (error) throw error;
      toast({ title: "Success!", description: "Your creator profile has been created." });
      if (newProfile) navigate(`/creator/${newProfile.user_id}`);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingHowItWorks
        title={'Membership Communities'}
        intro={'Join or run paid/free communities with exclusive posts, chat, and events.'}
        steps={[
          { title: 'Discover communities', desc: 'Browse by topic. Free ones join instantly; paid ones use monthly Stripe subs (85/15 split).' },
        { title: 'Post and interact', desc: 'Members post, comment, react, and join live events inside the community.' },
        { title: 'Creator tools', desc: 'Owners set tiers, moderate, and see revenue in the dashboard.' },
        { title: 'Cancel anytime', desc: 'Manage or cancel subscriptions from your billing page.' }
        ]}
      />
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Hero */}
        <MembershipHero />

        <HeroRewardedAd sectionKey="page_membershipcommunity" />

        {/* Creator CTA */}
        <div className="flex justify-center gap-3 mb-8">
          {myCreatorProfile ? (
            <Button size="lg" onClick={() => navigate(`/creator/${myCreatorProfile.user_id}`)} className="gap-2">
              <Crown className="h-5 w-5" /> My Creator Profile
            </Button>
          ) : (
            <Button size="lg" onClick={handleBecomeCreator} disabled={loading} className="gap-2">
              <Crown className="h-5 w-5" /> Become a Creator
            </Button>
          )}
        </div>

        {/* Engagement Row */}
        <MembershipEngagementRow />

        {/* Parity Pack - 8 AI tools for creators */}
        {!selectedTool && <MembershipParityPack />}


        {/* Tool Cards or Tool View */}
        {selectedTool ? (
          <MembershipToolView toolName={selectedTool} onBack={() => setSelectedTool(null)} />
        ) : (
          <>
            <MembershipToolCards onSelectTool={setSelectedTool} />
            <MembershipFeaturedCreators onViewAll={() => setSelectedTool("Discover Creators")} />
            <MembershipRevenueSplit />
            <MembershipAbout />

            {/* CTA */}
            <div className="text-center py-8">
              <h2 className="text-2xl font-black mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                Ready to Build Your Community?
              </h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-xl mx-auto">
                Join creators who are earning recurring revenue while building meaningful connections
              </p>
              <Button size="lg" onClick={handleBecomeCreator} disabled={loading} className="gap-2">
                <Crown className="h-5 w-5" /> Start Creating Today
              </Button>
              <p className="text-xs text-muted-foreground mt-3">No credit card required • Set up in minutes • Cancel anytime</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
