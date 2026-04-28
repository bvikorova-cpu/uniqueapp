import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export const GlobalAnnouncementBanner = () => {
  const [announcement, setAnnouncement] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadAnnouncement = async () => {
      const { data } = await supabase
        .from('global_announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cancelled) {
        setAnnouncement(data);
        setDismissed(false);
      }
    };

    loadAnnouncement();

    // Subscribe to changes
    const channel = supabase
      .channel(`global-announcements-${crypto.randomUUID()}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'global_announcements',
      }, () => {
        loadAnnouncement();
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  if (!announcement || dismissed) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Megaphone className="h-5 w-5 animate-pulse" />
          <p className="text-sm font-medium">{announcement.message}</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setDismissed(true)}
          className="text-white hover:bg-white/20 h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
