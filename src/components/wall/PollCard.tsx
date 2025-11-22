import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePolls } from "@/hooks/usePolls";
import { CheckCircle2 } from "lucide-react";

interface PollCardProps {
  postId: string;
}

export const PollCard = ({ postId }: PollCardProps) => {
  const { poll, options, userVote, votePoll } = usePolls(postId);

  if (!poll) return null;

  const totalVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0);
  const hasEnded = new Date(poll.ends_at) < new Date();
  const hasVoted = !!userVote;

  const handleVote = (optionId: string) => {
    if (hasEnded || hasVoted) return;
    votePoll({ pollId: poll.id, optionId });
  };

  return (
    <Card className="p-4 space-y-3">
      <h4 className="font-semibold text-foreground">{poll.question}</h4>
      
      <div className="space-y-2">
        {options.map((option) => {
          const percentage = totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 0;
          const isVoted = userVote?.option_id === option.id;
          
          return (
            <div key={option.id} className="space-y-1">
              <Button
                variant={hasVoted || hasEnded ? "ghost" : "outline"}
                className="w-full justify-between relative overflow-hidden"
                onClick={() => handleVote(option.id)}
                disabled={hasVoted || hasEnded}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {option.option_text}
                  {isVoted && <CheckCircle2 className="w-4 h-4" />}
                </span>
                {(hasVoted || hasEnded) && (
                  <>
                    <span className="relative z-10 text-sm text-muted-foreground">
                      {percentage.toFixed(0)}%
                    </span>
                    <div 
                      className="absolute left-0 top-0 h-full bg-primary/10 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>
      
      <div className="text-sm text-muted-foreground flex justify-between">
        <span>{totalVotes} votes</span>
        <span>{hasEnded ? "Poll ended" : "Poll active"}</span>
      </div>
    </Card>
  );
};
