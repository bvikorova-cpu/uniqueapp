import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarCheck, Scissors, Sparkles, Store, Clock, HeartHandshake, Star } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import SEO from "@/components/SEO";
import serviceVideo from "@/assets/section-videos/service-booking.mp4.asset.json";

const CATEGORIES = [
  { label: "Hair", icon: Scissors },
  { label: "Nails", icon: Sparkles },
  { label: "Makeup", icon: Star },
  { label: "Massage", icon: HeartHandshake },
  { label: "Tattoo", icon: Sparkles },
  { label: "Fitness", icon: Clock },
];

export default function BookAndGlowLanding() {
  return (
    <>
      <SEO
        title="Book & Glow · Beauty & Wellness Appointments — Unique"
        description="Book hairdressers, nail artists, makeup, massage, tattoo and wellness professionals. Pay in EUR, get direct email contact, and cancel >24h for a full refund."
      />
      <Navbar />
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="relative h-[60vh] min-h-[380px] max-h-[560px] overflow-hidden">
          <video
            src={serviceVideo.url}
            autoPlay muted loop playsInline preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-background" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 pt-20">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 ring-2 ring-white/30 flex items-center justify-center mb-3 shadow-2xl">
              <CalendarCheck className="h-10 w-10 text-white" />
            </div>
            <h1
              className="text-4xl md:text-6xl font-black text-white mb-4"
              style={{ textShadow: "0 4px 30px rgba(139,92,246,0.55)" }}
            >
              Book &{" "}
              <span className="bg-gradient-to-r from-purple-400 via-primary to-pink-400 bg-clip-text text-transparent">
                Glow
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-6">
              Beauty & wellness bookings with verified local providers. Hair, nails, makeup, massage, tattoo, fitness — pay in EUR and get direct email contact.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" variant="premium">
                <Link to="/services">
                  <Sparkles className="h-4 w-4 mr-1" /> Browse providers
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-background/20 backdrop-blur border-white/30 text-white hover:bg-background/40"
              >
                <Link to="/services/provider/setup">
                  <Store className="h-4 w-4 mr-1" /> Offer your services
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-background/20 backdrop-blur border-white/30 text-white hover:bg-background/40"
              >
                <Link to="/services/provider/inbox">Provider inbox</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <FloatingHowItWorks
            title="Book & Glow — How it works"
            intro="A beauty & wellness booking calendar. Pay in EUR, exchange emails directly, and manage appointments with a 24h refund policy."
            steps={[
              { title: "Browse providers", description: "Filter by category (hair, nails, makeup, massage, tattoo, fitness) and city." },
              { title: "Pick a service & slot", description: "Choose a treatment and a free time slot." },
              { title: "Pay securely", description: "Stripe Checkout in EUR — funds held until the appointment." },
              { title: "Direct email contact", description: "You get the provider's email; they get yours. Contact is direct." },
              { title: "Manage & cancel", description: "Cancel >24h before for a full refund." },
            ]}
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-8">
            {CATEGORIES.map((c) => (
              <Card key={c.label} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <c.icon className="h-7 w-7 mx-auto mb-2 text-primary" />
                  <h3 className="font-bold text-sm">{c.label}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 text-center flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" variant="premium">
              <Link to="/services">
                <Clock className="h-4 w-4 mr-1" /> Start booking now
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/services/provider/setup">
                <Store className="h-4 w-4 mr-1" /> Earn as a provider
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
