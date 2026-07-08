// Registry of all Phase-4 module courses used by the universal
// curriculum + final exam + certificate system.
// Keep in sync with the 6 module pages (MusicProduction, GraphicDesign,
// Photography, DigitalMarketing, PublicSpeaking, FitnessWellness).

export interface ModuleCourseMeta {
  module_key: string;
  module_label: string;
  course_slug: string;
  course_title: string;
  description: string;
  level: string;
  price: number;
  duration: string;
  purchase_type: string; // matches useLearningContent contentType
  skills: string[];
}

export const MODULE_COURSES: ModuleCourseMeta[] = [
  // Music Production
  { module_key: "music-production", module_label: "Music Production", course_slug: "electronic-music", course_title: "Electronic Music Production", description: "Create professional EDM, house, and techno tracks", level: "Intermediate", price: 219, duration: "10 weeks", purchase_type: "music-course", skills: ["Sound design", "Mixing", "Mastering", "Synthesis", "Arrangement"] },
  { module_key: "music-production", module_label: "Music Production", course_slug: "mixing-mastering", course_title: "Mixing & Mastering Mastery", description: "Professional audio engineering for any genre", level: "Advanced", price: 199, duration: "8 weeks", purchase_type: "music-course", skills: ["EQ techniques", "Compression", "Reverb", "Stereo imaging", "Loudness"] },
  { module_key: "music-production", module_label: "Music Production", course_slug: "beat-making", course_title: "Hip-Hop Beat Making", description: "Create hard-hitting beats and produce like the pros", level: "Beginner", price: 179, duration: "6 weeks", purchase_type: "music-course", skills: ["Sampling", "Drum programming", "Melody creation", "808 bass", "Arrangement"] },
  { module_key: "music-production", module_label: "Music Production", course_slug: "songwriting", course_title: "Songwriting & Composition", description: "Write memorable songs with professional techniques", level: "All Levels", price: 159, duration: "7 weeks", purchase_type: "music-course", skills: ["Melody writing", "Lyrics", "Chord progressions", "Song structure", "Hooks"] },

  // Graphic Design
  { module_key: "graphic-design", module_label: "Graphic Design", course_slug: "brand-identity", course_title: "Brand Identity Design", description: "Craft memorable logos and brand systems", level: "Intermediate", price: 189, duration: "8 weeks", purchase_type: "graphic-course", skills: ["Logo design", "Typography", "Color theory", "Brand guidelines", "Vector art"] },
  { module_key: "graphic-design", module_label: "Graphic Design", course_slug: "ui-ux-design", course_title: "UI/UX Design Fundamentals", description: "Design intuitive digital products end-to-end", level: "Beginner", price: 209, duration: "10 weeks", purchase_type: "graphic-course", skills: ["Wireframing", "Prototyping", "User research", "Design systems", "Figma"] },
  { module_key: "graphic-design", module_label: "Graphic Design", course_slug: "illustration", course_title: "Digital Illustration Mastery", description: "From sketch to finished digital illustration", level: "All Levels", price: 169, duration: "9 weeks", purchase_type: "graphic-course", skills: ["Anatomy", "Composition", "Color", "Digital brushes", "Storytelling"] },
  { module_key: "graphic-design", module_label: "Graphic Design", course_slug: "motion-graphics", course_title: "Motion Graphics & Animation", description: "Bring designs to life with motion", level: "Intermediate", price: 229, duration: "10 weeks", purchase_type: "graphic-course", skills: ["Keyframing", "Easing", "Kinetic typography", "After Effects", "Sound sync"] },

  // Photography
  { module_key: "photography", module_label: "Photography", course_slug: "portrait-photography", course_title: "Portrait Photography Mastery", description: "Capture stunning portraits with light and posing", level: "Intermediate", price: 189, duration: "8 weeks", purchase_type: "photo-course", skills: ["Lighting", "Posing", "Retouching", "Composition", "Client work"] },
  { module_key: "photography", module_label: "Photography", course_slug: "landscape-photography", course_title: "Landscape Photography Pro", description: "Epic landscape shots from planning to edit", level: "All Levels", price: 169, duration: "7 weeks", purchase_type: "photo-course", skills: ["Composition", "Golden hour", "Filters", "Panoramas", "Post-processing"] },
  { module_key: "photography", module_label: "Photography", course_slug: "product-photography", course_title: "Product Photography for E-commerce", description: "Studio-grade product shots that sell", level: "Beginner", price: 159, duration: "6 weeks", purchase_type: "photo-course", skills: ["Studio lighting", "Backgrounds", "Focus stacking", "Color accuracy", "Retouching"] },
  { module_key: "photography", module_label: "Photography", course_slug: "wildlife-photography", course_title: "Wildlife Photography Adventure", description: "Field techniques for wildlife photographers", level: "Advanced", price: 199, duration: "9 weeks", purchase_type: "photo-course", skills: ["Long lenses", "Field craft", "Ethics", "Behavior", "Fast focus"] },

  // Digital Marketing
  { module_key: "digital-marketing", module_label: "Digital Marketing", course_slug: "seo-mastery", course_title: "SEO Mastery 2025", description: "Rank on Google with modern SEO", level: "Intermediate", price: 199, duration: "8 weeks", purchase_type: "marketing-course", skills: ["Keyword research", "On-page SEO", "Technical SEO", "Link building", "Analytics"] },
  { module_key: "digital-marketing", module_label: "Digital Marketing", course_slug: "social-media-pro", course_title: "Social Media Marketing Pro", description: "Grow and monetize on every major platform", level: "All Levels", price: 179, duration: "7 weeks", purchase_type: "marketing-course", skills: ["Content strategy", "Community", "Paid social", "Analytics", "Creators"] },
  { module_key: "digital-marketing", module_label: "Digital Marketing", course_slug: "email-marketing", course_title: "Email Marketing Mastery", description: "Build lists and automations that convert", level: "Beginner", price: 149, duration: "6 weeks", purchase_type: "marketing-course", skills: ["List building", "Segmentation", "Automation", "Deliverability", "Copywriting"] },
  { module_key: "digital-marketing", module_label: "Digital Marketing", course_slug: "ppc-advertising", course_title: "PPC Advertising Expert", description: "Profitable ads on Google, Meta and TikTok", level: "Advanced", price: 229, duration: "9 weeks", purchase_type: "marketing-course", skills: ["Google Ads", "Meta Ads", "Bidding", "Landing pages", "Attribution"] },

  // Public Speaking
  { module_key: "public-speaking", module_label: "Public Speaking", course_slug: "confident-presenter", course_title: "Confident Presenter Program", description: "Overcome anxiety and command any room", level: "Beginner", price: 169, duration: "6 weeks", purchase_type: "speaking-course", skills: ["Stage presence", "Anxiety management", "Storytelling", "Voice", "Body language"] },
  { module_key: "public-speaking", module_label: "Public Speaking", course_slug: "ted-style-talks", course_title: "TED-Style Talks Mastery", description: "Craft ideas worth spreading", level: "Intermediate", price: 199, duration: "8 weeks", purchase_type: "speaking-course", skills: ["Message", "Structure", "Delivery", "Slides", "Rehearsal"] },
  { module_key: "public-speaking", module_label: "Public Speaking", course_slug: "corporate-communication", course_title: "Corporate Communication Skills", description: "Executive-level speaking for business", level: "All Levels", price: 179, duration: "7 weeks", purchase_type: "speaking-course", skills: ["Pitching", "Executive presence", "Facilitation", "Difficult conversations", "Q&A"] },
  { module_key: "public-speaking", module_label: "Public Speaking", course_slug: "voice-mastery", course_title: "Voice & Speech Mastery", description: "Train a resonant, expressive voice", level: "All Levels", price: 149, duration: "6 weeks", purchase_type: "speaking-course", skills: ["Breath", "Resonance", "Articulation", "Pitch", "Endurance"] },

  // Fitness & Wellness
  { module_key: "fitness-wellness", module_label: "Fitness & Wellness", course_slug: "yoga-mastery", course_title: "Complete Yoga Mastery", description: "Progressive yoga from beginner to advanced", level: "All Levels", price: 149, duration: "8 weeks", purchase_type: "fitness-course", skills: ["Asanas", "Pranayama", "Alignment", "Sequencing", "Meditation"] },
  { module_key: "fitness-wellness", module_label: "Fitness & Wellness", course_slug: "hiit-bootcamp", course_title: "HIIT Bootcamp Pro", description: "Fat-burning, functional HIIT training", level: "Intermediate", price: 129, duration: "6 weeks", purchase_type: "fitness-course", skills: ["Intervals", "Mobility", "Progression", "Recovery", "Nutrition"] },
  { module_key: "fitness-wellness", module_label: "Fitness & Wellness", course_slug: "mindfulness-meditation", course_title: "Mindfulness & Meditation", description: "A calmer mind in 8 weeks", level: "Beginner", price: 99, duration: "8 weeks", purchase_type: "fitness-course", skills: ["Attention", "Breath", "Body scan", "Compassion", "Habit"] },
  { module_key: "fitness-wellness", module_label: "Fitness & Wellness", course_slug: "nutrition-fundamentals", course_title: "Nutrition Fundamentals", description: "Evidence-based nutrition for real life", level: "All Levels", price: 159, duration: "7 weeks", purchase_type: "fitness-course", skills: ["Macros", "Micros", "Meal planning", "Hydration", "Sustainability"] },

  // ============ Phase 5 ============
  // Creative Writing
  { module_key: "creative-writing", module_label: "Creative Writing", course_slug: "novel-writing", course_title: "Novel Writing ProClass", description: "Write and complete your first novel with expert guidance", level: "Intermediate", price: 199, duration: "12 weeks", purchase_type: "writing-workshop", skills: ["Plot structure", "Character development", "Dialogue", "Pacing", "Editing"] },
  { module_key: "creative-writing", module_label: "Creative Writing", course_slug: "screenwriting", course_title: "Screenwriting for Film & TV", description: "Master the art of writing compelling scripts", level: "All Levels", price: 219, duration: "10 weeks", purchase_type: "writing-workshop", skills: ["Script format", "Scene writing", "Act structure", "Dialogue", "Pitching"] },
  { module_key: "creative-writing", module_label: "Creative Writing", course_slug: "poetry-workshop", course_title: "Poetry Writing Workshop", description: "Express yourself through powerful and evocative poetry", level: "Beginner", price: 149, duration: "6 weeks", purchase_type: "writing-workshop", skills: ["Poetic forms", "Imagery", "Rhythm & meter", "Metaphor", "Voice"] },
  { module_key: "creative-writing", module_label: "Creative Writing", course_slug: "copywriting", course_title: "Professional Copywriting", description: "Write persuasive copy that sells and converts", level: "All Levels", price: 179, duration: "8 weeks", purchase_type: "writing-workshop", skills: ["Headlines", "Email copy", "Sales pages", "Ad copy", "SEO writing"] },

  // Culinary Arts
  { module_key: "culinary-arts", module_label: "Culinary Arts", course_slug: "professional-chef", course_title: "Professional Chef Training", description: "Master culinary techniques from Michelin-star chefs", level: "Advanced", price: 249, duration: "12 weeks", purchase_type: "culinary-program", skills: ["Knife skills", "Sauce making", "Plating", "Menu design", "Kitchen management"] },
  { module_key: "culinary-arts", module_label: "Culinary Arts", course_slug: "pastry-baking", course_title: "Pastry & Baking Mastery", description: "Create stunning pastries, breads, and desserts", level: "Intermediate", price: 189, duration: "8 weeks", purchase_type: "culinary-program", skills: ["Bread baking", "Pastry dough", "Decoration", "Chocolate work", "Flavor pairing"] },
  { module_key: "culinary-arts", module_label: "Culinary Arts", course_slug: "international-cuisine", course_title: "International Cuisine Explorer", description: "Journey through world cuisines and master authentic dishes", level: "All Levels", price: 169, duration: "10 weeks", purchase_type: "culinary-program", skills: ["Italian", "Asian", "French", "Mexican", "Middle Eastern"] },
  { module_key: "culinary-arts", module_label: "Culinary Arts", course_slug: "plant-based-cooking", course_title: "Plant-Based Culinary Arts", description: "Create delicious and nutritious plant-based cuisine", level: "Beginner", price: 149, duration: "6 weeks", purchase_type: "culinary-program", skills: ["Protein alternatives", "Flavor building", "Nutrition", "Meal prep", "Creative plating"] },

  // Language Learning
  { module_key: "language-learning", module_label: "Language Learning", course_slug: "spanish-complete", course_title: "Complete Spanish Mastery", description: "From beginner to fluent speaker with native tutors", level: "All Levels", price: 179, duration: "6 months", purchase_type: "language-program", skills: ["Speaking", "Grammar", "Writing", "Listening", "Culture"] },
  { module_key: "language-learning", module_label: "Language Learning", course_slug: "french-business", course_title: "Business French Professional", description: "Master French for international business and diplomacy", level: "Intermediate", price: 199, duration: "4 months", purchase_type: "language-program", skills: ["Business vocab", "Presentations", "Negotiations", "Email writing"] },
  { module_key: "language-learning", module_label: "Language Learning", course_slug: "german-intensive", course_title: "Intensive German Bootcamp", description: "Fast-track German learning for career advancement", level: "Beginner", price: 189, duration: "3 months", purchase_type: "language-program", skills: ["Conversation", "Grammar", "Pronunciation", "Daily life"] },
  { module_key: "language-learning", module_label: "Language Learning", course_slug: "mandarin-basics", course_title: "Mandarin Chinese Fundamentals", description: "Learn the world's most spoken language from scratch", level: "Beginner", price: 169, duration: "5 months", purchase_type: "language-program", skills: ["Characters", "Tones", "Speaking", "Reading", "Writing"] },

  // Financial Investment
  { module_key: "financial-investment", module_label: "Financial Investment", course_slug: "stock-market-basics", course_title: "Stock Market Fundamentals", description: "Learn to invest in stocks with confidence and strategy", level: "Beginner", price: 219, duration: "10 weeks", purchase_type: "investment-education", skills: ["Stock analysis", "Portfolio building", "Risk management", "Technical analysis", "Market trends"] },
  { module_key: "financial-investment", module_label: "Financial Investment", course_slug: "cryptocurrency-investing", course_title: "Cryptocurrency Investment Mastery", description: "Navigate the crypto market and build a profitable portfolio", level: "Intermediate", price: 199, duration: "8 weeks", purchase_type: "investment-education", skills: ["Blockchain basics", "Crypto analysis", "DeFi", "NFTs", "Wallet security"] },
  { module_key: "financial-investment", module_label: "Financial Investment", course_slug: "real-estate-investing", course_title: "Real Estate Investment Strategy", description: "Build wealth through strategic real estate investments", level: "All Levels", price: 249, duration: "12 weeks", purchase_type: "investment-education", skills: ["Property analysis", "Financing", "REITs", "Rental income", "Market research"] },
  { module_key: "financial-investment", module_label: "Financial Investment", course_slug: "retirement-planning", course_title: "Retirement Planning & Wealth Building", description: "Secure your financial future with smart planning", level: "All Levels", price: 189, duration: "9 weeks", purchase_type: "investment-education", skills: ["Retirement accounts", "Passive income", "Tax optimization", "Estate planning", "Diversification"] },
];

export const getModuleCourse = (module_key: string, course_slug: string) =>
  MODULE_COURSES.find((c) => c.module_key === module_key && c.course_slug === course_slug);
