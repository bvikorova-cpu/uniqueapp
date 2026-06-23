import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { GraduationCap, Users, BarChart3, Palette, FileText, Sparkles, CheckCircle2 } from "lucide-react";

const tiers = [
  { name: "Kindergarten", price: "€5", desc: "Up to 30 children, basic library, 1 teacher account." },
  { name: "Elementary", price: "€15", desc: "Up to 150 pupils, 5 teachers, analytics, PDF export." },
  { name: "School Premium", price: "€25", desc: "Unlimited pupils, white-label, worksheet generator, API." },
];

const features = [
  { icon: Palette, title: "AI Coloring Library", desc: "Thousands of teacher-approved coloring pages, generated and curated by AI." },
  { icon: FileText, title: "Worksheet Generator", desc: "Turn any topic into printable coloring worksheets in seconds (Premium)." },
  { icon: Users, title: "Multi-teacher Accounts", desc: "Invite staff, assign classes, track per-pupil progress." },
  { icon: BarChart3, title: "Classroom Analytics", desc: "See engagement, completion rate, and time spent per child." },
  { icon: Sparkles, title: "White-label Logo", desc: "Upload school logo — exports carry your branding." },
  { icon: CheckCircle2, title: "GDPR & COPPA Ready", desc: "EU-hosted data, parental consent, age 6–12 by default." },
];

export default function ForSchools() {
  return (
    <>
      <SEO
        title="AI Coloring Pages for Schools — Teacher Dashboard & Bulk PDF"
        description="Subscription AI coloring platform for kindergartens, elementary and premium schools. Worksheet generator, multi-teacher accounts, GDPR-ready. From €5/month."
        canonical="/for-schools"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Unique Coloring for Schools",
          description: "AI-powered coloring page platform for schools with teacher dashboard, analytics and bulk PDF export.",
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
            <GraduationCap className="h-4 w-4" />
            For Schools & Kindergartens
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            AI Coloring Pages your teachers will actually use
          </h1>
          <p className="text-lg text-muted-foreground">
            Unlimited classroom-ready coloring sheets, worksheet generator and progress analytics — built for EU schools, fully GDPR-compliant.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/coloring-pages?tab=schools">See plans</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/coloring-pages?tab=schools#contact">Talk to sales</Link>
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
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((t) => (
              <Card key={t.name} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{t.name}</CardTitle>
                  <div className="text-3xl font-bold">{t.price}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-4">
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                  <Button asChild>
                    <Link to="/coloring-pages?tab=schools">Subscribe</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold">Ready to onboard your school?</h2>
          <p className="text-muted-foreground">After subscribing you get the Teacher Dashboard, invite codes for staff, and instant access to the library.</p>
          <Button asChild size="lg">
            <Link to="/coloring-pages?tab=schools">Get started</Link>
          </Button>
        </section>
      </main>
    </>
  );
}
