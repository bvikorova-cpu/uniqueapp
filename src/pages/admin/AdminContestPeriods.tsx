import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Save, Trophy, CalendarRange } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";

interface ContestPeriod {
  id: string;
  period_start: string;
  period_end: string;
  prize_pool_eur: number;
  title: string | null;
}

const empty = {
  period_start: "",
  period_end: "",
  prize_pool_eur: 10000,
  title: "",
};

export default function AdminContestPeriods() {
  const [rows, setRows] = useState<ContestPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<typeof empty>(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("mt_contest_settings")
      .select("id, period_start, period_end, prize_pool_eur, title")
      .order("period_start", { ascending: false });
    if (error) toast.error(error.message);
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!draft.period_start || !draft.period_end) {
      toast.error("Fill in both dates");
      return;
    }
    if (draft.period_end < draft.period_start) {
      toast.error("End date must be after start date");
      return;
    }
    setSaving(true);
    const { error } = await (supabase as any).from("mt_contest_settings").insert({
      period_start: draft.period_start,
      period_end: draft.period_end,
      prize_pool_eur: Number(draft.prize_pool_eur) || 0,
      title: draft.title || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Period added");
    setDraft(empty);
    load();
  };

  const update = async (row: ContestPeriod) => {
    const { error } = await (supabase as any)
      .from("mt_contest_settings")
      .update({
        period_start: row.period_start,
        period_end: row.period_end,
        prize_pool_eur: Number(row.prize_pool_eur) || 0,
        title: row.title,
      })
      .eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Really delete this period?")) return;
    const { error } = await (supabase as any)
      .from("mt_contest_settings")
      .delete()
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const setRow = (id: string, patch: Partial<ContestPeriod>) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <Helmet>
        <title>Megatalent Contest Periods — Admin</title>
        <meta
          name="description"
          content="Manage quarterly Megatalent contest periods and prize pools."
        />
      </Helmet>
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-7 w-7 text-yellow-400" />
            Megatalent Contest Periods
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quarterly periods and a fixed prize pool shown in the UI (MegaTalentHero,
            ContestStatsSidebar, EngagementRow).
          </p>
        </div>

        <Card className="p-4 bg-card/50 backdrop-blur space-y-3">
          <div className="font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4" /> New period
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <Label className="text-xs">Start</Label>
              <Input
                type="date"
                value={draft.period_start}
                onChange={(e) =>
                  setDraft({ ...draft, period_start: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-xs">End</Label>
              <Input
                type="date"
                value={draft.period_end}
                onChange={(e) =>
                  setDraft({ ...draft, period_end: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-xs">Prize pool (EUR)</Label>
              <Input
                type="number"
                min={0}
                value={draft.prize_pool_eur}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    prize_pool_eur: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <Label className="text-xs">Title</Label>
              <Input
                placeholder="Q1 2027 Megatalent Contest"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={create} disabled={saving} className="w-full">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50 font-semibold flex items-center gap-2">
            <CalendarRange className="h-4 w-4" /> Existing periods
          </div>
          {loading ? (
            <div className="p-10 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !rows.length ? (
            <div className="p-10 text-center text-muted-foreground text-sm">
              No periods. Add the first one above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="text-left px-3 py-2">Start</th>
                    <th className="text-left px-3 py-2">End</th>
                    <th className="text-left px-3 py-2">Prize (EUR)</th>
                    <th className="text-left px-3 py-2">Title</th>
                    <th className="text-right px-3 py-2">Akcie</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const active =
                      r.period_start <= today && r.period_end >= today;
                    const upcoming = r.period_start > today;
                    return (
                      <tr key={r.id} className="border-t border-border/30">
                        <td className="px-3 py-2">
                          {active ? (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                              ACTIVE
                            </span>
                          ) : upcoming ? (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs">
                              upcoming
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                              past
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="date"
                            value={r.period_start}
                            onChange={(e) =>
                              setRow(r.id, { period_start: e.target.value })
                            }
                            className="h-8 w-[140px]"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="date"
                            value={r.period_end}
                            onChange={(e) =>
                              setRow(r.id, { period_end: e.target.value })
                            }
                            className="h-8 w-[140px]"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min={0}
                            value={r.prize_pool_eur}
                            onChange={(e) =>
                              setRow(r.id, {
                                prize_pool_eur: Number(e.target.value),
                              })
                            }
                            className="h-8 w-[120px]"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            value={r.title ?? ""}
                            onChange={(e) =>
                              setRow(r.id, { title: e.target.value })
                            }
                            className="h-8 min-w-[200px]"
                          />
                        </td>
                        <td className="px-3 py-2 text-right whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => update(r)}
                            className="mr-1"
                          >
                            <Save className="h-3.5 w-3.5 mr-1" /> Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => remove(r.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
