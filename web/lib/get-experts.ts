import { KnowledgeProvider } from "@/types/expert.types";
import { providerApi } from "./api/provider";

// Mock data for fallback
  const now = new Date();

const mockExperts: KnowledgeProvider[] = [
    {
      id: "expert-1",
      userId: "user-1",
      name: "Sarah Chen",
      description: "Senior UI/UX Designer with 10+ years of experience in creating intuitive digital experiences",
      websiteUrl: "https://sarahchen.design",
      linkedinUrl: "https://linkedin.com/in/sarahchen",
      twitterUrl: "https://twitter.com/sarahchen",
      githubUrl: null,
      facebookUrl: null,
      instagramUrl: "https://instagram.com/sarahchen",
      youtubeUrl: null,
      tiktokUrl: null,
      profilePictureUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      bannerPictureUrl: "https://images.unsplash.com/photo-1558655146-364adaf1fcc9",
      location: "San Francisco, CA",
      industry: "Design",
      company: "Design Studio Inc.",
      jobTitle: "Senior UI/UX Designer",
      education: "BFA in Graphic Design, Stanford University",
      skills: ["UI Design", "UX Research", "Figma", "Prototyping", "User Testing"],
      interests: ["Design Systems", "Accessibility", "Design Thinking"],
      bio: "Passionate about creating user-centered designs that solve real problems. I've worked with startups and Fortune 500 companies to create products that users love.",
      isAvailable: true,
      availableDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      availableTimes: ["09:00-12:00", "14:00-17:00"],
      availableLanguages: ["English", "Mandarin"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "expert-2",
      userId: "user-2",
      name: "Michael Rodriguez",
      description: "Full Stack Developer specializing in React, Node.js, and cloud architecture",
      websiteUrl: "https://mrodriguez.dev",
      linkedinUrl: "https://linkedin.com/in/mrodriguez",
      twitterUrl: "https://twitter.com/mrodriguez",
      githubUrl: "https://github.com/mrodriguez",
      facebookUrl: null,
      instagramUrl: null,
      youtubeUrl: "https://youtube.com/@mrodriguez",
      tiktokUrl: null,
      profilePictureUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      bannerPictureUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      location: "New York, NY",
      industry: "Technology",
      company: "Tech Solutions LLC",
      jobTitle: "Lead Full Stack Engineer",
      education: "BS in Computer Science, MIT",
      skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL", "Docker"],
      interests: ["System Design", "Microservices", "Open Source"],
      bio: "Building scalable web applications for over 8 years. I help teams architect robust systems and mentor developers.",
      isAvailable: true,
      availableDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"],
      availableTimes: ["10:00-13:00", "15:00-18:00"],
      availableLanguages: ["English", "Spanish"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "expert-3",
      userId: "user-3",
      name: "Emily Johnson",
      description: "Career Coach and Interview Preparation Specialist",
      websiteUrl: "https://emilyjohnson.coach",
      linkedinUrl: "https://linkedin.com/in/emilyjohnson",
      twitterUrl: null,
      githubUrl: null,
      facebookUrl: null,
      instagramUrl: null,
      youtubeUrl: null,
      tiktokUrl: null,
      profilePictureUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
      bannerPictureUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
      location: "Austin, TX",
      industry: "Career & Growth",
      company: "Career Growth Academy",
      jobTitle: "Senior Career Coach",
      education: "MBA, Harvard Business School",
      skills: ["Interview Prep", "Resume Review", "Career Planning", "Negotiation"],
      interests: ["Tech Careers", "Leadership Development", "Personal Branding"],
      bio: "Helped 500+ professionals land their dream jobs at top tech companies. Specialized in FAANG interview preparation.",
      isAvailable: true,
      availableDays: ["MONDAY", "WEDNESDAY", "FRIDAY", "SATURDAY"],
      availableTimes: ["09:00-12:00", "14:00-17:00"],
      availableLanguages: ["English"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "expert-4",
      userId: "user-4",
      name: "David Kim",
      description: "Mobile App Developer expert in React Native and Flutter",
      websiteUrl: "https://davidkim.dev",
      linkedinUrl: "https://linkedin.com/in/davidkim",
      twitterUrl: "https://twitter.com/davidkim",
      githubUrl: "https://github.com/davidkim",
      facebookUrl: null,
      instagramUrl: null,
      youtubeUrl: null,
      tiktokUrl: null,
      profilePictureUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
      bannerPictureUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c",
      location: "Seattle, WA",
      industry: "Technology",
      company: "Mobile First Inc.",
      jobTitle: "Senior Mobile Developer",
      education: "BS in Software Engineering, University of Washington",
      skills: ["React Native", "Flutter", "iOS", "Android", "Firebase"],
      interests: ["Cross-platform Development", "App Performance", "UI/UX"],
      bio: "Creating beautiful and performant mobile applications. Published 20+ apps on App Store and Play Store.",
      isAvailable: true,
      availableDays: ["TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      availableTimes: ["11:00-14:00", "16:00-19:00"],
      availableLanguages: ["English", "Korean"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "expert-5",
      userId: "user-5",
      name: "Lisa Wang",
      description: "Graphic Designer and Brand Identity Specialist",
      websiteUrl: "https://lisawang.design",
      linkedinUrl: "https://linkedin.com/in/lisawang",
      twitterUrl: null,
      githubUrl: null,
      facebookUrl: null,
      instagramUrl: "https://instagram.com/lisawang",
      youtubeUrl: null,
      tiktokUrl: null,
      profilePictureUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
      bannerPictureUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5",
      location: "Los Angeles, CA",
      industry: "Design",
      company: "Creative Studio",
      jobTitle: "Creative Director",
      education: "BFA in Visual Arts, UCLA",
      skills: ["Brand Identity", "Logo Design", "Illustration", "Typography"],
      interests: ["Brand Strategy", "Visual Storytelling", "Minimalist Design"],
      bio: "Creating memorable brand identities for startups and established companies. Award-winning designer with 12+ years of experience.",
      isAvailable: true,
      availableDays: ["MONDAY", "TUESDAY", "THURSDAY", "FRIDAY"],
      availableTimes: ["10:00-13:00", "15:00-18:00"],
      availableLanguages: ["English", "Mandarin"],
      createdAt: now,
      updatedAt: now,
    },
  ];

export async function getExperts(filters?: GetExpertsParams): Promise<KnowledgeProvider[]> {
  // Try to fetch from API, fallback to mock data if API fails
  try {
    const experts = await providerApi.getAll(filters);
  return experts;
  } catch (error) {
    console.error("Error fetching experts from API, using mock data:", error);
    // Fallback: apply basic client-side filtering to mock data
    let filtered = [...mockExperts];
    
    if (filters?.q) {
      const searchTerm = filters.q.toLowerCase();
      filtered = filtered.filter(
        (expert) =>
          expert.name.toLowerCase().includes(searchTerm) ||
          expert.description?.toLowerCase().includes(searchTerm) ||
          expert.industry?.toLowerCase().includes(searchTerm) ||
          expert.skills.some((skill) => skill.toLowerCase().includes(searchTerm)) ||
          expert.interests.some((interest) => interest.toLowerCase().includes(searchTerm))
      );
    }

    if (filters?.categories) {
      const categoryList = filters.categories.split(",").filter(Boolean);
      if (categoryList.length > 0) {
        filtered = filtered.filter((expert) =>
          categoryList.some((cat) => expert.industry?.toLowerCase().includes(cat.toLowerCase()))
        );
      }
    }

    return filtered;
  }
}

export async function getExpertById(id: string): Promise<KnowledgeProvider | null> {
  // Try to fetch from API, fallback to mock data if API fails
  try {
    const expert = await providerApi.getById(id);
    return expert;
  } catch (error) {
    console.error("Error fetching expert from API, using mock data:", error);
    // Fallback to mock data
    const expert = mockExperts.find(expert => expert.id === id);
    return expert || null;
  }
}

