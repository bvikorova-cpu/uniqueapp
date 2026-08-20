import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInYears } from "date-fns";

type Memory = {
  id: string;
  content: string | null;
  created_at: string;
  media_urls: string[] | null;
  media_types: string[] | null;
  memory_kind: string;
};

export function MemoriesWidget() {
  const [userId, setUserId] = useState<string | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  const { data: memories = [] } = useQuery({
    queryKey: ["post-memories", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_post_memories_v2" as any, { _limit: 5 });
      if (error) throw error;
      return (data ?? []) as Memory[];
    },
    staleTime: 1000 * 60 * 5,
  });

  if (!userId || memories.length === 0) return null;

  return (
    <Card className="bg-card/80 backdrop-blur-md border-amber-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Memories
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        <ScrollArea className="max-h-[280px]">
          <div className="space-y-2">
            {memories.map((m) => {
              const yearsAgo = differenceInYears(new Date(), new Date(m.created_at));
              const thumb = (m.media_urls ?? [])[0];
              const isVideo = ((m.media_types ?? [])[0] ?? "").startsWith("video");
              return (
                <button
                  key={m.id}
                  onClick={() => navigate(`/post/${m.id}`)}
                  className="w-full text-left p-2 rounded-lg bg-muted/40 hover:bg-muted transition-colors flex gap-2"
                >
                  {thumb && !isVideo && (
                    <img src={thumb} alt="Memory" loading="lazy" className="h-12 w-12 rounded-md object-cover shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold mb-1">
                      <Calendar className="h-3 w-3" />
                      {m.memory_kind === "on_this_day"
                        ? "On this day"
                        : yearsAgo > 0
                        ? `${yearsAgo} ${yearsAgo === 1 ? "year" : "years"} ago`
                        : format(new Date(m.created_at), "PP")}
                    </div>
                    {m.content && <p className="text-xs text-foreground line-clamp-2">{m.content}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
        <Button variant="ghost" size="sm" className="w-full justify-between h-8" onClick={() => navigate("/wall/memories")}>
          See all memories <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
