import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ImageIcon, Upload, Download, TrendingUp, Sparkles, Tags,
  FolderOpen, Search, BarChart3, Palette, Wand2, ShoppingBag,
  Star, Layers, Eye, ShieldCheck, Crown, Trophy, Eraser, FolderUp, PieChart, Users
} from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface StockContentToolGridProps {
  onToolSelect: (tool: string) => void;
}

const tools = [
  { id: "browse", label: "Browse Library", desc: "Explore premium digital content", icon: Search, color: "from-blue-500 to-blue-700", credits: null },
  { id: "upload", label: "Upload Content", desc: "Publish your digital creations", icon: Upload, color: "from-emerald-500 to-emerald-700", credits: null },
  { id: "ai-generator", label: "AI Content Generator", desc: "Generate stock images with AI", icon: Sparkles, color: "from-purple-500 to-purple-700", credits: 5 },
  { id: "collections", label: "Collections & Bundles", desc: "Curated content packages", icon: FolderOpen, color: "from-amber-500 to-amber-700", credits: null },
  { id: "trending", label: "Trending Content", desc: "Top sellers & most popular", icon: TrendingUp, color: "from-rose-500 to-rose-700", credits: null },
  { id: "ai-tags", label: "AI Tag Suggester", desc: "Auto-tag your uploads with AI", icon: Tags, color: "from-cyan-500 to-cyan-700", credits: 3 },
  { id: "my-content", label: "My Content", desc: "Manage your published assets", icon: Layers, color: "from-indigo-500 to-indigo-700", credits: null },
  { id: "purchases", label: "My Purchases", desc: "Download your licensed content", icon: ShoppingBag, color: "from-teal-500 to-teal-700", credits: null },
  { id: "earnings", label: "Earnings Dashboard", desc: "Revenue analytics & payouts", icon: BarChart3, color: "from-green-500 to-green-700", credits: null },
  { id: "color-search", label: "Color Search", desc: "Find content by color palette", icon: Palette, color: "from-pink-500 to-pink-700", credits: null },
  { id: "ai-enhance", label: "AI Image Enhancer", desc: "Upscale & improve quality", icon: Wand2, color: "from-violet-500 to-violet-700", credits: 4 },
  { id: "featured", label: "Featured Picks", desc: "Editor's choice selections", icon: Star, color: "from-yellow-500 to-yellow-700", credits: null },
  { id: "preview", label: "Content Preview", desc: "Preview before purchase", icon: Eye, color: "from-slate-500 to-slate-700", credits: null },
  { id: "download-history", label: "Download History", desc: "All your past downloads", icon: Download, color: "from-orange-500 to-orange-700", credits: null },
  { id: "plagiarism-scanner", label: "AI Plagiarism Scanner", desc: "Check content originality with AI", icon: ShieldCheck, color: "from-emerald-500 to-teal-700", credits: 4 },
  { id: "subscriptions", label: "Subscription Plans", desc: "Unlimited downloads with plans", icon: Crown, color: "from-amber-500 to-yellow-700", credits: null },
  { id: "leaderboard", label: "Creator Leaderboard", desc: "Top creators & rankings", icon: Trophy, color: "from-yellow-500 to-amber-700", credits: null },
  { id: "bg-remover", label: "AI Background Remover", desc: "Remove backgrounds instantly", icon: Eraser, color: "from-rose-500 to-pink-700", credits: 3 },
  { id: "bulk-upload", label: "Bulk Upload Manager", desc: "Upload multiple files at once", icon: FolderUp, color: "from-indigo-500 to-blue-700", credits: null },
  { id: "content-analytics", label: "Content Analytics", desc: "Detailed asset performance stats", icon: PieChart, color: "from-sky-500 to-cyan-700", credits: null },
  { id: "contributors", label: "Contributor Portfolios", desc: "Discover top creators & their work", icon: Users, color: "from-fuchsia-500 to-pink-700", credits: null },
  { id: "smart-search", label: "Smart Search (AI)", desc: "Reverse-image & visual similarity search", icon: Sparkles, color: "from-violet-500 to-purple-700", credits: 4 },
];

export function StockContentToolGrid({ onToolSelect }: StockContentToolGridProps) {
  return (
    <>
      <FloatingHowItWorks title={"Stock Content Tool Grid - How it works"} steps={[{ title: 'Open', desc: 'Access the Stock Content Tool Grid section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Stock Content Tool Grid.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {tools.map((tool, i) => {
        const Icon = tool.icon;
        return (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card
              className="group relative overflow-hidden cursor-pointer border-border/50 hover:border-blue-400/50 transition-all duration-300 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] hover:-translate-y-1"
              onClick={() => onToolSelect(tool.id)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="p-3 md:p-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-2 md:mb-3 shadow-lg`}>
                  <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <h3 className="font-bold text-xs md:text-sm mb-0.5 md:mb-1 line-clamp-1">{tool.label}</h3>
                <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-2">{tool.desc}</p>
                {tool.credits && (
                  <Badge variant="secondary" className="mt-1.5 md:mt-2 text-[10px] md:text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
                    {tool.credits} credits
                  </Badge>
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
    </>
  );
}
