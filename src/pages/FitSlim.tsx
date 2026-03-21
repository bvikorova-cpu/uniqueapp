import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Clock, ChefHat, Heart, Dumbbell, Target, Loader2, Crown, Check, Utensils, Calendar, ArrowRight, Scale, Ruler, User, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Video thumbnails - weight loss
import hiitWorkout from "@/assets/videos/hiit-workout.jpg";
import cardioBeginners from "@/assets/videos/cardio-beginners.jpg";
import fullBodyBurn from "@/assets/videos/full-body-burn.jpg";
import tabataTraining from "@/assets/videos/tabata-training.jpg";
import bellyWorkout from "@/assets/videos/belly-workout.jpg";
import bodyweightTraining from "@/assets/videos/bodyweight-training.jpg";
import jumpingJacks from "@/assets/videos/jumping-jacks.jpg";
import cardioDance from "@/assets/videos/cardio-dance.jpg";
import thighsGlutes from "@/assets/videos/thighs-glutes.jpg";
import morningBoost from "@/assets/videos/morning-boost.jpg";
import plankChallenge from "@/assets/videos/plank-challenge.jpg";

// Video thumbnails - health
import morningYoga from "@/assets/videos/morning-yoga.jpg";
import backStretching from "@/assets/videos/back-stretching.jpg";
import meditation from "@/assets/videos/meditation.jpg";
import pilates from "@/assets/videos/pilates.jpg";
import kneeRehab from "@/assets/videos/knee-rehab.jpg";
import shoulderMobility from "@/assets/videos/shoulder-mobility.jpg";
import taiChi from "@/assets/videos/tai-chi.jpg";
import foamRolling from "@/assets/videos/foam-rolling.jpg";
import postureExercises from "@/assets/videos/posture-exercises.jpg";
import eveningStretch from "@/assets/videos/evening-stretch.jpg";
import hipExercises from "@/assets/videos/hip-exercises.jpg";
import yinYoga from "@/assets/videos/yin-yoga.jpg";
import mindfulness from "@/assets/videos/mindfulness.jpg";
import carpalTunnel from "@/assets/videos/carpal-tunnel.jpg";
import officeYoga from "@/assets/videos/office-yoga.jpg";

// Recipe images
import quinoaRoastedVegetables from "@/assets/recipes/quinoa-roasted-vegetables.jpg";
import bakedCodLemon from "@/assets/recipes/baked-cod-lemon.jpg";
import cabbageSaladTurkey from "@/assets/recipes/cabbage-salad-turkey.jpg";
import tofuBrownRiceBowl from "@/assets/recipes/tofu-brown-rice-bowl.jpg";
import tunaAvocado from "@/assets/recipes/tuna-avocado.jpg";
import oatmealFruit from "@/assets/recipes/oatmeal-fruit.jpg";
import greekYogurtNutsHoney from "@/assets/recipes/greek-yogurt-nuts-honey.jpg";
import smoothieBowlChia from "@/assets/recipes/smoothie-bowl-chia.jpg";
import sweetPotatoBlackBeans from "@/assets/recipes/sweet-potato-black-beans.jpg";
import greenDetoxSmoothie from "@/assets/recipes/green-detox-smoothie.jpg";

interface FitRecipe {
  id: number;
  title: string;
  calories: string;
  protein?: string;
  benefit?: string;
  time: string;
  image: string;
  ingredients: string[];
  instructions: string;
}

interface ProfileData {
  age: string;
  gender: string;
  height_cm: string;
  weight_kg: string;
  target_weight_kg: string;
  activity_level: string;
  fitness_goal: string;
  dietary_restrictions: string[];
  health_conditions: string[];
}

const FITSLIM_PLANS = {
  weekly: { price: "€10", days: 7, label: "7-Day Plan", description: "Perfect for a quick start" },
  monthly: { price: "€35", days: 30, label: "30-Day Plan", description: "Complete transformation program", popular: true },
};

const FitSlim = () => {
  const [activeTab, setActiveTab] = useState("personalized-plans");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<FitRecipe | null>(null);
  const [selectedPlanType, setSelectedPlanType] = useState<"weekly" | "monthly">("monthly");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [myPlans, setMyPlans] = useState<any[]>([]);
  const [viewingPlan, setViewingPlan] = useState<any>(null);
  const [viewingPlanDetails, setViewingPlanDetails] = useState<any>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    target_weight_kg: "",
    activity_level: "",
    fitness_goal: "",
    dietary_restrictions: [],
    health_conditions: [],
  });

  // Check for payment success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planId = params.get("plan_id");
    const success = params.get("success");

    if (success === "true" && planId) {
      window.history.replaceState({}, "", "/fit-slim");
      verifyAndGenerate(planId);
    }

    loadMyPlans();
  }, []);

  const loadMyPlans = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("fitness_plans" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setMyPlans(data as any[]);
  };

  const verifyAndGenerate = async (planId: string) => {
    setIsGenerating(true);
    try {
      // Verify payment
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-fitslim-payment", {
        body: { plan_id: planId },
      });

      if (verifyError) throw verifyError;
      if (!verifyData.verified) {
        toast({ title: "Payment not verified", description: "Please try again.", variant: "destructive" });
        return;
      }

      toast({ title: "Payment verified! ✅", description: "Generating your personalized plan... This may take a minute." });

      // Generate plan
      const { data: genData, error: genError } = await supabase.functions.invoke("generate-fitness-plan", {
        body: { plan_id: planId },
      });

      if (genError) throw genError;

      toast({ title: "Plan generated! 🎉", description: "Your personalized fitness plan is ready!" });
      setViewingPlan(genData.plan);
      setViewingPlanDetails(genData.details);
      loadMyPlans();
    } catch (error: any) {
      console.error("Error:", error);
      toast({ title: "Error", description: error.message || "Failed to generate plan", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckout = async () => {
    if (!profileData.age || !profileData.gender || !profileData.height_cm || !profileData.weight_kg || !profileData.activity_level || !profileData.fitness_goal) {
      toast({ title: "Fill all required fields", description: "Please complete your profile for a personalized plan.", variant: "destructive" });
      return;
    }

    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-fitslim-checkout", {
        body: {
          planType: selectedPlanType,
          profileData: {
            ...profileData,
            age: parseInt(profileData.age),
            height_cm: parseInt(profileData.height_cm),
            weight_kg: parseFloat(profileData.weight_kg),
            target_weight_kg: profileData.target_weight_kg ? parseFloat(profileData.target_weight_kg) : null,
          },
        },
      });

      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({ title: "Error", description: error.message || "Failed to start checkout", variant: "destructive" });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const openExistingPlan = async (plan: any) => {
    if (plan.status === "completed") {
      setViewingPlan(plan);
      setViewingPlanDetails(null);
    } else if (plan.status === "pending" && plan.payment_status === "unpaid") {
      // Try verify again
      verifyAndGenerate(plan.id);
    } else if (plan.status === "generating") {
      toast({ title: "Plan is being generated", description: "Please wait a moment..." });
    }
  };

  // =========================================================================
  // All existing video and recipe data - unchanged
  // =========================================================================
  const weightLossVideos = [
    { id: 1, title: "10-Minute HIIT Workout for Weight Loss", duration: "10 min", difficulty: "Medium", calories: "150 kcal", thumbnail: hiitWorkout, videoUrl: "https://www.youtube.com/embed/ml6cT4AZdqI?autoplay=1&rel=0" },
    { id: 2, title: "Cardio for Beginners", duration: "15 min", difficulty: "Easy", calories: "120 kcal", thumbnail: cardioBeginners, videoUrl: "https://www.youtube.com/embed/gC_L9qAHVJ8?autoplay=1&rel=0" },
    { id: 3, title: "Full Body - Fat Burning", duration: "20 min", difficulty: "Hard", calories: "250 kcal", thumbnail: fullBodyBurn, videoUrl: "https://www.youtube.com/embed/UItWltVZZmE?autoplay=1&rel=0" },
    { id: 4, title: "Tabata Training - Intense Calorie Burn", duration: "25 min", difficulty: "Hard", calories: "300 kcal", thumbnail: tabataTraining, videoUrl: "https://www.youtube.com/embed/20LH4dEeWg0?autoplay=1&rel=0" },
    { id: 5, title: "Belly Fat Loss Workout", duration: "12 min", difficulty: "Medium", calories: "100 kcal", thumbnail: bellyWorkout, videoUrl: "https://www.youtube.com/embed/1919eTCoESo?autoplay=1&rel=0" },
    { id: 6, title: "Bodyweight Training for Weight Loss", duration: "18 min", difficulty: "Medium", calories: "200 kcal", thumbnail: bodyweightTraining, videoUrl: "https://www.youtube.com/embed/cbKkB3POqaY?autoplay=1&rel=0" },
    { id: 7, title: "Jumping Jacks - Interval Training", duration: "14 min", difficulty: "Medium", calories: "180 kcal", thumbnail: jumpingJacks, videoUrl: "https://www.youtube.com/embed/2W4ZNSwoW_4?autoplay=1&rel=0" },
    { id: 8, title: "Cardio Dance - Fun Weight Loss", duration: "30 min", difficulty: "Medium", calories: "320 kcal", thumbnail: cardioDance, videoUrl: "https://www.youtube.com/embed/gCBsupdwdVw?autoplay=1&rel=0" },
    { id: 9, title: "Thighs and Glutes Training", duration: "16 min", difficulty: "Hard", calories: "220 kcal", thumbnail: thighsGlutes, videoUrl: "https://www.youtube.com/embed/SZ6IshIbWGc?autoplay=1&rel=0" },
    { id: 10, title: "Morning Metabolism Boost", duration: "8 min", difficulty: "Easy", calories: "90 kcal", thumbnail: morningBoost, videoUrl: "https://www.youtube.com/embed/3sEeVJEXTfY?autoplay=1&rel=0" },
    { id: 11, title: "Plank Challenge - Core Strengthening", duration: "10 min", difficulty: "Medium", calories: "110 kcal", thumbnail: plankChallenge, videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw?autoplay=1&rel=0" },
  ];

  const healthVideos = [
    { id: 1, title: "Morning Yoga for Energy", duration: "15 min", difficulty: "Easy", benefit: "Energy and Flexibility", thumbnail: morningYoga, videoUrl: "https://www.youtube.com/embed/v7AYKMP6rOE?autoplay=1&rel=0" },
    { id: 2, title: "Stretching for Healthy Back", duration: "10 min", difficulty: "Easy", benefit: "Pain Relief", thumbnail: backStretching, videoUrl: "https://www.youtube.com/embed/qULTwquOuT4?autoplay=1&rel=0" },
    { id: 3, title: "Meditation and Breathing Exercises", duration: "12 min", difficulty: "Easy", benefit: "Stress Reduction", thumbnail: meditation, videoUrl: "https://www.youtube.com/embed/inpok4MKVLM?autoplay=1&rel=0" },
    { id: 4, title: "Pilates for Strong Core", duration: "20 min", difficulty: "Medium", benefit: "Core Strengthening", thumbnail: pilates, videoUrl: "https://www.youtube.com/embed/K56Z12XH6WY?autoplay=1&rel=0" },
    { id: 5, title: "Knee Rehabilitation Exercises", duration: "14 min", difficulty: "Easy", benefit: "Joint Strengthening", thumbnail: kneeRehab, videoUrl: "https://www.youtube.com/embed/AXcJRHYfz5U?autoplay=1&rel=0" },
    { id: 6, title: "Shoulder and Neck Mobility", duration: "8 min", difficulty: "Easy", benefit: "Tension Relief", thumbnail: shoulderMobility, videoUrl: "https://www.youtube.com/embed/3j_jHMy5JBQ?autoplay=1&rel=0" },
    { id: 7, title: "Tai Chi for Beginners", duration: "18 min", difficulty: "Easy", benefit: "Balance and Peace", thumbnail: taiChi, videoUrl: "https://www.youtube.com/embed/6w7IS8_UzHM?autoplay=1&rel=0" },
    { id: 8, title: "Foam Rolling - Muscle Recovery", duration: "12 min", difficulty: "Easy", benefit: "Muscle Release", thumbnail: foamRolling, videoUrl: "https://www.youtube.com/embed/IlMGY5yKS4o?autoplay=1&rel=0" },
    { id: 9, title: "Posture Improvement Exercises", duration: "16 min", difficulty: "Medium", benefit: "Proper Posture", thumbnail: postureExercises, videoUrl: "https://www.youtube.com/embed/RqcOCBb4arc?autoplay=1&rel=0" },
    { id: 10, title: "Evening Relaxation Stretch", duration: "10 min", difficulty: "Easy", benefit: "Better Sleep", thumbnail: eveningStretch, videoUrl: "https://www.youtube.com/embed/ErZ_5-jC-Sg?autoplay=1&rel=0" },
    { id: 11, title: "Healthy Hip Exercises", duration: "14 min", difficulty: "Easy", benefit: "Hip Mobility", thumbnail: hipExercises, videoUrl: "https://www.youtube.com/embed/YwO4GFrqXKc?autoplay=1&rel=0" },
    { id: 12, title: "Yin Yoga - Deep Stretching", duration: "25 min", difficulty: "Easy", benefit: "Flexibility", thumbnail: yinYoga, videoUrl: "https://www.youtube.com/embed/LcnFzJZID18?autoplay=1&rel=0" },
    { id: 13, title: "Mindfulness Meditation", duration: "15 min", difficulty: "Easy", benefit: "Mental Health", thumbnail: mindfulness, videoUrl: "https://www.youtube.com/embed/ZToicYcHIOU?autoplay=1&rel=0" },
    { id: 14, title: "Carpal Tunnel Syndrome Exercises", duration: "8 min", difficulty: "Easy", benefit: "Healthy Wrists", thumbnail: carpalTunnel, videoUrl: "https://www.youtube.com/embed/fdD7CgN5FGg?autoplay=1&rel=0" },
    { id: 15, title: "Office Yoga", duration: "10 min", difficulty: "Easy", benefit: "Relief from Sitting", thumbnail: officeYoga, videoUrl: "https://www.youtube.com/embed/M-8FvC3GD8c?autoplay=1&rel=0" },
  ];

  const weightLossRecipes: FitRecipe[] = [
    {
      id: 1, title: "Seared Chicken and Quinoa Power Bowl", calories: "420 kcal", protein: "42g", time: "35 min", image: quinoaRoastedVegetables,
      ingredients: ["220g chicken breast", "90g dry quinoa", "150g zucchini", "150g red bell pepper", "10g garlic", "20ml extra virgin olive oil", "15ml fresh lemon juice", "3g sea salt", "2g freshly ground black pepper", "5g fresh parsley"],
      instructions: "1) Rinse 90g quinoa under cold water until the water runs clear, then simmer with 180ml water for 15 minutes and rest covered for 5 minutes to steam dry.\n2) Pat 220g chicken breast dry, season with 2g salt and 1g pepper, and let it sit for 5 minutes so seasoning adheres.\n3) Heat 10ml olive oil in a skillet over medium-high heat, sear chicken 5–6 minutes per side until the internal temperature reaches 74°C, then rest for 5 minutes.\n4) Dice zucchini and bell pepper into 2cm pieces, then sauté in 10ml olive oil with 10g minced garlic for 5–6 minutes until lightly caramelized.\n5) Fluff quinoa with a fork, then fold in the sautéed vegetables to distribute flavor evenly without crushing the grains.\n6) Whisk 15ml lemon juice with a pinch of salt and the remaining pepper to create a bright finishing dressing.\n7) Slice chicken across the grain, assemble bowls with quinoa and vegetables, drizzle dressing, and finish with 5g chopped parsley for freshness.",
    },
    {
      id: 2, title: "Lemon Herb Cod with Roasted Asparagus", calories: "360 kcal", protein: "38g", time: "25 min", image: bakedCodLemon,
      ingredients: ["280g cod fillet", "250g asparagus", "25ml extra virgin olive oil", "12g garlic", "1 medium lemon (60g)", "3g sea salt", "2g freshly ground black pepper", "5g fresh dill"],
      instructions: "1) Preheat the oven to 200°C and line a tray with parchment so the fish releases cleanly.\n2) Pat 280g cod completely dry, then season with 2g salt, 2g pepper, and lemon zest for a clean, bright aroma.\n3) Trim asparagus, toss with 15ml olive oil and 1g salt, and spread in a single layer to encourage roasting rather than steaming.\n4) Mix 10ml olive oil with 12g minced garlic and a squeeze of lemon juice, then brush it over the cod to concentrate flavor.\n5) Place cod beside asparagus and top with lemon slices to gently perfume the flesh as it bakes.\n6) Roast 12–15 minutes until the cod flakes easily and asparagus is tender-crisp with lightly browned tips.\n7) Finish with fresh dill and a final squeeze of lemon, then rest 2 minutes before serving for cleaner slices.",
    },
    {
      id: 3, title: "Spicy Turkey and Cabbage Skillet", calories: "390 kcal", protein: "40g", time: "22 min", image: cabbageSaladTurkey,
      ingredients: ["250g lean ground turkey", "250g napa cabbage", "80g carrot", "15ml toasted sesame oil", "20ml low-sodium soy sauce", "10g fresh ginger", "10g garlic", "3g sea salt", "2g black pepper"],
      instructions: "1) Slice 250g napa cabbage into thin ribbons and julienne 80g carrot so they cook quickly and stay crisp-tender.\n2) Heat 15ml sesame oil in a wide skillet over medium-high heat to build a toasty base flavor.\n3) Add 250g ground turkey and break it into small crumbles; cook 6–7 minutes until browned and no pink remains.\n4) Stir in 10g grated ginger and 10g minced garlic for 45 seconds until fragrant, taking care not to scorch.\n5) Add cabbage and carrot, tossing continuously for 3–4 minutes until the cabbage softens but still has bite.\n6) Pour in 20ml soy sauce, season with salt and pepper, and reduce for 60 seconds to glaze the mixture.\n7) Taste and adjust seasoning, then serve immediately; the pan heat keeps the vegetables vibrant and prevents sogginess.",
    },
    {
      id: 4, title: "Crispy Tofu Brown Rice Bowl", calories: "430 kcal", protein: "22g", time: "35 min", image: tofuBrownRiceBowl,
      ingredients: ["220g extra-firm tofu", "180g cooked brown rice", "100g edamame", "100g cucumber", "80g carrot", "30ml teriyaki sauce", "10ml toasted sesame oil", "10g sesame seeds", "10g green onions"],
      instructions: "1) Press 220g tofu for 10–15 minutes to remove water, which improves browning and texture.\n2) Cube the tofu and toss with 15ml teriyaki sauce, coating evenly without breaking the pieces.\n3) Heat 10ml sesame oil in a non-stick pan and sear tofu 3–4 minutes per side until crisp and golden.\n4) Steam 100g edamame for 3 minutes, then cool briefly so it stays bright green in the bowl.\n5) Julienne 80g carrot and slice 100g cucumber thinly for clean texture contrast.\n6) Build the bowl with 180g brown rice, arrange tofu and vegetables in sections, and drizzle remaining teriyaki sauce.\n7) Finish with 10g sesame seeds and 10g sliced green onions, then serve immediately while tofu is still crisp.",
    },
    {
      id: 5, title: "Tuna Stuffed Avocado Boats", calories: "360 kcal", protein: "30g", time: "12 min", image: tunaAvocado,
      ingredients: ["2 medium avocados (300g)", "180g canned tuna in water", "40g Greek yogurt", "15ml lime juice", "30g red onion", "3g sea salt", "2g black pepper", "5g cilantro"],
      instructions: "1) Halve the avocados, remove the pits, and scoop out 20g flesh total to widen the cavities for a stable filling.\n2) Drain 180g tuna thoroughly; removing excess water keeps the filling creamy rather than runny.\n3) Mix tuna with 40g Greek yogurt until cohesive, breaking up large flakes for a smoother bite.\n4) Add 30g finely minced red onion and 15ml lime juice to brighten the richness and sharpen flavor.\n5) Season with 3g salt and 2g pepper, tasting as you go to avoid over-salting canned fish.\n6) Spoon the tuna mixture into the avocado halves, mounding slightly so each portion feels generous.\n7) Finish with 5g chopped cilantro and an extra squeeze of lime, then serve immediately to prevent browning.",
    },
  ];

  const healthyRecipes: FitRecipe[] = [
    {
      id: 1, title: "Creamy Oatmeal with Berries and Walnuts", calories: "370 kcal", benefit: "Slow-release energy and fiber", time: "15 min", image: oatmealFruit,
      ingredients: ["80g rolled oats", "250ml milk", "15ml honey", "120g banana", "80g blueberries", "30g walnuts", "2g cinnamon", "1g sea salt"],
      instructions: "1) Bring 250ml milk to a gentle simmer so it heats evenly without scorching.\n2) Add 80g oats and reduce heat to low; stir frequently for 6–8 minutes to build a creamy texture.\n3) Stir in 1g salt and 2g cinnamon near the end so aromas stay fresh and prominent.\n4) Remove from heat and rest 2 minutes; the oats continue thickening for a spoonable finish.\n5) Slice 120g banana and fold half into the oatmeal for natural sweetness and body.\n6) Top with 80g blueberries and 30g walnuts for crunch, antioxidants, and healthy fats.\n7) Drizzle 15ml honey right before serving so it stays glossy and aromatic.",
    },
    {
      id: 2, title: "Greek Yogurt Parfait with Chia and Honey", calories: "340 kcal", benefit: "High-protein, gut-friendly probiotics", time: "8 min", image: greekYogurtNutsHoney,
      ingredients: ["220g Greek yogurt", "20g chia seeds", "20ml honey", "120g mixed berries", "30g almonds", "2g cinnamon", "10g toasted coconut"],
      instructions: "1) Spoon 220g Greek yogurt into a chilled glass so the layers stay clean and defined.\n2) Stir 20g chia seeds into half the yogurt and rest 3 minutes; this prevents dry seeds on the surface.\n3) Layer the chia-yogurt and plain yogurt to create a thicker, more luxurious mouthfeel.\n4) Add 120g mixed berries, patting them dry first so the parfait does not water out.\n5) Roughly chop 30g almonds to create varied crunch in each bite.\n6) Drizzle 20ml honey in a thin ribbon across the top for even sweetness.\n7) Finish with 2g cinnamon and 10g toasted coconut just before serving to keep the topping crisp.",
    },
    {
      id: 3, title: "Açaí Smoothie Bowl with Granola", calories: "380 kcal", benefit: "Antioxidants and satiating fiber", time: "10 min", image: smoothieBowlChia,
      ingredients: ["100g açaí puree", "120g frozen banana", "120g frozen berries", "150ml almond milk", "40g granola", "15g almond butter", "20g chia seeds", "10g coconut flakes"],
      instructions: "1) Slightly soften the 100g açaí packet under warm water for 30 seconds so it blends smoothly.\n2) Blend açaí with 120g frozen banana and 120g frozen berries, adding 150ml almond milk gradually to keep it thick.\n3) Blend 60–90 seconds, scraping down the sides to eliminate icy pockets and create a smooth base.\n4) Pour into a chilled bowl and spread flat; a level surface holds toppings neatly.\n5) Add 40g granola in a band for crunch and texture contrast.\n6) Sprinkle 20g chia seeds and 10g coconut flakes, distributing evenly so every spoonful is balanced.\n7) Drizzle 15g almond butter last for a glossy finish and richer flavor.",
    },
    {
      id: 4, title: "Baked Sweet Potato with Black Bean Salsa", calories: "410 kcal", benefit: "Fiber-rich, nutrient-dense meal", time: "45 min", image: sweetPotatoBlackBeans,
      ingredients: ["400g sweet potatoes", "200g canned black beans", "150g red bell pepper", "20g green onions", "30ml lime juice", "15ml olive oil", "2g cumin", "3g sea salt", "5g cilantro"],
      instructions: "1) Preheat the oven to 200°C and pierce 400g sweet potatoes 6–8 times so steam can escape.\n2) Bake 40–45 minutes until a knife slides in easily, indicating the starches are fully gelatinized.\n3) Drain and rinse 200g black beans to remove excess sodium and improve flavor clarity.\n4) Dice 150g bell pepper and slice 20g green onions for a crisp, fresh salsa texture.\n5) Toss beans with lime juice, 15ml olive oil, 2g cumin, 3g salt, and 5g cilantro to season thoroughly.\n6) Split the potatoes and lightly mash the interior with a fork to create a soft base for toppings.\n7) Spoon salsa over the potatoes and serve immediately while the potato is hot and the salsa stays fresh.",
    },
    {
      id: 5, title: "Green Detox Smoothie", calories: "260 kcal", benefit: "Hydration and micronutrients", time: "8 min", image: greenDetoxSmoothie,
      ingredients: ["60g spinach", "120g banana", "200ml coconut water", "20ml lemon juice", "10g ginger", "150g cucumber", "10g chia seeds", "120g ice"],
      instructions: "1) Rinse 60g spinach thoroughly; clean greens prevent any gritty texture in the finished drink.\n2) Slice 150g cucumber and 120g banana into chunks so the blender works efficiently without overheating.\n3) Add coconut water and lemon juice first to create a liquid base that pulls ingredients into the blades.\n4) Add spinach, cucumber, banana, and 10g ginger, then blend on high for 45 seconds until completely smooth.\n5) Add 120g ice and blend again to chill and slightly thicken the smoothie without diluting flavor.\n6) Stir in 10g chia seeds and let stand 2 minutes if you want a lightly gelled, more filling texture.\n7) Taste and adjust with an extra splash of lemon juice, then serve immediately for the freshest aroma.",
    },
  ];

  // =========================================================================
  // Render helper for plan viewer
  // =========================================================================
  const renderPlanViewer = (plan: any) => {
    const workout = plan.workout_plan;
    const meal = plan.meal_plan;

    return (
      <Dialog open={!!viewingPlan} onOpenChange={() => { setViewingPlan(null); setViewingPlanDetails(null); }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-400" />
              Your Personalized {plan.plan_type === "weekly" ? "7-Day" : "30-Day"} Plan
            </DialogTitle>
            <DialogDescription>
              {plan.summary || "Your AI-generated personalized fitness and nutrition plan"}
            </DialogDescription>
          </DialogHeader>

          {viewingPlanDetails && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold text-green-400">{viewingPlanDetails.daily_calories}</div>
                  <div className="text-xs text-muted-foreground">kcal/day</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-500/10 border-blue-500/30">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold text-blue-400">{viewingPlanDetails.daily_protein_g}g</div>
                  <div className="text-xs text-muted-foreground">Protein</div>
                </CardContent>
              </Card>
              <Card className="bg-yellow-500/10 border-yellow-500/30">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold text-yellow-400">{viewingPlanDetails.daily_carbs_g}g</div>
                  <div className="text-xs text-muted-foreground">Carbs</div>
                </CardContent>
              </Card>
              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold text-purple-400">{viewingPlanDetails.daily_fats_g}g</div>
                  <div className="text-xs text-muted-foreground">Fats</div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="workouts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="workouts"><Dumbbell className="h-4 w-4 mr-2" /> Workouts</TabsTrigger>
              <TabsTrigger value="meals"><Utensils className="h-4 w-4 mr-2" /> Meal Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="workouts" className="space-y-4 mt-4">
              {workout?.days?.slice(0, 7).map((day: any, i: number) => (
                <Card key={i} className="bg-card/50 border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Day {day.day}: {day.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-400">{day.duration_min} min</Badge>
                        <Badge variant="outline" className="bg-red-500/10 text-red-400">🔥 {day.calories_burned} kcal</Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {day.warmup && <p className="text-sm text-muted-foreground">🔥 Warmup: {day.warmup}</p>}
                    {day.exercises?.map((ex: any, j: number) => (
                      <div key={j} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                        <span className="font-medium">{ex.name}</span>
                        <span className="text-sm text-muted-foreground">{ex.sets}×{ex.reps} | Rest {ex.rest_sec}s</span>
                      </div>
                    ))}
                    {day.cooldown && <p className="text-sm text-muted-foreground">❄️ Cooldown: {day.cooldown}</p>}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="meals" className="space-y-4 mt-4">
              {meal?.days?.slice(0, 7).map((day: any, i: number) => (
                <Card key={i} className="bg-card/50 border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Day {day.day}</span>
                      <Badge variant="outline" className="bg-green-500/10 text-green-400">{day.total_calories} kcal</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(day.meals || {}).map(([mealName, mealData]: [string, any]) => (
                      <div key={mealName} className="p-3 rounded-lg bg-background/50 border border-border/30">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold capitalize">{mealName.replace(/([0-9])/g, " $1")}</span>
                          <span className="text-sm text-muted-foreground">{mealData.calories} kcal | {mealData.protein_g}g protein</span>
                        </div>
                        <p className="text-sm text-foreground">{mealData.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{mealData.ingredients?.join(", ")}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          {viewingPlanDetails?.tips && (
            <Card className="bg-yellow-500/10 border-yellow-500/30 mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">💡 Tips for Success</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {viewingPlanDetails.tips.map((tip: string, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-background px-6 pb-10 pt-28">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25 relative">
              <Heart className="h-10 w-10 text-white" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-400/20 to-emerald-500/20 animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                Fit & Slim Academy
              </h1>
              <p className="text-muted-foreground text-lg">Your complete fitness and wellness companion</p>
            </div>
          </div>

          {/* Stats Card */}
          <Card className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border-green-500/30 backdrop-blur-sm mb-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{weightLossVideos.length}</div>
                  <div className="text-sm text-muted-foreground">Weight Loss Videos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">{healthVideos.length}</div>
                  <div className="text-sm text-muted-foreground">Health Videos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-400">{weightLossRecipes.length}</div>
                  <div className="text-sm text-muted-foreground">Slimming Recipes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">{healthyRecipes.length}</div>
                  <div className="text-sm text-muted-foreground">Healthy Recipes</div>
                </div>
              </div>
              <p className="text-center text-muted-foreground mt-4 max-w-3xl mx-auto">
                Transform your body and mind with our curated collection of workout videos, expert-designed recipes,
                and AI-powered personalized plans.
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8 bg-card/50 backdrop-blur-sm border border-border/50 p-1">
            <TabsTrigger value="personalized-plans" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400">
              <Crown className="h-4 w-4 mr-2" />
              My Plan
            </TabsTrigger>
            <TabsTrigger value="weight-loss-videos" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <Play className="h-4 w-4 mr-2" />
              Weight Loss
            </TabsTrigger>
            <TabsTrigger value="health-videos" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <Heart className="h-4 w-4 mr-2" />
              Health
            </TabsTrigger>
            <TabsTrigger value="weight-loss-recipes" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <ChefHat className="h-4 w-4 mr-2" />
              Slimming Recipes
            </TabsTrigger>
            <TabsTrigger value="healthy-recipes" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <ChefHat className="h-4 w-4 mr-2" />
              Healthy Recipes
            </TabsTrigger>
          </TabsList>

          {/* ============= PERSONALIZED PLANS TAB ============= */}
          <TabsContent value="personalized-plans" className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                AI-Powered Personalized Weight Loss Plans
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get a custom workout routine and meal plan tailored to your body, goals, and lifestyle.
                Powered by advanced AI for professional-grade results.
              </p>
            </div>

            {/* Plan Selection */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {(Object.entries(FITSLIM_PLANS) as [string, typeof FITSLIM_PLANS.weekly][]).map(([key, plan]) => (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all duration-300 relative overflow-hidden ${
                    selectedPlanType === key
                      ? "border-green-500 shadow-lg shadow-green-500/20 bg-green-500/5"
                      : "border-border/50 hover:border-green-500/50 bg-card/50"
                  }`}
                  onClick={() => setSelectedPlanType(key as "weekly" | "monthly")}
                >
                  {(plan as any).popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      MOST POPULAR
                    </div>
                  )}
                  <CardContent className="p-6 text-center space-y-3">
                    <Calendar className="h-10 w-10 mx-auto text-green-400" />
                    <h3 className="text-xl font-bold">{plan.label}</h3>
                    <p className="text-muted-foreground text-sm">{plan.description}</p>
                    <div className="text-4xl font-bold text-green-400">{plan.price}</div>
                    <p className="text-xs text-muted-foreground">One-time payment</p>
                    <ul className="text-sm space-y-1 text-left">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> {plan.days}-day workout plan</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> {plan.days}-day meal plan</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Personalized to your body</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Macro & calorie targets</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Pro tips & guidance</li>
                    </ul>
                    {selectedPlanType === key && (
                      <Badge className="bg-green-500 text-white">Selected</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Profile Form */}
            {!showPlanForm ? (
              <div className="text-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-6 text-lg shadow-lg shadow-green-500/30"
                  onClick={() => setShowPlanForm(true)}
                >
                  <Target className="h-5 w-5 mr-2" />
                  Create My Personalized Plan
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            ) : (
              <Card className="max-w-3xl mx-auto bg-card/50 backdrop-blur-sm border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-green-400" />
                    Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Age *</Label>
                      <Input type="number" placeholder="25" value={profileData.age} onChange={(e) => setProfileData({ ...profileData, age: e.target.value })} />
                    </div>
                    <div>
                      <Label>Gender *</Label>
                      <Select value={profileData.gender} onValueChange={(v) => setProfileData({ ...profileData, gender: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="flex items-center gap-1"><Ruler className="h-3 w-3" /> Height (cm) *</Label>
                      <Input type="number" placeholder="175" value={profileData.height_cm} onChange={(e) => setProfileData({ ...profileData, height_cm: e.target.value })} />
                    </div>
                    <div>
                      <Label className="flex items-center gap-1"><Scale className="h-3 w-3" /> Current Weight (kg) *</Label>
                      <Input type="number" placeholder="80" value={profileData.weight_kg} onChange={(e) => setProfileData({ ...profileData, weight_kg: e.target.value })} />
                    </div>
                    <div>
                      <Label>Target Weight (kg)</Label>
                      <Input type="number" placeholder="70" value={profileData.target_weight_kg} onChange={(e) => setProfileData({ ...profileData, target_weight_kg: e.target.value })} />
                    </div>
                    <div>
                      <Label className="flex items-center gap-1"><Activity className="h-3 w-3" /> Activity Level *</Label>
                      <Select value={profileData.activity_level} onValueChange={(v) => setProfileData({ ...profileData, activity_level: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary (office work)</SelectItem>
                          <SelectItem value="light">Light (1-2x/week)</SelectItem>
                          <SelectItem value="moderate">Moderate (3-4x/week)</SelectItem>
                          <SelectItem value="active">Active (5-6x/week)</SelectItem>
                          <SelectItem value="very_active">Very Active (daily)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Fitness Goal *</Label>
                    <Select value={profileData.fitness_goal} onValueChange={(v) => setProfileData({ ...profileData, fitness_goal: v })}>
                      <SelectTrigger><SelectValue placeholder="Select your goal" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight_loss">Weight Loss</SelectItem>
                        <SelectItem value="fat_loss_muscle_gain">Fat Loss + Muscle Gain</SelectItem>
                        <SelectItem value="toning">Body Toning</SelectItem>
                        <SelectItem value="endurance">Improve Endurance</SelectItem>
                        <SelectItem value="general_fitness">General Fitness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Dietary Restrictions (optional)</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {["Vegetarian", "Vegan", "Gluten-Free", "Lactose-Free", "Keto", "Halal", "No Pork"].map((r) => (
                        <Badge
                          key={r}
                          variant="outline"
                          className={`cursor-pointer transition-colors ${
                            profileData.dietary_restrictions.includes(r)
                              ? "bg-green-500/20 text-green-400 border-green-500"
                              : "hover:bg-green-500/10"
                          }`}
                          onClick={() => {
                            setProfileData({
                              ...profileData,
                              dietary_restrictions: profileData.dietary_restrictions.includes(r)
                                ? profileData.dietary_restrictions.filter((x) => x !== r)
                                : [...profileData.dietary_restrictions, r],
                            });
                          }}
                        >
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Health Conditions (optional)</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {["Bad Knees", "Back Pain", "Diabetes", "High Blood Pressure", "Asthma", "Heart Condition"].map((c) => (
                        <Badge
                          key={c}
                          variant="outline"
                          className={`cursor-pointer transition-colors ${
                            profileData.health_conditions.includes(c)
                              ? "bg-orange-500/20 text-orange-400 border-orange-500"
                              : "hover:bg-orange-500/10"
                          }`}
                          onClick={() => {
                            setProfileData({
                              ...profileData,
                              health_conditions: profileData.health_conditions.includes(c)
                                ? profileData.health_conditions.filter((x) => x !== c)
                                : [...profileData.health_conditions, c],
                            });
                          }}
                        >
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-6 text-lg"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? (
                      <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Processing...</>
                    ) : (
                      <><Crown className="h-5 w-5 mr-2" /> Get My {FITSLIM_PLANS[selectedPlanType].label} — {FITSLIM_PLANS[selectedPlanType].price}</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Generating overlay */}
            {isGenerating && (
              <Card className="max-w-md mx-auto bg-card/80 backdrop-blur-xl border-green-500/30 text-center">
                <CardContent className="p-8 space-y-4">
                  <Loader2 className="h-12 w-12 mx-auto text-green-400 animate-spin" />
                  <h3 className="text-xl font-bold">Generating Your Plan...</h3>
                  <p className="text-muted-foreground text-sm">Our AI is creating a personalized workout and meal plan tailored to your profile. This may take up to a minute.</p>
                </CardContent>
              </Card>
            )}

            {/* My Plans */}
            {myPlans.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-400" />
                  My Plans
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myPlans.map((plan) => (
                    <Card
                      key={plan.id}
                      className="bg-card/50 border-border/50 hover:border-green-500/50 cursor-pointer transition-all"
                      onClick={() => openExistingPlan(plan)}
                    >
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={plan.plan_type === "monthly" ? "bg-yellow-500/10 text-yellow-400" : "bg-blue-500/10 text-blue-400"}>
                            {plan.plan_type === "monthly" ? "30-Day" : "7-Day"}
                          </Badge>
                          <Badge variant="outline" className={
                            plan.status === "completed" ? "bg-green-500/10 text-green-400" :
                            plan.status === "generating" ? "bg-yellow-500/10 text-yellow-400" :
                            plan.status === "failed" ? "bg-red-500/10 text-red-400" :
                            "bg-muted text-muted-foreground"
                          }>
                            {plan.status === "completed" ? "✅ Ready" :
                             plan.status === "generating" ? "⏳ Generating" :
                             plan.status === "failed" ? "❌ Failed" :
                             plan.payment_status === "paid" ? "Paid" : "Pending"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {plan.fitness_goal?.replace(/_/g, " ")} • {plan.activity_level}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(plan.created_at).toLocaleDateString()}
                        </p>
                        {plan.status === "completed" && (
                          <Button variant="outline" size="sm" className="w-full mt-2 border-green-500/30 text-green-400 hover:bg-green-500/10">
                            View Plan
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Weight Loss Videos */}
          <TabsContent value="weight-loss-videos" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Weight Loss Workouts</h2>
                <p className="text-muted-foreground">High-intensity training for maximum calorie burn</p>
              </div>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">🔥 Fat Burning</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weightLossVideos.map((video) => (
                <Card key={video.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-green-500/50 overflow-hidden transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-green-500/10" onClick={() => setSelectedVideo(video.videoUrl)}>
                  <div className="relative aspect-video overflow-hidden">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-green-500/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-green-500/30">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                    </div>
                    <Badge className="absolute top-3 right-3 bg-green-500/90 text-white border-0"><Clock className="h-3 w-3 mr-1" />{video.duration}</Badge>
                    <Badge className="absolute top-3 left-3 bg-red-500/90 text-white border-0">🔥 {video.calories}</Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg group-hover:text-green-400 transition-colors line-clamp-2">{video.title}</CardTitle>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`${video.difficulty === "Easy" ? "bg-green-500/10 text-green-400 border-green-500/30" : ""} ${video.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" : ""} ${video.difficulty === "Hard" ? "bg-red-500/10 text-red-400 border-red-500/30" : ""}`}>{video.difficulty}</Badge>
                      <span className="text-sm text-muted-foreground">Click to play</span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Health Videos */}
          <TabsContent value="health-videos" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Health & Wellness</h2>
                <p className="text-muted-foreground">Yoga, stretching, and mindfulness for better health</p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">💚 Wellness</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {healthVideos.map((video) => (
                <Card key={video.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-emerald-500/50 overflow-hidden transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-emerald-500/10" onClick={() => setSelectedVideo(video.videoUrl)}>
                  <div className="relative aspect-video overflow-hidden">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                    </div>
                    <Badge className="absolute top-3 right-3 bg-emerald-500/90 text-white border-0"><Clock className="h-3 w-3 mr-1" />{video.duration}</Badge>
                    <Badge className="absolute top-3 left-3 bg-teal-500/90 text-white border-0">💚 {video.benefit}</Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg group-hover:text-emerald-400 transition-colors line-clamp-2">{video.title}</CardTitle>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">{video.difficulty}</Badge>
                      <span className="text-sm text-muted-foreground">Click to play</span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Slimming Recipes */}
          <TabsContent value="weight-loss-recipes" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Slimming Recipes</h2>
                <p className="text-muted-foreground">Low-calorie, high-protein meals for weight loss</p>
              </div>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">🥗 Low Calorie</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weightLossRecipes.map((recipe) => (
                <Card key={recipe.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-orange-500/50 overflow-hidden transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-orange-500/10" onClick={() => setSelectedRecipe(recipe)}>
                  <div className="relative aspect-video overflow-hidden">
                    <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                    <Badge className="absolute top-3 right-3 bg-orange-500/90 text-white border-0"><Clock className="h-3 w-3 mr-1" />{recipe.time}</Badge>
                    <Badge className="absolute top-3 left-3 bg-red-500/90 text-white border-0">🔥 {recipe.calories}</Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg group-hover:text-orange-400 transition-colors line-clamp-2">{recipe.title}</CardTitle>
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">💪 {recipe.protein} protein</Badge>
                      <span className="text-muted-foreground">View recipe</span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Healthy Recipes */}
          <TabsContent value="healthy-recipes" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Healthy Living Recipes</h2>
                <p className="text-muted-foreground">Nutritious meals for a balanced lifestyle</p>
              </div>
              <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">🌿 Nutritious</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {healthyRecipes.map((recipe) => (
                <Card key={recipe.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-teal-500/50 overflow-hidden transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-teal-500/10" onClick={() => setSelectedRecipe(recipe)}>
                  <div className="relative aspect-video overflow-hidden">
                    <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                    <Badge className="absolute top-3 right-3 bg-teal-500/90 text-white border-0"><Clock className="h-3 w-3 mr-1" />{recipe.time}</Badge>
                    <Badge className="absolute top-3 left-3 bg-emerald-500/90 text-white border-0">🔥 {recipe.calories}</Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg group-hover:text-teal-400 transition-colors line-clamp-2">{recipe.title}</CardTitle>
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">💚 {recipe.benefit}</Badge>
                      <span className="text-muted-foreground">View recipe</span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Video Dialog */}
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-5xl p-0">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>Video Player</DialogTitle>
              <DialogDescription>Watch the workout video</DialogDescription>
            </DialogHeader>
            <div className="w-full px-6 pb-6">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                {selectedVideo && (
                  <iframe className="absolute top-0 left-0 w-full h-full rounded-lg" src={selectedVideo} title="Video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Recipe Detail Dialog */}
        <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedRecipe && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedRecipe.title}</DialogTitle>
                  <DialogDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />{selectedRecipe.time}</span>
                    <span className="text-primary font-semibold">{selectedRecipe.calories}</span>
                    {selectedRecipe.protein && <span>Protein: {selectedRecipe.protein}</span>}
                    {selectedRecipe.benefit && <span className="flex items-center"><Heart className="h-4 w-4 mr-1" />{selectedRecipe.benefit}</span>}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <img src={selectedRecipe.image} alt={selectedRecipe.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  {selectedRecipe.ingredients && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center"><ChefHat className="h-5 w-5 mr-2" />Ingredients</h3>
                      <ul className="space-y-2">
                        {selectedRecipe.ingredients.map((ingredient: string, index: number) => (
                          <li key={index} className="flex items-start"><span className="text-primary mr-2">•</span><span>{ingredient}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedRecipe.instructions && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Preparation Instructions</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-line text-muted-foreground leading-relaxed">{selectedRecipe.instructions}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Plan Viewer Dialog */}
        {viewingPlan && renderPlanViewer(viewingPlan)}
      </div>
    </div>
  );
};

export default FitSlim;
