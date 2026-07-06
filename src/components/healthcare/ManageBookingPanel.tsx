import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Rule {
  id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export function ManageBookingPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    specialty: "",
    bio: "",
    consultation_price_cents: 5000,
    consultation_duration_min: 30,
    is_accepting_bookings: false,
  });
  const [rules, setRules] = useState<Rule[]>([]);
  const [newRule, setNewRule] = useState({ weekday: 1, start_time: "09:00", end_time: "17:00" });

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return;
      setUserId(uid);

      const [{ data: p }, { data: r }] = await Promise.all([
        supabase
          .from("healthcare_profiles")
          .select("specialty, bio, consultation_price_cents, consultation_duration_min, is_accepting_bookings")
          .eq("user_id", uid)
          .maybeSingle(),
        supabase
          .from("doctor_availability_rules")
          .select("id, weekday, start_time, end_time, is_active")
          .eq("doctor_id", uid)
          .order("weekday"),
      ]);
      if (p) setProfile({
        specialty: p.specialty ?? "",
        bio: p.bio ?? "",
        consultation_price_cents: p.consultation_price_cents ?? 5000,
        consultation_duration_min: p.consultation_duration_min ?? 30,
        is_accepting_bookings: !!p.is_accepting_bookings,
      });
      setRules((r as Rule[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const saveProfile = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("healthcare_profiles")
      .update(profile)
      .eq("user_id", userId);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Booking settings saved");
  };

  const addRule = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("doctor_availability_rules")
      .insert({ ...newRule, doctor_id: userId, is_active: true })
      .select("id, weekday, start_time, end_time, is_active")
      .single();
    if (error) return toast.error(error.message);
    setRules((r) => [...r, data as Rule]);
  };

  const deleteRule = async (id: string) => {
    const { error } = await supabase.from("doctor_availability_rules").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRules((r) => r.filter((x) => x.id !== id));
  };

  if (loading) return <div className="p-6 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking settings</CardTitle>
          <CardDescription>Configure your public bookable profile and pricing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border rounded-md p-3">
            <div>
              <Label>Accept new bookings</Label>
              <p className="text-xs text-muted-foreground">Toggle off to hide from the public list.</p>
            </div>
            <Switch
              checked={profile.is_accepting_bookings}
              onCheckedChange={(v) => setProfile({ ...profile, is_accepting_bookings: v })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Specialty</Label>
              <Input
                value={profile.specialty}
                onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                placeholder="e.g., General Practitioner"
              />
            </div>
            <div>
              <Label>Consultation duration</Label>
              <Select
                value={String(profile.consultation_duration_min)}
                onValueChange={(v) => setProfile({ ...profile, consultation_duration_min: Number(v) })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[15, 20, 30, 45, 60].map((m) => (
                    <SelectItem key={m} value={String(m)}>{m} minutes</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Price (EUR)</Label>
              <Input
                type="number"
                min={10}
                max={200}
                value={profile.consultation_price_cents / 100}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    consultation_price_cents: Math.round(Number(e.target.value) * 100),
                  })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">85% to you, 15% platform fee.</p>
            </div>
          </div>

          <div>
            <Label>Short bio</Label>
            <Textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value.slice(0, 1000) })}
              placeholder="Introduce yourself to patients…"
              rows={4}
            />
          </div>

          <Button onClick={saveProfile} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly availability</CardTitle>
          <CardDescription>Time ranges when you accept appointments (UTC).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {rules.length === 0 && (
              <p className="text-sm text-muted-foreground">No availability set yet.</p>
            )}
            {rules.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-2 border rounded-md">
                <span className="font-semibold w-12">{WEEKDAYS[r.weekday]}</span>
                <span className="text-sm">
                  {r.start_time.slice(0, 5)} – {r.end_time.slice(0, 5)}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto"
                  onClick={() => deleteRule(r.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 grid md:grid-cols-4 gap-2 items-end">
            <div>
              <Label className="text-xs">Weekday</Label>
              <Select
                value={String(newRule.weekday)}
                onValueChange={(v) => setNewRule({ ...newRule, weekday: Number(v) })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map((d, i) => (
                    <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Start</Label>
              <Input
                type="time"
                value={newRule.start_time}
                onChange={(e) => setNewRule({ ...newRule, start_time: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">End</Label>
              <Input
                type="time"
                value={newRule.end_time}
                onChange={(e) => setNewRule({ ...newRule, end_time: e.target.value })}
              />
            </div>
            <Button onClick={addRule}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
