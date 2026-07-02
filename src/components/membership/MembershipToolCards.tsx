import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Users, MessageCircle, BarChart3, Layers, Wallet,
  Calendar, Settings, Sparkles, Vote, ShoppingBag, Video,
  Megaphone, Handshake, Award, Share2, Search
} from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const tools = [
  { icon: FileText, name: "Content Manager", description: "Create, schedule, and manage exclusive posts", gradient: "from-blue-500 to-cyan-400", bgGlow: "bg-blue-500/10" },
  { icon: Users, name: "Subscribers", description: "View and manage your subscriber base", gradient: "from-emerald-500 to-green-400", bgGlow: "bg-emerald-500/10" },
  { icon: MessageCircle, name: "Community Chat", description: "Discord-style group chats by tier", gradient: "from-violet-500 to-purple-400", bgGlow: "bg-violet-500/10" },
  { icon: BarChart3, name: "Analytics Dashboard", description: "Revenue, growth, and engagement metrics", gradient: "from-orange-500 to-amber-400", bgGlow: "bg-orange-500/10" },
  { icon: Layers, name: "Subscription Tiers", description: "Create and manage pricing tiers", gradient: "from-pink-500 to-rose-400", bgGlow: "bg-pink-500/10" },
  { icon: Wallet, name: "Payouts & Earnings", description: "Track earnings and withdraw funds", gradient: "from-green-500 to-emerald-400", bgGlow: "bg-green-500/10" },
  { icon: Calendar, name: "Event Scheduler", description: "Plan live sessions and Q&A events", gradient: "from-cyan-500 to-sky-400", bgGlow: "bg-cyan-500/10" },
  { icon: Settings, name: "Profile Settings", description: "Customize your creator profile", gradient: "from-gray-500 to-slate-400", bgGlow: "bg-gray-500/10" },
  { icon: Sparkles, name: "AI Content Assistant", description: "AI-powered post and description generator", gradient: "from-purple-500 to-fuchsia-400", bgGlow: "bg-purple-500/10", isPaid: true },
  { icon: Vote, name: "Community Polls", description: "Create polls and vote on community topics", gradient: "from-amber-500 to-yellow-400", bgGlow: "bg-amber-500/10" },
  { icon: ShoppingBag, name: "Merch Store", description: "Sell branded merchandise to fans", gradient: "from-rose-500 to-pink-400", bgGlow: "bg-rose-500/10" },
  { icon: Video, name: "Live Streams", description: "Go live and interact with subscribers", gradient: "from-red-500 to-orange-400", bgGlow: "bg-red-500/10" },
  { icon: Megaphone, name: "Promotion Tools", description: "Boost visibility and attract new subs", gradient: "from-indigo-500 to-blue-400", bgGlow: "bg-indigo-500/10" },
  { icon: Handshake, name: "Collaboration Hub", description: "Partner with other creators", gradient: "from-teal-500 to-cyan-400", bgGlow: "bg-teal-500/10" },
  { icon: Award, name: "NFT Badges", description: "Create collectible badges for top fans", gradient: "from-yellow-500 to-amber-400", bgGlow: "bg-yellow-500/10" },
  { icon: Share2, name: "Referral System", description: "Earn from bringing new creators", gradient: "from-sky-500 to-blue-400", bgGlow: "bg-sky-500/10" },
  { icon: Search, name: "Discover Creators", description: "Browse and find your favorite creators", gradient: "from-fuchsia-500 to-pink-400", bgGlow: "bg-fuchsia-500/10" },
];

interface MembershipToolCardsProps {
  onSelectTool: (tool: string) => void;
}

export const MembershipToolCards = ({ onSelectTool }: MembershipToolCardsProps) => {
  return (
    <div className="mb-10">
      <FloatingHowItWorks
        title={"Membership Tool Cards"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-black mb-2 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          Creator Tools
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          17 powerful tools to grow your community, manage content, and maximize earnings
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i }}
          >
            <Card
              className="bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group active:scale-[0.97] relative overflow-hidden"
              onClick={() => onSelectTool(tool.name)}
            >
              {tool.isPaid && (
                <Badge className="absolute top-2 right-2 bg-accent/90 text-accent-foreground text-[9px] px-1.5 py-0.5">
                  Credits
                </Badge>
              )}
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl ${tool.bgGlow} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <div className={`w-full h-full rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center opacity-90`}>
                    <tool.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-sm mb-1 text-foreground">{tool.name}</h3>
                <p className="text-[11px] text-muted-foreground leading-tight">{tool.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
