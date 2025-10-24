import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Heart, Brain, Smile, Activity, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Healthcare = () => {
  const { toast } = useToast();

  const handleSubscribe = async (priceId: string, planName: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to subscribe",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-healthcare-subscription', {
        body: { priceId, planName }
      });

      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive",
      });
    }
  };

  const plans = [
    {
      id: "pediatric_basic",
      name: "Pediatric Waiting Room",
      price: 5,
      icon: Smile,
      color: "text-blue-500",
      description: "Perfect for pediatricians and dentists",
      features: [
        "Unlimited coloring pages download",
        "Child-friendly themes",
        "Anxiety-reducing content",
        "Monthly new additions",
        "Print-ready PDF format",
        "Basic customization"
      ],
      priceId: "price_pediatric_basic"
    },
    {
      id: "therapy_standard",
      name: "Art Therapy Standard",
      price: 15,
      icon: Brain,
      color: "text-purple-500",
      popular: true,
      description: "For psychologists and therapists",
      features: [
        "Everything in Pediatric plan",
        "Therapeutic coloring collections",
        "Emotion expression themes",
        "Mindfulness & relaxation content",
        "Trauma-informed designs",
        "Session tracking integration",
        "Custom clinic branding",
        "Patient progress reports"
      ],
      priceId: "price_therapy_standard"
    },
    {
      id: "clinic_premium",
      name: "Healthcare Facility Premium",
      price: 25,
      icon: Activity,
      color: "text-red-500",
      description: "Complete solution for clinics",
      features: [
        "Everything in Art Therapy plan",
        "Multi-location support",
        "Staff accounts (up to 10)",
        "Custom content creation",
        "Patient portal access",
        "API integration",
        "Analytics dashboard",
        "Priority support",
        "Bulk licensing available"
      ],
      priceId: "price_clinic_premium"
    }
  ];

  const therapeuticCategories = [
    {
      title: "Anxiety Reduction",
      icon: Heart,
      description: "Calming patterns and nature themes to reduce pre-appointment anxiety",
      examples: ["Mandalas", "Nature scenes", "Gentle animals", "Ocean patterns"]
    },
    {
      title: "Emotional Expression",
      icon: Brain,
      description: "Art therapy tools for processing feelings and emotions",
      examples: ["Emotion faces", "Story scenes", "Abstract patterns", "Character expressions"]
    },
    {
      title: "Pain Distraction",
      icon: Smile,
      description: "Engaging content to help manage discomfort during procedures",
      examples: ["Complex patterns", "Hidden objects", "Detailed scenes", "Focus activities"]
    },
    {
      title: "Social Skills",
      icon: Users,
      description: "Interactive themes for group therapy sessions",
      examples: ["Friendship scenes", "Communication themes", "Group activities", "Cooperation tasks"]
    }
  ];

  const specialPackages = [
    {
      title: "Dental Anxiety Package",
      description: "Specially designed for dental offices to reduce children's fear",
      includes: ["Tooth fairy themes", "Dental hero characters", "Healthy habits", "Positive reinforcement"]
    },
    {
      title: "Hospital Stay Comfort",
      description: "Extended coloring books for children during hospital stays",
      includes: ["Multi-day activities", "Brave hero themes", "Family connection", "Recovery celebration"]
    },
    {
      title: "ADHD Focus Collection",
      description: "Structured activities designed for attention management",
      includes: ["Timed activities", "Progressive complexity", "Clear boundaries", "Success markers"]
    },
    {
      title: "Autism Spectrum Support",
      description: "Sensory-friendly designs for neurodivergent children",
      includes: ["Predictable patterns", "Low-stimulation options", "Routine-based themes", "Clear instructions"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <Heart className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Healthcare Coloring Solutions
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Transform waiting rooms and therapy sessions with therapeutic coloring content.
            Reduce anxiety, engage children, and support healing through art.
          </p>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Subscription Plans</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.id} 
                className={`p-6 relative ${plan.popular ? 'ring-2 ring-primary shadow-xl' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <Icon className={`w-12 h-12 mx-auto mb-4 ${plan.color}`} />
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                  <div className="text-4xl font-bold">
                    €{plan.price}
                    <span className="text-lg text-muted-foreground">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.priceId, plan.name)}
                >
                  Subscribe Now
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Therapeutic Categories */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <h2 className="text-3xl font-bold text-center mb-4">Therapeutic Categories</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Evidence-based coloring content designed for specific therapeutic outcomes
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {therapeuticCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.title} className="p-6">
                <Icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2">{category.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                <ul className="text-xs space-y-1">
                  {category.examples.map((example, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {example}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Special Packages */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Specialized Packages</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Targeted solutions for specific healthcare scenarios and patient needs
        </p>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {specialPackages.map((pkg) => (
            <Card key={pkg.title} className="p-6">
              <h3 className="font-bold text-xl mb-2">{pkg.title}</h3>
              <p className="text-muted-foreground mb-4">{pkg.description}</p>
              <div className="space-y-2">
                <p className="text-sm font-semibold">Includes:</p>
                <ul className="grid grid-cols-2 gap-2">
                  {pkg.includes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Healthcare Providers Choose Us</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Clinical Benefits</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Reduces pre-procedure anxiety by up to 40%</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Evidence-based art therapy approaches</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Supports emotional regulation skills</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Improves patient cooperation</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Practical Benefits</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Easy integration into existing workflows</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>No printing costs - unlimited downloads</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Professional appearance with custom branding</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Positive patient feedback & reviews</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Practice?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join hundreds of healthcare providers using therapeutic coloring to improve patient experiences
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => handleSubscribe(plans[1].priceId, plans[1].name)}>
            Start Free Trial
          </Button>
          <Button size="lg" variant="outline">
            Request Demo
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Healthcare;