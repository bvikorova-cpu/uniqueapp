import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface LegalSectionProps {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}

export const LegalSection = ({ id, number, title, children }: LegalSectionProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Legal Section - How it works"} steps={[{ title: 'Open', desc: 'Access the Legal Section section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Legal Section.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <section id={id} className="scroll-mt-24">
      <Card className="p-5 sm:p-7 bg-card/80 backdrop-blur-sm border-amber-400/15 hover:border-amber-400/30 transition-colors">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-amber-400/40 text-amber-400 font-bold">{number}</Badge>
            <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
        </div>

        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground prose-strong:text-foreground prose-headings:text-foreground">
          {children}
        </div>
      </Card>
    </section>
    </>
  );
};
