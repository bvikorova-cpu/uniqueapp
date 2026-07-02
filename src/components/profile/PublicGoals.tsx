import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Target, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface PublicGoalsProps {
  userId: string;
  isOwnProfile: boolean;
}

interface Goal {
  id: string;
  title: string;
  target_value: number;
  current_value: number;
  color: string | null;
  deadline: string | null;
}

export const PublicGoals = ({ userId, isOwnProfile }: PublicGoalsProps) => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("100");
  const [current, setCurrent] = useState("0");

  const { data: goals } = useQuery({
    queryKey: ["profile-goals", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profile_goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      return (
    <>
      <FloatingHowItWorks title={"Public Goals - How it works"} steps={[{ title: 'Open', desc: 'Access the Public Goals section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Public Goals.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      data || []
    </>
  ) as Goal[];
    },
    enabled: !!userId,
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profile_goals").insert({
        user_id: userId,
        title,
        target_value: Number(target),
        current_value: Number(current),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Goal added" });
      setTitle(""); setTarget("100"); setCurrent("0"); setOpen(false);
      qc.invalidateQueries({ queryKey: ["profile-goals", userId] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("profile_goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile-goals", userId] }),
  });

  if (!goals || (goals.length === 0 && !isOwnProfile)) return null;

  return (
    <div className="glass-post-card p-5 sm:p-7 mb-6 border border-amber-400/15 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg sm:text-xl font-black bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            Public Goals
          </h2>
        </div>
        {isOwnProfile && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="border-amber-400/40">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card/95 backdrop-blur-xl border-amber-400/30">
              <DialogHeader><DialogTitle>New goal</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Goal title (e.g. Reach 1000 followers)" value={title} onChange={(e) => setTitle(e.target.value)} />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Current" value={current} onChange={(e) => setCurrent(e.target.value)} />
                  <Input type="number" placeholder="Target" value={target} onChange={(e) => setTarget(e.target.value)} />
                </div>
                <Button onClick={() => create.mutate()} disabled={!title || create.isPending} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold">
                  Create goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {goals.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No public goals yet</p>
      ) : (
        <div className="space-y-3">
          {goals.map((g, i) => {
            const pct = Math.min(100, Math.round((g.current_value / Math.max(1, g.target_value)) * 100));
            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-background/40 border border-amber-400/15 rounded-xl p-3"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-foreground">{g.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-amber-300">{g.current_value}/{g.target_value}</span>
                    {isOwnProfile && (
                      <button onClick={() => remove.mutate(g.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.1 + i * 0.05 }}
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                  />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">{pct}% complete</div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
