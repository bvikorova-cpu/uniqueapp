import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video,
  Users,
  MessageSquare,
  Monitor,
  DollarSign,
  BarChart,
  BookOpen,
  Award,
  PlayCircle,
  CheckCircle } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-black mb-4">How Our Platform Works</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A comprehensive guide to creating, selling, and teaching courses on our platform
        </p>
      </section>

      {/* For Instructors */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="text-lg px-6 py-2 mb-4">
            For Course Creators
          </Badge>
          <h2 className="text-4xl font-bold">Create & Sell Your Courses</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>1. Create Your Course</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                Build comprehensive courses with our easy-to-use creator dashboard:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span>Upload video lessons and course materials</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span>Structure your content into logical sections</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span>Add quizzes and assessments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span>Set your course price and preview lessons</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>2. Earn Revenue</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                Keep 70% of every course sale - we handle everything:
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span>Student pays €100</span>
                  <Badge>€100</Badge>
                </div>
                <div className="flex justify-between items-center text-primary font-semibold">
                  <span>You receive (70%)</span>
                  <Badge variant="default">€70</Badge>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Platform fee (30%)</span>
                  <Badge variant="outline">€30</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Payments go directly to your Stripe account. No waiting, no hassle.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>3. Teach Live Sessions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                Host interactive live classes with advanced features:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Monitor className="w-5 h-5 text-primary mt-0.5" />
                  <span><strong>Screen Sharing:</strong> Share your screen to demonstrate concepts</span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                  <span><strong>Whiteboard:</strong> Draw and annotate in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="w-5 h-5 text-primary mt-0.5" />
                  <span><strong>Breakout Rooms:</strong> Split students into small groups</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <BarChart className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>4. Track Performance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                Monitor your success with comprehensive analytics:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span>Total students and enrollments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span>Revenue and earnings breakdown</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span>Student progress and completion rates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <span>Course ratings and reviews</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Live Lessons Features */}
      <section className="container mx-auto px-4 py-12 bg-muted/30 rounded-lg">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="text-lg px-6 py-2 mb-4">
            Live Lesson Features
          </Badge>
          <h2 className="text-4xl font-black mb-4">Interactive Real-Time Teaching</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Engage students with professional video conferencing tools built for education
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Video className="w-12 h-12 mb-3 text-primary" />
              <CardTitle>HD Video & Audio</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Crystal-clear video quality</li>
                <li>• Multiple camera support</li>
                <li>• Noise cancellation</li>
                <li>• Recording capabilities</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Monitor className="w-12 h-12 mb-3 text-primary" />
              <CardTitle>Screen Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Share entire screen or window</li>
                <li>• High-quality resolution</li>
                <li>• Audio sharing included</li>
                <li>• One-click sharing</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="w-12 h-12 mb-3 text-primary" />
              <CardTitle>Interactive Whiteboard</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Draw and annotate live</li>
                <li>• Multiple colors and tools</li>
                <li>• Save whiteboard sessions</li>
                <li>• Collaborative drawing</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-12 h-12 mb-3 text-primary" />
              <CardTitle>Breakout Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Create multiple rooms</li>
                <li>• Assign students automatically</li>
                <li>• Join any room as instructor</li>
                <li>• Bring everyone back together</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Award className="w-12 h-12 mb-3 text-primary" />
              <CardTitle>Student Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Q&A sessions</li>
                <li>• Live polls and quizzes</li>
                <li>• Hand raising</li>
                <li>• Attendance tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <PlayCircle className="w-12 h-12 mb-3 text-primary" />
              <CardTitle>Session Recording</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Auto-record lessons</li>
                <li>• Available for replay</li>
                <li>• Download recordings</li>
                <li>• Share with students</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* For Students */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="text-lg px-6 py-2 mb-4">
            For Students
          </Badge>
          <h2 className="text-4xl font-bold">Learn at Your Own Pace</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center">
                  1
                </span>
                Browse Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Explore thousands of courses across various categories. Filter by difficulty, rating, or price.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center">
                  2
                </span>
                Enroll & Learn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Purchase once, access forever. Learn at your own pace with video lessons, quizzes, and live sessions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center">
                  3
                </span>
                Get Certified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Complete the course and earn a certificate to showcase your new skills on your resume or LinkedIn.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Revenue Breakdown */}
      <section className="container mx-auto px-4 py-16 bg-primary/5 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-12">Understanding Revenue Split</h2>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Why 70/30 Split?</h3>
                  <p className="text-muted-foreground mb-4">
                    We believe instructors should earn the majority of revenue. The 30% platform fee covers:
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Video hosting & streaming</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Live lesson infrastructure</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Payment processing fees</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Platform maintenance</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Customer support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Marketing & promotion</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted p-6 rounded-lg">
                  <h4 className="font-semibold mb-4">Earnings Calculator</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="font-medium">Course Price</span>
                      <span className="font-medium">Your Earnings (70%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>€49.99</span>
                      <span className="text-primary font-semibold">€34.99</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>€99.99</span>
                      <span className="text-primary font-semibold">€69.99</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>€199.99</span>
                      <span className="text-primary font-semibold">€139.99</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
