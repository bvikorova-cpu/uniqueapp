import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Globe, History, Clock, Sparkles, MapPin, User, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAICredits } from "@/hooks/useAICredits";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AIExperiences = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { credits, loading: creditsLoading, refresh: refreshCredits } = useAICredits();
  
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState("");
  const [tours, setTours] = useState<any[]>([]);
  const [ageYears, setAgeYears] = useState(20);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progressions, setProgressions] = useState<any[]>([]);
  const [selectedTour, setSelectedTour] = useState<any | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const destinations = [
    { name: "Paris", icon: "🗼", credits: 3 },
    { name: "Tokyo", icon: "🏯", credits: 3 },
    { name: "New York", icon: "🗽", credits: 3 },
    { name: "London", icon: "🏰", credits: 3 },
    { name: "Dubai", icon: "🏙️", credits: 3 },
    { name: "Barcelona", icon: "⛪", credits: 3 },
    { name: "Rome", icon: "🏛️", credits: 3 },
    { name: "Istanbul", icon: "🕌", credits: 3 },
    { name: "Sydney", icon: "🌉", credits: 3 },
    { name: "Singapore", icon: "🌆", credits: 3 },
    { name: "Hong Kong", icon: "🌃", credits: 3 },
    { name: "Las Vegas", icon: "🎰", credits: 3 },
    { name: "San Francisco", icon: "🌁", credits: 3 },
    { name: "Los Angeles", icon: "🎬", credits: 3 },
    { name: "Miami", icon: "🏖️", credits: 3 },
    { name: "Amsterdam", icon: "🌷", credits: 3 },
    { name: "Prague", icon: "🏰", credits: 3 },
    { name: "Vienna", icon: "🎻", credits: 3 },
    { name: "Berlin", icon: "🚪", credits: 3 },
    { name: "Bangkok", icon: "🛕", credits: 3 },
    { name: "Seoul", icon: "🏙️", credits: 3 },
    { name: "Rio de Janeiro", icon: "🏖️", credits: 3 },
    { name: "Mars", icon: "🔴", credits: 5 },
    { name: "Ancient Rome", icon: "🏛️", credits: 4 },
    { name: "Underwater City", icon: "🌊", credits: 4 },
    { name: "Future Metropolis", icon: "🌃", credits: 5 },
  ];

  const historicalFigures = [
    { name: "Albert Einstein", icon: "🧪", personality: "genius_scientist" },
    { name: "Leonardo da Vinci", icon: "🎨", personality: "renaissance_master" },
    { name: "Cleopatra", icon: "👑", personality: "ancient_ruler" },
    { name: "Marie Curie", icon: "⚛️", personality: "pioneering_scientist" },
  ];

  useEffect(() => {
    checkAuth();
    loadTours();
    loadProgressions();
  }, []);

  useEffect(() => {
    if (!isPlaying || !selectedTour?.image_urls) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => 
        (prev + 1) % selectedTour.image_urls.length
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying, selectedTour]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  const loadTours = async () => {
    const { data } = await supabase
      .from('virtual_tours')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);
    if (data) setTours(data);
  };

  const loadProgressions = async () => {
    const { data } = await supabase
      .from('age_progressions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);
    if (data) setProgressions(data);
  };

  const handleVirtualTour = async (dest: string, creditsNeeded: number) => {
    try {
      setLoading(true);
      const currentCredits = typeof credits === 'number' ? credits : credits.credits_remaining;

      if (currentCredits < creditsNeeded) {
        toast({
          title: "Insufficient Credits",
          description: `You need ${creditsNeeded} credits for this experience.`,
          variant: "destructive",
        });
        setTimeout(() => navigate("/ai-credits-store"), 2000);
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-virtual-tour', {
        body: { destination: dest }
      });

      if (error) throw error;

      toast({
        title: "✨ Virtual Tour Created!",
        description: `Enjoy your journey to ${dest}`,
      });

      await loadTours();
      await refreshCredits();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate virtual tour",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHistoricalChat = async (characterName: string) => {
    try {
      const { data: character } = await supabase
        .from('ai_characters')
        .select('*')
        .eq('name', characterName)
        .single();

      if (!character) {
        toast({
          title: "Character not found",
          variant: "destructive",
        });
        return;
      }

      const { data: conversation, error } = await supabase
        .from('character_conversations')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          character_id: character.id,
          title: `Chat with ${characterName}`
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/companions/${conversation.id}`);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    }
  };

  const handleAgeProgression = async () => {
    if (!selectedFile) {
      toast({
        title: "No image selected",
        description: "Please upload a photo first",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const currentCredits = typeof credits === 'number' ? credits : credits.credits_remaining;

      if (currentCredits < 5) {
        toast({
          title: "Insufficient Credits",
          description: "You need 5 credits for age progression.",
          variant: "destructive",
        });
        setTimeout(() => navigate("/ai-credits-store"), 2000);
        return;
      }

      // Upload image to storage
      const { data: { user } } = await supabase.auth.getUser();
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { data, error } = await supabase.functions.invoke('generate-age-progression', {
        body: { 
          imageUrl: publicUrl,
          yearsForward: ageYears
        }
      });

      if (error) throw error;

      toast({
        title: "✨ Age Progression Complete!",
        description: `See how you'll look in ${ageYears} years`,
      });

      await loadProgressions();
      await refreshCredits();
      setSelectedFile(null);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate age progression",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (creditsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-12 w-12 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Exclusive Experiences
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore virtual worlds, chat with history's greatest minds, and see your future
          </p>
          <Badge variant="secondary" className="mt-4">
            Your Credits: {typeof credits === 'number' ? credits : credits.credits_remaining}
          </Badge>
        </div>

        <Tabs defaultValue="tours" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="tours">
              <Globe className="h-4 w-4 mr-2" />
              Virtual Tours
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Historical Chats
            </TabsTrigger>
            <TabsTrigger value="future">
              <Clock className="h-4 w-4 mr-2" />
              Future Preview
            </TabsTrigger>
          </TabsList>

          {/* Virtual Tours Tab */}
          <TabsContent value="tours" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Choose Your Destination
                </CardTitle>
                <CardDescription>
                  AI-generated immersive virtual tours to any place, real or imagined
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {destinations.map((dest) => (
                    <Card key={dest.name} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                          <div className="text-6xl">{dest.icon}</div>
                          <h3 className="font-bold text-lg">{dest.name}</h3>
                          <Badge variant="secondary">{dest.credits} credits</Badge>
                          <Button
                            onClick={() => handleVirtualTour(dest.name, dest.credits)}
                            disabled={loading}
                            className="w-full"
                          >
                            {loading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Start Tour"
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {tours.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-bold text-lg mb-4">Your Recent Tours</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tours.map((tour) => (
                        <Card 
                          key={tour.id} 
                          className="hover:shadow-lg transition-all cursor-pointer group"
                          onClick={() => {
                            setSelectedTour(tour);
                            setCurrentImageIndex(0);
                            setIsPlaying(false);
                          }}
                        >
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              {tour.destination}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {tour.image_urls?.[0] && (
                              <img 
                                src={tour.image_urls[0]} 
                                alt={tour.destination}
                                className="w-full h-48 object-cover rounded-lg mb-3 group-hover:scale-105 transition-transform"
                              />
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {tour.description}
                            </p>
                            <Button variant="outline" className="w-full mt-3">
                              <Play className="h-4 w-4 mr-2" />
                              Start Virtual Tour
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Historical Chats Tab */}
          <TabsContent value="history" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Talk to Historical Figures
                </CardTitle>
                <CardDescription>
                  Have deep conversations with history's greatest minds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {historicalFigures.map((figure) => (
                    <Card key={figure.name} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="text-4xl">{figure.icon}</div>
                            <div>
                              <h3 className="font-bold">{figure.name}</h3>
                              <Badge variant="outline" className="text-xs">3 credits per chat</Badge>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleHistoricalChat(figure.name)}
                            className="w-full"
                          >
                            Start Conversation
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Future Preview Tab */}
          <TabsContent value="future" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  See Your Future Self
                </CardTitle>
                <CardDescription>
                  AI-powered age progression - see how you'll look in the future
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Upload Your Photo</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Years in the Future: {ageYears}</label>
                    <Input
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={ageYears}
                      onChange={(e) => setAgeYears(Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>

                  <Button
                    onClick={handleAgeProgression}
                    disabled={!selectedFile || loading}
                    className="w-full"
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                    ) : (
                      <>Generate Future Preview (5 credits)</>
                    )}
                  </Button>
                </div>

                {progressions.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-bold text-lg mb-4">Your Age Progressions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {progressions.map((prog) => (
                        <Card key={prog.id}>
                          <CardHeader>
                            <CardTitle className="text-base">+{prog.years_forward} Years</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {prog.aged_image_url && (
                              <img 
                                src={prog.aged_image_url} 
                                alt="Age progression"
                                className="w-full rounded-lg"
                              />
                            )}
                            {prog.description && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {prog.description}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Virtual Tour Dialog with Carousel */}
        <Dialog open={!!selectedTour} onOpenChange={() => setSelectedTour(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Globe className="h-6 w-6 text-primary" />
                {selectedTour?.destination}
              </DialogTitle>
            </DialogHeader>
            
            {selectedTour?.image_urls && selectedTour.image_urls.length > 0 && (
              <div className="space-y-4">
                {/* Image Carousel */}
                <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden group">
                  <img 
                    src={selectedTour.image_urls[currentImageIndex]} 
                    alt={`${selectedTour.destination} - Scene ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover animate-fade-in"
                    key={currentImageIndex}
                  />
                  
                  {/* Navigation Buttons */}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setCurrentImageIndex((prev) => 
                      prev === 0 ? selectedTour.image_urls.length - 1 : prev - 1
                    )}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setCurrentImageIndex((prev) => 
                      (prev + 1) % selectedTour.image_urls.length
                    )}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>

                  {/* Play/Pause Button */}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>

                  {/* Progress Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {selectedTour.image_urls.map((_: any, idx: number) => (
                      <button
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentImageIndex 
                            ? 'bg-white w-8' 
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                        onClick={() => setCurrentImageIndex(idx)}
                      />
                    ))}
                  </div>
                </div>

                {/* Tour Description */}
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm whitespace-pre-line leading-relaxed">
                      {selectedTour.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Scene Counter */}
                <div className="text-center text-sm text-muted-foreground">
                  Scene {currentImageIndex + 1} of {selectedTour.image_urls.length}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
};

export default AIExperiences;
