import { useState } from "react";
import { motion } from "framer-motion";
import { History, Star, Trash2, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onSelectPrompt: (prompt: string) => void; }

export const PromptHistoryView = ({ onSelectPrompt }: Props) => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ["prompt-history", filter],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase.from("ai_prompt_history").select("*").eq("user_id", user.id).order("last_used_at", { ascending: false }).limit(100);
      if (filter === "favorites") query = query.eq("is_favorite", true);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const toggleFavorite = async (id: string, current: boolean) => {
    await supabase.from("ai_prompt_history").update({ is_favorite: !current }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["prompt-history"] });
  };

  const deletePrompt = async (id: string) => {
    await supabase.from("ai_prompt_history").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["prompt-history"] });
    toast.success("Prompt deleted");
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success("Copied to clipboard");
  };

  return (
    <>
      <FloatingHowItWorks title={"Prompt History View - How it works"} steps={[{ title: 'Open', desc: 'Access the Prompt History View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Prompt History View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-2">📜 Prompt History</h2>
        <p className="text-muted-foreground text-sm">Your saved prompts and favorites</p>
      </div>

      <div className="flex gap-2">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
        <Button variant={filter === "favorites" ? "default" : "outline"} size="sm" onClick={() => setFilter("favorites")} className="gap-1"><Star className="w-3 h-3" /> Favorites</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-card/60">
          <History className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">{filter === "favorites" ? "No favorite prompts yet" : "No prompt history yet"}</p>
          <p className="text-xs text-muted-foreground mt-1">Generate images to build your history</p>
        </div>
      ) : (
        <div className="space-y-2">
          {prompts.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="p-3 rounded-xl border bg-card/80 hover:border-primary/30 transition-colors group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectPrompt(p.prompt)}>
                  <p className="text-sm font-medium truncate">{p.title || p.prompt.substring(0, 50)}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{p.prompt}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-muted-foreground">Used {p.use_count}x</span>
                    <span className="text-[10px] text-muted-foreground">{p.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyPrompt(p.prompt)}><Copy className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleFavorite(p.id, p.is_favorite || false)}>
                    <Star className={`w-3 h-3 ${p.is_favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deletePrompt(p.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};
