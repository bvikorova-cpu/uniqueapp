import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInYears } from "date-fns";
import { motion } from "framer-motion";

export default function WallMemories() {
  const [userId, setUserId] = useState<string | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  const { data: memories = [], isLoading } = useQuery({
    queryKey: ["post-memories-page", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_post_memories", {
        _user_id: userId!,
        _limit: 50,
      });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 30,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/15 via-primary/10 to-purple-500/5 border border-amber-500/20 p-6 sm:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/15 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-pink-500 shadow-xl shadow-amber-500/30">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-foreground via-amber-500 to-pink-500 bg-clip-text text-transparent">
              Memories
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {memories.length > 0
                ? `${memories.length} moments from your past`
                : "Your past posts will appear here"}
            </p>
          </div>
        </div>
      </motion.div>

      {!userId ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">Sign in to view your memories</CardContent></Card>
      ) : isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : memories.length === 0 ? (
        <Card className="border-dashed border-2 border-amber-500/20">
          <CardContent className="py-16 text-center">
            <Sparkles className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-black mb-2">No memories yet</h3>
            <p className="text-sm text-muted-foreground">Keep posting — we'll resurface them on this day each year.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {memories.map((m: any, i: number) => {
            const yearsAgo = differenceInYears(new Date(), new Date(m.created_at));
            return (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/post/${m.id}`)}
                className="text-left p-4 rounded-xl bg-card/60 backdrop-blur-md border border-border/50 hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold mb-2">
                  <Calendar className="h-3 w-3" />
                  {yearsAgo > 0
                    ? `${yearsAgo} ${yearsAgo === 1 ? "year" : "years"} ago`
                    : format(new Date(m.created_at), "PP")}
                </div>
                {m.content && <p className="text-sm text-foreground line-clamp-4">{m.content}</p>}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
