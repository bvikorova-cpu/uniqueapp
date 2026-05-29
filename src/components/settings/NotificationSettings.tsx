import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bell, Mail, Smartphone, Inbox, Volume2 } from "lucide-react";
import { useNotificationPreferences, NotifCategory, DigestFrequency } from "@/hooks/useNotificationPreferences";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import { playMessageChime } from "@/lib/messageChime";
import { playNotificationChime } from "@/lib/notificationChime";
import { toast } from "sonner";
import { useState } from "react";

const LABELS: Record<NotifCategory, string> = {
  likes: "Likes & reactions",
  comments: "Comments & replies",
  mentions: "Mentions & tags",
  follows: "New followers",
  messages: "Direct messages",
  marketing: "Promotions & updates",
  system: "System & security",
};

export function NotificationSettings() {
  const { data, isLoading, save } = useNotificationPreferences();
  const push = usePushSubscription();

  return (
    <div className="space-y-4">
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="h-4 w-4 text-primary" />
            Push notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {push.supported
              ? push.permission === "granted"
                ? "Push is allowed in this browser."
                : "Enable browser push to get alerts when the app is closed."
              : "Push is not supported on this device."}
          </div>
          {push.permission === "granted" && push.enabled ? (
            <Button size="sm" variant="outline" onClick={push.disable}>Disable</Button>
          ) : (
            <Button size="sm" onClick={push.enable} disabled={!push.supported}>Enable push</Button>
          )}
        </CardContent>
      </Card>

      <SoundTestCard />

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-primary" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <ul className="divide-y divide-border/40">
              {(data ?? []).map((p) => (
                <li key={p.category} className="grid grid-cols-1 gap-2 py-3 sm:grid-cols-[1fr_auto_auto_auto_auto]">
                  <div>
                    <p className="text-sm font-medium">{LABELS[p.category]}</p>
                  </div>
                  <Toggle icon={<Inbox className="h-3 w-3" />} label="In-app" value={p.in_app}
                    onChange={(v) => save({ ...p, in_app: v })} />
                  <Toggle icon={<Mail className="h-3 w-3" />} label="Email" value={p.email}
                    onChange={(v) => save({ ...p, email: v })} />
                  <Toggle icon={<Smartphone className="h-3 w-3" />} label="Push" value={p.push}
                    onChange={(v) => save({ ...p, push: v })} />
                  <Select
                    value={p.digest_frequency}
                    onValueChange={(v) => save({ ...p, digest_frequency: v as DigestFrequency })}
                  >
                    <SelectTrigger className="h-8 w-[120px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instant</SelectItem>
                      <SelectItem value="daily">Daily digest</SelectItem>
                      <SelectItem value="weekly">Weekly digest</SelectItem>
                      <SelectItem value="off">Off</SelectItem>
                    </SelectContent>
                  </Select>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Toggle({ icon, label, value, onChange }: { icon: React.ReactNode; label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      {icon}
      <span className="hidden sm:inline">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </label>
  );
}
