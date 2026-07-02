import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, ExternalLink, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  category?: string;
}

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  placement: string;
}

export default function MegatalentSponsorShowcase({ category }: Props) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let q = (supabase as any).from("mt_sponsors").select("*").eq("active", true);
      const { data } = await q;
      if (cancelled) return;
      let rows = (data || []) as Sponsor[];
      if (category) {
        const matched = rows.filter((r) => r.placement === "default" || r.placement === category);
        if (matched.length) rows = matched;
      }
      setSponsors(rows);
      setLoading(false);
    })();
    return (
    <>
      <FloatingHowItWorks title={"Megatalent Sponsor Showcase - How it works"} steps={[{ title: 'Open', desc: 'Access the Megatalent Sponsor Showcase section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Megatalent Sponsor Showcase.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => {
      cancelled = true;
    };
  }, [category]);

  useEffect(() => {
    if (sponsors.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % sponsors.length), 6000);
    return () => clearInterval(t);
  }, [sponsors.length]);

  if (loading) return null;
  if (sponsors.length === 0) return null;

  const s = sponsors[idx];

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-border/30 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">Sponsored</span>
          <Badge variant="outline" className="ml-auto text-[9px] gap-0.5 px-1.5 py-0">
            <Sparkles className="h-2.5 w-2.5" />
            Partner
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="relative bg-gradient-to-br from-primary to-accent p-4 text-primary-foreground"
          >
            <div className="flex items-start gap-3">
              {s.logo_url && (
                <div className="h-14 w-14 bg-primary-foreground/15 backdrop-blur rounded-xl p-2 shrink-0">
                  <img src={s.logo_url} alt={`${s.name} logo`} className="h-full w-full object-contain" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="font-black text-lg">{s.name}</h3>
                  <span className="text-xs text-primary-foreground/80 italic">{s.placement}</span>
                </div>
                <p className="text-sm text-primary-foreground/90 mt-1">Megatalent official sponsor</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-primary-foreground/70">Placement</p>
                <p className="text-sm font-bold">{s.placement}</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 gap-1.5"
                disabled={!s.website_url}
                onClick={() => {
                  if (!s.website_url) return;
                  if (s.website_url.startsWith("/")) window.location.href = s.website_url;
                  else window.open(s.website_url, "_blank", "noopener");
                }}
              >
                Visit
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
            {sponsors.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {sponsors.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    aria-label={`Show sponsor ${i + 1}`}
                    className={`h-1 rounded-full transition-all ${i === idx ? "w-4 bg-white" : "w-1 bg-white/40"}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
