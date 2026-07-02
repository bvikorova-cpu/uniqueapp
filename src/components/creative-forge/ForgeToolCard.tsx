import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ForgeToolDef {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
  features: string[];
  credits: number;
}

interface ForgeToolCardProps {
  tool: ForgeToolDef;
  onSelect: () => void;
  index: number;
}

export const ForgeToolCard = ({ tool, onSelect, index }: ForgeToolCardProps) => {
  const Icon = tool.icon;

  return (
    <>
      <FloatingHowItWorks title={"Forge Tool Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Forge Tool Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Forge Tool Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.08 }}
    >
      <Card className="relative overflow-hidden group transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(251,191,36,0.25)] border border-amber-900/20 hover:border-amber-600/40 bg-gradient-to-br from-[hsl(30,15%,9%)]/90 to-[hsl(0,20%,8%)]/90 backdrop-blur-xl h-full">
        {/* Top gold accent line */}
        <div className={`h-[2px] bg-gradient-to-r from-amber-700/0 via-amber-500 to-amber-700/0`} />

        {/* Subtle decorative glow on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-700`} />

        {/* Corner ornament */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-amber-900/40 text-amber-200 border border-amber-600/30 text-[10px] font-serif tracking-wide">
            {tool.credits} cr
          </Badge>
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.6 }}
              className={`p-3.5 rounded-xl bg-gradient-to-br ${tool.color} shadow-lg ring-1 ring-amber-400/20`}
            >
              <Icon className="h-6 w-6 text-white drop-shadow" />
            </motion.div>
            <div className="flex-1 pt-1">
              <CardTitle
                className="text-xl mb-1 text-amber-50 group-hover:text-amber-200 transition-colors"
                style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
              >
                {tool.name}
              </CardTitle>
              <p className="text-sm text-amber-200/60 leading-relaxed">{tool.description}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <ul className="space-y-1.5">
            {tool.features.slice(0, 4).map((feature, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.08 + i * 0.04 }}
                className="flex items-center gap-2"
              >
                <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0 ring-1 ring-amber-400/30`}>
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
                <span className="text-xs text-amber-100/70">{feature}</span>
              </motion.li>
            ))}
          </ul>

          <Button
            className={`w-full bg-gradient-to-r ${tool.color} hover:opacity-90 text-white font-semibold shadow-lg group/btn`}
            onClick={onSelect}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Begin Crafting
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
