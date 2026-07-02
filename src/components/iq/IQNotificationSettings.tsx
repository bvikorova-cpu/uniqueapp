import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Prefs {
  weekly_digest: boolean;
  streak_reminder: boolean;
  duel_invite: boolean;
  daily_challenge: boolean;
  preferred_hour: number;
}

const DEFAULTS: Prefs = {
  weekly_digest: true,
  streak_reminder: true,
  duel_invite: true,
  daily_challenge: true,
  preferred_hour: 9,
};

export default function IQNotificationSettings() {
  const [uid, setUid] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      setUid(session.user.id);
      const { data } = await supabase
        .from("iq_notification_prefs")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (data) setPrefs({
        weekly_digest: data.weekly_digest,
        streak_reminder: data.streak_reminder,
        duel_invite: data.duel_invite,
        daily_challenge: data.daily_challenge,
        preferred_hour: data.preferred_hour,
      });
      setLoading(false);
    })();
  }, []);

  const update = async (patch: Partial<Prefs>) => {
    if (!uid) return;
    const next = { ...prefs, ...patch };
    setPrefs(next);
    setSaving(true);
    const { error } = await supabase
      .from("iq_notification_prefs")
      .upsert({ user_id: uid, ...next }, { onConflict: "user_id" });
    setSaving(false);
    if (error) toast.error(error.message);
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks title="How IQNotification Settings works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
        <Card className="backdrop-blur-xl bg-card/80 border-primary/20 mb-8">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </CardContent>
      </Card>
      </>
      );
  }

  const rows: { key: keyof Prefs; label: string; desc: string }[] = [
    { key: "weekly_digest",   label: "Weekly digest",          desc: "Sunday recap of your IQ progress" },
    { key: "daily_challenge", label: "Daily challenge",        desc: "Reminder to play today's challenge" },
    { key: "streak_reminder", label: "Streak reminders",       desc: "Nudge when your streak is at risk" },
    { key: "duel_invite",     label: "1v1 duel invites",       desc: "Notify me when a friend challenges me" },
  ];

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-primary/20 mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" /> Notifications
          {saving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map(r => (
          <div key={r.key} className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <Label htmlFor={`pref-${r.key}`} className="text-sm font-semibold">{r.label}</Label>
              <p className="text-xs text-muted-foreground">{r.desc}</p>
            </div>
            <Switch
              id={`pref-${r.key}`}
              checked={Boolean(prefs[r.key])}
              onCheckedChange={(v) => update({ [r.key]: v } as Partial<Prefs>)}
            />
          </div>
        ))}

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/40">
          <div className="space-y-0.5">
            <Label htmlFor="pref-hour" className="text-sm font-semibold">Preferred hour</Label>
            <p className="text-xs text-muted-foreground">Send around this local hour</p>
          </div>
          <select
            id="pref-hour"
            value={prefs.preferred_hour}
            onChange={(e) => update({ preferred_hour: Number(e.target.value) })}
            className="bg-background border border-border rounded-md px-2 py-1 text-sm"
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
