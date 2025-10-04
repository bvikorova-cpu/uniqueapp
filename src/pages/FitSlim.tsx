import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, ChefHat, Heart } from "lucide-react";

const FitSlim = () => {
  const [activeTab, setActiveTab] = useState("weight-loss-videos");

  const weightLossVideos = [
    {
      id: 1,
      title: "10-minútový HIIT tréning na chudnutie",
      duration: "10 min",
      difficulty: "Stredná",
      calories: "150 kcal",
      thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Kardio pre začiatočníkov",
      duration: "15 min",
      difficulty: "Ľahká",
      calories: "120 kcal",
      thumbnail: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Celé telo - spaľovanie tukov",
      duration: "20 min",
      difficulty: "Náročná",
      calories: "250 kcal",
      thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop",
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
    },
    {
      id: 2,
      title: "Strečing pre zdravý chrbát",
      duration: "10 min",
      difficulty: "Ľahká",
      benefit: "Úľava od bolesti",
      thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Meditácia a dýchacie cvičenia",
      duration: "12 min",
      difficulty: "Ľahká",
      benefit: "Zníženie stresu",
      thumbnail: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800&auto=format&fit=crop",
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
                <Card key={video.id} className="overflow-hidden hover:shadow-elegant transition-all cursor-pointer">
                  <div className="relative aspect-video">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
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
                <Card key={video.id} className="overflow-hidden hover:shadow-elegant transition-all cursor-pointer">
                  <div className="relative aspect-video">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
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
      </div>
    </div>
  );
};

export default FitSlim;
