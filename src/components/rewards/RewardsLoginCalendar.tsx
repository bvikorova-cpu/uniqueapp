import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Gift, Check, Lock, Sparkles, Star, Info } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { HowItWorksButton } from "@/components/common/HowItWorksButton";


interface Tpl {
  day_number: number;
  reward_type: string;
  reward_value: number;
  reward_label: string;
  reward_icon: string | null;
  is_milestone: boolean;
}

// Server anchors the calendar to Europe/Bratislava — mirror it here so
// worldwide users see the same "today" regardless of their local timezone.
const TZ = "Europe/Bratislava";

const getBratislavaParts = (d: Date) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(d).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== "literal") acc[p.type] = p.value;
    return acc;
  }, {});
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
};

const monthKeyBratislava = (d: Date) => {
  const p = getBratislavaParts(d);
  return `${p.year}-${String(p.month).padStart(2, "0")}`;
};

const secondsUntilNextBratislavaMidnight = (d: Date) => {
  const p = getBratislavaParts(d);
  const elapsed = p.hour * 3600 + p.minute * 60 + p.second;
  return 86400 - elapsed;
};

const formatCountdown = (secs: number) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const DEFAULTS: Tpl[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const milestone = [7, 14, 21, 30].includes(day);
  return {
    day_number: day,
    reward_type: "xp",
    reward_value: milestone ? day * 50 : 25 + (day * 5),
    reward_label: milestone ? `${day * 50} XP` : `${25 + day * 5} XP`,
    reward_icon: null,
    is_milestone: milestone,
  };
});

export default function RewardsLoginCalendar() {
  const { user } = useAuth();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const bratParts = getBratislavaParts(now);
  const todayDay = bratParts.day;
  const mKey = monthKeyBratislava(now);
  const daysInMonth = new Date(bratParts.year, bratParts.month, 0).getDate();
  const countdown = formatCountdown(secondsUntilNextBratislavaMidnight(now));

  const [tpls, setTpls] = useState<Tpl[]>(DEFAULTS);
  const [claims, setClaims] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const refresh = async () => {
    const { data: t } = await supabase
      .from("login_calendar_templates")
      .select("*")
      .eq("month_key", mKey)
      .order("day_number", { ascending: true });
    if (t && t.length > 0) setTpls(t as any);

    if (user) {
      const { data: c } = await supabase
        .from("user_calendar_claims")
        .select("day_number")
        .eq("user_id", user.id)
        .eq("month_key", mKey);
      setClaims(new Set((c || []).map(x => x.day_number)));
    }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [user?.id, mKey]);

  const claim = async (day: number, tpl: Tpl) => {
    if (!user || claiming) return;
    if (day !== todayDay) { toast.error("Only today's reward can be claimed"); return; }
    if (claims.has(day)) { toast.info("Already claimed"); return; }

    setClaiming(true);
    try {
      const { data, error } = await supabase.rpc("claim_calendar_day", {
        _month_key: mKey, _day_number: day,
      });
      if (error) { toast.error(error.message); return; }
      const res = data as any;
      if (!res?.ok) { toast.error(res?.error ?? "Claim failed"); return; }
      toast.success(`Claimed ${tpl.reward_label}! 🎁`);
      await refresh();
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground p-4">{"Loading calendar..."}</p>;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const claimedCount = claims.size;

  return (
    <div className="space-y-6">
      <div className="flex justify-end"><HowItWorksButton variant="compact" title="Daily Login Calendar" intro="Log in every day of the month to open bonus rewards — XP, credits and rare items." steps={[
        { title: "Tap today's tile", desc: "Only the current day's tile is claimable. Past days are locked (🔒), future days are hidden." },
        { title: "Milestone days", desc: "Days 7, 14, 21 and 30 are highlighted — they give the biggest rewards for consistency." },
        { title: "Missed a day?", desc: "Use a Streak Freeze to unlock a missed day and keep your streak alive." },
        { title: "Monthly reset", desc: "On the 1st of every month the calendar resets so you can start a fresh 30-day run." },
      ]} /></div>
      <Card className="overflow-hidden border-primary/30">
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="h-6 w-6" />
                <h2 className="text-xl font-bold">{"Daily Login Calendar"}</h2>
              </div>
              <p className="text-sm opacity-90">
                {`${new Date(bratParts.year, bratParts.month - 1, bratParts.day).toLocaleString("en", { month: "long", year: "numeric" })} • Day ${todayDay}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{claimedCount}/{daysInMonth}</p>
              <p className="text-xs opacity-80">{"claimed"}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Gift className="h-5 w-5 text-pink-500" />
            {"See what's coming this month"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-xs text-muted-foreground space-y-1">
            <p className="flex items-start gap-2 font-medium text-foreground">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              {"How it works"}
            </p>
            <p>{"1. Each day you log in, click today's tile to claim your reward."}</p>
            <p>{"2. Only today's reward can be claimed — missed days are locked."}</p>
            <p>{"3. Streak Freeze lets you unlock a missed day and keep your streak alive."}</p>
            <p>{"4. Milestone days (7, 14, 21, 30) give bigger bonus rewards."}</p>
            <p>{"5. The calendar resets at the start of each new month."}</p>
          </div>
        </CardContent>
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
            {days.map(day => {
              const tpl = tpls.find(t => t.day_number === day) || DEFAULTS[Math.min(day, 30) - 1];
              const claimed = claims.has(day);
              const isToday = day === todayDay;
              const isPast = day < todayDay;
              const canClaim = isToday && !claimed;

              return (
                <motion.button
                  key={day}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: day * 0.01 }}
                  onClick={() => canClaim && claim(day, tpl)}
                  disabled={!canClaim || claiming}
                  className={`aspect-square rounded-lg border-2 p-1.5 flex flex-col items-center justify-center transition-all ${
                    claimed ? "bg-emerald-500/20 border-emerald-500" :
                    canClaim ? "bg-gradient-to-br from-pink-500/20 to-fuchsia-500/20 border-pink-500 animate-pulse cursor-pointer hover:scale-105" :
                    isPast ? "bg-muted/30 border-border/40 opacity-50" :
                    tpl?.is_milestone ? "bg-card border-yellow-500/40" :
                    "bg-card border-border/40"
                  }`}
                >
                  <span className="text-[10px] text-muted-foreground">{"Day"}</span>
                  <span className="text-sm font-bold">{day}</span>
                  {claimed ? <Check className="h-3 w-3 text-emerald-400 mt-0.5" /> :
                   isPast ? <Lock className="h-3 w-3 text-muted-foreground mt-0.5" /> :
                   tpl?.is_milestone ? <Sparkles className="h-3 w-3 text-yellow-500 mt-0.5" /> :
                   <Star className="h-3 w-3 text-pink-400 mt-0.5" />}
                  <span className="text-[9px] mt-0.5 text-center leading-tight truncate w-full">{tpl?.reward_label}</span>
                </motion.button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-400" /> {"Claimed"}</span>
            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-pink-400" /> {"Available"}</span>
            <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-yellow-500" /> {"Milestone"}</span>
            <Badge variant="outline" className="text-[10px]">{"Miss a day → use Streak Freeze"}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
