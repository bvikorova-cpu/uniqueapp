import { motion } from "framer-motion";
import { ShieldCheck, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const partners = [
  { name: "Technical University", students: 24, emoji: "🏛️", verified: true },
  { name: "School of Arts", students: 18, emoji: "🎨", verified: true },
  { name: "Medical Academy", students: 31, emoji: "⚕️", verified: true },
  { name: "Business School", students: 15, emoji: "📊", verified: true },
  { name: "Engineering Institute", students: 22, emoji: "⚙️", verified: true },
];

export function UniversityPartners() {
  return (
    <>
      <FloatingHowItWorks title={"University Partners - How it works"} steps={[{ title: 'Open', desc: 'Access the University Partners section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in University Partners.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <section className="py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">🏫 Verified University Partners</h2>
          <p className="text-muted-foreground">Trusted institutions in our network</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {partners.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Card className="text-center border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all">
                <CardContent className="pt-6 pb-4 space-y-2">
                  <span className="text-3xl">{p.emoji}</span>
                  <h3 className="font-semibold text-sm text-foreground">{p.name}</h3>
                  {p.verified && (
                    <Badge variant="secondary" className="text-xs">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                    </Badge>
                  )}
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" /> {p.students} students helped
                  </div>
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
