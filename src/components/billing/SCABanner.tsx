import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ShieldCheck, X, Loader2 } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type Pending = {
  invoice_id: string;
  amount_cents: number;
  currency: string;
  hosted_invoice_url: string | null;
  next_action_url: string | null;
};

const DISMISS_KEY = "sca_dismissed_until";
const CACHE_KEY = "sca_last_check";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min — webhook keeps DB fresh, this is just a safety net

export const SCABanner = () => {
  const { user } = useAuth();
  const { format } = useCurrency();
  const [pending, setPending] = useState<Pending | null>(null);
  const [opening, setOpening] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    const until = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (until && until > Date.now()) {
      setDismissed(true);
      return;
    }
    // Throttle: skip the edge fn if we checked recently and got "no pending"
    const lastCheck = Number(localStorage.getItem(CACHE_KEY) || 0);
    if (lastCheck && Date.now() - lastCheck < CACHE_TTL_MS) return;
    (async () => {
      const { data, error } = await supabase.functions.invoke("check-sca");
      if (error) return;
      localStorage.setItem(CACHE_KEY, String(Date.now()));
      if ((data as any)?.has_pending) setPending((data as any).pending);
    })();
  }, [user]);

  const confirm = async () => {
    if (!pending) return;
    setOpening(true);
    let url = pending.hosted_invoice_url || pending.next_action_url;
    if (!url) {
      const { data, error } = await supabase.functions.invoke("sca-confirm-url", {
        body: { invoice_id: pending.invoice_id },
      });
      if (error || !(data as any)?.url) {
        setOpening(false);
        toast.error("Couldn't open authentication page");
        return;
      }
      url = (data as any).url;
    }
    setOpening(false);
    window.open(url!, "_blank", "noopener,noreferrer");
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + 2 * 3600 * 1000));
    setDismissed(true);
  };

  if (!pending || dismissed) return null;

  return (
    <>
      <FloatingHowItWorks title={"S C A Banner - How it works"} steps={[{ title: 'Open', desc: 'Access the S C A Banner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in S C A Banner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="sticky top-0 z-40 w-full border-b border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-yellow-500/10 backdrop-blur-xl">
      <div className="container mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-amber-500 flex-shrink-0" />
        <div className="flex-1 min-w-0 text-sm">
          <span className="font-semibold text-foreground">
            Bank authentication required
          </span>{" "}
          <span className="text-foreground/90">
            Your bank wants to verify a charge of {format(pending.amount_cents / 100)}.
            Confirm with 3-D Secure to keep your subscription active.
          </span>
        </div>
        <Button size="sm" onClick={confirm} disabled={opening} className="gap-1.5">
          {opening ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
          Confirm payment
        </Button>
        <Button size="sm" variant="ghost" onClick={dismiss} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
    </>
  );
};
