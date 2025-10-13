import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Crown, Users, ShoppingBag, Store, Star, TrendingUp, Gift, MessageSquare, Video, MessageCircle, Trophy, FileText, Brain, Plane, Heart, Cross, Dumbbell, Home as HomeIcon, Package, UserPlus, Gamepad2, Briefcase, Radio, GraduationCap, Gavel, Sparkles, Search, Disc3, Music } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const services = [
    { name: "Feed", path: "/feed", keywords: ["feed", "príspevky", "zdieľanie", "sociálna sieť"] },
    { name: "Videá", path: "/tiktok", keywords: ["videá", "tiktok", "krátke videá"] },
    { name: "Messenger", path: "/messenger", keywords: ["messenger", "chat", "správy", "komunikácia"] },
    { name: "Megatalent", path: "/megatalent", keywords: ["megatalent", "súťaž", "talent", "výhra"] },
    { name: "Megaforum", path: "/megaforum", keywords: ["megaforum", "diskusia", "fórum"] },
    { name: "Online psychológ", path: "/psychologist", keywords: ["psychológ", "psycholog", "duševné zdravie", "poradenstvo"] },
    { name: "Vzdelávanie", path: "/education", keywords: ["vzdelávanie", "kurzy", "doučovanie", "kvízy"] },
    { name: "Dovolenky", path: "/vacationer", keywords: ["dovolenky", "cestovanie", "zájazdy"] },
    { name: "Dating", path: "/dating", keywords: ["dating", "zoznamka", "láska", "priateľstvá"] },
    { name: "Prvá pomoc", path: "/first-aid", keywords: ["prvá pomoc", "zdravie", "pomoc"] },
    { name: "Fit & Slim", path: "/fit-slim", keywords: ["fit", "slim", "cvičenie", "zdravé recepty"] },
    { name: "Marketplace zručností", path: "/marketplace", keywords: ["služby", "marketplace", "ja urobím", "marketplace zručností"] },
    { name: "Bazár", path: "/bazaar", keywords: ["bazár", "bazar", "predaj", "nákup"] },
    { name: "Referenčný program", path: "/referral", keywords: ["referral", "odmeny", "priateľ"] },
    { name: "Hry", path: "/games", keywords: ["hry", "games", "zábava"] },
    { name: "Práca", path: "/jobs", keywords: ["práca", "job", "zamestnanec", "kariéra"] },
    { name: "InfluKing", path: "/influ-king", keywords: ["influking", "influencer", "zarábaš"] },
    { name: "Online Aukcie", path: "/auction", keywords: ["aukcie", "auction", "dražba"] },
    { name: "AI Generovanie", path: "/ai-generation", keywords: ["ai", "generovanie", "obrázky"] },
    { name: "Best Friend", path: "/best-friend", keywords: ["best friend", "priateľ", "chatbot"] },
    
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase();
    const foundService = services.find(service => 
      service.name.toLowerCase().includes(query) || 
      service.keywords.some(keyword => keyword.includes(query))
    );

    if (foundService) {
      navigate(foundService.path);
      setSearchQuery("");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-start justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 text-center space-y-8 px-4 pt-32">
          <Badge className="bg-gold text-gold-foreground animate-glow text-lg px-4 py-2">
            💰 Vyhraj 10.000 € každý mesiac v každej kategórii!
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Vitaj v{" "}
            <span className="bg-gradient-gold bg-clip-text text-transparent">
              Megatalent
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
            Sociálna sieť, kde tvoj talent môže zmeniť tvoj život. Súťaž, hlasuj, 
            nakupuj a zarábaj s priateľmi!
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                type="text"
                placeholder="Hľadaj služby... (napr. hry, vzdelávanie, dating)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg text-black placeholder:text-gray-500 bg-white/95 backdrop-blur-sm border-2 border-white/20 focus:border-primary"
              />
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/megatalent">
              <Button variant="hero" size="lg" className="text-xl px-8 py-4">
                <Crown className="h-6 w-6 mr-2" />
                Vstúp do súťaže
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* All Services Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Naše{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                služby
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Kompletná platforma pre všetky tvoje potreby
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Link to="/feed">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Zdieľaj momenty a komunikuj s priateľmi
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/tiktok">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Video className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>Videá</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sleduj a vytváraj krátke videá
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/messenger">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <MessageCircle className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>Messenger</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Chatuj so známymi v reálnom čase
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/megatalent">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Crown className="h-12 w-12 text-gold mx-auto mb-4" />
                  <CardTitle>Megatalent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Súťaž o 100.000 € každý mesiac
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/megaforum">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Megaforum</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Diskutuj a zdieľaj názory s komunitou
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/psychologist">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Brain className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>Online psychológ</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    AI asistent pre duševné zdravie 24/7
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/education">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <GraduationCap className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>Vzdelávanie</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Online doučovanie, kvízy a kurzy
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/vacationer">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Plane className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Dovolenky</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Rezervuj dovolenky a zájazdy online
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dating">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Heart className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <CardTitle>Dating</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Nájdi si partnera a nové priateľstvá
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/first-aid">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Cross className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <CardTitle>Prvá pomoc</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Návody na poskytnutie prvej pomoci
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/fit-slim">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Dumbbell className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>Fit & Slim</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Cvičebné plány a zdravé recepty
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/marketplace">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <HomeIcon className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>Marketplace zručností</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Poskytovanie, predaj a kúpa služieb poskytovaných na celom svete
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/bazaar">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Store className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>Bazár</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Predávaj a kupuj od ostatných používateľov
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/referral">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Gift className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>Referenčný program</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Získaj 5 € za každého priateľa
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/games">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Gamepad2 className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Hry</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Hraj obľúbené online hry zadarmo
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/jobs">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Briefcase className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>Práca</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Nájdi si prácu alebo zamestnanca
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/influ-king">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Radio className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>InfluKing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Staň sa influencerom a zarábaj
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/auction">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Gavel className="h-12 w-12 text-gold mx-auto mb-4" />
                  <CardTitle>Online Aukcie</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ponúkaj a vydražuj produkty z celého sveta
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/ai-generation">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>AI Generovanie</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Vytváraj obrázky pomocou umelej inteligencie
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/best-friend">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Trophy className="h-12 w-12 text-gold mx-auto mb-4" />
                  <CardTitle>Best Friend</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Tvoj AI priateľ, ktorý ťa nikdy neopustí
                  </p>
                </CardContent>
              </Card>
            </Link>


            <Link to="/cooking">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Package className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>Varenie</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Zdravé recepty a jedálnické lístky
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
