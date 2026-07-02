import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function ReferralCreditsCard() {
  const [link, setLink] = useState("");
  const [count, setCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setLink(`${window.location.origin}/ai-credits-store?ref=${user.id.slice(0, 8)}`);
      const { count: c } = await supabase
        .from("ai_credit_referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", user.id)
        .eq("status", "rewarded");
      setCount(c || 0);
    })();
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied!" });
  };

  return (
    <>
      <FloatingHowItWorks title={"Referral Credits Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Referral Credits Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Referral Credits Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="max-w-5xl mx-auto mb-6 border-primary/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>Invite friends — get 20 credits each</CardTitle>
        </div>
        <CardDescription>You and your friend each get 20 free credits when they make their first purchase.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input value={link} readOnly />
          <Button onClick={copy} variant="outline" className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          <strong>{count}</strong> successful referrals · <strong>{count * 20}</strong> credits earned
        </p>
      </CardContent>
    </Card>
    </>
  );
}
