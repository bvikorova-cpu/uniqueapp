import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Save } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_DIVERSITYSELFID = [
  { title: "Read the intro", desc: "Filling this in is 100% optional and never affects your applications." },
  { title: "Answer only what you want", desc: "Every question has a 'Prefer not to say' option." },
  { title: "Data is anonymized", desc: "Employers see aggregate numbers only \u2014 never individual answers." },
];

const OPTS = {
  gender: ["Prefer not to say", "Female", "Male", "Non-binary", "Other"],
  ethnicity: ["Prefer not to say", "Asian", "Black/African", "Hispanic/Latino", "Middle Eastern", "White/European", "Mixed", "Other"],
  age_range: ["Prefer not to say", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
  veteran_status: ["Prefer not to say", "Veteran", "Not a veteran"],
  disability_status: ["Prefer not to say", "Yes", "No"],
};

export default function DiversitySelfId() {
  const [data, setData] = useState<any>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: row } = await (supabase as any).from("diversity_self_id").select("*").eq("user_id", user.id).maybeSingle();
      if (row) setData(row);
    })();
  }, []);

  const save = async () => {
    if (!userId) return toast.error("Sign in first");
    const payload: any = { user_id: userId };
    Object.keys(OPTS).forEach(k => { if (data[k]) payload[k] = data[k]; });
    const { error } = await (supabase as any).from("diversity_self_id").upsert(payload, { onConflict: "user_id" });
    if (error) toast.error(error.message); else toast.success("Saved");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-8 space-y-4">
      <div className="flex justify-end mb-2 max-w-6xl mx-auto px-4">
        <HowItWorksButton title="Self-ID" intro="Voluntary and anonymous demographic questionnaire." steps={HOW_STEPS_DIVERSITYSELFID} variant="compact" />
      </div>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-pink-500/15 via-primary/10 to-rose-500/5 border border-pink-500/20 p-6 flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-xl"><Heart className="h-6 w-6 text-white" /></div>
        <div>
          <h1 className="text-2xl font-black">Diversity Self-ID</h1>
          <p className="text-xs text-muted-foreground">Anonymous & optional. Helps employers report on inclusion.</p>
        </div>
      </motion.div>

      <Card><CardContent className="p-4 space-y-3">
        {Object.entries(OPTS).map(([key, options]) => (
          <div key={key} className="space-y-1">
            <label className="text-xs font-bold uppercase opacity-70">{key.replace(/_/g, " ")}</label>
            <Select value={data[key] || ""} onValueChange={v => setData({ ...data, [key]: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        ))}
        <Button className="w-full" onClick={save}><Save className="h-4 w-4 mr-2" />Save</Button>
      </CardContent></Card>
    </div>
  );
}
