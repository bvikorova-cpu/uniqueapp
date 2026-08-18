import alpineVillage from "@/assets/puzzles/adult/alpine-village.jpg";
import amsterdam from "@/assets/puzzles/adult/amsterdam.jpg";
import aurora from "@/assets/puzzles/adult/aurora.jpg";
import autumnPath from "@/assets/puzzles/adult/autumn-path.jpg";
import balloons from "@/assets/puzzles/adult/balloons.jpg";
import bookshopCat from "@/assets/puzzles/adult/bookshop-cat.jpg";
import butterflies from "@/assets/puzzles/adult/butterflies.jpg";
import catWindow from "@/assets/puzzles/adult/cat-window.jpg";
import cheeseBoard from "@/assets/puzzles/adult/cheese-board.jpg";
import cherryTemple from "@/assets/puzzles/adult/cherry-temple.jpg";
import clockwork from "@/assets/puzzles/adult/clockwork.jpg";
import coffeeStillLife from "@/assets/puzzles/adult/coffee-still-life.jpg";
import constellations from "@/assets/puzzles/adult/constellations.jpg";
import desertDunes from "@/assets/puzzles/adult/desert-dunes.jpg";
import dogsMeadow from "@/assets/puzzles/adult/dogs-meadow.jpg";
import farmersMarket from "@/assets/puzzles/adult/farmers-market.jpg";
import greekVillage from "@/assets/puzzles/adult/greek-village.jpg";
import harbour from "@/assets/puzzles/adult/harbour.jpg";
import horses from "@/assets/puzzles/adult/horses.jpg";
import hummingbirds from "@/assets/puzzles/adult/hummingbirds.jpg";
import impressionistGarden from "@/assets/puzzles/adult/impressionist-garden.jpg";
import japaneseGarden from "@/assets/puzzles/adult/japanese-garden.jpg";
import koi from "@/assets/puzzles/adult/koi.jpg";
import kyotoStreet from "@/assets/puzzles/adult/kyoto-street.jpg";
import lavender from "@/assets/puzzles/adult/lavender.jpg";
import library from "@/assets/puzzles/adult/library.jpg";
import lighthouse from "@/assets/puzzles/adult/lighthouse.jpg";
import london from "@/assets/puzzles/adult/london.jpg";
import mandala from "@/assets/puzzles/adult/mandala.jpg";
import milkyWay from "@/assets/puzzles/adult/milky-way.jpg";
import mountainLake from "@/assets/puzzles/adult/mountain-lake.jpg";
import oldMap from "@/assets/puzzles/adult/old-map.jpg";
import oldTown from "@/assets/puzzles/adult/old-town.jpg";
import owl from "@/assets/puzzles/adult/owl.jpg";
import parisCafe from "@/assets/puzzles/adult/paris-cafe.jpg";
import patisserie from "@/assets/puzzles/adult/patisserie.jpg";
import regatta from "@/assets/puzzles/adult/regatta.jpg";
import roseGarden from "@/assets/puzzles/adult/rose-garden.jpg";
import santorini from "@/assets/puzzles/adult/santorini.jpg";
import skylineNight from "@/assets/puzzles/adult/skyline-night.jpg";
import spiceMarket from "@/assets/puzzles/adult/spice-market.jpg";
import stag from "@/assets/puzzles/adult/stag.jpg";
import stamps from "@/assets/puzzles/adult/stamps.jpg";
import steamTrain from "@/assets/puzzles/adult/steam-train.jpg";
import succulents from "@/assets/puzzles/adult/succulents.jpg";
import sunflowers from "@/assets/puzzles/adult/sunflowers.jpg";
import sushi from "@/assets/puzzles/adult/sushi.jpg";
import tiger from "@/assets/puzzles/adult/tiger.jpg";
import tropicalBeach from "@/assets/puzzles/adult/tropical-beach.jpg";
import tulips from "@/assets/puzzles/adult/tulips.jpg";
import tuscany from "@/assets/puzzles/adult/tuscany.jpg";
import typewriter from "@/assets/puzzles/adult/typewriter.jpg";
import venice from "@/assets/puzzles/adult/venice.jpg";
import vintageCar from "@/assets/puzzles/adult/vintage-car.jpg";
import vinylWall from "@/assets/puzzles/adult/vinyl-wall.jpg";
import violin from "@/assets/puzzles/adult/violin.jpg";
import waterfall from "@/assets/puzzles/adult/waterfall.jpg";
import wheatField from "@/assets/puzzles/adult/wheat-field.jpg";
import wineCellar from "@/assets/puzzles/adult/wine-cellar.jpg";
import wolves from "@/assets/puzzles/adult/wolves.jpg";

export interface AdultPuzzle {
  slug: string;
  title: string;
  tagline: string;
  emoji: string;
  gradient: string;
  image: string;
  rows: number;
  cols: number;
  /** Category shown on the card. */
  category: string;
  /** Difficulty group used for filtering. */
  level: "relaxed" | "classic" | "challenge" | "extreme";
}

/** Cost in AI credits for one puzzle-piece draw. */
export const ADULT_PIECE_COST = 1;

export const ADULT_PUZZLE_LEVELS: { id: AdultPuzzle["level"]; label: string; hint: string }[] = [
  { id: "relaxed", label: "Relaxed", hint: "36–64 pieces · a calm evening" },
  { id: "classic", label: "Classic", hint: "100–144 pieces · the usual box" },
  { id: "challenge", label: "Challenge", hint: "196–256 pieces · takes a while" },
  { id: "extreme", label: "Extreme", hint: "324–400 pieces · for collectors" },
];

export const ADULT_PUZZLE_CATEGORIES = [
  "Landscapes",
  "Cities",
  "Interiors",
  "Food & wine",
  "Animals",
  "Flowers",
  "Art & patterns",
  "Vintage",
  "Night sky",
] as const;

export const ADULT_PUZZLES: AdultPuzzle[] = [
  // ---- Landscapes ----
  { slug: "tuscany", title: "Tuscan Hills", tagline: "Cypress avenue winding through golden hills at sunrise.", emoji: "🌄", gradient: "from-amber-400 to-emerald-500", image: tuscany, rows: 10, cols: 10, category: "Landscapes", level: "classic" },
  { slug: "mountain-lake", title: "Mountain Lake", tagline: "Still alpine water mirroring snowy peaks.", emoji: "🏔️", gradient: "from-sky-500 to-slate-600", image: mountainLake, rows: 8, cols: 8, category: "Landscapes", level: "relaxed" },
  { slug: "autumn-path", title: "Autumn Path", tagline: "A forest lane buried in red and amber leaves.", emoji: "🍂", gradient: "from-orange-500 to-amber-600", image: autumnPath, rows: 10, cols: 10, category: "Landscapes", level: "classic" },
  { slug: "lavender", title: "Provence Lavender", tagline: "Endless purple rows leading to a stone farmhouse.", emoji: "💜", gradient: "from-violet-500 to-indigo-500", image: lavender, rows: 12, cols: 12, category: "Landscapes", level: "classic" },
  { slug: "sunflowers-field", title: "Sunflower Field", tagline: "Thousands of sunflowers facing a summer sky.", emoji: "🌻", gradient: "from-yellow-400 to-amber-500", image: sunflowers, rows: 14, cols: 14, category: "Landscapes", level: "challenge" },
  { slug: "tropical-beach", title: "Tropical Bay", tagline: "Turquoise water, palms and white sand.", emoji: "🏝️", gradient: "from-cyan-400 to-teal-500", image: tropicalBeach, rows: 8, cols: 8, category: "Landscapes", level: "relaxed" },
  { slug: "lighthouse", title: "Storm Lighthouse", tagline: "Waves crashing against a lonely lighthouse.", emoji: "🗼", gradient: "from-slate-500 to-blue-700", image: lighthouse, rows: 10, cols: 10, category: "Landscapes", level: "classic" },
  { slug: "waterfall", title: "Jungle Waterfall", tagline: "Rainforest cascade falling into a turquoise pool.", emoji: "💦", gradient: "from-emerald-500 to-cyan-600", image: waterfall, rows: 12, cols: 12, category: "Landscapes", level: "classic" },
  { slug: "desert-dunes", title: "Desert Caravan", tagline: "Camels crossing sand dunes at sunset.", emoji: "🐪", gradient: "from-orange-400 to-amber-600", image: desertDunes, rows: 8, cols: 8, category: "Landscapes", level: "relaxed" },
  { slug: "wheat-field", title: "Storm Over Wheat", tagline: "Poppies in golden wheat under a dramatic sky.", emoji: "🌾", gradient: "from-amber-400 to-slate-600", image: wheatField, rows: 14, cols: 14, category: "Landscapes", level: "challenge" },
  { slug: "japanese-garden", title: "Japanese Garden", tagline: "Maple, stone lantern and a quiet koi pond.", emoji: "🍁", gradient: "from-red-500 to-emerald-600", image: japaneseGarden, rows: 12, cols: 12, category: "Landscapes", level: "classic" },
  { slug: "cherry-temple", title: "Cherry Blossom Temple", tagline: "Pagoda framed by blooming sakura branches.", emoji: "🌸", gradient: "from-pink-400 to-rose-500", image: cherryTemple, rows: 14, cols: 14, category: "Landscapes", level: "challenge" },
  { slug: "alpine-village", title: "Alpine Winter Village", tagline: "Snowy chalets glowing at blue hour.", emoji: "❄️", gradient: "from-sky-400 to-indigo-600", image: alpineVillage, rows: 12, cols: 12, category: "Landscapes", level: "classic" },
  { slug: "greek-village", title: "Cliffside Village", tagline: "White houses above a deep blue sea.", emoji: "⛵", gradient: "from-blue-500 to-cyan-400", image: greekVillage, rows: 12, cols: 12, category: "Landscapes", level: "classic" },
  { slug: "santorini", title: "Santorini Blue", tagline: "Blue domes and whitewashed steps over the caldera.", emoji: "🇬🇷", gradient: "from-sky-500 to-blue-600", image: santorini, rows: 10, cols: 10, category: "Landscapes", level: "classic" },

  // ---- Cities ----
  { slug: "paris-cafe", title: "Paris Café", tagline: "Rainy boulevard terrace with warm lamplight.", emoji: "☕", gradient: "from-rose-400 to-slate-600", image: parisCafe, rows: 12, cols: 12, category: "Cities", level: "classic" },
  { slug: "venice", title: "Venice Canal", tagline: "Gondolas drifting between faded palazzi.", emoji: "🚤", gradient: "from-teal-500 to-amber-500", image: venice, rows: 14, cols: 14, category: "Cities", level: "challenge" },
  { slug: "amsterdam", title: "Amsterdam Canals", tagline: "Gabled houses, bikes and bridges.", emoji: "🚲", gradient: "from-emerald-500 to-orange-500", image: amsterdam, rows: 14, cols: 14, category: "Cities", level: "challenge" },
  { slug: "old-town", title: "Old Town Square", tagline: "Cobbled square with clock tower and cafés.", emoji: "🏛️", gradient: "from-amber-500 to-stone-600", image: oldTown, rows: 16, cols: 16, category: "Cities", level: "challenge" },
  { slug: "london", title: "London Rain", tagline: "Red buses and umbrellas by the river.", emoji: "☔", gradient: "from-red-500 to-slate-600", image: london, rows: 12, cols: 12, category: "Cities", level: "classic" },
  { slug: "skyline-night", title: "Skyline at Night", tagline: "A million windows reflected in dark water.", emoji: "🌃", gradient: "from-indigo-600 to-slate-800", image: skylineNight, rows: 18, cols: 18, category: "Cities", level: "extreme" },
  { slug: "harbour", title: "Fishing Harbour", tagline: "Colourful boats, nets and crates at dawn.", emoji: "⚓", gradient: "from-cyan-500 to-orange-400", image: harbour, rows: 14, cols: 14, category: "Cities", level: "challenge" },
  { slug: "kyoto-street", title: "Kyoto Evening", tagline: "Lantern-lit wooden street under cherry trees.", emoji: "🏮", gradient: "from-pink-400 to-indigo-600", image: kyotoStreet, rows: 14, cols: 14, category: "Cities", level: "challenge" },

  // ---- Interiors ----
  { slug: "library", title: "Grand Library", tagline: "Endless shelves, ladders and reading lamps.", emoji: "📚", gradient: "from-amber-600 to-stone-700", image: library, rows: 16, cols: 16, category: "Interiors", level: "challenge" },
  { slug: "bookshop-cat", title: "Bookshop Cat", tagline: "A sleepy cat guarding stacks of old books.", emoji: "🐈", gradient: "from-amber-500 to-teal-600", image: bookshopCat, rows: 12, cols: 12, category: "Interiors", level: "classic" },
  { slug: "wine-cellar", title: "Wine Cellar", tagline: "Oak barrels and dusty bottles by candlelight.", emoji: "🍷", gradient: "from-red-700 to-stone-700", image: wineCellar, rows: 12, cols: 12, category: "Interiors", level: "classic" },
  { slug: "typewriter", title: "Writer's Desk", tagline: "Typewriter, letters and ink under a brass lamp.", emoji: "⌨️", gradient: "from-amber-600 to-orange-700", image: typewriter, rows: 10, cols: 10, category: "Interiors", level: "classic" },
  { slug: "violin", title: "Violin & Roses", tagline: "Sheet music, candlelight and a red violin.", emoji: "🎻", gradient: "from-rose-600 to-amber-700", image: violin, rows: 10, cols: 10, category: "Interiors", level: "classic" },
  { slug: "vinyl-wall", title: "Vinyl Wall", tagline: "Hundreds of record sleeves — pure chaos.", emoji: "💿", gradient: "from-fuchsia-500 to-amber-500", image: vinylWall, rows: 18, cols: 18, category: "Interiors", level: "extreme" },

  // ---- Food & wine ----
  { slug: "coffee-still-life", title: "Morning Coffee", tagline: "Espresso, beans and a croissant in warm light.", emoji: "☕", gradient: "from-amber-700 to-stone-500", image: coffeeStillLife, rows: 8, cols: 8, category: "Food & wine", level: "relaxed" },
  { slug: "spice-market", title: "Spice Market", tagline: "Pyramids of saffron, paprika and turmeric.", emoji: "🌶️", gradient: "from-orange-500 to-red-600", image: spiceMarket, rows: 16, cols: 16, category: "Food & wine", level: "challenge" },
  { slug: "patisserie", title: "Patisserie Window", tagline: "Macarons, tarts and cakes behind glass.", emoji: "🍰", gradient: "from-pink-400 to-amber-400", image: patisserie, rows: 14, cols: 14, category: "Food & wine", level: "challenge" },
  { slug: "farmers-market", title: "Farmers Market", tagline: "Crates overflowing with fruit and vegetables.", emoji: "🥕", gradient: "from-lime-500 to-orange-500", image: farmersMarket, rows: 18, cols: 18, category: "Food & wine", level: "extreme" },
  { slug: "sushi", title: "Sushi Platter", tagline: "Sashimi and nigiri on dark slate.", emoji: "🍣", gradient: "from-rose-500 to-slate-600", image: sushi, rows: 8, cols: 8, category: "Food & wine", level: "relaxed" },
  { slug: "cheese-board", title: "Cheese & Wine", tagline: "Grapes, figs, walnuts and two glasses of red.", emoji: "🧀", gradient: "from-amber-500 to-red-700", image: cheeseBoard, rows: 10, cols: 10, category: "Food & wine", level: "classic" },

  // ---- Animals ----
  { slug: "horses", title: "Horses in the Mist", tagline: "Wild horses galloping through morning fog.", emoji: "🐎", gradient: "from-stone-500 to-amber-600", image: horses, rows: 10, cols: 10, category: "Animals", level: "classic" },
  { slug: "wolves", title: "Winter Wolves", tagline: "A pack crossing a snowy pine forest.", emoji: "🐺", gradient: "from-slate-500 to-sky-700", image: wolves, rows: 12, cols: 12, category: "Animals", level: "classic" },
  { slug: "tiger", title: "Tiger Gaze", tagline: "Close-up portrait of a Bengal tiger.", emoji: "🐅", gradient: "from-orange-500 to-stone-700", image: tiger, rows: 12, cols: 12, category: "Animals", level: "classic" },
  { slug: "owl", title: "Forest Owl", tagline: "An owl watching from a mossy branch.", emoji: "🦉", gradient: "from-amber-600 to-emerald-700", image: owl, rows: 10, cols: 10, category: "Animals", level: "classic" },
  { slug: "stag", title: "Highland Stag", tagline: "A crowned stag in heather and mist.", emoji: "🦌", gradient: "from-purple-600 to-amber-600", image: stag, rows: 10, cols: 10, category: "Animals", level: "classic" },
  { slug: "koi", title: "Koi Pond", tagline: "Orange and white koi under lily pads.", emoji: "🐟", gradient: "from-orange-400 to-teal-600", image: koi, rows: 14, cols: 14, category: "Animals", level: "challenge" },
  { slug: "butterflies", title: "Butterfly Collection", tagline: "Dozens of species in a naturalist's case.", emoji: "🦋", gradient: "from-sky-400 to-fuchsia-500", image: butterflies, rows: 16, cols: 16, category: "Animals", level: "challenge" },
  { slug: "hummingbirds", title: "Hummingbirds", tagline: "Iridescent birds hovering over exotic blossoms.", emoji: "🐦", gradient: "from-emerald-400 to-rose-500", image: hummingbirds, rows: 12, cols: 12, category: "Animals", level: "classic" },
  { slug: "cat-window", title: "Cat by the Window", tagline: "An elegant cat in afternoon sunlight.", emoji: "🐱", gradient: "from-amber-400 to-emerald-500", image: catWindow, rows: 8, cols: 8, category: "Animals", level: "relaxed" },
  { slug: "dogs-meadow", title: "Dogs in the Meadow", tagline: "Retrievers among daisies on a summer day.", emoji: "🐕", gradient: "from-lime-400 to-amber-400", image: dogsMeadow, rows: 8, cols: 8, category: "Animals", level: "relaxed" },

  // ---- Flowers ----
  { slug: "tulips", title: "Tulip Fields", tagline: "Endless colour stripes and a windmill.", emoji: "🌷", gradient: "from-rose-500 to-yellow-400", image: tulips, rows: 14, cols: 14, category: "Flowers", level: "challenge" },
  { slug: "rose-garden", title: "Rose Garden", tagline: "Climbing roses over an old stone arch.", emoji: "🌹", gradient: "from-rose-500 to-emerald-500", image: roseGarden, rows: 16, cols: 16, category: "Flowers", level: "challenge" },
  { slug: "succulents", title: "Succulent Study", tagline: "Geometric rosettes in terracotta pots.", emoji: "🪴", gradient: "from-emerald-400 to-teal-600", image: succulents, rows: 10, cols: 10, category: "Flowers", level: "classic" },
  { slug: "impressionist-garden", title: "Water Lily Garden", tagline: "Impressionist pond with willow and lilies.", emoji: "🎨", gradient: "from-emerald-400 to-blue-500", image: impressionistGarden, rows: 12, cols: 12, category: "Flowers", level: "classic" },

  // ---- Art & patterns ----
  { slug: "mandala", title: "Colour Mandala", tagline: "Symmetrical ornament with razor-thin detail.", emoji: "🔮", gradient: "from-fuchsia-500 to-emerald-500", image: mandala, rows: 16, cols: 16, category: "Art & patterns", level: "challenge" },
  { slug: "stamps", title: "Stamp Collection", tagline: "Hundreds of vintage stamps edge to edge.", emoji: "📮", gradient: "from-red-500 to-sky-500", image: stamps, rows: 20, cols: 20, category: "Art & patterns", level: "extreme" },
  { slug: "balloons", title: "Balloon Festival", tagline: "Dozens of hot-air balloons at sunrise.", emoji: "🎈", gradient: "from-orange-400 to-sky-500", image: balloons, rows: 14, cols: 14, category: "Art & patterns", level: "challenge" },

  // ---- Vintage ----
  { slug: "vintage-car", title: "Vintage Roadster", tagline: "Chrome and cream paint on a cobbled street.", emoji: "🚗", gradient: "from-red-600 to-stone-600", image: vintageCar, rows: 10, cols: 10, category: "Vintage", level: "classic" },
  { slug: "steam-train", title: "Steam Express", tagline: "A locomotive breathing steam through a valley.", emoji: "🚂", gradient: "from-stone-600 to-emerald-600", image: steamTrain, rows: 12, cols: 12, category: "Vintage", level: "classic" },
  { slug: "old-map", title: "Antique World Map", tagline: "Compass roses, sea monsters and faded ink.", emoji: "🗺️", gradient: "from-amber-500 to-stone-600", image: oldMap, rows: 18, cols: 18, category: "Vintage", level: "extreme" },
  { slug: "clockwork", title: "Clockwork", tagline: "Brass gears and springs of an open watch.", emoji: "⚙️", gradient: "from-amber-600 to-slate-600", image: clockwork, rows: 16, cols: 16, category: "Vintage", level: "challenge" },
  { slug: "regatta", title: "Sailing Regatta", tagline: "Spinnakers racing across choppy blue water.", emoji: "⛵", gradient: "from-blue-500 to-red-500", image: regatta, rows: 12, cols: 12, category: "Vintage", level: "classic" },

  // ---- Night sky ----
  { slug: "aurora", title: "Northern Lights", tagline: "Green curtains of aurora over a frozen fjord.", emoji: "🌌", gradient: "from-emerald-500 to-indigo-700", image: aurora, rows: 12, cols: 12, category: "Night sky", level: "classic" },
  { slug: "constellations", title: "Star Atlas", tagline: "Celestial chart with constellations and figures.", emoji: "✨", gradient: "from-indigo-600 to-amber-500", image: constellations, rows: 16, cols: 16, category: "Night sky", level: "challenge" },
  { slug: "milky-way", title: "Milky Way", tagline: "The galaxy arching over a mirror-still lake.", emoji: "🌠", gradient: "from-slate-800 to-purple-600", image: milkyWay, rows: 20, cols: 20, category: "Night sky", level: "extreme" },
];

export const getAdultPuzzle = (slug: string) => ADULT_PUZZLES.find((p) => p.slug === slug);
