import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCcw, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PACKAGES: Array<{ days: number; price: number; popular?: boolean; productKey: string }> = [
  { days: 7, price: 19, productKey: "job_listing_7" },
  { days: 14, price: 29, popular: true, productKey: "job_listing_14" },
  { days: 30, price: 49, productKey: "job_listing_30" },
];

interface Props {
  jobId: string;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenewJobDialog({ jobId, jobTitle, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleRenew = async (productKey: string) => {
    setLoading(productKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-one-off-payment", {
        body: { productKey, metadata: { jobListingId: jobId } },
      });
      if (error) throw error;
      if (data?.url) {
        const w = window.open(data.url, "_blank", "noopener,noreferrer");
        if (!w) window.location.href = data.url;
        onOpenChange(false);
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      toast({
        title: "Renewal failed",
        description: err?.message || "Could not start checkout.",
        variant: "destructive",
      });
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
            Extend visibility for <span className="font-semibold">{jobTitle}</span>. Select a new package.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {PACKAGES.map((p) => (
            <Card
              key={p.productKey}
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
                <div className="text-3xl font-black">€{p.price}</div>
                <div className="text-sm text-muted-foreground">{p.days} days visibility</div>
                <Button
                  className="w-full"
                  variant={p.popular ? "default" : "outline"}
                  disabled={loading !== null}
                  onClick={() => handleRenew(p.productKey)}
                >
                  {loading === p.productKey ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading…</>
                  ) : (
                    "Renew"
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
