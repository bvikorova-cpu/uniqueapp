import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, Sparkles, Calendar, Coins, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const AIWeeklyRecap = () => {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: recaps, isLoading } = useQuery({
    queryKey: ["brain-duel-ai-recaps"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from("brain_duel_ai_recaps")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      return data || [];
    },
  });

  const generateRecap = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("brain-duel-ai-recap");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success("AI Weekly Recap generated! 🧠");
      queryClient.invalidateQueries({ queryKey: ["brain-duel-ai-recaps"] });
      queryClient.invalidateQueries({ queryKey: ["brain-duel-credits"] });
    },
    onError: (err: Error) => {
      if (err.message.includes("Insufficient")) {
        toast.error("Not enough credits. AI recap costs 5 credits.");
      } else if (err.message.includes("rate limit")) {
        toast.error("Too many requests. Try again in a moment.");
      } else {
        toast.error(err.message);
      }
    },
  });

  const renderMarkdown = (text: string) => {
    // Escape HTML first so AI prompt-injection can't ship raw tags, then apply markdown.
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const html = escaped
      .replace(/## (.*)/g, '<h3 class="text-sm font-bold text-primary mt-3 mb-1">$1</h3>')
      .replace(/### (.*)/g, '<h4 class="text-xs font-semibold text-foreground mt-2 mb-1">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
      .replace(/- (.*)/g, '<li class="text-xs text-muted-foreground ml-3">• $1</li>')
      .replace(/\n/g, "<br/>");
    return sanitizeHtml(html);
  };

  return (
    <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-violet-500/10">
                <Brain className="h-5 w-5 text-violet-400" />
              </div>
              AI Weekly Recap
            </CardTitle>
            <CardDescription className="mt-1">
              AI-powered performance analysis • Costs 5 credits
            </CardDescription>
          </div>
          <Button
            onClick={() => generateRecap.mutate()}
            disabled={generateRecap.isPending}
            size="sm"
            className="gap-1.5 shadow-lg shadow-primary/20 bg-gradient-to-r from-violet-600 to-primary"
          >
            {generateRecap.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {generateRecap.isPending ? "Analyzing..." : "Generate"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-3">
        {generateRecap.isPending && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-primary/10 border border-violet-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Brain className="h-8 w-8 text-violet-400" />
                <motion.div
                  className="absolute inset-0 bg-violet-500/30 rounded-full blur-md"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
              <div>
                <p className="text-sm font-semibold">AI is analyzing your performance...</p>
                <p className="text-xs text-muted-foreground">Reviewing matches, accuracy, and patterns</p>
              </div>
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !recaps || recaps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No recaps yet. Generate your first AI-powered weekly analysis!</p>
            <p className="text-xs mt-1">Play matches to get more detailed insights.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recaps.map((recap: any, i: number) => {
              const isExpanded = expandedId === recap.id;
              const stats = recap.stats_snapshot || {};
              return (
                <motion.div
                  key={recap.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-primary/10 overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : recap.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold">
                          Week of {new Date(recap.week_start).toLocaleDateString()} – {new Date(recap.week_end).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {stats.matches_played !== undefined && (
                            <Badge variant="outline" className="text-[9px] h-4">{stats.matches_played} matches</Badge>
                          )}
                          {stats.accuracy !== undefined && (
                            <Badge variant="outline" className="text-[9px] h-4">{stats.accuracy}% accuracy</Badge>
                          )}
                          <Badge variant="outline" className="text-[9px] h-4 border-yellow-500/30 text-yellow-500">
                            <Coins className="h-2.5 w-2.5 mr-0.5" />
                            {recap.credits_used}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 border-t border-border/20 pt-3">
                          <div
                            className="prose prose-sm prose-invert max-w-none text-xs leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(recap.recap_text) }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
