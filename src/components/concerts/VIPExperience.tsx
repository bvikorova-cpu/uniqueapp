import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, Star, Sparkles, MessageCircle, Eye, Headphones } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const VIPExperience = ({ onBack }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          productName: "VIP All-Access Pass",
          amount: 2999,
          mode: "subscription",
          metadata: { type: "concert_vip", feature: "vip_pass" },
        },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch { toast.error("Failed to start checkout"); }
    finally { setLoading(false); }
  };

  const benefits = [
    { icon: Eye, title: "Front Row Seats", desc: "Virtual front-row position at every live concert" },
    { icon: MessageCircle, title: "Priority Chat", desc: "Your messages appear highlighted in live chat" },
    { icon: Star, title: "Exclusive Content", desc: "Access backstage footage and artist interviews" },
    { icon: Headphones, title: "HD Audio", desc: "Lossless quality audio streaming" },
    { icon: Sparkles, title: "VIP Badge", desc: "Exclusive profile badge visible across the platform" },
    { icon: Crown, title: "Meet & Greet", desc: "Private video sessions with artists after shows" },
  ];

  return (
    <>
      <FloatingHowItWorks title="How VIPExperience works" steps={[
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
        <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">VIP Experience</h2>
        <p className="text-muted-foreground text-sm mt-1">Upgrade to the ultimate concert experience</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {benefits.map((b) => (
          <Card key={b.title} className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 hover:border-yellow-500/40 transition-all">
            <CardContent className="p-5">
              <b.icon className="h-8 w-8 text-yellow-500 mb-3" />
              <h3 className="font-bold text-sm mb-1">{b.title}</h3>
              <p className="text-xs text-muted-foreground">{b.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
        <CardContent className="p-6 text-center">
          <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-xl font-black mb-2">VIP All-Access Pass</h3>
          <p className="text-3xl font-black text-yellow-500 mb-1">€29.99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
          <p className="text-sm text-muted-foreground mb-4">Unlimited access to all VIP benefits</p>
          <Button onClick={handleUpgrade} disabled={loading} size="lg"
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold">
            {loading ? "Processing..." : "Upgrade to VIP"}
          </Button>
        </CardContent>
      </Card>
    </div>
    </>
    );
};
