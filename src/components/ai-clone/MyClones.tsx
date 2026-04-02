import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bot, MessageCircle, Pause, Play, Download, RefreshCw, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Clone {
  id: string;
  clone_name: string;
  personality_data: any;
  training_status: string;
  subscription_tier: string;
  total_conversations: number;
  is_active: boolean;
  created_at: string;
}

export function MyClones() {
  const { toast } = useToast();
  const [clones, setClones] = useState<Clone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);

  useEffect(() => { fetchClones(); }, []);

  const fetchClones = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from('personality_clones').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      setClones(data || []);
    } catch (error) {
      console.error('Error fetching clones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCloneStatus = async (cloneId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('personality_clones').update({ is_active: !currentStatus }).eq('id', cloneId);
      if (error) throw error;
      toast({ title: currentStatus ? "Clone Paused" : "Clone Activated" });
      fetchClones();
    } catch {
      toast({ title: "Error", description: "Failed to update clone status", variant: "destructive" });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchClones();
    setIsRefreshing(false);
  };

  const exportConversations = async (cloneId: string) => {
    setExportingId(cloneId);
    try {
      const { data, error } = await supabase.functions.invoke("create-clone-checkout", {
        body: { productKey: "export" },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      toast({ title: "Error", description: "Failed to start export checkout", variant: "destructive" });
    } finally {
      setExportingId(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
  }

  if (clones.length === 0) {
    return (
      <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
        <CardContent className="text-center py-12">
          <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground mb-2">You haven't created any clones yet</p>
          <p className="text-sm text-muted-foreground">Start by creating your first AI personality clone</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      <div className="grid gap-4">
        {clones.map((clone, i) => (
          <motion.div key={clone.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      {clone.clone_name}
                    </CardTitle>
                    <CardDescription>
                      {clone.total_conversations} conversations • Created {new Date(clone.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={clone.training_status === 'active' ? 'default' : 'secondary'}>{clone.training_status}</Badge>
                    <Badge variant="outline">{clone.subscription_tier}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleCloneStatus(clone.id, clone.is_active)}>
                    {clone.is_active ? <><Pause className="h-4 w-4 mr-2" /> Pause</> : <><Play className="h-4 w-4 mr-2" /> Activate</>}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportConversations(clone.id)} disabled={exportingId === clone.id}>
                    {exportingId === clone.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                    Export (€2.00)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
