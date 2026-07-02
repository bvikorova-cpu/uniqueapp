import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubscriptionGate } from '@/components/shadow-arena/SubscriptionGate';
import { Swords, Trophy, Clock, ArrowLeft, Sparkles, Shield, Gift, Timer, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { GothicPageHeader } from '@/components/shadow-arena/GothicPageHeader';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Battle {
  id: string;
  challenge_theme: string;
  challenge_prompt: string;
  status: string;
  started_at: string | null;
  ends_at: string | null;
  total_prize_pool: number;
}

function LiveCountdown({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Ended"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [endsAt]);

  return <span className="font-mono">{timeLeft}</span>;
}

export default function ShadowArenaBattles() {
  const navigate = useNavigate();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchBattles();
  }, []);

  const fetchBattles = async () => {
    try {
      const { data, error } = await supabase
        .from('shadow_battles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBattles(data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load battles');
    } finally {
      setLoading(false);
    }
  };

  const createNewBattle = async () => {
    try {
      setCreating(true);
      toast.info('Creating new battle with AI challenge...');
      const { error } = await supabase.functions.invoke('create-shadow-battle');
      if (error) throw error;
      toast.success('New battle created!');
      fetchBattles();
    } catch (error) {
      console.error('Create battle error:', error);
      toast.error('Failed to create battle');
    } finally {
      setCreating(false);
    }
  };

  const isExpired = (b: Battle) => b.ends_at ? new Date(b.ends_at).getTime() < Date.now() : false;
  const isReallyActive = (b: Battle) =>
    (b.status === "active" || b.status === "waiting_for_participants") && !isExpired(b);

  const filtered = filter === "all" ? battles : battles.filter(b => {
    if (filter === "active") return isReallyActive(b);
    if (filter === "completed") return b.status === "completed" || isExpired(b);
    return b.status === filter;
  });

  const activeBattles = battles.filter(isReallyActive);
  const totalPool = activeBattles.reduce((s, b) => s + b.total_prize_pool, 0);

  const statusConfig: Record<string, { label: string; className: string }> = {
    waiting_for_participants: { label: "Open", className: "bg-yellow-600/80 text-yellow-100" },
    active: { label: "Live", className: "bg-green-600/80 text-green-100" },
    completed: { label: "Ended", className: "bg-muted text-muted-foreground" },
    expired: { label: "Expired", className: "bg-red-900/60 text-red-300" },
  };

  const infoItems = [
    { icon: Sparkles, label: "AI-generated themes every month" },
    { icon: Shield, label: "Anonymous submissions for fair judging" },
    { icon: Gift, label: "Digital gifts = weighted votes" },
    { icon: Trophy, label: "80% to winners, Top 3 split" },
    { icon: Timer, label: "14-day battle duration" },
    { icon: Users, label: "€1 entry — all goes to prize pool" },
  ];

  return (
<SubscriptionGate>
  <FloatingHowItWorks title="ShadowArenaBattles — How it works" steps={[{title:"Open this section",desc:"Access ShadowArenaBattles from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
      <div className="container mx-auto px-4 sm:px-6 pt-24 pb-8 max-w-5xl">
        {/* Back nav */}
        <Button variant="ghost" size="sm" onClick={() => navigate('/shadow-arena/dashboard')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        {/* Cinematic gothic hero */}
        <GothicPageHeader
          icon={Swords}
          title="Battle Arena"
          subtitle="Monthly horror storytelling competitions with real cash prizes"
        >
          <div className="flex flex-wrap items-center gap-3">
            {totalPool > 0 && (
              <div className="px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-yellow-800/40">
                <p className="text-[10px] uppercase tracking-wide text-yellow-400/70">Active Pools</p>
                <p className="text-lg font-black text-yellow-400">€{totalPool.toFixed(2)}</p>
              </div>
            )}
            <Button
              onClick={createNewBattle}
              disabled={creating}
              className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 border border-red-700/40 shadow-[0_0_20px_-5px_rgba(220,38,38,0.6)]"
            >
              <Swords className="w-4 h-4 mr-2" />
              {creating ? 'Creating...' : 'Create New Battle'}
            </Button>
          </div>
        </GothicPageHeader>

        {/* Info grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {infoItems.map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl bg-card/30 border border-border/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <item.icon className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { key: "all", label: "All Battles" },
            { key: "active", label: "Active" },
            { key: "completed", label: "Ended" },
          ].map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.key)}
              className="text-xs"
            >
              {f.label}
              {f.key === "active" && activeBattles.length > 0 && (
                <Badge className="ml-2 bg-green-600/80 text-xs px-1.5">{activeBattles.length}</Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Battle list */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Swords className="h-14 w-14 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">No battles found</p>
            <p className="text-muted-foreground mb-6">
              {filter !== "all" ? "Try a different filter or create a new battle." : "Create the first battle to get started!"}
            </p>
            <Button onClick={createNewBattle} disabled={creating}>
              {creating ? 'Creating...' : 'Create First Battle'}
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filtered.map((battle, i) => {
              const battleExpired = isExpired(battle);
              const displayStatus = battleExpired && battle.status !== "completed" ? "expired" : battle.status;
              const cfg = statusConfig[displayStatus] || { label: battle.status, className: "bg-muted" };
              return (
                <motion.div
                  key={battle.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    className="group p-5 hover:border-purple-700/40 transition-all cursor-pointer"
                    onClick={() => navigate(`/shadow-arena/battle/${battle.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`text-xs ${cfg.className}`}>{cfg.label}</Badge>
                          {battle.ends_at && !battleExpired && battle.status !== "completed" && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <LiveCountdown endsAt={battle.ends_at} />
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-purple-400 transition-colors">
                          {battle.challenge_theme}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {battle.challenge_prompt}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <Trophy className="h-6 w-6 text-yellow-500 mb-1 ml-auto" />
                        <p className="text-2xl font-black text-yellow-400">
                          €{battle.total_prize_pool.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Prize Pool</p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-purple-950/20 group-hover:border-purple-700/40 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/shadow-arena/battle/${battle.id}`);
                      }}
                    >
                      View Battle Details
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </SubscriptionGate>
  );
}
