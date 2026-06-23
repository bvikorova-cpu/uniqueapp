import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Briefcase, PartyPopper, Utensils, Heart, CalendarRange } from "lucide-react";

const segments = [
  { icon: PartyPopper, title: "Events & Conferences", desc: "Branded coloring booklets for delegates, kids' corners, swag bags." },
  { icon: Utensils, title: "Restaurants & Cafés", desc: "Kids' menus, table activity sheets, brand-tied character packs." },
  { icon: Heart, title: "Weddings", desc: "Custom kids' activity packs themed to the couple's story." },
  { icon: CalendarRange, title: "Event Organizers", desc: "Multi-event accounts, bulk PDF generation, on-site print delivery." },
];

export default function ForBusiness() {
  return (
    <>
      <SEO
        title="Custom Coloring for Business — Events, Restaurants, Weddings"
        description="Branded AI coloring booklets and kids' activity packs for events, restaurants, weddings and corporate organizers. Custom quotes in EUR."
        canonical="/for-business"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Unique Coloring for Business",
          description: "Custom branded coloring & kids' activity packs for businesses and events.",
          areaServed: "EU",
          offers: { "@type": "Offer", priceCurrency: "EUR" },
        }}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-10 space-y-16">
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Briefcase className="h-4 w-4" />
            For Business
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Branded coloring booklets & kids' packs for your business
          </h1>
          <p className="text-lg text-muted-foreground">
            From restaurant kids' menus to wedding favors and corporate event swag — we generate custom AI coloring content tied to your brand.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/coloring-pages?tab=corporate">Request a quote</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/coloring-pages?tab=corporate">See examples</Link>
            </Button>
          </div>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {segments.map((s) => (
            <Card key={s.title}>
              <CardHeader>
                <s.icon className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{s.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold">Tell us about your event</h2>
          <p className="text-muted-foreground">Fill the inquiry form — our team replies in EUR with a custom quote within 24 hours.</p>
          <Button asChild size="lg">
            <Link to="/coloring-pages?tab=corporate">Open inquiry form</Link>
          </Button>
        </section>
      </main>
    </>
  );
}
