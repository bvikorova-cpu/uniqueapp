import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLearningContent } from "@/hooks/useLearningContent";
import { ChefHat, Clock, Star, Users } from "lucide-react";
import { CourseAcademicActions } from "@/components/courses/CourseAcademicActions";

const CulinaryArts = () => {
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
            description: "You now have access to your culinary program.",
          });
          window.history.replaceState({}, '', '/culinary-arts');
        }
      });
    }
  }, [verifyPurchase, toast]);

  const programs = [
    {
      id: "professional-chef",
      title: "Professional Chef Training",
      description: "Master culinary techniques from Michelin-star chefs",
      price: 249,
      duration: "12 weeks",
      students: 3421,
      rating: 4.9,
      level: "Advanced",
      image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400",
      skills: ["Knife skills", "Sauce making", "Plating", "Menu design", "Kitchen management"],
      includes: ["Recipe library", "Video tutorials", "Certificate", "Chef mentoring"]
    },
    {
      id: "pastry-baking",
      title: "Pastry & Baking Mastery",
      description: "Create stunning pastries, breads, and desserts",
      price: 189,
      duration: "8 weeks",
      students: 5234,
      rating: 4.8,
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400",
      skills: ["Bread baking", "Pastry dough", "Decoration", "Chocolate work", "Flavor pairing"],
      includes: ["Recipe book", "Techniques guide", "Certificate", "Tools list"]
    },
    {
      id: "international-cuisine",
      title: "International Cuisine Explorer",
      description: "Journey through world cuisines and master authentic dishes",
      price: 169,
      duration: "10 weeks",
      students: 4156,
      rating: 4.7,
      level: "All Levels",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
      skills: ["Italian", "Asian", "French", "Mexican", "Middle Eastern"],
      includes: ["Cultural guides", "Ingredient sourcing", "Certificate", "Recipe collection"]
    },
    {
      id: "plant-based-cooking",
      title: "Plant-Based Culinary Arts",
      description: "Create delicious and nutritious plant-based cuisine",
      price: 149,
      duration: "6 weeks",
      students: 6821,
      rating: 4.9,
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
      skills: ["Protein alternatives", "Flavor building", "Nutrition", "Meal prep", "Creative plating"],
      includes: ["Meal plans", "Shopping guides", "Certificate", "Community access"]
    }
  ];

  const handleEnroll = async (programId: string, price: number, title: string) => {
    if (isPurchased(programId, "culinary-program")) {
      navigate(`/culinary/${programId}`);
      return;
    }

    setEnrolling(programId);
    
    try {
      const sessionUrl = await purchaseContent(programId, "culinary-program", title, price);
      
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
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 mt-16">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Culinary Arts Programs
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master the art of cooking with world-class culinary education
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
                {isPurchased(program.id, "culinary-program") && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-success">Enrolled</Badge>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <ChefHat className="w-5 h-5 text-primary" />
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
                    variant={isPurchased(program.id, "culinary-program") ? "secondary" : "default"}
                  >
                    {enrolling === program.id 
                      ? "Processing..." 
                      : isPurchased(program.id, "culinary-program")
                      ? "Continue Learning"
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

export default CulinaryArts;