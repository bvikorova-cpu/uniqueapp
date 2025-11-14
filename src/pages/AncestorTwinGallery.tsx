import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Users } from "lucide-react";
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
  created_at: string;
}

export default function AncestorTwinGallery() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('match');
  
  const [publicMatches, setPublicMatches] = useState<MatchRecord[]>([]);
  const [featuredMatch, setFeaturedMatch] = useState<MatchRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicMatches();
    if (matchId) {
      fetchFeaturedMatch(matchId);
    }
  }, [matchId]);

  const fetchPublicMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('historical_matches')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setPublicMatches((data || []) as unknown as MatchRecord[]);
    } catch (error: any) {
      console.error('Error fetching public matches:', error);
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedMatch = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('historical_matches')
        .select('*')
        .eq('id', id)
        .eq('is_public', true)
        .single();

      if (error) throw error;

      setFeaturedMatch(data as unknown as MatchRecord);
    } catch (error: any) {
      console.error('Error fetching featured match:', error);
    }
  };

  const shareMatch = async (record: MatchRecord) => {
    const url = `${window.location.origin}/ancestor-twin/gallery?match=${record.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Historical Twin Match',
          text: `Check out this amazing historical lookalike match with ${record.matches[0]?.name}!`,
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
          <p className="mt-4 text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/ancestor-twin')}
            className="mb-4"
          >
            ← Back to Ancestor Twin
          </Button>
          
          <div className="flex items-center gap-4 mb-2">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Public Gallery</h1>
          </div>
          <p className="text-muted-foreground">
            Discover amazing historical lookalike matches from our community
          </p>
        </div>

        {featuredMatch && (
          <Card className="mb-8 border-primary/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Featured Match</CardTitle>
              <CardDescription>
                {format(new Date(featuredMatch.created_at), 'PPP')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredMatch.matches.map((match, index) => (
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
                            className="bg-primary h-full"
                            style={{ width: `${match.similarity}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{match.similarity}%</span>
                      </div>
                      {match.reason && (
                        <p className="text-xs text-muted-foreground mt-2">{match.reason}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={() => shareMatch(featuredMatch)} variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share This Match
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {publicMatches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No public matches yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share your historical twin with the community!
              </p>
              <Button onClick={() => navigate('/ancestor-twin')}>
                Find Your Match
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Community Matches</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicMatches.map((record) => (
                <Card key={record.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    navigate(`/ancestor-twin/gallery?match=${record.id}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {record.tier.charAt(0).toUpperCase() + record.tier.slice(1)} Match
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(record.created_at), 'PPP')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {record.matches[0] && (
                      <div>
                        <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                          {record.matches[0].imageUrl ? (
                            <img 
                              src={record.matches[0].imageUrl} 
                              alt={record.matches[0].name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-6xl">🎭</span>
                          )}
                        </div>
                        <h3 className="font-semibold mb-1">{record.matches[0].name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{record.matches[0].era}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-primary h-full"
                              style={{ width: `${record.matches[0].similarity}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{record.matches[0].similarity}%</span>
                        </div>
                        {record.matches.length > 1 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            +{record.matches.length - 1} more matches
                          </p>
                        )}
                      </div>
                    )}
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        shareMatch(record);
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
