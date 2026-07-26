import { useEffect, useState } from "react";
import { Sparkles, Infinity as InfinityIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  /** Module name shown in the banner (e.g. "Homework Helper"). */
  moduleName?: string;
  /** Compact one-line variant for tight layouts. */
  compact?: boolean;
}

/**
 * Slim banner that confirms the user has an active Kids Gold Pass and that
 * this module is unlimited (no credits deducted). Reads from the
 * `kids_gold_pass_status` cache (written by stripe-webhook) and re-renders
 * instantly on webhook updates via Realtime.
 */
export const KidsGoldPassBanner = ({ moduleName, compact = false }: Props) => {
  const { user } = useAuth();
  const [active, setActive] = useState(false);
  const [renewsAt, setRenewsAt] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const load = async () => {
      const { data } = await (supabase as any)
        .from("kids_gold_pass_status")
        .select("active, current_period_end")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setActive(!!data?.active);
      setRenewsAt(data?.current_period_end ?? null);
    };
    load();

    const channel = supabase
      .channel(`kids-gold-banner-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kids_gold_pass_status", filter: `user_id=eq.${user.id}` },
        load,
      )
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [user?.id]);

  if (!active) return null;

  const renewLabel = renewsAt
    ? `Renews ${new Date(renewsAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`
    : null;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
        <Sparkles className="h-3 w-3" />
        Gold Pass · Unlimited
      </div>
    );
  }

  return (
    <div
      className="mx-auto max-w-5xl mb-4 rounded-xl border border-amber-300/70 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 p-3 md:p-4 shadow-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-amber-900">
              Gold Pass active
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
              <InfinityIcon className="h-3 w-3" />
              Unlimited
            </span>
          </div>
          <p className="text-xs md:text-sm text-amber-800/90 mt-0.5">
            {moduleName ? `${moduleName} is unlimited — ` : ""}
            no credits are deducted while your Gold Pass is active.
            {renewLabel ? <span className="text-amber-700/80"> · {renewLabel}</span> : null}
          </p>
        </div>
      </div>
    </div>
  );
};

export default KidsGoldPassBanner;
