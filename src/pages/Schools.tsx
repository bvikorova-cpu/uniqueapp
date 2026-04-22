import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black mb-2">See It In Action</h2>
            <p className="text-muted-foreground">Real classroom scenarios across different grade levels</p>
          </div>
          
          <Tabs defaultValue="elementary" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="kindergarten" className="gap-2">
                <School className="w-4 h-4" />
                Kindergarten
              </TabsTrigger>
              <TabsTrigger value="elementary" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Elementary
              </TabsTrigger>
              <TabsTrigger value="highschool" className="gap-2">
                <BarChart className="w-4 h-4" />
                High School
              </TabsTrigger>
            </TabsList>

            {/* Kindergarten Scenario */}
            <TabsContent value="kindergarten" className="animate-fade-in">
              <Card className="overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-8 flex items-center justify-center">
                    <div className="w-full max-w-md">
                      <div className="aspect-video bg-background/50 rounded-lg shadow-xl flex items-center justify-center relative overflow-hidden border-4 border-yellow-500/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20" />
                        <div className="relative z-10 text-center p-6">
                          <div className="text-6xl mb-4">🎨</div>
                          <p className="text-sm font-medium mb-2">Kindergarten Example</p>
                          <p className="text-xs text-muted-foreground">Simple shapes & bright colors</p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-background/50 rounded">
                          <div className="text-2xl mb-1">🐶</div>
                          <p className="text-xs">Animals</p>
                        </div>
                        <div className="text-center p-2 bg-background/50 rounded">
                          <div className="text-2xl mb-1">🔢</div>
                          <p className="text-xs">Numbers</p>
                        </div>
                        <div className="text-center p-2 bg-background/50 rounded">
                          <div className="text-2xl mb-1">🌈</div>
                          <p className="text-xs">Colors</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-black mb-6">Miss Johnson's Kindergarten Class</h3>
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600 font-bold animate-scale-in">
                          1
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Learning Colors & Shapes</h4>
                          <p className="text-sm text-muted-foreground">
                            "My kids love coloring circles, triangles, and squares! They learn while having fun."
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600 font-bold animate-scale-in" style={{animationDelay: '0.1s'}}>
                          2
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Large Print & Simple Lines</h4>
                          <p className="text-sm text-muted-foreground">
                            Easy-to-follow designs perfect for little hands developing motor skills
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600 font-bold animate-scale-in" style={{animationDelay: '0.2s'}}>
                          3
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Daily Routine Integration</h4>
                          <p className="text-sm text-muted-foreground">
                            Used during quiet time, morning activities, and reward moments
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-yellow-500/10 rounded-lg">
                      <p className="text-sm font-medium mb-2">👶 Perfect for Ages 3-5</p>
                      <p className="text-2xl font-bold text-yellow-600">20+ pages/day</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Elementary Scenario */}
            <TabsContent value="elementary" className="animate-fade-in">
              <Card className="overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8 flex items-center justify-center">
                    <div className="w-full max-w-md">
                      <div className="aspect-video bg-background/50 rounded-lg shadow-xl flex items-center justify-center relative overflow-hidden border-4 border-blue-500/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                        <div className="relative z-10 text-center p-6">
                          <div className="text-6xl mb-4">📚</div>
                          <p className="text-sm font-medium mb-2">Elementary Example</p>
                          <p className="text-xs text-muted-foreground">Educational content & curriculum-aligned</p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-background/50 rounded">
                          <div className="text-2xl mb-1">➕</div>
                          <p className="text-xs">Math</p>
                        </div>
                        <div className="text-center p-2 bg-background/50 rounded">
                          <div className="text-2xl mb-1">🔬</div>
                          <p className="text-xs">Science</p>
                        </div>
                        <div className="text-center p-2 bg-background/50 rounded">
                          <div className="text-2xl mb-1">🌍</div>
                          <p className="text-xs">Geography</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-black mb-6">Mr. Smith's 3rd Grade Class</h3>
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold animate-scale-in">
                          1
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Curriculum Integration</h4>
                          <p className="text-sm text-muted-foreground">
                            "I use these for math worksheets, science diagrams, and history lessons - all in one place!"
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold animate-scale-in" style={{animationDelay: '0.1s'}}>
                          2
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Homework Assignments</h4>
                          <p className="text-sm text-muted-foreground">
                            Create engaging take-home activities that students actually want to complete
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold animate-scale-in" style={{animationDelay: '0.2s'}}>
                          3
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Collaborative Learning</h4>
                          <p className="text-sm text-muted-foreground">
                            Share collections with other teachers and build a school-wide resource library
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-blue-500/10 rounded-lg">
                      <p className="text-sm font-medium mb-2">📖 Perfect for Grades 1-6</p>
                      <p className="text-2xl font-bold text-blue-600">5 hours saved/week</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* High School Scenario */}
            <TabsContent value="highschool" className="animate-fade-in">
              <Card className="overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-8 flex items-center justify-center">
                    <div className="w-full max-w-md">
                      <div className="aspect-video bg-background/50 rounded-lg shadow-xl flex items-center justify-center relative overflow-hidden border-4 border-purple-500/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
                        <div className="relative z-10 text-center p-6">
                          <div className="text-6xl mb-4">🎓</div>
                          <p className="text-sm font-medium mb-2">High School Example</p>
                          <p className="text-xs text-muted-foreground">Complex diagrams & study aids</p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-background/50 rounded">
                          <div className="text-2xl mb-1">🧪</div>
                          <p className="text-xs">Chemistry</p>
                        </div>
                        <div className="text-center p-2 bg-background/50 rounded">
                          <div className="text-2xl mb-1">📐</div>
                          <p className="text-xs">Geometry</p>
                        </div>
                        <div className="text-center p-2 bg-background/50 rounded">
                          <div className="text-2xl mb-1">🗺️</div>
                          <p className="text-xs">History</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-black mb-6">Ms. Rodriguez's Biology Class</h3>
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold animate-scale-in">
                          1
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Detailed Diagrams</h4>
                          <p className="text-sm text-muted-foreground">
                            "Complex systems like cellular structures become easier to memorize through coloring"
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold animate-scale-in" style={{animationDelay: '0.1s'}}>
                          2
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Exam Preparation</h4>
                          <p className="text-sm text-muted-foreground">
                            Create study guides and visual learning materials for test review sessions
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold animate-scale-in" style={{animationDelay: '0.2s'}}>
                          3
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Alternative Learning Styles</h4>
                          <p className="text-sm text-muted-foreground">
                            Engage kinesthetic learners and provide stress-relief during study breaks
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-purple-500/10 rounded-lg">
                      <p className="text-sm font-medium mb-2">🎓 Perfect for Grades 9-12</p>
                      <p className="text-2xl font-bold text-purple-600">85% better retention</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
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
            <h2 className="text-3xl font-black mb-4">Thematic Subject Collections</h2>
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
              <Button size="lg" variant="outline" onClick={() => toast.info("Contact Sales — coming soon")}>
                Contact Sales
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Cancel anytime • 30-day money-back guarantee
            </p>
          </CardContent>
        </Card>
      </main>

    </div>
  );
}
