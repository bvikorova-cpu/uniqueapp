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
        title: "Transportation on Roads",
        content: "Cars 🚗 drive on roads! Buses 🚌 carry many people! Motorcycles 🏍️ are fast and small!",
        imageEmoji: "🚗",
        funFact: "The first car was invented over 100 years ago!"
      },
      {
        id: "lesson-2",
        title: "Transportation in the Air",
        content: "Airplanes ✈️ fly high in the clouds! Helicopters 🚁 can fly up and down! Rockets 🚀 go to space!",
        imageEmoji: "✈️",
        funFact: "Airplanes can fly faster than sound!"
      },
      {
        id: "lesson-3",
        title: "Transportation on Water",
        content: "Ships 🚢 sail on the sea! Sailboats ⛵ use wind! Submarines swim underwater!",
        imageEmoji: "🚢",
        funFact: "Titanic was the biggest ship of its time!"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What flies in the clouds?",
        options: ["Car", "Airplane", "Ship", "Bus"],
        correctAnswer: "Airplane",
        explanation: "Airplanes fly high in the clouds! ✈️"
      },
      {
        id: "q2",
        question: "Where do ships sail?",
        options: ["On road", "In air", "On water", "Underground"],
        correctAnswer: "On water",
        explanation: "Ships sail on water! 🚢"
      },
      {
        id: "q3",
        question: "What goes to space?",
        options: ["Rocket", "Car", "Bus", "Ship"],
        correctAnswer: "Rocket",
        explanation: "Rockets go to space! 🚀"
      }
    ]
  },
  food: {
    lessons: [
      {
        id: "lesson-1",
        title: "Fruits",
        content: "Apples 🍎 are crunchy! Bananas 🍌 are yellow and sweet! Strawberries 🍓 are red and juicy!",
        imageEmoji: "🍎",
        funFact: "Apples float in water because they have air inside!"
      },
      {
        id: "lesson-2",
        title: "Vegetables",
        content: "Carrots 🥕 are good for your eyes! Broccoli 🥦 looks like little trees! Tomatoes 🍅 are red!",
        imageEmoji: "🥕",
        funFact: "A tomato is actually a fruit, not a vegetable!"
      },
      {
        id: "lesson-3",
        title: "Foods from Around the World",
        content: "Pizza 🍕 is from Italy! Sushi 🍣 is from Japan! Burgers 🍔 are from America!",
        imageEmoji: "🍕",
        funFact: "Pizza was first made for a queen!"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What color is a banana?",
        options: ["Red", "Yellow", "Green", "Blue"],
        correctAnswer: "Yellow",
        explanation: "Bananas are yellow! 🍌"
      },
      {
        id: "q2",
        question: "Which food is from Italy?",
        options: ["Sushi", "Pizza", "Burger", "Taco"],
        correctAnswer: "Pizza",
        explanation: "Pizza comes from Italy! 🍕"
      },
      {
        id: "q3",
        question: "What is good for your eyes?",
        options: ["Carrots", "Candy", "Chips", "Soda"],
        correctAnswer: "Carrots",
        explanation: "Carrots are healthy and good for your eyes! 🥕"
      }
    ]
  },
  family: {
    lessons: [
      {
        id: "lesson-1",
        title: "My Family",
        content: "Mom 👩 and Dad 👨 take care of us! Siblings are brothers and sisters! Family is love! ❤️",
        imageEmoji: "👨‍👩‍👧‍👦",
        funFact: "Families can be different sizes - small or big!"
      },
      {
        id: "lesson-2",
        title: "Grandparents",
        content: "Grandma 👵 and Grandpa 👴 are our parents' parents! They tell us stories!",
        imageEmoji: "👵",
        funFact: "Grandparents have lots of wisdom from their lives!"
      },
      {
        id: "lesson-3",
        title: "Family Activities",
        content: "Families play games together! Travel on vacations! Eat dinner together! Love each other! 💕",
        imageEmoji: "🏡",
        funFact: "Spending time with family makes everyone happy!"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "Who is your mom's mom?",
        options: ["Sister", "Grandma", "Aunt", "Cousin"],
        correctAnswer: "Grandma",
        explanation: "Your mom's mom is your grandma! 👵"
      },
      {
        id: "q2",
        question: "What do families do together?",
        options: ["Play games", "Travel", "Eat dinner", "All of these"],
        correctAnswer: "All of these",
        explanation: "Families do many things together! 👨‍👩‍👧‍👦"
      },
      {
        id: "q3",
        question: "What do families share?",
        options: ["Love", "Only food", "Only toys", "Nothing"],
        correctAnswer: "Love",
        explanation: "Families share love and care! ❤️"
      }
    ]
  },
  emotions: {
    lessons: [
      {
        id: "lesson-1",
        title: "Happy and Sad",
        content: "When we're happy 😊, we smile! When we're sad 😢, we cry! Both are okay!",
        imageEmoji: "😊",
        funFact: "Laughing makes us healthier and happier!"
      },
      {
        id: "lesson-2",
        title: "Anger and Fear",
        content: "Anger 😠 is when we're frustrated! Fear 😨 warns us of danger! We can talk about them!",
        imageEmoji: "😠",
        funFact: "Everyone feels different emotions every day!"
      },
      {
        id: "lesson-3",
        title: "Love and Friendship",
        content: "Love ❤️ is when we care about someone! Friendship is special! Hugs help! 🤗",
        imageEmoji: "❤️",
        funFact: "Hugs release happiness hormones in our brain!"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What do we do when we're happy?",
        options: ["Cry", "Smile", "Sleep", "Scream"],
        correctAnswer: "Smile",
        explanation: "When we're happy, we smile! 😊"
      },
      {
        id: "q2",
        question: "Is it okay to feel sad?",
        options: ["Yes", "No", "Sometimes", "Don't know"],
        correctAnswer: "Yes",
        explanation: "It's okay to feel all emotions! 😢"
      },
      {
        id: "q3",
        question: "What helps us feel better?",
        options: ["Hugs", "Yelling", "Hiding", "Ignoring"],
        correctAnswer: "Hugs",
        explanation: "Hugs make us happy! 🤗"
      }
    ]
  },
  professions: {
    lessons: [
      {
        id: "lesson-1",
        title: "Helping Professions",
        content: "Doctors 👨‍⚕️ make us feel better! Teachers 👩‍🏫 help us learn! Firefighters 🚒 save people!",
        imageEmoji: "👨‍⚕️",
        funFact: "Doctors study for many years to help people!"
      },
      {
        id: "lesson-2",
        title: "Creative Professions",
        content: "Artists 🎨 paint beautiful pictures! Musicians 🎵 make lovely music! Chefs 👨‍🍳 cook yummy food!",
        imageEmoji: "🎨",
        funFact: "Some artists become famous all around the world!"
      },
      {
        id: "lesson-3",
        title: "Building Professions",
        content: "Engineers 👷 build bridges! Architects design buildings! Construction workers make our homes!",
        imageEmoji: "👷",
        funFact: "The tallest building in the world is over 800 meters high!"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "Who helps us when we're sick?",
        options: ["Teacher", "Doctor", "Chef", "Artist"],
        correctAnswer: "Doctor",
        explanation: "Doctors help us feel better! 👨‍⚕️"
      },
      {
        id: "q2",
        question: "Who cooks food in restaurants?",
        options: ["Chef", "Firefighter", "Teacher", "Engineer"],
        correctAnswer: "Chef",
        explanation: "Chefs cook delicious food! 👨‍🍳"
      },
      {
        id: "q3",
        question: "Who builds bridges?",
        options: ["Doctor", "Artist", "Engineer", "Musician"],
        correctAnswer: "Engineer",
        explanation: "Engineers build amazing structures! 👷"
      }
    ]
  },
  household: {
    lessons: [
      {
        id: "lesson-1",
        title: "Cleaning Up",
        content: "We clean our toys 🧸 after playing! Sweep the floor 🧹! Wash the dishes 🍽️! Keep things tidy!",
        imageEmoji: "🧹",
        funFact: "Cleaning together makes the work faster and fun!"
      },
      {
        id: "lesson-2",
        title: "Cooking and Eating",
        content: "We help prepare meals 🥗! Set the table 🍽️! Eat together as a family! Clean up after!",
        imageEmoji: "🍽️",
        funFact: "Cooking together is a great way to learn and bond!"
      },
      {
        id: "lesson-3",
        title: "Taking Care of Our Home",
        content: "Water the plants 🌱! Make our bed 🛏️! Organize our room! Help with laundry 👕!",
        imageEmoji: "🌱",
        funFact: "Plants help clean the air in our homes!"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What should we do after playing with toys?",
        options: ["Leave them", "Clean them up", "Break them", "Hide them"],
        correctAnswer: "Clean them up",
        explanation: "We should clean up our toys! 🧸"
      },
      {
        id: "q2",
        question: "Why do we water plants?",
        options: ["For fun", "They need it", "It's messy", "No reason"],
        correctAnswer: "They need it",
        explanation: "Plants need water to grow! 🌱"
      },
      {
        id: "q3",
        question: "Who should help with household chores?",
        options: ["Only adults", "Everyone", "Only kids", "Nobody"],
        correctAnswer: "Everyone",
        explanation: "Everyone can help at home! 🏡"
      }
    ]
  },
  holidays: {
    lessons: [
      {
        id: "lesson-1",
        title: "Birthday Celebrations",
        content: "Birthdays 🎂 celebrate the day you were born! We have cake! Sing songs! Open presents! 🎁",
        imageEmoji: "🎂",
        funFact: "The birthday song is one of the most sung songs in the world!"
      },
      {
        id: "lesson-2",
        title: "Seasonal Holidays",
        content: "Christmas 🎄 has Santa! Halloween 🎃 has costumes! Easter 🐰 has egg hunts! Fun traditions!",
        imageEmoji: "🎄",
        funFact: "Different countries celebrate holidays in unique ways!"
      },
      {
        id: "lesson-3",
        title: "Family Celebrations",
        content: "We celebrate together! Special meals 🍽️! Decorations ✨! Time with loved ones! Create memories! 📸",
        imageEmoji: "✨",
        funFact: "Celebrations bring families closer together!"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What do we sing on birthdays?",
        options: ["Lullaby", "Birthday song", "Alphabet", "Nothing"],
        correctAnswer: "Birthday song",
        explanation: "We sing the birthday song! 🎂"
      },
      {
        id: "q2",
        question: "Which holiday has costumes?",
        options: ["Birthday", "Halloween", "Easter", "Christmas"],
        correctAnswer: "Halloween",
        explanation: "Halloween is when we wear costumes! 🎃"
      },
      {
        id: "q3",
        question: "Why do we celebrate holidays?",
        options: ["To be together", "To work", "To sleep", "No reason"],
        correctAnswer: "To be together",
        explanation: "Holidays bring us together! ✨"
      }
    ]
  }
};
