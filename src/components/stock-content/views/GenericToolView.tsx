import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Construction } from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface GenericToolViewProps {
  onBack: () => void;
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  credits?: number;
  features: string[];
}

export function GenericToolView({ onBack, title, description, icon: Icon, iconColor, credits, features }: GenericToolViewProps) {
  return (
    <>
      <FloatingHowItWorks title={"Generic Tool View - How it works"} steps={[{ title: 'Open', desc: 'Access the Generic Tool View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Generic Tool View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <h2 className="text-2xl font-bold flex items-center gap-2"><Icon className={`w-6 h-6 ${iconColor}`} /> {title}</h2>
        {credits && <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">{credits} credits</Badge>}
      </div>

      <Card className="p-8 text-center">
        <div className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br ${iconColor.includes("blue") ? "from-blue-500 to-indigo-600" : iconColor.includes("pink") ? "from-pink-500 to-rose-600" : iconColor.includes("violet") ? "from-violet-500 to-purple-600" : iconColor.includes("cyan") ? "from-cyan-500 to-teal-600" : iconColor.includes("yellow") ? "from-yellow-500 to-amber-600" : iconColor.includes("orange") ? "from-orange-500 to-red-600" : iconColor.includes("slate") ? "from-slate-500 to-gray-600" : "from-blue-500 to-indigo-600"} shadow-lg`}>
          <Icon className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">{description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto mb-6">
          {features.map((f, i) => (
            <div key={i} className="p-3 bg-muted/50 rounded-lg text-left flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>

        <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600" onClick={async () => {
          if (!credits) { toast.success(`Launching ${title}...`); return; }
          try {
            const { supabase } = await import("@/integrations/supabase/client");
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { toast.error("Please log in first"); return; }
            const { data, error } = await supabase.functions.invoke("generate-gift-message", {
              body: { type: "stock_tool", prompt: `Run tool "${title}" — ${description}` }
            });
            if (error) throw error;
            toast.success(`${title} launched (${credits} credits)`);
          } catch (e: any) { toast.error(e.message || "Spustenie zlyhalo"); }
        }}>
          <Icon className="w-4 h-4 mr-2" /> Launch Tool {credits ? `(${credits} Credits)` : ""}
        </Button>
      </Card>
    </div>
    </>
  );
}
