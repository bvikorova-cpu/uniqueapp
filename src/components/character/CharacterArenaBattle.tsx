import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BattleArena } from "@/components/battle/BattleArena";
import { CharacterSelector } from "@/components/battle/CharacterSelector";
import { CharacterLeaderboard } from "@/components/battle/CharacterLeaderboard";
import { OpponentMatchmaker, type ArenaCharacter } from "@/components/battle/OpponentMatchmaker";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

/**
 * Interactive 1v1 battle flow used inside Character Arena.
 * Pick your fighter, swipe through random rivals from other players,
 * then either quick-resolve (✓) or play the full turn-based duel.
 */
export const CharacterArenaBattle = () => {
  const [characters, setCharacters] = useState<ArenaCharacter[]>([]);
  const [myFighter, setMyFighter] = useState<ArenaCharacter | null>(null);
  const [opponent, setOpponent] = useState<ArenaCharacter | null>(null);
  const [battleStarted, setBattleStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Please sign in to battle");
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from("characters")
          .select("id, name, image_url, hp, attack, defense, speed, category, level, experience, experience_to_next_level, wins, losses")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setCharacters((data || []) as ArenaCharacter[]);
      } catch {
        toast.error("Failed to load your warriors");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Card className="p-12 flex items-center justify-center border-border/30 bg-card/90">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </Card>
    );
  }

  if (battleStarted && myFighter && opponent) {
    return (
      <BattleArena
        character1={myFighter as any}
        character2={opponent as any}
        onBattleEnd={() => {
          setBattleStarted(false);
          setOpponent(null);
        }}
      />
    );
  }

  if (characters.length === 0) {
    return (
      <Card className="p-10 text-center border-border/30 bg-card/90 backdrop-blur-xl">
        <h2 className="text-xl font-black mb-2">No Fighters Yet</h2>
        <p className="text-muted-foreground text-sm">
          Forge at least one warrior to enter the arena and challenge other players.
        </p>
      </Card>
    );
  }

  return (
    <>
      <FloatingHowItWorks
        title="1v1 Battle — How it works"
        steps={[
          { title: "Pick your fighter", desc: "Choose one of your forged warriors." },
          { title: "Find a rival", desc: "Swipe random characters of other players: ✕ skip, ✓ fight." },
          { title: "Resolve", desc: "Quick match decides instantly by power level." },
          { title: "Full duel", desc: "Or play the turn-based battle with moves, energy and combos." },
        ]}
      />
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <CharacterSelector
          characters={characters as any}
          selectedCharacter={myFighter as any}
          onSelect={(c: any) => setMyFighter(c)}
          label="Your Fighter"
          position="left"
        />
        <OpponentMatchmaker
          myFighter={myFighter}
          onFight={(rival) => {
            setOpponent(rival);
            setBattleStarted(true);
          }}
        />
        <CharacterLeaderboard />
      </div>
    </>
  );
};
