import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  matchId: string;
  currentUserId: string;
  partnerName: string;
  revealRequestAt: string | null;
  revealRequestBy: string | null;
  status: string;
  onRevealed?: () => void;
}

const REVEAL_WINDOW_MS = 60_000;

export const RevealLock = ({ matchId, currentUserId, partnerName, revealRequestAt, revealRequestBy, status, onRevealed }: Props) => {
  const { toast } = useToast();
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  if (status === "revealed") {
    return (
      <Card className="p-3 bg-gradient-to-br from-emerald-500/15 to-primary/15 border-emerald-500/40 text-center">
        <p className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-2">
          <Eye className="h-4 w-4" /> Identities revealed ✨
        </p>
      </Card>
    );
  }

  const reqAt = revealRequestAt ? new Date(revealRequestAt).getTime() : null;
  const elapsed = reqAt ? now - reqAt : Infinity;
  const active = reqAt && elapsed < REVEAL_WINDOW_MS;
  const remaining = active ? Math.ceil((REVEAL_WINDOW_MS - elapsed) / 1000) : 0;
  const iRequested = revealRequestBy === currentUserId;
  const partnerRequested = active && !iRequested;

  const requestReveal = async () => {
    setBusy(true);
    // Optimistic lock: only succeeds if nobody else has an active request.
    // Treats requests older than REVEAL_WINDOW as stale and overwritable.
    const staleCutoff = new Date(Date.now() - REVEAL_WINDOW_MS).toISOString();
    const { data, error } = await supabase
      .from("anonymous_dating_matches")
      .update({ reveal_request_at: new Date().toISOString(), reveal_request_by: currentUserId })
      .eq("id", matchId)
      .eq("status", "active")
      .or(`reveal_request_at.is.null,reveal_request_at.lt.${staleCutoff}`)
      .select("id")
      .maybeSingle();
    setBusy(false);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else if (!data) toast({ title: "Already requested", description: `${partnerName} just sent a request — confirm it instead.` });
    else toast({ title: "Reveal requested", description: `Waiting 60s for ${partnerName} to confirm…` });
  };

  const acceptReveal = async () => {
    setBusy(true);
    // DB trigger enforces mutual reveal; we also guard client-side to avoid
    // self-accept races (only the *other* user may accept).
    if (revealRequestBy === currentUserId) {
      setBusy(false);
      toast({ title: "Waiting", description: "Only the other person can confirm your request." });
      return;
    }
    const { error } = await supabase
      .from("anonymous_dating_matches")
      .update({
        status: "revealed",
        revealed_at: new Date().toISOString(),
        user1_revealed: true,
        user2_revealed: true,
      })
      .eq("id", matchId)
      .eq("status", "active")
      .neq("reveal_request_by", currentUserId);
    setBusy(false);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Revealed!", description: "Both identities are now visible." }); onRevealed?.(); }
  };

  const cancelReveal = async () => {
    setBusy(true);
    // Only the requester may clear their own pending request.
    await supabase
      .from("anonymous_dating_matches")
      .update({ reveal_request_at: null, reveal_request_by: null })
      .eq("id", matchId)
      .eq("reveal_request_by", currentUserId);
    setBusy(false);
  };


  return (
    <Card className="p-3 bg-gradient-to-br from-pink-500/10 via-card/80 to-primary/10 border-pink-500/30">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold flex items-center gap-1.5">
          <Lock className="h-4 w-4 text-pink-400" /> Mutual Reveal
        </p>
        {active && (
          <motion.span
            key={remaining}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-xs font-mono font-bold text-pink-400"
          >
            {remaining}s
          </motion.span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!active && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-[11px] text-muted-foreground mb-2">
              Both must confirm within 60 seconds for identities to reveal.
            </p>
            <Button onClick={requestReveal} disabled={busy} size="sm" className="w-full bg-gradient-to-r from-pink-500 to-primary">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Eye className="h-4 w-4 mr-2" /> Request reveal</>}
            </Button>
          </motion.div>
        )}

        {active && iRequested && (
          <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-[11px] text-muted-foreground mb-2">Waiting for {partnerName} to confirm…</p>
            <Button onClick={cancelReveal} disabled={busy} variant="outline" size="sm" className="w-full">Cancel</Button>
          </motion.div>
        )}

        {active && partnerRequested && (
          <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <p className="text-[11px] font-semibold text-pink-300 mb-2">
              {partnerName} wants to reveal! Confirm within {remaining}s
            </p>
            <div className="flex gap-2">
              <Button onClick={cancelReveal} variant="outline" size="sm" className="flex-1">Decline</Button>
              <Button onClick={acceptReveal} disabled={busy} size="sm" className="flex-1 bg-gradient-to-r from-emerald-500 to-primary">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reveal!"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
