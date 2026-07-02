import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function DesignConsultations() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<number | null>(null);

  const packages = [
    {
      duration: 30, price: 29,
      features: [
        "30-minute video call",
        "Basic recommendations",
        "Color palette guidance",
        "Shopping list"
      ]
    },
    {
      duration: 60, price: 49, popular: true,
      features: [
        "60-minute video call",
        "Complete room design plan",
        "3D visualization concepts",
        "Color palette + layout plan",
        "Detailed shopping list",
        "7-day follow-up support"
      ]
    }
  ];

  const handleBookConsultation = async (duration: 30 | 60) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }
    setLoading(duration);
    try {
      const { data, error } = await supabase.functions.invoke('create-consultation-checkout', {
        body: { duration: duration.toString() }
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create checkout", variant: "destructive" });
    } finally { setLoading(null); }
  };

  return (
    <>
      <FloatingHowItWorks title="How Design Consultations works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="bg-gradient-subtle border-0">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Video className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Design Consultations</CardTitle>
              <CardDescription>Personalized video consultations with professional interior designers</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.duration} className={pkg.popular ? "border-primary border-2" : ""}>
            {pkg.popular && (
              <div className="bg-primary text-primary-foreground text-center py-2 rounded-t-lg font-semibold">Most Popular</div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{pkg.duration} Minutes</CardTitle>
                  <CardDescription>Video Consultation</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">€{pkg.price}</div>
                  <p className="text-sm text-muted-foreground">one-time</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {pkg.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <Button onClick={() => handleBookConsultation(pkg.duration as 30 | 60)}
                className="w-full" variant={pkg.popular ? "default" : "outline"} disabled={loading === pkg.duration}>
                <Calendar className="mr-2 h-4 w-4" />
                {loading === pkg.duration ? "Loading..." : "Book Consultation"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>How It Works</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, title: "Choose a Package", desc: "Select the consultation length that fits your needs" },
              { step: 2, title: "Book a Time Slot", desc: "Pick a convenient time and pay securely online" },
              { step: 3, title: "Video Call", desc: "Meet your designer via Zoom or Google Meet" },
              { step: 4, title: "Receive Materials", desc: "Get a PDF with your design plan, colors, and product list" },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
    );
}
