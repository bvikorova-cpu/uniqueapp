import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Users, Music, Ticket, Gift, Zap, DollarSign, MessageCircle, TrendingUp } from "lucide-react";
import { MusicianRegistration } from "@/components/musician/MusicianRegistration";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const ConcertHowItWorks = ({ onBack }: Props) => {
  return (
    <>
      <FloatingHowItWorks title="How Concert How It Works works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>
      <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">How It Works</h2>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-black text-primary flex items-center gap-2"><Users className="h-5 w-5" />For Fans</h3>
              {[
                { step: "1", title: "Browse Concerts", desc: "Discover upcoming live concerts from talented musicians worldwide." },
                { step: "2", title: "Purchase Tickets", desc: "Choose from different ticket tiers (Standard, VIP, Premium) with varying benefits." },
                { step: "3", title: "Watch & Interact", desc: "Join the live stream with real-time HLS adaptive quality streaming." },
                { step: "4", title: "Send Virtual Gifts", desc: "Show appreciation during the performance. 80% goes directly to the artist!" },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm">{item.step}</div>
                  <div>
                    <p className="font-bold text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-black text-primary flex items-center gap-2"><Music className="h-5 w-5" />For Musicians</h3>
              {[
                { step: "1", title: "Create Profile", desc: "Register as a musician with your stage name, genre, bio, and photo." },
                { step: "2", title: "Schedule Concerts", desc: "Create events with custom ticket types and pricing via your dashboard." },
                { step: "3", title: "Go Live", desc: "Stream using HLS technology with auto-generated adaptive bitrate." },
                { step: "4", title: "Earn Revenue", desc: "Keep 80% of ticket sales and gifts. Track earnings in real-time." },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm">{item.step}</div>
                  <div>
                    <p className="font-bold text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-6 border-t">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Key Features</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: Zap, title: "HD Streaming", desc: "HLS adaptive bitrate" },
                { icon: DollarSign, title: "Secure Payments", desc: "Stripe integration" },
                { icon: MessageCircle, title: "Real-Time Chat", desc: "Interact with fans" },
                { icon: TrendingUp, title: "Analytics", desc: "Track earnings" },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
                  <f.icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-xs">{f.title}</p>
                    <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-primary/10 rounded-lg p-6 text-center">
            <h4 className="text-lg font-black mb-2">Ready to Get Started?</h4>
            <p className="text-sm text-muted-foreground mb-4">Join as a fan or register as a musician today!</p>
            <MusicianRegistration />
          </div>
        </CardContent>
      </Card>
    </div>
    </>
    );
};
