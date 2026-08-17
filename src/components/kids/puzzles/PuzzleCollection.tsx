import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Loader2, Sparkles, Coins, ArrowLeft, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { KidsPuzzle, PIECE_COST, pieceStyle, totalPieces } from "@/data/kidsPuzzles";

interface Props {
  puzzle: KidsPuzzle;
  onBack: () => void;
}

/** Draw / board experience for a single kids puzzle — 1 credit per piece, ✓ keeps, ✗ releases. */
export const PuzzleCollection = ({ puzzle, onBack }: Props) => {
  const queryClient = useQueryClient();
  const total = totalPieces(puzzle);
  const slug = puzzle.slug;

  const [drawing, setDrawing] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [current, setCurrent] = useState<number | null>(null);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);

  const { data: owned = {}, isLoading } = useQuery({
    queryKey: ["puzzle-pieces-mine", slug],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {} as Record<number, number>;
      const { data, error } = await supabase
        .from("puzzle_piece_collection")
        .select("piece_index, copies")
        .eq("user_id", user.id)
        .eq("puzzle_slug", slug);
      if (error) throw error;
      const map: Record<number, number> = {};
      for (const r of (data ?? []) as { piece_index: number; copies: number }[]) {
        map[r.piece_index] = r.copies ?? 1;
      }
      return map;
    },
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`puzzle-pieces-${slug}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "puzzle_piece_collection" }, () => {
        queryClient.invalidateQueries({ queryKey: ["puzzle-pieces-mine", slug] });
        queryClient.invalidateQueries({ queryKey: ["puzzle-progress"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient, slug]);

  const uniqueOwned = useMemo(() => Object.keys(owned).length, [owned]);
  const totalOwned = useMemo(() => Object.values(owned).reduce((a, b) => a + b, 0), [owned]);
  const pct = Math.min(Math.round((uniqueOwned / total) * 100), 100);
  const complete = uniqueOwned >= total;

  const draw = async () => {
    setDrawing(true);
    setCurrent(null);
    try {
      const { data, error } = await (supabase as any).rpc("puzzle_draw_piece", {
        _puzzle_slug: slug,
        _total_pieces: total,
      });
      if (error) throw error;
      const res = data as { ok?: boolean; error?: string; piece_index?: number };
      if (!res?.ok) {
        toast.error(
          res?.error === "insufficient"
            ? "Not enough AI credits — top up to keep collecting."
            : res?.error === "not_authenticated"
              ? "Please sign in first."
              : "The draw failed, please try again.",
        );
        return;
      }
      setCurrent(res.piece_index ?? 0);
      window.dispatchEvent(new Event("ai-credits-updated"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "The draw failed, please try again.");
    } finally {
      setDrawing(false);
    }
  };

  const decide = async (keep: boolean) => {
    if (current === null) return;
    setExitDir(keep ? "right" : "left");
    if (!keep) {
      setTimeout(() => { setCurrent(null); setExitDir(null); }, 250);
      toast("Piece released — it stays in the box.", { icon: "🗑️" });
      return;
    }
    setDeciding(true);
    try {
      const { data, error } = await (supabase as any).rpc("puzzle_keep_piece", {
        _puzzle_slug: slug,
        _piece_index: current,
      });
      if (error) throw error;
      const res = data as { ok?: boolean; copies?: number; error?: string };
      if (!res?.ok) { toast.error("Could not save the piece."); setExitDir(null); return; }
      toast.success(
        (res.copies ?? 1) > 1
          ? `Piece #${current + 1} again — now ×${res.copies}`
          : `Piece #${current + 1} snapped into your board!`,
      );
      queryClient.invalidateQueries({ queryKey: ["puzzle-pieces-mine", slug] });
      setTimeout(() => { setCurrent(null); setExitDir(null); }, 250);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save the piece.");
      setExitDir(null);
    } finally {
      setDeciding(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="gap-2" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" /> All puzzles
      </Button>

      <Card className="p-4 sm:p-6 border-border/30 bg-card/90 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${puzzle.gradient} flex items-center justify-center text-2xl`}>
            {puzzle.emoji}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-black">{puzzle.title}</h2>
            <p className="text-xs text-muted-foreground">{puzzle.tagline}</p>
            <p className="text-[11px] text-muted-foreground/80">
              {puzzle.cols}×{puzzle.rows} · {total} puzzle pieces
            </p>
          </div>
          <Badge variant="outline" className="ml-auto gap-1 border-border/40">
            <Coins className="h-3 w-3" /> {PIECE_COST} cr / piece
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={pct} className="h-2 flex-1" />
          <span className="text-xs font-bold whitespace-nowrap">{uniqueOwned}/{total}</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          {totalOwned} piece{totalOwned === 1 ? "" : "s"} drawn in total (including duplicates)
        </p>
      </Card>

      {complete && (
        <Card className="p-4 border-2 border-emerald-400/60 bg-gradient-to-br from-emerald-500/15 to-green-400/10 flex items-center gap-3">
          <PartyPopper className="h-6 w-6 text-emerald-500" />
          <p className="text-sm font-bold text-emerald-600">
            Puzzle complete! The full picture is yours.
          </p>
        </Card>
      )}

      <Tabs defaultValue="draw">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="draw">Draw a piece</TabsTrigger>
          <TabsTrigger value="board">My board</TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="pt-4">
          <div className="max-w-sm mx-auto">
            <AnimatePresence mode="wait">
              {current !== null ? (
                <motion.div
                  key={`piece-${current}`}
                  initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{
                    opacity: 0,
                    x: exitDir === "left" ? -220 : exitDir === "right" ? 220 : 0,
                    rotate: exitDir === "left" ? -12 : 12,
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="overflow-hidden border-2 border-primary/30 bg-card/90 p-4">
                    <div
                      className="aspect-square w-full rounded-2xl border-2 border-white/60 shadow-lg"
                      style={pieceStyle(puzzle, current)}
                      role="img"
                      aria-label={`Puzzle piece number ${current + 1} of ${puzzle.title}`}
                    />
                    <div className="mt-3 text-center">
                      <p className="font-black">Piece #{current + 1}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {owned[current] ? `You already own this one (×${owned[current]})` : "A brand-new piece!"}
                      </p>
                    </div>
                  </Card>

                  <div className="flex justify-center gap-6 mt-4">
                    <Button
                      size="icon"
                      variant="outline"
                      disabled={deciding}
                      onClick={() => decide(false)}
                      className="h-16 w-16 rounded-full border-2 border-destructive/40"
                      aria-label="Release this puzzle piece"
                    >
                      <X className="h-7 w-7 text-destructive" />
                    </Button>
                    <Button
                      size="icon"
                      disabled={deciding}
                      onClick={() => decide(true)}
                      className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600"
                      aria-label="Keep this puzzle piece"
                    >
                      {deciding ? <Loader2 className="h-7 w-7 animate-spin" /> : <Check className="h-7 w-7" />}
                    </Button>
                  </div>
                  <p className="text-center text-[11px] text-muted-foreground mt-3">
                    ✓ snaps the piece into your board · ✗ puts it back in the box
                  </p>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="p-8 text-center border-dashed border-border/40 bg-card/70">
                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${puzzle.gradient} flex items-center justify-center mx-auto mb-4 text-4xl`}>
                      {puzzle.emoji}
                    </div>
                    <h3 className="font-black mb-1">Draw a {puzzle.title} piece</h3>
                    <p className="text-xs text-muted-foreground mb-5">
                      {PIECE_COST} AI credit per piece — any of the {total} pieces can appear, including ones you already own.
                    </p>
                    <Button onClick={draw} disabled={drawing} className="gap-2">
                      {drawing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {drawing ? "Drawing…" : `Draw for ${PIECE_COST} credit`}
                    </Button>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="board" className="pt-4">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <Card className="p-3 sm:p-4 border-border/30 bg-card/90">
              <div
                className="grid gap-[3px] rounded-2xl overflow-hidden bg-muted/60 p-[3px]"
                style={{ gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: total }, (_, i) => {
                  const count = owned[i] ?? 0;
                  return (
                    <div
                      key={i}
                      className={`relative aspect-square rounded-md ${count ? "" : "bg-muted"}`}
                      style={count ? pieceStyle(puzzle, i) : undefined}
                      role="img"
                      aria-label={count ? `Piece ${i + 1} collected` : `Piece ${i + 1} missing`}
                    >
                      {!count && (
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-muted-foreground/70">
                          {i + 1}
                        </span>
                      )}
                      {count > 1 && (
                        <Badge className="absolute bottom-0.5 right-0.5 h-4 px-1 text-[8px] bg-emerald-500 text-white">
                          ×{count}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 text-center">
                Grey tiles are pieces you still need — keep drawing to reveal the whole picture.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PuzzleCollection;
