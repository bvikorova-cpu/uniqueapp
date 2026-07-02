import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, RefreshCw, MapPin, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_PERSONALIZEDFEED = [
  { title: "Improve accuracy", desc: "Complete your profile skills, past roles and preferences \u2014 more info = better matches." },
  { title: "Rate suggestions", desc: "Thumbs up / down teaches the algorithm and refines future recommendations." },
  { title: "Apply in one tap", desc: "Cards let you save or apply without leaving the feed." },
];

export default function PersonalizedFeed() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await (supabase as any).from("personalized_job_feed_cache")
      .select("*, job_listings(*)").eq("user_id", user.id).order("score", { ascending: false }).limit(50);
    setItems(data ?? []);
    setLoading(false);
  };

  const refresh = async () => {
    setRefreshing(true);
    const { error } = await supabase.functions.invoke("refresh-personalized-feed");
    setRefreshing(false);
    if (error) return toast.error(error.message);
    toast.success("Feed refreshed");
    load();
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-500/15 via-primary/10 to-pink-500/5 border border-fuchsia-500/20 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-500 shadow-xl"><Sparkles className="h-7 w-7 text-white" /></div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">For You</h1>
              <p className="text-sm text-muted-foreground">{items.length} personalized matches</p>
            </div>
          </div>
          <Button onClick={refresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <Card className="border-dashed border-2"><CardContent className="py-16 text-center space-y-3">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Set your preferences and recruiter profile, then click Refresh.</p>
          <Button onClick={refresh}>Generate now</Button>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {items.map(it => (
            <Card key={it.id} className="hover:border-primary/40 cursor-pointer" onClick={() => navigate(`/jobs?id=${it.job_id}`)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold">{it.job_listings?.title}</h3>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{it.job_listings?.company_name}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{it.job_listings?.location}</span>
                    </div>
                    {it.reason && <p className="text-xs text-fuchsia-400 mt-2">✨ {it.reason}</p>}
                  </div>
                  <Badge variant="secondary" className="text-base px-3">{Math.round(it.score)}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
