import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Upload, Sparkles, Search, BarChart3, Eraser } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface StockContentToolGridProps {
  onToolSelect: (tool: string) => void;
}

const tools = [
  { id: "browse", label: "Browse Library", desc: "Explore premium digital content", icon: Search, color: "from-blue-500 to-blue-700", credits: null },
  { id: "upload", label: "Upload Content", desc: "Publish your digital creations", icon: Upload, color: "from-emerald-500 to-emerald-700", credits: null },
  { id: "ai-generator", label: "AI Content Generator", desc: "Generate stock images with AI", icon: Sparkles, color: "from-purple-500 to-purple-700", credits: 5 },
  { id: "earnings", label: "Earnings Dashboard", desc: "Revenue analytics & payouts", icon: BarChart3, color: "from-green-500 to-green-700", credits: null },
  { id: "bg-remover", label: "AI Background Remover", desc: "Remove backgrounds instantly", icon: Eraser, color: "from-rose-500 to-pink-700", credits: 3 },
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
