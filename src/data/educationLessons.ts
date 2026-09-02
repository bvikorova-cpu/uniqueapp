// Real Education Hub curriculum (no placeholders).
// Progress is stored in education_lesson_progress (15 XP / lesson)
// and quiz results in education_exercise_submissions (10 XP / exercise).

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

export interface HubLesson {
  key: string;
  title: string;
  minutes: number;
  summary: string;
  sections: { heading: string; body: string }[];
  keyPoints: string[];
  quiz: QuizQuestion[];
}

export interface HubCourse {
  key: string;
  title: string;
  subject: string;
  icon: string;
  description: string;
  lessons: HubLesson[];
}

export const HUB_COURSES: HubCourse[] = [
  {
    key: "math-foundations",
    title: "Math Foundations",
    subject: "math",
    icon: "Calculator",
    description: "Fractions, percentages, algebra and geometry you actually use.",
    lessons: [
      {
        key: "fractions",
        title: "Fractions & Decimals",
        minutes: 8,
        summary: "Convert, compare and combine fractions and decimals with confidence.",
        sections: [
          {
            heading: "What a fraction really means",
            body: "A fraction a/b means: split a whole into b equal parts and take a of them. 3/4 is three of four equal parts. The bottom number (denominator) sets the part size, the top number (numerator) counts the parts. Bigger denominator means smaller pieces, which is why 1/8 is less than 1/3.",
          },
          {
            heading: "Adding and subtracting",
            body: "You can only add parts of the same size, so first make the denominators equal. 1/3 + 1/4 -> multiply to a common denominator 12: 4/12 + 3/12 = 7/12. Then simplify by dividing both numbers by their greatest common divisor.",
          },
          {
            heading: "Multiplying and dividing",
            body: "Multiplying is straightforward: multiply tops and bottoms (2/3 x 3/5 = 6/15 = 2/5). Dividing means multiplying by the reciprocal: 2/3 : 4/5 = 2/3 x 5/4 = 10/12 = 5/6.",
          },
          {
            heading: "Decimals as fractions",
            body: "Every decimal is a fraction with a power of ten underneath: 0.25 = 25/100 = 1/4, 0.6 = 6/10 = 3/5. To convert a fraction to a decimal, just divide the top by the bottom: 7/8 = 0.875.",
          },
        ],
        keyPoints: [
          "Common denominator first, then add or subtract.",
          "Division by a fraction = multiplication by its reciprocal.",
          "0.25 = 1/4, 0.5 = 1/2, 0.75 = 3/4 — memorise the common pairs.",
        ],
        quiz: [
          { question: "1/2 + 1/3 = ?", options: ["2/5", "5/6", "1/6", "3/5"], correct: "5/6", explanation: "Common denominator 6: 3/6 + 2/6 = 5/6." },
          { question: "What is 3/4 as a decimal?", options: ["0.34", "0.75", "0.43", "1.33"], correct: "0.75", explanation: "3 divided by 4 = 0.75." },
          { question: "2/3 : 4/9 = ?", options: ["3/2", "8/27", "1/2", "6/9"], correct: "3/2", explanation: "2/3 x 9/4 = 18/12 = 3/2." },
        ],
      },
      {
        key: "percentages",
        title: "Percentages in Real Life",
        minutes: 7,
        summary: "Discounts, tips, VAT and interest — one formula covers them all.",
        sections: [
          { heading: "Percent = per hundred", body: "25% means 25 per 100, i.e. the fraction 0.25. To take a percent of a value, multiply: 25% of 80 = 0.25 x 80 = 20." },
          { heading: "Discounts and increases", body: "A 30% discount leaves 70%: new price = old x 0.70. A 20% increase means multiplying by 1.20. Chaining works by multiplying factors: -30% then -10% is x0.70 x 0.90 = x0.63, so a 37% total discount, not 40%." },
          { heading: "Finding the original", body: "If a jacket costs 63 EUR after a 30% discount, divide instead of multiply: 63 / 0.70 = 90 EUR original price." },
          { heading: "Percentage change", body: "Change = (new - old) / old x 100. From 40 to 50: (50-40)/40 = 0.25 -> +25%. From 50 back to 40 is -20% — percentages are not symmetric." },
        ],
        keyPoints: [
          "Multiply by (1 - rate) for a discount, (1 + rate) for an increase.",
          "Divide by the factor to reverse a percentage change.",
          "Successive percentages multiply, they never add.",
        ],
        quiz: [
          { question: "A 45 EUR item is 20% off. Final price?", options: ["25 EUR", "36 EUR", "38 EUR", "40 EUR"], correct: "36 EUR", explanation: "45 x 0.80 = 36." },
          { question: "Price rose from 80 to 100. Percentage change?", options: ["+20%", "+25%", "+18%", "+80%"], correct: "+25%", explanation: "(100-80)/80 = 0.25." },
          { question: "After a 25% discount you pay 60 EUR. Original price?", options: ["75 EUR", "80 EUR", "85 EUR", "90 EUR"], correct: "80 EUR", explanation: "60 / 0.75 = 80." },
        ],
      },
      {
        key: "algebra-basics",
        title: "Algebra Basics",
        minutes: 9,
        summary: "Solve linear equations by keeping both sides balanced.",
        sections: [
          { heading: "A letter is just an unknown number", body: "In 3x + 4 = 19, x is the number that makes the statement true. Your job is to isolate it." },
          { heading: "Balance the scales", body: "Whatever you do to one side you do to the other. Subtract 4: 3x = 15. Divide by 3: x = 5. Always check by substituting back: 3(5)+4 = 19." },
          { heading: "Brackets and like terms", body: "Expand first: 2(x + 3) = 2x + 6. Then collect like terms: 2x + 6 + 3x = 5x + 6. Only terms with the same letter and power can be combined." },
          { heading: "Word problems", body: "Name the unknown, write the sentence as an equation, solve, then check the units. 'A number tripled and increased by 4 gives 19' becomes 3x + 4 = 19." },
        ],
        keyPoints: [
          "Do the same operation to both sides to keep equality.",
          "Undo operations in reverse order: +/- first, then x/:.",
          "Always substitute your answer back to verify.",
        ],
        quiz: [
          { question: "Solve 5x - 7 = 18.", options: ["x = 3", "x = 5", "x = 4", "x = 6"], correct: "x = 5", explanation: "5x = 25, so x = 5." },
          { question: "Expand 3(2x - 4).", options: ["6x - 4", "6x - 12", "5x - 12", "6x + 12"], correct: "6x - 12", explanation: "Multiply both terms by 3." },
          { question: "Simplify 4x + 2 - x + 5.", options: ["3x + 7", "5x + 7", "3x + 3", "4x + 7"], correct: "3x + 7", explanation: "4x - x = 3x and 2 + 5 = 7." },
        ],
      },
      {
        key: "geometry",
        title: "Geometry You Can Measure",
        minutes: 8,
        summary: "Area, perimeter, circles and the Pythagorean theorem.",
        sections: [
          { heading: "Perimeter vs area", body: "Perimeter is the distance around a shape (metres); area is the surface it covers (square metres). A rectangle 5 x 3 has perimeter 2(5+3) = 16 m and area 15 m2." },
          { heading: "Triangles", body: "Area = base x height / 2, where the height is perpendicular to the chosen base. Angles in any triangle always sum to 180 degrees." },
          { heading: "Circles", body: "Circumference = 2 x pi x r, area = pi x r^2. Doubling the radius quadruples the area — that is why a 32 cm pizza is far more than twice a 16 cm one." },
          { heading: "Pythagorean theorem", body: "In a right triangle a^2 + b^2 = c^2, with c the longest side. A 3-4-5 triangle works: 9 + 16 = 25. Builders use it to check square corners." },
        ],
        keyPoints: [
          "Triangle area = base x height / 2.",
          "Circle area = pi r^2, circumference = 2 pi r.",
          "Right triangles obey a^2 + b^2 = c^2.",
        ],
        quiz: [
          { question: "Area of a triangle with base 10 and height 6?", options: ["60", "30", "16", "24"], correct: "30", explanation: "10 x 6 / 2 = 30." },
          { question: "A right triangle has legs 6 and 8. Hypotenuse?", options: ["10", "12", "14", "9"], correct: "10", explanation: "36 + 64 = 100, root = 10." },
          { question: "If a circle's radius doubles, its area...", options: ["doubles", "triples", "quadruples", "stays equal"], correct: "quadruples", explanation: "Area scales with r squared." },
        ],
      },
    ],
  },
  {
    key: "science-essentials",
    title: "Science Essentials",
    subject: "science",
    icon: "FlaskConical",
    description: "Cells, energy, the periodic table and how science is done.",
    lessons: [
      {
        key: "scientific-method",
        title: "The Scientific Method",
        minutes: 6,
        summary: "How a question becomes reliable knowledge.",
        sections: [
          { heading: "Observation to hypothesis", body: "Science starts with a specific question. A hypothesis is a testable prediction — 'plants grow taller with more light' can be tested; 'plants like light' cannot." },
          { heading: "Controlled experiments", body: "Change one variable (independent), measure the effect (dependent), keep everything else constant (controls). Without a control group you cannot attribute the change to your variable." },
          { heading: "Evidence and error", body: "Repeat measurements, report uncertainty, and beware correlation without causation. Peer review and replication are what separate science from opinion." },
        ],
        keyPoints: [
          "A hypothesis must be falsifiable.",
          "Change one variable at a time and keep a control group.",
          "Correlation is not causation.",
        ],
        quiz: [
          { question: "Which is a testable hypothesis?", options: ["Music is beautiful", "Plants watered daily grow taller than weekly", "Cats are smarter", "Space is fascinating"], correct: "Plants watered daily grow taller than weekly", explanation: "It predicts a measurable outcome." },
          { question: "The variable you deliberately change is the...", options: ["dependent variable", "independent variable", "control", "constant"], correct: "independent variable", explanation: "You manipulate the independent variable." },
          { question: "Why use a control group?", options: ["To double the data", "To compare against no treatment", "To speed the experiment", "To avoid maths"], correct: "To compare against no treatment", explanation: "It isolates the effect of your variable." },
        ],
      },
      {
        key: "cells",
        title: "Cells & Life",
        minutes: 8,
        summary: "The smallest unit of life and what its parts do.",
        sections: [
          { heading: "Every living thing is cellular", body: "Bacteria are a single cell; a human has roughly 30 trillion. All cells have a membrane, genetic material and a way to make proteins." },
          { heading: "Key organelles", body: "The nucleus stores DNA, mitochondria release energy (ATP) from food, ribosomes build proteins, and chloroplasts in plants capture light for photosynthesis." },
          { heading: "Prokaryote vs eukaryote", body: "Prokaryotes (bacteria) have no nucleus and no membrane-bound organelles. Eukaryotes (plants, animals, fungi) do — which allows far more internal specialisation." },
        ],
        keyPoints: [
          "Mitochondria produce ATP, the cell's energy currency.",
          "Chloroplasts exist only in plants and algae.",
          "Bacteria are prokaryotes: no nucleus.",
        ],
        quiz: [
          { question: "Which organelle produces most of the cell's energy?", options: ["Nucleus", "Ribosome", "Mitochondrion", "Vacuole"], correct: "Mitochondrion", explanation: "It makes ATP via respiration." },
          { question: "Photosynthesis happens in the...", options: ["chloroplast", "nucleus", "membrane", "lysosome"], correct: "chloroplast", explanation: "Chlorophyll there captures light." },
          { question: "Bacteria lack a...", options: ["membrane", "nucleus", "DNA", "ribosome"], correct: "nucleus", explanation: "They are prokaryotic." },
        ],
      },
      {
        key: "energy",
        title: "Energy & Forces",
        minutes: 8,
        summary: "Energy never disappears — it only changes form.",
        sections: [
          { heading: "Forms of energy", body: "Kinetic (motion), potential (position), thermal, chemical, electrical, nuclear. A falling ball converts potential energy into kinetic energy." },
          { heading: "Conservation", body: "Energy in a closed system is constant. Nothing is 'lost' — it becomes heat, sound or friction, forms that are harder to reuse." },
          { heading: "Forces and motion", body: "Newton: an object keeps its velocity unless a force acts on it (1st law); F = m x a (2nd law); every action has an equal and opposite reaction (3rd law)." },
        ],
        keyPoints: [
          "Energy is conserved; it changes form.",
          "F = m x a links force, mass and acceleration.",
          "Friction converts useful energy to heat.",
        ],
        quiz: [
          { question: "A ball falling converts potential energy into...", options: ["chemical", "kinetic", "nuclear", "no energy"], correct: "kinetic", explanation: "Height becomes motion." },
          { question: "F = m x a describes Newton's...", options: ["1st law", "2nd law", "3rd law", "law of gravity"], correct: "2nd law", explanation: "Force equals mass times acceleration." },
          { question: "Doubling mass at the same force will...", options: ["double acceleration", "halve acceleration", "not change it", "stop motion"], correct: "halve acceleration", explanation: "a = F/m." },
        ],
      },
      {
        key: "periodic-table",
        title: "The Periodic Table",
        minutes: 7,
        summary: "Why elements in a column behave alike.",
        sections: [
          { heading: "Atoms and elements", body: "An atom's identity is its number of protons (atomic number). Hydrogen has 1, carbon 6, oxygen 8. Isotopes differ only in neutrons." },
          { heading: "Groups and periods", body: "Columns (groups) share outer-electron count, so they react similarly: group 1 alkali metals are highly reactive, group 18 noble gases barely react at all." },
          { heading: "Bonds", body: "Metals give electrons away, non-metals take them — that transfer is an ionic bond (NaCl). Shared electrons form covalent bonds (H2O)." },
        ],
        keyPoints: [
          "Atomic number = number of protons.",
          "Same group = similar chemistry.",
          "Ionic = transfer, covalent = sharing.",
        ],
        quiz: [
          { question: "The atomic number counts the...", options: ["neutrons", "protons", "electrons lost", "isotopes"], correct: "protons", explanation: "Protons define the element." },
          { question: "Which group is almost unreactive?", options: ["Alkali metals", "Halogens", "Noble gases", "Transition metals"], correct: "Noble gases", explanation: "Their outer shell is full." },
          { question: "Water (H2O) is held together by...", options: ["ionic bonds", "covalent bonds", "metallic bonds", "no bonds"], correct: "covalent bonds", explanation: "Electrons are shared." },
        ],
      },
    ],
  },
  {
    key: "study-skills",
    title: "Learn How to Learn",
    subject: "study",
    icon: "Brain",
    description: "Evidence-based techniques that make studying far more efficient.",
    lessons: [
      {
        key: "active-recall",
        title: "Active Recall",
        minutes: 6,
        summary: "Testing yourself beats re-reading, every time.",
        sections: [
          { heading: "Why re-reading fails", body: "Recognising text feels like knowing it. Recall — retrieving without looking — is what strengthens memory, even when it feels harder and slower." },
          { heading: "How to practise", body: "Close the book and write everything you remember. Turn headings into questions. Use flashcards where the answer is hidden until you commit to one." },
          { heading: "Mistakes are useful", body: "A failed retrieval attempt followed by feedback produces stronger learning than a correct but effortless one." },
        ],
        keyPoints: [
          "Retrieval > rereading.",
          "Turn notes into questions.",
          "Feedback right after a wrong answer is the highest-value moment.",
        ],
        quiz: [
          { question: "Which is active recall?", options: ["Highlighting", "Re-reading notes", "Answering from memory", "Copying slides"], correct: "Answering from memory", explanation: "Retrieval strengthens memory." },
          { question: "Feeling of fluency while re-reading is...", options: ["proof of learning", "a false signal", "irrelevant", "a memory boost"], correct: "a false signal", explanation: "Recognition is not recall." },
          { question: "Best moment to learn from an error is...", options: ["a week later", "immediately after feedback", "never", "before the test"], correct: "immediately after feedback", explanation: "Correction closes the gap while it is fresh." },
        ],
      },
      {
        key: "spaced-repetition",
        title: "Spaced Repetition",
        minutes: 6,
        summary: "Review just before you forget, and review less often over time.",
        sections: [
          { heading: "The forgetting curve", body: "Memory decays fast at first, then slows. Reviewing at the right moment resets the curve and flattens it." },
          { heading: "Intervals that work", body: "A typical ladder: 1 day, 3 days, 7 days, 16 days, 35 days. Cards you get wrong drop back to a short interval; easy cards get pushed further out." },
          { heading: "Why cramming loses", body: "Massed practice produces a spike that decays within days. The same total time spread over weeks yields far higher long-term retention." },
        ],
        keyPoints: [
          "Expand intervals for easy items, shrink them for hard ones.",
          "Distributed practice beats cramming for retention.",
          "Consistency matters more than session length.",
        ],
        quiz: [
          { question: "Spaced repetition means reviewing...", options: ["all at once", "at expanding intervals", "only before exams", "randomly"], correct: "at expanding intervals", explanation: "Intervals grow as recall strengthens." },
          { question: "A card you answered wrong should be shown...", options: ["much later", "sooner", "never again", "at the same interval"], correct: "sooner", explanation: "Weak items need shorter intervals." },
          { question: "Cramming mostly improves...", options: ["long-term memory", "short-term performance", "recall speed", "nothing at all"], correct: "short-term performance", explanation: "It decays quickly." },
        ],
      },
      {
        key: "focus",
        title: "Focus & Deep Work",
        minutes: 7,
        summary: "Protect attention, batch distractions, and finish sessions on purpose.",
        sections: [
          { heading: "Context switching costs", body: "Every interruption forces your brain to reload context. Notifications can cost far more than the seconds they take to read." },
          { heading: "Structured sessions", body: "Pick one outcome, set 25-50 minutes, phone in another room, then take a real break. Write down intrusive thoughts instead of acting on them." },
          { heading: "Energy management", body: "Schedule hard material at your personal peak hours, sleep 7-9 hours (memory consolidates in sleep), and move daily — exercise measurably improves learning." },
        ],
        keyPoints: [
          "One outcome per session.",
          "Sleep is part of studying, not the opposite of it.",
          "Capture distractions on paper, deal with them later.",
        ],
        quiz: [
          { question: "Interruptions are costly mainly because of...", options: ["boredom", "context reloading", "eye strain", "noise"], correct: "context reloading", explanation: "Restoring mental context takes time." },
          { question: "Memory consolidation largely happens during...", options: ["sleep", "cramming", "meals", "reading aloud"], correct: "sleep", explanation: "Sleep stabilises new memories." },
          { question: "Best response to an intrusive thought mid-session?", options: ["Act on it now", "Write it down and continue", "Stop studying", "Ignore forever"], correct: "Write it down and continue", explanation: "Capture preserves focus." },
        ],
      },
      {
        key: "note-taking",
        title: "Notes That Work",
        minutes: 6,
        summary: "Write fewer words, connect more ideas.",
        sections: [
          { heading: "Do not transcribe", body: "Verbatim notes bypass thinking. Summarise in your own words — the compression is where understanding happens." },
          { heading: "Structure", body: "Cornell layout: cues on the left, notes on the right, summary at the bottom. Or atomic notes: one idea per note, linked to related ideas." },
          { heading: "Review loop", body: "Within 24 hours, turn each note into one question and answer it from memory. Notes you never revisit are wasted effort." },
        ],
        keyPoints: [
          "Paraphrase instead of copying.",
          "One idea per note, then link ideas.",
          "Convert notes into questions within a day.",
        ],
        quiz: [
          { question: "Verbatim note-taking tends to...", options: ["deepen understanding", "reduce processing", "save memory", "improve recall"], correct: "reduce processing", explanation: "Copying skips comprehension." },
          { question: "In Cornell notes the bottom section holds the...", options: ["cues", "summary", "diagrams", "sources"], correct: "summary", explanation: "Summary closes the page." },
          { question: "Notes are most valuable when...", options: ["long", "handwritten", "revisited and questioned", "colourful"], correct: "revisited and questioned", explanation: "Review turns notes into memory." },
        ],
      },
    ],
  },
  {
    key: "digital-literacy",
    title: "Digital & Money Literacy",
    subject: "life",
    icon: "ShieldCheck",
    description: "Stay safe online, judge sources, and handle everyday money maths.",
    lessons: [
      {
        key: "online-safety",
        title: "Online Safety",
        minutes: 7,
        summary: "Passwords, phishing and privacy basics that prevent most incidents.",
        sections: [
          { heading: "Passwords", body: "Length beats complexity. Use a unique passphrase per service and a password manager; enable two-factor authentication everywhere it is offered." },
          { heading: "Phishing", body: "Attackers create urgency ('your account will be closed in 24 hours'). Check the sender domain, never open unexpected attachments, and open services by typing the address yourself." },
          { heading: "Privacy hygiene", body: "Share less than feels natural: location, ID documents and payment data are the most abused. Review app permissions and keep software updated." },
        ],
        keyPoints: [
          "One unique password per site + 2FA.",
          "Urgency is the number one phishing signal.",
          "Updates close the holes attackers rely on.",
        ],
        quiz: [
          { question: "Strongest practical password strategy?", options: ["Short but complex", "Long unique passphrase per site", "One password everywhere", "Your birthday"], correct: "Long unique passphrase per site", explanation: "Length plus uniqueness limits damage." },
          { question: "A classic phishing signal is...", options: ["a polite tone", "artificial urgency", "correct spelling", "a plain-text email"], correct: "artificial urgency", explanation: "Pressure prevents careful checks." },
          { question: "Two-factor authentication adds...", options: ["a second independent check", "a longer password", "encryption of files", "a VPN"], correct: "a second independent check", explanation: "Something you have plus something you know." },
        ],
      },
      {
        key: "source-checking",
        title: "Judging Sources",
        minutes: 6,
        summary: "Separate evidence from noise before you share it.",
        sections: [
          { heading: "Who says it and why", body: "Check the author, the publisher and their incentives. Primary sources (data, papers, official records) outrank commentary about them." },
          { heading: "Lateral reading", body: "Instead of studying a suspicious page harder, leave it and search what other independent sources say about the claim and the site." },
          { heading: "Common traps", body: "Cherry-picked charts, missing sample sizes, screenshots without context and AI-generated images. Reverse image search takes five seconds." },
        ],
        keyPoints: [
          "Prefer primary sources.",
          "Read laterally: verify from outside the page.",
          "No sample size, no conclusion.",
        ],
        quiz: [
          { question: "Lateral reading means...", options: ["reading the page twice", "checking other sources about it", "skimming headlines", "reading the comments"], correct: "checking other sources about it", explanation: "Verification comes from outside." },
          { question: "Which is a primary source?", options: ["A blog summary", "The original study data", "A tweet about it", "A news headline"], correct: "The original study data", explanation: "Primary = the original record." },
          { question: "A chart with no axis labels should be...", options: ["trusted", "treated as unverified", "shared quickly", "ignored forever"], correct: "treated as unverified", explanation: "Unlabelled data cannot be checked." },
        ],
      },
      {
        key: "budget-math",
        title: "Everyday Money Maths",
        minutes: 8,
        summary: "Budgets, interest and the true cost of instalments.",
        sections: [
          { heading: "Budget structure", body: "Split income into needs, wants and savings — for example 50/30/20. Track for one month before changing anything; guesses are usually wrong." },
          { heading: "Compound interest", body: "Value = principal x (1 + r)^n. 1000 EUR at 5% for 10 years becomes about 1629 EUR. The same maths works against you on debt." },
          { heading: "Instalments and APR", body: "'0% instalments' can hide fees. Compare total paid, not the monthly amount: 24 x 45 EUR = 1080 EUR for a 950 EUR phone means you paid 130 EUR extra." },
        ],
        keyPoints: [
          "Track before you optimise.",
          "Compound growth follows (1 + r)^n.",
          "Compare total cost, never the monthly payment.",
        ],
        quiz: [
          { question: "In a 50/30/20 budget, 20% goes to...", options: ["rent", "wants", "savings", "taxes"], correct: "savings", explanation: "Needs 50, wants 30, savings 20." },
          { question: "1000 EUR at 10% compounded 2 years equals...", options: ["1200 EUR", "1210 EUR", "1100 EUR", "1020 EUR"], correct: "1210 EUR", explanation: "1000 x 1.1^2 = 1210." },
          { question: "When comparing instalment offers, look at...", options: ["monthly payment", "total amount paid", "advertised rate only", "shop reputation"], correct: "total amount paid", explanation: "Total cost reveals hidden fees." },
        ],
      },
      {
        key: "ai-literacy",
        title: "Using AI Well",
        minutes: 7,
        summary: "Prompting, verification and where AI should not be trusted.",
        sections: [
          { heading: "What a model actually does", body: "It predicts likely continuations of text. That makes it excellent at drafting and explaining, and unreliable for precise facts, fresh news or citations." },
          { heading: "Better prompts", body: "Give role, goal, constraints and format: 'You are a physics tutor. Explain entropy to a 15-year-old in 5 bullet points, no formulas.' Then iterate with corrections." },
          { heading: "Verify and own the result", body: "Check numbers, names and sources independently. Use AI to accelerate your thinking, never to replace it — you remain responsible for what you submit." },
        ],
        keyPoints: [
          "Specify role, goal, constraints, format.",
          "Never trust unverified facts or citations.",
          "AI drafts; you decide.",
        ],
        quiz: [
          { question: "Language models are least reliable for...", options: ["drafting text", "precise facts and citations", "rewriting tone", "brainstorming"], correct: "precise facts and citations", explanation: "They can generate plausible but false details." },
          { question: "A good prompt usually includes...", options: ["only a keyword", "role, goal, constraints, format", "many emojis", "the longest question possible"], correct: "role, goal, constraints, format", explanation: "Structure improves output." },
          { question: "Who is responsible for AI-assisted work you submit?", options: ["The model", "The platform", "You", "Nobody"], correct: "You", explanation: "You own the final output." },
        ],
      },
    ],
  },
];

export const getHubCourse = (key: string) => HUB_COURSES.find((c) => c.key === key);
export const getHubLesson = (courseKey: string, lessonKey: string) => {
  const c = getHubCourse(courseKey);
  return c ? { course: c, lesson: c.lessons.find((l) => l.key === lessonKey) } : { course: undefined, lesson: undefined };
};
export const TOTAL_HUB_LESSONS = HUB_COURSES.reduce((s, c) => s + c.lessons.length, 0);
