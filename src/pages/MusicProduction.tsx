import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLearningContent } from "@/hooks/useLearningContent";
import { Music, Clock, Star, Users } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const MusicProduction = () => {
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
            description: "You now have access to your music course.",
          });
          window.history.replaceState({}, '', '/music-production');
        }
      });
    }
  }, [verifyPurchase, toast]);

  const courses = [
    {
      id: "electronic-music",
      title: "Electronic Music Production",
      description: "Create professional EDM, house, and techno tracks",
      price: 219,
      duration: "10 weeks",
      students: 7234,
      rating: 4.9,
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400",
      skills: ["Sound design", "Mixing", "Mastering", "Synthesis", "Arrangement"],
      includes: ["Sample packs", "VST plugins", "Certificate", "Project files"]
    },
    {
      id: "mixing-mastering",
      title: "Mixing & Mastering Mastery",
      description: "Professional audio engineering for any genre",
      price: 199,
      duration: "8 weeks",
      students: 5621,
      rating: 4.8,
      level: "Advanced",
      image: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400",
      skills: ["EQ techniques", "Compression", "Reverb", "Stereo imaging", "Loudness"],
      includes: ["Templates", "Presets", "Certificate", "Stem files"]
    },
    {
      id: "beat-making",
      title: "Hip-Hop Beat Making",
      description: "Create hard-hitting beats and produce like the pros",
      price: 179,
      duration: "6 weeks",
      students: 8942,
      rating: 4.9,
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400",
      skills: ["Sampling", "Drum programming", "Melody creation", "808 bass", "Arrangement"],
      includes: ["Sound kits", "MIDI packs", "Certificate", "Beat templates"]
    },
    {
      id: "songwriting",
      title: "Songwriting & Composition",
      description: "Write memorable songs with professional techniques",
      price: 159,
      duration: "7 weeks",
      students: 4156,
      rating: 4.7,
      level: "All Levels",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      skills: ["Melody writing", "Lyrics", "Chord progressions", "Song structure", "Hooks"],
      includes: ["Chord charts", "Lyric templates", "Certificate", "Collaboration"]
    }
  ];

  const handleEnroll = async (courseId: string, price: number, title: string) => {
    if (isPurchased(courseId, "music-course")) {
      navigate(`/music/${courseId}`);
      return;
    }

    setEnrolling(courseId);
    
    try {
      const sessionUrl = await purchaseContent(courseId, "music-course", title, price);
      
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
      <FloatingHowItWorks title="How Music Production works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 mt-12 sm:mt-16">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Music Production Courses
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Learn music production from industry professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary">{course.level}</Badge>
                </div>
                {isPurchased(course.id, "music-course") && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-success">Enrolled</Badge>
                  </div>
                )}
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <Music className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs sm:text-sm font-semibold">{course.rating}</span>
                  </div>
                </div>

                <h3 className="text-lg sm:text-2xl font-black mb-2">{course.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">{course.description}</p>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{course.students.toLocaleString()} students</span>
                  </div>
                </div>

                <div className="mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm font-semibold mb-2">What you'll learn:</p>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {course.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-primary/5 rounded-lg">
                  <p className="text-xs font-semibold mb-1">Includes:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {course.includes.map((item, idx) => (
                      <li key={idx}>✓ {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">€{course.price}</p>
                    <p className="text-xs text-muted-foreground">Complete course</p>
                  </div>
                  <Button
                    onClick={() => handleEnroll(course.id, course.price, course.title)}
                    disabled={enrolling === course.id || loading}
                    size="sm"
                    className="w-full sm:w-auto"
                    variant={isPurchased(course.id, "music-course") ? "secondary" : "default"}
                  >
                    {enrolling === course.id 
                      ? "Processing..." 
                      : isPurchased(course.id, "music-course")
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

export default MusicProduction;