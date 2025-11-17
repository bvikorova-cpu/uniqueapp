import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Video, Play, Download, Loader2, AlertCircle } from "lucide-react";

const MyRecordings = () => {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAccessAndLoad();
  }, []);

  const checkAccessAndLoad = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('has_holographic_access', {
        user_id_param: session.user.id,
        service_type_param: 'concert_recording'
      });

      if (!error) {
        setHasAccess(data);
        if (data) await loadRecordings();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecordings = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-user-concerts');
      if (error) throw error;
      setRecordings(data.recordings || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-950/10 to-background">
        <CardContent className="py-12 text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto" />
          <h3 className="text-xl font-semibold">Access Required</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Purchase "Concert Recording - HD" to access recordings
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-950/10 to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Video className="w-6 h-6 text-purple-400" />
          My Concert Recordings
        </CardTitle>
        <CardDescription>
          High-quality 4K recordings of holographic concerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recordings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No recordings purchased yet
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recordings.map((recording) => (
              <Card key={recording.id} className="border-purple-500/30">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-purple-400">
                      {recording.concert?.title || 'Concert Recording'}
                    </h4>
                    <Badge className="bg-blue-500/20 text-blue-300">
                      {recording.quality}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Duration: {recording.duration_minutes || recording.concert?.duration_minutes} minutes
                  </p>

                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Watch
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="border-purple-500/30"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyRecordings;
