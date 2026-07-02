import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
    <>
      <FloatingHowItWorks title={"Coffee Events - How it works"} steps={[{ title: 'Open', desc: 'Access the Coffee Events section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coffee Events.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
              <Button className="w-full" onClick={async () => {
                try {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) { toast.error("Please sign in first"); return; }
                  const { data, error } = await supabase.functions.invoke("create-checkout", {
                    body: { product_type: "coffee_event", event_id: event.id, amount: event.ticket_price, name: event.title }
                  });
                  if (error) throw error;
                  if (data?.url) window.open(data.url, "_blank");
                  else toast.success("Joined the event!");
                } catch (e: any) {
                  toast.error(e.message || "Failed to join event");
                }
              }}>
                Join Event - €{event.ticket_price}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    </>
  );
};