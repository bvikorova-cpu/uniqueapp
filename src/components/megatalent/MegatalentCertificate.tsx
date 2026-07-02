import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Share2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  userId: string | null;
  category?: string;
}

const TIERS = [
  { min: 100, name: "Bronze", color: "#cd7f32", glow: "#cd7f3266" },
  { min: 500, name: "Silver", color: "#c0c0c0", glow: "#c0c0c066" },
  { min: 1000, name: "Gold", color: "#ffd700", glow: "#ffd70066" },
  { min: 5000, name: "Platinum", color: "#e5e4e2", glow: "#a78bfa66" },
  { min: 25000, name: "Diamond", color: "#b9f2ff", glow: "#22d3eebb" },
];

export default function MegatalentCertificate({ userId, category }: Props) {
  const [topVotes, setTopVotes] = useState(0);
  const [topTitle, setTopTitle] = useState<string>("");
  const [fullName, setFullName] = useState<string>("Anonymous Talent");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: best } = await supabase
          .from("talent_submissions")
          .select("title, votes_count")
          .eq("user_id", userId)
          .order("votes_count", { ascending: false })
          .limit(1)
          .maybeSingle();
        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", userId)
          .maybeSingle();

        if (!cancelled) {
          setTopVotes(best?.votes_count || 0);
          setTopTitle(best?.title || "");
          setFullName(prof?.full_name || "Anonymous Talent");
        }
      } catch (e) {
        console.error("Certificate load", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const tier = useMemo(() => {
    let current = null as (typeof TIERS)[number] | null;
    for (const t of TIERS) if (topVotes >= t.min) current = t;
    return current;
  }, [topVotes]);

  const nextTier = useMemo(() => TIERS.find((t) => topVotes < t.min) || null, [topVotes]);

  const certificateId = useMemo(() => {
    if (!userId) return "";
    const seed = `${userId}-${tier?.name || "none"}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    return `UNQ-${tier?.name?.[0] || "X"}-${hash.toString(36).toUpperCase().padStart(8, "0").slice(0, 8)}`;
  }, [userId, tier]);

  const buildSvg = () => {
    if (!tier) return "";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" viewBox="0 0 800 560">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a1a"/>
      <stop offset="100%" stop-color="#1a0a2a"/>
    </linearGradient>
    <linearGradient id="border" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${tier.color}"/>
      <stop offset="100%" stop-color="#ff2d92"/>
    </linearGradient>
  </defs>
  <rect width="800" height="560" fill="url(#bg)"/>
  <rect x="20" y="20" width="760" height="520" fill="none" stroke="url(#border)" stroke-width="3" rx="16"/>
  <text x="400" y="80" text-anchor="middle" fill="${tier.color}" font-family="Georgia, serif" font-size="20" letter-spacing="6">CERTIFICATE OF TALENT</text>
  <text x="400" y="170" text-anchor="middle" fill="#ffffff" font-family="Georgia, serif" font-size="48" font-weight="bold">${fullName.replace(/[<>&]/g, "")}</text>
  <text x="400" y="220" text-anchor="middle" fill="#ffffff99" font-family="Arial, sans-serif" font-size="16">is hereby recognized as a</text>
  <text x="400" y="290" text-anchor="middle" fill="${tier.color}" font-family="Georgia, serif" font-size="64" font-weight="bold">${tier.name} Talent</text>
  <text x="400" y="340" text-anchor="middle" fill="#ffffffcc" font-family="Arial, sans-serif" font-size="18">${topVotes.toLocaleString()} votes${category ? ` in ${category}` : ""}</text>
  ${topTitle ? `<text x="400" y="370" text-anchor="middle" fill="#ffffff77" font-family="Arial, sans-serif" font-size="14" font-style="italic">for "${topTitle.replace(/[<>&]/g, "").slice(0, 60)}"</text>` : ""}
  <line x1="200" y1="440" x2="600" y2="440" stroke="#ffffff33"/>
  <text x="400" y="475" text-anchor="middle" fill="#ffffff66" font-family="monospace" font-size="14">${certificateId}</text>
  <text x="400" y="510" text-anchor="middle" fill="#ffffff44" font-family="Arial, sans-serif" font-size="12">UNIQUE — Issued ${new Date().toLocaleDateString()}</text>
</svg>`;
  };

  const download = () => {
    const svg = buildSvg();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unique-certificate-${certificateId}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Certificate downloaded");
  };

  const share = async () => {
    const text = `I just earned a ${tier?.name} Talent Certificate on Unique! 🏆 #${certificateId}`;
    try {
      if (navigator.share) await navigator.share({ text, title: "My Unique Certificate" });
      else {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
      }
    } catch {}
  };

  if (!userId) return null;
  if (loading) return <Skeleton className="h-56 w-full rounded-xl" />;

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-border/30 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-5 w-5 text-primary" />
          Talent Certificate
          {tier ? (
            <Badge
              className="ml-auto text-[10px]"
              style={{ backgroundColor: tier.color, color: "#000" }}
            >
              {tier.name}
            </Badge>
          ) : (
            <Badge variant="outline" className="ml-auto text-[10px] gap-1">
              <Lock className="h-3 w-3" />
              Locked
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tier ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-5 border-2 relative overflow-hidden"
              style={{
                borderColor: tier.color,
                boxShadow: `0 0 30px ${tier.glow}`,
                background: `linear-gradient(135deg, ${tier.glow}, transparent)`,
              }}
            >
              <p className="text-[10px] uppercase tracking-widest opacity-70">
                Certificate of Talent
              </p>
              <p className="text-2xl font-black mt-1" style={{ color: tier.color }}>
                {tier.name} Talent
              </p>
              <p className="text-sm font-semibold mt-2">{fullName}</p>
              <p className="text-xs text-muted-foreground">
                {topVotes.toLocaleString()} votes
                {topTitle ? ` · "${topTitle}"` : ""}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground mt-3">{certificateId}</p>
            </motion.div>

            <div className="flex gap-2">
              <Button onClick={download} size="sm" className="flex-1 gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Download SVG
              </Button>
              <Button onClick={share} size="sm" variant="outline" className="flex-1 gap-1.5">
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-6 space-y-2">
            <Lock className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold">No certificate yet</p>
            <p className="text-xs text-muted-foreground">
              Reach <strong>100 votes</strong> on a submission to unlock Bronze.
            </p>
          </div>
        )}

        {nextTier && (
          <p className="text-[11px] text-center text-muted-foreground border-t border-border/30 pt-2">
            Next: <strong style={{ color: nextTier.color }}>{nextTier.name}</strong> at{" "}
            {nextTier.min.toLocaleString()} votes (
            {Math.max(0, nextTier.min - topVotes).toLocaleString()} to go)
          </p>
        )}
      </CardContent>
    </Card>
  );
}
