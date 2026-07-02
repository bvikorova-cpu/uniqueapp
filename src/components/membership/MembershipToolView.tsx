import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface MembershipToolViewProps {
  toolName: string;
  onBack: () => void;
}

const toolDetails: Record<string, { title: string; description: string; features: string[] }> = {
  "Content Manager": {
    title: "Content Manager",
    description: "Create, schedule, and manage your exclusive content. Write posts, upload media, and set visibility per subscription tier.",
    features: ["Rich text editor with media uploads", "Schedule posts in advance", "Set tier-specific visibility", "Draft and preview before publishing", "Content analytics per post", "Pin important posts"],
  },
  "Subscribers": {
    title: "Subscriber Management",
    description: "View your complete subscriber base, track retention, and manage individual subscriber relationships.",
    features: ["Full subscriber list with tiers", "Subscriber growth chart", "Churn rate analytics", "Export subscriber data", "Send mass notifications", "Manage blocked users"],
  },
  "Community Chat": {
    title: "Community Chat",
    description: "Discord-style group chats organized by subscription tier. Create channels, moderate conversations, and build community.",
    features: ["Tier-based chat rooms", "Media sharing in chat", "Moderation tools", "Pinned messages", "Chat analytics", "Custom emojis"],
  },
  "Analytics Dashboard": {
    title: "Analytics Dashboard",
    description: "Comprehensive analytics covering revenue, subscriber growth, engagement rates, and content performance.",
    features: ["Revenue tracking over time", "Subscriber growth graphs", "Engagement rate metrics", "Content performance ranking", "Churn analysis", "Demographic insights"],
  },
  "Subscription Tiers": {
    title: "Subscription Tiers",
    description: "Create and manage your pricing tiers with custom benefits, pricing, and exclusive perks for each level.",
    features: ["Unlimited tier creation", "Custom pricing per tier", "Define exclusive benefits", "Tier comparison preview", "Free trial options", "Annual discount settings"],
  },
  "Payouts & Earnings": {
    title: "Payouts & Earnings",
    description: "Track your earnings from subscriptions, tips, and gifts. Manage withdrawals and view payout history.",
    features: ["Real-time earnings tracker", "Payout history log", "Stripe Connect integration", "Multiple withdrawal methods", "Tax report generation", "Revenue breakdown by source"],
  },
  "Event Scheduler": {
    title: "Event Scheduler",
    description: "Plan and manage live sessions, Q&A events, and exclusive community gatherings.",
    features: ["Calendar-based scheduling", "Event reminders for subs", "Live session hosting", "Q&A management", "Event recordings", "Recurring event setup"],
  },
  "Profile Settings": {
    title: "Profile Settings",
    description: "Customize your creator profile with bio, avatar, cover image, and social links.",
    features: ["Profile customization", "Cover image upload", "Social links integration", "Custom page URL", "SEO settings", "Notification preferences"],
  },
  "AI Content Assistant": {
    title: "AI Content Assistant",
    description: "AI-powered tool to generate post ideas, write descriptions, create engaging captions, and optimize your content strategy. Credits required.",
    features: ["AI post idea generator", "Caption and description writer", "Content calendar suggestions", "SEO optimization tips", "Hashtag recommendations", "Engagement prediction"],
  },
  "Community Polls": {
    title: "Community Polls & Events",
    description: "Create interactive polls, surveys, and community events to engage your subscribers and gather feedback.",
    features: ["Multiple poll types", "Real-time voting results", "Scheduled polls", "Event RSVP tracking", "Community Q&A sessions", "Feedback collection"],
  },
  "Merch Store": {
    title: "Merch Store",
    description: "Design and sell branded merchandise directly to your fans. Print-on-demand integration available.",
    features: ["Product listings", "Print-on-demand integration", "Custom designs upload", "Order management", "Shipping tracking", "Revenue analytics"],
  },
  "Live Streams": {
    title: "Live Streams",
    description: "Go live and interact with your subscribers in real-time. Tier-based access for exclusive streams.",
    features: ["One-click live streaming", "Tier-restricted access", "Live chat integration", "Stream recording", "Viewer analytics", "Donation overlay"],
  },
  "Promotion Tools": {
    title: "Promotion Tools",
    description: "Boost your visibility with promotional tools, cross-promotion features, and discovery optimization.",
    features: ["Featured creator spotlight", "Cross-promotion matching", "Social media sharing", "Promo code creation", "Referral tracking", "SEO optimization"],
  },
  "Collaboration Hub": {
    title: "Collaboration Hub",
    description: "Find and partner with other creators for cross-promotions, joint content, and collaborative projects.",
    features: ["Creator discovery", "Collaboration proposals", "Joint content creation", "Revenue sharing setup", "Shared analytics", "Project management"],
  },
  "NFT Badges": {
    title: "NFT Badges",
    description: "Create exclusive collectible digital badges for your most loyal fans and top-tier subscribers.",
    features: ["Custom badge design", "Tier-exclusive badges", "Milestone badges", "Badge showcase profiles", "Trading between fans", "Limited edition drops"],
  },
  "Referral System": {
    title: "Referral System",
    description: "Earn additional revenue by bringing new creators to the platform. Track referrals and commissions.",
    features: ["Unique referral links", "Commission tracking", "Referral dashboard", "Bonus milestones", "Payout integration", "Marketing materials"],
  },
  "Discover Creators": {
    title: "Discover Creators",
    description: "Browse, search, and discover creators across the platform. Find your next favorite content creator by category, popularity, or interests.",
    features: ["Search by name or category", "Filter by subscription tier", "Sort by popularity or newest", "View creator profiles", "Follow & subscribe directly", "Personalized recommendations"],
  },
};

export const MembershipToolView = ({ toolName, onBack }: MembershipToolViewProps) => {
  const details = toolDetails[toolName] || { title: toolName, description: "Select a tool from the hub to view its details and features.", features: [] };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <FloatingHowItWorks
        title={"Membership Tool View"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Hub
      </Button>

      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            {details.title}
          </CardTitle>
          <CardDescription className="text-base">{details.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {details.features.map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30"
              >
                <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {toolName === "AI Content Assistant" 
                ? "This AI-powered feature requires credits. Start creating with AI assistance today."
                : "Become a creator to unlock this tool and start building your community."
              }
            </p>
            <Button onClick={() => {
              window.location.href = toolName === "AI Content Assistant" ? "/billing?tab=credits" : "/become-creator";
            }}>
              {toolName === "AI Content Assistant" ? "Purchase AI Credits" : "Get Started"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
