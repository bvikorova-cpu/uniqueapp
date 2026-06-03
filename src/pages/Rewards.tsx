import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import DailyRewardButton from "@/components/gamification/DailyRewardButton";
import { DailyXPVideoReward } from "@/components/gamification/DailyXPVideoReward";
import { XpToCreditsConverter } from "@/components/gamification/XpToCreditsConverter";
import BadgesDisplay from "@/components/gamification/BadgesDisplay";
import BadgeLeaderboard from "@/components/gamification/BadgeLeaderboard";
import MyBadgesDisplay from "@/components/gamification/MyBadgesDisplay";
import WeeklyChallenges from "@/components/rewards/WeeklyChallenges";
import RewardHistoryTimeline from "@/components/rewards/RewardHistoryTimeline";
import StreakHeatmap from "@/components/rewards/StreakHeatmap";
import AchievementProgressCards from "@/components/rewards/AchievementProgressCards";
import XPMultiplierBanner from "@/components/rewards/XPMultiplierBanner";
import RewardsGuide from "@/components/gamification/RewardsGuide";
import RewardsCinematicHero from "@/components/rewards/RewardsCinematicHero";
import { WeeklyXPLeaderboard } from "@/components/gamification/WeeklyXPLeaderboard";
import { LastWeekWinners } from "@/components/gamification/LastWeekWinners";
import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { useRewardsStats } from "@/hooks/useRewardsStats";
import {
  Crown, Home, Wand2, Trophy, Layers, Disc3, Target, Award, Medal, Flame,
  Gift, Eye, Sword, HelpCircle, ShoppingBag, Shield, Snowflake, CalendarDays,
  Users, Castle, Map, Sparkles as SparklesIcon, PartyPopper, Heart,
} from "lucide-react";

// Lazy-load heavy tab content — keeps initial bundle small on mobile.
const RewardsAIToolsGrid = lazy(() => import("@/components/rewards/RewardsAIToolsGrid"));
const RewardsXPLeaderboard = lazy(() => import("@/components/rewards/RewardsXPLeaderboard"));
const RewardsRewardTiers = lazy(() => import("@/components/rewards/RewardsRewardTiers"));
const RewardsLuckyWheel = lazy(() => import("@/components/rewards/RewardsLuckyWheel"));
const RewardsSeasonalMissions = lazy(() => import("@/components/rewards/RewardsSeasonalMissions"));
const RewardsStreakCoach = lazy(() => import("@/components/rewards/RewardsStreakCoach"));
const RewardsGiftXP = lazy(() => import("@/components/rewards/RewardsGiftXP"));
const RewardsShowcase = lazy(() => import("@/components/rewards/RewardsShowcase"));
const RewardsXPBetting = lazy(() => import("@/components/rewards/RewardsXPBetting"));
const RewardsMysteryBadges = lazy(() => import("@/components/rewards/RewardsMysteryBadges"));
const RewardsMarketplace = lazy(() => import("@/components/rewards/RewardsMarketplace"));
const RewardsLeagues = lazy(() => import("@/components/rewards/RewardsLeagues"));
const RewardsBattlePass = lazy(() => import("@/components/rewards/RewardsBattlePass"));
const RewardsStreakFreeze = lazy(() => import("@/components/rewards/RewardsStreakFreeze"));
const RewardsLoginCalendar = lazy(() => import("@/components/rewards/RewardsLoginCalendar"));
const RewardsFriendQuests = lazy(() => import("@/components/rewards/RewardsFriendQuests"));
const RewardsGuilds = lazy(() => import("@/components/rewards/RewardsGuilds"));
const RewardsQuestPath = lazy(() => import("@/components/rewards/RewardsQuestPath"));
const RewardsCosmetics = lazy(() => import("@/components/rewards/RewardsCosmetics"));
const RewardsYearWrapped = lazy(() => import("@/components/rewards/RewardsYearWrapped"));
const RewardsDonateXP = lazy(() => import("@/components/rewards/RewardsDonateXP"));

const TABS = [
  { id: "overview", icon: Home, label: "Overview" },
  { id: "leagues", icon: Shield, label: "Leagues" },
  { id: "battlepass", icon: Crown, label: "Battle Pass" },
  { id: "calendar", icon: CalendarDays, label: "Calendar" },
  { id: "freeze", icon: Snowflake, label: "Streak Freeze" },
  { id: "friend-quests", icon: Users, label: "Friend Quests" },
  { id: "guilds", icon: Castle, label: "Guilds" },
  { id: "quest-path", icon: Map, label: "Quest Path" },
  { id: "cosmetics", icon: SparklesIcon, label: "Cosmetics" },
  { id: "wrapped", icon: PartyPopper, label: "Wrapped" },
  { id: "donate-xp", icon: Heart, label: "Donate XP" },
  { id: "ai-tools", icon: Wand2, label: "AI Tools" },
  { id: "tiers", icon: Layers, label: "Tiers" },
  { id: "spin", icon: Disc3, label: "Lucky Spin" },
  { id: "leaderboard", icon: Trophy, label: "Ranks" },
  { id: "missions", icon: Target, label: "Missions" },
  { id: "badges", icon: Award, label: "Badges" },
  { id: "hunters", icon: Medal, label: "Hunters" },
  { id: "streak-coach", icon: Flame, label: "Streak Coach" },
  { id: "gift-xp", icon: Gift, label: "Gift XP" },
  { id: "showcase", icon: Eye, label: "Showcase" },
  { id: "betting", icon: Sword, label: "XP Betting" },
  { id: "mystery", icon: HelpCircle, label: "Mystery" },
  { id: "marketplace", icon: ShoppingBag, label: "Marketplace" },
] as const;

const VALID_TABS = new Set(TABS.map((t) => t.id));

function TabFallback() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}

export default function Rewards() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Tab persisted in URL — survives refresh and is shareable.
  const urlTab = searchParams.get("tab") ?? "overview";
  const activeView = VALID_TABS.has(urlTab as (typeof TABS)[number]["id"]) ? urlTab : "overview";

  const setActiveView = (id: string) => {
    const next = new URLSearchParams(searchParams);
    if (id === "overview") next.delete("tab"); else next.set("tab", id);
    setSearchParams(next, { replace: true });
  };

  const { data: stats, isLoading: statsLoading } = useRewardsStats(user?.id);

  // Auth: initial check + live listener for sign-out / token refresh / cross-tab logout.
  useEffect(() => {
    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      if (!data.user) {
        navigate("/auth", { replace: true });
      } else {
        setUser(data.user);
      }
      setAuthLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (!session?.user) {
        setUser(null);
        navigate("/auth", { replace: true });
      } else {
        setUser(session.user);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  // Stripe return: verify rewards purchase once, then notify components to refresh.
  const verifiedRef = useRef(false);
  useEffect(() => {
    const sid = searchParams.get("session_id");
    if (!sid || verifiedRef.current) return;
    verifiedRef.current = true;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-rewards-payment", {
          body: { sessionId: sid },
        });
        if (error) throw error;
        if ((data as any)?.ok) {
          window.dispatchEvent(new CustomEvent("rewards-purchase-completed"));
        }
      } catch (e) {
        console.error("[rewards verify]", e);
      } finally {
        const next = new URLSearchParams(searchParams);
        next.delete("session_id"); next.delete("payment"); next.delete("success");
        setSearchParams(next, { replace: true });
      }
    })();
  }, [searchParams, setSearchParams]);

  // Scroll active tab into view (mobile UX — 24 tabs in horizontal scroller).
  useEffect(() => {
    const el = tabRefs.current[activeView];
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeView]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-6xl space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <XPMultiplierBanner />
        {statsLoading ? (
          <Skeleton className="h-40 w-full rounded-2xl mb-4" />
        ) : (
          <RewardsCinematicHero
            level={stats?.level ?? 1}
            totalXP={stats?.totalXP ?? 0}
            streak={stats?.streak ?? 0}
            badges={stats?.badges ?? 0}
          />
        )}

        <HeroRewardedAd sectionKey="page_rewards" />

        <div
          role="tablist"
          aria-label="Rewards sections"
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mb-6"
        >
          {TABS.map((tab) => {
            const selected = activeView === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => { tabRefs.current[tab.id] = el; }}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`rewards-panel-${tab.id}`}
                id={`rewards-tab-${tab.id}`}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selected
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/20"
                    : "bg-card/60 text-muted-foreground hover:bg-card/80 border border-amber-400/15"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`rewards-panel-${activeView}`}
          aria-labelledby={`rewards-tab-${activeView}`}
        >
          <ErrorBoundary>
            <Suspense fallback={<TabFallback />}>
              {activeView === "overview" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <DailyRewardButton />
                    <DailyXPVideoReward userId={user.id} />
                    <div className="sm:col-span-2 lg:col-span-1">
                      <Button
                        onClick={() => navigate("/premium-store")}
                        className="w-full h-full min-h-[120px] gap-2 text-lg bg-gradient-to-br from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                        size="lg"
                      >
                        <Crown className="h-6 w-6" />
                        Premium Store
                      </Button>
                    </div>
                  </div>

                  <div className="mb-8">
                    <XpToCreditsConverter userId={user.id} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 space-y-6">
                      <AchievementProgressCards userId={user.id} />
                      <WeeklyChallenges />
                    </div>
                    <div className="space-y-6">
                      <WeeklyXPLeaderboard />
                      <LastWeekWinners />
                      <StreakHeatmap userId={user.id} />
                      <RewardHistoryTimeline userId={user.id} />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate("/rewards/audit")}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View full XP audit log
                      </Button>
                    </div>
                  </div>

                  <RewardsGuide />
                  <div className="mt-6">
                    <MyBadgesDisplay userId={user.id} />
                  </div>
                </>
              )}

              {activeView === "ai-tools" && <RewardsAIToolsGrid />}
              {activeView === "tiers" && <RewardsRewardTiers />}
              {activeView === "spin" && <RewardsLuckyWheel />}
              {activeView === "leaderboard" && <RewardsXPLeaderboard />}
              {activeView === "missions" && <RewardsSeasonalMissions />}
              {activeView === "badges" && <BadgesDisplay userId={user.id} />}
              {activeView === "hunters" && <BadgeLeaderboard />}
              {activeView === "streak-coach" && <RewardsStreakCoach />}
              {activeView === "gift-xp" && <RewardsGiftXP />}
              {activeView === "showcase" && <RewardsShowcase />}
              {activeView === "betting" && <RewardsXPBetting />}
              {activeView === "mystery" && <RewardsMysteryBadges />}
              {activeView === "marketplace" && <RewardsMarketplace />}
              {activeView === "leagues" && <RewardsLeagues />}
              {activeView === "battlepass" && <RewardsBattlePass />}
              {activeView === "calendar" && <RewardsLoginCalendar />}
              {activeView === "freeze" && <RewardsStreakFreeze />}
              {activeView === "friend-quests" && <RewardsFriendQuests />}
              {activeView === "guilds" && <RewardsGuilds />}
              {activeView === "quest-path" && <RewardsQuestPath />}
              {activeView === "cosmetics" && <RewardsCosmetics />}
              {activeView === "wrapped" && <RewardsYearWrapped />}
              {activeView === "donate-xp" && <RewardsDonateXP />}
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
