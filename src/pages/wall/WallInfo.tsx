import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Info, Heart, MessageCircle, Share2, Repeat2, Bookmark, Image, Video, Smile, MapPin,
  Clock, Hash, AtSign, Users, Bell, Lock, Sparkles, TrendingUp, Calendar, Flag, Eye,
  ThumbsUp, Star, Zap, Camera, FileImage, MessageSquare, UserPlus, Search, Filter,
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
        { name: "Text Posts", description: "Share your thoughts, updates, and stories with text-based posts.", icon: <MessageSquare className="h-4 w-4" /> },
        { name: "Photo & Image Upload", description: "Upload photos and images to your posts. Supports JPEG, PNG, GIF, and WebP formats.", icon: <Image className="h-4 w-4" /> },
        { name: "Video Upload", description: "Share video content directly in your posts. Supports MP4, MOV, and WebM formats.", icon: <Video className="h-4 w-4" /> },
        { name: "Feelings & Activities", description: "Express how you're feeling or what you're doing with emoji-based mood indicators.", icon: <Smile className="h-4 w-4" /> },
        { name: "Location Tagging", description: "Add your current location or any place to your posts.", icon: <MapPin className="h-4 w-4" /> },
        { name: "Hashtags", description: "Use #hashtags to categorize your posts and make them discoverable.", icon: <Hash className="h-4 w-4" /> },
        { name: "User Mentions", description: "Mention other users with @username to notify them and link to their profiles.", icon: <AtSign className="h-4 w-4" /> },
        { name: "Post Visibility", description: "Choose who can see each post: Everyone, Friends Only, or Only Me.", icon: <Eye className="h-4 w-4" /> },
      ],
    },
    {
      title: "Engagement & Interactions",
      icon: <Heart className="h-5 w-5" />,
      features: [
        { name: "Likes", description: "Like posts to show appreciation. See who liked your posts.", icon: <Heart className="h-4 w-4" /> },
        { name: "Reactions", description: "Express different emotions with animated reaction emojis on posts.", icon: <ThumbsUp className="h-4 w-4" /> },
        { name: "Comments", description: "Engage in threaded conversations with up to 3 levels of replies.", icon: <MessageCircle className="h-4 w-4" /> },
        { name: "Share Posts", description: "Share posts externally via link or copy to clipboard.", icon: <Share2 className="h-4 w-4" /> },
        { name: "Repost / Quote Post", description: "Repost content to your feed with your own commentary.", icon: <Repeat2 className="h-4 w-4" /> },
        { name: "Save Posts", description: "Bookmark posts to save them for later in the Saved section.", icon: <Bookmark className="h-4 w-4" /> },
      ],
    },
    {
      title: "Feed & Discovery",
      icon: <Search className="h-5 w-5" />,
      features: [
        { name: "Smart Feed Tabs", description: "Switch between For You, Following, Trending, and Latest feed views.", icon: <Filter className="h-4 w-4" /> },
        { name: "Trending Content", description: "Discover trending posts ranked by engagement score in the past 7 days.", icon: <TrendingUp className="h-4 w-4" /> },
        { name: "Search", description: "Search through posts by content, hashtags, or author name.", icon: <Search className="h-4 w-4" /> },
        { name: "Real-time Updates", description: "See new posts and interactions in real-time via Supabase subscriptions.", icon: <Zap className="h-4 w-4" /> },
      ],
    },
    {
      title: "Social Features",
      icon: <Users className="h-5 w-5" />,
      features: [
        { name: "Friends System", description: "Send and manage friend requests. See your friends list and find people you may know.", icon: <Users className="h-4 w-4" /> },
        { name: "Follow Users", description: "Follow other users to see their posts in your personalized feed.", icon: <UserPlus className="h-4 w-4" /> },
        { name: "User Profiles", description: "View detailed profiles with bio, posts, followers, and following counts.", icon: <Eye className="h-4 w-4" /> },
        { name: "Notifications", description: "Get notified when someone likes, comments, follows, or mentions you.", icon: <Bell className="h-4 w-4" /> },
        { name: "Quick Messages", description: "Access your friends for quick messaging, with full Messenger available separately.", icon: <MessageCircle className="h-4 w-4" /> },
      ],
    },
    {
      title: "Groups",
      icon: <Users className="h-5 w-5" />,
      features: [
        { name: "Create Groups", description: "Create public groups for communities with shared interests.", icon: <Users className="h-4 w-4" /> },
        { name: "Join & Discover", description: "Search and discover groups by name, browse popular ones, and join with one click.", icon: <Search className="h-4 w-4" /> },
        { name: "Group Discussions", description: "Post and engage in discussions within your groups.", icon: <MessageCircle className="h-4 w-4" /> },
        { name: "Group Management", description: "Manage group members and moderate content as group admin.", icon: <Lock className="h-4 w-4" /> },
      ],
    },
    {
      title: "Pages",
      icon: <Flag className="h-5 w-5" />,
      features: [
        { name: "Create Pages", description: "Create pages for businesses, brands, artists, or communities with custom categories.", icon: <Flag className="h-4 w-4" /> },
        { name: "Page Categories", description: "Choose from categories: Business, Entertainment, Community, Artist, Brand, and more.", icon: <Filter className="h-4 w-4" /> },
        { name: "Follow Pages", description: "Follow pages to stay updated with their content and announcements.", icon: <Heart className="h-4 w-4" /> },
        { name: "Discover Pages", description: "Search and discover pages by name or browse by category.", icon: <Search className="h-4 w-4" /> },
      ],
    },
    {
      title: "Events",
      icon: <Calendar className="h-5 w-5" />,
      features: [
        { name: "Create Events", description: "Create events with title, description, location, date, and optional cover image.", icon: <Calendar className="h-4 w-4" /> },
        { name: "RSVP", description: "RSVP to events as 'Going' or 'Interested' to let organizers know.", icon: <ThumbsUp className="h-4 w-4" /> },
        { name: "Upcoming Events", description: "Discover upcoming events in your community.", icon: <Clock className="h-4 w-4" /> },
        { name: "Suggested Events", description: "Get personalized event suggestions based on your interests.", icon: <Sparkles className="h-4 w-4" /> },
      ],
    },
    {
      title: "Videos",
      icon: <Video className="h-5 w-5" />,
      features: [
        { name: "Video Feed", description: "Browse and watch video content from the community.", icon: <Video className="h-4 w-4" /> },
        { name: "Upload Videos", description: "Upload standalone videos with title and description.", icon: <Camera className="h-4 w-4" /> },
        { name: "Video Posts", description: "Posts containing video content are automatically collected in the Videos section.", icon: <FileImage className="h-4 w-4" /> },
      ],
    },
    {
      title: "Gamification",
      icon: <Star className="h-5 w-5" />,
      features: [
        { name: "Daily XP Rewards", description: "Earn XP daily by watching reward videos and engaging with the platform.", icon: <Zap className="h-4 w-4" /> },
        { name: "Achievements & Badges", description: "Earn badges and achievements for your activity and engagement.", icon: <Star className="h-4 w-4" /> },
        { name: "Activity Streaks", description: "Maintain daily streaks to earn bonus XP and unlock rewards.", icon: <TrendingUp className="h-4 w-4" /> },
      ],
    },
    {
      title: "Privacy & Security",
      icon: <Lock className="h-5 w-5" />,
      features: [
        { name: "Privacy Settings", description: "Control who can see your posts, profile, and activity.", icon: <Lock className="h-4 w-4" /> },
        { name: "Block Users", description: "Block users to prevent them from seeing your content or contacting you.", icon: <Eye className="h-4 w-4" /> },
        { name: "Report Content", description: "Report inappropriate posts or users for review by moderators.", icon: <Flag className="h-4 w-4" /> },
        { name: "Media Gallery", description: "View all your uploaded photos and videos in a gallery format.", icon: <FileImage className="h-4 w-4" /> },
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
              Discover all {featureSections.reduce((a, s) => a + s.features.length, 0)} features available on Wall
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
            transition={{ delay: sectionIndex * 0.05 }}
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
                    <div
                      key={featureIndex}
                      className="group flex gap-3 p-3 rounded-xl border border-border/30 hover:border-primary/30 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 text-primary h-fit group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-accent group-hover:text-white transition-all duration-300 shadow-sm">
                        {feature.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-sm mb-0.5 group-hover:text-primary transition-colors">
                          {feature.name}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
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
