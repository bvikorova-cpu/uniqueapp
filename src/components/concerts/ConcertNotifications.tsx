import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, Music, Gift, Calendar, Star } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const ConcertNotifications = ({ onBack }: Props) => {
  const [prefs, setPrefs] = useState({
    newConcerts: true,
    liveAlerts: true,
    giftNotifs: false,
    artistUpdates: true,
    weeklyDigest: false,
  });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success("Preference updated");
  };

  const items = [
    { key: "newConcerts" as const, icon: Calendar, label: "New Concert Announcements", desc: "Get notified when new concerts are scheduled" },
    { key: "liveAlerts" as const, icon: Music, label: "Live Show Alerts", desc: "Instant notification when a concert goes live" },
    { key: "giftNotifs" as const, icon: Gift, label: "Gift Activity", desc: "Notifications about gifts you've sent or received" },
    { key: "artistUpdates" as const, icon: Star, label: "Artist Updates", desc: "Updates from artists you follow" },
    { key: "weeklyDigest" as const, icon: Bell, label: "Weekly Digest", desc: "Weekly summary of concert activity" },
  ];

  return (
    <>
      <FloatingHowItWorks title="How Concert Notifications works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>
      <div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Notification Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Customize your concert notifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <Switch checked={prefs[item.key]} onCheckedChange={() => toggle(item.key)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
    </>
    );
};
