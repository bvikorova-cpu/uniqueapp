import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, MessageCircle, Video, Star, Clock } from 'lucide-react';

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

const defaultPartners: StudyPartner[] = [
  { id: '1', name: 'Anna K.', subject: 'Mathematics', level: 'Advanced', rating: 4.8, isOnline: true, studyHours: 120 },
  { id: '2', name: 'Peter M.', subject: 'Physics', level: 'Intermediate', rating: 4.5, isOnline: true, studyHours: 85 },
  { id: '3', name: 'Eva S.', subject: 'Chemistry', level: 'Advanced', rating: 4.9, isOnline: false, studyHours: 200 },
];

export const PeerLearning = ({ partners = defaultPartners, onConnect }: PeerLearningProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const subjects = [...new Set(partners.map(p => p.subject))];
  const filteredPartners = selectedSubject 
    ? partners.filter(p => p.subject === selectedSubject)
    : partners;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Peer Learning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subject Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedSubject === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSubject(null)}
          >
            All
          </Button>
          {subjects.map(subject => (
            <Button
              key={subject}
              variant={selectedSubject === subject ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSubject(subject)}
            >
              {subject}
            </Button>
          ))}
        </div>

        {/* Partners List */}
        <div className="space-y-3">
          {filteredPartners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
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
                        <Badge variant="secondary" className="text-xs">
                          {partner.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{partner.subject}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {partner.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {partner.studyHours}h studied
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onConnect?.(partner.id)}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      {partner.isOnline && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onConnect?.(partner.id)}
                        >
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
      </CardContent>
    </Card>
  );
};

export const Leaderboard = ({ 
  entries = [
    { rank: 1, name: 'Maria T.', xp: 12500, avatar: '' },
    { rank: 2, name: 'Jakub K.', xp: 11200, avatar: '' },
    { rank: 3, name: 'Sofia L.', xp: 10800, avatar: '' },
    { rank: 4, name: 'You', xp: 9500, avatar: '', isCurrentUser: true },
    { rank: 5, name: 'Adam P.', xp: 9200, avatar: '' },
  ]
}: { entries?: Array<{ rank: number; name: string; xp: number; avatar: string; isCurrentUser?: boolean }> }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏆 Weekly Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                entry.isCurrentUser ? 'bg-primary/10 border border-primary' : 'bg-muted/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                entry.rank === 1 ? 'bg-yellow-500 text-yellow-950' :
                entry.rank === 2 ? 'bg-gray-300 text-gray-700' :
                entry.rank === 3 ? 'bg-orange-400 text-orange-950' :
                'bg-muted text-muted-foreground'
              }`}>
                {entry.rank}
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={entry.avatar} />
                <AvatarFallback>{entry.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <span className="flex-1 font-medium">
                {entry.name}
                {entry.isCurrentUser && <span className="text-xs text-muted-foreground ml-2">(You)</span>}
              </span>
              <span className="font-bold text-primary">{entry.xp.toLocaleString()} XP</span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
