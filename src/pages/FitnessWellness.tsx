import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLearningContent } from "@/hooks/useLearningContent";
import { Dumbbell, Clock, Star, Users } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const FitnessWellness = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const { purchaseContent, isPurchased, verifyPurchase, loading } = useLearningContent();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      verifyPurchase(sessionId).then((success) => {
        if (success) {
          toast({
            title: "Enrollment Successful! 🎉",
            description: "You now have access to your fitness program.",
          });
          window.history.replaceState({}, '', '/fitness-wellness');
        }
      });
    }
  }, [verifyPurchase, toast]);

  const programs = [
    {
      id: "yoga-mastery",
      title: "Complete Yoga Mastery",
      description: "From beginner poses to advanced flows with certified instructors",
      price: 149,
      duration: "8 weeks",
      students: 4521,
      rating: 4.9,
      level: "All Levels",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
      skills: ["Flexibility", "Strength", "Mindfulness", "Breathing", "Balance"],
      includes: ["HD videos", "Meal plans", "Certificate", "Community access"]
    },
    {
      id: "hiit-bootcamp",
      title: "HIIT Bootcamp Pro",
      description: "High-intensity interval training for maximum results",
      price: 129,
      duration: "6 weeks",
      students: 3847,
      rating: 4.8,
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400",
      skills: ["Cardio", "Strength", "Endurance", "Fat loss", "Muscle tone"],
      includes: ["Workout plans", "Nutrition guide", "Certificate", "Progress tracker"]
    },
    {
      id: "mindfulness-meditation",
      title: "Mindfulness & Meditation",
      description: "Reduce stress and improve mental clarity through meditation",
      price: 99,
      duration: "4 weeks",
      students: 5234,
      rating: 4.9,
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400",
      skills: ["Meditation", "Stress relief", "Focus", "Sleep quality", "Emotional balance"],
      includes: ["Guided sessions", "Audio downloads", "Certificate", "Daily practices"]
    },
    {
      id: "nutrition-fundamentals",
      title: "Nutrition Fundamentals",
      description: "Learn the science of nutrition and healthy eating habits",
      price: 159,
      duration: "10 weeks",
      students: 2913,
      rating: 4.7,
      level: "All Levels",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400",
      skills: ["Meal planning", "Macros", "Supplements", "Hydration", "Recovery"],
      includes: ["Recipe book", "Shopping lists", "Certificate", "Expert Q&A"]
    }
  ];

  const handleEnroll = async (programId: string, price: number, title: string) => {
    if (isPurchased(programId, "fitness-program")) {
      navigate(`/fitness/${programId}`);
      return;
    }

    setEnrolling(programId);
    
    try {
      const sessionUrl = await purchaseContent(programId, "fitness-program", title, price);
      
      if (sessionUrl) {
        { const __w = window.open(sessionUrl, "_blank", "noopener,noreferrer"); if (!__w) { const __w = window.open(sessionUrl, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = sessionUrl; } }
      }
    } catch (error) {
      toast({
        title: "Enrollment Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
      setEnrolling(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <FloatingHowItWorks title="FitnessWellness — How it works" steps={[{title:"Open the tool",desc:"Launch FitnessWellness from the menu to access its features."},{title:"Explore options",desc:"Browse available cards, filters and personalized recommendations."},{title:"Interact & track",desc:"Log entries, start sessions or run AI scans. Some AI actions cost 3–5 credits."},{title:"Review progress",desc:"Check your dashboard for streaks, achievements and history."}]} />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 mt-16">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Fitness & Wellness Programs
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your body and mind with expert-led fitness programs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((program) => (
            <Card key={program.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={program.image} 
                  alt={program.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary">{program.level}</Badge>
                </div>
                {isPurchased(program.id, "fitness-program") && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-success">Enrolled</Badge>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Dumbbell className="w-5 h-5 text-primary" />
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{program.rating}</span>
                  </div>
                </div>

                <h3 className="text-2xl font-black mb-2">{program.title}</h3>
                <p className="text-muted-foreground mb-4">{program.description}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{program.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{program.students.toLocaleString()} students</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">What you'll learn:</p>
                  <div className="flex flex-wrap gap-2">
                    {program.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-4 p-3 bg-primary/5 rounded-lg">
                  <p className="text-xs font-semibold mb-1">Includes:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {program.includes.map((item, idx) => (
                      <li key={idx}>✓ {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-3xl font-bold text-primary">€{program.price}</p>
                    <p className="text-xs text-muted-foreground">Complete program</p>
                  </div>
                  <Button
                    onClick={() => handleEnroll(program.id, program.price, program.title)}
                    disabled={enrolling === program.id || loading}
                    size="lg"
                    variant={isPurchased(program.id, "fitness-program") ? "secondary" : "default"}
                  >
                    {enrolling === program.id 
                      ? "Processing..." 
                      : isPurchased(program.id, "fitness-program")
                      ? "Continue Training"
                      : "Enroll Now"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FitnessWellness;