import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PenTool, FlaskConical, Palette, BookOpen, Sparkles, Shield, Crown, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const KidsAcademy = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: "story-creator",
      title: "AI Story Creator",
      description: "Create magical personalized stories with AI-generated illustrations. Perfect for bedtime stories and creative writing!",
      icon: PenTool,
      path: "/kids-story-creator",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
      borderColor: "border-purple-200 dark:border-purple-800",
      iconBg: "bg-purple-100 dark:bg-purple-900/50",
      iconColor: "text-purple-600 dark:text-purple-400",
      features: ["AI Illustrations", "Story Library", "Download Stories"],
      emoji: "✍️",
    },
    {
      id: "science-lab",
      title: "AI Science Lab",
      description: "Discover science with virtual experiments! Record your hypothesis and observations, let AI analyze your results.",
      icon: FlaskConical,
      path: "/kids-science-lab",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
      borderColor: "border-green-200 dark:border-green-800",
      iconBg: "bg-green-100 dark:bg-green-900/50",
      iconColor: "text-green-600 dark:text-green-400",
      features: ["5 Science Categories", "AI Analysis", "Fun Facts"],
      emoji: "🧪",
    },
    {
      id: "drawing-buddy",
      title: "AI Drawing Buddy",
      description: "Learn to draw step by step with AI-powered tutorials and an interactive canvas with shapes, colors, and more!",
      icon: Palette,
      path: "/kids-drawing-buddy",
      color: "from-orange-500 to-amber-500",
      bgColor: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30",
      borderColor: "border-orange-200 dark:border-orange-800",
      iconBg: "bg-orange-100 dark:bg-orange-900/50",
      iconColor: "text-orange-600 dark:text-orange-400",
      features: ["Step-by-Step", "Reference Overlay", "Save to Gallery"],
      emoji: "🎨",
    },
    {
      id: "reading-companion",
      title: "AI Reading Companion",
      description: "Helps children understand texts through simplified explanations and interactive comprehension quizzes.",
      icon: BookOpen,
      path: "/kids-reading-companion",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
      borderColor: "border-blue-200 dark:border-blue-800",
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      features: ["Text Analysis", "Vocabulary Builder", "Comprehension Quiz"],
      emoji: "📖",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Kids Academy 🎓
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              AI-powered learning adventures for children ages 6-12. Explore creativity, science, art, and reading with fun interactive tools!
            </p>
            
            {/* Premium Banner */}
            <Card className="max-w-lg mx-auto border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-purple-500/5">
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-3">
                  <Crown className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Premium: €5/month</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">Unlimited access to ALL modules</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Module Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <Card
                  key={module.id}
                  className={`group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer border-2 ${module.borderColor} bg-gradient-to-br ${module.bgColor}`}
                  onClick={() => navigate(module.path)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`w-14 h-14 rounded-2xl ${module.iconBg} flex items-center justify-center shadow-md`}>
                        <Icon className={`w-7 h-7 ${module.iconColor}`} />
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="border-purple-300 text-purple-600 dark:border-purple-700 dark:text-purple-400">
                          <Shield className="w-3 h-3 mr-1" />
                          Parent Check
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-xl mt-3 flex items-center gap-2">
                      <span>{module.emoji}</span>
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {module.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <Button className={`w-full bg-gradient-to-r ${module.color} hover:opacity-90 text-white`}>
                      Start Learning
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                  
                  {/* Decorative gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${module.color} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`} />
                </Card>
              );
            })}
          </div>

          {/* Features Overview */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-center">Why Kids Academy?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto">
                    <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold">Safe & Secure</h4>
                  <p className="text-sm text-muted-foreground">Parental Gate protects all AI features</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold">AI-Powered</h4>
                  <p className="text-sm text-muted-foreground">Intelligent learning assistance</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto">
                    <PenTool className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h4 className="font-semibold">Interactive</h4>
                  <p className="text-sm text-muted-foreground">Hands-on creative activities</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto">
                    <Crown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold">One Subscription</h4>
                  <p className="text-sm text-muted-foreground">€5/mo unlocks everything</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default KidsAcademy;
