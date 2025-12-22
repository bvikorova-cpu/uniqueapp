import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ThumbsUp, 
  ThumbsDown, 
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

const defaultContestants: Contestant[] = [
  { id: "1", name: "Mária K.", votes: 3420, percentage: 35 },
  { id: "2", name: "Peter S.", votes: 2890, percentage: 30 },
  { id: "3", name: "Anna M.", votes: 2100, percentage: 22 },
  { id: "4", name: "Ján H.", votes: 1250, percentage: 13 },
];

export const LiveVoting = ({
  contestants = defaultContestants,
  totalVotes = 9660,
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Live Hlasovanie
          </span>
          <Badge variant={isVotingOpen ? "default" : "secondary"}>
            {isVotingOpen ? (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Otvorené
              </span>
            ) : (
              "Zatvorené"
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Votes */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{totalVotes.toLocaleString()} hlasov</span>
        </div>

        {/* Contestants */}
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
                    : "border-border hover:border-primary/50"
                } ${hasVoted && selectedId !== contestant.id ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{contestant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {contestant.votes.toLocaleString()} hlasov
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
                      Hlasovať
                    </Button>
                  ) : selectedId === contestant.id ? (
                    <Badge className="bg-primary">
                      <Star className="h-3 w-3 mr-1" />
                      Váš hlas
                    </Badge>
                  ) : null}
                </div>

                {/* Progress Bar */}
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

        {hasVoted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-4 bg-primary/10 rounded-lg"
          >
            <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="font-medium">Ďakujeme za váš hlas!</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveVoting;
