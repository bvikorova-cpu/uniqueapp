import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Trophy } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface BattleVotingProps {
  battle: any;
  onVoteSuccess: () => void;
}

export function BattleVoting({ battle, onVoteSuccess }: BattleVotingProps) {
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (participantId: string) => {
    setIsVoting(true);
    try {
      const { data, error } = await supabase.functions.invoke("comedy-battle-vote", {
        body: { battleId: battle.id, participantId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Vote Cast!", description: "Your vote has been counted." });
      onVoteSuccess();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to cast vote",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Battle Voting - How it works"} steps={[{ title: 'Open', desc: 'Access the Battle Voting section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Battle Voting.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <p className="font-bold">Vote for your favorite comedian (10 coins per vote)</p>
      </div>
      {battle.battle_participants?.map((participant: any) => (
        <Card key={participant.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                {participant.comedian?.stage_name?.charAt(0) || "?"}
              </div>
              <div>
                <p className="font-bold text-lg">{participant.comedian?.stage_name}</p>
                <p className="text-sm text-muted-foreground">
                  {participant.vote_count || 0} votes
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleVote(participant.id)}
              disabled={isVoting}
              size="lg"
            >
              {isVoting ? "Voting..." : "Vote (10 coins)"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
    </>
  );
}
