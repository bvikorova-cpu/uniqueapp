import { supabase } from "@/integrations/supabase/client";

const allCourses = [
  "Digital Marketing Mastery",
  "Financial Planning Essentials",
  "Entrepreneurship 101",
  "E-commerce Success",
  "Investment Strategies",
  "Web Development Fundamentals",
  "Python Programming",
  "Data Science Basics",
  "Mobile App Development",
  "Cybersecurity Essentials",
  "Nutrition and Diet Planning",
  "Fitness Training",
  "Mental Health Awareness",
  "Yoga and Mindfulness",
  "Stress Management",
  "Time Management Mastery",
  "Public Speaking",
  "Leadership Skills",
  "Emotional Intelligence",
  "Goal Setting and Achievement",
  "Photography Basics",
  "Graphic Design",
  "Creative Writing",
  "Music Production",
  "Digital Illustration",
  "SEO and Content Marketing",
  "Social Media Marketing",
  "Email Marketing Strategies",
  "Brand Building",
  "Sales Techniques",
  "Customer Service Excellence",
  "Project Management Professional",
  "Agile and Scrum Methodologies",
  "Business Analytics",
  "Corporate Strategy",
  "Human Resources Management",
  "Negotiation Skills",
  "Conflict Resolution",
  "Team Building",
  "Change Management",
  "Strategic Planning",
  "Risk Management",
  "Supply Chain Management",
  "Operations Management",
  "Quality Management",
  "Lean Six Sigma",
  "Business Intelligence",
  "Data Analytics with Excel",
  "SQL for Data Analysis",
  "R Programming",
  "Machine Learning Basics",
  "Artificial Intelligence Fundamentals",
  "Deep Learning",
  "Natural Language Processing",
  "Computer Vision",
  "Blockchain Technology",
  "Cryptocurrency Trading",
  "Cloud Computing AWS",
  "Cloud Computing Azure",
  "DevOps Engineering",
  "Docker and Kubernetes",
  "Linux Administration",
  "Network Security",
  "Ethical Hacking",
  "Penetration Testing",
  "Information Security Management",
  "GDPR Compliance",
  "JavaScript Advanced",
  "React Development",
  "Angular Framework",
  "Vue.js Development",
  "Node.js Backend",
  "PHP Programming",
  "Ruby on Rails",
  "Java Programming",
  "C++ Programming",
  "Swift iOS Development",
  "Android Development",
  "Flutter Development",
  "Game Development Unity",
  "Unreal Engine",
  "UI/UX Design",
  "Adobe Photoshop",
  "Adobe Illustrator",
  "Video Editing Premiere Pro",
  "After Effects Animation",
  "3D Modeling Blender",
  "AutoCAD Design",
  "Interior Design",
  "Fashion Design",
  "Jewelry Design",
  "Product Design",
  "Packaging Design",
  "Web Design",
  "Logo Design",
  "Typography",
  "Color Theory",
  "Drawing and Sketching",
  "Oil Painting",
  "Watercolor Techniques",
  "Digital Painting",
  "Portrait Photography",
  "Landscape Photography",
  "Wedding Photography",
  "Food Photography",
  "Product Photography",
  "Street Photography",
  "Lightroom Editing",
  "Photo Retouching",
  "Video Production",
  "Cinematography",
  "Screenwriting",
  "Storytelling",
  "Copywriting",
  "Technical Writing",
  "Content Writing",
  "Blog Writing",
  "Academic Writing",
  "Resume Writing",
  "Grant Writing",
  "Poetry Writing",
  "Fiction Writing",
  "Journalism",
  "Voice Acting",
  "Podcasting",
  "Audio Engineering",
  "Music Theory",
  "Guitar Mastery",
  "Piano Lessons",
  "Singing Techniques",
  "Drum Lessons",
  "Electronic Music Production",
  "DJ Techniques",
  "Songwriting",
  "Music Business",
  "Dance Choreography",
  "Ballet Training",
  "Hip Hop Dance",
  "Salsa Dancing",
  "Ballroom Dancing",
  "Yoga Teacher Training",
  "Pilates Instructor",
  "Personal Training Certification",
  "Nutrition Coaching",
  "Weight Loss Strategies",
  "Muscle Building",
  "Sports Nutrition",
  "Vegan Cooking",
  "Baking Masterclass",
  "Pastry Arts",
  "Wine Tasting",
  "Coffee Brewing",
  "Cocktail Mixing",
  "Gardening Basics",
  "Organic Farming",
  "Permaculture Design",
  "Beekeeping",
  "Sustainable Living",
  "Zero Waste Lifestyle",
  "Minimalism",
  "Home Organization",
  "Feng Shui",
  "Real Estate Investing",
  "Stock Market Trading",
  "Forex Trading",
  "Options Trading",
  "Retirement Planning",
  "Tax Planning",
  "Estate Planning",
  "Insurance Planning",
  "Debt Management",
  "Credit Score Improvement",
  "Budgeting Mastery",
  "Personal Finance",
  "Wedding Planning",
  "Event Planning",
  "Party Planning",
  "Travel Planning"
];

export async function generateAllCourseContent() {
  const results: Record<string, any> = {};
  
  console.log("Starting course generation for all courses...");
  
  for (const courseName of allCourses) {
    try {
      console.log(`Generating content for: ${courseName}`);
      
      const { data, error } = await supabase.functions.invoke('generate-course-content', {
        body: { courseName }
      });
      
      if (error) {
        console.error(`Error generating ${courseName}:`, error);
        results[courseName] = { error: error.message };
        continue;
      }
      
      if (data && data.topics) {
        results[courseName] = data.topics;
        console.log(`✓ Generated ${data.topics.length} topics for ${courseName}`);
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (err) {
      console.error(`Exception for ${courseName}:`, err);
      results[courseName] = { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }
  
  console.log("Course generation complete!");
  console.log("Results:", results);
  
  return results;
}

// Export course data as TypeScript content
export function generateCourseContentFile(coursesData: Record<string, any>): string {
  let fileContent = `export interface Topic {
  title: string;
  content: string;
}

export const courseContent: Record<string, Topic[]> = {
`;

  for (const [courseName, topics] of Object.entries(coursesData)) {
    if (Array.isArray(topics)) {
      fileContent += `  "${courseName}": [\n`;
      topics.forEach((topic: any) => {
        fileContent += `    {\n`;
        fileContent += `      title: ${JSON.stringify(topic.title)},\n`;
        fileContent += `      content: \`${topic.content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`\n`;
        fileContent += `    },\n`;
      });
      fileContent += `  ],\n\n`;
    }
  }

  fileContent += `  "default": [
    {
      title: "Introduction to the Course",
      content: "Welcome to this comprehensive course. This program will guide you through all essential aspects of this subject with detailed lessons and practical examples."
    },
    {
      title: "Fundamentals and Core Concepts",
      content: "In this topic, we'll explore the fundamental principles and core concepts that form the foundation of this field."
    },
    {
      title: "Practical Applications",
      content: "Learn how to apply theoretical knowledge in real-world scenarios and practical situations."
    },
    {
      title: "Advanced Techniques",
      content: "Dive deeper into advanced methods and techniques used by professionals in the field."
    },
    {
      title: "Tools and Resources",
      content: "Discover the essential tools, resources, and platforms that will enhance your learning and practice."
    },
    {
      title: "Best Practices",
      content: "Learn industry-standard best practices and methodologies to excel in this area."
    },
    {
      title: "Common Challenges and Solutions",
      content: "Understand common obstacles you might face and effective strategies to overcome them."
    },
    {
      title: "Case Studies",
      content: "Analyze real-world case studies and examples to better understand practical implementations."
    },
    {
      title: "Future Trends",
      content: "Explore emerging trends and future developments in this field."
    },
    {
      title: "Final Review and Assessment Preparation",
      content: "Review all key concepts and prepare for your final assessment. This topic consolidates everything you've learned."
    }
  ]
};

export const generateDefaultTopics = (courseName: string): Topic[] => {
  return [
    {
      title: \`Introduction to \${courseName}\`,
      content: \`Welcome to the \${courseName} course. This comprehensive program will guide you through all essential aspects of this subject with detailed lessons and practical examples.\`
    },
    {
      title: "Fundamentals and Core Concepts",
      content: \`In this topic, we'll explore the fundamental principles and core concepts that form the foundation of \${courseName}.\`
    },
    {
      title: "Practical Applications",
      content: "Learn how to apply theoretical knowledge in real-world scenarios and practical situations."
    },
    {
      title: "Advanced Techniques",
      content: "Dive deeper into advanced methods and techniques used by professionals in the field."
    },
    {
      title: "Tools and Resources",
      content: "Discover the essential tools, resources, and platforms that will enhance your learning and practice."
    },
    {
      title: "Best Practices",
      content: \`Learn industry-standard best practices and methodologies to excel in \${courseName}.\`
    },
    {
      title: "Common Challenges and Solutions",
      content: "Understand common obstacles you might face and effective strategies to overcome them."
    },
    {
      title: "Case Studies",
      content: "Analyze real-world case studies and examples to better understand practical implementations."
    },
    {
      title: "Future Trends",
      content: \`Explore emerging trends and future developments in the field of \${courseName}.\`
    },
    {
      title: "Final Review and Assessment Preparation",
      content: "Review all key concepts and prepare for your final assessment. This topic consolidates everything you've learned."
    }
  ];
};
`;

  return fileContent;
}
