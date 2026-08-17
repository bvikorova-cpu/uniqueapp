import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Check, X, Coffee, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { CoffeeChat } from "./CoffeeChat";

const LIKE_COST = 2;

interface Candidate {
  user_id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  favorite_coffee_types: string[] | null;
  preferred_atmosphere: string[] | null;
  budget_preference: string | null;
  total_checkins: number | null;
}

/** Resolve a real display name from profile fields. */
function resolveName(fullName: string | null, username: string | null, email: string | null): string {
  if (fullName?.trim()) return fullName.trim();
  if (username?.trim()) return username.trim();
  if (email?.includes("@")) return email.split("@")[0];
  return "Coffee buddy";
}

/**
 * Dating-style swipe deck for "spoločné kávičkovanie".
 * ✓ costs LIKE_COST credits and instantly opens a chat with that person.
 * ✗ is free and just skips the candidate.
 */
export const CoffeeSwipeDeck = () => {
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [chatMatchId, setChatMatchId] = useState<string | null>(null);

  const { data: candidates = [], isLoading, refetch } = useQuery({
    queryKey: ["coffee-candidates"],
    queryFn: async (): Promise<Candidate[]> => {
      const { data, error } = await (supabase as any).rpc("coffee_discover_candidates", { _limit: 20 });
      if (error) throw error;
      return (data ?? []) as Candidate[];
    },
  });

  const current = candidates[index];

  const swipe = async (liked: boolean) => {
    if (!current || busy) return;
    setBusy(true);
    try {
      const { data, error } = await (supabase as any).rpc("coffee_swipe", {
        _target_user_id: current.user_id,
        _liked: liked,
        _cost: LIKE_COST,
      });
      if (error) throw error;

      if (liked && data?.insufficient_credits) {
        toast.error("Not enough credits", {
          description: `Opening a coffee chat costs ${LIKE_COST} credits.`,
          action: { label: "Top up", onClick: () => (window.location.href = "/ai-credits-store") },
        });
        return;
      }

      setIndex((i) => i + 1);

      if (liked && data?.match_id) {
        window.dispatchEvent(new Event("ai-credits-updated"));
        queryClient.invalidateQueries({ queryKey: ["coffee-chats"] });
        setChatMatchId(data.match_id as string);
        toast.success("Chat opened ☕", { description: `-${LIKE_COST} credits` });
      }
    } catch (e: any) {
      toast.error(e?.message || "Swipe failed");
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!current) {
    return (
      <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-amber-500/20">
        <Coffee className="h-10 w-10 text-amber-400 mx-auto mb-3" />
        <h3 className="font-bold mb-1">No more coffee buddies right now</h3>
        <p className="text-sm text-muted-foreground mb-4">Come back later or reload the deck.</p>
        <Button
          variant="outline"
          onClick={() => {
            setIndex(0);
            refetch();
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Reload deck
        </Button>
      </Card>
    );
  }

  const name = resolveName(current.full_name, current.username, current.email);

  return (
    <div className="max-w-md mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.user_id}
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border-amber-500/30">
            <div className="relative h-72 bg-gradient-to-br from-amber-500/25 via-amber-700/15 to-background flex items-center justify-center">
              <img
                src={
                  current.avatar_url ||
                  `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(current.user_id)}&backgroundColor=ffd5a3,f7c98b`
                }
                alt={`${name} profile photo`}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(current.user_id)}`;
                }}
              />

              <Badge className="absolute top-3 right-3 bg-amber-500/90 text-white border-0">
                ☕ {current.total_checkins ?? 0} check-ins
              </Badge>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <h3 className="text-xl font-black">{name}</h3>
                {current.bio && <p className="text-sm text-muted-foreground line-clamp-2">{current.bio}</p>}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(current.favorite_coffee_types ?? []).slice(0, 4).map((t) => (
                  <Badge key={t} variant="outline" className="border-amber-500/30 text-xs">
                    {t}
                  </Badge>
                ))}
                {(current.preferred_atmosphere ?? []).slice(0, 3).map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">
                    {t}
                  </Badge>
                ))}
                {current.budget_preference && (
                  <Badge variant="outline" className="text-xs">
                    {current.budget_preference}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-center gap-6 pt-2">
                <Button
                  size="icon"
                  variant="outline"
                  disabled={busy}
                  aria-label="Skip"
                  onClick={() => swipe(false)}
                  className="h-16 w-16 rounded-full border-2 border-destructive/40 hover:bg-destructive/10"
                >
                  <X className="h-7 w-7 text-destructive" />
                </Button>
                <Button
                  size="icon"
                  disabled={busy}
                  aria-label="Start coffee chat"
                  onClick={() => swipe(true)}
                  className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700"
                >
                  {busy ? <Loader2 className="h-7 w-7 animate-spin" /> : <Check className="h-7 w-7" />}
                </Button>
              </div>
              <p className="text-center text-[11px] text-muted-foreground">
                ✓ opens a chat for {LIKE_COST} credits · ✗ is free
              </p>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <CoffeeChat
        matchId={chatMatchId}
        open={!!chatMatchId}
        onOpenChange={(o) => {
          if (!o) setChatMatchId(null);
        }}
      />
    </div>
  );
};
