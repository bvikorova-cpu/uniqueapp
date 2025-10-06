import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Heart, Phone, AlertTriangle, Droplet, Flame, Bone, Wind, Zap, Activity } from "lucide-react";

const FirstAid = () => {
  const emergencyContacts = [
    { name: "Emergency Medical Services", number: "112", icon: Heart },
    { name: "Fire Department", number: "112", icon: Flame },
    { name: "Police", number: "112", icon: AlertTriangle },
    { name: "Emergency Line", number: "112", icon: Phone },
  ];

  const firstAidCategories = [
    {
      id: "cpr",
      title: "Kardiopulmonálna resuscitácia (KPR)",
      icon: Heart,
      color: "text-red-500",
      steps: [
        "Check the scene – ensure it is safe",
        "Check consciousness – shake and call loudly",
        "Call emergency services (112 or local emergency number)",
        "Open airway – tilt head back, lift chin",
        "Check breathing – maximum 10 seconds",
        "30 chest compressions – center of chest, depth 5-6 cm, rate 100-120/min",
        "2 rescue breaths – each lasting 1 second",
        "Continue 30:2 cycle until emergency services arrive",
      ],
      warning: "If an AED (Automated External Defibrillator) is available, use it as soon as possible following the device instructions.",
    },
    {
      id: "choking",
      title: "Choking (Blocked Airway)",
      icon: Wind,
      color: "text-blue-500",
      steps: [
        "Ask: 'Are you choking?' If they cannot speak, it's serious",
        "Encourage coughing if they can cough",
        "If they cannot cough or breathe:",
        "• 5 back blows – between shoulder blades, downward motion",
        "• 5 abdominal thrusts (Heimlich maneuver) – fist above navel, sharp upward thrusts",
        "Alternate 5 back blows and 5 abdominal thrusts",
        "If they lose consciousness, begin CPR",
        "Call emergency services",
      ],
      warning: "For pregnant women and small children, use modified technique.",
    },
    {
      id: "bleeding",
      title: "Bleeding",
      icon: Droplet,
      color: "text-red-600",
      steps: [
        "Wear gloves (if available)",
        "Direct pressure – press wound with clean bandage or cloth",
        "Maintain pressure for at least 10 minutes",
        "If blood soaks through, add another bandage (don't remove the first)",
        "Elevate injured part above heart level (if no fracture)",
        "For severe bleeding – pressure on artery between wound and heart",
        "Call emergency services for massive bleeding",
        "Never remove embedded objects – stabilize them",
      ],
      warning: "If blood is spurting or there's an amputation, use a tourniquet only as a last resort.",
    },
    {
      id: "burns",
      title: "Burns",
      icon: Flame,
      color: "text-orange-500",
      steps: [
        "Stop the burning – remove heat source",
        "Remove jewelry and loose clothing (not stuck fabric)",
        "Cool burn with lukewarm (not cold) water – 10-20 minutes",
        "Cover with clean, non-stick cloth",
        "Don't apply ice, ointment, butter or toothpaste",
        "Call emergency services for large burns",
        "Monitor for shock symptoms",
      ],
      warning: "Burn degrees: 1st degree – redness; 2nd degree – blisters; 3rd degree – charred skin (always seek medical care).",
    },
    {
      id: "fractures",
      title: "Fractures and Dislocations",
      icon: Bone,
      color: "text-purple-500",
      steps: [
        "Don't move the injured person – unless absolutely necessary",
        "Stabilize injured area in the position found",
        "Use splints – can be sticks, newspapers, pillows",
        "Immobilize joints above and below fracture",
        "Apply cold compress (ice in cloth) for 20 minutes",
        "Monitor circulation – color, sensitivity, pulse",
        "Call emergency services or transport to doctor",
      ],
      warning: "Never attempt to straighten a broken bone or relocate a dislocated joint!",
    },
    {
      id: "shock",
      title: "Shock",
      icon: Zap,
      color: "text-yellow-500",
      steps: [
        "Lay person on their back",
        "Elevate legs 30 cm (unless head, neck or spine injury)",
        "Keep warm – cover with blanket",
        "Loosen tight clothing",
        "Don't give food or drinks",
        "Monitor breathing and pulse",
        "Call emergency services immediately",
        "Reassure the person",
      ],
      warning: "Shock symptoms: pale skin, cold sweat, rapid pulse, shallow breathing, confusion.",
    },
    {
      id: "stroke",
      title: "Stroke",
      icon: Activity,
      color: "text-pink-500",
      steps: [
        "FAST Test:",
        "• F (Face) – Ask to smile, asymmetry?",
        "• A (Arms) – Raise both arms, one drops?",
        "• S (Speech) – Say a sentence, slurred speech?",
        "• T (Time) – Call emergency services IMMEDIATELY!",
        "Lay on back with head slightly elevated",
        "Don't give food, drinks or medication",
        "Monitor vital signs",
        "Note the time symptoms began",
      ],
      warning: "Every minute is critical! The sooner treatment begins, the better the prognosis.",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <Badge className="bg-red-500 text-white">
            <Heart className="h-4 w-4 mr-1" />
            First Aid
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            First Aid
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete guide to providing first aid in emergency situations
          </p>
        </div>

        {/* Emergency Alert */}
        <Alert className="mb-8 border-red-500 bg-red-50 dark:bg-red-950">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <AlertTitle className="text-red-700 dark:text-red-400 text-lg font-bold">
            In case of emergency ALWAYS call 112 or your local emergency number first!
          </AlertTitle>
          <AlertDescription className="text-red-600 dark:text-red-300">
            This information serves as a guide but does not replace professional medical care.
          </AlertDescription>
        </Alert>

        {/* Emergency Contacts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {emergencyContacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <Card key={contact.number} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-2">
                    <Icon className="h-6 w-6 text-red-500" />
                  </div>
                  <CardTitle className="text-sm">{contact.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <a href={`tel:${contact.number}`} className="text-3xl font-bold text-red-500 hover:text-red-600">
                    {contact.number}
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* First Aid Categories */}
        <Tabs defaultValue="cpr" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 mb-8">
            {firstAidCategories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger key={category.id} value={category.id} className="flex-col h-auto py-3">
                  <Icon className={`h-5 w-5 mb-1 ${category.color}`} />
                  <span className="text-xs">{category.title.split(" ")[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {firstAidCategories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsContent key={category.id} value={category.id}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900 flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${category.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{category.title}</CardTitle>
                        <CardDescription>Follow the steps below</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Steps */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Procedure:</h3>
                      <ol className="space-y-2">
                        {category.steps.map((step, index) => (
                          <li key={index} className={`flex gap-3 ${step.startsWith("•") ? "ml-4" : ""}`}>
                            {!step.startsWith("•") && (
                              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </span>
                            )}
                            <span className="flex-1 pt-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Warning */}
                    <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <AlertTitle className="text-yellow-700 dark:text-yellow-400">Important!</AlertTitle>
                      <AlertDescription className="text-yellow-600 dark:text-yellow-300">
                        {category.warning}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Additional Information */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What should I do if I'm not sure of the diagnosis?</AccordionTrigger>
                <AccordionContent>
                  Always call 112 or your local emergency number. Operators will guide you through the situation and provide precise instructions.
                  It's better to call unnecessarily than too late.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>How do I know if someone is in shock?</AccordionTrigger>
                <AccordionContent>
                  Shock symptoms include: pale and cold skin, cold sweat, weak and rapid pulse, 
                  rapid and shallow breathing, weakness, confusion, anxiety and nausea.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>Can I be sued for providing first aid?</AccordionTrigger>
                <AccordionContent>
                  In most countries, Good Samaritan laws protect people who act in good faith to help in emergency situations. 
                  Check your local laws, but generally you're protected when helping in emergencies.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>What should I have in a first aid kit?</AccordionTrigger>
                <AccordionContent>
                  A basic first aid kit should contain: sterile gauze, bandages of various sizes, adhesive plasters, 
                  elastic bandages, scissors, gloves, disinfectant, triangular bandage, tweezers, 
                  thermometer and a list of emergency phone numbers.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>How often should I take a first aid course?</AccordionTrigger>
                <AccordionContent>
                  It's recommended to refresh your first aid training every 2-3 years, as procedures may change 
                  and regular repetition helps maintain skills in memory.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Alert className="mt-8">
          <AlertDescription className="text-center">
            <strong>Warning:</strong> This information is for educational purposes only and 
            does not replace formal first aid training or professional medical care. 
            In case of any emergency, always contact emergency services.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default FirstAid;