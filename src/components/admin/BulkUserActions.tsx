import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Play } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type Action = "shadow_ban" | "unshadow_ban" | "grant_credits" | "send_email" | "delete_user";

export const BulkUserActions = () => {
  const [idsRaw, setIdsRaw] = useState("");
  const [action, setAction] = useState<Action>("shadow_ban");
  const [amount, setAmount] = useState("100");
  const [note, setNote] = useState("");
  const [subject, setSubject] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ succeeded: number; failed: number; errors: string[] } | null>(null);

  const run = async () => {
    const ids = idsRaw.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
    if (!ids.length) return toast.error("Paste at least one user ID");
    if (ids.length > 500) return toast.error("Max 500 IDs per batch");
    if (!confirm(`Run "${action}" on ${ids.length} users?`)) return;

    setRunning(true); setResult(null);
    const params: any = {};
    if (action === "grant_credits") { params.amount = Number(amount); params.note = note; }
    if (action === "send_email") { params.subject = subject; }

    const { data, error } = await supabase.functions.invoke("admin-bulk-user-action", {
      body: { action, userIds: ids, params },
    });
    setRunning(false);
    if (error) return toast.error(error.message);
    if ((data as any)?.error) return toast.error((data as any).error);
    setResult(data as any);
    toast.success(`Done: ${(data as any).succeeded} succeeded, ${(data as any).failed} failed`);
  };

  return (
    <>
      <FloatingHowItWorks title={"Bulk User Actions - How it works"} steps={[{ title: 'Open', desc: 'Access the Bulk User Actions section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Bulk User Actions.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-4 sm:p-6 border-primary/20 bg-card/60 backdrop-blur-xl space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Bulk user actions</h3>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label>Action</Label>
          <Select value={action} onValueChange={(v) => setAction(v as Action)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="shadow_ban">Shadow ban</SelectItem>
              <SelectItem value="unshadow_ban">Remove shadow ban</SelectItem>
              <SelectItem value="grant_credits">Grant AI credits</SelectItem>
              <SelectItem value="send_email">Send email</SelectItem>
              <SelectItem value="delete_user">Delete user (irreversible)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {action === "grant_credits" && (
          <div>
            <Label>Credits per user</Label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
        )}
        {action === "send_email" && (
          <div>
            <Label>Subject</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
        )}
      </div>

      {(action === "grant_credits") && (
        <div>
          <Label>Note (optional)</Label>
          <Input value={note} onChange={e => setNote(e.target.value)} />
        </div>
      )}

      <div>
        <Label>User IDs (one per line, comma-, or space-separated, max 500)</Label>
        <Textarea
          rows={6} className="font-mono text-xs"
          placeholder="00000000-0000-0000-0000-000000000000"
          value={idsRaw} onChange={e => setIdsRaw(e.target.value)}
        />
      </div>

      <Button onClick={run} disabled={running} className="w-full">
        <Play className="h-4 w-4 mr-2" />
        {running ? "Running…" : "Execute"}
      </Button>

      {result && (
        <div className="rounded border border-primary/20 p-3 text-sm space-y-1 bg-background/40">
          <div className="text-emerald-400">✓ Succeeded: {result.succeeded}</div>
          <div className="text-destructive">✗ Failed: {result.failed}</div>
          {result.errors.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-muted-foreground">Show errors</summary>
              <pre className="text-xs whitespace-pre-wrap mt-2">{result.errors.join("\n")}</pre>
            </details>
          )}
        </div>
      )}
    </Card>
    </>
  );
};
