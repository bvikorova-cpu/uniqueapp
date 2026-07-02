import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Loader2, Building2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_JOBALERTS = [
  { title: "Create an alert", desc: "Set keyword, location, remote-ok, salary range and frequency (instant / daily / weekly)." },
  { title: "Receive notifications", desc: "You get an in-app + email alert whenever a job matches your criteria." },
  { title: "Manage alerts", desc: "Pause, edit or delete alerts anytime from this page." },
];

export default function JobAlerts() {
  const [enabled, setEnabled] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: pref } = await supabase.from("user_job_preferences").select("notify_enabled").eq("user_id", user.id).maybeSingle();
      setEnabled(pref?.notify_enabled ?? true);
      const { data: m } = await supabase.from("job_alert_matches").select("*, job_listings(id, title, company_name, location)").eq("user_id", user.id).order("notified_at", { ascending: false }).limit(50);
      setMatches(m || []);
      setLoading(false);
    })();
  }, []);

  const toggle = async (val: boolean) => {
    setEnabled(val);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_job_preferences").upsert({ user_id: user.id, notify_enabled: val }, { onConflict: "user_id" });
    toast({ title: val ? "Alerts on" : "Alerts off" });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/15 via-primary/10 to-pink-500/5 border border-amber-500/20 p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-pink-500 shadow-xl">
              <Bell className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">Job Alerts</h1>
              <p className="text-sm text-muted-foreground">Get notified when new jobs match your preferences</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="alerts-toggle">Enabled</Label>
            <Switch id="alerts-toggle" checked={enabled} onCheckedChange={toggle} />
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : matches.length === 0 ? (
        <Card className="border-dashed border-2"><CardContent className="py-16 text-center">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No alerts yet. We'll notify you when new jobs match your preferences.</p>
          <Button className="mt-4" onClick={() => navigate("/jobs")}>Browse jobs</Button>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {matches.filter(m => m.job_listings).map((m) => {
            const j = m.job_listings;
            return (
              <Card key={m.id} className="hover:border-primary/40 cursor-pointer" onClick={() => navigate(`/jobs?id=${j.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold">{j.title}</h3>
                    <span className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(m.notified_at), { addSuffix: true })}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{j.company_name}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{j.location}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
