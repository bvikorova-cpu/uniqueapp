import { useState } from "react";
import { Bell, Plus, Loader2, Play, Power, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useMonitoringJobs, useMonitorAction } from "@/hooks/useLieDetectorPro";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function MonitoringJobsCard() {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [seed, setSeed] = useState("");
  const [email, setEmail] = useState("");
  const [runJob, setRunJob] = useState<{ id: string; msgs: string }>({ id: "", msgs: "" });
  const { data: jobs = [] } = useMonitoringJobs();
  const action = useMonitorAction();

  const create = async () => {
    if (!label || !seed) return;
    await action.mutateAsync({ action: "create", label, thread_seed: seed, notify_email: email });
    toast.success("Monitor created");
    setLabel(""); setSeed(""); setEmail(""); setOpen(false);
  };
  const run = async (job_id: string) => {
    if (!runJob.msgs) { toast.error("Paste new messages first"); return; }
    const res = await action.mutateAsync({ action: "run", job_id, new_messages: runJob.msgs });
    if (res.should_alert) toast.warning(`⚠ Alert! Score ${res.current_score}% — ${res.summary}`);
    else toast.success(`Score: ${res.current_score}%`);
    setRunJob({ id: "", msgs: "" });
  };

  return (
    <>
      <FloatingHowItWorks title={"Monitoring Jobs Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Monitoring Jobs Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Monitoring Jobs Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-pink-500/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-pink-400">
          <Bell className="w-5 h-5" /> Scheduled Monitoring
          <Badge variant="outline" className="ml-auto text-[10px] border-pink-500/40 text-pink-300">4 cr / run</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {!open ? (
          <Button onClick={() => setOpen(true)} size="sm" className="w-full bg-pink-600 hover:bg-pink-700 text-white"><Plus className="w-3 h-3 mr-1" /> New Monitor</Button>
        ) : (
          <div className="space-y-2 p-2 rounded bg-black/20 border border-pink-500/20">
            <Input placeholder="Label" value={label} onChange={e => setLabel(e.target.value)} className="bg-background/40 text-xs h-8" />
            <Textarea placeholder="Baseline thread / context" value={seed} onChange={e => setSeed(e.target.value)} rows={2} className="bg-background/40 text-xs" />
            <Input type="email" placeholder="Alert email (optional)" value={email} onChange={e => setEmail(e.target.value)} className="bg-background/40 text-xs h-8" />
            <div className="flex gap-2">
              <Button size="sm" onClick={create} disabled={action.isPending} className="flex-1 bg-pink-600 hover:bg-pink-700">
                {action.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Create"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        )}
        <div className="space-y-1 max-h-48 overflow-auto">
          {jobs.map((j: any) => (
            <div key={j.id} className="p-2 rounded bg-black/20 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">{j.label}</span>
                  <Badge variant="outline" className="ml-2 text-[9px]">{j.cadence}</Badge>
                  {!j.is_active && <Badge variant="destructive" className="ml-1 text-[9px]">paused</Badge>}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => action.mutate({ action: "toggle", job_id: j.id })}><Power className="w-3 h-3" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => action.mutate({ action: "delete", job_id: j.id })}><Trash2 className="w-3 h-3 text-red-400" /></Button>
                </div>
              </div>
              {j.last_alert_score != null && <div className="text-[10px] text-muted-foreground">Last score: <span className="text-pink-300 font-mono">{j.last_alert_score}%</span></div>}
              {runJob.id === j.id ? (
                <div className="flex gap-2">
                  <Textarea value={runJob.msgs} onChange={e => setRunJob({ ...runJob, msgs: e.target.value })} placeholder="Paste new messages..." rows={2} className="bg-background/40 text-[10px]" />
                  <Button size="sm" onClick={() => run(j.id)} disabled={action.isPending}>
                    {action.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" onClick={() => setRunJob({ id: j.id, msgs: "" })}><Play className="w-3 h-3 mr-1" /> Run check now (4 cr)</Button>
              )}
            </div>
          ))}
          {jobs.length === 0 && <div className="text-[11px] text-muted-foreground italic text-center py-2">No active monitors.</div>}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
