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
import { toast } from "sonner";
import { Crown, Home, Wand2, Trophy, Layers, Disc3, Target, Award, Medal, Flame,
  Gift, Eye, Shield, Snowflake, CalendarDays,
  Sparkles as SparklesIcon, Heart } from "lucide-react";
import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const REWARDS_HOW_IT_WORKS = [
  { title: "Earn XP every day", desc: "You gain XP for logging in, using AI tools, playing games, completing challenges and helping friends. XP levels you up." },
  { title: "Daily Login Calendar", desc: "Tap today's tile and press Claim to grab the free XP. 7 / 14 / 21 / 30-day milestones give bigger bonuses." },
  { title: "Streak Freeze", desc: "Missed a day? Buy or claim a Streak Freeze to protect your streak. Otherwise the counter resets." },
  { title: "Weekly Challenges", desc: "Complete rotating quests (invite a friend, use 3 AI tools…) for burst XP and badges." },
  { title: "Battle Pass & Leagues", desc: "Season pass with free + premium tracks. Weekly leagues rank you against other players — promote to a higher league by finishing top." },
  { title: "Convert XP → Credits", desc: "Use the XP → Credits converter to turn earned XP into platform credits usable across AI tools and premium features." },
  { title: "Lucky Wheel & Gifts", desc: "Spend XP on the Lucky Wheel spin or gift XP to friends." },
];

// Lazy-load heavy tab content — keeps initial bundle small on mobile.
const RewardsAIToolsGrid = lazy(() => import("@/components/rewards/RewardsAIToolsGrid"));
const RewardsXPLeaderboard = lazy(() => import("@/components/rewards/RewardsXPLeaderboard"));
const RewardsRewardTiers = lazy(() => import("@/components/rewards/RewardsRewardTiers"));
const RewardsLuckyWheel = lazy(() => import("@/components/rewards/RewardsLuckyWheel"));
const RewardsSeasonalMissions = lazy(() => import("@/components/rewards/RewardsSeasonalMissions"));
const RewardsStreakCoach = lazy(() => import("@/components/rewards/RewardsStreakCoach"));
const RewardsGiftXP = lazy(() => import("@/components/rewards/RewardsGiftXP"));
const RewardsLeagues = lazy(() => import("@/components/rewards/RewardsLeagues"));
const RewardsBattlePass = lazy(() => import("@/components/rewards/RewardsBattlePass"));
const RewardsStreakFreeze = lazy(() => import("@/components/rewards/RewardsStreakFreeze"));
const RewardsLoginCalendar = lazy(() => import("@/components/rewards/RewardsLoginCalendar"));
const RewardsCosmetics = lazy(() => import("@/components/rewards/RewardsCosmetics"));

const TABS = [
  { id: "overview", icon: Home, label: "Overview" },
  { id: "leagues", icon: Shield, label: "Leagues" },
  { id: "battlepass", icon: Crown, label: "Battle Pass" },
  { id: "calendar", icon: CalendarDays, label: "Calendar" },
  { id: "freeze", icon: Snowflake, label: "Streak Freeze" },
  { id: "cosmetics", icon: SparklesIcon, label: "Cosmetics" },
  { id: "ai-tools", icon: Wand2, label: "AI Tools" },
  { id: "tiers", icon: Layers, label: "Tiers" },
  { id: "spin", icon: Disc3, label: "Lucky Spin" },
  { id: "leaderboard", icon: Trophy, label: "Ranks" },
  { id: "missions", icon: Target, label: "Missions" },
  { id: "badges", icon: Award, label: "Badges" },
  { id: "hunters", icon: Medal, label: "Hunters" },
  { id: "streak-coach", icon: Flame, label: "Streak Coach" },
  { id: "gift-xp", icon: Gift, label: "Gift XP" },
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

    // Use getSession() (synchronous, cached) instead of getUser() (network call)
    // to avoid hung loading state on slow / failed network requests.
    supabase.auth.getSession()
      .then(({ data }) => {
        if (cancelled) return;
        if (!data.session?.user) {
          navigate("/auth", { replace: true });
        } else {
          setUser(data.session.user);
        }
      })
      .catch((e) => {
        console.error("[rewards auth]", e);
        if (!cancelled) navigate("/auth", { replace: true });
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false);
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
    const verify = async (sessionId: string) => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-rewards-payment", {
          body: { sessionId } });
        if (error) throw error;
        if ((data as any)?.ok) {
          toast.success("Purchase confirmed!");
          window.dispatchEvent(new CustomEvent("rewards-purchase-completed"));
        }
        const next = new URLSearchParams(searchParams);
        next.delete("session_id"); next.delete("payment"); next.delete("success");
        setSearchParams(next, { replace: true });
      } catch (e) {
        console.error("[rewards verify]", e);
        toast.error("Could not verify payment", {
          description: "We couldn't confirm your purchase. Tap retry or contact support if you were charged.",
          action: { label: "Retry", onClick: () => verify(sessionId) },
          duration: 15000 });
      }
    };
    verifiedRef.current = true;
    verify(sid);
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
        <div className="flex justify-end mb-2">
          <HowItWorksButton title="Rewards" intro="Everything you can earn, spend and win in the Rewards hub." steps={REWARDS_HOW_IT_WORKS} variant="compact" />
        </div>
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

        <div className="relative mb-6">
          <div
            role="tablist"
            aria-label="Rewards sections"
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
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
          {/* Right-edge fade hint for horizontal overflow on mobile */}
          <div className="md:hidden pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-background to-transparent" />
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <DailyRewardButton />
                    <DailyXPVideoReward userId={user.id} />
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
              {activeView === "leagues" && <RewardsLeagues />}
              {activeView === "battlepass" && <RewardsBattlePass />}
              {activeView === "calendar" && <RewardsLoginCalendar />}
              {activeView === "freeze" && <RewardsStreakFreeze />}
              {activeView === "cosmetics" && <RewardsCosmetics />}
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
