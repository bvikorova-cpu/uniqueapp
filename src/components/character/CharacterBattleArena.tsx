import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Swords, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const CharacterBattleArena = () => {
  const [selectedChar1, setSelectedChar1] = useState<string | null>(null);
  const [selectedChar2, setSelectedChar2] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: characters } = useQuery({
    queryKey: ["characters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const battle = useMutation({
    mutationFn: async (data: { character1Id: string; character2Id: string }) => {
      const { data: result, error } = await supabase.functions.invoke('battle-characters', {
        body: data
      });

      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      setBattleResult(result);
      toast.success("Battle complete!");
      queryClient.invalidateQueries({ queryKey: ["characters"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start battle");
    },
  });

  const startBattle = () => {
    if (!selectedChar1 || !selectedChar2) {
      toast.error("Please select two characters");
      return;
    }

    if (selectedChar1 === selectedChar2) {
      toast.error("Cannot battle the same character");
      return;
    }

    battle.mutate({ character1Id: selectedChar1, character2Id: selectedChar2 });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Swords className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl font-bold text-foreground">Battle Arena</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-foreground font-bold text-base mb-3">Fighter 1</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {characters?.map((char) => (
                <Card
                  key={char.id}
                  className={`p-3 cursor-pointer transition-all border-2 ${
                    selectedChar1 === char.id
                      ? "bg-blue-100 dark:bg-blue-900 border-blue-500"
                      : "bg-muted/50 hover:bg-muted border-border"
                  }`}
                  onClick={() => setSelectedChar1(char.id)}
                >
                  <div className="flex items-center gap-3">
                    {char.image_url && (
                      <img src={char.image_url} alt={char.name} className="w-12 h-12 rounded object-cover" />
                    )}
                    <div>
                      <p className="text-foreground font-bold">{char.name}</p>
                      <p className="text-muted-foreground font-medium text-xs">Lvl {char.level} • {char.wins}W/{char.losses}L</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-foreground font-bold text-base mb-3">Fighter 2</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {characters?.map((char) => (
                <Card
                  key={char.id}
                  className={`p-3 cursor-pointer transition-all border-2 ${
                    selectedChar2 === char.id
                      ? "bg-red-100 dark:bg-red-900 border-red-500"
                      : "bg-muted/50 hover:bg-muted border-border"
                  }`}
                  onClick={() => setSelectedChar2(char.id)}
                >
                  <div className="flex items-center gap-3">
                    {char.image_url && (
                      <img src={char.image_url} alt={char.name} className="w-12 h-12 rounded object-cover" />
                    )}
                    <div>
                      <p className="text-foreground font-bold">{char.name}</p>
                      <p className="text-muted-foreground font-medium text-xs">Lvl {char.level} • {char.wins}W/{char.losses}L</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={startBattle}
          disabled={battle.isPending || !selectedChar1 || !selectedChar2}
          className="w-full mt-6"
          size="lg"
        >
          {battle.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Battle in Progress...
            </>
          ) : (
            <>
              <Swords className="mr-2 h-4 w-4" />
              Start Battle (2 credits)
            </>
          )}
        </Button>
      </Card>

      {battleResult && (
        <Card className="p-6 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400/50">
          <h3 className="text-2xl font-bold text-foreground mb-4">🏆 Battle Result</h3>
          <div className="mb-4">
            <p className="text-foreground text-lg">
              <span className="font-bold text-yellow-600 dark:text-yellow-400">{battleResult.winner.name}</span> defeats{" "}
              <span className="font-bold">{battleResult.loser.name}</span>!
            </p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-foreground whitespace-pre-wrap">{battleResult.commentary}</p>
          </div>
        </Card>
      )}
    </div>
  );
};
