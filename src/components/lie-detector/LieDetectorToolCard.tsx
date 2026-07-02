import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ToolDef {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
  features: string[];
  credits: number;
}

interface LieDetectorToolCardProps {
  tool: ToolDef;
  onSelect: () => void;
  index: number;
}

export const LieDetectorToolCard = ({ tool, onSelect, index }: LieDetectorToolCardProps) => {
  const Icon = tool.icon;

  return (
    <>
      <FloatingHowItWorks title={"Lie Detector Tool Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Lie Detector Tool Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Lie Detector Tool Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
    >
      <Card className="relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 bg-card/60 backdrop-blur-sm h-full">
        <div className={`h-1.5 bg-gradient-to-r ${tool.color}`} />
        <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="text-[10px]">{tool.credits} cr</Badge>
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className={`p-3.5 rounded-2xl bg-gradient-to-br ${tool.color} shadow-lg`}
            >
              <Icon className="h-7 w-7 text-white" />
            </motion.div>
            <div className="flex-1 pt-1">
              <CardTitle className="text-xl mb-1 group-hover:text-primary transition-colors">
                {tool.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{tool.description}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {tool.features.map((feature, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 + i * 0.03 }}
                className="flex items-center gap-2.5"
              >
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}>
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-muted-foreground">{feature}</span>
              </motion.li>
            ))}
          </ul>

          <Button
            className={`w-full group/btn transition-all bg-gradient-to-r ${tool.color} hover:opacity-90 text-white`}
            onClick={onSelect}
          >
            Start Analysis
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
