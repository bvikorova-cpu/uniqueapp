export interface Lesson {
  id: string;
  title: string;
  content: string;
  imageEmoji: string;
  funFact: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface TopicContent {
  lessons: Lesson[];
  quiz: QuizQuestion[];
}

export const educationalContent: Record<string, TopicContent> = {
  alphabet: {
    lessons: [
      {
        id: "lesson-1",
        title: "Meet the Letters A-G",
        content: "The alphabet has 26 letters! Let's start with A, B, C, D, E, F, and G. A is for Apple 🍎, B is for Ball ⚽, C is for Cat 🐱!",
        imageEmoji: "🔤",
        funFact: "Did you know? The letter 'A' is the most common letter in English!"
      },
      {
        id: "lesson-2",
        title: "Letters H-N",
        content: "Now let's learn H, I, J, K, L, M, N! H is for House 🏠, I is for Ice cream 🍦, J is for Jump!",
        imageEmoji: "📝",
        funFact: "The letter 'E' is used more than any other letter!"
      },
      {
        id: "lesson-3",
        title: "Letters O-Z",
        content: "Finally, O, P, Q, R, S, T, U, V, W, X, Y, Z! Z is for Zebra 🦓, the last letter!",
        imageEmoji: "✨",
        funFact: "Z is the least used letter in English!"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What letter comes after A?",
        options: ["B", "C", "D", "Z"],
        correctAnswer: "B",
        explanation: "B comes right after A in the alphabet!"
      },
      {
        id: "q2",
        question: "Which letter is for Apple?",
        options: ["B", "A", "C", "P"],
        correctAnswer: "A",
        explanation: "A is for Apple! 🍎"
      },
      {
        id: "q3",
        question: "What is the last letter of the alphabet?",
        options: ["Y", "X", "Z", "W"],
        correctAnswer: "Z",
        explanation: "Z is the last letter! Like Zebra 🦓"
      }
    ]
  },
  numbers: {
    lessons: [
      {
        id: "lesson-1",
        title: "Numbers 1-5",
        content: "Let's count! 1 apple, 2 bananas, 3 oranges, 4 strawberries, 5 grapes! Can you count them?",
        imageEmoji: "1️⃣",
        funFact: "The number 1 is called 'one' and it means a single thing!"
      },
      {
        id: "lesson-2",
        title: "Numbers 6-10",
        content: "Now bigger numbers! 6, 7, 8, 9, 10! Ten fingers on your hands! 🖐️🖐️",
        imageEmoji: "🔢",
        funFact: "You have 10 fingers and 10 toes!"
      },
      {
        id: "lesson-3",
        title: "Counting Fun",
        content: "Let's count everything around us! Count toys, count steps, count fun!",
        imageEmoji: "🎯",
        funFact: "Numbers go on forever - there's always one more!"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What number comes after 2?",
        options: ["1", "3", "4", "5"],
        correctAnswer: "3",
        explanation: "3 comes after 2! 1, 2, 3!"
      },
      {
        id: "q2",
        question: "How many fingers do you have on one hand?",
        options: ["3", "4", "5", "10"],
        correctAnswer: "5",
        explanation: "You have 5 fingers on each hand! 🖐️"
      },
      {
        id: "q3",
        question: "What number is bigger: 7 or 4?",
        options: ["7", "4", "Same", "Don't know"],
        correctAnswer: "7",
        explanation: "7 is bigger than 4!"
      }
    ]
  },
  colors: {
    lessons: [
      {
        id: "lesson-1",
        title: "Primary Colors",
        content: "The three primary colors are Red ❤️, Blue 💙, and Yellow 💛! All other colors are made from these!",
        imageEmoji: "🎨",
        funFact: "You can't make primary colors by mixing other colors!"
      },
      {
        id: "lesson-2",
        title: "Rainbow Colors",
        content: "A rainbow has 7 colors: Red, Orange, Yellow, Green, Blue, Indigo, and Violet! 🌈",
        imageEmoji: "🌈",
        funFact: "Rainbows appear when sunlight shines through rain!"
      },
      {
        id: "lesson-3",
        title: "Mixing Colors",
        content: "Red + Blue = Purple! Blue + Yellow = Green! Red + Yellow = Orange! Magic! ✨",
        imageEmoji: "🎭",
        funFact: "Artists use color mixing to create thousands of colors!"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What color is the sky?",
        options: ["Red", "Blue", "Green", "Yellow"],
        correctAnswer: "Blue",
        explanation: "The sky is blue! 💙"
      },
      {
        id: "q2",
        question: "What do you get when you mix red and blue?",
        options: ["Purple", "Green", "Orange", "Pink"],
        correctAnswer: "Purple",
        explanation: "Red + Blue = Purple! 💜"
      },
      {
        id: "q3",
        question: "How many colors are in a rainbow?",
        options: ["5", "6", "7", "8"],
        correctAnswer: "7",
        explanation: "A rainbow has 7 beautiful colors! 🌈"
      }
    ]
  },
  animals: {
    lessons: [
      {
        id: "lesson-1",
        title: "Farm Animals",
        content: "Meet farm friends! Cows say 'Moo' 🐄, Pigs say 'Oink' 🐷, Chickens say 'Cluck' 🐔!",
        imageEmoji: "🐄",
        funFact: "Cows have best friends and get sad when they're apart!"
      },
      {
        id: "lesson-2",
        title: "Wild Animals",
        content: "Lions 🦁 are kings of the jungle! Elephants 🐘 are the biggest land animals! Monkeys 🐵 love bananas!",
        imageEmoji: "🦁",
        funFact: "Elephants can remember things for their whole life!"
      },
      {
        id: "lesson-3",
        title: "Ocean Animals",
        content: "Under the sea! Dolphins 🐬 are smart, Fish 🐟 swim fast, Whales 🐋 are huge!",
        imageEmoji: "🐬",
        funFact: "Dolphins sleep with one eye open!"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What sound does a cow make?",
        options: ["Woof", "Meow", "Moo", "Quack"],
        correctAnswer: "Moo",
        explanation: "Cows say 'Moo'! 🐄"
      },
      {
        id: "q2",
        question: "What is the biggest land animal?",
        options: ["Lion", "Elephant", "Bear", "Giraffe"],
        correctAnswer: "Elephant",
        explanation: "Elephants are the biggest! 🐘"
      },
      {
        id: "q3",
        question: "Where do fish live?",
        options: ["Trees", "Water", "Sky", "Desert"],
        correctAnswer: "Water",
        explanation: "Fish live in water! 🐟"
      }
    ]
  },
  shapes: {
    lessons: [
      {
        id: "lesson-1",
        title: "Basic Shapes",
        content: "Circle ⭕ has no corners! Square ⬛ has 4 equal sides! Triangle 🔺 has 3 sides!",
        imageEmoji: "⭕",
        funFact: "A pizza is a circle! A window can be a square!"
      },
      {
        id: "lesson-2",
        title: "More Shapes",
        content: "Rectangle is like a stretched square! Star ⭐ has points! Heart ❤️ shows love!",
        imageEmoji: "⭐",
        funFact: "Look around - shapes are everywhere!"
      },
      {
        id: "lesson-3",
        title: "3D Shapes",
        content: "Sphere is like a ball 🏀! Cube is like a box 📦! Cylinder is like a can!",
        imageEmoji: "🎱",
        funFact: "Earth is a big sphere floating in space!"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "How many sides does a triangle have?",
        options: ["2", "3", "4", "5"],
        correctAnswer: "3",
        explanation: "A triangle has 3 sides! 🔺"
      },
      {
        id: "q2",
        question: "Which shape has no corners?",
        options: ["Square", "Triangle", "Circle", "Rectangle"],
        correctAnswer: "Circle",
        explanation: "A circle is round with no corners! ⭕"
      },
      {
        id: "q3",
        question: "What shape is a ball?",
        options: ["Cube", "Sphere", "Cylinder", "Cone"],
        correctAnswer: "Sphere",
        explanation: "A ball is a sphere! 🏀"
      }
    ]
  },
  weather: {
    lessons: [
      {
        id: "lesson-1",
        title: "Sunny Days",
        content: "The sun ☀️ gives us light and warmth! On sunny days, we can play outside!",
        imageEmoji: "☀️",
        funFact: "The sun is a giant star 93 million miles away!"
      },
      {
        id: "lesson-2",
        title: "Rainy Days",
        content: "Rain 🌧️ falls from clouds! Plants need rain to grow! Puddles are fun to jump in!",
        imageEmoji: "🌧️",
        funFact: "Rain helps flowers bloom and trees grow tall!"
      },
      {
        id: "lesson-3",
        title: "Seasons",
        content: "Spring 🌸 is warm, Summer ☀️ is hot, Fall 🍂 is cool, Winter ❄️ is cold!",
        imageEmoji: "🍂",
        funFact: "Earth tilts to make the seasons change!"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What do we see on a sunny day?",
        options: ["Moon", "Sun", "Stars", "Rainbow"],
        correctAnswer: "Sun",
        explanation: "We see the bright sun on sunny days! ☀️"
      },
      {
        id: "q2",
        question: "What falls from clouds?",
        options: ["Snow", "Rain", "Both", "Neither"],
        correctAnswer: "Both",
        explanation: "Both rain and snow fall from clouds! 🌧️❄️"
      },
      {
        id: "q3",
        question: "Which season is coldest?",
        options: ["Spring", "Summer", "Fall", "Winter"],
        correctAnswer: "Winter",
        explanation: "Winter is the coldest season! ❄️"
      }
    ]
  },
  planets: {
    lessons: [
      {
        id: "lesson-1",
        title: "Our Solar System",
        content: "We live on Earth 🌍! The sun ☀️ is in the middle! 8 planets orbit the sun!",
        imageEmoji: "🌍",
        funFact: "Earth is the only planet with life we know of!"
      },
      {
        id: "lesson-2",
        title: "Inner Planets",
        content: "Mercury, Venus, Earth, Mars are rocky planets! Mars is red! Venus is hottest!",
        imageEmoji: "🪐",
        funFact: "A day on Venus is longer than its year!"
      },
      {
        id: "lesson-3",
        title: "Outer Planets",
        content: "Jupiter is biggest! Saturn has beautiful rings! Neptune is blue and windy!",
        imageEmoji: "🌌",
        funFact: "Jupiter is so big, all other planets could fit inside!"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What planet do we live on?",
        options: ["Mars", "Venus", "Earth", "Jupiter"],
        correctAnswer: "Earth",
        explanation: "We live on planet Earth! 🌍"
      },
      {
        id: "q2",
        question: "Which planet is biggest?",
        options: ["Earth", "Mars", "Jupiter", "Venus"],
        correctAnswer: "Jupiter",
        explanation: "Jupiter is the biggest planet! 🪐"
      },
      {
        id: "q3",
        question: "Which planet has rings?",
        options: ["Earth", "Saturn", "Mars", "Mercury"],
        correctAnswer: "Saturn",
        explanation: "Saturn has beautiful rings! 🪐"
      }
    ]
  },
  dinosaurs: {
    lessons: [
      {
        id: "lesson-1",
        title: "Meet the Dinosaurs",
        content: "Dinosaurs lived millions of years ago! T-Rex 🦖 was fierce! Triceratops 🦕 had 3 horns!",
        imageEmoji: "🦖",
        funFact: "Dinosaurs ruled Earth for 165 million years!"
      },
      {
        id: "lesson-2",
        title: "Plant Eaters",
        content: "Brachiosaurus was tall! Stegosaurus had plates! They ate plants and leaves!",
        imageEmoji: "🦕",
        funFact: "Some dinosaurs were as tall as buildings!"
      },
      {
        id: "lesson-3",
        title: "Flying Dinosaurs",
        content: "Pterodactyls could fly! They weren't dinosaurs but reptiles! They had wings!",
        imageEmoji: "🦅",
        funFact: "Some pterodactyls had wingspans bigger than small planes!"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "Which dinosaur was the fiercest?",
        options: ["T-Rex", "Triceratops", "Stegosaurus", "Brachiosaurus"],
        correctAnswer: "T-Rex",
        explanation: "T-Rex was the king of dinosaurs! 🦖"
      },
      {
        id: "q2",
        question: "What did plant-eating dinosaurs eat?",
        options: ["Meat", "Plants", "Fish", "Bugs"],
        correctAnswer: "Plants",
        explanation: "Plant eaters munched on leaves and plants! 🌿"
      },
      {
        id: "q3",
        question: "Could Pterodactyls fly?",
        options: ["Yes", "No", "Maybe", "Sometimes"],
        correctAnswer: "Yes",
        explanation: "Pterodactyls could fly through the sky! 🦅"
      }
    ]
  },
  transportation: {
    lessons: [
      {
        id: "lesson-1",
        title: "Doprava na cestách",
        content: "Autá 🚗 jazdia po cestách! Autobusy 🚌 vozia veľa ľudí! Motorky 🏍️ sú rýchle a malé!",
        imageEmoji: "🚗",
        funFact: "Prvé auto bolo vynájdené pred viac ako 100 rokmi!"
      },
      {
        id: "lesson-2",
        title: "Doprava vo vzduchu",
        content: "Lietadlá ✈️ lietajú vysoko v oblakoch! Helikoptéry 🚁 môžu lietať hore a dole! Rakety 🚀 idú do vesmíru!",
        imageEmoji: "✈️",
        funFact: "Lietadlá môžu letieť rýchlejšie ako zvuk!"
      },
      {
        id: "lesson-3",
        title: "Doprava na vode",
        content: "Lode 🚢 plávajú po mori! Člny ⛵ používajú vietor! Ponorky plávajú pod vodou!",
        imageEmoji: "🚢",
        funFact: "Titanic bol najväčšia loď svojej doby!"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "Čo lieta v oblakoch?",
        options: ["Auto", "Lietadlo", "Loď", "Autobus"],
        correctAnswer: "Lietadlo",
        explanation: "Lietadlá lietajú vysoko v oblakoch! ✈️"
      },
      {
        id: "q2",
        question: "Kde plávajú lode?",
        options: ["Na ceste", "Vo vzduchu", "Na vode", "V zemi"],
        correctAnswer: "Na vode",
        explanation: "Lode plávajú po vode! 🚢"
      },
      {
        id: "q3",
        question: "Čo ide do vesmíru?",
        options: ["Raketa", "Auto", "Autobus", "Loď"],
        correctAnswer: "Raketa",
        explanation: "Rakety idú do vesmíru! 🚀"
      }
    ]
  },
  food: {
    lessons: [
      {
        id: "lesson-1",
        title: "Ovocie",
        content: "Jablká 🍎 sú chrumkavé! Banány 🍌 sú žlté a sladké! Jahody 🍓 sú červené a šťavnaté!",
        imageEmoji: "🍎",
        funFact: "Jablká plávajú vo vode, pretože majú vzduch vnútri!"
      },
      {
        id: "lesson-2",
        title: "Zelenina",
        content: "Mrkva 🥕 je dobrá pre oči! Brokolica 🥦 vyzerá ako malé stromy! Paradajky 🍅 sú červené!",
        imageEmoji: "🥕",
        funFact: "Paradajka je vlastne ovocie, nie zelenina!"
      },
      {
        id: "lesson-3",
        title: "Jedlá z celého sveta",
        content: "Pizza 🍕 je z Talianska! Sushi 🍣 je z Japonska! Burger 🍔 je z Ameriky!",
        imageEmoji: "🍕",
        funFact: "Pizza bola prvýkrát urobená pre kráľovnú!"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "Akú farbu má banán?",
        options: ["Červenú", "Žltú", "Zelenú", "Modrú"],
        correctAnswer: "Žltú",
        explanation: "Banány sú žlté! 🍌"
      },
      {
        id: "q2",
        question: "Ktoré jedlo je z Talianska?",
        options: ["Sushi", "Pizza", "Burger", "Taco"],
        correctAnswer: "Pizza",
        explanation: "Pizza pochádza z Talianska! 🍕"
      },
      {
        id: "q3",
        question: "Čo je dobré pre oči?",
        options: ["Mrkva", "Sladkosti", "Chipsy", "Kola"],
        correctAnswer: "Mrkva",
        explanation: "Mrkva je zdravá a dobrá pre tvoje oči! 🥕"
      }
    ]
  },
  family: {
    lessons: [
      {
        id: "lesson-1",
        title: "Moja rodina",
        content: "Mama 👩 a Otec 👨 sa o nás starajú! Súrodenci sú bratia a sestry! Rodina je láska! ❤️",
        imageEmoji: "👨‍👩‍👧‍👦",
        funFact: "Rodiny môžu byť rôzne veľké - malé alebo veľké!"
      },
      {
        id: "lesson-2",
        title: "Starí rodičia",
        content: "Babka 👵 a Dedko 👴 sú mama a otec našich rodičov! Rozprávajú nám príbehy!",
        imageEmoji: "👵",
        funFact: "Starí rodičia majú veľa múdrosti zo svojho života!"
      },
      {
        id: "lesson-3",
        title: "Rodinné aktivity",
        content: "Rodiny hrajú spolu hry! Cestujú na dovolenky! Večerajú spolu! Milujú sa! 💕",
        imageEmoji: "🏡",
        funFact: "Spoločný čas s rodinou robí všetkých šťastnými!"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "Kto je mama tvojej mamy?",
        options: ["Sestra", "Babka", "Teta", "Bratranca"],
        correctAnswer: "Babka",
        explanation: "Mama tvojej mamy je tvoja babka! 👵"
      },
      {
        id: "q2",
        question: "Čo rodiny robia spolu?",
        options: ["Hrajú hry", "Cestujú", "Večerajú", "Všetko z toho"],
        correctAnswer: "Všetko z toho",
        explanation: "Rodiny robia veľa vecí spolu! 👨‍👩‍👧‍👦"
      },
      {
        id: "q3",
        question: "Čo rodiny zdieľajú?",
        options: ["Lásku", "Iba jedlo", "Iba hračky", "Nič"],
        correctAnswer: "Lásku",
        explanation: "Rodiny zdieľajú lásku a starostlivosť! ❤️"
      }
    ]
  },
  emotions: {
    lessons: [
      {
        id: "lesson-1",
        title: "Šťastie a Smútok",
        content: "Keď sme šťastní 😊, usmievame sa! Keď sme smutní 😢, plačeme! Obe sú v poriadku!",
        imageEmoji: "😊",
        funFact: "Smiech nás robí zdravšími a šťastnejšími!"
      },
      {
        id: "lesson-2",
        title: "Hnev a Strach",
        content: "Hnev 😠 je, keď sme frustrovaní! Strach 😨 nás varuje pred nebezpečenstvom! Môžeme o nich hovoriť!",
        imageEmoji: "😠",
        funFact: "Všetci cítime rôzne emócie každý deň!"
      },
      {
        id: "lesson-3",
        title: "Láska a Priateľstvo",
        content: "Láska ❤️ je, keď sa staráme o niekoho! Priateľstvo je špeciálne! Objatia pomáhajú! 🤗",
        imageEmoji: "❤️",
        funFact: "Objatia uvoľňujú hormóny šťastia v našom mozgu!"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "Čo robíme, keď sme šťastní?",
        options: ["Plačeme", "Usmievame sa", "Spíme", "Kričíme"],
        correctAnswer: "Usmievame sa",
        explanation: "Keď sme šťastní, usmievame sa! 😊"
      },
      {
        id: "q2",
        question: "Je v poriadku cítiť smútok?",
        options: ["Áno", "Nie", "Niekedy", "Neviem"],
        correctAnswer: "Áno",
        explanation: "Je v poriadku cítiť všetky emócie! 😢"
      },
      {
        id: "q3",
        question: "Čo nám pomáha cítiť sa lepšie?",
        options: ["Objatia", "Kričanie", "Schovávanie", "Ignorovanie"],
        correctAnswer: "Objatia",
        explanation: "Objatia nás robia šťastnými! 🤗"
      }
    ]
  }
};
