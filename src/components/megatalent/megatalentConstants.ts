import { GraduationCap, ImagePlus, TrendingUp, Award, Flame, Trophy, Music, PenTool, BarChart3, Handshake } from "lucide-react";

export const categoryGroups = [
  { group: "🎨 Art & Creativity", categories: [
    { value: "drawing", label: "🎨 Drawing" }, { value: "painting", label: "🖌️ Painting" },
    { value: "digital_art", label: "💻 Digital Art" }, { value: "sculpture", label: "🗿 Sculpture / Modeling" },
    { value: "photography", label: "📸 Photography" }, { value: "handmade", label: "✂️ Handmade Crafts" },
    { value: "makeup_art", label: "💄 Makeup Art" }, { value: "tattoo", label: "⚡ Best Tattoo" },
  ]},
  { group: "🎤 Music", categories: [
    { value: "singing", label: "🎤 Singing" }, { value: "instrument", label: "🎸 Musical Instrument" },
    { value: "music_production", label: "🎧 Music Production / DJ" }, { value: "beatbox", label: "🎵 Beatbox" },
    { value: "rap", label: "🎙️ Rap / Freestyle" },
  ]},
  { group: "💃 Dance & Movement", categories: [
    { value: "dance", label: "💃 Dance" }, { value: "breakdance", label: "🕺 Breakdance" },
    { value: "gymnastics", label: "🤸 Gymnastics / Acrobatics" }, { value: "parkour", label: "🏃 Parkour / Freerunning" },
  ]},
  { group: "💪 Sports & Fitness", categories: [
    { value: "training", label: "💪 Best Training" }, { value: "yoga", label: "🧘 Yoga / Pilates" },
    { value: "martial_arts", label: "🥋 Martial Arts" }, { value: "extreme_sport", label: "🛹 Extreme Sports" },
    { value: "sport_trick", label: "⚽ Sport Tricks" },
  ]},
  { group: "😂 Entertainment", categories: [
    { value: "funny_video", label: "😂 Funniest Video" }, { value: "standup", label: "🎭 Stand-up / Comedy" },
    { value: "impressions", label: "🎪 Impressions / Parodies" }, { value: "magic", label: "🎩 Magic / Illusions" },
    { value: "pranks", label: "😜 Pranks / Hidden Camera" },
  ]},
  { group: "💡 Education", categories: [
    { value: "life_advice", label: "💡 Best Life Advice" }, { value: "tutorial", label: "📚 Tutorial / How-to" },
    { value: "cooking", label: "👨‍🍳 Cooking / Baking" }, { value: "diy", label: "🔧 DIY Projects" },
    { value: "science", label: "🔬 Science / Experiments" },
  ]},
  { group: "🌟 Other", categories: [
    { value: "best_selfie", label: "🤳 Best Selfie" }, { value: "transformation", label: "✨ Transformation (Before/After)" },
    { value: "pet_talent", label: "🐾 Pet Talent" }, { value: "other", label: "🌟 Other Talents" },
  ]},
];

export const aiTools = [
  { id: "talent_coach", name: "AI Talent Coach", icon: GraduationCap, credits: 4, description: "Personalized coaching to improve your talent", gradient: "from-yellow-500 to-amber-600" },
  { id: "thumbnail_generator", name: "AI Thumbnail Creator", icon: ImagePlus, credits: 3, description: "Eye-catching thumbnail concepts", gradient: "from-amber-500 to-orange-600" },
  { id: "trend_analyzer", name: "AI Trend Analyzer", icon: TrendingUp, credits: 3, description: "Discover trending categories & strategies", gradient: "from-yellow-600 to-yellow-800" },
  { id: "performance_score", name: "AI Performance Score", icon: Award, credits: 4, description: "Professional talent evaluation", gradient: "from-yellow-400 to-yellow-700" },
  { id: "viral_predictor", name: "AI Viral Predictor", icon: Flame, credits: 4, description: "Predict viral potential of your submission", gradient: "from-red-500 to-orange-600" },
  { id: "music_advisor", name: "AI Music Advisor", icon: Music, credits: 3, description: "Perfect music & sound for your videos", gradient: "from-violet-500 to-purple-600" },
  { id: "caption_writer", name: "AI Caption Writer", icon: PenTool, credits: 3, description: "Engaging captions & hashtags", gradient: "from-emerald-500 to-teal-600" },
  { id: "collaboration_matcher", name: "AI Collab Matcher", icon: Handshake, credits: 4, description: "Find perfect collaboration partners", gradient: "from-blue-500 to-indigo-600" },
  { id: "leaderboard", name: "Live Leaderboard", icon: BarChart3, credits: 0, description: "Real-time rankings & animations", gradient: "from-yellow-500 to-amber-500" },
  { id: "achievements", name: "Achievements", icon: Trophy, credits: 0, description: "Track milestones & unlock badges", gradient: "from-amber-500 to-yellow-600" },
];
