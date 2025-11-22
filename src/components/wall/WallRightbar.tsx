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
    <div className="w-80 h-screen sticky top-0 p-4 space-y-4 overflow-y-auto pb-20">
      {/* Sponsored */}
      <div>
        <h3 className="font-semibold text-sm text-muted-foreground mb-3">Sponsored</h3>
        <Card className="p-3 hover:bg-accent/50 cursor-pointer transition-colors">
          <div className="flex gap-3">
            <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Grow Your Business</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start reaching more customers today
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
        <h3 className="font-semibold text-sm mb-3">Contacts</h3>
        <div className="space-y-1">
          {onlineFriends.map((friend) => (
            <Button
              key={friend.id}
              variant="ghost"
              className="w-full justify-start gap-3 h-auto py-2 hover:bg-accent/50"
              onClick={() => navigate(`/profile/${friend.id}`)}
            >
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={friend.avatar_url || undefined} />
                  <AvatarFallback>{friend.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
              </div>
              <span className="text-sm font-medium">{friend.full_name}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
