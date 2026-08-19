import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Brain, MessageCircle, Award, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const categories = [
  {
    title: "Education",
    tools: [
      { id: "browse", label: "Browse Courses", icon: Search, color: "from-violet-500 to-purple-600", desc: "Discover all courses" },
      { id: "ai-tutor", label: "AI Tutor", icon: MessageCircle, color: "from-cyan-500 to-blue-600", desc: "Personal AI tutor", ai: true, credits: 3 },
      { id: "ai-quiz", label: "AI Quiz", icon: Brain, color: "from-pink-500 to-rose-600", desc: "Generate quizzes", ai: true, credits: 5 },
      { id: "ai-certificate", label: "Certificate AI", icon: Award, color: "from-amber-500 to-orange-600", desc: "Custom certs", ai: true, credits: 5 },
      { id: "create", label: "Create Course", icon: Plus, color: "from-emerald-500 to-teal-600", desc: "Build new course" },
      { id: "my-courses", label: "My Courses", icon: BookOpen, color: "from-indigo-500 to-purple-600", desc: "Manage courses" },
    ]
  },
];

interface Props {
  onToolSelect: (tool: string) => void;
}

export function TutorialToolGrid({ onToolSelect }: Props) {
  return (
    <>
      <FloatingHowItWorks title={"Tutorial Tool Grid - How it works"} steps={[{ title: 'Open', desc: 'Access the Tutorial Tool Grid section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tutorial Tool Grid.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {categories.map((cat, catIdx) => (
        <div key={cat.title}>
          <h3 className="text-sm md:text-base font-bold mb-2 flex items-center gap-2">
            {cat.title}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
            {cat.tools.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: (catIdx * 0.1) + (i * 0.02) }}
                >
                  <Card
                    onClick={() => onToolSelect(tool.id)}
                    className="p-3 md:p-4 cursor-pointer hover:shadow-xl hover:scale-[1.03] transition-all duration-200 border-violet-500/10 hover:border-violet-500/30 bg-gradient-to-br from-background to-violet-500/5 relative overflow-hidden group"
                  >
                    {(tool as any).ai && (
                      <Badge className="absolute top-1.5 right-1.5 text-[8px] md:text-[9px] px-1.5 py-0 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">
                        <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                        {(tool as any).credits} CR
                      </Badge>
                    )}
                    <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-2 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all`}>
                      <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <p className="text-xs md:text-sm font-bold leading-tight mb-0.5">{tool.label}</p>
                    <p className="text-[9px] md:text-xs text-muted-foreground leading-tight">{tool.desc}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
    </>
  );
}
