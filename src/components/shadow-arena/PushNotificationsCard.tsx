import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { usePushNotifications } from "@/hooks/useShadowArenaFeatures";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function PushNotificationsCard() {
  const { enabled, subscribe } = usePushNotifications();

  return (
    <><FloatingHowItWorks title="PushNotificationsCard — How it works" steps={[{title:"Open this section",desc:"Access PushNotificationsCard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<Card className="p-4 bg-gradient-to-br from-[hsl(280,25%,7%)] to-[hsl(0,0%,4%)] border-red-900/30 mb-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {enabled ? <Bell className="w-6 h-6 text-yellow-400" /> : <BellOff className="w-6 h-6 text-red-400" />}
          <div>
            <p className="font-bold text-red-100 text-sm">Spooky Push Notifications</p>
            <p className="text-xs text-red-200/60">{enabled ? "Active — you'll be haunted by alerts" : "Get notified about battles, wins, patron drops"}</p>
          </div>
        </div>
        <Button
          size="sm"
          disabled={enabled || subscribe.isPending}
          onClick={() => subscribe.mutate()}
          className="bg-gradient-to-r from-red-700 to-purple-800"
        >
          {enabled ? "Enabled" : "Enable"}
        </Button>
      </div>
    </Card>
  </>
  );
}
