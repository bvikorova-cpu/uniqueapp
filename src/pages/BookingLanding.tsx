import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarCheck, Stethoscope, Mail, ShieldCheck, Clock, Euro } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import SEO from "@/components/SEO";
import bookingVideo from "@/assets/section-videos/doctor-booking.mp4.asset.json";

export default function BookingLanding() {
  return (
    <>
      <SEO
        title="Booking — Book a Doctor · Unique"
        description="Book a paid consultation with a verified doctor or healthcare facility in EUR. Secure Stripe checkout, direct email contact — no third-party mail service required."
      />
      <Navbar />
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="relative h-[60vh] min-h-[380px] max-h-[560px] overflow-hidden">
          <video
            src={bookingVideo.url}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-background" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <CalendarCheck className="h-14 w-14 text-white mb-3 drop-shadow-lg" />
            <h1
              className="text-4xl md:text-6xl font-black text-white mb-4"
              style={{ textShadow: "0 4px 30px rgba(139,92,246,0.55)" }}
            >
              Booking{" "}
              <span className="bg-gradient-to-r from-purple-400 via-primary to-pink-400 bg-clip-text text-transparent">
                Center
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-6">
              Book a paid consultation with a verified doctor or healthcare facility.
              Direct patient ↔ doctor email contact — no external mailing service required.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" variant="premium">
                <Link to="/doctors">
                  <Stethoscope className="h-4 w-4 mr-1" /> Find a doctor
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-background/20 backdrop-blur border-white/30 text-white hover:bg-background/40"
              >
                <Link to="/my-bookings/doctors">My bookings</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <FloatingHowItWorks
            title="Booking — How it works"
            intro="Book a consultation and stay in direct contact with your doctor by email — no Resend / third-party mail service needed."
            steps={[
              { title: "Browse doctors", desc: "Filter verified doctors by specialty, language and price." },
              { title: "Pick a slot", desc: "Open the doctor's calendar and pick a free time (EUR pricing)." },
              { title: "Pay securely", desc: "Stripe Checkout in EUR — funds held until the appointment." },
              { title: "Email contact", desc: "After payment you get the doctor's email; the doctor gets yours. Contact is direct." },
              { title: "Manage & cancel", desc: "Track everything under My bookings. Cancel >24h before for a full refund." },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-bold mb-1">Direct email contact</h3>
                <p className="text-sm text-muted-foreground">
                  Patient and doctor emails are shared after payment — no third-party mailing service required.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <ShieldCheck className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-bold mb-1">Verified providers</h3>
                <p className="text-sm text-muted-foreground">
                  Only accepted doctors and healthcare facilities appear on the platform.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Euro className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-bold mb-1">Fixed EUR pricing</h3>
                <p className="text-sm text-muted-foreground">
                  Transparent per-consultation price with 15% platform fee and secure Stripe payouts.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 text-center">
            <Button asChild size="lg" variant="premium">
              <Link to="/doctors">
                <Clock className="h-4 w-4 mr-1" /> Start booking now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
