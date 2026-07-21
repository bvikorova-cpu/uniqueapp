import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, RotateCw, Sparkles, Trophy } from "lucide-react";
import { useClubMembership } from "@/hooks/useClubMembership";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

export default function ClubCard() {
  const navigate = useNavigate();
  const { membership, loading, isMember } = useClubMembership();
  const [flipped, setFlipped] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <Skeleton className="h-96 max-w-md mx-auto rounded-3xl" />
      </div>
    );
  }

  if (!isMember || !membership) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4">
        <Crown className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-black">No membership yet</h1>
        <Button onClick={() => navigate("/club")}>Join the Unique Club</Button>
      </div>
    );
  }

  const memberNum = String(membership.member_number).padStart(4, "0");

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-pink-950 to-amber-950 p-6 flex flex-col items-center pt-16">
      <Button variant="ghost" className="text-white self-start mb-4" onClick={() => navigate("/club")}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <h1 className="text-3xl font-black text-white mb-2">Your Unique Club Card</h1>
      <p className="text-white/70 mb-8 text-sm">Tap the card to flip</p>

      <div className="perspective-1000 w-full max-w-md" style={{ perspective: 1000 }}>
        <motion.div
          className="relative w-full aspect-[1.586/1] cursor-pointer"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.7, type: "spring" }}
          onClick={() => setFlipped((f) => !f)}
        >
          {/* FRONT */}
          <div
            className="absolute inset-0 rounded-3xl p-6 flex flex-col justify-between shadow-2xl"
            style={{
              backfaceVisibility: "hidden",
              background:
                "linear-gradient(135deg, #7c3aed 0%, #ec4899 45%, #f59e0b 100%)",
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-white/70 text-xs uppercase tracking-widest">Unique Club</div>
                <div className="text-white text-2xl font-black" style={{ fontFamily: "Lobster Two, cursive" }}>
                  Unique
                </div>
              </div>
              <Crown className="h-8 w-8 text-yellow-300 drop-shadow" />
            </div>

            <div className="text-white">
              <div className="text-white/70 text-[10px] uppercase tracking-widest">Member №</div>
              <div className="text-3xl md:text-4xl font-black tracking-wider">#{memberNum}</div>
            </div>

            <div className="flex justify-between items-end text-white text-xs">
              <div>
                <div className="text-white/60 uppercase text-[9px]">Holder</div>
                <div className="font-semibold truncate max-w-[10rem]">{email ?? "—"}</div>
              </div>
              <div className="text-right">
                <div className="text-white/60 uppercase text-[9px]">
                  {membership.tier === "physical" ? "Physical NFC" : "Digital"}
                </div>
                {membership.is_founding && (
                  <div className="flex items-center gap-1 text-yellow-300 font-bold">
                    <Trophy className="h-3 w-3" /> FOUNDING
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 rounded-3xl p-6 flex flex-col justify-between shadow-2xl bg-gradient-to-br from-slate-900 to-purple-950 border border-white/10"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="h-10 bg-black -mx-6 my-2" />
            <div className="text-white/80 text-xs space-y-1">
              <div>Member: <strong className="text-white">#{memberNum}</strong></div>
              <div>Since: {new Date(membership.started_at).toLocaleDateString()}</div>
              <div>Renews: {membership.current_period_end ? new Date(membership.current_period_end).toLocaleDateString() : "—"}</div>
            </div>
            <div className="text-white/60 text-[10px] leading-tight">
              This card entitles the holder to all Unique Club benefits. Powered by love, supporting good causes. uniqueapp.fun
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8 flex gap-2 flex-wrap justify-center">
        <Button variant="secondary" onClick={() => setFlipped((f) => !f)}>
          <RotateCw className="h-4 w-4 mr-2" /> Flip card
        </Button>
        <Button
          variant="outline"
          className="text-white border-white/40 bg-white/10 hover:bg-white/20"
          onClick={() => window.print()}
        >
          <Sparkles className="h-4 w-4 mr-2" /> Save / Print
        </Button>
      </div>
    </div>
  );
}
