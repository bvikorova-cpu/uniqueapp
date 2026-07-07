import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Rule {
  id?: string;
  weekday: number;
  start_time: string;
  end_time: string;
  timezone: string;
  is_active: boolean;
}

interface Props { doctorId: string; timezone: string }

/**
 * Weekly recurring availability rules editor for a doctor.
 * Backed by `doctor_availability_rules` (owner-scoped RLS).
 */
export default function DoctorAvailabilityEditor({ doctorId, timezone }: Props) {
  const { toast } = useToast();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    const { data } = await supabase
      .from("doctor_availability_rules")
      .select("*")
      .eq("doctor_id", doctorId)
      .order("weekday");
    setRules((data as any as Rule[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, [doctorId]);

  function addRule(weekday: number) {
    setRules((r) => [...r, { weekday, start_time: "09:00", end_time: "17:00", timezone, is_active: true }]);
  }

  function updateRule(idx: number, patch: Partial<Rule>) {
    setRules((r) => r.map((rule, i) => (i === idx ? { ...rule, ...patch } : rule)));
  }

  async function removeRule(idx: number) {
    const rule = rules[idx];
    if (rule.id) {
      const { error } = await supabase.from("doctor_availability_rules").delete().eq("id", rule.id);
      if (error) return toast({ variant: "destructive", title: "Delete failed", description: error.message });
    }
    setRules((r) => r.filter((_, i) => i !== idx));
  }

  async function saveAll() {
    setSaving(true);
    for (const rule of rules) {
      if (rule.start_time >= rule.end_time) {
        setSaving(false);
        return toast({ variant: "destructive", title: "Invalid time", description: `Weekday ${WEEKDAYS[rule.weekday]}: end must be after start.` });
      }
      const payload = {
        doctor_id: doctorId,
        weekday: rule.weekday,
        start_time: rule.start_time,
        end_time: rule.end_time,
        timezone: rule.timezone,
        is_active: rule.is_active,
      };
      const res = rule.id
        ? await supabase.from("doctor_availability_rules").update(payload).eq("id", rule.id)
        : await supabase.from("doctor_availability_rules").insert(payload);
      if (res.error) {
        setSaving(false);
        return toast({ variant: "destructive", title: "Save failed", description: res.error.message });
      }
    }
    setSaving(false);
    toast({ title: "Availability saved" });
    refresh();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Weekly availability</CardTitle>
          <CardDescription>Times are in {timezone}. Add multiple slots per day.</CardDescription>
        </div>
        <Button size="sm" onClick={saveAll} disabled={saving || loading}>
          {saving && <Loader2 className="mr-2 h-3 w-3 animate-spin" />} Save all
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading rules…</p>
        ) : (
          WEEKDAYS.map((label, wd) => {
            const dayRules = rules.map((r, i) => ({ ...r, __idx: i })).filter((r) => r.weekday === wd);
            return (
              <div key={wd} className="rounded-md border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{label}</span>
                  <Button size="sm" variant="ghost" onClick={() => addRule(wd)}>
                    <Plus className="h-3 w-3" /> Add slot
                  </Button>
                </div>
                {dayRules.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Off</p>
                ) : (
                  <div className="space-y-2">
                    {dayRules.map((r) => (
                      <div key={r.__idx} className="flex flex-wrap items-center gap-2">
                        <Input type="time" value={r.start_time.slice(0, 5)}
                          onChange={(e) => updateRule(r.__idx, { start_time: `${e.target.value}:00` })}
                          className="w-28" />
                        <span className="text-xs text-muted-foreground">→</span>
                        <Input type="time" value={r.end_time.slice(0, 5)}
                          onChange={(e) => updateRule(r.__idx, { end_time: `${e.target.value}:00` })}
                          className="w-28" />
                        <div className="flex items-center gap-1 text-xs">
                          <Switch checked={r.is_active}
                            onCheckedChange={(v) => updateRule(r.__idx, { is_active: v })} />
                          Active
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => removeRule(r.__idx)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
