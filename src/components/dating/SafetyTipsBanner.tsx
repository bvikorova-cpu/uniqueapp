import { useEffect, useState } from "react";
import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  matchId: string;
  partnerName?: string;
}

/**
 * One-time per-match contextual safety reminder shown above the chat input
 * before the user sends their first message. Dismissal is stored in
 * localStorage so it never reappears for the same match.
 */
export const SafetyTipsBanner = ({ matchId, partnerName }: Props) => {
  const key = `dating_safety_seen_${matchId}`;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!matchId) return;
    setShow(!localStorage.getItem(key));
  }, [matchId, key]);

  if (!show) return null;

  const dismiss = () => {
    localStorage.setItem(key, "1");
    setShow(false);
  };

  return (
    <div className="mx-3 mb-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-foreground/90 relative">
      <button
        onClick={dismiss}
        aria-label="Dismiss safety tips"
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="flex items-center gap-1.5 font-semibold text-amber-500 mb-1">
        <Shield className="h-3.5 w-3.5" /> Safety reminder
      </div>
      <p className="text-muted-foreground leading-relaxed">
        Before chatting with {partnerName || "this match"}: never share codes, passwords, or money.
        Meet first in a public place and tell a friend. Our AI scans messages for harassment in real time —
        you can report or block from the chat menu anytime.
      </p>
      <Button size="sm" variant="ghost" className="h-7 mt-2 px-2 text-xs" onClick={dismiss}>
        Got it
      </Button>
    </div>
  );
};
