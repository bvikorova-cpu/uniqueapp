import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, School, Users, Download, Sparkles, BarChart, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const SCHOOL_TIERS = [
  {
    id: "kindergarten",
    name: "Kindergarten Starter",
    price: 5,
    description: "Perfect for preschools and kindergartens",
    features: [
      "100 coloring pages per month",
      "Basic themes (animals, seasons, colors)",
      "PDF export with school logo",
      "Single teacher account",
      "Email support"
    ],
    icon: School,
    popular: false
  },
  {
    id: "elementary",
    name: "Elementary Standard",
    price: 15,
    description: "Ideal for primary schools",
    features: [
      "Unlimited coloring pages",
      "All subjects (math, science, language)",
      "Bulk download (ZIP packages)",
      "School logo + custom branding",
      "Up to 5 teacher accounts",
      "Progress tracking",
      "Priority support"
    ],
    icon: BookOpen,
    popular: true
  },
  {
    id: "premium",
    name: "School Premium",
    price: 25,
    description: "Complete solution for modern schools",
    features: [
      "Everything in Standard +",
      "Custom AI-generated pages",
      "Worksheet generator",
      "Up to 15 teacher accounts",
      "Analytics dashboard",
      "Lesson plan integration",
      "White-label options",
      "Dedicated support"
    ],
    icon: Sparkles,
    popular: false
  }
];

const SUBJECT_COLLECTIONS = [
  {
    title: "Mathematics",
    topics: ["Numbers & Counting", "Geometric Shapes", "Fractions", "Multiplication Tables", "Word Problems"],
    icon: "🔢"
  },
  {
    title: "Science & Nature",
    topics: ["Plants & Animals", "Water Cycle", "Seasons", "Photosynthesis", "Human Body"],
    icon: "🔬"
  },
  {
    title: "Geography",
    topics: ["World Maps", "Countries & Flags", "Continents", "Landmarks", "Climate Zones"],
    icon: "🌍"
  },
  {
    title: "History",
    topics: ["Historical Figures", "Ancient Civilizations", "Important Events", "Cultural Heritage"],
    icon: "📜"
  },
  {
    title: "Languages",
    topics: ["Vocabulary Cards", "Alphabet Learning", "Grammar Basics", "Reading Comprehension"],
    icon: "📚"
  },
  {
    title: "Computer Science",
    topics: ["Coding Basics", "Algorithms", "Pixel Art", "Digital Safety", "Logic Puzzles"],
    icon: "💻"
  }
];

export default function Schools() {
  const [loading, setLoading] = useState<string | null>(null);
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();

  const handleSubscribe = async (tierId: string) => {
    console.log("handleSubscribe called", { tierId, isAdmin, adminLoading });
    
    // Admin môže preskočiť platbu a ísť priamo na dashboard
    if (isAdmin) {
      console.log("Admin detected, navigating to dashboard");
      toast.success("Admin prístup - priame presmerovanie na dashboard");
      navigate('/teacher-dashboard');
      return;
    }

    console.log("Not admin, proceeding with subscription flow");

    try {
      setLoading(tierId);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to subscribe");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-school-subscription", {
        body: { tier: tierId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success("Opening checkout...");
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast.error(error.message || "Failed to create subscription");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        {/* Hero Section */}
        <div className="text-center mb-16 mt-16">
          <Badge className="mb-4" variant="secondary">
            <School className="w-4 h-4 mr-2" />
            For Schools & Educational Institutions
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Educational Coloring Pages
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Empower your students with AI-generated educational coloring pages. 
            Perfect for schools, kindergartens, and educational institutions.
          </p>
          <Link to="/teacher-dashboard">
            <Button variant="outline" size="lg">
              <Users className="w-4 h-4 mr-2" />
              Go to Teacher Dashboard
            </Button>
          </Link>
        </div>

        {/* Demo Video Section */}
        <div className="mb-16">
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Video/Demo Side */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 flex items-center justify-center">
                <div className="w-full max-w-md">
                  <div className="aspect-video bg-background/50 rounded-lg shadow-xl flex items-center justify-center relative overflow-hidden border-4 border-primary/20">
                    {/* Placeholder for video - you can replace with actual video embed */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                    <div className="relative z-10 text-center p-6">
                      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-10 h-10 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <p className="text-sm font-medium mb-2">Watch Demo</p>
                      <p className="text-xs text-muted-foreground">See how teachers use our platform</p>
                    </div>
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    🎓 Real classroom examples • 📊 Student engagement • ⏱️ Time-saving tips
                  </p>
                </div>
              </div>

              {/* Steps Side */}
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-6">How Teachers Use It</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Choose Subject & Topic</h4>
                      <p className="text-sm text-muted-foreground">
                        Select from math, science, history, or any curriculum topic
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Generate & Customize</h4>
                      <p className="text-sm text-muted-foreground">
                        AI creates educational coloring pages with school branding
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Download & Print</h4>
                      <p className="text-sm text-muted-foreground">
                        Bulk download as PDF or ZIP, ready for classroom distribution
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Track & Share</h4>
                      <p className="text-sm text-muted-foreground">
                        Monitor usage, share with colleagues, and organize by collection
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">✨ Average time saved per teacher:</p>
                  <p className="text-2xl font-bold text-primary">3+ hours/week</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {SCHOOL_TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <Card 
                key={tier.id} 
                className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-6 h-6 text-primary" />
                    <CardTitle>{tier.name}</CardTitle>
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(tier.id)}
                    disabled={loading === tier.id || adminLoading}
                  >
                    {loading === tier.id ? "Processing..." : adminLoading ? "Loading..." : "Subscribe Now"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Subject Collections */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Thematic Subject Collections</h2>
            <p className="text-muted-foreground">
              Access curriculum-aligned coloring pages across all major subjects
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SUBJECT_COLLECTIONS.map((subject) => (
              <Card key={subject.title}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{subject.icon}</span>
                    <CardTitle className="text-xl">{subject.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {subject.topics.map((topic, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Users className="w-12 h-12 mx-auto text-primary mb-4" />
              <CardTitle>Multi-Teacher Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Share your subscription with multiple teachers. Collaborate and organize content across your institution.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Download className="w-12 h-12 mx-auto text-primary mb-4" />
              <CardTitle>Bulk Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Download entire collections as ZIP files. Print and distribute easily to your students.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart className="w-12 h-12 mx-auto text-primary mb-4" />
              <CardTitle>Usage Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Track which topics are most popular. Get insights into student engagement and preferences.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-none">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-4">Ready to Transform Learning?</CardTitle>
            <CardDescription className="text-lg">
              Join hundreds of schools already using our platform to engage students
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => handleSubscribe("elementary")}
                disabled={adminLoading}
              >
                {adminLoading ? "Loading..." : "Get Started"}
              </Button>
              <Button size="lg" variant="outline">
                Contact Sales
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Cancel anytime • 30-day money-back guarantee
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
