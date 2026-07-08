import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLearningContent } from "@/hooks/useLearningContent";
import { Globe, Clock, Star, Users, CheckCircle } from "lucide-react";
import { CourseAcademicActions } from "@/components/courses/CourseAcademicActions";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const LanguageLearning = () => {
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
            description: "You now have access to your language program.",
          });
          window.history.replaceState({}, '', '/language-learning');
        }
      });
    }
  }, [verifyPurchase, toast]);

  const programs = [
    {
      id: "spanish-complete",
      title: "Complete Spanish Mastery",
      description: "From beginner to fluent speaker with native tutors",
      price: 179,
      duration: "6 months",
      students: 3241,
      rating: 4.9,
      level: "All Levels",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
      skills: ["Speaking", "Grammar", "Writing", "Listening", "Culture"],
      includes: ["Live sessions", "Native tutors", "Certificate", "Cultural immersion"]
    },
    {
      id: "french-business",
      title: "Business French Professional",
      description: "Master French for international business and diplomacy",
      price: 199,
      duration: "4 months",
      students: 1823,
      rating: 4.8,
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400",
      skills: ["Business vocab", "Presentations", "Negotiations", "Email writing"],
      includes: ["Business scenarios", "Role-playing", "Certificate", "Networking"]
    },
    {
      id: "german-intensive",
      title: "Intensive German Bootcamp",
      description: "Fast-track German learning for career advancement",
      price: 189,
      duration: "3 months",
      students: 2156,
      rating: 4.7,
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1467541473380-93b93cb3f305?w=400",
      skills: ["Conversation", "Grammar", "Pronunciation", "Daily life"],
      includes: ["Daily practice", "Grammar exercises", "Certificate", "Study materials"]
    },
    {
      id: "mandarin-basics",
      title: "Mandarin Chinese Fundamentals",
      description: "Learn the world's most spoken language from scratch",
      price: 169,
      duration: "5 months",
      students: 1534,
      rating: 4.9,
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400",
      skills: ["Characters", "Tones", "Speaking", "Reading", "Writing"],
      includes: ["Character practice", "Tone training", "Certificate", "Cultural lessons"]
    }
  ];

  const handleEnroll = async (programId: string, price: number, title: string) => {
    if (isPurchased(programId, "language-program")) {
      navigate(`/language/${programId}`);
      return;
    }

    setEnrolling(programId);
    
    try {
      const sessionUrl = await purchaseContent(programId, "language-program", title, price);
      
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
      <FloatingHowItWorks title="How Language Learning works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
      <div className="min-h-screen bg-background px-3 sm:px-6 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 pt-20 sm:pt-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4">
            <Globe className="w-4 h-4" />
            <span className="font-medium">Expert Tutors</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Language Learning Programs
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Master a new language with expert tutors and immersive content
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
                {isPurchased(program.id, "language-program") && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-success">Enrolled</Badge>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Globe className="w-5 h-5 text-primary" />
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
                    variant={isPurchased(program.id, "language-program") ? "secondary" : "default"}
                  >
                    {enrolling === program.id 
                      ? "Processing..." 
                      : isPurchased(program.id, "language-program")
                      ? "Continue Learning"
                      : "Enroll Now"}
                  </Button>
                </div>
                <CourseAcademicActions
                  meta={{
                    module_key: "language-learning",
                    module_label: "Language Learning",
                    course_slug: program.id,
                    course_title: program.title,
                    description: program.description,
                    level: program.level,
                    duration: program.duration,
                    price: program.price,
                    skills: program.skills,
                  }}
                  unlocked={isPurchased(program.id, "language-program")}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </>
    );
};

export default LanguageLearning;
