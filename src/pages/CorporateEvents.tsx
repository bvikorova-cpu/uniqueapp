import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Building2, Users, Heart, Calendar, Utensils, Plane, ShoppingBag, Hotel, CheckCircle2, Sparkles, TrendingUp, Globe } from "lucide-react";

const CorporateEvents = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-4" variant="secondary">
            <Building2 className="w-4 h-4 mr-2" />
            B2B Solutions
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Corporate & Event Solutions
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Professional coloring book solutions for companies, restaurants, weddings and events. Strengthen your brand with creativity.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="gap-2">
              <Calendar className="w-5 h-5" />
              Book Demo
            </Button>
            <Button size="lg" variant="outline">Pricing</Button>
          </div>
        </div>
      </section>

      {/* Main Categories */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <Tabs defaultValue="corporate" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
              <TabsTrigger value="corporate">Corporate Events</TabsTrigger>
              <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
              <TabsTrigger value="weddings">Weddings & Celebrations</TabsTrigger>
              <TabsTrigger value="events">Event Organizers</TabsTrigger>
            </TabsList>

            {/* CORPORATE EVENTS */}
            <TabsContent value="corporate" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Corporate Events & Brand Marketing</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Custom coloring books with company logo, mascots and brand identity for family days, team buildings and client gifts.
                </p>
              </div>

              {/* Corporate Packages */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Startup
                    </CardTitle>
                    <CardDescription>For small companies and startups</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€15<span className="text-sm text-muted-foreground">/event</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Company logo on 10 coloring pages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Basic brand colors</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>PDF download</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>1 revision</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Order</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      Business
                    </CardTitle>
                    <CardDescription>For medium companies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€30<span className="text-sm text-muted-foreground">/event</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Logo + mascot on 25 pages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Complete brand identity</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>QR code to company website</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>PDF + print-ready files</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>3 revisions</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Order</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary hover:border-primary transition-all relative">
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Corporate Premium
                    </CardTitle>
                    <CardDescription>For large corporations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€60<span className="text-sm text-muted-foreground">/event</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>50 custom coloring pages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Company product illustrations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Interactive elements (QR, games)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Print</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Unlimited revisions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Dedicated account manager</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Order</Button>
                  </CardContent>
                </Card>

              </div>

              {/* Use Cases */}
              <Card className="mt-12">
                <CardHeader>
                  <CardTitle>Use Cases - Corporate Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold">HR & Onboarding</h4>
                      <p className="text-sm text-muted-foreground">Welcome package for new employees with company culture and values in a fun format.</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Client Gifts</h4>
                      <p className="text-sm text-muted-foreground">Personal coloring books as gifts for clients' children during B2B meetings and conferences.</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Team Building</h4>
                      <p className="text-sm text-muted-foreground">Creative activities for employee families at corporate days.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* RESTAURANTS */}
            <TabsContent value="restaurants" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Restaurants & Kids Corners</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Monthly subscriptions, menu as coloring pages, seasonal campaigns and QR codes for restaurants with kids corners.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-primary" />
                      Mini Reštaurácia
                    </CardTitle>
                    <CardDescription>Small restaurant/café</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€5<span className="text-sm text-muted-foreground">/month</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>5 menu coloring pages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Basic personalization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>PDF download</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Subscribe</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle>Standard Restaurant</CardTitle>
                    <CardDescription>Medium restaurant</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€12<span className="text-sm text-muted-foreground">/month</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>15 coloring pages + menu</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>QR code to digital menu</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Seasonal updates (4x/year)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Restaurant mascot</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Subscribe</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary hover:border-primary transition-all relative">
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Chains</Badge>
                  <CardHeader>
                    <CardTitle>Chain Restaurant</CardTitle>
                    <CardDescription>Restaurant chains</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€25<span className="text-sm text-muted-foreground">/location</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>30 coloring pages + menu</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Loyalty program integration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>POS system integration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Monthly campaigns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Analytics dashboard</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Contact</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle>Fast Food Premium</CardTitle>
                    <CardDescription>Large fast food chains</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€40<span className="text-sm text-muted-foreground">/location</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Unlimited coloring pages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>In-tablet coloring for kids</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Gamification (collect badges)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Social media campaigns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>White-label solution</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Contact</Button>
                  </CardContent>
                </Card>
              </div>

              {/* Restaurant Features */}
              <div className="grid md:grid-cols-2 gap-6 mt-12">
                <Card>
                  <CardHeader>
                    <CardTitle>Features for Restaurants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Menu as Coloring Pages</h4>
                          <p className="text-sm text-muted-foreground">Menu items illustrated as coloring pages - kids learn about food.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-semibold">QR Codes</h4>
                          <p className="text-sm text-muted-foreground">Scanning QR code opens digital coloring or game.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Seasonal Campaigns</h4>
                          <p className="text-sm text-muted-foreground">Christmas, Easter, Halloween - themed coloring pages.</p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>ROI Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Longer Visits</h4>
                          <p className="text-sm text-muted-foreground">Parents spend more time, order more food/drinks.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Word-of-Mouth Marketing</h4>
                          <p className="text-sm text-muted-foreground">Parents share positive experiences, kids remember the restaurant.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Brand Loyalty</h4>
                          <p className="text-sm text-muted-foreground">Families return because of great atmosphere for kids.</p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* WEDDINGS */}
            <TabsContent value="weddings" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Weddings & Private Celebrations</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Custom coloring pages as gifts for guests' children. Illustrations of couples, wedding venues, love story timeline and more.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      Mini Celebration
                    </CardTitle>
                    <CardDescription>Small celebration (up to 20 kids)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€20<span className="text-sm text-muted-foreground">/event</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>5 custom coloring pages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Couple/celebrant names</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Event date</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>PDF download</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Order</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle>Standard Wedding</CardTitle>
                    <CardDescription>Medium wedding (20-50 kids)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€50<span className="text-sm text-muted-foreground">/wedding</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>10 custom coloring pages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Couple illustration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Wedding venue illustration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Love story timeline (3-5 moments)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>PDF + print files</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Order</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary hover:border-primary transition-all relative">
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
                  <CardHeader>
                    <CardTitle>Premium Wedding</CardTitle>
                    <CardDescription>Large wedding (50-100 kids)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€100<span className="text-sm text-muted-foreground">/wedding</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>20 custom coloring pages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Activity book (games, puzzles)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Full family/bridesmaids illustration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>"Thank you" coloring pages for guests</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Print + delivery</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Personalized crayons</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Order</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle>Deluxe Wedding</CardTitle>
                    <CardDescription>Luxury wedding (100+ kids)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€200<span className="text-sm text-muted-foreground">/wedding</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Unlimited coloring pages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Complete love story book (30+ pages)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Live coloring station at wedding</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Custom invitations as coloring pages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Premium print + luxury packaging</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Photo book after wedding</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Contact</Button>
                  </CardContent>
                </Card>
              </div>

              {/* Wedding Ideas */}
              <Card className="mt-12">
                <CardHeader>
                  <CardTitle>Creative Ideas for Weddings</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Coloring Pages as Invitations</AccordionTrigger>
                      <AccordionContent>
                        Create unique invitations where guests' children can color an illustration of the couple or venue. QR code leads them to RSVP page.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Love Story Timeline</AccordionTrigger>
                      <AccordionContent>
                        Illustrate key moments of the couple's relationship (first meeting, engagement, etc.) as coloring pages. Kids learn about the love story.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>Activity Books at Ceremony</AccordionTrigger>
                      <AccordionContent>
                        For long ceremonies - activity books with quiet games, puzzles and coloring pages to keep kids calm and entertained.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger>"Thank You" Coloring Pages</AccordionTrigger>
                      <AccordionContent>
                        After the wedding, send guests coloring pages with photos from the wedding - a unique thank you card that kids will enjoy.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* EVENT ORGANIZERS */}
            <TabsContent value="events" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Event Organizers & Agencies</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  B2B licenses, on-site printing, custom booth design, live AI generation and social media integration.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Event Planner
                    </CardTitle>
                    <CardDescription>For event planners</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€80<span className="text-sm text-muted-foreground">/event</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Custom coloring books for each event</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>On-site printing service</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Branded coloring booth</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Event-specific themes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Social media integration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Photo booth upload to coloring page</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Order</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary hover:border-primary transition-all relative">
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">For Agencies</Badge>
                  <CardHeader>
                    <CardTitle>Agency Premium</CardTitle>
                    <CardDescription>Event agencies & production houses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€200<span className="text-sm text-muted-foreground">/month</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Unlimited events</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>White-label platform</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Live AI generation at events</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Multi-brand management</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>API access</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Analytics & ROI reporting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Priority support</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Contact</Button>
                  </CardContent>
                </Card>
              </div>

              {/* Event Services */}
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <Card>
                  <CardHeader>
                    <CardTitle>On-Site Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <span className="text-sm">Mobile printer - instant print at event</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <span className="text-sm">Coloring booth with branding</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <span className="text-sm">Live AI generation (upload photo → coloring page)</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Digital Integration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <span className="text-sm">QR codes - scan and download</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <span className="text-sm">Social media sharing (Instagram stories)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <span className="text-sm">Event app integration</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Branding & Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <span className="text-sm">Complete white-label branding</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <span className="text-sm">Usage tracking & engagement metrics</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <span className="text-sm">Brand exposure reports</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Specialized Solutions */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Specialized Solutions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Other industries where our solutions bring value
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <Hotel className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Hotel Resorts</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li>• Kids club activity books</li>
                  <li>• Room service coloring menus</li>
                  <li>• Resort mascot omaľovánky</li>
                  <li>• Welcome packages pre rodiny</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <ShoppingBag className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Shopping Malls</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li>• Detské zóny s coloring stations</li>
                  <li>• Sezónne kampane (Vianoce, Veľká noc)</li>
                  <li>• Shop & win - zbieraj omaľovánky</li>
                  <li>• Mall mascot branding</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <Plane className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Airlines & Travel</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li>• In-flight entertainment pre deti</li>
                  <li>• Airport lounge activity books</li>
                  <li>• Travel-themed omaľovánky</li>
                  <li>• Airline mascot branding</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <Users className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Community Centers</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li>• Komunitné eventy</li>
                  <li>• Educational workshops</li>
                  <li>• Multikultúrne témy</li>
                  <li>• Non-profit podporné kampane</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Advanced B2B Features</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Sparkles className="w-10 h-10 text-primary mb-2" />
                <CardTitle>White Label & Branding</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Custom domain (yourcompany.coloringbooks.com)</li>
                  <li>• Logo upload & brand colors</li>
                  <li>• Personalizované QR kódy</li>
                  <li>• Email templates s vašim brandingom</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Analytics & ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Usage tracking (downloads, prints)</li>
                  <li>• Populárne témy & omaľovánky</li>
                  <li>• Brand exposure reports</li>
                  <li>• Customer engagement metrics</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Technologies & API</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• REST API prístup</li>
                  <li>• Bulk upload & management</li>
                  <li>• QR kód generátor</li>
                  <li>• Multi-language support (SK, EN, DE, CZ)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Contact us for an individual quote or book a demo presentation.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="gap-2">
              <Calendar className="w-5 h-5" />
              Book Demo
            </Button>
            <Button size="lg" variant="outline">Request Quote</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CorporateEvents;