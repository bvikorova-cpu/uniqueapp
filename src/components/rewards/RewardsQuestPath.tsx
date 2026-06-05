import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Map, Lock, Check, Star, Skull } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";


export default function RewardsQuestPath() {
  const { user } = useAuth();
  const [path, setPath] = useState<any>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [claimingIdx, setClaimingIdx] = useState<number | null>(null);

  const load = async () => {
    const { data: p } = await supabase
      .from("quest_paths")
      .select("*")
      .eq("is_active", true)
      .order("starts_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!p) return;
    setPath(p);
    const { data: n } = await supabase.from("quest_nodes").select("*").eq("path_id", p.id).order("node_index");
    setNodes(n || []);
    if (user) {
      const { data: pr } = await supabase
        .from("user_quest_path_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("path_id", p.id)
        .maybeSingle();
      setProgress(pr);
    }
  };

  useEffect(() => { load(); }, [user?.id]);

  const claim = async (nodeIndex: number) => {
    if (!user || !path) return;
    const { data, error } = await supabase.rpc("claim_quest_node" as any, {
      _path_id: path.id,
      _node_index: nodeIndex,
    });
    if (error) return toast.error(error.message);
    const res = data as any;
    if (!res?.ok) return toast.error(res?.error || "Failed to claim");
    toast.success(res.xp_awarded > 0 ? `+${res.xp_awarded} XP claimed!` : "Node claimed!");
    load();
  };

  const completed = (progress?.completed_nodes || []) as number[];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            {path?.name || "Quest Path"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!path ? <p className="text-sm text-muted-foreground">{"No active quest path. Ask admin to seed one."}</p> :
           nodes.length === 0 ? <p className="text-sm text-muted-foreground">{"No nodes yet."}</p> :
           <div className="relative space-y-2">
             {nodes.map((n, idx) => {
               const isDone = completed.includes(n.node_index);
               const prevDone = idx === 0 || completed.includes(nodes[idx - 1].node_index);
               const locked = !prevDone && !isDone;
               return (
                 <motion.div
                   key={n.id}
                   initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.04 }}
                   className={`flex items-center gap-3 p-3 rounded-lg border ${
                     isDone ? "bg-emerald-500/10 border-emerald-500/40" :
                     locked ? "bg-muted/30 border-border/30 opacity-60" :
                     "bg-card border-primary/30"
                   } ${idx % 2 === 1 ? "ml-8" : "mr-8"}`}
                 >
                   <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${
                     n.is_boss ? "bg-gradient-to-br from-red-500 to-purple-600 text-white" : "bg-primary/20"
                   }`}>
                     {n.is_boss ? <Skull className="h-5 w-5" /> : isDone ? <Check className="h-5 w-5" /> : locked ? <Lock className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="font-semibold text-sm">{n.title} {n.is_boss && <Badge variant="destructive" className="ml-1 text-[10px]">{"BOSS"}</Badge>}</p>
                     <p className="text-xs text-muted-foreground">{n.reward_label || `${n.reward_value} ${n.reward_type}`}</p>
                   </div>
                   {!isDone && !locked && <Button size="sm" onClick={() => claim(n.node_index)}>{"Claim"}</Button>}
                   {isDone && <Badge variant="outline" className="text-xs">{"Done"}</Badge>}
                 </motion.div>
               );
             })}
           </div>}
        </CardContent>
      </Card>
    </div>
  );
}
