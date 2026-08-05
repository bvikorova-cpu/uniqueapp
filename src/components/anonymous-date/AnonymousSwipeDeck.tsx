import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, Loader2, RefreshCw, Lock, Sparkles, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AnonymousAvatar } from "./AnonymousAvatar";

export interface DeckCandidate {
  user_id: string;
  anonymous_name: string;
  age_range: string | null;
  gender: string | null;
  location: string | null;
  interests: string[] | null;
  personality_traits: string[] | null;
  relationship_goal: string | null;
  looking_for: string | null;
  has_photo: boolean;
}

interface Props {
  onMatched?: (matchId: string, partnerName: string) => void;
}

const SWIPE_THRESHOLD = 110;

export const AnonymousSwipeDeck = ({ onMatched }: Props) => {
  const { toast } = useToast();
  const [deck, setDeck] = useState<DeckCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_anon_date_deck", { _limit: 20 });
    setLoading(false);
    if (error) {
      toast({ title: "Could not load the deck", description: error.message, variant: "destructive" });
      return;
    }
    setDeck((data ?? []) as DeckCandidate[]);
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const current = deck[0];
  const next = deck[1];

  const swipe = useCallback(
    async (direction: "like" | "pass") => {
      if (!current || busy) return;
      setBusy(true);
      setExitDir(direction === "like" ? "right" : "left");

      const { data, error } = await supabase.rpc("anon_date_swipe", {
        _target: current.user_id,
        _direction: direction,
      });

      setDeck((prev) => prev.slice(1));
      setExitDir(null);
      setBusy(false);

      if (error) {
        toast({ title: "Swipe failed", description: error.message, variant: "destructive" });
        return;
      }

      const result = data as { matched?: boolean; match_id?: string | null } | null;
      if (result?.matched && result.match_id) {
        toast({
          title: "It's a match! 💜",
          description: `You and ${current.anonymous_name} liked each other — start chatting anonymously.`,
        });
        onMatched?.(result.match_id, current.anonymous_name);
      }
    },
    [current, busy, toast, onMatched],
  );

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) swipe("like");
    else if (info.offset.x < -SWIPE_THRESHOLD) swipe("pass");
  };

  const revealNote = useMemo(
    () => "Photos stay hidden. After a match, the photo unlocks automatically in 7 days — or earlier for 5 credits.",
    [],
  );

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-anon-date-gradient-soft border-anon-date">
        <div className="flex items-start gap-3">
          <EyeOff className="h-5 w-5 text-anon-date mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold">Anonymous swiping</p>
            <p className="text-xs text-muted-foreground">{revealNote}</p>
          </div>
        </div>
      </Card>

      <div className="relative h-[460px] sm:h-[500px] w-full max-w-sm mx-auto">
        {loading && (
          <Card className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-anon-date" />
          </Card>
        )}

        {!loading && !current && (
          <Card className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <Sparkles className="h-8 w-8 text-anon-date" />
            <p className="text-sm font-semibold">No more profiles right now</p>
            <p className="text-xs text-muted-foreground">
              Come back later — new anonymous members join every day.
            </p>
            <Button size="sm" variant="outline" onClick={load} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </Card>
        )}

        {/* Card behind, for depth */}
        {next && (
          <Card className="absolute inset-0 scale-[0.96] translate-y-2 opacity-60 pointer-events-none" />
        )}

        <AnimatePresence>
          {current && (
            <motion.div
              key={current.user_id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={onDragEnd}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                x: exitDir === "right" ? 400 : exitDir === "left" ? -400 : 0,
                opacity: 0,
                rotate: exitDir === "right" ? 14 : exitDir === "left" ? -14 : 0,
              }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              <Card className="h-full p-5 flex flex-col items-center text-center bg-card border-anon-date overflow-y-auto">
                <div className="relative mb-3">
                  <AnonymousAvatar seed={current.anonymous_name} size={112} />
                  <span className="absolute -bottom-1 -right-1 rounded-full bg-background border border-anon-date p-1">
                    <Lock className="h-3.5 w-3.5 text-anon-date" />
                  </span>
                </div>

                <h3 className="text-lg font-bold">{current.anonymous_name}</h3>
                <p className="text-xs text-muted-foreground">
                  {[current.age_range, current.gender, current.location].filter(Boolean).join(" · ") || "Anonymous member"}
                </p>

                {current.relationship_goal && (
                  <Badge variant="secondary" className="mt-2 capitalize text-[11px]">
                    {current.relationship_goal}
                  </Badge>
                )}

                {current.looking_for && (
                  <p className="mt-3 text-xs text-muted-foreground line-clamp-4">{current.looking_for}</p>
                )}

                {!!current.interests?.length && (
                  <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                    {current.interests.slice(0, 8).map((i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">
                        {i}
                      </Badge>
                    ))}
                  </div>
                )}

                {!!current.personality_traits?.length && (
                  <div className="mt-2 flex flex-wrap gap-1.5 justify-center">
                    {current.personality_traits.slice(0, 5).map((t) => (
                      <Badge key={t} className="text-[10px] bg-anon-date-gradient">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="mt-auto pt-4 text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <EyeOff className="h-3.5 w-3.5" />
                  {current.has_photo ? "Photo hidden until reveal" : "No photo added yet"}
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {current && (
        <div className="flex items-center justify-center gap-6">
          <Button
            size="icon"
            variant="outline"
            disabled={busy}
            onClick={() => swipe("pass")}
            aria-label="Pass"
            className="h-14 w-14 rounded-full border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <X className="h-6 w-6" />
          </Button>
          <Button
            size="icon"
            disabled={busy}
            onClick={() => swipe("like")}
            aria-label="Like"
            className="h-14 w-14 rounded-full bg-anon-date-gradient"
          >
            {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <Heart className="h-6 w-6" />}
          </Button>
        </div>
      )}

      <p className="text-center text-[11px] text-muted-foreground">
        Swipe right to like, left to pass. Liking is free — a match happens only when it's mutual.
      </p>
    </div>
  );
};
