import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLearningContent } from "@/hooks/useLearningContent";
import { Mic, Clock, Star, Users } from "lucide-react";
import { CourseAcademicActions } from "@/components/courses/CourseAcademicActions";

const PublicSpeaking = () => {
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
            description: "You now have access to your speaking academy.",
          });
          window.history.replaceState({}, '', '/public-speaking');
        }
      });
    }
  }, [verifyPurchase, toast]);

  const academies = [
    {
      id: "confident-presenter",
      title: "Confident Presenter Program",
      description: "Overcome fear and deliver powerful presentations",
      price: 169,
      duration: "6 weeks",
      students: 5234,
      rating: 4.9,
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400",
      skills: ["Confidence building", "Body language", "Voice control", "Slide design", "Q&A handling"],
      includes: ["Practice sessions", "Feedback videos", "Certificate", "Speech templates"]
    },
    {
      id: "ted-style-talks",
      title: "TED-Style Talks Mastery",
      description: "Craft and deliver inspiring talks that move audiences",
      price: 199,
      duration: "8 weeks",
      students: 4156,
      rating: 4.8,
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400",
      skills: ["Storytelling", "Message clarity", "Stage presence", "Emotion", "Impact"],
      includes: ["Talk analysis", "Recording studio", "Certificate", "Expert coaching"]
    },
    {
      id: "corporate-communication",
      title: "Corporate Communication Skills",
      description: "Excel in business presentations and meetings",
      price: 179,
      duration: "7 weeks",
      students: 6821,
      rating: 4.7,
      level: "All Levels",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400",
      skills: ["Business presentations", "Pitching", "Negotiation", "Leadership talks", "Virtual presenting"],
      includes: ["Templates library", "Case studies", "Certificate", "Networking"]
    },
    {
      id: "voice-mastery",
      title: "Voice & Speech Mastery",
      description: "Develop a powerful and captivating speaking voice",
      price: 149,
      duration: "5 weeks",
      students: 3421,
      rating: 4.9,
      level: "All Levels",
      image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400",
      skills: ["Vocal technique", "Articulation", "Breathing", "Pace & rhythm", "Accent reduction"],
      includes: ["Voice exercises", "Audio coaching", "Certificate", "Practice tracks"]
    }
  ];

  const handleEnroll = async (academyId: string, price: number, title: string) => {
    if (isPurchased(academyId, "speaking-academy")) {
      navigate(`/speaking/${academyId}`);
      return;
    }

    setEnrolling(academyId);
    
    try {
      const sessionUrl = await purchaseContent(academyId, "speaking-academy", title, price);
      
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
            Public Speaking Academy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Become a confident and influential speaker
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {academies.map((academy) => (
            <Card key={academy.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={academy.image} 
                  alt={academy.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary">{academy.level}</Badge>
                </div>
                {isPurchased(academy.id, "speaking-academy") && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-success">Enrolled</Badge>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Mic className="w-5 h-5 text-primary" />
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{academy.rating}</span>
                  </div>
                </div>

                <h3 className="text-2xl font-black mb-2">{academy.title}</h3>
                <p className="text-muted-foreground mb-4">{academy.description}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{academy.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{academy.students.toLocaleString()} students</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">What you'll learn:</p>
                  <div className="flex flex-wrap gap-2">
                    {academy.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-4 p-3 bg-primary/5 rounded-lg">
                  <p className="text-xs font-semibold mb-1">Includes:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {academy.includes.map((item, idx) => (
                      <li key={idx}>✓ {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-3xl font-bold text-primary">€{academy.price}</p>
                    <p className="text-xs text-muted-foreground">Complete program</p>
                  </div>
                  <Button
                    onClick={() => handleEnroll(academy.id, academy.price, academy.title)}
                    disabled={enrolling === academy.id || loading}
                    size="lg"
                    variant={isPurchased(academy.id, "speaking-academy") ? "secondary" : "default"}
                  >
                    {enrolling === academy.id 
                      ? "Processing..." 
                      : isPurchased(academy.id, "speaking-academy")
                      ? "Continue Learning"
                      : "Enroll Now"}
                  </Button>
                </div>
                <CourseAcademicActions
                  meta={{
                    module_key: "public-speaking",
                    module_label: "Public Speaking",
                    course_slug: academy.id,
                    course_title: academy.title,
                    description: academy.description,
                    level: academy.level,
                    duration: academy.duration,
                    price: academy.price,
                    skills: academy.skills,
                  }}
                  unlocked={isPurchased(academy.id, "speaking-academy")}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PublicSpeaking;