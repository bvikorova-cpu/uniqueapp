import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Building2, GraduationCap, Heart, Megaphone, Users, TrendingUp, Award, CheckCircle2, HelpCircle, Rocket, DollarSign } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PARTNERSHIP_TYPES = [
  {
    id: "education",
    icon: GraduationCap,
    title: "Education Partnerships",
    description: "Schools, Universities & Training Centers",
    color: "from-blue-500 to-blue-700",
    programs: [
      {
        name: "School Package",
        price: "€150/month",
        features: [
          "1 Teacher account + 30 Student accounts",
          "Progress tracking for teachers",
          "Certificates with school logo",
          "Priority support",
          "Custom branding options"
        ]
      },
      {
        name: "University Bulk License",
        price: "€5/student/year",
        features: [
          "Unlimited student access",
          "White-label solution",
          "API integration with LMS",
          "Advanced analytics dashboard",
          "Custom course creation"
        ]
      },
      {
        name: "Corporate Training",
        price: "€20/employee/month",
        features: [
          "Employee upskilling packages",
          "Custom courses for your industry",
          "HR analytics dashboard",
          "Team competitions & rewards",
          "Compliance training modules"
        ]
      }
    ]
  },
  {
    id: "healthcare",
    icon: Heart,
    title: "Medical & Wellness",
    description: "Healthcare Providers & Wellness Centers",
    color: "from-green-500 to-green-700",
    programs: [
      {
        name: "Mental Health Program",
        price: "€5/referral",
        features: [
          "Psychologists recommend to patients",
          "Therapeutic coloring for anxiety/stress",
          "Wellness tracking dashboard",
          "Patient progress monitoring",
          "Prescription promo codes"
        ]
      },
      {
        name: "Fitness & Physio",
        price: "€10/active user",
        features: [
          "Recovery routines integration",
          "Patient progress monitoring",
          "Custom exercise programs",
          "Affiliate partnership model",
          "Co-branded content"
        ]
      }
    ]
  },
  {
    id: "publishing",
    icon: Megaphone,
    title: "Publishing & Creators",
    description: "Publishers, Influencers & Content Creators",
    color: "from-purple-500 to-purple-700",
    programs: [
      {
        name: "Publisher Licensing",
        price: "€500/design",
        features: [
          "License coloring pages for print books",
          "Educational content partnerships",
          "Co-branded masterclasses",
          "Exclusive content rights",
          "Revenue sharing options"
        ]
      },
      {
        name: "Influencer Program",
        price: "20% commission",
        features: [
          "20% of first 3 months subscription",
          "Custom branded sections (€200/month)",
          "Exclusive content for followers",
          "Promo code tracking",
          "Performance analytics"
        ]
      }
    ]
  },
  {
    id: "b2b",
    icon: Building2,
    title: "B2B SaaS Solutions",
    description: "API & White-label Services",
    color: "from-orange-500 to-orange-700",
    programs: [
      {
        name: "API Access",
        price: "€0.10/request",
        features: [
          "AI API for other platforms",
          "Whitelabel generator (€300/month)",
          "Custom AI model training (€2,000)",
          "Technical documentation",
          "Priority support"
        ]
      },
      {
        name: "Integrations",
        price: "From €50/month",
        features: [
          "Slack bot for corporate learning",
          "Microsoft Teams integration",
          "Progress reports & analytics",
          "Custom integration development",
          "Dedicated support"
        ]
      }
    ]
  }
];

const MARKETPLACE_FEATURES = [
  {
    title: "Certified Course Creators",
    price: "€100/month",
    description: "Verified badge for certified courses",
    features: [
      "15% commission on course sales",
      "Featured listings (€300/month extra)",
      "Pro analytics (€30/month)",
      "70/30 revenue split on courses",
      "Creator dashboard"
    ]
  },
  {
    title: "Sponsored Content",
    price: "From €500",
    description: "Native advertising & branded content",
    features: [
      "Sponsored challenges (€2,000+)",
      "Product placement in AI content",
      "Branded AI templates",
      "Newsletter sponsorships (€500/edition)",
      "Performance metrics"
    ]
  }
];

const NGO_PROGRAMS = [
  {
    icon: Users,
    title: "Government Grants",
    description: "EU Digital Skills & Municipal Programs",
    benefits: [
      "EU Digital Skills program eligibility",
      "Municipal partnerships for citizens",
      "Refugee integration programs",
      "Language learning support"
    ]
  },
  {
    icon: Heart,
    title: "NGO Partnerships",
    description: "Charity & Accessibility Programs",
    benefits: [
      "10% profit to charity = marketing boost",
      "Accessibility for disabled users",
      "Community impact programs",
      "Social responsibility initiatives"
    ]
  }
];

export default function CorporatePartnerships() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Enterprise Solutions</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Corporate Partnerships & B2B Solutions
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empower your organization with our comprehensive learning, wellness, and creative solutions. 
            Custom packages designed for schools, healthcare providers, enterprises, and content creators.
          </p>
        </div>

        {/* Money Flow Explanation */}
        <Card className="mb-16 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-400">
                  ✅ Dôležité: ONI platia TEBE!
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-3xl font-bold text-green-600 mb-2">💰 Príjem</div>
                    <p className="font-semibold mb-2">Partneri ti platia:</p>
                    <ul className="text-sm space-y-1">
                      <li>• Školy: €150-2000/mesiac</li>
                      <li>• Firmy: €1000-5000/mesiac</li>
                      <li>• Terapeuti: €5-10/klient</li>
                      <li>• Influenceri: 20% provízia</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="text-3xl font-bold text-orange-600 mb-2">💸 Náklady</div>
                    <p className="font-semibold mb-2">Tvoje výdavky:</p>
                    <ul className="text-sm space-y-1">
                      <li>• Servery: ~10% príjmu</li>
                      <li>• AI API: ~15% príjmu</li>
                      <li>• Support: ~5% príjmu</li>
                      <li>• <strong>Spolu: ~30%</strong></li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-3xl font-bold text-blue-600 mb-2">💎 Zisk</div>
                    <p className="font-semibold mb-2">Tvoj čistý zisk:</p>
                    <ul className="text-sm space-y-1">
                      <li>• <strong>~70% z príjmu</strong></li>
                      <li>• Škola €1500 → €1050 zisk</li>
                      <li>• Firma €3000 → €2100 zisk</li>
                      <li>• <strong>Pasívny príjem! 🚀</strong></li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="font-semibold text-blue-700 dark:text-blue-400">
                    📊 Príklad: 5 škôl × €1500/mesiac = €7500 príjem → €5250 čistý zisk/mesiac
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Partnership Types */}
        <div className="space-y-12 mb-16">
          {PARTNERSHIP_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.id} className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{type.title}</h2>
                    <p className="text-muted-foreground">{type.description}</p>
                  </div>
                </div>

                {/* Financial Breakdown Alert */}
                <Card className="md:col-span-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-2 border-green-300 dark:border-green-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <DollarSign className="h-6 w-6 text-green-600" />
                      <h3 className="text-lg font-bold">💰 Finančný tok - {type.title}</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✅ Oni ti platia:</p>
                        <p>{type.programs[0].price} - {type.programs[type.programs.length - 1].price}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-orange-700 dark:text-orange-400 mb-1">💸 Tvoje náklady:</p>
                        <p>~30% z príjmu (servery, AI, support)</p>
                      </div>
                      <div>
                        <p className="font-semibold text-blue-700 dark:text-blue-400 mb-1">💎 Tvoj zisk:</p>
                        <p>~70% z príjmu = pasívny príjem</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-3 gap-6 md:col-span-3">
                  {type.programs.map((program, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle>{program.name}</CardTitle>
                        <CardDescription className="text-2xl font-bold text-foreground">
                          {program.price}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ul className="space-y-2">
                          {program.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {/* Profit Calculator */}
                        <div className="pt-3 border-t bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
                            💰 Tvoj zisk z tohto balíka:
                          </p>
                          <p className="text-sm">
                            {program.price} × 70% = <span className="font-bold text-green-600">
                              {program.price.includes('€') 
                                ? `€${Math.round(parseFloat(program.price.replace(/[^0-9.]/g, '')) * 0.7)}`
                                : program.price.includes('%')
                                ? 'provízia z každého predaja'
                                : 'zisk z každého volania'}
                            </span>
                          </p>
                        </div>
                        
                        <Button className="w-full">Contact Sales</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Marketplace & Content */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Marketplace & Content Solutions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {MARKETPLACE_FEATURES.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                  <div className="text-2xl font-bold text-primary">{feature.price}</div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {feature.features.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                  <Button className="w-full mt-4">Get Started</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Government & NGO Programs */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Government & NGO Programs</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {NGO_PROGRAMS.map((program, index) => {
              const Icon = program.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      {program.title}
                    </CardTitle>
                    <CardDescription>{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {program.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Rocket className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold">How It Works</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Simple Partnership Process</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started with our partnership program in 4 easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Contact Us",
                description: "Schedule a demo call to discuss your needs and goals",
                icon: Users
              },
              {
                step: "2",
                title: "Custom Package",
                description: "We create a tailored partnership package with pricing that fits your budget",
                icon: Building2
              },
              {
                step: "3",
                title: "Integration",
                description: "Quick setup with technical support and onboarding for your team",
                icon: Rocket
              },
              {
                step: "4",
                title: "Start Earning",
                description: "Track your revenue, users, and analytics in real-time dashboard",
                icon: DollarSign
              }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.step} className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">{item.step}</span>
                    </div>
                    <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Real Examples Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Real-World Examples</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                  Elementary School Example
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>School:</strong> Basic School in Bratislava</p>
                <p><strong>Package:</strong> School Package (€150/month)</p>
                <p><strong>Setup:</strong> 1 teacher + 30 students get full access</p>
                <p><strong>Usage:</strong> Students use coloring pages for art class, homework helper for math, story creator for creative writing</p>
                <p><strong>Results:</strong> Teacher tracks progress dashboard, students get certificates with school logo, parents see improvement reports</p>
                <div className="pt-2 border-t mt-4 space-y-2">
                  <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded">
                    <p className="font-semibold text-green-700 dark:text-green-400">💰 Finančný tok:</p>
                    <p className="text-sm">• Škola ti platí: <strong>€150/mesiac</strong></p>
                    <p className="text-sm">• Tvoje náklady (servery, AI): <strong>€45/mesiac</strong> (30%)</p>
                    <p className="text-sm">• <strong>Tvoj čistý zisk: €105/mesiac</strong> 🎉</p>
                  </div>
                  <p className="text-xs text-muted-foreground">= €5 per student/month pre školu, ale €105 zisk pre teba!</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-green-500" />
                  Psychologist Partnership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Partner:</strong> Clinical Psychologist Dr. Novák</p>
                <p><strong>Model:</strong> €5 per patient referral</p>
                <p><strong>How it works:</strong> Dr. Novák gives patient a promo code during therapy session</p>
                <p><strong>Patient gets:</strong> Access to therapeutic coloring pages for anxiety & stress management</p>
                <p><strong>Doctor gets:</strong> Dashboard to monitor patient's usage & progress between sessions</p>
                <div className="pt-2 border-t mt-4 space-y-2">
                  <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded">
                    <p className="font-semibold text-green-700 dark:text-green-400">💰 Finančný tok (50 pacientov):</p>
                    <p className="text-sm">• Dr. Novák ti platí: <strong>€5 × 50 = €250/mesiac</strong></p>
                    <p className="text-sm">• Tvoje náklady: <strong>€75/mesiac</strong> (30%)</p>
                    <p className="text-sm">• <strong>Tvoj čistý zisk: €175/mesiac</strong> 💚</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Dr. Novák platí len €5 za pacienta, ty zarobíš €3.50 čistého zisku z každého!</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-purple-500" />
                  Influencer Example
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Influencer:</strong> @CreativeMom (50K followers on Instagram)</p>
                <p><strong>Commission:</strong> 20% of first 3 months subscription</p>
                <p><strong>Promotion:</strong> Posts coloring pages & kids activities, shares unique promo code "CREATIVEMOM20"</p>
                <p><strong>Results:</strong> 200 people sign up for €9.99/month plan</p>
                <p><strong>Influencer dostáva:</strong> 200 × €9.99 × 0.20 × 3 months = €1,198.80</p>
                <div className="pt-2 border-t mt-4 space-y-2">
                  <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded">
                    <p className="font-semibold text-green-700 dark:text-green-400">💰 Tvoj príjem (200 predplatiteľov):</p>
                    <p className="text-sm">• Celkový príjem: <strong>200 × €9.99 = €1998/mesiac</strong></p>
                    <p className="text-sm">• Provízia influencerovi: <strong>-€399.60</strong> (20%)</p>
                    <p className="text-sm">• Tvoje náklady: <strong>-€479.40</strong> (30% z €1598.40)</p>
                    <p className="text-sm">• <strong>Tvoj čistý zisk: €1119/mesiac</strong> 🚀</p>
                    <p className="text-sm text-muted-foreground mt-2">+ Extra €200/mesiac za branded sekciu</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Po 3 mesiacoch už influencer nedostáva províziu, ty bereš celých €1998/mesiac!</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-500" />
                  Corporate Training
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Company:</strong> Tech startup with 50 employees</p>
                <p><strong>Package:</strong> Corporate Training (€20/employee/month)</p>
                <p><strong>Setup:</strong> 50 employees get access to upskilling courses</p>
                <p><strong>Usage:</strong> Leadership training, technical skills, team building activities</p>
                <div className="pt-2 border-t mt-4 space-y-2">
                  <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded">
                    <p className="font-semibold text-green-700 dark:text-green-400">💰 Finančný tok (50 zamestnancov):</p>
                    <p className="text-sm">• Firma ti platí: <strong>50 × €20 = €1000/mesiac</strong></p>
                    <p className="text-sm">• Tvoje náklady: <strong>€300/mesiac</strong> (30%)</p>
                    <p className="text-sm">• <strong>Tvoj čistý zisk: €700/mesiac</strong> 💼</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Firma platí €20 na zamestnanca, ty zarobíš €14 čistého zisku z každého!</p>
                </div>
                <p><strong>Package:</strong> Corporate Training (€20/employee/month)</p>
                <p><strong>Cost:</strong> 50 × €20 = €1,000/month</p>
                <p><strong>What they get:</strong> Custom courses for programming, design, management skills</p>
                <p><strong>Features:</strong> HR analytics dashboard, team competitions, compliance training modules</p>
                <div className="pt-2 border-t mt-4">
                  <p className="font-semibold text-primary">Value: Professional upskilling at scale</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <HelpCircle className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold">Frequently Asked Questions</span>
            </div>
            <h2 className="text-3xl font-bold">Common Questions About Partnerships</h2>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    How do I get paid as a partner?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Payments are made monthly via bank transfer or PayPal. For referral programs (psychologists, influencers), 
                    you'll receive payment at the end of each month for all successful referrals. For subscription-based 
                    partnerships (schools, corporates), invoicing is done at the start of each month.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    Do I need technical knowledge to integrate?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    No! Most partnerships require zero technical knowledge. We provide ready-to-use promo codes, tracking links, 
                    and simple dashboards. For API integrations (B2B SaaS), we provide full documentation and technical support 
                    to help your developers integrate quickly.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    Can I customize the branding for my school/organization?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Yes! All education and corporate packages include custom branding options. You can add your logo to certificates, 
                    customize colors, and even get a white-label solution where the platform looks like it's entirely yours 
                    (available in University and Enterprise tiers).
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">
                    What's the minimum commitment period?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Most partnerships are month-to-month with no long-term commitment required. You can cancel anytime. 
                    However, we offer discounts for annual commitments (typically 15-20% off). For large enterprise deals, 
                    we can negotiate custom terms.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">
                    How do I track my earnings and user activity?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Every partner gets access to a real-time analytics dashboard where you can see:
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>Number of active users from your referrals</li>
                      <li>Monthly revenue generated</li>
                      <li>Conversion rates and engagement metrics</li>
                      <li>Payment history and upcoming payouts</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left">
                    What support do partners receive?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    All partners get:
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>Dedicated account manager (for packages €500+/month)</li>
                      <li>Priority email support (24-48h response time)</li>
                      <li>Marketing materials (banners, promo videos, templates)</li>
                      <li>Monthly strategy calls to optimize your partnership</li>
                      <li>Technical integration support (for API partners)</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger className="text-left">
                    Can I refer other partners and earn commission?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Yes! We have a multi-tier referral system. If you refer another organization that becomes a partner, 
                    you'll earn 10% of their monthly payments for the first 12 months. For example, if you refer a school 
                    that pays €1,000/month, you'll earn €100/month for a year.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Data & Research */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Data & Research Monetization</CardTitle>
            <CardDescription>GDPR Compliant - Anonymized Data Services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Educational Research</h3>
                <p className="text-sm text-muted-foreground mb-2">€5,000 per dataset</p>
                <p className="text-sm">Anonymized learning data for universities and research institutions</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Behavior Insights</h3>
                <p className="text-sm text-muted-foreground mb-2">€200 per report</p>
                <p className="text-sm">User behavior insights for EdTech startups and product development</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Trend Reports</h3>
                <p className="text-sm text-muted-foreground mb-2">€50 per PDF</p>
                <p className="text-sm">"State of Online Learning 2025" - Industry trends and analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-card border rounded-xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Partner With Us?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join leading organizations in transforming education, wellness, and creativity. 
            Let's discuss a custom partnership package tailored to your needs.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="gap-2">
              <Building2 className="h-5 w-5" />
              Schedule a Demo
            </Button>
            <Button size="lg" variant="outline">
              Download Partnership Guide
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
