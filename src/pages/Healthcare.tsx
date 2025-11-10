import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Heart, Brain, Smile, Activity, Users, Stethoscope, Syringe, Eye, Ear, Baby, Sparkles, TrendingUp, Award, Target, BarChart, Tablet, Building2, GraduationCap, Shield, CheckCircle2, Star, Zap, Apple, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHealthcareSubscription } from "@/hooks/useHealthcareSubscription";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const Healthcare = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    subscribed, 
    subscription_tier, 
    subscription_end, 
    loading: subscriptionLoading,
    checkSubscription,
    openCustomerPortal
  } = useHealthcareSubscription();

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

  const basicPlans = [
    {
      id: "pediatric_mini",
      name: "Pediatric Mini",
      price: 3,
      icon: Baby,
      color: "text-blue-400",
      description: "For small practices (1-2 doctors)",
      features: [
        "50 downloads per month",
        "Basic child-friendly themes",
        "Print-ready PDF format",
        "Email support"
      ],
      priceId: "price_1SRv390QTWhd4oRpM8xbH4hm"
    },
    {
      id: "pediatric_standard",
      name: "Pediatric Standard",
      price: 5,
      icon: Smile,
      color: "text-blue-500",
      description: "Perfect for pediatricians",
      features: [
        "Unlimited downloads",
        "All child-friendly themes",
        "Anxiety-reducing content",
        "Monthly new additions",
        "Basic customization"
      ],
      priceId: "price_1SRv3SGaXSfGtYFtIxUFVzYa"
    },
    {
      id: "dental_plus",
      name: "Dental Plus",
      price: 8,
      icon: Smile,
      color: "text-cyan-500",
      description: "Specialized for dental offices",
      features: [
        "Unlimited downloads",
        "Dental-specific themes",
        "Pre/during/post procedure sets",
        "Anxiety reduction materials",
        "Tooth fairy adventures",
        "Custom branding"
      ],
      priceId: "price_1SRv3mGaXSfGtYFtAKPsmIuj"
    },
    {
      id: "therapy_lite",
      name: "Art Therapy Lite",
      price: 12,
      icon: Brain,
      color: "text-purple-400",
      description: "For solo therapists",
      features: [
        "Unlimited downloads",
        "Therapeutic collections",
        "Emotion expression themes",
        "Mindfulness content",
        "Client tracking (up to 20)",
        "Progress reports"
      ],
      priceId: "price_1SRv420QTWhd4oRpAwuVmcrG"
    },
    {
      id: "therapy_professional",
      name: "Art Therapy Professional",
      price: 15,
      icon: Brain,
      color: "text-purple-500",
      popular: true,
      description: "For psychologists with multiple clients",
      features: [
        "Everything in Therapy Lite",
        "Trauma-informed designs",
        "ADHD & autism specialized",
        "Session tracking (unlimited)",
        "Custom clinic branding",
        "Parent portal access",
        "Analytics dashboard"
      ],
      priceId: "price_1SRv4h0QTWhd4oRpv9tvXboN"
    },
    {
      id: "clinic_premium",
      name: "Clinic Premium",
      price: 25,
      icon: Building2,
      color: "text-red-500",
      description: "Complete solution for clinics",
      features: [
        "Everything in Professional",
        "Multi-location support",
        "Staff accounts (up to 10)",
        "API integration",
        "EHR integration ready",
        "Custom content creation",
        "Tablet licenses (5 devices)",
        "Priority support"
      ],
      priceId: "price_1SRvD3GaXSfGtYFtlBnIKIq8"
    },
    {
      id: "hospital_package",
      name: "Hospital Package",
      price: 50,
      icon: Activity,
      color: "text-red-600",
      description: "For entire pediatric departments",
      features: [
        "Everything in Clinic Premium",
        "Unlimited staff accounts",
        "Unlimited locations",
        "Unlimited tablet licenses",
        "24/7 priority support",
        "Dedicated account manager",
        "Custom training sessions",
        "Quarterly content reviews"
      ],
      priceId: "price_1SRvDeGaXSfGtYFtCj31V4Wi"
    }
  ];

  const specializedPackages = [
    {
      id: "oncology_pediatric",
      name: "Pediatric Oncology",
      price: 20,
      icon: Heart,
      color: "text-pink-500",
      description: "For long-term hospitalization",
      features: [
        "Extended activity series",
        "Superhero themes",
        "Hope & positivity focus",
        "Family bonding activities",
        "Progress celebration pages",
        "Customizable for each child"
      ],
      priceId: "price_1SRvDyGaXSfGtYFtlGV3f3Zs"
    },
    {
      id: "physiotherapy",
      name: "Physiotherapy",
      price: 10,
      icon: Activity,
      color: "text-green-500",
      description: "Movement integrated activities",
      features: [
        "Exercise-integrated coloring",
        "Motor skills development",
        "Coordination challenges",
        "Progress tracking",
        "Age-appropriate difficulty"
      ],
      priceId: "price_1SRvEH0QTWhd4oRptr7evlXq"
    },
    {
      id: "speech_therapy",
      name: "Speech Therapy",
      price: 12,
      icon: Ear,
      color: "text-orange-500",
      description: "Language development focus",
      features: [
        "Articulation exercises",
        "Vocabulary building",
        "Sound recognition",
        "Story-based activities",
        "Parent guidance included"
      ],
      priceId: "price_1SRvEaGaXSfGtYFt5QEbP47H"
    },
    {
      id: "occupational_therapy",
      name: "Occupational Therapy",
      price: 15,
      icon: Target,
      color: "text-indigo-500",
      description: "Fine motor skills development",
      features: [
        "Fine motor challenges",
        "Hand-eye coordination",
        "Sensory integration",
        "Daily living skills",
        "Adaptive techniques"
      ],
      priceId: "price_1SRvF7GaXSfGtYFtcg0vJI7H"
    },
    {
      id: "adhd_specialist",
      name: "ADHD Specialist",
      price: 18,
      icon: Zap,
      color: "text-yellow-500",
      description: "Focus-oriented activities",
      features: [
        "Timed activities",
        "Progressive difficulty",
        "Success markers",
        "Attention span building",
        "Reward system integration"
      ],
      priceId: "price_1SRvFQ0QTWhd4oRpHT6IP5tg"
    },
    {
      id: "autism_center",
      name: "Autism Center",
      price: 18,
      icon: Brain,
      color: "text-blue-600",
      description: "Sensory-friendly designs",
      features: [
        "Predictable patterns",
        "Low-stimulation options",
        "Routine-based themes",
        "Clear instructions",
        "Social skills scenarios"
      ],
      priceId: "price_1SRvFjGaXSfGtYFt303VBIYt"
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

  const ageBasedCollections = [
    {
      age: "0-3 years",
      title: "Infant & Toddler",
      description: "Simple shapes, high contrast designs",
      themes: ["Large shapes", "Bold colors", "Simple animals", "Basic patterns"]
    },
    {
      age: "3-6 years",
      title: "Preschool",
      description: "Animals and fairy tales",
      themes: ["Cute animals", "Fairy tales", "Simple stories", "Familiar objects"]
    },
    {
      age: "6-12 years",
      title: "School Age",
      description: "Complex scenes and hobbies",
      themes: ["Sports", "Hobbies", "Adventures", "Nature scenes"]
    },
    {
      age: "13+ years",
      title: "Teenagers",
      description: "Abstract and modern patterns",
      themes: ["Mandalas", "Abstract art", "Geometric patterns", "Modern designs"]
    }
  ];

  const purposeBasedCollections = [
    {
      title: "Pre-Procedure",
      icon: Shield,
      description: "Reduce anxiety before treatment",
      content: "Calming themes, relaxation exercises, positive affirmations"
    },
    {
      title: "During Procedure",
      icon: Target,
      description: "Distraction during treatment",
      content: "Engaging patterns, focus activities, quick completion designs"
    },
    {
      title: "Post-Procedure",
      icon: Award,
      description: "Celebrate success & recovery",
      content: "Victory themes, brave certificates, recovery progress trackers"
    },
    {
      title: "Waiting Room",
      icon: Smile,
      description: "General entertainment",
      content: "Fun themes, variety of difficulties, popular characters"
    }
  ];

  const conditionBasedCollections = [
    {
      condition: "Oncology",
      icon: Heart,
      themes: ["Superhero strength", "Healing warriors", "Hope gardens", "Victory celebrations"]
    },
    {
      condition: "Asthma",
      icon: Activity,
      themes: ["Breathing exercises", "Relaxation scenes", "Nature calm", "Mindful moments"]
    },
    {
      condition: "Diabetes",
      icon: Apple,
      themes: ["Healthy food heroes", "Active lifestyle", "Energy balance", "Sweet success"]
    },
    {
      condition: "Allergies",
      icon: Shield,
      themes: ["Safe food friends", "Allergy awareness", "Emergency heroes", "Protection power"]
    }
  ];

  const advancedFeatures = [
    {
      title: "White Label & Branding",
      icon: Sparkles,
      features: [
        "Custom clinic logo on every page",
        "Branded color schemes",
        "Personalized headers/footers",
        "QR codes to clinic website",
        "Doctor's personalized messages"
      ]
    },
    {
      title: "Therapeutic Tools",
      icon: Brain,
      features: [
        "Emotion tracking integrated",
        "Pain scale visualization",
        "Progress markers & rewards",
        "Parent-child worksheets",
        "Take-home activity packs"
      ]
    },
    {
      title: "Analytics & Reporting",
      icon: BarChart,
      features: [
        "Usage statistics",
        "Popular themes tracking",
        "Time spent analytics",
        "Parent/patient feedback",
        "ROI anxiety reduction metrics"
      ]
    },
    {
      title: "Technology Integration",
      icon: Tablet,
      features: [
        "EHR system integration",
        "Booking system sync",
        "Parent portal access",
        "Digital tablet licenses",
        "API access available"
      ]
    }
  ];

  const specialtyCategories = [
    {
      specialty: "Dental",
      icon: Smile,
      packages: [
        "Tooth fairy adventures",
        "Healthy teeth superheroes",
        "Pre/during/post treatment",
        "Orthodontic themes",
        "First visit preparation"
      ]
    },
    {
      specialty: "Ophthalmology",
      icon: Eye,
      packages: [
        "Eye test friendly",
        "Glasses positivity",
        "Vision exercises",
        "Eye health education",
        "Seeing is believing"
      ]
    },
    {
      specialty: "ENT (Ear-Nose-Throat)",
      icon: Ear,
      packages: [
        "Ear infection education",
        "Tonsillectomy prep",
        "Hearing aid heroes",
        "Allergy awareness",
        "Sinus adventures"
      ]
    },
    {
      specialty: "Vaccination Centers",
      icon: Syringe,
      packages: [
        "Bravery certificates",
        "Vaccine heroes",
        "5-minute quick activities",
        "Sticker reward integration",
        "Courage building"
      ]
    }
  ];

  const b2bStrategies = [
    {
      title: "Pilot Programs",
      icon: Target,
      benefits: [
        "Before/after surveys",
        "Case study materials",
        "Video testimonials",
        "Patient satisfaction metrics"
      ]
    },
    {
      title: "Volume Licensing",
      icon: Building2,
      benefits: [
        "10+ clinics: 20% discount",
        "Hospital networks: 30% discount",
        "National associations: special pricing",
        "Ministry contracts available",
        "Flexible payment terms"
      ]
    },
    {
      title: "Training & Support",
      icon: GraduationCap,
      benefits: [
        "Online webinars for staff",
        "Best practices guides",
        "Implementation support",
        "Hotline assistance",
        "Quarterly reviews"
      ]
    },
    {
      title: "Marketing Support",
      icon: TrendingUp,
      benefits: [
        "Free demo kits",
        "Conference presence",
        "CPE/CME credits",
        "Co-marketing opportunities",
        "Success stories"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 mt-16">
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

      {/* Subscription Status Section */}
      {subscribed && !subscriptionLoading && (
        <section className="container mx-auto px-4 py-8 mb-8">
          <Card className="max-w-4xl mx-auto p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Active Subscription
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      {subscription_tier?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {subscription_end 
                      ? `Renews on ${new Date(subscription_end).toLocaleDateString()}`
                      : 'Active subscription'
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={checkSubscription}>
                  Refresh Status
                </Button>
                <Button size="sm" onClick={() => navigate("/healthcare-dashboard")}>
                  <Heart className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
                <Button size="sm" variant="outline" onClick={openCustomerPortal}>
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Subscription
                </Button>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Subscription Plans */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-4">Subscription Plans</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Choose the perfect plan for your healthcare practice
        </p>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="basic">Basic Plans</TabsTrigger>
            <TabsTrigger value="specialized">Specialized</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {basicPlans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <Card 
                    key={plan.id} 
                    className={`p-6 relative ${plan.popular ? 'ring-2 ring-primary shadow-xl' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                        Most Popular
                      </div>
                    )}
                    <div className="text-center mb-4">
                      <Icon className={`w-10 h-10 mx-auto mb-3 ${plan.color}`} />
                      <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                      <p className="text-muted-foreground text-xs mb-3">{plan.description}</p>
                      <div className="text-3xl font-bold">
                        €{plan.price}
                        <span className="text-sm text-muted-foreground">/mo</span>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full"
                      size="sm"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.priceId, plan.name)}
                      disabled={subscription_tier === plan.id}
                    >
                      {subscription_tier === plan.id ? 'Current Plan' : 'Subscribe'}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="specialized">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {specializedPackages.map((pkg) => {
                const Icon = pkg.icon;
                return (
                  <Card key={pkg.id} className="p-6">
                    <div className="text-center mb-4">
                      <Icon className={`w-10 h-10 mx-auto mb-3 ${pkg.color}`} />
                      <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
                      <p className="text-muted-foreground text-xs mb-3">{pkg.description}</p>
                      <div className="text-3xl font-bold">
                        €{pkg.price}
                        <span className="text-sm text-muted-foreground">/mo</span>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full"
                      size="sm"
                      onClick={() => handleSubscribe(pkg.priceId, pkg.name)}
                      disabled={subscription_tier === pkg.id}
                    >
                      {subscription_tier === pkg.id ? 'Current Plan' : 'Subscribe'}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
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

      {/* Thematic Collections */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <h2 className="text-3xl font-bold text-center mb-4">Thematic Collections</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Carefully curated content for every age, purpose, and medical condition
        </p>
        
        <div className="space-y-12 max-w-6xl mx-auto">
          {/* Age-Based Collections */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-center">By Patient Age</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {ageBasedCollections.map((collection) => (
                <Card key={collection.age} className="p-6">
                  <div className="text-center mb-4">
                    <Baby className="w-10 h-10 mx-auto mb-3 text-primary" />
                    <h4 className="font-bold text-lg mb-1">{collection.age}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{collection.title}</p>
                    <p className="text-xs text-muted-foreground">{collection.description}</p>
                  </div>
                  <div className="space-y-1">
                    {collection.themes.map((theme, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {theme}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Purpose-Based Collections */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-center">By Treatment Stage</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {purposeBasedCollections.map((collection) => {
                const Icon = collection.icon;
                return (
                  <Card key={collection.title} className="p-6">
                    <Icon className="w-10 h-10 mb-3 text-primary" />
                    <h4 className="font-bold text-lg mb-2">{collection.title}</h4>
                    <p className="text-xs text-muted-foreground mb-3">{collection.description}</p>
                    <p className="text-xs">{collection.content}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Condition-Based Collections */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-center">By Medical Condition</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {conditionBasedCollections.map((collection) => {
                const Icon = collection.icon;
                return (
                  <Card key={collection.condition} className="p-6">
                    <Icon className="w-10 h-10 mb-3 text-primary" />
                    <h4 className="font-bold text-lg mb-3">{collection.condition}</h4>
                    <div className="space-y-1">
                      {collection.themes.map((theme, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {theme}
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Advanced Features</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Professional tools to enhance your practice and patient care
        </p>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {advancedFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="p-6">
                <Icon className="w-10 h-10 mb-4 text-primary" />
                <h3 className="font-bold text-lg mb-4">{feature.title}</h3>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs">
                      <Star className="w-3 h-3 text-yellow-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Medical Specialties */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <h2 className="text-3xl font-bold text-center mb-4">Medical Specialty Packages</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Tailored content for specific medical specialties
        </p>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {specialtyCategories.map((specialty) => {
            const Icon = specialty.icon;
            return (
              <Card key={specialty.specialty} className="p-6">
                <div className="text-center mb-4">
                  <Icon className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h3 className="font-bold text-xl">{specialty.specialty}</h3>
                </div>
                <ul className="space-y-2">
                  {specialty.packages.map((pkg, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {pkg}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </section>

      {/* B2B Strategies */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Business Solutions</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Enterprise-grade solutions for healthcare organizations
        </p>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {b2bStrategies.map((strategy) => {
            const Icon = strategy.icon;
            return (
              <Card key={strategy.title} className="p-6">
                <Icon className="w-10 h-10 mb-4 text-primary" />
                <h3 className="font-bold text-lg mb-4">{strategy.title}</h3>
                <ul className="space-y-2">
                  {strategy.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
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

    </div>
  );
};

export default Healthcare;