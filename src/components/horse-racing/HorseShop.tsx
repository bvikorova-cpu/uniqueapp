import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, Crown, Zap, Shield, Heart, Star, 
  Palette, Award, Gift, Trophy, Flame, Snowflake, Sun, Moon
} from "lucide-react";
import { toast } from "sonner";
import { useUserHorses, usePurchaseShopItem, useHorseCurrency } from "@/hooks/useHorseRacing";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  costCredits: number;
  category: 'cosmetics' | 'boosters' | 'equipment' | 'premium' | 'mystery';
  effect?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  statBoost?: {
    speed?: number;
    stamina?: number;
    acceleration?: number;
    temperament?: number;
  };
}

const shopItems: ShopItem[] = [
  // Cosmetics - Colors
  { id: 'color_golden', name: 'Golden Coat', description: 'Transform your horse into a majestic golden stallion', icon: <Sun className="h-5 w-5 text-yellow-500" />, costCredits: 4, category: 'cosmetics', rarity: 'rare' },
  { id: 'color_silver', name: 'Silver Coat', description: 'Elegant silver coating for your champion', icon: <Moon className="h-5 w-5 text-gray-400" />, costCredits: 4, category: 'cosmetics', rarity: 'rare' },
  { id: 'color_midnight', name: 'Midnight Black', description: 'Deep midnight black with a hint of starlight', icon: <Star className="h-5 w-5 text-purple-500" />, costCredits: 6, category: 'cosmetics', rarity: 'epic' },
  { id: 'color_fire', name: 'Fire Coat', description: 'Blazing red-orange coat like living flames', icon: <Flame className="h-5 w-5 text-orange-500" />, costCredits: 8, category: 'cosmetics', rarity: 'epic' },
  { id: 'color_ice', name: 'Ice Coat', description: 'Crystal blue coat shimmering like ice', icon: <Snowflake className="h-5 w-5 text-cyan-400" />, costCredits: 8, category: 'cosmetics', rarity: 'epic' },
  { id: 'color_rainbow', name: 'Rainbow Spectrum', description: 'Legendary rainbow-shifting coat', icon: <Sparkles className="h-5 w-5 text-pink-500" />, costCredits: 20, category: 'cosmetics', rarity: 'legendary' },
  
  // Cosmetics - Accessories
  { id: 'acc_crown', name: 'Royal Crown', description: 'A golden crown for your champion', icon: <Crown className="h-5 w-5 text-yellow-500" />, costCredits: 12, category: 'cosmetics', rarity: 'legendary' },
  { id: 'acc_armor', name: 'Champion Armor', description: 'Decorative racing armor', icon: <Shield className="h-5 w-5 text-blue-500" />, costCredits: 10, category: 'cosmetics', rarity: 'epic' },
  { id: 'acc_wings', name: 'Ethereal Wings', description: 'Glowing ethereal wing effects', icon: <Sparkles className="h-5 w-5 text-purple-400" />, costCredits: 16, category: 'cosmetics', rarity: 'legendary' },
  
  // Stat Boosters
  { id: 'boost_speed_small', name: 'Speed Tonic', description: '+5 permanent speed boost', icon: <Zap className="h-5 w-5 text-yellow-500" />, costCredits: 4, category: 'boosters', rarity: 'common', statBoost: { speed: 5 } },
  { id: 'boost_speed_medium', name: 'Speed Elixir', description: '+10 permanent speed boost', icon: <Zap className="h-5 w-5 text-yellow-500" />, costCredits: 10, category: 'boosters', rarity: 'rare', statBoost: { speed: 10 } },
  { id: 'boost_speed_large', name: 'Speed Mastery', description: '+20 permanent speed boost', icon: <Zap className="h-5 w-5 text-yellow-500" />, costCredits: 6, category: 'boosters', rarity: 'epic', statBoost: { speed: 20 } },
  
  { id: 'boost_stamina_small', name: 'Stamina Tonic', description: '+5 permanent stamina boost', icon: <Heart className="h-5 w-5 text-red-500" />, costCredits: 4, category: 'boosters', rarity: 'common', statBoost: { stamina: 5 } },
  { id: 'boost_stamina_medium', name: 'Stamina Elixir', description: '+10 permanent stamina boost', icon: <Heart className="h-5 w-5 text-red-500" />, costCredits: 10, category: 'boosters', rarity: 'rare', statBoost: { stamina: 10 } },
  { id: 'boost_stamina_large', name: 'Stamina Mastery', description: '+20 permanent stamina boost', icon: <Heart className="h-5 w-5 text-red-500" />, costCredits: 6, category: 'boosters', rarity: 'epic', statBoost: { stamina: 20 } },
  
  { id: 'boost_accel_small', name: 'Acceleration Tonic', description: '+5 permanent acceleration boost', icon: <Flame className="h-5 w-5 text-orange-500" />, costCredits: 4, category: 'boosters', rarity: 'common', statBoost: { acceleration: 5 } },
  { id: 'boost_accel_medium', name: 'Acceleration Elixir', description: '+10 permanent acceleration boost', icon: <Flame className="h-5 w-5 text-orange-500" />, costCredits: 10, category: 'boosters', rarity: 'rare', statBoost: { acceleration: 10 } },
  { id: 'boost_accel_large', name: 'Acceleration Mastery', description: '+20 permanent acceleration boost', icon: <Flame className="h-5 w-5 text-orange-500" />, costCredits: 6, category: 'boosters', rarity: 'epic', statBoost: { acceleration: 20 } },
  
  { id: 'boost_all_small', name: 'Universal Tonic', description: '+3 to all stats', icon: <Star className="h-5 w-5 text-purple-500" />, costCredits: 8, category: 'boosters', rarity: 'rare', statBoost: { speed: 3, stamina: 3, acceleration: 3, temperament: 3 } },
  { id: 'boost_all_medium', name: 'Universal Elixir', description: '+7 to all stats', icon: <Star className="h-5 w-5 text-purple-500" />, costCredits: 8, category: 'boosters', rarity: 'epic', statBoost: { speed: 7, stamina: 7, acceleration: 7, temperament: 7 } },
  { id: 'boost_all_large', name: 'Universal Mastery', description: '+15 to all stats', icon: <Star className="h-5 w-5 text-purple-500" />, costCredits: 20, category: 'boosters', rarity: 'legendary', statBoost: { speed: 15, stamina: 15, acceleration: 15, temperament: 15 } },
  
  // Equipment
  { id: 'equip_saddle_bronze', name: 'Bronze Racing Saddle', description: '+5% race performance', icon: <Award className="h-5 w-5 text-amber-700" />, costCredits: 6, category: 'equipment', rarity: 'common' },
  { id: 'equip_saddle_silver', name: 'Silver Racing Saddle', description: '+10% race performance', icon: <Award className="h-5 w-5 text-gray-400" />, costCredits: 12, category: 'equipment', rarity: 'rare' },
  { id: 'equip_saddle_gold', name: 'Gold Racing Saddle', description: '+15% race performance', icon: <Award className="h-5 w-5 text-yellow-500" />, costCredits: 10, category: 'equipment', rarity: 'epic' },
  { id: 'equip_saddle_diamond', name: 'Diamond Racing Saddle', description: '+25% race performance', icon: <Award className="h-5 w-5 text-cyan-400" />, costCredits: 24, category: 'equipment', rarity: 'legendary' },
  
  { id: 'equip_horseshoe_iron', name: 'Iron Horseshoes', description: '+3 speed during races', icon: <Zap className="h-5 w-5 text-gray-500" />, costCredits: 5, category: 'equipment', rarity: 'common' },
  { id: 'equip_horseshoe_steel', name: 'Steel Horseshoes', description: '+6 speed during races', icon: <Zap className="h-5 w-5 text-gray-400" />, costCredits: 10, category: 'equipment', rarity: 'rare' },
  { id: 'equip_horseshoe_titanium', name: 'Titanium Horseshoes', description: '+10 speed during races', icon: <Zap className="h-5 w-5 text-blue-400" />, costCredits: 8, category: 'equipment', rarity: 'epic' },
  { id: 'equip_horseshoe_mythril', name: 'Mythril Horseshoes', description: '+15 speed during races', icon: <Zap className="h-5 w-5 text-purple-400" />, costCredits: 18, category: 'equipment', rarity: 'legendary' },
  
  { id: 'equip_bridle_basic', name: 'Racing Bridle', description: '+5 temperament control', icon: <Shield className="h-5 w-5 text-brown-500" />, costCredits: 4, category: 'equipment', rarity: 'common' },
  { id: 'equip_bridle_elite', name: 'Elite Racing Bridle', description: '+10 temperament control', icon: <Shield className="h-5 w-5 text-blue-500" />, costCredits: 9, category: 'equipment', rarity: 'rare' },
  { id: 'equip_bridle_champion', name: 'Champion Bridle', description: '+15 temperament control', icon: <Shield className="h-5 w-5 text-purple-500" />, costCredits: 7, category: 'equipment', rarity: 'epic' },
  
  // Premium Items
  { id: 'premium_xp_boost', name: 'XP Multiplier (24h)', description: 'Double XP for 24 hours', icon: <Star className="h-5 w-5 text-yellow-500" />, costCredits: 4, category: 'premium', rarity: 'rare' },
  { id: 'premium_xp_boost_week', name: 'XP Multiplier (7 days)', description: 'Double XP for 7 days', icon: <Star className="h-5 w-5 text-yellow-500" />, costCredits: 20, category: 'premium', rarity: 'epic' },
  { id: 'premium_lucky_charm', name: 'Lucky Charm', description: '+10% chance to win races', icon: <Sparkles className="h-5 w-5 text-emerald-700" />, costCredits: 12, category: 'premium', rarity: 'epic' },
  { id: 'premium_vip_pass', name: 'VIP Racing Pass', description: 'Access to exclusive VIP races for 30 days', icon: <Crown className="h-5 w-5 text-yellow-500" />, costCredits: 32, category: 'premium', rarity: 'legendary' },
  { id: 'premium_breeding_boost', name: 'Breeding Enhancer', description: 'Higher stat offspring chance', icon: <Heart className="h-5 w-5 text-pink-500" />, costCredits: 16, category: 'premium', rarity: 'epic' },
  { id: 'premium_training_master', name: 'Training Master', description: 'Double training stat gains for 7 days', icon: <Trophy className="h-5 w-5 text-amber-700" />, costCredits: 14, category: 'premium', rarity: 'epic' },
  { id: 'premium_stable_expand', name: 'Stable Expansion', description: '+5 horse capacity permanently', icon: <Award className="h-5 w-5 text-blue-500" />, costCredits: 24, category: 'premium', rarity: 'legendary' },
  
  // Mystery Boxes
  { id: 'mystery_bronze', name: 'Bronze Mystery Box', description: 'Contains random common items', icon: <Gift className="h-5 w-5 text-amber-700" />, costCredits: 3, category: 'mystery', rarity: 'common' },
  { id: 'mystery_silver', name: 'Silver Mystery Box', description: 'Contains random rare items', icon: <Gift className="h-5 w-5 text-gray-400" />, costCredits: 7, category: 'mystery', rarity: 'rare' },
  { id: 'mystery_gold', name: 'Gold Mystery Box', description: 'Contains random epic items', icon: <Gift className="h-5 w-5 text-yellow-500" />, costCredits: 4, category: 'mystery', rarity: 'epic' },
  { id: 'mystery_diamond', name: 'Diamond Mystery Box', description: 'Contains random legendary items', icon: <Gift className="h-5 w-5 text-cyan-400" />, costCredits: 12, category: 'mystery', rarity: 'legendary' },
  { id: 'mystery_champion', name: 'Champion Mystery Box', description: 'Guaranteed legendary item!', icon: <Gift className="h-5 w-5 text-purple-500" />, costCredits: 30, category: 'mystery', rarity: 'legendary' },
  { id: 'mystery_ultimate', name: 'Ultimate Mystery Box', description: 'Contains 3 random legendary items!', icon: <Gift className="h-5 w-5 text-pink-500" />, costCredits: 60, category: 'mystery', rarity: 'legendary' },

  // ===== Extended catalogue: high-end tiers (up to ~1000 EUR in credits) =====

  // Cosmetics
  { id: 'color_emerald', name: 'Emerald Sheen Coat', description: 'Deep green coat with a metallic emerald sheen', icon: <Sparkles className="h-5 w-5 text-emerald-600" />, costCredits: 14, category: 'cosmetics', rarity: 'epic' },
  { id: 'color_galaxy', name: 'Galaxy Nebula Coat', description: 'Star-flecked cosmic coat that shifts with the light', icon: <Star className="h-5 w-5 text-indigo-500" />, costCredits: 45, category: 'cosmetics', rarity: 'legendary' },
  { id: 'acc_mane_aurora', name: 'Aurora Mane', description: 'Flowing mane glowing in aurora colours', icon: <Sparkles className="h-5 w-5 text-cyan-400" />, costCredits: 90, category: 'cosmetics', rarity: 'legendary' },
  { id: 'acc_solar_halo', name: 'Solar Halo', description: 'Radiant solar halo trailing behind every stride', icon: <Sun className="h-5 w-5 text-amber-500" />, costCredits: 320, category: 'cosmetics', rarity: 'mythic' },
  { id: 'acc_celestial_regalia', name: 'Celestial Regalia', description: 'Full mythic ceremonial regalia — the rarest look in the stable', icon: <Crown className="h-5 w-5 text-yellow-500" />, costCredits: 1200, category: 'cosmetics', rarity: 'mythic' },

  // Boosters
  { id: 'boost_temperament_medium', name: 'Composure Elixir', description: '+10 permanent temperament boost', icon: <Heart className="h-5 w-5 text-pink-500" />, costCredits: 10, category: 'boosters', rarity: 'rare', statBoost: { temperament: 10 } },
  { id: 'boost_temperament_large', name: 'Composure Mastery', description: '+20 permanent temperament boost', icon: <Heart className="h-5 w-5 text-pink-500" />, costCredits: 22, category: 'boosters', rarity: 'epic', statBoost: { temperament: 20 } },
  { id: 'boost_all_grand', name: 'Grand Universal Serum', description: '+25 to all stats', icon: <Star className="h-5 w-5 text-purple-500" />, costCredits: 150, category: 'boosters', rarity: 'legendary', statBoost: { speed: 25, stamina: 25, acceleration: 25, temperament: 25 } },
  { id: 'boost_all_titan', name: 'Titan Bloodline Serum', description: '+40 to all stats', icon: <Trophy className="h-5 w-5 text-amber-600" />, costCredits: 600, category: 'boosters', rarity: 'mythic', statBoost: { speed: 40, stamina: 40, acceleration: 40, temperament: 40 } },
  { id: 'boost_all_apex', name: 'Apex Genome Infusion', description: 'Maxes out every stat (+60 to all)', icon: <Zap className="h-5 w-5 text-yellow-500" />, costCredits: 2400, category: 'boosters', rarity: 'mythic', statBoost: { speed: 60, stamina: 60, acceleration: 60, temperament: 60 } },

  // Equipment
  { id: 'equip_bridle_royal', name: 'Royal Sovereign Bridle', description: '+20 temperament control', icon: <Shield className="h-5 w-5 text-yellow-500" />, costCredits: 40, category: 'equipment', rarity: 'legendary' },
  { id: 'equip_saddle_platinum', name: 'Platinum Grand Prix Saddle', description: '+35% race performance', icon: <Award className="h-5 w-5 text-slate-400" />, costCredits: 120, category: 'equipment', rarity: 'legendary' },
  { id: 'equip_horseshoe_obsidian', name: 'Obsidian Horseshoes', description: '+22 speed during races', icon: <Zap className="h-5 w-5 text-slate-700" />, costCredits: 260, category: 'equipment', rarity: 'mythic' },
  { id: 'equip_blanket_dragonweave', name: 'Dragonweave Race Blanket', description: '+30% stamina retention on long tracks', icon: <Flame className="h-5 w-5 text-red-600" />, costCredits: 700, category: 'equipment', rarity: 'mythic' },
  { id: 'equip_saddle_aureum', name: 'Aureum Crown Saddle', description: 'The ultimate mythic saddle — +60% race performance', icon: <Crown className="h-5 w-5 text-amber-500" />, costCredits: 4800, category: 'equipment', rarity: 'mythic' },

  // Premium
  { id: 'premium_lucky_charm_plus', name: 'Greater Lucky Charm', description: '+20% chance to win races', icon: <Sparkles className="h-5 w-5 text-emerald-700" />, costCredits: 55, category: 'premium', rarity: 'legendary' },
  { id: 'premium_vip_season', name: 'VIP Season Pass', description: 'Exclusive VIP races for a full season (90 days)', icon: <Crown className="h-5 w-5 text-yellow-500" />, costCredits: 180, category: 'premium', rarity: 'legendary' },
  { id: 'premium_stable_empire', name: 'Stable Empire License', description: '+25 horse capacity permanently', icon: <Award className="h-5 w-5 text-blue-500" />, costCredits: 450, category: 'premium', rarity: 'mythic' },
  { id: 'premium_bloodline_vault', name: 'Bloodline Vault', description: 'Guaranteed elite-stat offspring on every breeding for 30 days', icon: <Heart className="h-5 w-5 text-pink-500" />, costCredits: 900, category: 'premium', rarity: 'mythic' },
  { id: 'premium_dynasty', name: 'Dynasty Ownership', description: 'Lifetime VIP access, doubled XP and priority race entries', icon: <Trophy className="h-5 w-5 text-amber-600" />, costCredits: 4800, category: 'premium', rarity: 'mythic' },

  // Mystery
  { id: 'mystery_mythic', name: 'Mythic Mystery Vault', description: 'Contains 5 random items with a mythic chance', icon: <Gift className="h-5 w-5 text-fuchsia-500" />, costCredits: 140, category: 'mystery', rarity: 'mythic' },
  { id: 'mystery_titan', name: 'Titan Mystery Vault', description: 'Guaranteed mythic item plus 3 legendary items', icon: <Gift className="h-5 w-5 text-amber-500" />, costCredits: 480, category: 'mystery', rarity: 'mythic' },
  { id: 'mystery_dynasty', name: 'Dynasty Mystery Vault', description: 'The grand vault — 10 items, 2 guaranteed mythic', icon: <Gift className="h-5 w-5 text-rose-500" />, costCredits: 1800, category: 'mystery', rarity: 'mythic' },
  { id: 'mystery_legend_forge', name: 'Legend Forge Vault', description: 'Ultimate vault — a full mythic equipment set for one horse', icon: <Gift className="h-5 w-5 text-yellow-600" />, costCredits: 4800, category: 'mystery', rarity: 'mythic' },
];

const rarityColors = { common: 'bg-amber-200',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500',
  mythic: 'bg-gradient-to-r from-fuchsia-600 via-rose-500 to-amber-500 text-white' };


export const HorseShop = () => {
  const { horses } = useUserHorses();
  const { currency } = useHorseCurrency();
  const purchaseItem = usePurchaseShopItem();
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [selectedHorse, setSelectedHorse] = useState("");
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const handlePurchase = (item: ShopItem) => {
    setSelectedItem(item);
    if (item.statBoost || item.category === 'cosmetics') {
      setShowPurchaseDialog(true);
    } else {
      confirmPurchase(item, "");
    }
  };

  const confirmPurchase = (item: ShopItem, horseId: string) => {
    if (!currency) {
      toast.error("Please log in to purchase items");
      return;
    }

    if (currency.credits < item.costCredits) {
      toast.error(`Not enough credits — this costs ${item.costCredits}.`);
      return;
    }

    purchaseItem.mutate({ itemId: item.id,
      horseId: horseId || undefined,
      costCredits: item.costCredits,
      statBoost: item.statBoost }, {
      onSuccess: () => {
        setShowPurchaseDialog(false);
        setSelectedHorse("");
        setSelectedItem(null);
      }
    });
  };

  const renderShopItem = (item: ShopItem) => (
    <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-2">
          <div className="p-2 bg-muted rounded-lg">
            {item.icon}
          </div>
          {item.rarity && (
            <Badge className={`${rarityColors[item.rarity]} text-slate-900 text-xs`}>
              {item.rarity}
            </Badge>
          )}
        </div>
        <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
        <p className="text-xs text-muted-foreground mb-3 flex-1">{item.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1">
            <span className="flex items-center text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary mr-1" />
              {item.costCredits} credits
            </span>
          </div>
          <Button 
            size="sm" 
            onClick={() => handlePurchase(item)}
            disabled={purchaseItem.isPending}
          >
            Buy
          </Button>
        </div>
      </div>
    </Card>
  );

  const categories = [
    { id: 'cosmetics', label: 'Cosmetics', icon: <Palette className="h-4 w-4" /> },
    { id: 'boosters', label: 'Boosters', icon: <Zap className="h-4 w-4" /> },
    { id: 'equipment', label: 'Equipment', icon: <Shield className="h-4 w-4" /> },
    { id: 'premium', label: 'Premium', icon: <Crown className="h-4 w-4" /> },
    { id: 'mystery', label: 'Mystery', icon: <Gift className="h-4 w-4" /> },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Horse Shop - How it works"} steps={[{ title: 'Open', desc: 'Access the Horse Shop section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Horse Shop.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Racing Shop</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Enhance your horses with cosmetics, boosters, and premium items!
        </p>

        {currency && (
          <div className="flex gap-4 mb-6 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">{currency.credits} AI Credits</span>
            </div>
          </div>
        )}

        <Tabs defaultValue="cosmetics" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto gap-1 p-1 mb-4">
            {categories.map((cat) => (
              <TabsTrigger 
                key={cat.id} 
                value={cat.id}
                className="text-xs sm:text-sm py-2 flex items-center gap-1"
              >
                {cat.icon}
                <span className="hidden sm:inline">{cat.label}</span>
                <span className="sm:hidden">{cat.label.slice(0, 4)}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.id} value={cat.id}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {shopItems
                  .filter((item) => item.category === cat.id)
                  .map(renderShopItem)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Horse for {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Horse</Label>
              <Select value={selectedHorse} onValueChange={setSelectedHorse}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a horse" />
                </SelectTrigger>
                <SelectContent>
                  {horses?.map((horse) => (
                    <SelectItem key={horse.id} value={horse.id}>
                      {horse.name} (Lvl {horse.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedItem && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {selectedItem.icon}
                  <span className="font-semibold">{selectedItem.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                {selectedItem.statBoost && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Effects:</span>
                    <ul className="list-disc list-inside">
                      {selectedItem.statBoost.speed && <li>Speed +{selectedItem.statBoost.speed}</li>}
                      {selectedItem.statBoost.stamina && <li>Stamina +{selectedItem.statBoost.stamina}</li>}
                      {selectedItem.statBoost.acceleration && <li>Acceleration +{selectedItem.statBoost.acceleration}</li>}
                      {selectedItem.statBoost.temperament && <li>Temperament +{selectedItem.statBoost.temperament}</li>}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <Button 
              onClick={() => selectedItem && confirmPurchase(selectedItem, selectedHorse)} 
              className="w-full" 
              disabled={!selectedHorse || purchaseItem.isPending}
            >
              {purchaseItem.isPending ? "Processing..." : (
                <>
                  Confirm Purchase - {selectedItem?.costCredits} credits
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};
