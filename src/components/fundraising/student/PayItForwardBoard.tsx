import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ArrowRight } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const chain = [
  { giver: "Priya S.", receiver: "Amir K.", amount: 150, field: "CS" },
  { giver: "James O.", receiver: "Yuki T.", amount: 200, field: "Medicine" },
  { giver: "Mei L.", receiver: "David N.", amount: 100, field: "Architecture" },
  { giver: "Carlos R.", receiver: "Fatima A.", amount: 120, field: "Engineering" },
  { giver: "Yuki T.", receiver: "Lena W.", amount: 80, field: "Biology" },
];

export function PayItForwardBoard() {
  return (
    <>
      <FloatingHowItWorks title={"Pay It Forward Board - How it works"} steps={[{ title: 'Open', desc: 'Access the Pay It Forward Board section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Pay It Forward Board.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <section className="py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">🔄 Pay-it-Forward Chain</h2>
          <p className="text-muted-foreground">Students who received help and gave back to others</p>
        </div>
        <div className="max-w-2xl mx-auto space-y-3">
          {chain.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-border/50 hover:shadow-md transition-all">
                <CardContent className="py-3 px-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 flex-1 flex-wrap text-sm">
                    <span className="font-semibold text-foreground">{item.giver}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{item.receiver}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">{item.field}</Badge>
                  <span className="text-sm font-bold text-primary">€{item.amount}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          These students were once recipients — now they're giving back 💛
        </p>
      </motion.div>
    </section>
    </>
  );
}
