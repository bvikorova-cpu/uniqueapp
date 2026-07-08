import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLearningContent } from "@/hooks/useLearningContent";
import { TrendingUp, Clock, Star, Users } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { CourseAcademicActions } from "@/components/courses/CourseAcademicActions";
const DigitalMarketing = () => {
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
            description: "You now have access to your marketing course.",
          });
          window.history.replaceState({}, '', '/digital-marketing');
        }
      });
    }
  }, [verifyPurchase, toast]);

  const courses = [
    {
      id: "seo-mastery",
      title: "SEO Mastery 2025",
      description: "Master search engine optimization and rank higher on Google",
      price: 199,
      duration: "8 weeks",
      students: 6234,
      rating: 4.9,
      level: "Intermediate",
      image: "https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=400",
      skills: ["Keyword research", "On-page SEO", "Link building", "Analytics", "Content strategy"],
      includes: ["SEO tools access", "Case studies", "Certificate", "Templates"]
    },
    {
      id: "social-media-pro",
      title: "Social Media Marketing Pro",
      description: "Build and grow your brand across all social platforms",
      price: 179,
      duration: "6 weeks",
      students: 8942,
      rating: 4.8,
      level: "All Levels",
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400",
      skills: ["Content creation", "Engagement", "Ads management", "Analytics", "Influencer marketing"],
      includes: ["Content templates", "Scheduling tools", "Certificate", "Community"]
    },
    {
      id: "email-marketing",
      title: "Email Marketing Mastery",
      description: "Create high-converting email campaigns that drive sales",
      price: 149,
      duration: "5 weeks",
      students: 4521,
      rating: 4.7,
      level: "Beginner",
      image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400",
      skills: ["Copywriting", "Automation", "Segmentation", "A/B testing", "Deliverability"],
      includes: ["Email templates", "Tools guide", "Certificate", "Swipe files"]
    },
    {
      id: "ppc-advertising",
      title: "PPC Advertising Expert",
      description: "Master Google Ads and Facebook Ads for maximum ROI",
      price: 229,
      duration: "10 weeks",
      students: 3156,
      rating: 4.9,
      level: "Advanced",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
      skills: ["Campaign setup", "Bidding strategies", "Ad copywriting", "Conversion tracking", "Budget optimization"],
      includes: ["Ad templates", "Scripts library", "Certificate", "Live campaigns"]
    }
  ];

  const handleEnroll = async (courseId: string, price: number, title: string) => {
    if (isPurchased(courseId, "marketing-course")) {
      navigate(`/marketing/${courseId}`);
      return;
    }

    setEnrolling(courseId);
    
    try {
      await purchaseContent(courseId, "marketing-course", title, price);
      setEnrolling(null);
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
      <FloatingHowItWorks title="How Digital Marketing works" steps={[
          { title: 'Browse listings', desc: 'Explore items, services or offers.' },
          { title: 'Open a detail', desc: 'Review price, seller and terms.' },
          { title: 'Buy / order / bid', desc: 'Complete secure Stripe checkout in EUR. Fees follow platform splits.' },
          { title: 'Track & review', desc: 'Manage orders, leave reviews, get notifications.' },
        ]} />
      <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 mt-16">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Digital Marketing Courses
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master digital marketing and grow your business online
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                {isPurchased(course.id, "marketing-course") && (
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
                    <span className="text-sm font-semibold">{course.rating}</span>
                  </div>
                </div>

                <h3 className="text-2xl font-black mb-2">{course.title}</h3>
                <p className="text-muted-foreground mb-4">{course.description}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.students.toLocaleString()} students</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">What you'll learn:</p>
                  <div className="flex flex-wrap gap-2">
                    {course.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-4 p-3 bg-primary/5 rounded-lg">
                  <p className="text-xs font-semibold mb-1">Includes:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {course.includes.map((item, idx) => (
                      <li key={idx}>✓ {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-3xl font-bold text-primary">€{course.price}</p>
                    <p className="text-xs text-muted-foreground">Complete course</p>
                  </div>
                  <Button
                    onClick={() => handleEnroll(course.id, course.price, course.title)}
                    disabled={enrolling === course.id || loading}
                    size="lg"
                    variant={isPurchased(course.id, "marketing-course") ? "secondary" : "default"}
                  >
                    {enrolling === course.id 
                      ? "Processing..." 
                      : isPurchased(course.id, "marketing-course")
                      ? "Continue Learning"
                      : "Enroll Now"}
                  </Button>
                </div>
                <CourseAcademicActions
                  meta={{
                    module_key: "digital-marketing",
                    module_label: "Digital Marketing",
                    course_slug: course.id,
                    course_title: course.title,
                    description: course.description,
                    level: course.level,
                    duration: course.duration,
                    price: course.price,
                    skills: course.skills,
                  }}
                  unlocked={isPurchased(course.id, "marketing-course")}
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

export default DigitalMarketing;