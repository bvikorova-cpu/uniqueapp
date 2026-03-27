import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ThumbsUp, 
  Star, 
  Users, 
  Trophy,
  Sparkles
} from "lucide-react";

interface Contestant {
  id: string;
  name: string;
  avatar?: string;
  votes: number;
  percentage: number;
}

interface LiveVotingProps {
  contestants?: Contestant[];
  totalVotes?: number;
  isVotingOpen?: boolean;
  onVote?: (contestantId: string) => void;
  userVotedFor?: string | null;
}

export const LiveVoting = ({
  contestants = [],
  totalVotes = 0,
  isVotingOpen = true,
  onVote,
  userVotedFor = null,
}: LiveVotingProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(userVotedFor);
  const [hasVoted, setHasVoted] = useState(!!userVotedFor);

  const handleVote = (contestantId: string) => {
    if (hasVoted || !isVotingOpen) return;
    setSelectedId(contestantId);
    setHasVoted(true);
    onVote?.(contestantId);
  };

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Live Voting
          </span>
          <Badge variant={isVotingOpen ? "default" : "secondary"}>
            {isVotingOpen ? (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Open
              </span>
            ) : (
              "Closed"
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{totalVotes.toLocaleString()} votes</span>
        </div>

        {contestants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No contestants yet</p>
            <p className="text-xs mt-1">Voting will start when the contest begins</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {contestants.map((contestant, index) => (
                <motion.div
                  key={contestant.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-4 rounded-xl border transition-all ${
                    selectedId === contestant.id
                      ? "border-primary bg-primary/10"
                      : "border-border/30 hover:border-primary/50 bg-muted/20"
                  } ${hasVoted && selectedId !== contestant.id ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{contestant.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {contestant.votes.toLocaleString()} votes
                        </p>
                      </div>
                    </div>
                    
                    {!hasVoted && isVotingOpen ? (
                      <Button
                        size="sm"
                        variant={selectedId === contestant.id ? "default" : "outline"}
                        onClick={() => handleVote(contestant.id)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Vote
                      </Button>
                    ) : selectedId === contestant.id ? (
                      <Badge className="bg-primary">
                        <Star className="h-3 w-3 mr-1" />
                        Your Vote
                      </Badge>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <Progress value={contestant.percentage} className="h-2" />
                    <p className="text-xs text-right text-muted-foreground">
                      {contestant.percentage}%
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {hasVoted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-4 bg-primary/10 rounded-xl"
          >
            <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="font-medium">Thanks for your vote!</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveVoting;
