import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, ArrowRight, Sparkles, Zap } from "lucide-react";

import { motion } from "framer-motion";

export default function WallMessages() {
  const navigate = useNavigate();
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
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-8 space-y-6">
      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/15 via-primary/10 to-cyan-500/5 border border-blue-500/20 p-6 sm:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/15 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-xl shadow-blue-500/30" whileHover={{ rotate: -5, scale: 1.05 }}>
              <MessageCircle className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-foreground via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                {"Messages"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">{"Quick access to your conversations"}</p>
            </div>
          </div>
          <Button onClick={() => navigate("/messenger")} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90 gap-2 shadow-xl shadow-blue-500/25 active:scale-[0.97]">
            <Send className="h-4 w-4" /> {"Open Messenger"}
          </Button>
        </div>
      </motion.div>

      {friends.length === 0 ? (
        <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-blue-500/5 via-background to-cyan-500/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
          <CardContent className="py-16 text-center relative">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-5">
              <MessageCircle className="h-10 w-10 text-blue-500" />
            </motion.div>
            <h3 className="text-xl font-black mb-2">{"No conversations yet"}</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">{"Connect with friends to start messaging"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {friends.map((friend, i) => (
            <motion.div 
              key={friend.id} 
              initial={{ opacity: 0, x: -12 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }}
              whileHover={{ x: 4 }}
            >
              <Card
                className="group p-4 border-border/40 bg-card/80 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/30 transition-all duration-300 cursor-pointer"
                onClick={() => navigate("/messenger")}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-blue-500/20 group-hover:border-blue-500/50 transition-colors shadow-lg">
                      <AvatarImage src={friend.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 font-black">{friend.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-card" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm group-hover:text-blue-500 transition-colors">{friend.full_name}</p>
                    <p className="text-xs text-muted-foreground">{"Click to open conversation"}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-all group-hover:translate-x-1 duration-300" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-blue-500/20 bg-gradient-to-r from-blue-500/5 via-background to-cyan-500/5 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-50" />
          <CardContent className="py-6 text-center relative">
            <Sparkles className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {"For full messaging features, open the"}{" "}
              <button onClick={() => navigate("/messenger")} className="text-blue-500 hover:underline font-bold">
                {"Messenger app"}
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
