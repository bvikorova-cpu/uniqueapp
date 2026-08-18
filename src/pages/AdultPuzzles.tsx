import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Coins, Info, Puzzle as PuzzleIcon, Sparkles } from "lucide-react";
import {
  ADULT_PUZZLES,
  ADULT_PUZZLE_CATEGORIES,
  ADULT_PUZZLE_LEVELS,
  ADULT_PIECE_COST,
  type AdultPuzzle,
} from "@/data/adultPuzzles";
import { totalPieces, type KidsPuzzle } from "@/data/kidsPuzzles";
import { PuzzleCollection } from "@/components/kids/puzzles/PuzzleCollection";

const HIW_STEPS = [
  { title: "Pick a puzzle", desc: "Choose from 60+ adult puzzles — landscapes, cities, animals, art and more." },
  { title: "Draw a piece", desc: `Every draw costs ${ADULT_PIECE_COST} AI credit and reveals a random puzzle piece.` },
  { title: "Keep or recycle", desc: "Tap ✓ to snap the piece into your board or ✗ to move it to the Scrap box." },
  { title: "Recycle for credits", desc: "Recycle 10 pieces from your Scrap box and get 1 AI credit back." },
  { title: "Complete the picture", desc: "Collect every piece — up to 400 — to reveal the full artwork." },
];

const AdultPuzzles = () => {
  const [active, setActive] = useState<string | null>(null);
  const [level, setLevel] = useState<AdultPuzzle["level"] | "all">("all");
  const [category, setCategory] = useState<string>("all");

  const puzzle = ADULT_PUZZLES.find((p) => p.slug === active) ?? null;
  const visible = ADULT_PUZZLES.filter(
    (p) => (level === "all" || p.level === level) && (category === "all" || p.category === category),
  );

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
        title="Adult Puzzles"
        intro="Collect puzzle pieces one credit at a time and rebuild demanding artworks."
        steps={HIW_STEPS}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-6 mt-16">
        <div className="max-w-6xl mx-auto space-y-6">
          {puzzle ? (
            <PuzzleCollection
              puzzle={puzzle as unknown as KidsPuzzle}
              onBack={() => setActive(null)}
            />
          ) : (
            <>
              <Card className="p-5 sm:p-7 border-2 border-primary/25 bg-gradient-to-br from-primary/10 via-card/80 to-accent/10 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <PuzzleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Adult Puzzles</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {ADULT_PUZZLES.length} puzzles · 64 to 400 pieces · {ADULT_PIECE_COST} credit per piece · ✓ keep or ✗ release
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-5 border border-primary/20 bg-card/80">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-4 w-4 text-primary" />
                  <h2 className="font-bold text-sm">How it works</h2>
                </div>
                <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {HIW_STEPS.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-black text-primary">{i + 1}.</span>
                      <span>
                        <strong className="text-foreground">{s.title}</strong> — {s.desc}
                      </span>
                    </li>
                  ))}
                </ol>
              </Card>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={level === "all" ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setLevel("all")}
                  >
                    All levels
                  </Button>
                  {ADULT_PUZZLE_LEVELS.map((l) => (
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
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={category === "all" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setCategory("all")}
                  >
                    All themes
                  </Button>
                  {ADULT_PUZZLE_CATEGORIES.map((c) => (
                    <Button
                      key={c}
                      variant={category === c ? "secondary" : "ghost"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visible.map((p) => {
                  const total = totalPieces(p as unknown as KidsPuzzle);
                  const ownedCount = progress[p.slug] ?? 0;
                  const pct = Math.min(Math.round((ownedCount / total) * 100), 100);
                  return (
                    <Card key={p.slug} className="overflow-hidden border-border/40 bg-card/90">
                      <div className="relative aspect-square bg-muted">
                        <img
                          src={p.image}
                          alt={`${p.title} puzzle artwork for adults`}
                          loading="lazy"
                          width={1024}
                          height={1024}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-white/85 text-foreground border-0">
                          {ownedCount}/{total}
                        </Badge>
                        <Badge variant="outline" className="absolute top-2 left-2 gap-1 bg-white/85 border-0 text-foreground">
                          <Coins className="h-3 w-3" /> {ADULT_PIECE_COST} cr
                        </Badge>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-extrabold text-base">{p.emoji} {p.title}</h3>
                          <Badge variant="secondary" className="shrink-0 text-[10px]">{p.category}</Badge>
                        </div>
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

export default AdultPuzzles;
