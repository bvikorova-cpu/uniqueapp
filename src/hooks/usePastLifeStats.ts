import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PastLifeBadgeId =
  | "first_vision"
  | "time_scholar"
  | "royal_past"
  | "soul_seeker"
  | "world_explorer"
  | "twin_flame";

export interface PastLifeBadge {
  id: PastLifeBadgeId;
  icon: string;
  label: string;
  description: string;
}

export const PAST_LIFE_BADGES: PastLifeBadge[] = [
  {
    id: "first_vision",
    icon: "🔮",
    label: "First Vision",
    description: "Generate your first past-life reading",
  },
  {
    id: "time_scholar",
    icon: "📜",
    label: "Time Scholar",
    description: "Collect 5 past-life readings",
  },
  {
    id: "royal_past",
    icon: "👑",
    label: "Royal Past",
    description: "Discover a royal or noble past life",
  },
  {
    id: "soul_seeker",
    icon: "💫",
    label: "Soul Seeker",
    description: "Try all three reading types",
  },
  {
    id: "world_explorer",
    icon: "🌍",
    label: "World Explorer",
    description: "Visit 5 different historical eras",
  },
  {
    id: "twin_flame",
    icon: "💕",
    label: "Twin Flame",
    description: "Run a soul-mate connection reading",
  },
];

interface PastLifeStatsRecord {
  id: string;
  user_id: string;
  streak_current: number;
  streak_last_date: string | null;
  visions_claimed: string[];
  achievements_unlocked: PastLifeBadgeId[];
  created_at: string;
  updated_at: string;
}

interface PastLifeReadingRow {
  id: string;
  reading_type: "basic" | "full" | "soulmate";
  past_lives: any[];
  credits_used: number;
  created_at: string;
}

const isYesterday = (dateString: string) => {
  const d = new Date(dateString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toDateString() === yesterday.toDateString();
};

const isToday = (dateString: string) => {
  return new Date(dateString).toDateString() === new Date().toDateString();
};

const extractEra = (life: any): string | null => {
  if (!life) return null;
  const text = `${life.era || ""} ${life.period || ""} ${life.historical_context || ""} ${life.location || ""}`;
  const match = text.match(/\b(\d{1,4}\s*(BCE|CE|BC|AD|s)?)\b/i);
  return match ? match[0].toLowerCase() : null;
};

const hasRoyalLife = (readings: PastLifeReadingRow[]) => {
  const royalTerms = /(king|queen|emperor|empress|prince|princess|royal|noble|duke|duchess|lord|lady|czar|tsar|sultan|maharaja|raja)/i;
  return readings.some((r) =>
    r.past_lives?.some((life) => {
      const text = `${life.title || ""} ${life.profession || ""} ${life.description || ""} ${life.life_summary || ""} ${life.persona || ""}`;
      return royalTerms.test(text);
    })
  );
};

const coerceReadings = (rows: any[] | null): PastLifeReadingRow[] => {
  return (rows || []).map((r) => ({
    id: r.id,
    reading_type: r.reading_type as PastLifeReadingRow["reading_type"],
    past_lives: Array.isArray(r.past_lives) ? r.past_lives : [],
    credits_used: r.credits_used || 0,
    created_at: r.created_at,
  }));
};

const emptyStats = (userId: string): PastLifeStatsRecord => ({
  id: "",
  user_id: userId,
  streak_current: 0,
  streak_last_date: null,
  visions_claimed: [],
  achievements_unlocked: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const usePastLifeStats = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["past-life-stats"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: stats, error: statsError } = await supabase
        .from("past_life_user_stats")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (statsError && statsError.code !== "PGRST116") throw statsError;

      const statsRecord: PastLifeStatsRecord = (stats as PastLifeStatsRecord | null) || emptyStats(user.id);
      // Re-cast achievements in case the DB stores them generically as strings.
      statsRecord.achievements_unlocked = (statsRecord.achievements_unlocked || []).filter(
        (b): b is PastLifeBadgeId => PAST_LIFE_BADGES.some((badge) => badge.id === b)
      );

      const { data: readings, error: readingsError } = await supabase
        .from("past_life_readings")
        .select("id, reading_type, past_lives, credits_used, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (readingsError) throw readingsError;

      const readingsTyped = coerceReadings(readings);
      const allLives = readingsTyped.flatMap((r) => r.past_lives?.filter(Boolean) || []);
      const livesCount = allLives.length || readingsTyped.length;
      const eras = new Set(allLives.map(extractEra).filter(Boolean));
      const creditsUsed = readingsTyped.reduce((sum, r) => sum + (r.credits_used || 0), 0);
      const readingTypes = new Set(readingsTyped.map((r) => r.reading_type));

      const unlocked: PastLifeBadgeId[] = [
        ...(readingsTyped.length ? (["first_vision"] as PastLifeBadgeId[]) : []),
        ...((readingsTyped.length || 0) >= 5 ? (["time_scholar"] as PastLifeBadgeId[]) : []),
        ...(hasRoyalLife(readingsTyped) ? (["royal_past"] as PastLifeBadgeId[]) : []),
        ...(readingTypes.size >= 3 ? (["soul_seeker"] as PastLifeBadgeId[]) : []),
        ...(eras.size >= 5 ? (["world_explorer"] as PastLifeBadgeId[]) : []),
        ...(readingTypes.has("soulmate") ? (["twin_flame"] as PastLifeBadgeId[]) : []),
      ];

      const today = new Date().toDateString();
      const claimedToday =
        statsRecord.visions_claimed.includes(today) ||
        localStorage.getItem(`pl-vision-${today}`) === "1";

      return {
        userId: user.id,
        stats: statsRecord,
        readings: readingsTyped,
        livesCount,
        erasCount: eras.size,
        creditsUsed,
        unlockedBadges: unlocked,
        claimedToday,
      };
    },
  });

  const ensureStatsRow = async (userId: string): Promise<PastLifeStatsRecord> => {
    const { data: existing } = await supabase
      .from("past_life_user_stats")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!existing) {
      const { data: inserted, error } = await supabase
        .from("past_life_user_stats")
        .insert({
          user_id: userId,
          streak_current: 0,
          streak_last_date: null,
          visions_claimed: [],
          achievements_unlocked: [],
        })
        .select()
        .single();
      if (error) throw error;
      return (inserted as PastLifeStatsRecord) || emptyStats(userId);
    }
    return (data?.stats as PastLifeStatsRecord) || emptyStats(userId);
  };

  const recordActivity = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const stats = await ensureStatsRow(user.id);
      const today = new Date().toISOString();
      const lastDate = stats.streak_last_date;

      let newStreak = 1;
      if (lastDate && isToday(lastDate)) {
        newStreak = stats.streak_current;
      } else if (lastDate && isYesterday(lastDate)) {
        newStreak = stats.streak_current + 1;
      }

      const { error } = await supabase
        .from("past_life_user_stats")
        .update({
          streak_current: newStreak,
          streak_last_date: today,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      return { streak: newStreak };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["past-life-stats"] });
    },
  });

  const claimVision = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const stats = await ensureStatsRow(user.id);
      const today = new Date().toISOString();
      const todayKey = new Date().toDateString();
      const lastDate = stats.streak_last_date;

      let newStreak = 1;
      if (lastDate && isToday(lastDate)) {
        newStreak = stats.streak_current;
      } else if (lastDate && isYesterday(lastDate)) {
        newStreak = stats.streak_current + 1;
      }

      const claimed = new Set(stats.visions_claimed || []);
      claimed.add(todayKey);

      const { error } = await supabase
        .from("past_life_user_stats")
        .update({
          streak_current: newStreak,
          streak_last_date: today,
          visions_claimed: Array.from(claimed),
        })
        .eq("user_id", user.id);

      if (error) throw error;
      localStorage.setItem(`pl-vision-${todayKey}`, "1");
      return { streak: newStreak };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["past-life-stats"] });
      toast.success("Daily vision claimed! Your streak keeps growing.");
    },
    onError: () => {
      toast.error("Could not claim vision. Please try again.");
    },
  });

  return {
    isLoading,
    error,
    streak: data?.stats?.streak_current || 0,
    livesCount: data?.livesCount || 0,
    erasCount: data?.erasCount || 0,
    creditsUsed: data?.creditsUsed || 0,
    unlockedBadges: data?.unlockedBadges || [],
    claimedToday: data?.claimedToday || false,
    recordActivity: recordActivity.mutateAsync,
    claimVision: claimVision.mutateAsync,
  };
};
