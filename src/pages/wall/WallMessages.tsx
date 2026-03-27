import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export default function WallMessages() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => { const { data: { user } } = await supabase.auth.getUser(); return user; },
  });

  const { data: friends = [] } = useQuery({
    queryKey: ["friends-for-messages", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: friendships } = await supabase.from("friendships").select("user_id, friend_id").or(`user_id.eq.${user.id},friend_id.eq.${user.id}`).eq("status", "accepted").limit(10);
      const friendIds = friendships?.map((f) => f.user_id === user.id ? f.friend_id : f.user_id) || [];
      if (friendIds.length === 0) return [];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", friendIds);
      return profiles || [];
    },
    enabled: !!user,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-8 space-y-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">{t('wall.messages.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('wall.messages.quickAccess')}</p>
          </div>
        </div>
        <Button onClick={() => navigate("/messenger")} className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 gap-2 shadow-lg">
          <Send className="h-4 w-4" /> {t('wall.messages.openMessenger')}
        </Button>
      </motion.div>

      {friends.length === 0 ? (
        <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">{t('wall.messages.noConversations')}</h3>
            <p className="text-sm text-muted-foreground">{t('wall.messages.connectFriends')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {friends.map((friend, i) => (
            <motion.div key={friend.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <Card
                className="group p-4 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                onClick={() => navigate("/messenger")}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                    <AvatarImage src={friend.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 font-bold">{friend.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">{friend.full_name}</p>
                    <p className="text-xs text-muted-foreground">{t('wall.messages.clickToOpen')}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1 duration-300" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* CTA */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-accent/5">
        <CardContent className="py-6 text-center">
          <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {t('wall.messages.fullFeatures')}{" "}
            <button onClick={() => navigate("/messenger")} className="text-primary hover:underline font-semibold">
              {t('wall.messages.messengerApp')}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
