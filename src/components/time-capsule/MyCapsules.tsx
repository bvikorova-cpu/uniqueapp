import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Clock, Mail, Calendar, Lock, Unlock, Eye, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const MyCapsules = ({ onBack }: { onBack: () => void }) => {
  const [capsules, setCapsules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCapsule, setSelectedCapsule] = useState<any>(null);

  useEffect(() => { loadCapsules(); }, []);

  const loadCapsules = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase
        .from("time_capsules")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCapsules(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const getDaysUntil = (d: string) => {
    const diff = new Date(d).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <>
      <FloatingHowItWorks
        title='My Capsules'
        steps={[
          { title: 'Open the tool', desc: 'Launch the My Capsules panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Hub</Button>

      <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
        My Time Capsules
      </h2>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : capsules.length === 0 ? (
        <Card className="border-border/40">
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No time capsules yet</p>
            <p className="text-sm text-muted-foreground mt-2">Create your first one to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {capsules.map((capsule, i) => (
            <motion.div key={capsule.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`border-border/40 hover:border-primary/30 transition-all cursor-pointer ${capsule.is_delivered ? 'bg-emerald-500/5' : ''}`}
                onClick={() => setSelectedCapsule(selectedCapsule?.id === capsule.id ? null : capsule)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {capsule.is_delivered ? <Unlock className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-amber-500" />}
                      <h4 className="font-bold text-sm">{capsule.title}</h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${capsule.is_delivered ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                      {capsule.is_delivered ? 'Delivered' : `${getDaysUntil(capsule.delivery_date)} days left`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{capsule.message}</p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(capsule.delivery_date)}</span>
                    {capsule.recipient_name && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />To: {capsule.recipient_name}</span>}
                  </div>

                  {selectedCapsule?.id === capsule.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 pt-3 border-t border-border/40">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{capsule.message}</p>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="text-xs" onClick={(e) => {
                          e.stopPropagation();
                          const content = `Time Capsule: ${capsule.title}\n\nDelivery Date: ${formatDate(capsule.delivery_date)}\nRecipient: ${capsule.recipient_name || 'Self'}\n\nMessage:\n${capsule.message}`;
                          const blob = new Blob([content], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url; a.download = `${capsule.title.replace(/[^a-z0-9]/gi, '_')}.txt`; a.click();
                          URL.revokeObjectURL(url);
                          toast.success("Capsule preview downloaded");
                        }}><Eye className="w-3 h-3 mr-1" /> Preview / Export</Button>
                        {!capsule.is_delivered && (
                          <Button variant="outline" size="sm" className="text-xs text-destructive hover:text-destructive" onClick={async (e) => {
                            e.stopPropagation();
                            if (!confirm(`Delete capsule "${capsule.title}"?`)) return;
                            const { error } = await supabase.from("time_capsules").delete().eq("id", capsule.id);
                            if (error) return toast.error(error.message);
                            setCapsules(prev => prev.filter(c => c.id !== capsule.id));
                            setSelectedCapsule(null);
                            toast.success("Capsule deleted");
                          }}><Trash2 className="w-3 h-3 mr-1" /> Delete</Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};
