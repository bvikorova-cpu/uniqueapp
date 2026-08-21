import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCcw, Sparkles, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useJobsCredits, JOBS_CREDIT_COSTS } from "@/hooks/useJobsCredits";

const PACKAGES: Array<{ days: number; credits: number; popular?: boolean }> = [
  { days: 7, credits: JOBS_CREDIT_COSTS.listing_7 },
  { days: 14, credits: JOBS_CREDIT_COSTS.listing_14, popular: true },
  { days: 30, credits: JOBS_CREDIT_COSTS.listing_30 },
];

interface Props {
  jobId: string;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenewJobDialog({ jobId, jobTitle, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const { spend } = useJobsCredits();
  const [loading, setLoading] = useState<number | null>(null);

  const handleRenew = async (pkg: { days: number; credits: number }) => {
    setLoading(pkg.days);
    try {
      const ok = await spend(pkg.credits, `job_listing_renew_${pkg.days}d`);
      if (!ok) return;

      const now = new Date();
      const expires = new Date(now.getTime() + pkg.days * 24 * 60 * 60 * 1000);

      const { error } = await (supabase as any)
        .from("job_listings")
        .update({
          is_active: true,
          paid_status: "paid",
          duration_days: pkg.days,
          published_at: now.toISOString(),
          expires_at: expires.toISOString(),
        })
        .eq("id", jobId);
      if (error) throw error;

      toast({ title: "Listing renewed", description: `Visible for another ${pkg.days} days.` });
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Renewal failed",
        description: err?.message || "Could not renew this listing.",
        variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-primary" /> Renew job posting
          </DialogTitle>
          <DialogDescription>
            Extend visibility for <span className="font-semibold">{jobTitle}</span>. Renewal is paid with credits.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {PACKAGES.map((p) => (
            <Card
              key={p.days}
              className={`relative border-2 transition-all ${
                p.popular ? "border-primary shadow-lg shadow-primary/10" : "border-border/40"
              }`}
            >
              {p.popular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                  <Sparkles className="h-3 w-3 mr-1" /> Popular
                </Badge>
              )}
              <CardContent className="p-5 flex flex-col items-center gap-3">
                <div className="text-3xl font-black flex items-center gap-1.5">
                  <Zap className="h-5 w-5 text-primary" />{p.credits}
                </div>
                <div className="text-sm text-muted-foreground">{p.days} days visibility</div>
                <Button
                  className="w-full"
                  variant={p.popular ? "default" : "outline"}
                  disabled={loading !== null}
                  onClick={() => handleRenew(p)}
                >
                  {loading === p.days ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Renewing…</>
                  ) : (
                    `Renew · ${p.credits} credits`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
