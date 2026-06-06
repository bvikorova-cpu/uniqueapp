import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAnonymousDate } from "@/hooks/useAnonymousDate";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Search, UserPlus, Heart, MessageCircle, CreditCard, Eye, Mic, Loader2, Gift, Sparkles, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { AnonymousDateHero } from "@/components/anonymous-date/AnonymousDateHero";
import { AnonymousDateStreak } from "@/components/anonymous-date/AnonymousDateStreak";
import { AnonymousDateProgress } from "@/components/anonymous-date/AnonymousDateProgress";
import { AnonymousDateAchievements } from "@/components/anonymous-date/AnonymousDateAchievements";
import { AnonymousDateToolCard } from "@/components/anonymous-date/AnonymousDateToolCard";
import { AnonymousDateTestimonials } from "@/components/anonymous-date/AnonymousDateTestimonials";
import { AnonymousDateComparison } from "@/components/anonymous-date/AnonymousDateComparison";
import { CreditPackages } from "@/components/anonymous-date/CreditPackages";
import { ProfileSetup } from "@/components/anonymous-date/ProfileSetup";
import { ActiveMatches } from "@/components/anonymous-date/ActiveMatches";
import { AnonymousChat } from "@/components/anonymous-date/AnonymousChat";
import { AdultWarningModal } from "@/components/anonymous-date/AdultWarningModal";
import { AccessPaymentGate } from "@/components/anonymous-date/AccessPaymentGate";
import { AnonymousDatePersonalityCompass } from "@/components/anonymous-date/AnonymousDatePersonalityCompass";
import { AnonymousDateConversationStarter } from "@/components/anonymous-date/AnonymousDateConversationStarter";
import { AnonymousDateIdeasShowcase } from "@/components/anonymous-date/AnonymousDateIdeasShowcase";
import { AnonymousDateAIToolbox } from "@/components/anonymous-date/AnonymousDateAIToolbox";
import { AnonymousDateParityPack } from "@/components/anonymous-date/AnonymousDateParityPack";
import { CompatibilityMatchFinder } from "@/components/anonymous-date/CompatibilityMatchFinder";
import { MatchResults, type MatchCandidate } from "@/components/anonymous-date/MatchResults";
import { FloatingParticles } from "@/components/wellness/FloatingParticles";
import { MatchCelebrationModal } from "@/components/dating/MatchCelebrationModal";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
type ViewType = "hub" | "matches" | "find" | "find-results" | "credits" | "profile";

type MatchFilters = {
  location?: string;
  preferred_gender?: string;
  relationship_goal?: string;
  languages?: string[];
  min_shared_interests?: number;
};

const DATING_TOOLS = [
  {
    id: "find",
    title: "Find New Match",
    description: "Get matched with someone who shares your interests and personality",
    icon: Search,
    credits: 5,
    gradient: "bg-gradient-to-r from-pink-500 to-rose-500",
    features: ["Interest-based matching", "Anonymous profiles", "7-day chat period", "Personality focus"],
  },
  {
    id: "matches",
    title: "Active Matches",
    description: "Continue conversations with your current anonymous matches",
    icon: MessageCircle,
    credits: "1-3" as any,
    gradient: "bg-gradient-to-r from-primary to-accent",
    features: ["Text messages (1 credit)", "Voice messages (3 credits)", "Real-time chat", "Countdown timer"],
  },
  {
    id: "credits",
    title: "Credit Store",
    description: "Purchase credits to unlock premium dating features",
    icon: CreditCard,
    credits: "€5+" as any,
    gradient: "bg-gradient-to-r from-amber-500 to-orange-500",
    features: ["4 tier packages", "Instant delivery", "Secure Stripe payment", "Volume discounts"],
  },
  {
    id: "profile",
    title: "Edit Profile",
    description: "Update your anonymous identity and matching preferences",
    icon: UserPlus,
    credits: "Free" as any,
    gradient: "bg-gradient-to-r from-emerald-500 to-teal-500",
    features: ["Update interests", "Change personality traits", "Edit preferences", "Manage visibility"],
  },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Create Profile", desc: "Set up your anonymous identity with interests and traits", icon: "🎭" },
  { step: "2", title: "Find Match", desc: "Our AI pairs you based on shared interests and compatibility", icon: "🔍" },
  { step: "3", title: "Chat 7 Days", desc: "Get to know each other through personality, not photos", icon: "💬" },
  { step: "4", title: "Reveal", desc: "Discover each other after building a real connection", icon: "👀" },
];

export default function AnonymousDate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasProfile, setHasProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showAdultWarning, setShowAdultWarning] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [payingAccess, setPayingAccess] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>("hub");
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [matchingUserId, setMatchingUserId] = useState<string | null>(null);
  const [lastFilters, setLastFilters] = useState<MatchFilters>({});
  const [matchCelebration, setMatchCelebration] = useState<{ matchId: string; partnerName: string; location?: string | null } | null>(null);
  const [myAnonName, setMyAnonName] = useState<string>("You");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  const {
    credits,
    loading,
    activeMatches,
    fetchCredits,
    fetchActiveMatches,
    purchaseCredits,
    findMatch,
    previewMatches,
  } = useAnonymousDate();

  useEffect(() => {
    const adultWarningAccepted = sessionStorage.getItem("adult_warning_accepted");
    if (!adultWarningAccepted) {
      setShowAdultWarning(true);
    } else {
      checkAccess();
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({ title: "Payment Successful!", description: "Your credits have been added" });
      fetchCredits();
      setSearchParams({});
    } else if (searchParams.get("canceled") === "true") {
      toast({ title: "Payment Canceled", description: "You can try again anytime", variant: "destructive" });
      setSearchParams({});
    } else if (searchParams.get("subscription") === "success") {
      toast({ title: "Subscription Active!", description: "Welcome to Anonymous Date" });
      checkAccess();
      setSearchParams({});
    } else if (searchParams.get("subscription") === "cancelled") {
      toast({ title: "Subscription Canceled", description: "Payment was canceled", variant: "destructive" });
      setSearchParams({});
    }
  }, [searchParams]);

  useEffect(() => {
    if (hasAccess) checkProfile();
  }, [hasAccess]);

  const checkAccess = async () => {
    try {
      setCheckingAccess(true);
      const { data, error } = await supabase.functions.invoke("check-anonymous-date-access");
      if (error) throw error;
      setHasAccess(data.hasAccess);
      setSubscriptionEnd(data.subscriptionEnd);
    } catch (error) {
      console.error("Error checking access:", error);
      toast({ title: "Error", description: "Failed to verify subscription", variant: "destructive" });
    } finally {
      setCheckingAccess(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal-anonymous-date");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to open portal", variant: "destructive" });
    }
  };

  const handlePayAccess = async () => {
    try {
      setPayingAccess(true);
      const { data, error } = await supabase.functions.invoke("pay-anonymous-date-access");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to process payment", variant: "destructive" });
    } finally {
      setPayingAccess(false);
    }
  };

  const handleAcceptAdultWarning = () => {
    sessionStorage.setItem("adult_warning_accepted", "true");
    setShowAdultWarning(false);
    checkAccess();
  };

  const handleDeclineAdultWarning = () => {
    sessionStorage.removeItem("adult_warning_accepted");
    setShowAdultWarning(false);
    navigate("/");
  };

  const checkProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingProfile(false); return; }
      const { data } = await supabase
        .from("anonymous_dating_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setHasProfile(!!data);
    } catch (error) {
      console.error("Error checking profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleToolSelect = (toolId: string) => {
    if (toolId === "find") {
      setActiveView("find");
      return;
    }
    setActiveView(toolId as ViewType);
  };

  const loadCandidates = async (filters: MatchFilters) => {
    setPreviewLoading(true);
    try {
      const list = await previewMatches(filters);
      setCandidates(list);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleFindMatch = async (filters: MatchFilters) => {
    setLastFilters(filters);
    setActiveView("find-results");
    await loadCandidates(filters);
  };

  const handleSelectCandidate = async (userId: string) => {
    if (credits < 5) {
      toast({
        title: "Not enough credits",
        description: "Locking in a match costs 5 credits. Visit the Credit Store to top up.",
        variant: "destructive",
      });
      setActiveView("credits");
      return;
    }
    setMatchingUserId(userId);
    try {
      const result = await findMatch(lastFilters, userId);
      if (result?.match) {
        setSelectedMatchId(result.match.id);
        setActiveView("matches");
      } else {
        // Candidate became unavailable — refresh the list
        await loadCandidates(lastFilters);
      }
    } finally {
      setMatchingUserId(null);
    }
  };

  if (showAdultWarning) {
    return <AdultWarningModal open={showAdultWarning} onAccept={handleAcceptAdultWarning} onDecline={handleDeclineAdultWarning} />;
  }

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasAccess) {
    return <AccessPaymentGate onPayAccess={handlePayAccess} loading={payingAccess} />;
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <FloatingParticles />
        <div className="container mx-auto px-4 py-6 sm:py-10 relative z-10">
          <ProfileSetup onComplete={() => { setHasProfile(true); checkProfile(); }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      <div className="container mx-auto px-4 py-6 sm:py-10 space-y-6 relative z-10">
        <AnimatePresence mode="wait">
          {activeView === "hub" ? (
            <motion.div
              key="hub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <AnonymousDateHero />

              <HeroRewardedAd sectionKey="page_anonymousdate" />

              {/* Subscription Status */}
              {subscriptionEnd && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="p-4 bg-card/60 backdrop-blur-sm border border-border/50">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <div>
                          <p className="font-bold text-sm">Active Subscription</p>
                          <p className="text-xs text-muted-foreground">
                            Renews {new Date(subscriptionEnd).toLocaleDateString()} •
                            <span className="font-bold text-primary ml-1">{credits} credits remaining</span>
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleManageSubscription} className="text-xs">
                        Manage Subscription
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Engagement Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <AnonymousDateStreak />
                <AnonymousDateProgress />
                <AnonymousDateAchievements />
              </motion.div>

              {/* AI Toolbox - 7 premium AI features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48 }}
              >
                <AnonymousDateAIToolbox credits={credits} />
              </motion.div>

              {/* Daily starter + Personality Compass */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <AnonymousDateConversationStarter />
                <AnonymousDatePersonalityCompass />
              </motion.div>

              {/* Main Content: Tools + Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Tools & Info */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      Dating Tools
                    </h2>
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {credits} Credits
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {DATING_TOOLS.map((tool, i) => (
                      <AnonymousDateToolCard
                        key={tool.id}
                        tool={tool}
                        onSelect={() => handleToolSelect(tool.id)}
                        index={i}
                      />
                    ))}
                  </div>

                  {/* How It Works */}
                  <Card className="p-5 sm:p-6 bg-card/60 backdrop-blur-sm border border-border/50">
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      How Anonymous Date Works
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {HOW_IT_WORKS.map((s, i) => (
                        <motion.div
                          key={s.step}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + i * 0.08 }}
                          className="relative text-center p-4 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/30 transition-all"
                        >
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                              STEP {s.step}
                            </span>
                          </div>
                          <span className="text-3xl block mb-2 mt-1">{s.icon}</span>
                          <h4 className="font-bold text-sm">{s.title}</h4>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
                        </motion.div>
                      ))}
                    </div>
                  </Card>

                  {/* Credit Costs Quick Reference */}
                  <Card className="p-5 sm:p-6 bg-card/60 backdrop-blur-sm border border-border/50">
                    <h3 className="text-lg font-black mb-4">Credit Costs Reference</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {[
                        { icon: Search, label: "New Match", cost: "5", emoji: "🔍" },
                        { icon: MessageCircle, label: "Text Msg", cost: "1", emoji: "💬" },
                        { icon: Mic, label: "Voice Msg", cost: "3", emoji: "🎤" },
                        { icon: Eye, label: "Hint", cost: "5", emoji: "💡" },
                        { icon: Gift, label: "Gift", cost: "10", emoji: "🎁" },
                        { icon: Eye, label: "Early Reveal", cost: "15", emoji: "👀" },
                      ].map((item) => (
                        <div key={item.label} className="text-center p-3 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/20 transition-all">
                          <span className="text-xl block mb-1">{item.emoji}</span>
                          <p className="text-xs font-semibold">{item.label}</p>
                          <Badge variant="secondary" className="text-[10px] mt-1.5">{item.cost} cr</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Safety Section */}
                  <Card className="p-5 sm:p-6 bg-card/60 backdrop-blur-sm border border-border/50">
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Why Choose Anonymous Date?
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { icon: "🎭", title: "100% Anonymous", desc: "Your identity is completely protected until the reveal moment. No photos, no real names." },
                        { icon: "💕", title: "Real Connections", desc: "Focus on personality and compatibility. Build genuine relationships through conversations." },
                        { icon: "🛡️", title: "Safe Environment", desc: "Verified subscription users only. Monthly fee ensures committed, serious community members." },
                      ].map((item) => (
                        <div key={item.title} className="p-4 rounded-xl bg-muted/20 border border-border/30 text-center">
                          <span className="text-3xl block mb-2">{item.icon}</span>
                          <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-4">
                  <AnonymousDateComparison />
                  <AnonymousDateTestimonials />

                  {/* Quick Actions */}
                  <Card className="p-4 bg-card/60 backdrop-blur-sm border border-border/50">
                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Quick Actions
                    </h3>
                    <div className="space-y-2">
                      <Button
                        onClick={() => setActiveView("find")}
                        disabled={loading}
                        className="w-full justify-start gap-2"
                        size="sm"
                      >
                        <Search className="h-4 w-4" />
                        Find New Match (5 cr)
                      </Button>
                      <Button
                        onClick={() => setActiveView("matches")}
                        variant="outline"
                        className="w-full justify-start gap-2"
                        size="sm"
                      >
                        <MessageCircle className="h-4 w-4" />
                        View Matches ({activeMatches.length})
                      </Button>
                      <Button
                        onClick={() => setActiveView("credits")}
                        variant="outline"
                        className="w-full justify-start gap-2"
                        size="sm"
                      >
                        <CreditCard className="h-4 w-4" />
                        Buy Credits
                      </Button>
                      <Button
                        onClick={() => setActiveView("profile")}
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        size="sm"
                      >
                        <UserPlus className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Parity Pack — 8 new AI tools */}
              <AnonymousDateParityPack />

              {/* Tips & Future Features */}
              <AnonymousDateIdeasShowcase />
            </motion.div>
          ) : (
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveView("hub")}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Hub
              </Button>

              {activeView === "matches" && !selectedMatchId && (
                <ActiveMatches matches={activeMatches} onOpenChat={(id) => setSelectedMatchId(id)} />
              )}
              {activeView === "matches" && selectedMatchId && currentUserId && (() => {
                const m = activeMatches.find((x: any) => x.id === selectedMatchId);
                if (!m) { setSelectedMatchId(null); return null; }
                const partner = m.partner_profile;
                const me = { anonymous_name: "You" };
                return (
                  <div className="space-y-3">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedMatchId(null)} className="gap-2">
                      <ArrowLeft className="h-4 w-4" /> Back to Matches
                    </Button>
                    <AnonymousChat
                      match={m}
                      currentUserId={currentUserId}
                      myName={me?.anonymous_name ?? "You"}
                      partnerName={partner?.anonymous_name ?? "Match"}
                      credits={credits}
                    />
                  </div>
                );
              })()}
              {activeView === "find" && (
                <CompatibilityMatchFinder
                  credits={credits}
                  loading={previewLoading || loading}
                  onFindMatch={handleFindMatch}
                />
              )}
              {activeView === "find-results" && (
                <MatchResults
                  candidates={candidates}
                  loading={previewLoading}
                  matching={!!matchingUserId}
                  matchingUserId={matchingUserId}
                  credits={credits}
                  cost={5}
                  onBack={() => setActiveView("find")}
                  onRefresh={() => loadCandidates(lastFilters)}
                  onSelect={handleSelectCandidate}
                />
              )}
              {activeView === "credits" && (
                <CreditPackages onPurchase={purchaseCredits} currentCredits={credits} />
              )}
              {activeView === "profile" && (
                <ProfileSetup onComplete={() => { setHasProfile(true); setActiveView("hub"); }} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
