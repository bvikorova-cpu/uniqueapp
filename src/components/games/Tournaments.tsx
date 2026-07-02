import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Users, Clock, Swords, Crown, Medal } from 'lucide-react';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Tournament {
  id: string;
  name: string;
  game: string;
  status: 'upcoming' | 'live' | 'completed';
  participants: number;
  maxParticipants: number;
  prizePool: string;
  startTime: string;
  entryFee?: string;
}

interface TournamentsProps {
  tournaments?: Tournament[];
  onJoin?: (tournamentId: string) => void;
}

const defaultTournaments: Tournament[] = [
  {
    id: '1',
    name: 'Weekend Championship',
    game: 'Brain Duel',
    status: 'live',
    participants: 128,
    maxParticipants: 128,
    prizePool: '€500',
    startTime: 'Now',
  },
  {
    id: '2',
    name: 'Quick Fire Cup',
    game: 'Trivia Battle',
    status: 'upcoming',
    participants: 45,
    maxParticipants: 64,
    prizePool: '€100',
    startTime: '2h 30m',
    entryFee: '€5',
  },
  {
    id: '3',
    name: 'Pro League Finals',
    game: 'Strategy Arena',
    status: 'upcoming',
    participants: 16,
    maxParticipants: 16,
    prizePool: '€1,000',
    startTime: 'Tomorrow',
    entryFee: '€20',
  },
];

export const Tournaments = ({ tournaments = defaultTournaments, onJoin }: TournamentsProps) => {
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all');

  const filteredTournaments = filter === 'all' 
    ? tournaments 
    : tournaments.filter(t => t.status === filter);

  const getStatusBadge = (status: Tournament['status']) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-red-500 text-white animate-pulse">🔴 LIVE</Badge>;
      case 'upcoming':
        return <Badge variant="secondary">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Tournaments - How it works"} steps={[{ title: 'Open', desc: 'Access the Tournaments section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tournaments.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Tournaments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'live', 'upcoming'] as const).map(tab => (
            <Button
              key={tab}
              variant={filter === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(tab)}
              className="capitalize"
            >
              {tab === 'live' && '🔴 '}{tab}
            </Button>
          ))}
        </div>

        {/* Tournament List */}
        <div className="space-y-3">
          {filteredTournaments.map((tournament, index) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`overflow-hidden ${
                tournament.status === 'live' ? 'border-red-500/50 bg-red-500/5' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{tournament.name}</h4>
                        {getStatusBadge(tournament.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{tournament.game}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-yellow-500 font-bold">
                        <Crown className="h-4 w-4" />
                        {tournament.prizePool}
                      </div>
                      {tournament.entryFee && (
                        <p className="text-xs text-muted-foreground">Entry: {tournament.entryFee}</p>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {tournament.participants}/{tournament.maxParticipants}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {tournament.startTime}
                      </span>
                    </div>
                    <Progress 
                      value={(tournament.participants / tournament.maxParticipants) * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Action */}
                  <Button
                    className="w-full"
                    variant={tournament.status === 'live' ? 'default' : 'outline'}
                    disabled={tournament.participants >= tournament.maxParticipants || tournament.status === 'completed'}
                    onClick={() => onJoin?.(tournament.id)}
                  >
                    {tournament.status === 'live' ? (
                      <>
                        <Swords className="h-4 w-4 mr-2" />
                        Watch Live
                      </>
                    ) : tournament.participants >= tournament.maxParticipants ? (
                      'Full'
                    ) : (
                      'Join Tournament'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
  );
};

export const TournamentBracket = () => {
  const rounds = [
    { name: 'Quarter Finals', matches: [
      { player1: 'Player 1', player2: 'Player 2', winner: 1 },
      { player1: 'Player 3', player2: 'Player 4', winner: 2 },
      { player1: 'Player 5', player2: 'Player 6', winner: 1 },
      { player1: 'Player 7', player2: 'Player 8', winner: 2 },
    ]},
    { name: 'Semi Finals', matches: [
      { player1: 'Player 1', player2: 'Player 4', winner: 1 },
      { player1: 'Player 5', player2: 'Player 8', winner: 2 },
    ]},
    { name: 'Finals', matches: [
      { player1: 'Player 1', player2: 'Player 8', winner: null },
    ]},
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tournament Bracket</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-8 overflow-x-auto pb-4">
          {rounds.map((round, roundIndex) => (
            <div key={round.name} className="flex-shrink-0">
              <h4 className="text-sm font-medium text-center mb-4 text-muted-foreground">
                {round.name}
              </h4>
              <div className="space-y-4" style={{ marginTop: roundIndex * 40 }}>
                {round.matches.map((match, matchIndex) => (
                  <div
                    key={matchIndex}
                    className="bg-muted rounded-lg p-2 w-40"
                    style={{ marginTop: matchIndex > 0 ? roundIndex * 40 : 0 }}
                  >
                    <div className={`p-2 rounded text-sm ${
                      match.winner === 1 ? 'bg-primary text-primary-foreground' : 'bg-background'
                    }`}>
                      {match.player1}
                    </div>
                    <div className="text-center text-xs text-muted-foreground py-1">vs</div>
                    <div className={`p-2 rounded text-sm ${
                      match.winner === 2 ? 'bg-primary text-primary-foreground' : 'bg-background'
                    }`}>
                      {match.player2}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Winner */}
          <div className="flex-shrink-0 flex items-center">
            <div className="text-center">
              <Medal className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Winner</p>
              <p className="text-xs text-muted-foreground">TBD</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
