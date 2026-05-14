import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Info, Heart, MessageCircle, Share2, Repeat2, Bookmark, Image, Video, Smile, MapPin,
  Clock, Hash, AtSign, Users, Bell, Lock, Sparkles, TrendingUp, Calendar, Flag, Eye,
  ThumbsUp, Star, Zap, Camera, FileImage, MessageSquare, UserPlus, Search, Filter,
  Radio, Mic, BarChart3, Crown, Gift, Shield, Globe, Palette, ShoppingBag, EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";

interface FeatureSection {
  title: string;
  icon: React.ReactNode;
  features: { name: string; description: string; icon: React.ReactNode }[];
}

export default function WallInfo() {
  const featureSections: FeatureSection[] = [
    {
      title: "Post Creation",
      icon: <FileImage className="h-5 w-5" />,
      features: [
        { name: "Text Posts", description: "Share thoughts, updates, and stories with text-based posts.", icon: <MessageSquare className="h-4 w-4" /> },
        { name: "Photo & Image Upload", description: "Upload multiple photos. Supports JPEG, PNG, GIF, and WebP.", icon: <Image className="h-4 w-4" /> },
        { name: "Video Upload", description: "Share video content in MP4, MOV, and WebM formats.", icon: <Video className="h-4 w-4" /> },
        { name: "Voice Posts", description: "Record and share voice-based posts with your followers.", icon: <Mic className="h-4 w-4" /> },
        { name: "Feelings & Activities", description: "Express mood with emoji-based feelings and activity indicators.", icon: <Smile className="h-4 w-4" /> },
        { name: "Location Tagging", description: "Tag locations to your posts to show where you are.", icon: <MapPin className="h-4 w-4" /> },
        { name: "Hashtags", description: "Use #hashtags to categorize posts and improve discoverability.", icon: <Hash className="h-4 w-4" /> },
        { name: "User Mentions", description: "Mention users with @username to notify and link to profiles.", icon: <AtSign className="h-4 w-4" /> },
        { name: "Post Scheduling", description: "Schedule posts for future publishing with the creator tools.", icon: <Clock className="h-4 w-4" /> },
      ],
    },
    {
      title: "Post Interactions",
      icon: <Heart className="h-5 w-5" />,
      features: [
        { name: "Likes", description: "Like posts and see who liked yours.", icon: <Heart className="h-4 w-4" /> },
        { name: "Animated Reactions", description: "Express emotions with animated reactions: Love, Haha, Wow, Sad, Angry.", icon: <ThumbsUp className="h-4 w-4" /> },
        { name: "Threaded Comments", description: "Engage in conversations with up to 3 levels of threaded replies.", icon: <MessageCircle className="h-4 w-4" /> },
        { name: "Share Posts", description: "Share via link, clipboard, or to other platforms.", icon: <Share2 className="h-4 w-4" /> },
        { name: "Repost / Quote Post", description: "Repost content with your own commentary.", icon: <Repeat2 className="h-4 w-4" /> },
        { name: "Save Posts", description: "Bookmark posts and access them later in the Saved section.", icon: <Bookmark className="h-4 w-4" /> },
        { name: "Quick Polls", description: "Create and vote on quick polls directly in the feed.", icon: <BarChart3 className="h-4 w-4" /> },
      ],
    },
    {
      title: "Stories & Reels",
      icon: <Camera className="h-5 w-5" />,
      features: [
        { name: "Stories", description: "Share ephemeral photo/video stories that disappear after 24 hours.", icon: <Camera className="h-4 w-4" /> },
        { name: "Story Reactions", description: "React to friends' stories with emojis and quick replies.", icon: <Heart className="h-4 w-4" /> },
        { name: "Reels", description: "Create and discover short-form video content.", icon: <Video className="h-4 w-4" /> },
      ],
    },
    {
      title: "Feed & Discovery",
      icon: <Search className="h-5 w-5" />,
      features: [
        { name: "Smart Feed Tabs", description: "Switch between For You, Following, Trending, and Latest feeds.", icon: <Filter className="h-4 w-4" /> },
        { name: "Trending Content", description: "Discover trending posts, hashtags, and popular content.", icon: <TrendingUp className="h-4 w-4" /> },
        { name: "Search", description: "Search posts by content, hashtags, or author. Find users by name.", icon: <Search className="h-4 w-4" /> },
        { name: "Hashtag Discovery", description: "Explore posts by clicking hashtags to find related content.", icon: <Hash className="h-4 w-4" /> },
        { name: "Videos Section", description: "Browse and watch video content from creators and the community.", icon: <Video className="h-4 w-4" /> },
      ],
    },
    {
      title: "Social & Friends",
      icon: <Users className="h-5 w-5" />,
      features: [
        { name: "Follow Users", description: "Follow others to see their posts in your feed.", icon: <UserPlus className="h-4 w-4" /> },
        { name: "Friends System", description: "Send/receive friend requests, see mutual friends, and manage connections.", icon: <Users className="h-4 w-4" /> },
        { name: "Friend Suggestions", description: "Discover people you may know based on mutual friends.", icon: <Sparkles className="h-4 w-4" /> },
        { name: "User Profiles", description: "View profiles with bio, posts, followers, and activity.", icon: <Eye className="h-4 w-4" /> },
        { name: "Notifications", description: "Real-time notifications for likes, comments, follows, and mentions.", icon: <Bell className="h-4 w-4" /> },
      ],
    },
    {
      title: "Messenger",
      icon: <MessageCircle className="h-5 w-5" />,
      features: [
        { name: "Real-time Messaging", description: "Instant messaging with real-time updates and typing indicators.", icon: <MessageCircle className="h-4 w-4" /> },
        { name: "AI Smart Reply", description: "AI-generated smart reply suggestions based on context (1 credit).", icon: <Zap className="h-4 w-4" /> },
        { name: "Conversation Summarizer", description: "AI summarization of long conversations with key points (5 credits).", icon: <MessageSquare className="h-4 w-4" /> },
        { name: "Voice Messages", description: "Record and send voice messages in conversations.", icon: <Mic className="h-4 w-4" /> },
        { name: "Media Sharing", description: "Share photos, videos, and files in conversations.", icon: <Image className="h-4 w-4" /> },
        { name: "Message Reactions", description: "React to messages with emojis.", icon: <ThumbsUp className="h-4 w-4" /> },
        { name: "Read Receipts", description: "See when messages have been read.", icon: <Eye className="h-4 w-4" /> },
      ],
    },
    {
      title: "AI Studio",
      icon: <Sparkles className="h-5 w-5" />,
      features: [
        { name: "AI Content Assistant", description: "AI-powered content suggestions and caption generation (gpt-4o-mini, 1 credit).", icon: <Sparkles className="h-4 w-4" /> },
        { name: "AI Image Generation", description: "Generate unique images from text prompts for your posts.", icon: <Palette className="h-4 w-4" /> },
        { name: "Image Enhancement", description: "Enhance photos with AI-powered filters and improvements.", icon: <Camera className="h-4 w-4" /> },
        { name: "AI Mood Analysis", description: "AI detects emotional patterns from posts and mood logs.", icon: <Heart className="h-4 w-4" /> },
        { name: "AI Mood Trends", description: "Track emotional journey with AI trend analysis and recommendations.", icon: <TrendingUp className="h-4 w-4" /> },
        { name: "Journal with AI Insights", description: "Private journal entries with AI emotional analysis and feedback.", icon: <FileImage className="h-4 w-4" /> },
        { name: "Time Capsule Messages", description: "Write messages to your future self with scheduled delivery.", icon: <Calendar className="h-4 w-4" /> },
      ],
    },
    {
      title: "Creator Tools",
      icon: <Crown className="h-5 w-5" />,
      features: [
        { name: "Analytics Dashboard", description: "Detailed analytics on content performance and audience growth.", icon: <BarChart3 className="h-4 w-4" /> },
        { name: "Post Scheduling", description: "Schedule posts for optimal publishing times.", icon: <Clock className="h-4 w-4" /> },
        { name: "AI Content Suggestions", description: "AI-driven topic and content recommendations.", icon: <Sparkles className="h-4 w-4" /> },
        { name: "Subscription Tiers", description: "Create subscription tiers with different benefits and pricing.", icon: <Star className="h-4 w-4" /> },
        { name: "Exclusive Content", description: "Post content visible only to paying subscribers.", icon: <Lock className="h-4 w-4" /> },
        { name: "Earnings Tracking", description: "Track earnings from subscriptions and tips in real-time.", icon: <Zap className="h-4 w-4" /> },
      ],
    },
    {
      title: "Groups",
      icon: <Users className="h-5 w-5" />,
      features: [
        { name: "Create & Join Groups", description: "Create public/private groups or join existing communities.", icon: <Users className="h-4 w-4" /> },
        { name: "Group Discussions", description: "Post, share media, and engage in group conversations.", icon: <MessageCircle className="h-4 w-4" /> },
        { name: "Group Management", description: "Manage members, assign admin roles, and moderate content.", icon: <Shield className="h-4 w-4" /> },
        { name: "Member Stats", description: "View member counts and group activity statistics.", icon: <TrendingUp className="h-4 w-4" /> },
      ],
    },
    {
      title: "Pages",
      icon: <Flag className="h-5 w-5" />,
      features: [
        { name: "Create Pages", description: "Pages for businesses, brands, artists, or public figures.", icon: <Flag className="h-4 w-4" /> },
        { name: "Page Categories", description: "Categories: Business, Entertainment, Community, Art, Technology, Sports.", icon: <Filter className="h-4 w-4" /> },
        { name: "Page Followers", description: "Build a following separate from personal connections.", icon: <UserPlus className="h-4 w-4" /> },
        { name: "Discover Pages", description: "Search and browse pages by name or category.", icon: <Search className="h-4 w-4" /> },
      ],
    },
    {
      title: "Events",
      icon: <Calendar className="h-5 w-5" />,
      features: [
        { name: "Create Events", description: "Create events with title, description, location, cover image, and timing.", icon: <Calendar className="h-4 w-4" /> },
        { name: "RSVP", description: "RSVP as 'Going' or 'Interested' to community events.", icon: <ThumbsUp className="h-4 w-4" /> },
        { name: "Upcoming Events", description: "Discover upcoming events in your network.", icon: <Clock className="h-4 w-4" /> },
        { name: "Event Management", description: "Manage your created events and track attendees.", icon: <Star className="h-4 w-4" /> },
      ],
    },
    {
      title: "Live Streaming",
      icon: <Radio className="h-5 w-5" />,
      features: [
        { name: "Go Live", description: "Start live streams visible to your followers and community.", icon: <Radio className="h-4 w-4" /> },
        { name: "Live Chat", description: "Real-time chat with viewers during live streams.", icon: <MessageCircle className="h-4 w-4" /> },
        { name: "Live Reactions", description: "Viewers can send floating emoji reactions during streams.", icon: <Heart className="h-4 w-4" /> },
        { name: "Viewer Count", description: "Track live viewer count in real-time.", icon: <Eye className="h-4 w-4" /> },
      ],
    },
    {
      title: "Gamification",
      icon: <Gift className="h-5 w-5" />,
      features: [
        { name: "Daily Streaks", description: "Maintain daily activity streaks for bonus XP.", icon: <Zap className="h-4 w-4" /> },
        { name: "XP & Levels", description: "Earn experience points and level up through engagement.", icon: <TrendingUp className="h-4 w-4" /> },
        { name: "Achievements & Badges", description: "Unlock badges for milestones and special activities.", icon: <Star className="h-4 w-4" /> },
        { name: "Challenges", description: "Participate in community challenges to earn rewards.", icon: <Gift className="h-4 w-4" /> },
      ],
    },
    {
      title: "Privacy & Security",
      icon: <Shield className="h-5 w-5" />,
      features: [
        { name: "Privacy Settings", description: "Control who sees your posts, profile, and activity.", icon: <Lock className="h-4 w-4" /> },
        { name: "Block Users", description: "Block users from seeing your content or contacting you.", icon: <Shield className="h-4 w-4" /> },
        { name: "Report Content", description: "Report inappropriate posts or users for moderation.", icon: <Flag className="h-4 w-4" /> },
        { name: "Post Visibility", description: "Set visibility per post: Everyone, Friends Only, or Only Me.", icon: <Eye className="h-4 w-4" /> },
      ],
    },
    {
      title: "Platform Features",
      icon: <Globe className="h-5 w-5" />,
      features: [
        { name: "10 Color Themes", description: "Choose from 10 different color themes to personalize your experience.", icon: <Palette className="h-4 w-4" /> },
        { name: "Mobile Dashboard", description: "Optimized mobile experience with responsive design.", icon: <Globe className="h-4 w-4" /> },
        { name: "Real-time Updates", description: "Live updates via Supabase for posts, messages, and notifications.", icon: <Zap className="h-4 w-4" /> },
        { name: "Infinite Scroll", description: "Seamless content loading as you scroll through your feed.", icon: <Filter className="h-4 w-4" /> },
        { name: "Media Gallery", description: "Browse all uploaded photos and videos in gallery format.", icon: <Image className="h-4 w-4" /> },
      ],
    },
    {
      title: "Marketplace (Bazaar)",
      icon: <ShoppingBag className="h-5 w-5" />,
      features: [
        { name: "Buy & Sell", description: "Browse, list and buy items in the integrated Bazaar marketplace — accessible directly from the Wall.", icon: <ShoppingBag className="h-4 w-4" /> },
        { name: "Categories & Search", description: "Filter listings by category, price and condition with full-text search.", icon: <Search className="h-4 w-4" /> },
        { name: "EUR Payments", description: "Secure checkout in EUR (€) via Stripe with buyer protection.", icon: <Zap className="h-4 w-4" /> },
        { name: "Seller Profiles", description: "View seller ratings, reviews and other listings before buying.", icon: <Star className="h-4 w-4" /> },
      ],
    },
    {
      title: "Dating",
      icon: <Heart className="h-5 w-5" />,
      features: [
        { name: "Dating Hub", description: "Discover potential matches based on interests, location and shared activities.", icon: <Heart className="h-4 w-4" /> },
        { name: "Smart Matching", description: "Curated suggestions powered by your profile and engagement signals.", icon: <Sparkles className="h-4 w-4" /> },
        { name: "Private Chat", description: "Message matches in a safe, moderated chat space.", icon: <MessageCircle className="h-4 w-4" /> },
        { name: "Photo Verification", description: "Verified photo badges to keep the community authentic.", icon: <Shield className="h-4 w-4" /> },
      ],
    },
    {
      title: "Anonymous Dating",
      icon: <EyeOff className="h-5 w-5" />,
      features: [
        { name: "Hidden Identity", description: "Connect anonymously — your face and name stay hidden until you both agree to reveal.", icon: <EyeOff className="h-4 w-4" /> },
        { name: "Personality First", description: "Match by vibe, interests and conversation rather than appearance.", icon: <Heart className="h-4 w-4" /> },
        { name: "Mutual Reveal", description: "Photos unlock only when both sides opt in.", icon: <Eye className="h-4 w-4" /> },
        { name: "Safe & Moderated", description: "Built-in moderation, blocking and reporting to keep the space safe.", icon: <Shield className="h-4 w-4" /> },
      ],
    },
    {
      title: "Memories",
      icon: <Sparkles className="h-5 w-5" />,
      features: [
        { name: "On This Day", description: "Relive your past posts from previous years on the same date.", icon: <Calendar className="h-4 w-4" /> },
        { name: "Year Highlights", description: "Beautiful tiles like '2 years ago' or '1 year ago' with original media.", icon: <Sparkles className="h-4 w-4" /> },
        { name: "Re-share", description: "Re-share old memories to your current feed with one tap.", icon: <Share2 className="h-4 w-4" /> },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6 space-y-6">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border border-primary/20 p-6 sm:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex items-center gap-4">
          <motion.div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-xl shadow-primary/30" whileHover={{ rotate: 5, scale: 1.05 }}>
            <Info className="h-7 w-7 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Wall Features Guide
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Discover all {totalFeatures} features across {featureSections.length} categories
            </p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-5">
        {featureSections.map((section, sectionIndex) => (
          <motion.div
            key={sectionIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.03 }}
          >
            <Card className="overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-accent/5 border-b border-border/30 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/20">
                    {section.icon}
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-black">{section.title}</CardTitle>
                  <Badge variant="secondary" className="ml-auto text-xs bg-primary/10 text-primary border-0">
                    {section.features.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {section.features.map((feature, featureIndex) => (
                    <div key={featureIndex}
                      className="group flex gap-3 p-3 rounded-xl border border-border/30 hover:border-primary/30 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary h-fit group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-accent group-hover:text-white transition-all duration-300 shadow-sm">
                        {feature.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-sm mb-0.5 group-hover:text-primary transition-colors">{feature.name}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
