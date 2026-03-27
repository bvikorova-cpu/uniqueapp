import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, BellOff, Trophy, Swords, TrendingUp, Gift, Users, Flame, CheckCheck, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: 'challenge' | 'league' | 'achievement' | 'reward' | 'social' | 'streak';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: typeof Bell;
  color: string;
}

const NOTIFICATION_CONFIG: Record<string, { icon: typeof Bell; color: string }> = {
  challenge: { icon: Swords, color: 'text-red-400' },
  league: { icon: TrendingUp, color: 'text-blue-400' },
  achievement: { icon: Trophy, color: 'text-yellow-400' },
  reward: { icon: Gift, color: 'text-green-400' },
  social: { icon: Users, color: 'text-purple-400' },
  streak: { icon: Flame, color: 'text-orange-400' },
};

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    generateNotifications();
  }, []);

  const generateNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check for real data to generate contextual notifications
    const { count: matchCount } = await supabase
      .from('brain_duel_matches')
      .select('*', { count: 'exact', head: true })
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .eq('status', 'finished');

    const { count: challengeCount } = await supabase
      .from('brain_duel_friend_challenges')
      .select('*', { count: 'exact', head: true })
      .eq('challenged_id', user.id)
      .eq('status', 'pending');

    const now = new Date();
    const generatedNotifications: Notification[] = [];

    if ((challengeCount || 0) > 0) {
      generatedNotifications.push({
        id: 'pending-challenge',
        type: 'challenge',
        title: 'Pending Challenge!',
        message: `You have ${challengeCount} friend challenge${(challengeCount || 0) > 1 ? 's' : ''} waiting for you.`,
        timestamp: new Date(now.getTime() - 5 * 60000),
        read: false,
        ...NOTIFICATION_CONFIG.challenge,
      });
    }

    // Contextual notifications based on activity
    generatedNotifications.push(
      {
        id: 'daily-spin',
        type: 'reward',
        title: 'Daily Spin Available!',
        message: 'Your free daily spin wheel is ready. Don\'t miss your chance at 100 credits!',
        timestamp: new Date(now.getTime() - 15 * 60000),
        read: false,
        ...NOTIFICATION_CONFIG.reward,
      },
      {
        id: 'streak-reminder',
        type: 'streak',
        title: 'Keep Your Streak!',
        message: 'Play a match today to maintain your daily streak and earn bonus XP.',
        timestamp: new Date(now.getTime() - 30 * 60000),
        read: false,
        ...NOTIFICATION_CONFIG.streak,
      },
      {
        id: 'season-update',
        type: 'achievement',
        title: 'Season Pass Progress',
        message: `You've completed ${matchCount || 0} matches this season. Keep going for more rewards!`,
        timestamp: new Date(now.getTime() - 2 * 3600000),
        read: true,
        ...NOTIFICATION_CONFIG.achievement,
      },
      {
        id: 'league-promo',
        type: 'league',
        title: 'League Promotion Available',
        message: 'You\'re close to reaching the next league tier. Win 2 more matches!',
        timestamp: new Date(now.getTime() - 4 * 3600000),
        read: true,
        ...NOTIFICATION_CONFIG.league,
      },
      {
        id: 'new-pack',
        type: 'social',
        title: 'New Question Pack',
        message: 'A new "Pop Culture 2026" question pack is now available in the store!',
        timestamp: new Date(now.getTime() - 8 * 3600000),
        read: true,
        ...NOTIFICATION_CONFIG.social,
      },
    );

    setNotifications(generatedNotifications);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = filter === 'all'
    ? notifications
    : filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter);

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
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

        {/* Filters */}
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
                  const Icon = notification.icon;
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10, height: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`group rounded-xl border p-3 transition-all ${
                        notification.read
                          ? 'border-border/30 bg-card/30'
                          : 'border-primary/20 bg-primary/5'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg flex-shrink-0 ${notification.read ? 'bg-muted/30' : 'bg-primary/10'}`}>
                          <Icon className={`h-4 w-4 ${notification.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm font-semibold truncate ${notification.read ? 'text-muted-foreground' : ''}`}>
                              {notification.title}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-[10px] text-muted-foreground">{formatTime(notification.timestamp)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeNotification(notification.id)}
                              >
                                <Trash2 className="h-3 w-3 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                          {!notification.read && (
                            <div className="w-1.5 h-1.5 bg-primary rounded-full absolute top-3 left-1" />
                          )}
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
