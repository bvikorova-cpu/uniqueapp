import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toast } from "sonner";

export const BuddyMatches = () => {
  const { toast } = useToast();

  const { data: matches } = useQuery({
    queryKey: ['coffee-matches'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('coffee_matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleAccept = (matchId: string) => {
    toast({
      title: 'Match accepted!',
      description: 'You can now chat with your coffee buddy'
    });
  };

  const handleDecline = (matchId: string) => {
    toast({
      title: 'Match declined',
      description: 'Looking for more matches...'
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Matches</CardTitle>
          <CardDescription>People who might share your coffee taste</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {matches?.filter(m => m.status === 'pending').map((match) => (
            <div key={match.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold">Coffee Enthusiast</p>
                  <p className="text-sm text-muted-foreground">Match score: {match.match_score}%</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => handleDecline(match.id)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Decline
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => handleAccept(match.id)}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Accept
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Matches</CardTitle>
          <CardDescription>Your coffee buddies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {matches?.filter(m => m.status === 'accepted').map((match) => (
            <div key={match.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Coffee Buddy</p>
                  <p className="text-sm text-muted-foreground">Matched recently</p>
                </div>
                <Button size="sm" onClick={() => toast({ description: "Chat — coming soon" })}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};