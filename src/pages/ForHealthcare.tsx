import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Heart, Stethoscope, Brain, Building2, ShieldCheck, Tablet } from "lucide-react";

const tiers = [
  { name: "Pediatric Mini", price: "€3", desc: "Solo pediatrician, waiting-room library." },
  { name: "Standard", price: "€5", desc: "Up to 3 providers, session tracking." },
  { name: "Art Therapy Pro", price: "€15", desc: "Therapist tools, progress notes, parent portal." },
  { name: "Clinic Premium", price: "€25", desc: "Multi-location, staff accounts, tablet licenses, EHR/API." },
];

const features = [
  { icon: Heart, title: "Calming Library", desc: "Curated content for pediatric, dental and oncology waiting rooms." },
  { icon: Brain, title: "Art Therapy Tools", desc: "Session tracking, mood tags, exportable progress notes." },
  { icon: Building2, title: "Multi-location", desc: "Manage clinics, departments and staff under one billing account." },
  { icon: Tablet, title: "Tablet Licenses", desc: "Dedicated kiosk mode for in-room tablets — no login required for kids." },
  { icon: ShieldCheck, title: "Privacy First", desc: "GDPR + HIPAA-aligned, RLS-scoped per clinic, no cross-clinic data leakage." },
  { icon: Stethoscope, title: "Parent Portal", desc: "Parents view their child's session output, opt in/out of sharing." },
];

export default function ForHealthcare() {
  return (
    <>
      <SEO
        title="AI Coloring for Healthcare — Pediatric & Art Therapy Tools"
        description="Coloring & art therapy platform for clinics, hospitals and therapists. Session tracking, parent portal, EHR-ready. From €3/month."
        canonical="/for-healthcare"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Unique Coloring for Healthcare",
          description: "AI coloring & art therapy SaaS for pediatric clinics, hospitals and licensed therapists.",
          offers: tiers.map((t) => ({
            "@type": "Offer",
            name: t.name,
            price: t.price.replace("€", ""),
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
          })),
        }}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-10 space-y-16">
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Stethoscope className="h-4 w-4" />
            For Clinics, Hospitals & Therapists
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Calm waiting rooms. Measurable art therapy outcomes.
          </h1>
          <p className="text-lg text-muted-foreground">
            Purpose-built coloring & creative-therapy tools for pediatric care, dentistry, oncology and licensed art therapists — with session tracking, parent portal and EHR-ready exports.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/coloring-pages?tab=healthcare">See plans</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/coloring-pages?tab=healthcare#contact">Book a demo</Link>
            </Button>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <f.icon className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{f.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Plans & pricing</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {tiers.map((t) => (
              <Card key={t.name} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{t.name}</CardTitle>
                  <div className="text-3xl font-bold">{t.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-4">
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                  <Button asChild size="sm">
                    <Link to="/coloring-pages?tab=healthcare">Subscribe</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
