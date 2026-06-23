import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { showMonetagRewarded, MONETAG_ZONES, loadMonetagZone } from "@/lib/monetag";

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
 */
type Phase = "pre" | "post";

interface Props {
  phase: Phase;
  onClose: () => void;
  minSeconds?: number;
}

export const GameAdGateModal = ({ phase, onClose, minSeconds = 5 }: Props) => {
  const [remaining, setRemaining] = useState(minSeconds);
  const [adState, setAdState] = useState<"loading" | "playing" | "done" | "failed">("loading");
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    loadMonetagZone(MONETAG_ZONES.REWARDED_INTERSTITIAL);
    setAdState("playing");

    showMonetagRewarded()
      .then((ok) => setAdState(ok ? "done" : "failed"))
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
  }, []);

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
