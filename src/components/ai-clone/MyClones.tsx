import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bot, MessageCircle, Pause, Play, Download, Trash2, RefreshCw } from "lucide-react";

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

  useEffect(() => {
    fetchClones();
  }, []);

  const fetchClones = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('personality_clones')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

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
      const { error } = await supabase
        .from('personality_clones')
        .update({ is_active: !currentStatus })
        .eq('id', cloneId);

      if (error) throw error;

      toast({
        title: currentStatus ? "Clone Paused" : "Clone Activated",
        description: currentStatus ? "Your clone has been paused" : "Your clone is now active"
      });

      fetchClones();
    } catch (error) {
      console.error('Error toggling clone:', error);
      toast({
        title: "Error",
        description: "Failed to update clone status",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchClones();
    setIsRefreshing(false);
    toast({
      title: "Clones Refreshed",
      description: "Latest data loaded"
    });
  };

  const exportConversations = async (cloneId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conversations } = await supabase
        .from('clone_conversations')
        .select('*')
        .eq('clone_id', cloneId);

      const { error } = await supabase
        .from('clone_exports')
        .insert({
          user_id: user.id,
          clone_id: cloneId,
          export_data: conversations || [],
          payment_amount: 2.00
        });

      if (error) throw error;

      toast({
        title: "Export Created",
        description: "Your conversations have been exported (€2.00 charge applied)"
      });
    } catch (error) {
      console.error('Error exporting conversations:', error);
      toast({
        title: "Error",
        description: "Failed to export conversations",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading your clones...</div>;
  }

  if (clones.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
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
        {clones.map((clone) => (
        <Card key={clone.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  {clone.clone_name}
                </CardTitle>
                <CardDescription>
                  {clone.total_conversations} conversations • Created {new Date(clone.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant={clone.training_status === 'active' ? 'default' : 'secondary'}>
                  {clone.training_status}
                </Badge>
                <Badge variant="outline">{clone.subscription_tier}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleCloneStatus(clone.id, clone.is_active)}
              >
                {clone.is_active ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Clone
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Activate Clone
                  </>
                )}
              </Button>
              
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                View Conversations
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportConversations(clone.id)}
              >
                <Download className="h-4 w-4 mr-2" />
                Export (€2.00)
              </Button>
            </div>
          </CardContent>
        </Card>
        ))}
      </div>
    </div>
  );
}