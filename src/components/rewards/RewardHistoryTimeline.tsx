import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Trophy, Gift, Zap, Medal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { HowItWorksButton } from "@/components/common/HowItWorksButton";

interface TimelineEvent {
  id: string;
  type: "xp" | "badge" | "level" | "reward";
  title: string;
  description: string;
  xp?: number;
  timestamp: string;
  icon: typeof Star;
  color: string;
}

const typeConfig = {
  daily_login: { icon: Gift, color: "text-green-500", bg: "bg-green-500/10", label: "Daily Reward" },
  daily_video_xp: { icon: Zap, color: "text-purple-500", bg: "bg-purple-500/10", label: "Video Bonus" },
  post_created: { icon: Star, color: "text-primary", bg: "bg-primary/10", label: "Post Created" },
  comment_added: { icon: Star, color: "text-blue-500", bg: "bg-blue-500/10", label: "Comment" },
  like_received: { icon: Star, color: "text-pink-500", bg: "bg-pink-500/10", label: "Like Received" },
  badge_earned: { icon: Medal, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Badge Earned" },
  level_up: { icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10", label: "Level Up" },
};

export default function RewardHistoryTimeline({ userId }: { userId: string }) {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["reward-history", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!userId,
  });

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 justify-between">
          <span className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Reward History</span>
          <HowItWorksButton title="Reward History" intro="A timeline of every XP gain, badge unlock and prize you've received." steps={[
            { title: "Chronological order", desc: "Newest events at the top. Each entry shows what happened and when." },
            { title: "Event types", desc: "Icons indicate the type: XP, badge, level up or reward drop." },
            { title: "Verify your history", desc: "Use this if you think an XP or badge is missing — every credit is logged here." },
            { title: "Scroll for more", desc: "Older entries load as you scroll. Data is stored for the last 12 months." },
          ]} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No activity yet</p>
            <p className="text-xs mt-1">Start earning XP to see your history!</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-1">
              {events.map((event: any, i: number) => {
                const config = typeConfig[event.activity_type as keyof typeof typeConfig] || {
                  icon: Star,
                  color: "text-muted-foreground",
                  bg: "bg-muted/10",
                  label: event.activity_type,
                };
                const Icon = config.icon;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="relative flex items-start gap-3 pl-2 py-2"
                  >
                    <div className={`relative z-10 p-1.5 rounded-full ${config.bg} border border-border/50 shrink-0`}>
                      <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{config.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {event.points_earned > 0 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                          +{event.points_earned} XP
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
