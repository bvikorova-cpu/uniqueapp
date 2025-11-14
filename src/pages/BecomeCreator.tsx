import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  GraduationCap,
  DollarSign,
  Users,
  Video,
  CheckCircle,
  TrendingUp,
  Award,
} from "lucide-react";

export default function BecomeCreator() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    expertise: "",
  });

  useEffect(() => {
    checkInstructorStatus();
  }, []);

  const checkInstructorStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("instructor_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setIsInstructor(true);
      navigate("/course-creator-dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const expertise = formData.expertise.split(",").map(e => e.trim()).filter(Boolean);

      const { error } = await supabase
        .from("instructor_profiles")
        .insert({
          user_id: user.id,
          bio: formData.bio,
          expertise,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You're now a course creator. Start creating your first course!",
      });

      navigate("/course-creator-dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <GraduationCap className="w-20 h-20 mx-auto mb-6 text-primary" />
        <h1 className="text-5xl font-bold mb-4">Become a Course Creator</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Share your knowledge, inspire students worldwide, and earn 70% revenue from every course sale
        </p>
        <Badge variant="secondary" className="text-lg px-6 py-2">
          Join 10,000+ instructors earning online
        </Badge>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Teach With Us?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <DollarSign className="w-12 h-12 mb-4 text-primary" />
              <CardTitle>Earn 70% Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Keep 70% of every course sale. We only take 30% to cover platform costs.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Course at $100</span>
                  <span className="font-semibold text-primary">You earn $70</span>
                </div>
                <div className="flex justify-between">
                  <span>50 students</span>
                  <span className="font-semibold text-primary">$3,500</span>
                </div>
                <div className="flex justify-between">
                  <span>200 students</span>
                  <span className="font-semibold text-primary">$14,000</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-12 h-12 mb-4 text-primary" />
              <CardTitle>Global Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Reach students from over 180 countries. Your knowledge has no borders.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>24/7 course availability</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Mobile-friendly platform</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Automatic currency conversion</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Video className="w-12 h-12 mb-4 text-primary" />
              <CardTitle>Advanced Features</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Access powerful tools to create engaging learning experiences.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Live video lessons</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Interactive whiteboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Discussion forums</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Quiz & assessments</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-lg">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-3xl font-bold">$50M+</div>
            <div className="text-muted-foreground">Paid to instructors</div>
          </div>
          <div>
            <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-3xl font-bold">2M+</div>
            <div className="text-muted-foreground">Students enrolled</div>
          </div>
          <div>
            <GraduationCap className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-3xl font-bold">50K+</div>
            <div className="text-muted-foreground">Courses created</div>
          </div>
          <div>
            <Award className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-3xl font-bold">4.7★</div>
            <div className="text-muted-foreground">Average rating</div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Start Your Teaching Journey</CardTitle>
            <CardDescription>
              Tell us about yourself and your expertise. You'll be able to create your first course immediately after.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bio / Teaching Background
                </label>
                <Textarea
                  placeholder="Tell us about your teaching experience and what makes you qualified..."
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Areas of Expertise
                </label>
                <Input
                  placeholder="e.g., Web Development, Design, Marketing (comma-separated)"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your areas of expertise separated by commas
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What happens next?</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-primary" />
                    <span>Create your instructor profile instantly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-primary" />
                    <span>Access the course creator dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-primary" />
                    <span>Start building your first course immediately</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-primary" />
                    <span>Publish and start earning in minutes</span>
                  </li>
                </ul>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Creating Profile..." : "Become an Instructor"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
