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
  "Digital Illustration"
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
