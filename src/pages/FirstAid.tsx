import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Heart, Phone, AlertTriangle, Droplet, Flame, Bone, Wind, Zap, Activity,
  Stethoscope, Siren, GraduationCap, Package, HeartPulse, Scan,
  Trophy, TrendingUp, Star, Gamepad2, Award, Eye, BookOpen, MessageSquare, MapPin
} from "lucide-react";
import { useLiveStats } from "@/hooks/useLiveStats";
import { FirstAidHero } from "@/components/firstaid/FirstAidHero";
import { AISymptomChecker } from "@/components/firstaid/AISymptomChecker";
import { AIEmergencyGuide } from "@/components/firstaid/AIEmergencyGuide";
import { AIFirstAidQuiz } from "@/components/firstaid/AIFirstAidQuiz";
import { AIFirstAidKit } from "@/components/firstaid/AIFirstAidKit";
import { AICPRCoach } from "@/components/firstaid/AICPRCoach";
import { AIInjuryAssessor } from "@/components/firstaid/AIInjuryAssessor";
import { AIScenarioSimulator } from "@/components/firstaid/AIScenarioSimulator";
import { AICertificationSystem } from "@/components/firstaid/AICertificationSystem";
import { AIWoundGuide } from "@/components/firstaid/AIWoundGuide";
import { CommunityStories } from "@/components/firstaid/CommunityStories";
import { LiveExpertChat } from "@/components/firstaid/LiveExpertChat";
import { FirstAidMap } from "@/components/firstaid/FirstAidMap";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
type ViewType = "hub" | "symptoms" | "emergency" | "quiz" | "kit" | "cpr" | "injury" | "simulator" | "certification" | "wound" | "stories" | "expert" | "map";

const AI_TOOLS = [
  { id: "symptoms" as ViewType, icon: Stethoscope, label: "AI Symptom Checker", desc: "Analyze symptoms & get first aid steps", color: "from-red-500 to-rose-600" },
  { id: "emergency" as ViewType, icon: Siren, label: "AI Emergency Guide", desc: "Step-by-step emergency response", color: "from-orange-500 to-amber-600" },
  { id: "quiz" as ViewType, icon: GraduationCap, label: "AI First Aid Quiz", desc: "Test your knowledge", color: "from-blue-500 to-indigo-600" },
  { id: "kit" as ViewType, icon: Package, label: "AI Kit Builder", desc: "Personalized kit checklists", color: "from-emerald-500 to-green-600" },
  { id: "cpr" as ViewType, icon: HeartPulse, label: "AI CPR Coach", desc: "Interactive CPR training", color: "from-pink-500 to-fuchsia-600" },
  { id: "injury" as ViewType, icon: Scan, label: "AI Injury Assessor", desc: "Assess & treat injuries", color: "from-purple-500 to-violet-600" },
  { id: "simulator" as ViewType, icon: Gamepad2, label: "AI Scenario Simulator", desc: "Interactive emergency scenarios", color: "from-amber-500 to-orange-600" },
  { id: "certification" as ViewType, icon: Award, label: "Certification System", desc: "Earn digital certificates", color: "from-yellow-500 to-amber-600" },
  { id: "wound" as ViewType, icon: Eye, label: "AI Wound Guide", desc: "Visual wound identification", color: "from-cyan-500 to-blue-600" },
  { id: "stories" as ViewType, icon: BookOpen, label: "Community Stories", desc: "Real first aid success stories", color: "from-rose-500 to-pink-600" },
  { id: "expert" as ViewType, icon: MessageSquare, label: "AI Expert Chat", desc: "Chat with AI specialist", color: "from-teal-500 to-emerald-600" },
  { id: "map" as ViewType, icon: MapPin, label: "First Aid Map", desc: "Find AEDs & pharmacies nearby", color: "from-indigo-500 to-blue-600" },
];

const EMERGENCY_CONTACTS = [
  { name: "Emergency Medical Services", number: "112", icon: Heart },
  { name: "Fire Department", number: "112", icon: Flame },
  { name: "Police", number: "112", icon: AlertTriangle },
  { name: "Emergency Line", number: "112", icon: Phone },
];

const FIRST_AID_CATEGORIES = [
  {
    id: "cpr-info", title: "CPR", icon: Heart, color: "text-red-500",
    steps: ["Check the scene – ensure it is safe", "Check consciousness – shake and call loudly", "Call emergency services (112)", "Open airway – tilt head back, lift chin", "Check breathing – maximum 10 seconds", "30 chest compressions – depth 5-6 cm, rate 100-120/min", "2 rescue breaths – each lasting 1 second", "Continue 30:2 cycle until help arrives"],
    warning: "If an AED is available, use it as soon as possible following device instructions."
  },
  {
    id: "choking", title: "Choking", icon: Wind, color: "text-blue-500",
    steps: ["Ask: 'Are you choking?' If they cannot speak, it's serious", "Encourage coughing if possible", "5 back blows – between shoulder blades", "5 abdominal thrusts (Heimlich) – fist above navel", "Alternate 5 back blows and 5 thrusts", "If unconscious, begin CPR", "Call emergency services"],
    warning: "For pregnant women and small children, use modified technique."
  },
  {
    id: "bleeding", title: "Bleeding", icon: Droplet, color: "text-red-600",
    steps: ["Wear gloves if available", "Direct pressure with clean bandage", "Maintain pressure for 10+ minutes", "Add bandage if blood soaks through", "Elevate injured part above heart", "For severe bleeding – arterial pressure", "Never remove embedded objects"],
    warning: "Use tourniquet only as absolute last resort."
  },
  {
    id: "burns", title: "Burns", icon: Flame, color: "text-orange-500",
    steps: ["Stop the burning – remove heat source", "Remove jewelry and loose clothing", "Cool with lukewarm water 10-20 min", "Cover with clean non-stick cloth", "Don't apply ice, ointment, or butter", "Monitor for shock symptoms"],
    warning: "3rd degree burns (charred skin) always require emergency care."
  },
  {
    id: "fractures", title: "Fractures", icon: Bone, color: "text-purple-500",
    steps: ["Don't move the person unless necessary", "Stabilize in position found", "Use improvised splints", "Immobilize joints above and below", "Apply cold compress 20 minutes", "Monitor circulation"],
    warning: "Never attempt to straighten a broken bone!"
  },
  {
    id: "shock", title: "Shock", icon: Zap, color: "text-yellow-500",
    steps: ["Lay person on their back", "Elevate legs 30 cm", "Keep warm with blanket", "Loosen tight clothing", "Don't give food or drinks", "Monitor breathing and pulse", "Call emergency services"],
    warning: "Signs: pale skin, cold sweat, rapid pulse, shallow breathing, confusion."
  },
  {
    id: "stroke", title: "Stroke", icon: Activity, color: "text-pink-500",
    steps: ["FAST Test:", "F (Face) – Ask to smile, asymmetry?", "A (Arms) – Raise both, one drops?", "S (Speech) – Say a sentence, slurred?", "T (Time) – Call 112 IMMEDIATELY!", "Lay on back, head slightly elevated", "Don't give food or medication", "Note time symptoms began"],
    warning: "Every minute is critical! Sooner treatment = better prognosis."
  },
];

const FirstAid = () => {
  const [activeView, setActiveView] = useState<ViewType>("hub");
  const [activeCategory, setActiveCategory] = useState("cpr-info");
  const { stats, loading: statsLoading } = useLiveStats([
    { key: "guides", table: "activity_logs" },
    { key: "quizzes", table: "activity_logs", filter: { column: "activity_type", value: "quiz" } },
    { key: "certs", table: "achievements" },
    { key: "learners", table: "profiles" },
  ]);

  if (activeView === "symptoms") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><AISymptomChecker onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "emergency") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><AIEmergencyGuide onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "quiz") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><AIFirstAidQuiz onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "kit") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><AIFirstAidKit onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "cpr") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><AICPRCoach onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "simulator") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><AIScenarioSimulator onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "certification") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><AICertificationSystem onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "wound") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><AIWoundGuide onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "stories") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><CommunityStories onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "expert") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><LiveExpertChat onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "map") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><FirstAidMap onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "injury") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><AIInjuryAssessor onBack={() => setActiveView("hub")} /></div></div>;

  const activeData = FIRST_AID_CATEGORIES.find(c => c.id === activeCategory)!;

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Cinematic Hero */}
        <FirstAidHero stats={stats} loading={statsLoading} />

        <HeroRewardedAd sectionKey="page_firstaid" />

        {/* Engagement Row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Card className="text-center border-red-200 dark:border-red-800">
            <CardContent className="py-4">
              <Trophy className="w-6 h-6 text-red-500 mx-auto mb-1" />
              <p className="text-xl font-bold">7-Day</p>
              <p className="text-xs text-muted-foreground">Learning Streak</p>
            </CardContent>
          </Card>
          <Card className="text-center border-red-200 dark:border-red-800">
            <CardContent className="py-4">
              <TrendingUp className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
              <p className="text-xl font-bold">85%</p>
              <p className="text-xs text-muted-foreground">Quiz Average</p>
            </CardContent>
          </Card>
          <Card className="text-center border-red-200 dark:border-red-800">
            <CardContent className="py-4">
              <Star className="w-6 h-6 text-amber-500 mx-auto mb-1" />
              <p className="text-xl font-bold">12</p>
              <p className="text-xs text-muted-foreground">Badges Earned</p>
            </CardContent>
          </Card>
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

        {/* AI Tools Grid */}
        <h2 className="text-2xl font-bold mb-4">🤖 AI-Powered Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
          {AI_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                className="cursor-pointer hover:scale-[1.03] transition-all duration-200 border-2 hover:border-red-300 dark:hover:border-red-700"
                onClick={() => setActiveView(tool.id)}
              >
                <CardContent className="py-5 text-center">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-sm">{tool.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tool.desc}</p>
                  <Badge className="mt-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-[10px]">{tool.id === "stories" ? "Free" : "3 Credits"}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Emergency Contacts */}
        <h2 className="text-2xl font-bold mb-4">📞 Emergency Contacts</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {EMERGENCY_CONTACTS.map((contact) => {
            const Icon = contact.icon;
            return (
              <Card key={contact.name} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-2">
                    <Icon className="h-6 w-6 text-red-500" />
                  </div>
                  <CardTitle className="text-sm">{contact.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <a href={`tel:${contact.number}`} className="text-3xl font-bold text-red-500 hover:text-red-600">{contact.number}</a>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* First Aid Guide Cards */}
        <h2 className="text-2xl font-bold mb-4">📋 First Aid Guides</h2>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
          {FIRST_AID_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center py-3 px-2 rounded-xl transition-all ${activeCategory === cat.id ? "bg-red-100 dark:bg-red-900 border-2 border-red-500" : "bg-muted hover:bg-red-50 dark:hover:bg-red-950 border-2 border-transparent"}`}
              >
                <Icon className={`h-5 w-5 mb-1 ${cat.color}`} />
                <span className="text-[10px] sm:text-xs font-medium">{cat.title}</span>
              </button>
            );
          })}
        </div>

        <Card className="mb-10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900 flex items-center justify-center">
                {(() => { const Icon = activeData.icon; return <Icon className={`h-6 w-6 ${activeData.color}`} />; })()}
              </div>
              <div>
                <CardTitle className="text-2xl">{activeData.title}</CardTitle>
                <CardDescription>Follow the steps below</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ol className="space-y-2">
              {activeData.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">{i + 1}</span>
                  <span className="flex-1 pt-1">{step}</span>
                </li>
              ))}
            </ol>
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <AlertTitle className="text-yellow-700 dark:text-yellow-400">Important!</AlertTitle>
              <AlertDescription className="text-yellow-600 dark:text-yellow-300">{activeData.warning}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="mb-8">
          <CardHeader><CardTitle>Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="1">
                <AccordionTrigger>What should I do if I'm not sure of the diagnosis?</AccordionTrigger>
                <AccordionContent>Always call 112. Operators will guide you through the situation. It's better to call unnecessarily than too late.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="2">
                <AccordionTrigger>How do I know if someone is in shock?</AccordionTrigger>
                <AccordionContent>Shock symptoms include: pale and cold skin, cold sweat, weak rapid pulse, rapid shallow breathing, weakness, confusion, anxiety and nausea.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="3">
                <AccordionTrigger>Can I be sued for providing first aid?</AccordionTrigger>
                <AccordionContent>In most countries, Good Samaritan laws protect people who act in good faith to help in emergencies. Check your local laws.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="4">
                <AccordionTrigger>What should I have in a first aid kit?</AccordionTrigger>
                <AccordionContent>Sterile gauze, bandages, adhesive plasters, elastic bandages, scissors, gloves, disinfectant, triangular bandage, tweezers, thermometer and emergency numbers.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="5">
                <AccordionTrigger>How often should I take a first aid course?</AccordionTrigger>
                <AccordionContent>Refresh training every 2-3 years as procedures may change and regular repetition maintains skills.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Alert>
          <AlertDescription className="text-center">
            <strong>Warning:</strong> This information is for educational purposes only and does not replace formal first aid training or professional medical care.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default FirstAid;
