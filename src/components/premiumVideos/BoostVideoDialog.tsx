import { useState } from "react";
import { toast } from "sonner";
import { Award, Flame, Loader2, Rocket, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VIDEO_BOOST_TIERS, type VideoBoostTier } from "@/hooks/useVideoCredits";

const ICONS: Record<VideoBoostTier, typeof Zap> = {
  quick: Zap,
  daily: Flame,
  mega: Award,
};

interface Props {
  videoId: string;
  onBoosted?: () => void;
}

export default function BoostVideoDialog({ videoId, onBoosted }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<VideoBoostTier | null>(null);

  const boost = async (tier: VideoBoostTier, credits: number) => {
    setPending(tier);
    try {
      const { data, error } = await (supabase as any).rpc("boost_premium_video", {
        _video_id: videoId,
        _tier: tier,
      });
      if (error) throw error;
      if (!data?.ok) {
        if (data?.error === "insufficient") {
          toast.error("Not enough video credits", {
            description: `This boost costs ${credits} credits. Top up above.`,
          });
        } else {
          toast.error("Boost failed", { description: String(data?.error ?? "Unknown error") });
        }
        return;
      }
      toast.success("Boost active", { description: `${credits} video credits used.` });
      window.dispatchEvent(new Event("video-credits-updated"));
      onBoosted?.();
      setOpen(false);
    } catch (e: any) {
      toast.error("Boost failed", { description: e?.message });
    } finally {
      setPending(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="gap-1">
          <Rocket className="h-3.5 w-3.5" /> Boost
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Promote this video</DialogTitle>
          <DialogDescription>Paid with video credits from this section's wallet.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {VIDEO_BOOST_TIERS.map((t) => {
            const Icon = ICONS[t.tier];
            return (
              <div
                key={t.tier}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 p-4"
              >
                <div className="rounded-lg bg-primary/15 p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {t.name} · {t.credits} credits
                  </p>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => boost(t.tier, t.credits)}
                    disabled={pending !== null}
                  >
                    {pending === t.tier ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      `Activate for ${t.credits}`
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
