import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Video, Calendar, Users, Star, Clock } from "lucide-react";

const Masterclasses = () => {
  const { toast } = useToast();
  const [registering, setRegistering] = useState<string | null>(null);

  const masterclasses = [
    {
      id: "leadership-excellence",
      title: "Leadership Excellence with Simon Sinek",
      expert: "Simon Sinek",
      expertise: "Leadership & Organizational Strategy",
      description: "Learn the principles of inspirational leadership from one of the world's top thought leaders",
      price: 299,
      date: "March 15, 2024",
      time: "2:00 PM - 5:00 PM EST",
      duration: "3 hours",
      attendees: 156,
      maxAttendees: 200,
      rating: 5.0,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
      topics: ["Inspirational Leadership", "Team Building", "Company Culture", "Vision & Mission"],
      format: "Live Interactive Session"
    },
    {
      id: "ai-innovation",
      title: "AI Innovation & Future Tech with Andrew Ng",
      expert: "Dr. Andrew Ng",
      expertise: "Artificial Intelligence & Machine Learning",
      description: "Explore cutting-edge AI applications and future trends with a pioneer in machine learning",
      price: 399,
      date: "March 20, 2024",
      time: "10:00 AM - 1:00 PM PST",
      duration: "3 hours",
      attendees: 178,
      maxAttendees: 150,
      rating: 5.0,
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400",
      topics: ["Machine Learning", "Deep Learning", "AI Ethics", "Future of AI"],
      format: "Live Workshop + Q&A"
    },
    {
      id: "business-strategy",
      title: "Business Strategy Masterclass with Gary Vaynerchuk",
      expert: "Gary Vaynerchuk",
      expertise: "Entrepreneurship & Digital Marketing",
      description: "Master modern business strategy and digital marketing from a serial entrepreneur",
      price: 249,
      date: "March 25, 2024",
      time: "1:00 PM - 4:00 PM EST",
      duration: "3 hours",
      attendees: 143,
      maxAttendees: 200,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400",
      topics: ["Business Strategy", "Social Media Marketing", "Brand Building", "Hustle Culture"],
      format: "Interactive Masterclass"
    },
    {
      id: "design-thinking",
      title: "Design Thinking & Innovation with Tim Brown",
      expert: "Tim Brown",
      expertise: "Design Thinking & Innovation",
      description: "Learn how to apply design thinking to solve complex business challenges",
      price: 279,
      date: "April 1, 2024",
      time: "11:00 AM - 2:00 PM GMT",
      duration: "3 hours",
      attendees: 89,
      maxAttendees: 150,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400",
      topics: ["Design Thinking", "Innovation Strategy", "User-Centered Design", "Prototyping"],
      format: "Hands-on Workshop"
    }
  ];

  const handleRegister = (classId: string, price: number, title: string) => {
    setRegistering(classId);
    toast({
      title: "Processing Registration",
      description: `Securing your spot for $${price}...`,
    });
    
    setTimeout(() => {
      toast({
        title: "Registration Confirmed!",
        description: `You're registered for: ${title}`,
      });
      setRegistering(null);
    }, 2000);
  };

  const getAvailabilityColor = (attendees: number, max: number) => {
    const percentage = (attendees / max) * 100;
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 70) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Expert Masterclasses
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
                  <Badge className="bg-red-500 text-white">
                    <Video className="w-3 h-3 mr-1" />
                    LIVE
                  </Badge>
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
                    <span>{masterclass.duration} live session</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className={`w-4 h-4 ${getAvailabilityColor(masterclass.attendees, masterclass.maxAttendees)}`} />
                    <span className={getAvailabilityColor(masterclass.attendees, masterclass.maxAttendees)}>
                      {masterclass.attendees}/{masterclass.maxAttendees} spots filled
                    </span>
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
                    <p className="text-3xl font-bold text-primary">${masterclass.price}</p>
                    <p className="text-xs text-muted-foreground">Per seat</p>
                  </div>
                  <Button
                    onClick={() => handleRegister(masterclass.id, masterclass.price, masterclass.title)}
                    disabled={registering === masterclass.id || masterclass.attendees >= masterclass.maxAttendees}
                    size="lg"
                  >
                    {masterclass.attendees >= masterclass.maxAttendees 
                      ? "Sold Out" 
                      : registering === masterclass.id 
                      ? "Processing..." 
                      : "Register Now"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <Card className="p-8 bg-gradient-to-r from-primary/10 to-primary/5 text-center">
            <h3 className="text-2xl font-bold mb-4">Want to host your own masterclass?</h3>
            <p className="text-muted-foreground mb-6">
              Share your expertise with our global community of learners
            </p>
            <Button size="lg" variant="outline">
              Become an Expert Instructor
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Masterclasses;
