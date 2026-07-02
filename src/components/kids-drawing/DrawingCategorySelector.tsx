import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Category {
  id: string;
  label: string;
  emoji: string;
  color: string;
  topics: { value: string; label: string; emoji: string }[];
}

const CATEGORIES: Category[] = [
  {
    id: "animals",
    label: "Animals",
    emoji: "🐾",
    color: "from-green-500/20 to-emerald-500/20",
    topics: [
      { value: "dog", label: "Dog", emoji: "🐶" },
      { value: "cat", label: "Cat", emoji: "🐱" },
      { value: "bunny", label: "Bunny", emoji: "🐰" },
      { value: "elephant", label: "Elephant", emoji: "🐘" },
      { value: "lion", label: "Lion", emoji: "🦁" },
      { value: "penguin", label: "Penguin", emoji: "🐧" },
      { value: "dolphin", label: "Dolphin", emoji: "🐬" },
      { value: "fox", label: "Fox", emoji: "🦊" },
      { value: "owl", label: "Owl", emoji: "🦉" },
      { value: "turtle", label: "Turtle", emoji: "🐢" },
      { value: "panda", label: "Panda", emoji: "🐼" },
      { value: "dinosaur", label: "Dinosaur", emoji: "🦕" },
    ],
  },
  {
    id: "fantasy",
    label: "Fantasy",
    emoji: "🦄",
    color: "from-purple-500/20 to-pink-500/20",
    topics: [
      { value: "unicorn", label: "Unicorn", emoji: "🦄" },
      { value: "dragon", label: "Dragon", emoji: "🐉" },
      { value: "mermaid", label: "Mermaid", emoji: "🧜‍♀️" },
      { value: "fairy", label: "Fairy", emoji: "🧚" },
      { value: "wizard", label: "Wizard", emoji: "🧙" },
      { value: "robot", label: "Robot", emoji: "🤖" },
      { value: "superhero", label: "Superhero", emoji: "🦸" },
      { value: "phoenix", label: "Phoenix", emoji: "🔥" },
    ],
  },
  {
    id: "nature",
    label: "Nature",
    emoji: "🌿",
    color: "from-teal-500/20 to-green-500/20",
    topics: [
      { value: "tree", label: "Tree", emoji: "🌳" },
      { value: "flower", label: "Flower", emoji: "🌸" },
      { value: "sunflower", label: "Sunflower", emoji: "🌻" },
      { value: "rainbow", label: "Rainbow", emoji: "🌈" },
      { value: "mountain", label: "Mountain", emoji: "⛰️" },
      { value: "ocean", label: "Ocean", emoji: "🌊" },
    ],
  },
  {
    id: "vehicles",
    label: "Vehicles",
    emoji: "🚀",
    color: "from-blue-500/20 to-cyan-500/20",
    topics: [
      { value: "car", label: "Car", emoji: "🚗" },
      { value: "rocket", label: "Rocket", emoji: "🚀" },
      { value: "airplane", label: "Airplane", emoji: "✈️" },
      { value: "train", label: "Train", emoji: "🚂" },
      { value: "boat", label: "Boat", emoji: "⛵" },
      { value: "helicopter", label: "Helicopter", emoji: "🚁" },
    ],
  },
  {
    id: "food",
    label: "Food",
    emoji: "🍕",
    color: "from-orange-500/20 to-yellow-500/20",
    topics: [
      { value: "pizza", label: "Pizza", emoji: "🍕" },
      { value: "ice-cream", label: "Ice Cream", emoji: "🍦" },
      { value: "cupcake", label: "Cupcake", emoji: "🧁" },
      { value: "donut", label: "Donut", emoji: "🍩" },
      { value: "burger", label: "Burger", emoji: "🍔" },
      { value: "watermelon", label: "Watermelon", emoji: "🍉" },
    ],
  },
  {
    id: "people",
    label: "People",
    emoji: "👩‍🚀",
    color: "from-red-500/20 to-rose-500/20",
    topics: [
      { value: "astronaut", label: "Astronaut", emoji: "👨‍🚀" },
      { value: "princess", label: "Princess", emoji: "👸" },
      { value: "ninja", label: "Ninja", emoji: "🥷" },
      { value: "pirate", label: "Pirate", emoji: "🏴‍☠️" },
      { value: "ballerina", label: "Ballerina", emoji: "🩰" },
      { value: "cowboy", label: "Cowboy", emoji: "🤠" },
    ],
  },
];

interface Props {
  selectedCategory: string;
  selectedTopic: string;
  onSelectCategory: (id: string) => void;
  onSelectTopic: (topic: string) => void;
}

export const DrawingCategorySelector = ({
  selectedCategory,
  selectedTopic,
  onSelectCategory,
  onSelectTopic,
}: Props) => {
  const activeCategory = CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <>
      <FloatingHowItWorks title={"Drawing Category Selector - How it works"} steps={[{ title: 'Open', desc: 'Access the Drawing Category Selector section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Drawing Category Selector.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Choose a Category
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {CATEGORIES.map((cat, i) => (
          <motion.button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`relative p-3 rounded-xl border-2 transition-all text-center ${
              selectedCategory === cat.id
                ? "border-primary bg-primary/10 shadow-lg"
                : "border-border hover:border-primary/50 hover:shadow-md"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-2xl mb-1">{cat.emoji}</div>
            <div className="text-xs font-medium">{cat.label}</div>
          </motion.button>
        ))}
      </div>

      {/* Topic grid */}
      {activeCategory && (
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Pick a Topic
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {activeCategory.topics.map((topic, i) => (
              <motion.button
                key={topic.value}
                onClick={() => onSelectTopic(topic.value)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  selectedTopic === topic.value
                    ? "border-primary bg-primary/10 shadow-lg"
                    : "border-border hover:border-primary/50"
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                <div className="text-xl mb-1">{topic.emoji}</div>
                <div className="text-xs font-medium">{topic.label}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
    </>
  );
};
