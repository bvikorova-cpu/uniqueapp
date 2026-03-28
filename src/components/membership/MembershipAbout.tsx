import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Heart, CheckCircle2, Star, DollarSign } from "lucide-react";

export const MembershipAbout = () => {
  return (
    <div className="space-y-6 mb-8">
      {/* What is Membership Community */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-black">What is Membership Community?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Membership Community is a premium subscription platform similar to Patreon or OnlyFans (SFW version), 
            designed for creators who want to monetize their content and build dedicated fan communities. 
            Whether you're a fitness coach, educator, artist, musician, or business mentor, our platform 
            provides all the tools you need to earn recurring revenue from your most loyal supporters.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                For Creators: How to Start Earning
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground">
                <li><strong>Sign in</strong> to your account or create a new one</li>
                <li>Click <strong>"Become a Creator"</strong> to set up your profile</li>
                <li>Create <strong>subscription tiers</strong> with different price points</li>
                <li>Define <strong>exclusive benefits</strong> for each tier</li>
                <li>Start posting <strong>exclusive content</strong> for subscribers</li>
                <li>Engage through <strong>real-time group chats</strong></li>
                <li><strong>Receive monthly payouts</strong> — you keep 90%!</li>
              </ol>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                For Fans: How to Support Creators
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground">
                <li><strong>Browse creators</strong> in the discovery section</li>
                <li>Click <strong>"View"</strong> to see profile and content preview</li>
                <li>Choose a <strong>subscription tier</strong> that fits your budget</li>
                <li>Complete payment via <strong>secure Stripe checkout</strong></li>
                <li>Access <strong>exclusive content</strong> immediately</li>
                <li>Join <strong>community chats</strong> and interact</li>
                <li>Send <strong>tips and gifts</strong> for extra appreciation</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Model */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-black">Creator Revenue Model</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: DollarSign, title: "You Keep 90%", desc: "Industry-leading payout rate. For every €100 in subscriptions, you receive €90." },
              { icon: CheckCircle2, title: "Monthly Payouts", desc: "Automatic monthly payments via Stripe Connect. No minimum threshold required." },
              { icon: Star, title: "Multiple Revenue Streams", desc: "Earn from subscriptions, tips, gifts, merch, and exclusive paid content." },
            ].map((item) => (
              <div key={item.title} className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-2">
                <item.icon className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Why Choose Us */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-black">Why Choose Our Platform?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Similar to Patreon/OnlyFans
              </h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {["Monthly recurring subscriptions", "Exclusive content for paying members", "Direct creator-fan relationships", "Multiple subscription tiers"].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                Our Unique Features
              </h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {["Community-focused Discord-style group chats", "SFW-first: fitness, education, business mentors", "AI Content Assistant for creators", "16 integrated creator tools"].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Star className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
