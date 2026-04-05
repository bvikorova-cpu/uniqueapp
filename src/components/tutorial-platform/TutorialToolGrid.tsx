import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Plus, ShoppingBag, Euro, TrendingUp, Users, Award,
  Brain, FileText, MessageCircle, Palette, Video, BarChart3,
  Search, Star, Zap, BookMarked, Shield, Lightbulb, Calendar,
  Languages, Activity, MessageSquare, Medal, Share2, FileVideo
} from "lucide-react";
import { motion } from "framer-motion";

const tools = [
  { id: "browse", label: "Browse Courses", icon: Search, color: "from-emerald-500 to-teal-600", desc: "Discover all courses", ai: false },
  { id: "create", label: "Create Course", icon: Plus, color: "from-green-500 to-emerald-600", desc: "Build new course", ai: false },
  { id: "enrollments", label: "My Enrollments", icon: ShoppingBag, color: "from-blue-500 to-indigo-600", desc: "Your enrolled courses", ai: false },
  { id: "my-courses", label: "My Courses", icon: BookOpen, color: "from-indigo-500 to-purple-600", desc: "Manage your courses", ai: false },
  { id: "earnings", label: "My Earnings", icon: Euro, color: "from-yellow-500 to-amber-600", desc: "Revenue dashboard", ai: false },
  { id: "ai-quiz", label: "AI Quiz Generator", icon: Brain, color: "from-pink-500 to-rose-600", desc: "Auto-generate quizzes", ai: true, credits: 5 },
  { id: "ai-outline", label: "AI Course Outline", icon: FileText, color: "from-violet-500 to-purple-600", desc: "AI course structure", ai: true, credits: 4 },
  { id: "ai-tutor", label: "AI Tutor Chat", icon: MessageCircle, color: "from-cyan-500 to-blue-600", desc: "Personal AI tutor", ai: true, credits: 3 },
  { id: "ai-certificate", label: "AI Certificate", icon: Award, color: "from-amber-500 to-orange-600", desc: "Custom certificates", ai: true, credits: 5 },
  { id: "ai-translator", label: "AI Translator", icon: Languages, color: "from-blue-500 to-indigo-600", desc: "Translate courses", ai: true, credits: 4 },
  { id: "ai-summarizer", label: "AI Video Notes", icon: FileVideo, color: "from-rose-500 to-red-600", desc: "Summarize video lessons", ai: true, credits: 5 },
  { id: "reviews", label: "Course Reviews", icon: MessageSquare, color: "from-amber-500 to-yellow-600", desc: "AI sentiment analysis", ai: true, credits: 4 },
  { id: "trending", label: "Trending Courses", icon: TrendingUp, color: "from-red-500 to-rose-600", desc: "Most popular now", ai: false },
  { id: "leaderboard", label: "Leaderboard", icon: Star, color: "from-orange-500 to-amber-600", desc: "Top educators", ai: false },
  { id: "analytics", label: "Course Analytics", icon: BarChart3, color: "from-teal-500 to-emerald-600", desc: "Performance insights", ai: false },
  { id: "heatmap", label: "Progress Heatmap", icon: Activity, color: "from-emerald-500 to-green-600", desc: "Learning activity map", ai: false },
  { id: "badges", label: "Badges & XP", icon: Medal, color: "from-amber-500 to-orange-600", desc: "Gamification rewards", ai: false },
  { id: "affiliates", label: "Affiliate Program", icon: Share2, color: "from-green-500 to-emerald-600", desc: "Earn from referrals", ai: false },
  { id: "community", label: "Community", icon: Users, color: "from-sky-500 to-blue-600", desc: "Discussion forums", ai: false },
  { id: "live-sessions", label: "Live Sessions", icon: Video, color: "from-rose-500 to-pink-600", desc: "Schedule live classes", ai: false },
  { id: "resources", label: "Resources", icon: BookMarked, color: "from-lime-500 to-green-600", desc: "Templates & materials", ai: false },
  { id: "mentorship", label: "Mentorship", icon: Lightbulb, color: "from-fuchsia-500 to-purple-600", desc: "1-on-1 mentoring", ai: false },
  { id: "plagiarism", label: "Plagiarism Check", icon: Shield, color: "from-slate-500 to-gray-600", desc: "Content originality", ai: true, credits: 3 },
  { id: "course-builder", label: "Course Builder", icon: Palette, color: "from-emerald-600 to-green-700", desc: "Drag & drop editor", ai: false },
  { id: "scheduler", label: "Scheduler", icon: Calendar, color: "from-purple-500 to-violet-600", desc: "Plan releases", ai: false },
  { id: "certificates", label: "Certificates", icon: Zap, color: "from-yellow-600 to-amber-700", desc: "Browse certificates", ai: false },
];

interface Props {
  onToolSelect: (tool: string) => void;
}

export function TutorialToolGrid({ onToolSelect }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
      {tools.map((tool, i) => {
        const Icon = tool.icon;
        return (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
          >
            <Card
              onClick={() => onToolSelect(tool.id)}
              className="p-3 md:p-4 cursor-pointer hover:shadow-xl hover:scale-[1.03] transition-all duration-200 border-emerald-500/10 hover:border-amber-500/30 bg-gradient-to-br from-background to-emerald-500/5 relative overflow-hidden group"
            >
              {tool.ai && (
                <Badge className="absolute top-1.5 right-1.5 text-[8px] md:text-[9px] px-1.5 py-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  {(tool as any).credits} CR
                </Badge>
              )}
              <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-2 shadow-lg group-hover:shadow-xl transition-shadow`}>
                <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <p className="text-xs md:text-sm font-bold leading-tight mb-0.5">{tool.label}</p>
              <p className="text-[9px] md:text-xs text-muted-foreground leading-tight">{tool.desc}</p>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}