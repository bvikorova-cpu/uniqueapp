import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

export default function WallEvents() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventStartTime, setNewEventStartTime] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: myEvents = [], refetch: refetchEvents } = useQuery({
    queryKey: ["my-events", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: events } = await supabase
        .from("events")
        .select("*")
        .eq("creator_id", user.id)
        .order("start_time", { ascending: true });

      return events || [];
    },
    enabled: !!user,
  });

  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(10);

      return events || [];
    },
  });

  const createEvent = async () => {
    if (!user || !newEventTitle.trim() || !newEventStartTime) return;

    const { error } = await supabase
      .from("events")
      .insert({
        title: newEventTitle,
        description: newEventDescription,
        location: newEventLocation,
        start_time: newEventStartTime,
        end_time: newEventStartTime,
        creator_id: user.id,
      });

    if (error) {
      toast({
        title: t('wall.events.error'),
        description: t('wall.events.createFailed'),
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t('wall.events.success'),
      description: t('wall.events.created'),
    });

    setIsCreateDialogOpen(false);
    setNewEventTitle("");
    setNewEventDescription("");
    setNewEventLocation("");
    setNewEventStartTime("");
    refetchEvents();
  };

  const rsvpToEvent = async (eventId: string, status: "going" | "interested") => {
    if (!user) return;

    const { error } = await supabase
      .from("event_attendees")
      .upsert({
        event_id: eventId,
        user_id: user.id,
        status,
      }, {
        onConflict: "event_id,user_id"
      });

    if (error) {
      toast({
        title: t('wall.events.error'),
        description: t('wall.events.rsvpFailed'),
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t('wall.events.success'),
      description: `${t('wall.events.markedAs')} ${status}`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">{t('wall.events.title')}</h2>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('wall.events.createEvent')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('wall.events.createNewEvent')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t('wall.events.eventTitle')}</label>
                  <Input
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder={t('wall.events.enterTitle')}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('wall.events.location')}</label>
                  <Input
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    placeholder={t('wall.events.locationPlaceholder')}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('wall.events.startTime')}</label>
                  <Input
                    type="datetime-local"
                    value={newEventStartTime}
                    onChange={(e) => setNewEventStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('wall.events.description')}</label>
                  <Textarea
                    value={newEventDescription}
                    onChange={(e) => setNewEventDescription(e.target.value)}
                    placeholder={t('wall.events.descriptionPlaceholder')}
                    rows={3}
                  />
                </div>
                <Button onClick={createEvent} className="w-full">
                  {t('wall.events.createEvent')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {myEvents.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">{t('wall.events.myEvents')} ({myEvents.length})</h3>
            <div className="space-y-4">
              {myEvents.map((event) => (
                <Card key={event.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 min-w-[60px]">
                      <div className="text-2xl font-bold text-primary">
                        {format(new Date(event.start_time), "dd")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(event.start_time), "MMM")}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{event.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(event.start_time), "PPp")}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-muted-foreground">
                        {t('wall.events.attendees')}
                      </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-4">{t('wall.events.upcomingEvents')}</h3>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 min-w-[60px]">
                    <div className="text-2xl font-bold text-primary">
                      {format(new Date(event.start_time), "dd")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(event.start_time), "MMM")}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{event.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(event.start_time), "PPp")}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => rsvpToEvent(event.id, "going")}
                      >
                        {t('wall.events.going')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rsvpToEvent(event.id, "interested")}
                      >
                        {t('wall.events.interested')}
                      </Button>
                      <span className="text-xs text-muted-foreground ml-2">
                        {t('wall.events.attendees')}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
