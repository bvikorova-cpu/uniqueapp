import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText, Users, MessageCircle, BarChart3, Layers, Wallet,
  Calendar, Settings, Sparkles, Vote, ShoppingBag, Video,
  Megaphone, Handshake, Award, Share2
} from "lucide-react";

const tools = [
  { icon: FileText, name: "Content Manager", description: "Create, schedule, and manage exclusive posts", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Users, name: "Subscribers", description: "View and manage your subscriber base", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: MessageCircle, name: "Community Chat", description: "Discord-style group chats by tier", color: "text-violet-500", bg: "bg-violet-500/10" },
  { icon: BarChart3, name: "Analytics Dashboard", description: "Revenue, growth, and engagement metrics", color: "text-orange-500", bg: "bg-orange-500/10" },
  { icon: Layers, name: "Subscription Tiers", description: "Create and manage pricing tiers", color: "text-pink-500", bg: "bg-pink-500/10" },
  { icon: Wallet, name: "Payouts & Earnings", description: "Track earnings and withdraw funds", color: "text-green-500", bg: "bg-green-500/10" },
  { icon: Calendar, name: "Event Scheduler", description: "Plan live sessions and Q&A events", color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { icon: Settings, name: "Profile Settings", description: "Customize your creator profile", color: "text-gray-500", bg: "bg-gray-500/10" },
  { icon: Sparkles, name: "AI Content Assistant", description: "AI-powered post and description generator", color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: Vote, name: "Community Polls", description: "Create polls and vote on community topics", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: ShoppingBag, name: "Merch Store", description: "Sell branded merchandise to fans", color: "text-rose-500", bg: "bg-rose-500/10" },
  { icon: Video, name: "Live Streams", description: "Go live and interact with subscribers", color: "text-red-500", bg: "bg-red-500/10" },
  { icon: Megaphone, name: "Promotion Tools", description: "Boost visibility and attract new subs", color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { icon: Handshake, name: "Collaboration Hub", description: "Partner with other creators", color: "text-teal-500", bg: "bg-teal-500/10" },
  { icon: Award, name: "NFT Badges", description: "Create collectible badges for top fans", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { icon: Share2, name: "Referral System", description: "Earn from bringing new creators", color: "text-sky-500", bg: "bg-sky-500/10" },
];

interface MembershipToolCardsProps {
  onSelectTool: (tool: string) => void;
}

export const MembershipToolCards = ({ onSelectTool }: MembershipToolCardsProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
        Creator Tools
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <Card
              className="bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => onSelectTool(tool.name)}
            >
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl ${tool.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <tool.icon className={`w-5 h-5 ${tool.color}`} />
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
