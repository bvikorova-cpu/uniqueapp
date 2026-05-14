import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Users, Play, Radio } from "lucide-react";
import { toast } from "sonner";
import { GoLiveButton } from "@/components/influencer/GoLiveButton";
import { RecordingArchive } from "@/components/live/RecordingArchive";

interface LiveStream {
  id: string;
  title: string;
  description: string;
  influencer_id: string;
  is_live: boolean;
  viewer_count: number;
  created_at: string;
  influencer_profiles?: {
    display_name: string;
  };
}

export default function LiveStreamList() {
  const navigate = useNavigate();
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
    loadStreams();

    // Subscribe to new streams
    const channel = supabase
      .channel("live_streams_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_streams" },
        () => {
          loadStreams();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadStreams = async () => {
    try {
      const { data, error } = await supabase
        .from("live_streams")
        .select(`
          *,
          influencer_profiles(
            display_name
          )
        `)
        .eq("is_live", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStreams(data || []);
    } catch (error: any) {
      console.error("Error loading streams:", error);
      toast.error("Failed to load streams");
    } finally {
      setLoading(false);
    }
  };

  const handleWatchStream = (streamId: string) => {
    navigate(`/live/${streamId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading streams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-glow">
              <Video className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold">
            <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Live Streaming
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch live broadcasts from your favorite creators or start your own stream
          </p>

          {user && (
            <div className="flex justify-center mt-6">
              <GoLiveButton influencerId={user.id} />
            </div>
          )}
        </div>

        {/* Active Streams */}
        {streams.length === 0 ? (
          <Card className="text-center py-16 border-2 border-dashed">
            <CardContent className="space-y-4">
              <Radio className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
              <h3 className="text-2xl font-semibold">No live broadcasts at the moment</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                There are no active streams right now. Be the first to start broadcasting!
              </p>
              {user && (
                <div className="mt-6">
                  <GoLiveButton influencerId={user.id} />
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {streams.map((stream) => (
              <Card
                key={stream.id}
                className="group cursor-pointer overflow-hidden hover:shadow-glow transition-all duration-300 hover:scale-105 border-2 hover:border-indigo-500/50"
                onClick={() => handleWatchStream(stream.id)}
              >
                <CardHeader className="relative">
                  {/* Live indicator */}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-red-600 text-white animate-pulse">
                      <Radio className="w-3 h-3 mr-1" />
                      LIVE
                    </Badge>
                  </div>

                  {/* Thumbnail placeholder with gradient */}
                  <div className="relative h-48 -mx-6 -mt-6 mb-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <Video className="w-16 h-16 text-white/80 relative z-10" />
                    
                    {/* Viewer count overlay */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <Users className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-semibold">
                        {stream.viewer_count || 0}
                      </span>
                    </div>
                  </div>

                  <CardTitle className="group-hover:text-indigo-500 transition-colors">
                    {stream.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  {stream.influencer_profiles?.display_name && (
                    <p className="text-sm text-muted-foreground font-medium">
                      {stream.influencer_profiles.display_name}
                    </p>
                  )}

                  {stream.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {stream.description}
                    </p>
                  )}

                  <Button 
                    className="w-full group-hover:bg-indigo-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWatchStream(stream.id);
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch stream
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center border-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-3">
                <Video className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">Live Broadcasting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Stream in real time and interact with your audience via live chat
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">Fan Interaction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Reply to messages, receive gifts, and build your community in real time
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center mx-auto mb-3">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">Easy Launch</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                One click and you're live. No complicated setup needed
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
