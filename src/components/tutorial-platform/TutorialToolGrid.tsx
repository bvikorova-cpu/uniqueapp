import { Card } from "@/components/ui/card";
import {
  BookOpen, Plus, ShoppingBag, Euro, TrendingUp, Users, Award,
  Brain, FileText, MessageCircle, Palette, Video, BarChart3,
  Search, Star, Zap, BookMarked, Shield, Lightbulb, Calendar
} from "lucide-react";

const tools = [
  { id: "browse", label: "Browse Courses", icon: Search, color: "text-emerald-500", desc: "Discover all courses" },
  { id: "create", label: "Create Course", icon: Plus, color: "text-green-500", desc: "Build new course" },
  { id: "enrollments", label: "My Enrollments", icon: ShoppingBag, color: "text-blue-500", desc: "Your enrolled courses" },
  { id: "my-courses", label: "My Courses", icon: BookOpen, color: "text-indigo-500", desc: "Manage your courses" },
  { id: "earnings", label: "My Earnings", icon: Euro, color: "text-yellow-500", desc: "Revenue dashboard" },
  { id: "ai-quiz", label: "AI Quiz Generator", icon: Brain, color: "text-pink-500", desc: "Auto-generate quizzes • 5 credits" },
  { id: "ai-outline", label: "AI Course Outline", icon: FileText, color: "text-violet-500", desc: "AI course structure • 4 credits" },
  { id: "ai-tutor", label: "AI Tutor Chat", icon: MessageCircle, color: "text-cyan-500", desc: "Personal AI tutor • 3 credits" },
  { id: "ai-certificate", label: "AI Certificate Designer", icon: Award, color: "text-amber-500", desc: "Custom certificates • 5 credits" },
  { id: "trending", label: "Trending Courses", icon: TrendingUp, color: "text-red-500", desc: "Most popular now" },
  { id: "leaderboard", label: "Instructor Leaderboard", icon: Star, color: "text-orange-500", desc: "Top educators" },
  { id: "analytics", label: "Course Analytics", icon: BarChart3, color: "text-teal-500", desc: "Performance insights" },
  { id: "community", label: "Student Community", icon: Users, color: "text-sky-500", desc: "Discussion forums" },
  { id: "live-sessions", label: "Live Sessions", icon: Video, color: "text-rose-500", desc: "Schedule live classes" },
  { id: "resources", label: "Resource Library", icon: BookMarked, color: "text-lime-500", desc: "Templates & materials" },
  { id: "mentorship", label: "Mentorship Program", icon: Lightbulb, color: "text-fuchsia-500", desc: "1-on-1 mentoring" },
  { id: "plagiarism", label: "Plagiarism Checker", icon: Shield, color: "text-slate-500", desc: "Content originality • 3 credits" },
  { id: "course-builder", label: "Visual Course Builder", icon: Palette, color: "text-emerald-600", desc: "Drag & drop editor" },
  { id: "scheduler", label: "Course Scheduler", icon: Calendar, color: "text-purple-500", desc: "Plan & schedule releases" },
  { id: "certificates", label: "Certificate Gallery", icon: Zap, color: "text-yellow-600", desc: "Browse all certificates" },
];

interface Props {
  onToolSelect: (tool: string) => void;
}

export function TutorialToolGrid({ onToolSelect }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Card
            key={tool.id}
            onClick={() => onToolSelect(tool.id)}
            className="p-3 md:p-4 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-emerald-500/10 hover:border-emerald-500/30 bg-gradient-to-br from-background to-emerald-500/5"
          >
            <Icon className={`h-6 w-6 md:h-7 md:w-7 ${tool.color} mb-2`} />
            <p className="text-xs md:text-sm font-semibold leading-tight mb-1">{tool.label}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">{tool.desc}</p>
          </Card>
        );
      })}
    </div>
  );
}
