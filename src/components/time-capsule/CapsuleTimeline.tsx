import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, Lock, Unlock, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const CapsuleTimeline = ({ onBack }: { onBack: () => void }) => {
  const [capsules, setCapsules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { data } = await supabase.from("time_capsules").select("*").eq("user_id", session.user.id).order("delivery_date", { ascending: true });
        setCapsules(data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const getProgress = (created: string, delivery: string) => {
    const start = new Date(created).getTime();
    const end = new Date(delivery).getTime();
    const now = Date.now();
    return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  // Sample data if no capsules
  const displayCapsules = capsules.length > 0 ? capsules : [
    { id: "s1", title: "Letter to Future Me", delivery_date: "2027-01-01", created_at: "2025-01-01", is_delivered: false },
    { id: "s2", title: "Wedding Anniversary Note", delivery_date: "2028-06-15", created_at: "2025-06-15", is_delivered: false },
    { id: "s3", title: "Message for My Daughter", delivery_date: "2035-09-01", created_at: "2025-09-01", is_delivered: false },
  ];

  return (
    <>
      <FloatingHowItWorks
        title='Capsule Timeline'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Capsule Timeline panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Hub</Button>

      <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
        Capsule Timeline
      </h2>
      <p className="text-sm text-muted-foreground">Visualize your capsules on a timeline — see how far each one has traveled through time.</p>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/10" />

        <div className="space-y-4">
          {displayCapsules.map((capsule, i) => {
            const progress = getProgress(capsule.created_at, capsule.delivery_date);
            return (
              <motion.div key={capsule.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="relative pl-12">
                <div className={`absolute left-3.5 top-4 w-3 h-3 rounded-full border-2 ${capsule.is_delivered ? 'bg-emerald-500 border-emerald-400' : 'bg-primary border-primary/60'}`} />
                <Card className="border-border/40 hover:border-primary/30 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {capsule.is_delivered ? <Unlock className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-amber-500" />}
                        <h3 className="font-bold text-sm">{capsule.title}</h3>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="w-3 h-3" /> Delivers: {formatDate(capsule.delivery_date)}
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full bg-gradient-to-r from-primary to-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 1 }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{Math.round(progress)}% through time journey</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
};
