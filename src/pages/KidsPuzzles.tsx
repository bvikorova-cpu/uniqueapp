import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Coins, Puzzle as PuzzleIcon, Sparkles } from "lucide-react";
import { KIDS_PUZZLES, PIECE_COST, PUZZLE_LEVELS, totalPieces, type KidsPuzzle } from "@/data/kidsPuzzles";
import { PuzzleCollection } from "@/components/kids/puzzles/PuzzleCollection";

const HIW_STEPS = [
  { title: "Pick a puzzle", desc: "Choose one of the illustrated kids puzzles." },
  { title: "Draw a piece", desc: `Every draw costs ${PIECE_COST} AI credit and reveals a random puzzle piece.` },
  { title: "Keep or release", desc: "Tap ✓ to snap the piece into your board or ✗ to put it back in the box." },
  { title: "Complete the picture", desc: "Collect every piece to reveal the whole artwork on your board." },
];

const KidsPuzzles = () => {
  const [active, setActive] = useState<string | null>(null);
  const [level, setLevel] = useState<KidsPuzzle["level"] | "all">("all");
  const puzzle = KIDS_PUZZLES.find((p) => p.slug === active) ?? null;
  const visible = level === "all" ? KIDS_PUZZLES : KIDS_PUZZLES.filter((p) => p.level === level);

  const { data: progress = {} } = useQuery({
    queryKey: ["puzzle-progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {} as Record<string, number>;
      const { data, error } = await supabase
        .from("puzzle_piece_collection")
        .select("puzzle_slug, piece_index")
        .eq("user_id", user.id);
      if (error) throw error;
      const map: Record<string, number> = {};
      for (const r of (data ?? []) as { puzzle_slug: string }[]) {
        map[r.puzzle_slug] = (map[r.puzzle_slug] ?? 0) + 1;
      }
      return map;
    },
    staleTime: 30 * 1000,
  });

  return (
    <div className="min-h-screen bg-background">
      <FloatingHowItWorks
        title="Kids Puzzles"
        intro="Collect puzzle pieces one credit at a time and rebuild the whole picture."
        steps={HIW_STEPS}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-6 mt-16">
        <div className="max-w-6xl mx-auto space-y-6">
          {puzzle ? (
            <PuzzleCollection puzzle={puzzle} onBack={() => setActive(null)} />
          ) : (
            <>
              <Card className="p-5 sm:p-7 border-2 border-primary/25 bg-gradient-to-br from-primary/10 via-card/80 to-accent/10 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <PuzzleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Kids Puzzles</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {KIDS_PUZZLES.length} illustrated puzzles · 16 to 144 pieces · {PIECE_COST} credit per piece · ✓ keep or ✗ release
                    </p>
                  </div>
                </div>
              </Card>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={level === "all" ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setLevel("all")}
                >
                  All ages
                </Button>
                {PUZZLE_LEVELS.map((l) => (
                  <Button
                    key={l.id}
                    variant={level === l.id ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setLevel(l.id)}
                    title={l.hint}
                  >
                    {l.label}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visible.map((p) => {
                  const total = totalPieces(p);
                  const ownedCount = progress[p.slug] ?? 0;
                  const pct = Math.min(Math.round((ownedCount / total) * 100), 100);
                  return (
                    <Card key={p.slug} className="overflow-hidden border-border/40 bg-card/90">
                      <div className="relative aspect-square bg-muted">
                        <img
                          src={p.image}
                          alt={`${p.title} kids puzzle artwork`}
                          loading="lazy"
                          width={1024}
                          height={1024}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-white/85 text-foreground border-0">
                          {ownedCount}/{total}
                        </Badge>
                        <Badge variant="outline" className="absolute top-2 left-2 gap-1 bg-white/85 border-0 text-foreground">
                          <Coins className="h-3 w-3" /> {PIECE_COST} cr
                        </Badge>
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-extrabold text-base">{p.emoji} {p.title}</h3>
                        <p className="text-xs text-muted-foreground">{p.tagline}</p>
                        <Progress value={pct} className="h-1.5" />
                        <p className="text-[11px] text-muted-foreground">
                          {p.cols}×{p.rows} grid · {total} pieces to collect
                        </p>
                        <Button className="w-full gap-2" size="sm" onClick={() => setActive(p.slug)}>
                          <Sparkles className="h-4 w-4" /> Open &amp; draw a piece
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default KidsPuzzles;
