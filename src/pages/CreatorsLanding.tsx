import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Lock,
  MessageCircle,
  Video,
  Sparkles,
  TrendingUp,
  Heart,
  ArrowRight,
  Star,
} from "lucide-react";

const benefits = [
  {
    icon: Crown,
    title: "Exkluzívne tiers",
    desc: "Mesačné predplatné s prístupom k obsahu pre fanúšikov.",
  },
  {
    icon: Lock,
    title: "Pay-per-view obsah",
    desc: "Odomkni jednotlivé videá, fotky a príbehy podľa záujmu.",
  },
  {
    icon: MessageCircle,
    title: "Priame DM + tipy",
    desc: "Napíš svojmu obľúbenému creatorovi a podpor ho tipom.",
  },
  {
    icon: Video,
    title: "Live stream prístup",
    desc: "Pripoj sa k súkromným live vysielaniam len pre predplatiteľov.",
  },
];

const featuredCreators = [
  { name: "Luna Star", category: "Lifestyle", subs: "12.4k", emoji: "✨" },
  { name: "Max Power", category: "Fitness", subs: "8.7k", emoji: "💪" },
  { name: "Aria Moon", category: "Art & Design", subs: "15.2k", emoji: "🎨" },
  { name: "Neo Beat", category: "Music", subs: "9.1k", emoji: "🎧" },
  { name: "Zoe Vibe", category: "Fashion", subs: "11.8k", emoji: "👗" },
  { name: "Ryo Sky", category: "Gaming", subs: "20.3k", emoji: "🎮" },
];

const CreatorsLanding = () => {
  return (
    <>
      <Helmet>
        <title>Creators – Exkluzívny obsah a predplatné | Unique</title>
        <meta
          name="description"
          content="Objav Unique Creators: mesačné predplatné, pay-per-view obsah, priame DM, tipy a live streamy od tvojich obľúbených tvorcov."
        />
        <link rel="canonical" href="/creators" />
      </Helmet>

      <main className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.25),transparent_60%)]" />

          <div className="relative container mx-auto px-4 py-20 md:py-28 text-center">
            <Badge variant="secondary" className="mb-6 gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Nová sekcia na Unique
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground via-primary to-accent bg-clip-text text-transparent">
              Podpor svojich obľúbených Creatorov
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Predplať si exkluzívny obsah, odomkni súkromné videá, posielaj tipy
              a komunikuj priamo so svojimi obľúbenými tvorcami.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="text-base">
                <Link to="/discover-creators">
                  Preskúmaj Creators
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link to="/become-creator">Staň sa Creatorom</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Čo získaš</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Štyri spôsoby, ako sa priblížiť ku svojim obľúbeným tvorcom.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((b) => (
              <Card
                key={b.title}
                className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <b.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured creators */}
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Vybraní Creators
              </h2>
              <p className="text-muted-foreground">
                Ukážka tvorcov, ktorí už začali na Unique.
              </p>
            </div>
            <Button asChild variant="ghost">
              <Link to="/discover-creators">
                Zobraziť všetkých
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredCreators.map((c) => (
              <Card
                key={c.name}
                className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 hover:-translate-y-1 transition-all"
              >
                <CardContent className="p-4 text-center">
                  <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl mb-3">
                    {c.emoji}
                  </div>
                  <h3 className="font-semibold text-sm truncate">{c.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {c.category}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Heart className="h-3 w-3 text-accent" />
                    {c.subs}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats / social proof */}
        <section className="container mx-auto px-4 py-16">
          <Card className="bg-gradient-to-br from-primary/10 via-card to-accent/10 border-primary/30">
            <CardContent className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <TrendingUp className="h-8 w-8 mx-auto text-primary mb-2" />
                  <div className="text-3xl font-bold">85%</div>
                  <div className="text-sm text-muted-foreground">
                    Podiel pre creatorov
                  </div>
                </div>
                <div>
                  <Star className="h-8 w-8 mx-auto text-accent mb-2" />
                  <div className="text-3xl font-bold">4 kanály</div>
                  <div className="text-sm text-muted-foreground">
                    Monetizácie v jednej platforme
                  </div>
                </div>
                <div>
                  <Sparkles className="h-8 w-8 mx-auto text-primary mb-2" />
                  <div className="text-3xl font-bold">∞</div>
                  <div className="text-sm text-muted-foreground">
                    Možnosti pre tvojich fanúšikov
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Pripravený začať?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Objav tisíce tvorcov a podpor ich tvorbu už dnes.
          </p>
          <Button asChild size="lg" className="text-base">
            <Link to="/discover-creators">
              Preskúmaj Creators
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>
      </main>
    </>
  );
};

export default CreatorsLanding;
