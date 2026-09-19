import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Flame, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TopFan {
  fan_id: string;
  rank: number;
  total_cents: number;
  tip_count: number;
  streak_months: number;
  display_name: string;
  avatar_url: string | null;
}

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function TopFansLeaderboard({ creatorUserId }: { creatorUserId: string }) {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["creator-top-fans", creatorUserId],
    enabled: !!creatorUserId,
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("get_creator_top_fans", {
        _creator_user_id: creatorUserId,
        _limit: 10 });
      if (error) throw error;
      return data as { fans: TopFan[]; me: TopFan | null };
    } });

  const fans: TopFan[] = data?.fans ?? [];
  const me: TopFan | null = data?.me ?? null;

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-card p-5">
        <div className="h-5 w-40 bg-muted rounded animate-pulse mb-4" />
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 bg-muted/60 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (fans.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
          <Trophy className="h-5 w-5 text-amber-500" />
          Top Fans
        </h3>
        <p className="text-sm text-muted-foreground">
          No tips yet. Fans who tip, gift or Super Chat appear on this leaderboard — with a streak bonus for supporting every month.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-5">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
        <Trophy className="h-5 w-5 text-amber-500" />
        Top Fans
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Ranked by all tips, gifts and Super Chats. Monthly streaks earn a 🔥 badge.
      </p>
      <ol className="space-y-2">
        {fans.map((fan) => {
          const isMe = user?.id === fan.fan_id;
          return (
            <li
              key={fan.fan_id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                isMe ? "border-primary bg-primary/5" : "bg-muted/30" }`}
            >
              <span className="w-7 text-center text-base font-bold">
                {MEDALS[fan.rank] ?? fan.rank}
              </span>
              <Avatar className="h-9 w-9">
                <AvatarImage src={fan.avatar_url || undefined} />
                <AvatarFallback>{(fan.display_name || "F")[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {fan.display_name}
                  {isMe && <span className="ml-1.5 text-xs text-primary font-bold">(you)</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {fan.tip_count} tip{fan.tip_count === 1 ? "" : "s"}
                  {fan.streak_months > 1 && (
                    <span className="inline-flex items-center gap-1 ml-2">
                      <Flame className="h-3 w-3 text-orange-500" />
                      {fan.streak_months} mo
                    </span>
                  )}
                </p>
              </div>
              <span className="text-sm font-bold tabular-nums">
                €{(fan.total_cents / 100).toFixed(2)}
              </span>
            </li>
          );
        })}
      </ol>
      {me && !fans.some((f) => f.fan_id === me.fan_id) && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/5 px-3 py-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-sm flex-1">
            You are <strong>#{me.rank}</strong> with €{(me.total_cents / 100).toFixed(2)} in tips.
          </p>
        </div>
      )}
    </div>
  );
}
