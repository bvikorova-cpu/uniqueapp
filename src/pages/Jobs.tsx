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
import { JobListingsFeed } from "@/components/jobs/JobListingsFeed";
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
    credits: 10,
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
          <div className="flex justify-end gap-2 mb-4">
            {user && (
              <Button variant="outline" size="sm" onClick={() => navigate("/employer-dashboard")} className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
                <Briefcase className="h-4 w-4" />
                Employer Dashboard
              </Button>
            )}
            <HowItWorksButton title="Work AI Tools" intro="Credit-based AI tools for job posts and resumes." steps={HOW_IT_WORKS} variant="compact" />
          </div>

          <WorkHero />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {TOOLS.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group relative h-full overflow-hidden border-border/40 bg-card/60 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
                  <div className={`absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br ${tool.color} opacity-15 blur-2xl transition-opacity group-hover:opacity-30`} />
                  <CardContent className="relative p-3 flex flex-col h-full gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center shadow`}>
                        <tool.icon className="h-4 w-4 text-white" />
                      </div>
                      <h2 className="text-xs sm:text-sm font-bold leading-tight">{tool.short}</h2>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-auto min-w-0 overflow-hidden [&_button]:h-7 [&_button]:px-2 [&_button]:text-[11px] [&_button]:max-w-full [&_button]:truncate [&_button_.text-\[10px\]]:hidden">
                      <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 border-amber-500/30 text-amber-500">
                        <Zap className="h-2.5 w-2.5 mr-0.5" />
                        {tool.credits}
                      </Badge>
                      <div className="min-w-0 flex justify-end">
                        {tool.route ? (
                          <Button size="sm" onClick={() => navigate(tool.route!)}>
                            Open <ArrowRight className="h-3 w-3 ml-1" />
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
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <JobListingsFeed />

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Globe2, title: "Global by default", desc: "Hire and get hired anywhere — remote-first listings, no borders." },
              { icon: Zap, title: "Credits only", desc: "No subscriptions. Pay a few AI credits per action." },
              { icon: Briefcase, title: "Instant visibility", desc: "Publish in seconds and boost your listing to the top." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-border/40 bg-gradient-to-br from-primary/10 via-card/50 to-accent/5 p-4 backdrop-blur-xl">
                <f.icon className="h-5 w-5 text-primary mb-2" />
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
