import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Award, Share2, Copy, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface BadgeRow {
  id: string;
  category_slug: string;
  cards_total: number;
  share_code: string;
  earned_at: string;
}

interface CategoryRow {
  slug: string;
  name: string;
  emoji: string;
  gradient: string;
}

interface Props {
  userId: string;
  isOwnProfile?: boolean;
}

/** Shareable badges earned for completing full collectible-card categories. */
export const CardCategoryBadges = ({ userId, isOwnProfile }: Props) => {
  const [shareBadge, setShareBadge] = useState<(BadgeRow & { category?: CategoryRow }) | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: badges = [], isLoading } = useQuery({
    queryKey: ["card-category-badges", userId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("card_category_badges")
        .select("id, category_slug, cards_total, share_code, earned_at")
        .eq("user_id", userId)
        .order("earned_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BadgeRow[];
    },
    staleTime: 60 * 1000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["card-categories-lite"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("card_categories")
        .select("slug, name, emoji, gradient");
      if (error) throw error;
      return (data ?? []) as CategoryRow[];
    },
    staleTime: 30 * 60 * 1000,
  });

  const catMap = useMemo(() => {
    const m: Record<string, CategoryRow> = {};
    for (const c of categories) m[c.slug] = c;
    return m;
  }, [categories]);

  if (isLoading) {
    return (
      <Card className="p-6 flex justify-center border-border/30 bg-card/80">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (!badges.length) {
    if (!isOwnProfile) return null;
    return (
      <Card className="p-5 border-dashed border-border/40 bg-card/70">
        <div className="flex items-center gap-3">
          <Award className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="font-black text-sm">Collection badges</h3>
            <p className="text-xs text-muted-foreground">
              Complete a full collectible-card category to earn a shareable badge for your profile.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const shareUrl = shareBadge
    ? `${window.location.origin}/card-collections/${shareBadge.category_slug}?badge=${shareBadge.share_code}`
    : "";
  const shareText = shareBadge
    ? `I completed the ${shareBadge.category?.name ?? shareBadge.category_slug} collection — all ${shareBadge.cards_total} cards! 🏆`
    : "";

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Collection badge", text: shareText, url: shareUrl });
        return;
      } catch { /* user cancelled */ }
    }
    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    toast.success("Badge link copied to clipboard!");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const socials = [
    { label: "X", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
    { label: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { label: "WhatsApp", url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}` },
    { label: "LinkedIn", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
    { label: "Telegram", url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}` },
  ];

  return (
    <>
      <Card className="p-5 border-border/30 bg-card/80">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-amber-500" />
          <h3 className="font-black text-sm">Collection badges</h3>
          <Badge variant="outline" className="ml-auto border-border/40">{badges.length} earned</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {badges.map((b) => {
            const cat = catMap[b.category_slug];
            return (
              <div
                key={b.id}
                className="relative rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-500/10 to-yellow-600/5 p-3 text-center"
              >
                <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${cat?.gradient ?? "from-amber-400 to-yellow-600"} text-2xl shadow-lg`}>
                  {cat?.emoji ?? "🏆"}
                </div>
                <p className="text-xs font-black leading-tight truncate">{cat?.name ?? b.category_slug}</p>
                <p className="text-[10px] text-muted-foreground">Complete set · {b.cards_total} cards</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(b.earned_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 h-7 w-full gap-1 text-[11px]"
                  onClick={() => setShareBadge({ ...b, category: cat })}
                >
                  <Share2 className="h-3 w-3" /> Share
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      <Dialog open={!!shareBadge} onOpenChange={(o) => { if (!o) setShareBadge(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-left">
            <DialogTitle>Share your badge</DialogTitle>
            <DialogDescription>{shareText}</DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-500/15 to-yellow-600/10 p-5 text-center">
            <div className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${shareBadge?.category?.gradient ?? "from-amber-400 to-yellow-600"} text-3xl shadow-lg`}>
              {shareBadge?.category?.emoji ?? "🏆"}
            </div>
            <p className="font-black">{shareBadge?.category?.name ?? shareBadge?.category_slug}</p>
            <p className="text-xs text-muted-foreground">Complete set · {shareBadge?.cards_total} cards</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={nativeShare} className="gap-2"><Share2 className="h-4 w-4" /> Share</Button>
            <Button variant="outline" onClick={copyLink} className="gap-2">
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />} Copy link
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {socials.map((s) => (
              <Button
                key={s.label}
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => window.open(s.url, "_blank", "noopener,noreferrer")}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CardCategoryBadges;
