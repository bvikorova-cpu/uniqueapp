import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { UserPlus, Swords, Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const categories = [
  'General Knowledge',
  'Science',
  'History',
  'Geography',
  'Sports',
  'Entertainment',
  'Technology',
  'Mathematics',
  'Literature',
  'Music'
];

export const FriendChallenges = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [stakeCredits, setStakeCredits] = useState<number>(10);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  // Fetch friends
  const { data: friends } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: friendships } = await supabase
        .from('friendships')
        .select('user_id, friend_id')
        .eq('status', 'accepted')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (!friendships) return [];

      const friendIds = friendships.map((f) =>
        f.user_id === user.id ? f.friend_id : f.user_id
      );

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', friendIds);

      return profiles || [];
    },
  });

  // Fetch challenges
  const { data: challenges } = useQuery({
    queryKey: ['friend-challenges'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('brain_duel_friend_challenges')
        .select('*')
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for challengers and challenged users
      const userIds = new Set<string>();
      data?.forEach((challenge) => {
        userIds.add(challenge.challenger_id);
        userIds.add(challenge.challenged_id);
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', Array.from(userIds));

      return data?.map((challenge) => ({
        ...challenge,
        challenger_profile: profiles?.find((p) => p.id === challenge.challenger_id),
        challenged_profile: profiles?.find((p) => p.id === challenge.challenged_id),
      })) || [];
    },
  });

  // Create challenge mutation
  const createChallenge = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('brain_duel_friend_challenges')
        .insert({
          challenger_id: user.id,
          challenged_id: selectedFriend,
          category,
          stake_credits: stakeCredits,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-challenges'] });
      setIsCreateOpen(false);
      setSelectedFriend('');
      setCategory('');
      setStakeCredits(10);
      toast({
        title: 'Challenge sent!',
        description: 'Your friend has been challenged',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create challenge',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Accept challenge mutation
  const acceptChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      const { error } = await supabase
        .from('brain_duel_friend_challenges')
        .update({ status: 'accepted' })
        .eq('id', challengeId);

      if (error) throw error;

      // TODO: Start match
      toast({
        title: 'Challenge accepted!',
        description: 'Match starting...',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-challenges'] });
    },
  });

  // Decline challenge mutation
  const declineChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      const { error } = await supabase
        .from('brain_duel_friend_challenges')
        .update({ status: 'declined' })
        .eq('id', challengeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-challenges'] });
      toast({
        title: 'Challenge declined',
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5" />
            Friend Challenges
          </CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Challenge Friend
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Challenge a Friend</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Friend</Label>
                  <Select value={selectedFriend} onValueChange={setSelectedFriend}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a friend" />
                    </SelectTrigger>
                    <SelectContent>
                      {friends?.map((friend) => (
                        <SelectItem key={friend.id} value={friend.id}>
                          {friend.full_name || 'Anonymous'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Stake Credits</Label>
                  <Input
                    type="number"
                    min="10"
                    step="10"
                    value={stakeCredits}
                    onChange={(e) => setStakeCredits(parseInt(e.target.value))}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => createChallenge.mutate()}
                  disabled={!selectedFriend || !category || createChallenge.isPending}
                >
                  Send Challenge
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {challenges && challenges.length > 0 ? (
          <div className="space-y-3">
            {challenges.map((challenge) => {
              const isChallenger = challenge.challenger_id === userId;
              const opponent = isChallenger
                ? challenge.challenged_profile
                : challenge.challenger_profile;

              return (
                <div key={challenge.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={opponent?.avatar_url || undefined} />
                        <AvatarFallback>
                          {opponent?.full_name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {isChallenger ? 'Challenge to' : 'Challenge from'}{' '}
                          {opponent?.full_name || 'Anonymous'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {challenge.category} • {challenge.stake_credits} credits
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        challenge.status === 'pending'
                          ? 'secondary'
                          : challenge.status === 'accepted'
                          ? 'default'
                          : 'outline'
                      }
                    >
                      {challenge.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(challenge.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                    {!isChallenger && challenge.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => acceptChallenge.mutate(challenge.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => declineChallenge.mutate(challenge.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Swords className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No challenges yet</p>
            <p className="text-sm">Challenge your friends to a Brain Duel!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
