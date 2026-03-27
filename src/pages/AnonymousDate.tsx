import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAnonymousDate } from "@/hooks/useAnonymousDate";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Search, UserPlus, Heart, MessageCircle, CreditCard, Eye, Gift, Mic, Users, Shield, Clock, Loader2 } from "lucide-react";
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
import { AdultWarningModal } from "@/components/anonymous-date/AdultWarningModal";
import { AccessPaymentGate } from "@/components/anonymous-date/AccessPaymentGate";

type ViewType = "hub" | "matches" | "find" | "credits" | "profile";

const DATING_TOOLS = [
  {
    id: "find",
    title: "Find New Match",
    description: "Get matched with someone who shares your interests",
    icon: Search,
    credits: 5,
    gradient: "bg-gradient-to-r from-pink-500 to-rose-500",
    features: ["Interest-based matching", "Anonymous profiles", "7-day chat period", "Personality focus"],
  },
  {
    id: "matches",
    title: "Active Matches",
    description: "Continue conversations with your current matches",
    icon: MessageCircle,
    credits: "1-3" as any,
    gradient: "bg-gradient-to-r from-primary to-accent",
    features: ["Text messages (1 credit)", "Voice messages (3 credits)", "Real-time chat", "Countdown timer"],
  },
  {
    id: "credits",
    title: "Credit Store",
    description: "Purchase credits to unlock all dating features",
    icon: CreditCard,
    credits: "€5+" as any,
    gradient: "bg-gradient-to-r from-amber-500 to-orange-500",
    features: ["Multiple packages", "Instant delivery", "Secure payment", "Best value deals"],
  },
  {
    id: "profile",
    title: "Edit Profile",
    description: "Update your anonymous identity and preferences",
    icon: UserPlus,
    credits: "Free" as any,
    gradient: "bg-gradient-to-r from-emerald-500 to-teal-500",
    features: ["Update interests", "Change personality traits", "Edit preferences", "Manage visibility"],
  },
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

  const {
    credits,
    loading,
    activeMatches,
    fetchCredits,
    fetchActiveMatches,
    purchaseCredits,
    findMatch,
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
      console.error("Error opening portal:", error);
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
      console.error("Error paying access:", error);
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
      findMatch();
      return;
    }
    setActiveView(toolId as ViewType);
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 sm:py-10 max-w-2xl">
          <ProfileSetup onComplete={() => { setHasProfile(true); checkProfile(); }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-10 space-y-6">
        <AnimatePresence mode="wait">
          {activeView === "hub" ? (
            <motion.div
              key="hub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <AnonymousDateHero />

              {/* Subscription Badge */}
              {subscriptionEnd && (
                <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <p className="font-semibold text-sm">Active Subscription</p>
                        <p className="text-xs text-muted-foreground">
                          Renews {new Date(subscriptionEnd).toLocaleDateString()} • 
                          <span className="font-medium text-pink-500 ml-1">{credits} credits remaining</span>
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleManageSubscription} className="text-xs">
                      Manage
                    </Button>
                  </div>
                </Card>
              )}

              {/* Engagement Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AnonymousDateStreak />
                <AnonymousDateProgress />
                <AnonymousDateAchievements />
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    Dating Tools
                  </h2>

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
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
                    {[
                      { step: "1", title: "Create Profile", desc: "Set up your anonymous identity", icon: "🎭" },
                      { step: "2", title: "Find Match", desc: "Get paired by interests", icon: "🔍" },
                      { step: "3", title: "Chat 7 Days", desc: "Build real connection", icon: "💬" },
                      { step: "4", title: "Reveal", desc: "Discover each other", icon: "👀" },
                    ].map((s) => (
                      <div key={s.step} className="flex flex-col items-center text-center p-4 rounded-xl bg-card/60 backdrop-blur border border-border/30">
                        <span className="text-2xl mb-2">{s.icon}</span>
                        <h4 className="font-semibold text-xs">{s.title}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Credit Costs Quick Reference */}
                  <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
                    <h3 className="font-bold text-sm mb-3">Credit Costs</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { icon: Search, label: "New Match", cost: "5", color: "text-pink-500" },
                        { icon: MessageCircle, label: "Text Msg", cost: "1", color: "text-primary" },
                        { icon: Mic, label: "Voice Msg", cost: "3", color: "text-accent" },
                        { icon: Eye, label: "Early Reveal", cost: "15", color: "text-chart-3" },
                      ].map((item) => (
                        <div key={item.label} className="text-center p-3 rounded-lg bg-muted/20 border border-border/30">
                          <item.icon className={`h-4 w-4 mx-auto ${item.color} mb-1`} />
                          <p className="text-xs font-medium">{item.label}</p>
                          <Badge variant="secondary" className="text-[10px] mt-1">{item.cost} cr</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  <AnonymousDateComparison />
                  <AnonymousDateTestimonials />
                </div>
              </div>
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

              {activeView === "matches" && (
                <ActiveMatches matches={activeMatches} onOpenChat={() => {}} />
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
