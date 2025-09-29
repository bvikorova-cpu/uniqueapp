import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Users, ShoppingBag, Store, Star, TrendingUp, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const Home = () => {
  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 text-center space-y-8 px-4">
          <Badge className="bg-gold text-gold-foreground animate-glow text-lg px-4 py-2">
            💰 Vyhraj až 100.000 € každý mesiac!
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/megatalent">
              <Button variant="hero" size="lg" className="text-xl px-8 py-4">
                <Crown className="h-6 w-6 mr-2" />
                Vstúp do súťaže
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-xl px-8 py-4 text-white border-white hover:bg-white hover:text-black">
              Pozri si talenty
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Prečo{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Megatalent?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Viac ako sociálna sieť - je to tvoja cesta k úspechu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105">
              <CardHeader>
                <Crown className="h-12 w-12 text-gold mx-auto mb-4" />
                <CardTitle>Megatalent súťaž</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ukáž svoj talent a súťaž o 100.000 € každý mesiac
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105">
              <CardHeader>
                <Gift className="h-12 w-12 text-success mx-auto mb-4" />
                <CardTitle>Referenčný program</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Pozvi priateľa a získaj 5 € za každé predplatné
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105">
              <CardHeader>
                <ShoppingBag className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Eshop</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nakupuj exkluzívne produkty a merchandise
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105">
              <CardHeader>
                <Store className="h-12 w-12 text-accent mx-auto mb-4" />
                <CardTitle>Online bazár</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Predávaj a kupuj od ostatných používateľov
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-secondary">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-gold">100K€</div>
              <p className="text-muted-foreground">Mesačná výhra</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-primary">10K+</div>
              <p className="text-muted-foreground">Aktívnych talentov</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-success">5€</div>
              <p className="text-muted-foreground">Za každého priateľa</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">Ako to funguje?</h2>
            <p className="text-xl text-muted-foreground">Jednoduché kroky k úspechu</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-white">
                1
              </div>
              <h3 className="text-xl font-semibold">Registruj sa</h3>
              <p className="text-muted-foreground">
                Vytvor si účet a aktivuj si Premium predplatné za 10€/mesiac
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-white">
                2
              </div>
              <h3 className="text-xl font-semibold">Zdieľaj talent</h3>
              <p className="text-muted-foreground">
                Nahrávaj fotky a videá svojho talentu do Megatalent súťaže
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-gold-foreground">
                3
              </div>
              <h3 className="text-xl font-semibold">Vyhraj!</h3>
              <p className="text-muted-foreground">
                Získavaj hlasy od komunity a vyhraj až 100.000€
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto max-w-4xl px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Pripravený zmeniť svoj život?
          </h2>
          <p className="text-xl text-gray-200">
            Pripoj sa k tisíckam talentov a začni svoju cestu k úspechu už dnes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="text-xl px-8 py-4">
              Začni teraz
            </Button>
            <Button variant="outline" size="lg" className="text-xl px-8 py-4 text-white border-white hover:bg-white hover:text-primary">
              Zisti viac
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;