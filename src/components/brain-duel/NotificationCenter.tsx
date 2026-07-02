import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, BellOff, Trophy, Swords, TrendingUp, Gift, Users, Flame, CheckCheck, Trash2, UserPlus, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const ICON_MAP: Record<string, typeof Bell> = {
  challenge: Swords,
  league: TrendingUp,
  achievement: Trophy,
  reward: Gift,
  social: Users,
  streak: Flame,
  referral: UserPlus,
  ai_recap: Brain,
};

const COLOR_MAP: Record<string, string> = {
  challenge: 'text-red-400',
  league: 'text-blue-400',
  achievement: 'text-yellow-400',
  reward: 'text-green-400',
  social: 'text-purple-400',
  streak: 'text-orange-400',
  referral: 'text-emerald-400',
  ai_recap: 'text-violet-400',
};

export const NotificationCenter = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('all');

  const { data: dbNotifications = [] } = useQuery({
    queryKey: ['brain-duel-db-notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from('brain_duel_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      return data || [];
    },
  });

  // Real-time listener for new notifications
  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel(`brain-duel-notif-${user.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'brain_duel_notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const n = payload.new as any;
            toast.info(n.title, { description: n.message, duration: 5000 });
            queryClient.invalidateQueries({ queryKey: ['brain-duel-db-notifications'] });
          }
        )
        .subscribe();

      return (
    <>
      <FloatingHowItWorks title={"Notification Center - How it works"} steps={[{ title: 'Open', desc: 'Access the Notification Center section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Notification Center.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => { supabase.removeChannel(channel); };
    };

    const cleanup = setupRealtime();
    return () => { cleanup.then(fn => fn?.()); };
  }, [queryClient]);

  // Merge DB notifications with contextual ones
  const [contextualNotifs, setContextualNotifs] = useState<any[]>([]);

  useEffect(() => {
    const generateContextual = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count: challengeCount } = await supabase
        .from('brain_duel_friend_challenges')
        .select('*', { count: 'exact', head: true })
        .eq('challenged_id', user.id)
        .eq('status', 'pending');

      const notifs: any[] = [];
      const now = new Date();

      if ((challengeCount || 0) > 0) {
        notifs.push({
          id: 'pending-challenge',
          type: 'challenge',
          title: 'Pending Challenge!',
          message: `You have ${challengeCount} friend challenge${(challengeCount || 0) > 1 ? 's' : ''} waiting.`,
          created_at: new Date(now.getTime() - 5 * 60000).toISOString(),
          is_read: false,
          _contextual: true,
        });
      }

      notifs.push({
        id: 'daily-spin',
        type: 'reward',
        title: 'Daily Spin Available!',
        message: "Spin the wheel for a chance at 100 credits!",
        created_at: new Date(now.getTime() - 15 * 60000).toISOString(),
        is_read: false,
        _contextual: true,
      });

      setContextualNotifs(notifs);
    };
    generateContextual();
  }, []);

  const allNotifications = [...contextualNotifs, ...dbNotifications].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('brain_duel_notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setContextualNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    queryClient.invalidateQueries({ queryKey: ['brain-duel-db-notifications'] });
  };

  const removeNotification = async (id: string, isContextual: boolean) => {
    if (isContextual) {
      setContextualNotifs(prev => prev.filter(n => n.id !== id));
    } else {
      await supabase.from('brain_duel_notifications').delete().eq('id', id);
      queryClient.invalidateQueries({ queryKey: ['brain-duel-db-notifications'] });
    }
  };

  const unreadCount = allNotifications.filter(n => !n.is_read).length;

  const filteredNotifications = filter === 'all'
    ? allNotifications
    : filter === 'unread'
    ? allNotifications.filter(n => !n.is_read)
    : allNotifications.filter(n => n.type === filter);

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'challenge', label: 'Challenges' },
    { key: 'referral', label: 'Referrals' },
    { key: 'achievement', label: 'Achievements' },
    { key: 'reward', label: 'Rewards' },
  ];

  return (
    <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-violet-500/5 to-cyan-500/5" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="relative p-2 rounded-xl bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            Notifications
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs gap-1">
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="flex gap-1.5 flex-wrap mt-2">
          {filters.map(f => (
            <Badge
              key={f.key}
              variant={filter === f.key ? 'default' : 'outline'}
              className="cursor-pointer text-[10px] transition-all hover:scale-105"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              {f.key === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="relative">
        <ScrollArea className="h-[350px] pr-2">
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <BellOff className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification, i) => {
                  const Icon = ICON_MAP[notification.type] || Bell;
                  const color = COLOR_MAP[notification.type] || 'text-primary';
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10, height: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`group rounded-xl border p-3 transition-all ${
                        notification.is_read
                          ? 'border-border/30 bg-card/30'
                          : 'border-primary/20 bg-primary/5'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg flex-shrink-0 ${notification.is_read ? 'bg-muted/30' : 'bg-primary/10'}`}>
                          <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm font-semibold truncate ${notification.is_read ? 'text-muted-foreground' : ''}`}>
                              {notification.title}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-[10px] text-muted-foreground">{formatTime(notification.created_at)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeNotification(notification.id, !!notification._contextual)}
                              >
                                <Trash2 className="h-3 w-3 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
