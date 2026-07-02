import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface GlamourToolCardProps {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
  credits?: number;
  gradient: string;
  onClick: () => void;
}

export function GlamourToolCard({ icon: Icon, title, description, badge, credits, gradient, onClick }: GlamourToolCardProps) {
  return (
    <>
      <FloatingHowItWorks title={"Glamour Tool Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Glamour Tool Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Glamour Tool Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Button
      variant="ghost"
      className={`h-auto p-4 flex flex-col items-start gap-2 bg-gradient-to-br ${gradient} border border-pink-200/20 hover:border-pink-400/40 rounded-xl transition-all hover:scale-[1.02] w-full text-left`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between w-full">
        <div className="p-2 rounded-lg bg-pink-500/10">
          <Icon className="h-5 w-5 text-pink-400" />
        </div>
        <div className="flex items-center gap-1">
          {badge && (
            <Badge variant="secondary" className="bg-pink-500/20 text-pink-300 text-[10px]">
              {badge}
            </Badge>
          )}
          {credits && (
            <Badge variant="outline" className="text-[10px] gap-0.5 border-pink-400/30">
              <Coins className="h-3 w-3" /> {credits}
            </Badge>
          )}
        </div>
      </div>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
      </div>
    </Button>
    </>
  );
}
