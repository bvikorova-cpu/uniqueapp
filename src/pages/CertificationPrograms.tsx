import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLearningContent } from "@/hooks/useLearningContent";
import { Award, Clock, BookOpen, CheckCircle, TrendingUp, Users } from "lucide-react";

const CertificationPrograms = () => {
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { purchaseContent, isPurchased, verifyPurchase, loading } = useLearningContent();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      verifyPurchase(sessionId).then((success) => {
        if (success) {
          toast({
            title: "Payment Successful! 🎉",
            description: "You now have access to your certification program.",
          });
          window.history.replaceState({}, '', '/certification-programs');
        }
      });
    }
  }, [verifyPurchase, toast]);

  const certifications = [
    {
      id: "full-stack-cert",
      title: "Certified Full-Stack Developer",
      provider: "Tech Academy International",
      description: "Industry-recognized certification in modern web development",
      price: 449,
      duration: "12 weeks",
      effort: "15-20 hrs/week",
      modules: 8,
      projects: 4,
      level: "Professional",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
      skills: ["React", "Node.js", "Database Design", "DevOps", "Testing", "Security"],
      outcomes: [
        "Build production-ready applications",
        "Master modern development workflows",
        "Industry-recognized certificate",
        "Portfolio of 4 professional projects"
      ],
      examFormat: "Project-based + Written exam",
      jobRelevance: "95% of graduates hired within 6 months",
      enrolled: 847
    },
    {
      id: "data-science-cert",
      title: "Professional Data Scientist Certificate",
      provider: "Data Science Institute",
      description: "Comprehensive certification in data science and machine learning",
      price: 539,
      duration: "16 weeks",
      effort: "20-25 hrs/week",
      modules: 10,
      projects: 5,
      level: "Advanced",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
      skills: ["Python", "Machine Learning", "Deep Learning", "SQL", "Statistics", "Big Data"],
      outcomes: [
        "Master ML algorithms and frameworks",
        "Work with real-world datasets",
        "Accredited certification",
        "Capstone project for portfolio"
      ],
      examFormat: "Practical exam + Case study",
      jobRelevance: "Average salary increase: €25k",
      enrolled: 623
    },
    {
      id: "cloud-architect-cert",
      title: "Cloud Solutions Architect",
      provider: "Cloud Computing Council",
      description: "Expert-level certification for cloud architecture and deployment",
      price: 629,
      duration: "14 weeks",
      effort: "18-22 hrs/week",
      modules: 9,
      projects: 3,
      level: "Expert",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
      skills: ["AWS", "Azure", "Kubernetes", "Docker", "Terraform", "Cloud Security"],
      outcomes: [
        "Design scalable cloud solutions",
        "Multi-cloud expertise",
        "Vendor-neutral certification",
        "Migration project experience"
      ],
      examFormat: "Architecture design + Implementation",
      jobRelevance: "Top 10% most in-demand skill",
      enrolled: 412
    },
    {
      id: "digital-marketing-cert",
      title: "Digital Marketing Specialist",
      provider: "Marketing Excellence Board",
      description: "Complete certification in modern digital marketing strategies",
      price: 404,
      duration: "10 weeks",
      effort: "12-15 hrs/week",
      modules: 7,
      projects: 3,
      level: "Professional",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
      skills: ["SEO/SEM", "Social Media", "Analytics", "Content Marketing", "Email Marketing", "PPC"],
      outcomes: [
        "Run successful campaigns",
        "Master analytics and ROI",
        "Industry certification",
        "Real campaign portfolio"
      ],
      examFormat: "Campaign simulation + Strategy presentation",
      jobRelevance: "Used by 200+ agencies worldwide",
      enrolled: 1124
    },
    {
      id: "cybersecurity-cert",
      title: "Cybersecurity Professional",
      provider: "Security Standards Institute",
      description: "Advanced certification in cybersecurity and ethical hacking",
      price: 719,
      duration: "18 weeks",
      effort: "25-30 hrs/week",
      modules: 12,
      projects: 6,
      level: "Expert",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400",
      skills: ["Network Security", "Ethical Hacking", "Cryptography", "Incident Response", "Compliance", "Forensics"],
      outcomes: [
        "Identify and mitigate threats",
        "Professional certification",
        "Hands-on lab access",
        "Security audit project"
      ],
      examFormat: "Practical lab exam + Theory",
      jobRelevance: "Starting salary: €85k average",
      enrolled: 534
    },
    {
      id: "project-management-cert",
      title: "Agile Project Manager Certification",
      provider: "Project Management Alliance",
      description: "Professional certification in agile project management",
      price: 494,
      duration: "8 weeks",
      effort: "10-15 hrs/week",
      modules: 6,
      projects: 2,
      level: "Professional",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400",
      skills: ["Scrum", "Kanban", "Team Leadership", "Risk Management", "Stakeholder Management", "Agile Tools"],
      outcomes: [
        "Lead agile teams effectively",
        "PMI-recognized certification",
        "Real project simulation",
        "Scrum Master credential"
      ],
      examFormat: "Scenario-based + Leadership assessment",
      jobRelevance: "Required by 70% of tech companies",
      enrolled: 923
    }
  ];

  const handleEnroll = async (certId: string, price: number, title: string) => {
    if (isPurchased(certId, "certification")) {
      navigate(`/certification-learn/${certId}`);
      return;
    }

    setEnrolling(certId);
    
    try {
      const sessionUrl = await purchaseContent(certId, "certification", title, price);
      
      if (sessionUrl) {
        window.open(sessionUrl, '_blank');
        toast({
          title: "Redirecting to Payment",
          description: "Complete your payment to access the certification program.",
        });
      }
    } catch (error) {
      toast({
        title: "Enrollment Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 mt-16">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Certification Programs
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Earn industry-recognized certifications that boost your career and validate your expertise
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {certifications.map((cert) => (
            <Card key={cert.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={cert.image} 
                  alt={cert.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary">
                    <Award className="w-3 h-3 mr-1" />
                    {cert.level}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary">
                    <Users className="w-3 h-3 mr-1" />
                    {cert.enrolled.toLocaleString()}
                  </Badge>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-2xl font-black mb-1">{cert.title}</h3>
                  <p className="text-sm text-muted-foreground">{cert.provider}</p>
                </div>

                <p className="text-muted-foreground mb-4">{cert.description}</p>

                <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-primary/5 rounded-lg">
                  <div className="text-center">
                    <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xs font-semibold">{cert.duration}</p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                  <div className="text-center">
                    <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xs font-semibold">{cert.modules} Modules</p>
                    <p className="text-xs text-muted-foreground">{cert.projects} Projects</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xs font-semibold">{cert.effort}</p>
                    <p className="text-xs text-muted-foreground">Per week</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">Skills covered:</p>
                  <div className="flex flex-wrap gap-1">
                    {cert.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">Learning outcomes:</p>
                  <ul className="space-y-1">
                    {cert.outcomes.map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-accent/50 rounded-lg mb-4">
                  <p className="text-xs font-semibold mb-1">Exam format:</p>
                  <p className="text-xs text-muted-foreground">{cert.examFormat}</p>
                  <p className="text-xs font-semibold mt-2 mb-1">Career impact:</p>
                  <p className="text-xs text-primary font-semibold">{cert.jobRelevance}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-3xl font-bold text-primary">€{cert.price}</p>
                    <p className="text-xs text-muted-foreground">Complete program</p>
                  </div>
                  <Button
                    onClick={() => handleEnroll(cert.id, cert.price, cert.title)}
                    disabled={enrolling === cert.id || loading}
                    size="lg"
                    variant={isPurchased(cert.id, "certification") ? "secondary" : "default"}
                  >
                    {enrolling === cert.id 
                      ? "Processing..." 
                      : isPurchased(cert.id, "certification")
                      ? "Continue Learning"
                      : "Enroll Now"
                    }
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <Award className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="font-bold mb-2">Industry Recognition</h3>
            <p className="text-sm text-muted-foreground">
              All certifications recognized by top companies worldwide
            </p>
          </Card>
          <Card className="p-6 text-center">
            <Users className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="font-bold mb-2">Expert Instructors</h3>
            <p className="text-sm text-muted-foreground">
              Learn from professionals with 10+ years of experience
            </p>
          </Card>
          <Card className="p-6 text-center">
            <TrendingUp className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="font-bold mb-2">Career Support</h3>
            <p className="text-sm text-muted-foreground">
              Lifetime access to job board and career counseling
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CertificationPrograms;
