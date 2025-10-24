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
            B2B Riešenia
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Firemné a Eventové Riešenia
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Profesionálne coloring book riešenia pre firmy, reštaurácie, svadby a eventy. Posilnite svoju značku s kreativitou.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="gap-2">
              <Calendar className="w-5 h-5" />
              Objednať Demo
            </Button>
            <Button size="lg" variant="outline">Cenník</Button>
          </div>
        </div>
      </section>

      {/* Main Categories */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <Tabs defaultValue="corporate" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
              <TabsTrigger value="corporate">Firemné Eventy</TabsTrigger>
              <TabsTrigger value="restaurants">Reštaurácie</TabsTrigger>
              <TabsTrigger value="weddings">Svadby & Oslavy</TabsTrigger>
              <TabsTrigger value="events">Event Organizátori</TabsTrigger>
            </TabsList>

            {/* CORPORATE EVENTS */}
            <TabsContent value="corporate" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Firemné Eventy & Brand Marketing</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Vlastné coloring books s logom firmy, maskotmi a firemnou identitou pre detské dni, teambuildingy a klientske dary.
                </p>
              </div>

              {/* Corporate Packages */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Startup
                    </CardTitle>
                    <CardDescription>Pre malé firmy a startupy</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€15<span className="text-sm text-muted-foreground">/event</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Logo firmy na 10 omaľovánkach</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Základné firemné farby</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>PDF na stiahnutie</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>1 revízia</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Objednať</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      Business
                    </CardTitle>
                    <CardDescription>Pre stredné firmy</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€30<span className="text-sm text-muted-foreground">/event</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Logo + maskot firmy na 25 stranách</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Kompletná brand identita</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>QR kód na stránku firmy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>PDF + print-ready súbory</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>3 revízie</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Objednať</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary hover:border-primary transition-all relative">
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Najpopulárnejšie</Badge>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Corporate Premium
                    </CardTitle>
                    <CardDescription>Pre veľké korporácie</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€60<span className="text-sm text-muted-foreground">/event</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>50 vlastných omaľovánok</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Ilustrácie produktov firmy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Interaktívne prvky (QR, hry)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Tlač + doručenie</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Unlimited revízie</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Dedikovaný account manager</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Objednať</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" />
                      Enterprise
                    </CardTitle>
                    <CardDescription>Individuálne riešenia</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€150+<span className="text-sm text-muted-foreground">/mesiac</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Unlimited omaľovánky</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>White-label platforma</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>API prístup</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Multi-jazyková podpora</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Analytics & ROI reporting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>24/7 podpora</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Kontaktovať</Button>
                  </CardContent>
                </Card>
              </div>

              {/* Use Cases */}
              <Card className="mt-12">
                <CardHeader>
                  <CardTitle>Use Cases - Firemné Eventy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold">HR & Onboarding</h4>
                      <p className="text-sm text-muted-foreground">Welcome package pre nových zamestnancov s firemnou kultúrou a hodnotami v zábavnej forme.</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Klientske Dary</h4>
                      <p className="text-sm text-muted-foreground">Osobné coloring books ako dar pre deti klientov počas B2B stretnutí a konferencií.</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Team Building</h4>
                      <p className="text-sm text-muted-foreground">Kreatívne aktivity pre rodiny zamestnancov na firemných dňoch.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* RESTAURANTS */}
            <TabsContent value="restaurants" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Reštaurácie & Detské Kútiky</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Mesačné predplatné, menu ako omaľovánka, sezónne kampane a QR kódy pre reštaurácie s detským kútikom.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-primary" />
                      Mini Reštaurácia
                    </CardTitle>
                    <CardDescription>Malá reštaurácia/kaviareň</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€5<span className="text-sm text-muted-foreground">/mesiac</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>5 menu-omaľovánok</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Základná personalizácia</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>PDF download</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Predplatiť</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle>Standard Reštaurácia</CardTitle>
                    <CardDescription>Stredná reštaurácia</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€12<span className="text-sm text-muted-foreground">/mesiac</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>15 omaľovánok + menu</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>QR kód na digital menu</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Sezónne aktualizácie (4x/rok)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Maskot reštaurácie</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Predplatiť</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary hover:border-primary transition-all relative">
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Reťazce</Badge>
                  <CardHeader>
                    <CardTitle>Chain Reštaurácia</CardTitle>
                    <CardDescription>Reštauračné reťazce</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€25<span className="text-sm text-muted-foreground">/pobočka</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>30 omaľovánok + menu</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Loyalty program integrácia</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>POS system integrácia</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Mesačné kampane</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Analytics dashboard</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Kontaktovať</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle>Fast Food Premium</CardTitle>
                    <CardDescription>Veľké fast food reťazce</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€40<span className="text-sm text-muted-foreground">/pobočka</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Unlimited omaľovánky</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>In-tablet coloring pre deti</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Gamifikácia (zbieraj odznaky)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Campaigns na sociálne siete</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>White-label riešenie</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Kontaktovať</Button>
                  </CardContent>
                </Card>
              </div>

              {/* Restaurant Features */}
              <div className="grid md:grid-cols-2 gap-6 mt-12">
                <Card>
                  <CardHeader>
                    <CardTitle>Funkcie pre Reštaurácie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Menu ako Omaľovánka</h4>
                          <p className="text-sm text-muted-foreground">Jedlá z menu ilustrované ako omaľovánky - deti sa učia o jedle.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-semibold">QR Kódy</h4>
                          <p className="text-sm text-muted-foreground">Skenovanie QR kódu otvorí digital coloring alebo hru.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Sezónne Kampane</h4>
                          <p className="text-sm text-muted-foreground">Vianoce, Veľká noc, Halloween - tematické omaľovánky.</p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>ROI Prínosy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Dlhšie Návštevy</h4>
                          <p className="text-sm text-muted-foreground">Rodičia strávia viac času, objednajú si viac jedla/nápojov.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Word-of-Mouth Marketing</h4>
                          <p className="text-sm text-muted-foreground">Rodičia zdieľajú pozitívne skúsenosti, deti si pamätajú reštauráciu.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Brand Loyalty</h4>
                          <p className="text-sm text-muted-foreground">Rodiny sa vracajú kvôli skvelej atmosfére pre deti.</p>
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
                <h2 className="text-4xl font-bold mb-4">Svadby & Súkromné Oslavy</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Custom coloring pages ako darčeky pre deti hostí. Ilustrácie párov, wedding venues, love story timeline a viac.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      Mini Celebration
                    </CardTitle>
                    <CardDescription>Malá oslava (do 20 detí)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€20<span className="text-sm text-muted-foreground">/event</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>5 vlastných omaľovánok</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Mená páru/oslavenca</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Dátum udalosti</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>PDF download</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Objednať</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle>Standard Wedding</CardTitle>
                    <CardDescription>Stredná svadba (20-50 detí)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€50<span className="text-sm text-muted-foreground">/svadba</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>10 vlastných omaľovánok</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Ilustrácia páru</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Wedding venue ilustrácia</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Love story timeline (3-5 momentov)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>PDF + print súbory</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Objednať</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary hover:border-primary transition-all relative">
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Najpopulárnejšie</Badge>
                  <CardHeader>
                    <CardTitle>Premium Wedding</CardTitle>
                    <CardDescription>Veľká svadba (50-100 detí)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€100<span className="text-sm text-muted-foreground">/svadba</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>20 vlastných omaľovánok</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Activity book (hry, hádanky)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Ilustrácia celej rodiny/družičiek</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>"Thank you" omaľovánky pre hostí</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Tlač + doručenie</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Personalizované farbičky</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Objednať</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle>Deluxe Wedding</CardTitle>
                    <CardDescription>Luxusná svadba (100+ detí)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€200<span className="text-sm text-muted-foreground">/svadba</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Unlimited omaľovánky</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Kompletná love story kniha (30+ strán)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Live coloring station na svadbe</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Custom invitations ako omaľovánky</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Premium tlač + luxury packaging</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Fotografická kniha po svadbe</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Kontaktovať</Button>
                  </CardContent>
                </Card>
              </div>

              {/* Wedding Ideas */}
              <Card className="mt-12">
                <CardHeader>
                  <CardTitle>Kreatívne Nápady pre Svadby</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Omaľovánky ako Pozvánky</AccordionTrigger>
                      <AccordionContent>
                        Vytvorte unikátne pozvánky, kde deti hostí môžu omaľovať ilustráciu páru alebo venue. QR kód ich zavedie na RSVP stránku.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Love Story Timeline</AccordionTrigger>
                      <AccordionContent>
                        Ilustrujte kľúčové momenty vzťahu páru (prvé stretnutie, zásnuby, atď.) ako omaľovánky. Deti sa učia o príbehu lásky.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>Activity Books na Obrade</AccordionTrigger>
                      <AccordionContent>
                        Pre dlhé obrady - activity books s tichými hrami, hádankami a omaľovánkami, aby deti boli pokojné a bavili sa.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger>"Thank You" Omaľovánky</AccordionTrigger>
                      <AccordionContent>
                        Po svadbe pošlite hosťom omaľovánku s fotografiami zo svadby - unique thank you card, ktorú si deti užijú.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* EVENT ORGANIZERS */}
            <TabsContent value="events" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Event Organizátori & Agentúry</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  B2B licencie, on-site tlač, custom booth design, live AI generovanie a sociálne médiá integrácia.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Event Planner
                    </CardTitle>
                    <CardDescription>Pre event plannerov</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€80<span className="text-sm text-muted-foreground">/event</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Custom coloring books pre každý event</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>On-site printing servis</span>
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
                        <span>Social media integrácia</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Photo booth upload na omaľovánku</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Objednať</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary hover:border-primary transition-all relative">
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Pre Agentúry</Badge>
                  <CardHeader>
                    <CardTitle>Agency Premium</CardTitle>
                    <CardDescription>Event agentúry & production houses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">€200<span className="text-sm text-muted-foreground">/mesiac</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Unlimited eventy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>White-label platforma</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Live AI generovanie na eventoch</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Multi-brand management</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>API prístup</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Analytics & ROI reporting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                        <span>Prioritná podpora</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Kontaktovať</Button>
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
                        <span className="text-sm">Mobilná tlačiareň - instant print na evente</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <span className="text-sm">Coloring booth s brandingom</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <span className="text-sm">Live AI generovanie (nahrať fotku → omaľovánka)</span>
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
                        <span className="text-sm">QR kódy - skenovať a stiahnuť</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <span className="text-sm">Social media sharing (Instagram stories)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <span className="text-sm">Event app integrácia</span>
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
                        <span className="text-sm">Kompletný white-label branding</span>
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
            <h2 className="text-4xl font-bold mb-4">Špecializované Riešenia</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ďalšie odvetvia, kde naše riešenia prinášajú hodnotu
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
            <h2 className="text-4xl font-bold mb-4">Pokročilé B2B Funkcie</h2>
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
          <h2 className="text-4xl font-bold mb-6">Pripravení Začať?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Kontaktujte nás pre individuálnu ponuku alebo objednajte demo prezentáciu.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="gap-2">
              <Calendar className="w-5 h-5" />
              Objednať Demo
            </Button>
            <Button size="lg" variant="outline">Požiadať o Ponuku</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CorporateEvents;