import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSecretSanta } from "@/hooks/useSecretSanta";
import { Calendar, Snowflake, Heart, Ghost, Sparkles, Sun, Leaf, Star } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
  // Winter Collection - 20 items
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
      { type: "snowman", emoji: "⛄", label: "Snowman", value: 25, description: "Frosty friend" },
      { type: "ice_skating", emoji: "⛸️", label: "Ice Skating", value: 35, description: "Frozen fun" },
      { type: "hot_chocolate", emoji: "☕", label: "Hot Chocolate", value: 16, description: "Warm cocoa" },
      { type: "winter_cabin", emoji: "🏠", label: "Winter Cabin", value: 45, description: "Cozy retreat" },
      { type: "snow_globe", emoji: "🔮", label: "Snow Globe", value: 28, description: "Magical scene" },
      { type: "penguin", emoji: "🐧", label: "Penguin", value: 24, description: "Arctic friend" },
      { type: "aurora_winter", emoji: "🌌", label: "Aurora Borealis", value: 55, description: "Northern lights" },
      { type: "wool_blanket", emoji: "🛋️", label: "Wool Blanket", value: 32, description: "Stay cozy" },
      { type: "ice_crystal", emoji: "💎", label: "Ice Crystal", value: 40, description: "Frozen gem" },
      { type: "winter_boots", emoji: "👢", label: "Winter Boots", value: 26, description: "Snow ready" },
      { type: "polar_bear", emoji: "🐻‍❄️", label: "Polar Bear", value: 38, description: "Arctic giant" },
      { type: "hot_soup", emoji: "🍲", label: "Warm Soup", value: 19, description: "Comfort food" },
      { type: "ski_trip", emoji: "⛷️", label: "Ski Trip", value: 60, description: "Mountain fun" },
      { type: "winter_wonderland", emoji: "🏔️", label: "Winter Wonderland", value: 75, description: "Snowy paradise" },
      { type: "cozy_socks", emoji: "🧦", label: "Cozy Socks", value: 14, description: "Warm feet" },
    ],
  },
  // Spring Collection - 20 items
  spring: {
    name: "Spring Collection",
    icon: <Star className="h-5 w-5" />,
    color: "from-green-400 to-pink-400",
    bgColor: "from-green-50 to-pink-50",
    gifts: [
      { type: "cherry_blossom", emoji: "🌸", label: "Cherry Blossom", value: 18, description: "Pink petals" },
      { type: "spring_tulip", emoji: "🌷", label: "Tulip", value: 16, description: "Fresh bloom" },
      { type: "butterfly_spring", emoji: "🦋", label: "Butterfly", value: 22, description: "Spring beauty" },
      { type: "easter_bunny", emoji: "🐰", label: "Easter Bunny", value: 30, description: "Hoppy friend" },
      { type: "easter_egg", emoji: "🥚", label: "Easter Egg", value: 15, description: "Colorful egg" },
      { type: "baby_chick", emoji: "🐣", label: "Baby Chick", value: 20, description: "Newly hatched" },
      { type: "rain_umbrella", emoji: "☔", label: "Spring Rain", value: 19, description: "April showers" },
      { type: "rainbow_spring", emoji: "🌈", label: "Rainbow", value: 28, description: "After the rain" },
      { type: "flower_basket", emoji: "💐", label: "Flower Basket", value: 35, description: "Fresh bouquet" },
      { type: "ladybug", emoji: "🐞", label: "Ladybug", value: 14, description: "Lucky charm" },
      { type: "bee", emoji: "🐝", label: "Busy Bee", value: 17, description: "Pollinator" },
      { type: "garden_bird", emoji: "🐦", label: "Songbird", value: 24, description: "Morning melody" },
      { type: "daisy", emoji: "🌼", label: "Daisy", value: 15, description: "Simple beauty" },
      { type: "spring_picnic", emoji: "🧺", label: "Spring Picnic", value: 40, description: "Outdoor fun" },
      { type: "nest_eggs", emoji: "🪺", label: "Bird Nest", value: 26, description: "New life" },
      { type: "spring_frog", emoji: "🐸", label: "Spring Frog", value: 21, description: "Pond friend" },
      { type: "kite", emoji: "🪁", label: "Flying Kite", value: 23, description: "Windy day" },
      { type: "sunflower_seed", emoji: "🌱", label: "Seedling", value: 12, description: "New growth" },
      { type: "spring_garden", emoji: "🏡", label: "Garden Paradise", value: 55, description: "Blooming beauty" },
      { type: "hyacinth", emoji: "💜", label: "Hyacinth", value: 20, description: "Fragrant flower" },
    ],
  },
  // Summer Collection - 20 items
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
      { type: "sunglasses", emoji: "🕶️", label: "Sunglasses", value: 22, description: "Summer style" },
      { type: "flip_flops", emoji: "🩴", label: "Flip Flops", value: 16, description: "Beach ready" },
      { type: "tropical_drink", emoji: "🍹", label: "Tropical Drink", value: 24, description: "Refreshing" },
      { type: "beach_ball", emoji: "🎾", label: "Beach Ball", value: 14, description: "Fun in sun" },
      { type: "hammock", emoji: "🛏️", label: "Hammock", value: 32, description: "Lazy days" },
      { type: "sunset_summer", emoji: "🌅", label: "Summer Sunset", value: 38, description: "Golden hour" },
      { type: "pineapple", emoji: "🍍", label: "Pineapple", value: 17, description: "Tropical fruit" },
      { type: "coconut", emoji: "🥥", label: "Coconut", value: 19, description: "Island treat" },
      { type: "diving", emoji: "🤿", label: "Scuba Diving", value: 45, description: "Underwater adventure" },
      { type: "yacht_summer", emoji: "⛵", label: "Sailing", value: 55, description: "Ocean breeze" },
      { type: "starfish", emoji: "⭐", label: "Starfish", value: 21, description: "Beach treasure" },
      { type: "seashell", emoji: "🐚", label: "Seashell", value: 13, description: "Ocean gift" },
      { type: "tropical_island", emoji: "🏝️", label: "Tropical Island", value: 70, description: "Paradise" },
      { type: "lemonade", emoji: "🍋", label: "Fresh Lemonade", value: 15, description: "Cool refreshment" },
    ],
  },
  // Autumn/Fall Collection - 20 items
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
      { type: "pumpkin", emoji: "🎃", label: "Pumpkin", value: 20, description: "Harvest icon" },
      { type: "apple_picking", emoji: "🍎", label: "Red Apple", value: 14, description: "Fresh pick" },
      { type: "cinnamon_spice", emoji: "🫖", label: "Spiced Cider", value: 22, description: "Warm & spicy" },
      { type: "harvest_corn", emoji: "🌽", label: "Harvest Corn", value: 16, description: "Golden grain" },
      { type: "fall_forest", emoji: "🌲", label: "Fall Forest", value: 35, description: "Colorful trees" },
      { type: "turkey", emoji: "🦃", label: "Turkey", value: 28, description: "Thanksgiving bird" },
      { type: "scarecrow", emoji: "🧙", label: "Scarecrow", value: 24, description: "Field guardian" },
      { type: "mushroom", emoji: "🍄", label: "Mushroom", value: 17, description: "Forest treasure" },
      { type: "autumn_wind", emoji: "🍃", label: "Autumn Wind", value: 19, description: "Falling leaves" },
      { type: "squirrel", emoji: "🐿️", label: "Squirrel", value: 21, description: "Nut collector" },
      { type: "bonfire", emoji: "🔥", label: "Bonfire", value: 32, description: "Warm flames" },
      { type: "harvest_basket", emoji: "🧺", label: "Harvest Basket", value: 38, description: "Autumn bounty" },
      { type: "owl", emoji: "🦉", label: "Wise Owl", value: 26, description: "Night hunter" },
      { type: "autumn_sunset", emoji: "🌄", label: "Autumn Sunset", value: 40, description: "Golden sky" },
      { type: "cranberry", emoji: "🍇", label: "Cranberries", value: 15, description: "Fall berries" },
    ],
  },
  // Keep holiday collections for special periods
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
      { type: "pumpkin_h", emoji: "🎃", label: "Jack-o-Lantern", value: 25, description: "Spooky pumpkin" },
      { type: "ghost", emoji: "👻", label: "Friendly Ghost", value: 20, description: "Boo!" },
      { type: "witch", emoji: "🧙‍♀️", label: "Witch", value: 35, description: "Magical" },
      { type: "vampire", emoji: "🧛", label: "Vampire", value: 40, description: "Count Dracula" },
      { type: "bat", emoji: "🦇", label: "Bat", value: 18, description: "Night flyer" },
      { type: "spider", emoji: "🕷️", label: "Spider", value: 15, description: "Creepy crawler" },
      { type: "skeleton", emoji: "💀", label: "Skeleton", value: 30, description: "Spooky bones" },
      { type: "cauldron", emoji: "🪄", label: "Magic Cauldron", value: 45, description: "Brew magic" },
    ],
  },
};

interface LimitedEditionGiftsProps {
  onSelectGift?: (gift: any) => void;
}

export const LimitedEditionGifts = ({ onSelectGift }: LimitedEditionGiftsProps) => {
  const currentSeason = getCurrentSeason();
  const { credits } = useSecretSanta();
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [activeSeason, setActiveSeason] = useState<string>(currentSeason);

  // All 4 seasons
  const seasons = ["winter", "spring", "summer", "fall"] as const;
  const seasonData = SEASONAL_GIFTS[activeSeason as keyof typeof SEASONAL_GIFTS];

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
    <>
      <FloatingHowItWorks title={"Limited Edition Gifts - How it works"} steps={[{ title: 'Open', desc: 'Access the Limited Edition Gifts section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Limited Edition Gifts.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      {/* Season tabs - vertical grid */}
      <div className="grid grid-cols-2 gap-2">
        {seasons.map((season) => {
          const sData = SEASONAL_GIFTS[season];
          const isActive = activeSeason === season;
          const isCurrent = currentSeason === season;
          
          return (
            <button
              key={season}
              onClick={() => setActiveSeason(season)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? `bg-gradient-to-r ${sData.color} text-white shadow-lg`
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {sData.icon}
              <span className="font-medium text-sm">{sData.name}</span>
              {isCurrent && (
                <span className="bg-white/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  NOW
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Season header */}
      <div className={`bg-gradient-to-r ${seasonData.color} rounded-2xl p-4 sm:p-6 text-white shadow-lg`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {seasonData.icon}
            <h3 className="font-bold text-lg">{seasonData.name}</h3>
            <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">
              {seasonData.gifts.length} gifts
            </span>
          </div>
          {activeSeason === currentSeason && (
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-sm">
              <Calendar className="h-4 w-4" />
              <span>{getDaysRemaining()} days left</span>
            </div>
          )}
        </div>
        <p className="text-white/80 text-sm">
          Exclusive seasonal collection - available all year round!
        </p>
      </div>

      {/* Seasonal gifts grid */}
      <div className={`bg-gradient-to-br ${seasonData.bgColor} rounded-2xl p-4 border border-gray-200`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {seasonData.gifts.map((gift, index) => {
            const canAfford = credits >= gift.value;
            const isSelected = selectedGift === gift.type;

            return (
              <motion.div
                key={gift.type}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
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
        <span>Exclusive seasonal collections available all year round!</span>
      </div>
    </div>
    </>
  );
};

// Export seasonal gifts for use in send component
export { SEASONAL_GIFTS, getCurrentSeason };
