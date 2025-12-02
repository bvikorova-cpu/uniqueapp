import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSecretSanta } from "@/hooks/useSecretSanta";
import { Calendar, Snowflake, Heart, Ghost, Sparkles, Sun, Leaf, Star } from "lucide-react";
import { motion } from "framer-motion";

// Get current season/holiday
const getCurrentSeason = () => {
  const month = new Date().getMonth();
  const day = new Date().getDate();
  
  // Christmas (December)
  if (month === 11) return "christmas";
  // Valentine's (February 1-14)
  if (month === 1 && day <= 14) return "valentines";
  // Easter (March-April - simplified)
  if (month === 2 || month === 3) return "easter";
  // Halloween (October)
  if (month === 9) return "halloween";
  // Summer (June-August)
  if (month >= 5 && month <= 7) return "summer";
  // Fall (September-November)
  if (month >= 8 && month <= 10) return "fall";
  // Winter (December-February)
  return "winter";
};

const SEASONAL_GIFTS = {
  christmas: {
    name: "Christmas Collection",
    icon: <Snowflake className="h-5 w-5" />,
    color: "from-red-500 to-green-600",
    bgColor: "from-red-50 to-green-50",
    gifts: [
      { type: "christmas_tree", emoji: "🎄", label: "Christmas Tree", value: 25, description: "Festive tree" },
      { type: "santa", emoji: "🎅", label: "Santa Claus", value: 40, description: "Ho ho ho!" },
      { type: "snowman", emoji: "⛄", label: "Snowman", value: 20, description: "Frosty friend" },
      { type: "reindeer", emoji: "🦌", label: "Reindeer", value: 35, description: "Rudolph" },
      { type: "present", emoji: "🎁", label: "Christmas Present", value: 30, description: "Wrapped surprise" },
      { type: "gingerbread", emoji: "🍪", label: "Gingerbread", value: 15, description: "Sweet treat" },
      { type: "wreath", emoji: "🎀", label: "Holiday Wreath", value: 22, description: "Door decoration" },
      { type: "sleigh", emoji: "🛷", label: "Santa's Sleigh", value: 50, description: "Magical ride" },
    ],
  },
  valentines: {
    name: "Valentine's Collection",
    icon: <Heart className="h-5 w-5" />,
    color: "from-pink-500 to-red-500",
    bgColor: "from-pink-50 to-red-50",
    gifts: [
      { type: "love_heart", emoji: "💖", label: "Sparkling Heart", value: 20, description: "Glowing love" },
      { type: "cupid_arrow", emoji: "💘", label: "Cupid's Arrow", value: 35, description: "Love strike" },
      { type: "teddy", emoji: "🧸", label: "Teddy Bear", value: 30, description: "Cuddly friend" },
      { type: "love_letter_v", emoji: "💌", label: "Love Letter", value: 25, description: "Written passion" },
      { type: "roses_dozen", emoji: "🌹", label: "Dozen Roses", value: 45, description: "12 red roses" },
      { type: "chocolates", emoji: "🍫", label: "Chocolate Box", value: 28, description: "Sweet treats" },
      { type: "couple", emoji: "💑", label: "Perfect Match", value: 50, description: "Soul mates" },
      { type: "heart_eyes", emoji: "😍", label: "Heart Eyes", value: 15, description: "In love" },
    ],
  },
  easter: {
    name: "Easter Collection",
    icon: <Star className="h-5 w-5" />,
    color: "from-yellow-400 to-pink-400",
    bgColor: "from-yellow-50 to-pink-50",
    gifts: [
      { type: "easter_bunny", emoji: "🐰", label: "Easter Bunny", value: 30, description: "Hoppy friend" },
      { type: "easter_egg", emoji: "🥚", label: "Easter Egg", value: 15, description: "Colorful egg" },
      { type: "chick", emoji: "🐣", label: "Baby Chick", value: 20, description: "Newly hatched" },
      { type: "basket", emoji: "🧺", label: "Easter Basket", value: 35, description: "Full of goodies" },
      { type: "spring_flower", emoji: "🌷", label: "Spring Tulip", value: 18, description: "Fresh bloom" },
      { type: "butterfly", emoji: "🦋", label: "Butterfly", value: 25, description: "Spring beauty" },
    ],
  },
  halloween: {
    name: "Halloween Collection",
    icon: <Ghost className="h-5 w-5" />,
    color: "from-orange-500 to-purple-600",
    bgColor: "from-orange-50 to-purple-50",
    gifts: [
      { type: "pumpkin", emoji: "🎃", label: "Jack-o-Lantern", value: 25, description: "Spooky pumpkin" },
      { type: "ghost", emoji: "👻", label: "Friendly Ghost", value: 20, description: "Boo!" },
      { type: "witch", emoji: "🧙‍♀️", label: "Witch", value: 35, description: "Magical" },
      { type: "vampire", emoji: "🧛", label: "Vampire", value: 40, description: "Count Dracula" },
      { type: "bat", emoji: "🦇", label: "Bat", value: 18, description: "Night flyer" },
      { type: "spider", emoji: "🕷️", label: "Spider", value: 15, description: "Creepy crawler" },
      { type: "skeleton", emoji: "💀", label: "Skeleton", value: 30, description: "Spooky bones" },
      { type: "cauldron", emoji: "🪄", label: "Magic Cauldron", value: 45, description: "Brew magic" },
    ],
  },
  summer: {
    name: "Summer Collection",
    icon: <Sun className="h-5 w-5" />,
    color: "from-yellow-400 to-orange-500",
    bgColor: "from-yellow-50 to-orange-50",
    gifts: [
      { type: "sun", emoji: "☀️", label: "Sunshine", value: 20, description: "Bright rays" },
      { type: "beach", emoji: "🏖️", label: "Beach Day", value: 35, description: "Sandy fun" },
      { type: "palm", emoji: "🌴", label: "Palm Tree", value: 25, description: "Tropical vibes" },
      { type: "surfboard", emoji: "🏄", label: "Surfboard", value: 40, description: "Catch waves" },
      { type: "watermelon", emoji: "🍉", label: "Watermelon", value: 15, description: "Sweet & juicy" },
      { type: "icecream_cone", emoji: "🍦", label: "Ice Cream", value: 18, description: "Cool treat" },
    ],
  },
  fall: {
    name: "Autumn Collection",
    icon: <Leaf className="h-5 w-5" />,
    color: "from-orange-500 to-red-600",
    bgColor: "from-orange-50 to-red-50",
    gifts: [
      { type: "maple_leaf", emoji: "🍁", label: "Maple Leaf", value: 15, description: "Fall colors" },
      { type: "acorn", emoji: "🌰", label: "Acorn", value: 12, description: "Autumn nut" },
      { type: "pumpkin_pie", emoji: "🥧", label: "Pumpkin Pie", value: 25, description: "Thanksgiving treat" },
      { type: "hot_cocoa", emoji: "☕", label: "Hot Cocoa", value: 18, description: "Warm drink" },
      { type: "sweater", emoji: "🧥", label: "Cozy Sweater", value: 30, description: "Stay warm" },
    ],
  },
  winter: {
    name: "Winter Collection",
    icon: <Snowflake className="h-5 w-5" />,
    color: "from-blue-400 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50",
    gifts: [
      { type: "snowflake", emoji: "❄️", label: "Snowflake", value: 15, description: "Unique crystal" },
      { type: "hot_drink", emoji: "🍵", label: "Hot Tea", value: 18, description: "Warming drink" },
      { type: "mitten", emoji: "🧤", label: "Mittens", value: 20, description: "Keep hands warm" },
      { type: "scarf", emoji: "🧣", label: "Cozy Scarf", value: 22, description: "Winter wrap" },
      { type: "fireplace", emoji: "🔥", label: "Cozy Fire", value: 30, description: "Warm glow" },
    ],
  },
};

interface LimitedEditionGiftsProps {
  onSelectGift?: (gift: any) => void;
}

export const LimitedEditionGifts = ({ onSelectGift }: LimitedEditionGiftsProps) => {
  const currentSeason = getCurrentSeason();
  const seasonData = SEASONAL_GIFTS[currentSeason as keyof typeof SEASONAL_GIFTS];
  const { credits } = useSecretSanta();
  const [selectedGift, setSelectedGift] = useState<string | null>(null);

  // Calculate days remaining in the season (simplified)
  const getDaysRemaining = () => {
    const month = new Date().getMonth();
    const day = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), month + 1, 0).getDate();
    return daysInMonth - day;
  };

  const handleSelect = (gift: any) => {
    setSelectedGift(gift.type);
    onSelectGift?.({ ...gift, category: "seasonal" });
  };

  return (
    <div className="space-y-4">
      {/* Season header */}
      <div className={`bg-gradient-to-r ${seasonData.color} rounded-2xl p-4 sm:p-6 text-white shadow-lg`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {seasonData.icon}
            <h3 className="font-bold text-lg">{seasonData.name}</h3>
          </div>
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-sm">
            <Calendar className="h-4 w-4" />
            <span>{getDaysRemaining()} days left</span>
          </div>
        </div>
        <p className="text-white/80 text-sm">
          Limited time gifts! Available only during this season.
        </p>
      </div>

      {/* Seasonal gifts grid */}
      <div className={`bg-gradient-to-br ${seasonData.bgColor} rounded-2xl p-4 border border-gray-200`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {seasonData.gifts.map((gift, index) => {
            const canAfford = credits >= gift.value;
            const isSelected = selectedGift === gift.type;

            return (
              <motion.div
                key={gift.type}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => canAfford && handleSelect(gift)}
                className={`relative p-3 rounded-xl text-center cursor-pointer transition-all ${
                  isSelected
                    ? `bg-gradient-to-br ${seasonData.color} text-white shadow-lg scale-105`
                    : canAfford
                    ? "bg-white hover:shadow-md border border-gray-200"
                    : "bg-gray-100 opacity-50 cursor-not-allowed"
                }`}
              >
                {/* Limited badge */}
                <div className="absolute -top-2 -right-2">
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    LIMITED
                  </span>
                </div>

                <span className="text-3xl block mb-1">{gift.emoji}</span>
                <p className={`text-xs font-medium truncate ${isSelected ? "text-white" : "text-gray-700"}`}>
                  {gift.label}
                </p>
                <p className={`text-xs mt-0.5 ${isSelected ? "text-white/80" : "text-gray-500"}`}>
                  {gift.description}
                </p>
                <p className={`text-sm font-bold mt-1 ${isSelected ? "text-white" : canAfford ? "text-amber-600" : "text-red-500"}`}>
                  💎 {gift.value}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center gap-2 text-gray-500 text-sm px-2">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <span>Seasonal gifts are exclusive and only available for a limited time!</span>
      </div>
    </div>
  );
};

// Export seasonal gifts for use in send component
export { SEASONAL_GIFTS, getCurrentSeason };
