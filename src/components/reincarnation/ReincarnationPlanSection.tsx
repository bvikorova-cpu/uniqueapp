import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Crown, Target, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const ReincarnationPlanSection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [formData, setFormData] = useState({ planName: "", goalDescription: "" });

  useEffect(() => { checkAccess(); }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setCheckingAccess(false); return; }
      const { data } = await supabase.from("reincarnation_purchases").select("*").eq("user_id", user.id).eq("service_type", "reincarnation_guarantee").eq("status", "active").single();
      setHasAccess(!!data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCheckingAccess(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!formData.planName || !formData.goalDescription) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('create-reincarnation-plan', { body: formData });
      if (error) throw error;
      setPlan(data.plan);
      toast({ title: "Plan Created!" });
    } catch (error) {
      toast({ title: "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAccess) return <Card><CardContent className="py-12 text-center"><Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" /></CardContent></Card>;
  if (!hasAccess) return <Card className="border-destructive/50"><CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-6 w-6" />Locked</CardTitle></CardHeader><CardContent><Alert><AlertDescription>Go to Services tab (€199 one-time)</AlertDescription></Alert></CardContent></Card>;

  return (
    <>
      <FloatingHowItWorks
        title='Reincarnation Plan Section'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Reincarnation Plan Section panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <Card className="border-primary/20">
      <CardHeader><CardTitle className="flex items-center gap-2"><Crown className="h-6 w-6 text-primary" />Reincarnation Plan</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {!plan ? (
          <div className="space-y-4">
            <div><Label>Plan Name</Label><Input placeholder="My Journey" value={formData.planName} onChange={(e) => setFormData({ ...formData, planName: e.target.value })} /></div>
            <div><Label>Next Life Goal</Label><Textarea placeholder="Your goals..." rows={4} value={formData.goalDescription} onChange={(e) => setFormData({ ...formData, goalDescription: e.target.value })} /></div>
            <Button onClick={handleCreatePlan} disabled={loading} className="w-full" size="lg">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : <><Crown className="mr-2 h-4 w-4" />Generate Plan</>}</Button>
          </div>
        ) : (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader><CardTitle>{plan.plan_name}</CardTitle><CardDescription>{plan.next_life_goal}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div><h4 className="font-semibold mb-2">Soul Missions</h4>{plan.soul_missions?.map((m: any, i: number) => <div key={i} className="p-3 rounded bg-card border mb-2"><div className="flex justify-between"><p className="text-sm font-medium">{m.mission}</p><Badge variant={m.priority === "high" ? "default" : "secondary"}>{m.priority}</Badge></div></div>)}</div>
              <div><h4 className="font-semibold mb-2">Memory Preservation</h4><p className="text-sm text-muted-foreground">Retention: <Badge className="ml-2">{plan.preservation_protocol?.memory_retention}</Badge></p></div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
    </>
  );
};
