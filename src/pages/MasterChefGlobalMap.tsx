import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Users, Trophy, ChefHat, Utensils } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type Stats = {
  chefs: number;
  competitions: number;
  entries: number;
  recipes: number;
};

const cuisines = [
  { name: "European", flag: "🇪🇺", color: "from-blue-500 to-indigo-500", tags: ["french", "italian", "spanish"] },
  { name: "North American", flag: "🇺🇸", color: "from-red-500 to-orange-500", tags: ["american", "mexican"] },
  { name: "Asian", flag: "🌏", color: "from-yellow-500 to-amber-500", tags: ["japanese", "chinese", "thai", "korean"] },
  { name: "South American", flag: "🌎", color: "from-green-500 to-emerald-500", tags: ["brazilian", "peruvian"] },
  { name: "African", flag: "🌍", color: "from-purple-500 to-violet-500", tags: ["moroccan", "ethiopian"] },
  { name: "Oceanian", flag: "🇦🇺", color: "from-cyan-500 to-teal-500", tags: ["australian", "polynesian"] },
];

export default function MasterChefGlobalMap() {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["masterchef-global-stats"],
    queryFn: async () => {
      const [comps, entries, recipes, chefsRes] = await Promise.all([
        supabase.from("masterchef_competitions").select("*", { count: "exact", head: true }),
        supabase.from("masterchef_competition_entries").select("*", { count: "exact", head: true }),
        supabase.from("masterchef_recipe_posts").select("*", { count: "exact", head: true }),
        supabase.from("masterchef_competition_entries").select("user_id"),
      ]);
      const chefs = new Set((chefsRes.data ?? []).map((r: any) => r.user_id)).size;
      return {
        chefs,
        competitions: comps.count ?? 0,
        entries: entries.count ?? 0,
        recipes: recipes.count ?? 0,
      };
    },
  });

  return (
    <>
      <FloatingHowItWorks
        title="How the Global Kitchen Map works"
        intro="Live snapshot of the MasterChef community."
        steps={[
          { title: "See global stats", desc: "Active chefs, competitions, entries and recipes — pulled live from the platform." },
          { title: "Explore cuisines", desc: "Pick a cuisine to browse related recipes and chefs." },
          { title: "Enter competitions", desc: "Join or watch running competitions from the subscription hub." },
        ]}
      />
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => navigate("/masterchef-subscription")}>← Back</Button>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
              Global Kitchen Map
            </h1>
            <p className="text-muted-foreground text-lg">Live pulse of the MasterChef community</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: ChefHat, label: "Active chefs", value: stats?.chefs ?? 0 },
              { icon: Trophy, label: "Competitions", value: stats?.competitions ?? 0 },
              { icon: Users, label: "Entries", value: stats?.entries ?? 0 },
              { icon: Utensils, label: "Recipes", value: stats?.recipes ?? 0 },
            ].map((s) => (
              <Card key={s.label} className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <CardContent className="p-4 text-center">
                  <s.icon className="h-6 w-6 mx-auto mb-1 text-primary" />
                  <div className="text-2xl font-black">{isLoading ? "…" : s.value.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-br from-sky-500/10 to-cyan-500/10 border-sky-500/20">
            <CardContent className="p-6 text-center">
              <Globe className="h-12 w-12 mx-auto mb-3 text-sky-500" />
              <h3 className="text-xl font-bold mb-1">Cook, compete and share worldwide</h3>
              <p className="text-muted-foreground text-sm">Pick a cuisine below to explore chefs and recipes from that tradition.</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cuisines.map((c, i) => (
              <motion.div key={c.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer" onClick={() => navigate(`/masterchef?cuisine=${encodeURIComponent(c.tags[0])}`)}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{c.flag}</span>
                      {c.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {c.tags.map((t) => (
                        <span key={t} className="text-[10px] uppercase tracking-wide bg-muted/60 px-2 py-0.5 rounded-full text-muted-foreground">{t}</span>
                      ))}
                    </div>
                    <div className={`h-1.5 rounded-full bg-gradient-to-r ${c.color}`} />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
