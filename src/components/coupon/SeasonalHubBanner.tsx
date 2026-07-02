import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface SeasonalHub {
  id: string; slug: string; title: string; description: string | null;
  banner_url: string | null; accent_color: string | null;
}

export function SeasonalHubBanner() {
  const [hub, setHub] = useState<SeasonalHub | null>(null);

  useEffect(() => {
    supabase.from("coupon_seasonal_hubs" as any)
      .select("id, slug, title, description, banner_url, accent_color")
      .order("created_at", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => setHub((data as any) ?? null));
  }, []);

  if (!hub) return null;
  const accent = hub.accent_color || "#8b5cf6";

  return (
    <>
      <FloatingHowItWorks title={"Seasonal Hub Banner - How it works"} steps={[{ title: 'Open', desc: 'Access the Seasonal Hub Banner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Seasonal Hub Banner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Link to={`/coupons/season/${hub.slug}`}
      className="block relative overflow-hidden rounded-2xl mb-6 border border-border/50 group">
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}33, ${accent}11)` }} />
      {hub.banner_url && (
        <img src={hub.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />
      )}
      <div className="relative p-5 sm:p-6 flex items-center gap-3">
        <Sparkles className="w-6 h-6" style={{ color: accent }} />
        <div className="flex-1">
          <h3 className="font-black text-lg sm:text-xl">{hub.title}</h3>
          {hub.description && <p className="text-xs sm:text-sm text-muted-foreground">{hub.description}</p>}
        </div>
        <span className="text-xs font-semibold opacity-70 group-hover:opacity-100">Explore →</span>
      </div>
    </Link>
    </>
  );
}
