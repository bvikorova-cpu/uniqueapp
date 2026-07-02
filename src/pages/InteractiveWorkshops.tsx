import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Calendar, Clock, Award, Zap } from "lucide-react";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const InteractiveWorkshops = () => {
  const { toast } = useToast();
  const [joining, setJoining] = useState<string | null>(null);

  const workshops = [
    {
      id: "coding-bootcamp",
      title: "Full-Stack Coding Bootcamp",
      description: "Build real-world projects with hands-on guidance",
      instructor: "Sarah Johnson",
      price: 199,
      duration: "4 weeks",
      schedule: "Mon & Wed, 6-8 PM EST",
      startDate: "March 18, 2024",
      participants: 12,
      maxParticipants: 15,
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400",
      skills: ["React", "Node.js", "MongoDB", "Git"],
      includes: ["Live coding sessions", "Code reviews", "Career guidance", "Certificate"]
    },
    {
      id: "design-sprint",
      title: "UX Design Sprint Workshop",
      description: "Learn Google's design sprint methodology",
      instructor: "David Park",
      price: 149,
      duration: "1 week",
      schedule: "Daily, 10 AM - 12 PM PST",
      startDate: "March 22, 2024",
      participants: 8,
      maxParticipants: 12,
      level: "All Levels",
      image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400",
      skills: ["Design Thinking", "Prototyping", "User Testing", "Figma"],
      includes: ["Daily exercises", "Portfolio project", "Feedback sessions", "Templates"]
    },
    {
      id: "data-analytics",
      title: "Data Analytics Intensive",
      description: "Master data analysis with Python and SQL",
      instructor: "Dr. Maria Garcia",
      price: 179,
      duration: "3 weeks",
      schedule: "Tue & Thu, 7-9 PM EST",
      startDate: "March 25, 2024",
      participants: 15,
      maxParticipants: 20,
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
      skills: ["Python", "Pandas", "SQL", "Data Visualization"],
      includes: ["Real datasets", "Interactive notebooks", "Project showcase", "Job prep"]
    },
    {
      id: "content-creation",
      title: "Content Creation ProClass",
      description: "Build your personal brand and online presence",
      instructor: "Alex Rivera",
      price: 129,
      duration: "2 weeks",
      schedule: "Sat & Sun, 2-4 PM EST",
      startDate: "March 23, 2024",
      participants: 18,
      maxParticipants: 25,
      level: "All Levels",
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400",
      skills: ["Video Creation", "Social Media", "SEO", "Storytelling"],
      includes: ["Content calendar", "Analytics tools", "Brand kit", "Growth strategies"]
    },
    {
      id: "agile-scrum",
      title: "Agile & Scrum Practitioner",
      description: "Become a certified Scrum Master",
      instructor: "Michael Chen",
      price: 249,
      duration: "2 weeks",
      schedule: "Mon, Wed, Fri, 5-7 PM GMT",
      startDate: "March 20, 2024",
      participants: 10,
      maxParticipants: 15,
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
      skills: ["Scrum Framework", "Sprint Planning", "Team Leadership", "Tools"],
      includes: ["Certification prep", "Mock exams", "Case studies", "PSM I exam"]
    },
    {
      id: "public-speaking",
      title: "Public Speaking Excellence",
      description: "Overcome fear and deliver powerful presentations",
      instructor: "Emma Thompson",
      price: 159,
      duration: "3 weeks",
      schedule: "Wed & Fri, 6-8 PM EST",
      startDate: "March 27, 2024",
      participants: 7,
      maxParticipants: 10,
      level: "All Levels",
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400",
      skills: ["Voice Modulation", "Body Language", "Storytelling", "Confidence"],
      includes: ["Live practice", "Video feedback", "Speech templates", "Peer reviews"]
    }
  ];

  const handleJoin = (workshopId: string, price: number, title: string) => {
    setJoining(workshopId);
    toast({
      title: "Processing Registration",
      description: `Joining workshop for $${price}...`,
    });
    
    setTimeout(() => {
      toast({
        title: "Successfully Enrolled!",
        description: `Welcome to: ${title}`,
      });
      setJoining(null);
    }, 2000);
  };

  const getAvailabilityStatus = (current: number, max: number) => {
    const spotsLeft = max - current;
    if (spotsLeft <= 3) return { text: `Only ${spotsLeft} spots left!`, color: "text-red-500" };
    if (spotsLeft <= 5) return { text: `${spotsLeft} spots remaining`, color: "text-yellow-500" };
    return { text: `${spotsLeft} spots available`, color: "text-green-500" };
  };

  return (
    <>
      <FloatingHowItWorks title="How Interactive Workshops works" steps={[
          { title: 'Browse listings', desc: 'Explore items, services or offers.' },
          { title: 'Open a detail', desc: 'Review price, seller and terms.' },
          { title: 'Buy / order / bid', desc: 'Complete secure Stripe checkout in EUR. Fees follow platform splits.' },
          { title: 'Track & review', desc: 'Manage orders, leave reviews, get notifications.' },
        ]} />
      <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 mt-16">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Interactive Workshops
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hands-on learning in small groups with expert instructors. Build real skills through practice.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {workshops.map((workshop) => {
            const availability = getAvailabilityStatus(workshop.participants, workshop.maxParticipants);
            
            return (
              <Card key={workshop.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 flex flex-col">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={workshop.image} 
                    alt={workshop.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary">{workshop.level}</Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary">
                      <Zap className="w-3 h-3 mr-1" />
                      Interactive
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-2">{workshop.title}</h3>
                  <p className="text-muted-foreground mb-4 flex-1">{workshop.description}</p>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{workshop.instructor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>Starts {workshop.startDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{workshop.duration} • {workshop.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className={availability.color}>{availability.text}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-2">Skills you'll gain:</p>
                    <div className="flex flex-wrap gap-1">
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

                  <div className="flex items-center justify-between pt-4 border-t mt-auto">
                    <div>
                      <p className="text-2xl font-bold text-primary">€{workshop.price}</p>
                      <p className="text-xs text-muted-foreground">Full workshop</p>
                    </div>
                    <Button
                      onClick={() => handleJoin(workshop.id, workshop.price, workshop.title)}
                      disabled={joining === workshop.id || workshop.participants >= workshop.maxParticipants}
                    >
                      {workshop.participants >= workshop.maxParticipants 
                        ? "Full" 
                        : joining === workshop.id 
                        ? "Joining..." 
                        : "Join Now"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-12">
          <Card className="p-8 bg-gradient-to-r from-primary/10 to-primary/5 text-center">
            <h3 className="text-2xl font-black mb-4">Don't see what you're looking for?</h3>
            <p className="text-muted-foreground mb-6">
              Request a custom workshop for your team or suggest a new topic
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="outline" onClick={() => {
                const text = window.prompt("Describe your custom workshop request (topic, target group, date):");
                if (text && text.trim()) toast({ description: "Request sent! We will get back to you within 48 hours." });
              }}>
                Request Custom Workshop
              </Button>
              <Button size="lg" onClick={() => {
                const topic = window.prompt("What topic would you like to see?");
                if (topic && topic.trim()) toast({ description: `Topic "${topic}" added to suggestions!` });
              }}>
                Suggest a Topic
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
    </>
    );
};

export default InteractiveWorkshops;
