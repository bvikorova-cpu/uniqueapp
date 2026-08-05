import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

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
  const [liveRequestAt, setLiveRequestAt] = useState(revealRequestAt);
  const [liveRequestBy, setLiveRequestBy] = useState(revealRequestBy);
  const [liveStatus, setLiveStatus] = useState(status);

  useEffect(() => setLiveRequestAt(revealRequestAt), [revealRequestAt]);
  useEffect(() => setLiveRequestBy(revealRequestBy), [revealRequestBy]);
  useEffect(() => setLiveStatus(status), [status]);

  useEffect(() => {
    const refresh = async () => {
      const { data } = await supabase
        .from("anonymous_dating_matches")
        .select("reveal_request_at, reveal_request_by, status")
        .eq("id", matchId)
        .maybeSingle();
      if (!data) return;
      setLiveRequestAt(data.reveal_request_at);
      setLiveRequestBy(data.reveal_request_by);
      setLiveStatus(data.status ?? "active");
    };

    refresh();
    const channel = supabase
      .channel(`reveal-lock:${matchId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "anonymous_dating_matches", filter: `id=eq.${matchId}` }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [matchId]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  if (liveStatus === "revealed") {
    return (
      <Card className="p-3 bg-gradient-to-br from-emerald-500/15 to-primary/15 border-emerald-500/40 text-center">
      <FloatingHowItWorks
        title={"Reveal Lock"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

        <p className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-2">
          <Eye className="h-4 w-4" /> Identities revealed ✨
        </p>
      </Card>
    );
  }

  const reqAt = liveRequestAt ? new Date(liveRequestAt).getTime() : null;
  const elapsed = reqAt ? now - reqAt : Infinity;
  const active = reqAt && elapsed < REVEAL_WINDOW_MS;
  const remaining = active ? Math.ceil((REVEAL_WINDOW_MS - elapsed) / 1000) : 0;
  const iRequested = liveRequestBy === currentUserId;
  const partnerRequested = active && !iRequested;

  const requestReveal = async () => {
    setBusy(true);
    const { data: current, error: stateError } = await supabase
      .from("anonymous_dating_matches")
      .select("reveal_request_at, reveal_request_by, status")
      .eq("id", matchId)
      .maybeSingle();

    if (stateError) {
      setBusy(false);
      toast({ title: "Reveal unavailable", description: stateError.message, variant: "destructive" });
      return;
    }

    const currentRequestTime = current?.reveal_request_at ? new Date(current.reveal_request_at).getTime() : 0;
    const partnerHasActiveRequest = current?.reveal_request_by
      && current.reveal_request_by !== currentUserId
      && Date.now() - currentRequestTime < REVEAL_WINDOW_MS;

    if (partnerHasActiveRequest) {
      const { data, error } = await supabase.rpc("anon_date_accept_reveal", { _match_id: matchId });
      setBusy(false);
      const res = data as { ok?: boolean; reason?: string } | null;
      if (error || !res?.ok) {
        toast({ title: "Reveal failed", description: error?.message ?? "The request expired. Please try again.", variant: "destructive" });
        return;
      }
      setLiveStatus("revealed");
      toast({ title: "Revealed!", description: "Both identities are now visible." });
      onRevealed?.();
      return;
    }

    const { data, error } = await supabase.rpc("anon_date_request_reveal", { _match_id: matchId });
    setBusy(false);
    const res = data as { ok?: boolean; reason?: string } | null;
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else if (!res?.ok) toast({ title: "Request changed", description: "Please tap once more to confirm the current reveal request." });
    else {
      const requestedAt = new Date().toISOString();
      setLiveRequestAt(requestedAt);
      setLiveRequestBy(currentUserId);
      toast({ title: "Reveal requested", description: `Waiting 60s for ${partnerName} to confirm…` });
    }
  };

  const acceptReveal = async () => {
    if (liveRequestBy === currentUserId) {
      toast({ title: "Waiting", description: "Only the other person can confirm your request." });
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.rpc("anon_date_accept_reveal", { _match_id: matchId });
    setBusy(false);
    const res = data as { ok?: boolean; reason?: string } | null;
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else if (!res?.ok) toast({ title: "No active request", description: "The reveal request expired — ask again.", variant: "destructive" });
    else { setLiveStatus("revealed"); toast({ title: "Revealed!", description: "Both identities are now visible." }); onRevealed?.(); }
  };

  const cancelReveal = async () => {
    setBusy(true);
    await supabase.rpc("anon_date_cancel_reveal", { _match_id: matchId });
    setBusy(false);
    setLiveRequestAt(null);
    setLiveRequestBy(null);
  };



  return (
    <Card className="p-3 bg-anon-date-gradient-soft border-anon-date">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold flex items-center gap-1.5">
          <Lock className="h-4 w-4 text-anon-date" /> Mutual Reveal
        </p>
        {active && (
          <motion.span
            key={remaining}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-xs font-mono font-bold text-anon-date"
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
            <Button onClick={requestReveal} disabled={busy} size="sm" className="w-full bg-anon-date-gradient">

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
            <p className="text-[11px] font-semibold text-anon-date mb-2">
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
