import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  showMonetagRewarded,
  MONETAG_ZONES,
  loadMonetagZone,
  trackMonetagEvent,
} from "@/lib/monetag";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Fullscreen ad-break modal shown BEFORE and AFTER every game.
 *
 * Strategy (resilient against blocked/empty Monetag fills):
 *  1) Modal mounts -> immediately triggers Monetag rewarded interstitial.
 *  2) In parallel a 5s countdown runs. "Continue" appears after countdown.
 *  3) If Monetag returns/resolves earlier, we still hold the countdown so the
 *     user perceives a real break (otherwise empty fills look like nothing
 *     happened — the exact bug reported).
 *  4) Ad failures NEVER block the gate: countdown alone is enough to continue.
 *
 * Monetization side-effects:
 *  - Logs impression into `monetag_ad_events` (sub_id: game_pre / game_post)
 *    so the dashboard can attribute revenue to the games section.
 *  - Credits +1 XP per phase per day via award_xp (ref_id dedup prevents abuse).
 */
type Phase = "pre" | "post";

interface Props {
  phase: Phase;
  onClose: () => void;
  minSeconds?: number;
}

const XP_PER_GAME_AD = 1;

export const GameAdGateModal = ({ phase, onClose, minSeconds = 5 }: Props) => {
  const [remaining, setRemaining] = useState(minSeconds);
  const [adState, setAdState] = useState<"loading" | "playing" | "done" | "failed">("loading");
  const [xpAwarded, setXpAwarded] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const zoneId = MONETAG_ZONES.REWARDED_INTERSTITIAL;
    const subKey = phase === "pre" ? "game_pre" : "game_post";

    loadMonetagZone(zoneId);
    setAdState("playing");

    // 1) Log impression for Monetag revenue attribution.
    trackMonetagEvent("impression", zoneId, subKey);

    // 2) Trigger the rewarded ad + credit XP on completion (daily dedup).
    showMonetagRewarded(zoneId)
      .then(async (ok) => {
        setAdState(ok ? "done" : "failed");
        if (!ok) return;
        try {
          const { data: auth } = await supabase.auth.getUser();
          const uid = auth?.user?.id;
          if (!uid) return;
          const today = new Date().toISOString().slice(0, 10);
          const { error } = await supabase.rpc("award_xp", {
            _user_id: uid,
            _amount: XP_PER_GAME_AD,
            _source: `game_ad_${phase}`,
            _ref_id: `game_${phase}:${today}`, // 1 XP per phase per day
          });
          if (!error) {
            setXpAwarded(true);
            toast.success(`+${XP_PER_GAME_AD} XP for watching ad`);
          }
        } catch {
          // XP failure must never disrupt gameplay.
        }
      })
      .catch(() => setAdState("failed"));

    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);



  const canContinue = remaining === 0;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center text-white">
        <p className="text-xs uppercase tracking-widest text-white/60 mb-2">
          {phase === "pre" ? "Sponsored break before game" : "Thanks for playing — short ad"}
        </p>
        <h2 className="text-2xl font-bold mb-4">
          {adState === "failed" ? "Ad break" : "Loading sponsored ad…"}
        </h2>

        <div className="relative w-full aspect-video rounded-xl border border-white/20 bg-white/5 overflow-hidden mb-6 flex items-center justify-center">
          {adState === "failed" ? (
            <div className="text-white/70 text-sm px-4">
              Couldn’t load an ad right now. Enjoy a short break — it helps keep
              the games free.
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/80">
              <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span className="text-sm">Your ad is playing in the overlay…</span>
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={!canContinue}
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-white text-black font-bold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {canContinue
            ? phase === "pre"
              ? "Continue to game ▶"
              : "Back to games"
            : `Please wait… ${remaining}s`}
        </button>

        <p className="text-[10px] text-white/40 mt-3">
          Ads keep Unique games free. Thank you for supporting creators.
        </p>
      </div>
    </div>,
    document.body
  );
};
