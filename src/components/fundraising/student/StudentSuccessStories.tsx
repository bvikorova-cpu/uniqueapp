import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Briefcase } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const stories = [
  { name: "Priya S.", field: "Computer Science", outcome: "Now a Software Engineer", emoji: "👩‍💻", raised: 2400 },
  { name: "James O.", field: "Medicine", outcome: "Finishing residency", emoji: "👨‍⚕️", raised: 5200 },
  { name: "Mei L.", field: "Architecture", outcome: "Started her own studio", emoji: "👷‍♀️", raised: 3100 },
  { name: "Carlos R.", field: "Engineering", outcome: "Working at major tech firm", emoji: "🔧", raised: 1800 },
];

export function StudentSuccessStories() {
  return (
    <>
      <FloatingHowItWorks title={"Student Success Stories - How it works"} steps={[{ title: 'Open', desc: 'Access the Student Success Stories section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Student Success Stories.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <section className="py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">🎉 Alumni Success Stories</h2>
          <p className="text-muted-foreground">Students who achieved their dreams with community support</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stories.map((s, i) => (
            <motion.div key={s.name} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all h-full">
                <CardContent className="pt-6 pb-4 text-center space-y-3">
                  <span className="text-4xl">{s.emoji}</span>
                  <h3 className="font-bold text-foreground">{s.name}</h3>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <GraduationCap className="h-3 w-3" /> {s.field}
                  </div>
                  <Badge className="bg-accent/20 text-accent-foreground border-accent/30">
                    <Briefcase className="h-3 w-3 mr-1" /> {s.outcome}
                  </Badge>
                  <p className="text-xs text-muted-foreground">€{s.raised.toLocaleString()} raised by community</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
    </>
  );
}
