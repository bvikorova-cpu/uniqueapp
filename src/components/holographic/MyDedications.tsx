import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Play, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";

const MyDedications = () => {
  const [dedications, setDedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDedications();
  }, []);

  const loadDedications = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-user-concerts');
      if (error) throw error;
      setDedications(data.dedications || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (dedications.length === 0) {
    return null;
  }

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-950/10 to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <MessageSquare className="w-6 h-6 text-purple-400" />
          My AI Dedications
        </CardTitle>
        <CardDescription>
          Personalized messages from holographic artists
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dedications.map((dedication) => (
            <Card key={dedication.id} className="border-purple-500/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-purple-400">
                      {dedication.artist_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      For: {dedication.recipient_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(dedication.created_at), 'PPP')}
                    </p>
                  </div>
                  <Badge 
                    variant={dedication.status === 'completed' ? 'default' : 'secondary'}
                    className={dedication.status === 'completed' ? 'bg-green-500' : ''}
                  >
                    {dedication.status}
                  </Badge>
                </div>

                {dedication.dedication_text && (
                  <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-sm italic">"{dedication.dedication_text}"</p>
                  </div>
                )}

                {dedication.status === 'completed' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play Audio
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="border-purple-500/30"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MyDedications;
