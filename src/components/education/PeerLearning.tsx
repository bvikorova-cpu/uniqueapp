import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, MessageCircle, Video, Star, Clock, Trophy, Crown, Medal } from 'lucide-react';

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface StudyPartner {
  id: string;
  name: string;
  avatar?: string;
  subject: string;
  level: string;
  rating: number;
  isOnline: boolean;
  studyHours: number;
}

interface PeerLearningProps {
  partners?: StudyPartner[];
  onConnect?: (partnerId: string) => void;
}

export const PeerLearning = ({ partners = [], onConnect }: PeerLearningProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const subjects = [...new Set(partners.map(p => p.subject))];
  const filteredPartners = selectedSubject ? partners.filter(p => p.subject === selectedSubject) : partners;

  return (
    <>
      <FloatingHowItWorks title="How Peer Learning works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Peer Learning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button variant={selectedSubject === null ? "default" : "outline"} size="sm" onClick={() => setSelectedSubject(null)}>All</Button>
            {subjects.map(subject => (
              <Button key={subject} variant={selectedSubject === subject ? "default" : "outline"} size="sm" onClick={() => setSelectedSubject(subject)}>
                {subject}
              </Button>
            ))}
          </div>
        )}

        {filteredPartners.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No study partners available yet</p>
            <p className="text-xs text-muted-foreground mt-1">Complete quizzes to find study partners!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPartners.map((partner, index) => (
              <motion.div key={partner.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }}>
                <Card className="bg-muted/30 border-border/30 hover:border-primary/20 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-background">
                          <AvatarImage src={partner.avatar} />
                          <AvatarFallback>{partner.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        {partner.isOnline && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{partner.name}</h4>
                          <Badge variant="secondary" className="text-xs">{partner.level}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{partner.subject}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" />{partner.rating}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{partner.studyHours}h studied</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onConnect?.(partner.id)}>
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        {partner.isOnline && (
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onConnect?.(partner.id)}>
                            <Video className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </>
    );
};

export const Leaderboard = ({ 
  entries = []
}: { entries?: Array<{ rank: number; name: string; xp: number; avatar: string; isCurrentUser?: boolean }> }) => {
  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/15 to-transparent border-yellow-500/20";
    if (rank === 2) return "bg-gradient-to-r from-gray-400/10 to-transparent border-gray-400/20";
    if (rank === 3) return "bg-gradient-to-r from-amber-600/10 to-transparent border-amber-600/20";
    return "bg-muted/50";
  };

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Weekly Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No entries yet</p>
            <p className="text-xs text-muted-foreground mt-1">Complete quizzes to join the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.08 }}
                className={`flex items-center gap-3 p-3 rounded-xl border ${getRankStyle(entry.rank)} ${
                  entry.isCurrentUser ? 'ring-2 ring-primary/30' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  entry.rank === 1 ? 'bg-yellow-500 text-yellow-950' :
                  entry.rank === 2 ? 'bg-gray-300 text-gray-700' :
                  entry.rank === 3 ? 'bg-orange-400 text-orange-950' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {entry.rank <= 3 ? (entry.rank === 1 ? <Crown className="h-4 w-4" /> : <Medal className="h-4 w-4" />) : entry.rank}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.avatar} />
                  <AvatarFallback>{entry.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="flex-1 font-medium">
                  {entry.name}
                  {entry.isCurrentUser && <span className="text-xs text-primary ml-2">(You)</span>}
                </span>
                <span className="font-bold text-primary">{entry.xp.toLocaleString()} XP</span>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
