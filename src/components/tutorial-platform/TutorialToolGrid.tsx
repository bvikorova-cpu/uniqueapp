import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Brain, MessageCircle, Award, Search, Sparkles, ArrowUpRight, Inbox } from "lucide-react";
import { useCourseUnread } from "@/hooks/useSimpleUnread";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";
import bgCreate from "@/assets/tutorial/bg-create.jpg";
import bgBrowse from "@/assets/tutorial/bg-browse.jpg";
import bgTutor from "@/assets/tutorial/bg-tutor.jpg";
import bgQuiz from "@/assets/tutorial/bg-quiz.jpg";
import bgCertificate from "@/assets/tutorial/bg-certificate.jpg";
import bgMyCourses from "@/assets/tutorial/bg-mycourses.jpg";
import bgMessages from "@/assets/tutorial/bg-messages.jpg";

const tools = [
  { id: "create", label: "Create Course", icon: Plus, desc: "Build and publish your own course", img: bgCreate, span: "md:col-span-2" },
  { id: "browse", label: "Browse Courses", icon: Search, desc: "Discover every course in the campus library", img: bgBrowse, span: "md:col-span-2" },
  { id: "ai-tutor", label: "AI Tutor", icon: MessageCircle, desc: "Ask anything, learn step by step", ai: true, credits: 3, img: bgTutor },
  { id: "ai-quiz", label: "AI Quiz", icon: Brain, desc: "Instant quizzes from any topic", ai: true, credits: 5, img: bgQuiz },
  { id: "ai-certificate", label: "Certificate AI", icon: Award, desc: "Design elegant certificates", ai: true, credits: 5, img: bgCertificate },
  { id: "my-courses", label: "My Courses", icon: BookOpen, desc: "Track progress and manage lessons", img: bgMyCourses },
  { id: "messages", label: "Messages", icon: Inbox, desc: "Access requests & chats with creators", img: bgMessages },
];


interface Props {
  onToolSelect: (tool: string) => void;
}

export function TutorialToolGrid({ onToolSelect }: Props) {
  const { unread } = useCourseUnread();

  return (
    <>
      <FloatingHowItWorks title={"Tutorial Tool Grid - How it works"} steps={[{ title: 'Open', desc: 'Access the Tutorial Tool Grid section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tutorial Tool Grid.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Campus</p>
            <h2 className="text-2xl font-black tracking-tight md:text-3xl">Your learning tools</h2>
          </div>
          <div className="hidden h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent md:block" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.button
                key={tool.id}
                type="button"
                onClick={() => onToolSelect(tool.id)}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className={`group relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-5 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/15 ${tool.span ?? ""}`}
              >
                <img
                  src={tool.img}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  width={768}
                  height={512}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity transition-all duration-500 group-hover:scale-105 group-hover:opacity-40"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/80 to-card/40" />
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/15 blur-2xl transition-opacity duration-300 group-hover:bg-primary/30" />


                {tool.id === "messages" && unread > 0 && (
                  <span className="absolute right-3 top-3 flex h-6 min-w-6 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-destructive-foreground">
                    {unread}
                  </span>
                )}
                {tool.ai && (
                  <Badge className="absolute right-3 top-3 border-0 bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                    <Sparkles className="mr-1 h-3 w-3" />
                    {tool.credits} CR
                  </Badge>
                )}

                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/20 to-accent/15 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                <p className="relative mt-4 text-base font-bold leading-tight">{tool.label}</p>
                <p className="relative mt-1 text-xs leading-relaxed text-muted-foreground">{tool.desc}</p>

                <span className="relative mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Open <ArrowUpRight className="h-3 w-3" />
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>
    </>
  );
}
