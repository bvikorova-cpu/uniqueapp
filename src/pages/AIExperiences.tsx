import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Globe, History, Clock, Sparkles, MapPin, User, ChevronLeft, ChevronRight, Play, Pause, Trophy, Star, Zap, CheckCircle, Info, Compass, Navigation, Eye, Maximize2, Minimize2, RotateCcw, Camera, Footprints, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAICredits } from "@/hooks/useAICredits";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

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
  const [tourPoints, setTourPoints] = useState(0);
  const [visitedDestinations, setVisitedDestinations] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewAngle, setViewAngle] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [compassAngle, setCompassAngle] = useState(0);
  const viewerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const destinations = [
    { name: "Paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop", credits: 15, landmark: "Eiffel Tower" },
    { name: "Tokyo", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop", credits: 15, landmark: "Shibuya Crossing" },
    { name: "New York", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop", credits: 15, landmark: "Times Square" },
    { name: "London", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop", credits: 15, landmark: "Big Ben" },
    { name: "Dubai", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop", credits: 15, landmark: "Burj Khalifa" },
    { name: "Barcelona", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop", credits: 15, landmark: "Sagrada Família" },
    { name: "Rome", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop", credits: 15, landmark: "Colosseum" },
    { name: "Istanbul", image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop", credits: 15, landmark: "Hagia Sophia" },
    { name: "Sydney", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop", credits: 15, landmark: "Opera House" },
    { name: "Singapore", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop", credits: 15, landmark: "Marina Bay" },
    { name: "Hong Kong", image: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&h=600&fit=crop", credits: 15, landmark: "Victoria Peak" },
    { name: "Las Vegas", image: "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=800&h=600&fit=crop", credits: 15, landmark: "The Strip" },
    { name: "San Francisco", image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop", credits: 15, landmark: "Golden Gate" },
    { name: "Los Angeles", image: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800&h=600&fit=crop", credits: 15, landmark: "Hollywood" },
    { name: "Miami", image: "https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=800&h=600&fit=crop", credits: 15, landmark: "South Beach" },
    { name: "Amsterdam", image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800&h=600&fit=crop", credits: 15, landmark: "Canal Ring" },
    { name: "Prague", image: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=600&fit=crop", credits: 15, landmark: "Charles Bridge" },
    { name: "Vienna", image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&h=600&fit=crop", credits: 15, landmark: "Schönbrunn" },
    { name: "Berlin", image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=600&fit=crop", credits: 15, landmark: "Brandenburg Gate" },
    { name: "Bangkok", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop", credits: 15, landmark: "Grand Palace" },
    { name: "Seoul", image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&h=600&fit=crop", credits: 15, landmark: "Gyeongbokgung" },
    { name: "Athens", image: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop", credits: 15, landmark: "Acropolis" },
    { name: "Lisbon", image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&h=600&fit=crop", credits: 15, landmark: "Belém Tower" },
    { name: "Moscow", image: "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800&h=600&fit=crop", credits: 15, landmark: "Red Square" },
    { name: "Cairo", image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&h=600&fit=crop", credits: 15, landmark: "Pyramids" },
    { name: "Mexico City", image: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&h=600&fit=crop", credits: 15, landmark: "Zócalo" },
    { name: "Toronto", image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&h=600&fit=crop", credits: 15, landmark: "CN Tower" },
    { name: "Copenhagen", image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&h=600&fit=crop", credits: 15, landmark: "Nyhavn" },
    { name: "Stockholm", image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&h=600&fit=crop", credits: 15, landmark: "Gamla Stan" },
    { name: "Mars", image: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=600&fit=crop", credits: 15, landmark: "Olympus Mons" },
    { name: "Ancient Rome", image: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&h=600&fit=crop", credits: 15, landmark: "Forum Romanum" },
    { name: "Underwater City", image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop", credits: 15, landmark: "Coral Palace" },
    { name: "Future Metropolis", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop", credits: 15, landmark: "Sky District" },
  ];

  useEffect(() => {
    checkAuth();
    loadTours();
    loadProgressions();
  }, []);

  useEffect(() => {
    if (!isPlaying || !selectedTour?.image_urls) return;
    
    const interval = setInterval(() => {
      handleNextScene();
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, selectedTour, currentImageIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!selectedTour) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'd':
          handleNextScene();
          break;
        case 'ArrowLeft':
        case 'a':
          handlePrevScene();
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
        case 'Escape':
          if (isFullscreen) setIsFullscreen(false);
          else setSelectedTour(null);
          break;
        case 'f':
          setIsFullscreen(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTour, isFullscreen, currentImageIndex]);

  // Mouse drag for panoramic look
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setViewAngle(prev => ({
      x: Math.max(-30, Math.min(30, prev.x + dy * 0.15)),
      y: prev.y + dx * 0.15
    }));
    setCompassAngle(prev => prev + dx * 0.15);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleNextScene = () => {
    if (!selectedTour?.image_urls) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % selectedTour.image_urls.length);
      setViewAngle({ x: 0, y: 0 });
      setCompassAngle(prev => prev + 90);
      setTimeout(() => setIsTransitioning(false), 400);
    }, 300);
  };

  const handlePrevScene = () => {
    if (!selectedTour?.image_urls) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) => prev === 0 ? selectedTour.image_urls.length - 1 : prev - 1);
      setViewAngle({ x: 0, y: 0 });
      setCompassAngle(prev => prev - 90);
      setTimeout(() => setIsTransitioning(false), 400);
    }, 300);
  };

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) navigate("/auth");
  };

  const loadTours = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('virtual_tours')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) {
      setTours(data);
      const uniqueDestinations = [...new Set(data.map(tour => tour.destination))];
      setVisitedDestinations(uniqueDestinations);
      setTourPoints(uniqueDestinations.length);
    }
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
        toast({ title: "Insufficient Credits", description: `You need ${creditsNeeded} credits.`, variant: "destructive" });
        setTimeout(() => navigate("/ai-credits-store"), 2000);
        return;
      }
      const { data, error } = await supabase.functions.invoke('generate-virtual-tour', { body: { destination: dest } });
      if (error) throw error;
      toast({ title: "✨ Virtual Tour Created!", description: `Enjoy your journey to ${dest}` });
      await loadTours();
      await refreshCredits();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Failed to generate virtual tour", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAgeProgression = async () => {
    if (!selectedFile) {
      toast({ title: "No image selected", description: "Please upload a photo first", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const currentCredits = typeof credits === 'number' ? credits : credits.credits_remaining;
      if (currentCredits < 5) {
        toast({ title: "Insufficient Credits", description: "You need 5 credits for age progression.", variant: "destructive" });
        setTimeout(() => navigate("/ai-credits-store"), 2000);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, selectedFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const { error } = await supabase.functions.invoke('generate-age-progression', {
        body: { imageUrl: publicUrl, yearsForward: ageYears }
      });
      if (error) throw error;
      toast({ title: "✨ Age Progression Complete!", description: `See how you'll look in ${ageYears} years` });
      await loadProgressions();
      await refreshCredits();
      setSelectedFile(null);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Failed to generate age progression", variant: "destructive" });
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

  // ====== IMMERSIVE STREET VIEW TOUR VIEWER ======
  const renderStreetViewTour = () => {
    if (!selectedTour) return null;

    const images = selectedTour.image_urls || [];
    if (images.length === 0) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 bg-black ${isFullscreen ? '' : ''}`}
        >
          {/* Main Panoramic Viewer */}
          <div
            ref={viewerRef}
            className="relative w-full h-full overflow-hidden select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
          >
            {/* Background Image with Parallax */}
            <motion.div
              className="absolute inset-[-60px] transition-opacity duration-500"
              animate={{
                x: -viewAngle.y * 2,
                y: -viewAngle.x * 2,
                scale: 1.15,
              }}
              transition={{ type: "spring", stiffness: 100, damping: 30 }}
              style={{
                opacity: isTransitioning ? 0 : 1,
              }}
            >
              <img
                src={images[currentImageIndex]}
                alt={`${selectedTour.destination} - Scene ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </motion.div>

            {/* Vignette Effect */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)',
            }} />

            {/* Walking Transition Overlay */}
            <AnimatePresence>
              {isTransitioning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                  >
                    <Footprints className="h-12 w-12 text-white/80" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Top Bar - Google Maps Style */}
            <div className="absolute top-0 left-0 right-0 p-4 z-20">
              <div className="flex items-center justify-between">
                {/* Location Info */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="bg-black/70 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/10 flex items-center gap-3 shadow-2xl">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-lg leading-tight">{selectedTour.destination}</h2>
                      <p className="text-white/60 text-xs">
                        {destinations.find(d => d.name === selectedTour.destination)?.landmark || 'Virtual Tour'}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-black/50 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20 rounded-xl"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-black/50 backdrop-blur-xl border border-white/10 text-white hover:bg-red-500/50 rounded-xl"
                    onClick={() => {
                      setSelectedTour(null);
                      setIsFullscreen(false);
                      setViewAngle({ x: 0, y: 0 });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Street View Navigation Arrows (on the ground) */}
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
              {/* Forward Arrow */}
              <motion.button
                whileHover={{ scale: 1.15, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center hover:bg-white/40 transition-colors shadow-2xl"
                onClick={handleNextScene}
              >
                <ArrowUp className="h-8 w-8 text-white drop-shadow-lg" />
              </motion.button>
              
              <div className="flex gap-12">
                {/* Left Arrow */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"
                  onClick={handlePrevScene}
                >
                  <ArrowLeft className="h-6 w-6 text-white/80" />
                </motion.button>
                
                {/* Right Arrow */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"
                  onClick={handleNextScene}
                >
                  <ArrowRight className="h-6 w-6 text-white/80" />
                </motion.button>
              </div>
            </div>

            {/* Compass */}
            <div className="absolute bottom-36 right-6 z-20">
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                <motion.div
                  animate={{ rotate: -compassAngle }}
                  transition={{ type: "spring", stiffness: 60, damping: 15 }}
                >
                  <Compass className="h-8 w-8 text-white/90" />
                </motion.div>
              </div>
            </div>

            {/* Bottom Panel */}
            <div className="absolute bottom-0 left-0 right-0 z-20">
              <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-16 pb-6 px-6">
                <div className="max-w-4xl mx-auto">
                  {/* Scene Counter & Controls */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-white/15 text-white border-white/20 backdrop-blur-sm text-sm px-4 py-1.5">
                        <Camera className="h-3.5 w-3.5 mr-2" />
                        Scene {currentImageIndex + 1} of {images.length}
                      </Badge>
                      <Badge className="bg-blue-500/30 text-blue-200 border-blue-400/30 backdrop-blur-sm text-sm px-4 py-1.5">
                        <Eye className="h-3.5 w-3.5 mr-2" />
                        360° View
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white/10 text-white hover:bg-white/20 rounded-xl border border-white/10"
                        onClick={() => {
                          setViewAngle({ x: 0, y: 0 });
                          setCompassAngle(0);
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-xl border border-white/10 ${
                          isPlaying 
                            ? 'bg-blue-500/30 text-blue-200 hover:bg-blue-500/40' 
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                        {isPlaying ? 'Pause Walk' : 'Auto Walk'}
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                      animate={{ width: `${((currentImageIndex + 1) / images.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  {/* Scene Thumbnails - Film Strip Style */}
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((_: any, idx: number) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                          idx === currentImageIndex
                            ? 'border-blue-400 shadow-lg shadow-blue-500/30 ring-1 ring-blue-400/50'
                            : 'border-white/15 hover:border-white/40 opacity-60 hover:opacity-100'
                        }`}
                        onClick={() => {
                          setIsTransitioning(true);
                          setTimeout(() => {
                            setCurrentImageIndex(idx);
                            setViewAngle({ x: 0, y: 0 });
                            setTimeout(() => setIsTransitioning(false), 400);
                          }, 300);
                        }}
                      >
                        <img
                          src={images[idx]}
                          alt={`Scene ${idx + 1}`}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      </motion.button>
                    ))}
                  </div>

                  {/* Description */}
                  {selectedTour.description && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-white/70 text-sm mt-3 line-clamp-2 max-w-2xl"
                    >
                      {selectedTour.description}
                    </motion.p>
                  )}
                </div>
              </div>
            </div>

            {/* Drag Hint */}
            <AnimatePresence>
              {!isDragging.current && viewAngle.x === 0 && viewAngle.y === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
                >
                  <motion.div
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ repeat: 3, duration: 2 }}
                    className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20"
                  >
                    <Navigation className="h-4 w-4 text-white" />
                    <span className="text-white/80 text-sm font-medium">Drag to look around</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-12 w-12 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Exclusive Experiences
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore virtual worlds and see your future
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            <Badge variant="secondary">
              Your Credits: {typeof credits === 'number' ? credits : credits.credits_remaining}
            </Badge>
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
              <Trophy className="h-4 w-4 mr-1" />
              Tour Points: {tourPoints}
            </Badge>
          </div>
        </div>

        {/* Description Card */}
        <Card className="mb-8 bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5 text-primary" />
              What is Exclusive Experiences?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Exclusive Experiences is your gateway to AI-powered virtual adventures and future visualizations. 
              Explore stunning destinations around the world through immersive AI-generated virtual tours with a Google Street View-like experience, 
              or glimpse into your future with our age progression technology.
            </p>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                How to Use
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li><strong>Virtual Tours:</strong> Choose a destination and walk through it in an immersive 360° Street View experience</li>
                <li><strong>Street View Controls:</strong> Drag to look around, click arrows to walk forward, use keyboard (WASD/Arrows)</li>
                <li><strong>Future Preview:</strong> Upload your photo and see how you'll look 10-50 years in the future</li>
                <li><strong>Earn Points:</strong> Each unique destination you visit earns you 1 tour point - collect them all!</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-primary" />
                <span>33 Destinations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-primary" />
                <span>15 Credits/Tour</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-primary" />
                <span>1 Point/Destination</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>{tourPoints}/{destinations.length} Visited</span>
              </div>
            </div>
          </CardContent>
        </Card>

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
            <div>
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">Choose Your Destination</h2>
                  <p className="text-muted-foreground text-sm">Walk through cities in immersive Street View mode</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {destinations.map((dest) => {
                  const isVisited = visitedDestinations.includes(dest.name);
                  return (
                    <motion.div
                      key={dest.name}
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card className={`overflow-hidden group cursor-pointer h-full ${isVisited ? 'ring-2 ring-green-500/40' : ''}`}>
                        <div className="relative h-44 overflow-hidden">
                          <img 
                            src={dest.image} 
                            alt={dest.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          

                          {isVisited && (
                            <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Visited
                            </Badge>
                          )}

                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="font-bold text-xl text-white drop-shadow-lg">{dest.name}</h3>
                            <p className="text-white/70 text-xs">{dest.landmark}</p>
                          </div>
                        </div>
                        <CardContent className="pt-3 pb-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">{dest.credits} credits</Badge>
                              {isVisited && (
                                <Badge variant="outline" className="text-green-600 border-green-500 text-xs">
                                  +1 Point
                                </Badge>
                              )}
                            </div>
                            <Button
                              onClick={() => handleVirtualTour(dest.name, dest.credits)}
                              disabled={loading}
                              className="w-full"
                              size="sm"
                            >
                              {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Footprints className="h-4 w-4 mr-2" />
                                  {isVisited ? "Walk Again" : "Start Walking"}
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {tours.length > 0 && (
                <div className="mt-10">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Your Recent Tours
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tours.map((tour) => (
                      <motion.div key={tour.id} whileHover={{ y: -2 }}>
                        <Card 
                          className="hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
                          onClick={() => {
                            setSelectedTour(tour);
                            setCurrentImageIndex(0);
                            setIsPlaying(false);
                            setViewAngle({ x: 0, y: 0 });
                            setCompassAngle(0);
                          }}
                        >
                          {tour.image_urls?.[0] && (
                            <div className="relative h-40 overflow-hidden">
                              <img 
                                src={tour.image_urls[0]} 
                                alt={tour.destination}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500/80 backdrop-blur-sm flex items-center justify-center">
                                  <Footprints className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-white font-semibold">{tour.destination}</span>
                              </div>
                              <Badge className="absolute top-3 right-3 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                                {tour.image_urls?.length || 0} scenes
                              </Badge>
                            </div>
                          )}
                          <CardContent className="pt-3 pb-3">
                            <p className="text-sm text-muted-foreground line-clamp-2">{tour.description}</p>
                            <Button variant="outline" className="w-full mt-3" size="sm">
                              <Play className="h-4 w-4 mr-2" />
                              Enter Street View
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
                    <Input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="mt-2" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Years in the Future: {ageYears}</label>
                    <Input type="range" min="10" max="50" step="5" value={ageYears} onChange={(e) => setAgeYears(Number(e.target.value))} className="mt-2" />
                  </div>
                  <Button onClick={handleAgeProgression} disabled={!selectedFile || loading} className="w-full">
                    {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>) : (<>Generate Future Preview (5 credits)</>)}
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
                              <img src={prog.aged_image_url} alt="Age progression" className="w-full rounded-lg" />
                            )}
                            {prog.description && (
                              <p className="text-sm text-muted-foreground mt-2">{prog.description}</p>
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
      </div>

      {/* Immersive Street View Overlay */}
      {renderStreetViewTour()}

      <Footer />
    </div>
  );
};

export default AIExperiences;
