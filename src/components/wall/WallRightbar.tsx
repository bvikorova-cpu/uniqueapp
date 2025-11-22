import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Gift, Calendar, TrendingUp } from "lucide-react";

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

      const { data: profiles } = await supabase
        .from("profiles")
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
    <div className="w-80 h-screen sticky top-16 p-4 pt-6 space-y-4 overflow-y-auto pb-20">
      {/* Suggested */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-primary rounded-full" />
          <h3 className="font-semibold text-sm">Trending Topics</h3>
        </div>
        <Card className="p-4 hover:bg-accent/30 cursor-pointer transition-all rounded-xl bg-gradient-to-br from-card/80 to-card/50 border-border/50">
          <div className="flex gap-3">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-sm">
              <TrendingUp className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm mb-1">What's Popular</p>
              <p className="text-xs text-muted-foreground">
                Discover trending content
              </p>
            </div>
          </div>
        </Card>
      </div>

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
    </div>
  );
}
