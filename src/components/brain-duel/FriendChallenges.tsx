import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { UserPlus, Swords, Trophy, Clock, CheckCircle, XCircle, Coins, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useBrainDuelCredits } from '@/hooks/useBrainDuelCredits';
import { useNavigate } from 'react-router-dom';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
  const navigate = useNavigate();
  const { credits } = useBrainDuelCredits();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [stakeCredits, setStakeCredits] = useState<number>(10);
  const [userId, setUserId] = useState<string | null>(null);
  const [acceptingChallenge, setAcceptingChallenge] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  // Real-time subscriptions for challenge notifications
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`friend-challenges-panel-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'brain_duel_friend_challenges',
          filter: `challenged_id=eq.${userId}`,
        },
        async (payload) => {
          // Fetch challenger profile for notification
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', payload.new.challenger_id)
            .single();

          toast({
            title: '⚔️ New Challenge!',
            description: `${profile?.full_name || 'Someone'} challenged you to ${payload.new.category}!`,
          });

          // Refresh challenges list
          queryClient.invalidateQueries({ queryKey: ['friend-challenges'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'brain_duel_friend_challenges',
          filter: `challenger_id=eq.${userId}`,
        },
        async (payload) => {
          // Only notify if status changed to accepted
          if (payload.new.status === 'accepted' && payload.old.status === 'pending') {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', payload.new.challenged_id)
              .single();

            toast({
              title: '🎉 Challenge Accepted!',
              description: `${profile?.full_name || 'Your friend'} accepted your challenge!`,
            });

            // Refresh challenges list
            queryClient.invalidateQueries({ queryKey: ['friend-challenges'] });
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, toast, queryClient]);

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

      // Check if user has enough credits
      if (credits < stakeCredits) {
        throw new Error('Insufficient credits');
      }

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
        title: 'Challenge sent! 🎯',
        description: 'Your friend has been challenged',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create challenge',
        description: error.message === 'Insufficient credits' 
          ? `You need at least ${stakeCredits} credits to create this challenge`
          : error.message,
        variant: 'destructive',
      });
    },
  });

  // Accept challenge mutation
  const acceptChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      setAcceptingChallenge(challengeId);
      
      const { data, error } = await supabase.functions.invoke('brain-duel-friend-match', {
        body: { challenge_id: challengeId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['friend-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['brain-duel-credits'] });
      
      toast({
        title: 'Challenge accepted! ⚔️',
        description: `Match starting with ${data.stake_amount} credits at stake!`,
      });

      // Navigate to game after a short delay
      setTimeout(() => {
        window.location.href = '/brain-duel?match_id=' + data.match.id;
      }, 1500);
    },
    onError: (error: Error) => {
      setAcceptingChallenge(null);
      toast({
        title: 'Failed to accept challenge',
        description: error.message,
        variant: 'destructive',
      });
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
    <Card className="overflow-hidden backdrop-blur-xl bg-card/80 border-primary/10 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <CardHeader className="pb-3 relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Swords className="h-4 w-4 sm:h-5 sm:w-5" />
            Friend Challenges
          </CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto">
                <UserPlus className="h-4 w-4 mr-2" />
                Challenge Friend
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md backdrop-blur-xl bg-card/95">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Swords className="h-5 w-5 text-primary" />
                  Challenge a Friend
                </DialogTitle>
                <DialogDescription>
                  Set up a private Brain Duel match with custom rules
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Your Credits:</span>
                    <span className="font-bold flex items-center gap-1">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      {credits}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="friend-select">Select Friend</Label>
                  <Select value={selectedFriend} onValueChange={setSelectedFriend}>
                    <SelectTrigger id="friend-select">
                      <SelectValue placeholder="Choose a friend to challenge" />
                    </SelectTrigger>
                    <SelectContent>
                      {friends && friends.length > 0 ? (
                        friends.map((friend) => (
                          <SelectItem key={friend.id} value={friend.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={friend.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {friend.full_name?.[0]?.toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              {friend.full_name || 'Anonymous'}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No friends available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category-select">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category-select">
                      <SelectValue placeholder="Choose battle category" />
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

                <div className="space-y-2">
                  <Label htmlFor="stake-input">Stake Credits</Label>
                  <div className="relative">
                    <Input
                      id="stake-input"
                      type="number"
                      min="10"
                      max={credits}
                      step="10"
                      value={stakeCredits}
                      onChange={(e) => setStakeCredits(Math.max(10, Math.min(credits, parseInt(e.target.value) || 10)))}
                      className="pr-20"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      credits
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Winner takes all! Both players stake {stakeCredits} credits.
                  </p>
                </div>

                <Separator />

                <div className="p-3 bg-accent/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Your stake:</span>
                    <span className="font-semibold">{stakeCredits} credits</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Potential win:</span>
                    <span className="font-bold text-green-500">{stakeCredits * 2} credits</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => createChallenge.mutate()}
                  disabled={!selectedFriend || !category || createChallenge.isPending || credits < stakeCredits}
                >
                  {createChallenge.isPending ? (
                    <>Sending Challenge...</>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Send Challenge
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="relative">
        {challenges && challenges.length > 0 ? (
          <div className="space-y-3">
            {challenges.map((challenge) => {
              const isChallenger = challenge.challenger_id === userId;
              const opponent = isChallenger
                ? challenge.challenged_profile
                : challenge.challenger_profile;

              return (
                <div 
                  key={challenge.id} 
                  className={`p-4 rounded-lg border backdrop-blur-sm transition-all ${
                    challenge.status === 'pending' && !isChallenger 
                      ? 'border-primary/30 bg-primary/5 animate-pulse' 
                      : 'border-primary/10 bg-muted/20 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                        <AvatarImage src={opponent?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10">
                          {opponent?.full_name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-lg">
                          {isChallenger ? '⚔️ Challenge to' : '🎯 Challenge from'}{' '}
                          {opponent?.full_name || 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {challenge.category}
                          </Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Coins className="h-3 w-3 text-yellow-500" />
                            {challenge.stake_credits} credits
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        challenge.status === 'pending'
                          ? 'secondary'
                          : challenge.status === 'accepted' || challenge.status === 'active'
                          ? 'default'
                          : 'outline'
                      }
                      className="capitalize"
                    >
                      {challenge.status}
                    </Badge>
                  </div>

                  {!isChallenger && challenge.status === 'pending' && (
                    <div className="p-3 mb-3 bg-accent/50 rounded-lg">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">You'll stake:</span>
                        <span className="font-semibold">{challenge.stake_credits} credits</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Potential win:</span>
                        <span className="font-bold text-green-500">
                          {challenge.stake_credits * 2} credits
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
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
                          disabled={acceptingChallenge === challenge.id}
                          className="animate-fade-in"
                        >
                          {acceptingChallenge === challenge.id ? (
                            <>Starting...</>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => declineChallenge.mutate(challenge.id)}
                          disabled={acceptingChallenge === challenge.id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                    {isChallenger && challenge.status === 'pending' && (
                      <Badge variant="secondary" className="text-xs">
                        Waiting for response...
                      </Badge>
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
