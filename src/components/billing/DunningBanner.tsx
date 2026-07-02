import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, X, Loader2 } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type Dunning = {
  id: string;
  amount_due_cents: number;
  currency: string;
  attempt_count: number;
  next_retry_at: string | null;
  hosted_invoice_url: string | null;
  kind: string;
};

const DISMISS_KEY = "dunning_dismissed_until";

export const DunningBanner = () => {
  const { user } = useAuth();
  const { format } = useCurrency();
  const [dunning, setDunning] = useState<Dunning | null>(null);
  const [opening, setOpening] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    const until = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (until && until > Date.now()) { setDismissed(true); return; }

    (async () => {
      const { data, error } = await supabase.functions.invoke("check-dunning");
      if (error) return;
      if ((data as any)?.has_dunning) setDunning((data as any).dunning);
    })();
  }, [user]);

  const openPortal = async () => {
    setOpening(true);
    const { data, error } = await supabase.functions.invoke("update-payment-method");
    setOpening(false);
    if (error || !(data as any)?.url) {
      toast.error("Couldn't open billing portal");
      return;
    }
    { const __u = (data as any).url; const __w = window.open(__u, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = __u; }
  };

  const dismiss = () => {
    // Snooze for 6h
    localStorage.setItem(DISMISS_KEY, String(Date.now() + 6 * 3600 * 1000));
    setDismissed(true);
  };

  if (!dunning || dismissed) return null;

  return (
    <>
      <FloatingHowItWorks title={"Dunning Banner - How it works"} steps={[{ title: 'Open', desc: 'Access the Dunning Banner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Dunning Banner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="sticky top-0 z-40 w-full border-b border-destructive/40 bg-gradient-to-r from-destructive/15 via-destructive/10 to-orange-500/10 backdrop-blur-xl">
      <div className="container mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
        <div className="flex-1 min-w-0 text-sm">
          <span className="font-semibold text-destructive-foreground">
            Payment failed
          </span>{" "}
          <span className="text-foreground/90">
            We couldn't charge {format(dunning.amount_due_cents / 100)} on your subscription
            {dunning.attempt_count > 1 ? ` (attempt ${dunning.attempt_count})` : ""}.
            {dunning.next_retry_at &&
              ` Stripe retries on ${new Date(dunning.next_retry_at).toLocaleDateString()}.`}
          </span>
        </div>
        <Button size="sm" onClick={openPortal} disabled={opening} className="gap-1.5">
          {opening ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
          Update card
        </Button>
        <Button size="sm" variant="ghost" onClick={dismiss} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
    </>
  );
};
