import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarCheck, Scissors, Mail, ShieldCheck, Euro, Sparkles, Store, Clock } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import SEO from "@/components/SEO";
import serviceVideo from "@/assets/section-videos/service-booking.mp4.asset.json";

export default function ServicesLanding() {
  return (
    <>
      <SEO
        title="Book Services · Hair · Nails · Massage · Anything — Unique"
        description="Universal booking for hairdressers, pedicurists, masseuses, tutors, mechanics and anyone else. Pay in EUR, get the provider's email — no third-party mailing service required."
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
              Book any{" "}
              <span className="bg-gradient-to-r from-purple-400 via-primary to-pink-400 bg-clip-text text-transparent">
                Service
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-6">
              Hairdressers, pedicurists, masseuses, tutors, mechanics — anyone with time slots.
              Pay in EUR, get direct email contact with the provider.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" variant="premium">
                <Link to="/services">
                  <Scissors className="h-4 w-4 mr-1" /> Browse providers
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
                <Link to="/my-bookings/services">My bookings</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <FloatingHowItWorks
            title="Services — How it works"
            intro="A universal booking calendar for anyone offering time-based services. Pay in EUR, exchange emails, no external mailing service required."
            steps={[
              { title: "Browse providers", description: "Filter by category (hair, nails, tutoring, repair…) and city." },
              { title: "Pick a slot", description: "Open a provider's calendar and choose a free time." },
              { title: "Pay securely", description: "Stripe Checkout in EUR — funds held until appointment." },
              { title: "Email contact", description: "You get the provider's email; they get yours. Contact is direct." },
              { title: "Manage & cancel", description: "Cancel >24h before for a full refund." },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-bold mb-1">Any profession</h3>
                <p className="text-sm text-muted-foreground">
                  Hair, nails, massage, tutoring, coaching, repair, cleaning — anyone with a calendar.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-bold mb-1">Direct email contact</h3>
                <p className="text-sm text-muted-foreground">
                  Customer ↔ provider emails are exchanged after payment — no Resend, no third-party mail service.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <ShieldCheck className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-bold mb-1">Secure Stripe payments</h3>
                <p className="text-sm text-muted-foreground">
                  Fixed EUR pricing, 15% platform fee, 24h cancellation refund policy.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 text-center flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" variant="premium">
              <Link to="/services">
                <Clock className="h-4 w-4 mr-1" /> Start booking now
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/services/provider/setup">
                <Euro className="h-4 w-4 mr-1" /> Earn as a provider
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
