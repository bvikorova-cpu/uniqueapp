import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import {
  Crown,
  Lock,
  MessageCircle,
  Video,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Star,
} from "lucide-react";

const benefits = [
  {
    icon: Crown,
    title: "Exclusive tiers",
    desc: "Monthly subscriptions with access to creator-only content.",
  },
  {
    icon: Lock,
    title: "Pay-per-view content",
    desc: "Unlock individual videos, photos and stories on demand.",
  },
  {
    icon: MessageCircle,
    title: "Direct DMs + tips",
    desc: "Message your favorite creator and support them with tips.",
  },
  {
    icon: Video,
    title: "Live stream access",
    desc: "Join private live broadcasts reserved for subscribers.",
  },
];


const CreatorsLanding = () => {
  return (
    <>
      <FloatingHowItWorks
        title="How Creators works"
        steps={[
          { title: 'Learn the model', description: '85/15 split, EUR payouts, Stripe Connect.' },
          { title: 'Sign up', description: 'Create profile and complete KYC.' },
          { title: 'Monetize', description: 'Subscriptions, tips, PPV, brand deals.' },
          { title: 'Get paid', description: 'Automated payouts every month.' },
        ]}
      />
    <>
      <Helmet>
        <title>Creators – Exclusive content & subscriptions | Unique</title>
        <meta
          name="description"
          content="Discover Unique Creators: monthly subscriptions, pay-per-view content, direct DMs, tips and live streams from your favorite creators."
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
              New section on Unique
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground via-primary to-accent bg-clip-text text-transparent">
              Support your favorite Creators
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Subscribe to exclusive content, unlock private videos, send tips
              and chat directly with your favorite creators.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="text-base">
                <Link to="/discover-creators">
                  Explore Creators
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link to="/become-creator">Become a Creator</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">What you get</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Four ways to get closer to your favorite creators.
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

        {/* Stats / social proof */}
        <section className="container mx-auto px-4 py-16">
          <Card className="bg-gradient-to-br from-primary/10 via-card to-accent/10 border-primary/30">
            <CardContent className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <TrendingUp className="h-8 w-8 mx-auto text-primary mb-2" />
                  <div className="text-3xl font-bold">85%</div>
                  <div className="text-sm text-muted-foreground">
                    Creator revenue share
                  </div>
                </div>
                <div>
                  <Star className="h-8 w-8 mx-auto text-accent mb-2" />
                  <div className="text-3xl font-bold">4 channels</div>
                  <div className="text-sm text-muted-foreground">
                    Monetization in one platform
                  </div>
                </div>
                <div>
                  <Sparkles className="h-8 w-8 mx-auto text-primary mb-2" />
                  <div className="text-3xl font-bold">∞</div>
                  <div className="text-sm text-muted-foreground">
                    Possibilities for your fans
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to start?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Discover thousands of creators and support their work today.
          </p>
          <Button asChild size="lg" className="text-base">
            <Link to="/discover-creators">
              Explore Creators
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>
      </main>
    </>
    </>
  );
};

export default CreatorsLanding;
