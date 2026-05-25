import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Gift, Calendar, TrendingUp } from "lucide-react";
import { TrendingSidebar } from "./TrendingSidebar";
import { FriendsHubWidget } from "./FriendsHubWidget";
import { MemoriesWidget } from "./MemoriesWidget";
import { BirthdaysWidget } from "./BirthdaysWidget";
import { ActivityFeedCard } from "./ActivityFeedCard";
import { TrendingHashtags } from "./TrendingHashtags";
import { DailyXPVideoReward } from "@/components/gamification/DailyXPVideoReward";
import { CreatorAnalyticsPanel } from "./CreatorAnalyticsPanel";
import { AudioRooms } from "./AudioRooms";
import { LiveStreamWidget } from "./LiveStreamWidget";
import { StreaksAndChallenges } from "./StreaksAndChallenges";
import { EngagementInsights } from "./EngagementInsights";
import { AIContentSuggestions } from "./AIContentSuggestions";
import { ThemeColorSwitcher } from "./ThemeColorSwitcher";

export function WallRightbar() {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Get online friends
  const { data: onlineFriends = [] } = useQuery({
    queryKey: ["online-friends", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: friendships } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq("status", "accepted");

      const friendIds = friendships?.map((f) =>
        f.user_id === user.id ? f.friend_id : f.user_id
      ) || [];

      if (friendIds.length === 0) return [];

      const { data: profiles } = await (supabase as any)
        .from("profiles_public")
        .select("id, full_name, avatar_url")
        .in("id", friendIds)
        .limit(10);

      return profiles || [];
    },
    enabled: !!user,
  });

  // Get upcoming birthdays
  const { data: birthdays = [] } = useQuery({
    queryKey: ["upcoming-birthdays", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: friendships } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq("status", "accepted");

      const friendIds = friendships?.map((f) =>
        f.user_id === user.id ? f.friend_id : f.user_id
      ) || [];

      if (friendIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", friendIds)
        .not("date_of_birth", "is", null)
        .limit(5);

      return profiles || [];
    },
    enabled: !!user,
  });

  return (
    <div className="w-full md:w-64 xl:w-80 md:h-[calc(100vh-112px)] md:sticky md:top-0 p-2 xl:p-4 pt-6 space-y-4 md:overflow-y-auto touch-auto -webkit-overflow-scrolling-touch">
      {/* Theme Color Switcher */}
      <Card className="p-3">
        <ThemeColorSwitcher />
      </Card>

      {/* Daily XP Video Reward */}
      {user && <DailyXPVideoReward userId={user.id} />}

      {/* On This Day Memories */}
      <MemoriesWidget />

      {/* Upcoming Birthdays */}
      <BirthdaysWidget />

      {/* Friend Requests + People You May Know */}
      <FriendsHubWidget />

      {/* Streaks & Challenges */}
      <StreaksAndChallenges />

      {/* Trending Topics */}
      <TrendingSidebar />

      {/* Live Streams */}
      <LiveStreamWidget />

      {/* Audio Rooms */}
      <AudioRooms />

      {/* Engagement Insights */}
      {user && <EngagementInsights />}

      {/* AI Content Suggestions */}
      {user && <AIContentSuggestions />}

      {/* Creator Analytics */}
      {user && <CreatorAnalyticsPanel />}

      {/* Activity Feed */}
      <ActivityFeedCard />

      {/* Birthdays */}
      {birthdays.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Gift className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm">Birthdays</h3>
          </div>
          <div className="space-y-2">
            {birthdays.slice(0, 3).map((friend) => (
              <Button
                key={friend.id}
                variant="ghost"
                className="w-full justify-start gap-3 h-auto py-2"
                onClick={() => navigate(`/profile/${friend.id}`)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={friend.avatar_url || undefined} />
                  <AvatarFallback>{friend.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{friend.full_name}</p>
                  <p className="text-xs text-muted-foreground">Birthday today</p>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Online Friends */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-green-500 rounded-full" />
          <h3 className="font-semibold text-sm">Active Now</h3>
        </div>
        <div className="space-y-1">
          {onlineFriends.map((friend) => (
            <Button
              key={friend.id}
              variant="ghost"
              className="w-full justify-start gap-3 h-auto py-2.5 hover:bg-accent/30 rounded-xl transition-all group"
              onClick={() => navigate(`/profile/${friend.id}`)}
            >
              <div className="relative">
                <Avatar className="h-9 w-9 ring-2 ring-green-500/20 group-hover:ring-green-500/40 transition-all">
                  <AvatarImage src={friend.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-accent/50 to-accent/30">
                    {friend.full_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-sm" />
              </div>
              <span className="text-sm font-medium">{friend.full_name}</span>
            </Button>
          ))}
        </div>
      </div>

      <TrendingHashtags />
    </div>
  );
}
