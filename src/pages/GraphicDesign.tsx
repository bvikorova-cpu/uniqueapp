import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLearningContent } from "@/hooks/useLearningContent";
import { Palette, Clock, Star, Users } from "lucide-react";
import { GraphicDesignAI } from "@/components/graphic-design/GraphicDesignAI";

const GraphicDesign = () => {
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
            description: "You now have access to your design training.",
          });
          window.history.replaceState({}, '', '/graphic-design');
        }
      });
    }
  }, [verifyPurchase, toast]);

  const trainings = [
    {
      id: "brand-identity",
      title: "Brand Identity Design",
      description: "Create memorable brand identities and visual systems",
      price: 189,
      duration: "8 weeks",
      students: 6234,
      rating: 4.9,
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400",
      skills: ["Logo design", "Typography", "Color theory", "Brand guidelines", "Mockups"],
      includes: ["Design templates", "Resource library", "Certificate", "Portfolio review"]
    },
    {
      id: "ui-ux-design",
      title: "UI/UX Design Fundamentals",
      description: "Design beautiful and user-friendly digital interfaces",
      price: 209,
      duration: "10 weeks",
      students: 8421,
      rating: 4.8,
      level: "All Levels",
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400",
      skills: ["Wireframing", "Prototyping", "User research", "Figma", "Design systems"],
      includes: ["Figma templates", "UI kits", "Certificate", "Case studies"]
    },
    {
      id: "illustration",
      title: "Digital Illustration Mastery",
      description: "Create stunning illustrations for any purpose",
      price: 169,
      duration: "7 weeks",
      students: 4521,
      rating: 4.7,
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400",
      skills: ["Drawing fundamentals", "Digital painting", "Character design", "Color", "Composition"],
      includes: ["Brush packs", "Video tutorials", "Certificate", "Community"]
    },
    {
      id: "motion-graphics",
      title: "Motion Graphics & Animation",
      description: "Bring your designs to life with animation",
      price: 229,
      duration: "9 weeks",
      students: 3847,
      rating: 4.9,
      level: "Advanced",
      image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400",
      skills: ["After Effects", "Animation principles", "3D basics", "Video editing", "Sound design"],
      includes: ["Project files", "Plugins guide", "Certificate", "Expert feedback"]
    }
  ];

  const handleEnroll = async (trainingId: string, price: number, title: string) => {
    if (isPurchased(trainingId, "design-training")) {
      navigate(`/design/${trainingId}`);
      return;
    }

    setEnrolling(trainingId);
    
    try {
      const sessionUrl = await purchaseContent(trainingId, "design-training", title, price);
      
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
            Graphic Design Training
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master design with industry-leading courses and tools
          </p>
        </div>

        <div className="mb-8 sm:mb-12">
          <GraphicDesignAI />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trainings.map((training) => (
            <Card key={training.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={training.image} 
                  alt={training.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary">{training.level}</Badge>
                </div>
                {isPurchased(training.id, "design-training") && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-success">Enrolled</Badge>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Palette className="w-5 h-5 text-primary" />
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{training.rating}</span>
                  </div>
                </div>

                <h3 className="text-2xl font-black mb-2">{training.title}</h3>
                <p className="text-muted-foreground mb-4">{training.description}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{training.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{training.students.toLocaleString()} students</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">What you'll learn:</p>
                  <div className="flex flex-wrap gap-2">
                    {training.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-4 p-3 bg-primary/5 rounded-lg">
                  <p className="text-xs font-semibold mb-1">Includes:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {training.includes.map((item, idx) => (
                      <li key={idx}>✓ {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-3xl font-bold text-primary">€{training.price}</p>
                    <p className="text-xs text-muted-foreground">Complete training</p>
                  </div>
                  <Button
                    onClick={() => handleEnroll(training.id, training.price, training.title)}
                    disabled={enrolling === training.id || loading}
                    size="lg"
                    variant={isPurchased(training.id, "design-training") ? "secondary" : "default"}
                  >
                    {enrolling === training.id 
                      ? "Processing..." 
                      : isPurchased(training.id, "design-training")
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

export default GraphicDesign;