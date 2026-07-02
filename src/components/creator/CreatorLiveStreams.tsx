import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Video, Calendar, Users, Lock, Play, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface LiveStream {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  access_price: number;
  is_free: boolean;
  status: string;
  scheduled_at: string | null;
  viewer_count: number;
}

interface CreatorLiveStreamsProps {
  creatorId: string;
}

export function CreatorLiveStreams({ creatorId }: CreatorLiveStreamsProps) {
  const { toast } = useToast();
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [accessList, setAccessList] = useState<string[]>([]);

  useEffect(() => {
    loadStreams();
    checkAccess();
  }, [creatorId]);

  const loadStreams = async () => {
    try {
      const { data, error } = await supabase
        .from("creator_live_streams")
        .select("*")
        .eq("creator_id", creatorId)
        .in("status", ["scheduled", "live"])
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      setStreams(data || []);
    } catch (error) {
      console.error("Error loading streams:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("creator_live_stream_access")
        .select("stream_id")
        .eq("user_id", user.id);

      if (data) {
        setAccessList(data.map((a) => a.stream_id));
      }
    } catch (error) {
      console.error("Error checking access:", error);
    }
  };

  const handlePurchaseAccess = async (stream: LiveStream) => {
    setPurchasingId(stream.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Sign In Required",
          description: "Please sign in to purchase stream access",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-stream-access-checkout", {
        body: { streamId: stream.id },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPurchasingId(null);
    }
  };

  const hasAccess = (streamId: string) => accessList.includes(streamId);

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"Creator Live Streams - How it works"} steps={[{ title: 'Open', desc: 'Access the Creator Live Streams section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Creator Live Streams.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    </>
  );
  }

  if (streams.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          Live Streams
        </CardTitle>
        <CardDescription>Upcoming and live exclusive streams</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {streams.map((stream) => (
            <Card key={stream.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {stream.thumbnail_url && (
                  <div className="md:w-48 h-32 relative">
                    <img
                      src={stream.thumbnail_url}
                      alt={stream.title}
                      className="w-full h-full object-cover"
                    />
                    {stream.status === "live" && (
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        LIVE
                      </Badge>
                    )}
                  </div>
                )}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{stream.title}</h3>
                      {stream.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {stream.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        {stream.scheduled_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(stream.scheduled_at), "PPp")}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {stream.viewer_count} viewers
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {stream.is_free ? (
                        <Badge variant="secondary">Free</Badge>
                      ) : (
                        <span className="font-bold text-lg">€{stream.access_price}</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    {stream.is_free || hasAccess(stream.id) ? (
                      <Button
                        className="w-full md:w-auto"
                        onClick={() => {
                          if (stream.status === "live") {
                            window.open(`/live-stream/${stream.id}`, "_blank");
                          } else if (stream.scheduled_at) {
                            // Generate ICS calendar reminder
                            const start = new Date(stream.scheduled_at);
                            const end = new Date(start.getTime() + 60 * 60 * 1000);
                            const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
                            const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:${stream.id}@unique\nDTSTAMP:${fmt(new Date())}\nDTSTART:${fmt(start)}\nDTEND:${fmt(end)}\nSUMMARY:${stream.title}\nDESCRIPTION:${stream.description || ""}\nEND:VEVENT\nEND:VCALENDAR`;
                            const blob = new Blob([ics], { type: "text/calendar" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${stream.title.replace(/\s+/g, "_")}.ics`;
                            a.click();
                            URL.revokeObjectURL(url);
                            toast({ title: "📅 Reminder Saved", description: "Calendar event downloaded" });
                          }
                        }}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {stream.status === "live" ? "Watch Now" : "Set Reminder"}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handlePurchaseAccess(stream)}
                        disabled={purchasingId === stream.id}
                        className="w-full md:w-auto"
                      >
                        {purchasingId === stream.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Lock className="mr-2 h-4 w-4" />
                        )}
                        Get Access (€{stream.access_price})
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
