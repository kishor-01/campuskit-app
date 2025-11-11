//src/data/mockResources.ts

// This defines the structure for a single resource. We can move this to a types file later.
export interface Resource {
  id: number;
  title: string;
  shortDescription: string;
  detailedDescription: string; 
  link: string;
  category: 'Career' | 'Programming' | 'Productivity' | 'Scholarships' | 'Financial' | 'Other';
  resourceType: 'Video' | 'Article' | 'Course' | 'Tool' | 'Website' | 'Book';
  tags: string[];
  source?: string;
}

// An array of mock resources to display on the page.
export const mockResources: Resource[] = [
  {
    id: 1,
    title: "freeCodeCamp",
    shortDescription: "Learn to code for free. Build projects. Earn certifications.",
    detailedDescription: "A comprehensive, project-based curriculum covering everything from HTML/CSS to machine learning.",
    link: "https://www.freecodecamp.org/",
    category: "Programming",
    resourceType: "Course",
    tags: ["coding", "free", "certification", "full-stack"]
  },
  {
    id: 2,
    title: "Notion",
    shortDescription: "The all-in-one workspace for your notes, tasks, wikis, and databases.",
    detailedDescription: "A powerful tool that allows you to organize your personal and professional life with customizable pages.",
    link: "https://www.notion.so/",
    category: "Productivity",
    resourceType: "Tool",
    tags: ["notes", "organization", "planning"]
  },
  {
    id: 3,
    title: "CrashCourse",
    shortDescription: "A YouTube channel with engaging, high-quality educational videos on a wide variety of subjects.",
    detailedDescription: "From computer science to world history, CrashCourse provides accessible and well-researched content.",
    link: "https://www.youtube.com/user/crashcourse",
    category: "Other",
    resourceType: "Video",
    tags: ["learning", "youtube", "education"]
  },
  {
    id: 4,
    title: "Google Career Certificates",
    shortDescription: "Flexible online training programs to get job-ready for in-demand fields.",
    detailedDescription: "Programs in IT Support, Data Analytics, UX Design, and more, designed by Google.",
    link: "https://grow.google/certificates/",
    category: "Career",
    resourceType: "Course",
    tags: ["certification", "job prep", "google"]
  }
];