import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Info, 
  Heart, 
  MessageCircle, 
  Share2, 
  Repeat2, 
  Bookmark, 
  Image, 
  Video, 
  Smile, 
  MapPin,
  Clock,
  Hash, 
  AtSign,
  Users,
  Bell,
  Lock,
  Sparkles,
  TrendingUp,
  Calendar,
  Flag,
  Eye,
  ThumbsUp,
  Star,
  Zap,
  Camera,
  FileImage,
  MessageSquare,
  UserPlus,
  Search,
  Filter,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface FeatureSection {
  title: string;
  icon: React.ReactNode;
  features: {
    name: string;
    description: string;
    icon: React.ReactNode;
  }[];
}

export default function WallInfo() {
  const { t } = useTranslation();

  const featureSections: FeatureSection[] = [
    {
      title: "Post Creation Features",
      icon: <FileImage className="h-5 w-5" />,
      features: [
        {
          name: "Text Posts",
          description: "Create text-based posts to share your thoughts, updates, and stories with your followers.",
          icon: <MessageSquare className="h-4 w-4" />,
        },
        {
          name: "Photo & Image Upload",
          description: "Upload multiple photos and images to your posts. Supports JPEG, PNG, GIF, and WebP formats.",
          icon: <Image className="h-4 w-4" />,
        },
        {
          name: "Video Upload",
          description: "Share video content directly in your posts. Supports MP4, MOV, and WebM formats.",
          icon: <Video className="h-4 w-4" />,
        },
        {
          name: "Feelings & Activities",
          description: "Express how you're feeling or what you're doing with emoji-based mood indicators.",
          icon: <Smile className="h-4 w-4" />,
        },
        {
          name: "Location Tagging",
          description: "Add your current location or any place to your posts to show where you are.",
          icon: <MapPin className="h-4 w-4" />,
        },
        {
          name: "Hashtags",
          description: "Use #hashtags to categorize your posts and make them discoverable by others.",
          icon: <Hash className="h-4 w-4" />,
        },
        {
          name: "User Mentions",
          description: "Mention other users with @username to notify them and link to their profiles.",
          icon: <AtSign className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Post Interaction Features",
      icon: <Heart className="h-5 w-5" />,
      features: [
        {
          name: "Like Posts",
          description: "Show appreciation for posts by liking them. See who liked your posts.",
          icon: <Heart className="h-4 w-4" />,
        },
        {
          name: "Reactions",
          description: "Express different emotions with reaction emojis: Love, Haha, Wow, Sad, Angry, and more.",
          icon: <ThumbsUp className="h-4 w-4" />,
        },
        {
          name: "Comments",
          description: "Engage in conversations by commenting on posts. Reply to other comments.",
          icon: <MessageCircle className="h-4 w-4" />,
        },
        {
          name: "Share Posts",
          description: "Share posts externally via link, copy to clipboard, or share to other platforms.",
          icon: <Share2 className="h-4 w-4" />,
        },
        {
          name: "Repost / Quote Post",
          description: "Repost content to your feed with your own commentary added.",
          icon: <Repeat2 className="h-4 w-4" />,
        },
        {
          name: "Save Posts",
          description: "Bookmark posts to save them for later. Access all saved posts in the Saved section.",
          icon: <Bookmark className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Social Features",
      icon: <Users className="h-5 w-5" />,
      features: [
        {
          name: "Follow Users",
          description: "Follow other users to see their posts in your feed. Build your network.",
          icon: <UserPlus className="h-4 w-4" />,
        },
        {
          name: "Friends System",
          description: "Manage your friends list, see friend requests, and find people you may know.",
          icon: <Users className="h-4 w-4" />,
        },
        {
          name: "Direct Messages",
          description: "Send private messages to other users. Full messaging features available in Messenger.",
          icon: <MessageCircle className="h-4 w-4" />,
        },
        {
          name: "User Profiles",
          description: "View detailed profiles with bio, posts, followers, and following counts.",
          icon: <Eye className="h-4 w-4" />,
        },
        {
          name: "Notifications",
          description: "Get notified when someone likes, comments, follows, or mentions you.",
          icon: <Bell className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Discovery Features",
      icon: <Search className="h-5 w-5" />,
      features: [
        {
          name: "Search Posts",
          description: "Search through all posts by content, hashtags, or author name.",
          icon: <Search className="h-4 w-4" />,
        },
        {
          name: "Trending Content",
          description: "Discover trending posts, hashtags, and popular content from the community.",
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          name: "User Search",
          description: "Find and discover new users by searching their names or usernames.",
          icon: <Users className="h-4 w-4" />,
        },
        {
          name: "Hashtag Discovery",
          description: "Explore posts by clicking on hashtags to see all related content.",
          icon: <Hash className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "AI Studio Features",
      icon: <Sparkles className="h-5 w-5" />,
      features: [
        {
          name: "AI Image Generation",
          description: "Generate unique AI images from text prompts to use in your posts.",
          icon: <Sparkles className="h-4 w-4" />,
        },
        {
          name: "AI Content Suggestions",
          description: "Get AI-powered suggestions for your post content and captions.",
          icon: <Zap className="h-4 w-4" />,
        },
        {
          name: "Image Enhancement",
          description: "Enhance your photos with AI-powered filters and improvements.",
          icon: <Camera className="h-4 w-4" />,
        },
        {
          name: "AI Mood Analysis",
          description: "AI analyzes your posts and mood logs to detect emotional patterns and provide insights about your wellbeing.",
          icon: <Heart className="h-4 w-4" />,
        },
        {
          name: "Time Capsule Messages",
          description: "Write messages to your future self. Schedule delivery for any date and receive emotional reminders from the past.",
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          name: "AI Mood Trends",
          description: "Track your emotional journey over time with AI-generated trend analysis, patterns, and personalized recommendations.",
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          name: "Journal with AI Insights",
          description: "Write private journal entries and get AI-powered emotional analysis and supportive feedback.",
          icon: <FileImage className="h-4 w-4" />,
        },
        {
          name: "AI Voice Messages",
          description: "Generate AI voice responses and audio content for a more personal touch.",
          icon: <Zap className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Messenger AI Features",
      icon: <MessageCircle className="h-5 w-5" />,
      features: [
        {
          name: "AI Smart Reply",
          description: "Get AI-generated smart reply suggestions based on conversation context. Costs 1 credit per use.",
          icon: <Zap className="h-4 w-4" />,
        },
        {
          name: "Conversation Summarizer",
          description: "Summarize long conversations with AI to get key points, decisions, and action items. Costs 5 credits.",
          icon: <MessageSquare className="h-4 w-4" />,
        },
        {
          name: "Real-time Messaging",
          description: "Send and receive messages instantly with real-time updates and typing indicators.",
          icon: <MessageCircle className="h-4 w-4" />,
        },
        {
          name: "Message Reactions",
          description: "React to messages with emojis to express your feelings quickly.",
          icon: <ThumbsUp className="h-4 w-4" />,
        },
        {
          name: "Voice Messages",
          description: "Record and send voice messages when typing is not convenient.",
          icon: <Zap className="h-4 w-4" />,
        },
        {
          name: "Media Sharing",
          description: "Share photos, videos, and files directly in conversations.",
          icon: <Image className="h-4 w-4" />,
        },
        {
          name: "Message Search",
          description: "Search through your conversation history to find specific messages.",
          icon: <Search className="h-4 w-4" />,
        },
        {
          name: "Read Receipts",
          description: "See when your messages have been read by the recipient.",
          icon: <Eye className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Creator Features",
      icon: <Star className="h-5 w-5" />,
      features: [
        {
          name: "Creator Profiles",
          description: "Set up a creator profile to share exclusive content with your subscribers.",
          icon: <UserPlus className="h-4 w-4" />,
        },
        {
          name: "Subscription Tiers",
          description: "Create different subscription tiers with varying benefits and pricing.",
          icon: <Star className="h-4 w-4" />,
        },
        {
          name: "Exclusive Content",
          description: "Post exclusive content visible only to your paying subscribers.",
          icon: <Lock className="h-4 w-4" />,
        },
        {
          name: "Creator Messaging",
          description: "Direct messaging with subscribers for personalized interactions.",
          icon: <MessageCircle className="h-4 w-4" />,
        },
        {
          name: "Analytics Dashboard",
          description: "View detailed analytics about your content performance and subscriber growth.",
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          name: "Earnings Tracking",
          description: "Track your earnings from subscriptions and tips in real-time.",
          icon: <Zap className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Groups",
      icon: <Users className="h-5 w-5" />,
      features: [
        {
          name: "Create Groups",
          description: "Create public or private groups for communities with shared interests. Name, description, and privacy settings.",
          icon: <Users className="h-4 w-4" />,
        },
        {
          name: "Join & Discover Groups",
          description: "Search and discover groups by name, browse popular groups, and join with one click.",
          icon: <Search className="h-4 w-4" />,
        },
        {
          name: "Group Management",
          description: "Manage group members, assign admin roles, and moderate content as group admin.",
          icon: <Lock className="h-4 w-4" />,
        },
        {
          name: "Group Discussions",
          description: "Post and engage in discussions within your groups, share media, and interact with members.",
          icon: <MessageCircle className="h-4 w-4" />,
        },
        {
          name: "Member Count & Stats",
          description: "View member counts, activity statistics, and group growth over time.",
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          name: "Leave Groups",
          description: "Leave any group you've joined with a single click.",
          icon: <UserPlus className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Pages",
      icon: <FileImage className="h-5 w-5" />,
      features: [
        {
          name: "Create Pages",
          description: "Create pages for businesses, brands, artists, or public figures with custom categories.",
          icon: <FileImage className="h-4 w-4" />,
        },
        {
          name: "Page Categories",
          description: "Choose from categories: Business, Entertainment, Community, Artist, Brand, Public Figure, and more.",
          icon: <Filter className="h-4 w-4" />,
        },
        {
          name: "Page Insights",
          description: "View analytics and insights for your page's reach, followers, and engagement metrics.",
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          name: "Page Followers",
          description: "Build a following for your page separate from personal connections.",
          icon: <UserPlus className="h-4 w-4" />,
        },
        {
          name: "Page Posts",
          description: "Share updates, announcements, and content as your page identity.",
          icon: <MessageSquare className="h-4 w-4" />,
        },
        {
          name: "Discover Pages",
          description: "Search and discover pages by name, browse by category, and follow pages you're interested in.",
          icon: <Search className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Events",
      icon: <Calendar className="h-5 w-5" />,
      features: [
        {
          name: "Create Events",
          description: "Create public events with title, description, location, date and time settings.",
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          name: "Event RSVP",
          description: "RSVP to events as 'Going' or 'Interested' to let organizers know you're attending.",
          icon: <ThumbsUp className="h-4 w-4" />,
        },
        {
          name: "Upcoming Events",
          description: "Discover upcoming events in your network and community.",
          icon: <Clock className="h-4 w-4" />,
        },
        {
          name: "My Events",
          description: "View and manage events you've created, see attendee counts and responses.",
          icon: <Star className="h-4 w-4" />,
        },
        {
          name: "Event Details",
          description: "View full event details including location, time, description, and attendee list.",
          icon: <Eye className="h-4 w-4" />,
        },
        {
          name: "Event Reminders",
          description: "Get notifications for upcoming events you've RSVPed to.",
          icon: <Bell className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Privacy & Security Features",
      icon: <Lock className="h-5 w-5" />,
      features: [
        {
          name: "Privacy Settings",
          description: "Control who can see your posts, profile, and activity with granular privacy controls.",
          icon: <Lock className="h-4 w-4" />,
        },
        {
          name: "Block Users",
          description: "Block users to prevent them from seeing your content or contacting you.",
          icon: <Eye className="h-4 w-4" />,
        },
        {
          name: "Report Content",
          description: "Report inappropriate posts or users for review by moderators.",
          icon: <Flag className="h-4 w-4" />,
        },
        {
          name: "Post Visibility",
          description: "Choose who can see each post: Everyone, Friends Only, or Only Me.",
          icon: <Users className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Additional Features",
      icon: <Star className="h-5 w-5" />,
      features: [
        {
          name: "Media Gallery",
          description: "View all your uploaded photos and videos in a beautiful gallery format.",
          icon: <FileImage className="h-4 w-4" />,
        },
        {
          name: "Videos Section",
          description: "Browse and watch video content from users you follow and discover new creators.",
          icon: <Video className="h-4 w-4" />,
        },
        {
          name: "Pull to Refresh",
          description: "Pull down on mobile to refresh your feed and see the latest posts.",
          icon: <Zap className="h-4 w-4" />,
        },
        {
          name: "Infinite Scroll",
          description: "Seamlessly load more posts as you scroll down your feed.",
          icon: <Filter className="h-4 w-4" />,
        },
        {
          name: "Real-time Updates",
          description: "See new posts and interactions in real-time without refreshing the page.",
          icon: <Zap className="h-4 w-4" />,
        },
        {
          name: "Achievements & Badges",
          description: "Earn badges and achievements for your activity and engagement on the platform.",
          icon: <Star className="h-4 w-4" />,
        },
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
