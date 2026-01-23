import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (optional - be careful in production!)
  console.log("🗑️  Clearing existing data...");
  // Clear in correct order due to foreign key constraints
  await prisma.walletTransaction.deleteMany();
  await prisma.expertBankDetails.deleteMany();
  await prisma.expertWallet.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.questions.deleteMany();
  await prisma.knowledgeSeeker.deleteMany();
  await prisma.knowledgeProvider.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  // Seed Categories
  console.log("📁 Seeding categories...");
  const designCategory = await prisma.category.create({
    data: {
      name: "Design",
      description: "Creative and visual design services",
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
      slug: "design",
      parentCategoryId: null,
    },
  });

  const uiUxCategory = await prisma.category.create({
    data: {
      name: "UI / UX Design",
      description: "User interface and experience design",
      imageUrl: "https://images.unsplash.com/photo-1581276879432-15a67c6f4e0c",
      slug: "ui-ux-design",
      parentCategoryId: designCategory.id,
    },
  });

  await prisma.category.create({
    data: {
      name: "UI Audit",
      description: "Evaluate and improve existing UI",
      imageUrl: "",
      slug: "ui-audit",
      parentCategoryId: uiUxCategory.id,
    },
  });

  await prisma.category.create({
    data: {
      name: "UX Research",
      description: "User research & usability testing",
      imageUrl: "",
      slug: "ux-research",
      parentCategoryId: uiUxCategory.id,
    },
  });

  const graphicDesignCategory = await prisma.category.create({
    data: {
      name: "Graphic Design",
      description: "Branding and visual assets",
      imageUrl: "",
      slug: "graphic-design",
      parentCategoryId: designCategory.id,
    },
  });

  await prisma.category.create({
    data: {
      name: "Logo Design",
      description: "Custom logo & brand marks",
      imageUrl: "",
      slug: "logo-design",
      parentCategoryId: graphicDesignCategory.id,
    },
  });

  await prisma.category.create({
    data: {
      name: "Brand Identity",
      description: "Complete brand identity systems",
      imageUrl: "",
      slug: "brand-identity",
      parentCategoryId: graphicDesignCategory.id,
    },
  });

  const techCategory = await prisma.category.create({
    data: {
      name: "Technology",
      description: "Software & engineering expertise",
      imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475",
      slug: "technology",
      parentCategoryId: null,
    },
  });

  const webDevCategory = await prisma.category.create({
    data: {
      name: "Web Development",
      description: "Frontend, backend & full stack",
      imageUrl: "",
      slug: "web-development",
      parentCategoryId: techCategory.id,
    },
  });

  const frontendDevCategory = await prisma.category.create({
    data: {
      name: "Frontend Development",
      description: "React, Next.js, UI engineering",
      imageUrl: "",
      slug: "frontend-development",
      parentCategoryId: webDevCategory.id,
    },
  });

  const backendDevCategory = await prisma.category.create({
    data: {
      name: "Backend Development",
      description: "APIs, databases & scalability",
      imageUrl: "",
      slug: "backend-development",
      parentCategoryId: webDevCategory.id,
    },
  });

  await prisma.category.create({
    data: {
      name: "Full Stack Development",
      description: "End-to-end product development",
      imageUrl: "",
      slug: "fullstack-development",
      parentCategoryId: webDevCategory.id,
    },
  });

  const mobileDevCategory = await prisma.category.create({
    data: {
      name: "Mobile Development",
      description: "Android & iOS app development",
      imageUrl: "",
      slug: "mobile-development",
      parentCategoryId: techCategory.id,
    },
  });

  const reactNativeCategory = await prisma.category.create({
    data: {
      name: "React Native",
      description: "Cross-platform mobile apps",
      imageUrl: "",
      slug: "react-native",
      parentCategoryId: mobileDevCategory.id,
    },
  });

  const flutterCategory = await prisma.category.create({
    data: {
      name: "Flutter",
      description: "Dart-based mobile development",
      imageUrl: "",
      slug: "flutter",
      parentCategoryId: mobileDevCategory.id,
    },
  });

  const careerCategory = await prisma.category.create({
    data: {
      name: "Career & Growth",
      description: "Career guidance and mentoring",
      imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
      slug: "career",
      parentCategoryId: null,
    },
  });

  const interviewPrepCategory = await prisma.category.create({
    data: {
      name: "Interview Preparation",
      description: "Mock interviews & guidance",
      imageUrl: "",
      slug: "interview-prep",
      parentCategoryId: careerCategory.id,
    },
  });

  await prisma.category.create({
    data: {
      name: "FAANG Interviews",
      description: "Top tech company prep",
      imageUrl: "",
      slug: "faang-interviews",
      parentCategoryId: interviewPrepCategory.id,
    },
  });

  await prisma.category.create({
    data: {
      name: "Resume Review",
      description: "Resume & LinkedIn optimization",
      imageUrl: "",
      slug: "resume-review",
      parentCategoryId: careerCategory.id,
    },
  });

  console.log("✅ Categories seeded");

  // Hash password for users
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Seed Users and Knowledge Providers (Experts)
  console.log("👥 Seeding users and experts...");

  const expert1User = await prisma.user.create({
    data: {
      username: "sarahchen",
      email: "sarah.chen@example.com",
      password: hashedPassword,
      role: "KNOWLEDGE_PROVIDER",
    },
  });

  const expert1 = await prisma.knowledgeProvider.create({
    data: {
      userId: expert1User.id,
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
      categories: {
        connect: [
          { id: designCategory.id },
          { id: uiUxCategory.id },
        ],
      },
    },
  });

  const expert2User = await prisma.user.create({
    data: {
      username: "mrodriguez",
      email: "michael.rodriguez@example.com",
      password: hashedPassword,
      role: "KNOWLEDGE_PROVIDER",
    },
  });

  const expert2 = await prisma.knowledgeProvider.create({
    data: {
      userId: expert2User.id,
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
      categories: {
        connect: [
          { id: techCategory.id },
          { id: webDevCategory.id },
          { id: frontendDevCategory.id },
          { id: backendDevCategory.id },
        ],
      },
    },
  });

  const expert3User = await prisma.user.create({
    data: {
      username: "emilyjohnson",
      email: "emily.johnson@example.com",
      password: hashedPassword,
      role: "KNOWLEDGE_PROVIDER",
    },
  });

  const expert3 = await prisma.knowledgeProvider.create({
    data: {
      userId: expert3User.id,
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
      categories: {
        connect: [
          { id: careerCategory.id },
          { id: interviewPrepCategory.id },
        ],
      },
    },
  });

  const expert4User = await prisma.user.create({
    data: {
      username: "davidkim",
      email: "david.kim@example.com",
      password: hashedPassword,
      role: "KNOWLEDGE_PROVIDER",
    },
  });

  const expert4 = await prisma.knowledgeProvider.create({
    data: {
      userId: expert4User.id,
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
      categories: {
        connect: [
          { id: techCategory.id },
          { id: mobileDevCategory.id },
          { id: reactNativeCategory.id },
          { id: flutterCategory.id },
        ],
      },
    },
  });

  const expert5User = await prisma.user.create({
    data: {
      username: "lisawang",
      email: "lisa.wang@example.com",
      password: hashedPassword,
      role: "KNOWLEDGE_PROVIDER",
    },
  });

  const expert5 = await prisma.knowledgeProvider.create({
    data: {
      userId: expert5User.id,
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
      categories: {
        connect: [
          { id: designCategory.id },
          { id: graphicDesignCategory.id },
        ],
      },
    },
  });

  console.log("✅ Experts seeded");

  // Seed Users and Knowledge Seekers
  console.log("👤 Seeding seekers...");

  const seeker1User = await prisma.user.create({
    data: {
      username: "johndoe",
      email: "john.doe@example.com",
      password: hashedPassword,
      role: "KNOWLEDGE_SEEKER",
    },
  });

  const seeker1 = await prisma.knowledgeSeeker.create({
    data: {
      userId: seeker1User.id,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      profilePictureUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      isOnboarded: true,
      interestedCategories: {
        connect: [
          { id: techCategory.id },
          { id: webDevCategory.id },
          { id: frontendDevCategory.id },
        ],
      },
    },
  });

  const seeker2User = await prisma.user.create({
    data: {
      username: "janedoe",
      email: "jane.doe@example.com",
      password: hashedPassword,
      role: "KNOWLEDGE_SEEKER",
    },
  });

  const seeker2 = await prisma.knowledgeSeeker.create({
    data: {
      userId: seeker2User.id,
      name: "Jane Doe",
      email: "jane.doe@example.com",
      phone: "+1234567891",
      profilePictureUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      isOnboarded: true,
      interestedCategories: {
        connect: [
          { id: designCategory.id },
          { id: uiUxCategory.id },
          { id: graphicDesignCategory.id },
        ],
      },
    },
  });

  console.log("✅ Seekers seeded");

  // Seed Questions
  console.log("❓ Seeding questions...");

  const question1 = await prisma.questions.create({
    data: {
      knowledgeSeekerId: seeker1.id,
      questionTitle: "How to optimize React performance?",
      questionDescription: "I'm building a large React application and noticing performance issues. What are the best practices for optimizing React components?",
      questionCategory: "Frontend Development",
      questionTags: ["react", "performance", "optimization"],
      questionStatus: "PENDING",
    },
  });

  const question2 = await prisma.questions.create({
    data: {
      knowledgeSeekerId: seeker1.id,
      questionTitle: "Database design best practices",
      questionDescription: "I need help designing a database schema for an e-commerce platform. What are the key considerations?",
      questionCategory: "Backend Development",
      questionTags: ["database", "sql", "design"],
      questionStatus: "ANSWERED",
    },
  });

  const question3 = await prisma.questions.create({
    data: {
      knowledgeSeekerId: seeker2.id,
      questionTitle: "UI/UX design principles",
      questionDescription: "What are the fundamental principles I should follow when designing user interfaces?",
      questionCategory: "UI / UX Design",
      questionTags: ["design", "ui", "ux"],
      questionStatus: "CLOSED",
    },
  });

  console.log("✅ Questions seeded");

  // Seed Proposals
  console.log("📝 Seeding proposals...");

  const proposal1 = await prisma.proposal.create({
    data: {
      questionId: question1.id,
      expertId: expert2.id,
      message: "I'd be happy to help you optimize your React application! I have extensive experience with performance optimization including code splitting, memoization, and virtual list implementations.",
      price: 75,
      communicationMedium: "VIDEO_CALL",
      estimatedDuration: "45 minutes",
      status: "PENDING",
    },
  });

  const proposal2 = await prisma.proposal.create({
    data: {
      questionId: question1.id,
      expertId: expert4.id,
      message: "React performance is my specialty! Let's discuss lazy loading, React.memo, useMemo, useCallback, and profiling techniques to identify bottlenecks.",
      price: 60,
      communicationMedium: "VIDEO_CALL",
      estimatedDuration: "30 minutes",
      status: "PENDING",
    },
  });

  await prisma.proposal.create({
    data: {
      questionId: question2.id,
      expertId: expert2.id,
      message: "Database design is crucial for e-commerce platforms. I can help you with normalization, indexing strategies, and scaling considerations.",
      price: 100,
      communicationMedium: "VIDEO_CALL",
      estimatedDuration: "1 hour",
      status: "ACCEPTED",
    },
  });

  await prisma.proposal.create({
    data: {
      questionId: question3.id,
      expertId: expert1.id,
      message: "I'd love to share my 10+ years of UI/UX experience with you. We can cover principles like visual hierarchy, consistency, feedback, and accessibility.",
      price: 80,
      communicationMedium: "VIDEO_CALL",
      estimatedDuration: "45 minutes",
      status: "ACCEPTED",
    },
  });

  console.log("✅ Proposals seeded");

  // Seed Expert Wallets and Bank Details
  console.log("💰 Seeding wallets and bank details...");

  // Wallet for expert1 (Sarah Chen) with bank details
  const wallet1 = await prisma.expertWallet.create({
    data: {
      expertId: expert1.id,
      balance: 450.00,
      currency: "INR",
    },
  });

  await prisma.expertBankDetails.create({
    data: {
      walletId: wallet1.id,
      accountHolderName: "Sarah Chen",
      accountNumber: "1234567890123456",
      ifscCode: "HDFC0001234",
      bankName: "HDFC Bank",
    },
  });

  // Wallet for expert2 (Michael Rodriguez) with bank details
  const wallet2 = await prisma.expertWallet.create({
    data: {
      expertId: expert2.id,
      balance: 1250.00,
      currency: "INR",
    },
  });

  await prisma.expertBankDetails.create({
    data: {
      walletId: wallet2.id,
      accountHolderName: "Michael Rodriguez",
      accountNumber: "9876543210987654",
      ifscCode: "ICIC0005678",
      bankName: "ICICI Bank",
    },
  });

  // Wallet for expert3 (Emily Johnson) - no bank details yet
  const wallet3 = await prisma.expertWallet.create({
    data: {
      expertId: expert3.id,
      balance: 200.00,
      currency: "INR",
    },
  });

  // Wallet for expert4 (David Kim) with bank details
  const wallet4 = await prisma.expertWallet.create({
    data: {
      expertId: expert4.id,
      balance: 750.00,
      currency: "INR",
    },
  });

  await prisma.expertBankDetails.create({
    data: {
      walletId: wallet4.id,
      accountHolderName: "David Kim",
      accountNumber: "5555666677778888",
      ifscCode: "SBIN0009876",
      bankName: "State Bank of India",
    },
  });

  console.log("✅ Wallets and bank details seeded");

  // Seed Wallet Transactions
  console.log("💸 Seeding wallet transactions...");

  // Transactions for expert1
  await prisma.walletTransaction.create({
    data: {
      walletId: wallet1.id,
      type: "CREDIT",
      amount: 300.00,
      currency: "INR",
      status: "COMPLETED",
      razorpayPaymentId: "pay_sample_001",
      description: "Payment for UI/UX consultation",
    },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: wallet1.id,
      type: "CREDIT",
      amount: 200.00,
      currency: "INR",
      status: "COMPLETED",
      razorpayPaymentId: "pay_sample_002",
      description: "Payment for design review session",
    },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: wallet1.id,
      type: "PAYOUT",
      amount: 50.00,
      currency: "INR",
      status: "COMPLETED",
      razorpayPayoutId: "pout_sample_001",
      description: "Payout to bank account ending in 3456",
    },
  });

  // Transactions for expert2
  await prisma.walletTransaction.create({
    data: {
      walletId: wallet2.id,
      type: "CREDIT",
      amount: 500.00,
      currency: "INR",
      status: "COMPLETED",
      razorpayPaymentId: "pay_sample_003",
      description: "Payment for database design consultation",
    },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: wallet2.id,
      type: "CREDIT",
      amount: 750.00,
      currency: "INR",
      status: "COMPLETED",
      razorpayPaymentId: "pay_sample_004",
      description: "Payment for React optimization session",
    },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: wallet2.id,
      type: "CREDIT",
      amount: 400.00,
      currency: "INR",
      status: "COMPLETED",
      razorpayPaymentId: "pay_sample_005",
      description: "Payment for API design review",
    },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: wallet2.id,
      type: "PAYOUT",
      amount: 400.00,
      currency: "INR",
      status: "COMPLETED",
      razorpayPayoutId: "pout_sample_002",
      description: "Payout to bank account ending in 7654",
    },
  });

  // Transactions for expert3
  await prisma.walletTransaction.create({
    data: {
      walletId: wallet3.id,
      type: "CREDIT",
      amount: 200.00,
      currency: "INR",
      status: "COMPLETED",
      razorpayPaymentId: "pay_sample_006",
      description: "Payment for career coaching session",
    },
  });

  // Transactions for expert4
  await prisma.walletTransaction.create({
    data: {
      walletId: wallet4.id,
      type: "CREDIT",
      amount: 600.00,
      currency: "INR",
      status: "COMPLETED",
      razorpayPaymentId: "pay_sample_007",
      description: "Payment for React Native consultation",
    },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: wallet4.id,
      type: "CREDIT",
      amount: 350.00,
      currency: "INR",
      status: "COMPLETED",
      razorpayPaymentId: "pay_sample_008",
      description: "Payment for Flutter app review",
    },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: wallet4.id,
      type: "PAYOUT",
      amount: 200.00,
      currency: "INR",
      status: "PENDING",
      description: "Payout request to bank account ending in 8888",
    },
  });

  console.log("✅ Wallet transactions seeded");

  // Seed an Admin user
  console.log("👑 Seeding admin user...");
  await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user seeded");
  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
