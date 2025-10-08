import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Clock, ChefHat, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-bg.jpg";

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
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/ml6cT4AZdqI?autoplay=1&rel=0",
    },
    {
      id: 2,
      title: "Kardio pre začiatočníkov",
      duration: "15 min",
      difficulty: "Ľahká",
      calories: "120 kcal",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/gC_L9qAHVJ8?autoplay=1&rel=0",
    },
    {
      id: 3,
      title: "Celé telo - spaľovanie tukov",
      duration: "20 min",
      difficulty: "Náročná",
      calories: "250 kcal",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/UItWltVZZmE?autoplay=1&rel=0",
    },
    {
      id: 4,
      title: "Tabata tréning - intenzívne spaľovanie kalórií",
      duration: "25 min",
      difficulty: "Náročná",
      calories: "300 kcal",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/20LH4dEeWg0?autoplay=1&rel=0",
    },
    {
      id: 5,
      title: "Cvičenie na chudnutie brucha",
      duration: "12 min",
      difficulty: "Stredná",
      calories: "100 kcal",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/1919eTCoESo?autoplay=1&rel=0",
    },
    {
      id: 6,
      title: "Bodyweight tréning na chudnutie",
      duration: "18 min",
      difficulty: "Stredná",
      calories: "200 kcal",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/cbKkB3POqaY?autoplay=1&rel=0",
    },
    {
      id: 7,
      title: "Jumping Jacks - intervalový tréning",
      duration: "14 min",
      difficulty: "Stredná",
      calories: "180 kcal",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/2W4ZNSwoW_4?autoplay=1&rel=0",
    },
    {
      id: 8,
      title: "Cardio Dance - zábavné chudnutie",
      duration: "30 min",
      difficulty: "Stredná",
      calories: "320 kcal",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/gCBsupdwdVw?autoplay=1&rel=0",
    },
    {
      id: 9,
      title: "Tréning stehien a zadku",
      duration: "16 min",
      difficulty: "Náročná",
      calories: "220 kcal",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/SZ6IshIbWGc?autoplay=1&rel=0",
    },
    {
      id: 10,
      title: "Ranný metabolizmus boost",
      duration: "8 min",
      difficulty: "Ľahká",
      calories: "90 kcal",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/3sEeVJEXTfY?autoplay=1&rel=0",
    },
    {
      id: 11,
      title: "Plank challenge - spevnenie jadra",
      duration: "10 min",
      difficulty: "Stredná",
      calories: "110 kcal",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw?autoplay=1&rel=0",
    },
  ];

  const healthVideos = [
    {
      id: 1,
      title: "Ranná jóga pre energiu",
      duration: "15 min",
      difficulty: "Ľahká",
      benefit: "Energia a flexibilita",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/v7AYKMP6rOE?autoplay=1&rel=0",
    },
    {
      id: 2,
      title: "Strečing pre zdravý chrbát",
      duration: "10 min",
      difficulty: "Ľahká",
      benefit: "Úľava od bolesti",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/qULTwquOuT4?autoplay=1&rel=0",
    },
    {
      id: 3,
      title: "Meditácia a dýchacie cvičenia",
      duration: "12 min",
      difficulty: "Ľahká",
      benefit: "Zníženie stresu",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/inpok4MKVLM?autoplay=1&rel=0",
    },
    {
      id: 4,
      title: "Pilates pre silné centrum tela",
      duration: "20 min",
      difficulty: "Stredná",
      benefit: "Spevnenie jadra",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/K56Z12XH6WY?autoplay=1&rel=0",
    },
    {
      id: 5,
      title: "Rehabilitačné cvičenia pre kolená",
      duration: "14 min",
      difficulty: "Ľahká",
      benefit: "Posilnenie kĺbov",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/AXcJRHYfz5U?autoplay=1&rel=0",
    },
    {
      id: 6,
      title: "Mobilita ramien a krku",
      duration: "8 min",
      difficulty: "Ľahká",
      benefit: "Odstránenie napätia",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/3j_jHMy5JBQ?autoplay=1&rel=0",
    },
    {
      id: 7,
      title: "Tai Chi pre začiatočníkov",
      duration: "18 min",
      difficulty: "Ľahká",
      benefit: "Rovnováha a pokoj",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/6w7IS8_UzHM?autoplay=1&rel=0",
    },
    {
      id: 8,
      title: "Foam rolling - regenerácia svalov",
      duration: "12 min",
      difficulty: "Ľahká",
      benefit: "Uvoľnenie svalov",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/IlMGY5yKS4o?autoplay=1&rel=0",
    },
    {
      id: 9,
      title: "Cvičenia na zlepšenie držania tela",
      duration: "16 min",
      difficulty: "Stredná",
      benefit: "Správne držanie",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/RqcOCBb4arc?autoplay=1&rel=0",
    },
    {
      id: 10,
      title: "Večerný relax strečing",
      duration: "10 min",
      difficulty: "Ľahká",
      benefit: "Lepší spánok",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/ErZ_5-jC-Sg?autoplay=1&rel=0",
    },
    {
      id: 11,
      title: "Cvičenia pre zdravé bedra",
      duration: "14 min",
      difficulty: "Ľahká",
      benefit: "Mobilita bedrových kĺbov",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/YwO4GFrqXKc?autoplay=1&rel=0",
    },
    {
      id: 12,
      title: "Yin jóga - hlboký strečing",
      duration: "25 min",
      difficulty: "Ľahká",
      benefit: "Flexibilita",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/LcnFzJZID18?autoplay=1&rel=0",
    },
    {
      id: 13,
      title: "Mindfulness meditácia",
      duration: "15 min",
      difficulty: "Ľahká",
      benefit: "Mentálne zdravie",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/ZToicYcHIOU?autoplay=1&rel=0",
    },
    {
      id: 14,
      title: "Cvičenia na syndróm karpálneho tunela",
      duration: "8 min",
      difficulty: "Ľahká",
      benefit: "Zdravé zápästia",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/fdD7CgN5FGg?autoplay=1&rel=0",
    },
    {
      id: 15,
      title: "Office yoga - jóga v kancelárii",
      duration: "10 min",
      difficulty: "Ľahká",
      benefit: "Úľava pri sedení",
      thumbnail: heroImage,
      videoUrl: "https://www.youtube.com/embed/M-8FvC3GD8c?autoplay=1&rel=0",
    },
  ];

  const weightLossRecipes = [
    {
      id: 1,
      title: "Zeleninový šalát s grilovaným kuracím mäsom",
      calories: "320 kcal",
      protein: "35g",
      time: "20 min",
      image: heroImage,
    },
    {
      id: 2,
      title: "Quinoa s pečenou zeleninou",
      calories: "280 kcal",
      protein: "12g",
      time: "30 min",
      image: heroImage,
    },
    {
      id: 3,
      title: "Proteinový smoothie s ovocím",
      calories: "250 kcal",
      protein: "25g",
      time: "5 min",
      image: heroImage,
    },
    {
      id: 4,
      title: "Zeleninová polievka so šošovicou",
      calories: "210 kcal",
      protein: "15g",
      time: "35 min",
      image: heroImage,
    },
    {
      id: 5,
      title: "Grilovaný losos s ružičkovým kelom",
      calories: "340 kcal",
      protein: "38g",
      time: "25 min",
      image: heroImage,
    },
    {
      id: 6,
      title: "Zeleninové wrap s hummusom",
      calories: "290 kcal",
      protein: "14g",
      time: "15 min",
      image: heroImage,
    },
    {
      id: 7,
      title: "Cottage cheese s uhorkou a paradajkami",
      calories: "180 kcal",
      protein: "20g",
      time: "10 min",
      image: heroImage,
    },
    {
      id: 8,
      title: "Vajíčková omeleta so špenátom",
      calories: "240 kcal",
      protein: "22g",
      time: "12 min",
      image: heroImage,
    },
    {
      id: 9,
      title: "Tuniakové kúsky s avokádom",
      calories: "310 kcal",
      protein: "30g",
      time: "10 min",
      image: heroImage,
    },
    {
      id: 10,
      title: "Kuracina s chilli a zelenými fazuľkami",
      calories: "295 kcal",
      protein: "32g",
      time: "22 min",
      image: heroImage,
    },
    {
      id: 11,
      title: "Zeleninové kari s cícerom",
      calories: "265 kcal",
      protein: "16g",
      time: "28 min",
      image: heroImage,
    },
    {
      id: 12,
      title: "Pečená treska s citrónom",
      calories: "260 kcal",
      protein: "34g",
      time: "20 min",
      image: heroImage,
    },
    {
      id: 13,
      title: "Bowl s tofu a hnedou ryžou",
      calories: "330 kcal",
      protein: "18g",
      time: "25 min",
      image: heroImage,
    },
    {
      id: 14,
      title: "Krémová polievka z brokolice",
      calories: "195 kcal",
      protein: "11g",
      time: "30 min",
      image: heroImage,
    },
    {
      id: 15,
      title: "Pečené kurča s bylinkami",
      calories: "305 kcal",
      protein: "36g",
      time: "40 min",
      image: heroImage,
    },
    {
      id: 16,
      title: "Čočka s paradajkami a cuketou",
      calories: "245 kcal",
      protein: "17g",
      time: "32 min",
      image: heroImage,
    },
    {
      id: 17,
      title: "Kapustový šalát s morčacím mäsom",
      calories: "270 kcal",
      protein: "28g",
      time: "18 min",
      image: heroImage,
    },
    {
      id: 18,
      title: "Zeleninové špízy s ryžovými rezancami",
      calories: "285 kcal",
      protein: "13g",
      time: "24 min",
      image: heroImage,
    },
  ];

  const healthyRecipes = [
    {
      id: 1,
      title: "Ovesná kaša s čerstvým ovocím",
      calories: "350 kcal",
      benefit: "Energia na celý deň",
      time: "10 min",
      image: heroImage,
    },
    {
      id: 2,
      title: "Pečený losos s brokolicou",
      calories: "420 kcal",
      benefit: "Omega-3 mastné kyseliny",
      time: "25 min",
      image: heroImage,
    },
    {
      id: 3,
      title: "Avokádový toast s vajíčkom",
      calories: "380 kcal",
      benefit: "Zdravé tuky",
      time: "15 min",
      image: heroImage,
    },
    {
      id: 4,
      title: "Grécky jogurt s orechmi a medom",
      calories: "310 kcal",
      benefit: "Probiotika",
      time: "5 min",
      image: heroImage,
    },
    {
      id: 5,
      title: "Kurací vývar s domácimi rezancami",
      calories: "280 kcal",
      benefit: "Posilnenie imunity",
      time: "45 min",
      image: heroImage,
    },
    {
      id: 6,
      title: "Smoothie bowl s chia semienkami",
      calories: "330 kcal",
      benefit: "Antioxidanty",
      time: "8 min",
      image: heroImage,
    },
    {
      id: 7,
      title: "Pečené sladké zemiaky s čiernou fazuľou",
      calories: "390 kcal",
      benefit: "Vláknina a vitamíny",
      time: "40 min",
      image: heroImage,
    },
    {
      id: 8,
      title: "Tuniakový šalát s avokádom",
      calories: "360 kcal",
      benefit: "Omega-3 a bielkoviny",
      time: "12 min",
      image: heroImage,
    },
    {
      id: 9,
      title: "Celozrnné palacinky s bobuľovým ovocím",
      calories: "340 kcal",
      benefit: "Komplexné sacharidy",
      time: "18 min",
      image: heroImage,
    },
    {
      id: 10,
      title: "Poke bowl s tuniakom",
      calories: "410 kcal",
      benefit: "Omega-3 a minerály",
      time: "20 min",
      image: heroImage,
    },
    {
      id: 11,
      title: "Špenátová quiche",
      calories: "365 kcal",
      benefit: "Železo a vápnik",
      time: "50 min",
      image: heroImage,
    },
    {
      id: 12,
      title: "Zelený detox smoothie",
      calories: "220 kcal",
      benefit: "Detoxikácia",
      time: "5 min",
      image: heroImage,
    },
    {
      id: 13,
      title: "Buddha bowl s humusom",
      calories: "385 kcal",
      benefit: "Kompletný profil živín",
      time: "30 min",
      image: heroImage,
    },
    {
      id: 14,
      title: "Chia puding s mangom",
      calories: "295 kcal",
      benefit: "Vláknina a omega-3",
      time: "10 min + chladenie",
      image: heroImage,
    },
    {
      id: 15,
      title: "Pečená tekvica s quinoou",
      calories: "345 kcal",
      benefit: "Vitamín A a bielkoviny",
      time: "35 min",
      image: heroImage,
    },
    {
      id: 16,
      title: "Zelené kari s kokosovým mlékom",
      calories: "370 kcal",
      benefit: "Protizápalové účinky",
      time: "28 min",
      image: heroImage,
    },
    {
      id: 17,
      title: "Protein pancakes s banánom",
      calories: "325 kcal",
      benefit: "Bielkoviny pre rast svalov",
      time: "15 min",
      image: heroImage,
    },
    {
      id: 18,
      title: "Pečený kôstkovitý mix s olivovým olejom",
      calories: "400 kcal",
      benefit: "Zdravé tuky a minerály",
      time: "45 min",
      image: heroImage,
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
