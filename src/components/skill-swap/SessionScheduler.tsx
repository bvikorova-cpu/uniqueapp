import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, CalendarDays, Clock, Video, MapPin, Plus, Check, X, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface SessionSchedulerProps {
  onBack: () => void;
}

export const SessionScheduler = ({ onBack }: SessionSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['skill-swap-sessions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: conversations } = await supabase
        .from('skill_swap_conversations')
        .select('id, user1_id, user2_id, status, created_at, completed_at, offering_id, skill_offerings(title, category)')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!conversations?.length) return [];

      // Get partner profiles
      const partnerIds = conversations.map(c => c.user1_id === user.id ? c.user2_id : c.user1_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', partnerIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return conversations.map(c => {
        const partnerId = c.user1_id === user.id ? c.user2_id : c.user1_id;
        const partner = profileMap.get(partnerId);
        const offering = c.skill_offerings as any;
        const date = new Date(c.created_at || new Date());
        const isCompleted = c.status === 'completed';
        const isCancelled = c.status === 'cancelled';

        return {
          id: c.id,
          title: offering?.title || 'Skill Exchange',
          partner: partner?.full_name || 'User',
          partnerAvatar: partner?.avatar_url,
          date,
          status: isCancelled ? 'cancelled' as const : isCompleted ? 'completed' as const : 'upcoming' as const,
          skill: offering?.category || 'General',
        };
      });
    },
  });

  const filteredSessions = sessions.filter(s => {
    if (filter === "upcoming") return s.status === "upcoming";
    if (filter === "completed") return s.status === "completed";
    return true;
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  const upcomingCount = sessions.filter(s => s.status === "upcoming").length;
  const completedCount = sessions.filter(s => s.status === "completed").length;

  if (isLoading) {
    return (
    <>
      <FloatingHowItWorks title={"Session Scheduler - How it works"} steps={[{ title: 'Open', desc: 'Access the Session Scheduler section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Session Scheduler.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </>
  );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" /> Session Scheduler
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active", value: upcomingCount.toString(), emoji: "📅" },
          { label: "Completed", value: completedCount.toString(), emoji: "✅" },
          { label: "Total", value: sessions.length.toString(), emoji: "📊" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 text-center bg-card/60 backdrop-blur-sm border-border/50">
              <span className="text-xl block mb-1">{stat.emoji}</span>
              <div className="text-xl font-black">{stat.value}</div>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/50">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="mx-auto"
          />
        </Card>

        {/* Sessions List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2">
            {(["all", "upcoming", "completed"] as const).map(f => (
              <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="text-xs capitalize">
                {f}
              </Button>
            ))}
          </div>

          {filteredSessions.length === 0 ? (
            <Card className="p-12 text-center bg-card/60 border-border/50">
              <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-bold text-lg mb-2">No Sessions Yet</h3>
              <p className="text-sm text-muted-foreground">Start a conversation to schedule your first skill swap session!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((session, i) => (
                <motion.div key={session.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className={`p-4 bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all ${
                    session.status === "cancelled" ? "opacity-60" : ""
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                        {session.partnerAvatar ? <img src={session.partnerAvatar} className="w-full h-full object-cover" /> : '👤'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-sm">{session.title}</h3>
                            <p className="text-xs text-muted-foreground">with {session.partner}</p>
                          </div>
                          <Badge
                            variant={session.status === "upcoming" ? "default" : session.status === "completed" ? "secondary" : "outline"}
                            className="text-[10px] flex-shrink-0"
                          >
                            {session.status === "upcoming" && <Clock className="w-2.5 h-2.5 mr-1" />}
                            {session.status === "completed" && <Check className="w-2.5 h-2.5 mr-1" />}
                            {session.status === "cancelled" && <X className="w-2.5 h-2.5 mr-1" />}
                            {session.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" /> {session.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </span>
                          <Badge variant="outline" className="text-[9px]">{session.skill}</Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};