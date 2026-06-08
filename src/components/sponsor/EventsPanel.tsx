import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarRange } from "lucide-react";

interface Props { sponsorId: string; }

type Event = {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  status: string;
  scheduled_for: string | null;
  deliverables: any;
};

const statusColor: Record<string, string> = {
  planned: "bg-blue-500/20 text-blue-300",
  in_progress: "bg-yellow-500/20 text-yellow-300",
  completed: "bg-green-500/20 text-green-300",
  cancelled: "bg-red-500/20 text-red-300",
};

export function EventsPanel({ sponsorId }: Props) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("brand_sponsor_events")
        .select("id, title, description, event_type, status, scheduled_for, deliverables")
        .eq("sponsor_id", sponsorId)
        .order("scheduled_for", { ascending: false, nullsFirst: false });
      setEvents((data ?? []) as Event[]);
      setLoading(false);
    })();
  }, [sponsorId]);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-purple-400" />;

  return (
    <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CalendarRange className="h-5 w-5" /> Marketing & Custom Activations
        </CardTitle>
        <CardDescription>
          Co-branded events, press, and bespoke campaigns delivered by the Unique team.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.length === 0 ? (
          <p className="text-gray-400">
            No activations yet. Your account manager will add planned events here.
          </p>
        ) : (
          events.map((e) => {
            const deliverables: string[] = Array.isArray(e.deliverables) ? e.deliverables : [];
            return (
              <div key={e.id} className="rounded-lg border border-purple-500/30 p-4 bg-black/30">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-white font-semibold">{e.title}</div>
                    <div className="text-xs text-gray-400 capitalize">
                      {e.event_type.replace("_", " ")}
                      {e.scheduled_for && ` • ${new Date(e.scheduled_for).toLocaleDateString()}`}
                    </div>
                  </div>
                  <Badge className={statusColor[e.status] ?? ""}>{e.status}</Badge>
                </div>
                {e.description && <p className="text-sm text-gray-300 mt-2">{e.description}</p>}
                {deliverables.length > 0 && (
                  <ul className="text-xs text-gray-400 list-disc ml-5 mt-2">
                    {deliverables.map((d, i) => <li key={i}>{String(d)}</li>)}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
