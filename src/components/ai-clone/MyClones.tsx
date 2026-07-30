import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bot, MessageCircle, Pause, Play, Download, RefreshCw, Loader2, Pencil, Eye, EyeOff, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";
import { CloneChatDialog } from "./CloneChatDialog";
import { CloneEditDialog } from "./CloneEditDialog";

interface Clone {
  id: string;
  clone_name: string;
  personality_data: any;
  training_status: string;
  subscription_tier: string;
  total_conversations: number;
  is_active: boolean;
  is_public: boolean;
  created_at: string;
}

export function MyClones() {
  const { toast } = useToast();
  const [clones, setClones] = useState<Clone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chatClone, setChatClone] = useState<Clone | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [editClone, setEditClone] = useState<Clone | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => { fetchClones(); }, []);

  const fetchClones = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from('personality_clones').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      setClones((data || []).map((c: any) => ({ ...c, is_public: !!c.is_public })));
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

  const togglePublic = async (clone: Clone) => {
    try {
      const { error } = await supabase.from('personality_clones').update({ is_public: !clone.is_public }).eq('id', clone.id);
      if (error) throw error;
      toast({ title: clone.is_public ? "Clone is now private" : "Clone published to Marketplace" });
      fetchClones();
    } catch {
      toast({ title: "Error", description: "Failed to update visibility", variant: "destructive" });
    }
  };

  const deleteClone = async (cloneId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this clone?")) return;
    try {
      const { error } = await supabase.from('personality_clones').delete().eq('id', cloneId);
      if (error) throw error;
      toast({ title: "Clone deleted" });
      fetchClones();
    } catch {
      toast({ title: "Error", description: "Failed to delete clone", variant: "destructive" });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchClones();
    setIsRefreshing(false);
  };

  const exportConversations = async (cloneId: string) => {
    try {
      const { data, error } = await supabase
        .from('clone_chat_messages')
        .select('role, content, created_at')
        .eq('clone_id', cloneId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!data?.length) {
        toast({ title: "No conversations", description: "This clone has no chat history to export", variant: "destructive" });
        return;
      }

      const text = data.map(m => `[${new Date(m.created_at).toLocaleString()}] ${m.role}: ${m.content}`).join('\n\n');
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clone-conversations-${cloneId.slice(0, 8)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Exported!", description: "Conversations downloaded successfully" });
    } catch {
      toast({ title: "Error", description: "Failed to export conversations", variant: "destructive" });
    }
  };

  const openChat = (clone: Clone) => {
    setChatClone(clone);
    setChatOpen(true);
  };

  const openEdit = (clone: Clone) => {
    setEditClone(clone);
    setEditOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
  }

  if (clones.length === 0) {
    return (
    <>
      <FloatingHowItWorks title={"My Clones - How it works"} steps={[{ title: 'Open', desc: 'Access the My Clones section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in My Clones.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
        <CardContent className="text-center py-12">
          <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground mb-2">You haven't created any clones yet</p>
          <p className="text-sm text-muted-foreground">Start by creating your first AI personality clone</p>
        </CardContent>
      </Card>
    </>
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
                  <div className="flex gap-2 flex-wrap justify-end">
                    <Badge variant={clone.training_status === 'active' ? 'default' : 'secondary'}>{clone.training_status}</Badge>
                    <Badge variant="outline">{clone.subscription_tier}</Badge>
                    {clone.is_public && <Badge variant="default" className="bg-emerald-500">Public</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
                  <Button variant="default" size="sm" className="w-full min-w-0 justify-center" onClick={() => openChat(clone)}>
                    <MessageCircle className="h-4 w-4 mr-1.5 shrink-0" /> <span className="truncate">Chat</span>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full min-w-0 justify-center" onClick={() => openEdit(clone)}>
                    <Pencil className="h-4 w-4 mr-1.5 shrink-0" /> <span className="truncate">Edit</span>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full min-w-0 justify-center" onClick={() => toggleCloneStatus(clone.id, clone.is_active)}>
                    {clone.is_active ? <><Pause className="h-4 w-4 mr-1.5 shrink-0" /> <span className="truncate">Pause</span></> : <><Play className="h-4 w-4 mr-1.5 shrink-0" /> <span className="truncate">Activate</span></>}
                  </Button>
                  <Button variant="outline" size="sm" className="w-full min-w-0 justify-center" onClick={() => togglePublic(clone)}>
                    {clone.is_public ? <><EyeOff className="h-4 w-4 mr-1.5 shrink-0" /> <span className="truncate">Unpublish</span></> : <><Eye className="h-4 w-4 mr-1.5 shrink-0" /> <span className="truncate">Publish</span></>}
                  </Button>
                  <Button variant="outline" size="sm" className="w-full min-w-0 justify-center" onClick={() => exportConversations(clone.id)}>
                    <Download className="h-4 w-4 mr-1.5 shrink-0" /> <span className="truncate">Export</span>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full min-w-0 justify-center text-destructive hover:text-destructive" onClick={() => deleteClone(clone.id)}>
                    <Trash2 className="h-4 w-4 mr-1.5 shrink-0" /> <span className="truncate">Delete</span>
                  </Button>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <CloneChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        clone={chatClone ? { id: chatClone.id, clone_name: chatClone.clone_name, personality_data: chatClone.personality_data } : null}
      />
      <CloneEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        clone={editClone ? { id: editClone.id, clone_name: editClone.clone_name, personality_data: editClone.personality_data } : null}
        onSaved={fetchClones}
      />
    </div>
  );
}

