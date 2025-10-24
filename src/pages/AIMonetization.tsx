import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, DollarSign, Rocket, Users, Building2, Zap, 
  TrendingUp, Lock, CheckCircle, ArrowRight, Sparkles,
  Camera, Video, GraduationCap, Heart, Home, Briefcase,
  Music, Plane, MessageSquare, PieChart, Gift, Code
} from "lucide-react";

const AIMonetization = () => {
  const [selectedCategory, setSelectedCategory] = useState("personal-assistant");

  const categories = [
    { id: "personal-assistant", label: "AI Personal Assistant", icon: Brain, revenue: "€15-50/mo" },
    { id: "business-tools", label: "Business Tools", icon: Briefcase, revenue: "€5-50/doc" },
    { id: "dating", label: "Dating Enhancement", icon: Heart, revenue: "€3-15/feature" },
    { id: "photo", label: "Photo Services", icon: Camera, revenue: "€15-30/session" },
    { id: "video", label: "Video Generation", icon: Video, revenue: "€5-500/video" },
    { id: "b2b", label: "B2B Solutions", icon: Building2, revenue: "€500-5000/mo" },
    { id: "education", label: "Education Premium", icon: GraduationCap, revenue: "€8-299/mo" },
    { id: "health", label: "Health & Wellness", icon: Heart, revenue: "€5-20/mo" },
    { id: "creative", label: "Creative Services", icon: Music, revenue: "€10-500/item" },
    { id: "api", label: "API Marketplace", icon: Code, revenue: "€0.01-0.50/call" }
  ];

  const implementations = {
    "personal-assistant": {
      title: "AI Personal Assistant",
      description: "Virtual secretary with voice commands and task automation",
      pricing: [
        { tier: "Basic", price: "€15/mo", features: ["Email management", "Calendar sync", "Basic reminders", "5 hours AI/month"] },
        { tier: "Pro", price: "€30/mo", features: ["All Basic features", "Voice commands", "Priority scheduling", "20 hours AI/month", "Smart notifications"] },
        { tier: "Enterprise", price: "€50/mo", features: ["All Pro features", "Unlimited AI hours", "Multi-platform sync", "API access", "Custom integrations"] }
      ],
      implementation: [
        "Integrate ElevenLabs for voice commands (€25/mo API cost)",
        "Connect to Google Calendar & Gmail APIs",
        "Build task prioritization algorithm using GPT-5",
        "Create notification system with smart timing",
        "Implement user preference learning system"
      ],
      techStack: ["React", "Supabase", "ElevenLabs API", "Google APIs", "OpenAI GPT-5"],
      timeToMarket: "6-8 weeks",
      expectedRevenue: "€50-200/month per user",
      targetUsers: "Busy professionals, entrepreneurs, executives"
    },
    "business-tools": {
      title: "Business AI Tools Suite",
      description: "Legal documents, pitch decks, and business plan generation",
      pricing: [
        { tier: "Contract Generator", price: "€5/contract", features: ["15+ contract types", "Legal compliance check", "Customizable templates", "PDF export"] },
        { tier: "Legal Analyzer", price: "€10/analysis", features: ["Risk assessment", "Clause analysis", "Compliance check", "Summary report"] },
        { tier: "Pitch Deck", price: "€20/deck", features: ["10-15 slides", "Professional design", "Market analysis", "Financial projections"] },
        { tier: "Business Plan", price: "€50/plan", features: ["Comprehensive 30+ pages", "Market research", "Financial modeling", "Investor-ready format"] },
        { tier: "Grant Application", price: "€30/application", features: ["Proposal writing", "Budget planning", "Success optimization", "Review & editing"] }
      ],
      implementation: [
        "Build document template library (200+ templates)",
        "Train GPT-5 on legal and business documents",
        "Create PDF generation system with branding",
        "Implement multi-step form wizards",
        "Add collaboration features for teams",
        "Build payment gateway with Stripe"
      ],
      techStack: ["React", "GPT-5", "jsPDF", "Stripe", "Document templates"],
      timeToMarket: "8-10 weeks",
      expectedRevenue: "€1000-5000/month from 100-200 users",
      targetUsers: "Startups, SMEs, freelancers, consultants"
    },
    "dating": {
      title: "Dating AI Enhancement",
      description: "Profile optimization, message coaching, and compatibility analysis",
      pricing: [
        { tier: "Profile Optimizer", price: "€9.99 one-time", features: ["Photo analysis & improvement", "Bio optimization", "Conversation starters", "Profile score"] },
        { tier: "Message Coach", price: "€4.99/mo", features: ["Real-time message suggestions", "Flirting tips", "Conversation analysis", "Success tracking"] },
        { tier: "Date Planner", price: "€2.99/date", features: ["Personalized date ideas", "Location recommendations", "Conversation topics", "Follow-up tips"] },
        { tier: "Compatibility Analysis", price: "€14.99", features: ["Deep personality analysis", "Compatibility score", "Relationship advice", "Communication tips"] }
      ],
      implementation: [
        "Build image analysis AI for photo optimization",
        "Create NLP model for bio enhancement",
        "Develop real-time message suggestion system",
        "Build compatibility algorithm using personality tests",
        "Integrate with dating app APIs (Tinder, Bumble)",
        "Create A/B testing for profile improvements"
      ],
      techStack: ["React", "OpenAI Vision", "GPT-5", "Image processing", "NLP models"],
      timeToMarket: "6-8 weeks",
      expectedRevenue: "€15-30/month per active user",
      targetUsers: "Singles 25-45, dating app users, relationship seekers"
    },
    "photo": {
      title: "Premium AI Photo Services",
      description: "Professional headshots, family portraits, and product photography",
      pricing: [
        { tier: "Professional Headshots", price: "€19.99/session", features: ["10 variations", "Business attire", "Multiple backgrounds", "LinkedIn ready", "High resolution"] },
        { tier: "Family Portraits", price: "€29.99", features: ["AI-generated family photos", "15+ styles", "Seasonal themes", "Print-ready quality"] },
        { tier: "Product Photography", price: "€15/product", features: ["5 angles", "Professional lighting", "Background removal", "Marketing ready"] },
        { tier: "Real Estate Staging", price: "€25/room", features: ["Virtual furniture", "3D staging", "Multiple styles", "Before/after comparison"] }
      ],
      implementation: [
        "Integrate Stable Diffusion XL or Midjourney API",
        "Build photo upload and processing pipeline",
        "Create style library (100+ professional styles)",
        "Implement face detection and enhancement",
        "Build batch processing system",
        "Add watermark removal for paid versions"
      ],
      techStack: ["React", "Stable Diffusion", "ComfyUI", "Image processing", "AWS S3"],
      timeToMarket: "5-7 weeks",
      expectedRevenue: "€20-60/month per user",
      targetUsers: "Professionals, families, e-commerce sellers, real estate agents"
    },
    "video": {
      title: "AI Video Generation",
      description: "Personalized videos, explainers, and social media content",
      pricing: [
        { tier: "Personal Video Messages", price: "€5/video", features: ["AI avatar speaks your message", "30+ voices", "Multiple languages", "1 minute max"] },
        { tier: "Explainer Videos", price: "€50-200", features: ["1-3 minutes", "Professional animations", "Voiceover", "Music & SFX", "Revisions included"] },
        { tier: "Social Media Reels", price: "€3/reel", features: ["Auto-generated from content", "Trending templates", "Music sync", "30-60 seconds"] },
        { tier: "Video Ads", price: "€100-500", features: ["Professional quality", "Brand guidelines", "A/B variants", "30-90 seconds", "Commercial license"] }
      ],
      implementation: [
        "Integrate HeyGen or D-ID for AI avatars",
        "Build video editing pipeline with FFmpeg",
        "Create template library (500+ templates)",
        "Implement text-to-speech with ElevenLabs",
        "Add auto-captioning and translation",
        "Build render queue system for processing"
      ],
      techStack: ["React", "HeyGen/D-ID API", "FFmpeg", "ElevenLabs", "Video.js"],
      timeToMarket: "10-12 weeks",
      expectedRevenue: "€100-500/month per active user",
      targetUsers: "Content creators, marketers, businesses, social media managers"
    },
    "b2b": {
      title: "B2B Solutions & White-Label",
      description: "Enterprise solutions for schools, corporations, and healthcare",
      pricing: [
        { tier: "School License", price: "€500-2000/mo", features: ["500-2000 students", "Teacher dashboard", "Progress tracking", "Custom branding", "LMS integration"] },
        { tier: "Corporate Portal", price: "€1000-5000/mo", features: ["Unlimited employees", "Custom courses", "Analytics dashboard", "API access", "Compliance training"] },
        { tier: "Wellness Portal", price: "€300-1500/mo", features: ["100-500 clients", "Therapist tools", "Progress monitoring", "Patient referrals", "HIPAA compliant"] },
        { tier: "API Marketplace", price: "€0.01-0.50/call", features: ["Full API access", "99.9% uptime", "Documentation", "Developer support", "Usage analytics"] }
      ],
      implementation: [
        "Build multi-tenant architecture",
        "Create admin dashboard for institutions",
        "Implement SSO with SAML/OAuth",
        "Build white-label customization system",
        "Create comprehensive API documentation",
        "Implement usage-based billing",
        "Add compliance features (GDPR, HIPAA)"
      ],
      techStack: ["React", "Supabase", "Multi-tenant DB", "OAuth/SAML", "API Gateway"],
      timeToMarket: "12-16 weeks",
      expectedRevenue: "€5000-50000/month per enterprise client",
      targetUsers: "Schools, universities, corporations, healthcare providers"
    },
    "education": {
      title: "Educational Premium Features",
      description: "1-on-1 tutoring, exam prep, and certification programs",
      pricing: [
        { tier: "AI Tutor 1-on-1", price: "€15-40/hr", features: ["Math: €20/hr", "Languages: €15/hr", "Programming: €30/hr", "Career Coaching: €40/hr"] },
        { tier: "Exam Prep Bundles", price: "€29-299", features: ["SAT/ACT: €99", "Medical exams: €299", "Driving test: €29", "Certifications: €49-199"] },
        { tier: "Kids Learning Platform", price: "€12/mo/child", features: ["Interactive AI teacher", "Homework help", "Educational games", "Parent dashboard"] },
        { tier: "Certification Programs", price: "€99-299", features: ["AI Skills Certification", "Professional badges", "Accredited courses", "LinkedIn integration"] }
      ],
      implementation: [
        "Build real-time tutoring interface with video",
        "Create subject-specific AI models",
        "Implement practice test generation",
        "Build progress tracking system",
        "Create certification issuance system",
        "Add payment processing per session",
        "Implement booking/scheduling system"
      ],
      techStack: ["React", "WebRTC", "GPT-5", "Stripe", "Certificate generator"],
      timeToMarket: "8-10 weeks",
      expectedRevenue: "€50-200/month per student",
      targetUsers: "Students, parents, professionals seeking upskilling"
    },
    "health": {
      title: "Health & Wellness AI",
      description: "Symptom checking, nutrition planning, and mental health support",
      pricing: [
        { tier: "Health Assistant", price: "€5-20/mo", features: ["Symptom checker: €5/consultation", "Nutrition planner: €15/mo", "Workout generator: €10/mo", "Mental health checks: €20/mo"] },
        { tier: "Therapeutic Services", price: "€8-20/mo", features: ["Mood tracking premium: €8/mo", "Meditation library: €12/mo", "Crisis chatbot: €15/mo", "Pre-therapy screening: €10"] },
        { tier: "Sleep & Dreams", price: "€3-9/mo", features: ["Sleep optimization: €9/mo", "Dream interpretation: €3/dream", "Sleep soundscapes: €7/mo", "Smart alarm: €5/mo"] },
        { tier: "Doctor Partnerships", price: "30% referral fee", features: ["Patient referrals", "Progress monitoring", "Prescription codes", "Medical dashboard"] }
      ],
      implementation: [
        "Build symptom checking algorithm with medical database",
        "Create meal planning system with nutrition API",
        "Develop workout generation based on fitness level",
        "Implement mood tracking with analytics",
        "Build meditation audio library",
        "Add HIPAA compliance for health data",
        "Create doctor referral system with revenue sharing"
      ],
      techStack: ["React", "Medical APIs", "GPT-5", "Audio streaming", "Secure storage"],
      timeToMarket: "10-12 weeks",
      expectedRevenue: "€30-100/month per user + referral fees",
      targetUsers: "Health-conscious individuals, patients, fitness enthusiasts"
    },
    "creative": {
      title: "Creative AI Services",
      description: "Music generation, podcast production, and book writing assistance",
      pricing: [
        { tier: "Music Generator", price: "€15-500", features: ["Custom songs: €15-50", "Business jingles: €100-500", "Royalty-free tracks: €10/track", "Meditation music: €5/track", "Subscription: €20/mo unlimited"] },
        { tier: "Podcast Production", price: "€30-75/episode", features: ["Script writing: €30", "Intro/outro: €20", "Audio enhancement: €15", "Show notes: €10"] },
        { tier: "Book Writing Assistant", price: "€20-500", features: ["Plot generator: €20", "Character development: €15", "Chapter assistance: €5/chapter", "Full manuscript review: €200-500"] },
        { tier: "Interior Design AI", price: "€25-2000", features: ["Room design: €25-100", "Full home: €500-2000", "Furniture recommendations: 5-12% affiliate", "3D visualization: €15 extra"] }
      ],
      implementation: [
        "Integrate Suno AI or MusicGen for music",
        "Build audio processing pipeline",
        "Create podcast script templates",
        "Develop narrative AI for book writing",
        "Build 3D room visualization tool",
        "Add furniture catalog with affiliate links",
        "Implement style transfer for designs"
      ],
      techStack: ["React", "Suno AI", "Audio processing", "GPT-5", "Three.js for 3D"],
      timeToMarket: "10-14 weeks",
      expectedRevenue: "€100-500/month per creator",
      targetUsers: "Musicians, podcasters, authors, interior designers"
    },
    "api": {
      title: "API Marketplace & White-Label",
      description: "Sell API access to your AI functions for developers",
      pricing: [
        { tier: "Basic API", price: "€0.01/call", features: ["Image generation", "Text analysis", "1000 calls/mo free", "Standard support"] },
        { tier: "Pro API", price: "€0.05/call", features: ["All Basic features", "Video generation", "Priority processing", "10000 calls/mo included"] },
        { tier: "Enterprise API", price: "€0.10-0.50/call", features: ["Custom models", "Dedicated infrastructure", "SLA guarantee", "Premium support", "Unlimited calls"] },
        { tier: "White-Label License", price: "€300-2000/mo", features: ["Full platform access", "Custom branding", "Self-hosted option", "Source code access"] }
      ],
      implementation: [
        "Build RESTful API with authentication",
        "Create API key management system",
        "Implement rate limiting per tier",
        "Build developer documentation portal",
        "Add usage analytics dashboard",
        "Create webhook system for events",
        "Implement billing based on usage"
      ],
      techStack: ["Node.js/Deno", "API Gateway", "Redis for rate limiting", "Stripe for billing"],
      timeToMarket: "8-10 weeks",
      expectedRevenue: "€1000-10000/month from 100-1000 developers",
      targetUsers: "Developers, SaaS companies, agencies, startups"
    }
  };

  const selectedImpl = implementations[selectedCategory as keyof typeof implementations];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4" variant="outline">
            <Sparkles className="w-3 h-3 mr-1" />
            High-Revenue AI Monetization Strategy
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            40+ Revenue Streams Implementation Guide
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Detailed technical implementation, pricing strategies, and revenue projections for AI-powered features
          </p>
          <div className="flex gap-4 justify-center">
            <Card className="p-4">
              <div className="text-3xl font-bold text-primary">€10K-100K</div>
              <div className="text-sm text-muted-foreground">Monthly Revenue Potential</div>
            </Card>
            <Card className="p-4">
              <div className="text-3xl font-bold text-primary">6-16 weeks</div>
              <div className="text-sm text-muted-foreground">Implementation Time</div>
            </Card>
            <Card className="p-4">
              <div className="text-3xl font-bold text-primary">40+</div>
              <div className="text-sm text-muted-foreground">Revenue Streams</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Category Selection */}
      <section className="py-12 px-6 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Select Revenue Stream</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Card
                  key={cat.id}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedCategory === cat.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <CardContent className="p-4 text-center">
                    <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="font-semibold text-sm mb-1">{cat.label}</div>
                    <Badge variant="secondary" className="text-xs">{cat.revenue}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Implementation Details */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-2">{selectedImpl.title}</h2>
            <p className="text-xl text-muted-foreground">{selectedImpl.description}</p>
          </div>

          <Tabs defaultValue="pricing" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="implementation">Implementation</TabsTrigger>
              <TabsTrigger value="tech">Tech Stack</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="target">Target Users</TabsTrigger>
            </TabsList>

            <TabsContent value="pricing" className="mt-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedImpl.pricing.map((tier, idx) => (
                  <Card key={idx} className={idx === 1 ? "ring-2 ring-primary" : ""}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {tier.tier}
                        {idx === 1 && <Badge>Popular</Badge>}
                      </CardTitle>
                      <CardDescription className="text-3xl font-bold text-primary">
                        {tier.price}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {tier.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full mt-6">
                        Get Started <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="implementation" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Implementation Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedImpl.implementation.map((step, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {idx + 1}
                        </div>
                        <div className="flex-1 pt-1">
                          <p>{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Time to Market</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">{selectedImpl.timeToMarket}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tech" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Technology Stack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedImpl.techStack.map((tech, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span className="font-medium">{tech}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Revenue Projections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg">
                      <h3 className="font-semibold mb-2">Expected Revenue Per User</h3>
                      <p className="text-3xl font-bold text-primary">{selectedImpl.expectedRevenue}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-card rounded-lg border">
                        <div className="text-sm text-muted-foreground mb-1">50 Users</div>
                        <div className="text-2xl font-bold">€2.5K-10K/mo</div>
                      </div>
                      <div className="p-4 bg-card rounded-lg border">
                        <div className="text-sm text-muted-foreground mb-1">200 Users</div>
                        <div className="text-2xl font-bold">€10K-40K/mo</div>
                      </div>
                      <div className="p-4 bg-card rounded-lg border">
                        <div className="text-sm text-muted-foreground mb-1">500 Users</div>
                        <div className="text-2xl font-bold">€25K-100K/mo</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="target" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Target Audience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg">
                    <p className="text-lg">{selectedImpl.targetUsers}</p>
                  </div>
                  <div className="mt-6 grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-card rounded-lg border">
                      <h4 className="font-semibold mb-2">Marketing Channels</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• LinkedIn Ads for B2B</li>
                        <li>• Facebook/Instagram for B2C</li>
                        <li>• Content Marketing & SEO</li>
                        <li>• Referral Programs</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-card rounded-lg border">
                      <h4 className="font-semibold mb-2">Customer Acquisition</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Free trial (7-14 days)</li>
                        <li>• Freemium model</li>
                        <li>• Demo videos</li>
                        <li>• Testimonials & case studies</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Quick Wins Section */}
      <section className="py-16 px-6 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Top Priority: Quick Wins</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "AI 1-on-1 Tutoring", revenue: "€20-40/hr", time: "8 weeks", priority: "High" },
              { title: "Dating Profile Optimizer", revenue: "€10-15/user", time: "6 weeks", priority: "High" },
              { title: "Professional Headshots", revenue: "€20/session", time: "5 weeks", priority: "High" },
              { title: "Business Document Generator", revenue: "€5-50/doc", time: "8 weeks", priority: "High" },
              { title: "API Marketplace", revenue: "€0.01-0.50/call", time: "10 weeks", priority: "Medium" },
              { title: "White-Label for Schools", revenue: "€500-2000/mo", time: "12 weeks", priority: "High" }
            ].map((item, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {item.title}
                    <Badge variant={item.priority === "High" ? "default" : "secondary"}>
                      {item.priority}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue:</span>
                      <span className="font-bold text-primary">{item.revenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-semibold">{item.time}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Multipliers */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Revenue Multipliers</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Affiliate Partnerships</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary mb-2">5-20%</p>
                <p className="text-sm text-muted-foreground">Commission on every sale</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Referral Bonuses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary mb-2">€5-50</p>
                <p className="text-sm text-muted-foreground">Per successful referral</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bundle Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary mb-2">3 for 2</p>
                <p className="text-sm text-muted-foreground">Increase average order value</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Annual Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary mb-2">20% off</p>
                <p className="text-sm text-muted-foreground">Lock in revenue upfront</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary/10 to-purple-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Build Your AI Revenue Engine?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start with high-priority quick wins and scale to €100K+ monthly revenue
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              <Rocket className="w-5 h-5 mr-2" />
              Start Implementation
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Download Full Strategy
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AIMonetization;
