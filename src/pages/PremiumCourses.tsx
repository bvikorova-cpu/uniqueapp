import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Clock, Star, Users, CheckCircle } from "lucide-react";

const PremiumCourses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const courses = [
    {
      id: "web-dev-mastery",
      title: "Complete Web Development Mastery",
      description: "Master modern web development with React, TypeScript, and Node.js",
      price: 99,
      duration: "40 hours",
      students: 2847,
      rating: 4.9,
      level: "Intermediate",
      topics: ["React", "TypeScript", "Node.js", "Database Design", "API Development"],
      instructor: "John Martinez",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400"
    },
    {
      id: "data-science-pro",
      title: "Data Science Professional Certificate",
      description: "Learn Python, machine learning, and data visualization",
      price: 149,
      duration: "60 hours",
      students: 1923,
      rating: 4.8,
      level: "Advanced",
      topics: ["Python", "Machine Learning", "Data Visualization", "Statistics", "AI"],
      instructor: "Dr. Sarah Chen",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400"
    },
    {
      id: "ui-ux-design",
      title: "UI/UX Design Fundamentals",
      description: "Create stunning user interfaces and experiences",
      price: 79,
      duration: "30 hours",
      students: 3421,
      rating: 4.9,
      level: "Beginner",
      topics: ["Figma", "Design Principles", "Prototyping", "User Research", "Wireframing"],
      instructor: "Emma Williams",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400"
    },
    {
      id: "digital-marketing",
      title: "Digital Marketing Master Class",
      description: "Master SEO, social media, and content marketing strategies",
      price: 89,
      duration: "35 hours",
      students: 2156,
      rating: 4.7,
      level: "Intermediate",
      topics: ["SEO", "Social Media", "Content Marketing", "Analytics", "Email Marketing"],
      instructor: "Michael Brown",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400"
    }
  ];

  const handlePurchase = (courseId: string, price: number) => {
    setSelectedCourse(courseId);
    toast({
      title: "Processing Purchase",
      description: `Redirecting to payment for $${price}...`,
    });
    // Here you would integrate with Stripe
    setTimeout(() => {
      toast({
        title: "Course Unlocked!",
        description: "You now have lifetime access to this course.",
      });
      setSelectedCourse(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12 mt-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Premium Courses
        </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Invest in your future with our comprehensive courses. One-time purchase, lifetime access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
              <div className="h-48 overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary">{course.level}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{course.rating}</span>
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-2">{course.title}</h3>
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
                    {course.topics.map((topic, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Instructor</p>
                    <p className="text-xs text-muted-foreground">{course.instructor}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-3xl font-bold text-primary">€{course.price}</p>
                    <p className="text-xs text-muted-foreground">One-time payment</p>
                  </div>
                  <Button
                    onClick={() => handlePurchase(course.id, course.price)}
                    disabled={selectedCourse === course.id}
                    size="lg"
                  >
                    {selectedCourse === course.id ? "Processing..." : "Purchase Course"}
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Lifetime access • Certificate of completion</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="p-8 bg-gradient-to-r from-primary/10 to-primary/5">
            <h3 className="text-2xl font-bold mb-4">Not sure which course to choose?</h3>
            <p className="text-muted-foreground mb-6">
              Our learning advisors can help you find the perfect course for your goals.
            </p>
            <Button size="lg" variant="outline">
              Get Free Consultation
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PremiumCourses;
