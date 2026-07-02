import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListChecks, Loader2, Building2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { format } from "date-fns";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_APPLICATIONTRACKER = [
  { title: "See all applications", desc: "Sorted by newest. Each card shows job, company, status and last update." },
  { title: "Status stages", desc: "Applied \u2192 Viewed \u2192 Interview \u2192 Offer \u2192 Rejected. Colour matches the stage." },
  { title: "Add notes", desc: "Attach personal notes/reminders per application (interview times, contacts, prep)." },
  { title: "Withdraw an application", desc: "You can withdraw at any stage \u2014 the employer is notified automatically." },
];

const COLUMNS = [
  { id: "pending", label: "Applied", color: "bg-blue-500/15 border-blue-500/30 text-blue-400" },
  { id: "viewed", label: "Viewed", color: "bg-amber-500/15 border-amber-500/30 text-amber-400" },
  { id: "interview", label: "Interview", color: "bg-purple-500/15 border-purple-500/30 text-purple-400" },
  { id: "offer", label: "Offer", color: "bg-green-500/15 border-green-500/30 text-green-400" },
  { id: "rejected", label: "Rejected", color: "bg-rose-500/15 border-rose-500/30 text-rose-400" },
];

export default function ApplicationTracker() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.from("job_applications").select("*, job_listings(id, title, company_name, location)").eq("applicant_id", user.id).order("created_at", { ascending: false });
      setApps(data || []);
      setLoading(false);
    })();
  }, []);

  const grouped = (col: string) => apps.filter(a => (a.status || "pending") === col);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/15 via-primary/10 to-blue-500/5 border border-emerald-500/20 p-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 shadow-xl">
            <ListChecks className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Application Tracker</h1>
            <p className="text-sm text-muted-foreground">{apps.length} applications • track your progress</p>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : apps.length === 0 ? (
        <Card className="border-dashed border-2"><CardContent className="py-16 text-center">
          <ListChecks className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No applications yet.</p>
          <Button className="mt-4" onClick={() => navigate("/jobs")}>Find jobs</Button>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {COLUMNS.map((col) => {
            const items = grouped(col.id);
            return (
              <div key={col.id} className="space-y-2">
                <div className={`p-2 rounded-lg border ${col.color} flex items-center justify-between`}>
                  <span className="text-sm font-bold">{col.label}</span>
                  <Badge variant="outline" className={col.color}>{items.length}</Badge>
                </div>
                <div className="space-y-2 min-h-[80px]">
                  {items.map((a) => (
                    <Card key={a.id} className="hover:border-primary/40 cursor-pointer" onClick={() => a.job_listings && navigate(`/jobs?id=${a.job_listings.id}`)}>
                      <CardContent className="p-3">
                        <h4 className="font-semibold text-sm line-clamp-2">{a.job_listings?.title || "Job"}</h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Building2 className="h-3 w-3" />{a.job_listings?.company_name}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />{format(new Date(a.created_at), "PP")}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
