import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLearningContent } from "@/hooks/useLearningContent";
import { Camera, Clock, Star, Users } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const Photography = () => {
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
            description: "You now have access to your photography ProClass.",
          });
          window.history.replaceState({}, '', '/photography');
        }
      });
    }
  }, [verifyPurchase, toast]);

  const masterclasses = [
    {
      id: "portrait-photography",
      title: "Portrait Photography Mastery",
      description: "Capture stunning portraits with professional lighting and posing techniques",
      price: 189,
      duration: "7 weeks",
      students: 5621,
      rating: 4.9,
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=400",
      skills: ["Lighting", "Posing", "Composition", "Editing", "Client management"],
      includes: ["RAW files", "Presets pack", "Certificate", "Portfolio review"]
    },
    {
      id: "landscape-photography",
      title: "Landscape Photography Pro",
      description: "Master the art of capturing breathtaking landscapes and nature",
      price: 169,
      duration: "6 weeks",
      students: 4238,
      rating: 4.8,
      level: "All Levels",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      skills: ["Composition", "Golden hour", "Long exposure", "HDR", "Post-processing"],
      includes: ["Location guides", "Weather planning", "Certificate", "Editing presets"]
    },
    {
      id: "product-photography",
      title: "Product Photography for E-commerce",
      description: "Create professional product photos that sell",
      price: 159,
      duration: "5 weeks",
      students: 3847,
      rating: 4.7,
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400",
      skills: ["Studio setup", "White background", "Styling", "Retouching", "Batch editing"],
      includes: ["Setup diagrams", "Workflow templates", "Certificate", "Presets"]
    },
    {
      id: "wildlife-photography",
      title: "Wildlife Photography Adventure",
      description: "Capture amazing wildlife photos in their natural habitat",
      price: 199,
      duration: "8 weeks",
      students: 2914,
      rating: 4.9,
      level: "Advanced",
      image: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=400",
      skills: ["Tracking", "Fast action", "Telephoto techniques", "Ethics", "Post-processing"],
      includes: ["Field guides", "Gear recommendations", "Certificate", "Expert mentoring"]
    }
  ];

  const handleEnroll = async (masterclassId: string, price: number, title: string) => {
    if (isPurchased(masterclassId, "photography-masterclass")) {
      toast({
        title: "Already Enrolled",
        description: "You already have access to this ProClass.",
      });
      return;
    }

    setEnrolling(masterclassId);
    
    try {
      const sessionUrl = await purchaseContent(masterclassId, "photography-masterclass", title, price);
      
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
    <>
      <FloatingHowItWorks
        title="How Photography ProClass works"
        steps={[
          { title: 'Pick a class', description: 'Choose a photography workshop that fits your level.' },
          { title: 'Enroll', description: 'Pay securely with Stripe to unlock lessons.' },
          { title: 'Learn & shoot', description: 'Work through modules with real assignments.' },
          { title: 'Share results', description: 'Post your best shots to the community.' },
        ]}
      />
    <div className="min-h-screen bg-background px-3 sm:px-6 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 pt-20 sm:pt-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4">
            <Camera className="w-4 h-4" />
            <span className="font-medium">Professional Training</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Photography ProClasses
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Learn from professional photographers and master your craft
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {masterclasses.map((masterclass) => (
            <Card key={masterclass.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={masterclass.image} 
                  alt={masterclass.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary">{masterclass.level}</Badge>
                </div>
                {isPurchased(masterclass.id, "photography-masterclass") && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-success">Enrolled</Badge>
                  </div>
                )}
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs sm:text-sm font-semibold">{masterclass.rating}</span>
                  </div>
                </div>

                <h3 className="text-lg sm:text-2xl font-black mb-2">{masterclass.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">{masterclass.description}</p>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{masterclass.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{masterclass.students.toLocaleString()} students</span>
                  </div>
                </div>

                <div className="mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm font-semibold mb-2">What you'll learn:</p>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {masterclass.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-primary/5 rounded-lg">
                  <p className="text-xs font-semibold mb-1">Includes:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {masterclass.includes.map((item, idx) => (
                      <li key={idx}>✓ {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">€{masterclass.price}</p>
                    <p className="text-xs text-muted-foreground">Complete ProClass</p>
                  </div>
                  <Button
                    onClick={() => handleEnroll(masterclass.id, masterclass.price, masterclass.title)}
                    disabled={enrolling === masterclass.id || loading}
                    size="sm"
                    className="w-full sm:w-auto"
                    variant={isPurchased(masterclass.id, "photography-masterclass") ? "secondary" : "default"}
                  >
                    {enrolling === masterclass.id 
                      ? "Processing..." 
                      : isPurchased(masterclass.id, "photography-masterclass")
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
    </>
  );
};

export default Photography;