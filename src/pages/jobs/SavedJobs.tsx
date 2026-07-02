import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, MapPin, Building2, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_SAVEDJOBS = [
  { title: "Add jobs from the board", desc: "Tap the bookmark on any job card or detail page \u2014 it appears here instantly." },
  { title: "Remove a save", desc: "Tap the bookmark again to unsave. Applied jobs stay in Application Tracker." },
  { title: "Apply from the list", desc: "Open a saved job and hit Apply when you're ready." },
];

export default function SavedJobs() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from("saved_jobs").select("id, created_at, notes, job_listings(id, slug, title, company_name, location, salary_min, salary_max)").eq("user_id", user.id).order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    await supabase.from("saved_jobs").delete().eq("id", id);
    load();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <div className="flex justify-end mb-2 max-w-6xl mx-auto px-4">
        <HowItWorksButton title="Saved Jobs" intro="Every job you bookmarked, in one list." steps={HOW_STEPS_SAVEDJOBS} variant="compact" />
      </div>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-pink-500/10 border border-primary/20 p-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-pink-500 shadow-xl shadow-primary/30">
            <Bookmark className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Saved Jobs</h1>
            <p className="text-sm text-muted-foreground">{items.length} bookmarked</p>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <Card className="border-dashed border-2"><CardContent className="py-16 text-center">
          <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No saved jobs yet. Bookmark jobs you're interested in.</p>
          <Button className="mt-4" onClick={() => navigate("/jobs")}>Browse jobs</Button>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {items.filter(i => i.job_listings).map((item) => {
            const j = item.job_listings;
            return (
              <Card key={item.id} className="hover:border-primary/40 transition-all">
                <CardContent className="p-4 flex justify-between gap-4">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/jobs/listing/${j.slug || j.id}`)}>
                    <h3 className="font-bold truncate">{j.title}</h3>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{j.company_name}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{j.location}</span>
                    </div>
                    {j.salary_min && <p className="text-sm text-primary font-semibold mt-1">€{j.salary_min}{j.salary_max ? `–€${j.salary_max}` : ""}</p>}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
