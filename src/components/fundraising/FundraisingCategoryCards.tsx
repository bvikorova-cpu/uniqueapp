import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, Sparkles, Shield, PawPrint, GraduationCap, AlertTriangle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { id: "medical", title: "Medical Fundraising", emoji: "🏥", icon: Heart, fee: "6%", color: "from-red-500 to-pink-500", route: "/fundraising/medical", desc: "Help with medical treatment costs", campaigns: 342, raised: "€120K" },
  { id: "dream", title: "Dream Maker", emoji: "✨", icon: Sparkles, fee: "7%", color: "from-purple-500 to-indigo-500", route: "/fundraising/dream", desc: "Study, travel, startup dreams", campaigns: 256, raised: "€95K" },
  { id: "hero", title: "Community Hero", emoji: "🦸", icon: Shield, fee: "5%", color: "from-blue-500 to-cyan-500", route: "/fundraising/hero", desc: "Support local heroes & projects", campaigns: 189, raised: "€78K" },
  { id: "pet", title: "Pet Rescue", emoji: "🐾", icon: PawPrint, fee: "6%", color: "from-green-500 to-emerald-500", route: "/fundraising/pet", desc: "Help animals in need", campaigns: 167, raised: "€62K" },
  { id: "student", title: "Student Support", emoji: "🎓", icon: GraduationCap, fee: "5%", color: "from-yellow-500 to-orange-500", route: "/fundraising/student", desc: "Mutual student assistance", campaigns: 298, raised: "€88K" },
  { id: "crisis", title: "Crisis Relief", emoji: "🆘", icon: AlertTriangle, fee: "8%", color: "from-red-600 to-red-400", route: "/fundraising/crisis", desc: "Quick help in 24-48h", campaigns: 134, raised: "€45K" },
  { id: "talent", title: "Talent Sponsorship", emoji: "🎭", icon: Star, fee: "10%", color: "from-pink-500 to-rose-500", route: "/fundraising/talent", desc: "Support young talents", campaigns: 201, raised: "€72K" },
];

export const FundraisingCategoryCards = () => {
  const navigate = useNavigate();

  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-2">
          <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Choose a Category</span>
        </h2>
        <p className="text-center text-muted-foreground mb-8">Select a cause that matters to you</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(cat.route)}
              className="group cursor-pointer bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
            >
              {/* Gradient top bar */}
              <div className={`h-1.5 bg-gradient-to-r ${cat.color}`} />
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg`}>
                    <cat.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {cat.fee} fee
                  </span>
                </div>

                <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors flex items-center gap-1.5">
                  <span>{cat.emoji}</span> {cat.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{cat.desc}</p>

                {/* Live stats */}
                <div className="flex gap-3 mb-3">
                  <div className="text-xs">
                    <span className="font-bold text-foreground">{cat.campaigns}</span>
                    <span className="text-muted-foreground ml-1">campaigns</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-primary">{cat.raised}</span>
                    <span className="text-muted-foreground ml-1">raised</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  View Campaigns
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
