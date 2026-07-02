import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeCheck, Loader2, ShieldCheck, Clock, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props {
  userId: string;
}

/** Lets a seller request KYC verification and shows current status. */
export const RequestVerificationCard = ({ userId }: Props) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<"none" | "pending" | "verified" | "rejected">("none");
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bazaar_seller_verifications" as any)
      .select("status, admin_note")
      .eq("user_id", userId)
      .maybeSingle();
    if (data) {
      setStatus((data as any).status);
      setNote((data as any).admin_note ?? null);
    } else {
      setStatus("none");
    }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [userId]);

  const request = async () => {
    setSubmitting(true);
    const { error } = await supabase
      .from("bazaar_seller_verifications" as any)
      .insert({ user_id: userId, status: "pending" });
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not submit", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Request submitted", description: "Our team will review your account." });
    refresh();
  };

  if (loading) return null;

  return (
    <>
      <FloatingHowItWorks title="How Request Verification Card works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Card className="bg-card/60 border-border/50">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-4 w-4 text-primary" /> Seller verification
        </div>
        {status === "verified" && (
          <p className="text-sm text-emerald-500 flex items-center gap-2">
            <BadgeCheck className="h-4 w-4" /> Your account is verified.
          </p>
        )}
        {status === "pending" && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" /> Your verification is being reviewed.
          </p>
        )}
        {status === "rejected" && (
          <>
            <p className="text-sm text-destructive flex items-center gap-2">
              <XCircle className="h-4 w-4" /> Verification rejected.
            </p>
            {note && <p className="text-xs text-muted-foreground">Reason: {note}</p>}
            <Button size="sm" onClick={request} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Re-apply
            </Button>
          </>
        )}
        {status === "none" && (
          <>
            <p className="text-xs text-muted-foreground">
              Get a green "Verified" badge on all your listings — buyers trust verified sellers more.
            </p>
            <Button size="sm" onClick={request} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Request verification
            </Button>
          </>
        )}
      </CardContent>
    </Card>
    </>
    );
};

export default RequestVerificationCard;
