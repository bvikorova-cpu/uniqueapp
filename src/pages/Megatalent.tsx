import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, MessageCircle, Share2, Upload, Video, Camera, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const categories = [
  { value: "drawing", label: "Kreslenie" },
  { value: "funny_video", label: "Najsmiešnejšie video" },
  { value: "life_advice", label: "Najlepšia rada do života" },
  { value: "tattoo", label: "Najlepšie tetovanie" },
  { value: "training", label: "Najlepší tréning" },
];

const Megatalent = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("drawing");
  const [loading, setLoading] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [uploading, setUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('megatalent_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      setIsSubscribed(!!data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tier: 'premium' | 'top_premium') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Prihlásenie potrebné",
          description: "Musíte byť prihlásený pre aktiváciu premium.",
          variant: "destructive",
        });
        return;
      }

      const price = tier === 'premium' ? 10 : 15;
      const bonusVotes = tier === 'top_premium' ? 100000 : 0;
      const winChanceBoost = tier === 'top_premium' ? 50 : 0;

      const { error } = await supabase
        .from('megatalent_subscriptions')
        .insert({
          user_id: user.id,
          tier,
          price,
          bonus_votes: bonusVotes,
          win_chance_boost: winChanceBoost,
          status: 'active',
        });

      if (error) throw error;

      toast({
        title: "Úspešne aktivované!",
        description: `${tier === 'premium' ? 'Premium' : 'TOP Premium'} predplatné bolo aktivované.`,
      });

      setIsSubscribed(true);
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa aktivovať predplatné.",
        variant: "destructive",
      });
    }
  };

  const handleVote = (type: 'like' | 'dislike') => {
    toast({
      title: "Hlasovanie",
      description: `${type === 'like' ? 'Páči sa mi' : 'Nepáči sa mi'} - potrebné pripojenie databázy`,
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Prihlásenie potrebné",
        description: "Musíte byť prihlásený pre nahrávanie súborov.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const bucket = type === 'image' ? 'media' : 'videos';

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setUploadedFile({ url: publicUrl, type });
      
      toast({
        title: "Úspešne nahrané!",
        description: `${type === 'image' ? 'Fotka' : 'Video'} bolo úspešne nahrané.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa nahrať súbor.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 flex items-center justify-center">
        <p className="text-lg">Načítavam...</p>
      </div>
    );
  }

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
                    onClick={() => handleSubscribe('premium')}
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
                  <div className="text-4xl font-bold text-gold">15 €<span className="text-lg">/mesiac</span></div>
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
                    onClick={() => handleSubscribe('top_premium')}
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
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte kategóriu" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'image')}
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'video')}
                />
                
                <Button 
                  variant="premium" 
                  className="w-full"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Camera className="h-4 w-4" />
                  {uploading ? 'Nahrávam...' : 'Nahrať foto'}
                </Button>
                <Button 
                  variant="premium" 
                  className="w-full"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Video className="h-4 w-4" />
                  {uploading ? 'Nahrávam...' : 'Nahrať video'}
                </Button>
                
                {uploadedFile && (
                  <div className="mt-4">
                    {uploadedFile.type === 'image' ? (
                      <img src={uploadedFile.url} alt="Uploaded" className="w-full rounded-lg" />
                    ) : (
                      <video src={uploadedFile.url} controls className="w-full rounded-lg" />
                    )}
                  </div>
                )}
                
                <Textarea placeholder="Napíš popis svojho talentu..." className="min-h-20" />
                <Button variant="hero" className="w-full">
                  Zverejniť
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Feed */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 gap-2 h-auto p-2 bg-card/50 mb-6">
                {categories.map((cat) => (
                  <TabsTrigger 
                    key={cat.value} 
                    value={cat.value} 
                    className="text-sm py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((cat) => (
                <TabsContent key={cat.value} value={cat.value} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{cat.label}</h2>
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
                          <Badge variant="secondary">{cat.label}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="aspect-video bg-gradient-secondary rounded-lg flex items-center justify-center">
                          <Video className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <p className="text-sm">
                          Môj príspevok v kategórii {cat.label}! 🎵 Dúfam, že sa vám páči!
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
                </TabsContent>
              ))}
            </Tabs>
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