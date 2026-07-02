import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Send, X } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const GlobalAnnouncementPanel = () => {
  const [message, setMessage] = useState('');
  const [activeAnnouncement, setActiveAnnouncement] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadActiveAnnouncement();
  }, []);

  const loadActiveAnnouncement = async () => {
    const { data } = await supabase
      .from('global_announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    setActiveAnnouncement(data);
  };

  const publishAnnouncement = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter an announcement message",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Deactivate any existing announcements
      await supabase
        .from('global_announcements')
        .update({ is_active: false })
        .eq('is_active', true);

      // Create new announcement
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('global_announcements')
        .insert({
          message: message.trim(),
          is_active: true,
          created_by: user?.id,
        });

      if (error) throw error;

      toast({
        title: "Announcement Published",
        description: "Your message is now visible to all users",
      });

      setMessage('');
      await loadActiveAnnouncement();
    } catch (error) {
      console.error('Announcement error:', error);
      toast({
        title: "Error",
        description: "Failed to publish announcement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deactivateAnnouncement = async () => {
    if (!activeAnnouncement) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('global_announcements')
        .update({ is_active: false })
        .eq('id', activeAnnouncement.id);

      if (error) throw error;

      toast({
        title: "Announcement Removed",
        description: "The banner is no longer visible to users",
      });

      setActiveAnnouncement(null);
    } catch (error) {
      console.error('Deactivation error:', error);
      toast({
        title: "Error",
        description: "Failed to remove announcement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Global Announcement Panel - How it works"} steps={[{ title: 'Open', desc: 'Access the Global Announcement Panel section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Global Announcement Panel.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-amber-500" />
          Global Announcement Banner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeAnnouncement && (
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge className="mb-2 bg-green-500/20 text-green-400">
                  Currently Active
                </Badge>
                <p className="text-sm">{activeAnnouncement.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Published: {new Date(activeAnnouncement.created_at).toLocaleString()}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={deactivateAnnouncement}
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>New Announcement Message</Label>
          <Textarea
            placeholder="Enter your site-wide announcement message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
        </div>

        <Button 
          onClick={publishAnnouncement}
          disabled={loading || !message.trim()}
          className="w-full bg-amber-500 hover:bg-amber-600"
        >
          <Send className="h-4 w-4 mr-2" />
          {loading ? 'Publishing...' : 'Publish Announcement'}
        </Button>
      </CardContent>
    </Card>
    </>
  );
};
