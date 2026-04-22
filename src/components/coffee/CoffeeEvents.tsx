import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "sonner";

export const CoffeeEvents = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['coffee-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coffee_events')
        .select(`
          *,
          cafe:coffee_cafes(name, city, country)
        `)
        .eq('status', 'upcoming')
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div>Loading events...</div>;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events?.map((event) => (
        <Card key={event.id}>
          <CardHeader>
            {event.image_url && (
              <img 
                src={event.image_url} 
                alt={event.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <CardTitle>{event.title}</CardTitle>
            <CardDescription>{event.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(event.event_date), 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{event.cafe?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{event.max_participants} spots</span>
            </div>
            <div className="pt-2">
              <Button className="w-full" onClick={() => console.info("[Coming soon] Join Event - €")}>
                Join Event - €{event.ticket_price}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};