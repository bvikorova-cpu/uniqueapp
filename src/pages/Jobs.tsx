import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, FileSignature, ArrowRight, Zap, Briefcase, Globe2 } from "lucide-react";
import { motion } from "framer-motion";

import { SEO } from "@/components/SEO";
import { HowItWorksButton } from "@/components/common/HowItWorksButton";
import { AICVGeneratorDialog } from "@/components/jobs/AICVGeneratorDialog";
import { AIJobOptimizer } from "@/components/jobs/AIJobOptimizer";
import { CreateJobDialog } from "@/components/jobs/CreateJobDialog";
import { WorkHero } from "@/components/jobs/WorkHero";
import { useAuth } from "@/contexts/AuthContext";

const HOW_IT_WORKS = [
  { title: "Pick an AI tool", desc: "Choose the tool that matches what you need right now." },
  { title: "Fill a few details", desc: "Add the job title, your resume text, or the role you want." },
  { title: "Pay with credits", desc: "Each tool costs a few AI credits — no subscriptions needed." },
  { title: "Get results instantly", desc: "Download, copy, or save the generated content." },
];

const TOOLS = [
  {
    id: "post-job",
    title: "Post a Job",
    short: "Post Job",
    desc: "Publish a job listing and pay with AI credits. Choose 7, 14 or 30-day visibility and add your contact email.",
    icon: Briefcase,
    credits: 3,
    color: "from-emerald-500 to-teal-600",
    post: true,
  },
  {
    id: "ai-jd-writer",
    title: "AI Job Description Writer",
    short: "AI JD Writer",
    desc: "Generate a complete, inclusive job posting in seconds — responsibilities, requirements, benefits and EEO statement.",
    icon: Sparkles,
    credits: 5,
    color: "from-fuchsia-500 to-purple-600",
    route: "/jobs/ai-jd-writer",
  },
  {
    id: "ai-resume-optimizer",
    title: "AI Resume Optimizer",
    short: "Optimize",
    desc: "Paste your CV and get a professional score, keyword gaps, and prioritized tips to boost hireability.",
    icon: Wand2,
    credits: 5,
    color: "from-violet-500 to-pink-600",
    dialog: true,
  },
  {
    id: "ai-cv-generator",
    title: "AI CV Generator",
    short: "CV Generator",
    desc: "Build an ATS-optimized resume from your profile and skills. Pick a template, edit sections, and export to PDF.",
    icon: FileSignature,
    credits: 5,
    color: "from-blue-500 to-cyan-600",
    dialog: true,
  },
];

export default function Jobs() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      <SEO
        title="Work AI Tools - Job Description, Resume Optimizer & CV Generator"
        description="AI-powered career tools on Unique: write job descriptions, optimize your resume, and generate ATS-ready CVs with credits."
        canonical="/jobs"
      />
      <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-end mb-4">
            <HowItWorksButton title="Work AI Tools" intro="Credit-based AI tools for job posts and resumes." steps={HOW_IT_WORKS} variant="compact" />
          </div>

          <WorkHero />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {TOOLS.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <Card className="group relative h-full flex flex-col overflow-hidden border-border/40 bg-card/60 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10">
                  <div className={`absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${tool.color} opacity-15 blur-2xl transition-opacity group-hover:opacity-30`} />
                  <CardContent className="relative p-5 flex flex-col h-full">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 shadow-lg shadow-primary/20`}>
                      <tool.icon className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold mb-1.5">{tool.title}</h2>
                    <p className="text-sm text-muted-foreground flex-1 mb-4">{tool.desc}</p>
                    <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-border/40">
                      <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500">
                        <Zap className="h-3 w-3 mr-1" />
                        {tool.credits} credits
                      </Badge>
                      {tool.route ? (
                        <Button size="sm" onClick={() => navigate(tool.route!)}>
                          Open <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      ) : tool.post && user ? (
                        <CreateJobDialog userId={user.id} subscribed={true} onRenewSubscription={() => {}} />
                      ) : tool.post ? (
                        <Button size="sm" onClick={() => navigate("/auth")}>Sign in</Button>
                      ) : tool.id === "ai-resume-optimizer" ? (
                        <AIJobOptimizer />
                      ) : (
                        <AICVGeneratorDialog />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Globe2, title: "Global by default", desc: "Hire and get hired anywhere — remote-first listings, no borders." },
              { icon: Zap, title: "Credits only", desc: "No subscriptions. Pay a few AI credits per action." },
              { icon: Briefcase, title: "Instant visibility", desc: "Publish in seconds and boost your listing to the top." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-border/40 bg-gradient-to-br from-primary/10 via-card/50 to-accent/5 p-5 backdrop-blur-xl">
                <f.icon className="h-5 w-5 text-primary mb-2.5" />
                <h3 className="font-bold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
