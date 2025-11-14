import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Share2, Eye, EyeOff, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface HistoricalMatch {
  name: string;
  era: string;
  similarity: number;
  bio?: string;
  imageUrl?: string;
  reason?: string;
}

interface MatchRecord {
  id: string;
  tier: string;
  matches: HistoricalMatch[];
  is_public: boolean;
  created_at: string;
}

export default function AncestorTwinHistory() {
  const navigate = useNavigate();
  const [matchRecords, setMatchRecords] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchMatchHistory();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchMatchHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('historical_matches')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMatchRecords((data || []) as unknown as MatchRecord[]);
    } catch (error: any) {
      console.error('Error fetching match history:', error);
      toast.error("Failed to load match history");
    } finally {
      setLoading(false);
    }
  };

  const togglePrivacy = async (recordId: string, currentPrivacy: boolean) => {
    try {
      const { error } = await supabase
        .from('historical_matches')
        .update({ is_public: !currentPrivacy })
        .eq('id', recordId);

      if (error) throw error;

      setMatchRecords(prev =>
        prev.map(record =>
          record.id === recordId ? { ...record, is_public: !currentPrivacy } : record
        )
      );

      toast.success(`Match ${!currentPrivacy ? 'made public' : 'made private'}`);
    } catch (error: any) {
      console.error('Error updating privacy:', error);
      toast.error("Failed to update privacy settings");
    }
  };

  const deleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this match record?')) return;

    try {
      const { error } = await supabase
        .from('historical_matches')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      setMatchRecords(prev => prev.filter(record => record.id !== recordId));
      toast.success("Match record deleted");
    } catch (error: any) {
      console.error('Error deleting record:', error);
      toast.error("Failed to delete record");
    }
  };

  const shareMatch = async (record: MatchRecord) => {
    const url = `${window.location.origin}/ancestor-twin/gallery?match=${record.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Historical Twin!',
          text: `I found my historical lookalike! Check out my match with ${record.matches[0]?.name}`,
          url,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your match history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/ancestor-twin')}
            className="mb-4"
          >
            ← Back to Ancestor Twin
          </Button>
          
          <h1 className="text-4xl font-bold mb-2">Your Match History</h1>
          <p className="text-muted-foreground">
            View and manage all your historical lookalike matches
          </p>
        </div>

        {matchRecords.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first photo to discover your historical twin!
              </p>
              <Button onClick={() => navigate('/ancestor-twin')}>
                Find Your Match
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {matchRecords.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {record.tier.charAt(0).toUpperCase() + record.tier.slice(1)} Analysis
                      </CardTitle>
                      <CardDescription>
                        {format(new Date(record.created_at), 'PPP p')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 mr-4">
                        {record.is_public ? (
                          <Eye className="w-4 h-4 text-primary" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        )}
                        <Label htmlFor={`privacy-${record.id}`} className="text-sm">
                          {record.is_public ? 'Public' : 'Private'}
                        </Label>
                        <Switch
                          id={`privacy-${record.id}`}
                          checked={record.is_public}
                          onCheckedChange={() => togglePrivacy(record.id, record.is_public)}
                        />
                      </div>
                      {record.is_public && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => shareMatch(record)}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteRecord(record.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {record.matches.map((match, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                            {match.imageUrl ? (
                              <img 
                                src={match.imageUrl} 
                                alt={match.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-6xl">🎭</span>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg mb-1">{match.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{match.era}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-primary h-full transition-all duration-500"
                                style={{ width: `${match.similarity}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{match.similarity}%</span>
                          </div>
                          {match.reason && (
                            <p className="text-xs text-muted-foreground">{match.reason}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
