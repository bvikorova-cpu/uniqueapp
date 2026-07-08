import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLearningContent } from "@/hooks/useLearningContent";
import { PenTool, Clock, Star, Users } from "lucide-react";
import { CourseAcademicActions } from "@/components/courses/CourseAcademicActions";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const CreativeWriting = () => {
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
            description: "You now have access to your writing workshop.",
          });
          window.history.replaceState({}, '', '/creative-writing');
        }
      });
    }
  }, [verifyPurchase, toast]);

  const workshops = [
    {
      id: "novel-writing",
      title: "Novel Writing ProClass",
      description: "Write and complete your first novel with expert guidance",
      price: 199,
      duration: "12 weeks",
      students: 5621,
      rating: 4.9,
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400",
      skills: ["Plot structure", "Character development", "Dialogue", "Pacing", "Editing"],
      includes: ["Writing prompts", "Feedback sessions", "Certificate", "Publishing guide"]
    },
    {
      id: "screenwriting",
      title: "Screenwriting for Film & TV",
      description: "Master the art of writing compelling scripts",
      price: 219,
      duration: "10 weeks",
      students: 4238,
      rating: 4.8,
      level: "All Levels",
      image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400",
      skills: ["Script format", "Scene writing", "Act structure", "Dialogue", "Pitching"],
      includes: ["Script templates", "Industry insights", "Certificate", "Agent contacts"]
    },
    {
      id: "poetry-workshop",
      title: "Poetry Writing Workshop",
      description: "Express yourself through powerful and evocative poetry",
      price: 149,
      duration: "6 weeks",
      students: 3421,
      rating: 4.7,
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=400",
      skills: ["Poetic forms", "Imagery", "Rhythm & meter", "Metaphor", "Voice"],
      includes: ["Poetry anthology", "Peer reviews", "Certificate", "Publication tips"]
    },
    {
      id: "copywriting",
      title: "Professional Copywriting",
      description: "Write persuasive copy that sells and converts",
      price: 179,
      duration: "8 weeks",
      students: 7234,
      rating: 4.9,
      level: "All Levels",
      image: "https://images.unsplash.com/photo-1542435503-956c469947f6?w=400",
      skills: ["Headlines", "Email copy", "Sales pages", "Ad copy", "SEO writing"],
      includes: ["Swipe files", "Templates library", "Certificate", "Client acquisition"]
    }
  ];

  const handleEnroll = async (workshopId: string, price: number, title: string) => {
    if (isPurchased(workshopId, "writing-workshop")) {
      navigate(`/writing/${workshopId}`);
      return;
    }

    setEnrolling(workshopId);
    
    try {
      const sessionUrl = await purchaseContent(workshopId, "writing-workshop", title, price);
      
      if (sessionUrl) {
        // Direct redirect to Stripe instead of opening new window
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
        title="How Creative Writing works"
        steps={[
          { title: 'Browse workshops', description: 'Explore ProClass writing workshops led by pros.' },
          { title: 'Enroll & pay', description: 'Secure your seat via Stripe checkout.' },
          { title: 'Attend & practice', description: 'Follow lessons and complete exercises.' },
          { title: 'Get feedback', description: 'Submit work and receive mentor feedback.' },
        ]}
      />
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 mt-16">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Creative Writing Workshops
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Develop your writing craft with expert instructors and feedback
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workshops.map((workshop) => (
            <Card key={workshop.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={workshop.image} 
                  alt={workshop.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary">{workshop.level}</Badge>
                </div>
                {isPurchased(workshop.id, "writing-workshop") && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-success">Enrolled</Badge>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <PenTool className="w-5 h-5 text-primary" />
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{workshop.rating}</span>
                  </div>
                </div>

                <h3 className="text-2xl font-black mb-2">{workshop.title}</h3>
                <p className="text-muted-foreground mb-4">{workshop.description}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{workshop.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{workshop.students.toLocaleString()} students</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">What you'll learn:</p>
                  <div className="flex flex-wrap gap-2">
                    {workshop.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-4 p-3 bg-primary/5 rounded-lg">
                  <p className="text-xs font-semibold mb-1">Includes:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {workshop.includes.map((item, idx) => (
                      <li key={idx}>✓ {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-3xl font-bold text-primary">€{workshop.price}</p>
                    <p className="text-xs text-muted-foreground">Complete workshop</p>
                  </div>
                  <Button
                    onClick={() => handleEnroll(workshop.id, workshop.price, workshop.title)}
                    disabled={enrolling === workshop.id || loading}
                    size="lg"
                    variant={isPurchased(workshop.id, "writing-workshop") ? "secondary" : "default"}
                  >
                    {enrolling === workshop.id 
                      ? "Processing..." 
                      : isPurchased(workshop.id, "writing-workshop")
                      ? "Continue Writing"
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

export default CreativeWriting;