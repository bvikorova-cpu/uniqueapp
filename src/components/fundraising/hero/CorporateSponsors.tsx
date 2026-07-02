import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const sponsors = [
  { name: "Your Company Here", contribution: "Become a Sponsor", tier: "Gold" },
  { name: "Corporate Partner", contribution: "Support Heroes", tier: "Silver" },
  { name: "Local Business", contribution: "Join Us", tier: "Bronze" },
];

export const CorporateSponsors = () => {
  return (
    <>
      <FloatingHowItWorks title={"Corporate Sponsors - How it works"} steps={[{ title: 'Open', desc: 'Access the Corporate Sponsors section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Corporate Sponsors.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
          <Building2 className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-500">Corporate Sponsors</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Backed by Great Partners</h2>
        <p className="text-muted-foreground mt-2">Companies supporting community heroes</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sponsors.map((sponsor, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 text-center border-blue-500/20 bg-blue-500/5 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <Badge variant="secondary" className="mb-2">{sponsor.tier} Sponsor</Badge>
              <h3 className="font-bold text-foreground">{sponsor.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{sponsor.contribution}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
};
