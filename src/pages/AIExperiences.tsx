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
    { name: "Paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop", credits: 15 },
    { name: "Tokyo", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop", credits: 15 },
    { name: "New York", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop", credits: 15 },
    { name: "London", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop", credits: 15 },
    { name: "Dubai", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop", credits: 15 },
    { name: "Barcelona", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop", credits: 15 },
    { name: "Rome", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop", credits: 15 },
    { name: "Istanbul", image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=300&fit=crop", credits: 15 },
    { name: "Sydney", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&h=300&fit=crop", credits: 15 },
    { name: "Singapore", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=300&fit=crop", credits: 15 },
    { name: "Hong Kong", image: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=400&h=300&fit=crop", credits: 15 },
    { name: "Las Vegas", image: "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=400&h=300&fit=crop", credits: 15 },
    { name: "San Francisco", image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop", credits: 15 },
    { name: "Los Angeles", image: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=400&h=300&fit=crop", credits: 15 },
    { name: "Miami", image: "https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=400&h=300&fit=crop", credits: 15 },
    { name: "Amsterdam", image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=400&h=300&fit=crop", credits: 15 },
    { name: "Prague", image: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=400&h=300&fit=crop", credits: 15 },
    { name: "Vienna", image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=400&h=300&fit=crop", credits: 15 },
    { name: "Berlin", image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=400&h=300&fit=crop", credits: 15 },
    { name: "Bangkok", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&h=300&fit=crop", credits: 15 },
    { name: "Seoul", image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&h=300&fit=crop", credits: 15 },
    { name: "Budapest", image: "https://images.unsplash.com/photo-1580748789540-74e7ed4c7cdb?w=400&h=300&fit=crop", credits: 15 },
    { name: "Athens", image: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=400&h=300&fit=crop", credits: 15 },
    { name: "Lisbon", image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=400&h=300&fit=crop", credits: 15 },
    { name: "Moscow", image: "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=400&h=300&fit=crop", credits: 15 },
    { name: "Cairo", image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400&h=300&fit=crop", credits: 15 },
    { name: "Mexico City", image: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400&h=300&fit=crop", credits: 15 },
    { name: "Toronto", image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=400&h=300&fit=crop", credits: 15 },
    { name: "Copenhagen", image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=400&h=300&fit=crop", credits: 15 },
    { name: "Stockholm", image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=400&h=300&fit=crop", credits: 15 },
    { name: "Edinburgh", image: "https://images.unsplash.com/photo-1589469668336-dc64e5940586?w=400&h=300&fit=crop", credits: 15 },
    { name: "Mars", image: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=300&fit=crop", credits: 15 },
    { name: "Ancient Rome", image: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=400&h=300&fit=crop", credits: 15 },
    { name: "Underwater City", image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop", credits: 15 },
    { name: "Future Metropolis", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop", credits: 15 },
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
            Explore virtual worlds and see your future
          </p>
          <Badge variant="secondary" className="mt-4">
            Your Credits: {typeof credits === 'number' ? credits : credits.credits_remaining}
          </Badge>
        </div>

        <Tabs defaultValue="tours" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="tours">
              <Globe className="h-4 w-4 mr-2" />
              Virtual Tours
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
                    <Card key={dest.name} className="hover:shadow-xl transition-all hover:scale-105 overflow-hidden group">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={dest.image} 
                          alt={dest.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <h3 className="absolute bottom-4 left-4 font-bold text-xl text-white">{dest.name}</h3>
                      </div>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <Badge variant="secondary" className="w-full justify-center">{dest.credits} credits</Badge>
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
                {/* Immersive 3D-Style Image Viewer */}
                <div className="relative w-full h-[70vh] bg-black rounded-xl overflow-hidden group perspective-1000">
                  <div 
                    className="w-full h-full transition-all duration-700 ease-out transform-gpu"
                    style={{
                      backgroundImage: `url(${selectedTour.image_urls[currentImageIndex]})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transform: isPlaying ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    {/* Gradient Overlays for Depth */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
                    
                    {/* Navigation Controls - Street View Style */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                      {/* Left navigation */}
                      <button
                        className="col-start-1 row-start-2 flex items-center justify-start pl-8 opacity-0 hover:opacity-100 transition-all group-hover:opacity-70"
                        onClick={() => setCurrentImageIndex((prev) => 
                          prev === 0 ? selectedTour.image_urls.length - 1 : prev - 1
                        )}
                      >
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-2xl hover:bg-white hover:scale-110 transition-all">
                          <ChevronLeft className="h-8 w-8 text-primary" />
                        </div>
                      </button>
                      
                      {/* Right navigation */}
                      <button
                        className="col-start-3 row-start-2 flex items-center justify-end pr-8 opacity-0 hover:opacity-100 transition-all group-hover:opacity-70"
                        onClick={() => setCurrentImageIndex((prev) => 
                          (prev + 1) % selectedTour.image_urls.length
                        )}
                      >
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-2xl hover:bg-white hover:scale-110 transition-all">
                          <ChevronRight className="h-8 w-8 text-primary" />
                        </div>
                      </button>
                    </div>

                    {/* Bottom Control Bar */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex items-center justify-between mb-4">
                        {/* Location Info */}
                        <div className="flex items-center gap-3">
                          <div className="bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 border border-white/30">
                            <MapPin className="h-4 w-4 text-white inline mr-2" />
                            <span className="text-white font-semibold text-sm">
                              {selectedTour.destination}
                            </span>
                          </div>
                          <div className="bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 border border-white/30">
                            <span className="text-white text-sm">
                              Scene {currentImageIndex + 1} / {selectedTour.image_urls.length}
                            </span>
                          </div>
                        </div>

                        {/* Play/Pause Control */}
                        <Button
                          variant="secondary"
                          size="icon"
                          className="bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all shadow-2xl"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </Button>
                      </div>

                      {/* Progress Bar & Scene Indicators */}
                      <div className="space-y-3">
                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white transition-all duration-300 rounded-full"
                            style={{ width: `${((currentImageIndex + 1) / selectedTour.image_urls.length) * 100}%` }}
                          />
                        </div>
                        
                        {/* Scene Thumbnails */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {selectedTour.image_urls.map((_: any, idx: number) => (
                            <button
                              key={idx}
                              className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                                idx === currentImageIndex 
                                  ? 'border-white shadow-lg scale-110' 
                                  : 'border-white/30 hover:border-white/60 opacity-70 hover:opacity-100'
                              }`}
                              onClick={() => setCurrentImageIndex(idx)}
                            >
                              <div 
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${selectedTour.image_urls[idx]})` }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tour Description Card */}
                <Card className="bg-gradient-to-br from-muted/50 to-muted">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <p className="text-sm whitespace-pre-line leading-relaxed">
                        {selectedTour.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
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
