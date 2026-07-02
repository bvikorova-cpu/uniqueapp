import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import * as LucideIcons from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_SKILLTREE_STEPS = [
  { title: 'Pick a starting skill', desc: 'Unlocked skills glow — locked skills need prerequisites.' },
  { title: 'Complete challenges', desc: 'Each skill has quizzes and mini-projects to master it.' },
  { title: 'Level up nodes', desc: 'Completed skills unlock the next tier.' },
  { title: 'See your path', desc: "The whole tree shows how far you've come." }
];
const __HIW_SKILLTREE = { title: 'Skill Tree', intro: 'A visual roadmap of skills to unlock, level by level.', steps: __HIW_SKILLTREE_STEPS };


export default function SkillTree() {
  const { subject = "general" } = useParams<{ subject: string }>();
  const { data: nodes = [], isLoading } = useQuery({
    queryKey: ["skill-tree", subject],
    queryFn: async () => {
      const { data } = await supabase
        .from("education_skill_tree_nodes")
        .select("*")
        .eq("subject", subject)
        .order("order_index");
      return data ?? [];
    },
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["skill-progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("education_user_skill_progress").select("*").eq("user_id", user.id);
      return data ?? [];
    },
  });

  const statusOf = (nodeId: string) => progress.find((p: any) => p.node_id === nodeId)?.status ?? "locked";

  if (isLoading) return <div className="container mx-auto pt-20 px-4">Loading...</div>;

  return (
    <>
      <Helmet><title>Skill Tree · Education</title></Helmet>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-3xl">
        <h1 className="text-3xl font-black mb-6 capitalize">{subject} Skill Tree</h1>

        {nodes.length === 0 ? (
          <Card className="backdrop-blur-xl bg-card/80">
            <CardContent className="p-10 text-center text-muted-foreground">
              <p>No skill tree configured for "{subject}" yet.</p>
              <p className="text-xs mt-2">Try: <Link to="/education/skill-tree/math" className="text-primary">math</Link>, <Link to="/education/skill-tree/science" className="text-primary">science</Link>, <Link to="/education/skill-tree/languages" className="text-primary">languages</Link></p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {nodes.map((n: any, i: number) => {
              const Icon = (LucideIcons as any)[n.icon] ?? LucideIcons.BookOpen;
              const status = statusOf(n.id);
              const locked = status === "locked";
              return (
                <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
      <FloatingHowItWorks title={__HIW_SKILLTREE.title} intro={__HIW_SKILLTREE.intro} steps={__HIW_SKILLTREE.steps} />
                  <Card className={`backdrop-blur-xl ${locked ? "bg-card/40 opacity-60" : "bg-card/80 border-primary/30"}`}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Icon className={`w-8 h-8 ${locked ? "text-muted-foreground" : "text-primary"}`} />
                      <div className="flex-1">
                        <h3 className="font-bold">{n.title}</h3>
                        {n.description && <p className="text-xs text-muted-foreground">{n.description}</p>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {locked ? `${n.required_xp} XP` : status}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
