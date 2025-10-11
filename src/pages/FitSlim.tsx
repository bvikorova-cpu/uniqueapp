import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Clock, ChefHat, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import video thumbnails - weight loss
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

// Import video thumbnails - health
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

// Import recipe images
import grilledChickenSalad from "@/assets/recipes/grilled-chicken-salad.jpg";
import quinoaRoastedVegetables from "@/assets/recipes/quinoa-roasted-vegetables.jpg";
import proteinSmoothie from "@/assets/recipes/protein-smoothie.jpg";
import lentilSoup from "@/assets/recipes/lentil-soup.jpg";
import grilledSalmonBrussels from "@/assets/recipes/grilled-salmon-brussels.jpg";
import vegetableWrapHummus from "@/assets/recipes/vegetable-wrap-hummus.jpg";
import cottageCheeseVegetables from "@/assets/recipes/cottage-cheese-vegetables.jpg";
import spinachOmelette from "@/assets/recipes/spinach-omelette.jpg";
import tunaAvocado from "@/assets/recipes/tuna-avocado.jpg";
import chickenChiliBeans from "@/assets/recipes/chicken-chili-beans.jpg";
import vegetableCurryChickpeas from "@/assets/recipes/vegetable-curry-chickpeas.jpg";
import bakedCodLemon from "@/assets/recipes/baked-cod-lemon.jpg";
import tofuBrownRiceBowl from "@/assets/recipes/tofu-brown-rice-bowl.jpg";
import creamyBroccoliSoup from "@/assets/recipes/creamy-broccoli-soup.jpg";
import herbRoastedChicken from "@/assets/recipes/herb-roasted-chicken.jpg";
import lentilsTomatoesZucchini from "@/assets/recipes/lentils-tomatoes-zucchini.jpg";
import cabbageSaladTurkey from "@/assets/recipes/cabbage-salad-turkey.jpg";
import vegetableSkewersNoodles from "@/assets/recipes/vegetable-skewers-noodles.jpg";
import oatmealFruit from "@/assets/recipes/oatmeal-fruit.jpg";
import bakedSalmonBroccoli from "@/assets/recipes/baked-salmon-broccoli.jpg";
import avocadoToastEgg from "@/assets/recipes/avocado-toast-egg.jpg";
import greekYogurtNutsHoney from "@/assets/recipes/greek-yogurt-nuts-honey.jpg";
import chickenNoodleSoup from "@/assets/recipes/chicken-noodle-soup.jpg";
import smoothieBowlChia from "@/assets/recipes/smoothie-bowl-chia.jpg";
import sweetPotatoBlackBeans from "@/assets/recipes/sweet-potato-black-beans.jpg";
import tunaSaladAvocado from "@/assets/recipes/tuna-salad-avocado.jpg";
import wholeGrainPancakes from "@/assets/recipes/whole-grain-pancakes.jpg";
import tunaPokeBowl from "@/assets/recipes/tuna-poke-bowl.jpg";
import spinachQuiche from "@/assets/recipes/spinach-quiche.jpg";
import greenDetoxSmoothie from "@/assets/recipes/green-detox-smoothie.jpg";
import buddhaBowlHummus from "@/assets/recipes/buddha-bowl-hummus.jpg";
import chiaPuddingMango from "@/assets/recipes/chia-pudding-mango.jpg";

const FitSlim = () => {
  const [activeTab, setActiveTab] = useState("weight-loss-videos");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  const weightLossVideos = [
    {
      id: 1,
      title: "10-minútový HIIT tréning na chudnutie",
      duration: "10 min",
      difficulty: "Stredná",
      calories: "150 kcal",
      thumbnail: hiitWorkout,
      videoUrl: "https://www.youtube.com/embed/ml6cT4AZdqI?autoplay=1&rel=0",
    },
    {
      id: 2,
      title: "Kardio pre začiatočníkov",
      duration: "15 min",
      difficulty: "Ľahká",
      calories: "120 kcal",
      thumbnail: cardioBeginners,
      videoUrl: "https://www.youtube.com/embed/gC_L9qAHVJ8?autoplay=1&rel=0",
    },
    {
      id: 3,
      title: "Celé telo - spaľovanie tukov",
      duration: "20 min",
      difficulty: "Náročná",
      calories: "250 kcal",
      thumbnail: fullBodyBurn,
      videoUrl: "https://www.youtube.com/embed/UItWltVZZmE?autoplay=1&rel=0",
    },
    {
      id: 4,
      title: "Tabata tréning - intenzívne spaľovanie kalórií",
      duration: "25 min",
      difficulty: "Náročná",
      calories: "300 kcal",
      thumbnail: tabataTraining,
      videoUrl: "https://www.youtube.com/embed/20LH4dEeWg0?autoplay=1&rel=0",
    },
    {
      id: 5,
      title: "Cvičenie na chudnutie brucha",
      duration: "12 min",
      difficulty: "Stredná",
      calories: "100 kcal",
      thumbnail: bellyWorkout,
      videoUrl: "https://www.youtube.com/embed/1919eTCoESo?autoplay=1&rel=0",
    },
    {
      id: 6,
      title: "Bodyweight tréning na chudnutie",
      duration: "18 min",
      difficulty: "Stredná",
      calories: "200 kcal",
      thumbnail: bodyweightTraining,
      videoUrl: "https://www.youtube.com/embed/cbKkB3POqaY?autoplay=1&rel=0",
    },
    {
      id: 7,
      title: "Jumping Jacks - intervalový tréning",
      duration: "14 min",
      difficulty: "Stredná",
      calories: "180 kcal",
      thumbnail: jumpingJacks,
      videoUrl: "https://www.youtube.com/embed/2W4ZNSwoW_4?autoplay=1&rel=0",
    },
    {
      id: 8,
      title: "Cardio Dance - zábavné chudnutie",
      duration: "30 min",
      difficulty: "Stredná",
      calories: "320 kcal",
      thumbnail: cardioDance,
      videoUrl: "https://www.youtube.com/embed/gCBsupdwdVw?autoplay=1&rel=0",
    },
    {
      id: 9,
      title: "Tréning stehien a zadku",
      duration: "16 min",
      difficulty: "Náročná",
      calories: "220 kcal",
      thumbnail: thighsGlutes,
      videoUrl: "https://www.youtube.com/embed/SZ6IshIbWGc?autoplay=1&rel=0",
    },
    {
      id: 10,
      title: "Ranný metabolizmus boost",
      duration: "8 min",
      difficulty: "Ľahká",
      calories: "90 kcal",
      thumbnail: morningBoost,
      videoUrl: "https://www.youtube.com/embed/3sEeVJEXTfY?autoplay=1&rel=0",
    },
    {
      id: 11,
      title: "Plank challenge - spevnenie jadra",
      duration: "10 min",
      difficulty: "Stredná",
      calories: "110 kcal",
      thumbnail: plankChallenge,
      videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw?autoplay=1&rel=0",
    },
  ];

  const healthVideos = [
    {
      id: 1,
      title: "Ranná jóga pre energiu",
      duration: "15 min",
      difficulty: "Ľahká",
      benefit: "Energia a flexibilita",
      thumbnail: morningYoga,
      videoUrl: "https://www.youtube.com/embed/v7AYKMP6rOE?autoplay=1&rel=0",
    },
    {
      id: 2,
      title: "Strečing pre zdravý chrbát",
      duration: "10 min",
      difficulty: "Ľahká",
      benefit: "Úľava od bolesti",
      thumbnail: backStretching,
      videoUrl: "https://www.youtube.com/embed/qULTwquOuT4?autoplay=1&rel=0",
    },
    {
      id: 3,
      title: "Meditácia a dýchacie cvičenia",
      duration: "12 min",
      difficulty: "Ľahká",
      benefit: "Zníženie stresu",
      thumbnail: meditation,
      videoUrl: "https://www.youtube.com/embed/inpok4MKVLM?autoplay=1&rel=0",
    },
    {
      id: 4,
      title: "Pilates pre silné centrum tela",
      duration: "20 min",
      difficulty: "Stredná",
      benefit: "Spevnenie jadra",
      thumbnail: pilates,
      videoUrl: "https://www.youtube.com/embed/K56Z12XH6WY?autoplay=1&rel=0",
    },
    {
      id: 5,
      title: "Rehabilitačné cvičenia pre kolená",
      duration: "14 min",
      difficulty: "Ľahká",
      benefit: "Posilnenie kĺbov",
      thumbnail: kneeRehab,
      videoUrl: "https://www.youtube.com/embed/AXcJRHYfz5U?autoplay=1&rel=0",
    },
    {
      id: 6,
      title: "Mobilita ramien a krku",
      duration: "8 min",
      difficulty: "Ľahká",
      benefit: "Odstránenie napätia",
      thumbnail: shoulderMobility,
      videoUrl: "https://www.youtube.com/embed/3j_jHMy5JBQ?autoplay=1&rel=0",
    },
    {
      id: 7,
      title: "Tai Chi pre začiatočníkov",
      duration: "18 min",
      difficulty: "Ľahká",
      benefit: "Rovnováha a pokoj",
      thumbnail: taiChi,
      videoUrl: "https://www.youtube.com/embed/6w7IS8_UzHM?autoplay=1&rel=0",
    },
    {
      id: 8,
      title: "Foam rolling - regenerácia svalov",
      duration: "12 min",
      difficulty: "Ľahká",
      benefit: "Uvoľnenie svalov",
      thumbnail: foamRolling,
      videoUrl: "https://www.youtube.com/embed/IlMGY5yKS4o?autoplay=1&rel=0",
    },
    {
      id: 9,
      title: "Cvičenia na zlepšenie držania tela",
      duration: "16 min",
      difficulty: "Stredná",
      benefit: "Správne držanie",
      thumbnail: postureExercises,
      videoUrl: "https://www.youtube.com/embed/RqcOCBb4arc?autoplay=1&rel=0",
    },
    {
      id: 10,
      title: "Večerný relax strečing",
      duration: "10 min",
      difficulty: "Ľahká",
      benefit: "Lepší spánok",
      thumbnail: eveningStretch,
      videoUrl: "https://www.youtube.com/embed/ErZ_5-jC-Sg?autoplay=1&rel=0",
    },
    {
      id: 11,
      title: "Cvičenia pre zdravé bedra",
      duration: "14 min",
      difficulty: "Ľahká",
      benefit: "Mobilita bedrových kĺbov",
      thumbnail: hipExercises,
      videoUrl: "https://www.youtube.com/embed/YwO4GFrqXKc?autoplay=1&rel=0",
    },
    {
      id: 12,
      title: "Yin jóga - hlboký strečing",
      duration: "25 min",
      difficulty: "Ľahká",
      benefit: "Flexibilita",
      thumbnail: yinYoga,
      videoUrl: "https://www.youtube.com/embed/LcnFzJZID18?autoplay=1&rel=0",
    },
    {
      id: 13,
      title: "Mindfulness meditácia",
      duration: "15 min",
      difficulty: "Ľahká",
      benefit: "Mentálne zdravie",
      thumbnail: mindfulness,
      videoUrl: "https://www.youtube.com/embed/ZToicYcHIOU?autoplay=1&rel=0",
    },
    {
      id: 14,
      title: "Cvičenia na syndróm karpálneho tunela",
      duration: "8 min",
      difficulty: "Ľahká",
      benefit: "Zdravé zápästia",
      thumbnail: carpalTunnel,
      videoUrl: "https://www.youtube.com/embed/fdD7CgN5FGg?autoplay=1&rel=0",
    },
    {
      id: 15,
      title: "Office yoga - jóga v kancelárii",
      duration: "10 min",
      difficulty: "Ľahká",
      benefit: "Úľava pri sedení",
      thumbnail: officeYoga,
      videoUrl: "https://www.youtube.com/embed/M-8FvC3GD8c?autoplay=1&rel=0",
    },
  ];

  const weightLossRecipes = [
    {
      id: 1,
      title: "Zeleninový šalát s grilovaným kuracím mäsom",
      calories: "320 kcal",
      protein: "35g",
      time: "20 min",
      image: grilledChickenSalad,
      ingredients: [
        "200g kuracích pŕs",
        "100g mix zelených šalátov",
        "1 paradajka",
        "1/2 uhorky",
        "50g cherry paradajok",
        "2 lyžice olivového oleja",
        "1 lyžica citrónovej šťavy",
        "soľ, čierne korenie",
        "čerstvé bylinky podľa chuti"
      ],
      instructions: "1. Kuracie prsia okoreňte soľou a korením.\n2. Grilujte na panvici alebo grile 5-7 minút z každej strany.\n3. Zeleninu umyte a nakrájajte.\n4. V miske zmiešajte šaláty, nakrájanú paradajku, uhorku a cherry paradajky.\n5. Pripravte dresing z olivového oleja a citrónovej šťavy.\n6. Nakrájajte grilované kuracie mäso na plátky.\n7. Pridajte mäso k zelenine, polejte dresingom a posypte bylinkami."
    },
    {
      id: 2,
      title: "Quinoa s pečenou zeleninou",
      calories: "280 kcal",
      protein: "12g",
      time: "30 min",
      image: quinoaRoastedVegetables,
      ingredients: [
        "150g quinoa",
        "1 červená paprika",
        "1 cuketa",
        "1 baklažán",
        "200g cherry paradajok",
        "2 strúčiky cesnaku",
        "3 lyžice olivového oleja",
        "soľ, korenie",
        "čerstvý tymián"
      ],
      instructions: "1. Quinoa opláchnite a uvarte podľa návodu na obale (zvyčajne 15 minút).\n2. Zeleninu nakrájajte na kocky.\n3. Rozohrejte trúbu na 200°C.\n4. Zeleninu premiešajte s olivovým olejom, prelisovaným cesnakom a korením.\n5. Rozložte na plech a pečte 20-25 minút.\n6. Uvarenej quinoe pridajte pečenú zeleninu.\n7. Dochuťte čerstvým tymiánom a podávajte teplé."
    },
    {
      id: 3,
      title: "Proteinový smoothie s ovocím",
      calories: "250 kcal",
      protein: "25g",
      time: "5 min",
      image: proteinSmoothie,
      ingredients: [
        "1 banán",
        "150g zmrazených jahôd",
        "30g proteinového prášku (vanilka)",
        "200ml mandľového mléka",
        "1 lyžica chia semienok",
        "1 lyžička medu",
        "ľad podľa chuti"
      ],
      instructions: "1. Banán olúpte a rozlámte na kúsky.\n2. Do mixéra vložte banán, jahody, proteinový prášok a mandľové mléko.\n3. Pridajte chia semienka a med.\n4. Mixujte na vysokých otáčkach 1-2 minúty, kým nevznikne hladká konzistencia.\n5. Ak chcete chladnejší nápoj, pridajte ľad a znovu krátko premiešajte.\n6. Nalejte do pohára a ihneď podávajte."
    },
    {
      id: 4,
      title: "Zeleninová polievka so šošovicou",
      calories: "210 kcal",
      protein: "15g",
      time: "35 min",
      image: lentilSoup,
      ingredients: [
        "150g červenej šošovice",
        "2 mrkvy",
        "1 zeler",
        "1 cibuľa",
        "2 strúčiky cesnaku",
        "1 lyžica rajčinového pretlaku",
        "1 lyžica olivového oleja",
        "1l zeleninového vývaru",
        "soľ, korenie, rasca"
      ],
      instructions: "1. Cibuľu a cesnak nakrájajte nadrobno a opražte na olivovom oleji.\n2. Pridajte nakrájanú mrkvu a zeler, opražte 5 minút.\n3. Pridajte rajčinový pretlak a šošovicu.\n4. Zalejte zeleninovým vývarom a varte 25-30 minút.\n5. Dochuťte soľou, korením a rascou.\n6. Podľa chuti môžete polievku rozmixovať alebo nechať s kúskami zeleniny."
    },
    {
      id: 5,
      title: "Grilovaný losos s ružičkovým kelom",
      calories: "340 kcal",
      protein: "38g",
      time: "25 min",
      image: grilledSalmonBrussels,
      ingredients: [
        "200g lososa",
        "300g ružičkového kelu",
        "2 lyžice olivového oleja",
        "1 citrón",
        "2 strúčiky cesnaku",
        "soľ, čierne korenie",
        "čerstvý kôpor"
      ],
      instructions: "1. Rozohrejte trúbu na 200°C.\n2. Lososa okoreňte soľou, korením a potryte citrónom.\n3. Ružičkový kel rozrežte na polovice a premiešajte s olivovým olejom a prelisovaným cesnakom.\n4. Lososa aj ružičkový kel položte na plech vystlaný papierom na pečenie.\n5. Pečte 18-20 minút.\n6. Podávajte s čerstvým kôprom a plátkami citróna."
    },
    {
      id: 6,
      title: "Zeleninové wrap s hummusom",
      calories: "290 kcal",
      protein: "14g",
      time: "15 min",
      image: vegetableWrapHummus,
      ingredients: [
        "2 celozrnné tortilly",
        "100g hummusu",
        "1 paprika",
        "1/2 uhorky",
        "50g baby špenátu",
        "50g červenej kapusty",
        "1 mrkva",
        "citrónová šťava"
      ],
      instructions: "1. Zeleninu umyte a nakrájajte na tenké pásiky.\n2. Tortilly rozložte a natrite hummusom.\n3. Na jednu polovicu tortilly rozložte špenát a nakrájanú zeleninu.\n4. Pokvapkajte citrónovou šťavou.\n5. Tortilly pevne zabaľte do rolky.\n6. Rozrežte na polovice a podávajte."
    },
    {
      id: 7,
      title: "Cottage cheese s uhorkou a paradajkami",
      calories: "180 kcal",
      protein: "20g",
      time: "10 min",
      image: cottageCheeseVegetables,
      ingredients: [
        "200g cottage cheese",
        "1 uhorka",
        "2 paradajky",
        "jarná cibuľka",
        "čerstvý bazalka",
        "olivový olej",
        "soľ, korenie"
      ],
      instructions: "1. Uhorku a paradajky umyte a nakrájajte na kocky.\n2. Jarnú cibuľku nakrájajte na kolieska.\n3. V miske zmiešajte cottage cheese, nakrájanú zeleninu a cibuľku.\n4. Pridajte nasekanú bazalku.\n5. Ochuťte soľou, korením a kvapkou olivového oleja.\n6. Podávajte chladené."
    },
    {
      id: 8,
      title: "Vajíčková omeleta so špenátom",
      calories: "240 kcal",
      protein: "22g",
      time: "12 min",
      image: spinachOmelette,
      ingredients: [
        "3 vajcia",
        "100g čerstvého špenátu",
        "30g syra feta",
        "1 strúčik cesnaku",
        "1 lyžica olivového oleja",
        "soľ, korenie"
      ],
      instructions: "1. Vajcia rozšľahajte v miske, ochuťte soľou a korením.\n2. Špenát umyte a nakrájajte nahrubo.\n3. Na panvici rozohrejte olivový olej a opražte prelisovaný cesnak.\n4. Pridajte špenát a opražte 2 minúty.\n5. Nalejte rozšľahané vajcia a posypte rozdrobenou fetou.\n6. Pečte na miernom ohni 5-7 minút, až kým omeleta stuhne."
    },
    {
      id: 9,
      title: "Tuniakové kúsky s avokádom",
      calories: "310 kcal",
      protein: "30g",
      time: "10 min",
      image: tunaAvocado,
      ingredients: [
        "150g tuniaka v konzerve",
        "1 avokádo",
        "50g cherry paradajok",
        "citrónová šťava",
        "jarná cibuľka",
        "soľ, korenie",
        "čerstvá petržlen"
      ],
      instructions: "1. Tuniak sceďte a rozdeľte vidličkou.\n2. Avokádo rozpolte, odstráňte kôstku a nakrájajte na kocky.\n3. Cherry paradajky prekrojte na polovice.\n4. Jarnú cibuľku nakrájajte na kolieska.\n5. Všetky ingrediencie zmiešajte v miske.\n6. Ochuťte citrónovou šťavou, soľou a korením, posypte petržlenom."
    },
    {
      id: 10,
      title: "Kuracina s chilli a zelenými fazuľkami",
      calories: "295 kcal",
      protein: "32g",
      time: "22 min",
      image: chickenChiliBeans,
      ingredients: [
        "200g kuracích pŕs",
        "200g zelených fazuliek",
        "1 chilli paprika",
        "2 strúčiky cesnaku",
        "zázvor",
        "sójová omáčka",
        "sezamový olej",
        "soľ, korenie"
      ],
      instructions: "1. Kuracie mäso nakrájajte na kúsky a okoreňte.\n2. Zelené fazuľky očistite a nakrájajte.\n3. Na panvici rozohrejte sezamový olej.\n4. Opražte cesnak, zázvor a chilli.\n5. Pridajte kuracie mäso a opekajte 10 minút.\n6. Pridajte fazuľky, sójovú omáčku a duste 8 minút."
    },
    {
      id: 11,
      title: "Zeleninové kari s cícerom",
      calories: "265 kcal",
      protein: "16g",
      time: "28 min",
      image: vegetableCurryChickpeas,
      ingredients: [
        "200g cícera (konzerva)",
        "1 paprika",
        "1 cuketa",
        "1 cibuľa",
        "400ml kokosového mléka",
        "2 lyžice kari pasty",
        "špenát",
        "soľ, korenie"
      ],
      instructions: "1. Cibuľu nakrájajte a opražte na oleji.\n2. Pridajte kari pastu a opražte 1 minútu.\n3. Pridajte nakrájanú papriku a cuketu.\n4. Zalejte kokosovým mlékom a pridajte scedený cícer.\n5. Varte 15 minút na miernom ohni.\n6. Nakoniec pridajte špenát a dochuťte."
    },
    {
      id: 12,
      title: "Pečená treska s citrónom",
      calories: "260 kcal",
      protein: "34g",
      time: "20 min",
      image: bakedCodLemon,
      ingredients: [
        "200g filé z tresy",
        "1 citrón",
        "2 strúčiky cesnaku",
        "olivový olej",
        "čerstvý tymián",
        "soľ, korenie",
        "cherry paradajky"
      ],
      instructions: "1. Rozohrejte trúbu na 200°C.\n2. Tresku položte na plech, pokvapkajte olivovým olejom.\n3. Ochuťte soľou, korením, prelisovaným cesnakom a tymiánom.\n4. Pridajte plátky citróna a cherry paradajky.\n5. Pečte 15-18 minút.\n6. Podávajte s čerstvým citrónom."
    },
    {
      id: 13,
      title: "Bowl s tofu a hnedou ryžou",
      calories: "330 kcal",
      protein: "18g",
      time: "25 min",
      image: tofuBrownRiceBowl,
      ingredients: [
        "150g tofu",
        "100g hnedej ryže",
        "50g edamame",
        "1 mrkva",
        "červená kapusta",
        "avokádo",
        "sójová omáčka",
        "sezamové semienka"
      ],
      instructions: "1. Hnedú ryžu uvarte podľa návodu.\n2. Tofu nakrájajte na kocky a opečte na panvici.\n3. Mrkvu nastrúhajte, kapustu nakrájajte na pásiky.\n4. Edamame uvarte 3-4 minúty.\n5. Do misky dajte ryžu, tofu a zeleninu.\n6. Polejte sójovou omáčkou a posypte sezamom."
    },
    {
      id: 14,
      title: "Krémová polievka z brokolice",
      calories: "195 kcal",
      protein: "11g",
      time: "30 min",
      image: creamyBroccoliSoup,
      ingredients: [
        "400g brokolice",
        "1 zemiák",
        "1 cibuľa",
        "2 strúčiky cesnaku",
        "800ml zeleninového vývaru",
        "100ml smotany na varenie",
        "olivový olej",
        "soľ, korenie"
      ],
      instructions: "1. Cibuľu a cesnak opražte na oleji.\n2. Pridajte nakrájané zemiaky a brokolicu.\n3. Zalejte zeleninovým vývarom a varte 20 minút.\n4. Polievku rozmixujte na hladko.\n5. Pridajte smotanu, dochuťte soľou a korením.\n6. Podávajte s krutónmi."
    },
    {
      id: 15,
      title: "Pečené kurča s bylinkami",
      calories: "305 kcal",
      protein: "36g",
      time: "40 min",
      image: herbRoastedChicken,
      ingredients: [
        "250g kuracích stehien",
        "rozmarín, tymián",
        "3 strúčiky cesnaku",
        "olivový olej",
        "citrón",
        "soľ, korenie",
        "zemiaky"
      ],
      instructions: "1. Rozohrejte trúbu na 190°C.\n2. Kurča okoreňte soľou, korením, bylinkami a cesnakom.\n3. Pokvapkajte olivovým olejom a citrónom.\n4. Zemiaky nakrájajte na klinky a pridajte na plech.\n5. Pečte 35-40 minút, až kým nie je mäso zlatisté.\n6. Podávajte s čerstvými bylinkami."
    },
    {
      id: 16,
      title: "Čočka s paradajkami a cuketou",
      calories: "245 kcal",
      protein: "17g",
      time: "32 min",
      image: lentilsTomatoesZucchini,
      ingredients: [
        "150g zelenej čočky",
        "2 paradajky",
        "1 cuketa",
        "1 cibuľa",
        "2 strúčiky cesnaku",
        "rajčinový pretlak",
        "olivový olej",
        "soľ, korenie, rasca"
      ],
      instructions: "1. Čočku uvarte podľa návodu.\n2. Cibuľu a cesnak opražte na oleji.\n3. Pridajte nakrájanú cuketu a paradajky.\n4. Pridajte rajčinový pretlak a duste 10 minút.\n5. Pridajte uvarenú čočku a premiešajte.\n6. Dochuťte soľou, korením a rascou."
    },
    {
      id: 17,
      title: "Kapustový šalát s morčacím mäsom",
      calories: "270 kcal",
      protein: "28g",
      time: "18 min",
      image: cabbageSaladTurkey,
      ingredients: [
        "200g morčacieho mäsa",
        "200g bielej kapusty",
        "1 mrkva",
        "jarná cibuľka",
        "citrónová šťava",
        "olivový olej",
        "soľ, korenie"
      ],
      instructions: "1. Morčacie mäso nakrájajte na kúsky a opečte.\n2. Kapustu a mrkvu nastrúhajte.\n3. Jarnú cibuľku nakrájajte.\n4. Zmiešajte zeleninu s opečeným mäsom.\n5. Pripravte dresing z oleja a citrónu.\n6. Premiešajte a podávajte."
    },
    {
      id: 18,
      title: "Zeleninové špízy s ryžovými rezancami",
      calories: "285 kcal",
      protein: "13g",
      time: "24 min",
      image: vegetableSkewersNoodles,
      ingredients: [
        "150g ryžových rezancov",
        "1 paprika",
        "1 cuketa",
        "huby",
        "cherry paradajky",
        "sójová omáčka",
        "sezamový olej",
        "cesnak, zázvor"
      ],
      instructions: "1. Ryžové rezance uvarte podľa návodu.\n2. Zeleninu nakrájajte a napichnite na špízy.\n3. Grilujte alebo pečte v trúbe 15 minút.\n4. Na panvici rozohrejte sezamový olej.\n5. Pridajte cesnak, zázvor a sójovú omáčku.\n6. Premiešajte s rezancami a podávajte so špízmi."
    },
  ];

  const healthyRecipes = [
    {
      id: 1,
      title: "Ovesná kaša s čerstvým ovocím",
      calories: "350 kcal",
      benefit: "Energia na celý deň",
      time: "10 min",
      image: oatmealFruit,
      ingredients: [
        "80g ovosných vločiek",
        "250ml mléka alebo rastlinného mléka",
        "1 banán",
        "50g čučoriedok",
        "1 lyžica medu",
        "škorica",
        "orechy na posypanie"
      ],
      instructions: "1. Ovosné vločky zalejte mlékom a varte 5 minút.\n2. Pridajte med a škoricu.\n3. Nechajte mierne vychladnúť.\n4. Banán nakrájajte na kolieska.\n5. Kašu preložte do misky a ozdobte banánom, čučoriedkami a orechmi.\n6. Podávajte teplú."
    },
    {
      id: 2,
      title: "Pečený losos s brokolicou",
      calories: "420 kcal",
      benefit: "Omega-3 mastné kyseliny",
      time: "25 min",
      image: bakedSalmonBroccoli,
      ingredients: [
        "250g lososa",
        "400g brokolice",
        "3 lyžice olivového oleja",
        "2 strúčiky cesnaku",
        "citrón",
        "soľ, korenie",
        "sezamové semienka"
      ],
      instructions: "1. Rozohrejte trúbu na 200°C.\n2. Brokolicu rozdeľte na ružičky a premiešajte s polovicou oleja a cesnakom.\n3. Lososa okoreňte, potryte citrónom a olivovým olejom.\n4. Položte lososa a brokolicu na plech.\n5. Pečte 20-22 minút.\n6. Posypte sezamovými semienkami a podávajte."
    },
    {
      id: 3,
      title: "Avokádový toast s vajíčkom",
      calories: "380 kcal",
      benefit: "Zdravé tuky",
      time: "15 min",
      image: avocadoToastEgg,
      ingredients: [
        "2 plátky celozrnného chleba",
        "1 avokádo",
        "2 vajcia",
        "citrónová šťava",
        "cherry paradajky",
        "soľ, korenie",
        "čerstvá bazalka"
      ],
      instructions: "1. Chlieb opečte na hriankovači.\n2. Avokádo rozdrte vidličkou a premiešajte s citrónovou šťavou.\n3. Vajcia opražte alebo uvarte napolmäkko.\n4. Hrianky natrite avokádom.\n5. Pridajte vajce a cherry paradajky.\n6. Posypte soľou, korením a bazalkou."
    },
    {
      id: 4,
      title: "Grécky jogurt s orechmi a medom",
      calories: "310 kcal",
      benefit: "Probiotika",
      time: "5 min",
      image: greekYogurtNutsHoney,
      ingredients: [
        "200g gréckeho jogurtu",
        "30g vlašských orechov",
        "1 lyžica medu",
        "1 lyžica chia semienok",
        "čerstvé bobuľové ovocie",
        "škorica"
      ],
      instructions: "1. Grécky jogurt preložte do misky.\n2. Orechy nasekajte nahrubo.\n3. Jogurt posypte orechmi a chia semienkami.\n4. Polejte medom.\n5. Pridajte čerstvé ovocie.\n6. Posypte škoricou a podávajte."
    },
    {
      id: 5,
      title: "Kurací vývar s domácimi rezancami",
      calories: "280 kcal",
      benefit: "Posilnenie imunity",
      time: "45 min",
      image: chickenNoodleSoup,
      ingredients: [
        "300g kuracích kúskov",
        "2 mrkvy",
        "1 zeler",
        "1 cibuľa",
        "2l vody",
        "100g domácich rezancov",
        "petržlenová vňať",
        "soľ, korenie, bobkový list"
      ],
      instructions: "1. Kuracie mäso zalejte vodou a pridajte bobkový list.\n2. Varte 20 minút a zbierajte penu.\n3. Pridajte nakrájanú zeleninu a varte ďalších 15 minút.\n4. Mäso a zeleninu vyberme, vývar precedte.\n5. Do vývaru pridajte rezance a varte 5 minút.\n6. Pridajte späť mäso, dochuťte a posypte petržlenom."
    },
    {
      id: 6,
      title: "Smoothie bowl s chia semienkami",
      calories: "330 kcal",
      benefit: "Antioxidanty",
      time: "8 min",
      image: smoothieBowlChia,
      ingredients: [
        "1 zmrazený banán",
        "100g zmrazených bobuľových plodov",
        "150ml mandľového mléka",
        "1 lyžica chia semienok",
        "granola",
        "čerstvé ovocie",
        "kokosové lupienky"
      ],
      instructions: "1. Zmrazený banán, bobuľové ovocie a mléko mixujte na hladko.\n2. Smoothie nalejte do misky.\n3. Posypte chia semienkami.\n4. Pridajte granolu, čerstvé ovocie a kokosové lupienky.\n5. Ihneď podávajte.\n6. Môžete pridať aj med alebo arašidové maslo."
    },
    {
      id: 7,
      title: "Pečené sladké zemiaky s čiernou fazuľou",
      calories: "390 kcal",
      benefit: "Vláknina a vitamíny",
      time: "40 min",
      image: sweetPotatoBlackBeans,
      ingredients: [
        "2 sladké zemiaky",
        "200g čiernej fazule (konzerva)",
        "1 paprika",
        "1 avokádo",
        "jarná cibuľka",
        "limetková šťava",
        "olivový olej",
        "soľ, korenie, rasca"
      ],
      instructions: "1. Rozohrejte trúbu na 200°C.\n2. Sladké zemiaky popichnite vidličkou a pečte 35-40 minút.\n3. Papriku nakrájajte a opražte s čiernou fazuľou.\n4. Pečené zemiaky rozkrojte a naplňte zmesou fazule a papriky.\n5. Pridajte avokádo a jarnú cibuľku.\n6. Pokvapkajte limetkovou šťavou a posypte rascou."
    },
    {
      id: 8,
      title: "Tuniakový šalát s avokádom",
      calories: "360 kcal",
      benefit: "Omega-3 a bielkoviny",
      time: "12 min",
      image: tunaSaladAvocado,
      ingredients: [
        "150g tuniaka v konzerve",
        "1 avokádo",
        "50g baby šalátov",
        "cherry paradajky",
        "uhorka",
        "olivový olej",
        "citrónová šťava",
        "soľ, korenie"
      ],
      instructions: "1. Tuniak sceďte a rozdeľte.\n2. Avokádo nakrájajte na kocky.\n3. Cherry paradajky prekrojte, uhorku nakrájajte.\n4. Všetky ingrediencie zmiešajte v miske.\n5. Pripravte dresing z oleja a citrónu.\n6. Premiešajte a podávajte na šalátových lístkoch."
    },
    {
      id: 9,
      title: "Celozrnné palacinky s bobuľovým ovocím",
      calories: "340 kcal",
      benefit: "Komplexné sacharidy",
      time: "18 min",
      image: wholeGrainPancakes,
      ingredients: [
        "100g celozrnnej múky",
        "1 vajce",
        "150ml mléka",
        "1 lyžička prášku do pečiva",
        "100g čerstvých bobuľových plodov",
        "javorový sirup",
        "kokosový olej na smaženie"
      ],
      instructions: "1. Zmiešajte múku, vajce, mléko a prášok do pečiva.\n2. Nechajte cesto 5 minút odležať.\n3. Na panvici rozohrejte kokosový olej.\n4. Naberajte cesto a pečte palacinky z oboch strán.\n5. Servírujte s čerstvými bobuľami.\n6. Polejte javorovým sirupom."
    },
    {
      id: 10,
      title: "Poke bowl s tuniakom",
      calories: "410 kcal",
      benefit: "Omega-3 a minerály",
      time: "20 min",
      image: tunaPokeBowl,
      ingredients: [
        "200g čerstvého tuniaka",
        "150g sushi ryže",
        "avokádo",
        "edamame",
        "uhorka",
        "wakame riasa",
        "sójová omáčka",
        "sezamové semienka"
      ],
      instructions: "1. Sushi ryžu uvarte podľa návodu.\n2. Tuniaka nakrájajte na kocky a marinujte v sójovej omáčke.\n3. Avokádo a uhorku nakrájajte.\n4. Edamame uvarte.\n5. Do misky dajte ryžu a postupne pridajte všetky ingrediencie.\n6. Posypte sezamom a polejte zvyšnou omáčkou."
    },
    {
      id: 11,
      title: "Špenátová quiche",
      calories: "365 kcal",
      benefit: "Železo a vápnik",
      time: "50 min",
      image: spinachQuiche,
      ingredients: [
        "1 listové cesto",
        "200g čerstvého špenátu",
        "3 vajcia",
        "150ml smotany",
        "100g syra feta",
        "cibuľa",
        "soľ, korenie, muškátový oriešok"
      ],
      instructions: "1. Rozohrejte trúbu na 180°C.\n2. Listové cesto rozložte do koláčovej formy.\n3. Špenát a cibuľu opražte, nechajte vychladnúť.\n4. Zmiešajte vajcia, smotanu, soľ a korenie.\n5. Pridajte špenát a rozdrobenú fetu.\n6. Nalejte na cesto a pečte 35-40 minút."
    },
    {
      id: 12,
      title: "Zelený detox smoothie",
      calories: "220 kcal",
      benefit: "Detoxikácia",
      time: "5 min",
      image: greenDetoxSmoothie,
      ingredients: [
        "1 hrsť baby špenátu",
        "1/2 uhorky",
        "1 zelené jablko",
        "1 banán",
        "šťava z 1/2 citróna",
        "200ml kokosovej vody",
        "zázvor"
      ],
      instructions: "1. Všetky ingrediencie opláchnite.\n2. Jablko a uhorku nakrájajte.\n3. Vložte do mixéra špenát, uhorku, jablko a banán.\n4. Pridajte citrónovú šťavu, zázvor a kokosovú vodu.\n5. Mixujte 1-2 minúty na hladko.\n6. Ihneď podávajte."
    },
    {
      id: 13,
      title: "Buddha bowl s humusom",
      calories: "385 kcal",
      benefit: "Kompletný profil živín",
      time: "30 min",
      image: buddhaBowlHummus,
      ingredients: [
        "100g quinoa",
        "100g hummusu",
        "pečená tekvica",
        "pečené zemiaky",
        "baby špenát",
        "cherry paradajky",
        "tahini",
        "citrón"
      ],
      instructions: "1. Quinoa uvarte podľa návodu.\n2. Tekvicu a zemiaky nakrájajte a pečte 25 minút na 200°C.\n3. Do misky dajte quinoa ako základ.\n4. Postupne pridajte pečenú zeleninu, špenát a paradajky.\n5. Pridajte hummus.\n6. Polejte tahini a citrónovou šťavou."
    },
    {
      id: 14,
      title: "Chia puding s mangom",
      calories: "295 kcal",
      benefit: "Vláknina a omega-3",
      time: "10 min + chladenie",
      image: chiaPuddingMango,
      ingredients: [
        "3 lyžice chia semienok",
        "200ml kokosového mléka",
        "1 lyžica javorového sirupu",
        "1 mango",
        "kokosové lupienky",
        "mäta"
      ],
      instructions: "1. Chia semienka zmiešajte s kokosovým mlékom a sirupom.\n2. Nechajte v chladničke minimálne 4 hodiny (ideálne cez noc).\n3. Mango olúpte a nakrájajte na kocky.\n4. Puding preložte do pohárov.\n5. Pridajte mango a kokosové lupienky.\n6. Ozdobte mätou."
    },
    {
      id: 15,
      title: "Pečená tekvica s quinoou",
      calories: "345 kcal",
      benefit: "Vitamín A a bielkoviny",
      time: "35 min",
      image: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800&auto=format&fit=crop",
      ingredients: [
        "300g tekvice",
        "100g quinoa",
        "50g kozieho syra",
        "30g vlašských orechov",
        "olivový olej",
        "med",
        "tymián",
        "soľ, korenie"
      ],
      instructions: "1. Rozohrejte trúbu na 200°C.\n2. Tekvicu nakrájajte na kocky a premiešajte s olejom a tymiánom.\n3. Pečte 25 minút.\n4. Quinoa uvarte podľa návodu.\n5. Zmiešajte quinoa s pečenou tekvicou.\n6. Pridajte rozdrobený kozí syr, orechy a kvapku medu."
    },
    {
      id: 16,
      title: "Zelené kari s kokosovým mlékom",
      calories: "370 kcal",
      benefit: "Protizápalové účinky",
      time: "28 min",
      image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&auto=format&fit=crop",
      ingredients: [
        "2 lyžice zelenej kari pasty",
        "400ml kokosového mléka",
        "200g tofu alebo kuracieho mäsa",
        "1 paprika",
        "100g bambusových výhonkov",
        "hrášok",
        "bazalka",
        "limetková šťava"
      ],
      instructions: "1. Kari pastu opražte na panvici 1 minútu.\n2. Pridajte kokosové mléko a premiešajte.\n3. Pridajte nakrájané tofu/kuracie mäso a zeleninu.\n4. Varte 15-20 minút na miernom ohni.\n5. Pridajte čerstvú bazalku a limetkovú šťavu.\n6. Podávajte s ryžou alebo rezancami."
    },
    {
      id: 17,
      title: "Protein pancakes s banánom",
      calories: "325 kcal",
      benefit: "Bielkoviny pre rast svalov",
      time: "15 min",
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop",
      ingredients: [
        "2 vajcia",
        "1 banán",
        "30g proteinového prášku",
        "50g ovosných vločiek",
        "škorica",
        "kokosový olej",
        "javorový sirup"
      ],
      instructions: "1. Banán rozmixujte s vajcami.\n2. Pridajte proteinový prášok, vločky a škoricu.\n3. Zmiešajte na hladké cesto.\n4. Na panvici rozohrejte kokosový olej.\n5. Pečte palacinky z oboch strán dohnieda.\n6. Podávajte s javorovým sirupom a čerstvým ovocím."
    },
    {
      id: 18,
      title: "Pečený kôstkovitý mix s olivovým olejom",
      calories: "400 kcal",
      benefit: "Zdravé tuky a minerály",
      time: "45 min",
      image: "https://images.unsplash.com/photo-1608039829572-78524f79c661?w=800&auto=format&fit=crop",
      ingredients: [
        "200g mrkvy",
        "200g paštrnáku",
        "200g celeru",
        "2 červené cibule",
        "4 lyžice olivového oleja",
        "rozmarín, tymián",
        "soľ, korenie",
        "balkánsky syr"
      ],
      instructions: "1. Rozohrejte trúbu na 200°C.\n2. Všetku zeleninu olúpte a nakrájajte na hrubšie kúsky.\n3. Premiešajte s olivovým olejom a bylinkami.\n4. Rozložte na plech a okoreňte.\n5. Pečte 40-45 minút, občas premiešajte.\n6. Podávajte s balkánskym syrom."
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Fit & Slim
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Vaša cesta k zdravšiemu životnému štýlu začína tu. Nájdite tréningy, recepty a tipy pre lepšiu kondíciu.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger value="weight-loss-videos">
              <Play className="h-4 w-4 mr-2" />
              Chudnutie
            </TabsTrigger>
            <TabsTrigger value="health-videos">
              <Heart className="h-4 w-4 mr-2" />
              Zdravie
            </TabsTrigger>
            <TabsTrigger value="weight-loss-recipes">
              <ChefHat className="h-4 w-4 mr-2" />
              Recepty na chudnutie
            </TabsTrigger>
            <TabsTrigger value="healthy-recipes">
              <ChefHat className="h-4 w-4 mr-2" />
              Zdravé recepty
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weight-loss-videos" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weightLossVideos.map((video) => (
                <Card 
                  key={video.id} 
                  className="overflow-hidden hover:shadow-elegant transition-all cursor-pointer"
                  onClick={() => setSelectedVideo(video.videoUrl)}
                >
                  <div className="relative aspect-video">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/50 transition-colors">
                      <Play className="h-16 w-16 text-white" />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-primary">
                      <Clock className="h-3 w-3 mr-1" />
                      {video.duration}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                    <CardDescription className="flex items-center justify-between">
                      <span>Náročnosť: {video.difficulty}</span>
                      <span className="text-primary font-semibold">{video.calories}</span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="health-videos" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {healthVideos.map((video) => (
                <Card 
                  key={video.id} 
                  className="overflow-hidden hover:shadow-elegant transition-all cursor-pointer"
                  onClick={() => setSelectedVideo(video.videoUrl)}
                >
                  <div className="relative aspect-video">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/50 transition-colors">
                      <Play className="h-16 w-16 text-white" />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-primary">
                      <Clock className="h-3 w-3 mr-1" />
                      {video.duration}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                    <CardDescription className="flex items-center justify-between">
                      <span>Náročnosť: {video.difficulty}</span>
                      <span className="text-primary font-semibold flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        {video.benefit}
                      </span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="weight-loss-recipes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weightLossRecipes.map((recipe) => (
                <Card 
                  key={recipe.id} 
                  className="overflow-hidden hover:shadow-elegant transition-all cursor-pointer"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <div className="relative aspect-video">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-primary">
                      <Clock className="h-3 w-3 mr-1" />
                      {recipe.time}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg hover:text-primary transition-colors">
                      {recipe.title}
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-primary font-semibold">{recipe.calories}</span>
                        <span>Bielkoviny: {recipe.protein}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="healthy-recipes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {healthyRecipes.map((recipe) => (
                <Card 
                  key={recipe.id} 
                  className="overflow-hidden hover:shadow-elegant transition-all cursor-pointer"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <div className="relative aspect-video">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-primary">
                      <Clock className="h-3 w-3 mr-1" />
                      {recipe.time}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg hover:text-primary transition-colors">
                      {recipe.title}
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-primary font-semibold">{recipe.calories}</span>
                        <span className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {recipe.benefit}
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Video Player Dialog */}
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-5xl p-0">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>Video prehrávač</DialogTitle>
              <DialogDescription>
                Pozrite si tréningové video
              </DialogDescription>
            </DialogHeader>
            <div className="w-full px-6 pb-6">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                {selectedVideo && (
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    src={selectedVideo}
                    title="Video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
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
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {selectedRecipe.time}
                    </span>
                    <span className="text-primary font-semibold">{selectedRecipe.calories}</span>
                    {selectedRecipe.protein && <span>Bielkoviny: {selectedRecipe.protein}</span>}
                    {selectedRecipe.benefit && (
                      <span className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {selectedRecipe.benefit}
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <img
                      src={selectedRecipe.image}
                      alt={selectedRecipe.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {selectedRecipe.ingredients && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <ChefHat className="h-5 w-5 mr-2" />
                        Ingrediencie
                      </h3>
                      <ul className="space-y-2">
                        {selectedRecipe.ingredients.map((ingredient: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>{ingredient}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedRecipe.instructions && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Postup prípravy</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                          {selectedRecipe.instructions}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FitSlim;
