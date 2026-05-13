import { useState } from "react";
import { Webhook, Plus, Loader2, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreatorWebhooks, WEBHOOK_EVENTS } from "@/hooks/useCreatorWebhooks";
import { useToast } from "@/hooks/use-toast";

export function CreatorWebhooksDialog() {
  const [open, setOpen] = useState(false);
  const { hooks, loading, create, toggle, remove } = useCreatorWebhooks();
  const { toast } = useToast();
  const [form, setForm] = useState<{ url: string; events: string[]; description: string }>({
    url: "",
    events: [],
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const onCreate = async () => {
    if (!form.url || form.events.length === 0) {
      toast({ title: "URL and at least one event are required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const err = await create({
      url: form.url,
      events: form.events,
      description: form.description || undefined,
    });
    setSubmitting(false);
    if (err) {
      toast({ title: "Error", description: (err as any).message, variant: "destructive" });
    } else {
      setForm({ url: "", events: [], description: "" });
      toast({ title: "Webhook created" });
    }
  };

  const copySecret = (s: string) => {
    navigator.clipboard.writeText(s);
    toast({ title: "Secret copied" });
  };

  const toggleEvent = (e: string) => {
    setForm((f) => ({
      ...f,
      events: f.events.includes(e) ? f.events.filter((x) => x !== e) : [...f.events, e],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Webhook className="h-4 w-4" />
          Webhooks
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Creator Webhooks</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {hooks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                No webhooks yet — create your first one below.
              </p>
            )}
            {hooks.map((h) => (
              <div key={h.id} className="rounded-lg border border-border/50 p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs truncate">{h.url}</p>
                    {h.description && (
                      <p className="text-xs text-muted-foreground mt-1">{h.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {h.events.map((e) => (
                        <span key={e} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Switch
                      checked={h.is_active}
                      onCheckedChange={(v) => toggle(h.id, v)}
                    />
                    <Button size="icon" variant="ghost" onClick={() => remove(h.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Signing secret:</span>
                  <code className="font-mono bg-muted px-1.5 py-0.5 rounded truncate flex-1">
                    {h.secret.slice(0, 12)}…
                  </code>
                  <Button size="icon" variant="ghost" onClick={() => copySecret(h.secret)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2 border-t border-border/40 pt-3">
          <p className="text-sm font-semibold flex items-center gap-1">
            <Plus className="h-4 w-4" /> New webhook
          </p>
          <Input
            placeholder="https://example.com/webhook"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />
          <Textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />
          <div className="space-y-1">
            <p className="text-xs font-medium">Events</p>
            <div className="grid grid-cols-2 gap-1">
              {WEBHOOK_EVENTS.map((e) => (
                <label key={e} className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox
                    checked={form.events.includes(e)}
                    onCheckedChange={() => toggleEvent(e)}
                  />
                  {e}
                </label>
              ))}
            </div>
          </div>
          <Button onClick={onCreate} disabled={submitting} className="w-full">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create webhook
          </Button>
          <p className="text-[11px] text-muted-foreground">
            Each delivery includes an <code>X-Webhook-Signature</code> HMAC-SHA256 header signed with your secret.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
