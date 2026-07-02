import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarClock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type Interval = "manual" | "daily" | "weekly" | "monthly";

export const PayoutSchedulePicker = () => {
  const [interval, setInterval] = useState<Interval>("daily");
  const [weekdayAnchor, setWeekdayAnchor] = useState("monday");
  const [monthlyAnchor, setMonthlyAnchor] = useState("1");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connected, setConnected] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.functions.invoke("check-connect-status", {
      body: { action: "live_status" },
    });
    if (data?.connected) {
      setConnected(true);
      const sched = data.payout_schedule;
      if (sched?.interval) setInterval(sched.interval as Interval);
      if (sched?.weekly_anchor) setWeekdayAnchor(sched.weekly_anchor);
      if (sched?.monthly_anchor) setMonthlyAnchor(String(sched.monthly_anchor));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.functions.invoke("check-connect-status", {
      body: {
        action: "update_payout_schedule",
        interval,
        weekly_anchor: interval === "weekly" ? weekdayAnchor : undefined,
        monthly_anchor: interval === "monthly" ? Number(monthlyAnchor) : undefined,
      },
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Payout schedule updated");
    load();
  };

  if (!loading && !connected) return null;

  return (
    <>
      <FloatingHowItWorks title={"Payout Schedule Picker - How it works"} steps={[{ title: 'Open', desc: 'Access the Payout Schedule Picker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Payout Schedule Picker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-blue-500/20 bg-card/80 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="w-4 h-4 text-blue-400" />
          Payout Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["manual", "daily", "weekly", "monthly"] as Interval[]).map((i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={interval === i ? "default" : "outline"}
                  onClick={() => setInterval(i)}
                  className="capitalize"
                >
                  {i}
                </Button>
              ))}
            </div>

            {interval === "weekly" && (
              <Select value={weekdayAnchor} onValueChange={setWeekdayAnchor}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["monday", "tuesday", "wednesday", "thursday", "friday"].map((d) => (
                    <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {interval === "monthly" && (
              <Select value={monthlyAnchor} onValueChange={setMonthlyAnchor}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => String(i + 1)).map((d) => (
                    <SelectItem key={d} value={d}>Day {d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button onClick={save} disabled={saving} className="w-full" size="sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save schedule"}
            </Button>
            <p className="text-[11px] text-muted-foreground">
              Manual = you withdraw on demand. Otherwise Stripe pays automatically.
            </p>
          </>
        )}
      </CardContent>
    </Card>
    </>
  );
};
