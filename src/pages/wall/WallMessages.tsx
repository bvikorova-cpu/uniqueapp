import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function WallMessages() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Get recent conversations (friends)
  const { data: friends = [] } = useQuery({
    queryKey: ["friends-for-messages", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: friendships } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq("status", "accepted")
        .limit(10);

      const friendIds = friendships?.map((f) =>
        f.user_id === user.id ? f.friend_id : f.user_id
      ) || [];

      if (friendIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", friendIds);

      return profiles || [];
    },
    enabled: !!user,
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">{t('wall.messages.title')}</h2>
          </div>
          <Button onClick={() => navigate("/messenger")}>
            <Send className="h-4 w-4 mr-2" />
            {t('wall.messages.openMessenger')}
          </Button>
        </div>

        <p className="text-muted-foreground mb-6">
          {t('wall.messages.quickAccess')}
        </p>

        {friends.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('wall.messages.noConversations')}</p>
            <p className="text-sm mt-2">{t('wall.messages.connectFriends')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <Card
                key={friend.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate("/messenger")}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={friend.avatar_url || undefined} />
                    <AvatarFallback>{friend.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{friend.full_name}</p>
                    <p className="text-sm text-muted-foreground">{t('wall.messages.clickToOpen')}</p>
                  </div>
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {t('wall.messages.fullFeatures')}{" "}
            <button
              onClick={() => navigate("/messenger")}
              className="text-primary hover:underline font-medium"
            >
              {t('wall.messages.messengerApp')}
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
