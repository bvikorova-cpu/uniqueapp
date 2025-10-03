import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2, Upload, Video, Camera, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Megatalent = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = () => {
    toast({
      title: "Potrebné pripojenie k Supabase",
      description: "Pre platobné funkcie je potrebné pripojiť Supabase databázu.",
    });
  };

  const handleVote = (type: 'like' | 'dislike') => {
    toast({
      title: "Hlasovanie",
      description: `${type === 'like' ? 'Páči sa mi' : 'Nepáči sa mi'} - potrebné pripojenie databázy`,
    });
  };

  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <Badge className="bg-gold text-gold-foreground animate-glow">
                💰 Mesačná výhra 100.000 €
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Vstup do Megatalent
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Prihláste sa do exkluzívnej súťaže kde môžete vyhrať až 100.000 € každý mesiac!
                Zdieľajte svoj talent a súťažte s najlepšími.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Premium Tier */}
              <Card className="bg-gradient-secondary border-border/50">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Premium</CardTitle>
                  <div className="text-4xl font-bold text-gold">10 €<span className="text-lg">/mesiac</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span>✨ Prístup do Megatalent súťaže</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🎯 Šanca vyhrať 100.000 €</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📱 Nahrávanie foto & video</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>👥 Hlasovanie a komentáre</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🎁 Referenčný program 5 €</span>
                    </div>
                  </div>
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full"
                    onClick={handleSubscribe}
                  >
                    Aktivovať Premium
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Mesačné predplatné sa automaticky obnovuje
                  </p>
                </CardContent>
              </Card>

              {/* TOP Premium Tier */}
              <Card className="bg-gradient-primary border-gold/50 relative overflow-hidden">
                <Badge className="absolute top-4 right-4 bg-gold text-gold-foreground">
                  ODPORÚČANÉ
                </Badge>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">TOP Premium</CardTitle>
                  <div className="text-4xl font-bold text-gold">25 €<span className="text-lg">/mesiac</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gold">Všetko z Premium +</p>
                    <div className="flex items-center gap-2">
                      <span>🏆 50% šanca na výhru</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🎯 +100,000 hlasov automaticky</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>⭐ Prioritné zobrazenie</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>💎 Exkluzívny badge</span>
                    </div>
                  </div>
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full bg-gold hover:bg-gold/90"
                    onClick={handleSubscribe}
                  >
                    Aktivovať TOP Premium
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Mesačné predplatné sa automaticky obnovuje
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Nahrať obsah
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="premium" className="w-full">
                  <Camera className="h-4 w-4" />
                  Nahrať foto
                </Button>
                <Button variant="premium" className="w-full">
                  <Video className="h-4 w-4" />
                  Nahrať video
                </Button>
                <Textarea placeholder="Napíš popis svojho talentu..." className="min-h-20" />
                <Button variant="hero" className="w-full">
                  Zverejniť
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Najnovšie talenty</h2>
              <Badge className="bg-gold text-gold-foreground">
                <TrendingUp className="h-4 w-4 mr-1" />
                Trending
              </Badge>
            </div>

            {/* Sample Posts */}
            {[1, 2, 3].map((post) => (
              <Card key={post} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full"></div>
                      <div>
                        <p className="font-semibold">Používateľ {post}</p>
                        <p className="text-sm text-muted-foreground">pred 2 hodinami</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Tanec</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-gradient-secondary rounded-lg flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-sm">
                    Môj najnovší tanečný cover na populárnu pieseň! 🎵 Dúfam, že sa vám páči!
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote('like')}
                        className="text-green-500 hover:text-green-600"
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        {Math.floor(Math.random() * 500) + 100}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote('dislike')}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Heart className="h-4 w-4 mr-1 transform rotate-180" />
                        {Math.floor(Math.random() * 50) + 10}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {Math.floor(Math.random() * 50) + 5}
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mesačná súťaž</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold">100.000 €</div>
                  <p className="text-sm text-muted-foreground">Hlavná výhra</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Zostáva:</span>
                    <span className="font-semibold">12 dní</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-gold h-2 rounded-full w-[60%]"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top talenty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4, 5].map((rank) => (
                  <div key={rank} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      rank === 1 ? 'bg-gold text-gold-foreground' : 
                      rank === 2 ? 'bg-gray-400 text-white' :
                      rank === 3 ? 'bg-orange-400 text-white' :
                      'bg-secondary text-secondary-foreground'
                    }`}>
                      {rank}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Talent {rank}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.floor(Math.random() * 1000) + 500} hlasov
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Megatalent;