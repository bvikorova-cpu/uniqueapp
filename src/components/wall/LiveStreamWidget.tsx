import { motion } from "framer-motion";
import { Radio, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLivePosts } from "@/hooks/useLivePosts";

export function LiveStreamWidget() {
  const { livePosts, isLoading } = useLivePosts();

  if (isLoading) return null;

  if (!livePosts || livePosts.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="relative">
            <Radio className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-sm">Live Now</h3>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">0</Badge>
        </div>
        <div className="glass-card rounded-xl p-6 text-center">
          <Radio className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No one is live right now</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Live streams from your network will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="relative">
          <Radio className="h-5 w-5 text-destructive" />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full animate-pulse" />
        </div>
        <h3 className="font-bold text-sm">Live Now</h3>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          {livePosts.length}
        </Badge>
      </div>

      <div className="space-y-2">
        {livePosts.map((livePost: any) => (
          <motion.div
            key={livePost.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="glass-card rounded-xl p-3 cursor-pointer hover:bg-accent/20 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-20 h-14 rounded-lg bg-gradient-to-br from-destructive/30 to-primary/30 flex items-center justify-center relative overflow-hidden shrink-0">
                <Radio className="h-5 w-5 text-destructive/60" />
                <div className="absolute top-1 left-1">
                  <Badge className="bg-destructive text-[8px] px-1 py-0 h-3.5 font-bold animate-pulse">
                    LIVE
                  </Badge>
                </div>
                <div className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-black/60 rounded px-1">
                  <Users className="h-2.5 w-2.5 text-white" />
                  <span className="text-[9px] text-white font-medium">{livePost.viewers_count || 0}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">
                  {livePost.posts?.content || "Live Stream"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {livePost.viewers_count || 0} watching
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
