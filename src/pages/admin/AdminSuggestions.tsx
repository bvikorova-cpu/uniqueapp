import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Lightbulb, Loader2, RefreshCw } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatDistanceToNow } from "date-fns";

interface Suggestion {
  id: string;
  user_id: string | null;
  email: string | null;
  category: string;
  title: string;
  description: string;
  page_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const STATUSES = ["new", "reviewing", "planned", "done", "rejected"];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  reviewing: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  planned: "bg-primary/10 text-primary border-primary/20",
  done: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  rejected: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

export default function AdminSuggestions() {
  const [rows, setRows] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("platform_suggestions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((data as Suggestion[]) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  const update = async (id: string, patch: Partial<Suggestion>) => {
    setSavingId(id);
    const { error } = await (supabase as any)
      .from("platform_suggestions")
      .update({ ...patch, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    setSavingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Saved");
    load();
  };

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="User suggestions"
          subtitle="Ideas and feedback submitted by users"
          icon={Lightbulb}
        />

        <div className="flex items-center gap-3 mb-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({rows.length})</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s} ({rows.filter((r) => r.status === s).length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <AdminGlassCard>
            <p className="p-6 text-sm text-muted-foreground">No suggestions yet.</p>
          </AdminGlassCard>
        ) : (
          <div className="space-y-4">
            {filtered.map((r) => (
              <AdminGlassCard key={r.id}>
                <div className="p-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={STATUS_COLORS[r.status] ?? ""}>
                      {r.status}
                    </Badge>
                    <Badge variant="outline">{r.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                    </span>
                    {r.email && <span className="text-xs text-muted-foreground">{r.email}</span>}
                  </div>

                  <div>
                    <div className="font-semibold">{r.title}</div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{r.description}</p>
                    {r.page_url && (
                      <a
                        href={r.page_url}
                        className="text-xs underline text-muted-foreground"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {r.page_url}
                      </a>
                    )}
                  </div>

                  <Textarea
                    rows={2}
                    placeholder="Internal notes"
                    value={notes[r.id] ?? r.admin_notes ?? ""}
                    onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={r.status} onValueChange={(v) => update(r.id, { status: v })}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={savingId === r.id}
                      onClick={() => update(r.id, { admin_notes: notes[r.id] ?? r.admin_notes ?? "" })}
                    >
                      {savingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save notes"}
                    </Button>
                  </div>
                </div>
              </AdminGlassCard>
            ))}
          </div>
        )}
      </AdminPageShell>
    </AdminGuard>
  );
}
