import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gavel, Clock, Sparkles, Lock, Trophy, Heart } from "lucide-react";
import { Link } from "react-router-dom";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const FEATURES = [
  { icon: Gavel, title: "Bid on real memories", desc: "Verified personal stories, photos, voice notes from creators across the platform." },
  { icon: Lock, title: "NFT-style provenance", desc: "Every winning bid mints a unique, owner-only access token. Resellable in-platform." },
  { icon: Clock, title: "24h timed auctions", desc: "New memories drop daily at 18:00 CET. Bid with credits or EUR." },
  { icon: Heart, title: "Charitable share", desc: "80% to the memory owner, 10% to a charity of their choice, 10% platform fee." },
  { icon: Trophy, title: "Collector profiles", desc: "Show off your collection. Top collectors get verified-collector badge." },
  { icon: Sparkles, title: "AI-narrated retellings", desc: "Each memory comes with an optional AI-generated cinematic retelling." },
];

export default function MemoryAuctions() {
  return (
    <>
      <FloatingHowItWorks title="How Memory Auctions works" steps={[
          { title: 'Browse listings', desc: 'Explore items, services or offers.' },
          { title: 'Open a detail', desc: 'Review price, seller and terms.' },
          { title: 'Buy / order / bid', desc: 'Complete secure Stripe checkout in EUR. Fees follow platform splits.' },
          { title: 'Track & review', desc: 'Manage orders, leave reviews, get notifications.' },
        ]} />
      <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm mb-4">
            <Gavel className="w-4 h-4" /> Memory Auctions
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            The world's first marketplace for human memories
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Real people sell access to real, verified personal memories. Audio, photo, written.
            Bid, collect, own. Coming Q3 2026.
          </p>
          <div className="flex gap-3 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth?redirect=/memory-auctions">Join the waitlist</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/how-it-works">How it works</Link>
            </Button>
          </div>
        </header>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <f.icon className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">{f.title}</CardTitle>
                <CardDescription>{f.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Sample upcoming drops</CardTitle>
            <CardDescription>Preview only — bidding opens at launch.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            {[
              { name: "Last call from grandfather", owner: "Anonymous", floor: "€40" },
              { name: "First time on stage (1987)", owner: "Verified musician", floor: "€120" },
              { name: "Letter from Berlin Wall night", owner: "Verified historian", floor: "€250" },
            ].map((d) => (
              <div key={d.name} className="p-4 rounded-lg bg-background/60 border">
                <p className="font-semibold mb-1">{d.name}</p>
                <p className="text-xs text-muted-foreground mb-2">{d.owner}</p>
                <p className="text-sm">Floor bid: <span className="text-primary font-bold">{d.floor}</span></p>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
    </>
    );
}
