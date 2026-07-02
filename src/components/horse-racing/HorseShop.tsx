import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, Crown, Zap, Shield, Heart, Star, Gem, Coins, 
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
  costCoins?: number;
  costGems?: number;
  category: 'cosmetics' | 'boosters' | 'equipment' | 'premium' | 'mystery';
  effect?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  statBoost?: {
    speed?: number;
    stamina?: number;
    acceleration?: number;
    temperament?: number;
  };
}

const shopItems: ShopItem[] = [
  // Cosmetics - Colors
  { id: 'color_golden', name: 'Golden Coat', description: 'Transform your horse into a majestic golden stallion', icon: <Sun className="h-5 w-5 text-yellow-500" />, costGems: 100, category: 'cosmetics', rarity: 'rare' },
  { id: 'color_silver', name: 'Silver Coat', description: 'Elegant silver coating for your champion', icon: <Moon className="h-5 w-5 text-gray-400" />, costGems: 100, category: 'cosmetics', rarity: 'rare' },
  { id: 'color_midnight', name: 'Midnight Black', description: 'Deep midnight black with a hint of starlight', icon: <Star className="h-5 w-5 text-purple-500" />, costGems: 150, category: 'cosmetics', rarity: 'epic' },
  { id: 'color_fire', name: 'Fire Coat', description: 'Blazing red-orange coat like living flames', icon: <Flame className="h-5 w-5 text-orange-500" />, costGems: 200, category: 'cosmetics', rarity: 'epic' },
  { id: 'color_ice', name: 'Ice Coat', description: 'Crystal blue coat shimmering like ice', icon: <Snowflake className="h-5 w-5 text-cyan-400" />, costGems: 200, category: 'cosmetics', rarity: 'epic' },
  { id: 'color_rainbow', name: 'Rainbow Spectrum', description: 'Legendary rainbow-shifting coat', icon: <Sparkles className="h-5 w-5 text-pink-500" />, costGems: 500, category: 'cosmetics', rarity: 'legendary' },
  
  // Cosmetics - Accessories
  { id: 'acc_crown', name: 'Royal Crown', description: 'A golden crown for your champion', icon: <Crown className="h-5 w-5 text-yellow-500" />, costGems: 300, category: 'cosmetics', rarity: 'legendary' },
  { id: 'acc_armor', name: 'Champion Armor', description: 'Decorative racing armor', icon: <Shield className="h-5 w-5 text-blue-500" />, costGems: 250, category: 'cosmetics', rarity: 'epic' },
  { id: 'acc_wings', name: 'Ethereal Wings', description: 'Glowing ethereal wing effects', icon: <Sparkles className="h-5 w-5 text-purple-400" />, costGems: 400, category: 'cosmetics', rarity: 'legendary' },
  
  // Stat Boosters
  { id: 'boost_speed_small', name: 'Speed Tonic', description: '+5 permanent speed boost', icon: <Zap className="h-5 w-5 text-yellow-500" />, costCoins: 200, category: 'boosters', rarity: 'common', statBoost: { speed: 5 } },
  { id: 'boost_speed_medium', name: 'Speed Elixir', description: '+10 permanent speed boost', icon: <Zap className="h-5 w-5 text-yellow-500" />, costCoins: 500, category: 'boosters', rarity: 'rare', statBoost: { speed: 10 } },
  { id: 'boost_speed_large', name: 'Speed Mastery', description: '+20 permanent speed boost', icon: <Zap className="h-5 w-5 text-yellow-500" />, costGems: 150, category: 'boosters', rarity: 'epic', statBoost: { speed: 20 } },
  
  { id: 'boost_stamina_small', name: 'Stamina Tonic', description: '+5 permanent stamina boost', icon: <Heart className="h-5 w-5 text-red-500" />, costCoins: 200, category: 'boosters', rarity: 'common', statBoost: { stamina: 5 } },
  { id: 'boost_stamina_medium', name: 'Stamina Elixir', description: '+10 permanent stamina boost', icon: <Heart className="h-5 w-5 text-red-500" />, costCoins: 500, category: 'boosters', rarity: 'rare', statBoost: { stamina: 10 } },
  { id: 'boost_stamina_large', name: 'Stamina Mastery', description: '+20 permanent stamina boost', icon: <Heart className="h-5 w-5 text-red-500" />, costGems: 150, category: 'boosters', rarity: 'epic', statBoost: { stamina: 20 } },
  
  { id: 'boost_accel_small', name: 'Acceleration Tonic', description: '+5 permanent acceleration boost', icon: <Flame className="h-5 w-5 text-orange-500" />, costCoins: 200, category: 'boosters', rarity: 'common', statBoost: { acceleration: 5 } },
  { id: 'boost_accel_medium', name: 'Acceleration Elixir', description: '+10 permanent acceleration boost', icon: <Flame className="h-5 w-5 text-orange-500" />, costCoins: 500, category: 'boosters', rarity: 'rare', statBoost: { acceleration: 10 } },
  { id: 'boost_accel_large', name: 'Acceleration Mastery', description: '+20 permanent acceleration boost', icon: <Flame className="h-5 w-5 text-orange-500" />, costGems: 150, category: 'boosters', rarity: 'epic', statBoost: { acceleration: 20 } },
  
  { id: 'boost_all_small', name: 'Universal Tonic', description: '+3 to all stats', icon: <Star className="h-5 w-5 text-purple-500" />, costCoins: 400, category: 'boosters', rarity: 'rare', statBoost: { speed: 3, stamina: 3, acceleration: 3, temperament: 3 } },
  { id: 'boost_all_medium', name: 'Universal Elixir', description: '+7 to all stats', icon: <Star className="h-5 w-5 text-purple-500" />, costGems: 200, category: 'boosters', rarity: 'epic', statBoost: { speed: 7, stamina: 7, acceleration: 7, temperament: 7 } },
  { id: 'boost_all_large', name: 'Universal Mastery', description: '+15 to all stats', icon: <Star className="h-5 w-5 text-purple-500" />, costGems: 500, category: 'boosters', rarity: 'legendary', statBoost: { speed: 15, stamina: 15, acceleration: 15, temperament: 15 } },
  
  // Equipment
  { id: 'equip_saddle_bronze', name: 'Bronze Racing Saddle', description: '+5% race performance', icon: <Award className="h-5 w-5 text-amber-600" />, costCoins: 300, category: 'equipment', rarity: 'common' },
  { id: 'equip_saddle_silver', name: 'Silver Racing Saddle', description: '+10% race performance', icon: <Award className="h-5 w-5 text-gray-400" />, costCoins: 600, category: 'equipment', rarity: 'rare' },
  { id: 'equip_saddle_gold', name: 'Gold Racing Saddle', description: '+15% race performance', icon: <Award className="h-5 w-5 text-yellow-500" />, costGems: 250, category: 'equipment', rarity: 'epic' },
  { id: 'equip_saddle_diamond', name: 'Diamond Racing Saddle', description: '+25% race performance', icon: <Award className="h-5 w-5 text-cyan-400" />, costGems: 600, category: 'equipment', rarity: 'legendary' },
  
  { id: 'equip_horseshoe_iron', name: 'Iron Horseshoes', description: '+3 speed during races', icon: <Zap className="h-5 w-5 text-gray-500" />, costCoins: 250, category: 'equipment', rarity: 'common' },
  { id: 'equip_horseshoe_steel', name: 'Steel Horseshoes', description: '+6 speed during races', icon: <Zap className="h-5 w-5 text-gray-400" />, costCoins: 500, category: 'equipment', rarity: 'rare' },
  { id: 'equip_horseshoe_titanium', name: 'Titanium Horseshoes', description: '+10 speed during races', icon: <Zap className="h-5 w-5 text-blue-400" />, costGems: 200, category: 'equipment', rarity: 'epic' },
  { id: 'equip_horseshoe_mythril', name: 'Mythril Horseshoes', description: '+15 speed during races', icon: <Zap className="h-5 w-5 text-purple-400" />, costGems: 450, category: 'equipment', rarity: 'legendary' },
  
  { id: 'equip_bridle_basic', name: 'Racing Bridle', description: '+5 temperament control', icon: <Shield className="h-5 w-5 text-brown-500" />, costCoins: 200, category: 'equipment', rarity: 'common' },
  { id: 'equip_bridle_elite', name: 'Elite Racing Bridle', description: '+10 temperament control', icon: <Shield className="h-5 w-5 text-blue-500" />, costCoins: 450, category: 'equipment', rarity: 'rare' },
  { id: 'equip_bridle_champion', name: 'Champion Bridle', description: '+15 temperament control', icon: <Shield className="h-5 w-5 text-purple-500" />, costGems: 180, category: 'equipment', rarity: 'epic' },
  
  // Premium Items
  { id: 'premium_xp_boost', name: 'XP Multiplier (24h)', description: 'Double XP for 24 hours', icon: <Star className="h-5 w-5 text-yellow-500" />, costGems: 100, category: 'premium', rarity: 'rare' },
  { id: 'premium_xp_boost_week', name: 'XP Multiplier (7 days)', description: 'Double XP for 7 days', icon: <Star className="h-5 w-5 text-yellow-500" />, costGems: 500, category: 'premium', rarity: 'epic' },
  { id: 'premium_lucky_charm', name: 'Lucky Charm', description: '+10% chance to win races', icon: <Sparkles className="h-5 w-5 text-green-500" />, costGems: 300, category: 'premium', rarity: 'epic' },
  { id: 'premium_vip_pass', name: 'VIP Racing Pass', description: 'Access to exclusive VIP races for 30 days', icon: <Crown className="h-5 w-5 text-yellow-500" />, costGems: 800, category: 'premium', rarity: 'legendary' },
  { id: 'premium_breeding_boost', name: 'Breeding Enhancer', description: 'Higher stat offspring chance', icon: <Heart className="h-5 w-5 text-pink-500" />, costGems: 400, category: 'premium', rarity: 'epic' },
  { id: 'premium_training_master', name: 'Training Master', description: 'Double training stat gains for 7 days', icon: <Trophy className="h-5 w-5 text-amber-500" />, costGems: 350, category: 'premium', rarity: 'epic' },
  { id: 'premium_stable_expand', name: 'Stable Expansion', description: '+5 horse capacity permanently', icon: <Award className="h-5 w-5 text-blue-500" />, costGems: 600, category: 'premium', rarity: 'legendary' },
  
  // Mystery Boxes
  { id: 'mystery_bronze', name: 'Bronze Mystery Box', description: 'Contains random common items', icon: <Gift className="h-5 w-5 text-amber-600" />, costCoins: 150, category: 'mystery', rarity: 'common' },
  { id: 'mystery_silver', name: 'Silver Mystery Box', description: 'Contains random rare items', icon: <Gift className="h-5 w-5 text-gray-400" />, costCoins: 350, category: 'mystery', rarity: 'rare' },
  { id: 'mystery_gold', name: 'Gold Mystery Box', description: 'Contains random epic items', icon: <Gift className="h-5 w-5 text-yellow-500" />, costGems: 100, category: 'mystery', rarity: 'epic' },
  { id: 'mystery_diamond', name: 'Diamond Mystery Box', description: 'Contains random legendary items', icon: <Gift className="h-5 w-5 text-cyan-400" />, costGems: 300, category: 'mystery', rarity: 'legendary' },
  { id: 'mystery_champion', name: 'Champion Mystery Box', description: 'Guaranteed legendary item!', icon: <Gift className="h-5 w-5 text-purple-500" />, costGems: 750, category: 'mystery', rarity: 'legendary' },
  { id: 'mystery_ultimate', name: 'Ultimate Mystery Box', description: 'Contains 3 random legendary items!', icon: <Gift className="h-5 w-5 text-pink-500" />, costGems: 1500, category: 'mystery', rarity: 'legendary' },
];

const rarityColors = {
  common: 'bg-gray-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500',
};

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

    if (item.costCoins && currency.coins < item.costCoins) {
      toast.error("Insufficient coins");
      return;
    }

    if (item.costGems && currency.gems < item.costGems) {
      toast.error("Insufficient gems");
      return;
    }

    purchaseItem.mutate({
      itemId: item.id,
      horseId: horseId || undefined,
      costCoins: item.costCoins,
      costGems: item.costGems,
      statBoost: item.statBoost,
    }, {
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
            <Badge className={`${rarityColors[item.rarity]} text-white text-xs`}>
              {item.rarity}
            </Badge>
          )}
        </div>
        <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
        <p className="text-xs text-muted-foreground mb-3 flex-1">{item.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1">
            {item.costCoins && (
              <span className="flex items-center text-sm font-medium">
                <Coins className="h-4 w-4 text-yellow-500 mr-1" />
                {item.costCoins}
              </span>
            )}
            {item.costGems && (
              <span className="flex items-center text-sm font-medium">
                <Gem className="h-4 w-4 text-primary mr-1" />
                {item.costGems}
              </span>
            )}
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
              <Coins className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">{currency.coins} Coins</span>
            </div>
            <div className="flex items-center gap-2">
              <Gem className="h-5 w-5 text-primary" />
              <span className="font-semibold">{currency.gems} Gems</span>
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
                  Confirm Purchase - {selectedItem?.costCoins ? `${selectedItem.costCoins} Coins` : `${selectedItem?.costGems} Gems`}
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
