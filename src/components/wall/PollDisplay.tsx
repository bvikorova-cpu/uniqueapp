import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePolls } from "@/hooks/usePolls";
import { supabase } from "@/integrations/supabase/client";

interface PollDisplayProps {
  postId: string;
}

export const PollDisplay = ({ postId }: PollDisplayProps) => {
  const { poll, options, userVote, votePoll } = usePolls(postId);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUserId();
  }, []);

  if (!poll) return null;

  const totalVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0);

  const getPercentage = (voteCount: number) => {
    if (totalVotes === 0) return 0;
    return (voteCount / totalVotes) * 100;
  };

  const handleVote = (optionId: string) => {
    if (!poll.id || userVote) return;
    votePoll({ pollId: poll.id, optionId });
  };

  const hasExpired = poll.ends_at && new Date(poll.ends_at) < new Date();

  return (
    <div className="mt-4 p-4 border rounded-lg space-y-3">
      <h4 className="font-semibold">{poll.question}</h4>
      <div className="space-y-2">
        {options.map((option) => {
          const percentage = getPercentage(option.vote_count);
          const isSelected = userVote?.option_id === option.id;

          return (
            <div key={option.id}>
              <Button
                variant={isSelected ? "default" : "outline"}
                className="w-full justify-start mb-1"
                onClick={() => handleVote(option.id)}
                disabled={!!userVote || hasExpired || !currentUserId}
              >
                {option.option_text}
                {userVote && (
                  <span className="ml-auto">
                    {option.vote_count} ({percentage.toFixed(0)}%)
                  </span>
                )}
              </Button>
              {userVote && (
                <Progress value={percentage} className="h-2" />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
        {hasExpired && " • Poll ended"}
      </p>
    </div>
  );
};
