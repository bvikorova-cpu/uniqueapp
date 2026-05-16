import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { aiTools } from "./megatalentConstants";

interface Props {
  onSelect: (id: string) => void;
}

const MegatalentAIToolsGrid = ({ onSelect }: Props) => (
  <div className="mb-8">
    <h2 className="text-xl sm:text-2xl font-black mb-4 bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">AI Power Tools</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {aiTools.map((tool, i) => (
        <motion.div key={tool.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Card className="cursor-pointer group hover:shadow-lg hover:shadow-yellow-500/10 hover:border-yellow-500/30 transition-all active:scale-[0.97] bg-card/80 backdrop-blur-xl border-border/30" onClick={() => onSelect(tool.id)}>
            <CardContent className="p-3 text-center">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                <tool.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-xs mb-1">{tool.name}</h3>
              <p className="text-[9px] text-muted-foreground mb-1.5 line-clamp-2">{tool.description}</p>
              <Badge variant="outline" className="text-[9px] border-yellow-500/30 text-yellow-500">{tool.credits > 0 ? `${tool.credits} CR` : "Free"}</Badge>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
);

export default MegatalentAIToolsGrid;
