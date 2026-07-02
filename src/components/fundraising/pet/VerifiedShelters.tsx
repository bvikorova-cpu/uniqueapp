import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, PawPrint } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const shelters = [
  { name: "Your Shelter Here", animals: "Register to showcase", verified: true },
  { name: "Partner Organization", animals: "Join our network", verified: true },
  { name: "Local Rescue", animals: "Become a partner", verified: false },
];

export const VerifiedShelters = () => {
  return (
    <>
      <FloatingHowItWorks title={"Verified Shelters - How it works"} steps={[{ title: 'Open', desc: 'Access the Verified Shelters section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Verified Shelters.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
          <ShieldCheck className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-500">Verified Shelters</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Trusted Partner Shelters</h2>
        <p className="text-muted-foreground mt-2">Verified organizations caring for animals</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shelters.map((shelter, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <Card className="p-6 text-center border-blue-500/20 bg-blue-500/5 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <PawPrint className="h-8 w-8 text-muted-foreground" />
              </div>
              {shelter.verified && <Badge variant="default" className="mb-2"><ShieldCheck className="h-3 w-3 mr-1" />Verified</Badge>}
              <h3 className="font-bold text-foreground">{shelter.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{shelter.animals}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
};
