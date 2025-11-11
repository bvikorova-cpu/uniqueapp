import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Sparkles, CheckCircle2, Utensils, Heart, Calendar } from "lucide-react";
import { CorporateInquiryForm } from "@/components/corporate/CorporateInquiryForm";

export function CorporateTab() {
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const scrollToForm = (packageType: string, category: string) => {
    setSelectedPackage(packageType);
    setSelectedCategory(category);
    setTimeout(() => {
      document.getElementById("corporate-inquiry-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Badge className="mb-4" variant="secondary">
          <Building2 className="w-4 h-4 mr-2" />
          B2B Solutions
        </Badge>
        <h2 className="text-4xl font-bold mb-4">Corporate & Event Solutions</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Professional coloring book solutions for companies, restaurants, weddings and events. Strengthen your brand with creativity.
        </p>
      </div>

      <Tabs defaultValue="corporate" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="corporate">Corporate Events</TabsTrigger>
          <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
          <TabsTrigger value="weddings">Weddings</TabsTrigger>
          <TabsTrigger value="events">Event Organizers</TabsTrigger>
        </TabsList>

        <TabsContent value="corporate" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Startup
                </CardTitle>
                <CardDescription>For small companies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">€15<span className="text-sm text-muted-foreground">/event</span></div>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Company logo on 10 pages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Basic brand colors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>PDF download</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={() => scrollToForm("startup", "corporate")}>Order</Button>
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
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>20 custom pages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Full branding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Multiple formats</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={() => scrollToForm("business", "corporate")}>Order</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader>
                <Badge className="w-fit mb-2">Popular</Badge>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Enterprise
                </CardTitle>
                <CardDescription>For large corporations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">€60<span className="text-sm text-muted-foreground">/event</span></div>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Unlimited pages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Complete branding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Dedicated support</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={() => scrollToForm("enterprise", "corporate")}>Order</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="restaurants" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-primary" />
                  Restaurant Basic
                </CardTitle>
                <CardDescription>For small cafes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">€10<span className="text-sm text-muted-foreground">/month</span></div>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>10 themed pages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Restaurant logo</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={() => scrollToForm("basic", "restaurant")}>Subscribe</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader>
                <Badge className="w-fit mb-2">Best Value</Badge>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-primary" />
                  Restaurant Premium
                </CardTitle>
                <CardDescription>For family restaurants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">€25<span className="text-sm text-muted-foreground">/month</span></div>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Unlimited pages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Menu-themed content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>QR code integration</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={() => scrollToForm("premium", "restaurant")}>Subscribe</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-primary" />
                  Chain Solution
                </CardTitle>
                <CardDescription>For restaurant chains</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">Custom</div>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Multi-location</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>API integration</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={() => scrollToForm("chain", "restaurant")}>Contact</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weddings" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Wedding Basic
                </CardTitle>
                <CardDescription>For intimate weddings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">€25<span className="text-sm text-muted-foreground">/wedding</span></div>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>15 personalized pages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Couple names & date</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={() => scrollToForm("basic", "wedding")}>Order</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader>
                <Badge className="w-fit mb-2">Most Popular</Badge>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Wedding Premium
                </CardTitle>
                <CardDescription>For grand celebrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">€50<span className="text-sm text-muted-foreground">/wedding</span></div>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>30+ custom pages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Photo integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Kids activity packs</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={() => scrollToForm("premium", "wedding")}>Order</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Event Starter
                </CardTitle>
                <CardDescription>For small events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">€20<span className="text-sm text-muted-foreground">/event</span></div>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>15 event pages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Event branding</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={() => scrollToForm("starter", "event")}>Order</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader>
                <Badge className="w-fit mb-2">Recommended</Badge>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Event Professional
                </CardTitle>
                <CardDescription>For professional organizers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">€40<span className="text-sm text-muted-foreground">/event</span></div>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Unlimited pages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Full customization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={() => scrollToForm("professional", "event")}>Order</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Agency Partner
                </CardTitle>
                <CardDescription>For event agencies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">Custom</div>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>White label solution</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    <span>API access</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={() => scrollToForm("agency", "event")}>Contact</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div id="corporate-inquiry-form" className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Contact Form</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you within 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CorporateInquiryForm 
              defaultPackage={selectedPackage}
              defaultCategory={selectedCategory}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
