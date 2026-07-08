import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLearningContent } from "@/hooks/useLearningContent";
import { TrendingUp, Clock, Star, Users } from "lucide-react";
import { CourseAcademicActions } from "@/components/courses/CourseAcademicActions";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const FinancialInvestment = () => {
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
            description: "You now have access to your investment education.",
          });
          window.history.replaceState({}, '', '/financial-investment');
        }
      });
    }
  }, [verifyPurchase, toast]);

  const educations = [
    {
      id: "stock-market-basics",
      title: "Stock Market Fundamentals",
      description: "Learn to invest in stocks with confidence and strategy",
      price: 219,
      duration: "10 weeks",
      students: 7234,
      rating: 4.9,
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400",
      skills: ["Stock analysis", "Portfolio building", "Risk management", "Technical analysis", "Market trends"],
      includes: ["Trading simulator", "Analysis tools", "Certificate", "Market reports"]
    },
    {
      id: "cryptocurrency-investing",
      title: "Cryptocurrency Investment Mastery",
      description: "Navigate the crypto market and build a profitable portfolio",
      price: 199,
      duration: "8 weeks",
      students: 8942,
      rating: 4.8,
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400",
      skills: ["Blockchain basics", "Crypto analysis", "DeFi", "NFTs", "Wallet security"],
      includes: ["Crypto tracker", "Strategy guides", "Certificate", "Expert insights"]
    },
    {
      id: "real-estate-investing",
      title: "Real Estate Investment Strategy",
      description: "Build wealth through strategic real estate investments",
      price: 249,
      duration: "12 weeks",
      students: 4521,
      rating: 4.7,
      level: "All Levels",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400",
      skills: ["Property analysis", "Financing", "REITs", "Rental income", "Market research"],
      includes: ["Calculator tools", "Contract templates", "Certificate", "Case studies"]
    },
    {
      id: "retirement-planning",
      title: "Retirement Planning & Wealth Building",
      description: "Secure your financial future with smart planning",
      price: 189,
      duration: "9 weeks",
      students: 6156,
      rating: 4.9,
      level: "All Levels",
      image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400",
      skills: ["Retirement accounts", "Passive income", "Tax optimization", "Estate planning", "Diversification"],
      includes: ["Planning worksheets", "Calculators", "Certificate", "Expert Q&A"]
    }
  ];

  const handleEnroll = async (educationId: string, price: number, title: string) => {
    if (isPurchased(educationId, "investment-education")) {
      navigate(`/investment/${educationId}`);
      return;
    }

    setEnrolling(educationId);
    
    try {
      const sessionUrl = await purchaseContent(educationId, "investment-education", title, price);
      
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
            Financial Investment Education
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Build wealth with expert investment strategies and education
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {educations.map((education) => (
            <Card key={education.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={education.image} 
                  alt={education.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary">{education.level}</Badge>
                </div>
                {isPurchased(education.id, "investment-education") && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-success">Enrolled</Badge>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{education.rating}</span>
                  </div>
                </div>

                <h3 className="text-2xl font-black mb-2">{education.title}</h3>
                <p className="text-muted-foreground mb-4">{education.description}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{education.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{education.students.toLocaleString()} students</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">What you'll learn:</p>
                  <div className="flex flex-wrap gap-2">
                    {education.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-4 p-3 bg-primary/5 rounded-lg">
                  <p className="text-xs font-semibold mb-1">Includes:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {education.includes.map((item, idx) => (
                      <li key={idx}>✓ {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-3xl font-bold text-primary">€{education.price}</p>
                    <p className="text-xs text-muted-foreground">Complete course</p>
                  </div>
                  <Button
                    onClick={() => handleEnroll(education.id, education.price, education.title)}
                    disabled={enrolling === education.id || loading}
                    size="lg"
                    variant={isPurchased(education.id, "investment-education") ? "secondary" : "default"}
                  >
                    {enrolling === education.id 
                      ? "Processing..." 
                      : isPurchased(education.id, "investment-education")
                      ? "Continue Learning"
                      : "Enroll Now"}
                  </Button>
                </div>
                <CourseAcademicActions
                  meta={{
                    module_key: "financial-investment",
                    module_label: "Financial Investment",
                    course_slug: education.id,
                    course_title: education.title,
                    description: education.description,
                    level: education.level,
                    duration: education.duration,
                    price: education.price,
                    skills: education.skills,
                  }}
                  unlocked={isPurchased(education.id, "investment-education")}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialInvestment;