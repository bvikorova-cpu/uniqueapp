import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLearningContent } from "@/hooks/useLearningContent";
import { Video, Calendar, Users, Star, Clock } from "lucide-react";
import { toast } from "sonner";
import UnifiedXPLeaderboard from "@/components/shared/UnifiedXPLeaderboard";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const Masterclasses = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [registering, setRegistering] = useState<string | null>(null);
  const { purchaseContent, isPurchased, verifyPurchase, loading } = useLearningContent();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      verifyPurchase(sessionId).then((success) => {
        if (success) {
          toast({
            title: "Registration Confirmed! 🎉",
            description: "You now have access to your ProClass.",
          });
          window.history.replaceState({}, '', '/proclasses');
        }
      });
    }
  }, [verifyPurchase, toast]);

  const masterclasses = [
    {
      id: "leadership-excellence",
      title: "Leadership Excellence with Simon Sinek",
      expert: "Simon Sinek",
      expertise: "Leadership & Organizational Strategy",
      description: "Learn the principles of inspirational leadership from one of the world's top thought leaders",
      price: 269,
      date: "Available Now",
      time: "On-Demand Access",
      duration: "3 hours",
      attendees: 0,
      maxAttendees: 999,
      rating: 5.0,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
      topics: ["Inspirational Leadership", "Team Building", "Company Culture", "Vision & Mission"],
      format: "Video ProClass + Materials"
    },
    {
      id: "ai-innovation",
      title: "AI Innovation & Future Tech with Andrew Ng",
      expert: "Dr. Andrew Ng",
      expertise: "Artificial Intelligence & Machine Learning",
      description: "Explore cutting-edge AI applications and future trends with a pioneer in machine learning",
      price: 359,
      date: "Available Now",
      time: "On-Demand Access",
      duration: "3 hours",
      attendees: 0,
      maxAttendees: 999,
      rating: 5.0,
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400",
      topics: ["Machine Learning", "Deep Learning", "AI Ethics", "Future of AI"],
      format: "Video Workshop + Q&A Resources"
    },
    {
      id: "business-strategy",
      title: "Business Strategy ProClass with Gary Vaynerchuk",
      expert: "Gary Vaynerchuk",
      expertise: "Entrepreneurship & Digital Marketing",
      description: "Master modern business strategy and digital marketing from a serial entrepreneur",
      price: 224,
      date: "Available Now",
      time: "On-Demand Access",
      duration: "3 hours",
      attendees: 0,
      maxAttendees: 999,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400",
      topics: ["Business Strategy", "Social Media Marketing", "Brand Building", "Hustle Culture"],
      format: "Video ProClass + Workbook"
    },
    {
      id: "design-thinking",
      title: "Design Thinking & Innovation with Tim Brown",
      expert: "Tim Brown",
      expertise: "Design Thinking & Innovation",
      description: "Learn how to apply design thinking to solve complex business challenges",
      price: 251,
      date: "Available Now",
      time: "On-Demand Access",
      duration: "3 hours",
      attendees: 0,
      maxAttendees: 999,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400",
      topics: ["Design Thinking", "Innovation Strategy", "User-Centered Design", "Prototyping"],
      format: "Video Workshop + Templates"
    }
  ];

  const handleRegister = async (classId: string, price: number, title: string) => {
    if (isPurchased(classId, "masterclass")) {
      navigate(`/masterclass/${classId}`);
      return;
    }

    setRegistering(classId);
    
    try {
      const sessionUrl = await purchaseContent(classId, "masterclass", title, price);
      
      if (sessionUrl) {
        window.open(sessionUrl, '_blank');
        toast({
          title: "Redirecting to Payment",
          description: "Complete your payment to access the ProClass.",
        });
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setRegistering(null);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Masterclasses works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 mt-16">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Expert ProClasses
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn directly from world-renowned experts in exclusive live sessions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {masterclasses.map((masterclass) => (
            <Card key={masterclass.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
              <div className="h-56 overflow-hidden relative">
                <img 
                  src={masterclass.image} 
                  alt={masterclass.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  {isPurchased(masterclass.id, "masterclass") ? (
                    <Badge className="bg-success">
                      Purchased
                    </Badge>
                  ) : (
                    <Badge className="bg-primary">
                      <Video className="w-3 h-3 mr-1" />
                      On-Demand
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline">{masterclass.format}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{masterclass.rating}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">{masterclass.title}</h3>
                
                <div className="mb-4 pb-4 border-b">
                  <p className="font-semibold text-primary">{masterclass.expert}</p>
                  <p className="text-sm text-muted-foreground">{masterclass.expertise}</p>
                </div>

                <p className="text-muted-foreground mb-4">{masterclass.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{masterclass.date} • {masterclass.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{masterclass.duration} of content</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">Topics covered:</p>
                  <div className="flex flex-wrap gap-2">
                    {masterclass.topics.map((topic, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-3xl font-bold text-primary">€{masterclass.price}</p>
                    <p className="text-xs text-muted-foreground">Per seat</p>
                  </div>
                  <Button
                    onClick={() => handleRegister(masterclass.id, masterclass.price, masterclass.title)}
                    disabled={registering === masterclass.id || loading}
                    size="lg"
                    variant={isPurchased(masterclass.id, "masterclass") ? "secondary" : "default"}
                  >
                    {registering === masterclass.id 
                      ? "Processing..." 
                      : isPurchased(masterclass.id, "masterclass")
                      ? "Access ProClass"
                      : "Register Now"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          <UnifiedXPLeaderboard hub="proclass" />
        </div>

        <div className="mt-12">
          <Card className="p-8 bg-gradient-to-r from-primary/10 to-primary/5 text-center">
            <h3 className="text-2xl font-black mb-4">Want to host your own ProClass?</h3>
            <p className="text-muted-foreground mb-6">
              Share your expertise with our global community of learners
            </p>
            <Button size="lg" variant="outline" onClick={() => { window.location.href = "/become-creator?type=instructor"; }}>
              Become an Expert Instructor
            </Button>
          </Card>
        </div>
      </div>
    </div>
    </>
    );
};

export default Masterclasses;
