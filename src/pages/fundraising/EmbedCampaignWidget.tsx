import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Heart, ExternalLink } from "lucide-react";

const tableByType: Record<string, string> = {
  medical: "medical_campaigns",
  dream: "dream_campaigns",
  hero: "hero_campaigns",
  crisis: "crisis_campaigns",
  pet: "pet_rescue_campaigns",
  student: "student_campaigns",
  talent: "talent_campaigns",
};

interface CampaignLite {
  id: string;
  title: string;
  description?: string | null;
  goal_amount: number;
  raised_amount?: number | null;
  current_amount?: number | null;
  image_url?: string | null;
  cover_image_url?: string | null;
}

/**
 * Public, embed-friendly mini widget rendered at /embed/campaign/:type/:id
 * Designed to be loaded inside <iframe> on third-party sites.
 * No login required, minimal chrome, deep-links to the full campaign.
 */
export default function EmbedCampaignWidget() {
  const { campaignType, campaignId } = useParams<{ campaignType: string; campaignId: string }>();
  const [campaign, setCampaign] = useState<CampaignLite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const table = tableByType[campaignType || ""];
      if (!table || !campaignId) { setLoading(false); return; }
      const { data } = await supabase
        .from(table as any)
        .select("*")
        .eq("id", campaignId)
        .maybeSingle();
      setCampaign((data as unknown as CampaignLite) || null);
      setLoading(false);
    })();
  }, [campaignType, campaignId]);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.uniqueapp.fun";
  const fullUrl = `${origin}/fundraising/${campaignType}/${campaignId}`;

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }
  if (!campaign) {
    return (
      <div className="p-6 text-sm">
        Campaign not found. <a className="underline" href={origin} target="_blank" rel="noreferrer">unique.app</a>
      </div>
    );
  }

  const raised = Number(campaign.raised_amount ?? campaign.current_amount ?? 0);
  const goal = Number(campaign.goal_amount || 1);
  const pct = Math.min(100, (raised / goal) * 100);
  const img = campaign.cover_image_url || campaign.image_url || null;

  return (
    <div className="min-h-[420px] bg-background p-4 flex flex-col gap-3 rounded-xl border border-border max-w-[480px] mx-auto">
      {img && (
        <img src={img} alt={campaign.title} className="w-full h-40 object-cover rounded-lg" loading="lazy" />
      )}
      <div className="flex-1">
        <h2 className="font-bold text-lg leading-tight line-clamp-2 mb-1">{campaign.title}</h2>
        {campaign.description && (
          <p className="text-xs text-muted-foreground line-clamp-3">{campaign.description}</p>
        )}
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="font-semibold text-primary">€{raised.toFixed(0)}</span>
          <span className="text-muted-foreground">of €{goal.toFixed(0)}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <a
        href={fullUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold py-2.5 text-sm hover:opacity-90 transition"
      >
        <Heart className="h-4 w-4" /> Donate <ExternalLink className="h-3 w-3" />
      </a>
      <p className="text-[10px] text-muted-foreground text-center">
        Powered by <a className="underline" href={origin} target="_blank" rel="noreferrer">Unique</a>
      </p>
    </div>
  );
}
