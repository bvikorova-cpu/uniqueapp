import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const KEY = "ff_push_v1";

export default function FutureFacePushReminder() {
  const [perm, setPerm] = useState<NotificationPermission>("default");
  const [enabled, setEnabled] = useState(false);
  const [hour, setHour] = useState(20);
  const { toast } = useToast();

  useEffect(() => {
    if ("Notification" in window) setPerm(Notification.permission);
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setEnabled(data.enabled);
        setHour(data.hour ?? 20);
      }
    } catch {}
  }, []);

  // Fire while app open
  useEffect(() => {
    if (!enabled || perm !== "granted") return;
    const id = setInterval(() => {
      const now = new Date();
      const lastShown = localStorage.getItem(KEY + ":lastShown");
      const todayKey = now.toISOString().slice(0, 10);
      if (now.getHours() === hour && lastShown !== todayKey) {
        new Notification("Future Face — Daily Selfie 📸", {
          body: "Time to capture today's selfie and update your skin score!",
          icon: "/favicon.ico",
        });
        localStorage.setItem(KEY + ":lastShown", todayKey);
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [enabled, perm, hour]);

  const requestPerm = async () => {
    if (!("Notification" in window)) { toast({ title: "Browser doesn't support notifications", variant: "destructive" }); return; }
    const r = await Notification.requestPermission();
    setPerm(r);
    if (r === "granted") {
      setEnabled(true);
      localStorage.setItem(KEY, JSON.stringify({ enabled: true, hour }));
      new Notification("Future Face reminders on ✅", { body: "We'll ping you daily." });
    }
  };
  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(KEY, JSON.stringify({ enabled: next, hour }));
  };
  const updateHour = (h: number) => {
    setHour(h);
    localStorage.setItem(KEY, JSON.stringify({ enabled, hour: h }));
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black">🔔 Daily Reminders</h2>
        <Badge variant={enabled ? "default" : "outline"}>{enabled ? "ON" : "OFF"}</Badge>
      </div>
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
        <CardContent className="p-4 space-y-3">
          {perm !== "granted" ? (
            <Button onClick={requestPerm} className="w-full bg-gradient-to-r from-cyan-600 to-purple-600">
              <Bell className="h-4 w-4 mr-2" /> Enable selfie reminders
            </Button>
          ) : (
            <>
              <Button onClick={toggle} variant={enabled ? "destructive" : "default"} className="w-full">
                {enabled ? <><BellOff className="h-4 w-4 mr-2" /> Disable</> : <><Bell className="h-4 w-4 mr-2" /> Enable</>}
              </Button>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-bold flex-1">Time</span>
                <select value={hour} onChange={e => updateHour(parseInt(e.target.value))}
                  className="bg-background border border-border rounded px-2 py-1 text-sm">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-muted-foreground">Reminders fire while the app is open. For background pushes, install Future Face as a PWA.</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
