import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Swords, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Submission {
  id: string;
  title: string;
  media_url: string;
  media_type: "image" | "video";
}

interface Match {
  id: string;
  round: number;
  match_index: number;
  votes_a: number;
  votes_b: number;
  status: "open" | "closed";
  winner_submission_id: string | null;
  submission_a: Submission | null;
  submission_b: Submission | null;
}

interface BracketData {
  id: string;
  category: string;
  status: "active" | "completed";
  current_round: number;
  rounds_total: number;
  winner_submission_id: string | null;
  matches: Match[];
}

interface Props {
  category: string;
}

export const MegatalentBracket = ({ category }: Props) => {
  const [bracket, setBracket] = useState<BracketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [myVotes, setMyVotes] = useState<Record<string, "a" | "b">>({});
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      // Try to ensure a bracket exists for this week
      await supabase.rpc("generate_megatalent_bracket", { _category: category });
      const { data, error } = await supabase.rpc("get_megatalent_bracket", { _category: category });
      if (error) throw error;
      setBracket(data as unknown as BracketData);

      const { data: ures } = await supabase.auth.getUser();
      if (ures.user && data) {
        const matchIds = (data as any).matches?.map((m: Match) => m.id) ?? [];
        if (matchIds.length) {
          const { data: votes } = await supabase
            .from("megatalent_bracket_votes")
            .select("match_id, voted_for")
            .in("match_id", matchIds);
          const map: Record<string, "a" | "b"> = {};
          votes?.forEach((v: any) => (map[v.match_id] = v.voted_for));
          setMyVotes(map);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [category]);

  const vote = async (matchId: string, side: "a" | "b") => {
    setVoting(matchId);
    try {
      const { error } = await supabase.functions.invoke("vote-megatalent-bracket", {
        body: { match_id: matchId, voted_for: side },
      });
      if (error) throw error;
      setMyVotes((prev) => ({ ...prev, [matchId]: side }));
      toast({ title: "Vote counted!" });
      load();
    } catch (e: any) {
      toast({
        title: "Could not vote",
        description: e?.message ?? "Try again",
        variant: "destructive",
      });
    } finally {
      setVoting(null);
    }
  };

  if (loading || !bracket) return null;

  const rounds = Array.from({ length: bracket.rounds_total }, (_, i) => i + 1);
  const roundLabel = (r: number) => {
    const remaining = bracket.rounds_total - r + 1;
    if (remaining === 1) return "Finals";
    if (remaining === 2) return "Semifinals";
    if (remaining === 3) return "Quarterfinals";
    return `Round ${r}`;
  };

  return (
    <>
      <FloatingHowItWorks title={"Megatalent Bracket - How it works"} steps={[{ title: 'Open', desc: 'Access the Megatalent Bracket section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Megatalent Bracket.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-br from-yellow-500/5 to-primary/5 border-yellow-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Swords className="h-4 w-4 text-yellow-500" />
            Weekly Bracket
          </div>
          <Badge variant={bracket.status === "completed" ? "secondary" : "default"}>
            {bracket.status === "completed" ? "Completed" : roundLabel(bracket.current_round)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bracket.status === "completed" && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <Crown className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-semibold">Champion crowned this week!</span>
          </div>
        )}

        {rounds.map((round) => {
          const matches = bracket.matches.filter((m) => m.round === round);
          if (matches.length === 0) return null;
          const isCurrent = round === bracket.current_round;
          return (
            <div key={round} className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {roundLabel(round)} {isCurrent && bracket.status === "active" && "• Vote now"}
              </div>
              {matches.map((m) => (
                <MatchRow
                  key={m.id}
                  match={m}
                  myVote={myVotes[m.id]}
                  voting={voting === m.id}
                  canVote={isCurrent && bracket.status === "active"}
                  onVote={(side) => vote(m.id, side)}
                />
              ))}
            </div>
          );
        })}
      </CardContent>
    </Card>
    </>
  );
};

const MatchRow = ({
  match,
  myVote,
  voting,
  canVote,
  onVote,
}: {
  match: Match;
  myVote?: "a" | "b";
  voting: boolean;
  canVote: boolean;
  onVote: (side: "a" | "b") => void;
}) => {
  const total = match.votes_a + match.votes_b;
  const pctA = total ? (match.votes_a / total) * 100 : 50;
  const winnerA = match.winner_submission_id && match.winner_submission_id === match.submission_a?.id;
  const winnerB = match.winner_submission_id && match.winner_submission_id === match.submission_b?.id;

  return (
    <div className="rounded-lg border border-border/40 overflow-hidden">
      <div className="grid grid-cols-2 gap-px bg-border/40">
        <Side
          sub={match.submission_a}
          votes={match.votes_a}
          pct={pctA}
          winner={!!winnerA}
          mine={myVote === "a"}
          canVote={canVote && !myVote}
          voting={voting}
          onVote={() => onVote("a")}
        />
        <Side
          sub={match.submission_b}
          votes={match.votes_b}
          pct={100 - pctA}
          winner={!!winnerB}
          mine={myVote === "b"}
          canVote={canVote && !myVote}
          voting={voting}
          onVote={() => onVote("b")}
        />
      </div>
    </div>
  );
};

const Side = ({
  sub,
  votes,
  pct,
  winner,
  mine,
  canVote,
  voting,
  onVote,
}: {
  sub: Submission | null;
  votes: number;
  pct: number;
  winner: boolean;
  mine: boolean;
  canVote: boolean;
  voting: boolean;
  onVote: () => void;
}) => {
  if (!sub) {
    return (
      <div className="bg-muted/20 p-3 text-xs text-muted-foreground text-center">TBD</div>
    );
  }
  return (
    <div className={`relative p-2 bg-card ${winner ? "ring-1 ring-yellow-500/60" : ""}`}>
      <div className="flex items-center gap-2">
        {sub.media_type === "image" ? (
          <img src={sub.media_url} alt={sub.title} className="w-12 h-12 rounded object-cover" />
        ) : (
          <video src={sub.media_url} className="w-12 h-12 rounded object-cover" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{sub.title}</p>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span>{votes} • {Math.round(pct)}%</span>
            {winner && <Trophy className="h-3 w-3 text-yellow-500" />}
            {mine && <Badge variant="secondary" className="h-4 px-1 text-[9px]">You</Badge>}
          </div>
        </div>
      </div>
      {canVote && (
        <Button
          size="sm"
          variant="outline"
          className="w-full mt-2 h-7 text-xs"
          onClick={onVote}
          disabled={voting}
        >
          Vote
        </Button>
      )}
    </div>
  );
};

export default MegatalentBracket;
