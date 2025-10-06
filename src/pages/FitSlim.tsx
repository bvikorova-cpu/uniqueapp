import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Clock, ChefHat, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const FitSlim = () => {
  const [activeTab, setActiveTab] = useState("weight-loss-videos");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const weightLossVideos = [
    {
      id: 1,
      title: "10-minútový HIIT tréning na chudnutie",
      duration: "10 min",
      difficulty: "Stredná",
      calories: "150 kcal",
      thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/embed/ml6cT4AZdqI?autoplay=1&rel=0",
    },
    {
      id: 2,
      title: "Kardio pre začiatočníkov",
      duration: "15 min",
      difficulty: "Ľahká",
      calories: "120 kcal",
      thumbnail: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/embed/gC_L9qAHVJ8?autoplay=1&rel=0",
    },
    {
      id: 3,
      title: "Celé telo - spaľovanie tukov",
      duration: "20 min",
      difficulty: "Náročná",
      calories: "250 kcal",
      thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/embed/UItWltVZZmE?autoplay=1&rel=0",
    },
    {
      id: 4,
      title: "Tabata tréning - intenzívne spaľovanie kalórií",
      duration: "25 min",
      difficulty: "Náročná",
      calories: "300 kcal",
      thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/embed/20LH4dEeWg0?autoplay=1&rel=0",
    },
    {
      id: 5,
      title: "Cvičenie na chudnutie brucha",
      duration: "12 min",
      difficulty: "Stredná",
      calories: "100 kcal",
      thumbnail: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/embed/1919eTCoESo?autoplay=1&rel=0",
    },
    {
      id: 6,
      title: "Bodyweight tréning na chudnutie",
      duration: "18 min",
      difficulty: "Stredná",
      calories: "200 kcal",
      thumbnail: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=800&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/embed/cbKkB3POqaY?autoplay=1&rel=0",
    },
  ];

  const healthVideos = [
    {
      id: 1,
      title: "Ranná jóga pre energiu",
      duration: "15 min",
      difficulty: "Ľahká",
      benefit: "Energia a flexibilita",
      thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/embed/v7AYKMP6rOE?autoplay=1&rel=0",
    },
    {
      id: 2,
      title: "Strečing pre zdravý chrbát",
      duration: "10 min",
      difficulty: "Ľahká",
      benefit: "Úľava od bolesti",
      thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/embed/qULTwquOuT4?autoplay=1&rel=0",
    },
    {
      id: 3,
      title: "Meditácia a dýchacie cvičenia",
      duration: "12 min",
      difficulty: "Ľahká",
      benefit: "Zníženie stresu",
      thumbnail: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/embed/inpok4MKVLM?autoplay=1&rel=0",
    },
    {
      id: 4,
      title: "Pilates pre silné centrum tela",
      duration: "20 min",
      difficulty: "Stredná",
      benefit: "Spevnenie jadra",
      thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/embed/K56Z12XH6WY?autoplay=1&rel=0",
    },
    {
      id: 5,
      title: "Rehabilitačné cvičenia pre kolená",
      duration: "14 min",
      difficulty: "Ľahká",
      benefit: "Posilnenie kĺbov",
      thumbnail: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/embed/AXcJRHYfz5U?autoplay=1&rel=0",
    },
    {
      id: 6,
      title: "Mobilita ramien a krku",
      duration: "8 min",
      difficulty: "Ľahká",
      benefit: "Odstránenie napätia",
      thumbnail: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/embed/3j_jHMy5JBQ?autoplay=1&rel=0",
    },
  ];

  const weightLossRecipes = [
    {
      id: 1,
      title: "Zeleninový šalát s grilovaným kuracím mäsom",
      calories: "320 kcal",
      protein: "35g",
      time: "20 min",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Quinoa s pečenou zeleninou",
      calories: "280 kcal",
      protein: "12g",
      time: "30 min",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Proteinový smoothie s ovocím",
      calories: "250 kcal",
      protein: "25g",
      time: "5 min",
      image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop",
    },
    {
      id: 4,
      title: "Zeleninová polievka so šošovicou",
      calories: "210 kcal",
      protein: "15g",
      time: "35 min",
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop",
    },
    {
      id: 5,
      title: "Grilovaný losos s ružičkovým kelom",
      calories: "340 kcal",
      protein: "38g",
      time: "25 min",
      image: "https://images.unsplash.com/photo-1485704686097-ed47f7263ca4?w=800&auto=format&fit=crop",
    },
    {
      id: 6,
      title: "Zeleninové wrap s hummusom",
      calories: "290 kcal",
      protein: "14g",
      time: "15 min",
      image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&auto=format&fit=crop",
    },
    {
      id: 7,
      title: "Cottage cheese s uhorkou a paradajkami",
      calories: "180 kcal",
      protein: "20g",
      time: "10 min",
      image: "https://images.unsplash.com/photo-1609501676725-7186f017a4b0?w=800&auto=format&fit=crop",
    },
    {
      id: 8,
      title: "Vajíčková omeleta so špenátom",
      calories: "240 kcal",
      protein: "22g",
      time: "12 min",
      image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=800&auto=format&fit=crop",
    },
  ];

  const healthyRecipes = [
    {
      id: 1,
      title: "Ovesná kaša s čerstvým ovocím",
      calories: "350 kcal",
      benefit: "Energia na celý deň",
      time: "10 min",
      image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Pečený losos s brokolicou",
      calories: "420 kcal",
      benefit: "Omega-3 mastné kyseliny",
      time: "25 min",
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Avokádový toast s vajíčkom",
      calories: "380 kcal",
      benefit: "Zdravé tuky",
      time: "15 min",
      image: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=800&auto=format&fit=crop",
    },
    {
      id: 4,
      title: "Grécky jogurt s orechmi a medom",
      calories: "310 kcal",
      benefit: "Probiotika",
      time: "5 min",
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&auto=format&fit=crop",
    },
    {
      id: 5,
      title: "Kurací vývar s domácimi rezancami",
      calories: "280 kcal",
      benefit: "Posilnenie imunity",
      time: "45 min",
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop",
    },
    {
      id: 6,
      title: "Smoothie bowl s chia semienkami",
      calories: "330 kcal",
      benefit: "Antioxidanty",
      time: "8 min",
      image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&auto=format&fit=crop",
    },
    {
      id: 7,
      title: "Pečené sladké zemiaky s čiernou fazuľou",
      calories: "390 kcal",
      benefit: "Vláknina a vitamíny",
      time: "40 min",
      image: "https://images.unsplash.com/photo-1608039829572-78524f79c661?w=800&auto=format&fit=crop",
    },
    {
      id: 8,
      title: "Tuniakový šalát s avokádom",
      calories: "360 kcal",
      benefit: "Omega-3 a bielkoviny",
      time: "12 min",
      image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&auto=format&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Fit & Slim
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Vaša cesta k zdravšiemu životnému štýlu začína tu. Nájdite tréningy, recepty a tipy pre lepšiu kondíciu.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger value="weight-loss-videos">
              <Play className="h-4 w-4 mr-2" />
              Chudnutie
            </TabsTrigger>
            <TabsTrigger value="health-videos">
              <Heart className="h-4 w-4 mr-2" />
              Zdravie
            </TabsTrigger>
            <TabsTrigger value="weight-loss-recipes">
              <ChefHat className="h-4 w-4 mr-2" />
              Recepty na chudnutie
            </TabsTrigger>
            <TabsTrigger value="healthy-recipes">
              <ChefHat className="h-4 w-4 mr-2" />
              Zdravé recepty
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weight-loss-videos" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weightLossVideos.map((video) => (
                <Card 
                  key={video.id} 
                  className="overflow-hidden hover:shadow-elegant transition-all cursor-pointer"
                  onClick={() => setSelectedVideo(video.videoUrl)}
                >
                  <div className="relative aspect-video">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/50 transition-colors">
                      <Play className="h-16 w-16 text-white" />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-primary">
                      <Clock className="h-3 w-3 mr-1" />
                      {video.duration}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                    <CardDescription className="flex items-center justify-between">
                      <span>Náročnosť: {video.difficulty}</span>
                      <span className="text-primary font-semibold">{video.calories}</span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="health-videos" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {healthVideos.map((video) => (
                <Card 
                  key={video.id} 
                  className="overflow-hidden hover:shadow-elegant transition-all cursor-pointer"
                  onClick={() => setSelectedVideo(video.videoUrl)}
                >
                  <div className="relative aspect-video">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/50 transition-colors">
                      <Play className="h-16 w-16 text-white" />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-primary">
                      <Clock className="h-3 w-3 mr-1" />
                      {video.duration}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                    <CardDescription className="flex items-center justify-between">
                      <span>Náročnosť: {video.difficulty}</span>
                      <span className="text-primary font-semibold flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        {video.benefit}
                      </span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="weight-loss-recipes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weightLossRecipes.map((recipe) => (
                <Card key={recipe.id} className="overflow-hidden hover:shadow-elegant transition-all cursor-pointer">
                  <div className="relative aspect-video">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-primary">
                      <Clock className="h-3 w-3 mr-1" />
                      {recipe.time}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{recipe.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-primary font-semibold">{recipe.calories}</span>
                        <span>Bielkoviny: {recipe.protein}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="healthy-recipes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {healthyRecipes.map((recipe) => (
                <Card key={recipe.id} className="overflow-hidden hover:shadow-elegant transition-all cursor-pointer">
                  <div className="relative aspect-video">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-primary">
                      <Clock className="h-3 w-3 mr-1" />
                      {recipe.time}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{recipe.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-primary font-semibold">{recipe.calories}</span>
                        <span className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {recipe.benefit}
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Video Player Dialog */}
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-5xl p-0">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>Video prehrávač</DialogTitle>
              <DialogDescription>
                Pozrite si tréningové video
              </DialogDescription>
            </DialogHeader>
            <div className="w-full px-6 pb-6">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                {selectedVideo && (
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    src={selectedVideo}
                    title="Video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FitSlim;
