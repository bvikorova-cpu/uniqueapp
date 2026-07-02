import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Briefcase, Loader2, Sparkles, DollarSign, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props { onBack: () => void; }

export default function BrandDealMarketplace({ onBack }: Props) {
  const [niche, setNiche] = useState("");
  const [followers, setFollowers] = useState("10000");
  const [deals, setDeals] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const findDeals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("influ-king-ai", {
        body: { action: "brand-deals", niche: niche || "General", followers: Number(followers) },
      });
      if (error) throw error;
      setDeals(data.deals || []);
      toast.success("Brand deals found!");
    } catch (e: any) {
      toast.error(e.message || "Failed to find deals");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title="How Brand Deal Marketplace works"
        steps={[
          { title: 'Enter niche & followers', description: 'Describe your audience.' },
          { title: 'Find deals (5 credits)', description: 'AI matches sponsorship opportunities.' },
          { title: 'Review match score', description: 'Compare payouts and requirements.' },
          { title: 'Apply', description: 'Reach out to brands directly.' },
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <div className="flex items-center gap-3 mb-4">
        <Briefcase className="h-8 w-8 text-cyan-400" />
        <div>
          <h2 className="text-2xl font-bold">Brand Deal Marketplace</h2>
          <p className="text-muted-foreground">AI-matched brand sponsorship opportunities for your influencers</p>
        </div>
      </div>

      <Card className="p-6 space-y-4 border-cyan-500/20">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Niche / Category</label>
            <Input value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g., Fashion, Tech..." />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Follower Count</label>
            <Input type="number" value={followers} onChange={e => setFollowers(e.target.value)} />
          </div>
        </div>
        <Button onClick={findDeals} disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-purple-600">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Find Brand Deals (5 credits)
        </Button>
      </Card>

      {deals && deals.length > 0 && (
        <div className="grid gap-3">
          {deals.map((deal: any, i: number) => (
            <Card key={i} className="p-4 border-cyan-500/10 hover:border-cyan-500/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-sm">{deal.brand}</p>
                  <p className="text-xs text-muted-foreground">{deal.description}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-bold text-sm">{deal.payout}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">{deal.type}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-0.5">
                  <Star className="h-3 w-3" /> {deal.match_score || "95%"}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
