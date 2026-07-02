import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Gavel, Loader2, Check, Clock, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { userId: string | null; }

type App = { id: string; status: string; motivation: string; created_at: string; review_notes: string | null };

const JudgeApplication = ({ userId }: Props) => {
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [motivation, setMotivation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await (supabase as any).from("judge_applications")
        .select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle();
      setApp((data as App) || null);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-line */ }, [userId]);

  const submit = async () => {
    if (!userId) return;
    const m = motivation.trim();
    if (m.length < 30) { toast.error("Tell us a bit more (min 30 chars)"); return; }
    setSubmitting(true);
    try {
      const { error } = await (supabase as any).from("judge_applications")
        .insert({ user_id: userId, motivation: m });
      if (error) throw error;
      toast.success("Application submitted!");
      setMotivation("");
      await load();
    } catch (e: any) { toast.error(e?.message || "Couldn't submit"); }
    finally { setSubmitting(false); }
  };

  if (!userId) return null;

  return (
    <>
      <FloatingHowItWorks title={"Judge Application - How it works"} steps={[{ title: 'Open', desc: 'Access the Judge Application section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Judge Application.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Gavel className="h-4 w-4 text-amber-500" />
          <h2 className="font-bold">Become a Judge</h2>
        </div>
        {loading ? (
          <div className="py-4 flex items-center justify-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /></div>
        ) : app && app.status !== "rejected" ? (
          <div className="rounded-lg border border-border/30 p-3 bg-background/40 text-sm space-y-2">
            <div className="flex items-center gap-2">
              {app.status === "pending" && <><Clock className="h-4 w-4 text-amber-500" /><Badge variant="secondary">Pending review</Badge></>}
              {app.status === "approved" && <><Check className="h-4 w-4 text-green-500" /><Badge className="bg-green-500/20 text-green-300">Approved — you are a Judge</Badge></>}
            </div>
            <p className="text-xs text-muted-foreground italic">"{app.motivation}"</p>
            {app.review_notes && <p className="text-xs">Admin note: {app.review_notes}</p>}
          </div>
        ) : (
          <>
            {app?.status === "rejected" && (
              <div className="rounded-lg border border-destructive/30 p-2 text-xs text-muted-foreground">
                <X className="h-3.5 w-3.5 inline mr-1 text-destructive" /> Previous application rejected.
                {app.review_notes && <span> Reason: {app.review_notes}</span>}
              </div>
            )}
            <Textarea value={motivation} onChange={e => setMotivation(e.target.value.slice(0, 600))}
              placeholder="Why should you be a judge? Your experience, fairness, what categories you'd judge…" className="min-h-[90px] text-sm bg-background/60" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{motivation.length}/600</span>
              <Button size="sm" onClick={submit} disabled={submitting || motivation.trim().length < 30} className="gap-1">
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Apply
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
    </>
  );
};

export default JudgeApplication;
