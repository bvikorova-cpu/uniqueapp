import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock } from "lucide-react";
import { format } from "date-fns";

export function AppointmentsPanel() {
  const { data: appts = [], isLoading } = useQuery({
    queryKey: ["hc-appointments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("healthcare_appointments" as any)
        .select("*")
        .eq("provider_id", user.id)
        .order("scheduled_at", { ascending: true })
        .limit(50);
      return (data as any[]) ?? [];
    },
  });

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading appointments…</div>;

  if (appts.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarClock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No appointments scheduled</h3>
        <p className="text-muted-foreground text-sm">
          Patients who book with you will appear here in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appts.map((a) => (
        <Card key={a.id}>
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold truncate">
                {format(new Date(a.scheduled_at), "PPpp")}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {a.reason || "No reason provided"} · {a.duration_minutes} min
              </div>
            </div>
            <Badge variant={a.status === "confirmed" ? "default" : "outline"}>
              {a.status}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
