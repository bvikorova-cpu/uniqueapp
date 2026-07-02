import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Sparkles, Settings, Loader2 } from "lucide-react";
import { useCouplesStatus, useCouplesCheckout, useCouplesPortal } from "@/hooks/useHandwritingPremium";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const CouplesSubscriptionCard = () => {
  const [email, setEmail] = useState("");
  const status = useCouplesStatus();
  const checkout = useCouplesCheckout();
  const portal = useCouplesPortal();

  const isActive = (status.data as any)?.active;

  return (
    <>
      <FloatingHowItWorks title={"Couples Subscription Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Couples Subscription Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Couples Subscription Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-br from-rose-50/80 via-pink-50/60 to-amber-50/40 border-rose-300/40 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-amber-950/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-200" />
            Couples Membership
          </span>
          <Badge className="bg-gradient-to-r from-rose-600 to-pink-600 text-white border-0">€14.99/mo</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isActive ? (
          <>
            <div className="p-3 rounded-lg bg-gradient-to-r from-rose-100/80 to-pink-100/80 dark:from-rose-900/30 dark:to-pink-900/30 border border-rose-300/40 text-center">
              <Sparkles className="w-5 h-5 mx-auto text-rose-600 mb-1" />
              <div className="text-sm font-bold text-rose-900 dark:text-rose-200">Active Couple</div>
              <div className="text-xs text-rose-700/70 dark:text-rose-300/70 mt-1">
                Renews {new Date((status.data as any).current_period_end).toLocaleDateString()}
              </div>
            </div>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>✓ Unlimited compatibility scans</li>
              <li>✓ Monthly relationship report</li>
              <li>✓ Compatibility timeline tracker</li>
              <li>✓ Couples-only Voice Diary mode</li>
            </ul>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => portal.mutate()}
              disabled={portal.isPending}
            >
              {portal.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Settings className="w-3 h-3" />}
              Manage subscription
            </Button>
          </>
        ) : (
          <>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>💕 Unlimited compatibility scans (normally 12 cr each)</li>
              <li>📊 Monthly relationship evolution report</li>
              <li>📈 Compatibility timeline tracker</li>
              <li>🎙️ Couples-only Voice Diary insights</li>
            </ul>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Partner's email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-xs"
              />
              <Button
                onClick={() => checkout.mutate({ partnerEmail: email || undefined })}
                disabled={checkout.isPending}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white"
              >
                {checkout.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Heart className="w-4 h-4 mr-2 fill-white" />}
                Start Couples Plan
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
    </>
  );
};
